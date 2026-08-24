import { saveState } from "./persistence.js";
let state=null,renderUI=()=>{},toast=()=>{};
const BOSSES=[{id:"ancientPredator",name:"The Ancient Predator",hp:25000,reward:5000,essence:2},{id:"crystalColossus",name:"Crystal Colossus",hp:250000,reward:75000,essence:5},{id:"voidLeviathan",name:"Void Leviathan",hp:2500000,reward:1000000,essence:12}];
const $=id=>document.getElementById(id); const fmt=n=>{if(n<1000)return Math.floor(n);const u=['K','M','B','T'];let i=-1;while(n>=1000&&i<u.length-1){n/=1000;i++}return n.toFixed(n>=100?0:n>=10?1:2)+u[i]};
export function setBossContext(s,r,t){state=s;renderUI=r;toast=t;state.boss=state.boss||{index:0,hp:0,active:false,defeated:0}}
export function currentBoss(){return BOSSES[Math.min(state.boss.index,BOSSES.length-1)]}
export function openBoss(){const b=currentBoss();if(!b)return;if(!state.boss.active){state.boss.hp=b.hp;state.boss.active=true;saveState(state)}renderBoss()}
function renderBoss(){const b=currentBoss(),modal=$("bossModal");if(!modal)return;const hp=Math.max(0,state.boss.hp),pct=hp/b.hp*100;$("bossName").textContent=b.name;$("bossHp").textContent=`${fmt(hp)} / ${fmt(b.hp)} HP`;$("bossBar").style.width=pct+"%";$("bossReward").textContent=`Reward: ${fmt(b.reward)} DNA • +${b.essence} Essence`;modal.classList.add("show")}
export function attackBoss(damage){if(!state?.boss?.active||damage<=0)return false;state.boss.hp=Math.max(0,state.boss.hp-damage);if(state.boss.hp<=0){const b=currentBoss();state.dna+=b.reward;state.totalDNA+=b.reward;state.essence+=b.essence;state.totalEssence+=b.essence;state.boss.active=false;state.boss.defeated++;state.boss.index=Math.min(BOSSES.length-1,state.boss.index+1);saveState(state);$("bossModal")?.classList.remove("show");toast(`👹 ${b.name} defeated! +${fmt(b.reward)} DNA • +${b.essence} Essence`);renderUI();return true}saveState(state);renderBoss();return false}
export function renderBossButton(){const b=currentBoss(),btn=$("bossBtn");if(btn)btn.textContent=state.boss?.active?`👹 ${b.name} • ${fmt(state.boss.hp)} HP`:`👹 Challenge ${b.name}`}
export function bossList(){return BOSSES}
