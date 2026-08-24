import { SHOP } from "./data/upgrades.js";
import { saveState } from "./persistence.js";

let state = null;
let renderUI = () => {};
let toast = () => {};
const $ = id => document.getElementById(id);

function fmt(n){
 if(!isFinite(n))return "∞";
 if(n<10)return n.toFixed(2).replace(/0+$/,"").replace(/\.$/,"");
 const units=["","K","M","B","T","Qa","Qi"];let i=0;
 while(Math.abs(n)>=1000&&i<units.length-1){n/=1000;i++}
 return (n>=100?n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2)).replace(/\.0+$/,"")+units[i];
}
export function setShopContext(nextState,rerender,showToast){state=nextState;renderUI=rerender;toast=showToast}
function shopCost(s){return s.base*Math.pow(1.15,state.shop[s.id]||0)}
export function renderShop(){
 const list=$("shopList");if(!list)return;
 list.innerHTML=SHOP.map(s=>{const l=state.shop[s.id]||0,cost=shopCost(s),locked=s.requires&&!state.parts[s.requires];return `<div class="card"><div class="cardTop"><div><h3>${s.name}</h3><p>${s.desc}</p></div><div class="level">LV ${l}${s.max<Infinity?"/"+s.max:""}</div></div><p style="margin-top:8px;color:#b7c5df">${s.effect}</p><button class="buy" data-shop="${s.id}" ${locked||l>=s.max||state.dna<cost?"disabled":""}>${locked?"Requires Insectoid Legs":l>=s.max?"MAXED":"Buy • "+fmt(cost)+" DNA"}</button></div>`}).join("");
 document.querySelectorAll("[data-shop]").forEach(b=>b.addEventListener("click",()=>buyShop(b.dataset.shop)));
}
function buyShop(id){const s=SHOP.find(x=>x.id===id);if(!s)return;const l=state.shop[id]||0,c=shopCost(s);if(l>=s.max||state.dna<c||(s.requires&&!state.parts[s.requires]))return;state.dna-=c;state.shop[id]=l+1;saveState(state);renderUI();toast(s.name+" upgraded to Lv "+(l+1))}
