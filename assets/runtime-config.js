// NoevaPet Germany production runtime — public bindings only.
window.NOEVA_RUNTIME={
 mode:"production",
 endpoints:{
  catalog:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/catalog",
  recommend:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/recommend",
  exactProduct:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/exact-product",
  contact:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/contact",
  profile:null,
  retailerHandoff:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/retailer-handoff",
  affiliateEvent:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/affiliate-event",
  consentEvent:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/consent-event",
  revenueEvent:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/revenue/event"
 },
 analytics:{enabled:true,provider:"NOEVA_CORE_REVENUE_LOOP",siteId:"noevapet.de",consentRequired:true,measurementId:null},
 affiliate:{enabled:false,network:null,partnerId:null,rankingInfluence:false,attribution:"NOEVA_CORE_EVENT_ID",handoff:"CORE_RETAILER_HANDOFF"},
 retailers:{},
 auth:{enabled:false,provider:null,persistence:"device-local"},
 legal:{operator:"Frederick Samuel / NOEVA Systems",businessForm:"Einzelunternehmen",commercialRegisterStatus:"NOT_YET_REGISTERED",registerCourt:null,registrationNumber:null,vatId:null,contact:"info@noevasystems.com"}
};
