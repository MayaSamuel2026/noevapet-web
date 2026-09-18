// NOEVA CORE OS v1.3 public binding — no automatic tracking.
(function(){
  const CORE='https://noeva-core.179-198-203-247.nip.io';
  const VERTICAL='noevapet';
  async function request(path,opts={}){
    const r=await fetch(CORE+path,{credentials:'omit',headers:{Accept:'application/json',...(opts.body?{'Content-Type':'application/json'}:{}),...(opts.headers||{})},...opts});
    let body=null; try{body=await r.json()}catch(e){}
    if(!r.ok) throw new Error((body&&body.detail)||('CORE HTTP '+r.status));
    return body;
  }
  window.NOEVA_CORE={
    version:'1.3.0',
    verticalId:VERTICAL,
    origin:CORE,
    capabilities:Object.freeze({health:true,event:true,data:false,decision:false,commercial:false}),
    health:()=>request('/api/public/v1/binding/health?vertical_id='+VERTICAL),
    event:(event_type,payload={})=>request('/api/public/v1/events',{method:'POST',body:JSON.stringify({vertical_id:VERTICAL,event_type,payload})})
  };
})();
