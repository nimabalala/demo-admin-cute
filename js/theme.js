/* ==========================================================================
   theme.js ── 外觀主題（風格）切換。功能層不變，只換外觀層。
   - 主題清單在 THEMES。每個主題設定：名稱、樣式檔、字體、吉祥物、動畫速度、首頁區塊。
   - 選擇順序：網址 ?theme=xxx → localStorage「tx-skin-v1」→ 預設 cute。
   - 「重設示範資料」不會清掉 tx-skin-v1，所以風格不會被重設。
   - 這個檔案要放在 <head> 所有 CSS 之後，才能把主題樣式蓋在最上層。
   ========================================================================== */
(function(){
'use strict';
var THEMES={
  cute:{key:'cute',name:'可愛糖果',sub:'v5 奶油糖果色・倉鼠吉祥物',sw:['#FFF4E2','#FF8DAA','#4BD1A0'],css:null,fonts:null,
        mascot:true,motion:{speed:1},home:{street:false}},
  t02:{key:'t02',name:'夜巷 街頭',sub:'黑白街頭選貨・雜誌感',sw:['#111111','#FFFFFF','#E5302A'],css:'css/themes/t02.css',
        fonts:'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,500;0,700;0,800;0,900;1,900&family=Inter:wght@400;600;800&family=Noto+Sans+TC:wght@400;700;900&display=swap',
        mascot:false,motion:{speed:1.35},home:{street:true},shop:'alley',
        assets:{looks:['img/lookbook/look1.webp','img/lookbook/look2.webp','img/lookbook/look3.webp','img/lookbook/look4.webp','img/lookbook/look5.webp','img/lookbook/look6.webp']}},
  t03:{key:'t03',name:'質感精品',sub:'深裁 · 留白編輯感',sw:['#E8DFD2','#241C14','#C9A36A'],css:'css/themes/t03.css?v=20261112-m1',
        fonts:'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@200;300;400;500&family=Noto+Sans+TC:wght@300;400;500;700&display=swap',
        mascot:false,motion:{speed:1,calm:true,curtain:true},home:{luxury:true},shop:'atelier',
        /* 慶祝撒花：麥金、乳白、可可青銅的細長金箔與小圓點（不用星星、愛心） */
        confetti:{cols:['#C9A36A','#DDBE8B','#F3EDE3','#6B4F3A','#E8DFD2'],shapes:[3,3,0]},
        /* 精品首頁：棚拍人物去背照（和穿搭輪盤同一組），直接融入深色首屏與米色選品區 */
        assets:{looks:['img/atelier/cut1.webp','img/atelier/cut2.webp','img/atelier/cut3.webp','img/atelier/cut4.webp','img/atelier/cut5.webp','img/atelier/cut6.webp']}}
};
var KEY='tx-skin-v1',DEF='cute',ls=null;try{ls=window.localStorage}catch(e){}
var m=location.search.match(/[?&]theme=([\w-]+)/)||location.hash.match(/[?&]theme=([\w-]+)/);
if(m&&THEMES[m[1]]){try{ls.setItem(KEY,m[1])}catch(e){}}
var k=null;try{k=ls.getItem(KEY)}catch(e){}if(!THEMES[k])k=(m&&THEMES[m[1]])?m[1]:DEF;
var T=THEMES[k],root=document.documentElement;
root.classList.add('sk-'+k);root.setAttribute('data-skin',k);
if(T.fonts)document.write('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="'+T.fonts+'">');
if(T.css)document.write('<link rel="stylesheet" id="skincss" href="'+T.css+'">');
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* 跨頁轉場：在 body／common.js 之前先蓋住畫面，下一頁才不會閃空白。 */
try{if(!RM&&sessionStorage.getItem('roll')==='1')root.classList.add('roll-hold')}catch(e){}
var TH=window.THEME={key:k,cfg:T,list:THEMES,RM:RM,
  set:function(n){if(!THEMES[n])return;try{ls.setItem(KEY,n)}catch(e){}
    var u=location.href.replace(/([?&])theme=[\w-]+&?/,'$1').replace(/[?&]$/,'').replace(/[?&]#/,'#');location.replace(u);if(u===location.href)location.reload()},
  /* 切換器 HTML：mode = bar（示範條上的小按鈕）| panel（設定頁、首頁的大卡片） */
  switcher:function(mode){var h=Object.keys(THEMES).map(function(n){var t=THEMES[n];
      return '<button type="button" class="skb'+(n===k?' on':'')+'" data-skin-set="'+n+'" aria-pressed="'+(n===k)+'" data-cur="換風格">'+
        '<span class="sks">'+t.sw.map(function(c){return '<i style="background:'+c+'"></i>'}).join('')+'</span><b>'+t.name+'</b>'+(mode==='panel'?'<small>'+t.sub+'</small>':'')+'</button>'}).join('');
    return '<div class="skin-sw skin-'+mode+'" role="group" aria-label="網站風格">'+(mode==='bar'?'<span class="skl">風格</span>':'')+h+'</div>'},
  panel:function(){return '<div class="panel skin-panel"><h2>網站風格（外觀主題）</h2><p class="hint">同一套後台和商店功能，換一套外觀。「主題」就是整套配色、字體、圖案和動畫。選好會記在這個瀏覽器，按「重設示範資料」也不會變回來。</p>'+TH.switcher('panel')+'</div>'}
};
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-skin-set]');if(b){e.preventDefault();e.stopPropagation();TH.set(b.getAttribute('data-skin-set'))}},true);
/* 示範條上放切換器（首頁、後台、商店都有示範條） */
function mountBar(){var bar=document.querySelector('.demo-bar');if(bar&&!bar.querySelector('.skin-sw')){var d=document.createElement('div');d.innerHTML=TH.switcher('bar');var r=bar.querySelector('.db3');bar.insertBefore(d.firstChild,r)}}
TH.mountBar=mountBar;
document.addEventListener('DOMContentLoaded',function(){mountBar();
  if(window.gsap&&T.motion.speed!==1)gsap.globalTimeline.timeScale(T.motion.speed);
  if(!T.mascot)document.querySelectorAll('[data-ham]').forEach(function(e){e.setAttribute('aria-hidden','true')});
});
/* 首頁街頭首屏：只有 t02 有。要在 home.js 之前插入，ScrollTrigger 的位置才算得對。 */
TH.mountHome=function(){var host=document.getElementById('skinTop');if(!host)return;
  if(T.home.luxury)return mountLuxury(host);
  if(!T.home.street)return;
  var L=T.assets.looks,MQ='年終出清 全館最低 5 折 ✦ 滿 NT$1,500 免運 ✦ 本週新品每晚 21:00 上架 ✦ 示範商店・資料皆為虛構 ✦ ';
  var tiles=[['本月新品','THIS MONTH','shop.html#/list?sort=new',L[0]],['聯名鞋款','COLLAB','shop.html#/list',L[2]],['潮流配件','ACCESSORIES','shop.html#/list',L[4]],['零碼清倉','LAST CALL','shop.html#/list?sale=1',L[5]]];
  host.innerHTML='<section class="st-wrap" id="street" aria-label="巷尾選物 首屏">'+
   '<div class="st-mq" aria-label="活動訊息"><div class="st-mq-in">'+('<span>'+MQ+'</span>').repeat(4)+'</div></div>'+
   '<div class="st-hero"><canvas id="stfx" aria-hidden="true"></canvas><div class="st-shade"></div>'+
    '<img class="st-model" src="'+L[1]+'" alt="" aria-hidden="true">'+
    '<div class="st-in"><p class="st-kick">LATE NIGHT SELECT ／ 巷尾選物 示範店</p>'+
    '<h1 class="st-logo" data-text="ALLEY 27"><span>ALLEY 27</span></h1>'+
    '<p class="st-zh">巷尾選物｜平價潮流選貨</p>'+
    '<div class="st-go"><a class="btn mag" data-go="shop.html" data-cur="逛逛">逛示範商店</a><a class="btn w mag" data-go="app.html#/orders" data-cur="後台">進入後台</a></div>'+
    '<p class="st-mark">示範後台｜棠序問策股份有限公司建置</p></div>'+
    '<div class="st-scroll">SCROLL ↓</div></div>'+
   '<div class="st-new">'+tiles.map(function(t){return '<a class="st-tile" data-go="'+t[2]+'" data-cur="看看"><img src="'+t[3]+'" alt="" loading="lazy"><span class="st-n">NEW</span><b>'+t[0]+'</b><small>'+t[1]+'</small></a>'}).join('')+'</div>'+
   '<a class="st-sale" data-go="shop.html#/list?sale=1" data-cur="搶"><b>出清特賣</b><span>SALE UP TO 50% OFF ・ 限時 72 小時</span><em>GO →</em></a>'+
   '<div class="st-note">↓ 下面是店長每天看的後台總覽（前台浮誇，後台簡潔）</div></section>';
  startFx();
};

/* 首頁精品首屏：只有 t03 有。滿版模特照慢慢縮放＋深色薄紗＋超大宋體店名＋一排編輯選品。 */
function mountLuxury(host){var L=T.assets.looks;
  var picks=[['大衣','THE COAT','shop.html#/list',L[1]],['針織','KNITWEAR','shop.html#/list',L[2]],['西裝','TAILORING','shop.html#/list',L[3]],['長裙','THE SKIRT','shop.html#/list',L[5]]];
  host.innerHTML='<section class="lx-wrap" id="atelier" aria-label="深裁 ATELIER PROFOND 首屏">'+
   '<div class="lx-hero"><i class="lx-line" aria-hidden="true"></i><div class="lx-photo"><img src="'+L[0]+'" alt="" aria-hidden="true"></div><div class="lx-veil"></div>'+
    '<div class="lx-in">'+
     '<p class="lx-kick lx-f"><span>N° 03 · MAISON DE DÉMONSTRATION</span><i></i><span>示範店</span></p>'+
     '<h1 class="lx-logo lx-f" aria-label="深裁 ATELIER PROFOND"><span class="half l" aria-hidden="true"><span class="zh">深</span><span class="en">Atelier</span></span><span class="half r" aria-hidden="true"><span class="zh">裁</span><span class="en">Profond</span></span></h1>'+
     '<div class="lx-foot"><div class="lx-f"><p class="lx-tag">為少而精的衣櫃而作<small>Pour une garde-robe choisie.</small></p>'+
      '<div class="lx-go"><a class="lx-btn" data-go="shop.html" data-cur="商店">看示範商店</a><a class="lx-btn ghost" data-go="app.html#/orders" data-cur="後台">進入後台</a></div></div>'+
      '<div class="lx-side lx-f"><b>Automne — Hiver</b>示範後台｜棠序問策股份有限公司建置</div></div>'+
    '</div><div class="lx-scroll" aria-hidden="true"></div></div>'+
   '<div class="lx-ed"><div class="lx-ed-h"><p class="lx-no">N° 03 — AUTOMNE / HIVER</p><h2>本季編輯選品</h2><p class="lx-ed-sub">少一點，但每一件都經得起時間。</p></div>'+
    '<div class="lx-row">'+picks.map(function(t,i){return '<a class="lx-pick" data-go="'+t[2]+'" data-cur="看看"><span class="lx-ph"><img src="'+t[3]+'" alt="'+t[0]+'" loading="lazy"></span><small>0'+(i+1)+'</small><b>'+t[0]+'</b><em>'+t[1]+'</em></a>'}).join('')+'</div></div>'+
   '<div class="lx-note"><i></i><p>往下是店長每天看的後台總覽</p><span>前台講究氣氛，後台只留重點</span></div></section>';
}
function startFx(){var cv=document.getElementById('stfx');if(!cv)return;var x=cv.getContext('2d'),W,H,t0=performance.now();
  function rs(){W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight}rs();addEventListener('resize',rs);
  var shards=[];for(var i=0;i<26;i++)shards.push({x:Math.random(),y:Math.random(),s:8+Math.random()*34,v:.02+Math.random()*.06,r:Math.random()*6.28,vr:(Math.random()-.5)*.6});
  function draw(now){var t=(now-t0)/1000;x.fillStyle='#0b0b0b';x.fillRect(0,0,W,H);
    /* 掃過的光束：像影片的打光 */
    for(var j=0;j<3;j++){var cx=((t*.08+j*.37)%1.4-.2)*W,g=x.createLinearGradient(cx-W*.18,0,cx+W*.18,H);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,'+(j?.05:.09)+')');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,W,H)}
    /* 飄落的碎片 */
    shards.forEach(function(p){var y=((p.y+t*p.v)%1.1-.05)*H,xx=p.x*W+Math.sin(t*.5+p.r)*20;x.save();x.translate(xx,y);x.rotate(p.r+t*p.vr);x.fillStyle='rgba(235,235,235,.14)';x.fillRect(-p.s/2,-p.s/6,p.s,p.s/3);x.restore()});
    /* 雜訊顆粒 */
    for(var n=0;n<260;n++){x.fillStyle='rgba(255,255,255,'+(Math.random()*.07)+')';x.fillRect(Math.random()*W,Math.random()*H,2,2)}
    if(!RM)requestAnimationFrame(draw)}
  requestAnimationFrame(draw)}
})();
