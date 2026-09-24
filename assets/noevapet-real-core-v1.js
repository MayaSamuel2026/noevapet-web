// NoevaPet REAL CORE v1.0 bridge.
// Loaded after the V26 application bundle. It preserves the frozen UX while
// replacing prototype price/recommendation/contact/consent handoffs with CORE.
(function(){
  'use strict';
  const RC=()=>window.NOEVA_CORE&&window.NOEVA_CORE.noevapet;
  const needMap={
    dry:{category:'DRY_FOOD',label:'Trockenfutter'},
    wet:{category:'WET_FOOD',label:'Nassfutter'},
    treats:{category:'TREATS',label:'Snacks'},
    dental:{category:'DENTAL',label:'Zahnpflege'},
    coat:{category:'CARE',label:'Fellpflege'},
    walk:{category:'WALK',label:'Leine Geschirr'},
    play:{category:'TOY',label:'Spielzeug'},
    training:{category:'TREATS',label:'Training'},
    vet:{category:'CARE',label:'Pflege'}
  };

  function activePet(){
    try{return typeof npV6ActivePet==='function'?npV6ActivePet():null}catch(e){return null}
  }
  function speciesFor(pet){
    const raw=String((pet&&(pet.typeDe||pet.type))||'').toLowerCase();
    if(raw.includes('hund')||raw.includes('dog'))return'DOG';
    if(raw.includes('kat')||raw.includes('cat'))return'CAT';
    if(raw.includes('vogel')||raw.includes('bird'))return'BIRD';
    if(raw.includes('fisch')||raw.includes('fish'))return'FISH';
    if(raw.includes('kanin')||raw.includes('nager')||raw.includes('rabbit')||raw.includes('rodent'))return'SMALL_PET';
    return'';
  }
  function availableOffer(row){
    const offers=Array.isArray(row&&row.offers)?row.offers:[];
    return offers.find(o=>String(o.availability||'').toUpperCase()!=='OUT_OF_STOCK'&&o.offer_url)||
           offers.find(o=>o.offer_url)||null;
  }
  function renderAll(){
    for(const fn of ['renderMatchCurrentV6','renderMatchSelectedV9','renderMatchOrbitV6','refreshNavCartCountV6','renderHeroBasketV8','renderCartV6']){
      try{if(typeof window[fn]==='function')window[fn]()}catch(e){}
    }
  }

  function analyticsAllowed(){
    try{return localStorage.getItem('npCookieChoice')==='all'}catch(e){return false}
  }
  function sessionId(){
    try{
      let id=sessionStorage.getItem('npRevenueSession');
      if(!id){
        id='np-s-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
        sessionStorage.setItem('npRevenueSession',id);
      }
      return id;
    }catch(e){return 'np-s-'+Date.now().toString(36)}
  }
  let revenueSeq=0;
  function revenueEvent(type,{subjectKey=null,metadata={}}={}){
    if(!analyticsAllowed()||!RC()||typeof RC().revenueEvent!=='function')return Promise.resolve(null);
    revenueSeq+=1;
    const sid=sessionId();
    const eventId=(sid+':'+String(type||'event').toLowerCase()+':'+revenueSeq).replace(/[^A-Za-z0-9:_./-]/g,'-').slice(0,160);
    const payload={
      event_id:eventId,
      event_type:type,
      vertical:'noevapet',
      site_id:'noevapet.de',
      page_url:location.href,
      referrer:document.referrer||null,
      occurred_at:new Date().toISOString(),
      metadata:{session_id:sid,...metadata}
    };
    if(subjectKey&&/^[A-Za-z0-9:_./-]{1,160}$/.test(String(subjectKey)))payload.subject_key=String(subjectKey);
    return RC().revenueEvent(payload).catch(()=>null);
  }
  function recordLandingMeasurement(){
    if(!analyticsAllowed())return;
    try{
      if(sessionStorage.getItem('npRevenueLandingRecorded')==='1')return;
      sessionStorage.setItem('npRevenueLandingRecorded','1');
    }catch(e){}
    revenueEvent('SITE_SESSION',{metadata:{market:'DE',language:document.documentElement.lang||'de'}});
    const ref=String(document.referrer||'').toLowerCase();
    const organic=/google\.|bing\.|duckduckgo\.|ecosia\.|yahoo\.|yandex\./.test(ref);
    if(organic)revenueEvent('ORGANIC_LANDING',{metadata:{market:'DE'}});
  }

  async function hydrateExactProducts(){
    if(!RC()||typeof getRoutineV6!=='function'||typeof saveRoutineV6!=='function')return;
    const current=getRoutineV6();
    let changed=false;
    const next=[];
    for(const item of current){
      if(!item||!item.exactProduct||item.buyNow===false||!item.offerSearch){
        next.push(item);continue;
      }
      try{
        const result=await RC().exactProduct({name:item.name||'',pack_size:item.packSize||'',limit:25});
        const rows=Array.isArray(result&&result.results)?result.results:[];
        const row=rows.find(x=>x.offer_url&&String(x.availability||'').toUpperCase()!=='OUT_OF_STOCK')||
                  rows.find(x=>x.offer_url)||rows[0];
        if(row){
          const live={...item,
            price:row.price_eur!=null?Number(row.price_eur):item.price,
            realCore:true,
            realCoreProductId:row.canonical_product_id||null,
            realCoreOfferId:row.offer_id||null,
            realCoreRetailer:row.retailer||null,
            realCoreRetailerUrl:row.offer_url||null,
            realCoreAvailability:row.availability||null,
            realCoreObservedAt:row.observed_at||null
          };
          next.push(live);changed=true;continue;
        }
      }catch(e){}
      next.push(item);
    }
    if(changed){saveRoutineV6(next);renderAll();}
  }

  // Replace only the recommendation record generated by the frozen V26 action.
  if(typeof addSuggestedNeedV6==='function'){
    const originalAdd=addSuggestedNeedV6;
    addSuggestedNeedV6=function(){
      const needKey=typeof npV6CurrentNeed!=='undefined'?npV6CurrentNeed:null;
      originalAdd.apply(this,arguments);
      const rule=needMap[needKey];
      if(!rule||!RC())return;
      const pet=activePet();
      RC().recommend({
        species:speciesFor(pet),
        category:rule.category,
        need:rule.label,
        limit:12
      }).then(result=>{
        const rows=Array.isArray(result&&result.recommendations)?result.recommendations:[];
        const row=rows[0];if(!row||typeof getPlanV6!=='function'||typeof savePlanV6!=='function')return;
        const offer=availableOffer(row);
        const sourceNeed='n-'+needKey;
        const plan=getPlanV6().filter(x=>x.sourceNeed!==sourceNeed);
        plan.push({
          id:'core-'+String(row.canonical_product_id||Date.now()).replace(/[^a-zA-Z0-9_-]/g,'-'),
          sourceNeed,
          source:'plan',
          type:(npV6NeedMap&&npV6NeedMap[needKey]&&npV6NeedMap[needKey].type)||'other',
          name:row.name,
          nameDe:row.name,
          subtitle:[row.brand,row.pack_size_text].filter(Boolean).join(' · ')||rule.label,
          subtitleDe:[row.brand,row.pack_size_text].filter(Boolean).join(' · ')||rule.label,
          img:row.image_url||((npV6NeedMap&&npV6NeedMap[needKey]&&npV6NeedMap[needKey].img)||''),
          price:offer&&offer.price_eur!=null?Number(offer.price_eur):(row.min_price_eur!=null?Number(row.min_price_eur):undefined),
          realCore:true,
          realCoreProductId:row.canonical_product_id||null,
          realCoreOfferId:offer&&offer.offer_id||null,
          realCoreRetailer:offer&&offer.retailer||null,
          realCoreRetailerUrl:offer&&offer.offer_url||null,
          realCoreAvailability:offer&&offer.availability||null,
          realCoreObservedAt:offer&&offer.observed_at||row.offers_observed_at||null
        });
        savePlanV6(plan);renderAll();
        revenueEvent('RECOMMENDATION_SHOWN',{
          subjectKey:row.canonical_product_id||null,
          metadata:{market:'DE',category:rule.category,need:rule.label,offer_available:!!offer}
        });
      }).catch(()=>{});
    };
  }

  // Never manufacture a discount in the live DE build. The total is the sum of
  // observed prices; measured savings can be introduced later from price history.
  if(typeof purchaseValuesV19==='function'){
    purchaseValuesV19=function(items,mode){
      const total=(items||[]).reduce((s,x)=>s+Number(x.price||0),0);
      const retailerNames=[...new Set((items||[]).map(x=>x.realCoreRetailer).filter(Boolean))];
      const retailers=retailerNames.length||((items||[]).length?1:0);
      return {total,saving:0,price:total,retailers,deliveries:retailers};
    };
  }

  if(typeof purchaseRouteGroupsV19==='function'){
    const fallbackGroups=purchaseRouteGroupsV19;
    purchaseRouteGroupsV19=function(items,mode){
      items=items||((typeof getCartItemsV6==='function')?getCartItemsV6():[]);
      mode=mode||(typeof __npV6PurchaseMode!=='undefined'?__npV6PurchaseMode:'balance');
      const live=items.filter(x=>x.realCoreRetailer&&x.realCoreRetailerUrl);
      if(!items.length||live.length!==items.length)return fallbackGroups(items,mode);
      const groups=new Map();
      for(const item of items){
        const key=item.realCoreRetailer;
        if(!groups.has(key))groups.set(key,{retailerName:key,retailerUrl:item.realCoreRetailerUrl,items:[]});
        groups.get(key).items.push({...item,optimizedPrice:Number(item.price||0)});
      }
      return [...groups.values()].map((g,i)=>({
        id:String.fromCharCode(65+i),
        retailerName:g.retailerName,
        retailerUrl:g.retailerUrl,
        items:g.items,
        subtotal:g.items.reduce((s,x)=>s+Number(x.price||0),0)
      }));
    };
    retailerTargetsV6=function(){return purchaseRouteGroupsV19().map(g=>g.id)};
    retailerUrlV6=function(id){
      const g=purchaseRouteGroupsV19().find(x=>x.id===id);
      if(g&&g.retailerUrl)return g.retailerUrl;
      const cfg=window.NOEVA_RUNTIME||{};
      return cfg&&cfg.retailers&&cfg.retailers[id]&&cfg.retailers[id].url||null;
    };
  }

  // Record retailer handoff before opening the real retailer page.
  if(typeof openRetailerV8==='function'){
    const originalOpen=openRetailerV8;
    openRetailerV8=function(id){
      try{
        const group=typeof purchaseRouteGroupsV19==='function'?purchaseRouteGroupsV19().find(x=>x.id===id):null;
        if(group&&RC()){
          const attributionId=('np-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)).replace(/[^A-Za-z0-9:_./-]/g,'-');
          RC().retailerHandoff({
            market:'DE',
            retailer_id:id,
            retailer:group.retailerName||null,
            url:group.retailerUrl||null,
            pet_id:(activePet()||{}).id||null,
            page_url:location.href,
            referrer:document.referrer||null,
            attribution_id:attributionId,
            products:(group.items||[]).map(x=>({product_id:x.realCoreProductId||null,offer_id:x.realCoreOfferId||null,name:x.name||'',price_eur:x.price||null}))
          }).catch(()=>{});
        }
      }catch(e){}
      return originalOpen.apply(this,arguments);
    };
  }

  // Existing cookie UI remains the source of user choice. Passive first-party
  // revenue measurement is sent only after the user selects the optional tier.
  document.addEventListener('DOMContentLoaded',()=>{
    document.querySelectorAll('[data-cookie]').forEach(btn=>btn.addEventListener('click',()=>{
      const choice=btn.dataset.cookie||'essential';
      try{if(RC())RC().consentEvent({market:'DE',choice,analytics_enabled:choice==='all',recorded_client_at:new Date().toISOString()}).catch(()=>{})}catch(e){}
      if(choice==='all')recordLandingMeasurement();
    }));
    recordLandingMeasurement();
    hydrateExactProducts();
  });

  // Replace the prototype-only contact handler with a real CORE handoff.
  initContact=function(){
    const form=document.getElementById('contactForm'),success=document.getElementById('contactSuccess');
    if(!form)return;
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const fields=form.querySelectorAll('input,select,textarea');
      const payload={
        market:'DE',
        name:(fields[0]&&fields[0].value||'').trim(),
        email:(fields[1]&&fields[1].value||'').trim(),
        topic:(fields[2]&&fields[2].value||'').trim(),
        message:(fields[3]&&fields[3].value||'').trim(),
        page:location.pathname,
        page_url:location.href,
        referrer:document.referrer||null
      };
      try{
        if(!RC())throw new Error('core_unavailable');
        await RC().contact(payload);
        if(success){
          success.hidden=false;
          success.textContent='Danke. Deine Nachricht wurde an NoevaPet übermittelt.';
          success.scrollIntoView({behavior:'smooth',block:'center'});
        }
        form.reset();
      }catch(err){
        if(success){
          success.hidden=false;
          success.textContent='Die Nachricht konnte gerade nicht übermittelt werden. Bitte versuche es noch einmal.';
          success.scrollIntoView({behavior:'smooth',block:'center'});
        }
      }
    });
  };

  // Decorate retailer cards with the actual live retailer names after V26 renders.
  const decorateRetailers=()=>{
    try{
      const groups=typeof purchaseRouteGroupsV19==='function'?purchaseRouteGroupsV19():[];
      document.querySelectorAll('.checkout8-retailer').forEach((card,i)=>{
        const g=groups[i],strong=card.querySelector('strong');
        if(g&&g.retailerName&&strong)strong.textContent=g.retailerName;
      });
      document.querySelectorAll('[data-v6-saving]').forEach(el=>{
        if(el.textContent&&/(0[.,]00)/.test(el.textContent))el.textContent='Live-Preise verglichen';
      });
    }catch(e){}
  };
  const observer=new MutationObserver(decorateRetailers);
  document.addEventListener('DOMContentLoaded',()=>{
    observer.observe(document.body,{childList:true,subtree:true});
    decorateRetailers();
  });

  window.npNoevaPetRealCoreV1=Object.freeze({
    version:'1.0',
    hydrateExactProducts,
    mode:'live-core-binding',
    analytics:'consent-gated-core-revenue-loop',
    affiliateAttribution:'core-event-id',
    affiliateRankingInfluence:false
  });
})();
