import { MUTATIONS, MILESTONES } from "./data/config.js";
import { saveState } from "./persistence.js";
import { setCreatureState, renderCreature } from "./creature.js";

let state = null;
let renderUI = () => {};
let toast = () => {};
const $ = id => document.getElementById(id);

export function setEvolutionContext(nextState, rerender, showToast) {
  state = nextState;
  renderUI = rerender;
  toast = showToast;
  setCreatureState(state);
}

function fmt(n) {
  if (!isFinite(n)) return "∞";
  if (n < 10) return n.toFixed(2).replace(/0+$/,"").replace(/\.$/,"");
  const units=["","K","M","B","T","Qa","Qi"]; let i=0;
  while(Math.abs(n)>=1000&&i<units.length-1){n/=1000;i++;}
  return (n>=100?n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2)).replace(/\.0+$/,"")+units[i];
}

function milestoneValue() {
  const reduction = (state.shop.metabolism || 0) * 0.03;
  return Math.max(1, state.nextMilestone * (1 - reduction));
}

function eligible(){
 const count=Object.keys(state.parts).length;
 return MUTATIONS.filter(m=>{
   if(state.parts[m.id])return false;
   if(m.requires && count<m.requires)return false;
   if(m.requiresId && !state.parts[m.requiresId])return false;
   if(m.exclusive && state.parts[m.exclusive])return false;
   if(m.slot==="mouth" && (state.parts.fangs||state.parts.beak||state.parts.mandibles) && m.id!=="fangs" && m.id!=="beak" && m.id!=="mandibles")return false;
   if(m.rarity==="rare" && state.choices<6)return false;
   return true;
 });
}
function pickMutations(){
 let pool=eligible();
 if(!pool.length)return [];
 let upgrades=Object.values(state.parts).length>=3 ? Object.values(state.parts).map(p=>MUTATIONS.find(m=>m.id===p.id)).filter(Boolean):[];
 const chosen=[];
 const addRandom=arr=>{if(!arr.length)return;const weights={common:7,uncommon:3,rare:1};let total=arr.reduce((a,m)=>a+(weights[m.rarity]||1),0),r=Math.random()*total;for(const m of arr){r-=weights[m.rarity]||1;if(r<=0){chosen.push(m);return}}};
 if(upgrades.length && Math.random()<.8){const m=upgrades[Math.floor(Math.random()*upgrades.length)];chosen.push(Object.assign({},m,{upgrade:true,desc:"Strengthen an existing adaptation. Higher tiers grow visibly."}))}
 while(chosen.length<3){addRandom(pool.filter(m=>!chosen.some(c=>c.id===m.id)));if(chosen.length<3&&pool.every(m=>chosen.some(c=>c.id===m.id)))break}
 return chosen.slice(0,3);
}
function iconFor(m){return `<svg viewBox="0 0 60 60"><circle cx="30" cy="33" r="19" fill="#527293"/><circle cx="24" cy="27" r="5" fill="#dffbf3"/>${m.slot==="legs"?'<path d="M22 45l-4 10M38 45l4 10" stroke="#a8bdd5" stroke-width="7"/>':m.slot==="back"?'<path d="M18 27l-8-15 14 8M42 27l8-15-14 8" fill="#86cfea"/>':m.slot==="arms"?'<path d="M16 36L4 42M44 36l12 6" stroke="#8ea9c4" stroke-width="7"/>':m.slot==="tail"?'<path d="M14 39Q3 49 18 54" fill="none" stroke="#8ea9c4" stroke-width="6"/>':'<circle cx="38" cy="33" r="6" fill="#a9f0d9"/></svg>'}`;
}
function openEvolution(){
 const choices=pickMutations();if(!choices.length)return;
 $("evoTitle").textContent=state.choices===0?"The ooze remembers how to become something.":"A new branch is forming.";
 $("evoFlavor").textContent=state.choices===0?"At 50 DNA, the primordial cell can finally keep a shape. Choose the first feature to define its lineage.":"Three possible adaptations emerge from the chaos. Choose one.";
 $("mutationList").innerHTML=choices.map((m,i)=>`<button class="mutation" data-id="${m.id}" data-upgrade="${m.upgrade?'1':'0'}"><div class="mutRow"><div class="icon">${iconFor(m)}</div><div><div class="rarity">${m.rarity} ${m.upgrade?"• TIER UPGRADE":""}</div><div class="mutName">${m.name}${m.upgrade?" → T"+((state.parts[m.id]?.tier||1)+1):""}</div><div class="mutFlavor">${m.desc}</div><div class="mutStat">+${fmt(m.dps)} DNA/sec • +${fmt(m.tap)} DNA/tap</div></div></div></button>`).join("");
 $("evoModal").classList.add("show");
 document.querySelectorAll(".mutation").forEach(b=>b.addEventListener("click",()=>chooseMutation(b.dataset.id,b.dataset.upgrade==="1")));
}
function chooseMutation(id,upgrade){
 const m=MUTATIONS.find(x=>x.id===id);if(!m)return;
 if(upgrade){state.parts[id].tier=Math.min(5,(state.parts[id].tier||1)+1)}
 else state.parts[id]={id:m.id,tier:1,seed:randSeed()};
 state.choices++;
 const idx=MILESTONES.indexOf(state.nextMilestone);
 state.nextMilestone=idx>=0?(MILESTONES[idx+1]||Math.ceil(state.nextMilestone*2.75)):Math.ceil(state.nextMilestone*2.75);
 $("evoModal").classList.remove("show");saveState(state); renderUI();toast(m.name+(upgrade?" upgraded!":" evolved!"));
}

export { milestoneValue };
