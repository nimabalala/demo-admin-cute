/* 商店頁面：模特兒穿搭輪盤（棠序問策自製外掛 Model Lookbook v1.2.0 的示範版）
   輪盤、側欄、熱點的互動沿用外掛的作法，這裡改成讀同一份資料（TX.LB），加入購物車走商店頁面現有的購物車（TX.cart*）。 */
(function(){
'use strict';
var C=window.CUTE,TX=window.TX,U=window.TXUI,SH=window.SHOP,LB=TX.LB,$=C.$,$$=C.$$,h=TX.esc,RM=C.RM;
var TAU=Math.PI*2;
var ST=SH.ui.lb=SH.ui.lb||{cur:0,open:false,vk:{}};
/* 從示範首頁連過來：#/lookbook?shop=fashion&demo=1 → 先換到北風衣櫥（還沒匯入就自動匯入示範穿搭） */
(function(){var hs=location.hash||'',i=hs.indexOf('?');if(i<0)return;var q=new URLSearchParams(hs.slice(i+1)),k=q.get('shop');if(k&&k!==TX.shopKey()){try{TX.setShop(k)}catch(e){}}})();
function mod(a,n){return ((a%n)+n)%n}
function wrapOffset(v,n){var hf=n/2;return mod(v+hf,n)-hf}
function inert(el,on){if(!el)return;if(on)el.setAttribute('inert','');else el.removeAttribute('inert')}
function ink(hex){hex=String(hex||'').replace('#','');if(hex.length===3)hex=hex.replace(/(.)/g,'$1$1');var n=parseInt(hex,16)||0,r=n>>16&255,g=n>>8&255,b=n&255;return (r*299+g*587+b*114)/1000>150?'#4B2E22':'#FFFFFF'}
/* ---------- 畫面 ---------- */
function pinHtml(look){return look.items.map(function(it,j){if(it.x==null||it.y==null||it.x==='')return '';return '<button type="button" class="mlb-pin" data-item="'+j+'" style="left:'+(+it.x)+'%;top:'+(+it.y)+'%" aria-label="第 '+(j+1)+' 件：'+h(LB.res(it).name)+'">'+(j+1)+'</button>'}).join('')}
function itemHtml(look,it,j,set){var r=LB.res(it),vk=r.linked?LB.pickVk(r,ST.vk[it.id]):'',pr=r.linked&&r.vks.length&&vk?TX.vprice(r.p,vk):r.price,orig=r.linked&&r.vks.length&&vk?TX.vorig(r.p,vk):r.orig;
  var sel='',btn='';
  if(r.linked&&r.vks.length){sel='<label class="mlb-sel"><span>'+h((r.p.specs&&r.p.specs.s1&&r.p.specs.s1.name)||'款式')+'</span><select data-a="lbvk" data-iid="'+h(it.id)+'" aria-label="選'+h(r.name)+'的款式">'+r.vks.map(function(k){var s=TX.vstock(r.p,k);return '<option value="'+h(k)+'"'+(k===vk?' selected':'')+(s<=0?' disabled':'')+'>'+h(TX.vlabel(k))+(s<=0?'（缺貨）':s<=5?'（剩 '+s+' 件）':'')+'</option>'}).join('')+'</select></label>'}
  if(!r.linked)btn='<span class="mlb-nolink">'+(r.gone?'這件已下架':'這件還沒連到商品')+'</span>';
  else if(r.soldout||(r.vks.length&&!vk))btn='<button class="btn sm" type="button" disabled>已售完</button>';
  else btn='<button class="btn sm mlb-item__cart" type="button" data-a="lbadd" data-look="'+h(look.id)+'" data-iid="'+h(it.id)+'">加入購物車</button>';
  return '<li class="mlb-item" data-item="'+j+'" data-iid="'+h(it.id)+'"><span class="mlb-item__num">'+(j+1)+'</span><div class="mlb-item__img">'+(r.img?'<img src="'+h(r.img)+'" alt="" loading="lazy" width="92" height="123">':'')+'</div><div class="mlb-item__b"><p class="mlb-item__name">'+h(r.name)+'</p>'+
    (+set.price?'<p class="mlb-item__price" data-price>'+(r.sale&&orig>pr?'<s>'+TX.money(orig)+'</s>':'')+'<b>'+TX.money(pr)+'</b>'+(r.from&&!vk?' 起':'')+'</p>':'')+
    (r.low?'<p class="mlb-item__low">只剩 '+r.stock+' 件</p>':'')+(it.note?'<p class="mlb-item__note">'+h(it.note)+'</p>':'')+sel+'<div class="mlb-item__acts">'+btn+(r.linked?'<a class="mlb-item__link" href="#/p/'+h(r.p.id)+'">看商品頁 ›</a>':'')+'</div></div></li>'}
function panelHtml(look,i,set){var lines=look.items.map(function(it,j){return itemHtml(look,it,j,set)}).join('');
  return '<div class="mlb-panel" data-look="'+h(look.id)+'"'+(i?' hidden':'')+'><h3 class="mlb-panel__title">'+h(look.title)+'</h3><p class="mlb-panel__sub">'+h(look.sub||'')+'</p>'+(lines?'<ul class="mlb-items">'+lines+'</ul>':'<p class="mlb-panel__empty">這套還沒有單品。</p>')+
'</div>'}
function allHtml(look,i){return '<div class="mlb-all" data-look="'+h(look.id)+'"'+(i?' hidden':'')+'><button class="btn mlb-all__btn" type="button" data-a="lball" data-look="'+h(look.id)+'"><span class="t">整套加入購物車</span><b data-total></b></button><a class="mlb-viewcart" href="#/cart">去購物車結帳 ›</a></div>'}
/* 輪盤（首頁區塊與專屬頁面共用）。opts.page＝專屬頁面（比較高） */
SH.lookbookHtml=function(opts){opts=opts||{};var lb=LB.get(),set=lb.set,looks=LB.visible();if(!looks.length)return '';
  var acc=set.accent||'#4B2E22';
  var actors=looks.map(function(l,i){return '<div class="mlb-actor" style="--mlb-ratio:.4" data-look="'+h(l.id)+'"><button type="button" class="mlb-portrait" aria-haspopup="dialog" aria-expanded="false" aria-label="看「'+h(l.title)+'」的穿搭單品"><img src="'+h(l.img)+'" alt="'+h(l.title)+'" width="640" height="1600" '+(i>2?'loading="lazy"':'')+' draggable="false"></button><div class="mlb-pins">'+pinHtml(l)+'</div></div>'}).join('');
  var labels=looks.map(function(l,i){return '<div class="mlb-label__text"'+(i?' hidden':'')+'><h3 class="mlb-label__title">'+h(l.title)+'</h3><span class="mlb-label__sub">'+h(l.sub||'')+'・'+l.items.length+' 件單品</span></div>'}).join('');
  var tabs=looks.map(function(l,i){return '<button type="button" class="mlb-tab" aria-pressed="'+(i?'false':'true')+'" aria-label="第 '+(i+1)+' 套：'+h(l.title)+'">'+('0'+(i+1)).slice(-2)+'</button>'}).join('');
  var rt='<section class="mlb-runway lbx'+(opts.page?' is-page':'')+'" id="lbr" role="region" aria-roledescription="穿搭輪盤" aria-label="模特兒穿搭輪盤" data-autoplay="'+(+set.autoplay?1:0)+'" data-interval="'+(+set.interval||4400)+'" data-spacing="'+(+set.spacing||1.3)+'" style="--mlb-accent:'+h(acc)+';--mlb-on:'+ink(acc)+'">'+
   '<div class="mlb-bg" aria-hidden="true"><i class="sp sp1"></i><i class="sp sp2"></i><span class="ghost">LOOKBOOK</span><i class="st st1"></i><i class="st st2"></i><i class="st st3"></i></div><div class="mlb-floor" aria-hidden="true"></div>'+
   '<div class="mlb-stage"><div class="mlb-actors">'+actors+'</div></div>'+
   '<div class="mlb-label" aria-live="polite"><span class="mlb-label__num"></span>'+labels+'<button type="button" class="mlb-discover">看這套穿了什麼 <i>＋</i></button></div>'+
   '<div class="mlb-bar"><button type="button" class="mlb-arrow mlb-prev" aria-label="上一套">←</button><div class="mlb-tabs" role="group" aria-label="切換穿搭">'+tabs+'</div><div class="mlb-bar__right"><span class="mlb-hint">左右拖曳瀏覽</span><button type="button" class="mlb-play" aria-label="暫停自動播放"><span>Ⅱ</span></button><button type="button" class="mlb-arrow mlb-next" aria-label="下一套">→</button></div></div>'+
   '<aside class="mlb-sheet" role="dialog" aria-label="這套穿搭的單品" inert><div class="mlb-grip" aria-hidden="true"><i></i></div><div class="mlb-sheet__top"><span class="mlb-eyebrow">'+h(set.eyebrow)+'</span><button type="button" class="mlb-close" aria-label="關閉">×</button></div><div class="mlb-sheet__body">'+looks.map(function(l,i){return panelHtml(l,i,set)}).join('')+'</div><div class="mlb-allbox">'+looks.map(allHtml).join('')+'</div><div class="mlb-sheet__foot"><p>'+h(set.note)+'</p><button type="button" class="mlb-back">← 返回穿搭輪盤</button></div></aside></section>';
  return rt};
SH.lookbookHead=function(page){var set=LB.get().set;return '<div class="lb-head rvl"><div><span class="lb-kick">LOOKBOOK <i>棠序自製外掛</i></span>'+(page?'<h1 class="sec-t">':'<h2 class="sec-t">')+h(set.title)+(page?'</h1>':'</h2>')+'<p>'+h(set.sub)+'</p></div>'+(page?'':'<a class="more" href="#/lookbook" data-cur="全螢幕看">全部穿搭 ›</a>')+'</div>'};
/* ---------- 輪盤的互動（沿用外掛 runway.js 的作法） ---------- */
function Runway(root){this.root=root;this.stage=$('.mlb-stage',root);this.actorsBox=$('.mlb-actors',root);this.actors=$$('.mlb-actor',root);this.panels=$$('.mlb-panel',root);this.allbars=$$('.mlb-all',root);this.labelTexts=$$('.mlb-label__text',root);this.labelNum=$('.mlb-label__num',root);this.label=$('.mlb-label',root);this.bar=$('.mlb-bar',root);this.tabs=$$('.mlb-tab',root);this.sheet=$('.mlb-sheet',root);this.body=$('.mlb-sheet__body',root);this.closeBtn=$('.mlb-close',root);this.playBtn=$('.mlb-play',root);this.grip=$('.mlb-grip',root);
  this.n=this.actors.length;this.stepV=this.n>=5?TAU/this.n:TAU/6;this.rotation=0;this.target=0;this.current=0;this.detail=false;this.trigger=null;this.drag=null;this.dragged=false;this.raf=0;this.lastT=0;this.timer=0;this.visible=true;this.userPaused=false;
  this.autoplay=root.getAttribute('data-autoplay')==='1';this.interval=parseInt(root.getAttribute('data-interval'),10)||4400;this.compact=false;this.spacing=parseFloat(root.getAttribute('data-spacing'))||1.3;
  this.ratios=this.actors.map(function(a){return parseFloat(a.style.getPropertyValue('--mlb-ratio'))||.4});this.maxRatio=Math.max.apply(null,this.ratios);
  if(this.n)this.init()}
var P=Runway.prototype;
P.init=function(){var self=this,root=this.root;root.classList.add('is-ready');this.bind();this.measure();this.updateUI();this.updatePlay();
  if('ResizeObserver' in window)new ResizeObserver(function(){self.measure()}).observe(root);else window.addEventListener('resize',function(){self.measure()});
  if('IntersectionObserver' in window)new IntersectionObserver(function(es){self.visible=es[0].isIntersecting;self.scheduleAuto()},{threshold:.25}).observe(root);
  document.addEventListener('visibilitychange',function(){self.scheduleAuto()});this.scheduleAuto()};
P.measure=function(){var w=this.root.clientWidth;this.compact=w<=600;this.root.classList.toggle('is-compact',this.compact);this.layout();if(this.detail)this.applyDetail()};
P.layout=function(){var W=this.stage.clientWidth,H=this.stage.clientHeight,n=this.n,actorH=Math.max(120,Math.round(H*.94));this.root.style.setProperty('--mlb-actor-h',actorH+'px');
  var aw=actorH*this.maxRatio,rx=0;if(n>1){var sinStep=Math.sin(Math.min(this.stepV,Math.PI/2));rx=Math.min((this.spacing*aw)/sinStep,W/2-aw*.25);rx=Math.max(rx,0)}
  var ry=H*.1;
  for(var i=0;i<n;i++){var el=this.actors[i],off=n>1?wrapOffset(i-this.rotation,n):0,a=off*this.stepV,depth=(Math.cos(a)+1)/2,x=Math.sin(a)*rx,y=-(1-depth)*ry,s=.6+.4*depth,op=Math.max(0,Math.pow(depth,2.4)-.02);
    if(n<5&&n>1){var edge=n/2-Math.abs(off);op*=Math.max(0,Math.min(1,edge/.6))}
    el.style.transform='translateX(-50%) translate3d('+x.toFixed(2)+'px,'+y.toFixed(2)+'px,0) scale('+s.toFixed(4)+')';el.style.opacity=op.toFixed(3);el.style.zIndex=String(Math.round(depth*100));
    el.classList.toggle('is-front',Math.abs(off)<.5);el.classList.toggle('is-faded',op<.06)}};
P.applyDetail=function(){var box=this.actorsBox;if(!this.detail){box.style.transform='';return}
  var rootW=this.root.clientWidth,rootH=this.root.clientHeight,actor=this.actors[this.current],aw=actor.offsetWidth||1,ah=actor.offsetHeight||1,tx=0,ty=0,s=1;
  if(this.compact){var availH=rootH-this.sheet.offsetHeight,stageBottom=this.stage.offsetTop+this.stage.offsetHeight,targetBottom=availH-8;ty=targetBottom-stageBottom;s=Math.min(1,(targetBottom-10)/ah)}
  else{var sheetW=this.sheet.offsetWidth;tx=-sheetW/2;var bottomTarget=rootH-30,stageBottomD=this.stage.offsetTop+this.stage.offsetHeight;ty=bottomTarget-stageBottomD;s=Math.min(1.3,(rootH-56)/ah,(rootW-sheetW-32)/aw)}
  if(!(s>.2))s=.2;box.style.transform='translate('+tx.toFixed(1)+'px,'+ty.toFixed(1)+'px) scale('+s.toFixed(3)+')'};
P.select=function(i,silent){var n=this.n;i=mod(i,n);var base=Math.round(this.target),delta=n>1?wrapOffset(i-base,n):0,changed=i!==this.current;this.target=base+delta;this.current=i;ST.cur=i;this.updateUI();this.kick();this.scheduleAuto();
  if(changed&&!silent&&!RM)this.jelly(i)};
P.jelly=function(i){var p=$('.mlb-portrait',this.actors[i]);if(!p)return;gsap.fromTo(p,{scaleY:.93,scaleX:1.05},{scaleY:1,scaleX:1,duration:1,ease:'elastic.out(1,.35)',transformOrigin:'50% 100%',clearProps:'transform'});
  var t=this.labelTexts[i];if(t)gsap.fromTo(t,{y:14,opacity:0},{y:0,opacity:1,duration:.6,ease:'back.out(2)',clearProps:'transform,opacity'})};
P.move=function(d){if(this.detail)this.close(false);this.select(this.current+d)};
P.kick=function(){var self=this;if(RM){this.rotation=this.target;this.layout();if(this.detail)this.applyDetail();return}
  if(this.raf)return;this.lastT=performance.now();this.raf=requestAnimationFrame(function tick(now){var dt=Math.min(50,now-self.lastT);self.lastT=now;var diff=self.target-self.rotation;
    if(Math.abs(diff)<.0008){self.rotation=self.target;self.raf=0;self.layout();if(self.detail)self.applyDetail();return}
    self.rotation+=diff*(1-Math.exp(-dt/110));self.layout();if(self.detail)self.applyDetail();self.raf=requestAnimationFrame(tick)})};
P.updateUI=function(){var i=this.current,pad=function(v){return (v<10?'0':'')+v};if(this.labelNum)this.labelNum.textContent=pad(i+1)+' / '+pad(this.n);
  this.labelTexts.forEach(function(el,k){el.hidden=k!==i});this.tabs.forEach(function(t,k){t.setAttribute('aria-pressed',k===i?'true':'false')});this.actors.forEach(function(a,k){a.classList.toggle('is-current',k===i)})};
P.isPlaying=function(){return this.autoplay&&!this.userPaused&&!RM&&this.n>1};
P.updatePlay=function(){if(!this.playBtn)return;var pl=this.isPlaying();this.playBtn.setAttribute('aria-pressed',pl?'false':'true');this.playBtn.setAttribute('aria-label',pl?'暫停自動播放':'開始自動播放');var sp=this.playBtn.firstElementChild;if(sp)sp.textContent=pl?'Ⅱ':'▶';this.playBtn.disabled=RM||!this.autoplay};
P.scheduleAuto=function(){var self=this;clearTimeout(this.timer);this.timer=0;if(!this.isPlaying())return;this.timer=setTimeout(function(){self.timer=0;if(self.detail||self.drag||document.hidden||!self.visible||!document.body.contains(self.root)){if(document.body.contains(self.root))self.scheduleAuto();return}self.select(self.current+1)},this.interval)};
P.open=function(i,source,quiet){if(this.detail&&this.current===i)return;var self=this;this.select(i,true);this.detail=true;ST.open=true;document.body.classList.add('lb-sheet');this.trigger=source||null;clearTimeout(this.timer);
  this.root.classList.add('is-detail');this.sheet.classList.remove('is-tall');
  this.actors.forEach(function(a,k){var on=k===i;a.classList.toggle('is-open',on);inert(a,!on);var p=$('.mlb-portrait',a);if(p)p.setAttribute('aria-expanded',on?'true':'false')});
  inert(this.label,true);inert(this.bar,true);this.panels.forEach(function(p,k){p.hidden=k!==i});this.allbars.forEach(function(p,k){p.hidden=k!==i});this.clearActive();this.body.scrollTop=0;this.totals();
  inert(this.sheet,false);this.sheet.classList.add('is-open');this.applyDetail();
  if(!RM&&!quiet){gsap.from($$('.mlb-panel:not([hidden]) .mlb-item',this.sheet),{x:50,opacity:0,duration:.6,stagger:.09,delay:.25,ease:'back.out(1.8)',clearProps:'transform,opacity'})}
  if(this.compact){var r=this.root.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight)this.root.scrollIntoView({behavior:RM?'auto':'smooth',block:'nearest'})}
  this.onDocKey=this.onDocKey||function(e){self.docKey(e)};document.addEventListener('keydown',this.onDocKey,true);
  if(!quiet)requestAnimationFrame(function(){self.closeBtn.focus({preventScroll:true})})};
P.close=function(restore){if(!this.detail)return;this.detail=false;ST.open=false;document.body.classList.remove('lb-sheet');this.root.classList.remove('is-detail');this.sheet.classList.remove('is-open','is-tall');inert(this.sheet,true);
  this.actors.forEach(function(a){a.classList.remove('is-open');inert(a,false);var p=$('.mlb-portrait',a);if(p)p.setAttribute('aria-expanded','false')});
  inert(this.label,false);inert(this.bar,false);this.clearActive();this.applyDetail();document.removeEventListener('keydown',this.onDocKey,true);
  if(restore!==false){var t=this.trigger||$('.mlb-discover',this.root);if(t&&t.focus)t.focus({preventScroll:true})}this.trigger=null;this.scheduleAuto()};
P.docKey=function(e){if(!this.detail)return;if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.close(true)}};
P.clearActive=function(){$$('.is-active',this.root).forEach(function(el){el.classList.remove('is-active')})};
P.highlight=function(j,scroll){var panel=this.panels[this.current],actor=this.actors[this.current];if(!panel||!actor)return;this.clearActive();
  var item=$('.mlb-item[data-item="'+j+'"]',panel),pin=$('.mlb-pin[data-item="'+j+'"]',actor);if(item)item.classList.add('is-active');if(pin)pin.classList.add('is-active');
  if(item&&scroll){var r=item.getBoundingClientRect(),b=this.body.getBoundingClientRect();if(r.top<b.top+4||r.bottom>b.bottom-4){var delta=r.top-b.top-Math.max(12,(b.height-r.height)/2);this.body.scrollBy({top:delta,behavior:RM?'auto':'smooth'})}
    if(!RM)gsap.fromTo(item,{scale:.97},{scale:1,duration:.7,ease:'elastic.out(1,.4)',clearProps:'transform'})}};
/* 整套金額：依每件目前選的款式（缺貨／沒連商品的不算） */
P.totals=function(){this.allbars.forEach(function(bar){var look=LB.look(bar.getAttribute('data-look'));if(!look)return;var sum=0,n=0;
  look.items.forEach(function(it){var r=LB.res(it);if(!r.linked||r.soldout)return;var vk=LB.pickVk(r,ST.vk[it.id]);if(r.vks.length&&!vk)return;sum+=r.vks.length?TX.vprice(r.p,vk):r.price;n++});
  var b=$('[data-total]',bar),btn=$('.mlb-all__btn',bar);if(b)b.textContent=n?n+' 件・'+TX.money(sum):'';if(btn)btn.disabled=!n})};
P.bind=function(){var self=this,root=this.root;
  this.actors.forEach(function(actor,i){var portrait=$('.mlb-portrait',actor);portrait.addEventListener('click',function(e){e.stopPropagation();if(self.dragged)return;self.open(i,portrait)});
    $$('.mlb-pin',actor).forEach(function(pin){pin.addEventListener('click',function(e){e.stopPropagation();self.highlight(parseInt(pin.getAttribute('data-item'),10),true)})})});
  this.panels.forEach(function(panel){$$('.mlb-item',panel).forEach(function(item){item.addEventListener('click',function(e){if(e.target.closest('button,select,a'))return;self.highlight(parseInt(item.getAttribute('data-item'),10),false)})})});
  var dis=$('.mlb-discover',root);if(dis)dis.addEventListener('click',function(e){e.stopPropagation();self.open(self.current,dis)});
  var pv=$('.mlb-prev',root),nx=$('.mlb-next',root);if(pv)pv.addEventListener('click',function(){self.move(-1)});if(nx)nx.addEventListener('click',function(){self.move(1)});
  this.tabs.forEach(function(t,k){t.addEventListener('click',function(){if(self.detail)self.close(false);self.select(k)})});
  if(this.playBtn)this.playBtn.addEventListener('click',function(){self.userPaused=self.isPlaying();self.updatePlay();self.scheduleAuto()});
  this.closeBtn.addEventListener('click',function(){self.close(true)});var back=$('.mlb-back',root);if(back)back.addEventListener('click',function(){self.close(true)});
  root.addEventListener('click',function(e){if(!self.detail)return;var t=e.target;if(t.closest('.mlb-sheet')||t.closest('.mlb-actor.is-open')||t.closest('.mlb-pin'))return;self.close(true)});
  root.addEventListener('keydown',function(e){if(self.detail||self.n<2)return;if(e.target.closest('input,textarea,select'))return;if(e.key==='ArrowLeft'){e.preventDefault();self.move(-1)}else if(e.key==='ArrowRight'){e.preventDefault();self.move(1)}});
  this.bindDrag();this.bindGrip()};
P.bindDrag=function(){var self=this,stage=this.stage;
  stage.addEventListener('pointerdown',function(e){if(self.detail||self.n<2||(e.pointerType==='mouse'&&e.button!==0))return;self.drag={id:e.pointerId,x:e.clientX,y:e.clientY,startRot:self.rotation,active:false,lastRot:self.rotation,lastT:e.timeStamp,vel:0};self.dragged=false});
  stage.addEventListener('pointermove',function(e){var d=self.drag;if(!d||e.pointerId!==d.id)return;var dx=e.clientX-d.x,dy=e.clientY-d.y;
    if(!d.active){if(e.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10){self.drag=null;return}
      if(Math.abs(dx)>9){d.active=true;self.dragged=true;self.root.classList.add('is-dragging');clearTimeout(self.timer);try{stage.setPointerCapture(e.pointerId)}catch(err){}}else return}
    var unit=Math.max(120,stage.clientWidth*.28),rot=d.startRot-dx/unit,dt=e.timeStamp-d.lastT;if(dt>0)d.vel=(rot-d.lastRot)/dt;d.lastRot=rot;d.lastT=e.timeStamp;self.rotation=rot;self.target=rot;self.layout()});
  var finish=function(e){var d=self.drag;if(!d||(e&&e.pointerId!==d.id))return;self.drag=null;self.root.classList.remove('is-dragging');
    if(d.active){var maxStep=self.n<5?1:2,proj=self.rotation+Math.max(-maxStep,Math.min(maxStep,d.vel*180));self.target=self.rotation;self.select(Math.round(proj));setTimeout(function(){self.dragged=false},80)}};
  stage.addEventListener('pointerup',finish);stage.addEventListener('pointercancel',finish);stage.addEventListener('lostpointercapture',finish)};
/* 手機底部面板：握把往下滑＝關閉，往上滑＝拉高；在面板內左右滑＝換上一套／下一套 */
P.bindGrip=function(){var self=this,g=this.grip,sh=this.sheet,top=$('.mlb-sheet__top',this.root);if(!g)return;var st=null;
  var down=function(e){if(!self.compact)return;st={y:e.clientY,x:e.clientX,id:e.pointerId};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(err){}};
  var up=function(e){if(!st||!self.compact){st=null;return}var dy=e.clientY-st.y;st=null;if(dy>60){if(sh.classList.contains('is-tall')){sh.classList.remove('is-tall');self.applyDetail()}else self.close(true)}else if(dy<-40){sh.classList.add('is-tall');self.applyDetail()}else if(Math.abs(dy)<6){sh.classList.toggle('is-tall');self.applyDetail()}};
  [g,top].forEach(function(el){el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',function(){st=null})});
  var sx=null;this.body.addEventListener('touchstart',function(e){sx={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
  this.body.addEventListener('touchend',function(e){if(!sx||!self.compact)return;var t=e.changedTouches[0],dx=t.clientX-sx.x,dy=t.clientY-sx.y;sx=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.8&&!e.target.closest('select')){var d=dx<0?1:-1,i=mod(self.current+d,self.n);self.close(false);self.select(i,true);self.open(i,null,true)}},{passive:true})};
/* 啟動：把畫面上的輪盤接起來，並還原上次的位置（後台改了資料、商店頁面重畫時不會跳回第一套） */
SH.lookbookMount=function(root,first){var el=$('#lbr',root);if(!el)return null;var rw=new Runway(el);el.__mlb=rw;SH.ui.lbRunway=rw;
  var n=rw.n,cur=Math.min(ST.cur||0,n-1);
  if(cur>0){rw.current=cur;rw.target=rw.rotation=cur;rw.layout();rw.updateUI()}
  if(ST.open&&rw.n){el.classList.add('no-anim');rw.open(cur,null,true);requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.remove('no-anim')})})}
  if(!RM&&first){var pl=$$('.mlb-portrait',el);gsap.set(pl,{opacity:0});
    var go=function(){gsap.fromTo(pl,{y:-360,opacity:0},{y:0,opacity:1,duration:1.2,ease:'bounce.out',stagger:.1,clearProps:'transform,opacity'});gsap.from($$('.mlb-label,.mlb-bar',el),{y:40,opacity:0,duration:.8,delay:.4,ease:'back.out(1.8)',clearProps:'transform,opacity'});gsap.from($('.ghost',el),{x:-120,opacity:0,duration:1.4,ease:'power3.out'})};
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();go()}},{threshold:.2});io.observe(el);setTimeout(function(){io.disconnect();gsap.set(pl,{opacity:1})},6500)}else go()}
  return rw};
/* ---------- 加入購物車 ---------- */
function rwOf(){return SH.ui.lbRunway}
SH.act.lbvk=function(t){ST.vk[t.dataset.iid]=t.value;var look=null,it=null;LB.get().looks.forEach(function(l){l.items.forEach(function(x){if(x.id===t.dataset.iid){look=l;it=x}})});if(!it)return;
  var r=LB.res(it),row=t.closest('.mlb-item'),pe=$('[data-price]',row);if(pe&&r.linked){var vk=t.value,pr=TX.vprice(r.p,vk),or=TX.vorig(r.p,vk);pe.innerHTML=(or>pr?'<s>'+TX.money(or)+'</s>':'')+'<b>'+TX.money(pr)+'</b>'}
  var rw=rwOf();if(rw)rw.totals()};
SH.act.lbadd=function(t,e){e.stopPropagation();var look=LB.look(t.dataset.look),it=look&&look.items.filter(function(x){return x.id===t.dataset.iid})[0];if(!it)return;var r=LB.res(it);if(!r.linked)return;
  var vk=LB.pickVk(r,ST.vk[it.id]);if(r.vks.length&&!vk){U.toast('這個尺寸缺貨了');return}
  var im=t.closest('.mlb-item').querySelector('.mlb-item__img');var res=SH.addToCart(r.p.id,vk,1,im);if(res&&res.ok){t.textContent='已加入 ✓';t.classList.add('done');setTimeout(function(){t.textContent='加入購物車';t.classList.remove('done')},1800)}};
SH.act.lball=function(t,e){e.stopPropagation();var look=LB.look(t.dataset.look);if(!look)return;var pn=t.closest('.mlb-all'),choose={};look.items.forEach(function(it){if(ST.vk[it.id])choose[it.id]=ST.vk[it.id]});
  var res=LB.addLook(look,choose);if(!res.added.length){U.toast('這套現在沒辦法加入',res.skipped.map(function(s){return s[0]+'：'+s[1]}).join('、')||'沒有可加入的單品');return}
  if(!RM){$$('.mlb-panel:not([hidden]) .mlb-item__img').forEach(function(im,i){setTimeout(function(){SH.fly(im.querySelector('img')?im.querySelector('img').src:'',im.getBoundingClientRect())},i*140)})}else SH.badge();
  SH.badge();setTimeout(function(){SH.bump()},RM?0:700);
  U.toast('整套 '+res.added.length+' 件已加進購物車',(res.skipped.length?'略過：'+res.skipped.map(function(s){return s[0]+'（'+s[1]+'）'}).join('、'):look.title)+(res.notes.length?'・'+res.notes[0]:''));
  SH.say('整套帶走！');if(!RM&&C.burst){var r=t.getBoundingClientRect();C.burst(r.left+r.width/2,r.top+r.height/2,36)}
  t.querySelector('.t').textContent='整套已加入 ✓';setTimeout(function(){var q=t.querySelector('.t');if(q)q.textContent='整套加入購物車'},2200);var vc=$('.mlb-viewcart',pn);if(vc)vc.classList.add('show')};
SH.act.lbimport=function(t){var r=LB.importDemo();if(!r.ok){U.toast(r.msg);return}U.toast('已匯入 '+r.looks+' 套穿搭、'+r.items+' 件單品','新增了 '+r.prods+' 個北風衣櫥商品');if(!RM&&C.burst){var b=t.getBoundingClientRect();C.burst(b.left+b.width/2,b.top+b.height/2,60)}ST.cur=0;ST.open=false;SH.refresh()};
/* ---------- 專屬頁面 #/lookbook ---------- */
var PLUG_URL='app.html#/settings/plugins?shop=fashion&hint=1';
SH.route('lookbook',/^\/lookbook$/,function(m,H,o){var lb=LB.get();
  /* 外掛還沒開：從示範連結（demo=1）進來就帶去後台外掛頁；自己點進來則說明外掛沒開 */
  if(!LB.on()){
    if(H.q.get('demo')==='1'){history.replaceState(null,'','#/lookbook');setTimeout(function(){if(C.go)C.go(PLUG_URL);else location.href=PLUG_URL},350);
      return {html:'<div class="pg lb-page">'+SH.empty('正在帶你去後台打開外掛…','模特兒穿搭輪盤是店長在後台「外掛」頁打開的功能，打開之後商店頁面才會出現。','<a class="btn" data-go="'+PLUG_URL+'" data-cur="後台">直接前往</a>')+'</div>'}}
    return {html:'<div class="pg lb-page"><div class="lb-off rvl">'+SH.ham('tiaotiao','','mascot')+'<span class="lb-kick">LOOKBOOK <i>棠序自製外掛</i></span><h1 class="sec-t">模特兒穿搭輪盤外掛還沒開啟</h1><p>這是棠序問策自製的外掛。店長到後台「設定 → 外掛」打開開關，這裡就會出現可以拖曳旋轉的模特兒穿搭輪盤，顧客點模特兒就能看到整套單品、一鍵加入購物車。</p><div class="go"><a class="btn pk lg" data-go="'+PLUG_URL+'" data-cur="後台">去後台打開外掛</a><a class="btn w lg" data-go="shop.html#/">回商店首頁</a></div></div></div>',admin:'app.html#/settings/plugins',edit:'app.html#/settings/plugins',editLabel:'去後台打開外掛'}}
  if(H.q.get('demo')==='1')history.replaceState(null,'','#/lookbook');
  var looks=LB.visible(),d=SH.D();
  var cta='<section class="lb-cta rvl">'+SH.ham('tiaotiao','','mascot')+'<div><span class="lb-kick">棠序自製功能</span><h2>這個穿搭輪盤，是棠序問策自己做的外掛</h2><p>做在 WordPress／WooCommerce 上，店長在後台點一點照片、標好商品，顧客就能在商店頁面一鍵整套加入購物車。這個示範站是靜態的假資料，但操作手感跟正式版一樣。</p><div class="go"><a class="btn" data-go="app.html#/shop/lookbook" data-cur="後台">到後台改這個輪盤</a><a class="btn pk" data-line="lookbook-cta">'+SH.LINE+'我也想要・LINE 問棠序</a></div></div></section>';
  if(!looks.length){return {html:'<div class="pg lb-page">'+SH.lookbookHead(true)+SH.empty('穿搭輪盤還沒有內容','外掛已經開啟，店長到後台「模特兒穿搭輪盤」新增一套穿搭（選模特兒照片、點照片標熱點、連到商品），這裡就會出現。',(T_isFashion()?'':'<button class="btn" type="button" data-shop="fashion">先換到北風衣櫥</button> ')+'<a class="btn w" data-go="app.html#/shop/lookbook">去後台新增穿搭</a>')+cta+'</div>',admin:'app.html#/shop/lookbook'}}
  return {html:'<div class="pg lb-page">'+SH.crumbs([['穿搭輪盤']])+SH.lookbookHead(true)+SH.lookbookHtml({page:true})+cta+'</div>',admin:'app.html#/shop/lookbook',edit:'app.html#/shop/lookbook',editLabel:'去後台改這個輪盤',mount:function(root){SH.lookbookMount(root,!(SH.cur&&SH.cur.name==='lookbook'))}}});
function T_isFashion(){return TX.isApparel()}
})();
