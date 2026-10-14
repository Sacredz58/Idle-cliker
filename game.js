'use strict';
const $=id=>document.getElementById(id);
const ACTS=[[500,'Тартар','👹'],[2000,'Асфодель','💀'],[4500,'Элизиум','🗡️'],[7000,'Олимп','⚡'],[9000,'Вход в Хаос','🌑'],[10000,'Сердце Хаоса','🌀']];
const BOSSES={50:'Мегера',100:'Алекто',250:'Тисифона',500:'Лернейская Гидра',750:'Лавовый Кентавр',1000:'Тесей',1500:'Астерий',2000:'Тесей и Минотавр',2500:'Ахилл',3000:'Патрокл',4500:'Владыка Аид',5000:'Прометей',5500:'Гера',7000:'Верховный Зевс',7500:'Харон',8000:'Тень Загрея',9000:'Кронос',9250:'Уран',9500:'Гея',9750:'Аид Титан',10000:'Абсолютный Хаос'};
const WALLS=[50,100,250,500,2000,4500,7000,9000,10000];
const WEAPONS=[['Меч Стикса',1,15],['Копьё Афины',12,180],['Щит Хаоса',90,1500],['Лук Икара',700,14e3],['Клинки Деметры',5e3,1.3e5],['Секира Геракла',4e4,1.2e6],['Трезубец Посейдона',3e5,1.1e7],['Молния Зевса',2.5e6,1e8],['Коса Хроноса',2e7,9e8],['Серп Тьмы',2e8,8e9],['Клинок Всездания',2e9,7e10],['Нить Мойр',2e10,6.3e11],['Коса Таната',2e11,5.7e12],['Клинок Эреба',2e12,5.1e13],['Жало Тифона',2e13,4.6e14],['Молот Титанов',2e14,4.1e15],['Око Хаоса',2e15,3.7e16]];
const GODS=[['Зевс',4,30],['Посейдон',40,350],['Арес',320,3e3],['Афродита',2600,3e4],['Аполлон',2e4,3e5],['Гермес',1.8e5,3e6],['Деметра',1.6e6,3e7],['Афина',1.4e7,3e8],['Гефест',1.2e8,2.5e9],['Дионис',1e9,2e10],['Артемида',9e9,1.8e11],['Никта',8e10,1.6e12],['Геката',7e11,1.4e13],['Танат',6e12,1.2e14],['Хипнос',5.5e13,1.1e15],['Мойры',5e14,1e16],['Эреб',4.5e15,9e16],['Эфир',4e16,8e17]];
const S0=()=>({floor:1,max:1,gold:0,souls:0,w:[1,...Array(16).fill(0)],g:Array(18).fill(0),last:Date.now(),chest:0,hermes:0,adT:0,tot:0,t:[0,0,0,0,0,0,0,0],inv:[],eq:[-1,-1,-1,-1,-1,-1],b:[[0,0],[0,0],[0,0]],day:0,dl:'',q:null,pt:0,run:1,farm:false,sc:[0,0,0,0],se:[0,0,0,0],ac:[0,0,0,0],mk:0,cheat:false});
let S=S0(),ysdk=null,player=null,hp=0,maxhp=0,bossT=0,inBoss=false,clicks=[],rage=0,sound=true,tab='hero',pool=[],pi=0,acc=0;
const fmt=n=>n<1e3?Math.floor(n)+'':n.toExponential(2).replace('e+','e');
const cost=(b,l)=>b*Math.pow(1.13,l);
const mult=l=>Math.pow(2,Math.floor(l/25));
const soulM=()=>1+S.tot*.05,RB=[.1,.25,.6,1.5,4,9,20,45],gearM=()=>1+S.eq.reduce((a,r)=>a+(r>=0?RB[r]:0),0),bld=i=>1+.1*S.b[i][0],T=i=>1+.1*S.t[i];
const boost=()=>(Date.now()<S.hermes?2:1)*(rage>0?2:1)*soulM()*gearM();
const clickD=()=>(1+WEAPONS.reduce((a,w,i)=>a+w[1]*S.w[i]*mult(S.w[i]),0))*boost()*bld(0)*T(0)*(1+.25*pt(2))*(sa(3)?3:1);
const dps=()=>GODS.reduce((a,g,i)=>a+g[1]*S.g[i]*mult(S.g[i]),0)*boost()*bld(2)*T(2)+(sa(1)?5*clickD()*pw(1):0);
const isBoss=f=>f%10==0;
function mHP(f){let h=14*Math.pow(f,1.9)*Math.pow(1.045,Math.min(f,3500))*Math.pow(1.03,Math.max(0,f-3500)/10);
 WALLS.forEach(w=>{if(f>=w)h*=1.8});return h*(isBoss(f)?6:1)}
const act=f=>ACTS.find(a=>f<=a[0])||ACTS[5];
function spawn(){const f=S.floor;if(f>S.run)S.run=f;maxhp=hp=mHP(f)*(1-.1*pt(3))/(isBoss(f)?1:5);inBoss=isBoss(f)&&!S.farm;bossT=inBoss?30+10*pt(7):0;
 $('mname').textContent=BOSSES[f]||(isBoss(f)?'Страж '+act(f)[1]:'Тень '+act(f)[1]);
 $('monster').textContent=isBoss(f)?'👑':act(f)[2];
 $('floor').textContent='Этаж '+f+(isBoss(f)||S.farm?'':' · '+(S.mk+1)+'/5');$('act').textContent=act(f)[1];
 $('bRetry').hidden=!S.farm;$('bSave').hidden=!S.farm;draw()}
function kill(){const f=S.floor;S.gold+=mHP(f)*.1*(isBoss(f)?3:.2)*bld(1)*T(1)*(1+.3*pt(1));qp('k');if(isBoss(f)){for(let k=0;k<1+pt(6);k++)drop();qp('b')}
 const clr=!S.farm&&(isBoss(f)||++S.mk>=5);if(clr){S.mk=0;if(f>S.max){S.max=f;qp('f');submitScore()}}
 if(f>=10000&&isBoss(f)){modal('<h3>Хаос повержен!</h3><p>Вы вышли из Подземелья. Перерождение откроет новый круг.</p><button onclick="closeM()">Дальше</button>');}
 else if(clr&&f<10000)S.floor++;
 spawn();if(tab=='inv'||tab=='quest'||tab=='pres')dirty=true;sv()}
function lose(){S.floor--;S.farm=true;inBoss=false;spawn();bossT=0;save()}
function dealt(d,crit,x,y){hp-=d;float(d,crit,x,y);if(hp<=0)kill();draw()}
$('arena').addEventListener('pointerdown',e=>{
 const mm=clickOK(e);if(!mm)return;if(mm==1){qp('c');const now=Date.now();clicks=clicks.filter(t=>now-t<2000);clicks.push(now)}
 if(mm==1&&clicks.length>=12-3*pt(5)&&rage<=0){rage=8;qp('r');$('rage').classList.add('on')}
 const crit=rage>0||Math.random()<.1+.15*pt(4)+.01*S.t[4];let d=clickD()*(crit?(rage>0?1:3+.2*S.t[3]):1)*mm;
 if(crit){$('arena').classList.remove('shake');void $('arena').offsetWidth;$('arena').classList.add('shake')}
 const r=$('arena').getBoundingClientRect();
 $('monster').classList.add('hit');setTimeout(()=>$('monster').classList.remove('hit'),60);
 dealt(d,crit,e.clientX-r.left,e.clientY-r.top)});
for(let i=0;i<24;i++){const d=document.createElement('div');d.className='dn';$('fx').appendChild(d);pool.push(d)}
function float(d,c,x,y){const e=pool[pi++%pool.length];e.style.display='block';e.className='dn'+(c?' c':'');e.textContent=fmt(d);
 e.style.left=x+'px';e.style.top=y+'px';e.style.animation='none';void e.offsetWidth;e.style.animation=''}
function draw(){adUI();skUI();$('hp').style.width=Math.max(0,hp/maxhp*100)+'%';$('hptxt').textContent=fmt(Math.max(0,hp))+' / '+fmt(maxhp);
 $('timer').textContent=inBoss?'⏳ '+bossT.toFixed(1)+' с':S.farm?'Босс ждёт на этаже '+(S.floor+1):'';
 $('cd').textContent=fmt(clickD());$('dps').textContent=fmt(dps());$('gold').textContent=fmt(S.gold);$('souls').textContent=fmt(S.souls);
 $('rageb').style.width=(rage>0?rage/8*100:Math.min(100,clicks.length/(12-3*pt(5))*100))+'%'}
let lt=performance.now();
function loop(t){const dt=Math.min(.25,(t-lt)/1e3)*TS;lt=t;
 if(rage>0){rage-=dt;if(rage<=0){rage=0;$('rage').classList.remove('on')}}
 zt+=dt;if(pt(0)&&zt>=8){zt=0;dealt(dps()*10*pt(0),true,150,110)}if(inBoss){bossT-=dt;if(bossT<=0)lose()}
 const x=dps()*dt;if(x>0)hp-=x;if(hp<=0)kill();
 acc+=dt;if(acc>.2){acc=0;draw();hTick()}if(acc===0&&tab)updBtns();
 requestAnimationFrame(loop)}
function buy(kind,i){const arr=kind=='w'?WEAPONS:GODS,lv=kind=='w'?S.w:S.g,[n,c]=plan(arr[i][2],lv[i]);
 if(S.gold>=c){S.gold-=c;lv[i]+=n;qp('u',n);tabRender();draw();save()}}
function updBtns(){document.querySelectorAll('[data-k]').forEach(b=>{const k=b.dataset.k,i=+b.dataset.i,[n,c]=plan((k=='w'?WEAPONS:GODS)[i][2],(k=='w'?S.w:S.g)[i]),t=(n>1?'x'+n+' ':'')+'💰'+fmt(c);if(b.textContent!==t)b.textContent=t;b.disabled=S.gold<c});
 document.querySelectorAll('[data-b]').forEach(b=>{b.disabled=S.gold<+b.dataset.b})}
function tabRender(){const L=$('list');let h='';
 if(tab=='hero'||tab=='gods'){const k=tab=='hero'?'w':'g',arr=tab=='hero'?WEAPONS:GODS,lv=tab=='hero'?S.w:S.g;
  h+=qsH();arr.forEach((a,i)=>{
   h+=`<div class="row"><div><b>${a[0]}</b> ур.${lv[i]}<small>${tab=='hero'?'Клик':'Урон/с'} +${fmt(a[1]*mult(lv[i]))} за ур. (x2 каждые 25)</small>${tab=='gods'?psH(i):i<4?skInfo(i):''}</div><button data-k="${k}" data-i="${i}" onclick="buy('${k}',${i})"></button></div>`})}
 else if(tab=='pres'){const g=soulGain();
  h=`<div class="row"><div><b>Алтарь Никты</b><small>Каждая душа даёт +5% ко всему урону. Сейчас: ${S.souls}. За перерождение: +${g} (лучший этаж забега: ${S.run}, коэф. ×${(1+S.run/400).toFixed(2)})</small><small data-pc></small></div><button data-pb onclick="prestige()" ${g<1||pcd()>0?'disabled':''}>Переродиться</button></div>`+talH()}
 else if(tab=='inv')h=invH();else if(tab=='house')h=houseH();else if(tab=='quest')h=questH();else if(tab=='rew')h=rewH();else h='<div class="row"><div><b>Лидерборд</b><small>Рекорд: этаж '+S.max+'</small></div><button onclick="showLB()">Открыть</button></div>';
 L.innerHTML=h;updBtns()}
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{document.querySelectorAll('nav button').forEach(x=>x.classList.remove('on'));b.classList.add('on');tab=b.dataset.t;tabRender()});
function prestige(){const g=soulGain();if(g<1||pcd()>0)return;
 const done=()=>{if(pcd()>0)return;const k={pt:Date.now(),cheat:S.cheat,max:S.max,souls:S.souls+g,tot:S.tot+g,hermes:S.hermes,chest:S.chest,ac:S.ac,adT:S.adT,t:S.t,inv:S.inv,eq:S.eq,b:S.b,day:S.day,dl:S.dl,q:S.q};S=Object.assign(S0(),k);S.farm=false;spawn();tabRender();save()};
 interstitial(done)}
function modal(h){$('mbox').innerHTML=h;$('modal').hidden=false}
function closeM(){$('modal').hidden=true}
// ---- Yandex SDK ----
function rewarded(ok){const f=()=>{qp('a');ok()};if(ysdk){ysdk.adv.showRewardedVideo({callbacks:{onRewarded:f,onError:()=>{}}})}else f()}
function interstitial(done){if(ysdk&&Date.now()-S.adT>240000){S.adT=Date.now();ysdk.adv.showFullscreenAdv({callbacks:{onClose:done,onError:done}})}else done()}
function submitScore(){if(S.cheat)return;if(ysdk&&ysdk.getLeaderboards)ysdk.getLeaderboards().then(l=>l.setLeaderboardScore('floors',S.max)).catch(()=>{})}
function showLB(){if(!ysdk)return modal('<p>Лидерборд доступен в Яндекс Играх.</p><button onclick="closeM()">Ок</button>');
 ysdk.getLeaderboards().then(l=>l.getLeaderboardEntries('floors',{quantityTop:10})).then(r=>modal('<h3>Топ-10</h3>'+r.entries.map(e=>`<p>${e.rank}. ${e.player.publicName||'Игрок'} — ${e.score}</p>`).join('')+'<button onclick="closeM()">Закрыть</button>')).catch(()=>{})}
function save(f){S.last=Date.now();const j=JSON.stringify(S);try{localStorage.setItem('hades',j)}catch(e){}if(player&&(f||Date.now()-ysT>10000)){ysT=Date.now();player.setData({s:j}).catch(()=>{})}}
async function load(){let d=null;try{if(player){const r=await player.getData();if(r.s)d=r.s}}catch(e){}
 if(!d)try{d=localStorage.getItem('hades')}catch(e){}
 if(d)try{S=Object.assign(S0(),JSON.parse(d))}catch(e){}if(S.tot<S.souls)S.tot=S.souls;S.g=GODS.map((_,i)=>S.g[i]|0);S.w=WEAPONS.map((_,i)=>S.w[i]|0);S.t=TN.map((_,i)=>S.t[i]|0);}
function offline(){const sec=Math.min(8*3600+1800*S.t[7],(Date.now()-S.last)/1e3),g=dps()*sec*.05;
 if(sec>60&&g>0)modal(`<h3>Пока вас не было</h3><p>Вы заработали 💰${fmt(g)}</p><button id="o1">Забрать</button><button id="o2">📺 Удвоить x2</button>`),
  $('o1').onclick=()=>{S.gold+=g;closeM();tabRender()},$('o2').onclick=()=>rewarded(()=>{S.gold+=g*2;closeM();tabRender()})}
$('bHermes').onclick=()=>rewarded(()=>{S.hermes=Date.now()+6e5;draw()});
$('bChest').onclick=()=>{if(Date.now()<S.chest)return modal('<p>Сундук откроется через '+Math.ceil((S.chest-Date.now())/6e4)+' мин.</p><button onclick="closeM()">Ок</button>');
 rewarded(()=>{const g=mHP(S.floor)*5;S.gold+=g;S.chest=Date.now()+4*3600*1e3;modal(`<p>Сундук Харона: 💰${fmt(g)}</p><button onclick="closeM()">Ок</button>`);draw()})};
$('bRetry').onclick=()=>{S.farm=false;S.floor++;spawn()};
$('bSave').onclick=()=>rewarded(()=>{S.floor++;S.farm=false;spawn();bossT+=15});
$('snd').onclick=()=>{sound=!sound;$('snd').textContent=sound?'🔊':'🔇'};
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
 let n=0,t0=0;$('act').addEventListener('click',()=>{const t=Date.now();n=t-t0<1500?n+1:1;t0=t;if(n>=5){n=0;devToggle()}})}
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
hermes:m=>{m=dnum(m);S.hermes=Date.now()+(m===null?10:m)*6e4;draw();return'буст Гермеса активен'},
kill:n=>{n=n===undefined?1:dnum(n);if(n===null||n<1)return'kill [n]';n=Math.min(500,Math.floor(n));for(let i=0;i<n;i++)dealt(hp+1,false,0,0);return'убито: '+n},
boss:()=>{S.floor=Math.min(10000,(Math.floor(S.floor/10)+1)*10);S.mk=0;S.farm=false;spawn();tabRender();return'босс-этаж '+S.floor},
prestige:()=>{if(soulGain()<1)return'мало душ (лучший этаж забега '+S.run+'); используйте floor <n>';S.pt=0;prestige();return'перерождение'},
quests:()=>{qn();S.q.p.forEach(qi=>{S.q[QD[qi][1]]=Math.max(S.q[QD[qi][1]],QD[qi][2])});tabRender();return'задания выполнены, заберите награды'},
day:n=>{n=dnum(n);if(n===null||n<1||n>7)return'day <1-7>';S.dl=new Date(Date.now()-864e5).toDateString();S.day=Math.floor(n)-1;tabRender();return'следующий вход: день '+n},
build:()=>{S.b.forEach(b=>{if(b[1])b[1]=1});hTick();return'стройки завершены'},
offline:h=>{h=h===undefined?1:dnum(h);if(h===null||h<=0)return'offline <часов>';S.last=Date.now()-h*36e5;offline();return'офлайн: '+h+' ч'},
speed:x=>{x=dnum(x);if(x===null)return'speed <x> (сейчас ×'+TS+')';TS=Math.min(100,Math.max(.1,x));return'скорость ×'+TS},
get:p=>p===undefined||!(p in S)?'поля: '+Object.keys(S).join(' '):p+' = '+JSON.stringify(S[p]).slice(0,400),
set:(p,...v)=>{if(!(p in S))return'нет поля '+p;S[p]=JSON.parse(v.join(' '));upd();return p+' = '+JSON.stringify(S[p]).slice(0,200)},
state:()=>`этаж ${S.floor} (${S.mk}/5) · рекорд ${S.max} · забег ${S.run}\nзолото ${fmt(S.gold)} · души ${S.souls}/${S.tot}\nурон клика ${fmt(clickD())} · DPS ${fmt(dps())} · предметы ×${gearM().toFixed(2)} · души ×${soulM().toFixed(2)}\nскорость ×${TS} · читы: ${S.cheat?'да (лидерборд отключён)':'нет'}`,
save:()=>{save(true);return'сохранено'},
reset:y=>{if(y!='yes')return'подтвердите: reset yes';S=S0();TS=1;spawn();upd();return'новая игра'}};
const DR=['help','state','get','save','reset'];
function devExec(line){if(!devOK())return'консоль отключена';const[c,...a]=line.trim().split(/\s+/),f=DC[c];if(!f)return'неизвестная команда: '+c+' (help)';
 try{const r=f(...a);if(!DR.includes(c))S.cheat=true;return r}catch(e){return'ошибка: '+e.message}}
async function init(){devInit();$('list').addEventListener('pointerdown',()=>{lpDown=true;lpT=Date.now()});['pointerup','pointercancel'].forEach(e=>document.addEventListener(e,()=>{lpDown=false;lpT=Date.now()}));document.addEventListener('visibilitychange',()=>{if(document.hidden)save(true)});try{if(window.YaGames){ysdk=await YaGames.init();player=await ysdk.getPlayer()}}catch(e){ysdk=null}
 await load();skBuild();spawn();tabRender();offline();
 if(ysdk&&ysdk.features&&ysdk.features.LoadingAPI)ysdk.features.LoadingAPI.ready();
 setInterval(save,15000);requestAnimationFrame(loop)}

const SL=['Шлем','Доспех','Оружие','Амулет','Кольцо','Плащ'],SI=['🪖','🛡️','🗡️','📿','💍','🧥'],RN=['Обычный','Редкий','Эпический','Легендарный','Мифический','Божественный','Титанический','Первородный'],NEED=[3,4,5,6,7,8,9];
const BN=[['Кузница Гефеста','+10% урона клика'],['Сад Персефоны','+10% золота'],['Библиотека Афины','+10% урона богов']];
const TN=[['Мощь Зевса','+10% урона клика за ур.'],['Золото Плутоса','+10% золота за ур.'],['Дар богов','+10% урона богов за ур.'],['Рука Ареса','+0,2 к множителю крита (база ×3) за ур.'],['Глаз Аполлона','+1% к шансу крита за ур.'],['Мастерство умений','+10% к силе и длительности активных умений за ур.'],['Эхо Хроноса','−3% к перезарядке умений за ур.'],['Терпение Аида','+30 мин к лимиту офлайн-дохода за ур.']];
const QD=[['Убить 250 монстров','k',250,3],['Убить 1000 монстров','k',1000,8],['Сделать 300 кликов','c',300,3],['Сделать 1000 кликов','c',1000,8],['Победить босса','b',1,3],['Победить 3 боссов','b',3,9],
['Купить 10 улучшений','u',10,4],['Использовать умения 3 раза','s',3,4],['Включить Гнев Олимпа','r',1,3],['Получить 3 предмета','i',3,5],['Посмотреть рекламу 2 раза','a',2,6],['Начать постройку здания','h',1,3],['Открыть 5 новых этажей','f',5,6]];
const AC=[['📺 Награда за рекламу','золото за просмотр видео',6e5],['🪵 Бронзовый сундук','золото + 1 предмет',36e5],['🥈 Серебряный сундук','много золота + 2 предмета (не ниже редких)',108e5],['🥇 Золотой сундук','очень много золота + 3 предмета (не ниже эпических) + души',288e5]];
function adUI(){const n=Date.now(),h=S.hermes-n,c=S.chest-n,B=$('bHermes'),C=$('bChest'),
 th=h>0?'⚡ Гермес активен: '+hms(h):'📺 Буст Гермеса +100% (10 мин)',tc=c>0?'🎁 Сундук через '+hms(c):'📺 Сундук Харона';
 if(B.textContent!==th){B.textContent=th;B.disabled=h>0;B.classList.toggle('act',h>0)}
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
const SK=[['Удар Стикса','🗡️',0,30,0,'мгновенный удар в 20× урона клика','Стикс'],['Бросок Афины','🔱',1,45,8,'8 с: +5 автокликов в секунду','Афина'],['Щит Хаоса','🛡️',2,60,0,'+10 с к таймеру босса (только в бою с боссом)','Щит'],['Гнев Икара','🏹',3,60,10,'10 с: урон клика ×3','Икар']];
const PS=[['Молния','каждые 8 с удар в 10× урона в секунду'],['Дар приливов','+30% золота'],['Жажда битвы','+25% урона клика'],['Очарование','монстры слабее на 10%'],['Золотая стрела','+15% к шансу крита'],['Быстрые ноги','Гнев Олимпа с 9 кликов вместо 12'],['Щедрый урожай','+1 предмет с боссов'],['Мудрость','+10 с к таймеру босса']];
function pt(i){const l=S.g[i];return l>=50?2:l>=10?1:0}
function sa(i){return S.se[i]>Date.now()}
function pw(i){return 1+S.w[SK[i][2]]/50}
function psH(i){if(!PS[i])return '';const t=pt(i);return `<small>${t?'✅':'🔒'} Пассив «${PS[i][0]}»: ${PS[i][1]} (откр. с ур.10, усиление с ур.50)${t?' · сейчас ×'+t:''}</small>`}
function skInfo(i){const a=SK[i],ok=S.w[a[2]]>=SKL;return `<small>${ok?'✅':'🔒'} Актив «${a[0]}»: ${a[5]} (КД ${a[3]} с${a[4]?', длит. '+a[4]+' с':''}${ok?'':', откр. с ур.'+SKL})`+(ok?')':'')+'</small>'}
function skBuild(){const b=$('skills');SK.forEach((a,i)=>{const e=document.createElement('button');e.onclick=()=>useSk(i);b.appendChild(e)})}
function skUI(){const n=Date.now(),B=$('skills').children;SK.forEach((a,i)=>{const e=B[i];if(!e)return;const lock=S.w[a[2]]<SKL,cd=S.sc[i]-n,on=S.se[i]>n,
 t=lock?'🔒 ур.'+SKL:on?a[1]+' '+Math.ceil((S.se[i]-n)/1e3)+'с':cd>0?a[1]+' '+hms(cd):a[1]+' '+a[6];
 if(e.textContent!==t)e.textContent=t;e.disabled=lock||cd>0||(i==2&&!inBoss);e.classList.toggle('act',on)})}
function useSk(i){const a=SK[i],n=Date.now();if(S.w[a[2]]<SKL||S.sc[i]>n||(i==2&&!inBoss))return;
 S.sc[i]=n+a[3]*1e3*Math.max(.5,1-.03*S.t[6]);S.se[i]=n+a[4]*1e3*(1+.1*S.t[5]);
 if(i==0)dealt(clickD()*20*pw(0)*(1+.1*S.t[5]),true,150,110);
 if(i==2)bossT+=10*(1+.1*S.t[5]);
 qp('s');draw();save()}
let ysT=0,svT=0,lpDown=false,lpT=0,dirty=false;
function sv(){const n=Date.now();if(n-svT>3000){svT=n;save()}}
function busy(){return(lpDown&&Date.now()-lpT<3000)||Date.now()-lpT<400}
let BQ=1;const RR=1.13;
function plan(b,l){const base=b*Math.pow(RR,l),tot=n=>base*(Math.pow(RR,n)-1)/(RR-1);let n=BQ;
 if(n=='max'){n=Math.min(2000,Math.max(1,Math.floor(Math.log(1+S.gold*(RR-1)/base)/Math.log(RR))));while(n>1&&tot(n)>S.gold)n--}
 return [n,tot(n)]}
function setQ(q){BQ=q=='max'?'max':+q;tabRender()}
const qsH=()=>'<div class="qs">'+[1,5,25,100,'max'].map(q=>`<button class="${BQ==q?'on':''}" onclick="setQ('${q}')">${q=='max'?'МАКС':'x'+q}</button>`).join('')+'</div>';
const upd=()=>{tabRender();draw();save()};
const pcd=()=>Math.max(0,S.pt+3e5-Date.now()),hms=r=>{const q=Math.ceil(r/1e3),h=Math.floor(q/3600);return (h?h+':':'')+String(Math.floor(q%3600/60)).padStart(h?2:1,'0')+':'+String(q%60).padStart(2,'0')},cdTxt=r=>{const q=Math.ceil(r/1e3);return Math.floor(q/60)+':'+String(q%60).padStart(2,'0')};
function drop(mr=0){const cap=S.floor<200?1:S.floor<600?2:S.floor<1500?3:4,p=.2+Math.min(.25,S.floor/2e4);let r=0;while(r<cap&&Math.random()<p)r++;const it={s:Math.floor(Math.random()*6),r:Math.max(r,mr)};S.inv.push(it);qp('i');return it}
function mergeH(){const m={};S.inv.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});const can=Object.keys(m).some(k=>{const r=+k.split('_')[1];return r<7&&m[k]>=NEED[r]});return `<div class="row"><div><b>Объединить все</b><small>Синтез всех предметов в сумке: 3, 4, 5… одинаковых → 1 следующей редкости (надетые не трогаем)</small></div><button ${can?'':'disabled'} onclick="craftAll()">Объединить</button></div>`}
function craftAll(){const cnt=()=>{const m={};S.inv.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});return m},b=cnt();let n=0;
 for(let r=0;r<7;r++)for(let s=0;s<6;s++){const k=Math.floor(S.inv.filter(x=>x.s==s&&x.r==r).length/NEED[r]);if(k){rm(s,r,NEED[r]*k);for(let j=0;j<k;j++)S.inv.push({s,r:r+1});n+=k}}
 if(!n)return;const a=cnt(),l=Object.keys(a).filter(k=>a[k]>(b[k]||0)).map(k=>{const[s,r]=k.split('_').map(Number);return SI[s]+' '+SL[s]+' · '+RN[r]+' ×'+(a[k]-(b[k]||0))});
 modal(`<h3>Объединение</h3><p>Синтезов: ${n}</p><p>Получено:<br>${l.join('<br>')}</p><button onclick="closeM()">Ок</button>`);upd()}
function rm(s,r,n){let c=0;S.inv=S.inv.filter(x=>!(x.s==s&&x.r==r&&c++<n))}
function equip(s,r){rm(s,r,1);if(S.eq[s]>=0)S.inv.push({s,r:S.eq[s]});S.eq[s]=r;upd()}
function craft(s,r){if(r>=7||S.inv.filter(x=>x.s==s&&x.r==r).length<NEED[r])return;rm(s,r,NEED[r]);S.inv.push({s,r:r+1});upd()}
function invH(){let h=mergeH()+'<div class="row"><div><b>Надето</b>'+SL.map((n,i)=>`<small>${SI[i]} ${n}: ${S.eq[i]>=0?RN[S.eq[i]]+' +'+RB[S.eq[i]]*100+'%':'пусто'}</small>`).join('')+'</div></div>',m={};
 S.inv.forEach(x=>{const k=x.s+'_'+x.r;m[k]=(m[k]||0)+1});
 Object.keys(m).sort((a,b)=>{const[x,y]=a.split('_').map(Number),[u,v]=b.split('_').map(Number);return v-y||x-u}).forEach(k=>{const[s,r]=k.split('_').map(Number);h+=`<div class="row"><div>${SI[s]} <b>${SL[s]}</b> · ${RN[r]} ×${m[k]}<small>+${RB[r]*100}% урона</small></div><div><button onclick="equip(${s},${r})">Надеть</button> <button ${m[k]<NEED[r]||r>=7?'disabled':''} onclick="craft(${s},${r})">${r>=7?'МАКС':NEED[r]+'→1'}</button></div></div>`});
 return h+(S.inv.length?'':'<div class="row"><small>Предметы выпадают с боссов (каждые 10 этажей).</small></div>')}
const hCost=i=>[2e3,1e4,5e4][i]*Math.pow(6,S.b[i][0]),hTime=i=>30*Math.pow(2,S.b[i][0]);
function build(i){const b=S.b[i],c=hCost(i);if(b[1]||S.gold<c)return;S.gold-=c;b[1]=Date.now()+hTime(i)*1e3;qp('h');upd()}
function hTick(){const n=Date.now();let d=false;if(dirty&&!busy()){dirty=false;tabRender()}S.b.forEach(b=>{if(b[1]&&b[1]<=n){b[0]++;b[1]=0;d=true}});
 if(tab=='rew')document.querySelectorAll('[data-ab]').forEach(b=>{const i=+b.dataset.ab,c=S.ac[i]-n,t=c>0?'⏳ '+hms(c):'📺 Открыть';if(b.textContent!==t)b.textContent=t;b.disabled=c>0});if(tab=='pres'){const r=pcd(),g=soulGain();document.querySelectorAll('[data-pc]').forEach(e=>e.textContent=r>0?'Кулдаун перерождения: '+cdTxt(r):'');document.querySelectorAll('[data-pb]').forEach(e=>e.disabled=r>0||g<1)}if(tab!='house')return;if(d)tabRender();else document.querySelectorAll('[data-ft]').forEach(e=>e.textContent='Строится: '+Math.max(0,Math.ceil((+e.dataset.ft-n)/1e3))+' с')}
function houseH(){return BN.map((a,i)=>{const b=S.b[i],c=hCost(i);return `<div class="row"><div><b>${a[0]}</b> ур.${b[0]}<small>${a[1]} за ур.</small>${b[1]?`<small data-ft="${b[1]}"></small>`:`<small>Время постройки: ${hTime(i)} с</small>`}</div><button ${b[1]?'disabled':`data-b="${c}"`} onclick="build(${i})">💰${fmt(c)}</button></div>`}).join('')}
function qpick(){const a=QD.map((_,i)=>i).sort(()=>Math.random()-.5),r=[],ks={};for(const i of a){if(!ks[QD[i][1]]){ks[QD[i][1]]=1;r.push(i)}if(r.length==5)break}return r}
function qn(){if(!S.q||!S.q.p||Date.now()-S.q.t>864e5)S.q={t:Date.now(),k:0,c:0,b:0,u:0,s:0,r:0,i:0,a:0,h:0,f:0,d:[0,0,0,0,0],p:qpick()}}
function qp(k,n=1){qn();S.q[k]+=n}
function qClaim(j){qn();const q=QD[S.q.p[j]];if(S.q.d[j]||S.q[q[1]]<q[2])return;S.q.d[j]=1;S.gold+=mHP(Math.max(S.max,10))*q[3];upd()}
function acGive(i){const g=mHP(Math.max(S.max,10)),[gm,ni,mr,so]=[[4,0,0,0],[10,1,0,0],[30,2,1,0],[100,3,2,1]][i];S.gold+=g*gm;const its=[];for(let k=0;k<ni;k++)its.push(drop(mr));let t='💰'+fmt(g*gm);if(so){const x=1+Math.floor(S.max/100);S.souls+=x;S.tot+=x;t+=' · 🔮'+x}return t+its.map(it=>'<br>'+SI[it.s]+' '+SL[it.s]+' · '+RN[it.r]+' (+'+RB[it.r]*100+'%)').join('')}
function openAc(i){if(S.ac[i]>Date.now())return;rewarded(()=>{S.ac[i]=Date.now()+AC[i][2];const t=acGive(i);modal(`<h3>${AC[i][0]}</h3><p>${t}</p><button onclick="closeM()">Ок</button>`);upd()})}
function rewH(){const n=Date.now();return AC.map((a,i)=>{const c=S.ac[i]-n;return `<div class="row"><div><b>${a[0]}</b><small>${a[1]}</small><small>Перезарядка: ${hms(a[2])}</small></div><button data-ab="${i}" ${c>0?'disabled':''} onclick="openAc(${i})">${c>0?'⏳ '+hms(c):'📺 Открыть'}</button></div>`}).join('')}
const dg=n=>mHP(Math.max(S.max,10))*5*n;
function dayStrip(cur,got){let h='';for(let i=0;i<7;i++)h+=`<div class="${i==cur?'cur':i<got?'got':''}">Д${i+1}<br>💰${fmt(dg(i+1))}${i==6?'<br>+5🔮':''}</div>`;return h}
function dClaim(){const t=new Date().toDateString();if(S.dl==t)return;const y=new Date(Date.now()-864e5).toDateString(),n=S.dl==y?S.day:0;
 S.gold+=mHP(Math.max(S.max,10))*5*(n+1);if(n==6){S.souls+=5;S.tot+=5}S.day=(n+1)%7;S.dl=t;upd()}
function questH(){qn();const t=new Date().toDateString(),y=new Date(Date.now()-864e5).toDateString(),nx=(S.dl==y?S.day:0)+1,ok=S.dl!=t;
 return `<div class="row"><div><b>Ежедневный вход</b><small>${ok?'День '+nx+' из 7 · награда: 💰'+fmt(dg(nx))+(nx==7?' + 5 🔮':''):'Сегодня получено. Завтра (день '+(S.day+1)+'): ≈💰'+fmt(dg(S.day+1))+(S.day==6?' + 5 🔮':'')}</small></div><button ${ok?'':'disabled'} onclick="dClaim()">Забрать</button></div><div class="days">${dayStrip(ok?nx-1:-1,ok?nx-1:(S.day||7))}</div>`+
 S.q.p.map((qi,j)=>{const q=QD[qi],v=Math.min(S.q[q[1]],q[2]);return `<div class="row"><div>${q[0]}<small>${v}/${q[2]} · награда 💰${fmt(mHP(Math.max(S.max,10))*q[3])}</small></div><button ${S.q.d[j]||v<q[2]?'disabled':''} onclick="qClaim(${j})">${S.q.d[j]?'✔':'Награда'}</button></div>`}).join('')+
 `<div class="row"><small>Задания обновятся через ${Math.ceil((864e5-(Date.now()-S.q.t))/36e5)} ч.</small></div>`}
const TB=[3,3,3,5,5,8,8,10],TM=[1e9,1e9,1e9,1e9,25,20,15,16],tc=i=>TB[i]*Math.pow(2,S.t[i]);
function soulGain(){return Math.floor(S.run/5*(1+S.run/400))}
function buyT(i){if(S.t[i]>=TM[i]||S.souls<tc(i))return;S.souls-=tc(i);S.t[i]++;upd()}
function talH(){return TN.map((a,i)=>{const mx=S.t[i]>=TM[i];return `<div class="row"><div><b>${a[0]}</b> ур.${S.t[i]}${TM[i]<1e9?'/'+TM[i]:''}<small>${a[1]} · навсегда</small></div><button ${mx||S.souls<tc(i)?'disabled':''} onclick="buyT(${i})">${mx?'МАКС':'🔮'+fmt(tc(i))}</button></div>`}).join('')}

init();
