/* 共用：游標夥伴、倉鼠（眼睛追游標）、紙花、換品牌、栗栗推地毯轉場 */
(function(){
'use strict';
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var EYES={"lili":{"l":[33.67,40.19],"r":[66.33,40.16],"d":7.2},"tiaotiao":{"l":[39.53,45.05],"r":[60.9,45.05],"d":4.8},"xiaosha":{"l":[32.91,40.46],"r":[66.74,40.43],"d":6.6}};
if(RM)document.documentElement.classList.add('rm');
var C=window.CUTE={RM:RM,mouse:{x:innerWidth/2,y:innerHeight/2},$:$,$$:$$,hams:[]};
var LOGOS={atelier:'<path d="M12 3.5l5.5 8.5-5.5 8.5-5.5-8.5z"/><path d="M12 3.5v17"/>',alley:'<path d="M5 20L12 4l7 16"/><path d="M8.2 13.5h7.6"/>',leaf:'<path d="M12 20v-8"/><path d="M12 13c-4 0-6-2-6-6 4 0 6 2 6 6z"/><path d="M12 15c0-3 2-5 6-5 0 3-2 5-6 5z"/>',rose:'<circle cx="12" cy="11" r="3.2"/><path d="M12 7.8C10 5 7 5.5 6.5 8.5c-.4 2.6 1.6 3.7 3 3.5M12 14.2c-2 2.8-5 2.3-5.5-.7M16 12c2.4-.5 3-3.4.6-4.6M12 14.2V21M12 18c2-.2 3.5-1 4.5-2.5"/>',hanger:'<path d="M12 8.5V7a2 2 0 1 1 2-2"/><path d="M12 8.5L3.5 15.2c-.9.7-.4 2.3.8 2.3h15.4c1.2 0 1.7-1.6.8-2.3z"/>'};
C.logo=function(k){return '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">'+(LOGOS[k]||LOGOS.leaf)+'</svg>'};
function shade(c,f){c=c.replace('#','');var a=[0,2,4].map(function(i){return parseInt(c.substr(i,2),16)}).map(function(v){return Math.max(0,Math.min(255,Math.round(f<0?v*(1+f):v+(255-v)*f)))});return '#'+a.map(function(v){return ('0'+v.toString(16)).slice(-2)}).join('')}
C.shade=shade;
/* 套用目前這家店的品牌：顏色、店名、Logo（TX 資料層是唯一來源，首頁與後台共用） */
C.applyTheme=function(){var TX=window.TX;if(!TX)return;var D=TX.D(),k=TX.shopKey(),t=TX.THEMES[k],acc=D.accCustom||t.acc,d=D.accCustom?shade(acc,-.22):t.d,soft=D.accCustom?shade(acc,.78):t.soft;
  var s=document.documentElement.style;s.setProperty('--acc',acc);s.setProperty('--acc-d',d);s.setProperty('--acc-soft',soft);
  var name=D.name;$$('[data-brand]').forEach(function(e){e.textContent=name});$$('[data-logo]').forEach(function(e){e.innerHTML=C.logo(D.logo)});
  $$('#themes .sw').forEach(function(b){b.classList.toggle('on',b.dataset.theme===k)});document.title='示範後台｜'+name+'｜棠序問策股份有限公司建置';};
C.setTheme=function(k){if(!window.TX)return;TX.setShop(k);C.applyTheme();document.dispatchEvent(new CustomEvent('shopchange',{detail:k}))};
C.applyTheme();

/* 游標夥伴：彈簧跟隨、依速度擠壓、點擊壓扁 */
var cur=$('#cursor');
if(cur&&!RM&&matchMedia('(hover:hover)').matches){
  document.body.classList.add('hascur');
  var b=$('.b',cur),cx=0,cy=0,px=0,py=0,on=false;
  gsap.set(cur,{opacity:0});
  window.addEventListener('pointermove',function(e){C.mouse.x=e.clientX;C.mouse.y=e.clientY;if(!on){on=true;cx=px=e.clientX;cy=py=e.clientY;gsap.set(cur,{opacity:1})}
    var t=e.target.closest&&e.target.closest('[data-cur]');
    if(t){cur.classList.add('big');b.textContent=t.getAttribute('data-cur')}else{cur.classList.remove('big');b.textContent=''}});
  window.addEventListener('pointerdown',function(){gsap.fromTo(b,{scale:.7},{scale:1,duration:.6,ease:'elastic.out(1.2,.35)'})});
  gsap.ticker.add(function(){
    if(!on)return;
    cx+=(C.mouse.x-cx)*.28;cy+=(C.mouse.y-cy)*.28;
    var vx=cx-px,vy=cy-py,v=Math.min(Math.hypot(vx,vy),40),ang=Math.atan2(vy,vx)*180/Math.PI;px=cx;py=cy;
    gsap.set(cur,{x:cx,y:cy});
    gsap.set(b,{rotation:ang,scaleX:1+v/80,scaleY:1-v/160,overwrite:false});
  });
}else if(cur){cur.style.display='none';window.addEventListener('pointermove',function(e){C.mouse.x=e.clientX;C.mouse.y=e.clientY})}
else window.addEventListener('pointermove',function(e){C.mouse.x=e.clientX;C.mouse.y=e.clientY});

/* 倉鼠 */
var PHRASES=['好耶！','今天也要準時出貨！','摸摸我～','我在看你喔','咕嚕咕嚕～'];
C.say=function(k,text){var L=C.hams.filter(function(h){return h.k===k&&h.el.offsetParent}).pop();if(L)C.jump(L,text)};
C.initHam=function(el){
  var k=el.dataset.ham,E=EYES[k];el.classList.add('ham');el.style.setProperty('--ed',E.d+'%');
  el.innerHTML='<img class="bd" src="mascot/'+k+'_idle.webp" alt="'+({lili:'栗栗',tiaotiao:'條條',xiaosha:'小沙'}[k])+'（原創倉鼠）"><i class="eye l" style="left:'+E.l[0]+'%;top:'+E.l[1]+'%"></i><i class="eye r" style="left:'+E.r[0]+'%;top:'+E.r[1]+'%"></i><span class="say"></span>';
  var L={el:el,k:k,img:$('.bd',el),eyes:$$('.eye',el),say:$('.say',el),busy:false};C.hams.push(L);
  el.setAttribute('data-cur','摸摸');
  el.addEventListener('click',function(){C.jump(L)});
  if(!RM)(function bl(){gsap.delayedCall(2+Math.random()*3,function(){gsap.to(L.eyes,{scaleY:.1,duration:.08,yoyo:true,repeat:1});bl()})})();
  return L;
};
C.jump=function(L,text){
  if(L.busy)return;L.busy=true;L.img.src='mascot/'+L.k+'_happy.webp';
  L.say.textContent=text||PHRASES[Math.floor(Math.random()*PHRASES.length)];
  var done=function(){L.busy=false;L.img.src='mascot/'+L.k+'_idle.webp'};
  if(RM){setTimeout(done,900);return}
  var tl=gsap.timeline({onComplete:done});
  tl.to(L.el,{scaleY:.8,scaleX:1.12,duration:.12,ease:'power2.in'})
    .to(L.el,{y:-90,scaleY:1.12,scaleX:.92,duration:.3,ease:'power2.out'})
    .to(L.el,{y:0,scaleY:.84,scaleX:1.1,duration:.24,ease:'power2.in'})
    .to(L.el,{scaleX:1,scaleY:1,duration:.7,ease:'elastic.out(1,.32)'});
  gsap.fromTo(L.say,{scale:0},{scale:1,duration:.4,ease:'back.out(3)'});gsap.to(L.say,{scale:0,delay:1.8,duration:.25});
  var r=L.el.getBoundingClientRect();
  for(var i=0;i<8;i++){var s=document.createElement('i');s.className='star';s.style.left=(r.left+r.width/2)+'px';s.style.top=(r.top+r.height*.3)+'px';s.style.background=['#FFD45E','#FF8DAA','#7BDDB5','#86C8FF'][i%4];document.body.appendChild(s);
    gsap.to(s,{x:(Math.random()-.5)*300,y:-90-Math.random()*170,rotation:Math.random()*360,scale:.5+Math.random()*1.2,opacity:0,duration:1.2,ease:'power2.out',onComplete:(function(n){return function(){n.remove()}})(s)})}
};
$$('[data-ham]').forEach(C.initHam);
gsap.ticker.add(function(){
  C.hams.forEach(function(L){
    var r=L.el.getBoundingClientRect();if(!r.width||r.bottom<-50||r.top>innerHeight+50)return;
    var ex=r.left+r.width*.5,ey=r.top+r.height*.4;
    var dx=Math.max(-1,Math.min(1,(C.mouse.x-ex)/300)),dy=Math.max(-1,Math.min(1,(C.mouse.y-ey)/300)),m=r.width*.02;
    L.eyes.forEach(function(e){e.style.translate=(dx*m)+'px '+(dy*m)+'px'});
  });
});

/* 紙花（愛心、星星、圓點、緞帶，糖果色） */
var cv=$('#confetti');
if(cv){
  var cc=cv.getContext('2d'),parts=[],raf=0;
  var rs=function(){cv.width=innerWidth;cv.height=innerHeight};rs();addEventListener('resize',rs);
  var COLS=['#FF8DAA','#FFD45E','#7BDDB5','#86C8FF','#FFB48A','#FF5E7E','#fff'];
  C.burst=function(x,y,n){
    for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,s=6+Math.random()*13;
      parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-9,w:9+Math.random()*12,r:Math.random()*6,vr:(Math.random()-.5)*.35,c:COLS[i%COLS.length],t:i%4,life:1})}
    if(!raf)loop()};
  var loop=function(){
    cc.clearRect(0,0,cv.width,cv.height);parts=parts.filter(function(p){return p.life>0&&p.y<cv.height+40});
    parts.forEach(function(p){p.vy+=.34;p.vx*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;p.life-=.008;
      cc.save();cc.globalAlpha=Math.max(0,Math.min(1,p.life*2));cc.translate(p.x,p.y);cc.rotate(p.r);cc.fillStyle=p.c;var w=p.w;cc.beginPath();
      if(p.t===0){cc.arc(0,0,w/2,0,7)}
      else if(p.t===1){for(var i=0;i<10;i++){var rr=i%2?w*.22:w*.55,a=i*Math.PI/5-Math.PI/2;cc.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}cc.closePath()}
      else if(p.t===2){var s=w*.5;cc.moveTo(0,s*.9);cc.bezierCurveTo(-s*1.6,-s*.2,-s*.7,-s*1.3,0,-s*.45);cc.bezierCurveTo(s*.7,-s*1.3,s*1.6,-s*.2,0,s*.9)}
      else{cc.roundRect?cc.roundRect(-w/2,-w/6,w,w/3,w/6):cc.rect(-w/2,-w/6,w,w/3)}
      cc.fill();cc.restore()});
    raf=parts.length?requestAnimationFrame(loop):0};
}

/* 追蹤：LINE 按鈕（連結空白，只記錄） */


/* ---------- 轉場：栗栗推著地毯捲，由左滾到右 ---------- */
var roll=document.createElement('div');roll.id='roll';
roll.innerHTML='<div class="rug"></div><div class="tube"></div><div class="ham" data-ham="lili"></div>';
document.body.appendChild(roll);
var rug=$('.rug',roll),tube=$('.tube',roll),rh=$('.ham',roll);C.initHam(rh);
/* T03 質感精品：不推地毯。中間一條麥金細線，左右兩扇絲綿幕由中間往兩側拉開（離開時由兩側合上）。 */
var CURT=!!(window.THEME&&THEME.cfg&&THEME.cfg.motion&&THEME.cfg.motion.curtain),cvl,cvr,seam;
if(CURT){roll.classList.add('curtain');roll.insertAdjacentHTML('beforeend','<div class="cv l"></div><div class="cv r"></div><i class="seam"></i>');cvl=$('.cv.l',roll);cvr=$('.cv.r',roll);seam=$('.seam',roll)}
var W=function(){return innerWidth};
function place(X,mode){
  gsap.set(tube,{x:X});
  gsap.set(rug,{x:mode==='in'?X-W():X});
  tube.style.backgroundPosition=(X*.9)+'px 0';
  var hop=Math.abs(Math.sin(X/70))*26;
  gsap.set(rh,{x:X-320,y:-hop,rotation:9,scaleY:1-hop/400,transformOrigin:'50% 100%'});
}
/* 跨頁連結帶上目前這一頁的風格。避免其他分頁改了 localStorage，這一頁畫面還是舊風格，點進去卻變成別套。 */
C.withSkin=function(url){var skin=(window.THEME&&THEME.key)||'cute';if(!url)return url;
  var i=url.indexOf('#'),path=i<0?url:url.slice(0,i),hash=i<0?'':url.slice(i);
  if(/[?&]theme=/.test(path))return url;
  path+=(path.indexOf('?')>=0?'&':'?')+'theme='+encodeURIComponent(skin);
  return path+hash};
/* 舊版等 1.25s 整段推完（地毯已推出畫面）才改網址，下一頁再從頭掃一次並多等 0.18s，中間會卡住。
   現在：一點就預載下一頁；地毯蓋滿就跳轉；下一頁從蓋滿處接著推開，中間用 roll-hold 同色蓋住。 */
function rollDur(px){return Math.max(.5,Math.min(.95,1.25*px/(W()+880)))}
C.prefetch=function(url){
  url=C.withSkin(url);var path=url.split('#')[0];if(!path)return;
  if(!C._pre)C._pre={};if(C._pre[path])return;C._pre[path]=1;
  try{
    var l=document.createElement('link');l.rel='prefetch';l.href=path;l.as='document';document.head.appendChild(l);
    var file=path.split('?')[0].split('/').pop()||'index.html';
    var packs={'app.html':['css/work.css','css/app.css','js/app.js','js/pages-orders.js','js/pages-products.js','js/pages-misc.js','js/chrome.js','js/ui.js'],
      'shop.html':['css/shop.css','js/shop.js','js/shop-pages.js','js/ui.js'],
      'index.html':['css/home.css','js/home.js','js/chrome.js','vendor/ScrollTrigger.min.js','vendor/lenis.min.js']};
    (packs[file]||[]).forEach(function(src){var p=document.createElement('link');p.rel='prefetch';p.href=src;document.head.appendChild(p)});
    if(!(window.THEME&&THEME.cfg&&THEME.cfg.mascot===false)){var m=document.createElement('link');m.rel='prefetch';m.href='mascot/lili_idle.webp';m.as='image';document.head.appendChild(m)}
  }catch(e){}
};
C.go=function(url){
  url=C.withSkin(url);
  C.prefetch(url);
  if(RM){location.href=url;return}
  if(C._going)return;C._going=true;
  try{sessionStorage.setItem('roll','1')}catch(e){}
  roll.style.visibility='visible';
  if(CURT){var gone=false,leave=function(){if(gone)return;gone=true;location.href=url};
    gsap.set(cvl,{xPercent:-100});gsap.set(cvr,{xPercent:100});gsap.set(seam,{scaleY:0,opacity:1});
    gsap.timeline({onComplete:leave}).to([cvl,cvr],{xPercent:0,duration:.75,ease:'power3.inOut'},0).to(seam,{scaleY:1,duration:.45,ease:'power2.out'},.4);
    setTimeout(leave,1600);return}
  var coverX=W(),o={X:-260},nav=false;
  place(o.X,'in');
  var goNow=function(){if(nav)return;nav=true;location.href=url};
  gsap.to(o,{X:coverX,duration:rollDur(coverX+260),ease:'power2.inOut',onUpdate:function(){place(o.X,'in');if(o.X>=coverX-8)goNow()},onComplete:goNow});
};
if(window.THEME&&THEME.cfg&&THEME.cfg.motion&&THEME.cfg.motion.speed&&window.gsap)gsap.globalTimeline.timeScale(THEME.cfg.motion.speed);
var cameFrom=false;try{cameFrom=sessionStorage.getItem('roll')==='1';sessionStorage.removeItem('roll')}catch(e){}
C.rollEntering=cameFrom&&!RM;
C.rollOutDur=0;
if(cameFrom&&!RM&&CURT){
  roll.style.visibility='visible';C.rollOutDur=1.05;
  gsap.set([cvl,cvr],{xPercent:0});gsap.set(seam,{scaleY:1,opacity:1});
  requestAnimationFrame(function(){
    document.documentElement.classList.remove('roll-hold');
    gsap.timeline({onComplete:function(){roll.style.visibility='hidden'}})
      .to(seam,{scaleY:0,opacity:0,duration:.35,ease:'power2.in'},0)
      .to(cvl,{xPercent:-100,duration:1.05,ease:'power3.inOut'},.15)
      .to(cvr,{xPercent:100,duration:1.05,ease:'power3.inOut'},.15);
  });
}else if(cameFrom&&!RM){
  roll.style.visibility='visible';
  var coverX=W(),endX=coverX*2+80,o2={X:coverX};
  place(o2.X,'in');
  C.rollOutDur=rollDur(endX-coverX);
  requestAnimationFrame(function(){
    document.documentElement.classList.remove('roll-hold');
    gsap.to(o2,{X:endX,duration:C.rollOutDur,ease:'power2.out',onUpdate:function(){place(o2.X,'in')},onComplete:function(){roll.style.visibility='hidden'}});
  });
}else{
  document.documentElement.classList.remove('roll-hold');
}
window.addEventListener('pageshow',function(e){if(e.persisted){roll.style.visibility='hidden';document.documentElement.classList.remove('roll-hold')}});
document.addEventListener('pointerenter',function(e){var g=e.target.closest&&e.target.closest('[data-go]');if(g)C.prefetch(g.getAttribute('data-go'))},true);
document.addEventListener('click',function(e){var g=e.target.closest('[data-go]');if(!g)return;e.preventDefault();var u=g.getAttribute('data-go'),cur=location.pathname.split('/').pop()||'index.html',pg=u.split('#')[0].split('?')[0],hs=u.split('#')[1];
  if(pg===cur||pg===''){if(hs!=null){if(location.hash==='#'+hs)document.dispatchEvent(new Event('hashchange'));else location.hash=hs}else window.scrollTo({top:0,behavior:'smooth'})}else C.go(u)});
})();
