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
  consentEvent:"https://noeva-core.179-198-203-247.nip.io/api/public/v1/noevapet/consent-event"
 },
 analytics:{enabled:false,provider:null,measurementId:null},
 affiliate:{enabled:false,network:null,partnerId:null,rankingInfluence:false},
 retailers:{},
 auth:{enabled:false,provider:null,persistence:"device-local"},
 legal:{operator:"NOEVA Systems e.K.",registerCourt:null,registrationNumber:null,vatId:null}
};
