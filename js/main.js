import { loadState, saveState } from "./persistence.js";
import { SHOP } from "./data/upgrades.js";
import { MUTATIONS } from "./data/mutations.js";
import { setCreatureState, renderCreature } from "./creature.js";
import { setShopContext, renderShop } from "./shop.js";
import { setEvolutionContext, openEvolution } from "./evolution.js";
import { MILESTONES } from "./data/config.js";

const $ = id => document.getElementById(id);
let state = loadState();
let last = performance.now();
let tickAcc = 0;

function fmt(n){
 if(!isFinite(n))return "∞";
 if(n<10)return n.toFixed(2).replace(/0+$/,"").replace(/\.$/,"");
 const units=["","K","M","B","T","Qa","Qi"];let i=0;
 while(Math.abs(n)>=1000&&i<units.length-1){n/=1000;i++}
 return (n>=100? n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2)).replace(/\.0+$/,"")+units[i]
}
function totals(){
 let dps=0,tap=1;
 for(const p of Object.values(state.parts)){const b=partBonus(p);dps+=b.dps;tap+=b.tap}
 let pm=1,tm=1;
 for(const s of SHOP){const l=state.shop[s.id]||0;pm+=l*(s.passive||0);tm+=l*(s.tap||0)}
 dps*=pm;tap*=tm;
 if(Date.now()<state.boostUntil){dps*=2;tap*=2}
 return {dps,tap,pm,tm}
}
function milestoneValue() {
  const reduction=(state.shop.metabolism||0)*.03;
  return Math.max(1,state.nextMilestone*(1-reduction));
}
function toast(s){const x=$("toast");x.textContent=s;x.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>x.classList.remove("show"),1800)}
function render() {
  const t=totals();
  $("dna").textContent=fmt(state.dna);
  $("dps").textContent=fmt(t.dps);
  const target=milestoneValue(), pct=Math.min(100,state.dna/target*100);
  $("goalPct").textContent=Math.floor(pct)+"%";
  $("goalBar").style.width=pct+"%";
  $("goalLabel").textContent="Next mutation • "+fmt(Math.max(0,target-state.dna))+" DNA";
  $("parts").innerHTML=Object.values(state.parts).map(p=>`<span class="pill">${MUTATIONS.find(x=>x.id===p.id)?.name||p.id} T${p.tier}</span>`).join("");
  renderCreature();
  renderShop();
}
function checkMilestone() {
  if(state.dna>=milestoneValue()) setTimeout(openEvolution,100);
}
function tap(){
 const t=totals();state.dna+=t.tap;state.totalDNA+=t.tap;state.taps++;
 const rect=$("tapTarget").getBoundingClientRect();const x=rect.left+rect.width*(.25+Math.random()*.5),y=rect.top+rect.height*(.25+Math.random()*.4);
 const f=document.createElement("div");f.className="float";f.textContent="+"+fmt(t.tap);f.style.left=x+"px";f.style.top=y+"px";document.body.appendChild(f);setTimeout(()=>f.remove(),750);
 $("tapTarget").classList.remove("pulse");void $("tapTarget").offsetWidth;$("tapTarget").classList.add("pulse");
 checkMilestone();render();saveState(state);
}
function tick(now){const dt=Math.min(1,(now-last)/1000);last=now;tickAcc+=dt;const t=totals();if(t.dps>0){state.dna+=t.dps*dt;state.totalDNA+=t.dps*dt}if(tickAcc>.25){tickAcc=0;checkMilestone();render()}requestAnimationFrame(tick)}

function showRewardedAd(onSuccess) { /* AdMob/Capacitor hook */ setTimeout(()=>onSuccess?.(),0); }
function showInstantDNAAd() { /* AdMob hook: reward ≈ 2 minutes production */ }
function showEvolutionCooldownAd() { /* AdMob hook: optional cooldown skip */ }

setCreatureState(state);
setShopContext(state, render, toast);
setEvolutionContext(state, render, toast);

$("tapBtn").addEventListener("click",tap);
$("tapTarget").addEventListener("pointerdown",e=>{e.preventDefault();tap();});
$("menuBtn").addEventListener("click",()=>$("shopView").classList.add("show"));
$("shopBtn").addEventListener("click",()=>$("shopView").classList.add("show"));
$("shopClose").addEventListener("click",()=>$("shopView").classList.remove("show"));
$("doubleBtn").addEventListener("click",()=>showRewardedAd(()=>{
  state.boostUntil=Date.now()+15*60*1000;
  state.boostType="double";
  saveState(state); render(); toast("DNA production doubled for 15 minutes!");
}));

render();
requestAnimationFrame(tick);
