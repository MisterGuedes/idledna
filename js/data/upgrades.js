export const SHOP = [
 {id:"herding",name:"Herding Instinct",base:50,max:Infinity,effect:"+10% passive DNA/sec per level",desc:"Coordinated movement makes every limb work harder.",passive:.10,milestones:{10:.25,25:.50,50:1}},
 {id:"pack",name:"Pack Hunting",base:75,max:Infinity,effect:"+10% DNA/tap per level",desc:"Aggressive group instincts sharpen each interaction.",tap:.10,milestones:{10:.25,25:.50,50:1}},
 {id:"nocturnal",name:"Nocturnal Vision",base:100,max:Infinity,effect:"+5% passive +5% tap per level",desc:"Night-adapted senses keep the metabolism active.",passive:.05,tap:.05,milestones:{10:.25,25:.50,50:1}},
 {id:"hide",name:"Thick Hide",base:60,max:Infinity,effect:"+8% passive DNA/sec per level",desc:"Dense skin preserves energy between bursts.",passive:.08,milestones:{10:.25,25:.50,50:1}},
 {id:"metabolism",name:"Efficient Metabolism",base:90,max:Infinity,effect:"-3% next milestone per level",desc:"The creature reaches its next evolutionary leap sooner.",milestone:.03,milestones:{10:.25,25:.50,50:1}},
 {id:"territorial",name:"Territorial Display",base:120,max:5,effect:"+15% DNA/tap per level (max 5)",desc:"Showy displays turn every tap into a declaration.",tap:.15},
 {id:"swarm",name:"Swarm Coordination",base:200,max:Infinity,effect:"+20% passive DNA/sec per level",desc:"Many legs, one mind. Requires Insectoid Legs.",passive:.20,requires:"insectoid",milestones:{10:.25,25:.50,50:1}}
];
