const vm=require('vm'),fs=require('fs'),path=require('path'),ROOT=path.join(__dirname,'..');
let simNow=1.8e12;
class D extends Date{constructor(...a){a.length?super(...a):super(simNow)}static now(){return simNow}}
const els={};
const El=id=>{const e={id,style:{},dataset:{},children:[],hidden:false,textContent:'',innerHTML:'',className:'',_h:{},classList:{add(){},remove(){},toggle(){}},appendChild(c){e.children.push(c)},addEventListener(t,f){e._h[t]=f},getBoundingClientRect:()=>({left:0,top:0}),offsetWidth:0};return e};
let lsN=0,raf;const ls={};
const ctx={document:{getElementById:i=>els[i]||(els[i]=El(i)),createElement:()=>El(),querySelectorAll:()=>[],_h:{},addEventListener(t,f){const p=this._h[t];this._h[t]=p?(e=>{p(e);f(e)}):f}},performance:{now:()=>0},requestAnimationFrame:f=>{raf=f},setInterval(){},setTimeout(){},localStorage:{getItem:k=>ls[k]||null,setItem:(k,v)=>{ls[k]=v;lsN++}},Date:D,console,navigator:{language:'ru-RU'},clearTimeout(){}};ctx.document.querySelector=()=>null;
ctx.window=ctx;vm.createContext(ctx);
const run=c=>vm.runInContext(c,ctx);
let fails=0;const ok=(n,c)=>{console.log((c?'PASS ':'FAIL ')+n);if(!c)fails++};
(async()=>{
vm.runInContext(fs.readFileSync(ROOT+'/game.js','utf8'),ctx);
await new Promise(r=>setImmediate(r));
const CPS=+(process.env.CPS||5), CLAIM=process.env.CLAIM=='1';
var acc2=0;let tsc=1000;const click=()=>els.arena._h.pointerdown({isTrusted:true,pointerType:'touch',clientX:5,clientY:5,timeStamp:(tsc+=1000/CPS*(0.6+Math.random()*0.8))});
raf(0);run('S=S0();spawn();ck.last=0;ck.iv=[];ck.ts=[];ck.m=1');let tt=0;
// buys "best value" like the UI hint: max dmg gain per gold among affordable
const buyBest=()=>run(`(()=>{let n=0;for(;n<30;n++){let b=null,bv=0;for(const k of ['w','g']){const A=k=='w'?WEAPONS:GODS,L=k=='w'?S.w:S.g;A.forEach((a,i)=>{const c=cost(a[2],L[i]);const v=a[1]*((L[i]+1)*mult(L[i]+1)-L[i]*mult(L[i]))/c*(k=='w'?${CPS}:1);if(S.gold>=c&&v>bv){bv=v;b=[k,i]}})}if(!b)break;BQ=1;buy(b[0],b[1])}return n})()`);
let firstBuy=null,ev=[],farmT=0,att={},lastMax=1,wasBoss=false;
const out={};
for(const sec of [30,60,90,120,180,300,600,900]){
 while(tt<sec*20){tt++;simNow+=50;raf(tt*50);
  acc2=(typeof acc2=="undefined"?0:acc2)+CPS/20;while(acc2>=1){acc2--;click()}
  if(tt%20==0){const nb=buyBest();if(nb&&firstBuy===null)firstBuy=tt/20;
   if(CLAIM&&tt%200==0){run('try{dClaim()}catch(e){}');for(let j=0;j<8;j++)run(`try{qClaim(${j})}catch(e){}`)}
   const ib=run('inBoss');if(ib&&!wasBoss){const f=run('S.floor');att[f]=(att[f]||0)+1}wasBoss=ib;
   const mx=run('S.max');if(mx>lastMax){if(mx%10==0)ev.push(`boss ${mx} @${tt/20}s (tries ${att[mx]})`);lastMax=mx}
   if(run('S.farm')){farmT++;if(farmT%15==0)els.bRetry.onclick()}}}
 out[sec]=`fl ${run('S.floor')} max ${run('S.max')} gold ${run('fmt(S.gold)')} click ${run('fmt(clickD())')} dps ${run('fmt(dps())')}`;
}
console.log('CPS',CPS,'claim',CLAIM,'firstBuy',firstBuy,'s');
for(const k in out)console.log(k+'s',out[k]);
console.log(ev.slice(0,12).join('\n'));
})().catch(e=>{console.log('ERR',e);process.exit(1)});
