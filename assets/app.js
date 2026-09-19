
// NOEVAPET DE PRODUCTION — fresh visitors begin without demo pets.
(function npGermanyFreshPetState(){
  try{
    const raw=localStorage.getItem('npPets');
    if(raw===null){
      localStorage.setItem('npPets','[]');
      localStorage.removeItem('npActivePetId');
      return;
    }
    const pets=JSON.parse(raw);
    const untouchedDemo=Array.isArray(pets) && pets.length===2 &&
      pets[0]?.id==='milo' && pets[1]?.id==='luna';
    if(untouchedDemo){
      localStorage.setItem('npPets','[]');
      localStorage.removeItem('npActivePetId');
      ['milo','luna'].forEach(id=>{
        localStorage.removeItem(`npRoutine:${id}`);
        localStorage.removeItem(`npNeeds:${id}`);
        localStorage.removeItem(`npPlan:${id}`);
      });
    }
  }catch(e){
    localStorage.setItem('npPets','[]');
    localStorage.removeItem('npActivePetId');
  }
})();

const npLang = document.documentElement.lang || 'en';

function t(en,de){ return npLang==='de' ? de : en; }

// Cookie banner (pre-deployment behaviour)
document.addEventListener('DOMContentLoaded',()=>{
  const banner=document.getElementById('cookieBanner');
  if(banner && !localStorage.getItem('npCookieChoice')) banner.classList.add('show');
  document.querySelectorAll('[data-cookie]').forEach(b=>b.addEventListener('click',()=>{
    localStorage.setItem('npCookieChoice',b.dataset.cookie);
    banner?.classList.remove('show');
  }));
  initNeeds(); initPlan(); initPets(); initPetForm(); initContact(); initCompare();
});

function initNeeds(){
  document.querySelectorAll('.need').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('.need').forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected');
      const helper=document.getElementById('toolCopy');
      if(helper) helper.textContent=btn.dataset.copy || t('Good choice. The next step now adapts to your pet.','Gute Wahl. Der nächste Schritt passt sich jetzt deinem Tier an.');
      const next=document.getElementById('resultReveal');
      if(next) next.hidden=false;
    });
  });
}

const defaultPlan = [
  {id:'p1',name:'Everyday blend',nameDe:'Alltagsfutter',subtitle:'Food · everyday fit',subtitleDe:'Futter · für den Alltag',img:'../assets/product-food.svg',zone:'zone-now'},
  {id:'p2',name:'Small training treats',nameDe:'Kleine Trainingssnacks',subtitle:'Treats · easy to carry',subtitleDe:'Snacks · gut für unterwegs',img:'../assets/product-treats.svg',zone:'zone-go'},
  {id:'p3',name:'Coat care spray',nameDe:'Fellpflegespray',subtitle:'Care · sensitive skin',subtitleDe:'Pflege · empfindliche Haut',img:'../assets/product-care.svg',zone:'zone-home'}
];
function getPlan(){
  try{const x=JSON.parse(localStorage.getItem('npPlan')); if(Array.isArray(x)) return x}catch(e){}
  return defaultPlan;
}
function savePlan(items){localStorage.setItem('npPlan',JSON.stringify(items))}
function addPlanItem(btn){
  const items=getPlan();
  const id=btn.dataset.id || ('i'+Date.now());
  if(!items.find(x=>x.id===id)){
    items.push({id,name:btn.dataset.name,nameDe:btn.dataset.nameDe||btn.dataset.name,subtitle:btn.dataset.subtitle,subtitleDe:btn.dataset.subtitleDe||btn.dataset.subtitle,img:btn.dataset.img,zone:btn.dataset.zone||'zone-now'});
    savePlan(items);
  }
  btn.textContent=t('Added ✓','Hinzugefügt ✓'); btn.classList.add('primary');
  renderPlan();
}
function moveItem(id){
  const order=['zone-now','zone-home','zone-go'];
  const items=getPlan().map(i=>{if(i.id===id){i.zone=order[(order.indexOf(i.zone)+1)%order.length]}return i});
  savePlan(items);renderPlan();
}
function removeItem(id){savePlan(getPlan().filter(i=>i.id!==id));renderPlan()}
function renderPlan(){
  const board=document.getElementById('planBoard'); if(!board)return;
  board.querySelectorAll('.zone-items').forEach(z=>z.innerHTML='');
  const items=getPlan();
  items.forEach(i=>{
    const host=document.getElementById(i.zone); if(!host)return;
    const el=document.createElement('div');el.className='product-card';
    const nm=npLang==='de'?(i.nameDe||i.name):i.name;
    const sub=npLang==='de'?(i.subtitleDe||i.subtitle):i.subtitle;
    el.innerHTML=`<img src="${i.img}" alt=""><div><strong>${nm}</strong><span>${sub}</span></div><div class="pc-actions"><button onclick="moveItem('${i.id}')">${t('Move','Verschieben')}</button><button onclick="removeItem('${i.id}')">${t('Remove','Entfernen')}</button></div>`;
    host.appendChild(el);
  });
  document.querySelectorAll('[data-plan-count]').forEach(e=>e.textContent=items.length);
}
function initPlan(){
  document.querySelectorAll('[data-add-item]').forEach(btn=>btn.addEventListener('click',()=>addPlanItem(btn)));
  renderPlan();
}

// Pet profiles
const starterPets=[
 {id:'milo',name:'Milo',type:'Dog',typeDe:'Hund',age:'4 years',ageDe:'4 Jahre',about:'Large, active, sensitive skin',aboutDe:'Groß, aktiv, empfindliche Haut',tags:['Active','Sensitive skin','Large dog'],tagsDe:['Aktiv','Empfindliche Haut','Großer Hund'],photo:'../assets/owner-laptop.png'},
 {id:'luna',name:'Luna',type:'Cat',typeDe:'Katze',age:'6 years',ageDe:'6 Jahre',about:'Indoor, calm, likes soft food',aboutDe:'Wohnung, ruhig, mag weiches Futter',tags:['Indoor','Calm'],tagsDe:['Wohnung','Ruhig'],photo:''}
];
function getPets(){
  try{
    const raw=localStorage.getItem('npPets');
    if(raw!==null){
      const x=JSON.parse(raw);
      if(Array.isArray(x)) return x;
    }
  }catch(e){}
  localStorage.setItem('npPets','[]');
  return [];
}
function savePets(p){localStorage.setItem('npPets',JSON.stringify(p))}
function removePet(id){savePets(getPets().filter(p=>p.id!==id));renderPets()}
function renderPets(){
  const grid=document.getElementById('petsGrid');if(!grid)return;
  grid.innerHTML='';
  getPets().forEach(p=>{
    const card=document.createElement('article');card.className='card pet-card';
    const visual=p.photo?`<img src="${p.photo}" alt="${p.name}">`:`<div class="placeholder">${(p.name||'?')[0]}</div>`;
    const type=npLang==='de'?(p.typeDe||p.type):p.type;
    const age=npLang==='de'?(p.ageDe||p.age):p.age;
    const about=npLang==='de'?(p.aboutDe||p.about):p.about;
    const tags=npLang==='de'?(p.tagsDe||p.tags||[]):(p.tags||[]);
    card.innerHTML=`<div class="pet-photo">${visual}</div><div class="pet-body"><div class="smallcap">${type}</div><h3>${p.name}</h3><p>${age} · ${about}</p><div class="tags">${tags.map(x=>`<span class="tag">${x}</span>`).join('')}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px"><a class="pill soft" href="tool.html">${t('Start here','Hier starten')}</a><button class="remove-link" onclick="removePet('${p.id}')">${t('Remove','Entfernen')}</button></div></div>`;
    grid.appendChild(card);
  });
}
function initPets(){renderPets()}
function initPetForm(){
  const form=document.getElementById('petForm'), file=document.getElementById('petPhoto'), preview=document.getElementById('photoPreview');
  if(file)file.addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{preview.src=ev.target.result;preview.style.display='block'};r.readAsDataURL(f)});
  if(form)form.addEventListener('submit',e=>{
    e.preventDefault();const d=new FormData(form);const tags=(d.get('traits')||'').toString().split(',').map(s=>s.trim()).filter(Boolean);
    const pets=getPets();pets.push({id:'p'+Date.now(),name:d.get('name'),type:d.get('type'),typeDe:d.get('type'),age:d.get('age'),ageDe:d.get('age'),about:d.get('notes'),aboutDe:d.get('notes'),tags,tagsDe:tags,photo:preview?.getAttribute('src')||''});savePets(pets);
    form.reset();if(preview){preview.removeAttribute('src');preview.style.display='none'}renderPets();
  });
}

// Contact form
function initContact(){
 const f=document.getElementById('contactForm'),s=document.getElementById('contactSuccess');
 if(f)f.addEventListener('submit',e=>{e.preventDefault();if(s){s.hidden=false;s.scrollIntoView({behavior:'smooth',block:'center'})}f.reset()});
}

// Compare toggles
function initCompare(){
  document.querySelectorAll('[data-compare-pick]').forEach(b=>b.addEventListener('click',()=>{
    b.textContent=t('Selected ✓','Ausgewählt ✓');b.classList.add('primary');
  }));
}

// ===========================================================
// NOEVAPET V2 — PET ORBIT / CONSTELLATION
// ===========================================================
const npOrbitState={items:[],preference:'balance',angle:26};
const orbitPositions=[
 {left:'16%',top:'24%'},{left:'72%',top:'22%'},{left:'80%',top:'55%'},
 {left:'57%',top:'78%'},{left:'20%',top:'70%'},{left:'8%',top:'47%'}
];

function orbitAddFromElement(el){
 const id=el.dataset.orbitId;
 if(!id||npOrbitState.items.find(x=>x.id===id))return;
 npOrbitState.items.push({id,label:el.dataset.label,labelDe:el.dataset.labelDe||el.dataset.label,img:el.dataset.img,insight:el.dataset.insight,insightDe:el.dataset.insightDe||el.dataset.insight});
 npOrbitState.angle=(npOrbitState.angle+51)%360;renderOrbit();
}
function orbitRemove(id){npOrbitState.items=npOrbitState.items.filter(x=>x.id!==id);renderOrbit()}
function renderOrbit(){
 const instrument=document.getElementById('petOrbit');if(!instrument)return;
 instrument.querySelectorAll('.orbit-node.dynamic').forEach(n=>n.remove());
 npOrbitState.items.forEach((item,i)=>{
  const pos=orbitPositions[i%orbitPositions.length];
  const node=document.createElement('div');node.className='orbit-node dynamic';
  node.style.left=pos.left;node.style.top=pos.top;
  node.innerHTML=`<img src="${item.img}" alt=""><button aria-label="${t('Remove','Entfernen')}" onclick="orbitRemove('${item.id}')">×</button>`;
  instrument.appendChild(node);
 });
 const pointer=document.getElementById('orbitPointer');if(pointer)pointer.style.transform=`rotate(${npOrbitState.angle}deg)`;
 const insight=document.getElementById('orbitInsight');
 if(insight){
  const last=npOrbitState.items[npOrbitState.items.length-1];
  insight.innerHTML=last
   ?`<strong>${t('NoevaPet noticed','NoevaPet hat erkannt')}</strong><p>${npLang==='de'?last.insightDe:last.insight}</p>`
   :`<strong>${t('Drag something into Milo’s orbit','Ziehe etwas in Milos Orbit')}</strong><p>${t('Start with what is already part of his day. The recommendation changes as the routine becomes clearer.','Beginne mit Dingen, die bereits zu seinem Alltag gehören. Je klarer die Routine wird, desto genauer wird die Empfehlung.')}</p>`;
 }
 const score=document.querySelector('[data-match-score]');if(score)score.textContent=Math.min(96,76+npOrbitState.items.length*4+(npOrbitState.preference==='balance'?3:0));
 const title=document.getElementById('matchTitle');
 if(title){
  const labels=npOrbitState.items.map(x=>npLang==='de'?x.labelDe:x.label);
  title.textContent=labels.length?labels.slice(-2).join(' + '):t('Milo’s everyday match','Milos Alltags-Match');
 }
}
function initOrbit(){
 const instrument=document.getElementById('petOrbit');if(!instrument)return;
 document.querySelectorAll('.orbit-object').forEach(el=>{
  el.setAttribute('draggable','true');
  el.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',el.dataset.orbitId);window.__npOrbitDrag=el});
  el.addEventListener('click',()=>orbitAddFromElement(el));
 });
 instrument.addEventListener('dragover',e=>{e.preventDefault();instrument.style.filter='brightness(1.05)'});
 instrument.addEventListener('dragleave',()=>instrument.style.filter='');
 instrument.addEventListener('drop',e=>{e.preventDefault();instrument.style.filter='';if(window.__npOrbitDrag)orbitAddFromElement(window.__npOrbitDrag);window.__npOrbitDrag=null});
 document.querySelectorAll('[data-pref]').forEach(btn=>{
  btn.addEventListener('click',()=>{
   document.querySelectorAll('[data-pref]').forEach(x=>x.classList.remove('active'));btn.classList.add('active');npOrbitState.preference=btn.dataset.pref;
   const copy=document.getElementById('preferenceCopy');
   if(copy){
    const map={
     price:t('We will lean harder toward lower total cost across the whole plan.','Wir gewichten die Gesamtkosten im gesamten Plan stärker.'),
     balance:t('We balance fit, total cost and buying convenience.','Wir balancieren Passung, Gesamtkosten und einen einfachen Kaufweg.'),
     simple:t('We prefer fewer retailer handoffs when the product fit remains strong.','Wir bevorzugen weniger Händlerwechsel, solange die Passung stark bleibt.'),
     usual:t('We keep your usual products unchanged and optimise price, availability and the rest of the plan around them.','Wir lassen deine gewohnten Produkte unverändert und optimieren Preis, Verfügbarkeit und den restlichen Plan darum herum.')
    };copy.textContent=map[npOrbitState.preference];
   }renderOrbit();
  });
 });
 ['dry','treats'].forEach(id=>{const el=document.querySelector(`.orbit-object[data-orbit-id="${id}"]`);if(el)orbitAddFromElement(el)});
}

function initPlanDragDrop(){
 const board=document.getElementById('planBoard');if(!board)return;
 const makeDraggable=()=>{
  board.querySelectorAll('.product-card').forEach(card=>{
   if(card.dataset.dndReady)return;card.dataset.dndReady='1';card.setAttribute('draggable','true');
   card.addEventListener('dragstart',()=>{
    card.classList.add('dragging');
    const onclick=card.querySelector('.pc-actions button')?.getAttribute('onclick')||'';
    window.__npPlanDrag=(onclick.match(/'([^']+)'/)||[])[1]||null;
   });
   card.addEventListener('dragend',()=>{card.classList.remove('dragging');window.__npPlanDrag=null});
  });
 };
 const observer=new MutationObserver(makeDraggable);observer.observe(board,{childList:true,subtree:true});makeDraggable();
 board.querySelectorAll('.zone').forEach(zone=>{
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over')});
  zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
  zone.addEventListener('drop',e=>{
   e.preventDefault();zone.classList.remove('drag-over');const id=window.__npPlanDrag;if(!id)return;
   const target=zone.querySelector('.zone-items')?.id;if(!target)return;
   const items=getPlan().map(i=>{if(i.id===id)i.zone=target;return i});savePlan(items);renderPlan();
  });
 });
}

async function npRuntimePost(kind,payload){
 const cfg=window.NOEVA_RUNTIME||{};const endpoint=cfg?.endpoints?.[kind];
 if(!endpoint)return{ok:false,predeployment:true};
 const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
 return{ok:res.ok,status:res.status,data:res.ok?await res.json():null};
}
document.addEventListener('DOMContentLoaded',()=>{initOrbit();initPlanDragDrop()});

// ===========================================================
// NOEVAPET V3 — CURRENT ROUTINE + KEEP USUAL PRODUCTS
// ===========================================================
const npRoutineDefaults = [
  {
    id:'routine-food',
    type:'food',
    name:'Current dry food',
    nameDe:'Aktuelles Trockenfutter',
    img:'../assets/product-food.svg',
    locked:true
  },
  {
    id:'routine-oil',
    type:'supplement',
    name:'Salmon oil',
    nameDe:'Lachsöl',
    img:'../assets/care.svg',
    locked:true
  }
];

function getRoutine(){
  try{
    const x=JSON.parse(localStorage.getItem('npCurrentRoutine'));
    if(Array.isArray(x)) return x;
  }catch(e){}
  return npRoutineDefaults;
}
function saveRoutine(items){
  localStorage.setItem('npCurrentRoutine',JSON.stringify(items));
}
function routineIcon(type){
  const map={
    food:'../assets/v13-need-wet.svg',
    supplement:'../assets/v13-need-vet.svg',
    treats:'../assets/v13-need-snacks.svg',
    dental:'../assets/v13-need-dental.svg',
    care:'../assets/v13-need-coat.svg',
    other:'../assets/v13-need-vet.svg'
  };
  return map[type]||map.other;
}
function routineTypeLabel(type){
  const en={food:'Food',supplement:'Supplement / oil',treats:'Treats',dental:'Dental care',care:'Care',other:'Other'};
  const de={food:'Futter',supplement:'Ergänzung / Öl',treats:'Snacks',dental:'Zahnpflege',care:'Pflege',other:'Sonstiges'};
  return (npLang==='de'?de:en)[type]||type;
}
function lockedRoutine(){
  return getRoutine().filter(x=>x.locked);
}
function renderRoutine(){
  const host=document.getElementById('routineList');
  if(!host) return;
  const items=getRoutine();
  host.innerHTML='';
  items.forEach(item=>{
    const row=document.createElement('div');
    row.className='routine-row';
    const nm=npLang==='de'?(item.nameDe||item.name):item.name;
    row.innerHTML=`
      <img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'">
      <div><strong>${nm}</strong><small>${routineTypeLabel(item.type)}</small></div>
      <div style="display:flex;align-items:center;gap:5px">
        <label class="keep-toggle"><input type="checkbox" ${item.locked?'checked':''} data-routine-lock="${item.id}">${t('Keep','Behalten')}</label>
        <button class="routine-remove" data-routine-remove="${item.id}" aria-label="${t('Remove','Entfernen')}">×</button>
      </div>`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-routine-lock]').forEach(input=>{
    input.addEventListener('change',()=>{
      const id=input.dataset.routineLock;
      const changed=getRoutine().map(x=>x.id===id?{...x,locked:input.checked}:x);
      saveRoutine(changed);
      syncRoutineIntoOrbit();
      updateRoutineSummary();
    });
  });
  host.querySelectorAll('[data-routine-remove]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      saveRoutine(getRoutine().filter(x=>x.id!==btn.dataset.routineRemove));
      renderRoutine();syncRoutineIntoOrbit();updateRoutineSummary();
    });
  });
  updateRoutineSummary();
}
function updateRoutineSummary(){
  const summary=document.getElementById('routineSummary');
  if(!summary)return;
  const locked=lockedRoutine();
  if(!locked.length){
    summary.innerHTML=`<strong>${t('Nothing is fixed.','Nichts ist festgelegt.')}</strong> ${t('NoevaPet may suggest replacements where they improve the plan.','NoevaPet darf Alternativen vorschlagen, wenn sie den Plan verbessern.')}`;
    return;
  }
  const names=locked.map(x=>npLang==='de'?(x.nameDe||x.name):x.name);
  summary.innerHTML=`<strong>${t('Keep unchanged:','Unverändert behalten:')}</strong> ${names.join(', ')}. ${t('NoevaPet will compare around these products instead of trying to replace them.','NoevaPet vergleicht um diese Produkte herum, statt sie ersetzen zu wollen.')}`;
}
function addRoutineItemFromForm(form){
  const data=new FormData(form);
  const type=(data.get('routineType')||'other').toString();
  const name=(data.get('routineName')||'').toString().trim();
  if(!name)return;
  const items=getRoutine();
  items.push({
    id:'routine-'+Date.now(),
    type,
    name,
    nameDe:name,
    img:routineIcon(type),
    locked:data.get('routineKeep')==='on'
  });
  saveRoutine(items);
  form.reset();
  const keep=form.querySelector('[name="routineKeep"]');if(keep)keep.checked=true;
  renderRoutine();syncRoutineIntoOrbit();updateRoutineSummary();
}
function syncRoutineIntoOrbit(){
  if(typeof npOrbitState==='undefined')return;
  const routine=getRoutine();
  // remove all routine-derived orbit nodes first
  npOrbitState.items=npOrbitState.items.filter(x=>!x.fromRoutine);
  routine.forEach(item=>{
    const nm=npLang==='de'?(item.nameDe||item.name):item.name;
    npOrbitState.items.push({
      id:'fixed-'+item.id,
      label:item.name,
      labelDe:item.nameDe||item.name,
      img:item.img||routineIcon(item.type),
      locked:!!item.locked,
      fromRoutine:true,
      insight:item.locked
        ? `${item.name} stays unchanged. We will compare prices and build the rest of the plan around it.`
        : `${item.name} is part of the current routine, but you are open to alternatives.`,
      insightDe:item.locked
        ? `${item.nameDe||item.name} bleibt unverändert. Wir vergleichen dafür Preise und bauen den restlichen Plan darum herum.`
        : `${item.nameDe||item.name} gehört zur aktuellen Routine, aber Alternativen sind möglich.`
    });
  });
  renderOrbit();
}
function initRoutine(){
  const form=document.getElementById('routineForm');
  if(form)form.addEventListener('submit',e=>{e.preventDefault();addRoutineItemFromForm(form)});
  renderRoutine();
  // Orbit exists after DOM ready; sync current products immediately.
  setTimeout(syncRoutineIntoOrbit,0);
}

// Extend renderOrbit with a visual lock indicator for fixed products.
const __npOriginalRenderOrbit = typeof renderOrbit==='function' ? renderOrbit : null;
if(__npOriginalRenderOrbit){
  renderOrbit=function(){
    __npOriginalRenderOrbit();
    const instrument=document.getElementById('petOrbit');
    if(!instrument)return;
    const nodes=[...instrument.querySelectorAll('.orbit-node.dynamic')];
    npOrbitState.items.forEach((item,i)=>{
      if(item.locked && nodes[i]){
        nodes[i].classList.add('locked');
        const badge=document.createElement('span');
        badge.className='keep-badge';
        badge.title=t('Keep this product','Dieses Produkt behalten');
        badge.textContent='🔒';
        nodes[i].appendChild(badge);
      }
    });
    const locked=lockedRoutine();
    const title=document.getElementById('matchTitle');
    if(title && locked.length){
      title.textContent=t(`${locked.length} usual product${locked.length===1?'':'s'} kept`,`${locked.length} gewohnt${locked.length===1?'es Produkt':'e Produkte'} bleiben`);
    }
  };
}

// Global preference: "Keep usuals" locks the whole current routine.
function applyUsualsPreference(){
  const items=getRoutine().map(x=>({...x,locked:true}));
  saveRoutine(items);renderRoutine();syncRoutineIntoOrbit();
}

document.addEventListener('DOMContentLoaded',()=>{
  initRoutine();
  const usualBtn=document.querySelector('[data-pref="usual"]');
  if(usualBtn){
    usualBtn.addEventListener('click',applyUsualsPreference);
  }
});

function renderKeptProductsBanner(){
  const list=document.getElementById('keptProductsList');
  const banner=document.getElementById('keptProductsBanner');
  if(!list||!banner)return;
  const locked=lockedRoutine();
  if(!locked.length){banner.style.display='none';return}
  list.innerHTML=locked.map(x=>{
    const nm=npLang==='de'?(x.nameDe||x.name):x.name;
    return `<span class="kept-chip">${nm}</span>`;
  }).join('');
}
document.addEventListener('DOMContentLoaded',renderKeptProductsBanner);

// V3: compact add-pet tile keeps the add section visible/obvious above the fold.
const __npRenderPetsBase = typeof renderPets==='function' ? renderPets : null;
if(__npRenderPetsBase){
  renderPets=function(){
    __npRenderPetsBase();
    const grid=document.getElementById('petsGrid');
    if(!grid || grid.querySelector('.add-pet-tile')) return;
    const tile=document.createElement('a');
    tile.className='card add-pet-tile';
    tile.href='#addPet';
    tile.innerHTML=`<div><div class="plus">＋</div><strong>${t('Add another pet','Weiteres Tier hinzufügen')}</strong><span>${t('Photo + a few useful details','Foto + ein paar hilfreiche Angaben')}</span></div>`;
    grid.appendChild(tile);
  };
}

function renderNoChangeState(){
  const host=document.getElementById('noChangeState');
  if(!host)return;
  const locked=lockedRoutine();
  if(!locked.length){host.style.display='none';return}
  host.style.display='block';
  host.innerHTML=`<strong>${t('Keeping things as they are can be the right answer.','Alles so zu lassen, kann die richtige Antwort sein.')}</strong>
  <span>${t('If the current routine fits and the buying route is already good, NoevaPet can simply say: keep it, wait, or only rebuy the same products.','Wenn die aktuelle Routine passt und der Kaufweg bereits gut ist, kann NoevaPet auch einfach sagen: behalten, abwarten oder nur dieselben Produkte nachkaufen.')}</span>`;
}
document.addEventListener('DOMContentLoaded',renderNoChangeState);

// ===========================================================
// NOEVAPET V4 — NAV CART + EXACT PRODUCT + PURCHASE FLOW
// ===========================================================
function refreshNavCartCount(){
  const count=getPlan().length;
  document.querySelectorAll('[data-nav-cart-count]').forEach(el=>el.textContent=count);
}
const __npRenderPlanV4 = typeof renderPlan==='function' ? renderPlan : null;
if(__npRenderPlanV4){
  renderPlan=function(){__npRenderPlanV4();refreshNavCartCount();}
}

function exactRoutineAdd(form){
  const d=new FormData(form);
  const name=(d.get('exactName')||'').toString().trim();
  if(!name)return;
  const type=(d.get('exactType')||'food').toString();
  const keep=d.get('exactKeep')==='on';
  const items=getRoutine();
  items.push({
    id:'exact-'+Date.now(),
    type,
    name,
    nameDe:name,
    img:routineIcon(type),
    locked:keep
  });
  saveRoutine(items);
  form.reset();
  const keepBox=form.querySelector('[name="exactKeep"]');if(keepBox)keepBox.checked=true;
  renderExactCurrentProducts();
  syncRoutineIntoOrbitV4();
}
function renderExactCurrentProducts(){
  const host=document.getElementById('exactCurrentProducts');
  if(!host)return;
  const items=getRoutine();
  host.innerHTML='';
  items.forEach(item=>{
    const nm=npLang==='de'?(item.nameDe||item.name):item.name;
    const row=document.createElement('div');row.className='current-product';
    row.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div><strong>${nm}</strong><span>${routineTypeLabel(item.type)}</span></div><div class="lock">${item.locked?'🔒':'↺'}</div>`;
    host.appendChild(row);
  });
}

const dayNodePositions=[
  {left:'18%',top:'20%'},{right:'16%',top:'18%'},{right:'5%',top:'47%'},{right:'17%',bottom:'9%'},
  {left:'18%',bottom:'8%'},{left:'3%',top:'49%'},{left:'41%',top:'2%'},{left:'42%',bottom:'0%'}
];
let dayOrbitItems=[];
function syncRoutineIntoOrbitV4(){
  const orbit=document.getElementById('dayOrbit');if(!orbit)return;
  dayOrbitItems=[];
  getRoutine().forEach(item=>{
    dayOrbitItems.push({
      id:'routine-'+item.id,
      name:npLang==='de'?(item.nameDe||item.name):item.name,
      img:item.img||routineIcon(item.type),
      locked:!!item.locked,
      current:true
    });
  });
  renderDayOrbit();
  renderExactCurrentProducts();
}
function addDayItem(el){
  const id=el.dataset.dayId;
  if(dayOrbitItems.find(x=>x.id===id))return;
  dayOrbitItems.push({id,name:npLang==='de'?el.dataset.nameDe:el.dataset.name,img:el.dataset.img,locked:false,current:false});
  renderDayOrbit();
}
function removeDayItem(id){
  // routine-derived nodes must be removed from routine itself
  if(id.startsWith('routine-')){
    const rid=id.replace('routine-','');
    saveRoutine(getRoutine().filter(x=>x.id!==rid));
    syncRoutineIntoOrbitV4();return;
  }
  dayOrbitItems=dayOrbitItems.filter(x=>x.id!==id);renderDayOrbit();
}
function renderDayOrbit(){
  const orbit=document.getElementById('dayOrbit');if(!orbit)return;
  orbit.querySelectorAll('.day-node').forEach(x=>x.remove());
  dayOrbitItems.slice(0,8).forEach((item,i)=>{
    const node=document.createElement('div');node.className='day-node';
    Object.assign(node.style,dayNodePositions[i]);
    node.innerHTML=`<img src="${item.img}" alt=""><button onclick="removeDayItem('${item.id}')" aria-label="${t('Remove','Entfernen')}">×</button>${item.locked?'<span class="node-lock">🔒</span>':''}`;
    node.title=item.name;orbit.appendChild(node);
  });
  const score=document.querySelector('[data-day-score]');
  if(score)score.textContent=Math.min(96,84+Math.min(dayOrbitItems.length,6)*2);
  const insight=document.getElementById('dayInsight');
  if(insight){
    const kept=getRoutine().filter(x=>x.locked);
    insight.innerHTML=kept.length
      ? `<strong>${t('Keeping your usuals','Gewohnte Produkte bleiben')}</strong>${t(' NoevaPet will not replace '+kept.length+' product'+(kept.length===1?'':'s')+'. It will optimise how you buy them and only recommend around genuine gaps.',' NoevaPet ersetzt '+kept.length+' fest markierte Produkte nicht. Optimiert werden Kaufweg und nur echte Lücken.')}`
      : `<strong>${t('A flexible routine','Eine flexible Routine')}</strong>${t(' You are open to alternatives, so NoevaPet may compare replacements where there is a clear benefit.',' Alternativen sind möglich, wenn es einen klaren Vorteil gibt.')}`;
  }
}
function initDayOrbitV4(){
  document.querySelectorAll('.tool4-item').forEach(el=>{
    el.setAttribute('draggable','true');
    el.addEventListener('dragstart',()=>window.__npDayDrag=el);
    el.addEventListener('click',()=>addDayItem(el));
  });
  const orbit=document.getElementById('dayOrbit');
  if(orbit){
    orbit.addEventListener('dragover',e=>e.preventDefault());
    orbit.addEventListener('drop',e=>{e.preventDefault();if(window.__npDayDrag)addDayItem(window.__npDayDrag);window.__npDayDrag=null;});
  }
  const exact=document.getElementById('exactProductForm');
  if(exact)exact.addEventListener('submit',e=>{e.preventDefault();exactRoutineAdd(exact)});
  syncRoutineIntoOrbitV4();
}

// Purchase flow
let purchaseStep=1;
function showPurchaseStep(step){
  purchaseStep=step;
  document.querySelectorAll('.purchase-stage').forEach(x=>x.classList.toggle('active',Number(x.dataset.stage)===step));
  document.querySelectorAll('.purchase-step').forEach(x=>{
    const n=Number(x.dataset.step);
    x.classList.toggle('active',n===step);
    x.classList.toggle('done',n<step);
  });
  window.scrollTo({top:0,behavior:'smooth'});
}
function initPurchaseFlow(){
  document.querySelectorAll('[data-purchase-next]').forEach(b=>b.addEventListener('click',()=>showPurchaseStep(Number(b.dataset.purchaseNext))));
  document.querySelectorAll('.purchase-step').forEach(s=>s.addEventListener('click',()=>showPurchaseStep(Number(s.dataset.step))));
  document.querySelectorAll('[data-buy-pref]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-buy-pref]').forEach(x=>x.classList.remove('active'));b.classList.add('active');
    const price=document.querySelector('[data-optimised-price]');
    const save=document.querySelector('[data-save]');
    if(price&&save){
      const mode=b.dataset.buyPref;
      if(mode==='save'){price.textContent='€76.80';save.textContent=t('Save €7.80','€7,80 sparen')}
      if(mode==='balance'){price.textContent='€79.40';save.textContent=t('Save €5.20','€5,20 sparen')}
      if(mode==='simple'){price.textContent='€82.10';save.textContent=t('1 retailer','1 Händler')}
    }
  }));
}
document.addEventListener('DOMContentLoaded',()=>{
  refreshNavCartCount();
  initDayOrbitV4();
  initPurchaseFlow();
});

function renderPets4(){
  const grid=document.getElementById('pets4Cards');if(!grid)return;
  grid.innerHTML='';
  getPets().forEach(p=>{
    const card=document.createElement('div');card.className='pets4-card';
    const visual=p.photo?`<img src="${p.photo}" alt="${p.name}">`:`<div class="placeholder">${(p.name||'?')[0]}</div>`;
    const tags=npLang==='de'?(p.tagsDe||p.tags||[]):(p.tags||[]);
    const about=npLang==='de'?(p.aboutDe||p.about):p.about;
    const age=npLang==='de'?(p.ageDe||p.age):p.age;
    card.innerHTML=`<div class="pets4-photo">${visual}</div><div><h3>${p.name}</h3><p>${age||''}${about?' · '+about:''}</p><div class="tags">${tags.slice(0,2).map(x=>`<span class="tag">${x}</span>`).join('')}</div><div class="pets4-actions"><a class="pill soft" href="tool.html">${t('Start','Starten')}</a><button class="remove-link" onclick="removePet('${p.id}');renderPets4()">${t('Remove','Entfernen')}</button></div></div>`;
    grid.appendChild(card);
  });
}
document.addEventListener('DOMContentLoaded',renderPets4);

const __npOldSavePetsV4=savePets; savePets=function(p){__npOldSavePetsV4(p);setTimeout(renderPets4,0)};


// ===========================================================
// NOEVAPET V5 — PET MATCH MODAL + VISUAL WHY + HERO
// ===========================================================
const npNeedMap = {
  wet:{type:'food', img:'../assets/v13-need-wet.svg', en:'Wet food', de:'Nassfutter'},
  treats:{type:'treats', img:'../assets/v13-need-snacks.svg', en:'Treats', de:'Snacks'},
  dental:{type:'dental', img:'../assets/v13-need-dental.svg', en:'Dental care', de:'Zahnpflege'},
  coat:{type:'care', img:'../assets/v13-need-coat.svg', en:'Coat care', de:'Fellpflege'},
  walk:{type:'other', img:'../assets/v13-need-walk.svg', en:'Walk', de:'Spaziergang'},
  play:{type:'other', img:'../assets/v13-need-play.svg', en:'Play', de:'Spielen'},
  training:{type:'other', img:'../assets/v13-need-training.svg', en:'Training', de:'Training'},
  vet:{type:'care', img:'../assets/v13-need-vet.svg', en:'Vet care', de:'Tierarzt / Pflege'}
};

function getV5Routine(){
  try{
    const x=JSON.parse(localStorage.getItem('npCurrentRoutine'));
    if(Array.isArray(x)) return x;
  }catch(e){}
  return [
    {id:'base-food',type:'food',name:'Vet Concept Low fat Intestinal',nameDe:'Vet Concept Low fat Intestinal',img:'../assets/product-food.svg',locked:true}
  ];
}
function saveV5Routine(items){
  localStorage.setItem('npCurrentRoutine',JSON.stringify(items));
}
function routineItemLabel(item){
  return npLang==='de' ? (item.nameDe || item.name) : item.name;
}
function renderCurrentStripV5(){
  const host=document.getElementById('currentStrip'); if(!host) return;
  const items=getV5Routine();
  host.innerHTML='';
  items.forEach(item=>{
    const row=document.createElement('div'); row.className='current-chip';
    row.innerHTML=`<img src="${item.img || routineIcon(item.type)}" alt=""><div><strong>${routineItemLabel(item)}</strong><span>${routineTypeLabel(item.type)}</span></div><div class="keep">${item.locked?'🔒':'↺'}</div><button data-remove-current="${item.id}" aria-label="${t('Remove','Entfernen')}">×</button>`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-remove-current]').forEach(b=>b.addEventListener('click',()=>{
    saveV5Routine(getV5Routine().filter(x=>x.id!==b.dataset.removeCurrent));
    renderCurrentStripV5(); syncV5Orbit(); renderResultsKeepBannerV5();
  }));
}

let v5ExtraOrbit = [];
const v5OrbitPos = [
  {left:'17%',top:'18%'},{right:'14%',top:'18%'},{right:'4%',top:'47%'},{right:'17%',bottom:'9%'},
  {left:'17%',bottom:'9%'},{left:'3%',top:'48%'},{left:'41%',top:'2%'},{left:'42%',bottom:'0%'}
];

function syncV5Orbit(){
  const orbit=document.getElementById('tool5Orbit');
  if(!orbit) return;
  orbit.querySelectorAll('.t5-node').forEach(x=>x.remove());
  const items=[...getV5Routine().map(x=>({...x,current:true})), ...v5ExtraOrbit];
  items.slice(0,8).forEach((item,i)=>{
    const el=document.createElement('div');
    el.className='t5-node';
    Object.assign(el.style, v5OrbitPos[i] || v5OrbitPos[v5OrbitPos.length-1]);
    el.title = routineItemLabel(item);
    el.innerHTML=`<img src="${item.img || routineIcon(item.type)}" alt=""><button aria-label="${t('Remove','Entfernen')}" data-orbit-remove="${item.id}">×</button>${item.locked?'<span class="lock">🔒</span>':''}`;
    orbit.appendChild(el);
  });
  orbit.querySelectorAll('[data-orbit-remove]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.orbitRemove;
    const existsInRoutine=getV5Routine().find(x=>x.id===id);
    if(existsInRoutine){
      saveV5Routine(getV5Routine().filter(x=>x.id!==id));
      renderCurrentStripV5();
      renderResultsKeepBannerV5();
    }else{
      v5ExtraOrbit=v5ExtraOrbit.filter(x=>x.id!==id);
    }
    syncV5Orbit();
  }));
  const score=document.querySelector('[data-t5-score]');
  if(score){
    score.textContent=Math.min(97,86+Math.min(items.length,6)*2);
  }
  const insight=document.getElementById('tool5Insight');
  if(insight){
    const kept=getV5Routine().filter(x=>x.locked);
    insight.innerHTML = kept.length
      ? `<strong>${t('Your usual products stay in place','Gewohnte Produkte bleiben erhalten')}</strong>${t(' NoevaPet does not replace the products you locked. It improves the buying route around them and only suggests where there is a genuine gap.',' NoevaPet ersetzt deine fest markierten Produkte nicht. Optimiert werden Kaufweg und nur echte Lücken.')}`
      : `<strong>${t('Open for better options','Offen für bessere Optionen')}</strong>${t(' You are allowing alternatives where there is a clear benefit.',' Du erlaubst Alternativen, wenn es einen klaren Vorteil gibt.')}`;
  }
}

let currentNeedTypeV5 = null;
function openNeedModalV5(needId){
  currentNeedTypeV5 = needId;
  const map=npNeedMap[needId];
  const modal=document.getElementById('needModal');
  if(!modal || !map) return;
  const title=document.getElementById('needModalTitle');
  const copy=document.getElementById('needModalCopy');
  const typeSelect=document.getElementById('needCurrentType');
  if(title) title.textContent = `${npLang==='de'?'Für Milo: ':'For Milo: '}${npLang==='de'?map.de:map.en}`;
  if(copy) copy.textContent = t('Choose whether you want to keep what you already use or whether NoevaPet should suggest something for this need.','Wähle, ob du dein aktuelles Produkt behalten möchtest oder ob NoevaPet dir für diesen Bedarf etwas vorschlagen soll.');
  if(typeSelect) typeSelect.value = map.type;
  modal.classList.add('show');
  setNeedModeV5('current');
  const input=document.getElementById('needCurrentName');
  if(input) input.focus();
}
function closeNeedModalV5(){
  document.getElementById('needModal')?.classList.remove('show');
}
function setNeedModeV5(mode){
  document.querySelectorAll('[data-need-mode]').forEach(b=>b.classList.toggle('active',b.dataset.needMode===mode));
  const current=document.getElementById('needCurrentPanel');
  const suggest=document.getElementById('needSuggestPanel');
  if(current) current.style.display = mode==='current' ? 'block':'none';
  if(suggest) suggest.style.display = mode==='suggest' ? 'block':'none';
}
function saveNeedCurrentV5(){
  const name=(document.getElementById('needCurrentName')?.value || '').trim();
  const type=(document.getElementById('needCurrentType')?.value || 'food');
  const keep=document.getElementById('needKeepExact')?.checked;
  if(!name) return;
  const items=getV5Routine();
  items.push({id:'need-'+Date.now(), type, name, nameDe:name, img:routineIcon(type), locked:!!keep});
  saveV5Routine(items);
  renderCurrentStripV5(); syncV5Orbit(); renderResultsKeepBannerV5(); closeNeedModalV5();
  const formInput=document.getElementById('needCurrentName'); if(formInput) formInput.value='';
}
function addNeedSuggestionV5(){
  const map=npNeedMap[currentNeedTypeV5]; if(!map) return;
  const id='suggest-'+currentNeedTypeV5;
  if(!v5ExtraOrbit.find(x=>x.id===id)){
    v5ExtraOrbit.push({id, type:map.type, name:map.en, nameDe:map.de, img:map.img, locked:false});
  }
  syncV5Orbit(); closeNeedModalV5();
}
function initToolV5(){
  const tool=document.getElementById('tool5Needs');
  if(!tool) return;
  document.querySelectorAll('.need-trigger').forEach(btn=>{
    btn.addEventListener('click',()=>openNeedModalV5(btn.dataset.needId));
    btn.setAttribute('draggable','true');
    btn.addEventListener('dragstart',()=>window.__npNeedDrag = btn.dataset.needId);
  });
  const orbit=document.getElementById('tool5Orbit');
  if(orbit){
    orbit.addEventListener('dragover',e=>e.preventDefault());
    orbit.addEventListener('drop',e=>{
      e.preventDefault();
      if(window.__npNeedDrag){
        currentNeedTypeV5 = window.__npNeedDrag;
        addNeedSuggestionV5();
        window.__npNeedDrag = null;
      }
    });
  }
  document.querySelectorAll('[data-close-need-modal]').forEach(b=>b.addEventListener('click',closeNeedModalV5));
  document.querySelectorAll('[data-need-mode]').forEach(b=>b.addEventListener('click',()=>setNeedModeV5(b.dataset.needMode)));
  document.getElementById('saveNeedCurrent')?.addEventListener('click',saveNeedCurrentV5);
  document.getElementById('saveNeedSuggestion')?.addEventListener('click',addNeedSuggestionV5);
  document.getElementById('needModal')?.addEventListener('click',e=>{if(e.target.id==='needModal')closeNeedModalV5()});
  renderCurrentStripV5();
  syncV5Orbit();
}

function setPurchaseModeVisualV5(mode){
  const price=document.querySelector('[data-optimised-price]');
  const save=document.querySelector('[data-save]');
  const title=document.getElementById('whyVisualTitle');
  const copy=document.getElementById('whyVisualCopy');
  const list=document.getElementById('whyVisualList');
  const stats=document.getElementById('whyVisualStats');
  const retailerA=document.getElementById('retailerA');
  const retailerB=document.getElementById('retailerB');
  const data = {
    save:{
      price:'€76.80',
      save:t('Save €7.80','€7,80 sparen'),
      title:t('Why “Save more” wins here','Warum hier „Mehr sparen“ gewinnt'),
      copy:t('This version accepts a slightly less convenient split because it gives the lowest total cost.','Diese Variante akzeptiert eine etwas weniger bequeme Aufteilung, weil sie den niedrigsten Gesamtpreis liefert.'),
      bullets:[t('2 retailers instead of 1, because the combined product cost is lower.','2 Händler statt 1, weil die kombinierten Produktkosten niedriger sind.'),t('Your fixed products stay the same.','Deine fest markierten Produkte bleiben gleich.'),t('Best if total savings matter more than fewer parcels.','Ideal, wenn die Gesamtersparnis wichtiger ist als weniger Pakete.')],
      stats:[['2 '+t('retailers','Händler'),t('lowest total cost','niedrigster Gesamtpreis')],['€7.80',t('saved vs current basket','Ersparnis zum aktuellen Warenkorb')]],
      retailerA:'Retailer A · 2 products · €58.60', retailerB:'Retailer B · 1 product · €18.20'
    },
    balance:{
      price:'€79.40',
      save:t('Save €5.20','€5,20 sparen'),
      title:t('Why “Best balance” is recommended','Warum „Beste Balance“ empfohlen ist'),
      copy:t('This is the calmest compromise between total cost and a straightforward purchase route.','Das ist der ruhigste Kompromiss zwischen Gesamtkosten und einem einfachen Kaufweg.'),
      bullets:[t('Still cheaper than buying everything in one shop.','Immer noch günstiger, als alles in einem Shop zu kaufen.'),t('Only 2 retailers, so the process stays manageable.','Nur 2 Händler, damit der Ablauf übersichtlich bleibt.'),t('Keeps your usual products and only optimises around them.','Behält deine gewohnten Produkte und optimiert nur drumherum.')],
      stats:[['2 '+t('retailers','Händler'),t('good value + easier flow','guter Wert + einfacherer Ablauf')],['€5.20',t('saved while staying simple','Ersparnis bei ruhigem Ablauf')]],
      retailerA:'Retailer A · 2 products · €61.20', retailerB:'Retailer B · 1 product · €18.20'
    },
    simple:{
      price:'€82.10',
      save:t('1 retailer','1 Händler'),
      title:t('Why “Simplify” changes the plan','Warum „Einfacher“ den Plan verändert'),
      copy:t('You pay a little more, but the plan avoids an extra handoff and keeps everything in one retailer basket.','Du zahlst etwas mehr, dafür entfällt eine zusätzliche Übergabe und alles bleibt in einem Händler-Warenkorb.'),
      bullets:[t('One retailer only.','Nur ein Händler.'),t('Less switching and fewer separate deliveries.','Weniger Wechsel und weniger getrennte Lieferungen.'),t('Best if convenience matters more than squeezing out the last euro.','Ideal, wenn Einfachheit wichtiger ist als der letzte gesparte Euro.')],
      stats:[['1 '+t('retailer','Händler'),t('fewer steps and fewer parcels','weniger Schritte und weniger Pakete')],['€2.70',t('more than best balance','mehr als beste Balance')]],
      retailerA:'Retailer A · 3 products · €82.10', retailerB:t('No second retailer needed','Kein zweiter Händler nötig')
    }
  }[mode];
  if(price) price.textContent = data.price;
  if(save) save.textContent = data.save;
  if(title) title.textContent = data.title;
  if(copy) copy.textContent = data.copy;
  if(list) list.innerHTML = data.bullets.map(x=>`<div><span>✦</span><span>${x}</span></div>`).join('');
  if(stats) stats.innerHTML = data.stats.map(x=>`<div class="why-stat"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('');
  if(retailerA) retailerA.textContent = data.retailerA;
  if(retailerB) retailerB.textContent = data.retailerB;
}
function initPurchaseWhyV5(){
  if(!document.getElementById('whyVisual')) return;
  document.querySelectorAll('[data-buy-pref]').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('[data-buy-pref]').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    setPurchaseModeVisualV5(b.dataset.buyPref);
  }));
  setPurchaseModeVisualV5('balance');
}

function renderResultsKeepBannerV5(){
  const list=document.getElementById('keptProductsList');
  const banner=document.getElementById('keptProductsBanner');
  if(!list || !banner) return;
  const locked=getV5Routine().filter(x=>x.locked);
  if(!locked.length){ banner.style.display='none'; return; }
  banner.style.display='block';
  list.innerHTML = locked.map(x=>`<span class="kept-chip">${routineItemLabel(x)}</span>`).join('');
}

document.addEventListener('DOMContentLoaded',()=>{
  initToolV5();
  initPurchaseWhyV5();
  renderResultsKeepBannerV5();
});


// ===========================================================
// NOEVAPET V6 — ACTIVE PET / PET MATCH / CART HUB
// ===========================================================
function npV6Pets(){
  try{
    const raw=localStorage.getItem('npPets');
    if(raw!==null){
      const x=JSON.parse(raw);
      if(Array.isArray(x)) return x;
    }
  }catch(e){}
  localStorage.setItem('npPets','[]');
  return [];
}
function npV6ActivePetId(){
  const pets=npV6Pets();
  if(!pets.length){
    localStorage.removeItem('npActivePetId');
    return '';
  }
  const stored=localStorage.getItem('npActivePetId');
  if(stored && pets.some(p=>p.id===stored)) return stored;
  const first=pets[0].id;
  localStorage.setItem('npActivePetId',first);
  return first;
}
function npV6ActivePet(){
  const pets=npV6Pets();
  if(!pets.length) return {id:'',name:npLang==='de'?'Kein Tier':'No pet',type:'',typeDe:'',age:'',ageDe:'',about:'',aboutDe:'',tags:[],tagsDe:[],photo:'../assets/noevapet-icon.png'};
  return pets.find(p=>p.id===npV6ActivePetId()) || pets[0] || starterPets[0];
}
function npV6PetPhoto(p){
  return p?.photo || '../assets/noevapet-icon.png';
}
function npV6PetMeta(p){
  const age=npLang==='de'?(p.ageDe||p.age||''):(p.age||'');
  const about=npLang==='de'?(p.aboutDe||p.about||''):(p.about||'');
  return [age,about].filter(Boolean).join(' · ');
}
function selectPetV6(id, destination='tool.html'){
  localStorage.setItem('npActivePetId',id);
  hydrateActivePetV6();
  refreshNavCartCountV6();
  if(destination) window.location.href=destination;
}
function hydrateActivePetV6(){
  const pets=npV6Pets();
  const hasPet=pets.length>0;
  const p=hasPet?npV6ActivePet():null;
  document.querySelectorAll('[data-active-pet-name]').forEach(el=>el.textContent=hasPet?(p.name||'Pet'):t('No pet','Kein Tier'));
  document.querySelectorAll('[data-active-pet-meta]').forEach(el=>el.textContent=hasPet?npV6PetMeta(p):'');
  document.querySelectorAll('[data-active-pet-type]').forEach(el=>el.textContent=hasPet?(npLang==='de'?(p.typeDe||p.type||''):(p.type||'')):'');
  document.querySelectorAll('[data-active-pet-photo]').forEach(el=>{
    el.src=hasPet?npV6PetPhoto(p):'../assets/noevapet-icon.png';
    el.alt=hasPet?(p.name||'Pet'):t('Add pet','Tier hinzufügen');
  });
  document.querySelectorAll('[data-active-pet-first]').forEach(el=>el.textContent=hasPet?(p.name||'Pet').charAt(0):'+');
  document.querySelectorAll('.v6-pet-switch [data-active-pet-name]').forEach(el=>{
    el.textContent=hasPet?(p.name||'Pet'):t('Add pet','Tier hinzufügen');
  });
  document.querySelectorAll('.v6-pet-switch').forEach(el=>{
    el.classList.toggle('is-empty',!hasPet);
    el.title=hasPet?t('Switch pet','Tier wechseln'):t('Add pet','Tier hinzufügen');
  });
  const orbit=document.getElementById('match6Orbit');
  if(orbit){
    const safe=(hasPet?npV6PetPhoto(p):'../assets/noevapet-icon.png').replace(/"/g,'%22');
    orbit.style.setProperty('--pet-photo-url',`url("${safe}")`);
  }
}

// ---------- pet-specific state ----------
function npV6RoutineKey(){return `npRoutine:${npV6ActivePetId()}`}
function npV6NeedsKey(){return `npNeeds:${npV6ActivePetId()}`}
function npV6PlanKey(){return `npPlan:${npV6ActivePetId()}`}

function getRoutineV6(){
  try{
    const x=JSON.parse(localStorage.getItem(npV6RoutineKey()));
    if(Array.isArray(x)) return x.map(item=>{
      const legacy=['../assets/product-food.svg','../assets/product-treats.svg','../assets/product-care.svg','../assets/care.svg','../assets/basket.svg'];
      return legacy.includes(item.img)?{...item,img:routineIcon(item.type)}:item;
    });
  }catch(e){}
  // Migrate the prior single-pet routine exactly once to whichever pet is active.
  if(!localStorage.getItem('npRoutineMigratedV6')){
    try{
      const legacy=JSON.parse(localStorage.getItem('npCurrentRoutine'));
      if(Array.isArray(legacy) && legacy.length){
        const migrated=legacy.map(x=>({...x,buyNow:x.buyNow!==false}));
        localStorage.setItem(npV6RoutineKey(),JSON.stringify(migrated));
        localStorage.setItem('npRoutineMigratedV6','1');
        return migrated;
      }
    }catch(e){}
    localStorage.setItem('npRoutineMigratedV6','1');
  }
  if(npV6ActivePetId()==='milo'){
    return [{id:'base-food',type:'food',name:'Vet Concept Low fat Intestinal',nameDe:'Vet Concept Low fat Intestinal',img:'../assets/v13-need-wet.svg',locked:true,buyNow:true}];
  }
  return [];
}
function saveRoutineV6(items){localStorage.setItem(npV6RoutineKey(),JSON.stringify(items))}
function getNeedsV6(){
  try{
    const x=JSON.parse(localStorage.getItem(npV6NeedsKey()));
    if(Array.isArray(x)){
      // V13 visual migration: keep the user's saved need, but refresh legacy icon paths.
      return x.map(item=>{
        const key=(item.id||'').replace(/^n-/,'');
        const visual=npV6NeedMap[key];
        return visual?{...item,img:visual.img}:item;
      });
    }
  }catch(e){}
  return [];
}
function saveNeedsV6(items){localStorage.setItem(npV6NeedsKey(),JSON.stringify(items))}
function getPlanV6(){
  try{const x=JSON.parse(localStorage.getItem(npV6PlanKey()));if(Array.isArray(x))return x}catch(e){}
  if(!localStorage.getItem('npPlanMigratedV6')){
    try{
      const legacy=JSON.parse(localStorage.getItem('npPlan'));
      if(Array.isArray(legacy) && legacy.length){
        localStorage.setItem(npV6PlanKey(),JSON.stringify(legacy));
        localStorage.setItem('npPlanMigratedV6','1');
        return legacy;
      }
    }catch(e){}
    localStorage.setItem('npPlanMigratedV6','1');
  }
  return [];
}
function savePlanV6(items){localStorage.setItem(npV6PlanKey(),JSON.stringify(items))}

// Override legacy plan helpers so results/compare also become pet-specific.
getPlan=function(){return getPlanV6()}
savePlan=function(items){savePlanV6(items)}

function refreshNavCartCountV6(){
  const routine=getRoutineV6().filter(x=>x.buyNow!==false);
  const plan=getPlanV6();
  const count=routine.length+plan.length;
  document.querySelectorAll('[data-nav-cart-count]').forEach(x=>x.textContent=count);
}
refreshNavCartCount=function(){refreshNavCartCountV6()}

// ---------- My Pets V6 ----------
let npV6PhotoData='';
function updatePetsPageEmptyStateV17(){
  const pets=npV6Pets();
  const empty=!pets.length;
  const body=document.body;
  if(!body?.classList.contains('pets-page')) return;
  body.classList.toggle('pets17-empty',empty);
  const title=document.getElementById('pets17Title');
  const lede=document.getElementById('pets17Lede');
  const eyebrow=document.getElementById('pets17Eyebrow');
  const saved=document.getElementById('pets17SavedBox');
  const add=document.getElementById('pets17AddBox');
  const addKicker=document.getElementById('pets17AddKicker');
  const addTitle=document.getElementById('pets17AddTitle');
  const reassure=document.getElementById('pets17Reassure');
  if(eyebrow) eyebrow.textContent=empty?t('Start with your pet','Dein Tier zuerst'):t('My pets','Meine Tiere');
  if(title) title.textContent=empty?t('Create your first pet profile. We will carry the context from there.','Lege dein erstes Tierprofil an. Den Kontext nimmt NoevaPet danach mit.'):t('Switch pets, and NoevaPet carries the context with you.','Tier wechseln, und NoevaPet nimmt den Kontext mit.');
  if(lede) lede.textContent=empty?t('A name, pet type and a few useful details are enough to begin. The profile then follows Pet Match, recommendations and your cart.','Name, Tierart und ein paar hilfreiche Details genügen für den Start. Danach begleitet das Profil Pet Match, Empfehlungen und Warenkorb.'):t('Name, photo and profile then follow into Pet Match, recommendations and your cart.','Name, Foto und Profil werden danach in Pet Match, Empfehlungen und Warenkorb verwendet.');
  if(saved) saved.hidden=empty;
  if(add) add.classList.toggle('pets17-first-profile',empty);
  if(addKicker) addKicker.textContent=empty?t('First profile','Erstes Profil'):t('Add pet','Tier hinzufügen');
  if(addTitle) addTitle.textContent=empty?t('Just the details that help later.','Nur das, was später wirklich hilft.'):t('Just the details that help later.','Nur das, was später hilft.');
  if(reassure) reassure.classList.toggle('pets17-reassure-empty',empty);
}
function renderPetsV6(){
  const grid=document.getElementById('pets6Cards');if(!grid)return;
  const active=npV6ActivePetId();
  grid.innerHTML='';
  npV6Pets().forEach(p=>{
    const card=document.createElement('div');card.className=`pets6-card ${p.id===active?'active':''}`;
    const visual=p.photo?`<img src="${p.photo}" alt="${p.name}">`:`<div class="placeholder">${(p.name||'?')[0]}</div>`;
    const tags=npLang==='de'?(p.tagsDe||p.tags||[]):(p.tags||[]);
    card.innerHTML=`${p.id===active?`<span class="pets6-active-badge">${t('Active','Aktiv')}</span>`:''}
      <div class="pets6-photo">${visual}</div>
      <div><h3>${p.name}</h3><p>${npV6PetMeta(p)}</p><div class="tags">${tags.slice(0,2).map(x=>`<span class="tag">${x}</span>`).join('')}</div>
      <div class="pets6-actions"><button class="pill soft" data-select-pet-v6="${p.id}">${p.id===active?t('Continue','Weiter'):t('Choose','Auswählen')}</button><button class="remove-link" data-remove-pet-v6="${p.id}">${t('Remove','Entfernen')}</button></div></div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll('[data-select-pet-v6]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    selectPetV6(b.dataset.selectPetV6,'tool.html');
  }));
  grid.querySelectorAll('[data-remove-pet-v6]').forEach(b=>b.addEventListener('click',e=>{
    e.stopPropagation();
    const id=b.dataset.removePetV6;
    const pets=npV6Pets().filter(p=>p.id!==id);
    localStorage.setItem('npPets',JSON.stringify(pets));
    if(localStorage.getItem('npActivePetId')===id){
      localStorage.setItem('npActivePetId',pets[0]?.id||'');
    }
    renderPetsV6();hydrateActivePetV6();refreshNavCartCountV6();
  }));
  updatePetsPageEmptyStateV17();
}
function initPetFormV6(){
  const form=document.getElementById('petForm6');
  const file=document.getElementById('petPhoto6');
  const preview=document.getElementById('petPhotoPreview6');
  if(file)file.addEventListener('change',e=>{
    const f=e.target.files?.[0];if(!f)return;
    const r=new FileReader();r.onload=ev=>{npV6PhotoData=ev.target.result; if(preview){preview.src=npV6PhotoData;preview.style.display='block'}};r.readAsDataURL(f);
  });
  if(form)form.addEventListener('submit',e=>{
    e.preventDefault();
    const d=new FormData(form);
    const tags=(d.get('traits')||'').toString().split(',').map(s=>s.trim()).filter(Boolean);
    const id='p'+Date.now();
    const pet={id,name:(d.get('name')||'').toString().trim(),type:d.get('type'),typeDe:d.get('type'),age:d.get('age'),ageDe:d.get('age'),about:d.get('notes'),aboutDe:d.get('notes'),tags,tagsDe:tags,photo:npV6PhotoData||''};
    const pets=npV6Pets();pets.push(pet);localStorage.setItem('npPets',JSON.stringify(pets));
    localStorage.setItem('npActivePetId',id);
    form.reset();npV6PhotoData='';if(preview){preview.removeAttribute('src');preview.style.display='none'}
    renderPetsV6();hydrateActivePetV6();refreshNavCartCountV6();
  });
}

// ---------- Pet Match V6 ----------
const npV6NeedMap={
 dry:{type:'food',img:'../assets/v17-need-dry.svg',en:'Dry food',de:'Trockenfutter'},
 wet:{type:'food',img:'../assets/v13-need-wet.svg',en:'Wet food',de:'Nassfutter'},
 treats:{type:'treats',img:'../assets/v13-need-snacks.svg',en:'Treats',de:'Snacks'},
 dental:{type:'dental',img:'../assets/v13-need-dental.svg',en:'Dental care',de:'Zahnpflege'},
 coat:{type:'care',img:'../assets/v13-need-coat.svg',en:'Coat care',de:'Fellpflege'},
 walk:{type:'other',img:'../assets/v13-need-walk.svg',en:'Walk',de:'Spaziergang'},
 play:{type:'other',img:'../assets/v13-need-play.svg',en:'Play',de:'Spielen'},
 training:{type:'other',img:'../assets/v13-need-training.svg',en:'Training',de:'Training'},
 vet:{type:'care',img:'../assets/v13-need-vet.svg',en:'Vet care',de:'Tierarzt / Pflege'}
};
let npV6CurrentNeed=null;
const npV6OrbitPositions=[
 {left:'18%',top:'17%'},{right:'15%',top:'17%'},{right:'4%',top:'46%'},{right:'18%',bottom:'9%'},
 {left:'18%',bottom:'9%'},{left:'4%',top:'47%'},{left:'41%',top:'1%'},{left:'42%',bottom:'0%'}
];
function renderMatchCurrentV6(){
  const host=document.getElementById('match6Current');if(!host)return;
  const items=getRoutineV6();
  host.innerHTML='';
  if(!items.length){
    host.innerHTML=`<div class="match6-current-item"><div></div><div><strong>${t('Nothing fixed yet','Noch nichts festgelegt')}</strong><span>${t('Tap a need below to add something.','Tippe unten auf einen Bereich.')}</span></div><div></div></div>`;
    return;
  }
  items.forEach(item=>{
    const row=document.createElement('div');row.className='match6-current-item';
    row.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div><strong>${routineItemLabelV6(item)}</strong><span>${routineTypeLabel(item.type)} · ${item.locked?'🔒 '+t('keep','behalten'):t('alternatives allowed','Alternativen möglich')}</span></div><button data-match-current-remove="${item.id}">×</button>`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-match-current-remove]').forEach(b=>b.addEventListener('click',()=>{
    saveRoutineV6(getRoutineV6().filter(x=>x.id!==b.dataset.matchCurrentRemove));
    renderMatchCurrentV6();renderMatchOrbitV6();refreshNavCartCountV6();
  }));
}
function routineItemLabelV6(item){return npLang==='de'?(item.nameDe||item.name):item.name}
function openNeedModalV6(id){
  npV6CurrentNeed=id;const map=npV6NeedMap[id];const modal=document.getElementById('v6NeedModal');if(!map||!modal)return;
  document.getElementById('v6NeedTitle').textContent=`${npV6ActivePet().name}: ${npLang==='de'?map.de:map.en}`;
  document.getElementById('v6NeedType').value=map.type;
  document.getElementById('v6NeedName').value='';
  document.getElementById('v6KeepExact').checked=true;
  document.getElementById('v6BuyNow').checked=true;
  setNeedModeV6('current');modal.classList.add('show');
  setTimeout(()=>document.getElementById('v6NeedName')?.focus(),50);
}
function closeNeedModalV6(){document.getElementById('v6NeedModal')?.classList.remove('show')}
function setNeedModeV6(mode){
  document.querySelectorAll('[data-v6-need-mode]').forEach(b=>b.classList.toggle('active',b.dataset.v6NeedMode===mode));
  const a=document.getElementById('v6CurrentPanel'),s=document.getElementById('v6SuggestPanel');
  if(a)a.style.display=mode==='current'?'block':'none';
  if(s)s.style.display=mode==='suggest'?'block':'none';
}
function addCurrentProductV6(){
  const name=(document.getElementById('v6NeedName')?.value||'').trim();if(!name)return;
  const type=document.getElementById('v6NeedType')?.value||'food';
  const locked=!!document.getElementById('v6KeepExact')?.checked;
  const buyNow=!!document.getElementById('v6BuyNow')?.checked;
  const item={id:'r'+Date.now(),type,name,nameDe:name,img:routineIcon(type),locked,buyNow};
  const items=getRoutineV6();items.push(item);saveRoutineV6(items);
  renderMatchCurrentV6();renderMatchOrbitV6();refreshNavCartCountV6();closeNeedModalV6();
}
function addSuggestedNeedV6(){
  const map=npV6NeedMap[npV6CurrentNeed];if(!map)return;
  const needs=getNeedsV6();
  const id='n-'+npV6CurrentNeed;
  if(!needs.find(x=>x.id===id)){
    needs.push({id,type:map.type,name:map.en,nameDe:map.de,img:map.img});
    saveNeedsV6(needs);
  }
  renderMatchOrbitV6();closeNeedModalV6();
}
function renderMatchOrbitV6(){
  const orbit=document.getElementById('match6Orbit');if(!orbit)return;
  hydrateActivePetV6();
  orbit.querySelectorAll('.match6-node').forEach(x=>x.remove());
  const items=[
    ...getRoutineV6().map(x=>({...x,source:'routine'})),
    ...getNeedsV6().map(x=>({...x,source:'need'}))
  ];
  items.slice(0,8).forEach((item,i)=>{
    const node=document.createElement('div');node.className='match6-node';Object.assign(node.style,npV6OrbitPositions[i]);
    node.title=routineItemLabelV6(item);
    node.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><button data-match-node-remove="${item.id}" data-source="${item.source}">×</button>${item.locked?'<span class="lock">🔒</span>':''}`;
    orbit.appendChild(node);
  });
  orbit.querySelectorAll('[data-match-node-remove]').forEach(b=>b.addEventListener('click',()=>{
    if(b.dataset.source==='routine')saveRoutineV6(getRoutineV6().filter(x=>x.id!==b.dataset.matchNodeRemove));
    else saveNeedsV6(getNeedsV6().filter(x=>x.id!==b.dataset.matchNodeRemove));
    renderMatchCurrentV6();renderMatchOrbitV6();refreshNavCartCountV6();
  }));
  const score=document.querySelector('[data-match6-score]');
  if(score)score.textContent=Math.min(97,84+Math.min(items.length,6)*2);
  const insight=document.getElementById('match6Insight');
  if(insight){
    const fixed=getRoutineV6().filter(x=>x.locked);
    insight.innerHTML=fixed.length
      ? `<strong>${t('Your usuals stay','Gewohnte Produkte bleiben')}</strong>${t(' NoevaPet keeps '+fixed.length+' exact product'+(fixed.length===1?'':'s')+' and only optimises around them.',' NoevaPet lässt '+fixed.length+' fest markierte Produkte unverändert und optimiert nur drumherum.')}`
      : `<strong>${t('Open for suggestions','Offen für Vorschläge')}</strong>${t(' Add an exact product whenever there is something you do not want NoevaPet to replace.',' Trage ein genaues Produkt ein, sobald NoevaPet etwas nicht ersetzen soll.')}`;
  }
}
function initPetMatchV6(){
  if(!document.getElementById('match6Needs'))return;
  document.querySelectorAll('.match6-need').forEach(b=>{
    b.addEventListener('click',()=>openNeedModalV6(b.dataset.need));
    b.setAttribute('draggable','true');
    b.addEventListener('dragstart',()=>window.__npV6DraggedNeed=b.dataset.need);
  });
  const orbit=document.getElementById('match6Orbit');
  orbit?.addEventListener('dragover',e=>e.preventDefault());
  orbit?.addEventListener('drop',e=>{
    e.preventDefault();
    if(window.__npV6DraggedNeed){
      npV6CurrentNeed=window.__npV6DraggedNeed;addSuggestedNeedV6();window.__npV6DraggedNeed=null;
    }
  });
  document.querySelectorAll('[data-v6-close]').forEach(b=>b.addEventListener('click',closeNeedModalV6));
  document.querySelectorAll('[data-v6-need-mode]').forEach(b=>b.addEventListener('click',()=>setNeedModeV6(b.dataset.v6NeedMode)));
  document.getElementById('v6SaveCurrent')?.addEventListener('click',addCurrentProductV6);
  document.getElementById('v6SaveSuggestion')?.addEventListener('click',addSuggestedNeedV6);
  document.getElementById('v6NeedModal')?.addEventListener('click',e=>{if(e.target.id==='v6NeedModal')closeNeedModalV6()});
  renderMatchCurrentV6();renderMatchOrbitV6();
}

// ---------- Cart + purchase V6 ----------
function npV6PriceFor(item,index){
  if(item.price!=null)return Number(item.price);
  const prices={food:34.90,supplement:18.20,treats:11.80,dental:8.90,care:12.40,other:14.50};
  return prices[item.type] || [18.20,11.80,12.40,9.90][index%4];
}
function getCartItemsV6(){
  const r=getRoutineV6().filter(x=>x.buyNow!==false).map((x,i)=>({...x,source:'routine',cartId:'routine:'+x.id,price:npV6PriceFor(x,i)}));
  const p=getPlanV6().map((x,i)=>({...x,source:'plan',cartId:'plan:'+x.id,type:x.type||'other',price:npV6PriceFor(x,i+r.length)}));
  return [...r,...p];
}
function removeCartItemV6(cartId){
  const [source,id]=cartId.split(':');
  if(source==='routine'){
    saveRoutineV6(getRoutineV6().map(x=>x.id===id?{...x,buyNow:false}:x));
  }else{
    savePlanV6(getPlanV6().filter(x=>x.id!==id));
  }
  renderCartV6();refreshNavCartCountV6();
  showToastV6(t('Removed from this cart. The pet profile is unchanged.','Aus diesem Warenkorb entfernt. Das Tierprofil bleibt unverändert.'));
}
function showToastV6(msg){
  const tbox=document.getElementById('v6Toast');if(!tbox)return;
  tbox.textContent=msg;tbox.classList.add('show');clearTimeout(window.__npV6ToastTimer);
  window.__npV6ToastTimer=setTimeout(()=>tbox.classList.remove('show'),2600);
}
function renderCartV6(){
  const host=document.getElementById('cart6List');if(!host)return;
  const items=getCartItemsV6();host.innerHTML='';
  let total=0;
  if(!items.length){
    host.innerHTML=`<div class="cart6-empty v13-cart-empty"><img src="../assets/v13-empty-cart.svg" alt=""><div><strong>${t('Nothing in this cart yet','Noch nichts im Warenkorb')}</strong><span>${t('Add an exact product in Pet Match or choose a recommendation.','Füge in Pet Match ein genaues Produkt hinzu oder wähle eine Empfehlung.')}</span><div style="margin-top:9px"><a class="pill primary" href="tool.html">Pet Match →</a></div></div></div>`;
  }else{
    items.forEach((item,i)=>{
      total+=item.price;
      const name=npLang==='de'?(item.nameDe||item.name):item.name;
      const sub=item.source==='routine'
       ? (item.locked?t('Usual product · do not replace','Gewohntes Produkt · nicht ersetzen'):t('Current product','Aktuelles Produkt'))
       : t('Added recommendation','Hinzugefügte Empfehlung');
      const row=document.createElement('div');row.className='cart6-line';row.draggable=true;row.dataset.cartId=item.cartId;
      row.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div><strong>${name}</strong><span>${sub}</span></div><b>€${item.price.toFixed(2)}</b>`;
      row.addEventListener('dragstart',()=>{
        window.__npV6CartDrag=item.cartId;row.classList.add('dragging');document.getElementById('cart6RemoveZone')?.classList.add('show');
      });
      row.addEventListener('dragend',()=>{
        row.classList.remove('dragging');setTimeout(()=>document.getElementById('cart6RemoveZone')?.classList.remove('show','over'),80);
      });
      host.appendChild(row);
    });
  }
  window.__npV6CartTotal=total;
  document.querySelectorAll('[data-cart6-count]').forEach(x=>x.textContent=items.length);
  document.querySelectorAll('[data-cart6-total]').forEach(x=>x.textContent=`€${total.toFixed(2)}`);
  updatePurchaseOptionV6(window.__npV6PurchaseMode||'balance');
}
let __npV6PurchaseMode='balance';
function updatePurchaseOptionV6(mode){
  __npV6PurchaseMode=mode;sessionStorage.setItem('npPurchaseModeV6',mode);
  document.querySelectorAll('[data-v6-buy-mode]').forEach(b=>b.classList.toggle('active',b.dataset.v6BuyMode===mode));
  const total=window.__npV6CartTotal||0;
  const values={
    save:{saving:Math.min(7.8,total*.12),retailers:2,deliveries:2},
    balance:{saving:Math.min(5.2,total*.08),retailers:2,deliveries:2},
    simple:{saving:Math.min(2.5,total*.04),retailers:1,deliveries:1}
  }[mode];
  const price=Math.max(0,total-values.saving);
  document.querySelectorAll('[data-v6-opt-price]').forEach(x=>x.textContent=`€${price.toFixed(2)}`);
  document.querySelectorAll('[data-v6-saving]').forEach(x=>x.textContent=t(`Save €${values.saving.toFixed(2)}`,`€${values.saving.toFixed(2).replace('.',',')} sparen`));
  document.querySelectorAll('[data-v6-deliveries]').forEach(x=>x.textContent=values.deliveries===1?t('1 delivery','1 Lieferung'):t(`${values.deliveries} deliveries`,`2 Lieferungen`));
  const title=document.getElementById('buy6WhyTitle'),copy=document.getElementById('buy6WhyCopy'),list=document.getElementById('buy6WhyList'),stats=document.getElementById('buy6Stats'),route=document.getElementById('buy6Route');
  const content={
    save:{
      title:t('Lowest total cost','Niedrigster Gesamtpreis'),
      copy:t('NoevaPet accepts a slightly less convenient split because it produces the lowest total price.','NoevaPet akzeptiert eine etwas weniger bequeme Aufteilung, weil sie den niedrigsten Gesamtpreis ergibt.'),
      bullets:[t('Your fixed products remain exactly the same.','Deine festgelegten Produkte bleiben exakt gleich.'),t('A second retailer is used only because the combined price is lower.','Ein zweiter Händler wird nur genutzt, weil der Gesamtpreis niedriger ist.'),t('Best when savings matter more than the fewest possible handoffs.','Ideal, wenn Sparen wichtiger ist als möglichst wenige Übergaben.')],
      stats:[[t('2 retailers','2 Händler'),t('lowest total','niedrigster Gesamtpreis')],[t('2 deliveries','2 Lieferungen'),t('Wed–Thu','Mi–Do')]]
    },
    balance:{
      title:t('Best balance of price + convenience','Beste Balance aus Preis + Einfachheit'),
      copy:t('You keep most of the savings without turning the purchase into a multi-shop exercise.','Du behältst den Großteil der Ersparnis, ohne den Kauf unnötig auf mehrere Shops zu verteilen.'),
      bullets:[t('Your fixed products remain exactly the same.','Deine festgelegten Produkte bleiben exakt gleich.'),t('Two retailers are still materially cheaper than one.','Zwei Händler sind noch spürbar günstiger als einer.'),t('Recommended because it keeps the process calm while still saving money.','Empfohlen, weil der Ablauf ruhig bleibt und trotzdem Geld spart.')],
      stats:[[t('2 retailers','2 Händler'),t('good value + easy flow','guter Wert + einfacher Ablauf')],[t('2 deliveries','2 Lieferungen'),t('one short handoff per shop','eine kurze Übergabe je Shop')]]
    },
    simple:{
      title:t('Simplest purchase route','Einfachster Kaufweg'),
      copy:t('NoevaPet keeps everything with one retailer, so there is only one handoff and one checkout.','NoevaPet bündelt alles bei einem Händler. Dadurch gibt es nur eine Übergabe und einen Checkout.'),
      bullets:[t('One retailer only.','Nur ein Händler.'),t('One checkout and one delivery route.','Ein Checkout und ein Lieferweg.'),t('Costs a little more, but removes the second handoff completely.','Kostet etwas mehr, entfernt dafür die zweite Übergabe vollständig.')],
      stats:[[t('1 retailer','1 Händler'),t('fewest steps','wenigste Schritte')],[t('1 delivery','1 Lieferung'),t('simplest route','einfachster Ablauf')]]
    }
  }[mode];
  if(title)title.textContent=content.title;if(copy)copy.textContent=content.copy;
  if(list)list.innerHTML=content.bullets.map(x=>`<div><b>✦</b><span>${x}</span></div>`).join('');
  if(stats)stats.innerHTML=content.stats.map(x=>`<div class="buy6-stat"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('');
  if(route){
    route.innerHTML=values.retailers===1
      ? `<div class="route6-row"><strong>${t('Retailer A · all items','Händler A · alle Produkte')}</strong><span>€${price.toFixed(2)}</span></div>`
      : `<div class="route6-row"><strong>${t('Retailer A · main basket','Händler A · Hauptwarenkorb')}</strong><span>€${(price*.76).toFixed(2)}</span></div><div class="route6-row"><strong>${t('Retailer B · specialist item','Händler B · Spezialprodukt')}</strong><span>€${(price*.24).toFixed(2)}</span></div>`;
  }
  renderCheckoutHubV6();
}
function showPurchaseStageV6(n){
  document.querySelectorAll('.purchase6-stage').forEach(s=>s.classList.toggle('active',Number(s.dataset.v6Stage)===n));
  document.querySelectorAll('.purchase6-step').forEach(s=>{
    const k=Number(s.dataset.v6Step);s.classList.toggle('active',k===n);s.classList.toggle('done',k<n);
  });
  if(n===4)renderCheckoutHubV6();
  window.scrollTo({top:0,behavior:'smooth'});
}
function initCartDragV6(){
  const zone=document.getElementById('cart6RemoveZone');if(!zone)return;
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('over')});
  zone.addEventListener('dragleave',()=>zone.classList.remove('over'));
  zone.addEventListener('drop',e=>{
    e.preventDefault();zone.classList.remove('over');
    if(window.__npV6CartDrag)removeCartItemV6(window.__npV6CartDrag);
    window.__npV6CartDrag=null;
  });
}
function retailerTargetsV6(){
  return __npV6PurchaseMode==='simple'?['A']:['A','B'];
}
function retailerUrlV6(id){
  const cfg=window.NOEVA_RUNTIME||{};
  return cfg?.retailers?.[id]?.url || null;
}
function openRetailerV6(id){
  const url=retailerUrlV6(id);
  if(url)window.open(url,'_blank','noopener');
  const key=`npCheckoutOpened:${npV6ActivePetId()}`;
  let opened=[];try{opened=JSON.parse(sessionStorage.getItem(key))||[]}catch(e){}
  if(!opened.includes(id))opened.push(id);
  sessionStorage.setItem(key,JSON.stringify(opened));
  renderCheckoutHubV6();
  if(!url)showToastV6(t(`Preview: Retailer ${id} is marked as opened. Production will open it in a separate tab.`,`Vorschau: Händler ${id} ist als geöffnet markiert. In Produktion öffnet er sich in einem separaten Tab.`));
}
function renderCheckoutHubV6(){
  const host=document.getElementById('checkout6Hub');if(!host)return;
  const targets=retailerTargetsV6();
  const key=`npCheckoutOpened:${npV6ActivePetId()}`;
  let opened=[];try{opened=JSON.parse(sessionStorage.getItem(key))||[]}catch(e){}
  opened=opened.filter(x=>targets.includes(x));
  host.innerHTML=targets.map(id=>{
    const done=opened.includes(id);
    return `<div class="checkout6-retailer ${done?'opened':''}">
      <div><strong>${t('Retailer','Händler')} ${id}</strong><span>${done?t('Opened in this checkout session','In dieser Checkout-Runde geöffnet'):t('Opens in a separate tab; NoevaPet stays open here','Öffnet sich in einem separaten Tab; NoevaPet bleibt hier offen')}</span></div>
      <button class="pill ${done?'soft':'primary'}" data-open-retailer="${id}">${done?t('Reopen ✓','Erneut öffnen ✓'):t('Open retailer','Händler öffnen')} →</button>
    </div>`;
  }).join('');
  host.querySelectorAll('[data-open-retailer]').forEach(b=>b.addEventListener('click',()=>openRetailerV6(b.dataset.openRetailer)));
  const count=opened.length,total=targets.length;
  const progress=document.getElementById('checkout6ProgressText');
  const bar=document.getElementById('checkout6ProgressBar');
  if(progress)progress.textContent=count===total
    ? t('All retailer tabs have been opened. Keep this NoevaPet tab until you finish the retailer checkouts.','Alle Händler-Tabs wurden geöffnet. Lass diesen NoevaPet-Tab offen, bis du die Händler-Checkouts abgeschlossen hast.')
    : t(`${count} of ${total} retailer${total===1?'':'s'} opened. NoevaPet keeps your place here.`,`${count} von ${total} Händler${total===1?'':'n'} geöffnet. NoevaPet hält deinen Platz hier.`);
  if(bar)bar.style.width=`${total?count/total*100:0}%`;
}
function initPurchaseV6(){
  if(!document.querySelector('.purchase6-stepper'))return;
  document.querySelectorAll('[data-v6-next]').forEach(b=>b.addEventListener('click',()=>showPurchaseStageV6(Number(b.dataset.v6Next))));
  document.querySelectorAll('.purchase6-step').forEach(s=>s.addEventListener('click',()=>showPurchaseStageV6(Number(s.dataset.v6Step))));
  document.querySelectorAll('[data-v6-buy-mode]').forEach(b=>b.addEventListener('click',()=>updatePurchaseOptionV6(b.dataset.v6BuyMode)));
  initCartDragV6();renderCartV6();
}

// Results and compare: active pet text
function patchActivePetCopyV6(){
  const p=npV6ActivePet();
  document.querySelectorAll('[data-pet-result-badge]').forEach(el=>el.textContent=t(`Best fit for ${p.name}`,`Passt am besten zu ${p.name}`));
}

// Wrap addPlanItem so cart counter immediately follows result selections.
const __npAddPlanItemV6=addPlanItem;
addPlanItem=function(btn){__npAddPlanItemV6(btn);refreshNavCartCountV6()}

document.addEventListener('DOMContentLoaded',()=>{
  hydrateActivePetV6();
  renderPetsV6();
  initPetFormV6();
  initPetMatchV6();
  initPurchaseV6();
  patchActivePetCopyV6();
  refreshNavCartCountV6();
});


// V6 state compatibility for older page components that still use legacy helpers.
getRoutine=function(){return getRoutineV6()}
saveRoutine=function(items){saveRoutineV6(items)}
lockedRoutine=function(){return getRoutineV6().filter(x=>x.locked)}
getV5Routine=function(){return getRoutineV6()}
saveV5Routine=function(items){saveRoutineV6(items)}
renderResultsKeepBannerV5=function(){
 const list=document.getElementById('keptProductsList');
 const banner=document.getElementById('keptProductsBanner');
 if(!list||!banner)return;
 const locked=getRoutineV6().filter(x=>x.locked);
 if(!locked.length){banner.style.display='none';return}
 banner.style.display='block';
 list.innerHTML=locked.map(x=>`<span class="kept-chip">${routineItemLabelV6(x)}</span>`).join('');
};


// ===========================================================
// NOEVAPET V7 — PROFILE OPEN / DRAG OUT / CHECKOUT CLOSURE
// ===========================================================

// ---------- My Pets: click the whole card to open the profile ----------
let __npProfile7Id=null;
function openProfile7(id){
  const p=npV6Pets().find(x=>x.id===id);if(!p)return;
  __npProfile7Id=id;
  const photo=document.getElementById('profile7Photo');
  if(photo)photo.innerHTML=p.photo?`<img src="${p.photo}" alt="${p.name}">`:`<div class="placeholder">${(p.name||'?')[0]}</div>`;
  const name=document.getElementById('profile7Name');if(name)name.textContent=p.name||'Pet';
  const meta=document.getElementById('profile7Meta');if(meta)meta.textContent=npV6PetMeta(p);
  const tags=npLang==='de'?(p.tagsDe||p.tags||[]):(p.tags||[]);
  const tagHost=document.getElementById('profile7Tags');if(tagHost)tagHost.innerHTML=tags.map(x=>`<span class="tag">${x}</span>`).join('');
  document.getElementById('profile7EditName').value=p.name||'';
  document.getElementById('profile7EditAge').value=npLang==='de'?(p.ageDe||p.age||''):(p.age||'');
  document.getElementById('profile7EditType').value=npLang==='de'?(p.typeDe||p.type||''):(p.type||'');
  document.getElementById('profile7EditTags').value=tags.join(', ');
  document.getElementById('profile7EditNotes').value=npLang==='de'?(p.aboutDe||p.about||''):(p.about||'');
  document.getElementById('profile7Modal')?.classList.add('show');
}
function closeProfile7(){document.getElementById('profile7Modal')?.classList.remove('show')}
function saveProfile7(){
  const pets=npV6Pets();
  const i=pets.findIndex(x=>x.id===__npProfile7Id);if(i<0)return;
  const tags=(document.getElementById('profile7EditTags')?.value||'').split(',').map(s=>s.trim()).filter(Boolean);
  const name=(document.getElementById('profile7EditName')?.value||pets[i].name).trim();
  const age=(document.getElementById('profile7EditAge')?.value||'').trim();
  const type=(document.getElementById('profile7EditType')?.value||'').trim();
  const notes=(document.getElementById('profile7EditNotes')?.value||'').trim();
  pets[i]={...pets[i],name,age,ageDe:age,type,typeDe:type,about:notes,aboutDe:notes,tags,tagsDe:tags};
  localStorage.setItem('npPets',JSON.stringify(pets));
  renderPetsV6();hydrateActivePetV6();closeProfile7();
}
function initProfile7(){
  const grid=document.getElementById('pets6Cards');if(grid){
    grid.addEventListener('click',e=>{
      if(e.target.closest('button,a'))return;
      const card=e.target.closest('.pets6-card');if(!card)return;
      const index=[...grid.children].indexOf(card);
      const pet=npV6Pets()[index];if(pet)openProfile7(pet.id);
    });
  }
  document.querySelectorAll('[data-profile7-close]').forEach(b=>b.addEventListener('click',closeProfile7));
  document.getElementById('profile7Modal')?.addEventListener('click',e=>{if(e.target.id==='profile7Modal')closeProfile7()});
  document.getElementById('profile7Save')?.addEventListener('click',saveProfile7);
  document.getElementById('profile7Continue')?.addEventListener('click',()=>{
    if(__npProfile7Id)selectPetV6(__npProfile7Id,'tool.html');
  });
}

// ---------- Pet Match: dragging a need must open the SAME dialog as clicking ----------
function initPetMatchDragFixV7(){
  const needs=document.getElementById('match6Needs');
  const orbit=document.getElementById('match6Orbit');
  const trash=document.getElementById('match7Trash');
  if(!needs||!orbit)return;

  // Capture phase overrides the older direct-add drop handler.
  orbit.addEventListener('drop',e=>{
    if(window.__npV6DraggedNeed){
      e.preventDefault();e.stopImmediatePropagation();
      const id=window.__npV6DraggedNeed;window.__npV6DraggedNeed=null;
      openNeedModalV6(id);
    }
  },true);

  // Existing routine/need nodes can be dragged OUT into the trash zone.
  const makeNodesDraggable=()=>{
    orbit.querySelectorAll('.match6-node').forEach(node=>{
      if(node.dataset.v7DragReady)return;
      node.dataset.v7DragReady='1';node.draggable=true;
      const btn=node.querySelector('[data-match-node-remove]');
      const id=btn?.dataset.matchNodeRemove;
      const source=btn?.dataset.source;
      node.addEventListener('dragstart',e=>{
        if(!id)return;
        window.__npV7OrbitDrag={id,source};node.classList.add('dragging');trash?.classList.add('show');
        e.dataTransfer.effectAllowed='move';
      });
      node.addEventListener('dragend',()=>{node.classList.remove('dragging');setTimeout(()=>trash?.classList.remove('show','over'),80)});
    });
  };
  const observer=new MutationObserver(makeNodesDraggable);observer.observe(orbit,{childList:true,subtree:true});makeNodesDraggable();

  if(trash){
    trash.addEventListener('dragover',e=>{e.preventDefault();trash.classList.add('over')});
    trash.addEventListener('dragleave',()=>trash.classList.remove('over'));
    trash.addEventListener('drop',e=>{
      e.preventDefault();e.stopPropagation();trash.classList.remove('over');
      const item=window.__npV7OrbitDrag;if(!item)return;
      if(item.source==='routine')saveRoutineV6(getRoutineV6().filter(x=>x.id!==item.id));
      else if(item.source==='plan')savePlanV6(getPlanV6().filter(x=>x.id!==item.id));
      else saveNeedsV6(getNeedsV6().filter(x=>x.id!==item.id));
      window.__npV7OrbitDrag=null;
      renderMatchCurrentV6();renderMatchOrbitV6();refreshNavCartCountV6();
      showToastV6(t('Removed from the routine.','Aus dem Alltag entfernt.'));
    });
  }
}

// ---------- Cart drag fix: always-live drop zone + inline fallback ----------
const __npRenderCartV7Base=renderCartV6;
renderCartV6=function(){
  __npRenderCartV7Base();
  const host=document.getElementById('cart6List');if(!host)return;
  host.querySelectorAll('.cart6-line').forEach(row=>{
    if(row.querySelector('.cart6-inline-remove'))return;
    const b=document.createElement('button');b.className='cart6-inline-remove';b.type='button';b.textContent='×';
    b.title=t('Remove from this shopping trip','Aus diesem Einkauf entfernen');
    b.addEventListener('click',()=>removeCartItemV6(row.dataset.cartId));
    row.appendChild(b);
  });
};

// ---------- Retailer hub: explicit cart/deeplink mode and a real closure ----------
function retailerModeV7(id){
  const cfg=window.NOEVA_RUNTIME||{};
  return cfg?.retailers?.[id]?.mode || 'prefilled_cart';
}
function retailerButtonLabelV7(id,done){
  const mode=retailerModeV7(id);
  if(done)return t('Reopen ✓','Erneut öffnen ✓');
  return mode==='product_deeplink'
    ? t('Open exact products','Exakte Produkte öffnen')
    : t('Open retailer cart','Händler-Warenkorb öffnen');
}
function renderCheckoutHubV7(){
  const host=document.getElementById('checkout6Hub');if(!host)return;
  const targets=retailerTargetsV6();
  const key=`npCheckoutOpened:${npV6ActivePetId()}`;
  let opened=[];try{opened=JSON.parse(sessionStorage.getItem(key))||[]}catch(e){}
  opened=opened.filter(x=>targets.includes(x));
  host.innerHTML=targets.map(id=>{
    const done=opened.includes(id),mode=retailerModeV7(id);
    const modeLabel=mode==='product_deeplink'?t('Exact product handoff','Übergabe zu exakten Produkten'):t('Prepared retailer cart','Vorbereiteter Händler-Warenkorb');
    return `<div class="checkout6-retailer ${done?'opened':''}">
      <div><strong>${t('Retailer','Händler')} ${id}</strong><span>${done?t('Opened in this checkout session','In dieser Checkout-Runde geöffnet'):t('Opens in a separate tab; NoevaPet stays open here','Öffnet in einem separaten Tab; NoevaPet bleibt hier offen')}</span><div class="checkout7-retailer-mode">${modeLabel}</div></div>
      <button class="pill ${done?'soft':'primary'}" data-open-retailer="${id}">${retailerButtonLabelV7(id,done)} →</button>
    </div>`;
  }).join('');
  host.querySelectorAll('[data-open-retailer]').forEach(b=>b.addEventListener('click',()=>openRetailerV6(b.dataset.openRetailer)));
  const count=opened.length,total=targets.length;
  const progress=document.getElementById('checkout6ProgressText');
  const bar=document.getElementById('checkout6ProgressBar');
  const confirm=document.getElementById('checkout7Confirm');
  if(progress)progress.textContent=count===total
    ? t('All required retailer carts have been opened. Finish them in their tabs, then close the shopping session here.','Alle benötigten Händler-Warenkörbe wurden geöffnet. Schließe sie in den jeweiligen Tabs ab und beende danach den Einkauf hier.')
    : t(`${count} of ${total} retailer cart${total===1?'':'s'} opened. NoevaPet keeps your place here.`,`${count} von ${total} Händler-Warenkörben geöffnet. NoevaPet hält deinen Platz hier.`);
  if(bar)bar.style.width=`${total?count/total*100:0}%`;
  if(confirm)confirm.classList.toggle('show',count===total);
}
renderCheckoutHubV6=renderCheckoutHubV7;

function completeCheckoutV7(){
  const snapshot=getCartItemsV6();
  const record={
    confirmed_at:new Date().toISOString(),
    pet_id:npV6ActivePetId(),
    items:snapshot.map(x=>({name:routineItemLabelV6(x),price:x.price,source:x.source})),
    mode:__npV6PurchaseMode
  };
  localStorage.setItem(`npLastPurchase:${npV6ActivePetId()}`,JSON.stringify(record));

  // Close this shopping session, while preserving the saved routine itself.
  saveRoutineV6(getRoutineV6().map(x=>({...x,buyNow:false})));
  savePlanV6([]);
  refreshNavCartCountV6();

  document.querySelector('.checkout6')?.setAttribute('style','display:none');
  const done=document.getElementById('checkout7Done');if(done)done.classList.add('show');
}
function initCheckoutClosureV7(){
  document.getElementById('checkout7Complete')?.addEventListener('click',completeCheckoutV7);
  // Ensure V7 retailer renderer is used whenever stage 4 appears.
  document.querySelectorAll('[data-v6-next="4"]').forEach(b=>b.addEventListener('click',()=>setTimeout(renderCheckoutHubV7,30)));
}

// Ensure new renderers/listeners are ready after older V6 initialization.
document.addEventListener('DOMContentLoaded',()=>{
  initProfile7();
  initPetMatchDragFixV7();
  initCheckoutClosureV7();
  setTimeout(()=>{renderCartV6();renderCheckoutHubV7();},60);
});


// ===========================================================
// NOEVAPET V8 — DYNAMIC HERO + WIDER MATCH + SEQUENTIAL RETAILER CHECKOUT
// ===========================================================

// Normalize active-pet metadata so numeric ages render naturally.
npV6PetMeta=function(p){
  if(!p)return'';
  let age=npLang==='de'?(p.ageDe||p.age||''):(p.age||'');
  const raw=(age||'').toString().trim();
  if(/^\d+$/.test(raw)) age=npLang==='de'?`${raw} Jahre`:`${raw} years`;
  let type=npLang==='de'?(p.typeDe||p.type||''):(p.type||'');
  const typeMapEn={Hund:'Dog',Katze:'Cat',Kleintier:'Small pet',Vogel:'Bird',Sonstiges:'Other'};
  const typeMapDe={Dog:'Hund',Cat:'Katze','Small pet':'Kleintier',Bird:'Vogel',Other:'Sonstiges'};
  if(npLang==='en'&&typeMapEn[type])type=typeMapEn[type];
  if(npLang==='de'&&typeMapDe[type])type=typeMapDe[type];
  const about=npLang==='de'?(p.aboutDe||p.about||''):(p.about||'');
  const pieces=[age,type];
  if(about&&about.length<48)pieces.push(about);
  return pieces.filter(Boolean).join(' · ');
};

function heroBasketTitleV8(p){
  if(!p)return t('Your basket','Dein Warenkorb');
  return npLang==='de'?`Warenkorb für ${p.name}`:`${p.name}’s basket`;
}
function renderHeroBasketV8(){
  const lines=document.getElementById('hero8BasketLines');if(!lines)return;
  const basket=lines.closest('.hero6-basket');
  const pets=npV6Pets();
  if(!pets.length){
    if(basket)basket.hidden=true;
    return;
  }
  if(basket)basket.hidden=false;
  const p=npV6ActivePet();
  const title=document.getElementById('hero8BasketTitle');
  const footer=document.getElementById('hero8BasketFooter');
  const cta=document.getElementById('hero8BasketCta');
  if(title)title.textContent=heroBasketTitleV8(p);
  document.querySelectorAll('[data-active-pet-meta]').forEach(el=>el.textContent=npV6PetMeta(p));

  const items=getCartItemsV6();
  lines.innerHTML='';
  if(!items.length){
    lines.innerHTML=`<div class="hero8-empty"><strong>${t('Nothing in the cart yet','Noch nichts im Warenkorb')}</strong><span>${t('Start in Pet Match and add only what matters for this shopping trip.','Starte in Pet Match und füge nur hinzu, was für diesen Einkauf relevant ist.')}</span></div>`;
    if(footer)footer.textContent=t('NoevaPet builds the buying route after you add something.','NoevaPet baut den Kaufweg, sobald du etwas hinzufügst.');
    if(cta){cta.href='tool.html';cta.textContent=`Pet Match →`;}
    return;
  }
  items.slice(0,3).forEach(item=>{
    const name=npLang==='de'?(item.nameDe||item.name):item.name;
    const sub=item.source==='routine'
      ? (item.locked?t('kept as usual','bleibt wie gewohnt'):t('current product','aktuelles Produkt'))
      : t('selected recommendation','gewählte Empfehlung');
    const div=document.createElement('div');div.className='hero6-line';
    div.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div><strong>${name}</strong><span>${sub}</span><div class="hero8-item-price">€${Number(item.price||0).toFixed(2)}</div></div>`;
    lines.appendChild(div);
  });
  if(items.length>3){
    const more=document.createElement('div');more.className='hero6-line';
    more.innerHTML=`<div style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#EAF4EF;color:var(--teal-dark);font-weight:900">+${items.length-3}</div><div><strong>${t('More in the cart','Weitere im Warenkorb')}</strong><span>${t('Open the cart to review','Im Warenkorb prüfen')}</span></div>`;
    lines.appendChild(more);
  }
  if(footer)footer.textContent=t(`${items.length} item${items.length===1?'':'s'} ready for the buying plan.`,`${items.length} Produkt${items.length===1?'':'e'} bereit für den Kaufplan.`);
  if(cta){cta.href='basket.html';cta.textContent=`${t('View cart','Warenkorb ansehen')} →`;}
}

// ---------- Sequential retailer checkout ----------
function openedRetailersV8(){
  const key=`npCheckoutOpened:${npV6ActivePetId()}`;
  try{return JSON.parse(sessionStorage.getItem(key))||[]}catch(e){return[]}
}
function saveOpenedRetailersV8(opened){
  const key=`npCheckoutOpened:${npV6ActivePetId()}`;
  sessionStorage.setItem(key,JSON.stringify([...new Set(opened)]));
}
function nextRetailerV8(){
  const targets=retailerTargetsV6();
  const opened=openedRetailersV8();
  return targets.find(id=>!opened.includes(id))||null;
}
function openRetailerV8(id){
  const url=retailerUrlV6(id);
  let openedOk=true;
  if(url){
    const w=window.open(url,'_blank');
    if(!w){
      openedOk=false;
      showToastV6(t('Your browser blocked the new tab. Allow pop-ups for NoevaPet and try again.','Dein Browser hat den neuen Tab blockiert. Erlaube Pop-ups für NoevaPet und versuche es erneut.'));
    }else{
      try{w.opener=null}catch(e){}
    }
  }else{
    showToastV6(t(`Preview: Retailer ${id} would now open in a new tab.`,`Vorschau: Händler ${id} würde jetzt in einem neuen Tab geöffnet.`));
  }
  if(!openedOk)return;
  const opened=openedRetailersV8();
  if(!opened.includes(id))opened.push(id);
  saveOpenedRetailersV8(opened);
  renderCheckoutHubV8();
}
function renderCheckoutHubV8(){
  const host=document.getElementById('checkout6Hub');if(!host)return;
  const targets=retailerTargetsV6();
  const opened=openedRetailersV8().filter(x=>targets.includes(x));
  const modeLabel=id=>retailerModeV7(id)==='product_deeplink'
    ? t('Exact products','Exakte Produkte')
    : t('Prepared cart','Vorbereiteter Warenkorb');

  host.innerHTML=targets.map(id=>{
    const done=opened.includes(id);
    return `<div class="checkout8-retailer ${done?'opened':''}">
      <div class="row"><div><strong>${t('Retailer','Händler')} ${id}</strong><span>${modeLabel(id)}</span></div><span class="checkout8-status">${done?t('Opened ✓','Geöffnet ✓'):t('Ready','Bereit')}</span></div>
      ${done?`<button class="checkout8-reopen" data-v8-reopen="${id}">${t('Open again','Erneut öffnen')} ↗</button>`:''}
    </div>`;
  }).join('');
  host.querySelectorAll('[data-v8-reopen]').forEach(b=>b.addEventListener('click',()=>openRetailerV8(b.dataset.v8Reopen)));

  const next=targets.find(id=>!opened.includes(id))||null;
  const nextWrap=document.getElementById('checkout8NextWrap');
  const nextBtn=document.getElementById('checkout8NextRetailer');
  const nextHint=document.getElementById('checkout8NextHint');
  const confirm=document.getElementById('checkout7Confirm');
  const progress=document.getElementById('checkout6ProgressText');
  const bar=document.getElementById('checkout6ProgressBar');

  if(next){
    if(nextWrap)nextWrap.style.display='flex';
    if(nextBtn){
      nextBtn.textContent=opened.length===0
        ? t(`Start checkout — open Retailer ${next} ↗`,`Checkout starten — Händler ${next} öffnen ↗`)
        : t(`Next — open Retailer ${next} ↗`,`Weiter — Händler ${next} öffnen ↗`);
      nextBtn.onclick=()=>openRetailerV8(next);
    }
    if(nextHint)nextHint.textContent=t('Opens in a new tab. NoevaPet stays open here.','Öffnet in einem neuen Tab. NoevaPet bleibt hier offen.');
    if(confirm)confirm.classList.remove('show');
  }else{
    if(nextWrap)nextWrap.style.display='none';
    if(confirm)confirm.classList.add('show');
  }

  const count=opened.length,total=targets.length;
  if(progress){
    progress.textContent=count===0
      ? t(`${total} retailer cart${total===1?'':'s'} ready. Nothing has opened yet.`,`${total} Händler-Warenkorb${total===1?'':'-Warenkörbe'} bereit. Noch wurde nichts geöffnet.`)
      : count===total
        ? t('All retailer carts have been opened. Complete payment in those tabs, then confirm here.','Alle Händler-Warenkörbe wurden geöffnet. Schließe die Zahlungen dort ab und bestätige danach hier.')
        : t(`${count} of ${total} opened. Return here when you are ready for the next retailer.`,`${count} von ${total} geöffnet. Kehre hierher zurück, wenn du für den nächsten Händler bereit bist.`);
  }
  if(bar)bar.style.width=`${total?count/total*100:0}%`;
}
renderCheckoutHubV6=renderCheckoutHubV8;
renderCheckoutHubV7=renderCheckoutHubV8;

// Collapse the large cart intro once the retailer handoff begins.
const __npShowPurchaseStageV8=showPurchaseStageV6;
showPurchaseStageV6=function(n){
  __npShowPurchaseStageV8(n);
  document.body.classList.toggle('checkout-stage8',n===4);
  if(n===4){
    renderCheckoutHubV8();
    hydrateActivePetV6();
  }
};

// Final close: preserve routine, clear only this purchase, and reset retailer session.
completeCheckoutV7=function(){
  const snapshot=getCartItemsV6();
  const record={
    confirmed_at:new Date().toISOString(),
    pet_id:npV6ActivePetId(),
    items:snapshot.map(x=>({name:routineItemLabelV6(x),price:x.price,source:x.source})),
    mode:__npV6PurchaseMode
  };
  localStorage.setItem(`npLastPurchase:${npV6ActivePetId()}`,JSON.stringify(record));
  saveRoutineV6(getRoutineV6().map(x=>({...x,buyNow:false})));
  savePlanV6([]);
  sessionStorage.removeItem(`npCheckoutOpened:${npV6ActivePetId()}`);
  refreshNavCartCountV6();

  document.getElementById('checkout8Shell')?.setAttribute('style','display:none');
  document.getElementById('checkout7Done')?.classList.add('show');
  document.body.classList.add('checkout-done8');
};

// The existing closure initializer resolves this overridden function at DOM ready.
function initCheckoutV8(){
  const confirm=document.getElementById('checkout7Complete');
  if(confirm){
    // Clone removes any earlier listener that may have been bound by V7.
    const fresh=confirm.cloneNode(true);
    confirm.replaceWith(fresh);
    fresh.addEventListener('click',completeCheckoutV7);
  }
  window.addEventListener('focus',()=>{
    if(document.querySelector('.checkout8-stage.active'))renderCheckoutHubV8();
  });
  renderCheckoutHubV8();
}

// Keep cart eyebrow and hero text grammatically clean after a pet switch.
function renderActivePetTitlesV8(){
  const p=npV6ActivePet();
  const eyebrow=document.getElementById('cart8Eyebrow');
  if(eyebrow)eyebrow.textContent=npLang==='de'?`Warenkorb für ${p.name}`:`Cart for ${p.name}`;
  renderHeroBasketV8();
}

document.addEventListener('DOMContentLoaded',()=>{
  renderActivePetTitlesV8();
  initCheckoutV8();
});


// ===========================================================
// NOEVAPET V9 — COMPARE CHOICE REALLY ADDS + PLAN VISIBLE IN PET MATCH
// ===========================================================

// All recommendation buttons now write complete product data into the active pet's plan.
addPlanItem=function(btn){
  const items=getPlanV6();
  const id=btn.dataset.id || ('i'+Date.now());
  const next={
    id,
    name:btn.dataset.name||t('Selected recommendation','Gewählte Empfehlung'),
    nameDe:btn.dataset.nameDe||btn.dataset.name||'Gewählte Empfehlung',
    subtitle:btn.dataset.subtitle||t('Recommendation','Empfehlung'),
    subtitleDe:btn.dataset.subtitleDe||btn.dataset.subtitle||'Empfehlung',
    img:btn.dataset.img||'../assets/product-food.svg',
    zone:btn.dataset.zone||'zone-now',
    type:btn.dataset.type||'other',
    price:Number(btn.dataset.price||0) || undefined
  };
  const ix=items.findIndex(x=>x.id===id);
  if(ix>=0)items[ix]={...items[ix],...next}; else items.push(next);
  savePlanV6(items);
  if(btn){
    btn.textContent=t('Added ✓','Hinzugefügt ✓');
    btn.classList.add('primary');
  }
  renderPlan();
  refreshNavCartCountV6();
  renderMatchSelectedV9();
  renderMatchOrbitV6();
  renderHeroBasketV8();
};

const npCompare9Ids=['foodA','foodB','foodC'];
let npCompare9Choice=null;

function compare9Data(btn){
  return {
    id:btn.dataset.id,
    name:btn.dataset.name,
    nameDe:btn.dataset.nameDe||btn.dataset.name,
    subtitle:btn.dataset.subtitle,
    subtitleDe:btn.dataset.subtitleDe||btn.dataset.subtitle,
    img:btn.dataset.img,
    zone:'zone-now',
    type:btn.dataset.type||'food',
    price:Number(btn.dataset.price||0)
  };
}
function compare9Reason(id){
  const map={
    foodA:t('Best balance of fit and overall value.','Beste Balance aus Passung und Gesamtwert.'),
    foodB:t('Lower price while keeping a sensible fit.','Niedrigerer Preis bei weiterhin sinnvoller Passung.'),
    foodC:t('Premium choice when quality matters more than price.','Premium-Auswahl, wenn Qualität wichtiger ist als der Preis.')
  };
  return map[id]||'';
}
function saveCompareChoice9(choice){
  let items=getPlanV6().filter(x=>!npCompare9Ids.includes(x.id));
  items.push(choice);
  savePlanV6(items);
  refreshNavCartCountV6();
  renderMatchSelectedV9();
  renderMatchOrbitV6();
  renderHeroBasketV8();
}
function selectCompare9(btn, addNow=true){
  document.querySelectorAll('[data-compare9-select]').forEach(x=>x.classList.remove('selected'));
  btn.classList.add('selected');
  npCompare9Choice=compare9Data(btn);
  const nm=npLang==='de'?(npCompare9Choice.nameDe||npCompare9Choice.name):npCompare9Choice.name;
  const choiceName=document.getElementById('compare9ChoiceName');
  const choiceReason=document.getElementById('compare9ChoiceReason');
  if(choiceName)choiceName.textContent=nm;
  if(choiceReason)choiceReason.textContent=compare9Reason(npCompare9Choice.id);
  const add=document.getElementById('compare9Add');
  if(add)add.innerHTML=`${t('Add to','In den Warenkorb für')} <span data-active-pet-name>${npV6ActivePet().name}</span>${npLang==='de'?' legen':'’s cart'} →`;
  if(addNow){
    saveCompareChoice9(npCompare9Choice);
    const feedback=document.getElementById('compare9Feedback');
    if(feedback){
      feedback.innerHTML=`<strong>${nm} ${t('is now in','liegt jetzt im Warenkorb für')} ${npV6ActivePet().name}${npLang==='de'?'.':'’s cart.'}</strong> ${t('Choose another product if you want to replace this comparison choice.','Wähle einfach ein anderes Produkt, wenn du diese Vergleichsauswahl ersetzen möchtest.')}`;
      feedback.classList.add('show');
    }
    if(add){
      add.textContent=t('Added to cart ✓','Im Warenkorb ✓');
      add.classList.add('primary');
    }
  }
}
function initCompare9(){
  const buttons=[...document.querySelectorAll('[data-compare9-select]')];
  if(!buttons.length)return;
  // Show the recommended first option as the visual default, but don't add until the user chooses.
  selectCompare9(buttons[0],false);
  buttons.forEach(b=>b.addEventListener('click',()=>selectCompare9(b,true)));
  document.getElementById('compare9Add')?.addEventListener('click',()=>{
    if(npCompare9Choice)selectCompare9(document.querySelector(`[data-compare9-select][data-id="${npCompare9Choice.id}"]`),true);
  });
}

// Selected recommendations are distinct from products the pet already uses.
function renderMatchSelectedV9(){
  const host=document.getElementById('match9Selected');
  const wrap=document.getElementById('match9SelectedWrap');
  if(!host||!wrap)return;
  const items=getPlanV6();
  host.innerHTML='';
  if(!items.length){
    wrap.style.display='none';
    return;
  }
  wrap.style.display='block';
  items.forEach(item=>{
    const nm=npLang==='de'?(item.nameDe||item.name):item.name;
    const row=document.createElement('div');row.className='match9-selected-item';
    row.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div><strong>${nm}</strong><span>${t('Selected recommendation · this shopping trip','Gewählte Empfehlung · dieser Einkauf')}</span></div><button data-match9-remove="${item.id}">×</button>`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-match9-remove]').forEach(b=>b.addEventListener('click',()=>{
    savePlanV6(getPlanV6().filter(x=>x.id!==b.dataset.match9Remove));
    renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();
  }));
}

// Replace the Pet Match orbit renderer so saved routine, open needs and chosen recommendations
// all remain visually synchronized.
renderMatchOrbitV6=function(){
  const orbit=document.getElementById('match6Orbit');if(!orbit)return;
  hydrateActivePetV6();
  orbit.querySelectorAll('.match6-node').forEach(x=>x.remove());
  const items=[
    ...getRoutineV6().map(x=>({...x,source:'routine'})),
    ...getPlanV6().map(x=>({...x,source:'plan',locked:false})),
    ...getNeedsV6().map(x=>({...x,source:'need'}))
  ];
  items.slice(0,8).forEach((item,i)=>{
    const node=document.createElement('div');node.className='match6-node';Object.assign(node.style,npV6OrbitPositions[i]);
    node.title=routineItemLabelV6(item);
    node.dataset.source=item.source;
    node.dataset.itemId=item.id;
    node.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><button data-match-node-remove="${item.id}" data-source="${item.source}">×</button>${item.locked?'<span class="lock">🔒</span>':item.source==='plan'?'<span class="lock" style="background:var(--coral)">✓</span>':''}`;
    orbit.appendChild(node);
  });
  orbit.querySelectorAll('[data-match-node-remove]').forEach(b=>b.addEventListener('click',()=>{
    const source=b.dataset.source,id=b.dataset.matchNodeRemove;
    if(source==='routine')saveRoutineV6(getRoutineV6().filter(x=>x.id!==id));
    else if(source==='plan')savePlanV6(getPlanV6().filter(x=>x.id!==id));
    else saveNeedsV6(getNeedsV6().filter(x=>x.id!==id));
    renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();
  }));
  const score=document.querySelector('[data-match6-score]');
  if(score)score.textContent=Math.min(97,84+Math.min(items.length,6)*2);
  const insight=document.getElementById('match6Insight');
  if(insight){
    const fixed=getRoutineV6().filter(x=>x.locked);
    const chosen=getPlanV6();
    if(chosen.length){
      insight.innerHTML=`<strong>${t('Recommendation selected','Empfehlung gewählt')}</strong>${t(` ${chosen.length} recommendation${chosen.length===1?' is':'s are'} in this shopping trip and will also appear in the cart.`,` ${chosen.length} Empfehlung${chosen.length===1?' ist':'en sind'} in diesem Einkauf gewählt und erscheint ebenfalls im Warenkorb.`)}`;
    }else if(fixed.length){
      insight.innerHTML=`<strong>${t('Your usuals stay','Gewohnte Produkte bleiben')}</strong>${t(' NoevaPet keeps the products you locked and only optimises around them.',' NoevaPet lässt deine fest markierten Produkte unverändert und optimiert nur drumherum.')}`;
    }else{
      insight.innerHTML=`<strong>${t('Open for suggestions','Offen für Vorschläge')}</strong>${t(' Add an exact product whenever there is something you do not want NoevaPet to replace.',' Trage ein genaues Produkt ein, sobald NoevaPet etwas nicht ersetzen soll.')}`;
    }
  }
};

// Refresh comparison/cart continuity after all older initialization has run.
document.addEventListener('DOMContentLoaded',()=>{
  initCompare9();
  renderMatchSelectedV9();
  renderMatchOrbitV6();
  renderHeroBasketV8();
});

// ===========================================================
// NOEVAPET V18 — FINAL UX / JOURNEY CONGRUENCY PASS
// ===========================================================

// V18 starts new visitors cleanly instead of seeding demo pets.
npV6Pets=function(){
  try{
    const raw=localStorage.getItem('npPets');
    if(raw!==null){
      const x=JSON.parse(raw);
      if(Array.isArray(x)){
        // Remove only the untouched V17 demo seed, never a real user-created profile.
        if(!localStorage.getItem('npV18SeedMigration') && x.length===2 && x[0]?.id==='milo' && x[1]?.id==='luna'){
          const looksUntouched=(x[0]?.photo||'').includes('owner-laptop.png') && !localStorage.getItem('npPlanMigratedV6');
          localStorage.setItem('npV18SeedMigration','1');
          if(looksUntouched){localStorage.setItem('npPets','[]');localStorage.removeItem('npActivePetId');return []}
        }
        localStorage.setItem('npV18SeedMigration','1');
        return x;
      }
    }
  }catch(e){}
  localStorage.setItem('npPets','[]');
  localStorage.setItem('npV18SeedMigration','1');
  return [];
};

// Distinct, brand-neutral product packshots replace the hard-to-scan icon family.
Object.assign(npV6NeedMap,{
  dry:{type:'food',img:'../assets/v18-packshot-dry.svg',en:'Dry food',de:'Trockenfutter'},
  wet:{type:'food',img:'../assets/v18-packshot-wet.svg',en:'Wet food',de:'Nassfutter'},
  treats:{type:'treats',img:'../assets/v18-packshot-treats.svg',en:'Treats',de:'Snacks'},
  dental:{type:'dental',img:'../assets/v18-packshot-dental.svg',en:'Dental care',de:'Zahnpflege'},
  coat:{type:'care',img:'../assets/v18-packshot-coat.svg',en:'Coat care',de:'Fellpflege'},
  walk:{type:'other',img:'../assets/v18-packshot-walk.svg',en:'Walk',de:'Spaziergang'},
  play:{type:'other',img:'../assets/v18-packshot-play.svg',en:'Play',de:'Spielen'},
  training:{type:'other',img:'../assets/v18-packshot-training.svg',en:'Training',de:'Training'},
  vet:{type:'care',img:'../assets/v18-packshot-vet.svg',en:'Vet / care',de:'Tierarzt / Pflege'},
  sleep:{type:'other',img:'../assets/v18-packshot-sleep.svg',en:'Sleep',de:'Schlafen'},
  travel:{type:'other',img:'../assets/v18-packshot-travel.svg',en:'Travel',de:'Reisen'}
});

routineIcon=function(type){
  const map={
    food:'../assets/v18-packshot-dry.svg',supplement:'../assets/v18-packshot-vet.svg',
    treats:'../assets/v18-packshot-treats.svg',dental:'../assets/v18-packshot-dental.svg',
    care:'../assets/v18-packshot-coat.svg',other:'../assets/v18-packshot-vet.svg'
  };
  return map[type]||map.other;
};

// Refresh already-saved V13/V17 visual paths without changing user state.
const __npGetRoutineV18=getRoutineV6;
getRoutineV6=function(){
  const old={
    '../assets/v17-need-dry.svg':'../assets/v18-packshot-dry.svg','../assets/v13-need-wet.svg':'../assets/v18-packshot-wet.svg',
    '../assets/v13-need-snacks.svg':'../assets/v18-packshot-treats.svg','../assets/v13-need-dental.svg':'../assets/v18-packshot-dental.svg',
    '../assets/v13-need-coat.svg':'../assets/v18-packshot-coat.svg','../assets/v13-need-walk.svg':'../assets/v18-packshot-walk.svg',
    '../assets/v13-need-play.svg':'../assets/v18-packshot-play.svg','../assets/v13-need-training.svg':'../assets/v18-packshot-training.svg',
    '../assets/v13-need-vet.svg':'../assets/v18-packshot-vet.svg','../assets/v17-need-sleep.svg':'../assets/v18-packshot-sleep.svg',
    '../assets/v17-need-travel.svg':'../assets/v18-packshot-travel.svg','../assets/product-food.svg':'../assets/v18-packshot-dry.svg',
    '../assets/product-treats.svg':'../assets/v18-packshot-treats.svg','../assets/product-care.svg':'../assets/v18-packshot-coat.svg'
  };
  return __npGetRoutineV18().map(x=>old[x.img]?{...x,img:old[x.img]}:x);
};
const __npGetPlanV18=getPlanV6;
getPlanV6=function(){
  const old={'../assets/product-food.svg':'../assets/v18-packshot-dry.svg','../assets/product-treats.svg':'../assets/v18-packshot-treats.svg','../assets/product-care.svg':'../assets/v18-packshot-coat.svg'};
  return __npGetPlanV18().map(x=>old[x.img]?{...x,img:old[x.img]}:x);
};

// ---------- smart entry routing ----------
function npHasPetV18(){return npV6Pets().length>0}
function initSmartEntryV18(){
  const pet=npHasPetV18()?npV6ActivePet():null;
  document.querySelectorAll('[data-smart-start]').forEach(a=>{
    a.href=pet?'tool.html':'pets.html';
    if(a.id==='smartStart18' && pet){
      a.textContent=npLang==='de'?`Mit ${pet.name} starten →`:`Start with ${pet.name} →`;
    }
  });
  document.querySelectorAll('[data-entry-intent]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();
    localStorage.setItem('npPendingNeedV18',a.dataset.entryIntent||'');
    window.location.href=npHasPetV18()?'tool.html':'pets.html';
  }));
}
function applyPendingNeedV18(){
  if(!document.getElementById('match6Needs') || !npHasPetV18())return;
  const intent=localStorage.getItem('npPendingNeedV18');if(!intent)return;
  localStorage.removeItem('npPendingNeedV18');
  if(intent==='food'){
    const host=document.getElementById('match6Needs');
    ['dry','wet','treats'].forEach(id=>host?.querySelector(`[data-need="${id}"]`)?.classList.add('intent18-highlight'));
    const note=document.createElement('div');note.className='intent18-note';
    note.textContent=t('You chose food. Pick dry food, wet food or treats to continue.','Du hast Futter gewählt. Wähle Trockenfutter, Nassfutter oder Snacks, um weiterzumachen.');
    host?.parentNode?.insertBefore(note,host);
    note.scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  const btn=document.querySelector(`[data-need="${intent}"]`);
  if(btn)setTimeout(()=>openNeedModalV6(intent),160);
}

// ---------- pet photo: small complete preview + storage-safe resizing ----------
let npV18PhotoPromise=Promise.resolve('');
function resizePetPhotoV18(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file);const img=new Image();
    img.onload=()=>{
      try{
        const max=720,scale=Math.min(1,max/Math.max(img.naturalWidth||1,img.naturalHeight||1));
        const w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale));
        const c=document.createElement('canvas');c.width=w;c.height=h;
        const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
        const data=c.toDataURL('image/jpeg',.84);URL.revokeObjectURL(url);resolve(data);
      }catch(err){URL.revokeObjectURL(url);reject(err)}
    };
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('image-load-failed'))};img.src=url;
  });
}
initPetFormV6=function(){
  const form=document.getElementById('petForm6');const file=document.getElementById('petPhoto6');
  const preview=document.getElementById('petPhotoPreview6');const wrap=document.getElementById('petPhotoPreviewWrap18');
  const placeholder=document.getElementById('petPhotoPlaceholder18');
  if(file)file.addEventListener('change',e=>{
    const f=e.target.files?.[0];if(!f)return;
    wrap?.classList.add('loading');
    npV18PhotoPromise=resizePetPhotoV18(f).then(data=>{
      npV6PhotoData=data;if(preview){preview.src=data;preview.style.display='block'}
      wrap?.classList.add('has-photo');wrap?.classList.remove('loading');if(placeholder)placeholder.textContent=t('Photo ready','Foto bereit');
      return data;
    }).catch(()=>{wrap?.classList.remove('loading');showToastV6(t('That photo could not be prepared. Please try another file.','Dieses Foto konnte nicht vorbereitet werden. Bitte versuche eine andere Datei.'));return''});
  });
  if(form)form.addEventListener('submit',async e=>{
    e.preventDefault();await npV18PhotoPromise;
    const d=new FormData(form);const tags=(d.get('traits')||'').toString().split(',').map(s=>s.trim()).filter(Boolean);
    const id='p'+Date.now();const type=(d.get('type')||'').toString();const age=(d.get('age')||'').toString().trim();const notes=(d.get('notes')||'').toString().trim();
    const pet={id,name:(d.get('name')||'').toString().trim(),type,typeDe:type,age,ageDe:age,about:notes,aboutDe:notes,tags,tagsDe:tags,photo:npV6PhotoData||''};
    const pets=npV6Pets();pets.push(pet);localStorage.setItem('npPets',JSON.stringify(pets));localStorage.setItem('npActivePetId',id);
    form.reset();npV6PhotoData='';npV18PhotoPromise=Promise.resolve('');
    if(preview){preview.removeAttribute('src');preview.style.display='none'}wrap?.classList.remove('has-photo','loading');
    renderPetsV6();hydrateActivePetV6();refreshNavCartCountV6();
    const after=localStorage.getItem('npAfterPetV18')||'tool.html';localStorage.removeItem('npAfterPetV18');window.location.href=after;
  });
};

// ---------- true no-pet state in Pet Match ----------
const __npHydrateActivePetV18=hydrateActivePetV6;
hydrateActivePetV6=function(){
  __npHydrateActivePetV18();
  const has=npHasPetV18();document.body.classList.toggle('match18-empty',!has && !!document.getElementById('match6Orbit'));
  const card=document.getElementById('match18PetCard');
  if(card){
    card.classList.toggle('match18-add-pet',!has);card.setAttribute('role',!has?'link':'group');card.tabIndex=!has?0:-1;
    const strong=card.querySelector('strong'),span=card.querySelector('span');
    if(!has){if(strong)strong.textContent=t('Add a pet','Tier hinzufügen');if(span)span.textContent=t('Create the profile once, then continue here.','Profil einmal anlegen und direkt hier weitermachen.');
      card.onclick=()=>window.location.href='pets.html';card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.location.href='pets.html'}};
    }else{card.onclick=null;card.onkeydown=null}
  }
  const orbit=document.getElementById('match6Orbit');
  if(orbit){
    const center=orbit.querySelector('.match6-center');
    if(!has && center){center.style.pointerEvents='auto';center.style.cursor='pointer';center.querySelector('strong').textContent=t('Add pet','Tier hinzufügen');center.querySelector('span').textContent=t('Name, photo and a few useful details','Name, Foto und ein paar hilfreiche Angaben');center.onclick=()=>window.location.href='pets.html';}
    else if(center){center.style.pointerEvents='none';center.style.cursor='';center.onclick=null}
  }
  document.querySelectorAll('.match6-need').forEach(b=>{b.disabled=!has;b.setAttribute('aria-disabled',!has?'true':'false')});
  const score=document.querySelector('.match6-score');
  if(score){
    score.classList.toggle('match18-score-empty',!has);let empty=score.querySelector('.match18-empty-score');
    if(!has && !empty){empty=document.createElement('div');empty.className='match18-empty-score';empty.innerHTML=`<div class="smallcap">${t('Start here','Hier starten')}</div><h3>${t('First tell us who you are shopping for.','Zuerst brauchen wir dein Tier.')}</h3><p>${t('A small profile is enough. NoevaPet then carries the context through recommendations and the cart.','Ein kleines Profil genügt. NoevaPet nimmt den Kontext danach in Empfehlungen und Warenkorb mit.')}</p><a class="pill primary" href="pets.html">${t('Add a pet','Tier hinzufügen')} →</a>`;score.appendChild(empty)}
    if(has && empty)empty.remove();
  }
};
const __npOpenNeedV18=openNeedModalV6;
openNeedModalV6=function(id){if(!npHasPetV18()){localStorage.setItem('npPendingNeedV18',id||'');window.location.href='pets.html';return}return __npOpenNeedV18(id)};

// Direct access to downstream pages without a pet is routed back to profile creation.
function guardPetJourneyV18(){
  if(npHasPetV18())return;
  const page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(['results.html','compare.html','basket.html','purchase.html'].includes(page)){
    localStorage.setItem('npAfterPetV18','tool.html');location.replace('pets.html');
  }
}

// ---------- results: never leave the user at a dead end after adding ----------
function updateResultsNextV18(){
  const next=document.getElementById('result18Next');if(!next)return;
  next.hidden=getPlanV6().length===0;
}
const __npAddPlanV18=addPlanItem;
addPlanItem=function(btn){__npAddPlanV18(btn);updateResultsNextV18();renderHeroBasketV8();};

// ---------- purchase history + printable completion summary ----------
function purchaseHistoryKeyV18(id){return `npPurchaseHistory:${id}`}
function readPurchaseHistoryV18(id){try{const x=JSON.parse(localStorage.getItem(purchaseHistoryKeyV18(id)));return Array.isArray(x)?x:[]}catch(e){return[]}}
function savePurchaseHistoryV18(id,record){const list=readPurchaseHistoryV18(id);list.unshift(record);localStorage.setItem(purchaseHistoryKeyV18(id),JSON.stringify(list.slice(0,12)))}
function purchaseNumbersV18(items,mode){
  const total=items.reduce((s,x)=>s+Number(x.price||0),0);const rates={save:.12,balance:.08,simple:.04};const caps={save:7.8,balance:5.2,simple:2.5};
  const saving=Math.min(caps[mode]??5.2,total*(rates[mode]??.08));return {total,saving,planTotal:Math.max(0,total-saving)};
}
function formatDateV18(iso){try{return new Intl.DateTimeFormat(npLang==='de'?'de-DE':'en-GB',{dateStyle:'medium',timeStyle:'short'}).format(new Date(iso))}catch(e){return iso}}
function renderReceiptV18(record){
  const host=document.getElementById('checkout18Receipt');if(!host||!record)return;
  const items=record.items||[];const itemRows=items.map(x=>`<div class="checkout18-item"><img src="${x.img||routineIcon(x.type)}" alt=""><div><strong>${npLang==='de'?(x.nameDe||x.name):(x.name||x.nameDe)}</strong><span>${x.source==='plan'?t('Selected recommendation','Gewählte Empfehlung'):t('Usual / selected product','Gewohntes / gewähltes Produkt')}</span></div><b>€${Number(x.price||0).toFixed(2)}</b></div>`).join('');
  host.innerHTML=`<div class="checkout18-top"><div><span>${t('Pet','Tier')}</span><strong>${record.pet_name||''}</strong></div><div><span>${t('Date','Datum')}</span><strong>${formatDateV18(record.confirmed_at)}</strong></div><div><span>${t('Confirmed plan total','Bestätigter Kaufplan')}</span><strong>€${Number(record.plan_total||0).toFixed(2)}</strong></div></div><div class="checkout18-items">${itemRows}</div><div class="checkout18-retailers"><strong>${t('Retailer checkouts','Händler-Checkouts')}</strong><span>${(record.retailers||[]).map(x=>`${t('Retailer','Händler')} ${x}`).join(' · ')}</span></div><p class="checkout18-disclaimer">${t('Recorded because you confirmed the retailer checkouts as completed. NoevaPet cannot independently verify retailer payment.','Gespeichert, weil du die Händler-Checkouts als abgeschlossen bestätigt hast. NoevaPet kann die Zahlung beim Händler nicht unabhängig verifizieren.')}</p>`;
}
completeCheckoutV7=function(){
  const snapshot=getCartItemsV6();const p=npV6ActivePet();const nums=purchaseNumbersV18(snapshot,__npV6PurchaseMode);const retailers=retailerTargetsV6();
  const record={id:'purchase-'+Date.now(),confirmed_at:new Date().toISOString(),pet_id:p.id,pet_name:p.name||'',mode:__npV6PurchaseMode,total:nums.total,saving:nums.saving,plan_total:nums.planTotal,retailers,
    items:snapshot.map(x=>({id:x.id,name:x.name,nameDe:x.nameDe||x.name,price:Number(x.price||0),source:x.source,type:x.type||'other',img:x.img||routineIcon(x.type)}))};
  localStorage.setItem(`npLastPurchase:${p.id}`,JSON.stringify(record));savePurchaseHistoryV18(p.id,record);
  saveRoutineV6(getRoutineV6().map(x=>({...x,buyNow:false})));savePlanV6([]);sessionStorage.removeItem(`npCheckoutOpened:${p.id}`);refreshNavCartCountV6();
  document.getElementById('checkout8Shell')?.setAttribute('style','display:none');document.getElementById('checkout7Done')?.classList.add('show');document.body.classList.add('checkout-done8');
  renderReceiptV18(record);const link=document.getElementById('checkout18PetLink');if(link)link.href='pets.html#purchase-history';
};
function renderPurchaseHistoryV18(){
  const section=document.getElementById('purchase-history');const host=document.getElementById('pets18HistoryList');if(!section||!host)return;
  const pets=npV6Pets();let records=[];pets.forEach(p=>readPurchaseHistoryV18(p.id).forEach(r=>records.push({...r,pet_name:r.pet_name||p.name})));records.sort((a,b)=>String(b.confirmed_at).localeCompare(String(a.confirmed_at)));
  if(!records.length){section.hidden=true;return}section.hidden=false;
  host.innerHTML=records.slice(0,10).map(r=>`<article class="card pets18-history-card"><div class="pets18-history-head"><div><span>${formatDateV18(r.confirmed_at)}</span><strong>${r.pet_name}</strong></div><b>€${Number(r.plan_total||0).toFixed(2)}</b></div><div class="pets18-history-items">${(r.items||[]).slice(0,4).map(x=>`<span>${npLang==='de'?(x.nameDe||x.name):(x.name||x.nameDe)}</span>`).join('')}${(r.items||[]).length>4?`<span>+${r.items.length-4}</span>`:''}</div><div class="pets18-history-foot"><span>${(r.retailers||[]).length} ${t('retailer checkouts','Händler-Checkouts')}</span><span>${(r.items||[]).length} ${t('items','Produkte')}</span></div></article>`).join('');
}

// Keep no-pet pages honest and make all V18 continuity features active after older initializers.
document.addEventListener('DOMContentLoaded',()=>{
  guardPetJourneyV18();hydrateActivePetV6();initSmartEntryV18();applyPendingNeedV18();updateResultsNextV18();renderPurchaseHistoryV18();
  document.getElementById('checkout18Print')?.addEventListener('click',()=>window.print());
});


// ===========================================================
// NOEVAPET V19 — BASKET / PURCHASE PROCESS CONGRUENCY
// ===========================================================

const npV19Recommendations={
  dry:{id:'rec-dry',type:'food',name:'Balanced dry food',nameDe:'Ausgewogenes Trockenfutter',subtitle:'NoevaPet recommendation · dry food',subtitleDe:'NoevaPet Empfehlung · Trockenfutter',img:'../assets/v18-packshot-dry.svg',price:31.90},
  wet:{id:'rec-wet',type:'food',name:'Gentle wet food',nameDe:'Sanftes Nassfutter',subtitle:'NoevaPet recommendation · wet food',subtitleDe:'NoevaPet Empfehlung · Nassfutter',img:'../assets/v18-packshot-wet.svg',price:28.40},
  treats:{id:'rec-treats',type:'treats',name:'Small training treats',nameDe:'Kleine Trainingssnacks',subtitle:'NoevaPet recommendation · treats',subtitleDe:'NoevaPet Empfehlung · Snacks',img:'../assets/v18-packshot-treats.svg',price:11.80},
  dental:{id:'rec-dental',type:'dental',name:'Everyday dental chew',nameDe:'Zahnpflege-Kausnack',subtitle:'NoevaPet recommendation · dental care',subtitleDe:'NoevaPet Empfehlung · Zahnpflege',img:'../assets/v18-packshot-dental.svg',price:9.90},
  coat:{id:'rec-coat',type:'care',name:'Gentle coat care',nameDe:'Sanfte Fellpflege',subtitle:'NoevaPet recommendation · coat care',subtitleDe:'NoevaPet Empfehlung · Fellpflege',img:'../assets/v18-packshot-coat.svg',price:13.40},
  walk:{id:'rec-walk',type:'other',name:'Everyday harness set',nameDe:'Alltagsgeschirr-Set',subtitle:'NoevaPet recommendation · walk',subtitleDe:'NoevaPet Empfehlung · Spaziergang',img:'../assets/v18-packshot-walk.svg',price:24.90},
  play:{id:'rec-play',type:'other',name:'Enrichment toy',nameDe:'Beschäftigungsspielzeug',subtitle:'NoevaPet recommendation · play',subtitleDe:'NoevaPet Empfehlung · Spielen',img:'../assets/v18-packshot-play.svg',price:16.90},
  training:{id:'rec-training',type:'other',name:'Training starter set',nameDe:'Training-Starterset',subtitle:'NoevaPet recommendation · training',subtitleDe:'NoevaPet Empfehlung · Training',img:'../assets/v18-packshot-training.svg',price:17.90},
  vet:{id:'rec-vet',type:'care',name:'Everyday care set',nameDe:'Pflege-Basisset',subtitle:'NoevaPet recommendation · care',subtitleDe:'NoevaPet Empfehlung · Pflege',img:'../assets/v18-packshot-vet.svg',price:14.90},
  sleep:{id:'rec-sleep',type:'other',name:'Calm sleep mat',nameDe:'Ruhige Schlafmatte',subtitle:'NoevaPet recommendation · sleep',subtitleDe:'NoevaPet Empfehlung · Schlafen',img:'../assets/v18-packshot-sleep.svg',price:29.90},
  travel:{id:'rec-travel',type:'other',name:'Travel essentials set',nameDe:'Reise-Basisset',subtitle:'NoevaPet recommendation · travel',subtitleDe:'NoevaPet Empfehlung · Reisen',img:'../assets/v18-packshot-travel.svg',price:22.90}
};

function recommendationForNeedV19(needKey){
  const base=npV19Recommendations[needKey]||npV19Recommendations.vet;
  return {...base,sourceNeed:'n-'+needKey,zone:'zone-now'};
}
function needKeyFromIdV19(id){return String(id||'').replace(/^n-/,'')}
function ensureNeedRecommendationsV19(){
  const needs=getNeedsV6(); if(!needs.length)return false;
  const plan=getPlanV6(); let changed=false;
  needs.forEach(n=>{
    const key=needKeyFromIdV19(n.id), rec=recommendationForNeedV19(key);
    if(!plan.some(x=>x.sourceNeed===n.id || x.id===rec.id)){
      plan.push(rec); changed=true;
    }
  });
  if(changed)savePlanV6(plan);
  return changed;
}

// "Please suggest" now creates a basket-ready default recommendation immediately.
// The detailed recommendation page remains optional rather than a required detour.
addSuggestedNeedV6=function(){
  const map=npV6NeedMap[npV6CurrentNeed];if(!map)return;
  const needs=getNeedsV6(), id='n-'+npV6CurrentNeed;
  if(!needs.find(x=>x.id===id)){
    needs.push({id,type:map.type,name:map.en,nameDe:map.de,img:map.img});
    saveNeedsV6(needs);
  }
  const rec=recommendationForNeedV19(npV6CurrentNeed), plan=getPlanV6();
  const ix=plan.findIndex(x=>x.sourceNeed===id || x.id===rec.id);
  if(ix>=0)plan[ix]={...plan[ix],...rec}; else plan.push(rec);
  savePlanV6(plan);localStorage.setItem('npLastNeedV19',npV6CurrentNeed);
  renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();closeNeedModalV6();
  showToastV6(t('Recommendation added to the cart. Alternatives remain available.','Empfehlung in den Warenkorb übernommen. Alternativen bleiben verfügbar.'));
};

// If a suggested need is removed from the orbit, remove its automatically chosen recommendation too.
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-match-node-remove][data-source="need"]');if(!btn)return;
  const needId=btn.dataset.matchNodeRemove;
  savePlanV6(getPlanV6().filter(x=>x.sourceNeed!==needId));
  refreshNavCartCountV6();renderHeroBasketV8();
},true);

const __npRemoveCartV19=removeCartItemV6;
removeCartItemV6=function(cartId){
  const [source,id]=String(cartId||'').split(':');
  if(source==='plan'){
    const item=getPlanV6().find(x=>x.id===id);
    if(item?.sourceNeed)saveNeedsV6(getNeedsV6().filter(n=>n.id!==item.sourceNeed));
  }
  __npRemoveCartV19(cartId);renderHeroBasketV8();
};

function purchaseValuesV19(items,mode){
  const total=items.reduce((s,x)=>s+Number(x.price||0),0);
  const saving=Math.min(({save:7.8,balance:5.2,simple:2.5}[mode]??5.2),total*({save:.12,balance:.08,simple:.04}[mode]??.08));
  const retailers=(mode==='simple'||items.length<2)?1:2;
  return {total,saving,price:Math.max(0,total-saving),retailers,deliveries:retailers};
}
function purchaseRouteGroupsV19(items=getCartItemsV6(),mode=__npV6PurchaseMode){
  const v=purchaseValuesV19(items,mode); if(!items.length)return [];
  const factor=v.total>0?v.price/v.total:1;
  let A=[],B=[];
  if(v.retailers===1)A=items.slice();
  else{
    // Keep the larger basket together and put one product with the specialist retailer.
    const sorted=items.map((x,i)=>({...x,__order:i})).sort((a,b)=>Number(b.price||0)-Number(a.price||0));
    const specialist=sorted[sorted.length-1];
    B=[specialist]; A=sorted.filter(x=>x.cartId!==specialist.cartId).sort((a,b)=>a.__order-b.__order);
  }
  const mk=(id,arr)=>({id,items:arr.map(x=>({...x,optimizedPrice:Number(x.price||0)*factor})),subtotal:arr.reduce((s,x)=>s+Number(x.price||0)*factor,0)});
  return v.retailers===1?[mk('A',A)]:[mk('A',A),mk('B',B)];
}
retailerTargetsV6=function(){return purchaseRouteGroupsV19().map(g=>g.id)};

function routeProductRowsV19(group){
  return `<div class="route19-items">${group.items.map(item=>{const nm=npLang==='de'?(item.nameDe||item.name):item.name;return `<div class="route19-item"><img src="${item.img||routineIcon(item.type)}" alt=""><div><strong>${nm}</strong><small>${item.source==='plan'?t('Selected recommendation','Gewählte Empfehlung'):t('Your selected product','Dein gewähltes Produkt')}</small></div><b>€${Number(item.optimizedPrice||item.price||0).toFixed(2)}</b></div>`}).join('')}</div>`;
}

// Purchase stage 2: retailer count, delivery count and route are derived from the real basket,
// and every retailer shows the exact products assigned to it.
updatePurchaseOptionV6=function(mode){
  __npV6PurchaseMode=mode;sessionStorage.setItem('npPurchaseModeV6',mode);
  document.querySelectorAll('[data-v6-buy-mode]').forEach(b=>b.classList.toggle('active',b.dataset.v6BuyMode===mode));
  const items=getCartItemsV6(), values=purchaseValuesV19(items,mode), price=values.price;
  window.__npV6CartTotal=values.total;
  document.querySelectorAll('[data-v6-opt-price]').forEach(x=>x.textContent=`€${price.toFixed(2)}`);
  document.querySelectorAll('[data-v6-saving]').forEach(x=>x.textContent=t(`Save €${values.saving.toFixed(2)}`,`€${values.saving.toFixed(2).replace('.',',')} sparen`));
  document.querySelectorAll('[data-v6-deliveries]').forEach(x=>x.textContent=values.deliveries===1?t('1 delivery','1 Lieferung'):t(`${values.deliveries} deliveries`,`${values.deliveries} Lieferungen`));
  const title=document.getElementById('buy6WhyTitle'),copy=document.getElementById('buy6WhyCopy'),list=document.getElementById('buy6WhyList'),stats=document.getElementById('buy6Stats'),route=document.getElementById('buy6Route');
  const actualRetailerText=values.retailers===1?t('1 retailer','1 Händler'):t(`${values.retailers} retailers`,`${values.retailers} Händler`);
  const content={
    save:{title:t('Lowest total cost','Niedrigster Gesamtpreis'),copy:t('NoevaPet uses the lowest sensible total price for the products in this cart.','NoevaPet nutzt für die Produkte in diesem Warenkorb den niedrigsten sinnvollen Gesamtpreis.'),bullets:[t('The products in your cart stay exactly the same.','Die Produkte in deinem Warenkorb bleiben exakt gleich.'),values.retailers===1?t('One retailer is enough for this basket.','Ein Händler reicht für diesen Warenkorb aus.'):t('A second retailer is used only because it lowers the combined price.','Ein zweiter Händler wird nur genutzt, weil er den Gesamtpreis senkt.'),t('Every product remains visible through checkout.','Jedes Produkt bleibt bis zum Checkout sichtbar.')],label:t('lowest sensible total','niedrigster sinnvoller Gesamtpreis')},
    balance:{title:t('Best balance of price + convenience','Beste Balance aus Preis + Einfachheit'),copy:t('NoevaPet keeps the purchase as simple as the actual basket allows while preserving useful savings.','NoevaPet hält den Einkauf so einfach, wie es der tatsächliche Warenkorb erlaubt, und behält sinnvolle Ersparnisse.'),bullets:[t('The products in your cart stay exactly the same.','Die Produkte in deinem Warenkorb bleiben exakt gleich.'),values.retailers===1?t('There is no reason to split this basket across two retailers.','Für diesen Warenkorb gibt es keinen Grund, auf zwei Händler aufzuteilen.'):t('Two retailers are used only where the basket makes that worthwhile.','Zwei Händler werden nur genutzt, wenn es sich für diesen Warenkorb lohnt.'),t('You can see which product goes to which retailer below.','Unten siehst du, welches Produkt zu welchem Händler geht.')],label:t('good value + simple flow','guter Wert + einfacher Ablauf')},
    simple:{title:t('Simplest purchase route','Einfachster Kaufweg'),copy:t('NoevaPet keeps all products with one retailer whenever this mode is selected.','NoevaPet hält in diesem Modus alle Produkte bei einem Händler.'),bullets:[t('One retailer only.','Nur ein Händler.'),t('One checkout and one delivery route.','Ein Checkout und ein Lieferweg.'),t('All products remain visible in the prepared retailer cart.','Alle Produkte bleiben im vorbereiteten Händler-Warenkorb sichtbar.')],label:t('fewest steps','wenigste Schritte')}
  }[mode];
  if(title)title.textContent=content.title;if(copy)copy.textContent=content.copy;
  if(list)list.innerHTML=content.bullets.map(x=>`<div><b>✦</b><span>${x}</span></div>`).join('');
  if(stats)stats.innerHTML=`<div class="buy6-stat"><strong>${actualRetailerText}</strong><span>${content.label}</span></div><div class="buy6-stat"><strong>${values.deliveries===1?t('1 delivery','1 Lieferung'):t(`${values.deliveries} deliveries`,`${values.deliveries} Lieferungen`)}</strong><span>${t('one handoff per retailer','eine Übergabe je Händler')}</span></div>`;
  if(route){
    route.innerHTML=purchaseRouteGroupsV19(items,mode).map(g=>`<div class="route19-group"><div class="route19-head"><strong>${t('Retailer','Händler')} ${g.id}${g.id==='A'?` · ${t('main cart','Hauptwarenkorb')}`:` · ${t('specialist cart','Spezialwarenkorb')}`}</strong><span>€${g.subtotal.toFixed(2)}</span></div>${routeProductRowsV19(g)}</div>`).join('');
  }
  renderCheckoutHubV19();
};

function renderCheckoutHubV19(){
  const host=document.getElementById('checkout6Hub');if(!host)return;
  const groups=purchaseRouteGroupsV19(),targets=groups.map(g=>g.id),opened=openedRetailersV8().filter(x=>targets.includes(x));
  const title=document.getElementById('checkout19Title'),copy=document.getElementById('checkout19Copy');
  if(title)title.textContent=targets.length===1?t('One retailer cart. One NoevaPet overview.','Ein Händler-Warenkorb. Eine NoevaPet-Übersicht.'):t('Two retailer carts. One NoevaPet overview.','Zwei Händler-Warenkörbe. Eine NoevaPet-Übersicht.');
  if(copy)copy.textContent=targets.length===1?t('The required products stay visible here while the prepared retailer cart opens in a new tab.','Die benötigten Produkte bleiben hier sichtbar, während der vorbereitete Händler-Warenkorb in einem neuen Tab öffnet.'):t('NoevaPet opens the required retailer carts one after another. The exact product split stays visible here.','NoevaPet öffnet die benötigten Händler-Warenkörbe nacheinander. Die genaue Produktaufteilung bleibt hier sichtbar.');
  host.innerHTML=groups.map(g=>{
    const done=opened.includes(g.id),mode=retailerModeV7(g.id),modeLabel=mode==='product_deeplink'?t('Exact products','Exakte Produkte'):t('Prepared cart','Vorbereiteter Warenkorb');
    const products=g.items.map(item=>{const nm=npLang==='de'?(item.nameDe||item.name):item.name;return `<div class="checkout19-product"><img src="${item.img||routineIcon(item.type)}" alt=""><div><strong>${nm}</strong><span>1× · ${item.source==='plan'?t('recommendation','Empfehlung'):t('selected product','gewähltes Produkt')}</span></div><b>€${Number(item.optimizedPrice||item.price||0).toFixed(2)}</b></div>`}).join('');
    return `<div class="checkout8-retailer ${done?'opened':''}"><div class="row"><div><strong>${t('Retailer','Händler')} ${g.id}</strong><span>${modeLabel}</span></div><span class="checkout8-status">${done?t('Opened ✓','Geöffnet ✓'):t('Ready','Bereit')}</span></div><div class="checkout19-products">${products}<div class="checkout19-subtotal"><span>${t('Prepared retailer subtotal','Vorbereitete Händler-Summe')}</span><b>€${g.subtotal.toFixed(2)}</b></div></div>${done?`<button class="checkout8-reopen" data-v8-reopen="${g.id}">${t('Open again','Erneut öffnen')} ↗</button>`:''}</div>`;
  }).join('');
  host.querySelectorAll('[data-v8-reopen]').forEach(b=>b.addEventListener('click',()=>openRetailerV8(b.dataset.v8Reopen)));
  const next=targets.find(id=>!opened.includes(id))||null,nextWrap=document.getElementById('checkout8NextWrap'),nextBtn=document.getElementById('checkout8NextRetailer'),nextHint=document.getElementById('checkout8NextHint'),confirm=document.getElementById('checkout7Confirm'),progress=document.getElementById('checkout6ProgressText'),bar=document.getElementById('checkout6ProgressBar');
  if(next){
    if(nextWrap)nextWrap.style.display='flex';if(nextBtn){nextBtn.textContent=opened.length===0?t(`Start checkout — open Retailer ${next} ↗`,`Checkout starten — Händler ${next} öffnen ↗`):t(`Next — open Retailer ${next} ↗`,`Weiter — Händler ${next} öffnen ↗`);nextBtn.onclick=()=>openRetailerV8(next)}
    if(nextHint)nextHint.textContent=t('Opens in a new tab. NoevaPet stays open here.','Öffnet in einem neuen Tab. NoevaPet bleibt hier offen.');if(confirm)confirm.classList.remove('show');
  }else{if(nextWrap)nextWrap.style.display='none';if(confirm)confirm.classList.add('show')}
  const count=opened.length,total=targets.length;
  if(progress)progress.textContent=count===0?t(`${total} retailer cart${total===1?'':'s'} ready. Nothing has opened yet.`,total===1?'1 Händler-Warenkorb bereit. Noch wurde nichts geöffnet.':`${total} Händler-Warenkörbe bereit. Noch wurde nichts geöffnet.`):count===total?t('All required retailer carts have been opened. Complete payment there, then confirm here.','Alle benötigten Händler-Warenkörbe wurden geöffnet. Schließe die Zahlungen dort ab und bestätige danach hier.'):t(`${count} of ${total} opened. Return here for the next retailer.`,`${count} von ${total} geöffnet. Kehre für den nächsten Händler hierher zurück.`);
  if(bar)bar.style.width=`${total?count/total*100:0}%`;
}
renderCheckoutHubV8=renderCheckoutHubV19;renderCheckoutHubV7=renderCheckoutHubV19;renderCheckoutHubV6=renderCheckoutHubV19;

// Make receipt math use exactly the same basket economics as stage 2.
purchaseNumbersV18=function(items,mode){const v=purchaseValuesV19(items,mode);return {total:v.total,saving:v.saving,planTotal:v.price}};

// Results page follows the most recently requested need. It is optional: the recommendation may already be in the cart.
function hydrateResultsV19(){
  const img=document.getElementById('result19ProductImage'),name=document.getElementById('result19ProductName'),sub=document.getElementById('result19ProductSubtitle'),btn=document.getElementById('result19Add');if(!img||!name||!btn)return;
  let key=localStorage.getItem('npLastNeedV19');if(!key){const needs=getNeedsV6();key=needs.length?needKeyFromIdV19(needs[needs.length-1].id):'dry'}
  const rec=recommendationForNeedV19(key);img.src=rec.img;name.textContent=npLang==='de'?rec.nameDe:rec.name;if(sub)sub.textContent=npLang==='de'?rec.subtitleDe:rec.subtitle;
  Object.entries({id:rec.id,name:rec.name,nameDe:rec.nameDe,subtitle:rec.subtitle,subtitleDe:rec.subtitleDe,img:rec.img,type:rec.type,price:String(rec.price)}).forEach(([k,v])=>{btn.dataset[k]=v});
  const already=getPlanV6().some(x=>x.id===rec.id||x.sourceNeed===rec.sourceNeed);
  if(already){btn.textContent=t('In cart ✓','Im Warenkorb ✓');btn.classList.add('primary');const next=document.getElementById('result18Next');if(next)next.hidden=false}
}

// Homepage pet medallion only appears when it improves the composition (one item).
const __npHeroV19=renderHeroBasketV8;
renderHeroBasketV8=function(){
  __npHeroV19();const basket=document.querySelector('.hero8-basket');if(!basket)return;const items=getCartItemsV6();basket.classList.toggle('hero19-single',items.length===1);
};

// Rehydrate V18 saved needs into complete basket items once, then refresh every dependent surface.
document.addEventListener('DOMContentLoaded',()=>{
  const changed=ensureNeedRecommendationsV19();
  if(changed){refreshNavCartCountV6();renderMatchSelectedV9();renderMatchOrbitV6();renderCartV6();}
  hydrateResultsV19();renderHeroBasketV8();
  if(document.querySelector('.purchase6-stepper')){renderCartV6();updatePurchaseOptionV6(sessionStorage.getItem('npPurchaseModeV6')||'balance');}
});

// Prevent stepper shortcuts from bypassing an empty basket and refresh the real route before later stages.
const __npShowPurchaseStageV19=showPurchaseStageV6;
showPurchaseStageV6=function(n){
  ensureNeedRecommendationsV19();
  const items=getCartItemsV6();
  if(Number(n)>1 && !items.length){
    __npShowPurchaseStageV19(1);
    showToastV6(t('Add a product or ask NoevaPet for a recommendation first.','Füge zuerst ein Produkt hinzu oder lass NoevaPet eine Empfehlung auswählen.'));
    return;
  }
  if(Number(n)>=2)updatePurchaseOptionV6(sessionStorage.getItem('npPurchaseModeV6')||__npV6PurchaseMode||'balance');
  __npShowPurchaseStageV19(n);
  if(Number(n)===4)renderCheckoutHubV19();
};

// Exact-product entry replaces an earlier automatic suggestion for the same need.
addCurrentProductV6=function(){
  const name=(document.getElementById('v6NeedName')?.value||'').trim();if(!name)return;
  const type=document.getElementById('v6NeedType')?.value||'food',locked=!!document.getElementById('v6KeepExact')?.checked,buyNow=!!document.getElementById('v6BuyNow')?.checked;
  const needId=npV6CurrentNeed?'n-'+npV6CurrentNeed:null;
  if(needId){saveNeedsV6(getNeedsV6().filter(n=>n.id!==needId));savePlanV6(getPlanV6().filter(x=>x.sourceNeed!==needId));}
  const items=getRoutineV6();items.push({id:'r'+Date.now(),type,name,nameDe:name,img:routineIcon(type),locked,buyNow});saveRoutineV6(items);
  renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();closeNeedModalV6();
};

// Empty purchase plans cannot be optimized accidentally.
const __npRenderCartV19=renderCartV6;
renderCartV6=function(){
  __npRenderCartV19();
  const empty=getCartItemsV6().length===0,btn=document.querySelector('[data-v6-next="2"]');
  if(btn){btn.disabled=empty;btn.setAttribute('aria-disabled',empty?'true':'false');}
};

// ===========================================================
// NOEVAPET V20 — LOGIC / CONGRUENCY REFINEMENT PASS
// ===========================================================

// ---------- state integrity: no orphan cart state without a pet ----------
function npHasActivePetV20(){
  const pets=npV6Pets();
  if(!pets.length)return false;
  const id=npV6ActivePetId();
  return !!id && pets.some(p=>p.id===id);
}
const __npGetRoutineV20=getRoutineV6, __npSaveRoutineV20=saveRoutineV6;
const __npGetNeedsV20=getNeedsV6, __npSaveNeedsV20=saveNeedsV6;
const __npGetPlanV20=getPlanV6, __npSavePlanV20=savePlanV6;
getRoutineV6=function(){return npHasActivePetV20()?__npGetRoutineV20():[]};
saveRoutineV6=function(items){if(npHasActivePetV20())__npSaveRoutineV20(items)};
getNeedsV6=function(){return npHasActivePetV20()?__npGetNeedsV20():[]};
saveNeedsV6=function(items){if(npHasActivePetV20())__npSaveNeedsV20(items)};
getPlanV6=function(){return npHasActivePetV20()?__npGetPlanV20():[]};
savePlanV6=function(items){if(npHasActivePetV20())__npSavePlanV20(items)};
getRoutine=function(){return getRoutineV6()}; saveRoutine=function(items){saveRoutineV6(items)};
getPlan=function(){return getPlanV6()}; savePlan=function(items){savePlanV6(items)};

function cleanupPetStateV20(id){
  if(!id)return;
  ['npRoutine:','npNeeds:','npPlan:','npPurchaseHistory:','npLastPurchase:'].forEach(prefix=>localStorage.removeItem(prefix+id));
  sessionStorage.removeItem(`npCheckoutOpened:${id}`);
  sessionStorage.removeItem(`npCheckoutSignature:${id}`);
}
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-remove-pet-v6]');
  if(btn)cleanupPetStateV20(btn.dataset.removePetV6);
},true);

// ---------- current products: repeat-purchase toggle instead of forcing re-entry ----------
renderMatchCurrentV6=function(){
  const host=document.getElementById('match6Current');if(!host)return;
  const items=getRoutineV6();host.innerHTML='';
  if(!items.length){
    host.innerHTML=`<div class="match6-current-item match20-current-empty"><div></div><div><strong>${t('Nothing fixed yet','Noch nichts festgelegt')}</strong><span>${t('Tap a need below to add something.','Tippe unten auf einen Bereich.')}</span></div><div></div></div>`;
    return;
  }
  items.forEach(item=>{
    const inCart=item.buyNow!==false;
    const row=document.createElement('div');row.className='match6-current-item match20-current-item';
    row.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div class="match20-current-copy"><strong>${routineItemLabelV6(item)}</strong><span>${routineTypeLabel(item.type)} · ${item.locked?'🔒 '+t('keep','behalten'):t('alternatives allowed','Alternativen möglich')}</span><button type="button" class="match20-cart-toggle ${inCart?'in-cart':''}" data-match-buy-toggle="${item.id}">${inCart?t('In this cart ✓','In diesem Warenkorb ✓'):t('Add for today','Für heute hinzufügen')}</button></div><button class="match20-current-remove" data-match-current-remove="${item.id}" aria-label="${t('Remove from profile','Aus Profil entfernen')}">×</button>`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-match-buy-toggle]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.matchBuyToggle;
    saveRoutineV6(getRoutineV6().map(x=>x.id===id?{...x,buyNow:x.buyNow===false}:x));
    renderMatchCurrentV6();refreshNavCartCountV6();renderHeroBasketV8();renderMatchOrbitV6();
    showToastV6(t('Shopping cart updated. The saved pet routine stays unchanged.','Warenkorb aktualisiert. Der gespeicherte Tier-Alltag bleibt unverändert.'));
  }));
  host.querySelectorAll('[data-match-current-remove]').forEach(b=>b.addEventListener('click',()=>{
    saveRoutineV6(getRoutineV6().filter(x=>x.id!==b.dataset.matchCurrentRemove));
    renderMatchCurrentV6();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();
  }));
};

// Store the originating need on exact products created from Pet Match.
addCurrentProductV6=function(){
  const name=(document.getElementById('v6NeedName')?.value||'').trim();if(!name)return;
  const type=document.getElementById('v6NeedType')?.value||'food';
  const locked=!!document.getElementById('v6KeepExact')?.checked;
  const buyNow=!!document.getElementById('v6BuyNow')?.checked;
  const needKey=npV6CurrentNeed||null, needId=needKey?'n-'+needKey:null;
  if(needId){
    saveNeedsV6(getNeedsV6().filter(n=>n.id!==needId));
    savePlanV6(getPlanV6().filter(x=>x.sourceNeed!==needId));
  }
  const items=getRoutineV6();
  items.push({id:'r'+Date.now(),type,name,nameDe:name,img:routineIcon(type),locked,buyNow,needKey});
  saveRoutineV6(items);
  renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();closeNeedModalV6();
};

// ---------- one semantic choice per need; no duplicate orbit/category nodes ----------
function removePlanChoiceV20(id){
  const item=getPlanV6().find(x=>x.id===id);
  if(item?.sourceNeed)saveNeedsV6(getNeedsV6().filter(n=>n.id!==item.sourceNeed));
  savePlanV6(getPlanV6().filter(x=>x.id!==id));
}

renderMatchSelectedV9=function(){
  const host=document.getElementById('match9Selected'),wrap=document.getElementById('match9SelectedWrap');
  if(!host||!wrap)return;
  const items=getPlanV6();host.innerHTML='';
  if(!items.length){wrap.style.display='none';return}
  wrap.style.display='block';
  items.forEach(item=>{
    const nm=npLang==='de'?(item.nameDe||item.name):item.name;
    const row=document.createElement('div');row.className='match9-selected-item';
    row.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div><strong>${nm}</strong><span>${t('Selected recommendation · this shopping trip','Gewählte Empfehlung · dieser Einkauf')}</span></div><button data-match9-remove="${item.id}" aria-label="${t('Remove from this shopping trip','Aus diesem Einkauf entfernen')}">×</button>`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-match9-remove]').forEach(b=>b.addEventListener('click',()=>{
    removePlanChoiceV20(b.dataset.match9Remove);
    renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();
  }));
};

renderMatchOrbitV6=function(){
  const orbit=document.getElementById('match6Orbit');if(!orbit)return;
  hydrateActivePetV6();orbit.querySelectorAll('.match6-node').forEach(x=>x.remove());
  const routine=getRoutineV6();const plan=getPlanV6();
  const linkedNeeds=new Set(plan.map(x=>x.sourceNeed).filter(Boolean));
  const openNeeds=getNeedsV6().filter(x=>!linkedNeeds.has(x.id));
  const items=[...routine.map(x=>({...x,source:'routine'})),...plan.map(x=>({...x,source:'plan',locked:false})),...openNeeds.map(x=>({...x,source:'need'}))];
  items.slice(0,8).forEach((item,i)=>{
    const node=document.createElement('div');node.className='match6-node';Object.assign(node.style,npV6OrbitPositions[i]);
    node.title=routineItemLabelV6(item);node.dataset.source=item.source;node.dataset.itemId=item.id;
    node.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><button data-match-node-remove="${item.id}" data-source="${item.source}">×</button>${item.locked?'<span class="lock">🔒</span>':item.source==='plan'?'<span class="lock" style="background:var(--coral)">✓</span>':''}`;
    orbit.appendChild(node);
  });
  orbit.querySelectorAll('[data-match-node-remove]').forEach(b=>b.addEventListener('click',()=>{
    const source=b.dataset.source,id=b.dataset.matchNodeRemove;
    if(source==='routine')saveRoutineV6(getRoutineV6().filter(x=>x.id!==id));
    else if(source==='plan')removePlanChoiceV20(id);
    else saveNeedsV6(getNeedsV6().filter(x=>x.id!==id));
    renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();
  }));
  const score=document.querySelector('[data-match6-score]');if(score)score.textContent=Math.min(97,84+Math.min(items.length,6)*2);
  const insight=document.getElementById('match6Insight');
  if(insight){
    const fixed=routine.filter(x=>x.locked),chosen=plan;
    if(chosen.length)insight.innerHTML=`<strong>${t('Recommendation selected','Empfehlung gewählt')}</strong>${t(` ${chosen.length} recommendation${chosen.length===1?' is':'s are'} in this shopping trip and will also appear in the cart.`,` ${chosen.length} Empfehlung${chosen.length===1?' ist':'en sind'} in diesem Einkauf gewählt und erscheint ebenfalls im Warenkorb.`)}`;
    else if(fixed.length)insight.innerHTML=`<strong>${t('Your usuals stay','Gewohnte Produkte bleiben')}</strong>${t(' NoevaPet keeps the products you locked and only optimises around them.',' NoevaPet lässt deine fest markierten Produkte unverändert und optimiert nur drumherum.')}`;
    else insight.innerHTML=`<strong>${t('Open for suggestions','Offen für Vorschläge')}</strong>${t(' Add an exact product whenever there is something you do not want NoevaPet to replace.',' Trage ein genaues Produkt ein, sobald NoevaPet etwas nicht ersetzen soll.')}`;
  }
};

// Result/compare additions replace the existing choice for the same need instead of duplicating it.
addPlanItem=function(btn){
  const id=btn.dataset.id||('i'+Date.now());
  const sourceNeed=btn.dataset.sourceNeed||null;
  let items=getPlanV6();
  if(sourceNeed)items=items.filter(x=>x.sourceNeed!==sourceNeed && x.id!==id);
  else if(items.some(x=>x.id===id)){
    btn.textContent=t('Added ✓','Hinzugefügt ✓');btn.classList.add('primary');updateResultsNextV18();return;
  }
  const next={id,name:btn.dataset.name,nameDe:btn.dataset.nameDe||btn.dataset.name,subtitle:btn.dataset.subtitle,subtitleDe:btn.dataset.subtitleDe||btn.dataset.subtitle,img:btn.dataset.img,zone:btn.dataset.zone||'zone-now',type:btn.dataset.type||'other',price:Number(btn.dataset.price||0)};
  if(sourceNeed)next.sourceNeed=sourceNeed;
  items.push(next);savePlanV6(items);
  btn.textContent=t('Added ✓','Hinzugefügt ✓');btn.classList.add('primary');
  renderPlan();refreshNavCartCountV6();renderMatchSelectedV9();renderMatchOrbitV6();renderHeroBasketV8();updateResultsNextV18();
};

// ---------- contextual result page: reasons and alternatives follow the actual need ----------
const npV20ResultCopy={
  dry:{de:['Passt zu Alltag, Größe und Aktivität deines Tiers.','Berücksichtigt die Angaben im Tierprofil, ohne das Futter unnötig kompliziert zu machen.','Gute Balance aus Verfügbarkeit und Gesamtkosten.'],en:['Fits your pet’s everyday routine, size and activity.','Uses the pet profile without making everyday food unnecessarily complicated.','Good balance of availability and total cost.']},
  wet:{de:['Passt als Nassfutter-Option zu Alltag und Profil deines Tiers.','Achtet auf eine alltagstaugliche Zusammensetzung und einfache Fütterung.','Gute Balance aus Verfügbarkeit und Gesamtkosten.'],en:['Fits as a wet-food option for your pet’s routine and profile.','Prioritises an everyday composition and easy feeding.','Good balance of availability and total cost.']},
  treats:{de:['Passt als kleine Belohnung zu Alltag und Aktivität.','Portionierbar und ohne unnötige Produktkomplexität.','Gute Verfügbarkeit bei vernünftigen Gesamtkosten.'],en:['Fits as a small reward for everyday activity.','Easy to portion without unnecessary product complexity.','Good availability at a sensible total cost.']},
  dental:{de:['Passt als einfache Zahnpflege in den Alltag.','Lässt sich regelmäßig einsetzen, ohne eine komplizierte Routine zu schaffen.','Gute Balance aus Nutzen, Verfügbarkeit und Kosten.'],en:['Fits as simple dental care in the everyday routine.','Easy to use regularly without creating a complicated routine.','Good balance of usefulness, availability and cost.']},
  coat:{de:['Passt als unkomplizierte Fell- und Hautpflege in den Alltag.','Berücksichtigt die Angaben im Profil, ohne unnötig viele Pflegeschritte.','Gute Balance aus Nutzen, Verfügbarkeit und Kosten.'],en:['Fits as straightforward coat and skin care in the routine.','Uses the profile without adding unnecessary care steps.','Good balance of usefulness, availability and cost.']},
  walk:{de:['Passt zu Größe, Aktivität und Alltag deines Tiers.','Setzt auf einen einfachen, gut nutzbaren Spaziergangs-Alltag.','Gute Balance aus Komfort, Haltbarkeit und Kosten.'],en:['Fits your pet’s size, activity and daily routine.','Prioritises an easy, practical walking setup.','Good balance of comfort, durability and cost.']},
  play:{de:['Passt zu Aktivität und Beschäftigungsbedarf im Alltag.','Einfach einzusetzen, ohne unnötig viele Spielprodukte.','Gute Balance aus Nutzen, Haltbarkeit und Kosten.'],en:['Fits everyday activity and enrichment needs.','Easy to use without adding unnecessary toys.','Good balance of usefulness, durability and cost.']},
  training:{de:['Passt zu kurzen, alltagstauglichen Trainingseinheiten.','Unterstützt klare Routinen statt unnötig vieler Hilfsmittel.','Gute Balance aus Nutzen und Gesamtkosten.'],en:['Fits short, practical everyday training sessions.','Supports clear routines instead of unnecessary gear.','Good balance of usefulness and total cost.']},
  vet:{de:['Passt als kleine Pflege-Basis für den Alltag.','Konzentriert sich auf sinnvolle Grundausstattung statt Produktfülle.','Gute Balance aus Nutzen, Verfügbarkeit und Kosten.'],en:['Fits as a small everyday care baseline.','Focuses on useful basics rather than product overload.','Good balance of usefulness, availability and cost.']},
  sleep:{de:['Passt als ruhiger Rückzugsort zu Alltag und Größe deines Tiers.','Setzt auf Komfort und einfache Pflege statt unnötiger Extras.','Gute Balance aus Haltbarkeit und Gesamtkosten.'],en:['Fits as a calm resting place for your pet’s routine and size.','Prioritises comfort and easy care over unnecessary extras.','Good balance of durability and total cost.']},
  travel:{de:['Passt zu kurzen Ausflügen und dem Alltag unterwegs.','Konzentriert sich auf die wichtigsten Transport- und Reisehelfer.','Gute Balance aus Einfachheit, Nutzen und Kosten.'],en:['Fits short trips and everyday travel.','Focuses on the most useful transport and travel essentials.','Good balance of simplicity, usefulness and cost.']}
};

const __npHydrateResultsV20=hydrateResultsV19;
hydrateResultsV19=function(){
  __npHydrateResultsV20();
  const btn=document.getElementById('result19Add');if(!btn)return;
  let key=localStorage.getItem('npLastNeedV19');if(!key){const needs=getNeedsV6();key=needs.length?needKeyFromIdV19(needs[needs.length-1].id):'dry'}
  if(!npV19Recommendations[key])key='dry';
  btn.dataset.sourceNeed='n-'+key;
  const copy=npV20ResultCopy[key]||npV20ResultCopy.dry;
  document.querySelectorAll('.v13-results-page .reason span').forEach((el,i)=>{if(copy[npLang==='de'?'de':'en'][i])el.textContent=copy[npLang==='de'?'de':'en'][i]});
  const alts=document.querySelectorAll('.v13-results-page .result-layout>div .card');
  if(alts[0]){alts[0].querySelector('p').textContent=t('A little cheaper, with a slightly more basic fit for this need.','Etwas günstiger, dafür bei diesem Bedarf etwas einfacher passend.');}
  if(alts[1]){alts[1].querySelector('p').textContent=t('More premium, but without enough extra benefit for this pet to make it the first choice.','Hochwertiger, aber ohne genügend Zusatznutzen für dieses Tier, um die erste Wahl zu sein.');}
};

// ---------- comparison follows the recommendation category instead of always comparing food ----------
function currentNeedKeyV20(){
  let key=localStorage.getItem('npLastNeedV19');
  if(!key){const needs=getNeedsV6();key=needs.length?needKeyFromIdV19(needs[needs.length-1].id):'dry'}
  return npV19Recommendations[key]?key:'dry';
}
const npV20CompareNames={
  dry:{de:['Ausgewogenes Trockenfutter','Preisbewusstes Trockenfutter','Premium Sensitive Trockenfutter'],en:['Balanced dry food','Value dry food','Premium sensitive dry food']},
  wet:{de:['Sanftes Nassfutter','Alltags-Nassfutter','Premium Monoprotein Nassfutter'],en:['Gentle wet food','Everyday wet food','Premium single-protein wet food']},
  treats:{de:['Kleine Trainingssnacks','Preisbewusste Belohnungssnacks','Premium Soft-Snacks'],en:['Small training treats','Value reward treats','Premium soft treats']},
  dental:{de:['Zahnpflege-Kausnack','Preisbewusste Dentalsticks','Premium Zahnpflege-Kausnacks'],en:['Everyday dental chew','Value dental sticks','Premium dental chews']},
  coat:{de:['Sanfte Fellpflege','Alltags-Pflegespray','Premium Sensitive Fellpflege'],en:['Gentle coat care','Everyday grooming spray','Premium sensitive coat care']},
  walk:{de:['Alltagsgeschirr-Set','Einfaches Spaziergangs-Set','Komfort-Geschirr-Set'],en:['Everyday harness set','Simple walking set','Comfort harness set']},
  play:{de:['Beschäftigungsspielzeug','Einfaches Alltagsspielzeug','Premium Denkspielzeug'],en:['Enrichment toy','Simple everyday toy','Premium puzzle toy']},
  training:{de:['Training-Starterset','Einfaches Trainingsset','Premium Trainingsset'],en:['Training starter set','Simple training kit','Premium training kit']},
  vet:{de:['Pflege-Basisset','Einfaches Pflegeset','Premium Pflegeset'],en:['Everyday care set','Basic care set','Premium care set']},
  sleep:{de:['Ruhige Schlafmatte','Einfache Ruhe-Matte','Komfort-Schlafplatz'],en:['Calm sleep mat','Simple rest mat','Comfort sleep bed']},
  travel:{de:['Reise-Basisset','Einfaches Reiseset','Komfort-Reiseset'],en:['Travel essentials set','Basic travel kit','Comfort travel set']}
};
function hydrateCompareV20(){
  const buttons=[...document.querySelectorAll('[data-compare9-select]')];if(buttons.length!==3)return;
  const key=currentNeedKeyV20(),base=recommendationForNeedV19(key),names=npV20CompareNames[key]||npV20CompareNames.dry;
  const prices=[base.price,Math.max(1,base.price*.82),base.price*1.22];
  const variants=['best','value','premium'];
  buttons.forEach((b,i)=>{
    const id=`cmp-${key}-${variants[i]}`,nameEn=names.en[i],nameDe=names.de[i];
    Object.assign(b.dataset,{id,name:nameEn,nameDe,subtitle:`${base.subtitle} · comparison`,subtitleDe:`${base.subtitleDe} · Vergleich`,img:base.img,type:base.type,price:prices[i].toFixed(2),sourceNeed:'n-'+key,variant:variants[i]});
    const strong=b.querySelector('strong'),price=b.querySelector('.compare9-price'),img=b.querySelector('img');
    if(strong)strong.textContent=npLang==='de'?nameDe:nameEn;if(price)price.textContent=`€${prices[i].toFixed(2)}`;if(img)img.src=base.img;
  });
  const table=document.querySelector('.compare9-table');
  if(table&&table.children.length>=20){
    table.children[8].textContent=t('Important difference','Wichtiger Unterschied');
    [t('Best overall fit','Beste Gesamtpassung'),t('Solid, more basic fit','Solide, einfachere Passung'),t('Very good, more premium','Sehr gut, hochwertiger')].forEach((v,i)=>table.children[9+i].textContent=v);
    table.children[12].textContent=t('Price level','Preisniveau');
    [t('balanced','ausgewogen'),t('lower','niedriger'),t('higher','höher')].forEach((v,i)=>table.children[13+i].textContent=v);
    table.children[16].textContent=t('Why choose it?','Warum wählen?');
    [t('Best balance of fit and overall value.','Beste Balance aus Passung und Gesamtwert.'),t('Lower price while keeping a sensible fit.','Niedrigerer Preis bei weiterhin sinnvoller Passung.'),t('Premium choice when added comfort or quality matters more than price.','Premium-Auswahl, wenn zusätzlicher Komfort oder Qualität wichtiger ist als der Preis.')].forEach((v,i)=>table.children[17+i].textContent=v);
  }
  selectCompare9(buttons[0],false);
}
compare9Data=function(btn){return {id:btn.dataset.id,name:btn.dataset.name,nameDe:btn.dataset.nameDe||btn.dataset.name,subtitle:btn.dataset.subtitle,subtitleDe:btn.dataset.subtitleDe||btn.dataset.subtitle,img:btn.dataset.img,zone:'zone-now',type:btn.dataset.type||'other',price:Number(btn.dataset.price||0),sourceNeed:btn.dataset.sourceNeed||null,variant:btn.dataset.variant||'best'}};
compare9Reason=function(id){
  if(String(id).endsWith('-value'))return t('Lower price while keeping a sensible fit.','Niedrigerer Preis bei weiterhin sinnvoller Passung.');
  if(String(id).endsWith('-premium'))return t('Premium choice when added comfort or quality matters more than price.','Premium-Auswahl, wenn zusätzlicher Komfort oder Qualität wichtiger ist als der Preis.');
  return t('Best balance of fit and overall value.','Beste Balance aus Passung und Gesamtwert.');
};
saveCompareChoice9=function(choice){
  const sourceNeed=choice.sourceNeed||('n-'+currentNeedKeyV20());
  const key=needKeyFromIdV19(sourceNeed),defaultId=recommendationForNeedV19(key).id;
  let items=getPlanV6().filter(x=>x.sourceNeed!==sourceNeed && x.id!==defaultId && !String(x.id).startsWith(`cmp-${key}-`));
  items.push({...choice,sourceNeed});savePlanV6(items);
  refreshNavCartCountV6();renderMatchSelectedV9();renderMatchOrbitV6();renderHeroBasketV8();
};
const __npInitCompareV20=initCompare9;
initCompare9=function(){hydrateCompareV20();__npInitCompareV20();hydrateCompareV20()};

// ---------- checkout session belongs to one exact cart + purchase-mode signature ----------
function checkoutSignatureV20(){
  const id=npV6ActivePetId(),mode=__npV6PurchaseMode||sessionStorage.getItem('npPurchaseModeV6')||'balance';
  const items=getCartItemsV6().map(x=>({id:x.cartId||x.id,price:Number(x.price||0)})).sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  return JSON.stringify({id,mode,items});
}
function ensureCheckoutSessionV20(){
  const id=npV6ActivePetId();if(!id)return [];
  const sigKey=`npCheckoutSignature:${id}`,openKey=`npCheckoutOpened:${id}`,sig=checkoutSignatureV20(),stored=sessionStorage.getItem(sigKey);
  if(stored!==sig){sessionStorage.setItem(sigKey,sig);sessionStorage.removeItem(openKey);return []}
  try{const x=JSON.parse(sessionStorage.getItem(openKey));return Array.isArray(x)?x:[]}catch(e){return[]}
}
openedRetailersV8=function(){return ensureCheckoutSessionV20()};
saveOpenedRetailersV8=function(opened){
  const id=npV6ActivePetId();if(!id)return;
  sessionStorage.setItem(`npCheckoutSignature:${id}`,checkoutSignatureV20());
  sessionStorage.setItem(`npCheckoutOpened:${id}`,JSON.stringify([...new Set(opened)]));
};

// ---------- short check shows the real basket and route, not inert placeholder rows ----------
function renderPurchaseReviewV20(){
  const list=document.querySelector('[data-v6-stage="3"] .review6-list');if(!list)return;
  const items=getCartItemsV6(),groups=purchaseRouteGroupsV19(items,__npV6PurchaseMode),pet=npV6ActivePet();
  const itemRows=items.map(x=>{const nm=npLang==='de'?(x.nameDe||x.name):x.name;return `<div class="review20-product"><img src="${x.img||routineIcon(x.type)}" alt=""><div><strong>${nm}</strong><span>${x.source==='plan'?t('Recommendation','Empfehlung'):t('Selected current product','Gewähltes aktuelles Produkt')}</span></div><b>€${Number(x.price||0).toFixed(2)}</b></div>`}).join('');
  list.innerHTML=`<div class="review20-block"><div class="review20-title"><span>${t('Shopping for','Einkauf für')}</span><strong>${pet.name||''}</strong></div>${itemRows}</div><div class="review20-summary"><div><strong>${groups.length} ${groups.length===1?t('retailer','Händler'):t('retailers','Händler')}</strong><span>${groups.length===1?t('one checkout route','ein Checkout-Weg'):t('separate retailer checkouts','getrennte Händler-Checkouts')}</span></div><div><strong>${groups.length} ${groups.length===1?t('delivery route','Lieferweg'):t('delivery routes','Lieferwege')}</strong><span>${t('shipping and payment remain with the retailer','Versand und Zahlung bleiben beim Händler')}</span></div></div>`;
}
const __npShowPurchaseStageV20=showPurchaseStageV6;
showPurchaseStageV6=function(n){
  __npShowPurchaseStageV20(n);
  if(Number(n)===3)renderPurchaseReviewV20();
  if(Number(n)===4)renderCheckoutHubV19();
};

// ---------- receipt remembers which retailer each product was handed to ----------
renderReceiptV18=function(record){
  const host=document.getElementById('checkout18Receipt');if(!host||!record)return;
  const items=record.items||[],route=record.route||[];
  const byRetailer=route.length?route.map(g=>{
    const retailerItems=items.filter(x=>x.retailer===g.id);
    return `<div class="checkout20-retailer"><div class="checkout20-retailer-head"><strong>${t('Retailer','Händler')} ${g.id}</strong><b>€${Number(g.subtotal||0).toFixed(2)}</b></div>${retailerItems.map(x=>`<div class="checkout18-item"><img src="${x.img||routineIcon(x.type)}" alt=""><div><strong>${npLang==='de'?(x.nameDe||x.name):(x.name||x.nameDe)}</strong><span>${x.source==='plan'?t('Selected recommendation','Gewählte Empfehlung'):t('Usual / selected product','Gewohntes / gewähltes Produkt')}</span></div><b>€${Number(x.optimizedPrice??x.price??0).toFixed(2)}</b></div>`).join('')}</div>`;
  }).join(''):items.map(x=>`<div class="checkout18-item"><img src="${x.img||routineIcon(x.type)}" alt=""><div><strong>${npLang==='de'?(x.nameDe||x.name):(x.name||x.nameDe)}</strong></div><b>€${Number(x.price||0).toFixed(2)}</b></div>`).join('');
  host.innerHTML=`<div class="checkout18-top"><div><span>${t('Pet','Tier')}</span><strong>${record.pet_name||''}</strong></div><div><span>${t('Date','Datum')}</span><strong>${formatDateV18(record.confirmed_at)}</strong></div><div><span>${t('Confirmed plan total','Bestätigter Kaufplan')}</span><strong>€${Number(record.plan_total||0).toFixed(2)}</strong></div></div><div class="checkout18-items checkout20-route">${byRetailer}</div><p class="checkout18-disclaimer">${t('Recorded because you confirmed the retailer checkouts as completed. NoevaPet cannot independently verify retailer payment.','Gespeichert, weil du die Händler-Checkouts als abgeschlossen bestätigt hast. NoevaPet kann die Zahlung beim Händler nicht unabhängig verifizieren.')}</p>`;
};

completeCheckoutV7=function(){
  const targets=retailerTargetsV6(),opened=openedRetailersV8().filter(x=>targets.includes(x));
  if(targets.some(id=>!opened.includes(id))){showToastV6(t('Open every required retailer cart before closing this shopping session.','Öffne zuerst alle benötigten Händler-Warenkörbe, bevor du diesen Einkauf abschließt.'));return}
  const snapshot=getCartItemsV6(),p=npV6ActivePet(),nums=purchaseNumbersV18(snapshot,__npV6PurchaseMode),groups=purchaseRouteGroupsV19(snapshot,__npV6PurchaseMode);
  const assignment=new Map();groups.forEach(g=>g.items.forEach(x=>assignment.set(x.cartId||x.id,{retailer:g.id,optimizedPrice:Number(x.optimizedPrice||x.price||0)})));
  const record={id:'purchase-'+Date.now(),confirmed_at:new Date().toISOString(),pet_id:p.id,pet_name:p.name||'',mode:__npV6PurchaseMode,total:nums.total,saving:nums.saving,plan_total:nums.planTotal,retailers:groups.map(g=>g.id),route:groups.map(g=>({id:g.id,subtotal:Number(g.subtotal||0)})),items:snapshot.map(x=>{const a=assignment.get(x.cartId||x.id)||{};return {id:x.id,name:x.name,nameDe:x.nameDe||x.name,price:Number(x.price||0),optimizedPrice:Number(a.optimizedPrice??x.price??0),retailer:a.retailer||'',source:x.source,type:x.type||'other',img:x.img||routineIcon(x.type)}})};
  localStorage.setItem(`npLastPurchase:${p.id}`,JSON.stringify(record));savePurchaseHistoryV18(p.id,record);
  // Close only the shopping trip. Saved current products remain in the pet routine for easy re-ordering.
  saveRoutineV6(getRoutineV6().map(x=>({...x,buyNow:false})));savePlanV6([]);saveNeedsV6([]);
  localStorage.removeItem('npLastNeedV19');
  sessionStorage.removeItem(`npCheckoutOpened:${p.id}`);sessionStorage.removeItem(`npCheckoutSignature:${p.id}`);
  refreshNavCartCountV6();
  document.getElementById('checkout8Shell')?.setAttribute('style','display:none');document.getElementById('checkout7Done')?.classList.add('show');document.body.classList.add('checkout-done8');
  renderReceiptV18(record);const link=document.getElementById('checkout18PetLink');if(link)link.href='pets.html#purchase-history';
};

// Purchase history heading matches the actual multi-pet list.
const __npRenderHistoryV20=renderPurchaseHistoryV18;
renderPurchaseHistoryV18=function(){
  __npRenderHistoryV20();
  const section=document.getElementById('purchase-history');if(!section||section.hidden)return;
  const h=section.querySelector('h2');const p=section.querySelector('.section-head>p');
  if(h)h.textContent=t('Your recent shopping summaries.','Deine letzten Einkaufsübersichten.');
  if(p)p.textContent=t('Completed retailer checkouts are stored here with the pet, products and confirmed buying plan.','Abgeschlossene Händler-Checkouts werden hier mit Tier, Produkten und bestätigtem Kaufplan gespeichert.');
};

// Final hydration order: make every dependent surface read the same state.
document.addEventListener('DOMContentLoaded',()=>{
  hydrateActivePetV6();renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();hydrateResultsV19();renderPurchaseHistoryV18();
  if(document.querySelector('.purchase6-stepper')){renderCartV6();updatePurchaseOptionV6(sessionStorage.getItem('npPurchaseModeV6')||'balance');renderPurchaseReviewV20();}
});

// Preserve the user's chosen purchase mode across reloads and cart refreshes.
__npV6PurchaseMode=sessionStorage.getItem('npPurchaseModeV6')||__npV6PurchaseMode||'balance';
const __npRenderCartV20=renderCartV6;
renderCartV6=function(){
  const desired=sessionStorage.getItem('npPurchaseModeV6')||__npV6PurchaseMode||'balance';
  __npRenderCartV20();
  if(__npV6PurchaseMode!==desired)updatePurchaseOptionV6(desired);
  const empty=getCartItemsV6().length===0,btn=document.querySelector('[data-v6-next="2"]');
  if(btn){btn.disabled=empty;btn.setAttribute('aria-disabled',empty?'true':'false')}
};


// ===========================================================
// NOEVAPET V21 — FINAL DEPLOYMENT REFINEMENT PASS
// ===========================================================

function orbitLabelV21(item){
  const raw=npLang==='de'?(item.nameDe||item.name||''):(item.name||item.nameDe||'');
  const tidy=String(raw).replace(/\s*·.*$/,'').trim();
  return tidy.length>18?tidy.slice(0,17)+'…':tidy;
}

function renderMatchSummaryV21(){
  const col=document.querySelector('.v14-orbit-col'); if(!col) return;
  let box=document.getElementById('match21Summary');
  if(!box){
    box=document.createElement('div');
    box.id='match21Summary';
    box.className='match21-summary';
    const hand=col.querySelector('.match6-hand');
    if(hand) col.insertBefore(box, hand); else col.appendChild(box);
  }
  const items=getCartItemsV6();
  if(!items.length){ box.hidden=true; box.innerHTML=''; return; }
  box.hidden=false;
  const total=items.reduce((sum,item)=>sum+Number(item.price||0),0);
  const title=t('Selected for this shopping trip','Für diesen Einkauf gewählt');
  const sub=t(`${items.length} item${items.length===1?'':'s'} already continue into the cart.`,`${items.length} Produkt${items.length===1?'':'e'} gehen bereits in den Warenkorb weiter.`);
  box.innerHTML=`<div class="match21-summary-head"><strong>${title}</strong><span>${sub}</span></div>
    <div class="match21-summary-items">${items.slice(0,4).map(item=>{
      const nm=npLang==='de'?(item.nameDe||item.name):item.name;
      const sub=item.source==='plan'?t('selected recommendation','gewählte Empfehlung'):t('your selected product','dein gewähltes Produkt');
      return `<div class="match21-summary-item"><img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div><strong>${nm}</strong><span>${sub}</span></div><b>€${Number(item.price||0).toFixed(2)}</b></div>`;
    }).join('')}</div>
    <div class="match21-summary-foot"><span>${t('Current cart total','Aktueller Warenkorb')} · €${total.toFixed(2)}</span><a class="pill warm-cta" href="basket.html">${t('Open cart','Warenkorb öffnen')} →</a></div>`;
}

renderMatchOrbitV6=function(){
  const orbit=document.getElementById('match6Orbit');if(!orbit)return;
  hydrateActivePetV6();
  orbit.querySelectorAll('.match6-node').forEach(x=>x.remove());
  const items=[
    ...getRoutineV6().map(x=>({...x,source:'routine'})),
    ...getPlanV6().map(x=>({...x,source:'plan',locked:false})),
    ...getNeedsV6().map(x=>({...x,source:'need'}))
  ];
  items.slice(0,8).forEach((item,i)=>{
    const node=document.createElement('div');node.className='match6-node';Object.assign(node.style,npV6OrbitPositions[i]);
    node.title=npLang==='de'?(item.nameDe||item.name):(item.name||item.nameDe);
    node.dataset.source=item.source;
    node.dataset.itemId=item.id;
    node.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><span class="match21-node-label">${orbitLabelV21(item)}</span><button data-match-node-remove="${item.id}" data-source="${item.source}">×</button>${item.locked?'<span class="lock">🔒</span>':item.source==='plan'?'<span class="lock" style="background:var(--v13-teal)">✓</span>':''}`;
    orbit.appendChild(node);
  });
  orbit.querySelectorAll('[data-match-node-remove]').forEach(b=>b.addEventListener('click',()=>{
    const source=b.dataset.source,id=b.dataset.matchNodeRemove;
    if(source==='routine')saveRoutineV6(getRoutineV6().filter(x=>x.id!==id));
    else if(source==='plan')savePlanV6(getPlanV6().filter(x=>x.id!==id));
    else saveNeedsV6(getNeedsV6().filter(x=>x.id!==id));
    renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();
  }));
  const score=document.querySelector('[data-match6-score]');
  if(score)score.textContent=Math.min(97,84+Math.min(items.length,6)*2);
  const insight=document.getElementById('match6Insight');
  if(insight){
    const fixed=getRoutineV6().filter(x=>x.locked);
    const chosen=getPlanV6();
    if(chosen.length){
      insight.innerHTML=`<strong>${t('Recommendation selected','Empfehlung gewählt')}</strong>${t(` ${chosen.length} recommendation${chosen.length===1?' is':'s are'} in this shopping trip and will also appear in the cart.`,` ${chosen.length} Empfehlung${chosen.length===1?' ist':'en sind'} in diesem Einkauf gewählt und erscheint ebenfalls im Warenkorb.`)}`;
    }else if(fixed.length){
      insight.innerHTML=`<strong>${t('Your usuals stay','Gewohnte Produkte bleiben')}</strong>${t(' NoevaPet keeps the products you locked and only optimises around them.',' NoevaPet lässt deine fest markierten Produkte unverändert und optimiert nur drumherum.')}`;
    }else{
      insight.innerHTML=`<strong>${t('Open for suggestions','Offen für Vorschläge')}</strong>${t(' Add an exact product whenever there is something you do not want NoevaPet to replace.',' Trage ein genaues Produkt ein, sobald NoevaPet etwas nicht ersetzen soll.')}`;
    }
  }
  renderMatchSummaryV21();
};

function heroBasketPreviewLimitV21(items){return items.length>=4?4:Math.min(items.length,3)}
const __npHeroV21Base=renderHeroBasketV8;
renderHeroBasketV8=function(){
  const lines=document.getElementById('hero8BasketLines');if(!lines)return;
  const basket=lines.closest('.hero6-basket');
  const pets=npV6Pets();
  if(!pets.length){ if(basket)basket.hidden=true; return; }
  if(basket)basket.hidden=false;
  const p=npV6ActivePet();
  const title=document.getElementById('hero8BasketTitle');
  const footer=document.getElementById('hero8BasketFooter');
  const cta=document.getElementById('hero8BasketCta');
  if(title)title.textContent=heroBasketTitleV8(p);
  document.querySelectorAll('[data-active-pet-meta]').forEach(el=>el.textContent=npV6PetMeta(p));
  const items=getCartItemsV6();
  lines.innerHTML='';
  basket?.classList.toggle('hero19-single',items.length===1);
  basket?.classList.toggle('has-four',items.length>=4);
  if(!items.length){
    lines.innerHTML=`<div class="hero8-empty"><strong>${t('Nothing in the cart yet','Noch nichts im Warenkorb')}</strong><span>${t('Start in Pet Match and add only what matters for this shopping trip.','Starte in Pet Match und füge nur hinzu, was für diesen Einkauf relevant ist.')}</span></div>`;
    if(footer)footer.textContent=t('NoevaPet builds the buying route after you add something.','NoevaPet baut den Kaufweg, sobald du etwas hinzufügst.');
    if(cta){cta.href='tool.html';cta.textContent=`Pet Match →`;}
    return;
  }
  items.slice(0,heroBasketPreviewLimitV21(items)).forEach(item=>{
    const name=npLang==='de'?(item.nameDe||item.name):item.name;
    const sub=item.source==='routine'
      ? (item.locked?t('kept as usual','bleibt wie gewohnt'):t('current product','aktuelles Produkt'))
      : t('selected recommendation','gewählte Empfehlung');
    const div=document.createElement('div');div.className='hero6-line';
    div.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div><strong>${name}</strong><span>${sub}</span><div class="hero8-item-price">€${Number(item.price||0).toFixed(2)}</div></div>`;
    lines.appendChild(div);
  });
  if(items.length>4){
    const more=document.createElement('div');more.className='hero6-line';
    more.innerHTML=`<div style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#EAF4EF;color:var(--teal-dark);font-weight:900">+${items.length-4}</div><div><strong>${t('More in the cart','Weitere im Warenkorb')}</strong><span>${t('Open the cart to review','Im Warenkorb prüfen')}</span></div>`;
    lines.appendChild(more);
  }
  if(footer)footer.textContent=t(`${items.length} item${items.length===1?'':'s'} ready for the buying plan.`,`${items.length} Produkt${items.length===1?'':'e'} bereit für den Kaufplan.`);
  if(cta){cta.href='basket.html';cta.textContent=`${t('View cart','Warenkorb ansehen')} →`;}
};

renderPurchaseHistoryV18=function(){
  const section=document.getElementById('purchase-history');const host=document.getElementById('pets18HistoryList');if(!section||!host)return;
  const pets=npV6Pets();let records=[];pets.forEach(p=>readPurchaseHistoryV18(p.id).forEach(r=>records.push({...r,pet_name:r.pet_name||p.name})));records.sort((a,b)=>String(b.confirmed_at).localeCompare(String(a.confirmed_at)));
  if(!records.length){section.hidden=true;return}section.hidden=false;
  host.innerHTML=records.slice(0,10).map(r=>`<article class="card pets18-history-card"><div class="pets18-history-head"><div><span>${formatDateV18(r.confirmed_at)}</span><strong>${r.pet_name}</strong></div><b>€${Number(r.plan_total||0).toFixed(2)}</b></div><div class="pets21-history-products">${(r.items||[]).map(x=>`<div class="pets21-history-line"><img src="${x.img||routineIcon(x.type)}" alt=""><div><strong>${npLang==='de'?(x.nameDe||x.name):(x.name||x.nameDe)}</strong><span>${x.source==='plan'?t('Selected recommendation','Gewählte Empfehlung'):t('Selected / usual product','Gewähltes / gewohntes Produkt')}</span></div><b>€${Number(x.price||0).toFixed(2)}</b></div>`).join('')}</div><div class="pets18-history-foot"><span>${(r.retailers||[]).length} ${t('retailer checkouts','Händler-Checkouts')}</span><span>${(r.items||[]).length} ${t('items','Produkte')}</span></div></article>`).join('');
};

function ensurePetMatchFabV21(){
  if(document.body.classList.contains('tool-page')) return;
  if(document.querySelector('.petmatch21-fab')) return;
  const href=/\/(de|en)\//.test(location.pathname)?'tool.html':(npLang==='de'?'de/tool.html':'en/tool.html');
  const a=document.createElement('a');
  a.className='petmatch21-fab';
  a.href=href;
  a.innerHTML=`<span>${t('Pet Match','Pet Match')}</span> →`;
  document.body.appendChild(a);
}

document.addEventListener('DOMContentLoaded',()=>{
  ensurePetMatchFabV21();
  renderMatchOrbitV6();
  renderMatchSummaryV21();
  renderHeroBasketV8();
  renderPurchaseHistoryV18();
});


// ===========================================================
// NOEVAPET V22 — QUALIFIED STATE MODEL / FINAL CONGRUENCY GATE
// ===========================================================

function reconcilePetStateV22(){
  const id=npV6ActivePetId(); if(!id)return;
  let plan=getPlanV6();
  // Exactly one selected product per originating need. Last persisted choice wins.
  const seen=new Set(), dedup=[];
  [...plan].reverse().forEach(item=>{
    const key=item.sourceNeed||('id:'+item.id);
    if(seen.has(key))return;seen.add(key);dedup.push(item);
  });
  plan=dedup.reverse();
  if(JSON.stringify(plan)!==JSON.stringify(getPlanV6())) savePlanV6(plan);
  // A need ceases to be an open visual object as soon as a concrete product solves it.
  const resolved=new Set(plan.map(x=>x.sourceNeed).filter(Boolean));
  const needs=getNeedsV6().filter(n=>!resolved.has(n.id));
  saveNeedsV6(needs);
}

addSuggestedNeedV6=function(){
  const map=npV6NeedMap[npV6CurrentNeed];if(!map)return;
  const needId='n-'+npV6CurrentNeed;
  const rec=recommendationForNeedV19(npV6CurrentNeed);
  let plan=getPlanV6().filter(x=>x.sourceNeed!==needId && x.id!==rec.id);
  plan.push(rec);savePlanV6(plan);
  // The category/need was a question. Once answered, only the concrete choice remains.
  saveNeedsV6(getNeedsV6().filter(n=>n.id!==needId));
  localStorage.setItem('npLastNeedV19',npV6CurrentNeed);
  reconcilePetStateV22();
  renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();closeNeedModalV6();
  showToastV6(t('Recommendation added to the cart.','Empfehlung in den Warenkorb übernommen.'));
};

function orbitNameV22(item){
  const raw=npLang==='de'?(item.nameDe||item.name||''):(item.name||item.nameDe||'');
  const tidy=String(raw).replace(/\s*·.*$/,'').trim();
  return tidy.length>21?tidy.slice(0,20)+'…':tidy;
}
function orbitStateV22(item){
  if(item.source==='plan')return {text:t('In cart','Im Warenkorb'),cls:'basket'};
  if(item.source==='routine')return item.buyNow!==false
    ?{text:t('Usual · in cart','Gewohnt · im Warenkorb'),cls:'routine-buy'}
    :{text:t('Already used','Bereits genutzt'),cls:'routine'};
  return {text:t('Open need','Offener Bedarf'),cls:'need'};
}
function renderMatchLegendV22(routine,plan,openNeeds){
  const col=document.querySelector('.v14-orbit-col');if(!col)return;
  let legend=document.getElementById('match22Legend');
  if(!legend){
    legend=document.createElement('div');legend.id='match22Legend';legend.className='match22-legend';
    const orbit=document.getElementById('match6Orbit');orbit?.insertAdjacentElement('afterend',legend);
  }
  const routineCount=routine.length;
  const cartCount=getCartItemsV6().length;
  const needCount=openNeeds.length;
  legend.innerHTML=`<span class="routine"><i></i>${routineCount} ${routineCount===1?t('routine item','Alltagsprodukt'):t('routine items','Alltagsprodukte')}</span><span class="basket"><i></i>${cartCount} ${cartCount===1?t('in cart','im Warenkorb'):t('in cart','im Warenkorb')}</span>${needCount?`<span class="need"><i></i>${needCount} ${needCount===1?t('open need','offener Bedarf'):t('open needs','offene Bedarfe')}</span>`:''}`;
}

renderMatchOrbitV6=function(){
  const orbit=document.getElementById('match6Orbit');if(!orbit)return;
  reconcilePetStateV22();hydrateActivePetV6();
  orbit.querySelectorAll('.match6-node').forEach(x=>x.remove());
  const routine=getRoutineV6(),plan=getPlanV6();
  const linkedNeeds=new Set(plan.map(x=>x.sourceNeed).filter(Boolean));
  const openNeeds=getNeedsV6().filter(x=>!linkedNeeds.has(x.id));
  const items=[...routine.map(x=>({...x,source:'routine'})),...plan.map(x=>({...x,source:'plan',locked:false})),...openNeeds.map(x=>({...x,source:'need'}))];
  items.slice(0,8).forEach((item,i)=>{
    const state=orbitStateV22(item);
    const node=document.createElement('div');node.className=`match6-node match22-${state.cls}`;Object.assign(node.style,npV6OrbitPositions[i]);
    node.title=`${orbitNameV22(item)} · ${state.text}`;node.dataset.source=item.source;node.dataset.itemId=item.id;
    node.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div class="match22-node-copy"><span class="match22-node-name">${orbitNameV22(item)}</span><span class="match22-node-state">${state.text}</span></div><button data-match-node-remove="${item.id}" data-source="${item.source}" aria-label="${t('Remove','Entfernen')}">×</button>${item.locked?'<span class="lock">🔒</span>':item.source==='plan'?'<span class="lock">✓</span>':''}`;
    orbit.appendChild(node);
  });
  orbit.querySelectorAll('[data-match-node-remove]').forEach(b=>b.addEventListener('click',()=>{
    const source=b.dataset.source,id=b.dataset.matchNodeRemove;
    if(source==='routine')saveRoutineV6(getRoutineV6().filter(x=>x.id!==id));
    else if(source==='plan')removePlanChoiceV20(id);
    else saveNeedsV6(getNeedsV6().filter(x=>x.id!==id));
    reconcilePetStateV22();renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();
  }));
  const score=document.querySelector('[data-match6-score]');if(score)score.textContent=Math.min(97,84+Math.min(items.length,6)*2);
  renderMatchLegendV22(routine,plan,openNeeds);
  const insight=document.getElementById('match6Insight');
  if(insight){
    const cart=getCartItemsV6();
    if(cart.length){insight.hidden=true;insight.innerHTML='';}
    else{
      insight.hidden=false;
      const fixed=routine.filter(x=>x.locked);
      insight.innerHTML=fixed.length
        ?`<strong>${t('Your usuals stay','Gewohnte Produkte bleiben')}</strong>${t(' NoevaPet keeps the products you locked and only optimises around them.',' NoevaPet lässt deine fest markierten Produkte unverändert und optimiert nur drumherum.')}`
        :`<strong>${t('Open for suggestions','Offen für Vorschläge')}</strong>${t(' Add an exact product whenever there is something you do not want NoevaPet to replace.',' Trage ein genaues Produkt ein, sobald NoevaPet etwas nicht ersetzen soll.')}`;
    }
  }
  renderMatchSummaryV21();
};

renderMatchSummaryV21=function(){
  const col=document.querySelector('.v14-orbit-col');if(!col)return;
  let box=document.getElementById('match21Summary');
  if(!box){box=document.createElement('div');box.id='match21Summary';box.className='match21-summary';const hand=col.querySelector('.match6-hand');if(hand)col.insertBefore(box,hand);else col.appendChild(box);}
  const items=getCartItemsV6();
  if(!items.length){box.hidden=true;box.innerHTML='';return}
  box.hidden=false;const total=items.reduce((s,x)=>s+Number(x.price||0),0);
  box.innerHTML=`<div class="match21-summary-head"><strong>${t('Your cart now','Dein Warenkorb jetzt')}: ${items.length} ${items.length===1?t('product','Produkt'):t('products','Produkte')}</strong><span>${t('Only products marked “In cart” are part of this purchase. Routine items can stay in the orbit without being bought today.','Nur Produkte mit „Im Warenkorb“ gehören zu diesem Einkauf. Alltagsprodukte können im Orbit bleiben, ohne heute gekauft zu werden.')}</span></div><div class="match21-summary-items">${items.map(item=>{const nm=npLang==='de'?(item.nameDe||item.name):item.name;const sub=item.source==='plan'?t('Selected recommendation','Gewählte Empfehlung'):t('Usual product selected for today','Gewohntes Produkt · heute ausgewählt');return `<div class="match21-summary-item"><img src="${item.img||routineIcon(item.type)}" alt=""><div><strong>${nm}</strong><span>${sub}</span></div><b>€${Number(item.price||0).toFixed(2)}</b></div>`}).join('')}</div><div class="match21-summary-foot"><span>${t('Current cart total','Aktueller Warenkorb')} · €${total.toFixed(2)}</span><a class="pill warm-cta" href="basket.html">${t('Open cart','Warenkorb öffnen')} →</a></div>`;
};

// All count-bearing surfaces reconcile state first so stale needs/recommendations cannot leak.
const __npGetCartItemsV22=getCartItemsV6;
getCartItemsV6=function(){reconcilePetStateV22();return __npGetCartItemsV22();};

// Re-run all important views after older initializers have completed.
document.addEventListener('DOMContentLoaded',()=>{
  reconcilePetStateV22();
  refreshNavCartCountV6();
  renderMatchSelectedV9();
  renderMatchOrbitV6();
  renderHeroBasketV8();
  renderCartV6();
  renderPurchaseHistoryV18();
});

// ===========================================================
// NOEVAPET V23 — EXACT PRODUCT REPURCHASE / RETAILER SEARCH
// ===========================================================

function npV23Intent(){
  return document.querySelector('input[name="v23PurchaseIntent"]:checked')?.value || 'buy';
}
function npV23HasExactVariant(name,pack){
  if(String(pack||'').trim()) return true;
  return /\b\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l|stück|st\.?|pcs?|pack)\b/i.test(String(name||''));
}
function npV23ShowExactError(msg){
  const el=document.getElementById('v23ExactError');if(!el)return;
  el.hidden=!msg;el.textContent=msg||'';
}
function npV23SyncIntentUI(){
  const intent=npV23Intent();
  document.querySelectorAll('.v23-intent').forEach(el=>el.classList.toggle('active',!!el.querySelector(`input[value="${intent}"]`)));
  const keep=document.getElementById('v6KeepExact'),buy=document.getElementById('v6BuyNow');
  if(keep)keep.checked=intent!=='replace';if(buy)buy.checked=intent==='buy';
  const btn=document.getElementById('v6SaveCurrent');
  if(btn)btn.textContent=intent==='buy'?t('Add exact product →','Exaktes Produkt hinzufügen →'):intent==='remember'?t('Save to routine →','Im Alltag speichern →'):t('Find alternative →','Alternative suchen →');
  npV23ShowExactError('');
}

const __npOpenNeedModalV23=openNeedModalV6;
openNeedModalV6=function(id){
  __npOpenNeedModalV23(id);
  const pack=document.getElementById('v23PackSize');if(pack)pack.value='';
  const buy=document.querySelector('input[name="v23PurchaseIntent"][value="buy"]');if(buy)buy.checked=true;
  npV23SyncIntentUI();
};

function npV23RoutineStatus(item){
  if(item.purchaseIntent==='replace'||item.replacementRequested)return t('Alternative requested','Alternative gesucht');
  if(item.buyNow!==false&&item.exactProduct)return t('Buy again today · retailer comparison','Heute nachkaufen · Händlervergleich');
  if(item.buyNow!==false)return t('In this cart','In diesem Warenkorb');
  return t('Already used · saved only','Bereits genutzt · nur gemerkt');
}

renderMatchCurrentV6=function(){
  const host=document.getElementById('match6Current');if(!host)return;
  const items=getRoutineV6();host.innerHTML='';
  if(!items.length){
    host.innerHTML=`<div class="match6-current-item match20-current-empty"><div></div><div><strong>${t('Nothing fixed yet','Noch nichts festgelegt')}</strong><span>${t('Tap a need below to add something.','Tippe unten auf einen Bereich.')}</span></div><div></div></div>`;
    return;
  }
  items.forEach(item=>{
    const inCart=item.buyNow!==false;
    const exactReady=npV23HasExactVariant(item.name,item.packSize);
    const row=document.createElement('div');row.className='match6-current-item match20-current-item';
    const pack=item.packSize?` · ${item.packSize}`:'';
    let action='';
    if(item.purchaseIntent==='replace'||item.replacementRequested){
      action=`<button type="button" class="match20-cart-toggle" data-match-v23-buy="${item.id}">${t('Buy exact product instead','Doch exakt nachkaufen')}</button>`;
    }else if(inCart){
      action=`<button type="button" class="match20-cart-toggle in-cart" data-match-v23-remember="${item.id}">${t('In cart ✓ · remove for today','Im Warenkorb ✓ · heute entfernen')}</button>`;
    }else{
      action=`<button type="button" class="match20-cart-toggle" data-match-v23-buy="${item.id}">${t('Buy again today','Heute nachkaufen')}</button>`;
    }
    row.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div class="match20-current-copy"><strong>${routineItemLabelV6(item)}${pack}</strong><span>${npV23RoutineStatus(item)}</span>${item.exactProduct?`<em class="v23-exact-badge">${exactReady?t('Exact product fixed','Exaktes Produkt fixiert'):t('Variant still needed','Variante noch nötig')}</em>`:''}${action}</div><button class="match20-current-remove" data-match-current-remove="${item.id}" aria-label="${t('Remove from profile','Aus Profil entfernen')}">×</button>`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-match-v23-remember]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.matchV23Remember;
    saveRoutineV6(getRoutineV6().map(x=>x.id===id?{...x,buyNow:false,purchaseIntent:'remember',offerSearch:false}:x));
    renderMatchCurrentV6();refreshNavCartCountV6();renderHeroBasketV8();renderMatchOrbitV6();
  }));
  host.querySelectorAll('[data-match-v23-buy]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.matchV23Buy,item=getRoutineV6().find(x=>x.id===id);if(!item)return;
    if(!npV23HasExactVariant(item.name,item.packSize)){
      showToastV6(t('Add the exact pack size / variant first so NoevaPet can compare like with like.','Ergänze zuerst Packungsgröße / Variante, damit NoevaPet wirklich dasselbe Produkt vergleichen kann.'));return;
    }
    saveRoutineV6(getRoutineV6().map(x=>x.id===id?{...x,buyNow:true,purchaseIntent:'buy',locked:true,exactProduct:true,offerSearch:true,replacementRequested:false}:x));
    renderMatchCurrentV6();refreshNavCartCountV6();renderHeroBasketV8();renderMatchOrbitV6();
  }));
  host.querySelectorAll('[data-match-current-remove]').forEach(b=>b.addEventListener('click',()=>{
    saveRoutineV6(getRoutineV6().filter(x=>x.id!==b.dataset.matchCurrentRemove));
    renderMatchCurrentV6();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();
  }));
};

addCurrentProductV6=function(){
  const name=(document.getElementById('v6NeedName')?.value||'').trim();if(!name){npV23ShowExactError(t('Enter the product you already use.','Trage das Produkt ein, das ihr bereits nutzt.'));return}
  const type=document.getElementById('v6NeedType')?.value||'food';
  const pack=(document.getElementById('v23PackSize')?.value||'').trim();
  const intent=npV23Intent(),needKey=npV6CurrentNeed||null,needId=needKey?'n-'+needKey:null;
  if(intent==='buy'&&!npV23HasExactVariant(name,pack)){
    npV23ShowExactError(t('For retailer price comparison, add the exact pack size or variant (for example 3 kg).','Für den Händler-Preisvergleich ergänze bitte Packungsgröße oder Variante (z. B. 3 kg).'));return;
  }
  if(needId){saveNeedsV6(getNeedsV6().filter(n=>n.id!==needId));savePlanV6(getPlanV6().filter(x=>x.sourceNeed!==needId));}
  let items=getRoutineV6();
  if(needKey)items=items.filter(x=>x.needKey!==needKey);
  const current={id:'r'+Date.now(),type,name,nameDe:name,img:routineIcon(type),packSize:pack,needKey,exactProduct:true,purchaseIntent:intent,locked:intent!=='replace',buyNow:intent==='buy',offerSearch:intent==='buy',replacementRequested:intent==='replace'};
  items.push(current);saveRoutineV6(items);
  if(intent==='replace'&&needKey){
    const rec=recommendationForNeedV19(needKey),plan=getPlanV6().filter(x=>x.sourceNeed!==needId);plan.push(rec);savePlanV6(plan);localStorage.setItem('npLastNeedV19',needKey);
  }
  reconcilePetStateV22();
  renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();refreshNavCartCountV6();renderHeroBasketV8();closeNeedModalV6();
  showToastV6(intent==='buy'?t('Exact product added. NoevaPet will optimise the retailer route without substituting it.','Exaktes Produkt hinzugefügt. NoevaPet optimiert den Händlerweg, ohne es zu ersetzen.'):intent==='remember'?t('Saved to the pet routine. It is not in today’s cart.','Im Tier-Alltag gespeichert. Es ist nicht im heutigen Warenkorb.'):t('Current product saved as context; an alternative has been selected for review.','Aktuelles Produkt als Kontext gespeichert; eine Alternative wurde zur Prüfung ausgewählt.'));
};

orbitStateV22=function(item){
  if(item.source==='plan')return {text:t('In cart','Im Warenkorb'),cls:'basket'};
  if(item.source==='routine'){
    if(item.purchaseIntent==='replace'||item.replacementRequested)return {text:t('Alternative requested','Alternative gesucht'),cls:'routine-replace'};
    if(item.buyNow!==false&&item.exactProduct)return {text:t('Rebuy · price compare','Nachkauf · Preisvergleich'),cls:'routine-buy'};
    if(item.buyNow!==false)return {text:t('Usual · in cart','Gewohnt · im Warenkorb'),cls:'routine-buy'};
    return {text:t('Already used','Bereits genutzt'),cls:'routine'};
  }
  return {text:t('Open need','Offener Bedarf'),cls:'need'};
};

renderMatchSummaryV21=function(){
  const col=document.querySelector('.v14-orbit-col');if(!col)return;
  let box=document.getElementById('match21Summary');if(!box){box=document.createElement('div');box.id='match21Summary';box.className='match21-summary';const hand=col.querySelector('.match6-hand');if(hand)col.insertBefore(box,hand);else col.appendChild(box)}
  const items=getCartItemsV6();if(!items.length){box.hidden=true;box.innerHTML='';return}box.hidden=false;
  const total=items.reduce((s,x)=>s+Number(x.price||0),0);
  box.innerHTML=`<div class="match21-summary-head"><strong>${t('Your cart now','Dein Warenkorb jetzt')}: ${items.length} ${items.length===1?t('product','Produkt'):t('products','Produkte')}</strong><span>${t('Exact products stay fixed; NoevaPet optimises the retailer route around them.','Exakte Produkte bleiben fix; NoevaPet optimiert den Händlerweg darum herum.')}</span></div><div class="match21-summary-items">${items.map(item=>{const nm=npLang==='de'?(item.nameDe||item.name):item.name;const pack=item.packSize?` · ${item.packSize}`:'';const sub=item.exactProduct?t('Exact product · retailer comparison','Exaktes Produkt · Händlervergleich'):item.source==='plan'?t('Selected recommendation','Gewählte Empfehlung'):t('Usual product selected for today','Gewohntes Produkt · heute ausgewählt');return `<div class="match21-summary-item"><img src="${item.img||routineIcon(item.type)}" alt=""><div><strong>${nm}${pack}</strong><span>${sub}</span></div><b>€${Number(item.price||0).toFixed(2)}</b></div>`}).join('')}</div><div class="match21-summary-foot"><span>${t('Current cart total','Aktueller Warenkorb')} · €${total.toFixed(2)}</span><a class="pill warm-cta" href="basket.html">${t('Open cart','Warenkorb öffnen')} →</a></div>`;
};

// Decorate cart rows with exact-product semantics without changing the canonical cart calculation.
const __npRenderCartV23=renderCartV6;
renderCartV6=function(){
  __npRenderCartV23();
  const host=document.getElementById('cart6List');if(!host)return;
  const map=new Map(getCartItemsV6().map(x=>[x.cartId,x]));
  host.querySelectorAll('.cart6-line').forEach(row=>{
    const item=map.get(row.dataset.cartId);if(!item||!item.exactProduct)return;
    row.classList.add('cart23-exact');
    const copy=row.querySelector('div');if(!copy)return;
    const span=copy.querySelector('span');if(span)span.textContent=t('Exact product · retailer price comparison','Exaktes Produkt · Händler-Preisvergleich');
    if(item.packSize){const strong=copy.querySelector('strong');if(strong&&!strong.textContent.includes(item.packSize))strong.textContent+=` · ${item.packSize}`}
  });
};

const __npRouteProductRowsV23=routeProductRowsV19;
routeProductRowsV19=function(group){
  return `<div class="route19-items">${group.items.map(item=>{const nm=npLang==='de'?(item.nameDe||item.name):item.name;const pack=item.packSize?` · ${item.packSize}`:'';const sub=item.exactProduct?t('Exact product fixed · retailer optimised','Exaktes Produkt fix · Händler optimiert'):item.source==='plan'?t('Selected recommendation','Gewählte Empfehlung'):t('Your selected product','Dein gewähltes Produkt');return `<div class="route19-item ${item.exactProduct?'route23-exact':''}"><img src="${item.img||routineIcon(item.type)}" alt=""><div><strong>${nm}${pack}</strong><small>${sub}</small></div><b>€${Number(item.optimizedPrice||item.price||0).toFixed(2)}</b></div>`}).join('')}</div>`;
};

// The exact-product search payload maps directly onto the existing catalogue/offer contracts.
function exactProductSearchRequestV23(item){
  if(!item?.exactProduct||item.buyNow===false||!item.offerSearch)return null;
  return {market:'DE',currency:'EUR',name:item.name||'',pack_size:item.packSize||'',exact_match:true,strategy:'lowest_total_route'};
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('input[name="v23PurchaseIntent"]').forEach(r=>r.addEventListener('change',npV23SyncIntentUI));
  npV23SyncIntentUI();
  renderMatchCurrentV6();renderMatchOrbitV6();renderMatchSummaryV21();renderCartV6();
});

// Keep exact-product semantics visible through retailer handoff and the immutable purchase record.
const __npCheckoutHubV23=renderCheckoutHubV19;
renderCheckoutHubV19=function(){
  __npCheckoutHubV23();
  const host=document.getElementById('checkout6Hub');if(!host)return;
  const groups=purchaseRouteGroupsV19();
  host.querySelectorAll('.checkout8-retailer').forEach((card,gi)=>{
    const group=groups[gi];if(!group)return;
    card.querySelectorAll('.checkout19-product').forEach((row,ii)=>{
      const item=group.items[ii];if(!item||!item.exactProduct)return;
      row.classList.add('checkout23-exact');
      const strong=row.querySelector('strong');if(strong&&item.packSize&&!strong.textContent.includes(item.packSize))strong.textContent+=` · ${item.packSize}`;
      const span=row.querySelector('span');if(span)span.textContent=`1× · ${t('exact product · retailer compared','exaktes Produkt · Händler verglichen')}`;
    });
  });
};
renderCheckoutHubV8=renderCheckoutHubV19;renderCheckoutHubV7=renderCheckoutHubV19;renderCheckoutHubV6=renderCheckoutHubV19;

const __npHeroV23=renderHeroBasketV8;
renderHeroBasketV8=function(){
  __npHeroV23();
  const host=document.getElementById('hero8BasketLines');if(!host)return;
  const items=getCartItemsV6();
  host.querySelectorAll('.hero6-line').forEach((row,i)=>{
    const item=items[i];if(!item||!item.exactProduct)return;
    const strong=row.querySelector('strong');if(strong&&item.packSize&&!strong.textContent.includes(item.packSize))strong.textContent+=` · ${item.packSize}`;
    const span=row.querySelector('span');if(span)span.textContent=t('exact product · price comparison','exaktes Produkt · Preisvergleich');
  });
};

const __npHistoryV23=renderPurchaseHistoryV18;
renderPurchaseHistoryV18=function(){
  __npHistoryV23();
  const host=document.getElementById('pets18HistoryList');if(!host)return;
  const pets=npV6Pets();let records=[];pets.forEach(p=>readPurchaseHistoryV18(p.id).forEach(r=>records.push({...r,pet_name:r.pet_name||p.name})));records.sort((a,b)=>String(b.confirmed_at).localeCompare(String(a.confirmed_at)));
  host.querySelectorAll('.pets18-history-card').forEach((card,ri)=>{
    const rec=records[ri];if(!rec)return;
    card.querySelectorAll('.pets21-history-line').forEach((row,ii)=>{
      const item=(rec.items||[])[ii];if(!item||!item.exactProduct)return;
      const strong=row.querySelector('strong');if(strong&&item.packSize&&!strong.textContent.includes(item.packSize))strong.textContent+=` · ${item.packSize}`;
      const span=row.querySelector('span');if(span)span.textContent=t('Exact repeat purchase','Exakter Nachkauf');
    });
  });
};

completeCheckoutV7=function(){
  const targets=retailerTargetsV6(),opened=openedRetailersV8().filter(x=>targets.includes(x));
  if(targets.some(id=>!opened.includes(id))){showToastV6(t('Open every required retailer cart before closing this shopping session.','Öffne zuerst alle benötigten Händler-Warenkörbe, bevor du diesen Einkauf abschließt.'));return}
  const snapshot=getCartItemsV6(),p=npV6ActivePet(),nums=purchaseNumbersV18(snapshot,__npV6PurchaseMode),groups=purchaseRouteGroupsV19(snapshot,__npV6PurchaseMode);
  const assignment=new Map();groups.forEach(g=>g.items.forEach(x=>assignment.set(x.cartId||x.id,{retailer:g.id,optimizedPrice:Number(x.optimizedPrice||x.price||0)})));
  const record={id:'purchase-'+Date.now(),confirmed_at:new Date().toISOString(),pet_id:p.id,pet_name:p.name||'',mode:__npV6PurchaseMode,total:nums.total,saving:nums.saving,plan_total:nums.planTotal,retailers:groups.map(g=>g.id),route:groups.map(g=>({id:g.id,subtotal:Number(g.subtotal||0)})),items:snapshot.map(x=>{const a=assignment.get(x.cartId||x.id)||{};return {id:x.id,name:x.name,nameDe:x.nameDe||x.name,packSize:x.packSize||'',exactProduct:!!x.exactProduct,offerSearch:!!x.offerSearch,purchaseIntent:x.purchaseIntent||'',price:Number(x.price||0),optimizedPrice:Number(a.optimizedPrice??x.price??0),retailer:a.retailer||'',source:x.source,type:x.type||'other',img:x.img||routineIcon(x.type)}})};
  localStorage.setItem(`npLastPurchase:${p.id}`,JSON.stringify(record));savePurchaseHistoryV18(p.id,record);
  saveRoutineV6(getRoutineV6().map(x=>({...x,buyNow:false,purchaseIntent:x.purchaseIntent==='buy'?'remember':x.purchaseIntent,offerSearch:false})));savePlanV6([]);saveNeedsV6([]);
  localStorage.removeItem('npLastNeedV19');sessionStorage.removeItem(`npCheckoutOpened:${p.id}`);sessionStorage.removeItem(`npCheckoutSignature:${p.id}`);refreshNavCartCountV6();
  document.getElementById('checkout8Shell')?.setAttribute('style','display:none');document.getElementById('checkout7Done')?.classList.add('show');document.body.classList.add('checkout-done8');
  renderReceiptV18(record);const link=document.getElementById('checkout18PetLink');if(link)link.href='pets.html#purchase-history';
};

// Rebind the completion button after all older initializers so the V23 snapshot is used.
document.addEventListener('DOMContentLoaded',()=>{
  const confirm=document.getElementById('checkout7Complete');if(confirm){const fresh=confirm.cloneNode(true);confirm.replaceWith(fresh);fresh.addEventListener('click',completeCheckoutV7)}
  renderHeroBasketV8();renderPurchaseHistoryV18();
});


// ===========================================================
// NOEVAPET V24 — REPURCHASE ACTION + CROSS-SURFACE CONGRUENCY
// ===========================================================

let npV24EditingRoutineId=null;
let npV24EditingNeedKey=null;

function inferNeedKeyV24(item){
  if(item?.needKey)return item.needKey;
  const hay=((item?.name||'')+' '+(item?.nameDe||'')+' '+(item?.type||'')).toLowerCase();
  if(/nass|wet|dose|pouch/.test(hay))return 'wet';
  if(/snack|treat/.test(hay))return 'treats';
  if(/zahn|dental/.test(hay))return 'dental';
  if(/fell|coat|haut|skin|pflege|care/.test(hay))return 'coat';
  if(/geschirr|harness|leine|walk/.test(hay))return 'walk';
  if(/spiel|toy|play/.test(hay))return 'play';
  if(/train/.test(hay))return 'training';
  if(/schlaf|sleep|bett|bed/.test(hay))return 'sleep';
  if(/reise|travel|transport/.test(hay))return 'travel';
  return item?.type==='food'?'dry':'vet';
}

function ensureToolToastV24(){
  if(document.getElementById('v6Toast'))return;
  const el=document.createElement('div');el.id='v6Toast';el.className='toast';document.body.appendChild(el);
}

function openRepurchaseEditorV24(item){
  if(!item)return;
  npV24EditingRoutineId=item.id;
  npV24EditingNeedKey=item.needKey||'';
  openNeedModalV6(item.needKey||inferNeedKeyV24(item));
  setNeedModeV6('current');
  const type=document.getElementById('v6NeedType');if(type)type.value=item.type||'food';
  const name=document.getElementById('v6NeedName');if(name)name.value=item.name||item.nameDe||'';
  const pack=document.getElementById('v23PackSize');if(pack){pack.value=item.packSize||'';pack.focus();}
  const buy=document.querySelector('input[name="v23PurchaseIntent"][value="buy"]');if(buy)buy.checked=true;
  npV23SyncIntentUI();
  const title=document.getElementById('v6NeedTitle');if(title)title.textContent=t('Buy this exact product again','Dieses genaue Produkt nachkaufen');
  const helper=document.querySelector('#v6CurrentPanel .v23-exact-help');
  if(helper)helper.textContent=t('Confirm the exact pack size / variant. NoevaPet will keep this product fixed and optimise only the retailer route.','Bestätige Packungsgröße / Variante. NoevaPet hält dieses Produkt fix und optimiert nur den Händlerweg.');
  const btn=document.getElementById('v6SaveCurrent');if(btn)btn.textContent=t('Add exact product to cart →','Exaktes Produkt in den Warenkorb →');
  if(pack&&!item.packSize){pack.classList.add('v24-attention');}
}

function removeRecommendationForNeedV24(needKey){
  if(!needKey)return;
  const needId='n-'+needKey;
  saveNeedsV6(getNeedsV6().filter(n=>n.id!==needId));
  savePlanV6(getPlanV6().filter(x=>x.sourceNeed!==needId));
}

// Re-render routine cards with an actionable repurchase flow. A missing variant no longer
// produces an invisible toast; it opens the exact-product editor, prefilled with the saved product.
renderMatchCurrentV6=function(){
  const host=document.getElementById('match6Current');if(!host)return;
  const items=getRoutineV6();host.innerHTML='';
  if(!items.length){
    host.innerHTML=`<div class="match6-current-item match20-current-empty"><div></div><div><strong>${t('Nothing fixed yet','Noch nichts festgelegt')}</strong><span>${t('Tap a need below to add something.','Tippe unten auf einen Bereich.')}</span></div><div></div></div>`;
    return;
  }
  items.forEach(item=>{
    const inCart=item.buyNow!==false;
    const exactReady=npV23HasExactVariant(item.name,item.packSize);
    const row=document.createElement('div');row.className='match6-current-item match20-current-item';
    const pack=item.packSize?` · ${item.packSize}`:'';
    let action='';
    if(item.purchaseIntent==='replace'||item.replacementRequested){
      action=`<button type="button" class="match20-cart-toggle" data-match-v24-buy="${item.id}">${t('Buy exact product instead','Doch exakt nachkaufen')}</button>`;
    }else if(inCart){
      action=`<button type="button" class="match20-cart-toggle in-cart" data-match-v24-remember="${item.id}">${t('In cart ✓ · remove for today','Im Warenkorb ✓ · heute entfernen')}</button>`;
    }else{
      action=`<button type="button" class="match20-cart-toggle ${exactReady?'':'needs-detail'}" data-match-v24-buy="${item.id}">${exactReady?t('Buy again today','Heute nachkaufen'):t('Buy again today · complete details','Heute nachkaufen · Details ergänzen')}</button>`;
    }
    row.innerHTML=`<img src="${item.img||routineIcon(item.type)}" alt="" onerror="this.onerror=null;this.src='${routineIcon(item.type)}'"><div class="match20-current-copy"><strong>${routineItemLabelV6(item)}${pack}</strong><span>${npV23RoutineStatus(item)}</span>${item.exactProduct?`<em class="v23-exact-badge">${exactReady?t('Exact product fixed','Exaktes Produkt fixiert'):t('Variant still needed','Variante noch nötig')}</em>`:''}${action}</div><button class="match20-current-remove" data-match-current-remove="${item.id}" aria-label="${t('Remove from profile','Aus Profil entfernen')}">×</button>`;
    host.appendChild(row);
  });
  host.querySelectorAll('[data-match-v24-remember]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.matchV24Remember;
    saveRoutineV6(getRoutineV6().map(x=>x.id===id?{...x,buyNow:false,purchaseIntent:'remember',offerSearch:false}:x));
    reconcilePetStateV22();renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();renderMatchSummaryV21();refreshNavCartCountV6();renderHeroBasketV8();renderCartV6();
  }));
  host.querySelectorAll('[data-match-v24-buy]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.matchV24Buy,item=getRoutineV6().find(x=>x.id===id);if(!item)return;
    if(!npV23HasExactVariant(item.name,item.packSize)){
      openRepurchaseEditorV24(item);
      return;
    }
    const needKey=item.needKey||null;
    if(needKey)removeRecommendationForNeedV24(needKey);
    saveRoutineV6(getRoutineV6().map(x=>x.id===id?{...x,needKey:item.needKey||null,buyNow:true,purchaseIntent:'buy',locked:true,exactProduct:true,offerSearch:true,replacementRequested:false}:x));
    reconcilePetStateV22();renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();renderMatchSummaryV21();refreshNavCartCountV6();renderHeroBasketV8();renderCartV6();
    showToastV6(t('Exact product added to today’s cart. NoevaPet will compare the retailer route.','Exaktes Produkt ist jetzt im heutigen Warenkorb. NoevaPet vergleicht den Händlerweg.'));
  }));
  host.querySelectorAll('[data-match-current-remove]').forEach(b=>b.addEventListener('click',()=>{
    saveRoutineV6(getRoutineV6().filter(x=>x.id!==b.dataset.matchCurrentRemove));
    reconcilePetStateV22();renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();renderMatchSummaryV21();refreshNavCartCountV6();renderHeroBasketV8();renderCartV6();
  }));
};

// Exact-product save supports both adding a new routine item and editing an existing one.
addCurrentProductV6=function(){
  const name=(document.getElementById('v6NeedName')?.value||'').trim();if(!name){npV23ShowExactError(t('Enter the product you already use.','Trage das Produkt ein, das ihr bereits nutzt.'));return}
  const type=document.getElementById('v6NeedType')?.value||'food';
  const pack=(document.getElementById('v23PackSize')?.value||'').trim();
  const intent=npV23Intent();
  const needKey=npV24EditingRoutineId?(npV24EditingNeedKey||null):(npV6CurrentNeed||null);
  const needId=needKey?'n-'+needKey:null;
  if(intent==='buy'&&!npV23HasExactVariant(name,pack)){
    npV23ShowExactError(t('For retailer price comparison, add the exact pack size or variant (for example 3 kg).','Für den Händler-Preisvergleich ergänze bitte Packungsgröße oder Variante (z. B. 3 kg).'));
    document.getElementById('v23PackSize')?.classList.add('v24-attention');return;
  }
  if(needId&&intent!=='replace')removeRecommendationForNeedV24(needKey);
  let items=getRoutineV6();
  if(npV24EditingRoutineId){
    items=items.map(x=>x.id===npV24EditingRoutineId?{...x,type,name,nameDe:name,img:x.img||routineIcon(type),packSize:pack,needKey,exactProduct:true,purchaseIntent:intent,locked:intent!=='replace',buyNow:intent==='buy',offerSearch:intent==='buy',replacementRequested:intent==='replace'}:x);
  }else{
    if(needKey)items=items.filter(x=>x.needKey!==needKey);
    items.push({id:'r'+Date.now(),type,name,nameDe:name,img:routineIcon(type),packSize:pack,needKey,exactProduct:true,purchaseIntent:intent,locked:intent!=='replace',buyNow:intent==='buy',offerSearch:intent==='buy',replacementRequested:intent==='replace'});
  }
  saveRoutineV6(items);
  if(intent==='replace'&&needKey){
    const rec=recommendationForNeedV19(needKey),plan=getPlanV6().filter(x=>x.sourceNeed!==needId);plan.push(rec);savePlanV6(plan);localStorage.setItem('npLastNeedV19',needKey);
  }
  npV24EditingRoutineId=null;npV24EditingNeedKey=null;
  document.getElementById('v23PackSize')?.classList.remove('v24-attention');
  reconcilePetStateV22();renderMatchCurrentV6();renderMatchSelectedV9();renderMatchOrbitV6();renderMatchSummaryV21();refreshNavCartCountV6();renderHeroBasketV8();renderCartV6();closeNeedModalV6();
  showToastV6(intent==='buy'?t('Exact product added to today’s cart. NoevaPet will compare retailers without substituting it.','Exaktes Produkt ist jetzt im heutigen Warenkorb. NoevaPet vergleicht Händler, ohne es zu ersetzen.'):intent==='remember'?t('Saved to the pet routine. It is not in today’s cart.','Im Tier-Alltag gespeichert. Es ist nicht im heutigen Warenkorb.'):t('Current product saved as context; an alternative is ready for review.','Aktuelles Produkt als Kontext gespeichert; eine Alternative steht zur Prüfung bereit.'));
};

// Opening a normal need starts a fresh add flow, not an edit flow.
const __npOpenNeedModalV24=openNeedModalV6;
openNeedModalV6=function(id){
  if(!npV24EditingRoutineId){npV24EditingNeedKey=null;}
  __npOpenNeedModalV24(id);
};

// Clear editing state when the modal is explicitly dismissed.
document.addEventListener('click',e=>{
  if(e.target.closest?.('[data-v6-close]')||e.target?.id==='v6NeedModal'){
    if(e.target?.id==='v6NeedModal'&&e.target!==document.getElementById('v6NeedModal'))return;
    npV24EditingRoutineId=null;npV24EditingNeedKey=null;
  }
});

document.addEventListener('DOMContentLoaded',()=>{
  ensureToolToastV24();
  renderMatchCurrentV6();renderMatchOrbitV6();renderMatchSummaryV21();renderHeroBasketV8();renderCartV6();
});


// ===========================================================
// NOEVAPET V25 — AUTOMATED CONGRUENCY AUDIT / RELEASE GATE
// ===========================================================

function npCanonicalSnapshotV25(){
  const pet=npV6ActivePet?.()||null;
  const routine=pet?getRoutineV6():[];
  const plan=pet?getPlanV6():[];
  const needs=pet?getNeedsV6():[];
  const cart=pet?getCartItemsV6():[];
  const route=pet?purchaseRouteGroupsV19(cart,sessionStorage.getItem('npPurchaseModeV6')||__npV6PurchaseMode||'balance'):[];
  return {pet,routine,plan,needs,cart,route};
}

function npInvariantReportV25(){
  const s=npCanonicalSnapshotV25(),errors=[];
  const fail=(code,detail)=>errors.push({code,detail});
  if(!s.pet && s.cart.length)fail('NO_PET_HAS_CART',`cart=${s.cart.length}`);
  const cartIds=s.cart.map(x=>x.cartId);
  if(new Set(cartIds).size!==cartIds.length)fail('DUPLICATE_CART_IDS',cartIds.join(','));
  const needKeys=s.plan.map(x=>x.sourceNeed).filter(Boolean);
  if(new Set(needKeys).size!==needKeys.length)fail('DUPLICATE_SELECTED_NEED',needKeys.join(','));
  const selectedNeeds=new Set(needKeys);
  const staleNeeds=s.needs.filter(n=>selectedNeeds.has(n.id));
  if(staleNeeds.length)fail('RESOLVED_NEED_STILL_OPEN',staleNeeds.map(x=>x.id).join(','));
  s.routine.filter(x=>x.buyNow!==false&&x.exactProduct&&x.offerSearch).forEach(x=>{
    if(!npV23HasExactVariant(x.name,x.packSize))fail('EXACT_REPURCHASE_MISSING_VARIANT',x.id||x.name);
  });
  s.routine.filter(x=>x.buyNow!==false&&x.needKey).forEach(x=>{
    const needId='n-'+x.needKey;
    if(s.plan.some(p=>p.sourceNeed===needId))fail('ROUTINE_AND_RECOMMENDATION_SAME_NEED',`${x.id}:${needId}`);
  });
  const routed=s.route.flatMap(g=>g.items||[]).map(x=>x.cartId);
  if(s.cart.length){
    if(routed.length!==s.cart.length)fail('ROUTE_COUNT_MISMATCH',`cart=${s.cart.length};route=${routed.length}`);
    if(new Set(routed).size!==routed.length)fail('ROUTE_DUPLICATE_ITEM',routed.join(','));
    const missing=cartIds.filter(id=>!routed.includes(id));if(missing.length)fail('ROUTE_MISSING_ITEM',missing.join(','));
  }
  const targets=s.route.map(g=>g.id),opened=typeof openedRetailersV8==='function'?openedRetailersV8():[];
  const staleOpened=opened.filter(id=>!targets.includes(id));
  if(staleOpened.length)fail('STALE_CHECKOUT_RETAILER',staleOpened.join(','));
  return {pass:errors.length===0,errors,snapshot:{pet:s.pet?.id||null,routine:s.routine.length,plan:s.plan.length,needs:s.needs.length,cart:s.cart.length,routeItems:routed.length,retailers:s.route.length}};
}

function npDomInvariantReportV25(){
  const errors=[],cart=getCartItemsV6(),fail=(code,detail)=>errors.push({code,detail});
  document.querySelectorAll('[data-nav-cart-count]').forEach(el=>{const n=Number(String(el.textContent||'').trim());if(Number.isFinite(n)&&n!==cart.length)fail('NAV_CART_COUNT',`${n}!=${cart.length}`)});
  const cartHost=document.getElementById('cart6List');
  if(cartHost){const rows=cartHost.querySelectorAll('.cart6-line').length;if(rows!==cart.length)fail('BASKET_ROWS',`${rows}!=${cart.length}`)}
  const orbit=document.getElementById('match6Orbit');
  if(orbit){
    const purchaseNodes=orbit.querySelectorAll('.match22-basket,.match22-routine-buy').length;
    if(purchaseNodes!==cart.length)fail('ORBIT_PURCHASE_COUNT',`${purchaseNodes}!=${cart.length}`);
    const resolvedNeedNodes=[...orbit.querySelectorAll('.match22-need')].filter(node=>{const id=node.dataset.itemId;return getPlanV6().some(x=>x.sourceNeed===id)});
    if(resolvedNeedNodes.length)fail('ORBIT_RESOLVED_NEED_VISIBLE',resolvedNeedNodes.map(x=>x.dataset.itemId).join(','));
  }
  const summary=document.getElementById('match21Summary');
  if(summary&&!summary.hidden&&cart.length){
    const rows=summary.querySelectorAll('.match21-summary-item').length;
    if(rows!==cart.length)fail('MATCH_SUMMARY_ROWS',`${rows}!=${cart.length}`);
  }
  const hero=document.getElementById('hero8BasketLines');
  if(hero&&cart.length<=4){
    const rows=hero.querySelectorAll('.hero6-line').length;
    if(rows!==cart.length)fail('HERO_PREVIEW_ROWS',`${rows}!=${cart.length}`);
  }
  return {pass:errors.length===0,errors};
}

function npRunQaAuditV25(){
  const state=npInvariantReportV25();
  const dom=npDomInvariantReportV25();
  const report={pass:state.pass&&dom.pass,state,dom,at:new Date().toISOString(),page:location.pathname};
  window.__npQaLastReport=report;
  if(!report.pass)console.error('[NoevaPet QA V25]',report);
  const panel=document.getElementById('npQaPanelV25');
  if(panel){panel.classList.toggle('fail',!report.pass);panel.innerHTML=`<strong>${report.pass?'QA PASS':'QA FAIL'}</strong><span>${report.pass?'State + visible counts agree':[...state.errors,...dom.errors].map(x=>x.code).join(' · ')}</span>`}
  return report;
}

function npQaEnabledV25(){
  try{return new URLSearchParams(location.search||'').get('qa')==='1'||localStorage.getItem('npQaMode')==='1'}catch(e){return false}
}
function npInstallQaPanelV25(){
  if(!npQaEnabledV25()||document.getElementById('npQaPanelV25'))return;
  const panel=document.createElement('div');panel.id='npQaPanelV25';panel.className='np-qa-panel-v25';document.body.appendChild(panel);
  npRunQaAuditV25();
  if(typeof MutationObserver!=='undefined'){
    let timer=null;const obs=new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(npRunQaAuditV25,50)});obs.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true});
  }
}
window.NoevaPetQA={snapshot:npCanonicalSnapshotV25,stateAudit:npInvariantReportV25,domAudit:npDomInvariantReportV25,audit:npRunQaAuditV25,enable:()=>{localStorage.setItem('npQaMode','1');location.reload()}};

document.addEventListener('DOMContentLoaded',()=>{setTimeout(()=>{npInstallQaPanelV25();if(npQaEnabledV25())npRunQaAuditV25()},120)});


// ===========================================================
// NOEVAPET V26 — FINAL READABILITY / CONFIRMATION POLISH
// ===========================================================
(function(){
  const __npRenderReceiptV26 = renderReceiptV18;
  renderReceiptV18=function(record){
    __npRenderReceiptV26(record);
    const host=document.getElementById('checkout18Receipt'); if(!host||!record) return;
    const done=document.getElementById('checkout7Done');
    if(done && !done.querySelector('.checkout26-pet-chip')){
      const pet=npV6ActivePet();
      const chip=document.createElement('div');
      chip.className='checkout26-pet-chip';
      chip.innerHTML=`<img src="${pet?.photo||'../assets/owner-upload.png'}" alt=""><div><strong>${record.pet_name||pet?.name||''}</strong><span>${npV6PetMeta(pet)}</span></div>`;
      const intro=done.querySelector('p');
      if(intro) intro.insertAdjacentElement('afterend', chip); else done.insertBefore(chip, host);
    }
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const done=document.getElementById('checkout7Done');
    if(done.classList.contains('show')){
      const pet=npV6ActivePet();
      const stored=pet?JSON.parse(localStorage.getItem(`npLastPurchase:${pet.id}`)||'null'):null;
      if(stored) renderReceiptV18(stored);
    }
  });
})();
