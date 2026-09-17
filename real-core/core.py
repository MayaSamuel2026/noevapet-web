from __future__ import annotations
import argparse, hashlib, json, re, sqlite3, ssl, time, urllib.error, urllib.request, urllib.robotparser
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.parse import urlparse

UA="NoevaPetBot/1.0 (+https://noevapet.de/; product-intelligence)"
ROOT=Path(__file__).resolve().parent
DB=ROOT/"noevapet.sqlite3"
SCHEMA=ROOT/"schema.sql"
REGISTRY=ROOT/"sources.de.json"
SEED=ROOT/"seed_catalog.json"

def now():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00","Z")

def sha(v):
    if isinstance(v,str): v=v.encode("utf-8")
    return hashlib.sha256(v).hexdigest()

def norm_text(v):
    return re.sub(r"\s+"," ",unescape(re.sub(r"<[^>]+>"," ",v or ""))).strip()

def slug(v):
    v=norm_text(v).lower().replace("ä","ae").replace("ö","oe").replace("ü","ue").replace("ß","ss")
    return re.sub(r"[^a-z0-9]+","-",v).strip("-")[:96] or "unknown"

def parse_weight(name):
    x=name.lower().replace(",",".")
    m=re.search(r"(?:(\d+(?:\.\d+)?)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*(kg|g)\b",x)
    if not m: return None,None
    count=float(m.group(1)) if m.group(1) else 1.0
    val=float(m.group(2))*(1000 if m.group(3)=="kg" else 1)
    return count,count*val

def species_from(source_id,name):
    t=(source_id+" "+name).lower()
    if "katze" in t: return "cat"
    if "hund" in t: return "dog"
    return None

def classify_food(name):
    t=name.lower()
    if "trocken" in t: return "dry"
    if "nass" in t: return "wet"
    if "snack" in t or "kau" in t: return "treat"
    return None

def classify_life(name):
    t=name.lower()
    if "junior" in t or "puppy" in t or "kitten" in t: return "junior"
    if "senior" in t: return "senior"
    if "adult" in t: return "adult"
    return None

def connect():
    c=sqlite3.connect(DB)
    c.row_factory=sqlite3.Row
    c.executescript(SCHEMA.read_text(encoding="utf-8"))
    return c

def bootstrap(c):
    reg=json.loads(REGISTRY.read_text(encoding="utf-8"))
    for s in reg["sources"]:
        c.execute("""INSERT INTO sources(id,name,canonical_url,source_type,adapter_key,watch_enabled,live_enabled,
        terms_review_status,robots_policy,max_bytes) VALUES(?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name,canonical_url=excluded.canonical_url,
        watch_enabled=excluded.watch_enabled,live_enabled=excluded.live_enabled,max_bytes=excluded.max_bytes""",
        (s["id"],s["name"],s["canonical_url"],s["source_type"],s["adapter_key"],int(s["watch_enabled"]),
         int(s["live_enabled"]),s["terms_review_status"],s["robots_policy"],s["max_bytes"]))
    seed=json.loads(SEED.read_text(encoding="utf-8"))
    fields=["canonical_product_id","brand","manufacturer","product_family","product_name","gtin","manufacturer_sku","species",
            "breed_relevance","life_stage","category","subcategory","product_function","food_type","completeness","variant","flavour",
            "size_label","pack_count","weight_g","volume_ml","dietary_claims","health_need_tags","veterinary_diet","image_url","manufacturer_url"]
    for p in seed["products"]:
        vals=[]
        for k in fields:
            v=p.get(k)
            if isinstance(v,(list,dict)): v=json.dumps(v,ensure_ascii=False)
            vals.append(v)
        vals += [seed["observed_at"],seed["observed_at"],p.get("confidence",.7),json.dumps(p.get("provenance",[]),ensure_ascii=False)]
        c.execute(f"""INSERT OR IGNORE INTO products({','.join(fields)},first_seen,last_verified,confidence,provenance)
        VALUES({','.join('?' for _ in vals)})""",vals)
    for o in seed["offers"]:
        h=sha(json.dumps(o,sort_keys=True,ensure_ascii=False))
        ts=seed["observed_at"]
        c.execute("""INSERT OR IGNORE INTO offers(offer_id,canonical_product_id,source_id,retailer_id,product_url,price_eur,
        unit_price_eur,availability,promotion,observed_at,last_changed_at,content_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)""",
        (o["offer_id"],o["canonical_product_id"],o["source_id"],o["retailer_id"],o["product_url"],o.get("price_eur"),
         o.get("unit_price_eur"),o.get("availability"),o.get("promotion"),ts,ts,h))
        c.execute("""INSERT OR IGNORE INTO offer_observations(offer_id,observed_at,price_eur,unit_price_eur,availability,promotion,content_hash)
        VALUES(?,?,?,?,?,?,?)""",(o["offer_id"],ts,o.get("price_eur"),o.get("unit_price_eur"),o.get("availability"),o.get("promotion"),h))
    c.commit()

def robots_allowed(url):
    u=urlparse(url)
    rp=urllib.robotparser.RobotFileParser(f"{u.scheme}://{u.netloc}/robots.txt")
    try:
        rp.read()
        return rp.can_fetch(UA,url)
    except Exception:
        return False

def fetch(source,row):
    url=source["canonical_url"]
    if source.get("robots_policy")=="obey" and not robots_allowed(url):
        raise RuntimeError("robots.txt disallows or could not be verified")
    headers={"User-Agent":UA,"Accept":"text/html,application/xhtml+xml"}
    if row and row["etag"]: headers["If-None-Match"]=row["etag"]
    if row and row["last_modified"]: headers["If-Modified-Since"]=row["last_modified"]
    req=urllib.request.Request(url,headers=headers)
    with urllib.request.urlopen(req,timeout=30,context=ssl.create_default_context()) as r:
        limit=int(source.get("max_bytes",3000000))
        body=r.read(limit+1)
        if len(body)>limit: raise RuntimeError("source exceeds max_bytes")
        return r.status,body,dict(r.headers)

def jsonld_products(html):
    out=[]
    for m in re.finditer(r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',html,re.I|re.S):
        try: data=json.loads(unescape(m.group(1)))
        except Exception: continue
        stack=data if isinstance(data,list) else [data]
        i=0
        while i < len(stack):
            x=stack[i]; i+=1
            if not isinstance(x,dict): continue
            if isinstance(x.get("@graph"),list): stack.extend(x["@graph"])
            typ=x.get("@type")
            if typ=="Product" or (isinstance(typ,list) and "Product" in typ): out.append(x)
            if typ=="ItemList":
                for y in x.get("itemListElement",[]):
                    item=y.get("item",y) if isinstance(y,dict) else {}
                    if isinstance(item,dict): stack.append(item)
    return out

def listing_fallback(html):
    text=re.sub(r"\s+"," ",html)
    seen=set(); out=[]
    for pat in [r'>([^<>]{8,180})<[^>]{0,1000}?(\d{1,4}[,.]\d{2})\s*€',
                r'(?:aria-label|title)=["\']([^"\']{8,180})["\'][^>]{0,1000}?(\d{1,4}[,.]\d{2})\s*€']:
        for m in re.finditer(pat,text,re.I|re.S):
            name=norm_text(m.group(1)); price=float(m.group(2).replace(",","."))
            if len(name)<8 or (name.lower(),price) in seen: continue
            seen.add((name.lower(),price)); out.append({"name":name,"price":price})
            if len(out)>=150: return out
        if out: return out
    return out

def extract(source,body):
    html=body.decode("utf-8","ignore"); out=[]
    for x in jsonld_products(html):
        name=norm_text(x.get("name"))
        if not name: continue
        brand=x.get("brand")
        if isinstance(brand,dict): brand=brand.get("name")
        offers=x.get("offers") or {}
        if isinstance(offers,list): offers=offers[0] if offers else {}
        price=offers.get("price") if isinstance(offers,dict) else None
        try: price=float(str(price).replace(",",".")) if price is not None else None
        except Exception: price=None
        count,weight=parse_weight(name)
        out.append({"name":name,"brand":brand,"price":price,"url":x.get("url") or source["canonical_url"],
                    "sku":x.get("sku"),"gtin":x.get("gtin13") or x.get("gtin12") or x.get("gtin"),
                    "pack_count":count,"weight_g":weight})
    if not out:
        for x in listing_fallback(html):
            count,weight=parse_weight(x["name"])
            out.append({"name":x["name"],"brand":None,"price":x["price"],"url":source["canonical_url"],
                        "sku":None,"gtin":None,"pack_count":count,"weight_g":weight})
    return out

def canonical_id(r):
    if r.get("gtin"): return "np:gtin:"+str(r["gtin"])
    return "np:auto:"+slug(r["name"])+":"+sha((r.get("brand") or "")+"|"+r["name"]+"|"+str(r.get("weight_g")))[:10]

def upsert_records(c,source,records,ts):
    np=no=0
    for r in records:
        cid=canonical_id(r); ftype=classify_food(r["name"])
        c.execute("""INSERT INTO products(canonical_product_id,brand,product_name,gtin,manufacturer_sku,species,life_stage,category,subcategory,
        food_type,pack_count,weight_g,first_seen,last_verified,confidence,provenance) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(canonical_product_id) DO UPDATE SET last_verified=excluded.last_verified,
        brand=COALESCE(excluded.brand,products.brand),gtin=COALESCE(excluded.gtin,products.gtin),
        manufacturer_sku=COALESCE(excluded.manufacturer_sku,products.manufacturer_sku)""",
        (cid,r.get("brand"),r["name"],r.get("gtin"),r.get("sku"),species_from(source["id"],r["name"]),classify_life(r["name"]),
         "food",ftype,ftype,r.get("pack_count"),r.get("weight_g"),ts,ts,.72 if r.get("gtin") else .58,json.dumps([source["id"]])))
        np+=1
        oid=f"off:{source['retailer_id']}:{sha((r.get('url') or '')+'|'+r['name'])[:16]}"
        h=sha(json.dumps({"price":r.get("price"),"url":r.get("url"),"name":r["name"]},sort_keys=True,ensure_ascii=False))
        prev=c.execute("SELECT last_changed_at,content_hash FROM offers WHERE offer_id=?",(oid,)).fetchone()
        changed_at=ts if not prev or prev["content_hash"]!=h else prev["last_changed_at"]
        c.execute("""INSERT INTO offers(offer_id,canonical_product_id,source_id,retailer_id,retailer_sku,product_url,price_eur,
        availability,observed_at,last_changed_at,content_hash) VALUES(?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(offer_id) DO UPDATE SET canonical_product_id=excluded.canonical_product_id,price_eur=excluded.price_eur,
        availability=excluded.availability,observed_at=excluded.observed_at,last_changed_at=excluded.last_changed_at,content_hash=excluded.content_hash""",
        (oid,cid,source["id"],source["retailer_id"],r.get("sku"),r.get("url") or source["canonical_url"],r.get("price"),
         "listed",ts,changed_at,h))
        c.execute("INSERT INTO offer_observations(offer_id,observed_at,price_eur,availability,content_hash) VALUES(?,?,?,?,?)",
                  (oid,ts,r.get("price"),"listed",h))
        no+=1
    return np,no

def export(c,outdir):
    out=Path(outdir); out.mkdir(parents=True,exist_ok=True)
    products=[dict(r) for r in c.execute("SELECT * FROM products ORDER BY COALESCE(brand,''),product_name")]
    offers=[dict(r) for r in c.execute("SELECT * FROM offers ORDER BY retailer_id,COALESCE(price_eur,999999)")]
    for p in products:
        for k in ("dietary_claims","health_need_tags","provenance"):
            if p.get(k):
                try: p[k]=json.loads(p[k])
                except Exception: pass
    payload={"schema":"noevapet-real-core/1.0","market":"DE","generated_at":now(),
             "counts":{"products":len(products),"offers":len(offers)},"products":products,"offers":offers}
    (out/"catalog.json").write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding="utf-8")
    status={"schema":"noevapet-watch-status/1.0","generated_at":now(),"counts":payload["counts"],
            "sources":[dict(r) for r in c.execute("""SELECT id,name,canonical_url,last_checked_at,last_changed_at,last_success_at,
            last_failure_at,failure_count,content_hash FROM sources ORDER BY id""")]}
    (out/"status.json").write_text(json.dumps(status,ensure_ascii=False,indent=2),encoding="utf-8")

def run_cycle(outdir,only=None):
    c=connect(); bootstrap(c)
    reg=json.loads(REGISTRY.read_text(encoding="utf-8"))["sources"]
    if only: reg=[s for s in reg if s["id"] in only]
    for s in reg:
        if not s.get("watch_enabled") or not s.get("live_enabled"): continue
        ts=now(); row=c.execute("SELECT * FROM sources WHERE id=?",(s["id"],)).fetchone()
        try:
            status,body,headers=fetch(s,row)
            h=sha(body); changed=(not row["content_hash"] or row["content_hash"]!=h)
            nprod=noff=0
            if changed:
                nprod,noff=upsert_records(c,s,extract(s,body),ts)
            c.execute("""UPDATE sources SET etag=?,last_modified=?,content_hash=?,last_checked_at=?,last_success_at=?,
            last_changed_at=CASE WHEN ? THEN ? ELSE last_changed_at END,failure_count=0 WHERE id=?""",
            (headers.get("ETag"),headers.get("Last-Modified"),h,ts,ts,int(changed),ts,s["id"]))
            c.execute("""INSERT INTO crawl_audits(source_id,checked_at,status,changed,extracted,products_seen,offers_seen,detail)
            VALUES(?,?,?,?,?,?,?,?)""",(s["id"],ts,"PASS",int(changed),int(changed),nprod,noff,f"HTTP {status}"))
            c.commit(); time.sleep(1.2)
        except urllib.error.HTTPError as e:
            if e.code==304:
                c.execute("UPDATE sources SET last_checked_at=?,last_success_at=?,failure_count=0 WHERE id=?",(ts,ts,s["id"]))
                c.execute("INSERT INTO crawl_audits(source_id,checked_at,status,changed,detail) VALUES(?,?,?,?,?)",
                          (s["id"],ts,"NOT_MODIFIED",0,"HTTP 304")); c.commit()
            else:
                raise
        except Exception as e:
            c.execute("UPDATE sources SET last_checked_at=?,last_failure_at=?,failure_count=failure_count+1 WHERE id=?",(ts,ts,s["id"]))
            c.execute("INSERT INTO crawl_audits(source_id,checked_at,status,changed,detail) VALUES(?,?,?,?,?)",
                      (s["id"],ts,"FAIL",0,str(e)[:500])); c.commit()
    export(c,outdir)

def qualify():
    c=connect(); bootstrap(c)
    checks=[
      ("sources>=4",c.execute("SELECT COUNT(*) FROM sources").fetchone()[0]>=4),
      ("seed products>=8",c.execute("SELECT COUNT(*) FROM products").fetchone()[0]>=8),
      ("seed offers>=8",c.execute("SELECT COUNT(*) FROM offers").fetchone()[0]>=8),
      ("append-only observations",c.execute("SELECT COUNT(*) FROM offer_observations").fetchone()[0]>=8),
      ("offer->product integrity",c.execute("""SELECT COUNT(*) FROM offers o LEFT JOIN products p
       ON p.canonical_product_id=o.canonical_product_id WHERE p.canonical_product_id IS NULL""").fetchone()[0]==0)
    ]
    for n,ok in checks: print(("PASS" if ok else "FAIL"),n)
    if not all(ok for _,ok in checks): raise SystemExit(1)

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("command",choices=["bootstrap","cycle","export","qualify"])
    p.add_argument("--out",default=str(ROOT/"data"))
    p.add_argument("--source",action="append")
    a=p.parse_args()
    c=connect(); bootstrap(c)
    if a.command=="bootstrap": export(c,a.out)
    elif a.command=="cycle": run_cycle(a.out,a.source)
    elif a.command=="export": export(c,a.out)
    else: qualify()
