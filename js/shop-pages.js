/* 商店頁面各頁：首頁、商品列表、商品頁、購物車、結帳、訂單完成、會員／訂單查詢、說明頁 */
(function(){
'use strict';
var C=window.CUTE,TX=window.TX,U=window.TXUI,SH=window.SHOP,$=C.$,$$=C.$$,h=TX.esc,RM=C.RM,D=SH.D;
var LABEL={'待處理':['店家準備中','p1'],'已處理':['已處理，準備出貨','p2'],'運送中':['運送中','p3'],'已到店待取貨':['已到店，請去取貨','p4'],'已完成':['已完成','p5'],'等待付款':['等待付款','p1'],'已取消':['已取消','p0'],'退貨退款':['已退貨退款','p0'],'未取件退回':['未取件退回','p0']};
function lab(o){if(o.ret&&o.ret.status==='申請中')return ['退貨申請中','p2'];return LABEL[o.status]||[o.status,'p0']}
function cmem(){var m=TX.member();return m?TX.customerByPhone(m.phone):null}
function applyBadge(){SH.badge()}
/* ======================= 首頁 ======================= */
function heroImg(i,ps){var d=D(),hs=d.hero||[],x=hs.length?hs[i%hs.length]:null;if(x&&x.img)return x.img;if(x&&x.art)return TX.artSrc(x.art.k,x.art.c);return ps[0]?TX.pimg(ps[0]):''}
SH.route('home',/^\/?$/,function(){var d=D(),ps=TX.shopProducts(),onSale=ps.filter(function(p){return TX.priceRange(p).sale}),s=d.settings;
  var sl=d.slides.length?d.slides:[{title:d.name,sub:d.slogan,link:'/products'}];
  var slides=sl.map(function(x,i){return '<div class="slide'+(i?'':' on')+'" data-i="'+i+'"><div class="tx"><span class="kick">'+h(d.slogan||d.name)+'</span><h1>'+h(x.title)+'</h1><p class="sub">'+h(x.sub)+'</p><div class="go"><a class="btn lg" href="'+SH.slideLink(x.link)+'" data-cur="GO">立即選購</a><a class="btn w lg" href="#/list?sale=1">看特價</a></div></div><div class="pic"><i class="blob"></i><i class="blob b2"></i><i class="blob b3"></i><div class="ph"><img src="'+h(heroImg(i,ps))+'" alt="" '+(i?'loading="lazy"':'')+'></div><div class="stk"><span><b>'+onSale.length+'</b>項特價</span></div></div></div>'}).join('');
  var hero='<section class="hero" id="hero" aria-roledescription="輪播">'+slides+(sl.length>1?'<div class="dots" role="group" aria-label="切換橫幅">'+sl.map(function(x,i){return '<button type="button" data-a="hs" data-i="'+i+'" class="'+(i?'':'on')+'" aria-label="第 '+(i+1)+' 張"></button>'}).join('')+'</div><div class="arr"><button type="button" data-a="hprev" aria-label="上一張">‹</button><button type="button" data-a="hnext" aria-label="下一張">›</button></div>':'')+SH.ham('lili','','mascot')+'</section>';
  var perks='<section class="perks rvl"><div class="perk"><i style="--c:#D3F5E7">運</i><div>滿 '+TX.money(s.freeOver)+' 免運<small>未滿：宅配 '+TX.money(s.homeFee)+'・超商 '+TX.money(s.cvsFee)+'</small></div></div><div class="perk"><i style="--c:#FFDDE6">刷</i><div>信用卡不加收手續費<small>依綠界規範，金額大小都能刷</small></div></div><div class="perk"><i style="--c:#FFEFC0">退</i><div>7 天內可申請退換貨<small>收到商品後，到「訂單查詢」申請</small></div></div><div class="perk"><i style="--c:#D9EEFF">問</i><div>有問題，問客服<small>'+h(d.store.email)+'</small></div></div></section>';
  var lbx=SH.lookbookHtml?SH.lookbookHtml({}):'';var lbsec=lbx?'<section class="lb-sec" id="lookbook">'+SH.lookbookHead(false)+lbx+'</section>':'';
  var cats='<section><div class="sec-h rvl"><h2 class="sec-t">逛逛分類</h2></div><div class="cats">'+d.cats.filter(function(c){return ps.some(function(p){return p.cat===c})}).map(function(c,i){var l=ps.filter(function(p){return p.cat===c}),p=l[0];return '<a class="cat rvl" style="--c:'+SH.CANDY[i%6]+'" href="#/list?cat='+encodeURIComponent(c)+'" data-cur="逛"><div class="im">'+(p?'<img src="'+h(TX.pimg(p))+'" alt="" loading="lazy">':'')+'</div><b>'+h(c)+'</b><small>'+l.length+' 樣商品</small></a>'}).join('')+'</div></section>';
  var hotL=ps.slice().sort(function(a,b){return b.sold30-a.sold30}).filter(function(p){return !TX.soldOut(p)}).slice(0,4);
  var hot=hotL.length?'<section><div class="sec-h rvl"><h2 class="sec-t">熱賣商品<small>近 30 天賣最好</small></h2><a class="more" href="#/list">看全部 ›</a></div>'+SH.grid(hotL)+'</section>':'';
  var camps=d.campaigns.filter(function(c){return c.active}),cps=d.coupons.filter(function(c){return c.active&&(!c.end||c.end>=TX.todayStr())});
  var rib=(camps.length||cps.length)?'<section class="ribbon rvl"><h3>現在有這些優惠</h3><div class="chips">'+camps.map(function(c){return '<span>'+h(c.name)+'</span>'}).join('')+cps.map(function(c){return '<span>'+(c.type==='percent'?'打 '+(100-c.value)+' 折':'折 '+TX.money(c.value))+'・滿 '+TX.money(c.min)+'<b>'+h(c.code)+'</b></span>'}).join('')+'</div></section>':'';
  var nw=ps.slice(0,4);
  var neu=nw.length?'<section><div class="sec-h rvl"><h2 class="sec-t">新上架<small>後台新增的商品會先出現在這裡</small></h2></div>'+SH.grid(nw)+'</section>':'';
  var sale=onSale.slice(0,4);
  var sec3=sale.length?'<section><div class="sec-h rvl"><h2 class="sec-t">特價中</h2><a class="more" href="#/list?sale=1">全部特價 ›</a></div>'+SH.grid(sale)+'</section>':'';
  var ab=d.pages.filter(function(p){return p.slug==='about'&&p.status==='發布'})[0];
  var about='<section class="about rvl"><div><h2>'+h(ab?ab.title:'關於我們')+'</h2><p>'+h(ab?ab.body:d.slogan)+'</p><a class="btn w" href="#/page/'+(ab?'about':'contact')+'">多認識我們</a></div>'+SH.ham('tiaotiao','','')+'</section>';
  return {html:hero+perks+lbsec+cats+hot+rib+neu+sec3+about,drop:'.hero .kick,.hero h1,.hero .sub,.hero .go,.hero .ph',admin:'app.html#/shop',mount:function(root){
    if(SH.lookbookMount)SH.lookbookMount(root,!(SH.cur&&SH.cur.name==='home'));
    var n=sl.length,i=0,hs=SH.ui.hs=SH.ui.hs||{};clearInterval(hs.t);
    hs.go=function(k){var el=$('#hero');if(!el)return;k=(k+n)%n;if(k===i&&arguments[1]!==true)return;var old=$('.slide.on',el),nw=$('.slide[data-i="'+k+'"]',el);if(!nw)return;i=k;old.classList.remove('on');nw.classList.add('on');$$('.dots button',el).forEach(function(b,j){b.classList.toggle('on',j===k)});
      if(!RM){gsap.from($$('.kick,h1,.sub,.go',nw),{y:-120,opacity:0,duration:.9,ease:'bounce.out',stagger:.09,clearProps:'transform,opacity'});gsap.from($('.ph',nw),{y:-200,rotation:-14,opacity:0,duration:1,ease:'bounce.out',clearProps:'transform,opacity'});gsap.from($('.stk',nw),{scale:0,duration:.8,delay:.5,ease:'elastic.out(1,.4)',clearProps:'transform'})}};
    hs.next=function(){hs.go(i+1)};hs.prev=function(){hs.go(i-1)};
    if(n>1&&!RM)hs.t=setInterval(function(){if(document.hidden||!$('#hero'))return clearInterval(hs.t);hs.next()},6500)}}});
SH.act.hs=function(t){SH.ui.hs.go(+t.dataset.i)};SH.act.hnext=function(){SH.ui.hs.next()};SH.act.hprev=function(){SH.ui.hs.prev()};
/* ======================= 商品列表 ======================= */
function bands(ps){var pr=ps.map(function(p){return TX.priceRange(p).lo}).sort(function(a,b){return a-b});if(!pr.length)return [];var r=function(x){return Math.max(10,Math.round(x/10)*10)},a=r(pr[Math.floor(pr.length/3)]),b=r(pr[Math.floor(pr.length*2/3)]);if(b<=a)b=a+10;return [[0,a,'NT$ '+a+' 以下'],[a,b,'NT$ '+a+'–'+b],[b,1e9,'NT$ '+b+' 以上']]}
SH.route('list',/^\/list$/,function(m,H){var d=D(),all=TX.shopProducts(),q=H.q,cat=q.get('cat')||'',kw=(q.get('q')||'').trim(),sort=q.get('sort')||'hot',sale=q.get('sale')==='1',stock=q.get('stock')==='1',pb=q.get('price'),bd=bands(all);
  var list=all.filter(function(p){var r=TX.priceRange(p);
    if(cat&&p.cat!==cat)return false;if(kw&&(p.name+p.cat+(p.desc||'')).toLowerCase().indexOf(kw.toLowerCase())<0)return false;
    if(sale&&!r.sale)return false;if(stock&&TX.soldOut(p))return false;
    if(pb!=null&&pb!==''&&bd[+pb]&&!(r.lo>=bd[+pb][0]&&r.lo<bd[+pb][1]))return false;return true});
  var idx=function(p){return all.indexOf(p)};
  list.sort(function(a,b){return sort==='price-asc'?TX.priceRange(a).lo-TX.priceRange(b).lo:sort==='price-desc'?TX.priceRange(b).lo-TX.priceRange(a).lo:sort==='new'?idx(a)-idx(b):b.sold30-a.sold30});
  var P=function(over){var o={cat:cat,q:kw,sort:sort==='hot'?'':sort,sale:sale?'1':'',stock:stock?'1':'',price:pb};Object.keys(over).forEach(function(k){o[k]=over[k]});return SH.href('/list',o)};
  var fb='<div class="fbox'+(SH.ui.fopen?' open':'')+'" id="fbox"><h3>分類</h3><div class="fchips"><a class="fchip'+(cat?'':' on')+'" href="'+P({cat:''})+'">全部<i>'+all.length+'</i></a>'+d.cats.filter(function(c){return cat===c||all.some(function(p){return p.cat===c})}).map(function(c){return '<a class="fchip'+(cat===c?' on':'')+'" href="'+P({cat:c})+'">'+h(c)+'<i>'+all.filter(function(p){return p.cat===c}).length+'</i></a>'}).join('')+'</div><h3>價格</h3><div class="fchips"><a class="fchip'+((pb==null||pb==='')?' on':'')+'" href="'+P({price:''})+'">不限</a>'+bd.map(function(b,i){return '<a class="fchip'+(pb===String(i)?' on':'')+'" href="'+P({price:i})+'">'+b[2]+'</a>'}).join('')+'</div><h3>其他</h3><a class="frow'+(sale?' on':'')+'" href="'+P({sale:sale?'':'1'})+'"><span class="sw"></span>只看特價</a><a class="frow'+(stock?' on':'')+'" href="'+P({stock:stock?'':'1'})+'"><span class="sw"></span>只看有現貨</a></div>';
  var title=cat||(kw?'搜尋「'+kw+'」':sale?'特價商品':'全部商品');
  var body='<div class="lres">'+(list.length?SH.grid(list):SH.empty('沒有符合的商品','換個條件看看，或把篩選清掉。','<a class="btn" href="#/list">清除全部條件</a>'))+'</div>';
  var sel='<select data-a="sort" aria-label="排序">'+[['hot','熱賣優先'],['new','最新上架'],['price-asc','價格：低到高'],['price-desc','價格：高到低']].map(function(o){return '<option value="'+o[0]+'"'+(sort===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>';
  return {html:SH.crumbs([[title]])+'<div class="lhead rvl"><div><h1 class="pgt">'+h(title)+'</h1><p>共 '+list.length+' 樣商品</p></div><div class="lsort"><button class="btn w sm fbtn" type="button" data-a="ftog">篩選條件</button>'+sel+'</div></div><div class="llay">'+fb+body+'</div>',admin:'app.html#/products'}});
SH.act.ftog=function(){SH.ui.fopen=!SH.ui.fopen;var f=$('#fbox');if(f)f.classList.toggle('open',SH.ui.fopen)};
SH.act.sort=function(t){var H=SH.hash(),o={};H.q.forEach(function(v,k){o[k]=v});o.sort=t.value==='hot'?'':t.value;location.hash=SH.href('/list',o)};
/* ======================= 商品頁 ======================= */
var PD={st:null};
function specsOf(p){var s=p.specs||{},g=[];['s1','s2'].forEach(function(k){if(s[k]&&s[k].opts&&s[k].opts.length)g.push({name:s[k].name,opts:s[k].opts.map(function(o){return typeof o==='string'?o:o.v})})});if(!g.length&&TX.vkeys(p).length)g.push({name:'規格',opts:TX.vkeys(p)});return g}
function keyOf(g,a,b){return g.length>1?a+'|'+b:(g.length?a:'')}
function avail(p,g,a,b){var v=p.variants[keyOf(g,a,b)];return !!v&&v.on!==false&&(+v.stock||0)>0}
function defaults(p,st,g){if(!g.length){st.a=st.b='';return}
  var A=g[0].opts,B=g[1]?g[1].opts:[''];
  if(st.a&&A.indexOf(st.a)>-1&&(!g[1]||B.indexOf(st.b)>-1)&&p.variants[keyOf(g,st.a,st.b)])return;
  for(var i=0;i<A.length;i++)for(var j=0;j<B.length;j++)if(avail(p,g,A[i],B[j])){st.a=A[i];st.b=B[j];return}
  st.a=A[0];st.b=B[0]||''}
var CROPS=[['1','50% 50%'],['1.8','12% 14%'],['1.8','88% 86%']];
function pdpInner(p){var st=PD.st,d=D(),g=specsOf(p),hasV=g.length>0,vk=hasV?keyOf(g,st.a,st.b):'',stk=hasV?TX.vstock(p,vk):(+p.stock||0),max=hasV?TX.maxQty(p,vk):TX.maxQty(p,''),rt=SH.rating(p.id);
  if(st.qty>max)st.qty=Math.max(1,max);if(st.qty<1)st.qty=1;
  var pr=hasV?TX.vprice(p,vk):TX.price(p),or=hasV?TX.vorig(p,vk):+p.price,img=TX.pimg(p,vk);
  var crop=CROPS[st.img]||null,mainStyle=crop?'--z:'+crop[0]+';--o:'+crop[1]:'';
  var main=st.img===3?'<div class="main" style="display:grid;place-items:center;background:var(--acc-soft)"><div data-ham="xiaosha" style="width:68%"></div></div>':'<div class="main"><img src="'+h(img)+'" alt="'+h(p.name)+'" style="'+(crop?'transform:scale('+crop[0]+');transform-origin:'+crop[1]:'')+'"></div>';
  var th='<div class="th" role="group" aria-label="商品圖片">'+[0,1,2,3].map(function(i){var c=CROPS[i];return '<button type="button" class="'+(st.img===i?'on':'')+'" data-a="pimg" data-i="'+i+'" aria-label="第 '+(i+1)+' 張圖">'+(i===3?'<div style="width:100%;height:100%;display:grid;place-items:center;background:var(--acc-soft);font-weight:900;font-size:12px">包裝示意</div>':'<img src="'+h(img)+'" alt="" style="transform:scale('+c[0]+');transform-origin:'+c[1]+'">')+'</button>'}).join('')+'</div>';
  var opts=g.map(function(grp,gi){var cur=gi?st.b:st.a;return '<div class="opt"><h4>'+h(grp.name)+'<span>'+h(TX.vlabel(cur)||'請選擇')+'</span></h4><div class="ochips" role="group" aria-label="'+h(grp.name)+'">'+grp.opts.map(function(o){
      var ok=gi===0?(g[1]?g[1].opts.some(function(b2){return avail(p,g,o,b2)}):avail(p,g,o,'')):avail(p,g,st.a,o),v=gi===0&&!g[1]?p.variants[o]:null,np=(gi===0&&!g[1]&&v&&TX.vprice(p,o)!==pr)?'<small>'+TX.money(TX.vprice(p,o))+'</small>':'';
      return '<button type="button" class="och'+(o===cur?' on':'')+'" data-a="opt" data-g="'+gi+'" data-v="'+h(o)+'"'+(ok?'':' disabled')+' aria-pressed="'+(o===cur)+'">'+h(o)+(ok?np:'<small>缺貨</small>')+'</button>'}).join('')+'</div></div>'}).join('');
  var low=stk>0&&stk<=TX.lowLimit();
  var stl='<div class="stockline '+(stk<=0?'out':low?'low':'')+'"><i></i>'+(stk<=0?'這個款式暫時缺貨':low?'只剩 '+stk+' 件，要買要快':'有現貨・尚有 '+stk+' 件')+(+p.maxBuy>0?'　每人限購 '+p.maxBuy+' 件':'')+'</div>';
  var s=d.settings,rt2=rt.n?'<span class="stars">'+SH.stars(rt.avg)+' '+rt.avg.toFixed(1)+'（'+rt.n+' 則評價）</span>':'<span class="stars">還沒有評價</span>';
  var off=pr<or?'<span class="off">省 '+Math.round((1-pr/or)*100)+'%</span>':'';
  var dis=stk<=0?' disabled':'';
  var buy='<div class="buy desk"><div class="qty" role="group" aria-label="數量"><button type="button" data-a="qm" aria-label="減少"'+(st.qty<=1?' disabled':'')+'>−</button><input type="number" min="1" max="'+max+'" value="'+st.qty+'" data-a="qin" aria-label="數量"><button type="button" data-a="qp" aria-label="增加"'+(st.qty>=max?' disabled':'')+'>＋</button></div><button class="btn lg" type="button" data-a="padd"'+dis+'>加入購物車</button><button class="btn pk lg" type="button" data-a="pnow"'+dis+'>直接結帳</button></div>';
  var info='<div class="info" id="pinfo"><span class="cat-l">'+h(p.cat||'商品')+'</span><h1>'+h(p.name)+'</h1><div>'+rt2+'</div><div class="big" id="pbig"><span class="price'+(pr<or?' sale':'')+'">'+TX.money(pr)+'</span>'+(pr<or?'<span class="orig">'+TX.money(or)+'</span>':'')+off+'</div>'+(p.preorder?'<p class="stockline"><i style="background:var(--butter)"></i>預購商品'+(p.shipDate?'，預計 '+h(p.shipDate)+' 出貨':'')+'</p>':'')+'<p class="desc">'+h(p.desc||'')+'</p>'+opts+stl+buy+'<div class="card" style="padding:16px 20px;border-radius:26px"><p style="font-size:13.5px">滿 '+TX.money(s.freeOver)+' 免運；未滿宅配 '+TX.money(s.homeFee)+'、超商 '+TX.money(s.cvsFee)+'。信用卡付款不加收手續費。</p></div></div>';
  var bar='<div class="buybar"><div class="pp">'+TX.money(pr)+'<small>'+(hasV?h(TX.vlabel(vk)):'')+'</small></div><button class="btn w" type="button" data-a="padd"'+dis+'>加入購物車</button><button class="btn pk" type="button" data-a="pnow"'+dis+'>直接結帳</button></div>';
  return '<div class="pdp"><div class="gal">'+main+th+(p.ai?'<small class="aicap">商品圖：AI 輔助生成</small>':'')+'<small>示範：縮圖是同一張圖的不同裁切。</small></div>'+info+'</div>'+bar}
SH.route('pdp',/^\/p\/([^/]+)$/,function(m){var id=decodeURIComponent(m[1]),p=TX.product(id);
  if(!p||p.status!=='on')return {html:SH.crumbs([['找不到商品']])+SH.empty('找不到這個商品','它可能已經下架了。','<a class="btn" href="#/list">回商品列表</a>')};
  var st=PD.st;if(!st||st.pid!==id)st=PD.st={pid:id,a:'',b:'',qty:1,img:0};defaults(p,st,specsOf(p));
  var rt=SH.rating(id),rel=TX.shopProducts().filter(function(x){return x.cat===p.cat&&x.id!==id}).slice(0,4);
  var s=D().settings,pays=[s.payCard&&'信用卡（綠界，不加收手續費）',s.payAtm&&'ATM 轉帳',s.payCvs&&'超商取貨付款',s.payCod&&'貨到付款'].filter(Boolean),lg=TX.shipOpts().map(function(x){return x.k});
  var html=SH.crumbs([[p.cat||'全部商品','#/list'+(p.cat?'?cat='+encodeURIComponent(p.cat):'')],[p.name]])+'<div id="pdpmain">'+pdpInner(p)+'</div>'+
   '<section class="pg rvl" style="margin-top:44px"><div class="card"><h3>商品介紹</h3><p>'+h(p.desc||'店家還沒有填寫介紹。')+'</p></div></section>'+
   '<section class="pg rvl"><div class="card"><h3>顧客評價'+(rt.n?'（'+rt.n+'）':'')+'</h3>'+(rt.n?rt.list.map(function(r){return '<div class="rv"><div class="t"><span class="stars">'+SH.stars(r.stars)+'</span>'+h(r.who)+'<small style="color:var(--mut);font-weight:700">'+TX.ago(r.t)+'</small></div><p>'+h(r.text)+'</p>'+(r.reply?'<div class="rp"><b>店家回覆：</b>'+h(r.reply)+'</div>':'')+'</div>'}).join(''):'<p>還沒有人留下評價。</p>')+'</div></section>'+
   '<section class="pg rvl"><div class="card"><h3>運送與付款</h3><ul><li>物流：'+(lg.join('、')||'店家還沒開啟任何物流')+'。</li><li>付款：'+(pays.join('、')||'店家還沒開啟任何付款方式')+'。</li><li>滿 '+TX.money(s.freeOver)+' 免運；下單後 1–2 個工作天出貨；收到商品 7 天內可申請退換貨。</li></ul></div></section>'+
   (rel.length?'<section><div class="sec-h rvl"><h2 class="sec-t">你可能也喜歡</h2></div>'+SH.grid(rel)+'</section>':'');
  return {html:html,admin:'app.html#/products',edit:'app.html#/product/'+id}});
function pdpPaint(focus){var p=TX.product(PD.st.pid);if(!p)return;var box=$('#pdpmain');if(!box)return;box.innerHTML=pdpInner(p);document.body.classList.add('pdp-on');
  $$('[data-ham]:not(.ham)',box).forEach(C.initHam);
  if(focus){var f=$('[data-a="'+focus.a+'"]'+(focus.g!=null?'[data-g="'+focus.g+'"][data-v="'+focus.v+'"]':''),box);f&&f.focus()}}
SH.act.opt=function(t){var p=TX.product(PD.st.pid),g=specsOf(p),st=PD.st,gi=+t.dataset.g,v=t.dataset.v;if(gi===0){st.a=v;if(g[1]&&!avail(p,g,st.a,st.b)){var nb=g[1].opts.filter(function(b){return avail(p,g,v,b)})[0];if(nb)st.b=nb}}else st.b=v;
  st.qty=1;pdpPaint({a:'opt',g:gi,v:v});if(!RM)gsap.fromTo('#pbig .price',{scale:1.25},{scale:1,duration:.7,ease:'elastic.out(1,.4)'})};
SH.act.pimg=function(t){PD.st.img=+t.dataset.i;pdpPaint({a:'pimg'})};
SH.act.qm=function(){PD.st.qty=Math.max(1,PD.st.qty-1);pdpPaint({a:'qm'})};
SH.act.qp=function(){PD.st.qty++;pdpPaint({a:'qp'})};
SH.act.qin=function(t){PD.st.qty=Math.max(1,Math.floor(+t.value||1));pdpPaint({a:'qin'})};
function pdpAdd(srcEl){var p=TX.product(PD.st.pid),g=specsOf(p),vk=g.length?keyOf(g,PD.st.a,PD.st.b):'';return SH.addToCart(p.id,vk,PD.st.qty,srcEl)}
SH.act.padd=function(t){var im=$('.gal .main');pdpAdd(im);pdpPaint()};
SH.act.pnow=function(){var r=pdpAdd(null);if(r.ok)location.hash='#/checkout'};
/* ======================= 購物車 ======================= */
function cartSummary(q,lines,mode){var d=D(),s=d.settings,gap=q.gapFree,pct=Math.min(100,Math.round(q.sub/(+s.freeOver||1)*100));
  var free='<div class="freebar">'+(q.free?'已達免運門檻，運費 0 元！':'再買 '+TX.money(gap)+' 就免運')+'<div class="bar" role="progressbar" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+pct+'%"></i></div></div>';
  var rows='<div class="r"><span>商品小計</span><b class="num">'+TX.money(q.sub)+'</b></div>'+q.parts.map(function(x){return '<div class="r d"><span>'+h(x.k)+'</span><b class="num">－'+TX.money(x.v)+'</b></div>'}).join('');
  if(mode==='checkout')rows+='<div class="r"><span>運費</span><b class="num">'+(q.free?'免運':TX.money(q.fee))+'</b></div>';
  return {free:free,rows:rows}}
function couponBox(q){var d=D(),code=SH.st.code,hint=d.coupons.filter(function(c){return c.active}).slice(0,2);
  return '<div class="cpn"><input id="codein" value="'+h(code)+'" placeholder="輸入折扣碼" aria-label="折扣碼" maxlength="20"><button class="btn w" type="button" data-a="capply">套用</button></div>'+
   (code?(q.couponMsg?'<div class="cmsg no">'+h(q.couponMsg)+'</div>':'<div class="cmsg ok">折扣碼已套用</div>'):'')+
   (hint.length?'<div class="cpn-hint">試試看：'+hint.map(function(c){return '<button type="button" data-a="cfill" data-c="'+h(c.code)+'">'+h(c.code)+'</button>'}).join('、')+'</div>':'')}
SH.act.cfill=function(t){SH.st.code=t.dataset.c;SH.refresh()};
SH.act.capply=function(){SH.st.code=($('#codein').value||'').trim().toUpperCase();SH.refresh()};
SH.route('cart',/^\/cart$/,function(){var lines=TX.cartLines(),cust=cmem(),q=TX.quote(lines,{code:SH.st.code,cust:cust});
  if(!lines.length)return {html:SH.crumbs([['購物車']])+SH.empty('購物車空空的','去逛逛，找喜歡的東西放進來。','<a class="btn" href="#/list">去逛商品</a>'),admin:'app.html#/orders'};
  var cs=cartSummary(q,lines,'cart');
  var rows=lines.map(function(l){var p=l.p;if(!p)return '<div class="cl"><div class="im"></div><div><div class="nm">（這個商品已經不在了）</div><span class="bad">已下架</span></div><div class="rt"><button class="rm" type="button" data-a="cdel" data-i="'+l.i+'">移除</button></div></div>';
    var max=l.stock?TX.maxQty(p,l.vk):0;
    return '<div class="cl"><a class="im" href="#/p/'+h(p.id)+'"><img src="'+h(TX.pimg(p,l.vk))+'" alt="'+h(p.name)+'"></a><div><a class="nm" href="#/p/'+h(p.id)+'">'+h(p.name)+'</a><div class="vr">'+(l.vk?h(TX.vlabel(l.vk))+'・':'')+TX.money(l.price)+(l.orig>l.price?'<s style="margin-left:6px;opacity:.7">'+TX.money(l.orig)+'</s>':'')+'</div>'+(l.bad?'<span class="bad">'+h(l.bad)+'</span>':'')+'</div><div class="rt"><div class="qty sm"><button type="button" data-a="cm" data-i="'+l.i+'" aria-label="減少">−</button><input type="number" min="1" value="'+l.qty+'" data-a="cin" data-i="'+l.i+'" aria-label="數量"><button type="button" data-a="cp" data-i="'+l.i+'" aria-label="增加"'+(l.qty>=max?' disabled':'')+'>＋</button></div><span class="sub">'+TX.money(l.price*l.qty)+'</span><button class="rm" type="button" data-a="cdel" data-i="'+l.i+'">移除</button></div></div>'}).join('');
  var bad=lines.some(function(l){return l.bad});
  return {html:SH.crumbs([['購物車']])+'<h1 class="pgt">購物車<small style="font-size:16px;color:var(--mut);margin-left:10px">'+q.qty+' 件</small></h1><div class="clay" style="margin-top:14px"><div class="card">'+rows+'</div><aside class="sum"><h3>訂單摘要</h3>'+cs.free+couponBox(q)+cs.rows+'<div class="r"><span>運費</span><span style="color:var(--mut);font-size:13px">結帳時依取貨方式計算</span></div><div class="r t"><span>商品合計</span><b class="num">'+TX.money(q.total)+'</b></div><a class="btn lg" href="#/checkout" data-cur="結帳">前往結帳</a>'+(bad?'<p class="note" style="color:#C23A5B;font-weight:900">有商品需要調整，先處理再結帳。</p>':'')+'<p class="note">示範商店：結帳不會真的收錢。</p></aside></div>',admin:'app.html#/orders'}});
SH.act.cm=function(t){var i=+t.dataset.i,l=TX.cart()[i];TX.cartSet(i,l.qty-1);SH.badge();SH.refresh()};
SH.act.cp=function(t){var i=+t.dataset.i,l=TX.cart()[i];TX.cartSet(i,l.qty+1);SH.badge();SH.refresh()};
SH.act.cin=function(t){TX.cartSet(+t.dataset.i,t.value);SH.badge();SH.refresh()};
SH.act.cdel=function(t){TX.cartSet(+t.dataset.i,0);SH.badge();SH.refresh()};
/* ======================= 結帳 ======================= */
var STORES={'7-11 超商取貨':['台北內湖','台北信義','新北板橋','台中西屯'],'全家 超商取貨':['台北松山','桃園中壢','台中北屯','高雄左營']};
function formState(){var f=SH.st.form,m=TX.member();if(!f){f=SH.st.form={name:m?m.name:'',phone:m?m.phone:'',email:m?m.email||'':'',logi:'',store:'',addr:'',pay:'',note:''}}
  var opts=TX.shipOpts();if(!opts.some(function(o){return o.k===f.logi}))f.logi=opts[0]?opts[0].k:'';
  var pays=TX.payOpts(f.logi);if(!pays.some(function(o){return o.k===f.pay}))f.pay=pays[0]?pays[0].k:'';
  var ss=STORES[f.logi]||[];if(ss.length&&ss.indexOf(f.store)<0)f.store='';return f}
function fld(f,key,label,attrs,extra){return '<label class="fld" data-f="'+key+'"><span>'+label+' <i>*</i></span><input data-i="f" data-f="'+key+'" value="'+h(f[key])+'" '+(attrs||'')+'><em class="er">'+(extra||'')+'</em></label>'}
SH.route('checkout',/^\/checkout$/,function(){var lines=TX.cartLines();if(!lines.length)return {html:SH.crumbs([['結帳']])+SH.empty('購物車是空的','先放一些商品進來，再來結帳。','<a class="btn" href="#/list">去逛商品</a>'),admin:'app.html#/orders'};
  var f=formState(),cust=TX.customerByPhone(f.phone),q=TX.quote(lines,{logi:f.logi,code:SH.st.code,cust:cust}),cs=cartSummary(q,lines,'checkout'),opts=TX.shipOpts(),pays=TX.payOpts(f.logi),bad=lines.some(function(l){return l.bad});
  var lg=opts.length?'<div class="radios" role="radiogroup" aria-label="取貨方式">'+opts.map(function(o){var fee=q.sub>=+D().settings.freeOver?0:o.fee;return '<button type="button" class="radio'+(o.k===f.logi?' on':'')+'" role="radio" aria-checked="'+(o.k===f.logi)+'" data-a="rlogi" data-v="'+h(o.k)+'"><i class="dot"></i><div><b>'+h(o.k)+'</b><span>'+(o.cvs?'到你選的門市取貨':'送到你家')+'</span></div><em>'+(fee?TX.money(fee):'免運')+'</em></button>'}).join('')+'</div>':'<div class="demonote"><i>!</i><div>店家還沒有開啟任何物流方式，無法結帳。（到後台「設定→運費與出貨」打開）</div></div>';
  var dest=(STORES[f.logi]?'<label class="fld" data-f="store"><span>取貨門市 <i>*</i></span><select data-i="f" data-f="store"><option value="">請選一間示範門市</option>'+STORES[f.logi].map(function(s){return '<option'+(f.store===s?' selected':'')+'>'+s+'</option>'}).join('')+'</select><em class="er">請選一間取貨門市</em></label>':(f.logi?fld(f,'addr','收件地址','placeholder="例如：台北市示範區新生路 9 號（虛構地址也可以）" autocomplete="street-address"','請填寫收件地址（至少 6 個字）'):''));
  var py=pays.length?'<div class="radios" role="radiogroup" aria-label="付款方式">'+pays.map(function(o){return '<button type="button" class="radio'+(o.k===f.pay?' on':'')+'" role="radio" aria-checked="'+(o.k===f.pay)+'" data-a="rpay" data-v="'+h(o.k)+'"><i class="dot"></i><div><b>'+h(o.k)+'</b><span>'+h(o.d)+'</span></div></button>'}).join('')+'</div>':'<div class="demonote"><i>!</i><div>目前沒有可用的付款方式。（到後台「設定→付款」打開）</div></div>';
  var mini=lines.map(function(l){return '<div class="minil"><img src="'+h(l.p?TX.pimg(l.p,l.vk):'')+'" alt=""><span>'+h(l.p?l.p.name:'已下架商品')+'<small>'+(l.vk?h(TX.vlabel(l.vk))+'・':'')+'x '+l.qty+(l.bad?'・'+h(l.bad):'')+'</small></span><b>'+TX.money(l.price*l.qty)+'</b></div>'}).join('');
  var can=opts.length&&pays.length&&!bad;
  var html=SH.crumbs([['購物車','#/cart'],['結帳']])+'<h1 class="pgt">結帳</h1><div class="demonote" style="margin-top:12px"><i>!</i><div>這是示範商店，<b>不會真的收錢</b>。請不要填真實的信用卡號或身分證號；姓名、電話可以亂填（手機要 10 碼）。</div></div><div class="clay"><div>'+
   '<div class="card"><h3 class="fh"><i>1</i>聯絡資料</h3><div class="fgrid">'+fld(f,'name','姓名','placeholder="王小明" autocomplete="name"','請填寫姓名')+fld(f,'phone','手機','placeholder="0912-345-678" inputmode="tel" autocomplete="tel"','請填 10 碼手機，例如 0912-345-678')+'</div>'+fld(f,'email','Email','placeholder="you@example.com" inputmode="email" autocomplete="email"','Email 格式不正確')+'</div>'+
   '<div class="card"><h3 class="fh"><i>2</i>取貨方式</h3>'+lg+dest+'</div>'+
   '<div class="card"><h3 class="fh"><i>3</i>付款方式</h3>'+py+'<p style="font-size:13px;margin-top:-4px">信用卡付款不加收手續費，也不會因為金額大小被拒絕。這裡是示範，不會真的刷卡。</p></div>'+
   '<div class="card"><h3 class="fh"><i>4</i>備註（選填）</h3><label class="fld" style="margin:0"><textarea data-i="f" data-f="note" placeholder="例如：請放管理室" aria-label="備註">'+h(f.note)+'</textarea></label></div></div>'+
   '<aside class="sum"><h3>你的訂單</h3>'+mini+'<div style="margin-top:8px">'+cs.free+couponBox(q)+cs.rows+'</div><div class="r t"><span>應付金額</span><b class="num">'+TX.money(q.total)+'</b></div><button class="btn lg" type="button" data-a="place"'+(can?'':' disabled')+' data-cur="下單">送出訂單（示範）</button><p class="note">按下去會在「後台訂單」多一筆，並自動扣庫存。</p></aside></div>';
  return {html:html,admin:'app.html#/orders'}});
SH.act.rlogi=function(t){var f=formState();f.logi=t.dataset.v;SH.refresh()};
SH.act.rpay=function(t){var f=formState();f.pay=t.dataset.v;SH.refresh()};
document.addEventListener('input',function(e){var t=e.target;if(t.getAttribute&&t.getAttribute('data-i')==='f'){var f=SH.st.form;if(f){f[t.dataset.f]=t.value;var w=t.closest('.fld');w&&w.classList.remove('bad')}}});
document.addEventListener('change',function(e){var t=e.target;if(!t.getAttribute)return;var a=t.getAttribute('data-a');
  if(t.tagName==='SELECT'&&t.getAttribute('data-i')==='f'){SH.st.form[t.dataset.f]=t.value;var w=t.closest('.fld');w&&w.classList.remove('bad');return}
  if(a&&(t.tagName==='SELECT'||t.type==='number')&&SH.act[a]){SH.act[a](t,e)}});
SH.act.place=function(t){var f=formState(),er={};
  if(!f.name.trim()||f.name.trim().length<2)er.name=1;
  if(!/^09\d{8}$/.test(TX.digits(f.phone)))er.phone=1;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))er.email=1;
  if(STORES[f.logi]){if(!f.store)er.store=1}else if((f.addr||'').trim().length<6)er.addr=1;
  var keys=Object.keys(er);$$('.fld').forEach(function(w){w.classList.toggle('bad',!!er[w.dataset.f])});
  if(keys.length){var el=$('.fld.bad');el&&el.scrollIntoView({block:'center',behavior:RM?'auto':'smooth'});var inp=el&&$('input,select',el);inp&&inp.focus({preventScroll:true});U.toast('還有欄位要補一下','紅色框框的地方請再確認');return}
  var dest=STORES[f.logi]?'示範門市 '+f.store:f.addr.trim();
  var res=TX.placeOrder({name:f.name.trim(),phone:f.phone.trim(),email:f.email.trim(),logi:f.logi,dest:dest,pay:f.pay,note:f.note.trim(),code:SH.st.code});
  if(!res.ok){U.toast('沒辦法送出訂單',res.msg);SH.refresh();return}
  SH.st.code='';SH.st.form=null;SH.badge();location.hash='#/done/'+encodeURIComponent(res.order.id)};
/* ======================= 訂單完成 ======================= */
SH.route('done',/^\/done\/([^/]+)$/,function(m){var id=decodeURIComponent(m[1]),o=TX.order(id);
  if(!o)return {html:SH.empty('找不到這筆訂單','可能是剛剛重設了示範資料。','<a class="btn" href="#/">回商店首頁</a>')};
  var step=o.status==='已完成'?4:(o.status==='運送中'||o.status==='已到店待取貨')?3:o.status==='已處理'?2:1,atm=o.pay==='ATM 轉帳'&&o.status==='等待付款';
  var items=o.items.map(function(it){var p=TX.product(it.pid);return '<div class="minil"><img src="'+h(p?TX.pimg(p,it.variant):'')+'" alt=""><span>'+h(it.name)+'<small>'+(it.variant?h(TX.vlabel(it.variant))+'・':'')+'x '+it.qty+'</small></span><b>'+TX.money(it.price*it.qty)+'</b></div>'}).join('');
  var html='<section class="done"><div class="trio">'+SH.ham('tiaotiao','','')+SH.ham('lili','','mid')+SH.ham('xiaosha','','')+'</div><h1>訂單成立，謝謝你！</h1><p class="lead">'+h(o.cname)+'，我們收到訂單囉。（這是示範，不會真的出貨）</p><div class="ono">'+h(o.id)+'</div>'+
   '<div class="steps">'+['訂單成立','店家處理','出貨運送','取貨完成'].map(function(s,i){return '<div class="'+(i<step?'on':'')+'"><i>'+(i+1)+'</i>'+s+'</div>'}).join('')+'</div>'+
   '<div class="dgrid"><div class="card"><h3>訂單明細</h3>'+items+(o.disc?'<div class="minil"><span>折扣（'+h(o.discNote)+'）</span><b>－'+TX.money(o.disc)+'</b></div>':'')+'<div class="minil"><span>運費</span><b>'+(o.fee?TX.money(o.fee):'免運')+'</b></div><div class="minil" style="border-top:2px dashed var(--line);margin-top:6px;padding-top:12px"><span><b style="font-family:var(--body)">應付金額</b></span><b style="font-size:24px">'+TX.money(o.total)+'</b></div></div>'+
   '<div class="card"><h3>取貨與付款</h3><p>'+h(o.logi)+'<br>'+h(o.dest)+'</p><p style="margin-top:10px">'+h(o.pay)+'・'+h(o.payStatus)+'</p>'+(atm?'<div class="atm">示範轉帳帳號（虛構）<br><b>000-0000-0000-00</b><br>轉帳後，店家在後台按「標記已收款」，訂單就會進入出貨。</div>':'')+'<p style="margin-top:12px;font-size:13px">狀態：<b>'+h(lab(o)[0])+'</b></p></div></div>'+
   '<div class="dbtn"><a class="btn lg" href="#/">繼續逛逛</a><a class="btn w lg" href="#/member">查詢我的訂單</a><a class="btn pk lg" data-go="app.html#/order/'+h(o.id)+'" data-cur="看後台">去後台看這筆訂單</a></div></section>';
  return {html:html,admin:'app.html#/order/'+encodeURIComponent(o.id),mount:function(){var k='sf-done-'+o.id,seen=false;try{seen=sessionStorage.getItem(k)==='1';sessionStorage.setItem(k,'1')}catch(e){}
    if(!RM&&!seen&&C.burst){setTimeout(function(){C.burst(innerWidth*.5,innerHeight*.32,150)},350);setTimeout(function(){C.burst(innerWidth*.22,innerHeight*.4,70)},800);setTimeout(function(){C.burst(innerWidth*.78,innerHeight*.4,70)},1100)}
    SH.say('訂單成立！')}}});
/* ======================= 會員／訂單查詢 ======================= */
SH.route('member',/^\/member$/,function(){var d=D(),m=TX.member();
  if(!m){var tries=d.customers.slice(0,3);
    return {html:SH.crumbs([['訂單查詢']])+'<section class="lookup">'+SH.ham('lili','','')+'<h1 class="pgt">查詢我的訂單</h1><p style="color:var(--mut);font-weight:700;margin-bottom:16px">輸入下單時留的手機號碼就能查。示範站不用密碼。</p><div class="card"><label class="fld" data-f="lphone"><span>手機號碼</span><input id="lphone" inputmode="tel" placeholder="0912-345-678" autocomplete="tel"><em class="er">找不到這支手機的訂單。確認一下，或先下一單試試。</em></label><button class="btn" type="button" data-a="login" style="width:100%">查詢</button><p style="font-size:13px;margin-top:14px">沒有手機可以試？點下面任一個，用示範顧客身分看看：</p><div class="tryit">'+tries.map(function(c){return '<button class="fchip" type="button" data-a="tryph" data-p="'+h(c.phone)+'">'+h(c.name)+'・'+h(c.phone)+'</button>'}).join('')+'</div></div></section>',admin:'app.html#/customers'}}
  var cust=TX.customerByPhone(m.phone),os=TX.ordersOfPhone(m.phone).sort(function(a,b){return b.t-a.t}),name=cust?cust.name:m.name||'顧客',lv=cust?cust.level:'一般',spent=os.filter(TX.isSales).reduce(function(a,o){return a+o.total},0);
  var off=TX.levelOff(cust);
  var prof='<aside class="pf">'+SH.ham('xiaosha','','')+'<h2>'+h(name)+'</h2><span class="lv">'+h(lv)+'會員'+(off?'・結帳 '+(100-off)+' 折':'')+'</span><div class="st3"><div><b>'+os.length+'</b>訂單</div><div><b>'+TX.money(spent).replace('NT$ ','')+'</b>累積消費</div><div><b>'+(cust?TX.num(cust.points):0)+'</b>點數</div><div><b>'+(cust?TX.num(cust.credit||0):0)+'</b>購物金</div></div><p style="font-size:13px;font-weight:700;color:var(--mut);margin-bottom:12px">'+h(m.phone)+'</p><button class="btn w sm" type="button" data-a="logout">換一支手機</button></aside>';
  var list=os.length?os.map(function(o){var L=lab(o),acts='';
    if(o.status==='待處理'||o.status==='等待付款')acts+='<button class="btn w sm" type="button" data-a="ocancel" data-id="'+h(o.id)+'">取消訂單</button>';
    if(o.status==='已完成'&&!o.ret)acts+='<button class="btn w sm" type="button" data-a="oreturn" data-id="'+h(o.id)+'">申請退貨</button>';
    var tl=o.hist.slice().sort(function(a,b){return a.t-b.t}).map(function(x){return '<div>'+h(x.text)+'<small>'+TX.fmt(x.t)+'</small></div>'}).join('');
    return '<div class="od rvl"><div class="hd"><b>'+h(o.id)+'</b><span class="pill '+L[1]+'">'+h(L[0])+'</span>'+(o.src==='shop'?'':'')+'<small>'+TX.fmt(o.t)+'・'+TX.money(o.total)+'</small></div>'+o.items.map(function(it){var p=TX.product(it.pid);return '<div class="minil"><img src="'+h(p?TX.pimg(p,it.variant):'')+'" alt=""><span>'+h(it.name)+'<small>'+(it.variant?h(TX.vlabel(it.variant))+'・':'')+'x '+it.qty+'</small></span><b>'+TX.money(it.price*it.qty)+'</b></div>'}).join('')+'<p style="font-size:13px;font-weight:700;color:var(--mut);margin-top:4px">'+h(o.logi)+'・'+h(o.dest||'')+'・'+h(o.pay)+'（'+h(o.payStatus)+'）'+(o.code?'・單號 '+h(o.code):'')+'</p><div class="tl">'+tl+'</div><div class="acts">'+acts+'</div></div>'}).join(''):SH.empty('還沒有訂單','下一單，這裡就會出現。','<a class="btn" href="#/list">去逛商品</a>');
  return {html:SH.crumbs([['訂單查詢']])+'<h1 class="pgt">我的訂單</h1><div class="mgrid" style="margin-top:14px">'+prof+'<div>'+list+'</div></div>',admin:'app.html#/customers'}});
SH.act.tryph=function(t){$('#lphone').value=t.dataset.p;SH.act.login()};
SH.act.login=function(){var v=($('#lphone').value||'').trim(),c=TX.customerByPhone(v),os=TX.ordersOfPhone(v),w=$('[data-f=lphone]');
  if(TX.digits(v).length<8||(!c&&!os.length)){w.classList.add('bad');return}
  TX.memberSet({phone:v,name:c?c.name:os[0].cname,email:c?c.email:os[0].email});SH.refresh()};
SH.act.logout=function(){TX.memberSet(null);SH.refresh()};
SH.act.ocancel=function(t){U.confirm('取消這筆訂單？','商品庫存會自動補回，後台訂單也會變成「已取消」。',function(){TX.cancel(t.dataset.id);U.toast('訂單已取消');SH.refresh()},'取消訂單',true)};
SH.act.oreturn=function(t){U.confirm('申請退貨？','店家會在後台「退換貨」看到你的申請。',function(){TX.requestReturn(t.dataset.id,'顧客在商店頁面申請退貨');U.toast('已送出退貨申請','店家會在後台處理');SH.refresh()},'送出申請')};
/* ======================= 說明頁 ======================= */
SH.route('page',/^\/page\/([^/]+)$/,function(m){var d=D(),slug=decodeURIComponent(m[1]),pg=d.pages.filter(function(p){return p.slug===slug&&p.status==='發布'})[0];
  if(slug==='contact')return {html:SH.crumbs([['聯絡客服']])+'<section class="about"><div><h2>聯絡客服</h2><p>有問題都可以問我們。\n信箱：'+h(d.store.email)+'\n電話：'+h(d.store.phone)+'\n地址：'+h(d.store.addr)+'</p><a class="btn" data-line="shop-contact">'+SH.LINE+'想要這樣的商店？LINE 問棠序</a></div>'+SH.ham('lili','','')+'</section>',admin:'app.html#/customers/inbox'};
  if(!pg)return {html:SH.crumbs([['找不到頁面']])+SH.empty('找不到這一頁','這一頁可能還沒發布。（後台「網店→頁面」可以發布）','<a class="btn" href="#/">回商店首頁</a>')};
  return {html:SH.crumbs([[pg.title]])+'<section class="about"><div><h2>'+h(pg.title)+'</h2><p>'+h(pg.body)+'</p><a class="btn w" href="#/list">去逛商品</a></div>'+SH.ham('tiaotiao','','')+'</section>',admin:'app.html#/shop/pages'}});
})();
