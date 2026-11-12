/* 商店頁面（顧客看到的）核心：路由、頁首頁尾、動畫、和後台共用同一份資料（TX）。
   頁面內容在 shop-pages.js。後台改了什麼，這裡下一次畫面更新就跟著變；這裡下單，後台訂單馬上多一筆。 */
(function(){
'use strict';
var C=window.CUTE,TX=window.TX,U=window.TXUI,$=C.$,$$=C.$$,h=TX.esc,RM=C.RM;
var S=window.SHOP={routes:[],st:{code:'',form:null},ui:{}};
var CANDY=['#FFDDE6','#D9EEFF','#FFEFC0','#D3F5E7','#E7DCFF','#FFE3D3'];
S.CANDY=CANDY;
var LINE='<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.6 1.1-.5 5.8-3.4 7.9-5.8C21.4 13.6 22 12.4 22 11c0-4.4-4.5-8-10-8z"/></svg>';
var IC={search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',user:'<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4-6 8-6s7 1.5 8 6"/></svg>',bag:'<svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',menu:'<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>'};
S.IC=IC;S.LINE=LINE;
function D(){return TX.D()}
S.D=D;
/* ---------- 小工具 ---------- */
S.hash=function(){var s=(location.hash||'').replace(/^#/,'')||'/';var i=s.indexOf('?');return {path:i<0?s:s.slice(0,i),q:new URLSearchParams(i<0?'':s.slice(i+1)),raw:s}};
S.href=function(path,params){var p=new URLSearchParams();Object.keys(params||{}).forEach(function(k){if(params[k]!==''&&params[k]!=null)p.set(k,params[k])});var s=p.toString();return '#'+path+(s?'?'+s:'')};
S.ham=function(k,style,cls){return '<div'+(cls?' class="'+cls+'"':'')+' data-ham="'+k+'" style="'+(style||'')+'"></div>'};
S.stars=function(n){n=Math.round(n);return '<em aria-hidden="true">'+'★★★★★'.slice(0,n)+'<span style="opacity:.28">'+'★★★★★'.slice(n)+'</span></em>'};
S.money=TX.money;
S.rating=function(pid){var rs=D().reviews.filter(function(r){return r.pid===pid&&!r.hidden});return {n:rs.length,avg:rs.length?rs.reduce(function(a,r){return a+r.stars},0)/rs.length:0,list:rs}};
S.hotSet=function(){var l=TX.shopProducts().slice().sort(function(a,b){return b.sold30-a.sold30}).slice(0,3),o={};l.forEach(function(p){o[p.id]=1});return o};
S.priceHtml=function(p,vk){var r;if(vk!=null&&TX.vOf(p,vk)){var pr=TX.vprice(p,vk),or=TX.vorig(p,vk);return '<span class="price'+(pr<or?' sale':'')+'">'+TX.money(pr)+'</span>'+(pr<or?'<span class="orig">'+TX.money(or)+'</span>':'')}
  r=TX.priceRange(p);var t=r.lo===r.hi?TX.money(r.lo):TX.money(r.lo)+' 起';return '<span class="price'+(r.sale?' sale':'')+'">'+t+'</span>'+(r.sale&&r.lo===r.hi?'<span class="orig">'+TX.money(r.orig)+'</span>':'')};
S.card=function(p,hot){var out=TX.soldOut(p),low=!out&&TX.isLow(p),hasV=TX.liveKeys(p).length>0,r=TX.priceRange(p),n=TX.stockOf(p);
  return '<a class="pc rvl" href="#/p/'+h(p.id)+'" data-cur="看看" aria-label="'+h(p.name)+'"><div class="im"><img src="'+h(TX.pimg(p))+'" alt="'+h(p.name)+'" loading="lazy" width="400" height="400"><div class="tg">'+(r.sale?'<i>特價</i>':'')+(hot?'<i class="hot">熱賣</i>':'')+(low?'<i class="low">只剩 '+n+' 件</i>':'')+'</div>'+(out?'<div class="so"><span>已售完</span></div>':'')+'</div><div class="bd"><span class="ct">'+h(p.cat||'')+'</span><span class="nm">'+h(p.name)+'</span><div class="pr">'+S.priceHtml(p)+'</div></div>'+
  (out?'<button class="add" type="button" disabled aria-label="已售完">×</button>':(hasV?'<span class="add" role="img" aria-label="選規格">＋</span>':'<button class="add" type="button" data-a="qadd" data-id="'+h(p.id)+'" aria-label="加入購物車">＋</button>'))+'</a>'};
S.grid=function(list,cols){var hot=S.hotSet();return '<div class="pgrid">'+list.map(function(p){return S.card(p,hot[p.id])}).join('')+'</div>'};
S.empty=function(title,body,btn){return '<div class="empty">'+S.ham('xiaosha','width:140px;margin:0 auto 4px')+'<b>'+h(title)+'</b>'+h(body||'')+(btn||'')+'</div>'};
S.crumbs=function(arr){return '<nav class="crumbs" aria-label="路徑"><a href="#/">首頁</a>'+arr.map(function(a){return '<i>›</i>'+(a[1]?'<a href="'+a[1]+'">'+h(a[0])+'</a>':'<span>'+h(a[0])+'</span>')}).join('')+'</nav>'};
S.route=function(name,re,fn){S.routes.push({name:name,re:re,fn:fn})};
S.admin=function(h2){var b=$('#backadmin');if(b)b.setAttribute('data-go',h2);var m=$('#mback');if(m)m.setAttribute('data-go',h2)};
S.editLink=function(href,label){var e=$('#editadmin'),m=$('#medit');if(!e)return;if(href){e.hidden=false;e.setAttribute('data-go',href);var sp=e.querySelector('span');if(sp)sp.textContent=label||'去後台改這個商品';if(m){m.hidden=false;m.setAttribute('data-go',href);m.textContent=label||'去後台改這個商品'}}else{e.hidden=true;if(m)m.hidden=true}};
S.toast=function(t,s){U.toast(t,s)};
/* 讓右下角的栗栗說話（倉鼠在畫面上才會說） */
S.say=function(text){var el=$('#pethint .pet');var L=C.hams.filter(function(x){return x.el===el})[0];if(L&&L.el.offsetParent)C.jump(L,text)};
/* 選單文字 → 連結（後台「網站選單」怎麼改，這裡就怎麼變） */
S.menuLink=function(label){var d=D();if(label==='首頁')return '#/';if(label==='全部商品')return '#/list';
  if(d.cats.indexOf(label)>-1)return '#/list?cat='+encodeURIComponent(label);
  var pg=d.pages.filter(function(p){return p.status==='發布'&&p.title===label})[0];if(pg)return '#/page/'+pg.slug;
  if(/穿搭|輪盤|Lookbook/i.test(label))return '#/lookbook';if(/聯絡|客服/.test(label))return '#/page/contact';if(/訂單|會員|查詢/.test(label))return '#/member';return '#/list?q='+encodeURIComponent(label)};
S.slideLink=function(l){return l==='/sale'?'#/list?sale=1':l==='/new'?'#/list?sort=new':'#/list'};
/* ---------- 頁首、頁尾、跑馬燈 ---------- */
function shopPick(cls){return TX.shops().map(function(s){return '<button type="button" data-shop="'+s.key+'" class="'+(s.key===TX.shopKey()?'on':'')+'"><i style="background:'+TX.THEMES[s.key].acc+'"></i>'+h(s.name)+'</button>'}).join('')}
function head(){var d=D(),cur=location.hash||'#/';
  var links=d.menu.map(function(m){var l=S.menuLink(m);return '<a href="'+l+'" data-m="'+h(m)+'" class="'+(l==='#/'&&(cur==='#/'||cur===''||cur==='#')?'on':l!=='#/'&&cur===l?'on':'')+'" data-cur="'+h(m)+'">'+h(m)+'</a>'}).join('');
  $('#head').innerHTML='<div class="sf-bar"><a class="sf-brand" href="#/" data-cur="首頁"><span class="mk" data-logo></span><span data-brand></span></a><nav class="sf-links" aria-label="商店選單">'+links+'</nav>'+
   '<form class="sf-search" id="sq" role="search"><input type="search" name="q" placeholder="搜尋商品" aria-label="搜尋商品" autocomplete="off"><button aria-label="搜尋">'+IC.search+'</button></form>'+
   '<a class="ibtn" href="#/member" data-cur="我的訂單" aria-label="會員與訂單查詢">'+IC.user+'<span class="lb">訂單查詢</span></a>'+
   '<a class="ibtn cart" href="#/cart" id="cartbtn" data-cur="購物車" aria-label="購物車">'+IC.bag+'<span class="lb">購物車</span><span class="bd" id="cartn" data-n="0"></span></a>'+
   '<button class="ibtn sf-burger" id="sfb" type="button" aria-label="開啟選單" aria-expanded="false">'+IC.menu+'</button></div>';
  var dr=$('#drawer');if(!dr){dr=document.createElement('div');dr.id='drawer';dr.className='sf-drawer';document.body.appendChild(dr)}
  dr.innerHTML='<div class="in"><form class="sf-search" id="sq2" role="search"><input type="search" name="q" placeholder="搜尋商品" aria-label="搜尋商品"><button aria-label="搜尋">'+IC.search+'</button></form><p class="mt">選單</p>'+d.menu.map(function(m){return '<a class="mi" href="'+S.menuLink(m)+'">'+h(m)+'</a>'}).join('')+'<a class="mi" href="#/cart">購物車</a><a class="mi" href="#/member">訂單查詢</a><p class="mt adm">示範後台</p><a class="mi adm" id="mback" href="app.html" data-go="'+h(($('#backadmin')||{getAttribute:function(){return 'app.html#/orders'}}).getAttribute('data-go'))+'">回後台</a><a class="mi adm" id="medit" href="app.html" data-go="app.html#/products" hidden>去後台改這個商品</a><p class="mt">逛別家店</p><div class="shoppick">'+shopPick()+'</div></div>';
  C.applyTheme();document.title='商店頁面｜'+d.name+'｜示範後台・棠序問策股份有限公司建置';
  $('#dbs').innerHTML=shopPick();badge()}
function badge(){var n=TX.cartCount(),b=$('#cartn');if(b){b.textContent=n;b.setAttribute('data-n',n)}}
S.badge=badge;
var mqT=null;
function marquee(){var d=D(),items=d.banner.filter(function(x){return x&&x.trim()});if(!items.length)items=[d.slogan||d.name];
  var set='';for(var i=0;i<3;i++)set+=items.map(function(t){return '<span>'+h(t)+'</span>'}).join('');
  var inner=$('#mqin');inner.innerHTML=set+set;if(mqT){mqT.kill();mqT=null}gsap.set(inner,{xPercent:0});
  if(!RM)mqT=gsap.to(inner,{xPercent:-50,duration:26+items.length*8,ease:'none',repeat:-1})}
function foot(){var d=D(),pgs=d.pages.filter(function(p){return p.status==='發布'});
  $('#foot').innerHTML='<div class="wrap"><div><div class="sf-brand" style="margin-bottom:10px"><span class="mk" data-logo></span><span data-brand></span></div><p>'+h(d.slogan||'')+'</p><p style="margin-top:10px">'+h(d.store.addr)+'<br>'+h(d.store.phone)+'・'+h(d.store.email)+'</p></div>'+
  '<div><h4>購物說明</h4>'+pgs.map(function(p){return '<a class="fl" href="#/page/'+h(p.slug)+'">'+h(p.title)+'</a>'}).join('')+'<a class="fl" href="#/page/contact">聯絡客服</a><a class="fl" href="#/member">訂單查詢</a></div>'+
  '<div><h4>逛別家店（示範）</h4><div class="shoppick">'+shopPick()+'</div><a class="btn" data-line="shop-footer">'+LINE+'我也想要這樣的商店・LINE 問棠序</a></div>'+
  '<div class="copy"><b>示範後台｜棠序問策股份有限公司建置</b>・這是示範商店，商品與店家全是虛構的，不會真的收款或出貨。信用卡付款依綠界規範：不加收手續費、不因金額拒收。</div></div>';
  C.applyTheme()}
/* ---------- 動畫 ---------- */
var io=null;
/* 主題可換掉動畫手感（S.fx，目前只有 T03 用：平順淡入、絲幕換頁）；沒設定就是原本的果凍彈跳。 */
S.fx={};
function reveal(root){if(io){io.disconnect();io=null}var els=$$('.rvl',root);if(!els.length)return;
  if(RM||!window.IntersectionObserver){els.forEach(function(e){e.classList.remove('rvl')});return}
  var FX=S.fx.reveal;
  gsap.set(els,FX?FX.from:{opacity:0,y:60,scale:.94});
  io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io&&io.unobserve(e.target);var el=e.target,d=(el.parentNode?[].indexOf.call(el.parentNode.children,el)%4:0)*.07;
    gsap.to(el,{opacity:1,y:0,scale:1,duration:FX?FX.dur:1.1,ease:FX?FX.ease:'elastic.out(1,.55)',delay:FX?d*1.6:d,clearProps:'transform,opacity',onStart:function(){el.style.opacity=''}})})},{rootMargin:'0px 0px -5% 0px',threshold:.04});
  els.forEach(function(e){io.observe(e)});
  setTimeout(function(){els.forEach(function(el){if(getComputedStyle(el).opacity<1)gsap.to(el,{opacity:1,y:0,scale:1,duration:.5,clearProps:'transform,opacity'})})},6500)}
S.drop=function(sel,root){if(RM)return;if(S.fx.drop)return S.fx.drop(sel,root);var els=$$(sel,root);if(els.length)gsap.from(els,{y:-170,opacity:0,duration:1.15,ease:'bounce.out',stagger:.11,clearProps:'transform,opacity'})};
S.fly=function(img,from){var cb=$('#cartbtn');if(!cb||RM||!from)return;if(S.fx.fly)return S.fx.fly(img,from,cb,bump);var r=cb.getBoundingClientRect(),f=document.createElement('img');f.className='fly';f.src=img;f.alt='';document.body.appendChild(f);
  var sx=from.left+from.width/2-45,sy=from.top+from.height/2-45,ex=r.left+r.width/2-45,ey=r.top+r.height/2-45;
  gsap.set(f,{x:sx,y:sy});
  var tl=gsap.timeline({onComplete:function(){f.remove();bump()}});
  tl.to(f,{y:sy-120,duration:.28,ease:'power2.out'}).to(f,{x:ex,y:ey,scale:.18,rotation:360,duration:.62,ease:'power2.in'});
  gsap.to(f,{x:ex,duration:.9,ease:'power1.inOut'});
};
function bump(){var cb=$('#cartbtn');if(!cb)return;badge();if(RM)return;if(S.fx.bump)return S.fx.bump(cb);gsap.fromTo(cb,{scale:1.3,rotation:-8},{scale:1,rotation:0,duration:.8,ease:'elastic.out(1,.35)'});var r=cb.getBoundingClientRect();if(C.burst)C.burst(r.left+r.width/2,r.top+r.height/2,14)}
S.bump=bump;
var sweeping=false;
function sweepThen(fn){if(S.fx.swap)return S.fx.swap(fn);if(sweeping){fn();return}sweeping=true;var s=$('#sweep'),i=s.firstElementChild;s.style.visibility='visible';gsap.set(i,{xPercent:-100});
  gsap.to(i,{xPercent:0,duration:.34,ease:'power2.in',onComplete:function(){fn();gsap.to(i,{xPercent:100,duration:.42,delay:.04,ease:'power2.out',onComplete:function(){s.style.visibility='hidden';sweeping=false}})}})}
/* ---------- 路由與畫面 ---------- */
var cur={name:'',raw:''},first=true,lastRaw=null;
function resolve(){var H=S.hash();for(var i=0;i<S.routes.length;i++){var m=H.path.match(S.routes[i].re);if(m)return {r:S.routes[i],m:m,H:H}}return null}
function initHams(root){C.hams=C.hams.filter(function(L){return document.body.contains(L.el)});$$('[data-ham]:not(.ham)',root).forEach(C.initHam)}
function render(opts){opts=opts||{};var f=resolve(),main=$('#sf');if(!f){location.replace('#/');return}
  var name=f.r.name,sy=window.scrollY;
  var swap=function(){var res=f.r.fn(f.m,f.H,{first:first})||{};main.innerHTML=typeof res==='string'?res:res.html;
    document.body.classList.toggle('pdp-on',name==='pdp');document.body.classList.toggle('lb-on',name==='lookbook');document.body.classList.remove('lb-sheet');var ph=$('#pethint');if(ph)ph.classList.toggle('quiet',name==='cart'||name==='checkout'||name==='lookbook'||name==='pdp');S.admin(res.admin||'app.html#/shop');S.editLink(res.edit||null,res.editLabel);
    head();foot();marquee();initHams(document.body);document.title='商店頁面｜'+D().name+'｜示範後台・棠序問策股份有限公司建置';
    if(opts.keep||(name==='list'&&cur.name==='list'))window.scrollTo(0,sy);else window.scrollTo(0,0);
    if(res.mount)res.mount(main,f.m,f.H);
    if(!opts.keep){if(res.drop)S.drop(res.drop,main);}
    reveal(main);if(opts.keep===undefined&&RM===false&&!res.drop&&!first){gsap.from(main,{opacity:.4,duration:.25})}
    cur={name:name,raw:S.hash().raw};first=false;S.cur=cur;lastRaw=raw();
    var cx=$('#sq input');if(cx&&f.H.path==='/list')cx.value=f.H.q.get('q')||''};
  if(opts.keep||first||RM||name===cur.name){swap()}else sweepThen(swap)}
S.render=render;
S.refresh=function(){render({keep:true})};
/* ---------- 事件 ---------- */
S.act={};
document.addEventListener('click',function(e){
  var sh=e.target.closest('[data-shop]');
  if(sh){var k=sh.dataset.shop;if(k!==TX.shopKey()){C.setTheme(k);var dr=$('#drawer');dr&&dr.classList.remove('open');S.st.code='';S.st.form=null;if(C.burst){var r=sh.getBoundingClientRect();C.burst(r.left+r.width/2,r.top+r.height/2,50)}S.say('換好囉！');
      if((location.hash||'').indexOf('#/p/')===0||(location.hash||'').indexOf('#/done/')===0)location.hash='#/';else render({keep:false})}
    return}
  if(e.target.closest('#sfb')){var d=$('#drawer'),o=d.classList.toggle('open');$('#sfb').setAttribute('aria-expanded',o);document.body.classList.toggle('noscroll',o);return}
  var dr2=e.target.closest('#drawer');if(dr2&&(e.target.closest('a.mi')||e.target===dr2)){$('#drawer').classList.remove('open');document.body.classList.remove('noscroll');$('#sfb').setAttribute('aria-expanded','false')}
  var t=e.target.closest('[data-a]');if(!t||t.tagName==='SELECT'||(t.tagName==='INPUT'))return;var a=t.getAttribute('data-a');
  if(a==='reset'){U.confirm('重設示範資料？','你在後台和商店頁面做的操作（商品、訂單、購物車）都會還原。',function(){TX.reset();location.reload()});return}
  if(S.act[a]){e.preventDefault();S.act[a](t,e)}});
document.addEventListener('submit',function(e){var f=e.target;if(f.id==='sq'||f.id==='sq2'){e.preventDefault();var v=f.q.value.trim();var dr=$('#drawer');dr&&dr.classList.remove('open');document.body.classList.remove('noscroll');location.hash=S.href('/list',{q:v})}});
window.addEventListener('hashchange',function(){var dr=$('#drawer');dr&&dr.classList.remove('open');document.body.classList.remove('noscroll');U.closeModal(true);render()});
/* 後台（另一個分頁）改了資料 → 這裡馬上更新 */
function raw(){try{return localStorage.getItem('tx-demo-v1')}catch(e){return null}}
function sync(msg){var r=raw();if(r===lastRaw)return;lastRaw=r;TX.reload();S.refresh();if(msg)U.toast('後台剛剛改了東西','這裡已經跟著更新')}
window.addEventListener('storage',function(e){if(e.key==='tx-demo-v1'||e.key==='tx-cart-v1'){if(e.key==='tx-demo-v1'){sync(true)}else{badge();if(/^#\/cart/.test(location.hash))S.refresh()}}});
document.addEventListener('visibilitychange',function(){if(!document.hidden)sync(false)});
window.addEventListener('pageshow',function(e){if(e.persisted){var rl=$('#roll');if(rl)rl.style.visibility='hidden';sync(false)}});
/* 加入購物車（商品卡的＋ 與商品頁共用）：數量檢查、飛入動畫、倉鼠說話 */
S.addToCart=function(pid,vk,qty,srcEl){var res=TX.cartAdd(pid,vk,qty);if(!res.ok){U.toast(res.msg);return res}
  var p=TX.product(pid);if(srcEl)S.fly(TX.pimg(p,vk),srcEl.getBoundingClientRect());else bump();badge();
  U.toast('已加進購物車',(TX.lvar(vk)||!vk?p.name+(vk?'（'+TX.vlabel(vk)+'）':''):TX.lname(p.name,vk))+(res.msg?'・'+res.msg:''));S.say('加進去囉！');return res};
S.act.qadd=function(t,e){e.stopPropagation();var im=t.closest('.pc').querySelector('.im');S.addToCart(t.dataset.id,'',1,im)};
/* ---------- 提示氣泡：在後台改，這裡馬上變 ---------- */
function hint(){var ph=$('#pethint');var seen=false;try{seen=sessionStorage.getItem('sf-hint')==='1'}catch(e){}
  if(seen){ph.classList.add('off');return}
  var mob=matchMedia('(max-width:760px)').matches;if(mob)ph.classList.add('mob');
  $('#bubx').addEventListener('click',function(){ph.classList.add('off');ph.classList.remove('mob');try{sessionStorage.setItem('sf-hint','1')}catch(e){}});
  setTimeout(function(){ph.classList.add('off');ph.classList.remove('mob')},mob?8000:20000);
  if(!RM&&!mob){gsap.from('#bub',{scale:0,transformOrigin:'100% 100%',duration:.7,delay:1.4,ease:'back.out(2.4)'})}}
S.start=function(){
  var hs=location.hash;lastRaw=raw();
  if(!hs){history.replaceState(null,'','#/')}
  render();hint();
  if(!RM)gsap.from('.sf-bar',S.fx.head||{y:-90,opacity:0,duration:1,ease:'bounce.out',delay:.05,clearProps:'transform,opacity'});
  document.dispatchEvent(new Event('shopready'))};
})();
