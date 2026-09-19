// NoevaPet pre-deployment runtime bindings.
// Production CI/CD should inject real values. Never commit credentials here.
window.NOEVA_RUNTIME={
 mode:"predeployment",
 endpoints:{catalog:null,recommend:null,contact:null,profile:null,retailerHandoff:null,affiliateEvent:null,consentEvent:null},
 analytics:{enabled:false,provider:null,measurementId:null},
 affiliate:{enabled:false,network:null,partnerId:null},
 retailers:{A:{url:null,mode:"prefilled_cart"},B:{url:null,mode:"prefilled_cart"}},
 auth:{enabled:false,provider:null},
 legal:{registerCourt:null,registrationNumber:null,vatId:null}
};
