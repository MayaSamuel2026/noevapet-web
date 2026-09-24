// NOEVA CORE OS / NoevaPet REAL CORE v1.0 public binding — no automatic tracking.
(function(){
  const CORE='https://noeva-core.179-198-203-247.nip.io';
  const VERTICAL='noevapet';

  async function request(path,opts={}){
    const r=await fetch(CORE+path,{
      credentials:'omit',
      headers:{
        Accept:'application/json',
        ...(opts.body?{'Content-Type':'application/json'}:{}),
        ...(opts.headers||{})
      },
      ...opts
    });
    let body=null; try{body=await r.json()}catch(e){}
    if(!r.ok) throw new Error((body&&(body.error||body.detail))||('CORE HTTP '+r.status));
    return body;
  }

  function post(path,payload){
    return request(path,{method:'POST',body:JSON.stringify(payload||{})});
  }

  window.NOEVA_CORE={
    version:'1.5.0',
    verticalId:VERTICAL,
    origin:CORE,
    capabilities:Object.freeze({
      health:true,
      event:true,
      data:true,
      decision:true,
      commercial:true,
      profile:false,
      analytics:true,
      affiliateActivation:false
    }),
    health:()=>request('/api/public/v1/binding/health?vertical_id='+VERTICAL),
    noevapet:Object.freeze({
      status:()=>request('/api/public/v1/noevapet/status'),
      catalog:(params={})=>request('/api/public/v1/noevapet/catalog?'+new URLSearchParams(params)),
      offers:(productId)=>request('/api/public/v1/noevapet/offers?'+new URLSearchParams({product_id:productId})),
      exactProduct:(payload)=>post('/api/public/v1/noevapet/exact-product',payload),
      recommend:(payload)=>post('/api/public/v1/noevapet/recommend',payload),
      contact:(payload)=>post('/api/public/v1/noevapet/contact',payload),
      retailerHandoff:(payload)=>post('/api/public/v1/noevapet/retailer-handoff',payload),
      affiliateEvent:(payload)=>post('/api/public/v1/noevapet/affiliate-event',payload),
      consentEvent:(payload)=>post('/api/public/v1/noevapet/consent-event',payload),
      revenueEvent:(payload)=>post('/api/public/v1/revenue/event',payload)
    })
  };
})();
