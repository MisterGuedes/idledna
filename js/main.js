import { loadState, saveState } from "./persistence.js";
import { SHOP } from "./data/upgrades.js";
import { MUTATIONS } from "./data/mutations.js";
import { setCreatureState, renderCreature } from "./creature.js";
import { setShopContext, renderShop } from "./shop.js";
import { setEvolutionContext, openEvolution } from "./evolution.js";

const $ = id => document.getElementById(id);
let state = loadState();
let last = performance.now();
let tickAcc = 0;
const OFFLINE_CAP = 8 * 60 * 60;
let offlineEarned = 0;
let offlineSeconds = 0;

function fmt(n){
 if(!isFinite(n))return "∞";
 if(n<10)return n.toFixed(2).replace(/0+$/,"").replace(/\.$/,"");
 const units=["","K","M","B","T","Qa","Qi"];let i=0;
 while(Math.abs(n)>=1000&&i<units.length-1){n/=1000;i++}
 return (n>=100? n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2)).replace(/\.0+$/,"")+units[i]
}

const SYNERGIES=[
 {id:"predator",name:"Predator",parts:["clawed","fangs"],dps:0,tap:.15,desc:"Claws and fangs turn every tap into a more efficient hunt."},
 {id:"aerialHunter",name:"Aerial Hunter",parts:["wings","compound"],dps:.25,tap:0,desc:"Wings and compound eyes create an aerial hunting build."},
 {id:"insectoid",name:"Insectoid Colony",parts:["insectoid","antennae"],dps:.20,tap:.10,desc:"Six legs and antennae accelerate chemical discovery."},
 {id:"armored",name:"Armored Organism",parts:["plates","hooved"],dps:.15,tap:0,desc:"Armor and sturdy legs make the creature exceptionally efficient."},
 {id:"grappler",name:"Grappler",parts:["longArms","prehensile"],dps:0,tap:.20,desc:"Long arms and a prehensile tail give every tap extra leverage."}
];
function activeSynergies(){return SYNERGIES.filter(s=>s.parts.every(id=>state.parts[id]))}
function partBonus(p){const m=MUTATIONS.find(x=>x.id===p.id);if(!m)return {dps:0,tap:0};const tier=Math.max(1,p.tier||1);return {dps:m.dps*tier,tap:m.tap*tier}}
function totals(){
 let dps=0,tap=1;
 for(const p of Object.values(state.parts)){const b=partBonus(p);dps+=b.dps;tap+=b.tap}
 let pm=1,tm=1;
 for(const s of SHOP){const l=state.shop[s.id]||0;pm+=l*(s.passive||0);tm+=l*(s.tap||0)}
 for(const s of activeSynergies()){dps*=1+s.dps;tap*=1+s.tap}
 dps*=pm;tap*=tm;
 if(Date.now()<state.boostUntil){dps*=2;tap*=2}
 return {dps,tap,pm,tm}
}
function milestoneValue(){const reduction=(state.shop.metabolism||0)*.03;return Math.max(1,state.nextMilestone*(1-reduction))}
function toast(s){const x=$("toast");if(!x)return;x.textContent=s;x.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>x.classList.remove("show"),2200)}
function render(){
 const t=totals();
 $("dna").textContent=fmt(state.dna);$("dps").textContent=fmt(t.dps);
 const target=milestoneValue(),pct=Math.min(100,state.dna/target*100);
 $("goalPct").textContent=Math.floor(pct)+"%";$("goalBar").style.width=pct+"%";$("goalLabel").textContent="Next mutation • "+fmt(Math.max(0,target-state.dna))+" DNA";
 $("parts").innerHTML=Object.values(state.parts).map(p=>`<span class="pill">${MUTATIONS.find(x=>x.id===p.id)?.name||p.id} T${p.tier}</span>`).join("");
 const active=activeSynergies();
 let syn=$("synergies");
 if(!syn){syn=document.createElement("div");syn.id="synergies";syn.className="synergies";$("parts").after(syn)}
 syn.innerHTML=active.length?active.map(s=>`<div class="synergy"><b>🧬 ${s.name}</b><span>${s.dps?"+"+Math.round(s.dps*100)+"% DNA/sec ":""}${s.tap?"+"+Math.round(s.tap*100)+"% tap DNA":""}</span></div>`).join(""):"";
 renderCreature();renderShop();
}
function checkMilestone(){if(state.dna>=milestoneValue())setTimeout(openEvolution,100)}
function tap(){const t=totals();state.dna+=t.tap;state.totalDNA+=t.tap;state.taps++;const rect=$("tapTarget").getBoundingClientRect();const x=rect.left+rect.width*(.25+Math.random()*.5),y=rect.top+rect.height*(.25+Math.random()*.4);const f=document.createElement("div");f.className="float";f.textContent="+"+fmt(t.tap);f.style.left=x+"px";f.style.top=y+"px";document.body.appendChild(f);setTimeout(()=>f.remove(),750);$("tapTarget").classList.remove("pulse");void $("tapTarget").offsetWidth;$("tapTarget").classList.add("pulse");checkMilestone();render();saveState(state)}
function tick(now){const dt=Math.min(1,(now-last)/1000);last=now;tickAcc+=dt;const t=totals();if(t.dps>0){state.dna+=t.dps*dt;state.totalDNA+=t.dps*dt}if(tickAcc>.25){tickAcc=0;checkMilestone();render()}requestAnimationFrame(tick)}
function showRewardedAd(onSuccess){setTimeout(()=>onSuccess?.(),0)}
function applyOfflineProgress(){
 const seen=Number(state.lastSeen)||Date.now();
 const elapsed=Math.max(0,Math.min(OFFLINE_CAP,(Date.now()-seen)/1000));
 if(elapsed<5)return;
 const t=totals();
 offlineSeconds=Math.floor(elapsed);offlineEarned=t.dps*elapsed;
 if(offlineEarned>0){state.dna+=offlineEarned;state.totalDNA+=offlineEarned;saveState(state)}
}
function showOfflineWelcome(){
 if(offlineEarned<=0)return;
 const mins=Math.floor(offlineSeconds/60),hours=Math.floor(mins/60),m=mins%60;
 const away=hours?`${hours}h ${m}m`:mins?`${mins}m`:`${offlineSeconds}s`;
 toast(`Welcome back! ${away} away • +${fmt(offlineEarned)} DNA`);
}
applyOfflineProgress();
setCreatureState(state);setShopContext(state,render,toast);setEvolutionContext(state,render,toast);
$("tapBtn").addEventListener("click",tap);$("tapTarget").addEventListener("pointerdown",e=>{e.preventDefault();tap()});$("menuBtn").addEventListener("click",()=>$("shopView").classList.add("show"));$("shopBtn").addEventListener("click",()=>$("shopView").classList.add("show"));$("shopClose").addEventListener("click",()=>$("shopView").classList.remove("show"));$("doubleBtn").addEventListener("click",()=>showRewardedAd(()=>{state.boostUntil=Date.now()+15*60*1000;state.boostType="double";saveState(state);render();toast("DNA production doubled for 15 minutes!")}));
render();showOfflineWelcome();requestAnimationFrame(tick);
