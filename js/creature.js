import { MUTATIONS } from "./data/mutations.js";

let state = null;
export function setCreatureState(nextState) { state = nextState; }

function randSeed(){return Math.floor(Math.random()*1e9)}
function seeded(seed){let t=seed>>>0;return()=>((t=t*1664525+1013904223>>>0)/4294967296)}
function transformFor(p){const r=seeded(p.seed);const sx=1+(r()*.24-.12), sy=1+(r()*.24-.12), rot=(r()*12-6);return `translate(200 205) rotate(${rot}) scale(${sx} ${sy}) translate(-200 -205)`}

export function renderCreature(){
 const parts=state.parts, evolved=Object.values(parts).length>0;
 const body=`<g class="wobble">
  <ellipse cx="200" cy="222" rx="${evolved?112:92}" ry="${evolved?126:92}" fill="#6f88a9" opacity=".18"/>
  <ellipse cx="200" cy="210" rx="${evolved?98:80}" ry="${evolved?116:80}" fill="url(#bodyGrad)" stroke="#273a57" stroke-width="7"/>
  <ellipse cx="176" cy="172" rx="${evolved?28:20}" ry="${evolved?17:13}" fill="#fff" opacity=".08"/>
 </g>`;
 let defs=`<defs>
  <radialGradient id="bodyGrad" cx="35%" cy="25%"><stop stop-color="${evolved?"#74d9c0":"#76b7bd"}"/><stop offset="1" stop-color="${evolved?"#334d78":"#304a68"}"/></radialGradient>
  <linearGradient id="wingGrad" x1="0" x2="1"><stop stop-color="#8ee8ff" stop-opacity=".55"/><stop offset="1" stop-color="#8ba7ff" stop-opacity=".12"/></linearGradient>
 </defs>`;
 let g="";
 if(!evolved){
   g+=`<g class="wobble"><circle cx="200" cy="210" r="24" fill="#18253d" stroke="#8ce8d0" stroke-width="5"/><circle cx="192" cy="202" r="7" fill="#c7fff0" opacity=".55"/><circle cx="205" cy="217" r="4" fill="#8ba7ff" opacity=".7"/></g>`;
 } else {
   const b=parts.back;
   if(b){const m=MUTATIONS.find(x=>x.id===b.id), s=1+(b.tier-1)*.1;
    if(m.id==="spikes")g+=`<g transform="translate(0 5) scale(${s})">${Array.from({length:6+(b.tier-1)},(_,i)=>`<path d="M${115+i*29} ${145-Math.abs(2.5-i)*4} l12 -27 l12 28z" fill="#a6b6d3" stroke="#263955" stroke-width="5"/>`).join("")}</g>`;
    if(m.id==="plates")g+=`<g>${Array.from({length:5+(b.tier-1)},(_,i)=>`<path d="M${130+i*28} 160 Q${144+i*28} 125 ${158+i*28} 160 Q${144+i*28} 178 ${130+i*28} 160" fill="#889ab8" stroke="#263955" stroke-width="5"/>`).join("")}</g>`;
    if(m.id==="hollow")g+=`<path d="M132 155 Q200 130 268 155 L258 184 Q200 160 142 184z" fill="none" stroke="#a8d4d1" stroke-width="9" opacity=".75"/>`;
    if(m.id==="wings")g+=`<g><path d="M132 170 Q45 70 72 24 Q144 58 185 154 Q140 120 132 170" fill="url(#wingGrad)" stroke="#80c9ef" stroke-width="5"/><path d="M268 170 Q355 70 328 24 Q256 58 215 154 Q260 120 268 170" fill="url(#wingGrad)" stroke="#80c9ef" stroke-width="5"/></g>`;
   }
   const ta=parts.tail;if(ta){const m=MUTATIONS.find(x=>x.id===ta.id);let d=m.id==="shortTail"?"M112 250 Q55 270 80 315":"M115 250 Q45 275 72 320 Q94 342 118 314";g+=`<path d="${d}" fill="none" stroke="#5e7fa0" stroke-width="${m.id==="spikedTail"?18:15}" stroke-linecap="round"/>`;if(m.id!=="shortTail")g+=`<path d="M72 320 l-15 -18 l5 28 l20 -10z" fill="#a9b8d0"/>`}
   const le=parts.legs;if(le){const m=MUTATIONS.find(x=>x.id===le.id), n=m.id==="insectoid"?6:2;let xs=n===2?[155,245]:[125,165,200,235,275,310];g+=`<g transform="${transformFor(le)}">`;xs.forEach((x,i)=>{const y=n===2?302:280+(i%2)*15;g+=`<path d="M${x} 285 Q${x-8} ${y} ${x-4} ${y+32}" stroke="#496b8e" stroke-width="${m.id==="hooved"?24:18}" stroke-linecap="round" fill="none"/>`;g+=`<ellipse cx="${x-4}" cy="${y+34}" rx="18" ry="8" fill="${m.id==="clawed"?"#8da7c7":"#647f9d"}"/>`;if(m.id==="clawed")g+=`<path d="M${x-16} ${y+37} l-7 8 M${x-5} ${y+39} l-2 10 M${x+5} ${y+37} l4 8" stroke="#d8e5f7" stroke-width="4"/>`});g+=`</g>`}
   const ar=parts.arms;if(ar){const m=MUTATIONS.find(x=>x.id===ar.id), len=m.id==="longArms"?92:62;g+=`<g transform="${transformFor(ar)}"><path d="M125 215 Q${85-len/3} ${205} ${75} ${235}" stroke="#5c7c9f" stroke-width="20" stroke-linecap="round" fill="none"/><path d="M275 215 Q${315+len/3} 205 325 235" stroke="#5c7c9f" stroke-width="20" stroke-linecap="round" fill="none"/>`;if(m.id==="clawedArms")g+=`<path d="M75 235 l-16 -12 M75 235 l-18 2 M325 235 l16 -12 M325 235 l18 2" stroke="#d8e5f7" stroke-width="5"/>`;g+=`</g>`}
   const he=parts.head;if(he){const m=MUTATIONS.find(x=>x.id===he.id);if(m.id==="eyes")g+=`<g><circle cx="165" cy="170" r="16" fill="#effffb" stroke="#253b58" stroke-width="6"/><circle cx="235" cy="170" r="16" fill="#effffb" stroke="#253b58" stroke-width="6"/><circle cx="168" cy="172" r="6" fill="#17233c"/><circle cx="232" cy="172" r="6" fill="#17233c"/></g>`;if(m.id==="compound")g+=`<g>${Array.from({length:10},(_,i)=>{let x=155+(i%5)*23,y=157+Math.floor(i/5)*23;return `<circle cx="${x}" cy="${y}" r="13" fill="#8cf1d0" stroke="#223753" stroke-width="5"/>`}).join("")}</g>`;if(m.id==="antennae")g+=`<path d="M166 155 Q125 105 115 80 M234 155 Q275 105 285 80" fill="none" stroke="#86a5c3" stroke-width="6"/><circle cx="115" cy="80" r="9" fill="#a9f2d7"/><circle cx="285" cy="80" r="9" fill="#a9f2d7"/>`}
   const mo=parts.mouth;if(mo){const m=MUTATIONS.find(x=>x.id===mo.id);if(m.id==="fangs")g+=`<path d="M178 217 l7 19 l8 -19 M207 217 l8 19 l7 -19" fill="#eef4ff" stroke="#263953" stroke-width="3"/>`;if(m.id==="beak")g+=`<path d="M180 218 Q200 235 220 218 L200 250z" fill="#d7ad63" stroke="#3c3b36" stroke-width="5"/>`;if(m.id==="mandibles")g+=`<path d="M180 220 Q135 240 165 270 Q190 248 194 230 M220 220 Q265 240 235 270 Q210 248 206 230" fill="none" stroke="#c7d4e8" stroke-width="10" stroke-linecap="round"/>`}
 }
 g+=`<ellipse cx="200" cy="212" rx="14" ry="10" fill="#15233a" opacity=".7"/>`;
 document.getElementById("creature").innerHTML=defs+body+g;
}
