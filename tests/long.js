// Долгая симуляция: игрок кликает CPS раз/с, раз в секунду покупает самое выгодное, перерождается,
// когда 2 мин нет нового рекорда, и тратит души на дары (самый дешёвый доступный).
// Перерождение строго каждые EVERY секунд (по умолчанию 1800) — так варианты баланса сравниваются без шума.
// MODE=cur — игра как есть; MODE=dbl — дары ×2 за уровень (как было до 22.10); MODE=lin TL=… — свой линейный шаг.
// Пример: MODE=cur HOURS=12 node tests/long.js   (12 ч игры считаются ~1 мин)
const vm=require('vm'),fs=require('fs');const SRC=process.env.SRC||require('path').join(__dirname,'..','game.js');
let simNow=1.8e12;class D extends Date{constructor(...a){a.length?super(...a):super(simNow)}static now(){return simNow}}
const els={};const El=id=>{const e={id,style:{},dataset:{},children:[],hidden:false,textContent:'',innerHTML:'',className:'',_h:{},classList:{add(){},remove(){},toggle(){},contains(){return false}},appendChild(c){e.children.push(c)},addEventListener(t,f){e._h[t]=f},getBoundingClientRect:()=>({left:0,top:0}),offsetWidth:0,setAttribute(){},getAttribute(){return null}};return e};
let raf;const ls={};
const ctx={document:{getElementById:i=>els[i]||(els[i]=El(i)),createElement:()=>El(),querySelectorAll:()=>[],_h:{},addEventListener(){} ,querySelector:()=>null},performance:{now:()=>0},requestAnimationFrame:f=>{raf=f},setInterval(){},setTimeout(){},localStorage:{getItem:k=>ls[k]||null,setItem:(k,v)=>{ls[k]=v}},Date:D,console,navigator:{language:'ru-RU'},clearTimeout(){}};
ctx.window=ctx;vm.createContext(ctx);const run=c=>vm.runInContext(c,ctx);
(async()=>{
let code=fs.readFileSync(SRC,'utf8');const TCD=/tc=i=>TL\[i\]\?TL\[i\]\*\(\(S\.t\[i\]\|0\)\+1\):TB\[i\]\*Math\.pow\(2,S\.t\[i\]\);/;if(process.env.MODE!='cur'&&!TCD.test(code))throw 'tc not found';
const MODE0=process.env.MODE||'cur';if(MODE0!='cur')code=code.replace(TCD,MODE0=='dbl'?'tc=i=>TB[i]*Math.pow(2,S.t[i]|0);':`tc=i=>[${process.env.TL||'3,3,3,5,5,8,8,10,30'}][i]*((S.t[i]|0)+1);`);
vm.runInContext(code,ctx);await new Promise(r=>setImmediate(r));
const MODE=process.env.MODE||'cur',CPS=+(process.env.CPS||5),HOURS=+(process.env.HOURS||6);
run('S=S0();S.tut=9;spawn();ck.last=0;ck.iv=[];ck.ts=[];ck.m=1;sfx=()=>{};');raf(0);
let tsc=1000,acc=0;const click=()=>els.arena._h.pointerdown({isTrusted:true,pointerType:'touch',clientX:5,clientY:5,timeStamp:(tsc+=1000/CPS*(0.6+Math.random()*0.8))});
const buyBest=()=>run(`(()=>{for(let n=0;n<40;n++){let b=null,bv=0;for(const k of ['w','g']){const A=k=='w'?WEAPONS:GODS,L=k=='w'?S.w:S.g;A.forEach((a,i)=>{const c=cost(a[2],L[i]);const v=a[1]*((L[i]+1)*mult(L[i]+1)-L[i]*mult(L[i]))/c*(k=='w'?${CPS}:1);if(S.gold>=c&&v>bv){bv=v;b=[k,i]}})}if(!b)break;BQ=1;buy(b[0],b[1])}})()`);
const spend=()=>run(`(()=>{for(let n=0;n<2000;n++){let b=-1,bc=Infinity;S.t.forEach((l,i)=>{if(l<TM[i]&&tc(i)<bc){bc=tc(i);b=i}});if(b<0||S.souls<bc)break;buyT(b)}})()`);
let tt=0,lastRec=0,rec=1,reb=0;const marks={},T=HOURS*3600;
const report=[0.25,0.5,1,2,3,4,5,6,8,10,12].filter(h=>h<=HOURS);
while(tt<T*20){tt++;simNow+=50;raf(tt*50);acc+=CPS/20;while(acc>=1){acc--;click()}
 if(tt%20==0){const s=tt/20;buyBest();if(s%30==0)run(`try{claimLoot()}catch(e){};try{dClaim()}catch(e){};for(let j=0;j<8;j++)try{qClaim(j)}catch(e){};try{for(let sl=0;sl<6;sl++){let bi=-1,br=S.eq[sl];S.inv.forEach((it,k)=>{if(it.s==sl&&it.r>br){br=it.r;bi=k}});if(bi>=0)equip(sl,br)}}catch(e){};for(let k=0;k<4;k++)try{useSk(k)}catch(e){}`);
  if(run('S.farm')&&s%15==0)els.bRetry.onclick();
  const mx=run('S.max');if(mx>rec){rec=mx;lastRec=s}
  if(s%(+(process.env.EVERY||1800))==0&&run('pcd()')<=0&&run('soulGain()')>=1){run('prestige()');reb++;spend();lastRec=s;}
  for(const h of report)if(s==h*3600)marks[h]=`рекорд ${run('S.max')} · этаж ${run('S.floor')} · перерожд. ${reb} · души всего ${run('fmt(S.tot)')} · дары [${run('S.t.join(",")')}]`}}
console.log(`== ${MODE} CPS ${CPS}`);for(const h in marks)console.log(`${h} ч: ${marks[h]}`);
})().catch(e=>{console.log('ERR',e);process.exit(1)});
