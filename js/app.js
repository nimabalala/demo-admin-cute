/* 後台核心：路由（網址 # 後面）、次選單、事件分派。每個頁面在 pages-*.js 登記。 */
(function(){
var C=window.CUTE,TX=window.TX,U=window.TXUI,$=C.$,$$=C.$$,h=TX.esc,RM=C.RM;
var APP=window.APP={routes:[],act:{},inp:{},ui:{},cur:null};
var SUBS={
 orders:[['全部訂單','/orders'],['批次出貨','/orders/ship','ship'],['退換貨','/orders/returns','returns'],['出貨紀錄','/orders/log']],
 products:[['全部商品','/products'],['新增商品','/product/new'],['庫存','/products/stock'],['分類','/products/cats'],['評價','/products/reviews']],
 customers:[['客服訊息','/customers/inbox','unread'],['顧客名單','/customers'],['會員等級與點數','/customers/levels']],
 marketing:[['折價券','/marketing'],['優惠活動','/marketing/campaigns']],
 shop:[['外觀與首頁','/shop'],['頁面','/shop/pages'],['網站選單','/shop/menu'],['模特兒穿搭輪盤','/shop/lookbook','diy']],
 settings:[['店家資料','/settings'],['運費與出貨','/settings/shipping'],['付款','/settings/payment'],['通知','/settings/notify'],['帳號與權限','/settings/accounts'],['外掛','/settings/plugins','diy']],
 reports:[]
};
var PET={orders:'xiaosha',reports:'xiaosha',products:'tiaotiao',shop:'tiaotiao',customers:'lili',marketing:'lili',settings:'lili'};
APP.route=function(re,sec,fn){APP.routes.push({re:re,sec:sec,fn:fn})};
function path(){var p=(location.hash||'').replace(/^#/,'');return p||'/orders'}
APP.go=function(p){location.hash=p};
APP.pet=function(text){var k=PET[APP.cur&&APP.cur.sec]||'lili';C.say&&C.say(k,text)};
function shopLink(sec){var m=(APP.cur&&APP.cur.path||'').match(/^\/product\/([^/]+)$/);
  if(/^\/shop\/lookbook/.test(APP.cur&&APP.cur.path||''))return !(TX.LB&&TX.LB.on())?'':'<a class="btn pk sm" data-go="shop.html#/lookbook" data-cur="商店">看穿搭輪盤（商店頁面）</a>';
  if(m&&m[1]!=='new')return '<a class="btn pk sm" data-go="shop.html#/p/'+m[1]+'" data-cur="商店">在商店頁面看這個商品</a>';
  if(sec==='shop'||sec==='products')return '<a class="btn pk sm" data-go="shop.html" data-cur="商店">看商店頁面</a>';
  if(sec==='orders'&&/^\/orders(\/|$)/.test(APP.cur&&APP.cur.path||''))return '<a class="btn pk sm" data-go="shop.html" data-cur="商店">去商店頁面下一單</a>';
  return ''}
APP.page=function(sec,title,sub,right,body,activePath){ /* 標準頁首＋次選單 */
  right=(right||'')+shopLink(sec);
  var t=TX.todo(),subs=(SUBS[sec]||[]),ap=activePath||path();
  var best=-1,bl=-1;subs.forEach(function(s,i){if(ap===s[1]){best=i;bl=999}else if(ap.indexOf(s[1]+'/')===0&&s[1].length>bl){best=i;bl=s[1].length}});if(best<0&&subs.length)best=0;
  var tabs=subs.length?'<nav class="sub" aria-label="次選單">'+subs.map(function(s,i){var b=s[2]==='unread'?t.unread:s[2]==='returns'?t.returns:s[2]==='ship'?t.ship:s[2]==='diy'?(s[1]==='/shop/lookbook'&&TX.LB&&!TX.LB.on()?'未開啟':'棠序自製'):0;return '<a href="#'+s[1]+'" class="'+(i===best?'on':'')+'" data-cur="'+h(s[0])+'"'+(i===best?' aria-current="page"':'')+'>'+h(s[0])+(b?' <em'+(s[2]==='diy'?' class="diy"':'')+'>'+b+'</em>':'')+'</a>'}).join('')+'</nav>':'';
  return '<div class="h1"><h1><small>'+h(sub)+'</small><span class="sm">'+h(title)+'</span></h1><div class="ha">'+(right||'')+'</div></div>'+tabs+body};
function find(p){for(var i=0;i<APP.routes.length;i++){var m=p.match(APP.routes[i].re);if(m)return {r:APP.routes[i],m:m}}return null}
var first=true,busy=false;
function render(opts){opts=opts||{};var p=path(),f=find(p),v=$('#view');
  if(!f){v.innerHTML='<div class="loadmsg">找不到這一頁。<br><a class="btn sm" href="#/orders" style="margin-top:14px">回到訂單</a></div>';return}
  var sy=window.scrollY,prev=APP.cur;APP.cur={sec:f.r.sec,path:p,m:f.m};
  document.body.dataset.section=f.r.sec;document.body.dataset.pet=PET[f.r.sec]||'lili';C.setSection&&C.setSection(f.r.sec);
  var res=f.r.fn(f.m,opts)||{};var html=typeof res==='string'?res:res.html;
  var swap=function(){v.innerHTML=html;if(res.mount)res.mount(v,f.m);
    if(opts.keep){window.scrollTo(0,sy)}else{window.scrollTo(0,0);U.enter(v,!first);}first=false;busy=false};
  if(opts.keep||first||RM||!prev){swap();return}
  busy=true;gsap.to(v,{opacity:0,y:8,duration:.1,onComplete:function(){gsap.set(v,{opacity:1,y:0});swap()}})}
APP.refresh=function(){render({keep:true})};
window.addEventListener('hashchange',function(){U.closeModal(true);render()});
document.addEventListener('shopchange',function(){render({keep:true})});
/* 事件分派：data-a＝點擊；data-i＝輸入／改變 */
document.addEventListener('click',function(e){var t=e.target.closest('[data-a]');if(!t||t.getAttribute('data-a')==='reset'&&t.closest('#chrome'))return;var f=APP.act[t.getAttribute('data-a')];if(f){f(t,e)}});
['input','change'].forEach(function(ev){document.addEventListener(ev,function(e){var t=e.target.closest&&e.target.closest('[data-i]');if(!t)return;var f=APP.inp[t.getAttribute('data-i')];if(f)f(t,e,ev)})});
APP.start=function(){var v=$('#view');if(!location.hash)history.replaceState(null,'','#/orders');render();document.dispatchEvent(new Event('appready'))};
/* 小工具 */
APP.kpis=function(items){return '<div class="kpis">'+items.map(function(k){return '<'+(k.href?'a href="'+k.href+'"':'div')+' class="kpi" style="--k:'+k.c+'"><b class="'+(String(k.v).length>5?'s':'')+'" data-count="'+(+k.v||0)+'">'+(typeof k.v==='number'?'0':k.v)+'</b><span>'+h(k.t)+'</span></'+(k.href?'a':'div')+'>'}).join('')+'</div>'};
APP.countUp=function(root){$$('[data-count]',root).forEach(function(b){var n=+b.dataset.count;if(b.textContent==='0'||b.textContent==='')U.count(b,n)})};
APP.confetti=function(el,n){if(!C.burst||RM)return;var r=(el&&el.getBoundingClientRect)?el.getBoundingClientRect():{left:innerWidth/2,top:innerHeight/2,width:0,height:0};C.burst(r.left+r.width/2,r.top+r.height/2,n||60)};
APP.imgOf=function(p,vk){return TX.pimg(p,vk)};
})();
