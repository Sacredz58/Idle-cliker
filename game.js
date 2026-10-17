'use strict';
let tOff=0;const NOW=()=>Date.now()+tOff;
const $=id=>document.getElementById(id);
let LANG='ru';const t=(r,e)=>LANG=='ru'?r:e;
// спрайты: обычный монстр акта (по индексу акта) и именные боссы (по этажу); файлы лежат в img/*.webp
const SPR={mob:{0:'act1_mob'},boss:{50:'boss_0050',100:'boss_0100',250:'boss_0250',500:'boss_0500'}};
let ACTS,BOSSES,WEAPONS,GODS;
const WALLS=[50,100,250,500,2000,4500,7000,9000,10000];
const S0=()=>({floor:1,max:1,gold:0,souls:0,w:[1,...Array(16).fill(0)],g:Array(18).fill(0),last:NOW(),chest:0,hermes:0,adT:0,tot:0,t:[0,0,0,0,0,0,0,0],inv:[],eq:[-1,-1,-1,-1,-1,-1],b:[[0,0],[0,0],[0,0]],day:0,dl:'',q:null,pt:0,run:1,farm:false,sc:[0,0,0,0],se:[0,0,0,0],ac:[0,0,0,0],mk:0,cheat:false,loot:[],vol:[.7,.3],sl:[0,0,0,0],nec:0,own:[[0],[0]],skin:0,theme:0,gf:0,sf:1,lang:'',st:{},achN:{},ach:{},tut:0,pc:0});
let S=S0(),ysdk=null,player=null,hp=0,maxhp=0,bossT=0,inBoss=false,clicks=[],rage=0,sound=true,tab='hero',pool=[],pi=0,acc=0;
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td','Qad','Qid','Sxd'];
const fmt=n=>{if(!isFinite(n))return'∞';if(n<1e3)return Math.floor(n)+'';const p=Math.pow(10,Math.floor(Math.log10(n))-2);n=Math.round(n/p)*p;const e=Math.floor(Math.log10(n)/3);if(e>=SUF.length)return n.toExponential(2).replace('e+','e');const v=n/Math.pow(10,e*3);return(v<10?v.toFixed(2):v<100?v.toFixed(1):v.toFixed(0))+SUF[e]};
const cost=(b,l)=>b*Math.pow(1.13,l);
const mult=l=>Math.pow(2,Math.floor(l/25));
const soulM=()=>Math.pow(1+S.tot*.05,1.5),RB=[.3,.7,1.4,2.2,4.5,9,20,45],gearM=()=>1+S.eq.reduce((a,r)=>a+(r>=0?RB[r]:0),0),bld=i=>1+.1*S.b[i][0],T=i=>1+.1*S.t[i];
const boost=()=>(NOW()<S.hermes?2:1)*(rage>0?2:1)*soulM()*gearM();
const clickD=()=>(1+WEAPONS.reduce((a,w,i)=>a+w[1]*S.w[i]*mult(S.w[i]),0))*boost()*bld(0)*T(0)*(1+.25*pt(2))*(sa(3)?3:1);
const dps=()=>GODS.reduce((a,g,i)=>a+g[1]*S.g[i]*mult(S.g[i]),0)*boost()*bld(2)*T(2)+(sa(1)?5*clickD()*pw(1):0);
const isBoss=f=>f%10==0;
function mHP(f){let h=14*Math.pow(f,1.9)*Math.pow(1.045,Math.min(f,1000))*Math.exp(.0013*Math.max(0,f-1000));
 WALLS.forEach(w=>{if(f>=w)h*=3});return h*(isBoss(f)?6:1)}
const act=f=>ACTS.find(a=>f<=a[0])||ACTS[5];
function spawn(){const f=S.floor;if(f>S.run)S.run=f;maxhp=hp=mHP(f)*(1-.1*pt(3))/(isBoss(f)?1:5);inBoss=isBoss(f)&&!S.farm;bossT=inBoss?30+10*pt(7):0;
 {const a=act(f);$('mname').textContent=BOSSES[f]||(isBoss(f)?t('Страж ','Guardian of '):t('Тень ','Shade of '))+a[3]}
 {const m=$('monster'),ai=ACTS.indexOf(act(f)),sp=isBoss(f)?(SPR.boss[f]||SPR.mob[ai]):SPR.mob[ai];if(sp){m.textContent='';m.style.backgroundImage='url(img/'+sp+'.webp)'}else{m.textContent=isBoss(f)?'👑':act(f)[2];m.style.backgroundImage=''}m.classList.toggle('img',!!sp);m.classList.toggle('boss',isBoss(f));m.classList.toggle('named',!!(isBoss(f)&&SPR.boss[f]))}
 $('floor').textContent=t('Этаж ','Floor ')+f+(isBoss(f)||S.farm?'':' · '+(S.mk+1)+'/5');$('act').textContent=act(f)[1];$('arena').dataset.act=ACTS.indexOf(act(f));actUI(f);
 $('bRetry').hidden=!S.farm;$('bSave').hidden=!S.farm;if(inBoss)bossIn($('mname').textContent);draw()}
function kill(){const f=S.floor;sfx(isBoss(f)?'boss':'kill');wait=SPAWN_DELAY;killFx(isBoss(f));S.gold+=mHP(f)*.1*(isBoss(f)?3:.2)*bld(1)*T(1)*(1+.3*pt(1))*(NOW()<S.gf?2:1);qp('k');if(isBoss(f)){for(let k=0;k<1+pt(6);k++)drop(0,true);qp('b')}
 const clr=!S.farm&&(isBoss(f)||++S.mk>=5);if(clr){S.mk=0;if(f>S.max){S.max=f;qp('f');submitScore()}}
 if(f>=10000&&isBoss(f)){S.st.win=(S.st.win||0)+1;modal(t('<h3>Хаос повержен!</h3><p>Вы вышли из Подземелья. Перерождение откроет новый круг.</p>','<h3>Chaos is defeated!</h3><p>You have escaped the Underworld. Rebirth starts a new cycle.</p>')+'<button onclick="closeM()">'+t('Дальше','Continue')+'</button>');happy();}
 else if(clr&&f<10000)S.floor++;
 if(clr&&[500,2000,4500,7000,9000].includes(f)){happy();interstitial(()=>{})}
 spawn();if(tab=='inv'||tab=='quest'||tab=='pres'||tab=='top')dirty=true;sv()}
function lose(){sfx('lose');wait=0;$('monster').classList.remove('gone');S.floor--;S.farm=true;inBoss=false;spawn();bossT=0;save()}
function dealt(d,crit,x,y){hp-=d;float(d,crit,x,y);if(hp<=0)kill();draw()}
$('arena').addEventListener('pointerdown',e=>{
 const mm=clickOK(e);if(!mm)return;heroAtk();if(mm==1){qp('c');const now=NOW();clicks=clicks.filter(t=>now-t<2000);clicks.push(now)}
 if(mm==1&&clicks.length>=12-3*pt(5)&&rage<=0){rage=8;qp('r');$('rage').classList.add('on')}
 const crit=rage>0||Math.random()<.1+.15*pt(4)+.01*S.t[4];let d=clickD()*(crit?(rage>0?1:3+.2*S.t[3]):1)*mm;sfx(crit?'crit':'click');if(crit)qp('x');
 if(crit){$('arena').classList.remove('shake');void $('arena').offsetWidth;$('arena').classList.add('shake');flash()}
 const r=$('arena').getBoundingClientRect();
 $('monster').classList.add('hit');setTimeout(()=>$('monster').classList.remove('hit'),60);
 if(wait<=0){dealt(d,crit,e.clientX-r.left,e.clientY-r.top);burst(e.clientX-r.left,e.clientY-r.top,crit?9:5,crit?['#fff1c4','#ff6a4a','#ffd96b']:['#ffd96b','#ffb35a'],crit?70:40)}});
for(let i=0;i<24;i++){const d=document.createElement('div');d.className='dn';$('fx').appendChild(d);pool.push(d)}
function float(d,c,x,y){const e=pool[pi++%pool.length];e.style.display='block';e.className='dn'+(c?' c':'');e.textContent=fmt(d);
 e.style.left=x+'px';e.style.top=y+'px';e.style.animation='none';void e.offsetWidth;e.style.animation=''}
function draw(){adUI();skUI();lootUI();$('nec').textContent=fmt(S.nec);$('hp').style.width=Math.max(0,hp/maxhp*100)+'%';$('hptxt').textContent=fmt(Math.max(0,hp))+' / '+fmt(maxhp);
 $('timer').textContent=inBoss?t('Бой с боссом: ','Boss fight: ')+bossT.toFixed(1)+t(' с',' s'):S.farm?t('Босс ждёт на этаже ','Boss awaits on floor ')+(S.floor+1):'';$('timer').classList.toggle('boss',inBoss);
 $('cd').textContent=fmt(clickD());$('dps').textContent=fmt(dps());$('gold').textContent=fmt(S.gold);$('souls').textContent=fmt(S.souls);
 $('rageb').style.width=(rage>0?rage/8*100:Math.min(100,clicks.length/(12-3*pt(5))*100))+'%'}
let lt=performance.now();
function loop(t){if(paused){lt=t;requestAnimationFrame(loop);return}const dt=Math.min(.25,(t-lt)/1e3)*TS;lt=t;
 if(rage>0){rage-=dt;if(rage<=0){rage=0;$('rage').classList.remove('on')}}
 zt+=dt;if(pt(0)&&zt>=8&&wait<=0){zt=0;dealt(dps()*10*pt(0),true,150,110)}if(inBoss){bossT-=dt;if(bossT<=0)lose()}
 {let T=dt,g=0;const d=dps();while(T>0&&g++<MAXK){if(wait>0){const u=Math.min(wait,T);wait-=u;T-=u;if(wait<=0)$('monster').classList.remove('gone');continue}
 if(d<=0)break;const tk=hp/d;if(tk<=T){T-=tk;kill();if(S.floor>=10000&&isBoss(S.floor))break}else{hp-=d*T;T=0}}}
 acc+=dt;if(acc>.2){acc=0;draw();hTick()}if(acc===0&&tab)updBtns();
 requestAnimationFrame(loop)}
function buy(kind,i){const arr=kind=='w'?WEAPONS:GODS,lv=kind=='w'?S.w:S.g,[n,c]=plan(arr[i][2],lv[i]);
 if(S.gold>=c){S.gold-=c;lv[i]+=n;qp('u',n);sfx('buy');tabRender();draw();save()}}
// кнопки покупки: «+N ур. · цена», недоступные гаснут, лучшее вложение золота помечается «Выгоднее всего»
function updBtns(){let best=null,bv=0;document.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k,i=+b.dataset.i,A=k=='w'?WEAPONS:GODS,L=(k=='w'?S.w:S.g)[i],[n,c]=plan(A[i][2],L),key=n+'|'+fmt(c),ok=S.gold>=c;
  if(b._k!==key){b._k=key;b.innerHTML='<b>+'+n+' '+t('ур.','lv.')+'</b><span><i class="coin"></i>'+fmt(c)+'</span>'}b.disabled=!ok;
  const v=A[i][1]*((L+n)*mult(L+n)-L*mult(L))/c;if(ok&&v>bv){bv=v;best=b}
  const r=b.parentElement;if(r)r.classList.toggle('dim',!ok&&L==0)});
 document.querySelectorAll('[data-k]').forEach(b=>{const r=b.parentElement;if(r)r.classList.toggle('isbest',b===best)});
 document.querySelectorAll('[data-b]').forEach(b=>{b.disabled=S.gold<+b.dataset.b})}
function upRow(k,a,i,L){const nx=25-L%25;
 return `<div class="row up"><div class="ut">${k=='w'?ico(WICO[i]||'sword'):a[0].charAt(0)}</div><div class="ub"><div class="un"><b>${a[0]}</b><span class="lv">${t('ур.','lv.')} ${L}</span><span class="best">${t('Выгоднее всего','Best value')}</span></div>`+
  `<small><em>+${fmt(a[1]*mult(L))}</em> ${k=='w'?t('к клику за уровень','click dmg per level'):t('урона/с за уровень','DPS per level')}</small>`+
  `<div class="m2"><span><i style="width:${(L%25)*4}%"></i></span><small>${t('×2 через ','×2 in ')}${nx} ${t('ур.','lv.')}</small></div>${k=='g'?psH(i):''}</div>`+
  `<button class="buy" data-k="${k}" data-i="${i}" onclick="buy('${k}',${i})"></button></div>`}
function tabRender(){const L=$('list');let h='';
 if(tab=='hero'||tab=='gods'){const k=tab=='hero'?'w':'g',arr=tab=='hero'?WEAPONS:GODS,lv=tab=='hero'?S.w:S.g;
  if(tab=='hero'){const up=SK.some((a,i)=>skLv(i)>0&&S.sl[i]<SKMAX&&S.souls>=skCost(i));
   h+=panH('hero','<div class="seg"><button class="'+(htab=='w'?'on':'')+'" onclick="setHT(\'w\')">'+t('Оружие','Weapons')+'</button><button class="'+(htab=='s'?'on':'')+'" onclick="setHT(\'s\')">'+t('Умения','Skills')+(up?'<i class="dot"></i>':'')+'</button></div>'+(htab=='w'?qsH():''));
   if(htab=='s'){L.innerHTML=h+skH();return}}
  else h+=panH('gods',qsH());
  arr.forEach((a,i)=>{h+=upRow(k,a,i,lv[i])})}
 else if(tab=='pres'){const g=soulGain();
  h=`<div class="row"><div><b>${t('Алтарь Никты','Altar of Nyx')}</b><small>${t(`Урон ×(1+0,05·души)^1,5. Сейчас: ${S.souls}. За перерождение: +${g} (лучший этаж забега: ${S.run}, коэф. ×${(1+S.run/400).toFixed(2)}; следующий старт с этажа ${startF()})`,`Damage ×(1+0.05·souls)^1.5. Souls: ${S.souls}. Rebirth gives +${g} (best floor this run: ${S.run}, bonus ×${(1+S.run/400).toFixed(2)}; next run starts at floor ${startF()})`)}</small><small data-pc></small></div><button data-pb onclick="prestige()" ${g<1||pcd()>0?'disabled':''}>${t('Переродиться','Rebirth')}</button></div>`+talH()}
 else if(tab=='inv')h=invH();else if(tab=='house')h=houseH();else if(tab=='quest')h=questH();else if(tab=='rew')h=rewH();else h=(PF.kind=='cg'?'':'<div class="row"><div><b>'+t('Лидерборд','Leaderboard')+'</b><small>'+t('Рекорд: этаж ','Record: floor ')+S.max+'</small></div><button onclick="showLB()">'+t('Открыть','Open')+'</button></div>')+achH();
 L.innerHTML=(tab=='hero'||tab=='gods'?'':panH(tab))+h;updBtns()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>navGo(b.dataset.t));
function prestige(){const g=soulGain();if(g<1||pcd()>0)return;
 const done=()=>{if(pcd()>0)return;const f0=startF(),k={pt:NOW(),cheat:S.cheat,max:S.max,souls:S.souls+g,tot:S.tot+g,hermes:S.hermes,chest:S.chest,ac:S.ac,loot:S.loot,vol:S.vol,lang:S.lang,st:S.st,achN:S.achN,ach:S.ach,tut:S.tut,pc:S.pc+1,sl:S.sl,nec:S.nec,own:S.own,skin:S.skin,theme:S.theme,gf:S.gf,adT:S.adT,t:S.t,inv:S.inv,eq:S.eq,b:S.b,day:S.day,dl:S.dl,q:S.q};S=Object.assign(S0(),k);S.farm=false;S.floor=f0;S.sf=f0;S.run=f0;S.gold=skipGold(f0);spawn();tabRender();save()};
 interstitial(done)}
function modal(h){$('mbox').innerHTML=h;$('modal').hidden=false}
function closeM(){$('modal').hidden=true}
// ---- Платформы: Яндекс Игры (ya), CrazyGames (cg) или локальный запуск (local) ----
const PF={kind:'local',sdk:null,noAds:false,adblock:false};
const adsOff=()=>PF.kind=='cg'&&(PF.noAds||PF.adblock);
const okB=()=>'<button onclick="closeM()">'+t('Ок','OK')+'</button>';
async function pfInit(){
 try{const C=window.CrazyGames&&window.CrazyGames.SDK;if(C){await C.init();if(C.environment=='crazygames'||C.environment=='local'){PF.kind='cg';PF.sdk=C;try{C.game.loadingStart()}catch(e){}try{PF.adblock=!!(await C.ad.hasAdblock())}catch(e){}return}}}catch(e){}
 try{if(window.YaGames){ysdk=await YaGames.init();player=await ysdk.getPlayer();syncTime();PF.kind='ya'}}catch(e){ysdk=null}}
// язык: ?lang=, затем язык из SDK площадки, затем браузера; русский для ru/be/uk/kk, иначе английский
function pfLang(){let l='';try{const q=new URLSearchParams(location.search).get('lang');if(q)return q=='ru'?'ru':'en'}catch(e){}
 try{if(PF.kind=='cg'){const si=PF.sdk.user&&PF.sdk.user.systemInfo;l=(si&&si.locale)||''}else if(ysdk)l=ysdk.environment.i18n.lang}catch(e){}
 if(!l)try{l=navigator.language||''}catch(e){}
 return /^(ru|be|uk|kk)/i.test(l)?'ru':'en'}
function adWait(on){const w=$('adwait');if(w)w.hidden=!on}
const adOffMsg=()=>PF.adblock?t('Мешает блокировщик рекламы','An ad blocker is blocking videos'):t('Видеореклама пока недоступна','Video ads are not available yet');
function adErr(e){const c=e&&e.code;if(c=='adsDisabledBasicLaunch')PF.noAds=true;else if(c=='adblock')PF.adblock=true;
 toast(PF.noAds||PF.adblock?adOffMsg():t('Сейчас нет рекламы, попробуйте позже','No ad right now, try again later'));if(PF.noAds||PF.adblock)upd()}
// CrazyGames: экран блокируется с момента запроса, игра на паузе и без звука только пока ролик идёт
function cgAd(type,onDone,onFail){let started=false;adWait(true);const end=()=>{pause(false);adWait(false)};
 const guard=setTimeout(()=>{if(!started){end();onFail({code:'other'})}},10000);
 try{PF.sdk.ad.requestAd(type,{adStarted:()=>{started=true;clearTimeout(guard);pause(true)},adFinished:()=>{clearTimeout(guard);end();onDone()},adError:er=>{clearTimeout(guard);end();onFail(er)}})}catch(er){clearTimeout(guard);end();onFail(er)}}
function rewarded(ok){const f=()=>{qp('a');S.nec++;ok()};
 if(PF.kind=='cg'){if(adsOff())return toast(adOffMsg());cgAd('rewarded',()=>{f();toast(t('🎁 Награда получена!','🎁 Reward received!'))},adErr);return}
 if(ysdk){ysdk.adv.showRewardedVideo({callbacks:{onOpen:()=>pause(true),onRewarded:f,onClose:()=>pause(false),onError:()=>pause(false)}})}else f()}
function interstitial(done){if(PF.kind=='cg'){if(adsOff()||NOW()-S.adT<=240000)return done();S.adT=NOW();cgAd('midgame',done,er=>{if(er&&er.code=='adsDisabledBasicLaunch')PF.noAds=true;done()});return}
 if(ysdk&&NOW()-S.adT>240000){S.adT=NOW();ysdk.adv.showFullscreenAdv({callbacks:{onOpen:()=>pause(true),onClose:()=>{pause(false);done()},onError:()=>{pause(false);done()}}})}else done()}
function happy(){if(PF.kind=='cg')try{PF.sdk.game.happytime()}catch(e){}}
function storeSet(j){if(PF.kind=='cg'){try{PF.sdk.data.setItem('hades',j)}catch(e){}return}try{localStorage.setItem('hades',j)}catch(e){}}
function storeGet(){try{return PF.kind=='cg'?PF.sdk.data.getItem('hades'):localStorage.getItem('hades')}catch(e){return null}}
const snd=()=>{if(!sound)return false;try{if(PF.kind=='cg'&&PF.sdk.game.settings&&PF.sdk.game.settings.muteAudio)return false}catch(e){}return true};
function submitScore(){if(S.cheat||!ysdk)return;if(NOW()-lbT<20000){lbP=true;return}lbT=NOW();lbP=false;try{if(ysdk.leaderboards&&ysdk.leaderboards.setScore)ysdk.leaderboards.setScore('floors',S.max).catch(()=>{});else if(ysdk.getLeaderboards)ysdk.getLeaderboards().then(l=>l.setLeaderboardScore('floors',S.max)).catch(()=>{})}catch(e){}}
function showLB(){if(!ysdk)return modal('<p>'+t('Лидерборд доступен в Яндекс Играх.','The leaderboard is available on Yandex Games.')+'</p>'+okB());
 ysdk.getLeaderboards().then(l=>l.getLeaderboardEntries('floors',{quantityTop:10})).then(r=>modal('<h3>'+t('Топ-10','Top 10')+'</h3>'+r.entries.map(e=>`<p>${e.rank}. ${e.player.publicName||t('Игрок','Player')} — ${e.score}</p>`).join('')+'<button onclick="closeM()">'+t('Закрыть','Close')+'</button>')).catch(()=>{})}
function save(f){S.last=NOW();const j=JSON.stringify(S);storeSet(j);if(player&&(f||NOW()-ysT>10000)){ysT=NOW();player.setData({s:j}).catch(()=>{})}}
async function load(){let d=null;try{if(player){const r=await player.getData();if(r.s)d=r.s}}catch(e){}
 if(!d)d=storeGet();
 if(d)try{S=Object.assign(S0(),JSON.parse(d))}catch(e){}if(S.tot<S.souls)S.tot=S.souls;S.g=GODS.map((_,i)=>S.g[i]|0);S.w=WEAPONS.map((_,i)=>S.w[i]|0);S.t=TN.map((_,i)=>S.t[i]|0);}
function offline(){const sec=Math.min(8*3600+1800*S.t[7],(NOW()-S.last)/1e3),g=dps()*sec*.05;
 if(sec>60&&g>0)modal(`<h3>${t('Пока вас не было','While you were away')}</h3><p>${t('Вы заработали','You earned')} 💰${fmt(g)}</p><button id="o1">${t('Забрать','Collect')}</button>${adsOff()?'':`<button id="o2">📺 ${t('Удвоить x2','Double x2')}</button>`}`),
  $('o1').onclick=()=>{S.gold+=g;closeM();tabRender()},$('o2')&&($('o2').onclick=()=>rewarded(()=>{S.gold+=g*2;closeM();tabRender()}))}
function hermesAd(){if(NOW()<S.hermes)return;rewarded(()=>{S.hermes=NOW()+6e5;draw();if(tab=='rew')tabRender()})}
$('bHermes').onclick=hermesAd;
function chestAd(){if(NOW()<S.chest)return modal('<p>'+t('Сундук откроется через ','The chest opens in ')+Math.ceil((S.chest-NOW())/6e4)+t(' мин.',' min.')+'</p>'+okB());
 rewarded(()=>{const g=mHP(S.floor)*5;S.gold+=g;S.chest=NOW()+4*3600*1e3;modal(`<p>${t('Сундук Харона',"Charon's Chest")}: 💰${fmt(g)}</p>${okB()}`);draw();if(tab=='rew')tabRender()})}
$('bChest').onclick=chestAd;
$('bRetry').onclick=()=>{S.farm=false;S.floor++;spawn()};
$('bSave').onclick=()=>rewarded(()=>{S.floor++;S.farm=false;spawn();bossT+=15});
$('snd').onclick=()=>{sound=!sound;$('snd').dataset.on=sound?'1':'0';audUnlock();audVol()};
// ======== КОНСОЛЬ РАЗРАБОТЧИКА ========
// Для релиза на Яндекс Играх поставьте DEV_ALLOWED=false — консоль будет полностью отключена.
const DEV_ALLOWED=true;
let TS=1;const dh=[];let di=0;
function devOK(){if(!DEV_ALLOWED)return false;try{return(typeof location!='undefined'&&(/[?&]dev=1/.test(location.search)||['localhost','127.0.0.1',''].includes(location.hostname)))||localStorage.getItem('devConsole')==='1'}catch(e){return false}}
const DQ=[['+1e6 💰','gold 1e6'],['+1e12 💰','gold 1e12'],['+100 🔮','souls 100'],['КД = 0','cd'],['След. босс','boss'],['Убить ×5','kill 5'],['Гермес 10м','hermes 10'],['Состояние','state'],['Помощь','help']];
const dnum=x=>{const v=Number(x);return x===undefined||x===''||isNaN(v)?null:v};
function devLog(t){const o=$('devout');o.textContent=(o.textContent+t+'\n').slice(-4000);o.scrollTop=o.scrollHeight}
function devToggle(){if(!devOK())return;const d=$('dev');d.hidden=!d.hidden;if(!d.hidden){if(!$('devout').textContent)devLog('Консоль разработчика. help — список команд.\n⚠ Команды помечают сохранение: рекорды в лидерборд не отправляются.');const i=$('devin');if(i.focus)i.focus()}}
function devRun(l){l=(l||'').trim();if(!l)return;dh.push(l);di=dh.length;devLog('> '+l+'\n'+devExec(l));$('devin').value=''}
function devInit(){const q=$('devq');DQ.forEach(([l,c])=>{const b=document.createElement('button');b.textContent=l;b.onclick=()=>devRun(c);q.appendChild(b)});
 $('devrun').onclick=()=>devRun($('devin').value);$('devx').onclick=devToggle;
 $('devin').addEventListener('keydown',e=>{if(e.key=='Enter')devRun($('devin').value);else if(e.key=='ArrowUp'){di=Math.max(0,di-1);$('devin').value=dh[di]||''}else if(e.key=='ArrowDown'){di=Math.min(dh.length,di+1);$('devin').value=dh[di]||''}else if(e.key=='`'||e.key=='Escape'){e.preventDefault();devToggle()}});
 document.addEventListener('keydown',e=>{if((e.key=='`'||e.key=='~'||e.key=='F2')&&e.target!==$('devin')){e.preventDefault();devToggle()}});
 let n=0,t0=0;$('act').addEventListener('click',()=>{const t=NOW();n=t-t0<1500?n+1:1;t0=t;if(n>=5){n=0;devToggle()}})}
const DC={
help:()=>'gold <n> | setgold <n> | souls <n> | floor <n> | max <n>\nlvl <w|g> <№|all> <ур> | talent <№|all> <ур> | item <слот 0-5|r> <редкость 0-7> [шт]\ncd | hermes <мин> | kill [n] | boss | prestige | quests | day <1-7> | build | offline <ч>\nspeed <x> | get <поле> | set <поле> <json> | state | save | reset yes',
gold:n=>{n=dnum(n);if(n===null)return'нужно число';S.gold=Math.max(0,S.gold+n);draw();return'золото: '+fmt(S.gold)},
setgold:n=>{n=dnum(n);if(n===null)return'нужно число';S.gold=Math.max(0,n);draw();return'золото: '+fmt(S.gold)},
souls:n=>{n=dnum(n);if(n===null)return'нужно число';S.souls=Math.max(0,S.souls+n);if(n>0)S.tot+=n;upd();return'души: '+S.souls},
floor:n=>{n=dnum(n);if(n===null)return'нужно число';n=Math.min(10000,Math.max(1,Math.floor(n)));S.floor=n;S.mk=0;S.farm=false;spawn();tabRender();return'этаж '+n},
max:n=>{n=dnum(n);if(n===null)return'нужно число';S.max=Math.max(1,Math.floor(n));return'рекорд '+S.max},
lvl:(k,i,n)=>{n=dnum(n);const A=k=='w'?S.w:k=='g'?S.g:null;if(!A||n===null||n<0)return'lvl <w|g> <№|all> <ур>';n=Math.floor(n);if(i=='all')A.fill(n);else{const j=dnum(i);if(j===null||!(j in A))return'нет такого номера (0–'+(A.length-1)+')';A[j]=n}upd();return'готово'},
talent:(i,n)=>{n=dnum(n);if(n===null||n<0)return'talent <№|all> <ур>';n=Math.floor(n);const st=j=>{S.t[j]=Math.min(n,TM[j])};if(i=='all')S.t.forEach((_,j)=>st(j));else{const j=dnum(i);if(j===null||!(j in S.t))return'нет такого дара (0–'+(S.t.length-1)+')';st(j)}upd();return'готово'},
item:(sl,ra,c)=>{const s=sl=='r'?-1:dnum(sl),r=dnum(ra),k=c===undefined?1:dnum(c);if((s!==-1&&(s===null||s<0||s>5))||r===null||r<0||r>7||k===null||k<1)return'item <слот 0-5|r> <редкость 0-7> [шт]';const m=Math.min(200,Math.floor(k));for(let i=0;i<m;i++)S.inv.push({s:s===-1?Math.floor(Math.random()*6):Math.floor(s),r:Math.floor(r)});upd();return'добавлено: '+m+' × '+RN[Math.floor(r)]},
cd:()=>{S.sc=[0,0,0,0];S.se=[0,0,0,0];S.chest=0;S.ac=[0,0,0,0];S.pt=0;upd();return'перезарядки сброшены'},
hermes:m=>{m=dnum(m);S.hermes=NOW()+(m===null?10:m)*6e4;draw();return'буст Гермеса активен'},
kill:n=>{n=n===undefined?1:dnum(n);if(n===null||n<1)return'kill [n]';n=Math.min(500,Math.floor(n));for(let i=0;i<n;i++)dealt(hp+1,false,0,0);return'убито: '+n},
boss:()=>{S.floor=Math.min(10000,(Math.floor(S.floor/10)+1)*10);S.mk=0;S.farm=false;spawn();tabRender();return'босс-этаж '+S.floor},
prestige:()=>{if(soulGain()<1)return'мало душ (лучший этаж забега '+S.run+'); используйте floor <n>';S.pt=0;prestige();return'перерождение'},
quests:()=>{qn();S.q.p.forEach(qi=>{S.q[QD[qi][1]]=Math.max(S.q[QD[qi][1]],QD[qi][2])});tabRender();return'задания выполнены, заберите награды'},
day:n=>{n=dnum(n);if(n===null||n<1||n>7)return'day <1-7>';S.dl=new Date(NOW()-864e5).toDateString();S.day=Math.floor(n)-1;tabRender();return'следующий вход: день '+n},
build:()=>{S.b.forEach(b=>{if(b[1])b[1]=1});hTick();return'стройки завершены'},
offline:h=>{h=h===undefined?1:dnum(h);if(h===null||h<=0)return'offline <часов>';S.last=NOW()-h*36e5;offline();return'офлайн: '+h+' ч'},
speed:x=>{x=dnum(x);if(x===null)return'speed <x> (сейчас ×'+TS+')';TS=Math.min(100,Math.max(.1,x));return'скорость ×'+TS},
get:p=>p===undefined||!(p in S)?'поля: '+Object.keys(S).join(' '):p+' = '+JSON.stringify(S[p]).slice(0,400),
set:(p,...v)=>{if(!(p in S))return'нет поля '+p;S[p]=JSON.parse(v.join(' '));upd();return p+' = '+JSON.stringify(S[p]).slice(0,200)},
state:()=>`этаж ${S.floor} (${S.mk}/5) · рекорд ${S.max} · забег ${S.run}\nзолото ${fmt(S.gold)} · души ${S.souls}/${S.tot}\nурон клика ${fmt(clickD())} · DPS ${fmt(dps())} · предметы ×${gearM().toFixed(2)} · души ×${soulM().toFixed(2)}\nскорость ×${TS} · читы: ${S.cheat?'да (лидерборд отключён)':'нет'}`,
save:()=>{save(true);return'сохранено'},
reset:y=>{if(y!='yes')return'подтвердите: reset yes';S=S0();TS=1;spawn();upd();return'новая игра'}};
const DR=['help','state','get','save','reset'];
function devExec(line){if(!devOK())return'консоль отключена';const[c,...a]=line.trim().split(/\s+/),f=DC[c];if(!f)return'неизвестная команда: '+c+' (help)';
 try{const r=f(...a);if(!DR.includes(c))S.cheat=true;return r}catch(e){return'ошибка: '+e.message}}
async function init(){devInit();uiInit();$('list').addEventListener('pointerdown',()=>{lpDown=true;lpT=NOW()});['pointerup','pointercancel'].forEach(e=>document.addEventListener(e,()=>{lpDown=false;lpT=NOW()}));document.addEventListener('visibilitychange',()=>{if(document.hidden){audVis(true);save(true);lbFlush(true);if(PF.kind!='cg')gp(false)}else{audVis(false);if(PF.kind!='cg')gp(!paused);offline()}});await pfInit();try{document.body.classList.add('pf-'+PF.kind)}catch(e){}
 await load();setTexts(S.lang||pfLang());if(S.max>30&&!S.tut)S.tut=9;achCheck(true);applyCos();skBuild();spawn();tabRender();offline();
 if(ysdk&&ysdk.features&&ysdk.features.LoadingAPI)ysdk.features.LoadingAPI.ready();if(PF.kind=='cg')try{PF.sdk.game.loadingStop()}catch(e){}gp(true);
 setInterval(save,15000);setInterval(musTick,400);setInterval(audVol,1000);requestAnimationFrame(loop)}

let SL,RN;const NEED=[3,4,5,6,7,8,9];
let BN;
let TN;
let QD;
let AC;
function adUI(){const n=NOW(),h=S.hermes-n,c=S.chest-n,B=$('bHermes'),C=$('bChest'),
 th=h>0?t('Гермес +100% · ','Hermes +100% · ')+hms(h):t('Буст Гермеса +100% · 10 мин','Hermes Boost +100% · 10 min'),tc=c>0?t('Сундук Харона · ','Charon\'s Chest · ')+hms(c):t('Сундук Харона',"Charon's Chest");
 if(B.textContent!==th){B.textContent=th;B.disabled=h>0;B.classList.toggle('act',h>0);B.style.setProperty&&B.style.setProperty('--w',Math.min(100,h/6e3)+'%')}
 if(C.textContent!==tc){C.textContent=tc;C.disabled=c>0}}
// Ограничитель кликов (без проверок «я не бот»), настройки:
const CLICK_GAP=100,   // мин. интервал между засчитанными кликами, мс (макс. 10 кликов/с)
 CLICK_WIN=1e4,CLICK_MAX=60, // не более 60 кликов за любые 10 с (в среднем 6/с)
 METRO_CV=.06,METRO_MULT=.25, // слишком ровный ритм (разброс < 6%): урон такого клика ×0.25
 ck={last:0,iv:[],ts:[],m:1};
function clickOK(e){ // 0 — клик не засчитан, .25 — засчитан со штрафом, 1 — полноценный
 if(!e.isTrusted||(e.pointerType=='mouse'&&e.button>0))return 0;
 const t=e.timeStamp||performance.now();
 if(t-ck.last<CLICK_GAP)return 0;
 ck.ts=ck.ts.filter(x=>t-x<CLICK_WIN);
 if(ck.ts.length>=CLICK_MAX)return 0;
 if(t-ck.last>2000)ck.iv=[];else ck.iv.push(t-ck.last);
 if(ck.iv.length>24)ck.iv.shift();
 ck.last=t;ck.ts.push(t);
 let m=1;
 if(ck.iv.length>=24){const a=ck.iv.reduce((x,y)=>x+y,0)/24,sd=Math.sqrt(ck.iv.reduce((x,y)=>x+(y-a)*(y-a),0)/24);if(a<500&&sd/a<METRO_CV)m=METRO_MULT}
 return ck.m=m}
let zt=0;const SKL=10;
let SK;
let PS;
function pt(i){const l=S.g[i];return l>=50?2:l>=10?1:0}
function sa(i){return S.se[i]>NOW()}
function pw(i){return 1+.15*skLv(i)}
function psH(i){if(!PS[i])return '';const tp=pt(i);return `<small class="ps${tp?' on':''}">${t('Пассив','Passive')} «${PS[i][0]}»: ${PS[i][1]} ${t('(откр. с ур.10, усиление с ур.50)','(unlocks at lv.10, stronger at lv.50)')}${tp?t(' · сейчас ×',' · now ×')+tp:''}</small>`}
function skInfo(i){const a=SK[i],ok=S.w[a[2]]>=SKL;return `<small>${ok?'✅':'🔒'} Актив «${a[0]}»: ${a[5]} (КД ${a[3]} с${a[4]?', длит. '+a[4]+' с':''}${ok?'':', откр. с ур.'+SKL})`+(ok?')':'')+'</small>'}
function skBuild(){const b=$('skills');SK.forEach((a,i)=>{const e=document.createElement('button');e.onclick=()=>useSk(i);b.appendChild(e)})}
// панель умений: иконка, короткое имя, клавиша 1–4; перезарядка — затемнение по кругу с таймером; data-st: rdy/on/cd/na/lock
function skUI(){const n=NOW(),B=$('skills').children;SK.forEach((a,i)=>{const e=B[i];if(!e)return;const lock=skLv(i)<1,cd=S.sc[i]-n,on=S.se[i]>n,na=i==2&&!inBoss,
 st=lock?'lock':on?'on':cd>0?'cd':na?'na':'rdy',full=a[3]*1e3,
 nm=lock?t('эт. ','fl. ')+SKU[i]:on?Math.ceil((S.se[i]-n)/1e3)+t(' с',' s'):a[6],
 ov=st=='cd'?'<span class="sk-c" style="--p:'+Math.round(Math.min(1,cd/full)*100)+'%">'+hms(cd)+'</span>':'',
 h=ico(lock?'lock':SKI[i])+'<span class="sk-n">'+nm+'</span><span class="sk-k">'+(i+1)+'</span>'+ov,
 tl=a[0]+' — '+a[5]+(lock?t(' · откроется на этаже ',' · unlocks at floor ')+SKU[i]:na&&!on&&cd<=0?t(' · только в бою с боссом',' · boss fights only'):'');
 if(e._h!==h){e._h=h;e.innerHTML=h}if(e.title!==tl){e.title=tl;e.ariaLabel=tl}e.dataset.st=st;e.disabled=lock||cd>0||na})}
function useSk(i){const a=SK[i],n=NOW();if(skLv(i)<1||S.sc[i]>n||(i==2&&!inBoss)||(i==0&&wait>0))return;
 S.sc[i]=n+a[3]*1e3*Math.max(.5,1-.03*S.t[6])*(1-.01*Math.min(30,S.sl[i]));S.se[i]=n+a[4]*1e3*(1+.1*S.t[5])*(1+.02*S.sl[i]);
 if(i==0)dealt(clickD()*20*pw(0)*(1+.1*S.t[5]),true,150,110);
 if(i==2)bossT+=10*(1+.1*S.t[5]);
 qp('s');sfx('skill');draw();save()}
let ysT=0,svT=0,lpDown=false,lpT=0,dirty=false;
function sv(){const n=NOW();if(n-svT>3000){svT=n;save()}}
function busy(){return(lpDown&&NOW()-lpT<3000)||NOW()-lpT<400}
const MAXK=25;let paused=false,lbT=0,lbP=false,sfT=0,AUD=null;
function gp(on){try{if(PF.kind=='cg'){on?PF.sdk.game.gameplayStart():PF.sdk.game.gameplayStop();return}ysdk&&ysdk.features&&ysdk.features.GameplayAPI&&ysdk.features.GameplayAPI[on?'start':'stop']()}catch(e){}}
function pause(b){paused=b;gp(!b);audVol()}
function syncTime(){if(ysdk&&ysdk.serverTime)tOff=ysdk.serverTime()-Date.now()}
function lbFlush(f){if(lbP&&(f||NOW()-lbT>=20000)){lbP=false;const c=S.cheat;if(!c){lbT=0;submitScore()}}}
const SKU=[10,50,120,300],SKB=[3,5,8,12],SKMAX=50;
let SHOP;
let COS;
const THB=['radial-gradient(circle at 50% 25%,#3a0d14,#0b0507 70%)','radial-gradient(circle at 50% 25%,#2a2a14,#0b0a05 70%)','radial-gradient(circle at 50% 25%,#0d3a2a,#050b08 70%)','radial-gradient(circle at 50% 25%,#14263a,#05080b 70%)','radial-gradient(circle at 50% 25%,#2a0d3a,#07050b 70%)'];
const PACKS=[['100 🍯',100,'nectar_100'],['350 🍯',350,'nectar_350'],['800 🍯',800,'nectar_800']];
let fnx=0;
const skLv=i=>S.max>=SKU[i]?1+S.sl[i]:0,skCost=i=>Math.ceil(SKB[i]*Math.pow(1.55,S.sl[i]));
function skH(){return SK.map((a,i)=>{const lv=skLv(i),ok=lv>0,c=skCost(i),mx=S.sl[i]>=SKMAX;return `<div class="row up${ok?'':' dim'}"><div class="ut">${ico(ok?SKI[i]:'lock')}</div><div class="ub"><div class="un"><b>${a[0]}</b><span class="lv">${t('ур.','lv.')} ${lv}</span></div><small>${a[5]}${ok?'':t(' · откроется на этаже ',' · unlocks at floor ')+SKU[i]}</small><small>${t('КД','CD')} ${a[3]} ${t('с','s')}${a[4]?t(' · длит. ',' · dur. ')+a[4]+t(' с',' s'):''} · ${t('сила','power')} ×${(1+.15*lv).toFixed(2)}</small></div><button ${!ok||mx||S.souls<c?'disabled':''} onclick="buySk(${i})">${mx?t('МАКС','MAX'):'<i class="soul"></i> '+c}</button></div>`}).join('')}
function buySk(i){if(skLv(i)<1||S.sl[i]>=SKMAX||S.souls<skCost(i))return;S.souls-=skCost(i);S.sl[i]++;upd()}
function toast(t){const e=$('toast');e.textContent=t;e.style.animation='none';void e.offsetWidth;e.style.animation=''}
function fairySpawn(){const f=$('fairy');f.style.top=(15+Math.random()*55)+'%';f.hidden=false;f.style.animation='none';void f.offsetWidth;f.style.animation='';fnx=NOW()+(45+Math.random()*45)*1e3}
function fairyTap(){const f=$('fairy');if(f.hidden)return;f.hidden=true;const r=Math.random();let tt;
 if(r<.6){const v=Math.max(100,dps()*12);S.gold+=v;tt='💰'+fmt(v)}else if(r<.85){S.nec++;tt='+1 🍯'}else{S.hermes=Math.max(S.hermes,NOW())+12e4;tt=t('⚡ Гермес 2 мин','⚡ Hermes 2 min')}
 sfx('fairy');toast('🧚 '+tt);draw();sv()}
function applyCos(){const h=$('hero');if(S.skin==0){h.textContent='';h.className='img'}else{h.textContent=COS[0][S.skin][0];h.className=''}$('app').style.background=THB[S.theme]}
function shopH(){let h=`<div class="row"><div><b>🍯 ${t('Нектар','Nectar')}: ${S.nec}</b><small>${t('Каждое видео +1, каждое задание дня +1 (все 8 — ещё +5), 7-й день входа +10, феи','+1 per video, +1 per daily quest (+5 more for all 8), +10 on login day 7, fairies')}</small></div></div>`;
 SHOP.forEach((a,i)=>{h+=`<div class="row"><div>${a[0]}</div><button ${S.nec>=a[2]?'':'disabled'} onclick="buyShop(${i})">🍯${a[2]}</button></div>`});
 [[t('Облик героя','Hero look'),0],[t('Тема арены','Arena theme'),1]].forEach(([nm,k])=>{h+=`<div class="row"><div><b>${nm}</b></div></div>`;COS[k].forEach((c,i)=>{const own=S.own[k].includes(i),cur=(k?S.theme:S.skin)==i;h+=`<div class="row"><div>${c[0]}${cur?' ✔':''}</div><button ${!own&&S.nec<c[1]?'disabled':''} onclick="buyCos(${k},${i})">${own?(cur?t('Надето','Equipped'):t('Надеть','Equip')):'🍯'+c[1]}</button></div>`})});
 if(PF.kind!='cg'){h+='<div class="row"><div><b>'+t('Пополнить Нектар','Get Nectar')+'</b><small>'+t('Покупка за реальные деньги через Яндекс Игры','Real-money purchase via Yandex Games')+'</small></div></div>';
 PACKS.forEach((p,i)=>{h+=`<div class="row"><div>${p[0]}</div><button onclick="buyPack(${i})">${t('Купить','Buy')}</button></div>`})}return h}
function buyShop(i){const a=SHOP[i];if(S.nec<a[2])return;
 if(a[1]=='chest'){const k=a[3];if(S.ac[k]>NOW())return;S.nec-=a[2];S.ac[k]=NOW()+AC[k][2];qp('o');const tx=acGive(k);modal(`<h3>${AC[k][0]}</h3><p>${tx}</p>${okB()}`)}
 else if(a[1]=='pcd'){if(pcd()<=0)return;S.nec-=a[2];S.pt=0}
 else if(a[1]=='build'){if(!S.b.some(b=>b[1]))return;S.nec-=a[2];S.b.forEach(b=>{if(b[1])b[1]=1});hTick()}
 else if(a[1]=='quests'){S.nec-=a[2];S.q=null;qn()}
 else if(a[1]=='gf'){S.nec-=a[2];S.gf=Math.max(S.gf,NOW())+36e5}
 else if(a[1]=='hermes'){S.nec-=a[2];S.hermes=Math.max(S.hermes,NOW())+36e5}
 upd()}
function buyCos(k,i){const c=COS[k][i][1];if(!S.own[k].includes(i)){if(S.nec<c)return;S.nec-=c;S.own[k].push(i)}if(k==0)S.skin=i;else S.theme=i;applyCos();upd()}
function buyPack(i){const p=PACKS[i];if(!ysdk||!ysdk.getPayments){modal('<p>'+t('Покупки доступны только в Яндекс Играх.','Purchases are available only on Yandex Games.')+'</p>'+okB());return}
 ysdk.getPayments({signed:false}).then(pay=>pay.purchase({id:p[2]}).then(pu=>{S.nec+=p[1];upd();try{pay.consumePurchase(pu.purchaseToken)}catch(e){}})).catch(()=>{})}
const SPAWN_DELAY=.2,QN=8;let wait=0,hk=0,mxi=3,kfxT=0;
// смена монстра: короткая вспышка, но не чаще раза в 0,3 с — при быстрых убийствах монстр просто остаётся видимым
function killFx(boss){const n=performance.now();if(n-kfxT<300&&!boss)return;kfxT=n;const m=$('monster');m.classList.remove('pop');void m.offsetWidth;m.classList.add('pop');const c=monC();burst(c[0],c[1],boss?26:12,boss?['#ffd96b','#ff7a2a','#fff1c4']:['#ff7a2a','#3a2a2a','#ffb35a'],boss?150:90)}
function heroAtk(){const h=$('hero');h.classList.add('atk');setTimeout(()=>h.classList.remove('atk'),110)}
function lootUI(){const c=$('chest'),n=S.loot.length;c.hidden=!n;if(n&&$('chestn').textContent!==String(n))$('chestn').textContent=String(n)}
function claimLoot(){if(!S.loot.length)return;sfx('reward');const m={};S.loot.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});S.inv.push(...S.loot);S.loot=[];
 modal(`<h3>${t('Добыча с боссов','Boss loot')}</h3><p>${Object.keys(m).sort((a,b)=>b.split('_')[1]-a.split('_')[1]).map(k=>{const[s,r]=k.split('_').map(Number);return itm(s,r,1)+' '+SL[s]+' · '+RN[r]+' (+'+pct(RB[r])+'%)'+(m[k]>1?' ×'+m[k]:'')}).join('<br>')}</p>${okB()}`);upd()}
function setVol(i,v){S.vol[i]=Math.min(1,Math.max(0,v/100));audVol();save()}
function openCfg(){modal(`<h3>⚙️ ${t('Настройки','Settings')}</h3><p>${t('Эффекты','Effects')}<br><input type="range" min="0" max="100" value="${Math.round(S.vol[0]*100)}" oninput="setVol(0,this.value)"></p><p>${t('Музыка','Music')}<br><input type="range" min="0" max="100" value="${Math.round(S.vol[1]*100)}" oninput="setVol(1,this.value)"></p><p>${t('Язык','Language')}<br><button onclick="setLang('ru')">RU</button><button onclick="setLang('en')">EN</button></p>${okB()}`)}
function uiInit(){['pointerdown','keydown'].forEach(ev=>document.addEventListener(ev,audUnlock,{passive:true}));$('tipx').addEventListener('pointerdown',e=>{e.stopPropagation();tipOff()});$('tip').addEventListener('pointerdown',e=>e.stopPropagation());$('monster').addEventListener('animationend',e=>{if(e.animationName=='pop')$('monster').classList.remove('pop')});$('chest').addEventListener('pointerdown',e=>{e.stopPropagation();claimLoot()});$('cfg').onclick=openCfg;$('fairy').addEventListener('pointerdown',e=>{e.stopPropagation();fairyTap()});$('fairy').addEventListener('animationend',()=>{$('fairy').hidden=true});fnx=NOW()+30e3;applyCos();
 // клавиши 1–4 — умения; тап вне раскрытого меню «Ещё» закрывает его
 document.addEventListener('keydown',e=>{const tg=e.target||{};if(tg.tagName=='INPUT'||e.repeat||!$('modal').hidden)return;const k=['1','2','3','4'].indexOf(e.key);if(k>=0)useSk(k)});
 document.addEventListener('pointerdown',e=>{const nv=$('nav');if(nv.classList.contains&&nv.classList.contains('open')&&nv.contains&&!nv.contains(e.target))nv.classList.remove('open')})}
let BQ=1;const RR=1.13;
function plan(b,l){const base=b*Math.pow(RR,l),tot=n=>base*(Math.pow(RR,n)-1)/(RR-1);let n=BQ;
 if(n=='max'){n=Math.min(2000,Math.max(1,Math.floor(Math.log(1+S.gold*(RR-1)/base)/Math.log(RR))));while(n>1&&tot(n)>S.gold)n--}
 return [n,tot(n)]}
function setQ(q){BQ=q=='max'?'max':+q;tabRender()}
const qsH=()=>'<div class="qs"><span>'+t('Покупать','Buy')+'</span>'+[1,5,25,100,'max'].map(q=>`<button class="${BQ==q?'on':''}" onclick="setQ('${q}')">${q=='max'?t('Макс','Max'):'×'+q}</button>`).join('')+'</div>';
const upd=()=>{tabRender();draw();save()};
const pcd=()=>Math.max(0,S.pt+3e5-NOW()),hms=r=>{const q=Math.ceil(r/1e3),h=Math.floor(q/3600);return (h?h+':':'')+String(Math.floor(q%3600/60)).padStart(h?2:1,'0')+':'+String(q%60).padStart(2,'0')},cdTxt=r=>{const q=Math.ceil(r/1e3);return Math.floor(q/60)+':'+String(q%60).padStart(2,'0')};
function drop(mr=0,loot=false){const cap=S.floor<200?1:S.floor<600?2:S.floor<1500?3:S.floor<4000?4:S.floor<7000?5:6,p=.2+Math.min(.25,S.floor/2e4);let r=0;while(r<cap&&Math.random()<p)r++;const it={s:Math.floor(Math.random()*6),r:Math.max(r,mr)};(loot?S.loot:S.inv).push(it);if(S.loot.length>300)S.inv.push(S.loot.shift());qp('i');return it}
function mergeH(){const m={};S.inv.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});const can=Object.keys(m).some(k=>{const r=+k.split('_')[1];return r<7&&m[k]>=NEED[r]});
 const lad='<div class="lad">'+RN.map((n,r)=>`<i class="gem r${r}" title="${n}"></i>`+(r<7?`<span>${NEED[r]}</span>`:'')).join('')+'</div>';
 return `<div class="row mrg"><div><b>${t('Объединить все','Merge all')}</b><small>${t('Одинаковые вещи сливаются в одну следующей редкости (надетые не трогаем)','Identical items merge into one of the next rarity (equipped items stay)')}</small>${lad}</div><button ${can?'':'disabled'} onclick="craftAll()">${t('Объединить','Merge')}</button></div>`}
function craftAll(){const cnt=()=>{const m={};S.inv.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});return m},b=cnt();let n=0;
 for(let r=0;r<7;r++)for(let s=0;s<6;s++){const k=Math.floor(S.inv.filter(x=>x.s==s&&x.r==r).length/NEED[r]);if(k){rm(s,r,NEED[r]*k);for(let j=0;j<k;j++)S.inv.push({s,r:r+1});n+=k}}
 if(!n)return;qp('m',n);const a=cnt(),l=Object.keys(a).filter(k=>a[k]>(b[k]||0)).map(k=>{const[s,r]=k.split('_').map(Number);return itm(s,r,1)+' '+SL[s]+' · '+RN[r]+' ×'+(a[k]-(b[k]||0))});
 modal(`<h3>${t('Объединение','Merge')}</h3><p>${t('Синтезов','Merges')}: ${n}</p><p>${t('Получено','Received')}:<br>${l.join('<br>')}</p>${okB()}`);upd()}
function rm(s,r,n){let c=0;S.inv=S.inv.filter(x=>!(x.s==s&&x.r==r&&c++<n))}
function equip(s,r){rm(s,r,1);if(S.eq[s]>=0)S.inv.push({s,r:S.eq[s]});S.eq[s]=r;upd()}
function craft(s,r){if(r>=7||S.inv.filter(x=>x.s==s&&x.r==r).length<NEED[r])return;rm(s,r,NEED[r]);S.inv.push({s,r:r+1});qp('m');upd()}
// ======== ВЕЩИ: иконка по слоту, рамка и свечение по редкости (классы r0…r7 в style.css) ========
const SLI=['helm','armor','sword','amulet','ring','cloak'];
// значок предмета: sm — маленький (в окнах наград), иначе плитка 44 px
const itm=(s,r,sm)=>`<span class="it r${r}${sm?' sm':''}"><svg class="ico" aria-hidden="true"><use href="#i-${SLI[s]}"/></svg></span>`;
function invH(){const m={},have={};S.inv.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});
 let h=`<div class="eqc"><div class="eqh"><b>${t('Надето','Equipped')}</b><span>${t('весь урон ×','all damage ×')}<em>${gearM().toFixed(2)}</em></span></div><div class="eqg">`+
  SL.map((n,i)=>{const r=S.eq[i];return r>=0?`<div class="slot">${itm(i,r)}<b>${n}</b><small class="rt r${r}">${RN[r]}</small><small>+${pct(RB[r])}%</small></div>`:
   `<div class="slot empty"><span class="it none"><svg class="ico" aria-hidden="true"><use href="#i-${SLI[i]}"/></svg></span><b>${n}</b><small>${t('пусто','empty')}</small></div>`}).join('')+'</div></div>'+mergeH();
 const keys=Object.keys(m).sort((a,b)=>{const[x,y]=a.split('_').map(Number),[u,v]=b.split('_').map(Number);return v-y||x-u});let cur=-1;
 keys.forEach(k=>{const[s,r]=k.split('_').map(Number),n=m[k],need=NEED[r],top=r>=7,better=r>S.eq[s];
  if(r!==cur){cur=r;const tot=keys.filter(q=>+q.split('_')[1]===r).reduce((a,q)=>a+m[q],0);
   h+=`<div class="rh r${r}"><i class="gem"></i><b>${RN[r]}</b><span>+${pct(RB[r])}% ${t('за вещь','each')}</span><em>${tot} ${t('шт.','pcs')}</em></div>`}
  h+=`<div class="row itr r${r}">${itm(s,r)}<div class="ub"><div class="un"><b>${SL[s]}</b><span class="rn">${RN[r]}</span><span class="cnt">×${n}</span>${better?`<span class="bt">${t('лучше надетого','upgrade')}</span>`:''}</div>`+
   `<small>+${pct(RB[r])}% ${t('урона','damage')}${top?t(' · высшая редкость',' · top rarity'):` · ${t('синтез','merge')} ${Math.min(n,need)}/${need}`}</small>`+
   (top?'':`<div class="m2"><span><i style="width:${Math.min(100,Math.round(n/need*100))}%"></i></span></div>`)+`</div>`+
   `<div class="ia"><button class="${better?'pri':''}" onclick="equip(${s},${r})">${t('Надеть','Equip')}</button><button ${n<need||top?'disabled':''} onclick="craft(${s},${r})">${top?t('МАКС','MAX'):need+'→1'}</button></div></div>`});
 return h+(S.inv.length?'':'<div class="row"><small>'+t('Предметы выпадают с боссов (каждые 10 этажей).','Items drop from bosses (every 10 floors).')+'</small></div>')}
const hCost=i=>[2e3,1e4,5e4][i]*Math.pow(6,S.b[i][0]),hTime=i=>30*Math.pow(2,S.b[i][0]);
function build(i){const b=S.b[i],c=hCost(i);if(b[1]||S.gold<c)return;S.gold-=c;b[1]=NOW()+hTime(i)*1e3;qp('h');upd()}
function hTick(){const n=NOW();let d=false;tipUI();if(hk%5==0)navBadges();if(hk%10==0)achCheck();if(++hk%4==0&&dps()>0)heroAtk();if($('fairy').hidden&&n>fnx&&!paused)fairySpawn();lbFlush();if(dirty&&!busy()){dirty=false;tabRender()}S.b.forEach(b=>{if(b[1]&&b[1]<=n){b[0]++;b[1]=0;d=true}});
 if(tab=='rew')document.querySelectorAll('[data-ab]').forEach(b=>{const i=+b.dataset.ab,c=S.ac[i]-n,tx=c>0?'⏳ '+hms(c):'📺 '+t('Открыть','Open');if(b.textContent!==tx)b.textContent=tx;b.disabled=c>0||adsOff()});if(tab=='pres'){const r=pcd(),g=soulGain();document.querySelectorAll('[data-pc]').forEach(e=>e.textContent=r>0?t('Кулдаун перерождения: ','Rebirth cooldown: ')+cdTxt(r):'');document.querySelectorAll('[data-pb]').forEach(e=>e.disabled=r>0||g<1)}if(tab!='house')return;if(d)tabRender();else document.querySelectorAll('[data-ft]').forEach(e=>e.textContent=t('Строится: ','Building: ')+Math.max(0,Math.ceil((+e.dataset.ft-n)/1e3))+t(' с',' s'))}
function houseH(){return BN.map((a,i)=>{const b=S.b[i],c=hCost(i);return `<div class="row"><div><b>${a[0]}</b> ${t('ур.','lv.')}${b[0]}<small>${a[1]} ${t('за ур.','per lv.')}</small>${b[1]?`<small data-ft="${b[1]}"></small>`:`<small>${t('Время постройки','Build time')}: ${hTime(i)} ${t('с','s')}</small>`}</div><button ${b[1]?'disabled':`data-b="${c}"`} onclick="build(${i})">💰${fmt(c)}</button></div>`}).join('')}
function qpick(){const a=QD.map((_,i)=>i).sort(()=>Math.random()-.5),r=[],ks={};for(const i of a){if(adsOff()&&QD[i][1]=='a')continue;if(!ks[QD[i][1]]){ks[QD[i][1]]=1;r.push(i)}if(r.length==QN)break}return r}
function qn(){if(!S.q||!S.q.p||S.q.p.length!=QN||NOW()-S.q.t>864e5)S.q={t:NOW(),k:0,c:0,b:0,u:0,s:0,r:0,i:0,a:0,h:0,f:0,x:0,o:0,m:0,bn:0,d:Array(QN).fill(0),p:qpick()}}
function qp(k,n=1){qn();S.q[k]+=n;S.st[k]=(S.st[k]||0)+n}
function qClaim(j){qn();const q=QD[S.q.p[j]];if(S.q.d[j]||S.q[q[1]]<q[2])return;S.q.d[j]=1;sfx('reward');S.gold+=mHP(Math.max(S.max,10))*q[3];S.nec++;if(S.q.d.every(x=>x)&&!S.q.bn){S.q.bn=1;S.nec+=5}upd()}
function acGive(i){sfx('reward');const g=mHP(Math.max(S.max,10)),[gm,ni,mr,so]=[[4,0,0,0],[10,1,0,0],[30,2,1,0],[100,3,2,1]][i];S.gold+=g*gm;const its=[];for(let k=0;k<ni;k++)its.push(drop(mr));let t='💰'+fmt(g*gm);if(so){const x=1+Math.floor(S.max/100);S.souls+=x;S.tot+=x;t+=' · 🔮'+x}return t+its.map(it=>'<br>'+itm(it.s,it.r,1)+' '+SL[it.s]+' · '+RN[it.r]+' (+'+pct(RB[it.r])+'%)').join('')}
function openAc(i){if(S.ac[i]>NOW())return;rewarded(()=>{qp('o');S.ac[i]=NOW()+AC[i][2];const tx=acGive(i);modal(`<h3>${AC[i][0]}</h3><p>${tx}</p>${okB()}`);upd()})}
function rewH(){const n=NOW(),off=adsOff();let h='';
 if(off)h+=`<div class="row"><small>${adOffMsg()}. ${t('Награды можно получить за Нектар ниже.','You can still get rewards for Nectar below.')}</small></div>`;
 if(PF.kind=='cg'){const hh=S.hermes-n,cc=S.chest-n;
  h+=`<div class="row"><div><b>⚡ ${t('Буст Гермеса','Hermes Boost')}</b><small>${t('×2 урона на 10 минут за просмотр видео','×2 damage for 10 minutes for watching a video')}</small></div><button ${hh>0||off?'disabled':''} onclick="hermesAd()">${hh>0?'⏳ '+hms(hh):'📺 '+t('Смотреть','Watch')}</button></div>`;
  h+=`<div class="row"><div><b>🎁 ${t('Сундук Харона',"Charon's Chest")}</b><small>${t('Золото раз в 4 часа за просмотр видео','Gold every 4 hours for watching a video')}</small></div><button ${cc>0||off?'disabled':''} onclick="chestAd()">${cc>0?'⏳ '+hms(cc):'📺 '+t('Смотреть','Watch')}</button></div>`}
 return h+AC.map((a,i)=>{const c=S.ac[i]-n;return `<div class="row"><div><b>${a[0]}</b><small>${a[1]}</small><small>${t('Перезарядка','Cooldown')}: ${hms(a[2])}</small></div><button data-ab="${i}" ${c>0||off?'disabled':''} onclick="openAc(${i})">${c>0?'⏳ '+hms(c):'📺 '+t('Открыть','Open')}</button></div>`}).join('')+shopH()}
const dg=n=>mHP(Math.max(S.max,10))*5*n;
function dayStrip(cur,got){let h='';for(let i=0;i<7;i++)h+=`<div class="${i==cur?'cur':i<got?'got':''}">${t('Д','D')}${i+1}<br>💰${fmt(dg(i+1))}${i==6?'<br>+5🔮 +10🍯':''}</div>`;return h}
function dClaim(){const t=new Date(NOW()).toDateString();if(S.dl==t)return;const y=new Date(NOW()-864e5).toDateString(),n=S.dl==y?S.day:0;
 S.gold+=mHP(Math.max(S.max,10))*5*(n+1);if(n==6){S.souls+=5;S.tot+=5;S.nec+=10}S.day=(n+1)%7;S.dl=t;sfx('reward');upd()}
function questH(){qn();const td=new Date(NOW()).toDateString(),y=new Date(NOW()-864e5).toDateString(),nx=(S.dl==y?S.day:0)+1,ok=S.dl!=td;
 return `<div class="row"><div><b>${t('Ежедневный вход','Daily login')}</b><small>${ok?t('День ','Day ')+nx+t(' из 7 · награда: 💰',' of 7 · reward: 💰')+fmt(dg(nx))+(nx==7?' + 5 🔮 + 10 🍯':''):t('Сегодня получено. Завтра (день ','Claimed today. Tomorrow (day ')+(S.day+1)+'): ≈💰'+fmt(dg(S.day+1))+(S.day==6?' + 5 🔮 + 10 🍯':'')}</small></div><button ${ok?'':'disabled'} onclick="dClaim()">${t('Забрать','Claim')}</button></div><div class="days">${dayStrip(ok?nx-1:-1,ok?nx-1:(S.day||7))}</div>`+
 S.q.p.map((qi,j)=>{const q=QD[qi],v=Math.min(S.q[q[1]],q[2]);return `<div class="row"><div>${q[0]}<small>${v}/${q[2]} · ${t('награда','reward')} 💰${fmt(mHP(Math.max(S.max,10))*q[3])} +1🍯</small></div><button ${S.q.d[j]||v<q[2]?'disabled':''} onclick="qClaim(${j})">${S.q.d[j]?'✔':t('Награда','Reward')}</button></div>`}).join('')+
 `<div class="row"><small>${t('Задания обновятся через ','Quests refresh in ')}${Math.ceil((864e5-(NOW()-S.q.t))/36e5)} ${t('ч.','h')}</small></div>`}
const TB=[3,3,3,5,5,8,8,10],TM=[1e9,1e9,1e9,1e9,25,20,15,16],tc=i=>TB[i]*Math.pow(2,S.t[i]);
function soulG(x){return Math.floor(x/5*(1+x/400))}
function soulGain(){return Math.max(0,soulG(S.run)-soulG(S.sf))}
const START_FRAC=.3;
function startF(){let f=Math.max(1,Math.floor(START_FRAC*S.run));if(isBoss(f))f--;return Math.max(1,f)}
function skipGold(f){let g=0;for(let i=1;i<=f;i++)g+=mHP(i)*.1*(isBoss(i)?3:1);return g*bld(1)*T(1)}
function pct(x){return +(x*100).toFixed(1)}
function buyT(i){if(S.t[i]>=TM[i]||S.souls<tc(i))return;S.souls-=tc(i);S.t[i]++;upd()}
function talH(){return TN.map((a,i)=>{const mx=S.t[i]>=TM[i];return `<div class="row"><div><b>${a[0]}</b> ${t('ур.','lv.')}${S.t[i]}${TM[i]<1e9?'/'+TM[i]:''}<small>${a[1]} · ${t('навсегда','permanent')}</small></div><button ${mx||S.souls<tc(i)?'disabled':''} onclick="buyT(${i})">${mx?t('МАКС','MAX'):'🔮'+fmt(tc(i))}</button></div>`}).join('')}


// ======== ТЕКСТЫ (ru/en). setTexts вызывается до init и после выбора языка ========
function setTexts(l){LANG=l=='en'?'en':'ru';
 ACTS=[[500,t('Тартар','Tartarus'),'👹',t('Тартара','Tartarus')],[2000,t('Асфодель','Asphodel'),'💀',t('Асфоделя','Asphodel')],[4500,t('Элизиум','Elysium'),'🗡️',t('Элизиума','Elysium')],[7000,t('Олимп','Olympus'),'⚡',t('Олимпа','Olympus')],[9000,t('Вход в Хаос','Gates of Chaos'),'🌑',t('Входа в Хаос','the Gates of Chaos')],[10000,t('Сердце Хаоса','Heart of Chaos'),'🌀',t('Сердца Хаоса','the Heart of Chaos')]];
 BOSSES={50:t('Мегера','Megaera'),100:t('Алекто','Alecto'),250:t('Тисифона','Tisiphone'),500:t('Лернейская Гидра','Lernaean Hydra'),750:t('Лавовый Кентавр','Lava Centaur'),1000:t('Тесей','Theseus'),1500:t('Астерий','Asterion'),2000:t('Тесей и Минотавр','Theseus and the Minotaur'),2500:t('Ахилл','Achilles'),3000:t('Патрокл','Patroclus'),4500:t('Владыка Аид','Lord Hades'),5000:t('Прометей','Prometheus'),5500:t('Гера','Hera'),7000:t('Верховный Зевс','Zeus the Almighty'),7500:t('Харон','Charon'),8000:t('Тень Загрея','Shadow of Zagreus'),9000:t('Кронос','Kronos'),9250:t('Уран','Uranus'),9500:t('Гея','Gaia'),9750:t('Аид Титан','Titan Hades'),10000:t('Абсолютный Хаос','Absolute Chaos')};
 WEAPONS=[[t('Меч Стикса','Sword of Styx'),1,15],[t('Копьё Афины','Spear of Athena'),12,180],[t('Щит Хаоса','Shield of Chaos'),90,1500],[t('Лук Икара','Bow of Icarus'),700,14e3],[t('Клинки Деметры','Blades of Demeter'),5e3,1.3e5],[t('Секира Геракла','Axe of Heracles'),4e4,1.2e6],[t('Трезубец Посейдона','Trident of Poseidon'),3e5,1.1e7],[t('Молния Зевса','Thunderbolt of Zeus'),2.5e6,1e8],[t('Коса Хроноса','Scythe of Chronos'),2e7,9e8],[t('Серп Тьмы','Sickle of Darkness'),2e8,8e9],[t('Клинок Всездания','Blade of All-Creation'),2e9,7e10],[t('Нить Мойр','Thread of the Moirai'),2e10,6.3e11],[t('Коса Таната','Scythe of Thanatos'),2e11,5.7e12],[t('Клинок Эреба','Blade of Erebus'),2e12,5.1e13],[t('Жало Тифона','Sting of Typhon'),2e13,4.6e14],[t('Молот Титанов','Hammer of the Titans'),2e14,4.1e15],[t('Око Хаоса','Eye of Chaos'),2e15,3.7e16]];
 GODS=[[t('Зевс','Zeus'),4,30],[t('Посейдон','Poseidon'),40,350],[t('Арес','Ares'),320,3e3],[t('Афродита','Aphrodite'),2600,3e4],[t('Аполлон','Apollo'),2e4,3e5],[t('Гермес','Hermes'),1.8e5,3e6],[t('Деметра','Demeter'),1.6e6,3e7],[t('Афина','Athena'),1.4e7,3e8],[t('Гефест','Hephaestus'),1.2e8,2.5e9],[t('Дионис','Dionysus'),1e9,2e10],[t('Артемида','Artemis'),9e9,1.8e11],[t('Никта','Nyx'),8e10,1.6e12],[t('Геката','Hecate'),7e11,1.4e13],[t('Танат','Thanatos'),6e12,1.2e14],[t('Хипнос','Hypnos'),5.5e13,1.1e15],[t('Мойры','The Moirai'),5e14,1e16],[t('Эреб','Erebus'),4.5e15,9e16],[t('Эфир','Aether'),4e16,8e17]];
 SL=[t('Шлем','Helmet'),t('Доспех','Armor'),t('Оружие','Weapon'),t('Амулет','Amulet'),t('Кольцо','Ring'),t('Плащ','Cloak')];
 RN=[t('Обычный','Common'),t('Редкий','Rare'),t('Эпический','Epic'),t('Легендарный','Legendary'),t('Мифический','Mythic'),t('Божественный','Divine'),t('Титанический','Titanic'),t('Первородный','Primordial')];
 BN=[[t('Кузница Гефеста','Forge of Hephaestus'),t('+10% урона клика','+10% click damage')],[t('Сад Персефоны','Garden of Persephone'),t('+10% золота','+10% gold')],[t('Библиотека Афины','Library of Athena'),t('+10% урона богов','+10% god damage')]];
 TN=[[t('Мощь Зевса','Might of Zeus'),t('+10% урона клика за ур.','+10% click damage per lv.')],[t('Золото Плутоса','Gold of Plutus'),t('+10% золота за ур.','+10% gold per lv.')],[t('Дар богов','Gift of the Gods'),t('+10% урона богов за ур.','+10% god damage per lv.')],[t('Рука Ареса','Hand of Ares'),t('+0,2 к множителю крита (база ×3) за ур.','+0.2 crit multiplier (base ×3) per lv.')],[t('Глаз Аполлона','Eye of Apollo'),t('+1% к шансу крита за ур.','+1% crit chance per lv.')],[t('Мастерство умений','Skill Mastery'),t('+10% к силе и длительности активных умений за ур.','+10% active skill power and duration per lv.')],[t('Эхо Хроноса','Echo of Chronos'),t('−3% к перезарядке умений за ур.','−3% skill cooldown per lv.')],[t('Терпение Аида','Patience of Hades'),t('+30 мин к лимиту офлайн-дохода за ур.','+30 min offline earnings cap per lv.')]];
 QD=[[t('Убить 250 монстров','Kill 250 monsters'),'k',250,3],[t('Убить 1000 монстров','Kill 1000 monsters'),'k',1000,8],[t('Сделать 300 кликов','Make 300 clicks'),'c',300,3],[t('Сделать 1000 кликов','Make 1000 clicks'),'c',1000,8],[t('Победить босса','Defeat a boss'),'b',1,3],[t('Победить 3 боссов','Defeat 3 bosses'),'b',3,9],
 [t('Купить 10 улучшений','Buy 10 upgrades'),'u',10,4],[t('Использовать умения 3 раза','Use skills 3 times'),'s',3,4],[t('Включить Гнев Олимпа','Trigger Olympus Wrath'),'r',1,3],[t('Получить 3 предмета','Get 3 items'),'i',3,5],[t('Посмотреть рекламу 2 раза','Watch 2 videos'),'a',2,6],[t('Начать постройку здания','Start a building'),'h',1,3],[t('Открыть 5 новых этажей','Reach 5 new floors'),'f',5,6],
 [t('Нанести 100 критов','Land 100 crits'),'x',100,3],[t('Нанести 500 критов','Land 500 crits'),'x',500,7],[t('Открыть сундук за рекламу','Open a chest'),'o',1,5],[t('Открыть 3 сундука','Open 3 chests'),'o',3,12],[t('Сделать 3 синтеза предметов','Merge items 3 times'),'m',3,5],[t('Сделать 10 синтезов','Merge items 10 times'),'m',10,12],
 [t('Посмотреть рекламу 5 раз','Watch 5 videos'),'a',5,12],[t('Победить 5 боссов','Defeat 5 bosses'),'b',5,14],[t('Убить 2500 монстров','Kill 2500 monsters'),'k',2500,18],[t('Сделать 3000 кликов','Make 3000 clicks'),'c',3000,18],[t('Купить 50 улучшений','Buy 50 upgrades'),'u',50,10],[t('Использовать умения 10 раз','Use skills 10 times'),'s',10,10],[t('Открыть 20 новых этажей','Reach 20 new floors'),'f',20,14],[t('Получить 10 предметов','Get 10 items'),'i',10,12]];
 AC=[[t('📺 Награда за рекламу','📺 Video reward'),t('золото за просмотр видео','gold for watching a video'),6e5],[t('🪵 Бронзовый сундук','🪵 Bronze chest'),t('золото + 1 предмет','gold + 1 item'),36e5],[t('🥈 Серебряный сундук','🥈 Silver chest'),t('много золота + 2 предмета (не ниже редких)','lots of gold + 2 items (Rare or better)'),108e5],[t('🥇 Золотой сундук','🥇 Gold chest'),t('очень много золота + 3 предмета (не ниже эпических) + души','tons of gold + 3 items (Epic or better) + souls'),288e5]];
 SK=[[t('Удар Стикса','Styx Strike'),'🗡️',0,30,0,t('мгновенный удар в 20× урона клика','instant hit for 20× click damage'),t('Стикс','Styx')],[t('Бросок Афины',"Athena's Throw"),'🔱',1,45,8,t('8 с: +5 автокликов в секунду','8 s: +5 auto-clicks per second'),t('Афина','Athena')],[t('Щит Хаоса','Chaos Shield'),'🛡️',2,60,0,t('+10 с к таймеру босса (только в бою с боссом)','+10 s to the boss timer (boss fights only)'),t('Щит','Shield')],[t('Гнев Икара',"Icarus' Fury"),'🏹',3,60,10,t('10 с: урон клика ×3','10 s: click damage ×3'),t('Икар','Icarus')]];
 PS=[[t('Молния','Lightning'),t('каждые 8 с удар в 10× урона в секунду','every 8 s a strike for 10× damage per second')],[t('Дар приливов','Gift of Tides'),t('+30% золота','+30% gold')],[t('Жажда битвы','Battle Thirst'),t('+25% урона клика','+25% click damage')],[t('Очарование','Charm'),t('монстры слабее на 10%','monsters are 10% weaker')],[t('Золотая стрела','Golden Arrow'),t('+15% к шансу крита','+15% crit chance')],[t('Быстрые ноги','Swift Feet'),t('Гнев Олимпа с 9 кликов вместо 12','Olympus Wrath after 9 clicks instead of 12')],[t('Щедрый урожай','Rich Harvest'),t('+1 предмет с боссов','+1 item from bosses')],[t('Мудрость','Wisdom'),t('+10 с к таймеру босса','+10 s to the boss timer')]];
 SHOP=[[t('🪵 Бронзовый сундук без рекламы','🪵 Bronze chest, no ad'),'chest',4,1],[t('🥈 Серебряный сундук без рекламы','🥈 Silver chest, no ad'),'chest',10,2],[t('🥇 Золотой сундук без рекламы','🥇 Gold chest, no ad'),'chest',25,3],[t('⚡ Сбросить перезарядку перерождения','⚡ Reset the rebirth cooldown'),'pcd',6],[t('🔨 Достроить все здания сейчас','🔨 Finish all buildings now'),'build',3],[t('📜 Новые задания дня','📜 New daily quests'),'quests',5],[t('💰 Золотая лихорадка: ×2 золота, 1 час','💰 Gold Rush: ×2 gold for 1 hour'),'gf',12],[t('🦅 Гермес: ×2 урона, 1 час','🦅 Hermes: ×2 damage for 1 hour'),'hermes',15]];
 COS=[[['🤺',0],['🦸',20],['🧝',30],['🥷',40],['🧙',60],['👑',100]],[[t('Тартар','Tartarus'),0],[t('Асфодель','Asphodel'),25],[t('Элизиум','Elysium'),40],[t('Олимп','Olympus'),60],[t('Хаос','Chaos'),90]]];
 PANH={hero:[t('Герой','Hero'),t('Оружие усиливает клик, умения — бой','Weapons boost your click')],gods:[t('Боги','Gods'),t('Бьют сами, даже без кликов','Attack on their own, no clicks needed')],inv:[t('Вещи','Items'),t('Надетые вещи усиливают весь урон','Equipped items boost all damage')],
  pres:[t('Дары','Gifts'),t('Перерождение и вечные усиления за души','Rebirth and permanent upgrades for souls')],house:[t('Дом','House'),t('Постройки дают вечные бонусы','Buildings give permanent bonuses')],quest:[t('Задания','Quests'),t('Обновляются каждый день','Refresh every day')],
  rew:[t('Награды','Rewards'),t('Сундуки, бусты и лавка Нектара','Chests, boosts and the Nectar shop')],top:[t('Подвиги','Feats'),t('Нектар за достижения','Nectar for achievements')]};
 applyTexts()}
function applyTexts(){try{document.documentElement.lang=LANG;document.title=t('Подземелье Аида: Побег','Underworld Escape')}catch(e){}
 try{document.querySelectorAll('nav button').forEach(b=>{const v=PANH[b.dataset.t],l=b.querySelector('.lb');if(v&&l)l.textContent=v[0]})}catch(e){}
 // подписи в разметке: русский текст в самом элементе, английский — в data-en
 try{document.querySelectorAll('[data-en]').forEach(e=>{if(!e.dataset.ru)e.dataset.ru=e.textContent;e.textContent=t(e.dataset.ru,e.dataset.en)});$('snd').ariaLabel=t('Звук','Sound');$('cfg').ariaLabel=t('Настройки','Settings');$('more').querySelector('.lb').textContent=t('Ещё','More');document.querySelector('.brand').textContent=t('Подземелье Аида','Underworld Escape')}catch(e){}
 $('bRetry').textContent=t('Перейти к битве с боссом','Fight the boss');$('bSave').textContent=t('Босс +15 сек','Boss +15 s');$('dpsu').textContent=t('с','s')}
function setLang(l){S.lang=l;setTexts(l);spawn();tabRender();draw();save(true);openCfg()}

// ======== ЭФФЕКТЫ БОЯ ========
const RM=(()=>{try{return window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}})();
const pts=[];let pti=0;
function monC(){try{const a=$('arena').getBoundingClientRect(),m=$('monster').getBoundingClientRect();if(m.width)return[m.left-a.left+m.width/2,m.top-a.top+m.height*.55]}catch(e){}return[200,150]}
// искры: пул из 48 частиц, разлёт по случайным направлениям
function burst(x,y,n,cols,sp){if(RM||!isFinite(x)||!isFinite(y))return;const fx=$('fx');
 while(pts.length<48){const d=document.createElement('i');d.className='pt';fx.appendChild(d);pts.push(d)}
 for(let k=0;k<n;k++){const e=pts[pti++%pts.length],a=Math.random()*6.283,r=sp*(.45+Math.random()*.7),z=5+Math.random()*6,col=cols[k%cols.length];
  e.style.cssText=`left:${x}px;top:${y}px;width:${z}px;height:${z}px;background:${col};box-shadow:0 0 ${z+4}px ${col};--dx:${Math.cos(a)*r}px;--dy:${Math.sin(a)*r-sp*.3}px`;
  e.classList.remove('go');void e.offsetWidth;e.classList.add('go')}}
function flash(){if(RM)return;const f=$('flash');f.classList.remove('on');void f.offsetWidth;f.classList.add('on')}
function bossIn(name){sfx('bossIn');const b=$('bossban');b.textContent=t('БОСС','BOSS')+' · '+name;b.classList.remove('on');void b.offsetWidth;b.classList.add('on');
 const a=$('arena');a.classList.remove('bossin');void a.offsetWidth;a.classList.add('bossin')}

// ======== ПОДВИГИ (достижения) ========
// [id, ru, en, условие, награда в Нектаре]
const st=k=>S.st[k]||0;
const ACH=[
 ['k1','Первая кровь','First Blood',()=>st('k')>=1,1],['k2','Охотник на тени','Shade Hunter',()=>st('k')>=1000,2],['k3','Жнец Тартара','Reaper of Tartarus',()=>st('k')>=25000,5],['k4','Бич Подземелья','Scourge of the Underworld',()=>st('k')>=250000,10],
 ['b1','Победитель босса','Boss Slayer',()=>st('b')>=1,1],['b2','Гроза боссов','Bane of Bosses',()=>st('b')>=50,3],['b3','Бессмертная слава','Undying Glory',()=>st('b')>=500,10],
 ['f1','Глубже во тьму','Deeper into Darkness',()=>S.max>=100,2],['f2','Гидра повержена','Hydra Slain',()=>S.max>=500,3],['f3','Сквозь Асфодель','Through Asphodel',()=>S.max>=1000,5],['f4','Лабиринт пройден','Labyrinth Conquered',()=>S.max>=2000,5],
 ['f5','Владыка свергнут','The Lord Dethroned',()=>S.max>=4500,8],['f6','Олимп пал','Olympus Has Fallen',()=>S.max>=7000,10],['f7','Побег','The Escape',()=>st('win')>=1,25],
 ['c1','Тысяча ударов','A Thousand Blows',()=>st('c')>=1000,2],['c2','Неутомимый','Tireless',()=>st('c')>=20000,5],['x1','Точный удар','Precision',()=>st('x')>=500,2],
 ['p1','Новый круг','A New Cycle',()=>S.pc>=1,3],['p2','Вечное возвращение','Eternal Return',()=>S.pc>=10,8],
 ['m1','Кузнец судьбы','Smith of Fate',()=>st('m')>=25,3],['i1','Мифическая находка','Mythic Find',()=>S.eq.some(r=>r>=4),5],
 ['g1','Пантеон','Pantheon',()=>S.g.slice(0,8).every(l=>l>=10),5],['s1','Мастер умений','Skill Master',()=>S.sl.reduce((a,b)=>a+b,0)>=20,4],['o1','Хозяин сундуков','Chest Master',()=>st('o')>=20,3]];
const ACHD={k1:['Убить первого монстра','Kill your first monster'],k2:['Убить 1 000 монстров','Kill 1,000 monsters'],k3:['Убить 25 000 монстров','Kill 25,000 monsters'],k4:['Убить 250 000 монстров','Kill 250,000 monsters'],
 b1:['Победить первого босса','Defeat your first boss'],b2:['Победить 50 боссов','Defeat 50 bosses'],b3:['Победить 500 боссов','Defeat 500 bosses'],
 f1:['Пройти этаж 100','Clear floor 100'],f2:['Победить Лернейскую Гидру (этаж 500)','Defeat the Lernaean Hydra (floor 500)'],f3:['Пройти этаж 1000','Clear floor 1000'],f4:['Победить Тесея и Минотавра (этаж 2000)','Defeat Theseus and the Minotaur (floor 2000)'],
 f5:['Победить Владыку Аида (этаж 4500)','Defeat Lord Hades (floor 4500)'],f6:['Победить Верховного Зевса (этаж 7000)','Defeat Zeus the Almighty (floor 7000)'],f7:['Победить Абсолютный Хаос (этаж 10 000)','Defeat Absolute Chaos (floor 10,000)'],
 c1:['Сделать 1 000 кликов','Make 1,000 clicks'],c2:['Сделать 20 000 кликов','Make 20,000 clicks'],x1:['Нанести 500 критов','Land 500 crits'],
 p1:['Переродиться в первый раз','Rebirth for the first time'],p2:['Переродиться 10 раз','Rebirth 10 times'],m1:['Сделать 25 синтезов предметов','Merge items 25 times'],i1:['Надеть мифический предмет','Equip a Mythic item'],
 g1:['Поднять первых 8 богов до ур. 10','Raise the first 8 gods to lv. 10'],s1:['Вложить 20 уровней в умения','Put 20 levels into skills'],o1:['Открыть 20 сундуков','Open 20 chests']};
function achCheck(silent){let nw=0;ACH.forEach(a=>{if(!S.achN[a[0]]&&a[3]()){S.achN[a[0]]=1;nw++;if(!silent)toast('🏆 '+t(a[1],a[2]))}});
 if(nw){achNav();if(tab=='top')dirty=true}}
function achNav(){navBadges()}
const achReady=()=>ACH.filter(a=>S.achN[a[0]]&&!S.ach[a[0]]).length;
function achLbl(){return t('Подвиги','Feats')}
function achClaim(id){const a=ACH.find(x=>x[0]==id);if(!a||!S.achN[id]||S.ach[id])return;S.ach[id]=1;S.nec+=a[4];sfx('reward');toast('🍯 +'+a[4]);achNav();upd()}
function achH(){const done=ACH.filter(a=>S.ach[a[0]]).length;let h=`<div class="row"><div><b>${t('Подвиги','Feats')}: ${done} / ${ACH.length}</b><small>${t('За каждый подвиг — Нектар','Each feat gives Nectar')}</small></div></div>`;
 const ord=a=>S.achN[a[0]]&&!S.ach[a[0]]?0:S.ach[a[0]]?2:1;
 ACH.slice().sort((a,b)=>ord(a)-ord(b)).forEach(a=>{const got=S.achN[a[0]],cl=S.ach[a[0]];
  h+=`<div class="row${cl?' done':''}"><div><b>${got?'🏆':'🔒'} ${t(a[1],a[2])}</b><small>${t(ACHD[a[0]][0],ACHD[a[0]][1])}</small></div><button ${got&&!cl?'':'disabled'} onclick="achClaim('${a[0]}')">${cl?'✔':'🍯'+a[4]}</button></div>`});return h}

// ======== ПОДСКАЗКИ ДЛЯ НОВИЧКА ========
// шаг показывается, пока не выполнено его условие; крестик скрывает все подсказки
const TIPS=[[()=>true,()=>st('c')>=10,'Нажимайте на монстра, чтобы атаковать','Tap the monster to attack'],
 [()=>S.gold>=15,()=>S.w[0]>=2,'Улучшите Меч Стикса во вкладке «Герой»','Upgrade the Sword of Styx in the Hero tab'],
 [()=>S.gold>=30,()=>S.g.some(l=>l>0),'Наймите бога во вкладке «Боги» — он бьёт сам','Hire a god in the Gods tab — gods attack on their own'],
 [()=>S.floor>=8,()=>S.max>=11,'Каждые 10 этажей — босс: победите его за 30 секунд','Every 10 floors a boss appears: beat it within 30 seconds'],
 [()=>soulGain()>=10,()=>S.pc>=1,'Перерождение во вкладке «Дары» даёт души — вечный бонус к урону','Rebirth in the Gifts tab grants souls — a permanent damage bonus']];
function tipUI(){const e=$('tip');while(S.tut<TIPS.length&&TIPS[S.tut][1]())S.tut++;
 const tp=S.tut<TIPS.length&&TIPS[S.tut][0]()?TIPS[S.tut]:null;e.hidden=!tp;if(tp){const tx='💡 '+t(tp[2],tp[3]);if($('tipt').textContent!==tx)$('tipt').textContent=tx}}
function tipOff(){S.tut=99;$('tip').hidden=true;save()}

// ======== ЗВУК: всё синтезируется на лету (Web Audio), без аудиофайлов ========
// Схема: эффекты -> sfxG, музыка -> musG; обе шины + реверберация -> master -> компрессор -> выход
let A=null;
function audInit(){if(AUD&&A)return true;try{AUD=AUD||new(window.AudioContext||window.webkitAudioContext)();const c=AUD;
 A={c,master:c.createGain(),sfx:c.createGain(),mus:c.createGain(),rev:c.createConvolver(),revG:c.createGain(),comp:c.createDynamicsCompressor()};
 A.comp.connect(c.destination);A.master.connect(A.comp);A.sfx.connect(A.master);A.mus.connect(A.master);A.rev.connect(A.revG);A.revG.connect(A.master);A.revG.gain.value=.5;
 // реверберация: стерео-шум с затуханием 2,6 с — «зал» подземелья
 const sr=c.sampleRate||44100,L=Math.floor(sr*2.6),ir=c.createBuffer(2,L,sr);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,2.6)}A.rev.buffer=ir;
 const nb=c.createBuffer(1,sr,sr),nd=nb.getChannelData(0);for(let i=0;i<sr;i++)nd[i]=Math.random()*2-1;A.noise=nb;
 audVol();return true}catch(e){A=null;return false}}
function audVol(){if(!A)return;const on=snd()&&!paused,t=A.c.currentTime||0;
 try{A.master.gain.setTargetAtTime(on?1:0,t,.06);A.sfx.gain.setTargetAtTime(S.vol[0]*.9,t,.05);A.mus.gain.setTargetAtTime(S.vol[1]*.8,t,.3)}catch(e){A.master.gain.value=on?1:0;A.sfx.gain.value=S.vol[0]*.9;A.mus.gain.value=S.vol[1]*.8}}
// первое касание/клавиша разблокирует звук (требование браузеров и iOS)
function audUnlock(){if(!audInit())return;try{if(AUD.state=='suspended'&&!document.hidden)AUD.resume()}catch(e){}}
function audVis(hidden){if(!AUD)return;try{hidden?AUD.suspend():AUD.resume()}catch(e){}}
// тон с огибающей: f — частота, to — к какой частоте скользить, d — длительность, v — громкость, at — сдвиг старта, w — доля в реверберацию
function tone(bus,f,d,v,o={}){const c=A.c,t=(c.currentTime||0)+(o.at||0),os=c.createOscillator(),g=c.createGain();os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+d);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.a||.005));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 let n=g;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;g.connect(fl);n=fl}
 os.connect(g);n.connect(bus);if(o.w){const s2=c.createGain();s2.gain.value=o.w;n.connect(s2);s2.connect(A.rev)}os.start(t);os.stop(t+d+.05)}
function noise(bus,d,v,o={}){const c=A.c,t=(c.currentTime||0)+(o.at||0),src=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();src.buffer=A.noise;
 fl.type=o.bp?'bandpass':'lowpass';fl.frequency.setValueAtTime(o.f||1000,t);if(o.to)fl.frequency.exponentialRampToValueAtTime(o.to,t+d);fl.Q.value=o.q||1;
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+(o.a||.004));g.gain.exponentialRampToValueAtTime(.0001,t+d);
 src.connect(fl);fl.connect(g);g.connect(bus);if(o.w){const s2=c.createGain();s2.gain.value=o.w;g.connect(s2);s2.connect(A.rev)}src.start(t,Math.random()*.5);src.stop(t+d+.05)}
const SFXGAP={click:60,crit:80,kill:110,buy:60,skill:150,reward:250,boss:300,bossIn:500,lose:500,fairy:200},sfxT={};
const rnd=(a,b)=>a+Math.random()*(b-a);
function sfx(k){if(!snd()||paused||S.vol[0]<=0)return;if(!audInit()||AUD.state=='suspended')return;const n=performance.now();if(n-(sfxT[k]||-1e9)<(SFXGAP[k]||100))return;sfxT[k]=n;
 try{const B=A.sfx,p=rnd(.93,1.07);switch(k){
 case'click':noise(B,.06,.16,{bp:1,f:1900*p,to:700,q:1.2});tone(B,150*p,.08,.22,{to:70});break;
 case'crit':noise(B,.08,.2,{bp:1,f:2400,to:900});tone(B,120,.12,.3,{to:55});tone(B,1320*p,.5,.08,{w:.5});tone(B,1987*p,.35,.045,{w:.5});break;
 case'kill':noise(B,.28,.16,{f:1300,to:180});tone(B,230*p,.2,.1,{type:'triangle',to:110});break;
 case'boss':tone(B,82,1.1,.42,{to:38});noise(B,.7,.26,{f:700,to:70});[523,659,784,1047].forEach((f,i)=>tone(B,f,.9,.06,{at:.12+i*.09,w:.7,type:'triangle'}));break;
 case'buy':tone(B,1568*p,.09,.08);tone(B,2093*p,.12,.06,{at:.05});break;
 case'lose':tone(B,196,.8,.14,{type:'triangle',to:98,w:.4});tone(B,147,1,.1,{to:73,w:.4});break;
 case'reward':[784,988,1175,1568].forEach((f,i)=>tone(B,f,.6,.065,{at:i*.07,w:.6,type:'triangle'}));break;
 case'bossIn':tone(B,98,2.6,.22,{w:.6,a:.01});tone(B,98*2.76,1.6,.07,{w:.6});tone(B,98*5.4,1,.035,{w:.6});noise(B,.4,.12,{f:450,to:90});break;
 case'fairy':for(let i=0;i<4;i++)tone(B,rnd(2000,3200),.25,.035,{at:i*.06,w:.7});break;
 case'skill':noise(B,.32,.13,{bp:1,f:400,to:2400,q:.8});tone(B,440,.25,.05,{to:880,w:.3});break}}catch(e){}}

// ---- музыка: эмбиент на 66 уд/мин, тихий гул-аккорд + редкая мелодия «лиры» с паузами ----
// у каждого акта свой лад и тоника: [тоника Гц, ступени лада в полутонах, аккорды по ступеням на такт]
const MODES=[[73.42,[0,1,4,5,7,8,10],[0,1,0,6]],[55,[0,2,3,5,7,8,10],[0,5,3,4]],[73.42,[0,2,3,5,7,9,10],[0,3,0,4]],[98,[0,2,4,5,7,9,10],[0,6,3,0]],[69.3,[0,1,3,5,7,8,10],[0,1,5,0]],[61.74,[0,2,4,6,8,10],[0,2,4,1]]];
// мотивы мелодии: [доля такта, ступень]; -1 — такт тишины
const MOTIFS=[[[0,4],[1.5,2],[2,1],[3,0]],[[0,0],[1,2],[2.5,4],[3.5,5]],[[.5,7],[1.5,6],[2,4]],[[0,2],[2,1]],[[1,4],[1.5,5],[2,4],[3,2]]],MPAT=[0,1,-1,2,0,3,-1,4];
const BEAT=.9,BAR=BEAT*4;const mus={t:0,bar:0};
const dfreq=(m,deg,oct)=>{const sc=m[1],n=sc.length,o=Math.floor(deg/n),i=((deg%n)+n)%n;return m[0]*Math.pow(2,oct+o+sc[i]/12)};
function lyre(f,t,v){const c=A.c,o1=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),fl=c.createBiquadFilter();o1.type='triangle';o2.type='sine';o1.frequency.value=f;o2.frequency.value=f*2.003;
 fl.type='lowpass';fl.frequency.value=2600;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+2.2);
 o1.connect(g);o2.connect(g);g.connect(fl);fl.connect(A.mus);const s2=c.createGain();s2.gain.value=.8;fl.connect(s2);s2.connect(A.rev);o1.start(t);o2.start(t);o1.stop(t+2.3);o2.stop(t+2.3)}
function pad(f,t,d,v){const c=A.c,g=c.createGain(),fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=520;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+1.6);g.gain.setValueAtTime(v,t+d-1.4);g.gain.exponentialRampToValueAtTime(.0001,t+d+.4);
 [[f,'triangle',0],[f*1.004,'sawtooth',-6],[f*1.5,'triangle',4]].forEach(([fr,ty,dt])=>{const o=c.createOscillator();o.type=ty;o.frequency.value=fr;o.detune.value=dt;o.connect(g);o.start(t);o.stop(t+d+.5)});
 g.connect(fl);fl.connect(A.mus);const s2=c.createGain();s2.gain.value=.5;fl.connect(s2);s2.connect(A.rev)}
function heart(t,v){const c=A.c,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(40,t+.25);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(A.mus);o.start(t);o.stop(t+.35)}
function musBar(t){const ai=Math.max(0,ACTS.indexOf(act(S.floor))),m=MODES[ai],b=mus.bar++,deg=m[2][b%m[2].length];
 pad(dfreq(m,deg,1),t,BAR,.05);pad(dfreq(m,deg+2,1),t,BAR,.03);
 const mi=MPAT[b%MPAT.length];if(mi>=0&&b%16<14)MOTIFS[mi].forEach(([bt,d])=>lyre(dfreq(m,d+deg,3),t+bt*BEAT,.09));
 if(inBoss)for(let i=0;i<4;i++){heart(t+i*BEAT,.22);heart(t+i*BEAT+.28,.14)}}
// планировщик: держит запас ~1,5 с вперёд
function musTick(){if(!snd()||paused||S.vol[1]<=0||!AUD||AUD.state=='suspended')return;if(!audInit())return;try{const now=AUD.currentTime||0;if(mus.t<now)mus.t=now+.15;while(mus.t<now+1.5){musBar(mus.t);mus.t+=BAR}}catch(e){}}
// ======== ИНТЕРФЕЙС: иконки, шапка акта, заголовки разделов, меню и значки ========
const ico=n=>'<svg class="ico" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const WICO=['sword','spear','shield','bow','blades','axe','trident','bolt','scythe','sickle','sword','thread','scythe','sword','sting','hammer','eye'],SKI=['sword','spear','shield','bow'],ROM=['I','II','III','IV','V','VI'];
let htab='w',PANH={};
function setHT(x){htab=x;tabRender()}
// заголовок панели раздела: название, подсказка, доп. элементы (переключатель, «Покупать ×N»)
function panH(k,extra){const v=PANH[k]||['',''];return `<div class="ph"><div class="pht"><h2>${v[0]}</h2><span>${v[1]}</span></div>${extra||''}</div>`}
function navGo(x){const nv=$('nav');if(x=='more'){nv.classList.toggle('open');return}nv.classList.remove('open');
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==x||(b.dataset.t=='more'&&['pres','house','rew','top'].includes(x))));tab=x;tabRender();$('list').scrollTop=0}
// прогресс акта в шапке и строка над врагом: точки 5 монстров этажа и «босс через N этажей»
function actUI(f){const a=act(f),ai=ACTS.indexOf(a),st=ai?ACTS[ai-1][0]:0;
 $('actn').textContent=t('Акт ','Act ')+ROM[ai];$('actf').textContent=t('этаж ','floor ')+f+t(' из ',' of ')+a[0];$('actp').style.width=Math.min(100,(f-st)/(a[0]-st)*100)+'%';
 const P=$('pips'),boss=isBoss(f);P.hidden=boss||S.farm;if(!P.hidden&&P.children)[...P.children].forEach((e,j)=>{e.className=j<S.mk?'d':j==S.mk?'c':''});
 const nb=10-f%10;$('nextb').textContent=boss||S.farm?'':nb==1?t('дальше — босс','boss is next'):t('босс через ','boss in ')+nb+t(' эт.',' fl.')}
// значки на разделах: что можно забрать или улучшить прямо сейчас
function navBadges(){qn();let q=0;try{const td=new Date(NOW()).toDateString();if(S.dl!=td)q++;S.q.p.forEach((qi,j)=>{if(!S.q.d[j]&&S.q[QD[qi][1]]>=QD[qi][2])q++})}catch(e){}
 const n=NOW(),B={quest:q,top:achReady(),inv:S.loot.length?'•':'',rew:!adsOff()&&S.ac.some(x=>x<=n)?'•':'',pres:TN.some((_,i)=>S.t[i]<TM[i]&&S.souls>=tc(i))?'•':'',hero:SK.some((a,i)=>skLv(i)>0&&S.sl[i]<SKMAX&&S.souls>=skCost(i))?'•':''};
 B.more=['pres','house','rew','top'].some(k=>B[k])?'•':'';
 try{document.querySelectorAll('nav button').forEach(b=>{const e=b.querySelector('.bd');if(!e)return;const v=B[b.dataset.t]||'',tx=v==='•'?'':v?String(v):'';if(e.textContent!==tx)e.textContent=tx;e.classList.toggle('dot',v==='•')})}catch(e){}}
setTexts('ru');
init();
