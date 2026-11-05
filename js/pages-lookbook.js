/* 後台「網店 → 模特兒穿搭輪盤」：棠序問策自製外掛 Model Lookbook v1.2.0 的示範版。
   穿搭列表、編輯（點照片標熱點）、一鍵匯入／刪除示範資料、設定、授權與更新。存檔後商店頁面馬上跟著變。 */
(function(){
'use strict';
var C=window.CUTE,TX=window.TX,U=window.TXUI,A=window.APP,LB=TX.LB,$=C.$,$$=C.$$,h=TX.esc;
var ui=A.ui.lb={draft:null,cc:''};
var SWC=[['#4B2E22','可可'],['#FF5E7E','玫紅'],['#FF8DAA','粉紅'],['#4BD1A0','薄荷'],['#86C8FF','天空'],['#B7A5F5','薰衣草'],['#FFB48A','蜜桃']];
var ICON='<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="12" r="6" fill="currentColor"/><path d="M14 40l4-18c.4-2 2-3.4 4-3.4h4c2 0 3.6 1.4 4 3.4l4 18" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
var LICL={active:['有效','ok'],expired:['已到期','bad'],none:['未啟用','mut']};
function days(exp){return Math.ceil((Date.parse(exp)-Date.now())/864e5)}
function licChip(){var s=LB.get().lic.state,l=LICL[s]||LICL.none;return '<span class="st '+l[1]+'">授權'+l[0]+'</span>'}
/* ---------- 共用頁首：外掛資訊、更新提醒、分頁 ---------- */
function plug(tab){var lb=LB.get(),upd=LB.hasUpdate(),act=LB.active();
  var tabs=[['list','穿搭列表','/shop/lookbook'],['set','設定','/shop/lookbook/settings'],['lic','授權與更新','/shop/lookbook/license']];
  var warn=act?'':'<div class="note w">'+U.icon.info+'<div><b>授權'+(lb.lic.state==='expired'?'已到期':'尚未啟用')+'。</b>前台的穿搭輪盤照常顯示、加入購物車照常運作；已建立的穿搭仍可編輯與刪除。目前無法新增穿搭或匯入示範資料，也不會收到外掛更新。<a class="lnk" href="#/shop/lookbook/license">去啟用授權</a></div></div>';
  var up=upd?'<div class="note lbupd">'+U.icon.spark+'<div><b>有新版本：v'+h(lb.newVer)+'（目前 v'+h(lb.ver)+'）</b>'+h(LB.CHANGELOG[0])+'。<span class="lbupa"><button class="act" type="button" data-a="lbupdate">立即更新</button><a class="lnk" href="#/shop/lookbook/license">看更新內容</a></span></div></div>':'';
  return '<div class="lbplug"><div class="pi">'+ICON+'</div><div class="pm"><h2>'+h(LB.NAME)+' <span class="ver">v'+h(lb.ver)+'</span><span class="diy">棠序自製外掛</span></h2><p class="by">作者：'+h(LB.AUTHOR)+'</p><p class="d">在網站放一個可以左右拖曳旋轉的「模特兒穿搭輪盤」，顧客點模特兒，右側就滑出這套穿搭的單品；照片上有編號熱點，可以單件或整套加入購物車。</p></div><div class="ps">'+licChip()+'<a class="btn sm pk" data-line="lookbook-admin">想要這個外掛？LINE 問棠序</a></div></div>'+up+warn+
   '<div class="chips2 lbtabs" role="tablist">'+tabs.map(function(t){return '<a role="tab" class="chipa'+(tab===t[0]?' on':'')+'" href="#'+t[2]+'" aria-selected="'+(tab===t[0])+'">'+t[1]+'</a>'}).join('')+'</div>'}
/* ================= 穿搭列表 ================= */
A.route(/^\/shop\/lookbook$/,'shop',function(){var lb=LB.get(),D=TX.D(),fash=TX.shopKey()==='fashion',demoN=lb.looks.filter(function(l){return l.demo}).length,show=Math.max(1,+lb.set.show||6);
  var right='<button class="btn sm" type="button" data-a="lbnew">＋ 新增穿搭</button>';
  var rows=lb.looks.map(function(l,i){var res=l.items.map(LB.res),lk=res.filter(function(r){return r.linked}).length,pins=l.items.filter(function(it){return it.x!=null&&it.x!==''}).length,vis=!l.hide&&i<show&&lb.looks.slice(0,i).filter(function(x){return !x.hide}).length<show;
    var vc=lb.looks.filter(function(x,k){return !x.hide&&k<=i}).length,on=!l.hide&&vc<=show;
    var stt=l.hide?'<span class="st mut">已隱藏</span>':on?'<span class="st ok">前台顯示中</span>':'<span class="st warn">超過「顯示幾套」</span>';
    return '<tr><td data-l="模特兒"><span class="lbth"><img src="'+h(l.img)+'" alt="" loading="lazy"></span></td><td data-l="穿搭"><b>'+h(l.title)+'</b><small>'+h(l.sub||'')+(l.demo?'・示範資料':'')+'</small></td><td data-l="單品">'+l.items.length+' 件<small>'+lk+' 件已連到商品・'+pins+' 個熱點</small></td><td data-l="前台">'+stt+'</td><td><div class="mini"><button class="act g" type="button" data-a="lbmv" data-id="'+h(l.id)+'" data-d="-1" aria-label="上移"'+(i?'':' disabled')+'>↑</button><button class="act g" type="button" data-a="lbmv" data-id="'+h(l.id)+'" data-d="1" aria-label="下移"'+(i<lb.looks.length-1?'':' disabled')+'>↓</button><a class="act" href="#/shop/lookbook/edit/'+h(l.id)+'">編輯</a><button class="act g" type="button" data-a="lbhide" data-id="'+h(l.id)+'">'+(l.hide?'顯示':'隱藏')+'</button><button class="act d" type="button" data-a="lbdel" data-id="'+h(l.id)+'">刪除</button></div></td></tr>'}).join('');
  var tools='<div class="board lbtool"><div><b>示範資料</b><p>一鍵匯入 6 套穿搭、18 件單品；單品會變成「北風衣櫥」的商品（沒有的會補上）。刪除只會移除示範穿搭和它補上的商品。</p></div><div class="acts"><button class="btn sm w" type="button" data-a="lbimport">一鍵匯入示範資料</button><button class="btn sm w" type="button" data-a="lbdemodel"'+(demoN?'':' disabled')+'>一鍵刪除示範資料</button></div></div>';
  var body=plug('list')+tools+'<div class="board">'+(lb.looks.length?'<div class="tblw"><table class="tbl cards"><thead><tr><th>模特兒</th><th>穿搭</th><th>單品</th><th>前台狀態</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':
    '<div class="empty"><b>還沒有穿搭</b>'+(fash?'按上面「一鍵匯入示範資料」，或「＋ 新增穿搭」自己做一套。':'示範穿搭是服飾款，請先換到「北風衣櫥」。<br><button class="btn sm" type="button" data-a="lbtofashion" style="margin-top:14px">換到北風衣櫥</button>')+'</div>')+'</div>'+
    '<div class="note">'+U.icon.info+'<div>排在前面的穿搭會先顯示；「設定」可以調整前台一次顯示幾套。改完存檔，商店頁面（<a class="lnk" data-go="shop.html#/lookbook">模特兒穿搭輪盤頁</a>）馬上更新。</div></div>';
  return {html:A.page('shop','模特兒穿搭輪盤','網店',right,body,'/shop/lookbook'),mount:function(){A.pet&&A.pet('穿搭輪盤是我們自己做的！')}}});
A.act.lbnew=function(){if(!LB.canCreate()){U.toast(LB.MSG.locked_new);return}ui.draft=null;location.hash='/shop/lookbook/edit/new'};
A.act.lbtofashion=function(){C.setTheme('fashion');if(C.chromeMark)C.chromeMark();A.refresh()};
A.act.lbimport=function(t){var r=LB.importDemo();if(!r.ok){U.toast(r.msg);return}A.confetti(t,70);U.toast('已匯入 '+r.looks+' 套穿搭、'+r.items+' 件單品','北風衣櫥新增了 '+r.prods+' 個商品；去商店頁面看看');A.refresh()};
A.act.lbdemodel=function(){U.confirm('刪除示範資料？','會移除匯入的示範穿搭，以及示範補上的 '+TX.D().products.filter(function(p){return p.lb===1}).length+' 個商品（購物車裡有這些商品的也會一起拿掉）。你自己新增的穿搭不會被刪。',function(){var r=LB.removeDemo();U.toast(r.ok?'已刪除 '+r.looks+' 套示範穿搭':r.msg,r.ok?'商品也一併移除 '+r.prods+' 個':'');A.refresh()},'刪除',true)};
A.act.lbmv=function(t){var lb=LB.get(),i=lb.looks.findIndex(function(l){return l.id===t.dataset.id}),j=i+(+t.dataset.d);if(i<0||j<0||j>=lb.looks.length)return;var x=lb.looks[i];lb.looks[i]=lb.looks[j];lb.looks[j]=x;TX.save();A.refresh()};
A.act.lbhide=function(t){var l=LB.look(t.dataset.id);if(!l)return;l.hide=!l.hide;TX.save();U.toast(l.hide?'已隱藏，商店頁面不會顯示':'已顯示在商店頁面');A.refresh()};
A.act.lbdel=function(t){var l=LB.look(t.dataset.id);if(!l)return;U.confirm('刪除「'+l.title+'」？','只會刪掉這套穿搭，商品本身不受影響。',function(){var lb=LB.get();lb.looks=lb.looks.filter(function(x){return x.id!==l.id});TX.save();U.toast('已刪除這套穿搭');A.refresh()},'刪除',true)};
A.act.lbupdate=function(t){if(LB.update()){A.confetti(t,60);U.toast('已更新到 v'+LB.get().ver,'（示範：不會真的下載檔案）');A.refresh()}};
/* ================= 編輯一套穿搭 ================= */
function blank(){return {id:'new',title:'',sub:'',img:LB.IMGS[0],hide:false,items:[]}}
function mkItem(){return {id:TX.uid('li'),pid:'',name:'',price:'',img:'',x:null,y:null,note:'',mode:'shop'}}
function draftOf(id){if(ui.draft&&ui.draft.id===id)return ui.draft;var src=id==='new'?blank():LB.look(id);if(!src)return null;var d=JSON.parse(JSON.stringify(src));d.items.forEach(function(it){it.mode=it.pid?'shop':(it.name?'manual':'shop')});if(id==='new'&&!d.items.length)d.items.push(mkItem());d._new=id==='new';d._act=0;ui.draft=d;return d}
function stageHtml(E){return '<div class="lbstagew"><div class="lbbox" data-a="lbplace" role="img" aria-label="模特兒照片，點一下放上熱點"><img src="'+h(E.img)+'" alt="">'+E.items.map(function(it,i){if(it.x==null||it.x==='')return '';return '<button type="button" class="lbpin'+(E._act===i?' on':'')+'" data-a="lbpinsel" data-n="'+i+'" style="left:'+(+it.x)+'%;top:'+(+it.y)+'%" aria-label="第 '+(i+1)+' 個熱點">'+(i+1)+'</button>'}).join('')+'</div></div>'}
function itemCard(E,it,i){var P=TX.D().products,pr=it.pid?LB.res(it):null;
  var seg='<div class="lbseg" role="group" aria-label="單品來源"><button type="button" class="'+(it.mode==='shop'?'on':'')+'" data-a="lbmode" data-n="'+i+'" data-m="shop">商店商品</button><button type="button" class="'+(it.mode==='manual'?'on':'')+'" data-a="lbmode" data-n="'+i+'" data-m="manual">手動輸入</button></div>';
  var f=it.mode==='shop'?'<label class="fld"><span>連到哪個商品 <i>*</i></span><select data-i="lbpid" data-n="'+i+'"><option value="">— 請選一個商品 —</option>'+P.map(function(p){return '<option value="'+h(p.id)+'"'+(p.id===it.pid?' selected':'')+'>'+h(p.name)+'（'+TX.money(TX.price(p))+(p.status!=='on'?'・已下架':'')+'）</option>'}).join('')+'</select>'+(pr&&pr.linked?'<small>名稱、價格、庫存會跟著商品走：'+h(pr.name)+'・'+TX.money(pr.price)+(pr.from?' 起':'')+'・庫存 '+pr.stock+' 件</small>':'<small>連到商品後，顧客可以直接加入購物車。</small>')+'</label>':
    '<div class="row2"><label class="fld"><span>單品名稱 <i>*</i></span><input data-i="lbf" data-n="'+i+'" data-f="name" value="'+h(it.name)+'" maxlength="40"></label><label class="fld"><span>價格（NT$）<i>*</i></span><input data-i="lbf" data-n="'+i+'" data-f="price" inputmode="numeric" value="'+h(it.price)+'"></label></div><small class="lbsm">手動輸入的單品只顯示名稱和價格，還不能加入購物車。</small>';
  var pin=(it.x!=null&&it.x!=='')?'熱點在 '+(+it.x).toFixed(0)+'%、'+(+it.y).toFixed(0)+'%':'還沒標熱點';
  return '<div class="lbit'+(E._act===i?' on':'')+'" data-n="'+i+'"><div class="hd"><span class="nm">'+(i+1)+'</span>'+seg+'<span class="pn">'+pin+'</span></div>'+f+'<label class="fld"><span>備註（選填，例如：可選顏色）</span><input data-i="lbf" data-n="'+i+'" data-f="note" value="'+h(it.note||'')+'" maxlength="40"></label><div class="acts"><button class="act'+(E._act===i?'':' g')+'" type="button" data-a="lbpinsel" data-n="'+i+'">'+(E._act===i?'請點左邊照片放熱點':'標示熱點')+'</button><button class="act g" type="button" data-a="lbpinclr" data-n="'+i+'"'+((it.x==null||it.x==='')?' disabled':'')+'>清除熱點</button><button class="act d" type="button" data-a="lbitdel" data-n="'+i+'">刪除單品</button></div></div>'}
A.route(/^\/shop\/lookbook\/edit\/([^/]+)$/,'shop',function(m){var id=decodeURIComponent(m[1]),E=draftOf(id);
  if(!E){return A.page('shop','找不到這套穿搭','網店','','<div class="empty"><b>這套穿搭不見了</b><a class="btn sm" href="#/shop/lookbook" style="margin-top:14px">回穿搭列表</a></div>','/shop/lookbook')}
  var pick=LB.IMGS.map(function(src,i){return '<button type="button" class="lbpick'+(E.img===src?' on':'')+'" data-a="lbimg" data-src="'+h(src)+'" aria-label="模特兒照片 '+(i+1)+'" aria-pressed="'+(E.img===src)+'"><img src="'+h(src)+'" alt="" loading="lazy"></button>'}).join('');
  var left='<div class="panel lbleft"><h2><span class="l"><em>1</em>模特兒照片與熱點</span></h2><p class="hint">'+(E._act>=0&&E.items[E._act]?'現在要放第 '+(E._act+1)+' 件的熱點：直接點照片上的位置。熱點可以拖曳微調。':'先在右邊選一件單品，按「標示熱點」，再點照片。')+'</p>'+stageHtml(E)+'<div class="fld" style="margin-top:12px"><span>換一張模特兒照片（這是提供的 6 張）</span><div class="lbpicks">'+pick+'</div></div></div>';
  var right='<div class="panel"><h2><span class="l"><em>2</em>穿搭資料</span></h2><div class="row2"><label class="fld"><span>穿搭名稱 <i>*</i></span><input data-i="lbh" data-f="title" value="'+h(E.title)+'" maxlength="30" placeholder="例如：日系駝色長大衣穿搭"></label><label class="fld"><span>副標題（選填）</span><input data-i="lbh" data-f="sub" value="'+h(E.sub||'')+'" maxlength="24" placeholder="例如：LOOK 07"></label></div></div>'+
   '<div class="panel"><h2><span class="l"><em>3</em>推薦單品</span><button class="act" type="button" data-a="lbitadd">＋ 新增單品</button></h2>'+E.items.map(function(it,i){return itemCard(E,it,i)}).join('')+(E.items.length?'':'<div class="empty"><b>還沒有單品</b>按「＋ 新增單品」。</div>')+'</div>'+
   '<div class="lbsave"><a class="btn w sm" href="#/shop/lookbook" data-a="lbcancel">取消</a><button class="btn sm" type="button" data-a="lbsave">儲存這套穿搭</button></div><div id="lberr"></div>';
  return {html:A.page('shop',E._new?'新增穿搭':'編輯穿搭','網店',(E._new?'':'<button class="btn sm w" type="button" data-a="lbprev">在商店頁面看</button>'),'<div class="lbed"><div>'+left+'</div><div>'+right+'</div></div>','/shop/lookbook'),mount:function(root){bindPins(root)}}});
A.act.lbcancel=function(){ui.draft=null};
A.act.lbprev=function(){var E=ui.draft;if(E&&!E._new)C.go?C.go('shop.html#/lookbook'):location.href='shop.html#/lookbook'};
A.act.lbimg=function(t){var E=ui.draft;if(!E)return;E.img=t.dataset.src;A.refresh()};
A.act.lbmode=function(t){var E=ui.draft,it=E&&E.items[+t.dataset.n];if(!it)return;it.mode=t.dataset.m;A.refresh()};
A.act.lbpinsel=function(t){var E=ui.draft;if(!E||ui.skipClick)return;var n=+t.dataset.n;E._act=E._act===n&&t.classList.contains('act')?-1:n;A.refresh()};
A.act.lbpinclr=function(t){var E=ui.draft,it=E&&E.items[+t.dataset.n];if(!it)return;it.x=null;it.y=null;A.refresh()};
A.act.lbitadd=function(){var E=ui.draft;if(!E)return;E.items.push(mkItem());E._act=E.items.length-1;A.refresh()};
A.act.lbitdel=function(t){var E=ui.draft;if(!E)return;E.items.splice(+t.dataset.n,1);E._act=Math.min(E._act,E.items.length-1);A.refresh()};
A.act.lbplace=function(t,e){var E=ui.draft;if(!E||E._act<0||!E.items[E._act]||e.target.closest('.lbpin'))return;var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;
  var it=E.items[E._act];it.x=Math.max(2,Math.min(98,Math.round(x*10)/10));it.y=Math.max(2,Math.min(98,Math.round(y*10)/10));
  var next=E.items.findIndex(function(z,k){return k>E._act&&(z.x==null||z.x==='')});E._act=next>-1?next:E._act;A.refresh()};
A.inp.lbh=function(t){var E=ui.draft;if(E)E[t.dataset.f]=t.value};
A.inp.lbf=function(t){var E=ui.draft,it=E&&E.items[+t.dataset.n];if(it)it[t.dataset.f]=t.value};
A.inp.lbpid=function(t,e,ev){var E=ui.draft,it=E&&E.items[+t.dataset.n];if(!it||ev!=='change')return;it.pid=t.value;it.img='';var p=TX.product(it.pid);if(p){it.name=p.name;it.price=TX.price(p)}A.refresh()};
/* 熱點拖曳（在照片上直接拖，放開就存進草稿） */
function bindPins(root){var box=$('.lbbox',root);if(!box)return;var drag=null;
  box.addEventListener('pointerdown',function(e){var p=e.target.closest('.lbpin');if(!p)return;drag={el:p,n:+p.dataset.n,moved:false};try{p.setPointerCapture(e.pointerId)}catch(err){}});
  box.addEventListener('pointermove',function(e){if(!drag)return;var r=box.getBoundingClientRect(),x=Math.max(2,Math.min(98,(e.clientX-r.left)/r.width*100)),y=Math.max(2,Math.min(98,(e.clientY-r.top)/r.height*100));drag.moved=true;drag.el.style.left=x+'%';drag.el.style.top=y+'%';drag.x=x;drag.y=y});
  var end=function(){if(!drag)return;var d=drag;drag=null;if(d.moved&&d.x!=null){var it=ui.draft&&ui.draft.items[d.n];if(it){it.x=Math.round(d.x*10)/10;it.y=Math.round(d.y*10)/10;ui.draft._act=d.n;ui.skipClick=true;setTimeout(function(){ui.skipClick=false},50);A.refresh()}}};
  box.addEventListener('pointerup',end);box.addEventListener('pointercancel',end)}
A.act.lbsave=function(t){var E=ui.draft;if(!E)return;var er=[];
  if(!E.title.trim())er.push('請填穿搭名稱');
  if(!E.items.length)er.push('至少要有一件單品');
  E.items.forEach(function(it,i){if(it.mode==='shop'){if(!it.pid)er.push('第 '+(i+1)+' 件：請選一個商品，或改成「手動輸入」')}else{if(!String(it.name).trim())er.push('第 '+(i+1)+' 件：請填單品名稱');if(it.price===''||isNaN(+it.price)||+it.price<0)er.push('第 '+(i+1)+' 件：價格要填數字')}});
  if(E._new&&!LB.canCreate())er.push(LB.MSG.locked_new);
  var box=$('#lberr');if(er.length){box.innerHTML='<div class="errs" role="alert"><ul>'+er.map(function(x){return '<li>'+h(x)+'</li>'}).join('')+'</ul></div>';box.scrollIntoView({behavior:C.RM?'auto':'smooth',block:'center'});return}
  var lb=LB.get(),out={id:E._new?TX.uid('lk'):E.id,title:E.title.trim(),sub:E.sub.trim(),img:E.img,hide:!!E.hide,demo:E._new?0:(LB.look(E.id)||{}).demo?1:0,key:(LB.look(E.id)||{}).key,
    items:E.items.map(function(it){var o={id:it.id,pid:it.mode==='shop'?it.pid:'',name:it.mode==='shop'?'':String(it.name).trim(),price:it.mode==='shop'?'':+it.price,img:it.mode==='shop'?(it.img||''):'',x:(it.x==null||it.x==='')?null:+it.x,y:(it.y==null||it.y==='')?null:+it.y,note:String(it.note||'').trim()};
      if(it.mode==='shop'){var p=TX.product(it.pid);if(p){o.name=p.name;o.price=TX.price(p)}}return o})};
  if(!out.key)delete out.key;
  if(E._new)lb.looks.push(out);else{var i=lb.looks.findIndex(function(l){return l.id===E.id});if(i>-1)lb.looks[i]=out}
  if(E._new&&TX.D().menu.indexOf('穿搭輪盤')<0&&lb.looks.length===1){TX.D().menu.push('穿搭輪盤');lb.menu=1}
  TX.save();ui.draft=null;A.confetti(t,40);U.toast('已儲存「'+out.title+'」','商店頁面的穿搭輪盤馬上就會更新');location.hash='/shop/lookbook'};
/* ================= 設定 ================= */
A.route(/^\/shop\/lookbook\/settings$/,'shop',function(){var lb=LB.get(),s=lb.set,cur=String(s.accent||'#4B2E22');
  var sw='<div class="swatches" role="group" aria-label="主題色">'+SWC.map(function(c){return '<button type="button" data-a="lbacc" data-c="'+c[0]+'" style="background:'+c[0]+'" class="'+(cur.toLowerCase()===c[0].toLowerCase()?'on':'')+'" aria-label="'+c[1]+'" title="'+c[1]+'"></button>'}).join('')+'<input type="color" value="'+h(cur)+'" data-i="lbacc" aria-label="自選顏色"></div>';
  var tg=function(k,label,sub){return '<div class="sw-row"><div>'+label+'<small>'+sub+'</small></div>'+U.tg(!!+s[k],'data-a="lbtg" data-k="'+k+'" aria-label="'+h(label)+'"')+'</div>'};
  var body=plug('set')+'<div class="grid2 o"><div><div class="panel"><h2>外觀</h2><div class="fld"><span>主題色（熱點、分頁、按鈕）</span>'+sw+'</div><label class="fld"><span>前台區塊標題</span><input data-i="lbset" data-k="title" value="'+h(s.title)+'" maxlength="24"></label><label class="fld"><span>前台區塊說明</span><input data-i="lbset" data-k="sub" value="'+h(s.sub)+'" maxlength="40"></label><label class="fld"><span>右側面板小標題</span><input data-i="lbset" data-k="eyebrow" value="'+h(s.eyebrow)+'" maxlength="30"></label><label class="fld"><span>右側面板底部提醒文字</span><input data-i="lbset" data-k="note" value="'+h(s.note)+'" maxlength="60"></label></div>'+
   '<div class="panel"><h2>輪盤</h2><label class="fld"><span>前台一次顯示幾套</span><select data-i="lbset" data-k="show">'+[2,3,4,5,6,8,10].map(function(n){return '<option value="'+n+'"'+(+s.show===n?' selected':'')+'>'+n+' 套</option>'}).join('')+'</select><small>你有 '+lb.looks.length+' 套穿搭；超過的部分前台不會顯示。</small></label><label class="fld"><span>模特兒間距：<b id="lbspv">'+(+s.spacing).toFixed(1)+'</b></span><input type="range" min="0.9" max="1.8" step="0.1" value="'+(+s.spacing)+'" data-i="lbset" data-k="spacing"><small>數字越大，模特兒之間離得越開。</small></label>'+tg('autoplay','自動輪播','開啟後每隔幾秒自動換下一套；顧客拖曳或打開面板時會暫停')+
   '<label class="fld" style="margin-top:12px"><span>自動輪播間隔</span><select data-i="lbset" data-k="interval">'+[[3000,'3 秒'],[4400,'4.4 秒（預設）'],[6000,'6 秒']].map(function(n){return '<option value="'+n[0]+'"'+(+s.interval===n[0]?' selected':'')+'>'+n[1]+'</option>'}).join('')+'</select></label>'+tg('price','顯示價格','關掉後，右側面板只顯示單品名稱')+'</div>'+
   '<div class="acts"><button class="btn sm w" type="button" data-a="lbsetreset">還原預設設定</button><a class="btn sm pk" data-go="shop.html#/lookbook">到商店頁面看效果</a></div></div>'+
   '<div id="lbpv">'+preview()+'</div></div>';
  return {html:A.page('shop','模特兒穿搭輪盤','網店','',body,'/shop/lookbook')}});
function ink(hex){hex=String(hex||'').replace('#','');if(hex.length===3)hex=hex.replace(/(.)/g,'$1$1');var n=parseInt(hex,16)||0,r=n>>16&255,g=n>>8&255,b=n&255;return (r*299+g*587+b*114)/1000>150?'#4B2E22':'#FFFFFF'}
function preview(){var s=LB.get().set,a=s.accent||'#4B2E22',look=LB.visible()[0],img=look?look.img:LB.IMGS[0];
  return '<div class="panel lbprev" style="--pa:'+h(a)+';--pi:'+ink(a)+'"><h2>前台預覽</h2><div class="pv"><div class="ph"><img src="'+h(img)+'" alt=""><i class="pn1">1</i><i class="pn2 on">2</i></div><div class="pt"><small>'+h(s.eyebrow)+'</small><b>'+h(look?look.title:'日系駝色長大衣穿搭')+'</b><p>'+(+s.price?'NT$ 6,980':'（價格已隱藏）')+'</p><span class="pb">加入購物車</span><span class="tabs"><i class="on">01</i><i>02</i><i>03</i></span></div></div><p class="hint" style="margin:12px 0 0">改了立刻存檔，打開商店頁面就能看到。</p></div>'}
function setSave(){TX.save();var p=$('#lbpv');if(p)p.innerHTML=preview()}
A.inp.lbset=function(t,e,ev){var s=LB.get().set,k=t.dataset.k,v=t.value;if(k==='show'||k==='interval'){if(ev!=='change')return;s[k]=+v}else if(k==='spacing'){s[k]=+v;var sp=$('#lbspv');if(sp)sp.textContent=(+v).toFixed(1)}else s[k]=v;setSave()};
A.act.lbacc=function(t){var s=LB.get().set;s.accent=t.dataset.c;TX.save();A.confetti(t,24);A.refresh()};
A.inp.lbacc=function(t,e,ev){var s=LB.get().set;s.accent=t.value;setSave();if(ev==='change')A.refresh()};
A.act.lbtg=function(t){var s=LB.get().set,k=t.dataset.k;s[k]=+s[k]?0:1;TX.save();A.refresh()};
A.act.lbsetreset=function(){var lb=LB.get();lb.set=LB.defaults().set;TX.save();U.toast('已還原預設設定');A.refresh()};
/* ================= 授權與更新（示範：不會連線，用三組示範碼體驗三種狀態） ================= */
A.route(/^\/shop\/lookbook\/license$/,'shop',function(){var lb=LB.get(),l=lb.lic,st=l.state,L=LICL[st]||LICL.none,dl=st==='active'?days(l.exp):0;
  var sts='<div class="panel"><h2>授權狀態 '+licChip()+'</h2><table class="lbkv"><tr><th>狀態</th><td><b class="lc-'+st+'">'+L[0]+'</b></td></tr>'+(st==='none'?'':'<tr><th>授權碼</th><td><code>'+h(LB.mask(l.key))+'</code></td></tr><tr><th>啟用網站</th><td>'+h(l.site||LB.host())+'</td></tr><tr><th>到期日</th><td>'+h(l.exp)+(st==='active'?'（還有 '+dl+' 天）':'（已過期）')+'</td></tr>')+'<tr><th>上次檢查</th><td>'+TX.fmt(l.last||Date.now())+'</td></tr></table>'+
    '<div class="acts" style="margin-top:14px">'+(st==='none'?'':'<button class="btn sm w" type="button" data-a="lbcheck">立即檢查授權與更新</button><button class="btn sm w" type="button" data-a="lbdeact">停用此網站</button>')+'</div></div>';
  var act=st==='active'?'':'<div class="panel"><h2>啟用授權</h2><label class="fld"><span>授權碼</span><input id="lbcode" value="'+h(ui.cc)+'" placeholder="MLB-XXXX-XXXX-XXXX-XXXX" data-i="lbcc" autocomplete="off"></label><div id="lbmsg"></div><button class="btn sm" type="button" data-a="lbact">啟用</button><p class="hint" style="margin:12px 0 6px">授權碼會在購買後由廠商提供。一組授權碼限用於 1 個網站。</p><div class="chips2 lbcodes"><span class="lbtt">示範用，點一下帶入：</span><button type="button" data-a="lbfill" data-c="'+LB.DEMO_KEYS.ok+'">有效的碼</button><button type="button" data-a="lbfill" data-c="'+LB.DEMO_KEYS.expired+'">已到期的碼</button><button type="button" data-a="lbfill" data-c="'+LB.DEMO_KEYS.used+'">已在別的網站用過的碼</button></div></div>';
  var upd='<div class="panel"><h2>外掛版本</h2><p class="lbver">目前版本 <b>v'+h(lb.ver)+'</b>'+(LB.hasUpdate()?' → 有新版本 <b>v'+h(lb.newVer)+'</b>':st==='active'?'・已是最新版本':'')+'</p>'+(LB.hasUpdate()?'<ul class="lbcl">'+LB.CHANGELOG.map(function(x){return '<li>'+h(x)+'</li>'}).join('')+'</ul><button class="btn sm" type="button" data-a="lbupdate">立即更新到 v'+h(lb.newVer)+'</button>':st==='active'?'<p class="hint" style="margin:0">授權有效，之後有新版本，後台會在這裡和外掛頁面提醒你。</p>':'<p class="hint" style="margin:0">授權有效時才會收到外掛更新提醒。</p>')+'</div>';
  var demo='<div class="panel lbdemo"><h2>示範用：快速切換狀態</h2><p class="hint">正式版沒有這個按鈕；這裡讓你直接看三種狀態長什麼樣子。</p><div class="chips2">'+[['active','有效'],['expired','已到期'],['none','未啟用']].map(function(x){return '<button type="button" class="'+(st===x[0]?'on':'')+'" data-a="lbstate" data-s="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div></div>';
  var rule='<div class="panel"><h2>未授權或到期時</h2><ul class="lbcl"><li>前台的穿搭輪盤照常顯示，加入購物車照常運作。</li><li>已建立的穿搭仍可編輯與刪除。</li><li>無法新增穿搭、無法匯入示範資料、不會收到外掛更新，後台會顯示提醒。</li></ul></div>';
  return {html:A.page('shop','模特兒穿搭輪盤','網店','',plug('lic')+'<div class="grid2 o"><div>'+sts+act+upd+'</div><div>'+demo+rule+'</div></div>','/shop/lookbook')}});
A.inp.lbcc=function(t){ui.cc=t.value};
A.act.lbfill=function(t){ui.cc=t.dataset.c;var i=$('#lbcode');if(i){i.value=ui.cc;i.focus()}};
A.act.lbact=function(t){var r=LB.activate(($('#lbcode')||{}).value);var box=$('#lbmsg');
  if(!r.ok){box.innerHTML='<div class="errs" role="alert"><ul><li>'+h(r.msg)+'</li></ul></div>';return}
  ui.cc='';A.confetti(t,60);U.toast(r.msg);A.refresh()};
A.act.lbdeact=function(){U.confirm('停用此網站的授權？','停用後可以在別的網站重新啟用同一組授權碼。前台輪盤仍會照常顯示。',function(){LB.deactivate();U.toast('已停用此網站的授權','名額已釋放');A.refresh()},'停用')};
A.act.lbcheck=function(){var lb=LB.get();lb.lic.last=Date.now();TX.save();U.toast(LB.hasUpdate()?'授權有效，並且有新版本可更新！':'授權有效，目前已是最新版本。');A.refresh()};
A.act.lbstate=function(t){LB.setState(t.dataset.s);U.toast('已切換成「授權'+LICL[t.dataset.s][0]+'」');A.refresh()};
})();
