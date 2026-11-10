/* ==========================================================================
   shop-atelier.js ── T03 質感精品「深裁」的商店頁面：精品型錄式首頁與商品頁。
   只在 ?theme=t03 生效（其他主題直接 return，畫面完全不變）。
   功能（加入購物車、選規格、數量、和後台同一份資料）全部沿用 shop-pages.js，這裡只換版面與動畫手感：
   - 首頁：深色首屏（模特照慢放大＋大字逐行顯影＋金線）、特權細線列、本季選品（一大兩小錯落）、
           篇章式分類、型錄式商品、優惠細線帶、品牌故事。
   - 商品頁：大圖直排＋窄欄文字（桌機黏在右側）、編號、法文分類小標、細線分隔的服務說明。
   - 動畫：淡入上移 36px／1.1 秒 power2.out、圖片由下往上顯影、站內換頁用絲綿幕。不彈跳。
   ========================================================================== */
(function(){
'use strict';
if(!(window.THEME&&THEME.key==='t03'))return;
var C=window.CUTE,TX=window.TX,SH=window.SHOP,$=C.$,$$=C.$$,h=TX.esc,RM=C.RM,D=SH.D;
document.documentElement.classList.add('lxs');
var LOOK=['img/lookbook/look2.webp','img/lookbook/look1.webp','img/lookbook/look4.webp','img/lookbook/look6.webp','img/lookbook/look3.webp','img/lookbook/look5.webp'];
var FR={'外套':'Manteaux','上衣':'Hauts','褲裙':'Pantalons & Jupes','鞋款':'Souliers'};
var ROM=['I','II','III','IV','V','VI','VII','VIII'];
function fr(c){return FR[c]||'Collection'}
function two(n){return (n<10?'0':'')+n}
function no(p){return 'N° '+String(p.id||'').toUpperCase()}
function lines(t){return String(t||'').split(/\s+/).filter(Boolean).map(function(w){return '<span class="ln"><span>'+h(w)+'</span></span>'}).join('')}
var MARK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l5.5 8.5-5.5 8.5-5.5-8.5z"/><path d="M12 3.5v17"/></svg>';
/* 包裝示意：米色紙盒＋麥金細緞帶＋深裁菱形標（程式繪製，取代可愛版的倉鼠圖） */
var BOX='<svg class="lxp-box" viewBox="0 0 200 250" aria-hidden="true"><rect x="0" y="0" width="200" height="250" fill="#DDD2C2"/><g fill="none" stroke-linejoin="round"><path d="M40 108h120v96H40z" fill="#EFE8DD" stroke="#241C14" stroke-opacity=".35"/><path d="M34 92h132v20H34z" fill="#F3EDE3" stroke="#241C14" stroke-opacity=".35"/><path d="M100 92v112" stroke="#C9A36A" stroke-width="2"/><path d="M100 92c-14-18-34-20-34-8s20 8 34 8c14 0 34 4 34-8s-20-10-34 8" stroke="#C9A36A" stroke-width="1.6"/><path d="M100 136l9 13-9 13-9-13z" stroke="#241C14" stroke-width="1.2"/><path d="M100 136v26" stroke="#241C14" stroke-width="1.2"/></g><text class="lxp-boxt" x="100" y="228" text-anchor="middle" font-family="T03 Bodoni,serif" font-style="italic" font-size="13" fill="#6B4F3A">Atelier Profond</text></svg>';

/* ---------- 動畫手感：慢、平順、不彈跳 ---------- */
SH.fx.reveal={from:{opacity:0,y:36},dur:1.1,ease:'power2.out'};
SH.fx.head={opacity:0,y:-12,duration:1.1,ease:'power2.out',delay:.1,clearProps:'transform,opacity'};
SH.fx.drop=function(sel,root){var els=$$(sel,root);if(els.length)gsap.from(els,{opacity:0,y:28,duration:1.2,ease:'power2.out',stagger:.12,clearProps:'transform,opacity'})};
SH.fx.price=function(sel){gsap.fromTo(sel,{opacity:.25,y:6},{opacity:1,y:0,duration:.8,ease:'power2.out'})};
/* 加入購物車：商品小圖沿弧線淡淡飄進購物車，沒有翻轉 */
SH.fx.fly=function(img,from,cb,bump){var r=cb.getBoundingClientRect(),f=document.createElement('img');f.className='fly lxs-fly';f.src=img;f.alt='';document.body.appendChild(f);
  var sx=from.left+from.width/2-45,sy=from.top+from.height/2-45,ex=r.left+r.width/2-45,ey=r.top+r.height/2-45;
  gsap.set(f,{x:sx,y:sy,opacity:0,scale:.9});
  gsap.timeline({onComplete:function(){f.remove();bump()}}).to(f,{opacity:1,duration:.25,ease:'power1.out'}).to(f,{x:ex,y:ey,scale:.16,duration:.95,ease:'power2.inOut'},.1).to(f,{opacity:0,duration:.3},.8)};
SH.fx.bump=function(cb){var g=document.createElement('i');g.className='lxs-ring';cb.appendChild(g);gsap.fromTo(g,{scale:.85,opacity:1},{scale:1.35,opacity:0,duration:1,ease:'power2.out',onComplete:function(){g.remove()}})};
/* 站內換頁：兩扇絲綿幕由兩側合上 → 換內容 → 細線收起、幕向兩側拉開 */
var swapping=false;
SH.fx.swap=function(fn){var roll=$('#roll'),l=roll&&$('.cv.l',roll),r=roll&&$('.cv.r',roll),seam=roll&&$('.seam',roll);
  if(!l||swapping){fn();return}swapping=true;roll.style.visibility='visible';
  gsap.set(l,{xPercent:-100});gsap.set(r,{xPercent:100});gsap.set(seam,{scaleY:0,opacity:1});
  gsap.timeline().to([l,r],{xPercent:0,duration:.55,ease:'power3.in'},0).to(seam,{scaleY:1,duration:.35,ease:'power2.out'},.25)
   .add(function(){fn()}).to(seam,{scaleY:0,opacity:0,duration:.3,ease:'power2.in'},'+=.05')
   .to(l,{xPercent:-100,duration:.95,ease:'power3.inOut'},'-=.1').to(r,{xPercent:100,duration:.95,ease:'power3.inOut'},'<')
   .add(function(){roll.style.visibility='hidden';swapping=false})};

/* ---------- 圖片顯影：進到畫面時由下往上揭開 ---------- */
var clipIO=null;
function clips(root){if(clipIO){clipIO.disconnect();clipIO=null}var els=$$('.lxs-clip',root);
  if(RM||!window.IntersectionObserver){els.forEach(function(e){e.classList.add('in')});return}
  /* 觀察外層（被 clip-path 裁掉的元素本身量不到交集） */
  clipIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var c=e.target.__clip;if(c)c.classList.add('in');clipIO&&clipIO.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:0});
  els.forEach(function(e){var o=e.parentElement||e;o.__clip=e;clipIO.observe(o)});
  setTimeout(function(){els.forEach(function(e){e.classList.add('in')})},7000)}
/* 首屏視差：模特照比文字慢一點捲走 */
var parT=null;
function parallax(){if(RM)return;if(parT)removeEventListener('scroll',parT);var tk=false;
  parT=function(){if(tk)return;tk=true;requestAnimationFrame(function(){tk=false;var hero=$('#hero.lxs-hero');if(!hero)return;var y=Math.min(scrollY,innerHeight);
    $$('.lxs-model',hero).forEach(function(m){m.style.transform='translate3d(0,'+(y*.12)+'px,0)'});var w=$('.lxs-word',hero);if(w)w.style.transform='translate3d('+(-y*.18)+'px,0,0)'})};
  addEventListener('scroll',parT,{passive:true})}

/* ---------- 商品卡（型錄式；沿用 SH.card 的功能與 class，加上編號） ---------- */
var baseCard=SH.card;
SH.card=function(p,hot){return baseCard(p,hot).replace('<div class="bd">','<div class="bd"><span class="lxs-no">'+no(p)+'</span>').replace('<div class="im">','<div class="im lxs-clip">')};

/* ======================= 首頁 ======================= */
function feat(p,i,cls){var r=TX.priceRange(p);return '<a class="lxs-f '+cls+' rvl" href="#/p/'+h(p.id)+'" data-cur="細看" aria-label="'+h(p.name)+'"><span class="lxs-ph lxs-clip"><img src="'+h(TX.pimg(p))+'" alt="'+h(p.name)+'" loading="lazy"></span>'+
  '<span class="lxs-cap"><small>'+two(i+1)+'</small><b>'+h(p.name)+'</b><em>'+h(fr(p.cat))+'</em><span class="lxs-pr">'+SH.priceHtml(p)+'</span></span></a>'}
function home(){var d=D(),ps=TX.shopProducts(),s=d.settings,onSale=ps.filter(function(p){return TX.priceRange(p).sale});
  var sl=d.slides.length?d.slides:[{title:d.name,sub:d.slogan,link:'/products'}];
  var slides=sl.map(function(x,i){return '<div class="lxs-slide'+(i?'':' on')+'" data-i="'+i+'" aria-hidden="'+(i?'true':'false')+'">'+
    '<div class="lxs-model"><img src="'+LOOK[i%LOOK.length]+'" alt="" '+(i?'loading="lazy"':'')+'></div>'+
    '<div class="lxs-copy"><p class="lxs-kick"><span>N° '+two(i+1)+'</span><i></i><span>'+h(d.slogan||d.name)+'</span></p>'+
    '<h1>'+lines(x.title)+'</h1><p class="lxs-sub">'+h(x.sub)+'</p>'+
    '<div class="lxs-go"><a class="lx-btn" href="'+SH.slideLink(x.link)+'" data-cur="選購">立即選購</a><a class="lx-btn ghost" href="#/list?sale=1" data-cur="特價">看特價</a></div></div></div>'}).join('');
  var hero='<section class="lxs-hero" id="hero" aria-roledescription="輪播" aria-label="'+h(d.name)+' 首屏">'+
    '<div class="lxs-word" aria-hidden="true">Profond</div><i class="lxs-gl" aria-hidden="true"></i>'+slides+'<div class="lxs-veil" aria-hidden="true"></div>'+
    '<div class="lxs-ctl"><span class="lxs-idx"><b id="lxsI">01</b> / '+two(sl.length)+'</span><span class="lxs-prog"><i id="lxsP"></i></span>'+
    (sl.length>1?'<button type="button" data-a="hprev" aria-label="上一張">←</button><button type="button" data-a="hnext" aria-label="下一張">→</button>':'')+'</div>'+
    '<p class="lxs-season" aria-hidden="true">Automne — Hiver</p></section>';
  var perks='<section class="lxs-perks rvl" aria-label="購物須知">'+[
    ['滿 '+TX.money(s.freeOver)+' 免運','未滿：宅配 '+TX.money(s.homeFee)+'・超商 '+TX.money(s.cvsFee)],
    ['信用卡不加收手續費','依綠界規範，金額大小都能刷'],
    ['7 天內可申請退換貨','收到商品後，到「訂單查詢」申請'],
    ['有問題，問客服',d.store.email]].map(function(x,i){return '<div><em>'+ROM[i]+'</em><b>'+h(x[0])+'</b><small>'+h(x[1])+'</small></div>'}).join('')+'</section>';
  var hotL=ps.slice().sort(function(a,b){return b.sold30-a.sold30}).filter(function(p){return !TX.soldOut(p)});
  /* 本季選品：每個分類挑賣最好的一件，外套優先當主角（大圖），湊滿三件 */
  var f3=[],seen={};['外套'].concat(d.cats).forEach(function(c){if(seen[c])return;seen[c]=1;var x=hotL.filter(function(p){return p.cat===c})[0];if(x&&f3.length<3)f3.push(x)});
  hotL.forEach(function(p){if(f3.length<3&&f3.indexOf(p)<0)f3.push(p)});
  var sel=f3.length?'<section class="lxs-sel"><header class="lxs-h rvl"><p class="lxs-no2">N° 01 — La Sélection</p><h2 class="sec-t">本季選品</h2><p class="lxs-lead">每一季只挑少數幾件，細看剪裁、布料與收邊。</p></header>'+
    '<div class="lxs-selg">'+feat(f3[0],0,'big')+'<div class="lxs-side">'+f3.slice(1).map(function(p,i){return feat(p,i+1,'sm')}).join('')+
    '<a class="lxs-more rvl" href="#/list" data-cur="全部">看全部選品<i></i></a></div></div></section>':'';
  var lbx=SH.lookbookHtml?SH.lookbookHtml({}):'';var lbsec=lbx?'<section class="lb-sec" id="lookbook">'+SH.lookbookHead(false)+lbx+'</section>':'';
  var cl=d.cats.filter(function(c){return ps.some(function(p){return p.cat===c})});
  var cats=cl.length?'<section class="lxs-chap"><header class="lxs-h rvl"><p class="lxs-no2">N° 02 — Les Chapitres</p><h2 class="sec-t">逛逛分類</h2></header><div class="lxs-chg">'+cl.map(function(c,i){var l=ps.filter(function(p){return p.cat===c}),p=l[0];
      return '<a class="lxs-ch rvl" href="#/list?cat='+encodeURIComponent(c)+'" data-cur="翻閱"><span class="lxs-ph lxs-clip">'+(p?'<img src="'+h(TX.pimg(p))+'" alt="" loading="lazy">':'')+'</span><em>'+ROM[i%8]+'</em><b>'+h(c)+'</b><small>'+h(fr(c))+'・'+l.length+' 件</small></a>'}).join('')+'</div></section>':'';
  var hot=hotL.length>3?'<section><div class="sec-h rvl"><div><p class="lxs-no2">N° 03 — Les Préférées</p><h2 class="sec-t">熱賣商品<small>近 30 天賣最好</small></h2></div><a class="more" href="#/list">看全部</a></div>'+SH.grid(hotL.slice(0,4))+'</section>':'';
  var camps=d.campaigns.filter(function(c){return c.active}),cps=d.coupons.filter(function(c){return c.active&&(!c.end||c.end>=TX.todayStr())});
  var rib=(camps.length||cps.length)?'<section class="lxs-priv rvl"><div class="lxs-privh"><em>Privilèges</em><h3>現在有這些優惠</h3></div><div class="lxs-privl">'+camps.map(function(c){return '<span>'+h(c.name)+'</span>'}).join('')+cps.map(function(c){return '<span>'+(c.type==='percent'?'打 '+(100-c.value)+' 折':'折 '+TX.money(c.value))+'・滿 '+TX.money(c.min)+'<b>'+h(c.code)+'</b></span>'}).join('')+'</div></section>':'';
  var nw=ps.slice(0,4);
  var neu=nw.length?'<section><div class="sec-h rvl"><div><p class="lxs-no2">N° 04 — Nouveautés</p><h2 class="sec-t">新上架<small>後台新增的商品會先出現在這裡</small></h2></div></div>'+SH.grid(nw)+'</section>':'';
  var sale=onSale.slice(0,4);
  var sec3=sale.length?'<section><div class="sec-h rvl"><div><p class="lxs-no2">N° 05 — Dernières pièces</p><h2 class="sec-t">特價中</h2></div><a class="more" href="#/list?sale=1">全部特價</a></div>'+SH.grid(sale)+'</section>':'';
  var ab=d.pages.filter(function(p){return p.slug==='about'&&p.status==='發布'})[0];
  var about='<section class="lxs-maison rvl"><div class="lxs-mph lxs-clip"><img src="'+LOOK[3]+'" alt="" loading="lazy"></div><div class="lxs-mtx"><p class="lxs-no2">N° 06 — La Maison</p><h2>'+h(ab?ab.title:'關於我們')+'</h2><p>'+h(ab?ab.body:d.slogan)+'</p><p class="lxs-q">少一點，但每一件都經得起時間。</p><a class="lx-btn ghost" href="#/page/'+(ab?'about':'contact')+'">多認識我們</a></div></section>';
  return {html:hero+perks+sel+lbsec+cats+hot+rib+neu+sec3+about,admin:'app.html#/shop',mount:function(root){
    if(SH.lookbookMount)SH.lookbookMount(root,!(SH.cur&&SH.cur.name==='home'));
    clips(root);parallax();
    var n=sl.length,i=0,hs=SH.ui.hs=SH.ui.hs||{};clearInterval(hs.t);var DUR=7;
    function prog(){var p=$('#lxsP');if(!p||RM)return;gsap.killTweensOf(p);gsap.fromTo(p,{scaleX:0},{scaleX:1,duration:DUR,ease:'none'})}
    function enter(nw,first){if(RM)return;var t=gsap.timeline();
      t.fromTo($$('.ln>span',nw),{yPercent:105},{yPercent:0,duration:1.25,ease:'power3.out',stagger:.12},first?.35:.15)
       .fromTo($$('.lxs-kick,.lxs-sub,.lxs-go',nw),{opacity:0,y:14},{opacity:1,y:0,duration:1.1,ease:'power2.out',stagger:.1,clearProps:'transform,opacity'},first?.75:.5)
       .fromTo($('.lxs-model img',nw),{opacity:0,xPercent:4},{opacity:1,xPercent:0,duration:1.6,ease:'power2.out'},0);
      if(first){t.fromTo($('.lxs-gl',root),{scaleX:0},{scaleX:1,duration:1.6,ease:'power2.inOut'},.2).fromTo($('.lxs-word',root),{opacity:0},{opacity:1,duration:2.4,ease:'power1.out'},.2).fromTo($$('.lxs-ctl,.lxs-season',root),{opacity:0},{opacity:1,duration:1.2},1)}}
    hs.go=function(k){var el=$('#hero');if(!el)return;k=(k+n)%n;if(k===i)return;var old=$('.lxs-slide.on',el),nw=$('.lxs-slide[data-i="'+k+'"]',el);if(!nw)return;i=k;
      if(!RM)gsap.to($$('.lxs-copy,.lxs-model',old),{opacity:0,duration:.6,ease:'power1.in',clearProps:'opacity'});
      setTimeout(function(){old.classList.remove('on');old.setAttribute('aria-hidden','true');nw.classList.add('on');nw.setAttribute('aria-hidden','false');enter(nw,false)},RM?0:520);
      var ix=$('#lxsI');if(ix)ix.textContent=two(k+1);prog();restart()};
    hs.next=function(){hs.go(i+1)};hs.prev=function(){hs.go(i-1)};
    function restart(){clearInterval(hs.t);if(n>1&&!RM)hs.t=setInterval(function(){if(document.hidden)return;if(!$('#hero.lxs-hero'))return clearInterval(hs.t);hs.next()},DUR*1000)}
    enter($('.lxs-slide.on',root),true);prog();restart()}}}

/* ======================= 商品頁 ======================= */
SH.skin={};
/* 棚拍照組：img/atelier/aXX.webp → 正面、細節(-2)、另一面(-3)、包裝；不是這組圖就回傳 null，沿用舊的裁切小圖。
   cc 是非主色的代碼（data/atelier.js 的 cshots，例如 黑 → k），有的話換成 aXX-k.webp、aXX-k-2.webp、aXX-k-3.webp */
function shots(u,cc){var m=/^(.*img\/atelier\/a\d+)\.webp(\?.*)?$/.exec(u||'');if(!m)return null;var q=m[2]||'',b=m[1]+(cc?'-'+cc:'');return [b+'.webp'+q,b+'-2.webp'+q,b+'-3.webp'+q,m[1].replace(/a\d+$/,'pack')+'.webp'+q]}
function cmap(p){var A=(window.TX_DATA||{}).atelier;return (A&&A.cshots&&p&&A.cshots[p.id])||null}
/* 目前選的顏色（第一組規格名稱有「色」才算顏色） */
function colOf(g,st){var g0=g&&g[0];return g0&&/色/.test(g0.name||'')?st.a:''}
/* 進商品頁先把其他顏色的照片載好，換色時不會閃白 */
var PRE={};function preload(p,img){var m=cmap(p);if(!m||PRE[p.id])return;PRE[p.id]=1;Object.keys(m).forEach(function(k){(shots(img,m[k])||[]).slice(0,3).forEach(function(u){var i=new Image();i.src=u})})}
var LASTC={pid:'',c:''};
SH.skin.shots=shots;
SH.skin.pdpInner=function(c){var p=c.p,st=c.st,img=c.img,s=c.s,col=colOf(c.g,st),m=cmap(p),cc=m&&col?m[col]||'':'',set=shots(img,cc);
  /* 換顏色：主圖與小圖換成該色照片，並沉穩淡入（同一商品、顏色變了才淡入） */
  var fade=LASTC.pid===p.id&&LASTC.c!==col;LASTC={pid:p.id,c:col};if(set)preload(p,img);
  if(set){var lab=['正面','細節','另一面','包裝'];
    var main='<div class="main lxp-main lxp-studio'+(fade?' lx-cfade':'')+'" data-col="'+h(col)+'"><img src="'+h(set[st.img]||set[0])+'" alt="'+h(p.name+(col?'（'+col+'）':''))+'"></div>';
    var th='<div class="th lxp-th lxp-studio'+(fade?' lx-cfade':'')+'" role="group" aria-label="商品圖片">'+set.map(function(u,i){return '<button type="button" class="'+(st.img===i?'on':'')+'" data-a="pimg" data-i="'+i+'" aria-label="'+lab[i]+'"><img src="'+h(u)+'" alt="" loading="lazy"><small>'+(i===3?'包裝':two(i+1))+'</small></button>'}).join('')+'</div>'}
  else{var crop=[['1','50% 50%'],['1.8','12% 14%'],['1.8','88% 86%']][st.img]||null;
  var main=st.img===3?'<div class="main lxp-main">'+BOX+'</div>':'<div class="main lxp-main"><img src="'+h(img)+'" alt="'+h(p.name)+'" style="'+(crop?'transform:scale('+crop[0]+');transform-origin:'+crop[1]:'')+'"></div>';
  var th='<div class="th lxp-th" role="group" aria-label="商品圖片">'+[0,1,2,3].map(function(i){var q=[['1','50% 50%'],['1.8','12% 14%'],['1.8','88% 86%']][i];return '<button type="button" class="'+(st.img===i?'on':'')+'" data-a="pimg" data-i="'+i+'" aria-label="第 '+(i+1)+' 張圖">'+(i===3?BOX:'<img src="'+h(img)+'" alt="" style="transform:scale('+q[0]+');transform-origin:'+q[1]+'">')+'<small>'+(i===3?'包裝示意':two(i+1))+'</small></button>'}).join('')+'</div>'}
  var rt=c.rt.n?'<span class="stars">'+SH.stars(c.rt.avg)+' '+c.rt.avg.toFixed(1)+'（'+c.rt.n+' 則評價）</span>':'<span class="stars">還沒有評價</span>';
  var off=c.pr<c.or?'<span class="off">省 '+Math.round((1-c.pr/c.or)*100)+'%</span>':'';
  var buy='<div class="buy desk lxp-buy"><div class="qty" role="group" aria-label="數量"><button type="button" data-a="qm" aria-label="減少"'+(st.qty<=1?' disabled':'')+'>−</button><input type="number" min="1" max="'+c.max+'" value="'+st.qty+'" data-a="qin" aria-label="數量"><button type="button" data-a="qp" aria-label="增加"'+(st.qty>=c.max?' disabled':'')+'>＋</button></div><button class="btn lg" type="button" data-a="padd"'+c.dis+'>加入購物車</button><button class="btn w lg" type="button" data-a="pnow"'+c.dis+'>直接結帳</button></div>';
  var info='<div class="info lxp-info" id="pinfo"><p class="lxp-no"><span>'+no(p)+'</span><i></i><span>'+h(fr(p.cat))+'</span></p><span class="cat-l">'+h(p.cat||'商品')+'</span><h1>'+h(p.name)+'</h1>'+
    '<div class="big" id="pbig"><span class="price'+(c.pr<c.or?' sale':'')+'">'+TX.money(c.pr)+'</span>'+(c.pr<c.or?'<span class="orig">'+TX.money(c.or)+'</span>':'')+off+'</div><div class="lxp-rt">'+rt+'</div>'+
    (p.preorder?'<p class="stockline"><i></i>預購商品'+(p.shipDate?'，預計 '+h(p.shipDate)+' 出貨':'')+'</p>':'')+'<p class="desc">'+h(p.desc||'')+'</p>'+c.opts+c.stl+buy+
    '<ul class="lxp-svc"><li><em>I</em>滿 '+TX.money(s.freeOver)+' 免運；未滿宅配 '+TX.money(s.homeFee)+'、超商 '+TX.money(s.cvsFee)+'</li><li><em>II</em>信用卡付款不加收手續費</li><li><em>III</em>收到商品 7 天內可申請退換貨</li></ul></div>';
  var bar='<div class="buybar"><div class="pp">'+TX.money(c.pr)+'<small>'+(c.hasV?h(TX.vlabel(c.vk)):'')+'</small></div><button class="btn w" type="button" data-a="padd"'+c.dis+'>加入購物車</button><button class="btn pk" type="button" data-a="pnow"'+c.dis+'>直接結帳</button></div>';
  return '<div class="pdp lxp"><div class="gal lxp-gal">'+main+th+(p.ai?'<small class="aicap">商品圖：AI 輔助生成</small>':'')+(set?'':'<small>示範：縮圖是同一張圖的不同裁切。</small>')+'</div>'+info+'</div>'+bar};
SH.skin.pdpPage=function(c){var p=c.p,id=c.id,rt=c.rt,s=c.s;
  var html=SH.crumbs([[p.cat||'全部商品','#/list'+(p.cat?'?cat='+encodeURIComponent(p.cat):'')],[p.name]])+'<div id="pdpmain">'+c.inner+'</div>'+
   '<section class="lxp-detail rvl"><div class="lxp-dph lxs-clip'+(shots(TX.pimg(p))?' lxp-studio':'')+'"><img src="'+h(shots(TX.pimg(p))?shots(TX.pimg(p))[1]:TX.pimg(p))+'" alt="" loading="lazy"></div><div class="lxp-dtx"><p class="lxs-no2">N° 01 — Le Détail</p><h2 class="sec-t">商品介紹</h2><p>'+h(p.desc||'店家還沒有填寫介紹。')+'</p><dl><dt>分類</dt><dd>'+h(p.cat||'—')+'</dd><dt>編號</dt><dd>'+no(p)+'</dd></dl></div></section>'+
   '<section class="lxp-rev rvl"><p class="lxs-no2">N° 02 — Avis</p><h2 class="sec-t">顧客評價'+(rt.n?'（'+rt.n+'）':'')+'</h2>'+(rt.n?rt.list.map(function(r){return '<div class="rv"><div class="t"><span class="stars">'+SH.stars(r.stars)+'</span>'+h(r.who)+'<small>'+TX.ago(r.t)+'</small></div><p>'+h(r.text)+'</p>'+(r.reply?'<div class="rp"><b>店家回覆：</b>'+h(r.reply)+'</div>':'')+'</div>'}).join(''):'<p class="lxp-none">還沒有人留下評價。</p>')+'</section>'+
   '<section class="lxp-ship rvl"><p class="lxs-no2">N° 03 — Service</p><h2 class="sec-t">運送與付款</h2><div class="lxp-3"><div><em>I</em><b>物流</b><p>'+(c.lg.join('、')||'店家還沒開啟任何物流')+'。</p></div><div><em>II</em><b>付款</b><p>'+(c.pays.join('、')||'店家還沒開啟任何付款方式')+'。</p></div><div><em>III</em><b>出貨與退換</b><p>滿 '+TX.money(s.freeOver)+' 免運；下單後 1–2 個工作天出貨；收到商品 7 天內可申請退換貨。</p></div></div></section>'+
   (c.rel.length?'<section><div class="sec-h rvl"><div><p class="lxs-no2">N° 04 — À voir aussi</p><h2 class="sec-t">你可能也喜歡</h2></div></div>'+SH.grid(c.rel)+'</section>':'');
  return {html:html,admin:'app.html#/products',edit:'app.html#/product/'+id,mount:function(root){clips(root);if(!RM){var g=$('.lxp-main',root);if(g)gsap.fromTo(g,{clipPath:'inset(100% 0 0 0)'},{clipPath:'inset(0% 0 0 0)',duration:1.4,ease:'power3.out',clearProps:'clipPath'});gsap.from($$('.lxp-info>*',root),{opacity:0,y:22,duration:1.1,ease:'power2.out',stagger:.06,delay:.25,clearProps:'transform,opacity'})}}}};

/* 換掉首頁路由；每一頁 mount 後都跑圖片顯影（其他頁面沿用原本的功能，只靠 CSS 換外觀） */
SH.routes.forEach(function(r){if(r.name==='home')r.fn=home;
  var fn=r.fn;r.fn=function(m,H,o){var res=fn(m,H,o)||{};if(typeof res==='string')res={html:res};var mt=res.mount;res.mount=function(root,a,b){var x=mt?mt(root,a,b):null;clips(root);return x};return res}});
})();
