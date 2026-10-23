'use strict';
let tOff=0;const NOW=()=>Date.now()+tOff;
const $=id=>document.getElementById(id);
let LANG='ru';const t=(r,e)=>LANG=='ru'?r:e;
// спрайты: обычный монстр акта (по индексу акта) и именные боссы (по этажу); файлы лежат в img/*.webp
const SPR={mob:{0:'act1_mob',1:'act2_mob',2:'act3_mob',3:'act4_mob'},boss:{10:'boss_0010',50:'boss_0050',100:'boss_0100',250:'boss_0250',500:'boss_0500',750:'boss_0750',1500:'boss_1500',2000:'boss_2000',2500:'boss_2500',3000:'boss_3000',4500:'boss_4500',5000:'boss_5000',5500:'boss_5500',7000:'boss_7000',1000:'boss_1000',7500:'boss_7500',8000:'boss_8000',9000:'boss_9000',9250:'boss_9250',9500:'boss_9500',9750:'boss_9750',10000:'boss_10000'}};
// безымянные боссы акта (каждые 10 этажей между именными): своя картинка и имя; нет записи — «Страж <акта>» и тонированный монстр
const GBOSS={0:['boss_0010','Кампа','Kampe']};
let ACTS,BOSSES,WEAPONS,GODS;
const WALLS=[50,100,250,500,2000,4500,7000,9000,10000];
const S0=()=>({floor:1,max:1,gold:0,souls:0,w:[1,...Array(16).fill(0)],g:Array(18).fill(0),last:NOW(),chest:0,hermes:0,adT:0,tot:0,t:[0,0,0,0,0,0,0,0,0],inv:[],eq:[-1,-1,-1,-1,-1,-1],b:[[0,0],[0,0],[0,0]],day:0,dl:'',q:null,pt:0,run:1,farm:false,sc:[0,0,0,0],se:[0,0,0,0],ac:[0,0,0,0],mk:0,cheat:false,loot:[],vol:[.25,.25],vv:1,sl:[0,0,0,0],nec:0,own:[[0],[0]],skin:0,theme:0,gf:0,sf:1,lang:'',st:{},achN:{},ach:{},tut:0,pc:0});
let S=S0(),ysdk=null,player=null,hp=0,maxhp=0,bossT=0,inBoss=false,clicks=[],rage=0,sound=true,tab='hero',pool=[],pi=0,acc=0;
const SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td','Qad','Qid','Sxd'];
const fmt=n=>{if(!isFinite(n))return'∞';if(n<1e3)return Math.floor(n)+'';const p=Math.pow(10,Math.floor(Math.log10(n))-2);n=Math.round(n/p)*p;const e=Math.floor(Math.log10(n)/3);if(e>=SUF.length)return n.toExponential(2).replace('e+','e');const v=n/Math.pow(10,e*3);return(v<10?v.toFixed(2):v<100?v.toFixed(1):v.toFixed(0))+SUF[e]};
const cost=(b,l)=>b*Math.pow(1.13,l);
const mult=l=>Math.pow(2,Math.floor(l/25));
const soulM=()=>Math.pow(1+S.tot*.05,1.5),RB=[.3,.7,1.4,2.2,4.5,9,20,45],gearM=()=>1+S.eq.reduce((a,r)=>a+(r>=0?RB[r]:0),0),bld=i=>1+.1*S.b[i][0],T=i=>1+.1*S.t[i];
const boost=()=>(NOW()<S.hermes?2:1)*(rage>0?2:1)*soulM()*gearM();
const clickD=()=>(1+WEAPONS.reduce((a,w,i)=>a+w[1]*S.w[i]*mult(S.w[i]),0))*boost()*bld(0)*T(0)*(1+.25*pt(2))*(1+.2*pt(17))*(sa(3)?3:1);
const dps=()=>GODS.reduce((a,g,i)=>a+g[1]*S.g[i]*mult(S.g[i]),0)*boost()*bld(2)*T(2)*(1+.25*pt(9))*(1+.2*pt(17))*(sa(2)?3:1)+(sa(1)?5*clickD()*pw(1):0);
const isBoss=f=>f%10==0;
function mHP(f){let h=14*Math.pow(f,1.9)*Math.pow(1.045,Math.min(f,1000))*Math.exp(.0013*Math.max(0,f-1000));
 WALLS.forEach(w=>{if(f>=w)h*=3});return h*(isBoss(f)?bossM(f):1)}
// начало игры: первые боссы слабее (×BOSS_M0 на 10-м этаже, к BOSS_FULL-му — обычные ×6), золото с монстров выше (×(1+EARLY_GOLD) на 1-м этаже, к EARLY_FL-му — ×1)
const BOSS_M0=1.6,BOSS_FULL=60,EARLY_GOLD=3,EARLY_FL=40;
const bossM=f=>Math.min(6,BOSS_M0+(6-BOSS_M0)*Math.max(0,f-10)/(BOSS_FULL-10));
const eGold=f=>1+EARLY_GOLD*Math.max(0,1-(f-1)/(EARLY_FL-1));
// база наград (задания, вход дня, сундуки): HP обычного этажа на лучшем этаже; ×1 ≈ 10 этажей добычи (без бонуса начала, иначе задания проскакивают первые акты)
const rwG=()=>{const f=Math.max(1,S.max);return mHP(isBoss(f)?f-1:f)};
const act=f=>ACTS.find(a=>f<=a[0])||ACTS[5];
function spawn(){const f=S.floor;if(f>S.run)S.run=f;maxhp=hp=mHP(f)*(1-.1*pt(3))*(isBoss(f)?1-.1*pt(10):1)/(isBoss(f)?1:5);inBoss=isBoss(f)&&!S.farm;bossT=inBoss?30+10*pt(7):0;if(inBoss&&sheetOn())sheet(false);
 {const a=act(f),gb=GBOSS[ACTS.indexOf(a)];$('mname').textContent=BOSSES[f]||(isBoss(f)?(gb?t(gb[1],gb[2]):t('Страж ','Guardian of ')+a[3]):t('Тень ','Shade of ')+a[3])}
 {const m=$('monster'),ai=ACTS.indexOf(act(f)),gbs=GBOSS[ai]&&GBOSS[ai][0],sp=isBoss(f)?(SPR.boss[f]||gbs||SPR.mob[ai]):SPR.mob[ai];if(sp){m.textContent='';m.style.backgroundImage='url(img/'+sp+'.webp)'}else{m.textContent=isBoss(f)?'👑':act(f)[2];m.style.backgroundImage=''}m.classList.toggle('img',!!sp);m.classList.toggle('boss',isBoss(f));m.classList.toggle('named',!!(isBoss(f)&&(SPR.boss[f]||gbs)))}
 $('floor').textContent=t('Этаж ','Floor ')+f+(isBoss(f)||S.farm?'':' · '+(S.mk+1)+'/5');$('act').textContent=act(f)[1];$('arena').dataset.act=ACTS.indexOf(act(f));actUI(f);
 $('bRetry').hidden=!S.farm;$('bSave').hidden=!S.farm;if(inBoss)bossIn($('mname').textContent);draw();fitArena()}
function kill(){const f=S.floor;sfx(isBoss(f)?'boss':'kill');wait=SPAWN_DELAY;killFx(isBoss(f));{const gk=mHP(f)*.1*(isBoss(f)?3:.2)*eGold(f)*bld(1)*T(1)*(1+.3*pt(1))*(NOW()<S.gf?2:1);S.gold+=gk;S.st.g=(S.st.g||0)+gk}qp('k');if(isBoss(f)){for(let k=0;k<1+pt(14);k++)drop(0,true);qp('b')}
 const clr=!S.farm&&(isBoss(f)||++S.mk>=5);if(clr){S.mk=0;if(f>S.max){S.max=f;qp('f');submitScore()}}
 if(f>=10000&&isBoss(f)){S.st.win=(S.st.win||0)+1;modal(t('<h3>Хаос повержен!</h3><p>Вы вышли из Подземелья. Перерождение откроет новый круг.</p>','<h3>Chaos is defeated!</h3><p>You have escaped the Underworld. Rebirth starts a new cycle.</p>')+'<button onclick="closeM()">'+t('Дальше','Continue')+'</button>');happy();}
 else if(clr&&f<10000)S.floor++;
 if(clr&&[500,2000,4500,7000,9000].includes(f)){happy();interstitial(()=>{})}
 else if(clr&&isBoss(f)&&PF.kind=='cg')interstitial(()=>{}); // CrazyGames: реклама между уровнями после победы над боссом (не чаще раза в 4 мин; в Basic Launch выключена)
 spawn();if(tab=='inv'||tab=='quest'||tab=='pres'||tab=='top')dirty=true;sv()}
function lose(){sfx('lose');S.st.l=(S.st.l||0)+1;wait=0;$('monster').classList.remove('gone');S.floor--;S.farm=true;inBoss=false;spawn();bossT=0;save()}
function dealt(d,crit,x,y){hp-=d;float(d,crit,x,y);if(hp<=0)kill();draw()}
// касание рядом с сундуком добычи или феей засчитывается им (на телефоне палец крупнее, фея движется), а не удару по монстру
const nearEl=(id,x,y,pad)=>{const el=$(id);if(!el||el.hidden)return false;const r=el.getBoundingClientRect();return r.width>0&&x>=r.left-pad&&x<=r.right+pad&&y>=r.top-pad&&y<=r.bottom+pad};
$('arena').addEventListener('pointerdown',e=>{
 if(nearEl('chest',e.clientX,e.clientY,12)){claimLoot();return}
 if(nearEl('fairy',e.clientX,e.clientY,22)){fairyTap();return}
 const mm=clickOK(e);if(!mm)return;heroAtk();if(mm==1){qp('c');const now=NOW();clicks=clicks.filter(t=>now-t<2000);clicks.push(now)}
 if(mm==1&&clicks.length>=12-3*pt(5)&&rage<=0){rage=8;qp('r');$('rage').classList.add('on')}
 const crit=rage>0||Math.random()<.1+.15*pt(4)+.01*S.t[4];let d=clickD()*(crit?(rage>0?1:3+.2*S.t[3]+pt(13)):1)*mm;sfx(crit?'crit':'click');if(crit)qp('x');
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
 zt+=dt;S.st.t=(S.st.t||0)+dt/TS;if(pt(0)&&zt>=8&&wait<=0){zt=0;dealt(dps()*10*pt(0),true,150,110)}if(inBoss){bossT-=dt;if(bossT<=0)lose()}
 {let T=dt,g=0;const d=dps();while(T>0&&g++<MAXK){if(wait>0){const u=Math.min(wait,T);wait-=u;T-=u;if(wait<=0)$('monster').classList.remove('gone');continue}
 if(d<=0)break;const tk=hp/d;if(tk<=T){T-=tk;kill();if(S.floor>=10000&&isBoss(S.floor))break}else{hp-=d*T;T=0}}}
 acc+=dt;if(acc>.2){acc=0;draw();hTick()}if(acc===0&&tab)updBtns();
 requestAnimationFrame(loop)}
function buy(kind,i){const arr=kind=='w'?WEAPONS:GODS,lv=kind=='w'?S.w:S.g,[n,c]=plan(arr[i][2],lv[i]);
 if(S.gold>=c){S.gold-=c;lv[i]+=n;qp('u',n);sfx('buy');tabRender();draw();save()}}
// кнопки покупки: «+N ур. · цена», недоступные гаснут, лучшее вложение золота помечается «Выгоднее всего»
function updBtns(){let best=null,bv=0;document.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k,i=+b.dataset.i,A=k=='w'?WEAPONS:GODS,L=(k=='w'?S.w:S.g)[i],[n,c]=plan(A[i][2],L),key=n+'|'+fmt(c),ok=S.gold>=c;
  // меняем только текст внутри кнопки: если пересоздать её содержимое во время нажатия, браузер теряет клик
  if(b._k!==key){b._k=key;const lv='+'+n+' '+t('ур.','lv.'),pr=fmt(c),C=b.children;if(C&&C.length==2&&C[1].lastChild&&C[1].firstElementChild&&C[1].firstElementChild.className=='coin'){C[0].textContent=lv;C[1].lastChild.nodeValue=pr}else b.innerHTML='<b>'+lv+'</b><span><i class="coin"></i>'+pr+'</span>'}b.disabled=!ok;
  const v=A[i][1]*((L+n)*mult(L+n)-L*mult(L))/c;if(ok&&v>bv){bv=v;best=b}
  const r=b.parentElement;if(r)r.classList.toggle('dim',!ok&&L==0)});
 document.querySelectorAll('[data-k]').forEach(b=>{const r=b.parentElement;if(r)r.classList.toggle('isbest',b===best)});
 document.querySelectorAll('[data-b]').forEach(b=>{b.disabled=S.gold<+b.dataset.b})}
function upRow(k,a,i,L){const nx=25-L%25;
 return `<div class="row up"><div class="ut pic"><img class="pi" src="img/${k=='w'?'weapons/w_':'gods/g_'}${String(i).padStart(2,'0')}.webp" alt="" loading="lazy"></div><div class="ub"><div class="un"><b>${a[0]}</b><span class="lv">${t('ур.','lv.')} ${L}</span><span class="best">${t('Выгоднее всего','Best value')}</span></div>`+
  `<small><em>+${fmt(a[1]*mult(L))}</em> ${k=='w'?t('к клику за уровень','click dmg per level'):t('урона/с за уровень','DPS per level')}</small>`+
  `<div class="m2"><span><i style="width:${(L%25)*4}%"></i></span><small>${t('×2 через ','×2 in ')}${nx} ${t('ур.','lv.')}</small></div>${k=='g'?psH(i):''}</div>`+
  `<button class="buy" data-k="${k}" data-i="${i}" onclick="buy('${k}',${i})"></button></div>`}
const NEXT_SHOW=2;
// Обновление списка без пересоздания: меняем только то, что отличается. Раньше каждый новый этаж заново
// создавал все строки — картинки богов/оружия/вещей перезагружались и моргали. Кнопки покупки (data-k)
// наполняет updBtns — их содержимое не трогаем.
function morph(a,b){if(a.nodeType!==b.nodeType||a.nodeName!==b.nodeName){a.replaceWith(b);return}
 if(a.nodeType===3||a.nodeType===8){if(a.nodeValue!==b.nodeValue)a.nodeValue=b.nodeValue;return}
 if(a.nodeType!==1)return;
 // элемент стал другой кнопкой (другие data-k/i/ab) — забываем, что в нём было: иначе кнопка покупки оружия
 // оставалась с иконкой души от кнопки прокачки умения
 if(['data-k','data-i','data-ab'].some(n=>a.getAttribute(n)!==b.getAttribute(n))){delete a._k;delete a._h}
 for(const at of [...a.attributes])if(!b.hasAttribute(at.name))a.removeAttribute(at.name);
 for(const at of [...b.attributes])if(a.getAttribute(at.name)!==at.value)a.setAttribute(at.name,at.value);
 if(a._k!==undefined&&b.childNodes.length===0)return;
 kids(a,b)}
function kids(a,b){const ac=[...a.childNodes],bc=[...b.childNodes];
 for(let i=0;i<bc.length;i++){if(i<ac.length)morph(ac[i],bc[i]);else a.appendChild(bc[i])}
 for(let i=bc.length;i<ac.length;i++)ac[i].remove()}
function setList(L,h){try{const T=document.createElement('template');if(T.content&&L.childNodes&&L.replaceChildren){T.innerHTML=h;kids(L,T.content);return}}catch(e){}L.innerHTML=h}
function tabRender(){const L=$('list');let h='';dirty=false;
 if(tab=='hero'||tab=='gods'){const k=tab=='hero'?'w':'g',arr=tab=='hero'?WEAPONS:GODS,lv=tab=='hero'?S.w:S.g;
  if(tab=='hero'){const up=SK.some((a,i)=>skLv(i)>0&&S.sl[i]<SKMAX&&S.souls>=skCost(i));
   h+=panH('hero','<div class="seg"><button class="'+(htab=='w'?'on':'')+'" onclick="setHT(\'w\')">'+t('Оружие','Weapons')+'</button><button class="'+(htab=='s'?'on':'')+'" onclick="setHT(\'s\')">'+t('Умения','Skills')+(up?'<i class="dot"></i>':'')+'</button></div>'+(htab=='w'?qsH():''));
   if(htab=='s'){setList(L,h+skH());return}}
  else h+=panH('gods',qsH());
  // видны всё купленное и NEXT_SHOW следующих позиций; остальные открываются по мере покупки
  const last=lv.reduce((m,l,i)=>l>0?i:m,-1),vis=Math.min(arr.length,last+1+NEXT_SHOW),left=arr.length-vis;
  arr.forEach((a,i)=>{if(i<vis)h+=upRow(k,a,i,lv[i])});
  if(left>0)h+=`<div class="row up more"><span class="it">${ico('lock')}</span><div class="ub"><b>${k=='w'?t('Ещё оружия: ','More weapons: '):t('Ещё богов: ','More gods: ')}${left}</b><small>${k=='w'?t('Новое оружие откроется, когда купите следующее','Buy the next weapon to reveal more'):t('Новый бог откроется, когда наймёте следующего','Hire the next god to reveal more')}</small></div></div>`}
 else if(tab=='pres')h=altH()+talH()
 else if(tab=='inv')h=invH();else if(tab=='house')h=houseH();else if(tab=='quest')h=questH();else if(tab=='rew')h=rewH();else h=atab=='s'?statH():achH();
 setList(L,(tab=='hero'||tab=='gods'?'':panH(tab,tab=='top'?'<div class="seg"><button class="'+(atab=='a'?'on':'')+'" onclick="setAT(\'a\')">'+t('Подвиги','Feats')+'</button><button class="'+(atab=='s'?'on':'')+'" onclick="setAT(\'s\')">'+t('Статистика','Stats')+'</button></div>':''))+h);updBtns()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>navGo(b.dataset.t));
function prestige(){const g=soulGain();if(g<1||pcd()>0)return;
 const done=()=>{if(pcd()>0)return;const f0=startF(),k={pt:NOW(),cheat:S.cheat,max:S.max,souls:S.souls+g,tot:S.tot+g,hermes:S.hermes,chest:S.chest,ac:S.ac,loot:S.loot,vol:S.vol,lang:S.lang,st:S.st,achN:S.achN,ach:S.ach,tut:S.tut,td:S.td,tipF:S.tipF,pc:S.pc+1,sl:S.sl,nec:S.nec,own:S.own,skin:S.skin,theme:S.theme,gf:S.gf,adT:S.adT,t:S.t,inv:S.inv,eq:S.eq,b:S.b,day:S.day,dl:S.dl,q:S.q};S=Object.assign(S0(),k);S.farm=false;S.floor=f0;S.sf=f0;S.run=f0;S.gold=skipGold(f0);spawn();tabRender();save()};
 interstitial(done)}
function modal(h){$('mbox').innerHTML=h;$('modal').hidden=false}
function closeM(){$('modal').hidden=true}
// ---- Платформы: Яндекс Игры (ya), CrazyGames (cg), Игры ВКонтакте (vk) или локальный запуск (local) ----
const CG_ADS=false; // CrazyGames: false — Basic Launch (рекламы нет, кнопки видео скрыты); для Full Launch собрать: CG_ADS=1 bash build.sh
const PF={kind:'local',sdk:null,noAds:false,adblock:false,t0:Date.now()};
// ---- VK: VK Bridge. Площадка — если есть мост и в адресе параметры запуска vk_app_id (VK их всегда передаёт) ----
// Сохранение: VKWebAppStorageSet хранит до 4096 байт на ключ — JSON режется на куски sv0..svN (+ svn = число кусков),
// пишутся только изменившиеся куски и не чаще раза в минуту (лимит VK — 1000 вызовов в час); копия всегда и в localStorage.
const VK_SUPPORT='https://vk.ru/club242475048'; // ссылка на сообщество/страницу поддержки (обязательна для каталога VK), напр. 'https://vk.com/podzemelie_aida'
const VK_CH=1300,VK_GAP=60000;let vkC=[],vkT=0,vkCloud=null;
const vkQ=()=>{try{return new URLSearchParams(location.search)}catch(e){return null}};
function vkOn(){const q=vkQ();return !!(typeof window!='undefined'&&window.vkBridge&&q&&q.get('vk_app_id'))}
const vkTO=(p,ms)=>Promise.race([p,new Promise((_,j)=>setTimeout(()=>j(new Error('timeout')),ms))]); // вне VK мост не отвечает — не зависаем
async function vkGet(keys){const r=await vkTO(PF.sdk.send('VKWebAppStorageGet',{keys}),4000),o={};((r&&r.keys)||[]).forEach(k=>{o[k.key]=k.value});return o}
async function vkInit(){const B=window.vkBridge;PF.kind='vk';PF.sdk=B;if(!VK_ADS)PF.noAds=true;
 try{await Promise.race([B.send('VKWebAppInit',{}),new Promise(r=>setTimeout(r,3000))])}catch(e){}
 try{const vq=vkQ();if(vq&&vq.get('vk_platform')=='mobile_web'){vkVisInit();setTimeout(vkProbe,800)}vkTO(B.send('VKWebAppGetConfig',{}),4000).then(vkFit).catch(()=>{});addEventListener('resize',()=>vkFit())}catch(e){}
 try{B.subscribe(e=>{const ty=e&&e.detail&&e.detail.type;if(ty=='VKWebAppUpdateConfig')vkFit(e.detail.data);else if(ty=='VKWebAppViewHide'){audVis(true);save(true)}else if(ty=='VKWebAppViewRestore')audVis(false)})}catch(e){}
 try{const n=parseInt((await vkGet(['svn'])).svn)||0;if(n>0&&n<500){const ks=[...Array(n)].map((_,i)=>'sv'+i),r={};for(let i=0;i<n;i+=100)Object.assign(r,await vkGet(ks.slice(i,i+100)));vkC=ks.map(k=>r[k]||'');vkCloud=vkC.join('')}}catch(e){console.warn('[Underworld Escape] VK storage',e)}
 vkPre()}
function vkSave(j,f){if(NOW()-vkT<(f?10000:VK_GAP))return;vkT=NOW();const B=PF.sdk,n=Math.ceil(j.length/VK_CH),c=[];for(let i=0;i<n;i++)c.push(j.slice(i*VK_CH,(i+1)*VK_CH));
 try{c.forEach((v,i)=>{if(vkC[i]!==v)B.send('VKWebAppStorageSet',{key:'sv'+i,value:v}).catch(()=>{})});if(c.length!==vkC.length)B.send('VKWebAppStorageSet',{key:'svn',value:String(n)}).catch(()=>{})}catch(e){}vkC=c}
// Мобильная версия сайта (m.vk.ru, в т.ч. браузер внутри приложения VK на iOS): окно игры бывает выше видимой области —
// низ уходит под панель Safari и не видно нижнего меню. VK сообщает видимую высоту (avail_height/viewport_height) —
// если она меньше высоты окна игры, ужимаем страницу до неё.
let vkVP=null;
function vkH(v,ih){if(!v)return 0;const c=[+v.avail_height,+v.viewport_height].filter(x=>x>240&&x<ih-4);return c.length?Math.floor(Math.min(...c)):0}
// Второй источник — сама страница: IntersectionObserver в iframe считает пересечение с видимой областью ВСЕЙ страницы VK,
// поэтому видно, где кончается видимая часть окна игры (на iPhone низ окна уходит под панель Safari).
let vkVis=0,vkHdr=0;
// Третий способ (iPhone, m.vk.ru): окно игры стоит под шапкой VK «⋯ ×» и выше видимой части ровно на её высоту.
// Просим VK прокрутить страницу до конца (VKWebAppScroll): насколько она сдвинулась — такова высота шапки.
// Возвращаем страницу наверх и уменьшаем игру на эту величину. Если VK не сообщил сдвиг — оставляем прокрученной: так игра видна целиком.
async function vkProbe(){try{const B=PF.sdk,r=await vkTO(B.send('VKWebAppScroll',{top:100000,speed:0}),3000),top=Math.round(+(r&&r.top)||0);
 if(top>0&&top<innerHeight/3){vkHdr=top;try{await vkTO(B.send('VKWebAppScroll',{top:0,speed:0}),3000)}catch(e){}}vkFit()}catch(e){}}
// Два невидимых датчика: на всё окно и на его нижнюю половину (у второго доля видимости меняется и тогда,
// когда страница VK сдвигается, а окно игры выступает за экран и сверху, и снизу).
function vkVisInit(){try{if(typeof IntersectionObserver!='function')return;const th=[];for(let i=0;i<=100;i++)th.push(i/100);
 const io=new IntersectionObserver(es=>{for(const e of es){const r=e.intersectionRect;if(e.isIntersecting&&r.height>0)vkVis=Math.round(r.bottom)}vkFit()},{threshold:th});
 ['top:0;height:100%','bottom:0;height:50%'].forEach(css=>{const s=document.createElement('div');s.style.cssText='position:fixed;left:0;width:1px;pointer-events:none;opacity:0;'+css;document.body.appendChild(s);io.observe(s)})}catch(e){}}
function vkFit(c){try{if(c&&typeof c=='object')vkVP=c;const q=vkQ();if(!q||q.get('vk_platform')!='mobile_web')return;
 const ih=innerHeight,cs=[vkH(vkVP,ih),vkVis,vkHdr?ih-vkHdr:0].filter(x=>x>240&&x<ih-4),h=cs.length?Math.min(...cs):0,v=h?h+'px':'';if(document.body.style.height!==v){document.documentElement.style.height=v;document.body.style.height=v;fitK='';fitArena()}}catch(e){}}
const vkDiag=()=>{try{const v=vkVP||{},q=vkQ();return (q&&q.get('vk_platform')||'?')+' · '+innerWidth+'×'+innerHeight+' · '+(v.viewport_height||'-')+'/'+(v.avail_height||'-')+' · '+(vkVis||'-')+' · '+(vkHdr||'-')}catch(e){return ''}};
function vkPre(){try{PF.sdk.send('VKWebAppCheckNativeAds',{ad_format:'reward'}).catch(()=>{})}catch(e){}}
// реклама VK: игра на паузе и без звука, пока открыт ролик; награда — только если ролик показан (result: true)
function vkAd(fmt,onDone,onFail){adWait(true);pause(true);const end=()=>{pause(false);adWait(false)};
 try{PF.sdk.send('VKWebAppShowNativeAds',{ad_format:fmt}).then(d=>{end();d&&d.result?onDone():onFail()}).catch(()=>{end();onFail()})}catch(e){end();onFail()}}
function vkShare(){try{const q=vkQ(),id=q&&q.get('vk_app_id');PF.sdk.send('VKWebAppShare',{link:'https://vk.com/app'+id}).catch(()=>{})}catch(e){}}
const shopYa=()=>PF.kind=='ya'||PF.kind=='local'; // покупки Нектара и лидерборд — только Яндекс Игры (и локально для проверки)
const VK_ADS=true; // ВКонтакте: реклама за вознаграждение и межстраничная; выключить до подключения монетизации — VK_ADS=0 bash build.sh
const adsOff=()=>(PF.kind=='cg'||PF.kind=='vk')&&(PF.noAds||PF.adblock);
const okB=()=>'<button onclick="closeM()">'+t('Ок','OK')+'</button>';
async function pfInit(){
 try{if(vkOn()){await vkInit();return}}catch(e){console.warn('[Underworld Escape] VK Bridge error',e)}
 // CrazyGames: SDK v3 — init, затем среда. На их доменах (в т.ч. QA-превью) считаем площадкой CG, даже если среда пришла пустой; 'disabled' — чужой сайт
 try{const C=window.CrazyGames&&window.CrazyGames.SDK;if(C){let env='',err=null;try{await C.init()}catch(e){err=e}try{env=C.environment||''}catch(e){}
  let onCG=false;try{onCG=/(^|\.)crazygames\.[a-z.]+$/i.test(location.hostname)||/\/\/([^/]*\.)?crazygames\.[a-z.]+\//i.test(document.referrer||'')}catch(e){}
  console.info('[Underworld Escape] CrazyGames SDK: environment='+(env||'?')+(err?' init error: '+(err&&err.message||err):'')+' host='+location.hostname);
  if(env=='crazygames'||env=='local'||(env!='disabled'&&onCG)){PF.kind='cg';PF.sdk=C;if(!CG_ADS)PF.noAds=true;try{C.game.loadingStart()}catch(e){}try{C.game.addSettingsChangeListener(st=>{try{if(st&&st.muteAudio&&AUD&&AUD.state=='running')AUD.suspend()}catch(e){}})}catch(e){}try{PF.adblock=!!(await C.ad.hasAdblock())}catch(e){}return}}}catch(e){console.warn('[Underworld Escape] CrazyGames SDK error',e)}
 try{if(window.YaGames){ysdk=await YaGames.init();player=await ysdk.getPlayer();syncTime();PF.kind='ya'}}catch(e){ysdk=null}}
// язык: ?lang=, затем язык из SDK площадки, затем браузера; русский для ru/be/uk/kk, иначе английский
function pfLang(){let l='';try{const q=new URLSearchParams(location.search).get('lang');if(q)return q=='ru'?'ru':'en'}catch(e){}
 try{const vq=vkQ();if(PF.kind=='vk'||(vq&&vq.get('vk_app_id'))){l=(vq&&vq.get('vk_language'))||'ru'}else if(PF.kind=='cg'){const si=PF.sdk.user&&PF.sdk.user.systemInfo;l=(si&&si.locale)||''}else if(ysdk)l=ysdk.environment.i18n.lang}catch(e){}
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
 if(PF.kind=='cg'){if(adsOff())return toast(adOffMsg());cgAd('rewarded',()=>{f();toast(ico('gift')+' '+t('Награда получена!','Reward received!'),true)},adErr);return}
 if(PF.kind=='vk'){if(adsOff())return toast(adOffMsg());vkAd('reward',()=>{f();toast(ico('gift')+' '+t('Награда получена!','Reward received!'),true);vkPre()},()=>toast(t('Сейчас нет рекламы, попробуйте позже','No ad right now, try again later')));return}
 if(ysdk){ysdk.adv.showRewardedVideo({callbacks:{onOpen:()=>pause(true),onRewarded:f,onClose:()=>pause(false),onError:()=>pause(false)}})}else f()}
function interstitial(done){if(PF.kind=='vk'){if(adsOff()||NOW()-S.adT<=240000||Date.now()-PF.t0<180000)return done();S.adT=NOW();vkAd('interstitial',done,done);return} // VK: не в первые 3 минуты (модерация отклоняет рекламу сразу после запуска)
 if(PF.kind=='cg'){if(adsOff()||NOW()-S.adT<=240000)return done();S.adT=NOW();cgAd('midgame',done,er=>{if(er&&er.code=='adsDisabledBasicLaunch')PF.noAds=true;done()});return}
 if(ysdk&&NOW()-S.adT>240000){S.adT=NOW();ysdk.adv.showFullscreenAdv({callbacks:{onOpen:()=>pause(true),onClose:()=>{pause(false);done()},onError:()=>{pause(false);done()}}})}else done()}
function happy(){if(PF.kind=='cg')try{PF.sdk.game.happytime()}catch(e){}}
function storeSet(j,f){if(PF.kind=='cg'){try{PF.sdk.data.setItem('hades',j)}catch(e){}return}try{localStorage.setItem('hades',j)}catch(e){}if(PF.kind=='vk')vkSave(j,f)}
function storeGet(){if(PF.kind=='vk'){let l=null;try{l=localStorage.getItem('hades')}catch(e){}const lt=x=>{try{return JSON.parse(x).last||0}catch(e){return -1}};return !vkCloud?l:!l?vkCloud:lt(vkCloud)>=lt(l)?vkCloud:l}
 try{return PF.kind=='cg'?PF.sdk.data.getItem('hades'):localStorage.getItem('hades')}catch(e){return null}}
const snd=()=>{if(!sound)return false;try{if(PF.kind=='cg'&&PF.sdk.game.settings&&PF.sdk.game.settings.muteAudio)return false}catch(e){}return true};
function submitScore(){if(S.cheat||!ysdk)return;if(NOW()-lbT<20000){lbP=true;return}lbT=NOW();lbP=false;try{if(ysdk.leaderboards&&ysdk.leaderboards.setScore)ysdk.leaderboards.setScore('floors',S.max).catch(()=>{});else if(ysdk.getLeaderboards)ysdk.getLeaderboards().then(l=>l.setLeaderboardScore('floors',S.max)).catch(()=>{})}catch(e){}}
function showLB(){if(!ysdk)return modal('<p>'+t('Лидерборд доступен в Яндекс Играх.','The leaderboard is available on Yandex Games.')+'</p>'+okB());
 ysdk.getLeaderboards().then(l=>l.getLeaderboardEntries('floors',{quantityTop:10})).then(r=>modal('<h3>'+t('Топ-10','Top 10')+'</h3>'+r.entries.map(e=>`<p>${e.rank}. ${e.player.publicName||t('Игрок','Player')} — ${e.score}</p>`).join('')+'<button onclick="closeM()">'+t('Закрыть','Close')+'</button>')).catch(()=>{})}
let loaded=false; // до загрузки сохранения ничего не пишем — иначе сворачивание в первые секунды затёрло бы прогресс пустым
function save(f){if(!loaded)return;S.last=NOW();const j=JSON.stringify(S);storeSet(j,f);if(player&&(f||NOW()-ysT>10000)){ysT=NOW();player.setData({s:j}).catch(()=>{})}}
async function load(){let d=null;try{if(player){const r=await player.getData();if(r.s)d=r.s}}catch(e){}
 if(!d)d=storeGet();
 if(d)try{S=Object.assign(S0(),JSON.parse(d))}catch(e){}normS()}
function normS(){if(S.tot<S.souls)S.tot=S.souls;if(!S.vv){if(S.vol&&S.vol[0]==.7&&S.vol[1]==.3)S.vol=[.25,.25];S.vv=1}S.g=GODS.map((_,i)=>S.g[i]|0);S.w=WEAPONS.map((_,i)=>S.w[i]|0);S.t=TN.map((_,i)=>S.t[i]|0)}
// первый кадр: пока подключается площадка (VK/Яндекс/CrazyGames — до 1–3 с), сразу рисуем арену по локальной копии сохранения,
// иначе секунду-две виден пустой красный экран и эмодзи вместо моба. Потом load() берёт настоящее сохранение площадки.
function preDraw(){try{let d=null;try{d=localStorage.getItem('hades')}catch(e){}if(d){S=Object.assign(S0(),JSON.parse(d));normS()}setTexts(S.lang||pfLang());spawn();tabRender()}catch(e){}S=S0()}
function offline(){const sec=Math.min(8*3600+1800*S.t[7],(NOW()-S.last)/1e3),g=dps()*sec*.05*(1+.5*pt(11));
 if(sec>60&&g>0)modal(`<h3>${t('Пока вас не было','While you were away')}</h3><p>${t('Вы заработали','You earned')} <i class="coin"></i>${fmt(g)}</p><button id="o1">${t('Забрать','Collect')}</button>${adsOff()?'':`<button id="o2">${ico('play')} ${t('Удвоить x2','Double x2')}</button>`}`),
  $('o1').onclick=()=>{S.gold+=g;closeM();tabRender()},$('o2')&&($('o2').onclick=()=>rewarded(()=>{S.gold+=g*2;closeM();tabRender()}))}
function hermesAd(){if(NOW()<S.hermes)return;rewarded(()=>{S.hermes=NOW()+6e5;draw();if(tab=='rew')tabRender()})}
$('bHermes').onclick=hermesAd;
function chestAd(){if(NOW()<S.chest)return modal('<p>'+t('Сундук откроется через ','The chest opens in ')+Math.ceil((S.chest-NOW())/6e4)+t(' мин.',' min.')+'</p>'+okB());
 rewarded(()=>{const g=mHP(S.floor)*5;S.gold+=g;S.chest=NOW()+4*3600*1e3;modal(`<p>${t('Сундук Харона',"Charon's Chest")}: <i class="coin"></i>${fmt(g)}</p>${okB()}`);draw();if(tab=='rew')tabRender()})}
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
async function init(){sfxPre();devInit();uiInit();$('list').addEventListener('pointerdown',()=>{lpDown=true;lpT=NOW()});['pointerup','pointercancel'].forEach(e=>document.addEventListener(e,()=>{lpDown=false;lpT=NOW()}));document.addEventListener('visibilitychange',()=>{if(document.hidden){audVis(true);save(true);lbFlush(true);if(PF.kind!='cg')gp(false)}else{audVis(false);if(PF.kind!='cg')gp(!paused);offline()}});preDraw();await pfInit();try{document.body.classList.add('pf-'+PF.kind);if(adsOff())document.body.classList.add('noads')}catch(e){}
 await load();loaded=true;setTexts(S.lang||pfLang());S.b.forEach((b,i)=>{if(b[1])b[1]=Math.min(b[1],NOW()+hTime(i)*1e3)}); // стройки по старым долгим таймерам — укоротить
 if(S.max>30&&!S.tut)S.tut=9;achCheck(true);applyCos();skBuild();spawn();tabRender();offline();
 if(ysdk&&ysdk.features&&ysdk.features.LoadingAPI)ysdk.features.LoadingAPI.ready();if(PF.kind=='cg')try{PF.sdk.game.loadingStop()}catch(e){}gp(true);
 setInterval(save,15000);setInterval(musTick,400);setInterval(audVol,1000);requestAnimationFrame(loop)}

let SL,RN;const NEED=[3,4,5,6,7,8,9];
let BN;
let TN;
let QD;
let AC;
function adUI(){const n=NOW(),h=S.hermes-n,c=S.chest-n,B=$('bHermes'),C=$('bChest'),
 bw=B.offsetWidth||999,xs=bw<150, // узкая кнопка (строка под «Перейти к битве») — короткие подписи
 nw=typeof innerWidth=='number'&&innerWidth<520||bw<230,th=h>0?(xs?t('Гермес · ','Hermes · '):t('Гермес +100% · ','Hermes +100% · '))+hms(h):xs?t('Гермес ×2','Hermes ×2'):nw?t('Гермес ×2 · 10 мин','Hermes ×2 · 10 min'):t('Буст Гермеса +100% · 10 мин','Hermes Boost +100% · 10 min'),cw=C.offsetWidth||999,tc=c>0?(cw<110?t('Сундук · ','Chest · '):t('Сундук Харона · ','Charon\'s Chest · '))+hms(c):cw<110?t('Сундук','Chest'):t('Сундук Харона',"Charon's Chest");
 if(B.textContent!==th){B.textContent=th;B.disabled=h>0;B.classList.toggle('act',h>0);B.style.setProperty&&B.style.setProperty('--w',Math.min(100,h/6e3)+'%')}
 if(C.textContent!==tc){C.textContent=tc;C.disabled=c>0}
 const R=$('bRetry'),rw=R.offsetWidth||999,tr=rw<170?t('К боссу!','Boss!'):t('Перейти к битве с боссом','Fight the boss');if(R.textContent!==tr)R.textContent=tr;
 const V=$('bSave'),ts=(V.offsetWidth||999)<110?t('+15 сек','+15 s'):t('Босс +15 сек','Boss +15 s');if(V.textContent!==ts)V.textContent=ts}
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
function pt(i){const l=S.g[i];return l>=200?2:l>=50?1:0}
function sa(i){return S.se[i]>NOW()}
function pw(i){return 1+.15*skLv(i)}
function psH(i){if(!PS[i])return '';const tp=pt(i);return `<small class="ps${tp?' on':''}">${t('Пассив','Passive')} «${PS[i][0]}»: ${PS[i][1]} ${t('(с ур.50, ×2 с ур.200)','(from lv.50, ×2 from lv.200)')}${tp?t(' · сейчас ×',' · now ×')+tp:''}</small>`}
function skInfo(i){const a=SK[i],ok=S.w[a[2]]>=SKL;return `<small>${ok?'✅':'🔒'} Актив «${a[0]}»: ${a[5]} (КД ${a[3]} с${a[4]?', длит. '+a[4]+' с':''}${ok?'':', откр. с ур.'+SKL})`+(ok?')':'')+'</small>'}
function skBuild(){const b=$('skills');SK.forEach((a,i)=>{const e=document.createElement('button');e.onclick=()=>useSk(i);b.appendChild(e)})}
// панель умений: иконка, короткое имя, клавиша 1–4; перезарядка — затемнение по кругу с таймером; data-st: rdy/on/cd/na/lock
function skUI(){const n=NOW(),B=$('skills').children;SK.forEach((a,i)=>{const e=B[i];if(!e)return;const lock=skLv(i)<1,cd=S.sc[i]-n,on=S.se[i]>n,na=false,
 st=lock?'lock':on?'on':cd>0?'cd':na?'na':'rdy',full=a[3]*1e3,
 nm=lock?t('эт. ','fl. ')+SKU[i]:on?Math.ceil((S.se[i]-n)/1e3)+t(' с',' s'):a[6],
 ov=st=='cd'?'<span class="sk-c" style="--p:'+Math.round(Math.min(1,cd/full)*100)+'%">'+hms(cd)+'</span>':'',
 h=(lock?ico('lock'):'<img class="pi" src="img/icons/skill_'+(i+1)+'.webp" alt="">')+'<span class="sk-n">'+nm+'</span><span class="sk-k">'+(i+1)+'</span>'+ov,
 tl=a[0]+' — '+a[5]+(lock?t(' · откроется на этаже ',' · unlocks at floor ')+SKU[i]:na&&!on&&cd<=0?t(' · только в бою с боссом',' · boss fights only'):'');
 if(e._h!==h){e._h=h;setList(e,h)}if(e.title!==tl){e.title=tl;e.ariaLabel=tl}e.dataset.st=st;e.disabled=lock||cd>0||na})}
function useSk(i){const a=SK[i],n=NOW();if(skLv(i)<1||S.sc[i]>n||(i==0&&wait>0))return;
 S.sc[i]=n+a[3]*1e3*Math.max(.5,1-.03*S.t[6])*(1-.01*Math.min(30,S.sl[i]))*(1-.1*pt(16));S.se[i]=n+a[4]*1e3*(1+.1*S.t[5])*(1+.02*S.sl[i])*(1+.2*pt(6));
 if(i==0)dealt(clickD()*20*pw(0)*(1+.1*S.t[5]),true,150,110);
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
let COS,COS_ON=false; // облики героя и темы арены: пока выключены (раздел в «Наградах» скрыт)
const THB=['radial-gradient(circle at 50% 25%,#3a0d14,#0b0507 70%)','radial-gradient(circle at 50% 25%,#2a2a14,#0b0a05 70%)','radial-gradient(circle at 50% 25%,#0d3a2a,#050b08 70%)','radial-gradient(circle at 50% 25%,#14263a,#05080b 70%)','radial-gradient(circle at 50% 25%,#2a0d3a,#07050b 70%)'];
const PACKS=[['100',100,'nectar_100'],['350',350,'nectar_350'],['800',800,'nectar_800']];let SHD;
let fnx=0;
const skLv=i=>S.max>=SKU[i]?1+S.sl[i]:0,skCost=i=>Math.ceil(SKB[i]*Math.pow(1.55,S.sl[i]));
function skH(){return SK.map((a,i)=>{const lv=skLv(i),ok=lv>0,c=skCost(i),mx=S.sl[i]>=SKMAX;return `<div class="row up${ok?'':' dim'}"><div class="ut pic">${ok?'<img class="pi" src="img/icons/skill_'+(i+1)+'.webp" alt="">':ico('lock')}</div><div class="ub"><div class="un"><b>${a[0]}</b><span class="lv">${t('ур.','lv.')} ${lv}</span></div><small>${a[5]}${ok?'':t(' · откроется на этаже ',' · unlocks at floor ')+SKU[i]}</small><small>${t('КД','CD')} ${a[3]} ${t('с','s')}${a[4]?t(' · длит. ',' · dur. ')+a[4]+t(' с',' s'):''} · ${t('сила','power')} ×${(1+.15*lv).toFixed(2)}</small></div><button ${!ok||mx||S.souls<c?'disabled':''} onclick="buySk(${i})">${mx?t('МАКС','MAX'):'<i class="soul"></i> '+c}</button></div>`}).join('')}
function buySk(i){if(skLv(i)<1||S.sl[i]>=SKMAX||S.souls<skCost(i))return;S.souls-=skCost(i);S.sl[i]++;upd()}
function toast(t,html){const e=$('toast');if(html)e.innerHTML=t;else e.textContent=t;e.style.animation='none';void e.offsetWidth;e.style.animation=''}
function fairySpawn(){const f=$('fairy');f.style.top=(15+Math.random()*55)+'%';f.hidden=false;f.style.animation='none';void f.offsetWidth;f.style.animation='';fnx=NOW()+(45+Math.random()*45)*1e3}
function fairyTap(){const f=$('fairy');if(f.hidden)return;f.hidden=true;S.st.fy=(S.st.fy||0)+1;const r=Math.random();let tt;
 if(r<.6){const v=Math.max(100,dps()*12);S.gold+=v;tt='<i class="coin"></i>'+fmt(v)}else if(r<.85){S.nec++;tt='+1 <i class="nectar"></i>'}else{S.hermes=Math.max(S.hermes,NOW())+12e4;tt=t('Гермес ×2 · 2 мин','Hermes ×2 · 2 min')}
 sfx('fairy');toast('<img class="tfi" src="img/icons/fairy_t.webp" alt="">'+tt,true);draw();sv()}
function applyCos(){const h=$('hero');if(S.skin==0||!COS_ON){h.textContent='';h.className='img'}else{h.textContent=COS[0][S.skin][0];h.className=''}$('app').style.background=THB[COS_ON?S.theme:0]}
function shopH(){let h=`<div class="necc"><span class="it nc big pic"><img class="pi" src="img/icons/icon_nectar.webp" alt=""></span><div><small>${t('Нектар','Nectar')}</small><b>${fmt(S.nec)}</b></div><p>${adsOff()?t('Каждое задание дня +1 (все 8 — ещё +5), 7-й день входа +10, феи, подвиги','+1 per daily quest (+5 more for all 8), +10 on login day 7, fairies, feats'):t('Каждое видео +1, каждое задание дня +1 (все 8 — ещё +5), 7-й день входа +10, феи','+1 per video, +1 per daily quest (+5 more for all 8), +10 on login day 7, fairies')}</p></div>`;
 const n=NOW(),SHI=['chest','chest','chest','orb','anvil','scroll','coins','bolt'],SHC=['c1','c2','c3','sl','h0','nc','c3','c3'];
 h+=`<div class="sech"><b>${t('Лавка Нектара','Nectar shop')}</b><span>${t('за Нектар, без видео','for Nectar, no video')}</span></div>`;
 SHOP.forEach((a,i)=>{if(a[1]=='build')return; // «Достроить» есть прямо во вкладке «Дом»
  const cd=0,na=a[1]=='pcd'&&pcd()<=0||a[1]=='build'&&!S.b.some(b=>b[1]),dis=S.nec<a[2]||cd>0||na;
  h+=`<div class="row up shp">${art(SHA[i])}<div class="ub"><b>${a[0]}</b><small>${a[1]=='chest'?acD(a[3])+' · ':''}${SHD[i]}</small></div><button class="buy nec" ${dis?'disabled':''} onclick="buyShop(${i})">${cd>0?`<b>${hms(cd)}</b><span>${t('перезарядка','cooldown')}</span>`:`<b>${t('Купить','Buy')}</b><span><i class="nectar"></i>${a[2]}</span>`}</button></div>`});
 if(!COS_ON){} // облики выключены — раздел не показываем вовсе (заглушки «скоро» ревьюеры считают недоделкой)
 else [[t('Облик героя','Hero look'),0],[t('Тема арены','Arena theme'),1]].forEach(([nm,k])=>{h+=`<div class="sech"><b>${nm}</b><span>${t('за Нектар','for Nectar')}</span></div><div class="cosg">`;COS[k].forEach((c,i)=>{const own=S.own[k].includes(i),cur=(k?S.theme:S.skin)==i;
  h+=`<button class="cos${cur?' on':''}" ${!own&&S.nec<c[1]?'disabled':''} onclick="buyCos(${k},${i})">${k?`<span class="sw" style="background:${THB[i]}"></span><b>${c[0]}</b>`:`<span class="sk">${i?c[0]:'<i class="hi"></i>'}</span>`}<small>${own?(cur?t('Надето','Equipped'):t('Надеть','Equip')):'<i class="nectar"></i> '+c[1]}</small></button>`});h+='</div>'});
 if(shopYa()){h+=`<div class="sech"><b>${t('Пополнить Нектар','Get Nectar')}</b><span>${t('покупка через Яндекс Игры','via Yandex Games')}</span></div>`;
 PACKS.forEach((p,i)=>{h+=`<div class="row up shp"><span class="it nc">${ico('amphora')}</span><div class="ub"><b>${p[0]} ${t('Нектара','Nectar')}</b></div><button class="buy" onclick="buyPack(${i})"><b>${t('Купить','Buy')}</b></button></div>`})}return h}
function buyShop(i){const a=SHOP[i];if(S.nec<a[2])return;
 if(a[1]=='chest'){const k=a[3];S.nec-=a[2];qp('o');const tx=acGive(k);modal(`<h3>${AC[k][0]}</h3><p>${tx}</p>${okB()}`)}
 else if(a[1]=='pcd'){if(pcd()<=0)return;S.nec-=a[2];S.pt=0;toast(ico('check')+' '+t('Перерождение снова доступно','Rebirth is available again'),true)}
 else if(a[1]=='build'){if(!S.b.some(b=>b[1]))return;S.nec-=a[2];S.b.forEach(b=>{if(b[1])b[1]=1});hTick()}
 else if(a[1]=='quests'){S.nec-=a[2];S.q=null;qn();toast(ico('scroll')+' '+t('Задания дня обновлены — 8 новых во вкладке «Задания»','Daily quests refreshed — 8 new ones in the Quests tab'),true);navBadges()}
 else if(a[1]=='gf'){S.nec-=a[2];S.gf=Math.max(S.gf,NOW())+36e5;toast(ico('coins')+' '+t('Золотая лихорадка: золото ×2 на час','Gold Rush: gold ×2 for an hour'),true)}
 else if(a[1]=='hermes'){S.nec-=a[2];S.hermes=Math.max(S.hermes,NOW())+36e5;toast(ico('bolt')+' '+t('Гермес на час: урон ×2','Hermes for an hour: damage ×2'),true)}
 upd()}
// «Достроить» во вкладке «Дом» — только эту постройку
function finB(i){const a=SHOP.find(x=>x[1]=='build'),b=S.b[i];if(!a||!b||!b[1]||S.nec<a[2])return;S.nec-=a[2];b[1]=1;hTick();upd()}
function buyCos(k,i){if(!COS_ON)return;const c=COS[k][i][1];if(!S.own[k].includes(i)){if(S.nec<c)return;S.nec-=c;S.own[k].push(i)}if(k==0)S.skin=i;else S.theme=i;applyCos();upd()}
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
// ==== СПРАВКА: кнопка «?» в шапке — что за что отвечает. Запись: [картинка, заголовок ru/en, текст ru/en, вкладка для перехода]
function openHelp(){const H=[
 ['weapons/w_00',t('Удар и оружие','Clicks and weapons'),t('Нажимайте на монстра. Сила удара растёт от оружия во вкладке «Герой». Каждые 25 уровней предмета — урон ×2. 10% ударов — критические (×3).','Tap the monster to hit it. Click damage grows with weapons in the Hero tab. Every 25 levels doubles an item\'s damage. 10% of hits are critical (×3).'),'hero'],
 ['ui/q_r',t('Гнев Олимпа','Olympus Wrath'),t('Кликайте быстро — полоска под уроном заполнится, и на 8 секунд весь урон станет вдвое сильнее.','Click fast to fill the bar under your stats: for 8 seconds all damage is doubled.'),''],
 ['gods/g_00',t('Боги','Gods'),t('Боги бьют сами, даже без кликов и пока вас нет. С 50 уровня у бога открывается особая сила, с 200 — вдвое сильнее.','Gods attack on their own, even without clicks and while you are away. At level 50 a god gains a unique power, at level 200 it doubles.'),'gods'],
 ['ui/q_b',t('Этажи и боссы','Floors and bosses'),t('На каждом этаже 5 монстров, каждый 10-й этаж — босс: его нужно победить за 30 секунд. Не успели — прокачайтесь и нажмите «Перейти к битве с боссом».','Each floor has 5 monsters; every 10th floor is a boss you must beat in 30 seconds. If time runs out, upgrade and press «Fight the boss».'),''],
 ['icons/skill_1',t('Умения 1–4','Skills 1–4'),t('Открываются на 10, 50, 120 и 300 этаже. Кнопки под ареной или клавиши 1–4. Прокачиваются за души: «Герой → Умения».','Unlock at floors 10, 50, 120 and 300. Use the buttons under the arena or keys 1–4. Level them up with souls: Hero → Skills.'),''],
 ['ui/q_i',t('Вещи','Items'),t('Боссы оставляют сундук с добычей — нажмите на него. Наденьте вещи во вкладке «Вещи»: чем выше редкость, тем больше бонус ко всему урону. Несколько одинаковых вещей объединяются в одну реже.','Bosses drop a loot chest — tap it. Equip items in the Items tab: the higher the rarity, the bigger the bonus to all damage. Identical items merge into a rarer one.'),'inv'],
 ['ui/gift_0',t('Перерождение и души','Rebirth and souls'),t('Во вкладке «Дары»: игра начинается заново с части пройденного пути, а вы получаете души. Души навсегда усиливают весь урон, а ещё на них покупаются вечные дары и прокачка умений.','In the Gifts tab: restart from part of your run and receive souls. Souls permanently boost all damage and buy eternal gifts and skill levels.'),'pres'],
 ['ui/house_0',t('Дом','House'),t('Постройки за золото дают вечные бонусы: Кузница — к клику, Сад — к золоту, Библиотека — к урону богов. Строятся по времени и не сбрасываются при перерождении.','Buildings cost gold and give permanent bonuses: Forge to clicks, Garden to gold, Library to god damage. They take time to build and are kept after rebirth.'),'house'],
 ['ui/q_daily',t('Задания и вход','Quests and login'),t('Каждый день — 8 заданий и бонус за все. Награда за вход растёт 7 дней подряд, в 7-й день — души и Нектар.','8 daily quests plus a bonus for all. The login reward grows for 7 days in a row; day 7 gives souls and Nectar.'),'quest'],
 ['ui/feat_trophy',t('Подвиги и статистика','Feats and stats'),t('Подвиги — долгие цели за Нектар. Там же вкладка «Статистика» со всеми вашими рекордами.','Feats are long-term goals that give Nectar. The Stats view shows all your records.'),'top'],
 ['icons/icon_nectar',t('Нектар','Nectar'),t('Редкая валюта: за задания, подвиги, вход и фей. Тратится во вкладке «Награды» на сундуки и ускорения.','Rare currency from quests, feats, login and fairies. Spend it in Rewards on chests and boosts.'),'rew'],
 ['icons/fairy',t('Фея','Fairy'),t('Иногда пролетает над ареной — поймайте её, чтобы получить золото, Нектар или ускорение.','Sometimes flies across the arena — catch her for gold, Nectar or a speed boost.'),''],
 ['ui/gift_7',t('Пока вас нет','While you are away'),t('Боги продолжают приносить золото до 8 часов. Заберите его, когда вернётесь.','Gods keep earning gold for up to 8 hours. Collect it when you come back.'),'']];
 modal(`<div class="help"><h3>${ico('help')} ${t('Как играть','How to play')}</h3>${H.map(([im,n,d,tb])=>`<div class="hrow${tb?' go':''}"${tb?` onclick="closeM();navGo('${tb}')"`:''}><span class="it art"><img class="pi" src="img/${im}.webp" alt="" loading="lazy"></span><div><b>${n}</b><small>${d}</small></div>${tb?ico('up'):''}</div>`).join('')}<button onclick="closeM()">${t('Понятно','Got it')}</button></div>`)}
function openCfg(){modal(`<h3>${ico('gear')} ${t('Настройки','Settings')}</h3><p>${t('Эффекты','Effects')}<br><input type="range" min="0" max="100" value="${Math.round(S.vol[0]*100)}" oninput="setVol(0,this.value)"></p><p>${t('Музыка','Music')}<br><input type="range" min="0" max="100" value="${Math.round(S.vol[1]*100)}" oninput="setVol(1,this.value)"></p><p>${t('Язык','Language')}<br><button onclick="setLang('ru')">RU</button><button onclick="setLang('en')">EN</button></p>${PF.kind=='vk'?`<p><button onclick="vkShare()">${t('Рассказать друзьям','Tell friends')}</button>${VK_SUPPORT?`<button onclick="window.open(VK_SUPPORT,'_blank')">${t('Поддержка','Support')}</button>`:''}</p><p class="diag">${vkDiag()}</p>`:''}${okB()}`)}
// Шторка на телефоне: стрелку над списком можно нажать или потянуть вверх — список вкладки раскрывается на весь экран
// (арена прячется, валюта сверху и меню снизу остаются); вниз — обратно. В начале боя с боссом шторка сама сворачивается.
function sheet(on){try{const b=document.body;if(on===undefined)on=!b.classList.contains('sheet');b.classList.toggle('sheet',on);const g=$('grip');
 g.setAttribute('aria-expanded',on?'true':'false');g.setAttribute('aria-label',on?t('Свернуть список','Collapse list'):t('Развернуть список','Expand list'));
 setTimeout(()=>{fitK='';fitArena()},300)}catch(e){}}
const sheetOn=()=>{try{return document.body.classList.contains('sheet')}catch(e){return false}};
function gripInit(){const g=$('grip');if(!g)return;let y0=null,mv=false;
 g.addEventListener('pointerdown',e=>{y0=e.clientY;mv=false;try{g.setPointerCapture(e.pointerId)}catch(_){}});
 g.addEventListener('pointermove',e=>{if(y0!==null&&Math.abs(e.clientY-y0)>8)mv=true});
 g.addEventListener('pointerup',e=>{if(y0===null)return;const dy=e.clientY-y0;y0=null;if(dy<-30)sheet(true);else if(dy>30)sheet(false);else if(!mv)sheet()});
 g.addEventListener('pointercancel',()=>{y0=null});
 g.addEventListener('click',e=>{if(e.detail===0)sheet()})} // клавиатура: Enter/пробел
function uiInit(){gripInit();['pointerdown','keydown','touchend','click'].forEach(ev=>document.addEventListener(ev,audUnlock,{passive:true}));$('tipx').addEventListener('pointerdown',e=>{e.stopPropagation();tipOff()});$('tip').addEventListener('pointerdown',e=>e.stopPropagation());$('monster').addEventListener('animationend',e=>{if(e.animationName=='pop')$('monster').classList.remove('pop')});$('chest').addEventListener('pointerdown',e=>{e.stopPropagation();claimLoot()});$('cfg').onclick=openCfg;$('help').onclick=openHelp;$('fairy').addEventListener('pointerdown',e=>{e.stopPropagation();fairyTap()});$('fairy').addEventListener('animationend',()=>{$('fairy').hidden=true});fnx=NOW()+30e3;applyCos();
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
function drop(mr=0,loot=false){const cap=S.floor<200?1:S.floor<600?2:S.floor<1500?3:S.floor<4000?4:S.floor<7000?5:6,p=.2+Math.min(.25,S.floor/2e4)+.05*pt(15);let r=0;while(r<cap&&Math.random()<p)r++;const it={s:Math.floor(Math.random()*6),r:Math.max(r,mr)};(loot?S.loot:S.inv).push(it);if(S.loot.length>300)S.inv.push(S.loot.shift());qp('i');return it}
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
const itm=(s,r,sm)=>`<span class="it pic r${r}${sm?' sm':''}"><img class="pi" src="img/icons/slot_${s+1}.webp" alt=""></span>`;
function invH(){const m={},have={};S.inv.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});
 let h=`<div class="eqc"><div class="eqh"><b>${t('Надето','Equipped')}</b><span>${t('весь урон ×','all damage ×')}<em>${gearM().toFixed(2)}</em></span></div><div class="eqg">`+
  SL.map((n,i)=>{const r=S.eq[i];return r>=0?`<div class="slot">${itm(i,r)}<b>${n}</b><small class="rt r${r}">${RN[r]}</small><small>+${pct(RB[r])}%</small></div>`:
   `<div class="slot empty"><span class="it none pic"><img class="pi" src="img/icons/slot_${i+1}.webp" alt=""></span><b>${n}</b><small>${t('пусто','empty')}</small></div>`}).join('')+'</div></div>'+mergeH();
 const keys=Object.keys(m).sort((a,b)=>{const[x,y]=a.split('_').map(Number),[u,v]=b.split('_').map(Number);return v-y||x-u});let cur=-1;
 keys.forEach(k=>{const[s,r]=k.split('_').map(Number),n=m[k],need=NEED[r],top=r>=7,better=r>S.eq[s];
  if(r!==cur){cur=r;const tot=keys.filter(q=>+q.split('_')[1]===r).reduce((a,q)=>a+m[q],0);
   h+=`<div class="rh r${r}"><i class="gem"></i><b>${RN[r]}</b><span>+${pct(RB[r])}% ${t('за вещь','each')}</span><em>${tot} ${t('шт.','pcs')}</em></div>`}
  h+=`<div class="row itr r${r}">${itm(s,r)}<div class="ub"><div class="un"><b>${SL[s]}</b><span class="rn">${RN[r]}</span><span class="cnt">×${n}</span>${better?`<span class="bt">${t('лучше надетого','upgrade')}</span>`:''}</div>`+
   `<small>+${pct(RB[r])}% ${t('урона','damage')}${top?t(' · высшая редкость',' · top rarity'):` · ${t('синтез','merge')} ${Math.min(n,need)}/${need}`}</small>`+
   (top?'':`<div class="m2"><span><i style="width:${Math.min(100,Math.round(n/need*100))}%"></i></span></div>`)+`</div>`+
   `<div class="ia"><button class="${better?'pri':''}" onclick="equip(${s},${r})">${t('Надеть','Equip')}</button><button ${n<need||top?'disabled':''} onclick="craft(${s},${r})">${top?t('МАКС','MAX'):need+'→1'}</button></div></div>`});
 return h+(S.inv.length?'':'<div class="row"><small>'+t('Предметы выпадают с боссов (каждые 10 этажей).','Items drop from bosses (every 10 floors).')+'</small></div>')}
const hCost=i=>[2e3,1e4,5e4][i]*Math.pow(6,S.b[i][0]),hTime=i=>Math.min(21600,180*Math.pow(1.5,S.b[i][0]))*(1-.25*pt(8)); // 3 мин ×1.5 за уровень, не больше 6 ч
function build(i){const b=S.b[i],c=hCost(i);if(b[1]||S.gold<c)return;S.gold-=c;b[1]=NOW()+hTime(i)*1e3;qp('h');upd()}
// монстр и герой не заходят под заголовок арены (имя, этаж, здоровье, таймер босса): их высота ограничена местом под ним.
// Нижний край спрайта не двигается; на ПК места хватает и ограничение не срабатывает. --mmax/--hmax читает style.css
let fitK='',fitD=0;
function fitArena(){try{const d=$('dock'),dh=d&&Math.round(d.getBoundingClientRect().height);if(dh&&dh!==fitD){fitD=dh;document.documentElement.style.setProperty('--dockh',dh+'px')}}catch(e){} // реальная высота нижней панели арены — по ней поднимается подсказка
 try{const A=$('arena'),F=$('foe');if(!A||!F)return;const a=A.getBoundingClientRect();if(!a.height)return;
 const top=F.getBoundingClientRect().bottom-a.top+4,k=Math.round(a.height)+'|'+Math.round(top);if(k===fitK)return;fitK=k;
 [['monster','--mmax'],['hero','--hmax']].forEach(([id,v])=>{const e=$(id),b=parseFloat(getComputedStyle(e).bottom)||0;A.style.setProperty(v,Math.max(90,Math.floor(a.height-b-top))+'px')})}catch(e){}}
try{window.addEventListener('resize',()=>{fitK='';fitArena()})}catch(e){}
function hTick(){const n=NOW();let d=false;tipUI();fitArena();if(hk%5==0){S.st.bc=Math.max(S.st.bc||0,clickD());S.st.bd=Math.max(S.st.bd||0,dps());if(tab=='top'&&atab=='s')dirty=true}if(hk%5==0)navBadges();if(hk%10==0)achCheck();if(++hk%4==0&&dps()>0)heroAtk();if($('fairy').hidden&&n>fnx&&!paused)fairySpawn();lbFlush();if(dirty&&!busy()){dirty=false;tabRender()}S.b.forEach(b=>{if(b[1]&&b[1]<=n){b[0]++;b[1]=0;d=true}});
 if(tab=='rew')document.querySelectorAll('[data-ab]').forEach(b=>{const i=+b.dataset.ab,c=S.ac[i]-n,tx=abH(c,adsOff());if(b._h!==tx){b._h=tx;setList(b,tx)}b.disabled=c>0||adsOff()});if(tab=='pres'){const r=pcd(),g=soulGain();document.querySelectorAll('[data-pc]').forEach(e=>e.textContent=r>0?t('Кулдаун перерождения: ','Rebirth cooldown: ')+cdTxt(r):'');document.querySelectorAll('[data-pb]').forEach(e=>e.disabled=r>0||g<1)}if(tab!='house')return;if(d)tabRender();else{document.querySelectorAll('[data-ft]').forEach(e=>e.textContent=t('Строится: ','Building: ')+hms(Math.max(0,+e.dataset.ft-n)));document.querySelectorAll('[data-fb]').forEach(e=>e.style.width=Math.round(Math.min(1,1-(+e.dataset.fb-n)/+e.dataset.dur)*100)+'%')}}
// ======== ДОМ: постройки с вечными бонусами; идёт стройка — полоска и таймер ========
const BNI=['anvil','sprout','book'];
function houseH(){const sh=SHOP.findIndex(x=>x[1]=='build'),sc=SHOP[sh][2];
 return `<div class="hnote">${t('Бонусы построек вечные — они сохраняются после перерождения.','Building bonuses are permanent and survive rebirth.')}</div>`+BN.map((a,i)=>{const b=S.b[i],c=hCost(i),L=b[0],dur=hTime(i);
 return `<div class="row hb h${i}">${art('house_'+i,'big')}<div class="ub"><div class="un"><b>${a[0]}</b><span class="lv">${t('ур.','lv.')} ${L}</span></div>`+
  `<small>${a[1]} ${t('за ур.','per lv.')}</small><small class="nowv">${t('Сейчас','Now')} <em>+${10*L}%</em> → +${10*L+10}%</small>`+
  (b[1]?`<div class="m2 bld"><span><i data-fb="${b[1]}" data-dur="${dur*1e3}" style="width:${Math.round(Math.min(1,1-(b[1]-NOW())/(dur*1e3))*100)}%"></i></span><small data-ft="${b[1]}"></small></div>`:`<small>${t('Время постройки','Build time')}: ${hms(dur*1e3)}</small>`)+`</div>`+
  (b[1]?`<button class="buy nec" ${S.nec<sc?'disabled':''} onclick="finB(${i})"><b>${t('Достроить','Finish')}</b><span><i class="nectar"></i>${sc}</span></button>`:
  `<button class="buy" data-b="${c}" onclick="build(${i})"><b>${L?t('Улучшить','Upgrade'):t('Построить','Build')}</b><span><i class="coin"></i>${fmt(c)}</span></button>`)+`</div>`}).join('')}
function qpick(){const a=QD.map((_,i)=>i).sort(()=>Math.random()-.5),r=[],ks={};for(const i of a){if(adsOff()&&QD[i][1]=='a')continue;if(!ks[QD[i][1]]){ks[QD[i][1]]=1;r.push(i)}if(r.length==QN)break}return r}
function qn(){if(!S.q||!S.q.p||S.q.p.length!=QN||NOW()-S.q.t>864e5)S.q={t:NOW(),k:0,c:0,b:0,u:0,s:0,r:0,i:0,a:0,h:0,f:0,x:0,o:0,m:0,bn:0,d:Array(QN).fill(0),p:qpick()}}
// любой прогресс заданий/подвигов перерисует открытую вкладку на следующем тике (не во время нажатия в списке)
function qp(k,n=1){qn();S.q[k]+=n;S.st[k]=(S.st[k]||0)+n;if(tab=='quest'||tab=='top')dirty=true}
function qClaim(j){qn();const q=QD[S.q.p[j]];if(S.q.d[j]||S.q[q[1]]<q[2])return;S.q.d[j]=1;sfx('reward');S.gold+=rwG()*q[3];S.nec++;if(S.q.d.every(x=>x)&&!S.q.bn){S.q.bn=1;S.nec+=5}upd()}
function acGive(i){sfx('reward');const g=rwG(),[gm,ni,mr,so]=[[4,0,0,0],[10,1,0,0],[30,2,1,0],[100,3,2,1]][i];S.gold+=g*gm;const its=[];for(let k=0;k<ni;k++)its.push(drop(mr));let t='<i class="coin"></i>'+fmt(g*gm);if(so){const x=chestSouls();S.souls+=x;S.tot+=x;t+=' · <i class="soul"></i>'+x}return t+its.map(it=>'<br>'+itm(it.s,it.r,1)+' '+SL[it.s]+' · '+RN[it.r]+' (+'+pct(RB[it.r])+'%)').join('')}
function openAc(i){if(S.ac[i]>NOW())return;rewarded(()=>{qp('o');S.ac[i]=NOW()+AC[i][2];const tx=acGive(i);modal(`<h3>${AC[i][0]}</h3><p>${tx}</p>${okB()}`);upd()})}
// ======== НАГРАДЫ: видео-награды и сундуки (цвет по сорту), лавка Нектара, облики ========
const abH=(c,off)=>c>0?`<b>${hms(c)}</b><span>${t('перезарядка','cooldown')}</span>`:`<b>${t('Открыть','Open')}</b><span>${off?t('недоступно','unavailable'):t('за видео','watch video')}</span>`;
function rewH(){const n=NOW(),off=adsOff();let h='';
 if(PF.kind=='cg'&&PF.noAds&&!PF.adblock)return shopH();
 if(off)h+=`<div class="note">${adOffMsg()}. ${t('Награды можно получить за Нектар ниже.','You can still get rewards for Nectar below.')}</div>`;
 h+=`<div class="sech"><b>${t('За просмотр видео','For watching a video')}</b><span>${t('бесплатно, по таймеру','free, on a timer')}</span></div>`;
 if(PF.kind=='cg'){const hh=S.hermes-n,cc=S.chest-n;
  h+=`<div class="row up shp">${art('rew_hermesad')}<div class="ub"><b>${t('Буст Гермеса','Hermes Boost')}</b><small>${t('×2 урона на 10 минут','×2 damage for 10 minutes')}</small></div><button class="buy" ${hh>0||off?'disabled':''} onclick="hermesAd()">${hh>0?`<b>${hms(hh)}</b><span>${t('действует','active')}</span>`:`<b>${t('Смотреть','Watch')}</b><span>${t('видео','video')}</span>`}</button></div>`;
  h+=`<div class="row up shp">${art('rew_charon')}<div class="ub"><b>${t('Сундук Харона',"Charon's Chest")}</b><small>${t('Золото раз в 4 часа','Gold every 4 hours')}</small></div><button class="buy" ${cc>0||off?'disabled':''} onclick="chestAd()">${cc>0?`<b>${hms(cc)}</b><span>${t('перезарядка','cooldown')}</span>`:`<b>${t('Смотреть','Watch')}</b><span>${t('видео','video')}</span>`}</button></div>`}
 return h+AC.map((a,i)=>{const c=S.ac[i]-n;return `<div class="row up shp">${art(ACA[i])}<div class="ub"><b>${a[0]}</b><small>${acD(i)}</small><small class="nowv">${t('Перезарядка','Cooldown')} ${hms(a[2])}</small></div><button class="buy" data-ab="${i}" ${c>0||off?'disabled':''} onclick="openAc(${i})">${abH(c,off)}</button></div>`}).join('')+shopH()}
const dg=n=>rwG()*5*n;
function dayStrip(cur,got){let h='';for(let i=0;i<7;i++)h+=`<div class="day${i==cur?' cur':i<got?' got':''}${i==6?' big':''}"><small>${t('День ','Day ')}${i+1}</small>${i<got&&i!=cur?ico('check'):`<b><i class="coin"></i>${fmt(dg(i+1))}</b>`}${i==6?`<span><i class="soul"></i>${fmt(daySouls())} <i class="nectar"></i>10</span>`:''}</div>`;return h}
function dClaim(){const t=new Date(NOW()).toDateString();if(S.dl==t)return;const y=new Date(NOW()-864e5).toDateString(),n=S.dl==y?S.day:0;
 S.gold+=rwG()*5*(n+1);if(n==6){const x=daySouls();S.souls+=x;S.tot+=x;S.nec+=10}S.day=(n+1)%7;S.dl=t;sfx('reward');upd()}
// ======== ЗАДАНИЯ: вход по дням, задания с иконкой по типу, прогрессом и наградой ========
const QI={k:'skull',c:'target',b:'crown',u:'up',s:'star',r:'flame',i:'helmet',a:'play',h:'house',f:'stairs',x:'bolt',o:'chest',m:'gem'};
function questH(){qn();const td=new Date(NOW()).toDateString(),y=new Date(NOW()-864e5).toDateString(),nx=(S.dl==y?S.day:0)+1,ok=S.dl!=td,qg=rwG(),xtra=k=>k==7?` <i class="soul"></i>${fmt(daySouls())} <i class="nectar"></i>10`:'';
 let h=`<div class="dly"><div class="dly-h">${art('q_daily','big')}<div class="ub"><b>${t('Ежедневный вход','Daily login')}</b><small>${ok?t('День ','Day ')+nx+t(' из 7 — заберите награду',' of 7 — claim your reward'):t('Сегодня получено. Завтра (день ','Claimed today. Tomorrow (day ')+(S.day+1)+'): ≈<i class="coin"></i>'+fmt(dg(S.day+1))+xtra(S.day+1)}</small></div>`+
  `<button class="buy" ${ok?'':'disabled'} onclick="dClaim()">${ok?`<b>${t('Забрать','Claim')}</b><span><i class="coin"></i>${fmt(dg(nx))}</span>`:`<b>${ico('check')}</b>`}</button></div><div class="days">${dayStrip(ok?nx-1:-1,ok?nx-1:(S.day||7))}</div></div>`;
 const L=S.q.p.map((qi,j)=>{const q=QD[qi],v=Math.min(S.q[q[1]],q[2]),dn=S.q.d[j],rd=!dn&&v>=q[2];return{q,v,j,dn,rd,o:rd?0:dn?2:1}}).sort((a,b)=>a.o-b.o||a.j-b.j),dc=S.q.d.filter(x=>x).length;
 h+=`<div class="sech"><b>${t('Задания дня','Daily quests')}</b><span>${t('обновятся через ','refresh in ')}${Math.ceil((864e5-(NOW()-S.q.t))/36e5)} ${t('ч.','h')}</span></div>`;
 h+=L.map(({q,v,j,dn,rd})=>`<div class="row up qr${rd?' rdy':dn?' done':''}">${art(dn?'q_done':QI[q[1]]?'q_'+q[1]:'q_bonus',rd?'rdy':dn?'done':'')}<div class="ub"><b>${q[0]}</b><div class="m2"><span><i style="width:${Math.round(v/q[2]*100)}%"></i></span><small>${v}/${q[2]}</small></div><small class="rw">${t('награда','reward')} <i class="coin"></i>${fmt(qg*q[3])} · <i class="nectar"></i>1</small></div>`+
  `<button class="buy" ${dn||!rd?'disabled':''} onclick="qClaim(${j})">${dn?`<b>${t('Получено','Claimed')}</b>`:`<b>${t('Забрать','Claim')}</b>`}</button></div>`).join('');
 return h+`<div class="row qb${S.q.bn?' done':''}">${art('q_bonus',S.q.bn?'done':'')}<div class="ub"><b>${t('Все задания дня','All daily quests')}: ${dc}/${QN}</b><div class="m2"><span><i style="width:${Math.round(dc/QN*100)}%"></i></span></div><small>${S.q.bn?t('Бонус получен','Bonus claimed'):t('Бонус за все: ','Bonus for all: ')+'<i class="nectar"></i>5'}</small></div></div>`}
// Вечные дары: цена растёт линейно — TL[i]·(ур.+1). Раньше удваивалась (3, 6, 12, 24…), и после ~10 ур. дары переставали
// покупаться; линейно: Мощь Зевса 6, 12, 18, 24… Шаг = 2× прежней базовой цены (с базой в 1× середина игры ускорялась до +40%).
// 9-й дар «Воды Леты»: +10% душ за перерождение за ур., 30, 60 … 450, потолок 15 ур. = +150%.
const TL=[6,6,6,10,10,16,16,20,30],TM=[1e9,1e9,1e9,1e9,25,20,15,16,15],tc=i=>TL[i]*((S.t[i]|0)+1);
function soulG(x){return Math.floor(x/5*(1+x/400))}
// Души из Золотого сундука и за 7-й день входа растут вместе с рекордом: доля от «полного перерождения» с рекорда
// (души за путь от стартового этажа 30% до рекорда). Сундук — 10% (не меньше 2), 7-й день — 25% (не меньше 5).
const soulRun=()=>Math.max(0,soulG(S.max)-soulG(Math.floor(START_FRAC*S.max)));
const acD=i=>i==3?AC[3][1].replace(/ \+ (души|souls)$/,'')+' + <i class="soul"></i>'+fmt(chestSouls()):AC[i][1]; // описание сундука; у Золотого — сколько душ сейчас
const chestSouls=()=>Math.max(2,Math.floor(soulRun()*.1)),daySouls=()=>Math.max(5,Math.floor(soulRun()*.25));
function soulGain(){return Math.floor(Math.max(0,soulG(S.run)-soulG(S.sf))*(1+.1*pt(12))*(1+.1*(S.t[8]|0)))}
const START_FRAC=.3;
function startF(){let f=Math.max(1,Math.floor(START_FRAC*S.run));if(isBoss(f))f--;return Math.max(1,f)}
function skipGold(f){let g=0;for(let i=1;i<=f;i++)g+=mHP(i)*.1*(isBoss(i)?3:1);return g*bld(1)*T(1)}
function pct(x){return +(x*100).toFixed(1)}
function buyT(i){if(S.t[i]>=TM[i]||S.souls<tc(i))return;S.souls-=tc(i);S.t[i]++;upd()}
// ======== ДАРЫ: алтарь перерождения и вечные дары за души ========
const TNI=['bolt','coins','laurel','blades','target','star','hourglass','moon','orb'];
const tNow=(i,l)=>[`+${10*l}%`,`+${10*l}%`,`+${10*l}%`,`×${(3+.2*l).toFixed(1)}`,`+${l}%`,`+${10*l}%`,`−${Math.round(100-100*Math.max(.5,1-.03*l))}%`,`+${30*l} ${t('мин','min')}`,`+${10*l}%`][i];
function altH(){const g=soulGain(),now=soulM(),aft=Math.pow(1+(S.tot+g)*.05,1.5);
 return `<div class="alt"><div class="alt-h">${art('gift_0','big')}<div><b>${t('Алтарь Никты','Altar of Nyx')}</b><small>${t('Души — вечный бонус к урону: ×(1+0,05·души)^1,5','Souls give a permanent damage bonus: ×(1+0.05·souls)^1.5')}</small></div></div>`+
  `<div class="alt-s"><div><small>${t('Души','Souls')}</small><b><i class="soul"></i> ${fmt(S.souls)}</b></div><div><small>${t('Урон от душ','Soul damage')}</small><b>×${fmt(now)}</b></div></div>`+
  `<div class="alt-g"><div><small>${t('За перерождение','On rebirth')}</small><b>+${fmt(g)} ${t('душ','souls')}</b></div><div class="arr">→</div><div><small>${t('Урон станет','Damage becomes')}</small><b>×${fmt(aft)}</b></div></div>`+
  `<small class="alt-n">${t(`Лучший этаж забега: ${S.run}, коэф. ×${(1+S.run/400).toFixed(2)}; следующий старт с этажа ${startF()}`,`Best floor this run: ${S.run}, bonus ×${(1+S.run/400).toFixed(2)}; next run starts at floor ${startF()}`)}</small>`+
  `<small class="alt-c" data-pc></small><button class="soulb" data-pb onclick="prestige()" ${g<1||pcd()>0?'disabled':''}>${t('Переродиться','Rebirth')}</button></div>`+
  `<div class="sech"><b>${t('Вечные дары','Eternal gifts')}</b><span>${t('остаются после перерождения','kept after rebirth')}</span></div>`}
function talH(){return TN.map((a,i)=>{const l=S.t[i],mx=l>=TM[i],cap=TM[i]<1e9,c=tc(i);return `<div class="row up tal${mx?' mx':''}">${art('gift_'+(i+1))}<div class="ub"><div class="un"><b>${a[0]}</b><span class="lv">${t('ур.','lv.')} ${l}${cap?'/'+TM[i]:''}</span></div>`+
  `<small>${a[1]}</small><small class="nowv">${t('Сейчас','Now')} <em>${tNow(i,l)}</em></small>`+(cap?`<div class="m2"><span><i style="width:${Math.round(l/TM[i]*100)}%"></i></span></div>`:'')+`</div>`+
  `<button class="buy soul" ${mx||S.souls<c?'disabled':''} onclick="buyT(${i})">${mx?`<b>${t('МАКС','MAX')}</b>`:`<b>+1 ${t('ур.','lv.')}</b><span><i class="soul"></i>${fmt(c)}</span>`}</button></div>`}).join('')}


// ======== ТЕКСТЫ (ru/en). setTexts вызывается до init и после выбора языка ========
function setTexts(l){LANG=l=='en'?'en':'ru';
 ACTS=[[500,t('Тартар','Tartarus'),'👹',t('Тартара','Tartarus')],[2000,t('Асфодель','Asphodel'),'💀',t('Асфоделя','Asphodel')],[4500,t('Элизиум','Elysium'),'🗡️',t('Элизиума','Elysium')],[7000,t('Олимп','Olympus'),'⚡',t('Олимпа','Olympus')],[9000,t('Вход в Хаос','Gates of Chaos'),'🌑',t('Входа в Хаос','the Gates of Chaos')],[10000,t('Сердце Хаоса','Heart of Chaos'),'🌀',t('Сердца Хаоса','the Heart of Chaos')]];
 BOSSES={50:t('Мегера','Megaera'),100:t('Алекто','Alecto'),250:t('Тисифона','Tisiphone'),500:t('Лернейская Гидра','Lernaean Hydra'),750:t('Лавовый Кентавр','Lava Centaur'),1000:t('Тесей','Theseus'),1500:t('Астерий','Asterion'),2000:t('Тесей и Минотавр','Theseus and the Minotaur'),2500:t('Ахилл','Achilles'),3000:t('Патрокл','Patroclus'),4500:t('Владыка Аид','Lord Hades'),5000:t('Прометей','Prometheus'),5500:t('Гера','Hera'),7000:t('Верховный Зевс','Zeus the Almighty'),7500:t('Харон','Charon'),8000:t('Тифон','Typhon'),9000:t('Кронос','Kronos'),9250:t('Уран','Uranus'),9500:t('Гея','Gaia'),9750:t('Аид Титан','Titan Hades'),10000:t('Абсолютный Хаос','Absolute Chaos')};
 WEAPONS=[[t('Меч Стикса','Sword of Styx'),1,15],[t('Копьё Афины','Spear of Athena'),12,180],[t('Щит Хаоса','Shield of Chaos'),90,1500],[t('Лук Икара','Bow of Icarus'),700,14e3],[t('Клинки Деметры','Blades of Demeter'),5e3,1.3e5],[t('Секира Геракла','Axe of Heracles'),4e4,1.2e6],[t('Трезубец Посейдона','Trident of Poseidon'),3e5,1.1e7],[t('Молния Зевса','Thunderbolt of Zeus'),2.5e6,1e8],[t('Коса Хроноса','Scythe of Chronos'),2e7,9e8],[t('Серп Тьмы','Sickle of Darkness'),2e8,8e9],[t('Клинок Всездания','Blade of All-Creation'),2e9,7e10],[t('Нить Мойр','Thread of the Moirai'),2e10,6.3e11],[t('Коса Таната','Scythe of Thanatos'),2e11,5.7e12],[t('Клинок Эреба','Blade of Erebus'),2e12,5.1e13],[t('Жало Тифона','Sting of Typhon'),2e13,4.6e14],[t('Молот Титанов','Hammer of the Titans'),2e14,4.1e15],[t('Око Хаоса','Eye of Chaos'),2e15,3.7e16]];
 GODS=[[t('Зевс','Zeus'),4,30],[t('Посейдон','Poseidon'),40,350],[t('Арес','Ares'),320,3e3],[t('Афродита','Aphrodite'),2600,3e4],[t('Аполлон','Apollo'),2e4,3e5],[t('Гермес','Hermes'),1.8e5,3e6],[t('Деметра','Demeter'),1.6e6,3e7],[t('Афина','Athena'),1.4e7,3e8],[t('Гефест','Hephaestus'),1.2e8,2.5e9],[t('Дионис','Dionysus'),1e9,2e10],[t('Артемида','Artemis'),9e9,1.8e11],[t('Никта','Nyx'),8e10,1.6e12],[t('Геката','Hecate'),7e11,1.4e13],[t('Танат','Thanatos'),6e12,1.2e14],[t('Хипнос','Hypnos'),5.5e13,1.1e15],[t('Мойры','The Moirai'),5e14,1e16],[t('Эреб','Erebus'),4.5e15,9e16],[t('Эфир','Aether'),4e16,8e17]];
 SL=[t('Шлем','Helmet'),t('Доспех','Armor'),t('Оружие','Weapon'),t('Амулет','Amulet'),t('Кольцо','Ring'),t('Плащ','Cloak')];
 RN=[t('Обычный','Common'),t('Редкий','Rare'),t('Эпический','Epic'),t('Легендарный','Legendary'),t('Мифический','Mythic'),t('Божественный','Divine'),t('Титанический','Titanic'),t('Первородный','Primordial')];
 BN=[[t('Кузница Гефеста','Forge of Hephaestus'),t('+10% урона клика','+10% click damage')],[t('Сад Персефоны','Garden of Persephone'),t('+10% золота','+10% gold')],[t('Библиотека Афины','Library of Athena'),t('+10% урона богов','+10% god damage')]];
 TN=[[t('Мощь Зевса','Might of Zeus'),t('+10% урона клика за ур.','+10% click damage per lv.')],[t('Золото Плутоса','Gold of Plutus'),t('+10% золота за ур.','+10% gold per lv.')],[t('Дар богов','Gift of the Gods'),t('+10% урона богов за ур.','+10% god damage per lv.')],[t('Рука Ареса','Hand of Ares'),t('+0,2 к множителю крита (база ×3) за ур.','+0.2 crit multiplier (base ×3) per lv.')],[t('Глаз Аполлона','Eye of Apollo'),t('+1% к шансу крита за ур.','+1% crit chance per lv.')],[t('Мастерство умений','Skill Mastery'),t('+10% к силе и длительности активных умений за ур.','+10% active skill power and duration per lv.')],[t('Эхо Хроноса','Echo of Chronos'),t('−3% к перезарядке умений за ур.','−3% skill cooldown per lv.')],[t('Терпение Аида','Patience of Hades'),t('+30 мин к лимиту офлайн-дохода за ур.','+30 min offline earnings cap per lv.')],[t('Воды Леты','Waters of Lethe'),t('+10% душ за перерождение за ур.','+10% souls from rebirth per lv.')]];
 QD=[[t('Убить 250 монстров','Kill 250 monsters'),'k',250,3],[t('Убить 1000 монстров','Kill 1000 monsters'),'k',1000,8],[t('Сделать 300 кликов','Make 300 clicks'),'c',300,3],[t('Сделать 1000 кликов','Make 1000 clicks'),'c',1000,8],[t('Победить босса','Defeat a boss'),'b',1,3],[t('Победить 3 боссов','Defeat 3 bosses'),'b',3,9],
 [t('Купить 10 улучшений','Buy 10 upgrades'),'u',10,4],[t('Использовать умения 3 раза','Use skills 3 times'),'s',3,4],[t('Включить Гнев Олимпа','Trigger Olympus Wrath'),'r',1,3],[t('Получить 3 предмета','Get 3 items'),'i',3,5],[t('Посмотреть рекламу 2 раза','Watch 2 videos'),'a',2,6],[t('Начать постройку здания','Start a building'),'h',1,3],[t('Открыть 5 новых этажей','Reach 5 new floors'),'f',5,6],
 [t('Нанести 100 критов','Land 100 crits'),'x',100,3],[t('Нанести 500 критов','Land 500 crits'),'x',500,7],[t('Открыть сундук за рекламу','Open a chest'),'o',1,5],[t('Открыть 3 сундука','Open 3 chests'),'o',3,12],[t('Сделать 3 синтеза предметов','Merge items 3 times'),'m',3,5],[t('Сделать 10 синтезов','Merge items 10 times'),'m',10,12],
 [t('Посмотреть рекламу 5 раз','Watch 5 videos'),'a',5,12],[t('Победить 5 боссов','Defeat 5 bosses'),'b',5,14],[t('Убить 2500 монстров','Kill 2500 monsters'),'k',2500,18],[t('Сделать 3000 кликов','Make 3000 clicks'),'c',3000,18],[t('Купить 50 улучшений','Buy 50 upgrades'),'u',50,10],[t('Использовать умения 10 раз','Use skills 10 times'),'s',10,10],[t('Открыть 20 новых этажей','Reach 20 new floors'),'f',20,14],[t('Получить 10 предметов','Get 10 items'),'i',10,12]];
 AC=[[t('Награда за видео','Video reward'),t('золото за просмотр видео','gold for watching a video'),6e5],[t('Бронзовый сундук','Bronze chest'),t('золото + 1 предмет','gold + 1 item'),36e5],[t('Серебряный сундук','Silver chest'),t('много золота + 2 предмета (не ниже редких)','lots of gold + 2 items (Rare or better)'),108e5],[t('Золотой сундук','Gold chest'),t('очень много золота + 3 предмета (не ниже эпических) + души','tons of gold + 3 items (Epic or better) + souls'),288e5]];
 SK=[[t('Удар Стикса','Styx Strike'),'🗡️',0,30,0,t('мгновенный удар в 20× урона клика','instant hit for 20× click damage'),t('Удар','Strike')],[t('Бросок Афины',"Athena's Throw"),'🔱',1,45,8,t('8 с: +5 автокликов в секунду','8 s: +5 auto-clicks per second'),t('Бросок','Throw')],[t('Вихрь Хаоса','Chaos Vortex'),'🌀',2,60,10,t('10 с: урон богов в секунду ×3','10 s: gods\' damage per second ×3'),t('Вихрь','Vortex')],[t('Гнев Икара',"Icarus' Fury"),'🏹',3,60,10,t('10 с: урон клика ×3','10 s: click damage ×3'),t('Гнев','Fury')]];
 PS=[[t('Молния','Lightning'),t('каждые 8 с удар в 10× урона в секунду','every 8 s a strike for 10× damage per second')],[t('Дар приливов','Gift of Tides'),t('+30% золота','+30% gold')],[t('Жажда битвы','Battle Thirst'),t('+25% урона клика','+25% click damage')],[t('Очарование','Charm'),t('монстры слабее на 10%','monsters are 10% weaker')],[t('Золотая стрела','Golden Arrow'),t('+15% к шансу крита','+15% crit chance')],[t('Быстрые ноги','Swift Feet'),t('Гнев Олимпа с 9 кликов вместо 12','Olympus Wrath after 9 clicks instead of 12')],[t('Долгое лето','Long Summer'),t('умения действуют на 20% дольше','skills last 20% longer')],[t('Мудрость','Wisdom'),t('+10 с к таймеру босса','+10 s to the boss timer')],[t('Горн Гефеста','Forge of Hephaestus'),t('постройки строятся на 25% быстрее','buildings finish 25% faster')],[t('Буйный пир','Wild Feast'),t('+25% урона богов','+25% gods damage')],[t('Охота','The Hunt'),t('боссы слабее на 10%','bosses are 10% weaker')],[t('Покров ночи','Veil of Night'),t('+50% офлайн-дохода','+50% offline income')],[t('Колдовство','Witchcraft'),t('+10% душ при перерождении','+10% souls on rebirth')],[t('Последний удар','Final Blow'),t('+1 к множителю крита','+1 crit multiplier')],[t('Вещие сны','Prophetic Dreams'),t('+1 предмет с боссов','+1 item from bosses')],[t('Нить судьбы','Thread of Fate'),t('чаще выпадают редкие вещи','rare items drop more often')],[t('Мрак','Gloom'),t('−10% к перезарядке умений','−10% skill cooldown')],[t('Сияние эфира','Radiance of Aether'),t('+20% ко всему урону','+20% to all damage')]];
 SHOP=[[t('Бронзовый сундук','Bronze chest'),'chest',4,1],[t('Серебряный сундук','Silver chest'),'chest',10,2],[t('Золотой сундук','Gold chest'),'chest',25,3],[t('Сброс перезарядки перерождения','Rebirth cooldown reset'),'pcd',6],[t('Достроить все здания','Finish all buildings'),'build',3],[t('Новые задания дня','New daily quests'),'quests',5],[t('Золотая лихорадка','Gold Rush'),'gf',12],[t('Гермес на час','Hermes for an hour'),'hermes',15]];
 SHD=[t('без видео','no video'),t('без видео','no video'),t('без видео','no video'),t('переродиться можно сразу','rebirth again right away'),t('стройки завершатся мгновенно','buildings finish instantly'),t('свежий набор из 8 заданий','a fresh set of 8 quests'),t('×2 золота на 1 час','×2 gold for 1 hour'),t('×2 урона на 1 час','×2 damage for 1 hour')];
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
function achCheck(silent){let nw=0;ACH.forEach(a=>{if(!S.achN[a[0]]&&a[3]()){S.achN[a[0]]=1;nw++;if(!silent)toast(ico('trophy')+' '+t(a[1],a[2]),true)}});
 if(nw){achNav();if(tab=='top')dirty=true}}
function achNav(){navBadges()}
const achReady=()=>ACH.filter(a=>S.achN[a[0]]&&!S.ach[a[0]]).length;
function achLbl(){return t('Подвиги','Feats')}
function achClaim(id){const a=ACH.find(x=>x[0]==id);if(!a||!S.achN[id]||S.ach[id])return;S.ach[id]=1;S.nec+=a[4];sfx('reward');toast('<i class="nectar"></i> +'+a[4],true);achNav();upd()}
// прогресс к подвигу: [сколько сейчас, сколько нужно]
const ACP={k1:()=>[st('k'),1],k2:()=>[st('k'),1000],k3:()=>[st('k'),25000],k4:()=>[st('k'),25e4],b1:()=>[st('b'),1],b2:()=>[st('b'),50],b3:()=>[st('b'),500],f1:()=>[S.max,100],f2:()=>[S.max,500],f3:()=>[S.max,1000],f4:()=>[S.max,2000],f5:()=>[S.max,4500],f6:()=>[S.max,7000],f7:()=>[st('win'),1],
 c1:()=>[st('c'),1000],c2:()=>[st('c'),2e4],x1:()=>[st('x'),500],p1:()=>[S.pc,1],p2:()=>[S.pc,10],m1:()=>[st('m'),25],i1:()=>[Math.max(0,...S.eq)+1,5],g1:()=>[S.g.slice(0,8).filter(l=>l>=10).length,8],s1:()=>[S.sl.reduce((a,b)=>a+b,0),20],o1:()=>[st('o'),20]};
const FI={k:'skull',b:'crown',f:'stairs',c:'target',x:'bolt',p:'orb',m:'gem',i:'helmet',g:'laurel',s:'star',o:'chest'};
// ==== СТАТИСТИКА: вкладка «Подвиги → Статистика». Счётчики — S.st (переживают перерождение): c клики, x криты, k убийства, b боссы, l поражения,
// r Гнев Олимпа, s умения, u улучшения, i вещи, m объединения, h постройки, o сундуки, fy феи, g золото с монстров, t секунды в игре, bc/bd рекорды урона
const fmtT=s=>{s=Math.floor(s||0);const d=Math.floor(s/86400),h=Math.floor(s%86400/3600),m=Math.floor(s%3600/60);return d?d+t(' д ',' d ')+h+t(' ч',' h'):h?h+t(' ч ',' h ')+m+t(' мин',' min'):m?m+t(' мин',' min'):t('меньше минуты','under a minute')};
function statH(){const v=k=>S.st[k]||0,ti=(src,lb,val)=>`<div class="stt"><span class="it art"><img class="pi" src="img/${src}.webp" alt="" loading="lazy"></span><div><small>${lb}</small><b>${val}</b></div></div>`,
 sec=(nm,items)=>`<div class="sech"><b>${nm}</b></div><div class="stg">${items.join('')}</div>`;
 return sec(t('Путь наверх','The climb'),[ti('ui/q_f',t('Лучший этаж','Best floor'),fmt(S.max)),ti('ui/feat_p',t('Перерождений','Rebirths'),fmt(S.pc||0)),ti('ui/gift_0',t('Душ за всё время','Souls in total'),fmt(S.tot)),ti('ui/gift_7',t('Время в игре','Time played'),fmtT(v('t')))])+
  sec(t('Бой','Combat'),[ti('ui/q_c',t('Кликов','Clicks'),fmt(v('c'))),ti('ui/q_x',t('Критических ударов','Critical hits'),fmt(v('x'))),ti('ui/q_k',t('Монстров повержено','Monsters slain'),fmt(v('k'))),ti('ui/q_b',t('Боссов повержено','Bosses slain'),fmt(v('b'))),ti('ui/feat_k',t('Поражений от боссов','Boss defeats'),fmt(v('l'))),ti('ui/q_r',t('Гнев Олимпа','Olympus Wrath'),fmt(v('r'))),ti('ui/q_s',t('Умений применено','Skills used'),fmt(v('s'))),ti('weapons/w_00',t('Рекорд урона клика','Best click damage'),fmt(Math.max(v('bc'),clickD()))),ti('gods/g_00',t('Рекорд урона богов','Best gods damage'),fmt(Math.max(v('bd'),dps()))+t('/с','/s'))])+
  sec(t('Добыча и развитие','Loot and growth'),[ti('ui/rew_rush',t('Золота с монстров','Gold from monsters'),fmt(v('g'))),ti('ui/q_u',t('Улучшений куплено','Upgrades bought'),fmt(v('u'))),ti('ui/q_i',t('Вещей найдено','Items found'),fmt(v('i'))),ti('ui/q_m',t('Объединений','Merges'),fmt(v('m'))),ti('ui/q_h',t('Построек','Buildings'),fmt(v('h'))),ti('ui/q_o',t('Сундуков открыто','Chests opened'),fmt(v('o'))),ti('icons/fairy',t('Фей поймано','Fairies caught'),fmt(v('fy')))])}
function achH(){const done=ACH.filter(a=>S.ach[a[0]]).length,nt=ACH.reduce((x,a)=>x+a[4],0),ng=ACH.reduce((x,a)=>x+(S.ach[a[0]]?a[4]:0),0);
 let h=`<div class="dly"><div class="dly-h">${art('feat_trophy','big')}<div class="ub"><b>${t('Подвиги','Feats')}: ${done} / ${ACH.length}</b><small>${t('Получено Нектара: ','Nectar earned: ')}<i class="nectar"></i>${ng} / ${nt}</small><div class="m2"><span><i style="width:${Math.round(done/ACH.length*100)}%"></i></span></div></div></div></div>`;
 if(shopYa())h+=`<div class="row up shp"><span class="it c2">${ico('stairs')}</span><div class="ub"><b>${t('Лидерборд','Leaderboard')}</b><small>${t('Рекорд: этаж ','Record: floor ')}${S.max}</small></div><button class="buy" onclick="showLB()"><b>${t('Открыть','Open')}</b></button></div>`;
 const ord=a=>S.achN[a[0]]&&!S.ach[a[0]]?0:S.ach[a[0]]?2:1;
 ACH.slice().sort((a,b)=>ord(a)-ord(b)).forEach(a=>{const id=a[0],got=S.achN[id],cl=S.ach[id],stt=cl?'done':got?'rdy':'lock',pr=ACP[id]?ACP[id]():null;
  h+=`<div class="row up fr ${stt}">${art(cl?'q_done':FI[id[0]]?'feat_'+id[0]:'feat_trophy',stt=='rdy'?'rdy':stt=='done'?'done':'off')}<div class="ub"><b>${t(a[1],a[2])}</b><small>${t(ACHD[id][0],ACHD[id][1])}</small>`+
   (stt=='lock'&&pr&&pr[1]>1?`<div class="m2"><span><i style="width:${Math.min(100,Math.round(pr[0]/pr[1]*100))}%"></i></span><small>${fmt(Math.min(pr[0],pr[1]))}/${fmt(pr[1])}</small></div>`:'')+`</div>`+
   `<button class="buy nec" ${got&&!cl?'':'disabled'} onclick="achClaim('${id}')">${cl?`<b>${t('Получено','Claimed')}</b>`:`<b>${got?t('Забрать','Claim'):t('Награда','Reward')}</b><span><i class="nectar"></i>${a[4]}</span>`}</button></div>`});return h}
// ======== ПОДСКАЗКИ ДЛЯ НОВИЧКА ========
// шаг показывается, пока не выполнено его условие; крестик скрывает все подсказки
// ==== ОБУЧЕНИЕ: подсказки по всем механикам. Шаг: id, когда показать, когда выполнен, текст ru/en, что подсветить.
// Шаги не блокируют друг друга: показывается первый невыполненный, чьё условие показа выполнено; показанный держится, пока не выполнен.
// Выполненные — в S.td[id]. Кнопка/пункт меню получает .hl (пульс), монстр — кольцо #tapr; пункт, спрятанный в «Ещё» на телефоне, — подсветка «Ещё».
const q$=s=>document.querySelector(s),vis=e=>!!(e&&e.getClientRects&&e.getClientRects().length),
 navB=k=>{const b=q$('#nav [data-t="'+k+'"]');return vis(b)?b:$('more')},inTab=(k,sel)=>tab==k?q$(sel):navB(k);
const canMerge=()=>{const m={};S.inv.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});return Object.keys(m).some(k=>{const r=+k.split('_')[1];return r<7&&m[k]>=NEED[r]})};
const TIPS=[
 {id:'tap',on:()=>true,done:()=>st('c')>=10,ru:'Нажимайте на монстра, чтобы атаковать',en:'Tap the monster to attack',hl:()=>'mon'},
 {id:'sword',on:()=>S.gold>=15,done:()=>S.w[0]>=2,ru:'Улучшите Меч Стикса — удар станет сильнее',en:'Upgrade the Sword of Styx to hit harder',hl:()=>inTab('hero','[data-k="w"][data-i="0"]')},
 {id:'god',on:()=>S.gold>=30,done:()=>S.g.some(l=>l>0),ru:'Наймите бога — он бьёт сам, даже без кликов',en:'Hire a god — gods attack on their own',hl:()=>inTab('gods','[data-k="g"][data-i="0"]')},
 {id:'daily',on:()=>S.max>=3,done:()=>!!S.dl,ru:'Заберите награду за вход во вкладке «Задания»',en:'Claim your daily reward in Quests',hl:()=>inTab('quest','.dly .buy')},
 {id:'boss',on:()=>S.floor>=8&&S.max<10,done:()=>S.max>=11,ru:'Каждые 10 этажей — босс: победите его за 30 секунд',en:'Every 10 floors a boss appears: beat it within 30 seconds',hl:()=>null},
 {id:'loot',on:()=>S.loot.length>0,done:()=>S.inv.length>0||S.eq.some(r=>r>=0),ru:'Боссы оставляют добычу — откройте сундук на арене',en:'Bosses drop loot — open the chest in the arena',hl:()=>$('chest')},
 {id:'equip',on:()=>S.inv.length>0,done:()=>S.eq.some(r=>r>=0),ru:'Наденьте вещь во вкладке «Вещи» — она усиливает весь урон',en:'Equip an item in Items — it boosts all damage',hl:()=>inTab('inv','[onclick^="equip("]')},
 {id:'skill',on:()=>skLv(0)>=1&&!inBoss,done:()=>st('s')>=1,ru:'Открыто умение! Нажмите его кнопку или клавишу 1',en:'Skill unlocked! Press its button or key 1',hl:()=>$('skills').children[0]},
 {id:'quest',on:()=>S.max>=5&&S.q&&S.q.p.some((qi,j)=>!S.q.d[j]&&S.q[QD[qi][1]]>=QD[qi][2]),done:()=>S.q&&S.q.d.some(x=>x),ru:'Задание выполнено — заберите награду во вкладке «Задания»',en:'Quest complete — claim the reward in Quests',hl:()=>inTab('quest','.qr.rdy .buy')},
 {id:'feat',on:()=>S.max>=12&&achReady()>0,done:()=>Object.keys(S.ach||{}).length>0,ru:'Новый подвиг! Заберите за него Нектар во вкладке «Подвиги»',en:'New feat! Claim its Nectar in the Feats tab',hl:()=>inTab('top','[onclick^="achClaim("]')},
 {id:'fairy',on:()=>S.max>=3&&!$('fairy').hidden,done:()=>st('fy')>=1,ru:'Поймайте фею — она даёт золото, Нектар или ускорение',en:'Catch the fairy for gold, Nectar or a speed boost',hl:()=>$('fairy')},
 {id:'merge',on:()=>canMerge(),done:()=>st('m')>=1,ru:'Три одинаковые вещи объединяются в одну редкую — «Объединить все»',en:'Three identical items merge into a rarer one — press Merge',hl:()=>inTab('inv','[onclick="craftAll()"]')},
 {id:'house',on:()=>S.max>=15&&S.gold>=hCost(0),done:()=>S.b.some(b=>b[0]>0||b[1]),ru:'Постройте Кузницу во вкладке «Дом» — вечный бонус к удару',en:'Build the Forge in the House tab — a permanent click bonus',hl:()=>inTab('house','[onclick="build(0)"]')},
 {id:'shop',on:()=>S.nec>=SHOP[0][2]&&S.max>=10,done:()=>st('o')>=1,ru:'Нектар тратится в «Наградах»: сундуки с золотом и вещами',en:'Spend Nectar in Rewards: chests with gold and items',hl:()=>inTab('rew','[onclick="buyShop(0)"]')},
 {id:'reb',on:()=>soulGain()>=10,done:()=>S.pc>=1,ru:'Перерождение во вкладке «Дары» даёт души — вечный бонус к урону',en:'Rebirth in the Gifts tab grants souls — a permanent damage bonus',hl:()=>inTab('pres','[onclick="prestige()"]')},
 {id:'gifts',on:()=>S.pc>=1&&S.souls>=tc(0),done:()=>S.t.some(x=>x>0),ru:'Тратьте души на вечные дары — они остаются после перерождения',en:'Spend souls on eternal gifts — they stay after rebirth',hl:()=>inTab('pres','[onclick^="buyT("]')},
 {id:'sklv',on:()=>S.pc>=1&&S.t.some(x=>x>0)&&S.souls>=SKB[0]&&skLv(0)>=1,done:()=>S.sl.some(x=>x>0),ru:'Умения тоже прокачиваются за души: «Герой» → «Умения»',en:'Skills level up with souls too: Hero → Skills',hl:()=>tab=='hero'?(htab=='s'?q$('[onclick^="buySk("]'):q$('[onclick="setHT(\'s\')"]')):navB('hero')}];
// после проигрыша боссу (пока игрок в начале игры): что делать дальше
const TIP_FARM=['Босс оказался сильнее. Улучшите оружие и богов, затем нажмите «Перейти к битве с боссом»','The boss was too strong. Upgrade weapons and gods, then press «Fight the boss»'];
let tipHL=null,tipCur=null,tipKey='';
function tipMark(el){if(el===tipHL)return;if(tipHL&&tipHL!=='mon')tipHL.classList.remove('hl');tipHL=el;if(el&&el!=='mon')el.classList.add('hl')}
const tipFarm=()=>S.farm&&!inBoss&&S.max<60&&!S.tipF;
function tipUI(){const e=$('tip');if(!S.td)S.td={};
 const off=S.tut>=99;TIPS.forEach(x=>{if(!S.td[x.id]){let d=false;try{d=x.done()}catch(er){}if(d)S.td[x.id]=1}});
 const ok=x=>{if(S.td[x.id])return false;if(inBoss&&x.id!='boss')return false;try{return!!x.on()}catch(er){return false}};
 const farm=!off&&tipFarm();if(farm||off)tipCur=null;else if(!(tipCur&&ok(tipCur)))tipCur=TIPS.find(ok)||null;
 const tp=tipCur;e.hidden=!tp&&!farm;
 const tx=farm?'💡 '+t(TIP_FARM[0],TIP_FARM[1]):tp?'💡 '+t(tp.ru,tp.en):'';if(tx&&$('tipt').textContent!==tx)$('tipt').textContent=tx;
 let el=null;try{el=farm?$('bRetry'):tp?tp.hl():null}catch(er){}
 if(el&&el!=='mon'&&(el.disabled||el.hidden))el=null;tipMark(el);
 // цель в списке за краем экрана — один раз прокрутить к ней (при смене подсказки или вкладки), дальше прокрутку игрока не трогаем
 try{const k=(farm?'farm':tp?tp.id:'')+'|'+tab;if(el&&el!=='mon'&&k!==tipKey&&el.closest&&el.closest('main')){tipKey=k;el.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'})}}catch(er){}
 const r=$('tapr');if(r){r.hidden=el!=='mon';if(el==='mon'){const c=monC();if(c){r.style.left=c[0]+'px';r.style.top=c[1]+'px'}}}}
// × закрывает только текущую подсказку
function tipOff(){if(tipFarm())S.tipF=1;else if(tipCur){S.td=S.td||{};S.td[tipCur.id]=1;tipCur=null}tipMark(null);$('tip').hidden=true;save()}

// ======== ЗВУК: эффекты — файлы sfx/*.mp3 (SoundDino, без указания авторства), музыка — music/theme.mp3 по кругу;
// пока файлы не загрузились или если их нет (награда, фея) — синтез на лету (Web Audio). Громкость по умолчанию — 25% / 25% ========
// Схема: эффекты -> sfxG, музыка -> musG; обе шины + реверберация -> master -> компрессор -> выход
let A=null;
function audInit(){if(AUD&&A)return true;try{AUD=AUD||new(window.AudioContext||window.webkitAudioContext)();const c=AUD;
 A={c,master:c.createGain(),sfx:c.createGain(),syn:c.createGain(),mus:c.createGain(),rev:c.createConvolver(),revG:c.createGain(),comp:c.createDynamicsCompressor()};
 A.comp.connect(c.destination);A.master.connect(A.comp);A.sfx.connect(A.master);A.syn.connect(A.sfx);A.syn.gain.value=SYN_GAIN;A.mus.connect(A.master);A.rev.connect(A.revG);A.revG.connect(A.master);A.revG.gain.value=.5;
 // реверберация: стерео-шум с затуханием 2,6 с — «зал» подземелья
 const sr=c.sampleRate||44100,L=Math.floor(sr*2.6),ir=c.createBuffer(2,L,sr);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,2.6)}A.rev.buffer=ir;
 const nb=c.createBuffer(1,sr,sr),nd=nb.getChannelData(0);for(let i=0;i<sr;i++)nd[i]=Math.random()*2-1;A.noise=nb;
 audVol();return true}catch(e){A=null;return false}}
function audVol(){if(!A)return;const on=snd()&&!paused,t=A.c.currentTime||0;
 try{A.master.gain.setTargetAtTime(on?1:0,t,.06);A.sfx.gain.setTargetAtTime(S.vol[0]*.9,t,.05);A.mus.gain.setTargetAtTime(S.vol[1]*.8,t,.3)}catch(e){A.master.gain.value=on?1:0;A.sfx.gain.value=S.vol[0]*.9;A.mus.gain.value=S.vol[1]*.8}}
// первое касание/клавиша разблокирует звук (требование браузеров и iOS)
function audUnlock(){if(!audInit())return;try{if(AUD.state!='running'&&!document.hidden&&!paused)AUD.resume()}catch(e){}if(!ELM){sfxLoad();trkLoad()}}
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
// эффекты из файлов: событие -> файл в sfx/. Грузятся после первого касания вместе с музыкой; в начале файла может быть пауза кодировщика —
// её пропускаем (SB[k].off). Клик/крит/убийство играются с небольшим разбросом высоты, чтобы частые удары не звучали одинаково
const SFXF={click:'click',crit:'crit',kill:'kill',buy:'buy',skill:'skill',bossIn:'bossIn',boss:'boss',lose:'lose'},SFXV={click:1,crit:1,kill:1},SB={},SYN_GAIN=2.2;let sbLd=false;
// Файлы эффектов и музыки скачиваются сразу при открытии игры (sfxPre), а расшифровываются на первом касании —
// иначе первые секунды (весь 1-й этаж) звучали старые синтезированные звуки. Пока файл расшифровывается — тишина, не старый звук.
const SFX_AB={},SBF={};let MUS_AB=null;
function sfxPre(){try{if(typeof fetch!='function'||location.protocol=='file:')return;const g=u=>{const p=fetch(u).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()});p.catch(()=>{});return p};
 Object.entries(SFXF).forEach(([k,f])=>{SFX_AB[k]=g('sfx/'+f+'.mp3')});MUS_AB=g(MUS_FILE)}catch(e){}}
function sfxLoad(){if(sbLd||!A||typeof fetch!='function')return;sbLd=true;Object.entries(SFXF).forEach(([k,f])=>(SFX_AB[k]||fetch('sfx/'+f+'.mp3').then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()})).then(ab=>new Promise((ok,no)=>AUD.decodeAudioData(ab,ok,no))).then(b=>{const d=b.getChannelData(0);let i=0;while(i<d.length&&Math.abs(d[i])<1e-3&&i<b.sampleRate*.1)i++;SB[k]={b,off:i/b.sampleRate}}).catch(()=>{SBF[k]=1}))}
function sfxFile(k,p){const s=SB[k];if(!s)return false;const c=A.c,src=c.createBufferSource();src.buffer=s.b;if(SFXV[k])src.playbackRate.value=p;src.connect(A.sfx);src.start(c.currentTime||0,s.off);return true}
const SFXGAP={click:60,crit:80,kill:110,buy:60,skill:150,reward:250,boss:300,bossIn:500,lose:500,fairy:200},sfxT={};
const rnd=(a,b)=>a+Math.random()*(b-a);
function sfx(k){if(!snd()||paused||S.vol[0]<=0)return;if(!audInit()||AUD.state=='suspended')return;const n=performance.now();if(n-(sfxT[k]||-1e9)<(SFXGAP[k]||100))return;sfxT[k]=n;
 try{const p=rnd(.93,1.07);if(ELM?elSfx(k,p):sfxFile(k,p))return;if(!ELM&&sbLd&&SFXF[k]&&!SBF[k])return;const B=A.syn;switch(k){
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
 if(!trk.src){pad(dfreq(m,deg,1),t,BAR,.05);pad(dfreq(m,deg+2,1),t,BAR,.03);
 const mi=MPAT[b%MPAT.length];if(mi>=0&&b%16<14)MOTIFS[mi].forEach(([bt,d])=>lyre(dfreq(m,d+deg,3),t+bt*BEAT,.09))}
 if(inBoss)for(let i=0;i<4;i++){heart(t+i*BEAT,.22);heart(t+i*BEAT+.28,.14)}}
// ---- общая тема: music/theme.mp3 (Gemini/Lyria). Петля 2:44.8 подготовлена бесшовно (перекрёстное затухание 3 с), громкость −18 LUFS.
// Грузится после первого касания (не входит в стартовую загрузку). MP3 может декодироваться с паузой кодировщика в начале —
// поэтому петля задаётся явно: от первого ненулевого отсчёта на MUS_LEN секунд. Идёт через шину музыки (ползунок, пауза, звук площадки).
// запуск из файла (file://): браузер не даёт fetch-ить файлы, поэтому музыка и эффекты играют через обычные <audio> (без Web Audio)
const ELM=(()=>{try{return location.protocol=='file:'&&typeof Audio=='function'}catch(e){return false}})(),EL={mus:null,sfx:{}};
function elInit(){if(!ELM||EL.mus)return;try{EL.mus=new Audio(MUS_FILE);EL.mus.loop=true;Object.entries(SFXF).forEach(([k,f])=>{const a=new Audio('sfx/'+f+'.mp3');a.preload='auto';EL.sfx[k]=a})}catch(e){}}
function elVol(){if(!EL.mus)return;const on=snd()&&!paused&&!document.hidden;try{EL.mus.volume=on?Math.min(1,S.vol[1]*.8*MUS_GAIN):0;if(on&&S.vol[1]>0&&EL.mus.paused)EL.mus.play().catch(()=>{});if((!on||S.vol[1]<=0)&&!EL.mus.paused)EL.mus.pause()}catch(e){}}
function elSfx(k,p){const b=EL.sfx[k];if(!b)return false;try{const a=b.cloneNode();a.volume=Math.min(1,S.vol[0]*.9);if(SFXV[k]){a.preservesPitch=false;a.playbackRate=p}a.play().catch(()=>{});return true}catch(e){return false}}
const MUS_FILE='music/theme.mp3',MUS_LEN=164.7969,MUS_GAIN=.75,trk={buf:null,src:null,g:null,ld:false};
function trkLoad(){if(trk.ld||trk.buf||!A||typeof fetch!='function')return;trk.ld=true;
 const pre=MUS_AB;MUS_AB=null;(pre||fetch(MUS_FILE).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()})).then(ab=>new Promise((ok,no)=>AUD.decodeAudioData(ab,ok,no))).then(b=>{trk.buf=b}).catch(()=>{setTimeout(()=>{trk.ld=false},6e4)})}
function trkPlay(){if(!trk.buf||trk.src)return;const c=AUD,b=trk.buf,d=b.getChannelData(0);let i=0;while(i<d.length&&Math.abs(d[i])<1e-4&&i<c.sampleRate)i++;
 const off=i/b.sampleRate,src=c.createBufferSource(),g=c.createGain(),t=c.currentTime||0;src.buffer=b;src.loop=true;src.loopStart=off;src.loopEnd=Math.min(b.duration,off+MUS_LEN);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(MUS_GAIN,t+2.5);src.connect(g);g.connect(A.mus);src.start(t,off);trk.src=src;trk.g=g}
// планировщик: держит запас ~1,5 с вперёд
function musTick(){if(ELM){if(AUD&&AUD.state=='running'){elInit();elVol()}return}if(AUD&&AUD.state=='running'&&A)sfxLoad();if(!snd()||paused||S.vol[1]<=0||!AUD||AUD.state=='suspended')return;if(!audInit())return;trkLoad();try{trkPlay()}catch(e){}try{const now=AUD.currentTime||0;if(mus.t<now)mus.t=now+.15;while(mus.t<now+1.5){musBar(mus.t);mus.t+=BAR}}catch(e){}}
// ======== ИНТЕРФЕЙС: иконки, шапка акта, заголовки разделов, меню и значки ========
const ico=n=>'<svg class="ico" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
// рисованная иконка вкладки (img/ui/<имя>.webp, 112 px) в плитке .it.art
const art=(n,c)=>'<span class="it art'+(c?' '+c:'')+'"><img class="pi" src="img/ui/'+n+'.webp" alt="" loading="lazy"></span>';
const SHA=['rew_bronze','rew_silver','rew_gold','rew_reborn','rew_anvil','rew_scroll','rew_rush','rew_hermes'],ACA=['rew_video','rew_bronze','rew_silver','rew_gold'];
const WICO=['sword','spear','shield','bow','blades','axe','trident','bolt','scythe','sickle','sword','thread','scythe','sword','sting','hammer','eye'],SKI=['sword','spear','orb','bow'],ROM=['I','II','III','IV','V','VI'];
let htab='w',atab='a',PANH={};
function setHT(x){htab=x;tabRender()}
function setAT(x){atab=x;tabRender()}
// заголовок панели раздела: название, подсказка, доп. элементы (переключатель, «Покупать ×N»)
function panH(k,extra){const v=PANH[k]||['',''];return `<div class="ph"><div class="pht"><h2>${v[0]}</h2><span>${v[1]}</span></div>${extra||''}</div>`}
function navGo(x){const nv=$('nav');if(x=='more'){nv.classList.toggle('open');return}nv.classList.remove('open');
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==x||(b.dataset.t=='more'&&['pres','house','rew','top'].includes(x))));tab=x;tabRender();$('list').scrollTop=0}
// прогресс акта в шапке и строка над врагом: точки 5 монстров этажа и «босс через N этажей»
const setTx=(id,v)=>{const e=$(id);if(e.textContent!==v)e.textContent=v};
function actUI(f){const a=act(f),ai=ACTS.indexOf(a),st=ai?ACTS[ai-1][0]:0;
 setTx('actn',t('Акт ','Act ')+ROM[ai]);setTx('actf',t('этаж ','floor ')+f+t(' из ',' of ')+a[0]);$('actp').style.width=Math.min(100,(f-st)/(a[0]-st)*100)+'%';
 const P=$('pips'),boss=isBoss(f);P.hidden=boss||S.farm;if(!P.hidden&&P.children)[...P.children].forEach((e,j)=>{e.className=j<S.mk?'d':j==S.mk?'c':''});
 const nb=10-f%10;$('nextb').textContent=boss||S.farm?'':nb==1?t('дальше — босс','boss is next'):t('босс через ','boss in ')+nb+t(' эт.',' fl.')}
// значки на разделах: что можно забрать или улучшить прямо сейчас
function navBadges(){qn();let q=0;try{const td=new Date(NOW()).toDateString();if(S.dl!=td)q++;S.q.p.forEach((qi,j)=>{if(!S.q.d[j]&&S.q[QD[qi][1]]>=QD[qi][2])q++})}catch(e){}
 const n=NOW(),B={quest:q,top:achReady(),inv:S.loot.length?'•':'',rew:!adsOff()&&S.ac.some(x=>x<=n)?'•':'',pres:TN.some((_,i)=>S.t[i]<TM[i]&&S.souls>=tc(i))?'•':'',hero:SK.some((a,i)=>skLv(i)>0&&S.sl[i]<SKMAX&&S.souls>=skCost(i))?'•':''};
 B.more=['pres','house','rew','top'].some(k=>B[k])?'•':'';
 try{document.querySelectorAll('nav button').forEach(b=>{const e=b.querySelector('.bd');if(!e)return;const v=B[b.dataset.t]||'',tx=v==='•'?'':v?String(v):'';if(e.textContent!==tx)e.textContent=tx;e.classList.toggle('dot',v==='•')})}catch(e){}}
setTexts('ru');
init();
