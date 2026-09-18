// NOEVA CORE OS v1.3 public binding — no automatic tracking.
(function(){
  const CORE='https://core.noevasystems.com';
  const VERTICAL='noevapet';
  async function request(path,opts={}){
    const r=await fetch(CORE+path,{credentials:'omit',headers:{Accept:'application/json',...(opts.body?{'Content-Type':'application/json'}:{}),...(opts.headers||{})},...opts});
    let body=null; try{body=await r.json()}catch(e){}
    if(!r.ok) throw new Error((body&&body.detail)||('CORE HTTP '+r.status));
    return body;
  }
  window.NOEVA_CORE={
    version:'1.3.0',verticalId:VERTICAL,origin:CORE,
    health:()=>request('/api/public/v1/binding/health?vertical_id='+VERTICAL),
    projection:(type,key,params={})=>request('/api/public/v1/'+VERTICAL+'/projections/'+encodeURIComponent(type)+'/'+encodeURIComponent(key)+'?'+new URLSearchParams(params)),
    recommend:(requirement,candidate_ids=null)=>request('/api/public/v1/'+VERTICAL+'/recommend',{method:'POST',body:JSON.stringify({requirement,candidate_ids})}),
    route:(requirement,market,candidate_ids=null)=>request('/api/public/v1/'+VERTICAL+'/route',{method:'POST',body:JSON.stringify({requirement,market,candidate_ids})}),
    referral:(payload)=>request('/api/public/v1/'+VERTICAL+'/referrals',{method:'POST',body:JSON.stringify(payload)}),
    event:(event_type,payload={})=>request('/api/public/v1/'+VERTICAL+'/events',{method:'POST',body:JSON.stringify({event_type,payload})})
  };
})();
