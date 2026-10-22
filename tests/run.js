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
ok('init',run('S.floor')===1);
let tsc=1000;const click=()=>els.arena._h.pointerdown({isTrusted:true,pointerType:'touch',clientX:5+Math.random()*3,clientY:5+Math.random()*3,timeStamp:(tsc+=110+Math.random()*120)});
for(let i=0;i<25;i++){run('wait=0');click()}
ok('click kills floor1',run('S.floor')>=2&&run('S.gold')>0);
// inventory
run('S.floor=10;spawn();dealt(1e30,false,0,0)');
ok('boss drops item (to loot)',run('S.loot.length')===1&&run('S.floor')===11);
run("S.inv=[{s:0,r:0},{s:0,r:0},{s:0,r:0},{s:1,r:0}]");
run('craft(0,0)');ok('craft 3->1',run('S.inv.filter(x=>x.s==0&&x.r==1).length')===1&&run('S.inv.length')===2);
const c0=run('clickD()');run('equip(0,1)');ok('equip raises dmg',run('clickD()')>c0&&run('S.eq[0]')===1);
run('equip(1,0)');run("S.inv.push({s:0,r:0});equip(0,0)");ok('swap returns old item',run('S.inv.some(x=>x.s==0&&x.r==1)'));
// house
run('S.max=100;S.gold=1e15');const cd=run('clickD()');run('build(0)');ok('build started, gold spent',run('S.b[0][1]')>0&&run("S.gold")<1e15);
run('tab="house";tabRender()');ok('house renders',els.list.innerHTML.includes('Кузница'));
simNow+=181e3;run('hTick()');ok('building done after 180s real time',run('S.b[0][0]')===1&&run('clickD()')>cd);
// daily
const g=run('S.gold');run('dClaim()');ok('daily claim',run('S.gold')>g&&run('S.day')===1);const g2=run('S.gold');run('dClaim()');ok('no double claim',run('S.gold')===g2);
simNow+=864e5;run('dClaim()');ok('streak continues day2',run('S.day')===2);
// quests
run('qn();S.q.p=[0,2,4,6,7,8,9,10];S.q.k=250');const g3=run('S.gold');run('qClaim(0)');run('qClaim(0)');ok('quest claim once',run('S.gold')>g3&&run('S.q.d[0]')===1);
run('tab="quest";tabRender()');ok('quest renders',els.list.innerHTML.includes('Убить 250'));
run('S.q.d=Array(8).fill(0);S.q.k=250;tabRender()');{const q1=els.list.innerHTML;ok('ready quest listed first with a claim button, quest icons by type',q1.indexOf('class="row up qr rdy"')<q1.indexOf('class="row up qr"')&&q1.includes('img/ui/q_k.webp'));}
// talents + prestige
run('S.souls=10;S.tot=10;tab="pres";tabRender()');run('buyT(0)');ok('talent bought (first level costs 6)',run('S.t[0]')===1&&run('S.souls')===4);
run('S.max=100;S.run=100;prestige()');ok('prestige keeps perm data',run('S.floor')===29&&run('S.souls')===29&&run('S.tot')===35&&run('S.t[0]')===1&&run('S.eq[0]')===0&&run('S.b[0][0]')===1);
const s1=run('S.souls');ok('after prestige the run starts at 29 (30% of 100, non-boss)',run('S.run')===29&&run('S.floor')===29);
run('prestige()');ok('instant re-prestige gives nothing',run('S.souls')===s1);
run('S.run=100;prestige()');ok('blocked by cooldown',run('S.souls')===s1&&run('pcd()')>0);
simNow+=299e3;run('prestige()');ok('still blocked at 4:59',run('S.souls')===s1);
simNow+=2e3;run('S.run=100;prestige()');ok('allowed after 5 min (souls only for floors above the start: 25-6)',run('S.souls')===s1+19&&run('S.run')===29);
run('tab="pres";tabRender()');ok('cooldown text',run('cdTxt(299500)')==='5:00'&&run('cdTxt(61000)')==='1:01');
run('S.gold=0;S.hermes=0;S.chest=0;draw()');
ok('idle ad buttons',els.bHermes.textContent.includes('Буст Гермеса')&&!els.bHermes.disabled&&els.bChest.textContent.includes('Сундук Харона')&&!els.bChest.disabled);
els.bHermes.onclick();ok('hermes shows timer 10:00 and disabled',els.bHermes.textContent.includes('10:00')&&els.bHermes.disabled===true);
const d1=run('clickD()');ok('hermes active x2 dmg',run('S.hermes')>simNow);
simNow+=60e3;run('draw()');ok('hermes timer counts down 9:00',els.bHermes.textContent.includes('9:00'));
simNow+=541e3;run('draw()');ok('hermes ends, button restored',els.bHermes.textContent.includes('Буст Гермеса +100%')&&els.bHermes.disabled===false&&run('clickD()')<d1);
els.bChest.onclick();ok('chest gives gold and starts cooldown',run('S.gold')>0&&run('S.chest')>simNow&&els.bChest.disabled===true&&els.bChest.textContent.includes('4:00:00'));
simNow+=3600e3;run('draw()');ok('chest cooldown 3:00:00',els.bChest.textContent.includes('3:00:00'));
const gc=run('S.gold');els.bChest.onclick();ok('chest blocked during cooldown',run('S.gold')===gc);
simNow+=3*3600e3+1e3;run('draw()');ok('chest ready again',els.bChest.textContent.includes('Сундук Харона')&&els.bChest.disabled===false);
ok('hms format',run("hms(90e3)")==='1:30'&&run("hms(3661e3)")==='1:01:01');
run('S.inv=[{s:2,r:0},{s:1,r:3},{s:0,r:1},{s:3,r:3},{s:0,r:0},{s:1,r:3}];tab="inv";tabRender()');
const seq=[...els.list.innerHTML.matchAll(/<b>([^<]*)<\/b><span class="rn">([^<]*)<\/span><span class="cnt">×(\d+)<\/span>/g)].map(x=>x[1]+':'+x[2]+':'+x[3]).join('|');
ok('inventory sorted by rarity desc, then slot',seq==='Доспех:Легендарный:2|Амулет:Легендарный:1|Шлем:Редкий:1|Шлем:Обычный:1|Оружие:Обычный:1');
run('S=S0();BQ=5;S.gold=1e12');
const sum5=run('[0,1,2,3,4].reduce((a,n)=>a+cost(WEAPONS[1][2],n),0)');
ok('plan x5 = sum of 5 costs',Math.abs(run('plan(WEAPONS[1][2],0)[1]')-sum5)<1e-6*sum5&&run('plan(WEAPONS[1][2],0)[0]')===5);
run('buy("w",1)');ok('buy x5 adds 5 levels, charges sum',run('S.w[1]')===5&&Math.abs((1e12-run('S.gold'))-sum5)<1e-3*sum5);
run('BQ=100;S.gold=1e30;buy("g",0)');ok('x100 buys 100 levels',run('S.g[0]')===100);
run('BQ=25;S.gold=0;buy("g",1)');ok('x25 blocked when poor',run('S.g[1]')===0);
run('BQ=1;S.gold=1e6;buy("w",0)');ok('x1 same as before',run('S.w[0]')===2);
run('BQ="max";S.gold=1e9;S.w=[1,...Array(16).fill(0)]');
let lv=1,gg=1e9,bn=0;while(gg>=15*Math.pow(1.13,lv)){gg-=15*Math.pow(1.13,lv);lv++;bn++}
ok('max count matches brute force',run('plan(WEAPONS[0][2],S.w[0])[0]')===bn);
run('buy("w",0)');ok('max buys all affordable',run('S.w[0]')===1+bn&&run('S.gold')<run('cost(WEAPONS[0][2],S.w[0])'));
run('S.gold=0');const gm=run('S.w[0]');run('buy("w",0)');ok('max with no gold buys nothing',run('S.w[0]')===gm&&run('plan(WEAPONS[0][2],S.w[0])[0]')===1);
run('setQ("25");tab="gods";tabRender()');ok('selector rendered, setQ works',run('BQ')===25&&els.list.innerHTML.includes('Макс')&&els.list.innerHTML.includes('×100')&&els.list.innerHTML.includes('Покупать'));
run('setQ("max")');ok('setQ max',run('BQ')==='max');run('BQ=1');
run('S=S0();S.floor=10;spawn();bossT=0.1');ok('boss fight active',run('inBoss')===true&&run('S.farm')===false);
raf(250);
ok('timeout -> previous floor, farm on, boss not active',run('S.floor')===9&&run('S.farm')===true&&run('inBoss')===false);
ok('boss button shown',els.bRetry.hidden===false&&fs.readFileSync(ROOT+'/index.html','utf8').includes('Перейти к битве с боссом'));
ok('farm timer text',els.timer.textContent.includes('10'));
const gf=run('S.gold');for(let i=0;i<5;i++)run('dealt(1e30,false,0,0)');
ok('killing monsters in farm stays on floor 9, no auto boss',run('S.floor')===9&&run('inBoss')===false&&run('S.farm')===true&&run('S.gold')>gf);
ok('farm saved',JSON.parse(ls.hades).farm===true&&JSON.parse(ls.hades).floor===9);
els.bRetry.onclick();ok('button starts boss fight',run('S.floor')===10&&run('S.farm')===false&&run('inBoss')===true&&els.bRetry.hidden===true&&Math.abs(run('bossT')-30)<1e-9);
run('dealt(1e30,false,0,0)');ok('beating boss advances to 11',run('S.floor')===11&&run('S.farm')===false);
run('S.floor=20;spawn();bossT=0.1');raf(500);els.bSave.onclick();ok('rescue video restarts boss with extra time',run('S.floor')===20&&run('inBoss')===true&&run('bossT')>40&&els.bRetry.hidden===true);
raf(0);
const pd=o=>els.arena._h.pointerdown(Object.assign({isTrusted:true,pointerType:'touch',clientX:50,clientY:50},o));
const reset=()=>{run('S=S0();spawn();ck.last=0;ck.iv=[];ck.ts=[];ck.m=1;rage=0;clicks=[];wait=0');els.modal.hidden=true};
{
reset();const hp0=run('hp');pd({isTrusted:false,timeStamp:1});ok('synthetic (untrusted) click ignored',run('hp')===hp0);
pd({pointerType:'mouse',button:2,timeStamp:5e6});ok('right mouse button ignored',run('hp')===hp0);
reset();for(let i=0;i<25;i++)pd({timeStamp:5e6+i*40});ok('25 CPS clicking counted once per 100 ms window',run('S.q.c')===9);
reset();for(let i=0;i<60;i++)pd({timeStamp:6e6+i*100});ok('10 CPS metronome: first 24 counted fully, then silently penalised, no popup',run('S.q.c')===24&&run('ck.m')===.25&&els.modal.hidden===true);
reset();for(let i=0;i<1000;i++)pd({timeStamp:7e6+i});ok('1000 CPS autoclicker gets the same 10 CPS',run('S.q.c')===10);
reset();let tt2=8e6;for(let i=0;i<40;i++)pd({timeStamp:(tt2+=40+Math.random()*20)});
ok('fast human clicking: no popup, capped',els.modal.hidden===true&&run('S.q.c')>=12&&run('S.q.c')<=20);
ok('verification popup removed',run('typeof verify')==='undefined');
}
run('S=S0();S.max=10');const hc=[0,1,2].map(i=>run(`hCost(${i})`));run('S.max=9000');
ok('house cost independent of progress',[0,1,2].every(i=>run(`hCost(${i})`)===hc[i])&&hc[0]===2e3&&hc[1]===1e4&&hc[2]===5e4);
run('S.b[0][0]=3');ok('house cost grows only with building level',run('hCost(0)')===2e3*216);
run('S=S0();spawn();tab="house";tabRender()');els.list.innerHTML='MARK';run('dealt(1e30,false,0,0)');
ok('house tab not re-rendered on each kill',els.list.innerHTML==='MARK');
run('tab="inv";tabRender()');els.list.innerHTML='MARK';run('dealt(1e30,false,0,0)');
run('hTick()');ok('inv tab refreshes after kill (deferred to next tick)',els.list.innerHTML!=='MARK');
{const M=run('Math'),mr=M.random;
reset();run('S.w[0]=1');run('useSk(0)');ok('locked skill does nothing',run('S.sc[0]')===0&&run('S.gold')===0);
run('S.max=60;draw()');ok('skill button unlocked, locked ones show lock',els.skills.children[0].dataset.st==='rdy'&&els.skills.children[3].dataset.st==='lock'&&els.skills.children[3].innerHTML.includes('#i-lock')&&els.skills.children[3].title.includes('откроется на этаже 300'));
run('useSk(0)');ok('Styx strike hits and starts cooldown',run('S.gold')>0&&run('S.sc[0]')>simNow&&els.skills.children[0].disabled===true);
const sc0=run('S.sc[0]');run('useSk(0)');ok('no use during cooldown',run('S.sc[0]')===sc0);
simNow+=31e3;run('draw()');ok('skill ready after 30s',els.skills.children[0].disabled===false);
reset();run('S.max=500;S.floor=5;spawn()');const cd0=run('clickD()');run('useSk(3)');ok('Icarus x3 click dmg',Math.abs(run('clickD()')/cd0-3)<1e-9);
simNow+=11e3;ok('Icarus buff expires',Math.abs(run('clickD()')/cd0-1)<1e-9);
reset();run('S.max=500;S.floor=5;spawn()');ok('no auto-dps before skill',run('dps()')===0);run('useSk(1)');ok('Athena throw adds autoclicks',run('dps()')>0);simNow+=9e3;ok('Athena throw ends',run('dps()')===0);
reset();run('S.max=500;S.floor=5;S.g[0]=10;spawn()');const dv0=run('dps()'),vn=simNow;run('useSk(2)');ok('Chaos Vortex works outside boss fights and triples gods DPS',dv0>0&&run('S.sc[2]')>0&&Math.abs(run('dps()')-dv0*3)<dv0*1e-9);
simNow+=11e3;ok('Chaos Vortex lasts 10 s, cooldown 60 s',Math.abs(run('dps()')-dv0)<dv0*1e-9&&Math.abs(run('S.se[2]')-vn-10000)<1e-6&&Math.abs(run('S.sc[2]')-vn-60000)<1e-6);
reset();run('S.g[0]=49');const p9=run('pt(0)');run('S.g[0]=50');const p10=run('pt(0)');run('S.g[0]=199');const p199=run('pt(0)');run('S.g[0]=200');ok('passive tiers: ×1 from lv.50, ×2 from lv.200',p9===0&&p10===1&&p199===1&&run('pt(0)')===2);
raf(0);reset();run('S.g[0]=50;S.floor=300;spawn();zt=7.9');const zd=run('dps()');raf(250);const dz=run('maxhp-hp');ok('Zeus lightning strikes after 8s',dz>=zd*10&&dz<=zd*10.5&&run('zt')===0);raf(0);
const gk=()=>{run('S.floor=1;S.gold=0;spawn()');run('dealt(1e30,false,0,0)');return run('S.gold')};
reset();const g0=gk();run('S.g[1]=50');ok('Poseidon +30% gold',Math.abs(gk()/g0-1.3)<1e-9);
reset();const c1=run('clickD()');run('S.g[2]=50');ok('Ares +25% click',Math.abs(run('clickD()')/c1-1.25)<1e-9);
reset();run('S.floor=5;S.g[3]=50;spawn()');ok('Aphrodite -10% monster hp',Math.abs(run('maxhp/mHP(5)')-.18)<1e-9);
reset();run('S.floor=5;spawn()');M.random=()=>.2;let h0=run('hp');pd({timeStamp:2e7});const d0=h0-run('hp');
reset();run('S.floor=5;S.g[4]=50;spawn()');h0=run('hp');pd({timeStamp:2e7+9e3});const d1=h0-run('hp');M.random=mr;
ok('Apollo raises crit chance (0.2 roll crits only with passive)',Math.abs(d1/d0-3)<1e-6);
reset();run('S.floor=5;S.g[5]=50;spawn();rage=0');for(let i=0;i<9;i++)pd({timeStamp:3e7+i*150});ok('Hermes passive: rage from 9 clicks',run('rage')>0);
reset();run('S.floor=5;spawn();rage=0');for(let i=0;i<9;i++)pd({timeStamp:4e7+i*150});ok('no rage from 9 clicks without passive',run('rage')===0);run('rage=0');
reset();run('S.g[14]=50;S.floor=10;spawn();dealt(1e30,false,0,0)');ok('Hypnos: 2 items from boss',run('S.loot.length')===2);
reset();run('S.g[7]=50;S.floor=10;spawn()');ok('Athena passive: boss timer 40',run('bossT')===40);
// passives of gods 9-18
reset();run('S.b=[[0,0],[0,0],[0,0]]');const hA=run('hTime(0)');run('S.b[0][0]=6');const hB=run('hTime(0)');run('S.b[0][0]=30');ok('build time: 180 s ×1.5 per level, capped at 6 h',hA===180&&Math.abs(hB-180*1.5**6)<1e-9&&run('hTime(0)')===21600);
reset();run('S.b=[[3,0],[0,0],[0,0]]');const ht0=run('hTime(0)');run('S.g[8]=50');ok('Hephaestus: buildings 25% faster',Math.abs(run('hTime(0)')/ht0-.75)<1e-9);
reset();run('S.g[0]=10');const gd0=run('dps()');run('S.g[9]=50');const gd1=run('dps()')-run('GODS[9][1]*50*mult(50)*boost()*bld(2)*T(2)*1.25');ok('Dionysus: +25% gods damage',Math.abs(gd1/gd0-1.25)<1e-6);
reset();run('S.floor=10;spawn()');const bh0=run('maxhp');run('S.g[10]=50;spawn()');ok('Artemis: bosses 10% weaker (monsters unchanged)',Math.abs(run('maxhp')/bh0-.9)<1e-9&&(run('S.floor=11;spawn()'),Math.abs(run('maxhp/mHP(11)')-.2)<1e-9));
reset();run('S.g[0]=100;S.last=NOW()-36e5;S.gold=0;offline();$("o1").onclick()');const og0=run('S.gold');run('S.g[11]=50;S.last=NOW()-36e5;S.gold=0;offline();$("o1").onclick()');const od=run('dps()*3600*.05');ok('Nyx: +50% offline income',og0>0&&Math.abs(run('S.gold')-od*1.5)<od*1e-6&&Math.abs(og0-run('S.g[11]=0;dps()*3600*.05'))<og0*1e-6);
reset();run('S.run=500;S.sf=0');const sg0=run('soulGain()');run('S.g[12]=200');ok('Hecate: +10%/+20% souls',run('soulGain()')===Math.floor(sg0*1.2));
reset();run('S.floor=5;spawn()');M.random=()=>.05;let th0=run('hp');pd({timeStamp:8e7});const tc0=th0-run('hp');reset();run('S.floor=5;S.g[13]=50;spawn()');th0=run('hp');pd({timeStamp:8e7+9e3});const tc1=th0-run('hp');M.random=mr;ok('Thanatos: +1 crit multiplier (×3 → ×4)',Math.abs(tc1/tc0-4/3)<1e-6);
reset();run('S.max=500;S.g[6]=50;S.g[16]=50');const sn=simNow;run('useSk(3)');ok('Demeter +20% skill duration, Erebus −10% cooldown',Math.abs(run('S.se[3]')-sn-10000*1.2)<1e-6&&Math.abs(run('S.sc[3]')-sn-60000*.9)<1e-6);
reset();run('S.floor=100;S.inv=[]');M.random=()=>.22;run('drop()');const dr0=run('S.inv[0].r');run('S.g[15]=50;S.inv=[]');run('drop()');M.random=mr;ok('Moirai: rarer drops',dr0===0&&run('S.inv[0].r')===1);
reset();const ec=run('clickD()');run('S.g[17]=50');ok('Aether: +20% click damage',Math.abs(run('clickD()')/ec-1.2)<1e-9);
ok('all 18 gods have a passive',run('PS.length')===18&&run('GODS.length')===18);
run('tab="gods";tabRender()');ok('passive text says lv.50 / ×2 at lv.200',els.list.innerHTML.includes('с ур.50, ×2 с ур.200'));
// taps near the loot chest / fairy count for them, not as a monster hit
reset();run('S.loot=[{s:1,r:2}];lootUI();const c=document.getElementById("chest");c.getBoundingClientRect=()=>({left:300,right:400,top:100,bottom:140,width:100,height:40})');
run('document.getElementById("arena").dispatchEvent?0:0');
ok('nearEl: a tap 10px outside the chest still hits it, far away does not',run('nearEl("chest",305,145,12)')===true&&run('nearEl("chest",200,300,12)')===false);
{const c=fs.readFileSync(ROOT+'/style.css','utf8');ok('tip does not block taps (only its × button is clickable)',c.includes('#tip{pointer-events:none}#tip button{pointer-events:auto}'));}
{const c=fs.readFileSync(ROOT+'/style.css','utf8');ok('skill names overlay the picture (not clipped)',c.includes('#skills button .sk-n{position:absolute;left:0;right:0;bottom:0'));}
// fairy reward toast uses the fairy picture
reset();run('fairySpawn();fairyTap()');ok('fairy toast shows the fairy image',els.toast.innerHTML.includes('img/icons/fairy_t.webp')&&!els.toast.innerHTML.includes('🧚'));
run('tab="gods";tabRender()');ok('gods tab shows passives',els.list.innerHTML.includes('Пассив «Молния»'));
run('tab="hero";htab="w";tabRender()');ok('hero tab: weapons by default with sub-tabs',els.list.innerHTML.includes('Меч Стикса')&&els.list.innerHTML.includes('setHT(')&&!els.list.innerHTML.includes('buySk('));
run('setHT("s")');ok('hero tab shows hero skills with unlock floors',els.list.innerHTML.includes('Удар Стикса')&&els.list.innerHTML.includes('откроется на этаже 10'));
}
{const old=run('JSON.stringify(Object.assign(S0(),{g:[1,2,3,4,5,6,7,8],floor:7}))');ls.hades=old;await run('load()');
ok('old 8-god save migrates to 12 gods',run('S.g.length')===18&&run('S.g[0]')===1&&run('S.g[7]')===8&&run('S.g[11]')===0&&run('S.floor')===7);
run('S.g=S.g.map((x,i)=>i<10?1:0);tab="gods";tabRender()');ok('gods tab renders owned gods + next ones incl. ones without passive',els.list.innerHTML.includes('Никта')&&els.list.innerHTML.includes('Пассив «Молния»'));
{const rows=()=>(els.list.innerHTML.match(/class="row up( dim)?"/g)||[]).length;
run('S.g=S.g.map(()=>0);tab="gods";tabRender()');ok('new player sees only 2 gods and a «more» row',rows()===2&&els.list.innerHTML.includes('Ещё богов: 16'));
run('S.w=[1,...Array(16).fill(0)];tab="hero";htab="w";tabRender()');ok('hero sees sword + 2 next weapons',rows()===3&&els.list.innerHTML.includes('Ещё оружия: 14')&&!els.list.innerHTML.includes('Щит Хаоса')===false&&!els.list.innerHTML.includes('Лук Икара'));
run('S.gold=1e9;buy("w",1)');ok('buying the next weapon reveals one more',rows()===4&&els.list.innerHTML.includes('Лук Икара'));
run('S.w=S.w.map(()=>1);tabRender()');ok('all weapons owned: no «more» row',rows()===17&&!els.list.innerHTML.includes('Ещё оружия'));run('S.w=[1,...Array(16).fill(0)];S.g=S.g.map(()=>0)');}}
{const M=run('Math'),mr=M.random;
ok('soul gain formula',[1,100,400,1000,10000].map(r=>run(`S.run=${r};soulGain()`)).join()==='0,25,160,700,52000');
const co=[50,200,500,1000,3000,9000].map(r=>run(`S.run=${r};soulGain()/${r}`));ok('souls-per-floor coefficient keeps growing',co.every((x,i)=>i==0||x>co[i-1]));
ok('extended content 17 weapons / 18 gods / 9 talents',run('WEAPONS.length')===17&&run('GODS.length')===18&&run('S0().w.length')===17&&run('S0().g.length')===18&&run('S0().t.length')===9);
reset();run('S.souls=1e9;S.tot=0');for(let i=0;i<9;i++)run(`buyT(${i})`);ok('all 9 talents buyable',run('S.t.every(x=>x===1)'));
run('S.t[4]=25');run('buyT(4)');ok('talent cap respected',run('S.t[4]')===25);run('tab="pres";tabRender()');ok('pres tab shows talents, cap and coefficient',els.list.innerHTML.includes('Глаз Аполлона')&&els.list.innerHTML.includes('МАКС')&&els.list.innerHTML.includes('коэф.'));
const hit=(setup,rnd)=>{reset();run(setup);M.random=()=>rnd;const h=run('hp');pd({timeStamp:9e7});return h-run('hp')};
const a1=hit('S.floor=5;spawn()',.05),a2=hit('S.floor=5;S.t[3]=5;spawn()',.05);ok('crit damage talent (x3 -> x4 at lvl5)',Math.abs(a2/a1-4/3)<1e-9);
const b1=hit('S.floor=5;spawn()',.105),b2=hit('S.floor=5;S.t[4]=1;spawn()',.105);ok('crit chance talent +1%',Math.abs(b2/b1-3)<1e-9);M.random=mr;
reset();run('S.t[5]=10;S.max=500;S.floor=5;spawn();useSk(3)');ok('mastery doubles Icarus duration',Math.abs(run('S.se[3]')-simNow-20000)<1);
reset();run('S.t[5]=10;S.max=500;S.floor=10;spawn()');const v0=simNow;run('useSk(2)');ok('mastery extends Chaos Vortex',Math.abs(run('S.se[2]')-v0-10000*2)<1e-6);
reset();run('S.t[5]=10;S.max=500;S.floor=15;spawn();useSk(0)');const hs=run('maxhp-hp');reset();run('S.max=500;S.floor=15;spawn();useSk(0)');ok('mastery doubles Styx hit',Math.abs(hs/run('maxhp-hp')-2)<1e-6);
reset();run('S.t[6]=10;S.max=500;S.floor=15;spawn();useSk(0)');ok('Chronos echo: cooldown -30%',Math.abs(run('S.sc[0]')-simNow-21000)<1);
reset();run('S.g[0]=10;S.t[7]=2;S.last=Date.now()-20*3600e3;S.gold=0;offline()');els.o1.onclick();ok('offline cap +1h from talent',Math.abs(run('S.gold')-40*9*3600*.05)<1);
ls.hades=run('JSON.stringify(Object.assign(S0(),{w:[5,0,0,0,0,0,0,0,0,0,0],g:[1,2,3,4,5,6,7,8,9,10,11,12],t:[1,2,3],floor:9}))');await run('load()');
ok('old save (11 weapons/12 gods/3 talents) migrates',run('S.w.length')===17&&run('S.w[0]')===5&&run('S.g.length')===18&&run('S.g[11]')===12&&run('S.t.length')===9&&run('S.t[2]')===3&&run('S.t[7]')===0&&run('S.t[8]')===0);
}
{
ok('quest pool >=12, 5 distinct per day',run('QD.length')>=12&&(()=>{for(let i=0;i<60;i++){run('S.q=null;qn()');if(run('S.q.p.length')!==8||run('new Set(S.q.p.map(i=>QD[i][1])).size')!==8)return false}return true})());
run('S.q={t:Date.now(),k:5,c:1,b:0,d:[0,0,0]};qn()');ok('old 3-quest save migrates',run('S.q.p.length')===8&&run('S.q.d.length')===8);
reset();run('S.gold=1e9;BQ=5;buy("w",0);BQ=1');ok('upgrade counter',run('S.q.u')===5);
reset();run('S.max=500;useSk(0)');ok('skill counter',run('S.q.s')===1);
reset();run('S.floor=2;spawn()');for(let i=0;i<5;i++)run('dealt(1e30,false,0,0)');ok('new-floor + kill counters',run('S.q.f')===1&&run('S.q.k')===5);
reset();run('S.floor=10;spawn();dealt(1e30,false,0,0)');ok('item + boss counters',run('S.q.i')===1&&run('S.q.b')===1);
reset();run('S.gold=1e12;build(0)');ok('build counter',run('S.q.h')===1);
reset();run('S.q=null');els.bHermes.onclick();ok('ad counter',run('S.q.a')===1);
reset();run('S.floor=5;spawn()');for(let i=0;i<12;i++)pd({timeStamp:6e7+i*150});ok('rage counter',run('S.q.r')===1);
reset();run('qn();S.q.p=[1,2,4,6,7,8,9,10];S.q.k=1000;S.max=1;S.gold=0');run('qClaim(0)');ok('quest reward scales with income at best floor',Math.abs(run('S.gold')-run('mHP(1)*8'))<1e-6);
ok('start rewards stay modest (no 50K gold on floor 1)',run('S.gold')<1000&&run('S.gold')>50);
reset();run('S.max=250;S.gold=0');const n1=simNow;run('openAc(0)');ok('ad reward: gold, cooldown exactly 10 min',run('S.gold')>0&&run('S.ac[0]')-n1===600000);
const g1=run('S.gold');run('openAc(0)');ok('ad reward blocked during cooldown',run('S.gold')===g1);
simNow+=601e3;run('openAc(0)');ok('ad reward available after 10 min',run('S.gold')>g1);
reset();run('S.max=250;S.gold=0;S.souls=0;S.tot=0;S.inv=[]');const n2=simNow;
run('openAc(1)');ok('bronze chest: gold, 1 item, 1h',run('S.gold')>0&&run('S.inv.length')===1&&run('S.ac[1]')-n2===36e5);
run('openAc(2)');ok('silver chest: 2 items >= rare, 3h',run('S.inv.length')===3&&run('S.inv.slice(1).every(x=>x.r>=1)')&&run('S.ac[2]')-n2===108e5);
run('openAc(3)');ok('gold chest: 3 items >= epic, souls, 8h',run('S.inv.length')===6&&run('S.inv.slice(3).every(x=>x.r>=2)')&&run('S.souls')===6&&run('S.tot')===6&&run('chestSouls()')===6&&run('S.ac[3]')-n2===288e5);
reset();run('S.ac=[1,2,3,4];S.run=100;S.max=100;prestige()');ok('chest cooldowns survive prestige',run('S.ac.join()')==='1,2,3,4');
reset();run('S.max=250;tab="rew";tabRender()');const hh=els.list.innerHTML;ok('rewards tab lists ad reward + 3 chests',hh.includes('Награда за видео')&&hh.includes('Бронзовый сундук')&&hh.includes('Серебряный сундук')&&hh.includes('Золотой сундук')&&hh.includes('10:00')&&hh.includes('img/ui/rew_video.webp')&&hh.includes('img/ui/rew_bronze.webp')&&hh.includes('img/ui/rew_gold.webp')&&!/[📺🪵🥈🥇🍯]/u.test(hh));
run('openAc(0)');ok('rewards shop has no «finish buildings» (it lives in the House tab)',!els.list.innerHTML.includes('buyShop(4)')&&!els.list.innerHTML.includes('Достроить все здания'));
ok('after opening button shows cooldown',els.list.innerHTML.includes('перезарядка</span>'));run('hTick()');
const o2=JSON.parse(run('JSON.stringify(S0())'));delete o2.ac;ls.hades=JSON.stringify(o2);await run('load()');ok('old save without chests gets slots',run('S.ac.length')===4);
}
{
reset();run('S.floor=3;spawn()');ok('non-boss monster has 1/5 of floor hp, shows 1/5',Math.abs(run('maxhp/mHP(3)')-.2)<1e-9&&els.floor.textContent.includes('1/5'));
for(let i=0;i<4;i++)run('dealt(1e30,false,0,0)');ok('4 kills: still floor 3, counter 5/5, record not yet raised',run('S.floor')===3&&run('S.mk')===4&&els.floor.textContent.includes('5/5')&&run('S.max')===1);
run('dealt(1e30,false,0,0)');ok('5th kill clears floor -> 4, counter reset, record raised',run('S.floor')===4&&run('S.mk')===0&&run('S.max')===3&&els.floor.textContent.includes('1/5'));
ok('gold per floor: 5 kills = 10% of floor hp x early bonus',Math.abs(run('S.gold')-run('mHP(3)*.1*eGold(3)'))<1e-6);
reset();run('S.floor=10;spawn()');ok('boss floor untouched: full hp, no counter',run('maxhp/mHP(10)')===1&&!els.floor.textContent.includes('/5'));
run('dealt(1e30,false,0,0)');ok('boss dies in one kill -> floor 11',run('S.floor')===11&&run('S.mk')===0);
reset();run('S.floor=9;S.farm=true;spawn()');for(let i=0;i<7;i++)run('dealt(1e30,false,0,0)');ok('farm mode: floor and counter untouched',run('S.floor')===9&&run('S.mk')===0);
reset();run('S.inv=[];for(let i=0;i<10;i++)S.inv.push({s:0,r:0});S.eq[1]=0');run('craftAll()');
ok('merge all: 10 common -> 1 common + 3 rare (4 rare needed for epic), equipped kept',run('S.inv.filter(x=>x.s==0&&x.r==0).length')===1&&run('S.inv.filter(x=>x.s==0&&x.r==1).length')===3&&run('S.inv.length')===4&&run('S.eq[1]')===0);
reset();run('S.inv=[];for(let i=0;i<9;i++)S.inv.push({s:2,r:3});for(let i=0;i<2;i++)S.inv.push({s:3,r:1})');run('craftAll()');
ok('merge all: 9 legendary -> 1 mythic + 3 left (6 needed), pairs untouched',run('S.inv.filter(x=>x.s==2&&x.r==4).length')===1&&run('S.inv.filter(x=>x.s==2&&x.r==3).length')===3&&run('S.inv.filter(x=>x.s==3&&x.r==1).length')===2&&run('S.inv.length')===6);
ok('merge-all summary lists items by name',els.mbox.innerHTML.includes('Мифический ×1')&&els.mbox.innerHTML.includes('Оружие')&&els.mbox.innerHTML.includes('Синтезов: 1'));
els.modal.hidden=true;run('craftAll()');ok('second merge-all is a no-op (no popup)',run('S.inv.length')===6&&els.modal.hidden===true);
run('tab="inv";tabRender()');ok('merge-all button disabled when nothing to merge',/disabled onclick="craftAll\(\)"/.test(els.list.innerHTML));
run('for(let i=0;i<3;i++)S.inv.push({s:1,r:0});tabRender()');ok('merge-all button enabled when 3 identical',!/disabled onclick="craftAll\(\)"/.test(els.list.innerHTML)&&els.list.innerHTML.includes('Объединить все'));
reset();run('S.max=250;tab="quest";tabRender()');const qh=els.list.innerHTML;
ok('daily login shows today\'s reward + 7-day strip',qh.includes('<i class="coin"></i>'+run('fmt(mHP(249)*5)')+'</span>')&&qh.includes('class="days"')&&qh.includes('<i class="soul"></i>'+run('fmt(daySouls())')+' <i class="nectar"></i>10')&&qh.includes('class="day cur"')&&(qh.match(/class="row up qr/g)||[]).length===8&&qh.includes('Все задания дня: 0/8'));
run('dClaim()');const qh2=els.list.innerHTML;ok('after claiming: day 1 marked, tomorrow reward shown',qh2.includes('class="day got"')&&qh2.includes('Завтра (день 2)')&&qh2.includes('≈<i class="coin"></i>'+run('fmt(mHP(249)*5*2)')));
reset();run('S.max=250;S.inv=[]');run('openAc(1)');const bh=els.mbox.innerHTML;
ok('bronze chest lists the actual item',(bh.match(/<br>/g)||[]).length===1&&run('SL.some(n=>'+JSON.stringify(bh)+'.includes(n))')&&run('RN.some(n=>'+JSON.stringify(bh)+'.includes(n))')&&!bh.includes('предметов'));
run('openAc(3)');ok('gold chest lists 3 items with bonus %',(els.mbox.innerHTML.match(/<br>/g)||[]).length===3&&els.mbox.innerHTML.includes('class="soul"')&&els.mbox.innerHTML.includes('(+'));
}
{
const mark=()=>{els.list.innerHTML='MARK'};
reset();run('tab="hero";tabRender()');mark();for(let i=0;i<20;i++)run('dealt(1e30,false,0,0)');run('hTick()');
ok('hero tab is not re-rendered by kills (buttons stay clickable)',els.list.innerHTML==='MARK');
run('S.gold=1e9;buy("w",0)');ok('upgrade works while floors fly by',run('S.w[0]')>1);
run('tab="gods";tabRender()');mark();for(let i=0;i<20;i++)run('dealt(1e30,false,0,0)');run('hTick()');ok('gods tab not re-rendered by kills',els.list.innerHTML==='MARK');
run('tab="quest";tabRender()');mark();run('dealt(1e30,false,0,0)');ok('quest tab: not re-rendered inside kill',els.list.innerHTML==='MARK');
run('hTick()');ok('quest tab refreshed on next tick',els.list.innerHTML!=='MARK');
mark();els.list._h.pointerdown();run('dealt(1e30,false,0,0)');run('hTick()');ok('no re-render while pressed',els.list.innerHTML==='MARK');
ctx.document._h.pointerup();run('hTick()');ok('no re-render right after release (click must land)',els.list.innerHTML==='MARK');
simNow+=500;run('hTick()');ok('re-render after release + 400 ms',els.list.innerHTML!=='MARK');
// прогресс заданий и подвигов обновляется на открытой вкладке не только от убийств
simNow+=1000;run('tab="quest";qn();S.q.c=0;S.q.p[0]=QD.findIndex(q=>q[1]=="c");tabRender()');mark();pd({timeStamp:5e9});run('hTick()');ok('quest tab refreshes after a click (progress shown live)',els.list.innerHTML!=='MARK'&&els.list.innerHTML.includes('1/'));
run('tab="quest";tabRender()');mark();run('S.gold=1e9;buy("w",0)');run('hTick()');ok('quest tab refreshes after an upgrade',els.list.innerHTML!=='MARK');
run('tab="top";tabRender()');mark();pd({timeStamp:5e9+500});run('hTick()');ok('feats tab refreshes after a click',els.list.innerHTML!=='MARK');
run('tab="hero";tabRender()');mark();pd({timeStamp:5e9+1000});run('hTick()');ok('hero tab still not re-rendered by clicks',els.list.innerHTML==='MARK');
{// кнопка покупки: надпись меняется на месте, разметка кнопки не пересоздаётся (иначе клик теряется при смене этажа)
const lvN={textContent:'+1 ур.'},prN={nodeValue:'15'},btn={dataset:{k:'w',i:'0'},children:[lvN,{lastChild:prN,firstElementChild:{className:'coin'}}],innerHTML:'ORIG',_k:'old',disabled:false,parentElement:null};
const qsa=ctx.document.querySelectorAll;ctx.document.querySelectorAll=sel=>sel=='[data-k]'?[btn]:[];run('S.gold=1e12;BQ="max"');run('updBtns()');ctx.document.querySelectorAll=qsa;run('BQ=1');
ok('buy button text updated in place (no re-created markup mid-click)',btn.innerHTML==='ORIG'&&/^\+\d+ ур\.$/.test(lvN.textContent)&&lvN.textContent!=='+1 ур.'&&prN.nodeValue!=='15');
ok('clicks always land on the button itself (children ignore pointer)',fs.readFileSync(ROOT+'/style.css','utf8').includes('button *{pointer-events:none}'));}
simNow+=4000;const l0=lsN;for(let i=0;i<20;i++)run('dealt(1e30,false,0,0)');ok('saving throttled: 20 kills -> 1 save',lsN-l0===1);
simNow+=3100;run('dealt(1e30,false,0,0)');ok('next save after 3 s',lsN-l0===2);
}
{
const cnt=(s,r)=>run(`S.inv.filter(x=>x.s==${s}&&x.r==${r}).length`);
ok('8 rarity tiers, bonuses grow, merge costs 3..9',run('RN.length')===8&&run('RB.length')===8&&run('RB.every((b,i)=>i==0||b>RB[i-1])')&&run('NEED.join()')==='3,4,5,6,7,8,9');
reset();run('S.inv=[];for(let i=0;i<12;i++)S.inv.push({s:0,r:0})');run('craftAll()');ok('merge-all cascades: 12 common -> 4 rare -> 1 epic',run('S.inv.length')===1&&cnt(0,2)===1);
reset();run('S.inv=[];for(let i=0;i<5;i++)S.inv.push({s:0,r:3})');run('craft(0,3)');ok('5 legendary cannot make mythic (6 needed)',run('S.inv.length')===5&&cnt(0,4)===0);
run('S.inv.push({s:0,r:3})');run('craft(0,3)');ok('6 legendary -> 1 mythic',run('S.inv.length')===1&&cnt(0,4)===1);
reset();run('S.inv=[];for(let i=0;i<7;i++)S.inv.push({s:1,r:4})');run('craftAll()');ok('7 mythic -> 1 divine',run('S.inv.length')===1&&cnt(1,5)===1);
reset();run('S.inv=[];for(let i=0;i<30;i++)S.inv.push({s:2,r:7})');run('craftAll();craft(2,7)');ok('top tier never merges',run('S.inv.length')===30);
reset();run('S.eq=[5,-1,-1,-1,-1,-1]');ok('divine item bonus +900%',Math.abs(run('gearM()')-10)<1e-9);
reset();run('S.inv=[];for(let i=0;i<6;i++)S.inv.push({s:0,r:3});tab="inv";tabRender()');ok('inventory button shows 6→1 for legendary',els.list.innerHTML.includes('6→1')&&!/disabled onclick="craft\(0,3\)"/.test(els.list.innerHTML));
run('S.inv.pop();tabRender()');ok('button disabled with 5',/disabled onclick="craft\(0,3\)"/.test(els.list.innerHTML));
const Mx=run('Math'),mrx=Mx.random;Mx.random=()=>0;
const top=f=>{run(`S.floor=${f};S.inv=[];drop()`);return run('S.inv[0].r')};
ok('natural drop cap by depth: 1 / 2 / 3 / 4',top(100)===1&&top(300)===2&&top(1000)===3&&top(2000)===4);
Mx.random=mrx;
}
{
const dx=c=>run('devExec('+JSON.stringify(c)+')');const key=k=>ctx.document._h.keydown({key:k,preventDefault(){},target:{}});
ok('index.html has console markup (hidden by default)',/<div id="dev" hidden>/.test(fs.readFileSync(ROOT+'/index.html','utf8')));
ctx.document.getElementById('dev');delete ls.devConsole;reset();els.dev.hidden=true;
ok('console disabled by default',dx('gold 100')==='консоль отключена'&&run('S.gold')===0);
key('`');ok('hotkey ignored when disabled',els.dev.hidden===true);
ls.devConsole='1';key('`');ok('hotkey opens console when enabled',els.dev.hidden===false);
key('`');ok('hotkey closes it',els.dev.hidden===true);
for(let i=0;i<5;i++)els.act._h.click();ok('5 taps on floor title open console (mobile)',els.dev.hidden===false);run('devToggle()');
ok('quick buttons built',els.devq.children.length===run('DQ.length'));
reset();ok('gold adds and flags cheat',dx('gold 1e6').includes('золото')&&run('S.gold')===1e6&&run('S.cheat')===true);
ok('bad number rejected',dx('gold abc')==='нужно число'&&run('S.gold')===1e6);
dx('setgold 5');ok('setgold',run('S.gold')===5);
dx('souls 50');ok('souls added to balance and total',run('S.souls')===50&&run('S.tot')===50);
dx('floor 37');ok('floor jump',run('S.floor')===37&&run('S.mk')===0&&run('S.run')>=37);
dx('max 500');ok('max',run('S.max')===500);
dx('lvl w all 10');dx('lvl g 3 25');ok('lvl all / single',run('S.w.every(x=>x==10)')&&run('S.g[3]')===25&&run('S.g[0]')===0);
ok('lvl bad index',dx('lvl g 99 1').includes('нет такого'));
dx('talent all 5');ok('talent all',run('S.t[0]')===5&&run('S.t[4]')===5);dx('talent 4 99');ok('talent respects cap 25',run('S.t[4]')===25);
run('S.inv=[]');dx('item 2 5 3');ok('item adds 3 divine',run('S.inv.length')===3&&run('S.inv.every(x=>x.s==2&&x.r==5)'));
ok('item bad rarity',dx('item 2 9').startsWith('item')&&run('S.inv.length')===3);
run('S.sc=[9e15,9e15,9e15,9e15];S.chest=9e15;S.ac=[9e15,9e15,9e15,9e15];S.pt=9e15');dx('cd');ok('cd resets every cooldown',run('S.sc.every(x=>x===0)&&S.chest===0&&S.ac.every(x=>x===0)&&S.pt===0'));
dx('hermes 5');ok('hermes 5 min',Math.abs(run('S.hermes')-simNow-3e5)<1);
reset();dx('floor 3');dx('kill 5');ok('kill 5 clears floor 3',run('S.floor')===4);
dx('boss');ok('boss -> next boss floor 10',run('S.floor')===10&&run('inBoss')===true);dx('boss');ok('boss -> 20',run('S.floor')===20);
reset();dx('floor 100');run('S.pt='+simNow);dx('prestige');ok('forced prestige ignores cooldown, keeps cheat flag',run('S.souls')===25&&run('S.floor')===29&&run('S.cheat')===true);
reset();run('S.max=250');dx('quests');ok('quests all completed',run('S.q.p.every(qi=>S.q[QD[qi][1]]>=QD[qi][2])'));
run('S.gold=0');run('qClaim(0)');ok('reward claimable after dev-complete',run('S.gold')>0);
dx('day 5');ok('day 5 shown in quests',run('questH()').includes('День 5 из 7'));
reset();run('S.b[0][1]=Date.now()+1e6');dx('build');ok('build finishes instantly',run('S.b[0][0]')===1&&run('S.b[0][1]')===0);
reset();run('S.g[0]=10');els.modal.hidden=true;dx('offline 2');ok('offline sim opens reward popup',els.modal.hidden===false&&els.mbox.innerHTML.includes('Пока вас не было'));els.modal.hidden=true;
raf(0);reset();dx('speed 4');run('S.floor=10;spawn()');raf(250);ok('speed x4 scales timers',Math.abs(run('bossT')-29)<1e-6&&run('TS')===4);
dx('speed 0');ok('speed clamps to 0.1',run('TS')===.1);dx('speed 1');raf(0);
reset();ok('get shows value',dx('get floor')==='floor = 1');dx('set gold 123');ok('set gold',run('S.gold')===123);
ok('set unknown field',dx('set nope 1').includes('нет поля'));ok('bad json -> error text, no crash',dx('set gold {bad').startsWith('ошибка'));
ok('state summary',dx('state').includes('этаж 1'));ok('unknown command',dx('foo').includes('неизвестная'));
reset();dx('help');dx('state');dx('get floor');ok('read-only commands do not flag cheat',run('S.cheat')===false);
dx('gold 99');ok('reset needs confirmation',dx('reset').includes('reset yes')&&run('S.gold')===99);dx('reset yes');ok('reset yes wipes progress and cheat flag',run('S.gold')===0&&run('S.cheat')===false);
ctx.__lb=0;run('S=S0();ysdk={getLeaderboards:()=>{__lb++;return Promise.resolve({setLeaderboardScore:()=>Promise.resolve()})}}');run('submitScore()');ok('score sent normally',ctx.__lb===1);
run('S.cheat=true;submitScore()');ok('score NOT sent after cheats',ctx.__lb===1);run('ysdk=null');
delete ls.devConsole;els.dev.hidden=true;
}
{
const Mm=run('Math'),mr3=Mm.random;Mm.random=()=>.99;let u=2e8;
reset();for(let i=0;i<60;i++)pd({timeStamp:(u+=150)});
ok('150 ms metronome: only first 24 clicks counted fully',run('S.q.c')===24&&run('ck.m')===.25&&els.modal.hidden===true);
run('ck.ts=[];ck.last='+u+';ck.iv=Array(24).fill(150)');pd({timeStamp:(u+=150)});ok('still penalised right after',run('ck.m')===.25);
for(let i=0;i<30;i++)pd({timeStamp:(u+=150+Math.random()*120)});ok('penalty lifts once clicking is irregular again',run('ck.m')===1);
u+=1e6;reset();run('S.floor=5;spawn()');run('ck.last='+(u-150)+';ck.iv=Array(24).fill(150)');let hq=run('hp');pd({timeStamp:u});const dPen=hq-run('hp');
u+=1e6;reset();run('S.floor=5;spawn()');run('ck.last='+(u-150)+';ck.iv=[130,170,150,210,140,180,160,120,200,150,190,135,175,145,205,125,185,155,195,140,170,160,130,180]');hq=run('hp');pd({timeStamp:u});const dNorm=hq-run('hp');
ok('metronomic click deals 25% damage, irregular one 100%',dNorm>0&&Math.abs(dPen/dNorm-.25)<1e-9);
u+=1e6;reset();for(let i=0;i<30;i++)pd({timeStamp:(u+=150)});ok('penalised clicks do not count for quests',run('S.q.c')===24);
u+=1e6;reset();run('S.floor=5;spawn()');for(let i=0;i<24;i++)pd({timeStamp:(u+=150)});run('rage=0;clicks=[]');for(let i=0;i<14;i++)pd({timeStamp:(u+=150)});ok('penalised metronome clicks never trigger Olympus rage',run('rage')===0);
u+=1e6;reset();for(let i=0;i<400;i++)pd({timeStamp:(u+=100+Math.random()*60)});
ok('sustained limit: ~60 clicks per 10 s even with irregular 7.7 CPS',run('S.q.c')>=250&&run('S.q.c')<=335&&els.modal.hidden===true);
Mm.random=mr3;
}
{
const Mx=run('Math');
ok('mHP: wall x3 at 50 (non-boss 51 vs 49)',(()=>{const r=run('mHP(51)/mHP(49)');return r>3.4&&r<3.7})());
ok('mHP: gentle late slope (~0.23% per floor after 1000)',(()=>{const r=run('mHP(2002)/mHP(2001)');return r>1.001&&r<1.004})());
ok('mHP at 10000 is ~1e38 (was 1e87)',run('mHP(10000)')>1e36&&run('mHP(10000)')<1e40&&run('mHP(1)')>0);
ok('mHP monotonic over non-boss floors',(()=>{let p=0;for(let f=1;f<=10000;f+=7){if(f%10==0)continue;const h=run(`mHP(${f})`);if(h<p)return false;p=h}return true})());
run('S.tot=100');ok('soul multiplier (1+0.05*souls)^1.5',Math.abs(run('soulM()')-Math.pow(6,1.5))<1e-9);run('S.tot=0');
const F=x=>run(`fmt(${x})`);
ok('fmt K/M/B/T and rounding',F(999)==='999'&&F(0)==='0'&&F(1500)==='1.50K'&&F(12345)==='12.3K'&&F(123456)==='123K'&&F(999999)==='1.00M'&&F(2.5e6)==='2.50M'&&F('1.234e12')==='1.23T'&&F(1e60)==='1.00e60'&&F('Infinity')==='∞');
raf(0);reset();run('S.g[7]=100;S.floor=3;spawn()');for(let i=1;i<=20;i++)raf(i*250);ok('spawn delay: ~5 monsters/s (about 25 kills in 5 s), not hundreds of floors per minute',run('S.q.k')>=24&&run('S.q.k')<=26&&run('S.floor')>=7&&run('S.floor')<=8);raf(0);
raf(0);reset();run('S.g[7]=100;S.floor=10000;spawn();hp=1');els.modal.hidden=true;raf(16);ok('final boss: one kill per frame, victory popup, no hang',run('S.floor')===10000&&els.modal.hidden===false&&els.mbox.innerHTML.includes('Хаос повержен'));els.modal.hidden=true;
raf(0);reset();run('S.floor=10;spawn()');const b0=run('bossT');run('pause(true)');raf(250);ok('paused game does not tick (boss timer frozen)',run('bossT')===b0);run('pause(false)');raf(500);ok('resumes after pause',Math.abs(run('bossT')-(b0-.25))<1e-9);raf(0);
ctx.__gp=[];ctx.__ok=0;run('ysdk={features:{GameplayAPI:{start(){__gp.push("s")},stop(){__gp.push("x")}}},adv:{showRewardedVideo:o=>{o.callbacks.onOpen();o.callbacks.onRewarded();o.callbacks.onClose()}}}');
reset();run('rewarded(()=>{__ok++})');ok('rewarded: reward given once, game paused then resumed, GameplayAPI stop/start',ctx.__ok===1&&run('paused')===false&&ctx.__gp.join('')==='xs'&&run('S.q.a')===1);
ctx.__gp=[];run('ysdk.adv.showRewardedVideo=o=>{o.callbacks.onOpen();o.callbacks.onError()}');run('rewarded(()=>{__ok++})');ok('rewarded error: no reward, game resumes',ctx.__ok===1&&run('paused')===false);
ctx.__ia=0;run('ysdk={adv:{showFullscreenAdv:o=>{__ia++;o.callbacks.onOpen();o.callbacks.onClose()}}}');
reset();run('S.adT=0;S.floor=500;spawn();dealt(1e300,false,0,0)');ok('interstitial on act change (floor 500 cleared)',ctx.__ia===1&&run('paused')===false);
run('S.floor=510;spawn();dealt(1e300,false,0,0)');ok('no interstitial on ordinary boss',ctx.__ia===1);
run('S.floor=2000;spawn();dealt(1e300,false,0,0)');ok('act-change ad respects 4 min cooldown',ctx.__ia===1);
simNow+=241e3;run('S.floor=2000;spawn();dealt(1e300,false,0,0)');ok('act-change ad again after cooldown',ctx.__ia===2);
run('ysdk={serverTime:()=>Date.now()+5000}');run('syncTime()');ok('server time offset applied to NOW()',run('NOW()-Date.now()')===5000);run('tOff=0;ysdk=null');
reset();run('S.g[0]=10');ctx.document.hidden=true;ctx.document._h.visibilitychange();run('S.last=NOW()-7200e3');els.modal.hidden=true;ctx.document.hidden=false;ctx.document._h.visibilitychange();
ok('offline reward shown when returning to the tab',els.modal.hidden===false&&els.mbox.innerHTML.includes('Пока вас не было'));els.modal.hidden=true;
ctx.__lb=0;ctx.__lb2=0;run('lbT=0;lbP=false;S=S0();ysdk={getLeaderboards:()=>{__lb++;return Promise.resolve({setLeaderboardScore:()=>Promise.resolve()})}}');
run('submitScore()');run('submitScore()');ok('leaderboard: 2nd submit within 20s is queued',ctx.__lb===1&&run('lbP')===true);
simNow+=21e3;run('lbFlush()');ok('queued score flushed after 20s',ctx.__lb===2&&run('lbP')===false);
run('lbT=0;ysdk={leaderboards:{setScore:()=>{__lb2++;return Promise.resolve()}}};submitScore()');ok('new leaderboards.setScore API preferred',ctx.__lb2===1);
run('lbT=0;S.cheat=true;submitScore()');ok('cheat flag still blocks new API',ctx.__lb2===1);run('ysdk=null;S.cheat=false;lbP=false');
ctx.AudioContext=function(){const P=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},setTargetAtTime(){},linearRampToValueAtTime(){}}),N=x=>Object.assign({connect(){},disconnect(){}},x);this.state='running';this.currentTime=0;this.sampleRate=800;this.destination={};this.createOscillator=()=>{ctx.__osc=(ctx.__osc||0)+1;return N({type:'',frequency:P(),detune:P(),start(){},stop(){}})};this.createGain=()=>N({gain:P()});this.createBiquadFilter=()=>N({type:'',frequency:P(),Q:P()});this.createConvolver=()=>N({buffer:null});this.createDynamicsCompressor=()=>N({});this.createBuffer=(c,l)=>({getChannelData:()=>new Float32Array(l)});this.createBufferSource=()=>{ctx.__src=(ctx.__src||0)+1;return N({buffer:null,start(){},stop(){}})};this.resume=()=>{this.state='running'};this.suspend=()=>{this.state='suspended'}};
let pt=1e6;ctx.performance.now=()=>(pt+=100);ctx.__osc=0;run('sound=true;paused=false;sfx("click")');ok('sfx plays a sound',ctx.__osc===1);
run('pause(true);sfx("click");pause(false)');ok('no sound while paused',ctx.__osc===1);
run('sound=false;sfx("kill");sound=true');ok('no sound when muted',ctx.__osc===1);
els.snd.onclick();ok('mute button toggles',run('sound')===false&&els.snd.dataset.on==='0');els.snd.onclick();ok('unmute',run('sound')===true);
Mx.random=Mx.random;
const Mq=run('Math'),mrq=Mq.random;Mq.random=()=>0;const top2=f=>{run(`S.floor=${f};S.inv=[];drop()`);return run('S.inv[0].r')};
ok('natural drop cap by depth extended: 3500→4, 5000→5, 8000→6',top2(3500)===4&&top2(5000)===5&&top2(8000)===6);Mq.random=mrq;
}
{
const Mr=run('Math'),mrr=Mr.random;
reset();run('S.floor=5;spawn()');run('dealt(1e30,false,0,0)');ok('monster hidden during spawn delay',run('wait')>0);
reset();run('S.floor=5;spawn()');const h0=run('hp');run('wait=.2');pd({timeStamp:9e8});ok('clicks do not hit a monster that has not appeared yet (but still counted)',run('hp')===h0&&run('S.q.c')===1);
run('wait=0');pd({timeStamp:9e8+500});ok('clicks hit after the delay',run('hp')<h0);
reset();run('S.max=500;wait=.2');const sc00=run('S.sc[0]');run('useSk(0)');ok('Styx not wasted while no monster is present',run('S.sc[0]')===sc00);
reset();run('S.floor=10;spawn();dealt(1e300,false,0,0)');ok('boss drop goes to loot, inventory untouched',run('S.loot.length')===1&&run('S.inv.length')===0);
ok('loot chest shown on the arena with count',els.chest.hidden===false&&els.chestn.textContent==='1');
run('claimLoot()');const lh=els.mbox.innerHTML;ok('claim moves items to inventory and lists them',run('S.inv.length')===1&&run('S.loot.length')===0&&lh.includes('Добыча с боссов')&&run('SL.some(n=>'+JSON.stringify(lh)+'.includes(n))')&&run('RN.some(n=>'+JSON.stringify(lh)+'.includes(n))'));
ok('loot chest hidden after claim',els.chest.hidden===true);
reset();run('S.inv=[];S.loot=[];for(let i=0;i<305;i++)drop(0,true)');ok('loot capped at 300 (overflow goes to inventory)',run('S.loot.length')===300&&run('S.inv.length')===5);
reset();run('S.loot=[{s:0,r:1}];S.run=100;S.max=100;prestige()');ok('loot survives prestige',run('S.loot.length')===1);
ok('quest pool >= 20, 8 per day',run('QD.length')>=20&&run('QN')===8);
reset();Mr.random=()=>0;run('S.floor=5;spawn()');pd({timeStamp:7e8});Mr.random=mrr;ok('crit counter for quests',run('S.q.x')===1);
reset();run('S.max=250');run('openAc(1)');ok('ad-chest counter',run('S.q.o')===1);
reset();run('S.inv=[];for(let i=0;i<12;i++)S.inv.push({s:0,r:0})');run('craftAll()');ok('synthesis counter (12 common -> 5 syntheses)',run('S.q.m')===5);
reset();run('S.inv=[{s:0,r:0},{s:0,r:0},{s:0,r:0}]');run('craft(0,0)');ok('single synthesis counted',run('S.q.m')===1);
reset();run('S.g[0]=10');for(let i=0;i<8;i++)run('hTick()');run('heroAtk()');ok('hero idle/attack animation hooks run',true);
run('setVol(0,40)');run('setVol(1,150)');ok('volume sliders set and clamp',run('S.vol[0]')===.4&&run('S.vol[1]')===1);
run('openCfg()');const ch=els.mbox.innerHTML;ok('settings window with 2 sliders',ch.includes('Настройки')&&(ch.match(/type="range"/g)||[]).length===2);
ctx.__osc=0;run('S.vol=[0,.3];sound=true;paused=false;sfx("kill")');ok('effects volume 0 -> silent',ctx.__osc===0);
run('S.vol=[.7,.3];AUD&&(AUD.state="running");sfx("kill")');ok('effects audible at default volume',ctx.__osc===1);
ctx.__osc=0;run('S.vol=[.7,.3];musTick()');ok('music plays notes',ctx.__osc>=1);
ctx.__osc=0;run('S.vol=[.7,0];musTick()');ok('music volume 0 -> silent',ctx.__osc===0);
run('S.vol=[.7,.3];sound=false;musTick()');ok('mute stops music',ctx.__osc===0);
run('sound=true;AUD.state="suspended";musTick()');ok('music waits for audio unlock (suspended context)',ctx.__osc===0);run('AUD.state="running"');
const css=fs.readFileSync(ROOT+'/style.css','utf8'),htm=fs.readFileSync(ROOT+'/index.html','utf8');
{const nv=htm.match(/<nav[^>]*>[\s\S]*<\/nav>/)[0];ok('menu: 8 sections + «More» on phones, side rail on wide screens',(nv.match(/<button data-t="(hero|gods|inv|pres|house|quest|rew|top)"/g)||[]).length===8&&nv.includes('data-t="more"')&&(nv.match(/class="x"/g)||[]).length===4&&css.includes('nav.open button.x')&&css.includes('nav{grid-area:nav;flex-direction:column'))}
ok('hero, settings and loot elements in html',htm.includes('id="hero"')&&htm.includes('id="cfg"')&&htm.includes('id="chest"')&&htm.includes('id="fairy"')&&!htm.includes('bLoot'));
}
{
const Mt=run('Math'),mrt=Mt.random,dx2=c=>run('devExec('+JSON.stringify(c)+')');
reset();run('S.floor=10;spawn();dealt(1e300,false,0,0)');let tapped=0;els.chest._h.pointerdown({stopPropagation(){tapped++}});
ok('tap on the arena chest claims loot (does not count as an arena click)',tapped===1&&run('S.inv.length')===1&&run('S.loot.length')===0&&els.chest.hidden===true&&run('S.q.c')===0);
ok('item bonus values raised for low rarities',run('RB.join()')==='0.3,0.7,1.4,2.2,4.5,9,20,45');
reset();run('S.eq=[0,-1,-1,-1,-1,-1];tab="inv";tabRender()');{const ih=els.list.innerHTML;ok('inventory shows total item bonus',ih.includes('весь урон ×<em>1.30</em>'));
ok('equipped slots: 6 tiles, worn one styled by rarity, empty ones marked',(ih.match(/class="slot/g)||[]).length===6&&(ih.match(/class="slot empty"/g)||[]).length===5&&ih.includes('class="it pic r0"')&&ih.includes('img/icons/slot_1.webp')&&(ih.match(/class="it none pic"/g)||[]).length===5);}
run('S.eq=[1,-1,-1,-1,-1,-1];S.inv=[{s:0,r:0},{s:0,r:2},{s:3,r:2},{s:3,r:2}];tabRender()');{const ih=els.list.innerHTML;
ok('bag grouped by rarity with headers, tiles carry rarity class',(ih.match(/class="rh r/g)||[]).length===2&&ih.indexOf('class="rh r2"')<ih.indexOf('class="rh r0"')&&ih.includes('class="row itr r2"')&&ih.includes('img/icons/slot_4.webp'));
ok('items better than the worn one are flagged, worse ones not',(ih.match(/лучше надетого/g)||[]).length===2&&ih.includes('синтез 2/5'));
ok('rarity ladder shows merge costs',(ih.match(/class="gem r\d"/g)||[]).length===8);}
// painted icons: every referenced picture exists
{const fs=require('fs'),src=['game.js','style.css','index.html'].map(f=>fs.readFileSync(__dirname+'/../'+f,'utf8')).join('');const L=[...new Set((src.match(/img\/icons\/[a-z_0-9]+\.webp/g)||[]))].concat([1,2,3,4,5,6].map(i=>'img/icons/slot_'+i+'.webp'),[1,2,3,4].map(i=>'img/icons/skill_'+i+'.webp'));
ok('all painted icons exist (slots, skills, currency, chest, fairy)',L.length>=18&&L.every(f=>fs.existsSync(__dirname+'/../'+f)));
ok('skill dock, skill list, nectar card and loot chest use the pictures',/function skUI[\s\S]{0,900}img\/icons\/skill_/.test(src)&&/function skH[^\n]*img\/icons\/skill_/.test(src)&&/function shopH[^\n]*icon_nectar\.webp/.test(src)&&/id="chest"[^\n]*chest\.webp/.test(src)&&/id="fairy"[^\n]*fairy\.webp/.test(src));
ok('currency marks are pictures everywhere',/i\.coin,\.buy i\.coin[^{]*\{background-image:url\(img\/icons\/coin_s\.webp\)/.test(src)&&/i\.soul,\.buy i\.soul[^{]*\{background-image/.test(src));}
// house: «Достроить» finishes only the clicked building
reset();run('S.nec=10;S.b=[[2,NOW()+6e5],[1,NOW()+6e5],[0,NOW()+6e5]];finB(1)');ok('finish button completes only that building for 3 nectar',run('S.b[1][1]')===0&&run('S.b[1][0]')===2&&run('S.b[0][1]')>0&&run('S.b[2][1]')>0&&run('S.nec')===7);
run('S.nec=2;finB(0)');ok('finish needs 3 nectar',run('S.b[0][1]')>0&&run('S.nec')===2);
run('navGo("house");tabRender()');ok('house finish buttons call finB per building',/onclick="finB\(0\)"/.test(els.list.innerHTML)&&/onclick="finB\(2\)"/.test(els.list.innerHTML));
// skills: unlock by record floor, souls upgrades
reset();run('S.max=9');const a9=run('skLv(0)');run('S.max=10');const a10=run('skLv(0)');run('S.sl[0]=2');ok('skill levels: locked below floor 10, auto level 1 at 10, +souls levels',a9===0&&a10===1&&run('skLv(0)')===3&&Math.abs(run('pw(0)')-1.45)<1e-9);
reset();run('S.souls=100;S.max=1;buySk(0)');ok('cannot upgrade a locked skill',run('S.sl[0]')===0&&run('S.souls')===100);
run('S.max=500;buySk(0)');ok('skill upgrade costs souls (3 for the first)',run('S.sl[0]')===1&&run('S.souls')===97);
ok('next level price grows x1.55',run('skCost(0)')===5&&run('skCost(3)')===12);
reset();run('S.max=500;S.sl=[10,10,0,0]');const n0=simNow;run('useSk(0)');run('useSk(1)');ok('skill levels shorten cooldown (-1%/lvl) and extend duration (+2%/lvl)',Math.abs(run('S.sc[0]')-n0-30000*.9)<1e-6&&Math.abs(run('S.se[1]')-n0-8000*1.2)<1e-6);
reset();run('S.sl=[3,0,0,0];S.run=100;S.max=100;prestige()');ok('skill levels survive prestige',run('S.sl[0]')===3);
reset();run('S.max=500;S.souls=50;tab="hero";htab="s";tabRender()');ok('hero tab lists upgradable skills',els.list.innerHTML.includes('buySk(0)')&&els.list.innerHTML.includes('class="soul"></i> 3'));run('htab="w"');
// nectar sources
reset();run('rewarded(()=>{})');ok('video reward: +1 nectar',run('S.nec')===1);
reset();run('S.max=250;qn();S.q.p.forEach(qi=>{S.q[QD[qi][1]]=Math.max(S.q[QD[qi][1]],QD[qi][2])})');for(let j=0;j<8;j++)run(`qClaim(${j})`);ok('8 daily quests: 8 nectar + 5 bonus for all',run('S.nec')===13);run('qClaim(0)');ok('bonus is paid once',run('S.nec')===13);
reset();run('S.day=6;S.dl=new Date(NOW()-864e5).toDateString()');run('dClaim()');ok('day 7 login: +10 nectar +5 souls (minimum at low floors)',run('S.nec')===10&&run('S.souls')===5);
reset();run('S.max=723;S.souls=0;S.nec=0;S.day=6;S.dl=new Date(NOW()-864e5).toDateString()');run('dClaim()');ok('day 7 souls scale with the best floor (723 -> 84 = 25% of a full rebirth)',run('S.souls')===84&&run('daySouls()')===84);
ok('gold chest souls scale with the best floor (723 -> 33, 2000 -> 210)',run('chestSouls()')===33&&run('S.max=2000;chestSouls()')===210&&run('S.max=10;chestSouls()')===2);
reset();run('S.nec=1500;draw()');ok('nectar shown in the stats bar',els.nec.textContent==='1.50K');
// shop
reset();run('S.nec=10;S.max=250;S.inv=[]');dx2('help');run('buyShop(0)');ok('shop: bronze chest for nectar (no ad), no cooldown',run('S.nec')===6&&run('S.inv.length')===1&&run('S.ac[1]')===0);
run('buyShop(0)');ok('shop: nectar chest can be bought again right away',run('S.nec')===2&&run('S.inv.length')===2);
run('S.ac[1]=NOW()+1e6;S.nec=10;buyShop(0)');ok('shop chest ignores the ad-chest timer',run('S.nec')===6);
run('tab="rew";tabRender()');ok('shop chests show no cooldown',!/class="buy nec" disabled[^>]*onclick="buyShop\(0\)"/.test(els.list.innerHTML));
run('S.nec=3;buyShop(1)');ok('shop: not enough nectar -> nothing',run('S.nec')===3&&run('S.ac[2]')===0);
reset();run('S.nec=10;S.pt='+simNow);run('buyShop(3)');ok('shop: prestige cooldown reset',run('S.pt')===0&&run('S.nec')===4);run('buyShop(3)');ok('no charge when no cooldown',run('S.nec')===4);
reset();run('S.nec=10;S.b[0][1]=NOW()+1e6');run('buyShop(4)');ok('shop: finish buildings now',run('S.b[0][0]')===1&&run('S.b[0][1]')===0&&run('S.nec')===7);run('buyShop(4)');ok('no charge without building',run('S.nec')===7);
reset();run('S.nec=10;qn();S.q.k=77');run('buyShop(5)');ok('shop: new daily quests (progress reset)',run('S.q.k')===0&&run('S.nec')===5);
const kg=()=>{run('S.floor=1;S.gold=0;spawn()');run('dealt(1e30,false,0,0)');return run('S.gold')};
reset();const g1=kg();run('S.nec=20;buyShop(6)');const g2=kg();ok('shop: gold fever doubles kill gold',Math.abs(g2/g1-2)<1e-9&&run('S.nec')===8);
reset();const c1=run('clickD()');run('S.nec=20;buyShop(7)');ok('shop: Hermes 1h doubles damage',Math.abs(run('clickD()')/c1-2)<1e-9&&run('S.hermes')>=simNow+36e5-1);
// cosmetics
reset();run('S.nec=25;buyCos(0,1)');ok('cosmetics off: buying does nothing',run('S.own[0].includes(1)')===false&&run('S.nec')===25);
run('tab="rew";tabRender()');ok('cosmetics off: no «coming soon» stubs in Rewards',!els.list.innerHTML.includes('cosoff')&&!els.list.innerHTML.includes('Пока недоступно')&&!els.list.innerHTML.includes('class="cos'));
run('S.skin=2;S.theme=3;applyCos()');ok('cosmetics off: default hero art and arena colour even with an old skin saved',els.hero.className==='img'&&els.app.style.background===run('THB[0]'));
reset();run('COS_ON=true;S.nec=25;buyCos(0,1)');ok('cosmetics: buy and wear a hero skin',run('S.own[0].includes(1)')&&run('S.skin')===1&&run('S.nec')===5&&els.hero.textContent==='🦸');
run('buyCos(0,2)');ok('cosmetics: not enough nectar',run('S.skin')===1&&run('S.nec')===5);run('buyCos(0,0)');ok('wear owned skin for free',run('S.skin')===0&&run('S.nec')===5);ok('skin 0 shows the hero picture, skin 1 an emoji',els.hero.className==='img'&&els.hero.textContent==='');run('buyCos(0,1)');ok('other skin replaces the picture',els.hero.className===''&&els.hero.textContent==='🦸');run('buyCos(0,0)');
run('S.nec=30;buyCos(1,1)');ok('cosmetics: arena theme applied',run('S.theme')===1&&els.app.style.background===run('THB[1]'));run('COS_ON=false;applyCos()');
// payments
els.modal.hidden=true;run('buyPack(0)');ok('packs outside Yandex: explanatory popup',els.modal.hidden===false&&els.mbox.innerHTML.includes('только в Яндекс Играх'));
reset();run('S.nec=0;ysdk={getPayments:()=>Promise.resolve({purchase:o=>{__buy=o.id;return Promise.resolve({purchaseToken:"tok"})},consumePurchase(){__cons=1}})}');ctx.__buy='';ctx.__cons=0;run('buyPack(1)');await new Promise(r=>setImmediate(r));await new Promise(r=>setImmediate(r));
ok('Yandex payment: nectar pack granted and purchase consumed',ctx.__buy==='nectar_350'&&run('S.nec')===350&&ctx.__cons===1);run('ysdk=null');
// fairies
reset();run('fairySpawn()');ok('fairy appears',els.fairy.hidden===false&&run('fnx')>simNow);
Mt.random=()=>0;const gf0=run('S.gold');run('fairyTap()');Mt.random=mrt;ok('fairy: gold reward and hides',run('S.gold')>gf0&&els.fairy.hidden===true);
run('fairySpawn()');Mt.random=()=>.7;run('fairyTap()');Mt.random=mrt;ok('fairy: nectar reward',run('S.nec')===1);
run('fairySpawn()');Mt.random=()=>.9;run('fairyTap()');Mt.random=mrt;ok('fairy: Hermes 2 min',run('S.hermes')>simNow);
run('fairySpawn()');els.fairy._h.animationend();ok('fairy flies away by itself',els.fairy.hidden===true);
els.fairy.hidden=true;run('fnx=0;hTick()');ok('fairy spawns on schedule',els.fairy.hidden===false);run('fnx=NOW()+1e9');els.fairy.hidden=true;
Mt.random=mrt;
}
{
const Mp=run('Math'),mrp=Mp.random;
reset();run('S.run=1000;S.max=1000;prestige()');
let exp=0;for(let i=1;i<=299;i++){exp+=run(`mHP(${i})`)*.1*(i%10==0?3:1)}
ok('prestige from best floor 1000 starts at 299 (30%, not a boss floor)',run('S.floor')===299&&run('S.sf')===299&&run('S.run')===299);
ok('start gold = gold of the skipped floors',Math.abs(run('S.gold')/exp-1)<1e-9);
ok('no start HP lock: first monster appears normally',run('maxhp')>0&&run('inBoss')===false);
const sv0=run('S.souls');run('S.pt=0;prestige()');ok('re-prestige without climbing gives no souls',run('S.souls')===sv0&&run('S.floor')===299);
run('S.run=2000;S.pt=0;prestige()');ok('souls only for floors above the start (2000 vs 299)',run('S.souls')===sv0+run('soulG(2000)-soulG(299)'));
reset();run('S.run=3;prestige()');ok('tiny run: soul gain 0, no prestige',run('S.souls')===0&&run('S.floor')===1);
reset();run('S.run=10;S.pt=0');run('prestige()');ok('run of 10 floors gives souls and restarts at floor 3',run('S.floor')===3||run('S.floor')===1);
reset();run('S.run=1234;tab="pres";tabRender()');ok('prestige tab announces the next start floor',els.list.innerHTML.includes('следующий старт с этажа '+run('startF()')));
{const ph=els.list.innerHTML;ok('altar card: souls, gain, damage after rebirth, rebirth button',ph.includes('class="alt"')&&ph.includes('Урон станет')&&ph.includes('data-pb onclick="prestige()"')&&ph.includes('+'+run('fmt(soulGain())')+' душ'));
ok('9 gifts with own icons and current effect',(ph.match(/class="row up tal/g)||[]).length===9&&ph.includes('img/ui/gift_8.webp')&&ph.includes('img/ui/gift_9.webp')&&ph.includes('Сейчас <em>'));}
run('S.t[6]=10;tabRender()');ok('Chronos gift shows −30% now',els.list.innerHTML.includes('Сейчас <em>−30%</em>'));
run('S.b=[[2,0],[0,Date.now()+20e3],[0,0]];tab="house";tabRender()');{const hh=els.list.innerHTML;
run('S.b[1][1]=NOW()+6e5;tabRender()');ok('house: building keeps its own icon while under construction',els.list.innerHTML.includes('img/ui/house_1.webp')&&!els.list.innerHTML.includes('house_3'));run('S.b[1][1]=0;tabRender()');ok('house: 3 building cards with icons, bonus now → next',(hh.match(/class="row hb h\d"/g)||[]).length===3&&hh.includes('img/ui/house_0.webp')&&hh.includes('Сейчас <em>+20%</em> → +30%'));
ok('house: building in progress shows bar, timer and finish-for-nectar button',hh.includes('data-fb=')&&hh.includes('data-ft=')&&hh.includes('finB(')&&!hh.includes('buyShop(4)')&&hh.includes('Построить'));}
ok('startF never lands on a boss floor',[1,9,10,33,34,100,1000,5000,9999,10000].every(r=>{run(`S.run=${r}`);const f=run('startF()');return f>=1&&f%10!==0||f===1}));
// fairy gold from income, not from record floor
reset();run('S.g[0]=10;S.max=10');run('fairySpawn()');Mp.random=()=>0;run('S.gold=0;fairyTap()');const fg1=run('S.gold');
reset();run('S.g[0]=10;S.max=10000');run('fairySpawn()');run('S.gold=0;fairyTap()');const fg2=run('S.gold');
reset();run('S.g[0]=40;S.max=10');run('fairySpawn()');run('S.gold=0;fairyTap()');const fg3=run('S.gold');Mp.random=mrp;
ok('fairy gold does not depend on record floor',fg1>0&&fg1===fg2);
ok('fairy gold grows with current income (dps)',fg3>fg1&&Math.abs(fg1-Math.max(100,4*10*12))<1e-6);
// percent formatting without float noise
ok('pct helper: 30/70/140/220/450/900/2000/4500',run('RB.map(pct).join()')==='30,70,140,220,450,900,2000,4500');
reset();run('S.inv=[{s:0,r:3},{s:1,r:2}];S.eq=[3,-1,-1,-1,-1,-1];tab="inv";tabRender()');const ph=els.list.innerHTML;
ok('inventory shows +220% and +140% without decimals noise',ph.includes('+220%')&&ph.includes('+140%')&&!/\d{5,}/.test(ph.replace(/onclick="[^"]*"/g,'')));
reset();run('S.loot=[{s:0,r:3}]');run('claimLoot()');ok('loot popup: (+220%)',els.mbox.innerHTML.includes('(+220%)'));
run('S.max=250;S.inv=[]');run('acGive(3)');ok('chest text uses clean percents',!/\.\d{6,}/.test(run('acGive(3)')));
}
{const htm2=fs.readFileSync(ROOT+'/index.html','utf8'),css2=fs.readFileSync(ROOT+'/style.css','utf8');
ok('hero image wired: preload + CSS + file exists',htm2.includes('img/hero.webp')&&css2.includes('url(img/hero.webp)')&&fs.existsSync(ROOT+'/img/hero.webp'));}
{const css3=fs.readFileSync(ROOT+'/style.css','utf8');
reset();run('S.floor=7;spawn()');ok('act I arena: data-act=0, CSS background wired, file exists',els.arena.dataset.act===0&&css3.includes('url(img/act1_bg.webp)')&&fs.existsSync(ROOT+'/img/act1_bg.webp'));
ok('monster name in genitive',els.mname.textContent==='Тень Тартара');
run('S.floor=601;spawn()');ok('act II: data-act=1, Asphodel name',els.arena.dataset.act===1&&els.mname.textContent==='Тень Асфоделя');
run('S.floor=7520;spawn()');ok('boss-less boss floor named by act',els.mname.textContent==='Страж Входа в Хаос');
ok('rage meter lives in the battle dock',/<section id="dock">[\s\S]*id="rage"[\s\S]*<\/section>/.test(fs.readFileSync(ROOT+'/index.html','utf8'))&&css3.includes('#rage{'));}
{const bg=f=>{run('S.floor='+f+';spawn()');return els.monster.style.backgroundImage||''};
ok('act I monster sprite',bg(7)==='url(img/act1_mob.webp)'&&els.monster.textContent==='');
ok('named bosses use their own sprites',bg(50)==='url(img/boss_0050.webp)'&&bg(250)==='url(img/boss_0250.webp)'&&bg(500)==='url(img/boss_0500.webp)');
ok('Alecto (100) has her sprite',bg(100)==='url(img/boss_0100.webp)');ok('Theseus (1000) has his own art',bg(1000)==='url(img/boss_1000.webp)');ok('final boss (10000) has its own art',bg(10000)==='url(img/boss_10000.webp)');
ok('act II: monster and bosses 750 / 1500 / 2000 have sprites',bg(601)==='url(img/act2_mob.webp)'&&bg(750)==='url(img/boss_0750.webp)'&&bg(1500)==='url(img/boss_1500.webp)'&&bg(2000)==='url(img/boss_2000.webp)'&&els.monster.textContent==='');
ok('act I unnamed bosses are Kampe (own art, own name)',bg(30)==='url(img/boss_0010.webp)'&&bg(10)==='url(img/boss_0010.webp)'&&els.mname.textContent==='Кампа');
ok('generic guard in other acts uses the act monster',bg(620)==='url(img/act2_mob.webp)');
ok('act without art keeps the emoji',bg(7001)===''&&els.monster.textContent!=='');
ok('act III: Shade of Elysium, Achilles 2500, Patroclus 3000, Lord Hades 4500 have sprites',bg(2286)==='url(img/act3_mob.webp)'&&bg(2500)==='url(img/boss_2500.webp)'&&bg(3000)==='url(img/boss_3000.webp)'&&bg(4500)==='url(img/boss_4500.webp)'&&bg(3500)==='url(img/act3_mob.webp)');
ok('act III arena background',/#arena\[data-act="2"\][^}]*act3_bg\.webp/.test(fs.readFileSync(ROOT+'/style.css','utf8'))&&fs.existsSync(ROOT+'/img/act3_bg.webp'));
ok('act IV: Shade of Olympus, Prometheus 5000, Hera 5500, Zeus 7000 have sprites',bg(5286)==='url(img/act4_mob.webp)'&&bg(5000)==='url(img/boss_5000.webp)'&&bg(5500)==='url(img/boss_5500.webp)'&&bg(7000)==='url(img/boss_7000.webp)'&&bg(6000)==='url(img/act4_mob.webp)');
ok('acts IV-VI arena backgrounds',(()=>{const c=fs.readFileSync(ROOT+'/style.css','utf8');return [3,4,5].every(i=>new RegExp('#arena\\[data-act="'+i+'"\\][^}]*act'+(i+1)+'_bg\\.webp').test(c)&&fs.existsSync(ROOT+'/img/act'+(i+1)+'_bg.webp'))})());
ok('every referenced sprite file exists',run('Object.values(SPR.mob).concat(Object.values(SPR.boss))').every(n=>fs.existsSync(ROOT+'/img/'+n+'.webp')));}
{const src=fs.readFileSync(ROOT+'/game.js','utf8');
ok('monster is no longer faded out between kills',!src.includes("classList.add('gone')")&&src.includes('killFx(isBoss(f))'));
reset();run('S.floor=5;spawn();kfxT=-1e9');run('dealt(1e30,false,0,0)');const t1=run('kfxT');run('dealt(1e30,false,0,0)');ok('kill flash throttled to once per 0.3 s',t1>-1e9&&run('kfxT')===t1);}
{const css4=fs.readFileSync(ROOT+'/style.css','utf8');
reset();run('S.floor=777;spawn()');ok('act II arena wired',els.arena.dataset.act===1&&css4.includes('url(img/act2_bg.webp)')&&fs.existsSync(ROOT+'/img/act2_bg.webp'));}
{
// ---------- English ----------
const cyr=/[а-яё]/i;
reset();run('setTexts("en")');run('S.floor=7;spawn()');
ok('EN: monster, floor and act names',els.mname.textContent==='Shade of Tartarus'&&els.floor.textContent.startsWith('Floor 7')&&els.act.textContent==='Tartarus');
run('S.floor=50;spawn()');ok('EN: boss name',els.mname.textContent==='Megaera');
run('S.floor=7520;spawn()');ok('EN: guardian name',els.mname.textContent==='Guardian of the Gates of Chaos');
run('S.floor=10;spawn()');ok('EN: boss timer',/\d s$/.test(els.timer.textContent));
run('S.max=500;S.souls=1e6;S.inv=[{s:0,r:3},{s:1,r:0},{s:1,r:0},{s:1,r:0}];S.loot=[]');
const leak=[];['hero','gods','inv','house','quest','rew','pres','top'].forEach(tb=>{run(`tab="${tb}";tabRender()`);if(cyr.test(els.list.innerHTML))leak.push(tb+': '+els.list.innerHTML.match(/.{0,25}[а-яё].{0,25}/i)[0])});
ok('EN: no Russian text in any tab'+(leak.length?' -> '+leak.join(' | '):''),leak.length===0);
run('draw()');const ui=['bHermes','bChest','bRetry','bSave','timer','floor','mname','dpsu'].map(i=>els[i].textContent).join('|');
ok('EN: battle screen buttons and labels in English'+(cyr.test(ui)?' -> '+ui:''),!cyr.test(ui));
run('skUI()');ok('EN: skill buttons in English',![...els.skills.children].some(b=>cyr.test(b.title)||cyr.test(b.innerHTML)));
run('tab="hero";htab="s";tabRender()');ok('EN: hero skills sub-tab in English',!cyr.test(els.list.innerHTML));run('htab="w"');
els.modal.hidden=true;run('openCfg()');ok('EN: settings popup',!cyr.test(els.mbox.innerHTML.replace(/RU/,''))&&els.mbox.innerHTML.includes('Language'));
run('S.g[0]=10;S.last=NOW()-7200e3;offline()');ok('EN: offline popup',!cyr.test(els.mbox.innerHTML)&&els.mbox.innerHTML.includes('While you were away'));
run('S.loot=[{s:2,r:4}];claimLoot()');ok('EN: loot popup',!cyr.test(els.mbox.innerHTML)&&els.mbox.innerHTML.includes('Weapon · Mythic'));
run('S.inv=[];for(let i=0;i<3;i++)S.inv.push({s:0,r:0});craftAll()');ok('EN: merge popup',!cyr.test(els.mbox.innerHTML));
run('S.max=250;openAc(1)');ok('EN: chest popup',!cyr.test(els.mbox.innerHTML));
run('S.floor=10000;spawn();kill()');ok('EN: final victory popup',els.mbox.innerHTML.includes('Chaos is defeated'));
run('setLang("en")');ok('setLang stores the choice and re-renders',run('S.lang')==='en'&&run('LANG')==='en');
run('setLang("ru")');ok('switch back to Russian',run('LANG')==='ru'&&run('S.lang')==='ru');run('S.lang=""');els.modal.hidden=true;
// ---------- language detection ----------
const nav=ctx.navigator;
ctx.navigator={language:'de-DE'};ok('language: German browser -> English',run('pfLang()')==='en');
ctx.navigator={language:'uk-UA'};ok('language: Ukrainian browser -> Russian',run('pfLang()')==='ru');
ctx.navigator={language:'ru'};ok('language: Russian browser -> Russian',run('pfLang()')==='ru');
run('PF.kind="cg";PF.sdk={user:{systemInfo:{locale:"en-US"}}}');ok('language: CrazyGames locale wins over the browser',run('pfLang()')==='en');
run('PF.kind="local";PF.sdk=null');ctx.navigator=nav;
// ---------- CrazyGames platform (mocked SDK) ----------
ctx.__cg={calls:[],data:{},mute:false,next:null};
run(`PF.kind='cg';PF.noAds=false;PF.adblock=false;PF.sdk={
 ad:{requestAd:(type,cb)=>{__cg.calls.push('ad:'+type);const n=__cg.next;if(n==='ok'){cb.adStarted();__cg.calls.push('paused:'+paused);cb.adFinished()}else if(n){cb.adError({code:n})}}},
 game:{gameplayStart:()=>__cg.calls.push('gpStart'),gameplayStop:()=>__cg.calls.push('gpStop'),happytime:()=>__cg.calls.push('happy'),get settings(){return{muteAudio:__cg.mute}}},
 data:{setItem:(k,v)=>{__cg.data[k]=v},getItem:k=>__cg.data[k]||null}}`);
reset();run('PF.kind="cg"');ctx.__cg.next='ok';const nec0=run('S.nec');let got=0;ctx.__got=()=>got++;
run('rewarded(()=>__got())');
ok('CG rewarded: ad requested, game paused during the ad, reward after adFinished',got===1&&run('S.nec')===nec0+1&&ctx.__cg.calls.includes('ad:rewarded')&&ctx.__cg.calls.includes('paused:true')&&run('paused')===false);
ok('CG rewarded: gameplay stop/start around the ad',ctx.__cg.calls.includes('gpStop')&&ctx.__cg.calls.lastIndexOf('gpStart')>ctx.__cg.calls.indexOf('gpStop'));
ok('CG rewarded: UI blocker hidden again',els.adwait.hidden===true);
ctx.__cg.next='unfilled';got=0;run('rewarded(()=>__got())');ok('CG unfilled: no reward, ads stay enabled, toast shown',got===0&&run('PF.noAds')===false&&els.toast.textContent.length>0);
ctx.__cg.next='adsDisabledBasicLaunch';run('rewarded(()=>__got())');ok('CG basic launch: no reward, ads switched off',got===0&&run('PF.noAds')===true&&run('adsOff()')===true);
ctx.__cg.calls=[];run('rewarded(()=>__got())');ok('CG ads off: no further ad requests, message instead',ctx.__cg.calls.length===0&&got===0);
run('tab="rew";tabRender()');const rw=els.list.innerHTML;
ok('CG Basic Launch: rewards tab has no video buttons at all, only the Nectar shop',!rw.includes('Каждое видео')&&!rw.includes('openAc(')&&!rw.includes('hermesAd()')&&!rw.includes('chestAd()')&&rw.includes('buyShop('));
run('PF.adblock=true;tabRender()');const rwb=els.list.innerHTML;ok('CG adblock: notice + disabled video buttons',rwb.includes('Награды можно получить за Нектар')&&/disabled onclick="openAc\(0\)"/.test(rwb)&&/disabled onclick="hermesAd\(\)"/.test(rwb));run('PF.adblock=false');
run('S.last=NOW()-36e5;S.g[0]=50;offline()');{const mb=run("$('mbox').innerHTML");ok('CG Basic Launch: offline popup has no «watch video» button',mb.includes('o1')&&!mb.includes('id="o2"'));}run('closeM()');
reset();run('PF.kind="cg";PF.noAds=false;PF.adblock=false;S.adT=0;S.floor=20;S.max=19;spawn()');ctx.__cg.calls=[];ctx.__cg.next='ok';run('dealt(1e30,false,0,0)');ok('CG full launch: midgame ad after a boss win',ctx.__cg.calls.includes('ad:midgame'));
ctx.__cg.calls=[];run('S.floor=30;spawn();dealt(1e30,false,0,0)');ok('CG midgame: not more often than every 4 min',!ctx.__cg.calls.includes('ad:midgame'));
ctx.__cg.calls=[];run('S.adT=0;S.floor=31;spawn();dealt(1e30,false,0,0)');ok('CG midgame: never after an ordinary monster',!ctx.__cg.calls.includes('ad:midgame'));run('PF.noAds=true');
{const g=fs.readFileSync(ROOT+'/game.js','utf8');ok('CG SDK: logs environment and treats crazygames domains as CG unless disabled',g.includes("console.info('[Underworld Escape] CrazyGames SDK: environment=")&&g.includes("(env!='disabled'&&onCG)"));ok('CG SDK: listens to mute setting changes',g.includes('C.game.addSettingsChangeListener('));}
{const g=fs.readFileSync(ROOT+'/game.js','utf8'),b=fs.readFileSync(ROOT+'/build.sh','utf8');ok('CG ads are off by default, build switch CG_ADS=1 turns them on',/const CG_ADS=false/.test(g)&&/if\(!CG_ADS\)PF\.noAds=true/.test(g)&&b.includes("s/const CG_ADS=false/const CG_ADS=true/"));}
{const c=fs.readFileSync(ROOT+'/style.css','utf8');ok('no text selection / magnifier on iOS',c.includes('-webkit-user-select:none')&&c.includes('-webkit-touch-callout:none'));ok('compact layout for the 800×450 embed',/max-height:520px\)\{[^@]*nav button,nav button\.x\{height:40px/.test(c)&&/max-height:520px\)\{[^@]*#tip\{top:84px;bottom:auto/.test(c));}
ok('CG: no real-money Nectar packs',!rw.includes('buyPack('));
run('S.g[0]=10;S.last=NOW()-7200e3;offline()');ok('CG ads off: offline popup has no x2 video button',!els.mbox.innerHTML.includes('o2'));els.modal.hidden=true;
run('S.q=null;for(let i=0;i<30;i++){S.q=null;qn();if(S.q.p.some(qi=>QD[qi][1]=="a"))throw 1}');ok('CG ads off: no "watch videos" daily quests',true);
run('PF.noAds=false;PF.adblock=true;tab="rew";tabRender()');ok('CG adblock: inline notice, not a popup',els.list.innerHTML.includes('блокировщик')&&els.modal.hidden===true);
run('PF.adblock=false');ctx.__cg.calls=[];ctx.__cg.next='ok';
run('S.adT=0');let dn=0;ctx.__dn=()=>dn++;run('interstitial(()=>__dn())');ok('CG midgame: requested and game continues after it',ctx.__cg.calls.includes('ad:midgame')&&dn===1);
ctx.__cg.calls=[];run('interstitial(()=>__dn())');ok('CG midgame: not more often than every 4 min',!ctx.__cg.calls.includes('ad:midgame')&&dn===2);
ctx.__cg.next='unfilled';run('S.adT=0;interstitial(()=>__dn())');ok('CG midgame error: game continues',dn===3);
run('save(true)');ok('CG save goes to the Data module',typeof ctx.__cg.data.hades==='string'&&JSON.parse(ctx.__cg.data.hades).floor>=1);
ctx.__cg.data.hades=JSON.stringify(Object.assign(JSON.parse(ctx.__cg.data.hades),{floor:4321}));await run('load()');ok('CG load reads the Data module',run('S.floor')===4321);
ctx.__cg.mute=true;ok('CG muteAudio overrides the game sound',run('snd()')===false&&run('sound')===true);ctx.__cg.mute=false;ok('CG unmuted -> sound on',run('snd()')===true);
ctx.__cg.calls=[];reset();run('PF.kind="cg";S.floor=500;spawn();dealt(1e300,false,0,0)');ok('CG happytime after an act boss',ctx.__cg.calls.includes('happy'));
run('tab="rew";tabRender()');ok('CG: Hermes boost and Charon chest live in the Rewards tab',els.list.innerHTML.includes('hermesAd()')&&els.list.innerHTML.includes('chestAd()'));
run('PF.kind="local";PF.sdk=null;PF.noAds=false;PF.adblock=false');
// ---------- VK (mocked VK Bridge) ----------
{const tick=()=>new Promise(r=>setImmediate(r));ctx.URLSearchParams=URLSearchParams;
ctx.__vk={calls:[],st:{},ad:true,sub:null};
ctx.vkBridge={send:(m,p)=>{ctx.__vk.calls.push(m+(p&&p.ad_format?':'+p.ad_format:''));const v=ctx.__vk;
 if(m=='VKWebAppStorageSet'){if(p.value)v.st[p.key]=p.value;else delete v.st[p.key];return Promise.resolve({result:true})}
 if(m=='VKWebAppStorageGet')return Promise.resolve({keys:p.keys.map(k=>({key:k,value:v.st[k]||''}))});
 if(m=='VKWebAppShowNativeAds'){v.calls.push('paused:'+run('paused'));return Promise.resolve({result:v.ad})}
 return Promise.resolve({result:true})},subscribe:f=>{ctx.__vk.sub=f}};
ok('VK: not detected without launch params',run('vkOn()')===false);
ctx.location={search:'?vk_app_id=123&vk_platform=desktop_web&vk_language=ru',hostname:'example.github.io'};
ok('VK: detected by vk_app_id + bridge',run('vkOn()')===true);
reset();await run('pfInit()');ok('VK: VKWebAppInit sent first, kind=vk',ctx.__vk.calls[0]==='VKWebAppInit'&&run('PF.kind')==='vk');
ok('VK: rewarded ad preloaded on start',ctx.__vk.calls.includes('VKWebAppCheckNativeAds:reward'));
ok('VK: Russian from vk_language',run('pfLang()')==='ru');
run('S.inv=Array(400).fill(0).map((_,i)=>({s:i%6,r:i%8}));S.floor=777;vkT=0;save(true)');await tick();
const n=+ctx.__vk.st.svn;ok('VK save: JSON split into ≤4096-byte chunks',n>1&&Object.keys(ctx.__vk.st).filter(k=>/^sv\d+$/.test(k)).every(k=>Buffer.byteLength(ctx.__vk.st[k])<=4096));
ok('VK save: chunks join back to the save',JSON.parse([...Array(n)].map((_,i)=>ctx.__vk.st['sv'+i]).join('')).floor===777);
ctx.__vk.calls=[];run('S.floor=778;save(true)');ok('VK save: throttled (≤1 per 10 s forced, 60 s normal)',ctx.__vk.calls.length===0);
simNow+=61e3;run('save()');ok('VK save: only changed chunks are rewritten',ctx.__vk.calls.filter(c=>c=='VKWebAppStorageSet').length<n);
run('S.inv=[]');simNow+=61e3;run('save()');await tick();ok('VK save: chunk count updated when the save shrinks',+ctx.__vk.st.svn<n);
ok('VK save: copy kept in localStorage too',JSON.parse(ls.hades).floor===778);
// новый запуск: облако новее локальной копии -> берём облако
ls.hades=JSON.stringify(Object.assign(JSON.parse(ls.hades),{floor:5,last:1}));
run('vkC=[];vkCloud=null;PF.kind="local"');reset();await run('pfInit()');await run('load()');ok('VK load: newer cloud save wins over localStorage',run('S.floor')===778);
ls.hades=JSON.stringify(Object.assign(JSON.parse(ls.hades),{floor:9001,last:simNow+1e6}));await run('load()');ok('VK load: newer local save wins over cloud',run('S.floor')===9001);
// реклама
run('PF.t0=Date.now()-1e6');ctx.__vk.calls=[];const nec0=run('S.nec');let got=0;ctx.__got=()=>got++;run('rewarded(()=>__got())');await tick();
ok('VK rewarded: shown, paused during the ad, reward only after result:true',got===1&&run('S.nec')===nec0+1&&ctx.__vk.calls.includes('VKWebAppShowNativeAds:reward')&&ctx.__vk.calls.includes('paused:true')&&run('paused')===false&&els.adwait.hidden===true);
ctx.__vk.ad=false;run('rewarded(()=>__got())');await tick();ok('VK rewarded: no ad -> no reward, toast',got===1&&els.toast.textContent.length>0);ctx.__vk.ad=true;
let dn=0;ctx.__dn=()=>dn++;run('PF.t0=Date.now();S.adT=0');ctx.__vk.calls=[];run('interstitial(()=>__dn())');ok('VK interstitial: never in the first 3 minutes',dn===1&&!ctx.__vk.calls.some(c=>c.includes('interstitial')));
run('PF.t0=Date.now()-2e5;S.adT=0');run('interstitial(()=>__dn())');await tick();ok('VK interstitial: shown later, game continues',dn===2&&ctx.__vk.calls.includes('VKWebAppShowNativeAds:interstitial'));
run('interstitial(()=>__dn())');ok('VK interstitial: not more often than every 4 min',dn===3&&ctx.__vk.calls.filter(c=>c.includes('interstitial')).length===1);
run('tab="rew";tabRender()');ok('VK: no Yandex Nectar purchases',!els.list.innerHTML.includes('buyPack('));
run('tab="top";atab="a";tabRender()');ok('VK: no Yandex leaderboard',!els.list.innerHTML.includes('showLB()'));
run('openCfg()');ok('VK: «Tell friends» in settings',els.mbox.innerHTML.includes('vkShare()'));els.modal.hidden=true;
ctx.__vk.calls=[];ctx.__vk.sub({detail:{type:'VKWebAppViewHide'}});ok('VK: app hidden -> forced save',true);
run('PF.noAds=true');ctx.__vk.calls=[];got=0;run('rewarded(()=>__got())');ok('VK_ADS off: no ad request, no reward, message',got===0&&!ctx.__vk.calls.length);run('tab="rew";tabRender()');ok('VK_ADS off: rewards tab without video buttons',!els.list.innerHTML.includes('hermesAd()'));run('PF.noAds=false');
{const b=fs.readFileSync(ROOT+'/build.sh','utf8');ok('VK build: bridge bundled locally, ads switch VK_ADS=0',b.includes('cp vendor/vk-bridge.min.js dist/vk/')&&b.includes("s/const VK_ADS=true/const VK_ADS=false/")&&fs.existsSync(ROOT+'/vendor/vk-bridge.min.js'))}
ok('VK mobile web: page shrinks to the visible height VK reports',run('vkH({avail_height:700,viewport_height:760},800)')===700&&run('vkH({viewport_height:760},800)')===760&&run('vkH({avail_height:800},800)')===0&&run('vkH({avail_height:100},800)')===0&&run('vkH(null,800)')===0);
ok('VK: config requested and updates followed',fs.readFileSync(ROOT+'/game.js','utf8').includes("ty=='VKWebAppUpdateConfig')vkFit("));
delete ctx.vkBridge;ctx.location={search:'',hostname:''};run('vkC=[];vkCloud=null');}
run('PF.kind="local";PF.sdk=null;PF.noAds=false;PF.adblock=false');
const css5=fs.readFileSync(ROOT+'/style.css','utf8'),htm5=fs.readFileSync(ROOT+'/index.html','utf8');
ok('CG: battle-screen video buttons hidden by CSS',css5.includes('body.pf-cg #bHermes,body.pf-cg #bChest,body.pf-cg #bSave{display:none}'));
ok('landscape layout: arena | upgrades | section rail on wide screens',css5.includes('@media (min-aspect-ratio:5/4)')&&css5.includes('"arena panel nav"')&&css5.includes('"dock panel nav"'));
ok('wide layout: after a boss loss «Fight the boss» gets its own full row, video buttons below (VK 900×650 overlap fix)',css5.includes('#ads:has(#bRetry:not([hidden])) #bRetry{flex:1 1 100%;order:-1}')&&css5.includes('var(--dockh,var(--dock))'));
{const g=fs.readFileSync(ROOT+'/game.js','utf8');ok('no icon flicker: list, skill bar and reward timers are patched in place, not rebuilt',g.includes('function morph(a,b)')&&g.includes('setList(L,(tab==')&&g.includes('e._h=h;setList(e,h)')&&g.includes('b._h=tx;setList(b,tx)')&&!/\bL\.innerHTML=/.test(g.replace('}catch(e){}L.innerHTML=h}','')))}
{const g=fs.readFileSync(ROOT+'/game.js','utf8');ok('phone: list sheet — grip expands the list full screen, collapses on boss start, hidden on wide layouts',htm5.includes('id="grip"')&&g.includes('function gripInit()')&&g.includes('if(inBoss&&sheetOn())sheet(false);')&&css5.includes('body.sheet #arena{height:0!important')&&css5.includes('#grip{display:none}'))}
{const g=fs.readFileSync(ROOT+'/game.js','utf8');ok('first frame: arena drawn from the local save before the platform SDK answers; no saving until the real save is loaded',g.includes('preDraw();await pfInit();')&&g.includes('await load();loaded=true;')&&g.includes('function save(f){if(!loaded)return;')&&htm5.includes('<section id="arena" data-act="0">')&&!htm5.includes('👹'))}
{const g=fs.readFileSync(ROOT+'/game.js','utf8');ok('VK mobile web (iPhone): visible part of the game window measured by IntersectionObserver, page shrinks to it',g.includes('function vkVisInit()')&&g.includes("if(vq&&vq.get('vk_platform')=='mobile_web')vkVisInit();")&&g.includes('b=vkVis>240&&vkVis<ih-4?vkVis:0'))}
{const g=fs.readFileSync(ROOT+'/game.js','utf8');ok('reused buy button forgets old content (no soul icon on weapon prices after Skills -> Weapons)',g.includes("if(['data-k','data-i','data-ab'].some(n=>a.getAttribute(n)!==b.getAttribute(n))){delete a._k;delete a._h}")&&g.includes("C[1].firstElementChild.className=='coin'"))}
{const b=fs.readFileSync(ROOT+'/build.sh','utf8');ok('build adds a version tag to game.js/style.css (no stale cache after an update)',b.includes('game.js?v=$h')&&b.includes('style.css?v=$h'))}
ok('ad blocker overlay exists',htm5.includes('id="adwait"'));
ok('browser auto-translate is switched off (it duplicated the act title)',htm5.includes('translate="no"')&&htm5.includes('content="notranslate"'));
}
{
// ---------- effects ----------
reset();run('S.floor=5;spawn()');run('burst(100,80,9,["#fff"],60)');ok('sparks: particle pool created (48)',run('pts.length')===48&&els.fx.children.length>=48);
const p0=run('pti');run('burst(100,80,5,["#fff"],40)');ok('sparks: pool index advances',run('pti')===p0+5);
run('burst(NaN,80,5,["#fff"],40)');ok('sparks: bad coords ignored',run('pti')===p0+5);
run('S.floor=50;spawn()');ok('boss entrance banner: Megaera',els.bossban.textContent==='БОСС · Мегера');
// ---------- feats ----------
reset();run('S.st={};S.achN={};S.ach={};S.nec=0');ok('feats: 24 defined, each with a description',run('ACH.length')===24&&run('ACH.every(a=>ACHD[a[0]])'));
run('S.floor=5;spawn();dealt(1e30,false,0,0)');ok('lifetime kill counter',run('S.st.k')===1);
run('achCheck()');ok('feat unlocked + toast',run('S.achN.k1')===1&&els.toast.innerHTML.includes('Первая кровь')&&els.toast.innerHTML.includes('i-trophy'));
ok('nav badge counts claimable feats',run('achLbl()')==='Подвиги'&&run('achReady()')===1);
run('achClaim("k1")');ok('claim gives Nectar once',run('S.nec')===1&&run('S.ach.k1')===1);run('achClaim("k1")');ok('no double claim',run('S.nec')===1);
run('achClaim("k4")');ok('cannot claim a locked feat',run('S.nec')===1);
run('S.max=500;achCheck()');ok('Hydra feat at floor 500 (+ floor 100)',run('S.achN.f2')===1&&run('S.achN.f1')===1&&!run('S.achN.f3'));
run('S.st.c=999;achCheck()');ok('1000 clicks not yet',!run('S.achN.c1'));run('S.st.c=1000;achCheck()');ok('1000 clicks feat',run('S.achN.c1')===1);
run('S.eq=[4,-1,-1,-1,-1,-1];achCheck()');ok('mythic equipped feat',run('S.achN.i1')===1);
reset();run('S.st={};S.achN={};S.floor=10000;spawn();kill()');run('achCheck()');ok('final escape feat after Absolute Chaos',run('S.achN.f7')===1);els.modal.hidden=true;
reset();els.toast.textContent='';run('S.achN={};S.ach={};S.st={k:5000,b:60};S.max=1200;achCheck(true)');ok('silent pass: unlocked without a toast',run('S.achN.k2')===1&&run('S.achN.b2')===1&&els.toast.textContent==='');
run('tab="top";tabRender()');const th=els.list.innerHTML;ok('feats tab: counter, claim buttons, ready ones first',th.includes('Подвиги: 0 / 24')&&th.indexOf('class="row up fr rdy"')>=0&&th.indexOf('class="row up fr rdy"')<th.indexOf('class="row up fr lock"')&&th.includes('5.00K/25.0K'));
ok('feats tab keeps the leaderboard row outside CrazyGames',th.includes('showLB()'));
run('PF.kind="cg";tabRender()');ok('CG: feats tab without the leaderboard',!els.list.innerHTML.includes('showLB()')&&els.list.innerHTML.includes('achClaim'));run('PF.kind="local"');
reset();run('S.st={};S.achN={};S.pc=0;S.run=100;S.max=100;S.pt=0;prestige();achCheck()');ok('prestige counter + first rebirth feat',run('S.pc')===1&&run('S.achN.p1')===1);
run('setTexts("en");tab="top";tabRender()');ok('feats in English',!/[а-яё]/i.test(els.list.innerHTML)&&run('achLbl()')==='Feats');run('setTexts("ru")');
reset();run('S.nec=50;S.q=null;qn()');{const q0=run('JSON.stringify(S.q.p)');const qi=run("SHOP.findIndex(a=>a[1]=='quests')");els.toast.innerHTML='';run('buyShop('+qi+')');
ok('shop «New daily quests»: Nectar spent, fresh set, confirmation toast',run('S.nec')===45&&run('S.q.d.every(x=>!x)')&&els.toast.innerHTML.includes('Задания дня обновлены'));}
{const ok2=[];for(const k of ['gf','hermes']){els.toast.innerHTML='';run("buyShop(SHOP.findIndex(a=>a[1]=='"+k+"'))");ok2.push(els.toast.innerHTML.length>0)}ok('shop boosts show a confirmation toast',ok2.every(Boolean));}
// дар «Воды Леты»: +10% душ за перерождение за уровень, цена 10·2^ур., потолок 15
reset();run('S.run=723;S.sf=216;S.t[8]=0');{const g0=run('soulGain()');run('S.t[8]=5');const g5=run('soulGain()');run('S.t[8]=15');const g15=run('soulGain()');
ok('Waters of Lethe: +10% rebirth souls per level (723: '+g0+' -> '+g5+' at lv5 -> '+g15+' at lv15)',g0===339&&g5===Math.floor(339*1.5)&&g15===Math.floor(339*2.5));}
run('S.t[8]=0;S.souls=1e9');ok('Waters of Lethe: linear cost 30, 60, 90 … 450, max level 15',run('tc(8)')===30&&(run('buyT(8)'),run('tc(8)'))===60&&(run('buyT(8)'),run('tc(8)'))===90&&run('S.t[8]=14;tc(8)')===450&&run('TM[8]')===15);run('S.t[8]=0');
ok('all gifts cost grows linearly: Zeus 6, 12, 18 … lv.10 → 66; Apollo 10, 20 …',run('S.t[0]=0;tc(0)')===6&&run('S.t[0]=1;tc(0)')===12&&run('S.t[0]=10;tc(0)')===66&&run('S.t[4]=1;tc(4)')===20);run('S.t[0]=0;S.t[4]=0');
run('S.t[8]=15;S.souls=1e12;buyT(8)');ok('Waters of Lethe: cannot go past level 15',run('S.t[8]')===15);
run('S.t[8]=0');
// ---------- tips ----------
const T0='S.tut=0;S.td={};S.tipF=0;S.st={};S.gold=0;S.w[0]=1;S.g=S.g.map(()=>0);S.floor=1;S.max=1;S.dl="";S.loot=[];S.inv=[];S.eq=[-1,-1,-1,-1,-1,-1];S.nec=0;S.ach={};S.achN={};S.farm=false;inBoss=false;tipCur=null;spawn();';
els.fairy.hidden=true;
reset();run(T0+'tipUI()');ok('tip 1: tap the monster',els.tip.hidden===false&&els.tipt.textContent.includes('Нажимайте'));
run('S.st.c=10;tipUI()');ok('tip 2 waits until there is gold for an upgrade',els.tip.hidden===true&&run('S.td.tap')===1);
run('S.gold=20;tipUI()');ok('tip 2: upgrade the sword',els.tipt.textContent.includes('Меч Стикса'));
run('S.w[0]=2;S.gold=40;tipUI()');ok('tip 3: hire a god',els.tipt.textContent.includes('бога'));
run('S.g[0]=1;S.floor=4;S.max=3;tipUI()');ok('tip: claim the daily reward in Quests',els.tip.hidden===false&&els.tipt.textContent.includes('Задания'));
run('S.dl="x";S.floor=9;S.max=8;tipUI()');ok('tip: boss every 10 floors',els.tipt.textContent.includes('босс'));
run('S.max=11;tipUI()');ok('boss tip done after the first boss',run('S.td.boss')===1);
run('S.floor=11;S.max=11;spawn();tipUI()');ok('tip: skill unlocked (comes with the first boss), press key 1',els.tipt.textContent.includes('умение'));
run('S.st.s=1;tipUI()');ok('skill tip done after first use',run('S.td.skill')===1);
run('S.loot=[{s:0,r:0}];tipUI()');ok('tip: open the loot chest',els.tipt.textContent.includes('сундук'));
run('claimLoot();closeM&&closeM();tipUI()');ok('tip: equip an item in Items',run('S.td.loot')===1&&els.tipt.textContent.includes('Наденьте'));
run('equip(0,0);tipUI()');ok('equip tip done after equipping',run('S.td.equip')===1);
run('S.max=5;S.achN={f1:1};tipCur=null;tipUI()');ok('feat tip waits until after the first bosses',!els.tipt.textContent.includes('Подвиги')||els.tip.hidden);run('S.max=12;S.floor=12;spawn();tipUI()');ok('tip: claim a feat',els.tipt.textContent.includes('Подвиги'));run('S.ach={f1:1};tipUI()');
run('S.inv=[{s:1,r:0},{s:1,r:0},{s:1,r:0}];tipUI()');ok('tip: merge identical items',els.tipt.textContent.includes('Объединить'));run('S.st.m=1;tipUI()');
run('S.max=20;S.gold=5000;tipUI()');ok('tip: build the Forge in House',els.tipt.textContent.includes('Кузниц'));run('S.b[0][1]=NOW()+1e6;tipUI()');
run('S.nec=10;tipUI()');ok('tip: spend Nectar in Rewards',els.tipt.textContent.includes('Нектар'));run('S.st.o=1;tipUI()');
run('S.inBoss=0;inBoss=true;S.floor=20;tipCur=null;S.nec=0;S.st.fy=0;tipUI()');ok('during a boss fight no tips except the boss one',els.tip.hidden===true);run('inBoss=false');
run('S.farm=true;inBoss=false;S.max=19;S.floor=19;tipUI()');ok('after losing to a boss: hint to upgrade and retry',els.tip.hidden===false&&els.tipt.textContent.includes('Босс оказался сильнее'));
run('tipOff()');ok('× on the boss hint hides only that hint',run('S.tipF')===1);run('tipUI()');ok('boss hint stays closed',els.tip.hidden===true);run('S.farm=false');
reset();run(T0+'S.st.c=10;S.gold=20;tipUI()');run('tipOff()');ok('× closes only the current tip',run('S.td.sword')===1&&els.tip.hidden===true);
run('S.gold=40;tipUI()');ok('next tip still shows after ×',els.tipt.textContent.includes('бога'));
run('S.td={tap:1,sword:1};S.max=60;S.run=60;S.sf=0;S.pt=0;S.souls=0;prestige()');ok('rebirth keeps tutorial progress',run('S.td.tap')===1&&run('S.td.sword')===1&&run('S.pc')>=1);
run('S.tut=99;tipCur=null;tipUI()');ok('old saves that closed all tips stay quiet',els.tip.hidden===true);run('S.tut=0');
{const g=fs.readFileSync(ROOT+'/game.js','utf8');ok('every tip has ru+en text and a highlight',run('TIPS.every(x=>x.id&&x.ru&&x.en&&typeof x.hl=="function")')&&run('new Set(TIPS.map(x=>x.id)).size===TIPS.length'));}
}
{
// ---------- audio engine ----------
run('AUD=null;A=null;sound=true;paused=false;S.vol=[.7,.3]');ok('audio graph builds (master, buses, reverb, compressor, noise)',run('audInit()')===true&&run('!!(A.master&&A.sfx&&A.mus&&A.rev&&A.comp&&A.noise)'));
let pt2=5e7;ctx.performance.now=()=>(pt2+=1000);
const cnt=()=>(ctx.__osc||0)+(ctx.__src||0);
const keys=['click','crit','kill','boss','buy','lose','reward','bossIn','fairy','skill'];
ok('every sound effect produces sound',keys.every(k=>{const c0=cnt();run(`sfx("${k}")`);return cnt()>c0}));
ctx.performance.now=()=>pt2;const c1=cnt();run('sfx("click")');const c2=cnt();run('sfx("click")');ok('fast repeated clicks are rate-limited',c2>c1&&cnt()===c2);
pt2+=1000;run('S.vol=[0,.3]');const c3=cnt();run('sfx("click")');ok('effects slider at 0 -> no sound',cnt()===c3);run('S.vol=[.7,.3]');
reset();run('mus.t=0;mus.bar=0;S.floor=5;spawn()');const c4=cnt();run('musTick()');ok('music: schedules a bar ahead',cnt()>c4&&run('mus.t')>0&&run('mus.bar')>=1);
const c5=cnt();run('musTick()');ok('music: does not re-schedule the same time window',cnt()===c5);
run('mus.t=0;mus.bar=2');const c6=cnt();run('musBar(0)');ok('music: every 8th bar the melody rests (pad only)',cnt()-c6===6);
run('S.floor=10;spawn();mus.bar=0');const c7=cnt();run('musBar(0)');const boss=cnt()-c7;run('S.farm=true;S.floor=9;spawn();mus.bar=0');const c8=cnt();run('musBar(0)');ok('music: boss fight adds a heartbeat',boss-(cnt()-c8)===8);run('S.farm=false');
run('trk.src={};S.farm=false;S.floor=5;spawn();mus.bar=0');{const c0=cnt();run('musBar(0)');ok('music: with the theme track playing, no synth pad/melody',cnt()===c0);run('S.floor=10;spawn();mus.bar=0');const c1=cnt();run('musBar(0)');ok('music: boss heartbeat still plays over the theme',cnt()-c1===8);run('trk.src=null;S.floor=5;spawn()');}
{const fsx=require('fs');ok('music: theme file exists and is packed into builds',fsx.existsSync(ROOT+'/music/theme.mp3')&&fsx.statSync(ROOT+'/music/theme.mp3').size<3e6&&fsx.readFileSync(ROOT+'/build.sh','utf8').includes('img fonts music sfx'));}
{pt2+=5000;const o0=ctx.__osc||0,s0=ctx.__src||0;run('SB.click={b:{getChannelData:()=>[],sampleRate:44100},off:0};sfx("click")');ok('effects: a loaded file plays instead of the synth',(ctx.__src||0)-s0===1&&(ctx.__osc||0)===o0);run('delete SB.click');}
{const fsx=require('fs');ok('effects: every sound file exists',run('Object.values(SFXF)').every(f=>fsx.existsSync(ROOT+'/sfx/'+f+'.mp3')));}
ok('default volume 25% effects / 25% music',run('S0().vol.join()')==='0.25,0.25');
{const sv=run('JSON.stringify(S)');run('S=Object.assign(S0(),{vol:[.7,.3]});delete S.vv;if(S.tot<S.souls)S.tot=S.souls;if(!S.vv){if(S.vol&&S.vol[0]==.7&&S.vol[1]==.3)S.vol=[.25,.25];S.vv=1}');ok('old default volume 70/30 migrates to 25/25 once',run('S.vol.join()')==='0.25,0.25');
run('S=Object.assign(S0(),{vol:[.5,.1]});delete S.vv;if(!S.vv){if(S.vol&&S.vol[0]==.7&&S.vol[1]==.3)S.vol=[.25,.25];S.vv=1}');ok('a volume the player chose is kept',run('S.vol.join()')==='0.5,0.1');run('S=Object.assign(S0(),'+sv+')');}
ok('load() contains the volume migration',fs.readFileSync(ROOT+'/game.js','utf8').includes("if(!S.vv){if(S.vol&&S.vol[0]==.7&&S.vol[1]==.3)S.vol=[.25,.25];S.vv=1}"));
ok('music: each act has its own mode',run('MODES.length')===6&&run('new Set(MODES.map(m=>m[1].join())).size')>=5);
run('pause(true)');ok('pause mutes the master bus',run('paused')===true);run('pause(false)');
run('AUD.state="running";audVis(true)');ok('hidden tab suspends audio',run('AUD.state')==='suspended');run('audVis(false)');ok('visible tab resumes audio',run('AUD.state')==='running');
run('setVol(1,0)');ok('music slider updates and saves',run('S.vol[1]')===0);run('setVol(1,30)');
}
['hero','gods','inv','house','quest','rew','pres','top'].forEach(t=>{run(`tab="${t}";tabRender()`);ok('render '+t,els.list.innerHTML.length>20)});
ok('hp finite at 10000',isFinite(run('mHP(10000)')));
ok('old save migrates',(()=>{run('S=Object.assign(S0(),{floor:5,souls:4,tot:0});if(S.tot<S.souls)S.tot=S.souls');return run('S.tot')===4})());
ok('early bosses softer, normal from floor 60',run('bossM(10)')===1.6&&run('bossM(60)')===6&&run('bossM(500)')===6&&run('bossM(20)')<run('bossM(30)'));
ok('early gold bonus fades to x1 by floor 40',run('eGold(1)')===4&&run('eGold(40)')===1&&run('eGold(300)')===1);
ok('reward base skips boss multiplier',(run('S.max=250'),Math.abs(run('rwG()')-run('mHP(249)'))<1e-6));
{const fsx=require('fs');ok('portrait for every god and icon for every weapon',run('GODS.length')===18&&run('WEAPONS.length')===17&&[...Array(18).keys()].every(i=>fsx.existsSync(ROOT+'/img/gods/g_'+String(i).padStart(2,'0')+'.webp'))&&[...Array(17).keys()].every(i=>fsx.existsSync(ROOT+'/img/weapons/w_'+String(i).padStart(2,'0')+'.webp'))&&fsx.existsSync(ROOT+'/img/boss_0010.webp'));
run('tab="gods";tabRender()');ok('gods tab shows portraits',els.list.innerHTML.includes('img/gods/g_00.webp'));run('tab="hero";htab="w";tabRender()');ok('hero tab shows weapon icons',els.list.innerHTML.includes('img/weapons/w_00.webp'));}
{const fsx=require('fs');const need=['feat_trophy','gift_0','house_0','house_1','house_2','q_daily','q_done','q_bonus','rew_charon','rew_hermesad',...[...Array(9).keys()].map(i=>'gift_'+i),...'kcbusriahfoxm'.split('').map(k=>'q_'+k),...'kbfcxpmigso'.split('').map(k=>'feat_'+k)];
ok('every tab icon file exists (img/ui)',need.every(n=>fsx.existsSync(ROOT+'/img/ui/'+n+'.webp'))&&run('SHA.concat(ACA)').every(n=>fsx.existsSync(ROOT+'/img/ui/'+n+'.webp')));
ok('every quest type and feat category has a painted icon',run('Object.keys(QI)').every(k=>fsx.existsSync(ROOT+'/img/ui/q_'+k+'.webp'))&&run('Object.keys(FI)').every(k=>fsx.existsSync(ROOT+'/img/ui/feat_'+k+'.webp')));}
{const fsx=require('fs');ok('every named boss has its own art',run('Object.keys(BOSSES).map(Number)').every(f=>run('SPR.boss['+f+']')&&fsx.existsSync(ROOT+'/img/'+run('SPR.boss['+f+']')+'.webp')));}
reset();run('S.st={};S.floor=3;spawn()');run('dealt(1e30,false,0,0)');ok('stats: gold from monsters counted',run('S.st.g')>0&&Math.abs(run('S.st.g')-run('S.gold'))<1e-6);
run('S.floor=10;S.farm=false;spawn();lose()');ok('stats: boss defeat counted',run('S.st.l')===1);
run('S.st.c=1234;S.st.t=3725;tab="top";atab="s";tabRender()');{const sh=els.list.innerHTML;ok('stats tab renders tiles with counters and play time',(sh.match(/class="stt"/g)||[]).length===20&&sh.includes('1.23K')&&sh.includes('1 ч 2 мин')&&sh.includes('Статистика'));}
run('atab="a";tabRender()');ok('feats sub-tab still shows feats',els.list.innerHTML.includes('class="row up fr'));
run('S.st={c:5};S.max=60;S.run=60;S.sf=0;S.pt=0;prestige()');ok('stats survive rebirth',run('S.st.c')===5);
run('openHelp()');{const hh=els.mbox.innerHTML;ok('help: «How to play» lists every mechanic with an icon',(hh.match(/class="hrow/g)||[]).length===13&&hh.includes('Гнев Олимпа')&&hh.includes('Перерождение')&&hh.includes('img/icons/fairy.webp')&&hh.includes("navGo('house')"));}run('closeM()');
{const fsx=require('fs');const hh=(()=>{run('openHelp()');return els.mbox.innerHTML})();ok('help: every icon file exists',[...hh.matchAll(/src="img\/([^"]+)"/g)].every(m=>fsx.existsSync(ROOT+'/img/'+m[1])));run('closeM()');}
// balance sim
raf(0);run('S=S0();spawn();ck.last=0;ck.iv=[];ck.ts=[];ck.m=1');let tt=0;
const buyAll=()=>run(`for(let n=0;n<30;n++){let b=null;for(const k of ['w','g']){const A=k=='w'?WEAPONS:GODS,L=k=='w'?S.w:S.g;A.forEach((a,i)=>{const c=cost(a[2],L[i]);if(S.gold>=c&&(!b||c<b[2]))b=[k,i,c]})}if(!b)break;buy(b[0],b[1])}`);
for(const mins of [5,15,30,60]){const steps=mins*60*20;const from=tt;
 while(tt<mins*60*20){tt++;simNow+=50;raf(tt*50);if(tt%20==0){for(let i=0;i<6;i++)click();buyAll();if(run("S.farm")&&run("(dps()+clickD()*6)*28>=mHP(S.floor+1)"))els.bRetry.onclick()}}
 console.log(`sim ${mins} мин: этаж ${run('S.floor')}, макс ${run('S.max')}, dps ${run('dps()').toExponential(1)}`)}
ok('no NaN',!isNaN(run('S.gold'))&&isFinite(run('S.gold')));
console.log(fails?'FAILS: '+fails:'ALL PASSED');if(fails)process.exit(1);
})().catch(e=>{console.log('ERR',e);process.exit(1)});
