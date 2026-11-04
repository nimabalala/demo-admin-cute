/* 共用外框：示範標記條、導覽列、換品牌、手機選單。首頁與後台共用，只在這裡改一次。 */
(function(){
var C=window.CUTE,TX=window.TX,$=C.$,$$=C.$$;
var NAV=[['總覽','index.html','home'],['訂單與出貨','app.html#/orders','orders'],['商品','app.html#/products','products'],['顧客與客服','app.html#/customers/inbox','customers'],['行銷','app.html#/marketing','marketing'],['網店','app.html#/shop','shop'],['報表','app.html#/reports','reports'],['設定','app.html#/settings','settings']];
var LINE='<svg viewBox="0 0 24 24"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.6 1.1-.5 5.8-3.4 7.9-5.8C21.4 13.6 22 12.4 22 11c0-4.4-4.5-8-10-8z"/></svg>';
var host=document.getElementById('chrome');if(!host)return;
var cur=document.body.dataset.section||'home';
host.innerHTML='<div class="demo-bar"><span class="db1"><i></i>示範後台｜棠序問策股份有限公司建置</span><span class="db2">資料都是虛構的，放心亂點</span><button class="db3" data-a="reset" type="button">重設示範資料</button></div>'+
'<header class="nav" id="nav"><a class="brand" data-go="index.html" data-cur="回首頁"><span class="mk" data-logo></span><span data-brand></span><em>.shop</em></a>'+
'<nav class="links" aria-label="主選單">'+NAV.map(function(n){return '<a class="lk'+(n[2]===cur?' on':'')+'" href="'+n[1]+'" data-go="'+n[1]+'" data-sec="'+n[2]+'">'+n[0]+'</a>'}).join('')+'</nav>'+
'<div class="swwrap"><button class="btn w sm" id="swbtn" type="button" aria-haspopup="true" aria-expanded="false" data-cur="換品牌"><span class="dot"></span>換品牌<svg class="car" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button><div class="swmenu" id="swmenu" role="menu"><p>這是同一套後台，換成你的品牌就是你的：</p>'+
 TX.shops().map(function(s){return '<button type="button" role="menuitem" data-shop="'+s.key+'"><i style="background:'+TX.THEMES[s.key].acc+'"></i><b>'+s.name+'</b><small>'+({fresh:'生鮮蔬果',beauty:'美妝保養',fashion:'服飾穿搭'}[s.key])+'</small></button>'}).join('')+'<a class="btn sm" data-line="brand-menu">'+LINE+'換成我的品牌</a></div></div>'+
'<a class="btn w sm lineb" data-line="topbar-cta">'+LINE+'<span>LINE 問棠序</span></a>'+
'<button class="burger" id="burger" type="button" aria-label="開啟選單" aria-expanded="false"><i></i><i></i><i></i></button></header>'+
'<div class="mnav" id="mnav" aria-hidden="true"><div class="mnav-in"><p class="mt">選單</p>'+NAV.map(function(n){return '<a class="mi'+(n[2]===cur?' on':'')+'" href="'+n[1]+'" data-go="'+n[1]+'">'+n[0]+'</a>'}).join('')+'<p class="mt">換品牌</p><div class="msw">'+TX.shops().map(function(s){return '<button type="button" data-shop="'+s.key+'"><i style="background:'+TX.THEMES[s.key].acc+'"></i>'+s.name+'</button>'}).join('')+'</div><a class="btn lg" data-line="mobile-menu">'+LINE+'LINE 問棠序</a><button class="btn w sm" data-a="reset" type="button">重設示範資料</button></div></div>';
C.applyTheme();
function mark(){var k=TX.shopKey();$$('[data-shop]',host).forEach(function(b){b.classList.toggle('on',b.dataset.shop===k)});}
mark();
var sw=$('#swbtn'),menu=$('#swmenu');
sw.addEventListener('click',function(e){e.stopPropagation();var o=menu.classList.toggle('open');sw.setAttribute('aria-expanded',o);if(o&&!C.RM)gsap.fromTo(menu.children,{y:-10,opacity:0},{y:0,opacity:1,duration:.4,stagger:.05,ease:'back.out(2)'})});
document.addEventListener('click',function(e){if(!e.target.closest('.swwrap'))menu.classList.remove('open');sw.setAttribute('aria-expanded',menu.classList.contains('open'))});
var bg=$('#burger'),mn=$('#mnav');
function mtoggle(o){o=o==null?!mn.classList.contains('open'):o;mn.classList.toggle('open',o);bg.classList.toggle('x',o);bg.setAttribute('aria-expanded',o);mn.setAttribute('aria-hidden',!o);document.body.classList.toggle('noscroll',o)}
bg.addEventListener('click',function(){mtoggle()});mn.addEventListener('click',function(e){if(e.target.closest('a[data-go]')||e.target.closest('[data-shop]'))mtoggle(false)});
host.addEventListener('click',function(e){var s=e.target.closest('[data-shop]');if(s){C.setTheme(s.dataset.shop);mark();menu.classList.remove('open');if(C.burst){var r=s.getBoundingClientRect();C.burst(r.left+r.width/2,r.top+r.height/2,50)}C.say&&C.say('lili','換好囉！');}
  if(e.target.closest('[data-a="reset"]')){if(window.TXUI&&TXUI.confirm)TXUI.confirm('重設示範資料？','你在這個示範裡新增或修改的內容會全部還原。',function(){TX.reset();location.reload()});else if(confirm('重設示範資料？你剛剛的操作會全部還原。')){TX.reset();location.reload()}}});
C.chromeMark=mark;
document.addEventListener('shopchange',mark);
C.setSection=function(sec){$$('.links .lk',host).forEach(function(a){a.classList.toggle('on',a.dataset.sec===sec)});$$('.mnav .mi',host).forEach(function(a){a.classList.toggle('on',a.getAttribute('data-go').indexOf('/'+sec)>-1||(sec==='home'&&a.getAttribute('data-go')==='index.html'))})};
})();
