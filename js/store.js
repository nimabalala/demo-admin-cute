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
T.shopKey=function(){return S.shop};
T.setShop=function(k){if(RAW[k]){S.shop=k;save()}};
T.D=function(k){k=k||S.shop;if(!S.shops[k]){S.shops[k]=realize(RAW[k]);save()}return S.shops[k]};
T.reset=function(){try{localStorage.removeItem(KEY);localStorage.removeItem(SEQ);sessionStorage.removeItem('theme')}catch(e){}S={ver:1,shop:S.shop,shops:{}};save()};
T.shops=function(){return Object.keys(RAW).map(function(k){return {key:k,name:RAW[k].name,acc:RAW[k].acc}})};
T.THEMES={fresh:{acc:'#4BD1A0',d:'#2BA57A',soft:'#D3F5E7'},beauty:{acc:'#FF7AA5',d:'#D9507D',soft:'#FFDCE8'},fashion:{acc:'#FFC93F',d:'#D99C14',soft:'#FFF0BF'}};
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
T.combos=function(specs){var a=specs.s1,b=specs.s2;if(!a)return [];var A=a.opts.map(function(o){return o.v});if(!b)return A.map(function(x){return x});var B=b.opts.map(function(o){return o.v}),r=[];A.forEach(function(x){B.forEach(function(y){r.push(x+'|'+y)})});return r};
T.validateSpecs=function(specs){var er=[];['s1','s2'].forEach(function(k,i){var s=specs[k];if(!s)return;var n=(i+1);
  if(!s.name.trim())er.push('規格 '+n+'：請填寫名稱（例如：顏色、尺寸）');
  if(s.name.indexOf('|')>-1)er.push('規格 '+n+'：名稱不可包含「|」');
  if(!s.opts.length)er.push('規格 '+n+'：至少要有一個選項');
  if(s.opts.length>T.SPEC_MAX_OPTS)er.push('規格 '+n+'：選項最多 '+T.SPEC_MAX_OPTS+' 個');
  var seen={};s.opts.forEach(function(o){var v=o.v.trim().toLowerCase();if(!v)er.push('規格 '+n+'：有空白的選項');else if(seen[v])er.push('規格 '+n+'：選項「'+o.v+'」重複了');seen[v]=1;if(o.v.indexOf('|')>-1)er.push('規格 '+n+'：選項不可包含「|」')})});
  if(specs.s1&&specs.s2&&specs.s1.name.trim()&&specs.s1.name.trim().toLowerCase()===specs.s2.name.trim().toLowerCase())er.push('兩個規格名稱不能一樣，請換一個名稱');
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
T.pts=function(cid,d){var c=T.customer(cid);if(c){c.points=Math.max(0,(+c.points||0)+d);T.save()}};
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
})();
