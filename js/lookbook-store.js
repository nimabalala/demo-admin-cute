/* 「Model Lookbook 模特兒穿搭輪盤」外掛（棠序問策股份有限公司自製）的示範資料層。
   和後台、商店頁面共用同一份資料（TX.D().lb），存在 localStorage，按「重設示範資料」就回到沒匯入的狀態。 */
(function(){
'use strict';
var T=window.TX,LB=T.LB={};
var DEMO=[{"t":"日系駝色長大衣穿搭","s":"LOOK 01","i":[{"n":"羊毛長大衣（駝色）","p":6980,"d":"經典直筒版型的羊毛長大衣，柔軟親膚不扎人，單穿或疊穿都有質感。","x":64,"y":36,"c":"外套","z":["S","M","L"]},{"n":"高領羅紋針織衫（奶油白）","p":1880,"d":"微高領設計的羅紋針織衫，奶油白色調溫柔百搭，內搭外穿皆宜。","x":44,"y":27,"c":"上衣","z":["S","M","L"]},{"n":"直筒羊毛西裝褲（炭灰）","p":2380,"d":"筆直剪裁的羊毛混紡西裝褲，修飾腿型，通勤與日常都適合。","x":38,"y":56,"c":"褲裙","z":["28","30","32"]}]},{"t":"韓系卡其風衣穿搭","s":"LOOK 02","i":[{"n":"棉質雙排釦風衣（卡其）","p":4980,"d":"雙排釦經典風衣，防風防潑水棉質布料，秋冬換季好搭配。","x":50,"y":38,"c":"外套","z":["S","M","L"]},{"n":"直筒長褲（深藍）","p":1980,"d":"俐落直筒版型長褲，深藍色穩重耐看，上班與休閒都百搭。","x":56,"y":74,"c":"褲裙","z":["28","30","32"]},{"n":"皮革德比鞋（黑）","p":3680,"d":"傳統德比鞋型，質感皮革鞋面，正式與日常穿搭皆宜。","x":66,"y":94,"c":"配件","z":["41","42","43"]}]},{"t":"燕麥針織裙裝穿搭","s":"LOOK 03","i":[{"n":"麻花粗針織毛衣（燕麥色）","p":2780,"d":"立體麻花紋粗針織毛衣，燕麥色溫暖柔和，寬鬆版型好穿搭。","x":58,"y":36,"c":"上衣","z":["S","M","L"]},{"n":"百褶中長裙（橄欖綠）","p":1980,"d":"細緻壓褶的中長版百褶裙，橄欖綠有層次，行走時裙擺飄逸。","x":50,"y":66,"c":"褲裙","z":["S","M","L"]},{"n":"皮革樂福鞋（深棕）","p":3280,"d":"經典樂福鞋型，深棕色皮革質感，通勤休閒兩相宜。","x":49,"y":94,"c":"配件","z":["37","38","39"]}]},{"t":"炭灰西裝穿搭","s":"LOOK 04","i":[{"n":"單排釦西裝外套（炭灰）","p":5980,"d":"單排釦修身西裝外套，炭灰色挺版布料，商務與正式場合都合適。","x":72,"y":40,"c":"外套","z":["S","M","L"]},{"n":"直筒西裝褲（炭灰）","p":2680,"d":"直筒剪裁西裝褲，與外套同色系可成套穿搭，也能單獨混搭。","x":36,"y":65,"c":"褲裙","z":["28","30","32"]},{"n":"棉質襯衫（白）","p":1580,"d":"純棉質地襯衫，白色基本款，領型挺立、好整理。","x":50,"y":25,"c":"上衣","z":["S","M","L"]}]},{"t":"丹寧休閒穿搭","s":"LOOK 05","i":[{"n":"丹寧外套（中藍）","p":3280,"d":"水洗中藍色丹寧外套，休閒不失俐落，四季都能輕鬆搭配。","x":38,"y":30,"c":"外套","z":["S","M","L"]},{"n":"直筒牛仔褲（靛藍）","p":2480,"d":"直筒版型靛藍牛仔褲，舒適彈性、不易變形，日常必備。","x":48,"y":62,"c":"褲裙","z":["28","30","32"]},{"n":"低筒帆布鞋（米白）","p":1880,"d":"低筒帆布鞋，米白色簡約百搭，輕盈好走。","x":17,"y":88,"c":"配件","z":["41","42","43"]}]},{"t":"燈芯絨長裙穿搭","s":"LOOK 06","i":[{"n":"針織開襟衫（奶油白）","p":2280,"d":"柔軟針織開襟衫，奶油白溫柔氣質，可單穿或當外套披肩。","x":61,"y":30,"c":"上衣","z":["S","M","L"]},{"n":"A字燈芯絨長裙（咖啡棕）","p":2380,"d":"A 字版型燈芯絨長裙，咖啡棕復古質感，行走自在有弧度。","x":52,"y":66,"c":"褲裙","z":["S","M","L"]},{"n":"真皮短靴（黑）","p":3980,"d":"真皮短靴，黑色簡約俐落，搭配裙裝或長褲都好看。","x":50,"y":90,"c":"配件","z":["37","38","39"]}]}];
/* 從連結帶 shop=fashion 進來（首頁亮點、示範連結）：先換到北風衣櫥 */
(function(){var hs=location.hash||'',i=hs.indexOf('?');if(i<0)return;var k=new URLSearchParams(hs.slice(i+1)).get('shop');if(k&&k!==T.shopKey()){try{T.setShop(k)}catch(e){}}})();
LB.VER='1.2.0';LB.NEWVER='1.2.1';LB.AUTHOR='棠序問策股份有限公司';LB.NAME='Model Lookbook 模特兒穿搭輪盤';
LB.CHANGELOG=['手機版：穿搭輪盤可以用手指左右滑動，單品面板可以往下滑關閉','整套加入購物車時，缺貨或沒連結商品的單品會自動略過並說明','授權到期後，前台輪盤照常顯示、加入購物車照常運作'];
LB.IMGS=[1,2,3,4,5,6].map(function(i){return 'img/lookbook/look'+i+'.webp'});
LB.DEMO_KEYS={ok:'MLB-K67Q-TBR9-6WPT-HQX9',expired:'MLB-EXPD-0000-0000-0001',used:'MLB-USED-0000-0000-0002'};
LB.MSG={locked_new:'目前無法新增穿搭：授權尚未啟用或已到期。已建立的穿搭仍可編輯，前台與加入購物車不受影響。',locked_demo:'目前無法匯入示範資料：授權尚未啟用或已到期。',notfashion:'示範穿搭是服飾款，請先換到「北風衣櫥」再匯入。'};
LB.defaults=function(){return {ver:LB.VER,newVer:LB.NEWVER,on:0,looks:[],menu:0,
  set:{accent:'#4B2E22',eyebrow:'穿搭單品 SHOP THE LOOK',note:'價格、規格與販售狀態以商品頁為準。',title:'跟著模特兒穿一套',sub:'點一位模特兒看看穿了什麼，喜歡就整套帶回家',show:6,spacing:1.3,autoplay:1,interval:4400,price:1},
  lic:{state:'active',key:LB.DEMO_KEYS.ok,site:LB.host(),exp:'2027-10-31',last:Date.now()}}};
LB.host=function(){return location.hostname||'demo-site.example'};
LB.get=function(){var D=T.D();if(!D.lb)D.lb=LB.defaults();else{var d=LB.defaults();Object.keys(d.set).forEach(function(k){if(D.lb.set[k]==null)D.lb.set[k]=d.set[k]});if(!D.lb.lic)D.lb.lic=d.lic}if(D.lb.on==null)D.lb.on=D.lb.looks.length?1:0;return D.lb};
/* 外掛開關：關閉時商店頁面完全不顯示穿搭輪盤（區塊、選單、專屬頁都消失），資料保留 */
LB.on=function(){return !!LB.get().on};
LB.ensureMenu=function(){var D=T.D(),lb=LB.get();if(D.menu.indexOf('穿搭輪盤')<0){var at=D.menu.indexOf('關於我們');if(at<0)D.menu.push('穿搭輪盤');else D.menu.splice(at,0,'穿搭輪盤')}lb.menu=1};
LB.dropMenu=function(){var D=T.D(),lb=LB.get();D.menu=D.menu.filter(function(m){return m!=='穿搭輪盤'});lb.menu=0};
LB.setOn=function(v){var lb=LB.get(),res={ok:true,on:v?1:0,looks:0,items:0,prods:0,note:''};
  if(!v){lb.on=0;LB.dropMenu();T.save();return res}
  lb.on=1;
  if(!lb.looks.length){if(!T.isApparel())res.note=LB.MSG.notfashion;else if(!LB.active())res.note=LB.MSG.locked_demo;else{var r=LB.importDemo();if(r.ok){res.looks=r.looks;res.items=r.items;res.prods=r.prods}else res.note=r.msg}}
  LB.ensureMenu();T.save();return res};
LB.save=function(){T.save()};
LB.active=function(){return LB.get().lic.state==='active'};
LB.canCreate=function(){return LB.active()};
LB.look=function(id){return LB.get().looks.filter(function(l){return l.id===id})[0]};
/* 前台會顯示的穿搭：沒有隱藏、有模特兒照片，最多顯示「顯示幾套」套 */
LB.visible=function(){var lb=LB.get();if(!lb.on)return [];return lb.looks.filter(function(l){return !l.hide&&l.img}).slice(0,Math.max(1,+lb.set.show||6))};
/* 單品：有連到商店商品就即時讀商品的名稱、價格、庫存（後台改了馬上變）；沒連就用手動填的 */
LB.res=function(it){var p=it.pid?T.product(it.pid):null,on=!!p&&p.status==='on',r={it:it,p:p,linked:on,gone:!!it.pid&&!on};
  r.name=p?p.name:(it.name||'未命名單品');
  if(on){var pr=T.priceRange(p);r.price=pr.lo;r.hi=pr.hi;r.orig=pr.orig;r.sale=pr.sale;r.from=pr.lo!==pr.hi;r.vks=T.liveKeys(p);r.soldout=T.soldOut(p);r.stock=T.stockOf(p);r.low=!r.soldout&&T.isLow(p)}
  else{r.price=+it.price||0;r.hi=r.price;r.orig=r.price;r.sale=false;r.from=false;r.vks=[];r.soldout=false;r.stock=0}
  r.img=it.img||(p?T.pimg(p):'');r.desc=p&&p.desc?p.desc:'';return r};
/* 預設要加哪個款式：使用者選的 → 第一個有庫存的 */
LB.pickVk=function(r,want){if(!r.linked)return '';if(!r.vks.length)return '';if(want&&r.vks.indexOf(want)>-1&&T.vstock(r.p,want)>0)return want;var k=r.vks.filter(function(k){return T.vstock(r.p,k)>0})[0];return k||''};
/* 整套加入：回傳 {added:[名稱], skipped:[[名稱,原因]]} */
LB.addLook=function(look,choose){choose=choose||{};var out={added:[],skipped:[],notes:[]};
  look.items.forEach(function(it){var r=LB.res(it);
    if(!r.linked){out.skipped.push([r.name,r.gone?'已下架':'還沒連到商品']);return}
    if(r.soldout){out.skipped.push([r.name,'已售完']);return}
    var vk=LB.pickVk(r,choose[it.id]);if(r.vks.length&&!vk){out.skipped.push([r.name,'這個尺寸缺貨']);return}
    var res=T.cartAdd(r.p.id,vk,1);if(res.ok){out.added.push(r.name);if(res.msg)out.notes.push(res.msg)}else out.skipped.push([r.name,res.msg])});
  return out};
/* ---------- 示範資料：6 套穿搭、18 件單品，單品都是北風衣櫥的商品（沒有就補上） ---------- */
function mkProduct(pid,it,n,i,j){var z=it.z,shoe=/^(37|41)$/.test(z[0]),vars={},tot=0;
  z.forEach(function(s,k){var st=24+((n*7+k*11)%38);if(pid==='fl05'&&s==='32')st=0;if(pid==='fl09'&&s==='37')st=4;vars[s]={sku:'LK'+('0'+n).slice(-2)+'-'+(k+1),price:it.p,sale:'',stock:st,on:true};tot+=st});
  return {id:pid,name:it.n,cat:it.c,price:it.p,sale:'',stock:tot,sku:'LK'+('0'+n).slice(-2),status:'on',img:'img/lookbook/l'+(i+1)+'i'+(j+1)+'.webp',art:null,imgData:'',desc:it.d,specs:{s1:{name:shoe?'尺碼':'尺寸',opts:z.slice()}},variants:vars,sold30:5+((n*7)%23),preorder:false,shipDate:'',maxBuy:0,shipFee:'',schedOn:'',schedOff:'',imgs:[],lb:1}}
LB.importDemo=function(){if(!T.isApparel())return {ok:false,msg:LB.MSG.notfashion};
  if(!LB.canCreate())return {ok:false,msg:LB.MSG.locked_demo};
  var D=T.D(),lb=LB.get(),made=0,items=0,prods=0,AL=T.shopKey()==='alley'?(window.TX_DATA||{}).alley:null;
  DEMO.forEach(function(L,i){var key='lbd'+(i+1);if(lb.looks.some(function(x){return x.key===key}))return;
    var look={id:T.uid('lk'),key:key,title:L.t,sub:L.s,img:'img/lookbook/look'+(i+1)+'.webp',hide:false,demo:1,items:[]};
    L.i.forEach(function(it,j){var n=i*3+j+1,pid='fl'+('0'+n).slice(-2),img='img/lookbook/l'+(i+1)+'i'+(j+1)+'.webp',nm=it.n;
      /* 巷尾選物：熱點直接連到店裡既有商品；店裡沒有的 3 件才補上（巷尾選物的命名與圖），不會重複 */
      if(AL){pid=AL.lbMap[i][j];var p=T.product(pid);if(!p){p=JSON.parse(JSON.stringify(AL.lbExtra[pid]));D.products.push(p);prods++}img=p.img;nm=p.name}
      else{var p=T.product(pid);if(!p){D.products.push(mkProduct(pid,it,n,i,j));prods++}}
      look.items.push({id:T.uid('li'),pid:pid,name:nm,price:it.p,img:img,x:it.x,y:it.y,note:''});items++});
    lb.looks.push(look);made++});
  if(!made)return {ok:false,msg:'示範穿搭已經匯入過了'};
  if(D.menu.indexOf('穿搭輪盤')<0){var at=D.menu.indexOf('關於我們');if(at<0)D.menu.push('穿搭輪盤');else D.menu.splice(at,0,'穿搭輪盤');lb.menu=1}
  T.save();return {ok:true,looks:made,items:items,prods:prods}};
/* 匯入示範穿搭會新增幾件商品：北風衣櫥 18 件；巷尾選物只補店裡沒有的 3 件 */
LB.demoNewCount=function(){var AL=T.shopKey()==='alley'?(window.TX_DATA||{}).alley:null;if(!AL)return DEMO.reduce(function(a,L,i){return a+L.i.filter(function(it,j){return !T.product('fl'+('0'+(i*3+j+1)).slice(-2))}).length},0);return Object.keys(AL.lbExtra).filter(function(k){return !T.product(k)}).length};
LB.removeDemo=function(){var D=T.D(),lb=LB.get(),n=lb.looks.filter(function(l){return l.demo}).length;
  if(!n)return {ok:false,msg:'目前沒有示範穿搭可以刪除'};
  lb.looks=lb.looks.filter(function(l){return !l.demo});
  var gone={};D.products=D.products.filter(function(p){if(p.lb===1){gone[p.id]=1;return false}return true});
  lb.looks.forEach(function(l){l.items.forEach(function(it){if(gone[it.pid]){it.pid=''}})});
  var c=T.cart().filter(function(x){return !gone[x.pid]});T.cartSave(c);
  if(!lb.looks.length&&lb.menu){D.menu=D.menu.filter(function(m){return m!=='穿搭輪盤'});lb.menu=0}
  T.save();return {ok:true,looks:n,prods:Object.keys(gone).length}};
/* ---------- 授權（示範用：不會連線；用三組示範碼體驗三種狀態） ---------- */
LB.activate=function(code){code=String(code||'').trim().toUpperCase();var lb=LB.get();
  if(!code)return {ok:false,msg:'請輸入授權碼。'};
  if(!/^MLB(-[A-Z0-9]{4}){4}$/.test(code))return {ok:false,msg:'找不到這組授權碼，請確認是否輸入正確。'};
  if(code.indexOf('EXPD')>-1)return {ok:false,msg:'這組授權碼已到期，請續約後再試。'};
  if(code.indexOf('USED')>-1)return {ok:false,msg:'這組授權碼已在其他網站啟用（一組授權碼限用於一個網站）。請先到原本的網站按「停用此網站」，或聯絡廠商協助釋放名額。'};
  lb.lic={state:'active',key:code,site:LB.host(),exp:'2027-10-31',last:Date.now()};T.save();return {ok:true,msg:'啟用成功！此網站已取得授權。'}};
LB.deactivate=function(){var lb=LB.get();lb.lic={state:'none',key:'',site:'',exp:'',last:Date.now()};T.save()};
LB.setState=function(s){var lb=LB.get();if(s==='active')lb.lic={state:'active',key:LB.DEMO_KEYS.ok,site:LB.host(),exp:'2027-10-31',last:Date.now()};else if(s==='expired')lb.lic={state:'expired',key:LB.DEMO_KEYS.ok,site:LB.host(),exp:'2026-09-30',last:Date.now()};else lb.lic={state:'none',key:'',site:'',exp:'',last:Date.now()};T.save()};
LB.mask=function(k){var p=String(k||'').split('-');return p.length===5?[p[0],p[1],'****','****',p[4]].join('-'):''};
LB.update=function(){var lb=LB.get();if(lb.lic.state!=='active')return false;lb.ver=lb.newVer||lb.ver;lb.newVer=null;T.save();return true};
LB.hasUpdate=function(){var lb=LB.get();return lb.lic.state==='active'&&!!lb.newVer};
})();
