/* 資料層：三家示範店的資料（data/data.js）→ localStorage，所有操作結果存在瀏覽器裡。重設＝清掉重來。 */
(function(){
'use strict';
var T=window.TX=window.TX||{};
var KEY='tx-demo-v1',SEQ='tx-seq';
var RAW=window.TX_DATA||{};
var now=Date.now(),DAY=864e5;
var S=null;
function clone(o){return JSON.parse(JSON.stringify(o))}
function realize(d){ /* 把「幾分鐘前」換成真正的時間戳 */
  var x=clone(d);
  x.orders.forEach(function(o){o.t=now-o.ageMin*6e4;delete o.ageMin;o.hist=[{t:o.t,text:'訂單成立'}];if(o.code)o.hist.push({t:o.t+36e5,text:'已產生物流單號 '+o.code});if(o.status==='運送中'||o.status==='已到店待取貨'||o.status==='已完成')o.hist.push({t:o.t+72e5,text:'物流已收件，運送中'});if(o.status==='已到店待取貨'||o.status==='已完成')o.hist.push({t:o.t+2e7,text:'已到店，等待取貨'});if(o.status==='已完成')o.hist.push({t:o.t+4e7,text:'顧客已取貨，訂單完成'});if(o.ret){o.ret.t=now-o.ret.ageMin*6e4;delete o.ret.ageMin}o.items.forEach(function(i){i.returned=0})});
  x.threads.forEach(function(h){h.msgs.forEach(function(m){m.at=now-m.ageMin*6e4;delete m.ageMin})});
  x.restock.forEach(function(r){r.t=now-r.ageMin*6e4;delete r.ageMin});
  x.reviews.forEach(function(r){r.t=now-r.ageDays*DAY});
  x.customers.forEach(function(c){c.joined=now-c.joinedDays*DAY});
  x.series.forEach(function(s){s.t=now-s.d*DAY});
  return x}
function load(){try{var j=localStorage.getItem(KEY);if(j){S=JSON.parse(j);if(S&&S.shops)return}}catch(e){}S={ver:1,shop:'fresh',shops:{}}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){console.warn('[store] 存檔失敗（可能是瀏覽器關閉了儲存）',e)}}
load();
T.save=save;
/* 主題綁店：T02 夜巷固定用「巷尾選物」（alley），T03 質感精品固定用「深裁」（atelier）。鎖住時不改 S.shop，切回 cute 就回到原本那家店。 */
var LOCK=(window.THEME&&THEME.cfg&&THEME.cfg.shop&&RAW[THEME.cfg.shop])?THEME.cfg.shop:null;
T.locked=function(){return LOCK};
T.shopKey=function(){return LOCK||S.shop};
var BOUND={alley:1,atelier:1};/* 只屬於某個主題的店，不出現在一般的換品牌選單 */
T.setShop=function(k){if(LOCK)return;if(RAW[k]&&!BOUND[k]){S.shop=k;save()}};
/* 服飾店（穿搭輪盤外掛可用）：北風衣櫥、巷尾選物 */
T.isApparel=function(k){k=k||T.shopKey();return k==='fashion'||k==='alley'||k==='atelier'};
T.D=function(k){k=k||T.shopKey();if(!S.shops[k]){S.shops[k]=realize(RAW[k]);save()}
  /* 舊存檔升級：深裁（atelier）換成 img/atelier 棚拍照；只動這家店 */
  if(k==='atelier'&&(+S.shops[k].imgv||0)<3){S.shops[k]=JSON.parse(JSON.stringify(S.shops[k]).split('img/alley/a').join('img/atelier/a').split('img/lookbook/look').join('img/atelier/look'));S.shops[k].imgv=3;var AX=(window.TX_DATA||{}).atelier,lb=S.shops[k].lb;if(AX&&AX.lbXY&&lb&&lb.looks)lb.looks.forEach(function(l){var m=/^lbd(\d)$/.exec(l.key||''),q=m&&AX.lbXY[+m[1]-1];if(q&&l.img===AX.lookImgs[+m[1]-1])l.items.forEach(function(it,j){if(q[j]){it.x=q[j][0];it.y=q[j][1]}})});save()}/* 深裁：舊存檔換成棚拍商品照（v2）與棚拍模特兒照（v3） */
  var d=S.shops[k];T.ensureExtras(d);return d};
T.reload=function(){load()};
T.reset=function(){try{localStorage.removeItem(KEY);localStorage.removeItem(SEQ);localStorage.removeItem('tx-cart-v1');localStorage.removeItem('tx-member-v1');sessionStorage.removeItem('theme')}catch(e){}S={ver:1,shop:S.shop,shops:{}};save()};
T.shops=function(){return Object.keys(RAW).filter(function(k){return LOCK?k===LOCK:!BOUND[k]}).map(function(k){return {key:k,name:RAW[k].name,acc:RAW[k].acc}})};
T.THEMES={fresh:{acc:'#4BD1A0',d:'#2BA57A',soft:'#D3F5E7'},beauty:{acc:'#FF7AA5',d:'#D9507D',soft:'#FFDCE8'},fashion:{acc:'#FFC93F',d:'#D99C14',soft:'#FFF0BF'},alley:{acc:'#E5302A',d:'#B51F1A',soft:'#EFEFEF'},atelier:{acc:'#6B4F3A',d:'#4A3626',soft:'#EFE8DD'}};
/* ---------- 小工具 ---------- */
T.money=function(n){n=Math.round(+n||0);return 'NT$ '+n.toLocaleString('en-US')};
T.num=function(n){return Math.round(+n||0).toLocaleString('en-US')};
var p2=function(n){return (n<10?'0':'')+n};
T.fmt=function(t){var d=new Date(t);return (d.getMonth()+1)+'/'+d.getDate()+' '+p2(d.getHours())+':'+p2(d.getMinutes())};
T.fmtDay=function(t){var d=new Date(t);return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
T.ago=function(t){var m=Math.max(0,Math.round((Date.now()-t)/6e4));if(m<1)return '剛剛';if(m<60)return m+' 分鐘前';if(m<1440)return Math.round(m/60)+' 小時前';return Math.round(m/1440)+' 天前'};
T.uid=function(p){var n=1;try{n=(+localStorage.getItem(SEQ)||0)+1;localStorage.setItem(SEQ,n)}catch(e){n=Math.floor(Math.random()*1e6)}return p+Date.now().toString(36)+n};
T.esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
T.dayStart=function(t){var d=new Date(t||Date.now());d.setHours(0,0,0,0);return d.getTime()};
/* ---------- 查詢 ---------- */
T.order=function(id){return T.D().orders.filter(function(o){return o.id===id})[0]};
T.product=function(id){return T.D().products.filter(function(p){return p.id===id})[0]};
T.customer=function(id){return T.D().customers.filter(function(c){return c.id===id})[0]};
T.price=function(p){return p.sale!==''&&p.sale!=null?+p.sale:+p.price};
T.stockOf=function(p){var v=p.variants||{},ks=Object.keys(v);return ks.length?ks.reduce(function(a,k){return a+(v[k].on===false?0:(+v[k].stock||0))},0):(+p.stock||0)};
T.lowLimit=function(){return +T.D().settings.lowStock||0};
T.isLow=function(p){var s=T.stockOf(p);return s<=T.lowLimit()};
T.isSales=function(o){return ['已取消','退貨退款','等待付款'].indexOf(o.status)<0};
var COUNTED=['待處理','已處理','運送中','已到店待取貨','已完成'];
T.STATUS=['待處理','已處理','運送中','已到店待取貨','已完成','等待付款','已取消','未取件退回','退貨退款'];
T.todo=function(){var D=T.D();return {ship:D.orders.filter(function(o){return o.status==='待處理'}).length,unread:D.threads.filter(function(h){return h.unread}).length,returns:D.orders.filter(function(o){return o.ret&&o.ret.status==='申請中'}).length,low:D.products.filter(function(p){return p.status==='on'&&T.isLow(p)}).length}};
T.todayOrders=function(){var s=T.dayStart();return T.D().orders.filter(function(o){return o.t>=s})};
T.revenue=function(days){var D=T.D(),from=T.dayStart(Date.now()-(days-1)*DAY),base=D.series.filter(function(s){return s.t>=from&&s.t<T.dayStart()}).reduce(function(a,s){return a+s.rev},0);var cur=D.orders.filter(function(o){return o.t>=T.dayStart()&&T.isSales(o)}).reduce(function(a,o){return a+o.total},0);return base+cur};
/* ---------- 訂單與出貨（欄位與流程參考外掛：取號→已處理→運送中→已到店→已完成） ---------- */
function hist(o,text){o.hist.push({t:Date.now(),text:text})}
function log(action,n,lg){var D=T.D();D.shiplog.unshift({t:Date.now(),action:action,count:n,logi:lg||'—',op:'示範店長'})}
T.takeNumber=function(ids){ /* 綠界取號：向物流申請託運單號 */
  var D=T.D(),ok=0,skip=[];
  ids.forEach(function(id){var o=T.order(id);if(!o)return;
    if(o.status!=='待處理'){skip.push(o.id+'：狀態不是「待處理」');return}
    if(o.logi==='其他物流'){skip.push(o.id+'：非綠界物流，請用手動出貨');return}
    if(o.code){skip.push(o.id+'：已經取過號，略過');return}
    var pre={'7-11 超商取貨':'F','全家 超商取貨':'C','黑貓宅配':'B'}[o.logi]||'X';
    o.code=pre+String(Math.floor(1e9+Math.random()*9e9));hist(o,'已產生物流單號 '+o.code);
    if(D.settings.autoDone){o.status='已處理';hist(o,'取號後自動改為「已處理」')}ok++});
  if(ok)log('綠界批次取號',ok,ids.length===1?T.order(ids[0]).logi:'多種');
  T.save();return {ok:ok,skip:skip}};
T.markPrinted=function(ids){ids.forEach(function(id){var o=T.order(id);if(o)o.printed=true});log('列印出貨單',ids.length);T.save()};
T.markProcessed=function(ids){var n=0;ids.forEach(function(id){var o=T.order(id);if(o&&o.status==='待處理'){o.status='已處理';hist(o,'標記為已處理');n++}});if(n)log('標記為已處理',n);T.save();return n};
T.markShipping=function(ids,codes){var n=0;ids.forEach(function(id){var o=T.order(id);if(o&&(o.status==='待處理'||o.status==='已處理')){if(codes&&codes[id])o.code=codes[id];o.status='運送中';hist(o,'標記為運送中'+(o.code?'（單號 '+o.code+'）':''));n++}});if(n)log('標記為運送中',n);T.save();return n};
T.advance=function(id){ /* 模擬物流回報：運送中→已到店（超商）/已完成（宅配）→已完成 */
  var o=T.order(id);if(!o)return null;
  if(o.status==='運送中'){if(o.logi==='黑貓宅配'){o.status='已完成';hist(o,'宅配已送達，訂單完成')}else{o.status='已到店待取貨';hist(o,'已到店，等待顧客取貨')}}
  else if(o.status==='已到店待取貨'){o.status='已完成';hist(o,'顧客已取貨，訂單完成')}
  else return null;T.save();return o.status};
T.markPaid=function(id){var o=T.order(id);if(o&&o.status==='等待付款'){o.status='待處理';o.payStatus='已付款';hist(o,'收到款項（示範：手動標記已付款）');T.save();return true}return false};
function addStock(it,q){var p=T.product(it.pid);if(!p)return;if(it.variant&&p.variants&&p.variants[it.variant])p.variants[it.variant].stock=(+p.variants[it.variant].stock||0)+q;else p.stock=(+p.stock||0)+q;if(p.variants&&Object.keys(p.variants).length)p.stock=T.stockOf(p)}
T.cancel=function(id){var o=T.order(id);if(!o||(o.status!=='待處理'&&o.status!=='等待付款'))return false;o.items.forEach(function(it){var q=it.qty-(it.returned||0);if(q>0){addStock(it,q);it.returned=it.qty;T.D().restock.unshift({t:Date.now(),order:o.id,prod:it.name+(it.variant?'（'+it.variant.replace('|','／')+'）':''),qty:q,src:'取消補回'})}});o.status='已取消';if(o.payStatus==='已付款')o.payStatus='已退款';hist(o,'訂單已取消，庫存已補回');T.save();return true};
T.requestReturn=function(id,reason){var o=T.order(id);if(!o||o.status!=='已完成'||o.ret)return false;o.ret={reason:reason||'顧客申請退貨',status:'申請中',t:Date.now()};hist(o,'顧客申請退換貨：'+o.ret.reason);T.save();return true};
T.restockMax=function(it){return Math.max(0,it.qty-(it.returned||0))};
T.approveReturn=function(id,lines){ /* lines: {index:qty}；最多補到已扣庫存，不重複補 */
  var o=T.order(id);if(!o)return {ok:false};var n=0;
  o.items.forEach(function(it,i){var q=Math.min(+lines[i]||0,T.restockMax(it));if(q>0){addStock(it,q);it.returned=(it.returned||0)+q;n+=q;T.D().restock.unshift({t:Date.now(),order:o.id,prod:it.name+(it.variant?'（'+it.variant.replace('|','／')+'）':''),qty:q,src:'退貨補回'})}});
  o.status='退貨退款';o.payStatus='已退款';if(o.ret)o.ret.status='已同意';hist(o,'同意退貨退款，補回庫存 '+n+' 件');T.save();return {ok:true,n:n}};
T.rejectReturn=function(id){var o=T.order(id);if(o&&o.ret){o.ret.status='已婉拒';hist(o,'婉拒退換貨申請');T.save()}};
T.newOrder=function(){ /* 模擬一筆新訂單進來 */
  var D=T.D(),ps=D.products.filter(function(p){return p.status==='on'&&T.stockOf(p)>0}),c=D.customers[Math.floor(Math.random()*D.customers.length)];if(!ps.length)return null;
  var p=ps[Math.floor(Math.random()*ps.length)],vk='',keys=p.variants?Object.keys(p.variants).filter(function(k){return p.variants[k].on!==false&&p.variants[k].stock>0}):[];if(keys.length)vk=keys[Math.floor(Math.random()*keys.length)];
  var q=1+Math.floor(Math.random()*2),pr=T.price(p),sub=pr*q,sh=D.settings,lg=['7-11 超商取貨','全家 超商取貨','黑貓宅配'][Math.floor(Math.random()*3)];
  var fee=sub>=sh.freeOver?0:(lg==='黑貓宅配'?sh.homeFee:sh.cvsFee);
  var ids=D.orders.map(function(o){return +o.id.replace(/\D/g,'')}),nid='T'+(Math.max.apply(null,ids)+1+Math.floor(Math.random()*3));
  var dest=lg==='黑貓宅配'?'台北市示範區新生路 9 號':'示範門市 '+(lg==='7-11 超商取貨'?'台北內湖':'台北松山');
  var o={id:nid,t:Date.now(),cid:c.id,cname:c.name,phone:c.phone,email:c.email,items:[{pid:p.id,name:p.name,variant:vk,qty:q,price:pr,returned:0}],sub:sub,fee:fee,total:sub+fee,pay:'信用卡（綠界）',payStatus:'已付款',logi:lg,dest:dest,status:'待處理',code:'',printed:false,note:'',returned:0,ret:null,hist:[{t:Date.now(),text:'訂單成立（示範：模擬新訂單）'}]};
  D.orders.unshift(o);
  if(vk)p.variants[vk].stock=Math.max(0,p.variants[vk].stock-q);else p.stock=Math.max(0,p.stock-q);if(vk)p.stock=T.stockOf(p);
  T.save();return o};
/* ---------- 商品與規格（規則參考常見電商後台：兩層、選項 ≤20、特價<原價、庫存整數、貨號不可重複） ---------- */
T.SPEC_MAX_OPTS=20;
T.SPEC_MAX_LAYERS=3;
T.SPEC_KEYS=['s1','s2','s3'];
T.SPEC_PRESETS=[{id:'color-size',name:'顏色 × 尺寸',layers:[{name:'顏色',opts:['黑','白','米']},{name:'尺寸',opts:['S','M','L']}]},
  {id:'size-only',name:'只有尺寸',layers:[{name:'尺寸',opts:['S','M','L','XL']}]},
  {id:'color-size-mat',name:'顏色 × 尺寸 × 材質',layers:[{name:'顏色',opts:['黑','白']},{name:'尺寸',opts:['S','M','L']},{name:'材質',opts:['棉','麻']}]}];
T.combos=function(specs){var keys=T.SPEC_KEYS.filter(function(k){return specs[k]&&specs[k].opts&&specs[k].opts.length});
  if(!keys.length)return [];
  var lists=keys.map(function(k){return specs[k].opts.map(function(o){return o.v})});
  return lists.reduce(function(acc,list){var out=[];acc.forEach(function(a){list.forEach(function(b){out.push(a?a+'|'+b:b)})});return out},['']);
};
T.validateSpecs=function(specs){var er=[],names=[],keys=T.SPEC_KEYS.filter(function(k){return specs[k]});
  keys.forEach(function(k,i){var s=specs[k],n=i+1;
    if(!s.name.trim())er.push('規格 '+n+'：請填寫名稱（例如：顏色、尺寸）');
    if(s.name.indexOf('|')>-1)er.push('規格 '+n+'：名稱不可包含「|」');
    if(!s.opts.length)er.push('規格 '+n+'：至少要有一個選項');
    if(s.opts.length>T.SPEC_MAX_OPTS)er.push('規格 '+n+'：選項最多 '+T.SPEC_MAX_OPTS+' 個');
    var nm=s.name.trim().toLowerCase();if(nm){if(names.indexOf(nm)>-1)er.push('規格名稱「'+s.name.trim()+'」重複了，請換一個');names.push(nm)}
    var seen={};s.opts.forEach(function(o){var v=o.v.trim().toLowerCase();if(!v)er.push('規格 '+n+'：有空白的選項');else if(seen[v])er.push('規格 '+n+'：選項「'+o.v+'」重複了');seen[v]=1;if(o.v.indexOf('|')>-1)er.push('規格 '+n+'：選項不可包含「|」')})});
  return er};
T.validateProduct=function(p,draftVariants,isNew){var er=[],D=T.D();
  if(!p.name.trim())er.push('商品名稱');if(!p.cat)er.push('商品分類');
  var hasV=Object.keys(draftVariants||{}).length>0;
  if(!hasV){if(p.price===''||isNaN(+p.price)||+p.price<0)er.push('價格');if(p.stock===''||isNaN(+p.stock)||Math.floor(+p.stock)!==+p.stock||+p.stock<0)er.push('庫存數量（請填整數）')}
  if(!(p.img||p.art||(p.imgData)))er.push('商品主圖');
  var out=er.length?['請先補齊必填欄位：'+er.join('、')]:[];
  if(!hasV&&p.sale!==''&&+p.sale>=+p.price)out.push('特價要低於原價');
  if(hasV){var skus={};D.products.forEach(function(q){if(q.id===p.id)return;if(q.sku)skus[q.sku]=1;Object.keys(q.variants||{}).forEach(function(k){if(q.variants[k].sku)skus[q.variants[k].sku]=q.name})});
    var mine={};Object.keys(draftVariants).forEach(function(k){var v=draftVariants[k],lab=k.replace('|','／');
      if(v.on===false)return;
      if(v.price===''||isNaN(+v.price))out.push('款式「'+lab+'」價格格式不正確');
      if(v.sale!==''&&(isNaN(+v.sale)))out.push('款式「'+lab+'」特價格式不正確');
      else if(v.sale!==''&&+v.sale>=+v.price)out.push('款式「'+lab+'」特價要低於原價');
      if(v.stock===''||isNaN(+v.stock)||Math.floor(+v.stock)!==+v.stock||+v.stock<0)out.push('款式「'+lab+'」庫存請填整數');
      if(v.sku){if(skus[v.sku])out.push('款式「'+lab+'」的貨號「'+v.sku+'」已被其他商品使用');if(mine[v.sku])out.push('貨號「'+v.sku+'」在這個商品裡重複');mine[v.sku]=1}})}
  else if(p.sku){D.products.forEach(function(q){if(q.id!==p.id&&q.sku===p.sku)out.push('貨號「'+p.sku+'」已被其他商品使用')})}
  return out};
T.saveProduct=function(p,isNew){var D=T.D();if(isNew)D.products.unshift(p);else{var i=D.products.findIndex(function(q){return q.id===p.id});if(i>-1)D.products[i]=p}p.stock=T.stockOf(p);T.save();return p};
T.newProduct=function(){var D=T.D(),a=T.defaultArt(T.shopKey());return {id:T.uid('p'),name:'',cat:'',price:'',sale:'',stock:'',sku:'',status:'off',img:null,art:a,imgData:'',desc:'',specs:{},variants:{},sold30:0,preorder:false,shipDate:'',maxBuy:0,shipFee:'',schedOn:'',schedOff:'',imgs:[]}};
T.deleteProduct=function(id){var D=T.D();D.products=D.products.filter(function(p){return p.id!==id});T.save()};
T.setStock=function(pid,vk,q){var p=T.product(pid);if(!p)return;q=Math.max(0,Math.floor(+q||0));if(vk&&p.variants[vk])p.variants[vk].stock=q;else p.stock=q;if(p.variants&&Object.keys(p.variants).length)p.stock=T.stockOf(p);T.save()};
/* ---------- 客服、顧客 ---------- */
T.reply=function(tid,text){var D=T.D(),h=D.threads.filter(function(x){return x.id===tid})[0];if(!h||!text.trim())return;h.msgs.push({f:'s',t:text.trim(),at:Date.now()});h.unread=false;T.save()};
T.pts=function(cid,d,reason){return T.ptsAdjust(cid,d,reason)};
T.ptsAdjust=function(cid,d,reason){var c=T.customer(cid);if(!c)return false;var before=+c.points||0,after=Math.max(0,before+(+d||0));c.points=after;
  var D=T.D();if(!D.pointLog)D.pointLog=[];D.pointLog.unshift({t:Date.now(),cid:cid,cname:c.name,before:before,after:after,delta:after-before,reason:String(reason||'').trim()||'手動調整',op:'示範店長'});
  if(D.pointLog.length>80)D.pointLog=D.pointLog.slice(0,80);T.save();return true};
T.levelNames=function(){var D=T.D(),names=['一般'];(D.levels||[]).forEach(function(l){if(l.name&&names.indexOf(l.name)<0)names.push(l.name)});
  D.customers.forEach(function(c){if(c.level&&names.indexOf(c.level)<0)names.push(c.level)});return names};
T.addLevel=function(name,spend,off){name=String(name||'').trim();if(!name||name==='一般')return {ok:false,msg:'請輸入等級名稱'};
  var D=T.D();if((D.levels||[]).some(function(l){return l.name===name}))return {ok:false,msg:'已經有這個等級了'};
  D.levels=D.levels||[];D.levels.push({name:name,spend:Math.max(0,+spend||0),off:Math.max(0,+off||0)});T.save();return {ok:true}};
T.renameLevel=function(old,nw){nw=String(nw||'').trim();if(!nw)return {ok:false,msg:'名稱不能空白'};
  var D=T.D();if(nw!==old&&(D.levels||[]).some(function(l){return l.name===nw}))return {ok:false,msg:'已經有這個等級了'};
  (D.levels||[]).forEach(function(l){if(l.name===old)l.name=nw});D.customers.forEach(function(c){if(c.level===old)c.level=nw});T.save();return {ok:true}};
T.deleteLevel=function(name){var D=T.D();D.levels=(D.levels||[]).filter(function(l){return l.name!==name});
  D.customers.forEach(function(c){if(c.level===name)c.level='一般'});T.save();return {ok:true}};
T.addCat=function(name){name=String(name||'').trim();var D=T.D();if(!name)return {ok:false,msg:'請輸入分類名稱'};
  if(D.cats.indexOf(name)>-1)return {ok:false,msg:'已經有這個分類了'};D.cats.push(name);T.save();return {ok:true}};
T.ensureExtras=function(D){D=D||T.D();if(!D.pointLog)D.pointLog=[];if(!D.specPresets)D.specPresets=[];
  var S=D.settings||(D.settings={});
  if(!S.payProviders)S.payProviders=[{id:'ecpay',name:'綠界科技 ECPay',kind:'ecpay',on:true,merchantId:'（示範）',hashKey:'••••••••',hashIV:'••••••••',priority:1,note:'主要金流（金流：幫網站代收信用卡等款項的服務）'}];
  if(!S.tracking)S.tracking={meta:{on:false,id:'',name:'Meta Pixel（追蹤碼：記錄訪客在網站做了什麼，給廣告平台優化用）'},ga4:{on:false,id:'',name:'Google Analytics 4（分析工具：看訪客從哪來、看了哪些頁）'},gads:{on:false,id:'',name:'Google Ads（廣告轉換追蹤）'},tiktok:{on:false,id:'',name:'TikTok Pixel（追蹤碼）'},line:{on:false,id:'',name:'LINE Tag（追蹤碼）'},x:{on:false,id:'',name:'X Pixel（追蹤碼）'},pinterest:{on:false,id:'',name:'Pinterest Tag（追蹤碼）'}};
  if(!S.ecpayApp)S.ecpayApp={step:0,status:'idle',form:{shopName:'',taxId:'',ownerName:'',ownerId:'',bankName:'',bankAccount:'',bankBranch:'',phone:'',email:'',addr:'',remark:'BVG'},docs:{idFront:0,idBack:0,passbook:0,company:0},log:[]};
  if(!S.me)S.me={name:(S.accounts&&S.accounts[0]&&S.accounts[0].name)||'示範店長',mail:(S.accounts&&S.accounts[0]&&S.accounts[0].mail)||'manager@example.com',role:'管理員',passSet:false,passHint:''};
  if(!S.aiReply)S.aiReply=T.aiReplyDefaults();
  else{var def=T.aiReplyDefaults();Object.keys(def).forEach(function(k){if(S.aiReply[k]==null)S.aiReply[k]=def[k]});if(!S.aiReply.on)S.aiReply.mode='manual'}
  return D};
T.reportDetail=function(days){var R=T.report(days),D=T.D(),seed=(T.shopKey()||'x').length*17+days;
  function rnd(n){seed=(seed*1103515245+12345)&0x7fffffff;return seed%n}
  var sources=[{k:'直接造訪',v:38+rnd(12)},{k:'Google 搜尋',v:22+rnd(10)},{k:'Instagram',v:14+rnd(8)},{k:'Facebook 廣告',v:10+rnd(6)},{k:'LINE',v:8+rnd(5)},{k:'其他',v:4+rnd(4)}];
  var st=sources.reduce(function(a,x){return a+x.v},0);sources.forEach(function(x){x.pct=Math.round(x.v/st*100)});
  var views=1800+rnd(900)+days*40,adds=Math.round(views*(0.12+rnd(8)/100)),checks=Math.round(adds*(0.35+rnd(10)/100)),pays=R.ord||Math.round(checks*(0.7+rnd(15)/100));
  var funnel=[{k:'瀏覽商品頁',v:views},{k:'加入購物車',v:adds},{k:'進入結帳',v:checks},{k:'完成付款',v:pays}];
  var newc=R.newc,ret=Math.max(0,R.cust-newc);
  var paysplit=[{k:'信用卡（綠界）',v:55+rnd(10)},{k:'超商取貨付款',v:18+rnd(8)},{k:'ATM 轉帳',v:12+rnd(6)},{k:'貨到付款',v:8+rnd(5)}];
  var ship=[{k:'7-11 超商取貨',v:40+rnd(10)},{k:'全家 超商取貨',v:28+rnd(8)},{k:'黑貓宅配',v:22+rnd(8)}];
  var hours=[];for(var h=0;h<24;h++)hours.push({h:h,v:Math.round((h>=10&&h<=22?40:8)+rnd(30)*(h>=19&&h<=21?1.6:1))});
  var refunds=Math.max(1,Math.round(R.ord*0.04)+rnd(3)),refundRate=R.ord?Math.round(refunds/R.ord*1000)/10:0;
  var channels=[{k:'Meta 廣告',spend:12000+rnd(4000),conv:18+rnd(12),rev:R.rev*0.22},{k:'Google 廣告',spend:9000+rnd(3000),conv:14+rnd(10),rev:R.rev*0.18},{k:'TikTok 廣告',spend:5000+rnd(2000),conv:8+rnd(8),rev:R.rev*0.09},{k:'LINE 官方帳號',spend:2000+rnd(1000),conv:6+rnd(5),rev:R.rev*0.07}];
  return {base:R,sources:sources,funnel:funnel,newc:newc,returning:ret,paysplit:paysplit,ship:ship,hours:hours,refunds:refunds,refundRate:refundRate,channels:channels,demo:true}};
/* 示範密碼：不存明文，只記「有設過」與強度提示 */
T.setDemoPass=function(cur,nw){var S=T.D().settings;T.ensureExtras();
  if(S.me.passSet&&cur!=='demo-pass')return {ok:false,msg:'目前密碼不對（示範：第一次可空白；之後請填 demo-pass）'};
  if(!nw||nw.length<8)return {ok:false,msg:'新密碼至少 8 個字'};
  if(!/[A-Za-z]/.test(nw)||!/[0-9]/.test(nw))return {ok:false,msg:'請同時包含英文與數字'};
  S.me.passSet=true;S.me.passHint='已設定（示範不會真的存密碼）';T.save();return {ok:true}};

/* AI 自動回覆外掛（示範）：預設關閉；回覆方式預設永遠是手動。關掉外掛會回到手動。不會真的自動寄出。 */
T.aiReplyDefaults=function(){return {on:0,mode:'manual',packs:[],faq:'',tone:'',chips:[],useCustomers:1,useOrders:1,useProducts:1}};
T.aiReply=function(){T.ensureExtras();return T.D().settings.aiReply};
T.aiReplySetOn=function(v){var a=T.aiReply();a.on=v?1:0;if(!v)a.mode='manual';T.save();return a};
T.aiReplySetMode=function(mode){var a=T.aiReply();if(mode==='ai'&&!a.on)return {ok:false,needPlugin:true};a.mode=mode==='ai'?'ai':'manual';T.save();return {ok:true,mode:a.mode}};
T.aiDraft=function(th){var a=T.aiReply(),c=th&&th.cid?T.customer(th.cid):null,name=(c&&c.name)||(th&&th.cname)||'這位顧客';
  var last=th&&th.msgs?th.msgs.filter(function(m){return m.f!=='s'}).pop():null;
  var kind=a.chips||[],short=kind.indexOf('簡短')>-1,warm=kind.indexOf('親切')>-1,noLucky=kind.indexOf('不用吉祥話')>-1;
  var greet=noLucky?'':(warm?'你好呀，':'您好，');
  var s=greet+name+'，已收到你的訊息。';
  if(last&&last.t)s+='關於「'+String(last.t).slice(0,24)+(last.t.length>24?'…':'')+'」，我們會再幫你確認。';
  if(a.useOrders&&th&&th.orderNo)s+='訂單 '+th.orderNo+' 已幫你對過店內紀錄。';
  if(short)s=greet+'已收到，我們會盡快幫你處理。';
  if(a.faq&&a.faq.trim())s+='（已參考你匯入的常見問答）';
  return s};

T.custStats=function(c){var os=T.D().orders.filter(function(o){return o.cid===c.id&&T.isSales(o)});return {n:os.length,spent:os.reduce(function(a,o){return a+o.total},0)}};
/* ---------- 報表 ---------- */
T.report=function(days){var D=T.D(),from=T.dayStart(Date.now()-(days-1)*DAY),rows=[];
  for(var i=days-1;i>=0;i--){var d0=T.dayStart(Date.now()-i*DAY),base=D.series.filter(function(s){return T.dayStart(s.t)===d0})[0],os=D.orders.filter(function(o){return T.dayStart(o.t)===d0&&T.isSales(o)});
    var cur=os.reduce(function(a,o){return a+o.total},0);rows.push({t:d0,rev:(i===0?0:(base?base.rev:0))+cur,ord:(i===0?0:(base?base.ord:0))+os.length,newc:base?base.newc:0})}
  var rev=rows.reduce(function(a,r){return a+r.rev},0),ord=rows.reduce(function(a,r){return a+r.ord},0),newc=rows.reduce(function(a,r){return a+r.newc},0);
  var sold={};D.products.forEach(function(p){sold[p.id]={p:p,qty:Math.round(p.sold30*days/30),amt:0}});
  D.orders.filter(function(o){return o.t>=from&&T.isSales(o)}).forEach(function(o){o.items.forEach(function(it){if(sold[it.pid])sold[it.pid].qty+=it.qty})});
  Object.keys(sold).forEach(function(k){sold[k].amt=sold[k].qty*T.price(sold[k].p)});
  var top=Object.keys(sold).map(function(k){return sold[k]}).sort(function(a,b){return b.amt-a.amt}).slice(0,10);
  var cat={};top.concat(Object.keys(sold).map(function(k){return sold[k]}).filter(function(x){return top.indexOf(x)<0})).forEach(function(x){cat[x.p.cat]=(cat[x.p.cat]||0)+x.amt});
  return {rows:rows,rev:rev,ord:ord,avg:ord?rev/ord:0,newc:newc,cust:Math.round(ord*.82),top:top,cat:cat}};
T.csv=function(rows){return '\ufeff'+rows.map(function(r){return r.map(function(c){c=String(c==null?'':c);return /[",\n]/.test(c)?'"'+c.replace(/"/g,'""')+'"':c}).join(',')}).join('\r\n')};
T.download=function(name,text,mime){var b=new Blob([text],{type:mime||'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},500)};

/* ======================================================================
   商店頁面（顧客看到的）共用邏輯。和後台用同一份資料：後台改商品／價格／庫存／網店設定，商店頁面馬上跟著變；
   商店頁面下單，後台「訂單」馬上多一筆。購物車與會員登入存在另外兩個 localStorage 鍵，按「重設示範資料」會一起清掉。
   ====================================================================== */
var CART='tx-cart-v1',MEM='tx-member-v1';
T.digits=function(s){return String(s||'').replace(/\D/g,'')};
T.vkeys=function(p){return Object.keys(p.variants||{})};
T.vlabel=function(vk){return vk?String(vk).replace('|','／'):''};
T.vOf=function(p,vk){return vk&&p.variants?p.variants[vk]:null};
T.vprice=function(p,vk){var v=T.vOf(p,vk);if(v)return v.sale!==''&&v.sale!=null?+v.sale:+v.price;return T.price(p)};
T.vorig=function(p,vk){var v=T.vOf(p,vk);return v?+v.price:+p.price};
T.vstock=function(p,vk){var v=T.vOf(p,vk);if(v)return v.on===false?0:(+v.stock||0);return +p.stock||0};
T.liveKeys=function(p){return T.vkeys(p).filter(function(k){return p.variants[k].on!==false})};
T.priceRange=function(p){var ks=T.liveKeys(p);if(!ks.length)return {lo:T.price(p),hi:T.price(p),orig:+p.price,sale:T.price(p)<+p.price};
  var pr=ks.map(function(k){return T.vprice(p,k)}),or=ks.map(function(k){return T.vorig(p,k)});var lo=Math.min.apply(null,pr),hi=Math.max.apply(null,pr);
  return {lo:lo,hi:hi,orig:Math.min.apply(null,or),sale:pr.some(function(x,i){return x<or[i]})}};
T.shopProducts=function(){return T.D().products.filter(function(p){return p.status==='on'})};
T.soldOut=function(p){return T.stockOf(p)<=0};
T.maxQty=function(p,vk){var s=T.vstock(p,vk),m=+p.maxBuy||0;return m>0?Math.min(s,m):s};
/* 購物車（每家店各一台） */
function cartAll(){try{return JSON.parse(localStorage.getItem(CART))||{}}catch(e){return {}}}
T.cart=function(){var l=cartAll()[T.shopKey()];return Array.isArray(l)?l:[]};
T.cartSave=function(l){var a=cartAll();a[T.shopKey()]=l;try{localStorage.setItem(CART,JSON.stringify(a))}catch(e){}};
T.cartCount=function(){return T.cart().reduce(function(a,i){return a+i.qty},0)};
T.cartAdd=function(pid,vk,qty){var p=T.product(pid);if(!p||p.status!=='on')return {ok:false,msg:'這個商品已經下架了'};
  if(T.vkeys(p).length&&!T.vOf(p,vk))return {ok:false,msg:'請先選好規格'};
  var max=T.maxQty(p,vk);if(max<=0)return {ok:false,msg:'這個款式暫時缺貨'};
  var l=T.cart(),it=l.filter(function(x){return x.pid===pid&&x.vk===(vk||'')})[0],have=it?it.qty:0,want=have+(+qty||1),msg='';
  if(want>max){want=max;msg=(+p.maxBuy>0&&max===+p.maxBuy)?'這個商品每人最多買 '+max+' 件':'庫存只剩 '+max+' 件，已幫你放進最大數量'}
  if(it)it.qty=want;else l.push({pid:pid,vk:vk||'',qty:want});T.cartSave(l);return {ok:true,msg:msg,qty:want}};
T.cartSet=function(i,q){var l=T.cart();if(!l[i])return;q=Math.floor(+q||0);if(q<=0)l.splice(i,1);else{var p=T.product(l[i].pid);var m=p?T.maxQty(p,l[i].vk):0;l[i].qty=Math.max(1,Math.min(q,m||1))}T.cartSave(l)};
T.cartClear=function(){T.cartSave([])};
T.cartLines=function(){return T.cart().map(function(it,i){var p=T.product(it.pid),ok=!!p&&p.status==='on',st=ok?T.vstock(p,it.vk):0,bad='';
  if(!p||p.status!=='on')bad='這個商品已下架';else if(T.vkeys(p).length&&!T.vOf(p,it.vk))bad='這個規格已經沒有了';else if(st<=0)bad='缺貨中';else if(it.qty>st)bad='庫存只剩 '+st+' 件';
  return {i:i,pid:it.pid,vk:it.vk,qty:it.qty,p:p,price:p?T.vprice(p,it.vk):0,orig:p?T.vorig(p,it.vk):0,stock:st,bad:bad}})};
/* 物流與付款（後台「設定」裡開關什麼，這裡就出現什麼） */
T.shipOpts=function(){var s=T.D().settings;return [{k:'7-11 超商取貨',on:s.seven,fee:+s.cvsFee,cvs:true},{k:'全家 超商取貨',on:s.family,fee:+s.cvsFee,cvs:true},{k:'黑貓宅配',on:s.home,fee:+s.homeFee,cvs:false}].filter(function(x){return x.on})};
T.payOpts=function(logi){var s=T.D().settings,cvs=/超商/.test(logi||''),home=logi==='黑貓宅配',r=[];
  if(s.payCard)r.push({k:'信用卡（綠界）',d:'任何金額都能刷，不加收手續費（示範：不會真的刷卡）',status:'待處理',pay:'已付款'});
  if(s.payAtm)r.push({k:'ATM 轉帳',d:'下單後轉帳，收到款項才出貨',status:'等待付款',pay:'待付款'});
  if(s.payCvs&&cvs)r.push({k:'超商取貨付款',d:'到店取貨時再付錢',status:'待處理',pay:'貨到付款待收款'});
  if(s.payCod&&home)r.push({k:'貨到付款',d:'宅配送到時再付錢',status:'待處理',pay:'貨到付款待收款'});
  return r};
T.todayStr=function(){return T.fmtDay(Date.now())};
T.findCoupon=function(code){code=String(code||'').trim().toUpperCase();if(!code)return null;return T.D().coupons.filter(function(c){return String(c.code).toUpperCase()===code})[0]||null};
T.couponCheck=function(c,sub){if(!c)return '找不到這組折扣碼';if(!c.active)return '這組折扣碼已停用';var t=T.todayStr();if(c.start&&t<c.start)return '這組折扣碼還沒開始';if(c.end&&t>c.end)return '這組折扣碼已過期';if(c.limit&&c.used>=c.limit)return '這組折扣碼已被領完';if(sub<c.min)return '再買 '+T.money(c.min-sub)+' 就能用這組折扣碼（滿 '+T.money(c.min)+'）';return ''};
T.member=function(){try{var m=JSON.parse(localStorage.getItem(MEM));return m&&m.shop===T.shopKey()?m:null}catch(e){return null}};
T.memberSet=function(m){try{if(m)localStorage.setItem(MEM,JSON.stringify(Object.assign({shop:T.shopKey()},m)));else localStorage.removeItem(MEM)}catch(e){}};
T.customerByPhone=function(ph){var d=T.digits(ph);if(!d)return null;return T.D().customers.filter(function(c){return T.digits(c.phone)===d})[0]||null};
T.levelOff=function(cust){if(!cust)return 0;var l=T.D().levels.filter(function(x){return x.name===cust.level})[0];return l?+l.off:0};
/* 試算：小計、活動折扣、折扣碼、會員折扣、運費 */
T.quote=function(lines,o){o=o||{};var D=T.D(),S2=D.settings,good=lines.filter(function(l){return !l.bad});
  var sub=good.reduce(function(a,l){return a+l.price*l.qty},0),qty=good.reduce(function(a,l){return a+l.qty},0),parts=[],msg='';
  var camp=D.campaigns.filter(function(c){return c.active&&c.type==='任選優惠'})[0];
  if(camp&&qty>=3){parts.push({k:camp.name,v:Math.floor(sub*.1)})}
  var c=o.code?T.findCoupon(o.code):null,cm='';
  if(o.code){cm=T.couponCheck(c,sub);if(!cm){parts.push({k:'折扣碼 '+c.code,v:c.type==='percent'?Math.floor(sub*c.value/100):Math.min(sub,+c.value),code:c.id})}}
  var off=T.levelOff(o.cust);if(off)parts.push({k:o.cust.level+' 會員 '+off+'% 折扣',v:Math.floor(sub*off/100)});
  var disc=Math.min(sub,parts.reduce(function(a,x){return a+x.v},0));
  var lg=T.shipOpts().filter(function(x){return x.k===o.logi})[0],fee=0,free=sub>=+S2.freeOver;if(lg&&!free&&sub>0)fee=lg.fee;
  return {sub:sub,qty:qty,parts:parts,disc:disc,fee:fee,free:free,total:Math.max(0,sub-disc)+fee,couponMsg:cm,gapFree:Math.max(0,+S2.freeOver-sub),camp:camp}};
/* 在商店頁面下單：建立一筆後台看得到的訂單，扣庫存；回傳 {ok,order} 或 {ok:false,msg} */
T.placeOrder=function(f){var D=T.D(),lines=T.cartLines();
  if(!lines.length)return {ok:false,msg:'購物車是空的'};
  var bad=lines.filter(function(l){return l.bad});if(bad.length)return {ok:false,msg:'「'+(bad[0].p?bad[0].p.name:'有商品')+'」'+bad[0].bad+'，請回購物車調整'};
  var cust=T.customerByPhone(f.phone);
  var q=T.quote(lines,{logi:f.logi,code:f.code,cust:cust}),pay=T.payOpts(f.logi).filter(function(x){return x.k===f.pay})[0];
  if(!pay)return {ok:false,msg:'請選一個付款方式'};
  if(!cust){cust={id:T.uid('fc'),name:f.name,phone:f.phone,email:f.email,level:'一般',points:0,credit:0,joined:Date.now(),joinedDays:0,tags:['商店頁面新會員'],note:''};D.customers.unshift(cust)}
  var ids=D.orders.map(function(o){return +o.id.replace(/\D/g,'')}),nid='T'+(Math.max.apply(null,ids)+1);
  var items=lines.map(function(l){return {pid:l.pid,name:l.p.name,variant:l.vk,qty:l.qty,price:l.price,returned:0}});
  var o={id:nid,t:Date.now(),cid:cust.id,cname:f.name,phone:f.phone,email:f.email,items:items,sub:q.sub,fee:q.fee,disc:q.disc,discNote:q.parts.map(function(x){return x.k}).join('、'),total:q.total,pay:pay.k,payStatus:pay.pay,logi:f.logi,dest:f.dest,status:pay.status,code:'',printed:false,note:f.note?'顧客備註：'+f.note:'',returned:0,ret:null,src:'shop',hist:[{t:Date.now(),text:'訂單成立（商店頁面下單）'}]};
  if(pay.status==='等待付款')o.hist.push({t:Date.now(),text:'等待顧客轉帳'});
  D.orders.unshift(o);
  lines.forEach(function(l){var p=l.p;if(l.vk&&p.variants&&p.variants[l.vk])p.variants[l.vk].stock=Math.max(0,(+p.variants[l.vk].stock||0)-l.qty);else p.stock=Math.max(0,(+p.stock||0)-l.qty);if(p.variants&&Object.keys(p.variants).length)p.stock=T.stockOf(p);p.sold30=(+p.sold30||0)+l.qty});
  q.parts.forEach(function(x){if(x.code){var c=D.coupons.filter(function(c){return c.id===x.code})[0];if(c)c.used=(+c.used||0)+1}});
  T.save();T.cartClear();T.memberSet({phone:f.phone,name:f.name,email:f.email});return {ok:true,order:o}};
T.ordersOfPhone=function(ph){var d=T.digits(ph);if(!d)return [];return T.D().orders.filter(function(o){return T.digits(o.phone)===d})};
})();
