(function(){
'use strict';
var C=window.CUTE,RM=C.RM,$=C.$,$$=C.$$,T=window.TX;
var SC=innerWidth<760?.46:innerWidth<1100?.72:1;
gsap.registerPlugin(ScrollTrigger);
var R=gsap.utils.random;
var lenis=null;
if(!RM){
  lenis=new Lenis({duration:1.1,smoothWheel:true});window.__lenis=lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0);
}
/* 磁吸按鈕 */
if(!RM)$$('.mag').forEach(function(b){
  var qx=gsap.quickTo(b,'x',{duration:.5,ease:'elastic.out(1,.5)'}),qy=gsap.quickTo(b,'y',{duration:.5,ease:'elastic.out(1,.5)'});
  b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();qx((e.clientX-r.left-r.width/2)*.28);qy((e.clientY-r.top-r.height/2)*.4)});
  b.addEventListener('pointerleave',function(){qx(0);qy(0)});
});

/* ---------- 巨大數字：玩具積木式滾輪 ---------- */
var big=$('#bignum'),SH=['#FF8DAA','#FFD45E','#7BDDB5','#86C8FF','#FFB48A'],digits=[],revenue=T.revenue(7),orders=T.report(7).ord;
function buildBig(n){
  big.innerHTML='';digits=[];
  var c=document.createElement('span');c.className='coin';c.textContent='NT$';big.appendChild(c);
  var k0=0;
  Math.round(n).toLocaleString('en-US').split('').forEach(function(ch){
    if(ch===','){var s=document.createElement('span');s.className='sep';s.textContent=',';big.appendChild(s);return}
    var t=document.createElement('span');t.className='tile';t.style.setProperty('--sh',SH[k0++%5]);
    var w=document.createElement('span');w.className='win';var st=document.createElement('span');st.className='strip';
    for(var k=0;k<30;k++){var i=document.createElement('i');i.textContent=k%10;st.appendChild(i)}
    w.appendChild(st);t.appendChild(w);big.appendChild(t);digits.push({st:st,k:0});
  });
}
buildBig(revenue);
function setRevenue(n,instant){
  var s=String(Math.round(n)).padStart(digits.length,'0').split('').map(Number);
  digits.forEach(function(g,i){
    var target=s[i],cur=g.k%10,delta=(target-cur+10)%10;
    if(g.k>=18){gsap.set(g.st,{yPercent:-(cur+10)*100/30});g.k=cur+10}
    g.k=g.k+delta;
    if(instant)gsap.set(g.st,{yPercent:-g.k*100/30});
    else gsap.to(g.st,{yPercent:-g.k*100/30,duration:1.2+i*.2,ease:'back.out(1.5)'});
  });
}
if(RM)setRevenue(revenue,true);else setRevenue(0,true);
function fmtN(n){return Math.round(n).toLocaleString('en-US')}
function trans(){return T.D().orders.filter(function(o){return o.status==='運送中'}).length}
function arrived(){return T.D().orders.filter(function(o){return o.status==='已到店待取貨'}).length}
function lowNames(){var D=T.D();return D.products.filter(function(p){return p.status==='on'&&T.isLow(p)}).slice(0,2).map(function(p){return p.name.replace(/\s.*$/,'')})}
function fillMeta(){
  var r7=T.report(7),r14=T.report(14),prev=r14.rev-r7.rev,pct=prev>0?Math.round((r7.rev/prev-1)*100):0;
  $('#meta').innerHTML=(pct>=0?'<b class="up">▲ '+pct+'%</b> 比前 7 天多':'<b class="up" style="color:#D9507D">▼ '+Math.abs(pct)+'%</b> 比前 7 天少')+'　<i>•</i>　<span id="orderCnt" class="num">'+r7.ord+'</span> 張訂單　<i>•</i>　客單價 NT$ '+fmtN(r7.avg);
  var t=T.todo();$('#shipBtn').textContent='批次出貨　'+t.ship+' 筆';
}
function fillStats(pop){
  var t=T.todo(),vals={'n-unread':t.unread,'n-ship':t.ship,'n-trans':trans(),'n-low':t.low};
  Object.keys(vals).forEach(function(id){var el=$('#'+id);el.dataset.n=vals[id];if(pop||el.dataset.shown){el.textContent=vals[id];el.dataset.shown=1;if(pop&&!RM)gsap.fromTo(el,{scale:.7},{scale:1,duration:.9,ease:'elastic.out(1,.4)'})}});
  $('#t-unread').textContent=t.unread?t.unread+' 位顧客在等回覆':'客服都回完了，太棒了';
  var a=arrived();$('#t-trans').textContent=a?a+' 張已到店，等顧客取貨':'都在路上';
  var ln=lowNames();$('#t-low').textContent=ln.length?ln.join('、')+' 快賣完了':'庫存都夠';
  var d=new Date();$('#today').textContent=(d.getMonth()+1)+'/'+d.getDate()+' 週'+'日一二三四五六'[d.getDay()];
}
fillMeta();fillStats(false);
var toast=$('#toast'),live=0;
function newOrder(){
  var o=T.newOrder();if(!o)return;live++;
  revenue+=o.total;orders++;setRevenue(revenue);
  var tl=$$('.tile');if(!RM)gsap.fromTo(tl,{y:0},{y:-14,duration:.18,yoyo:true,repeat:1,stagger:.05,ease:'power2.out'});
  fillMeta();fillStats(true);buildGarlandTexts();
  toast.innerHTML='<small>新訂單 #'+o.id+'</small>'+o.cname+'　<b>+NT$ '+fmtN(o.total)+'</b>';
  gsap.timeline().fromTo(toast,{opacity:0,y:30,scale:.8},{opacity:1,y:0,scale:1,duration:.6,ease:'elastic.out(1,.45)'}).to(toast,{opacity:0,y:20,duration:.4},'+=2.2');
}
setInterval(function(){if(scrollY<innerHeight*1.2&&live<3&&!document.hidden)newOrder()},5200);

/* ---------- 首屏：貼紙與氣球 ---------- */
var stk=$$('.stk');
function heroSrc(){
  var H=T.D().hero;
  stk.forEach(function(s,i){var h=H[i%H.length];if(h.img){s.src=h.img;s.style.background=''}else{s.src=T.artSrc(h.art.k,h.art.c);s.style.background=(h.art.c==='#FFFFFF'?'#BFD9EF':C.shade(h.art.c,.55))}});
}
heroSrc();
stk.forEach(function(s){
  var w=Math.round(+s.dataset.w*SC);s.style.width=w+'px';s.style.left=(s.dataset.x/14.4)+'%';s.style.top=(s.dataset.y/9)+'%';
  s.style.marginLeft=(-w/2)+'px';s.style.marginTop=(-w/2)+'px';s.style.borderRadius=s.dataset.br;
  s.dataset.depth=R(10,34);
  gsap.set(s,{rotation:+s.dataset.r});
});
var heroHam=$('#heroHam'),vh=innerHeight;
gsap.set('.bal',{scale:0});
if(!RM){
  var tl=gsap.timeline({scrollTrigger:{trigger:'#heroWrap',start:'top top',end:'+=2100',pin:'#hero',scrub:.7,anticipatePin:1}});
  tl.fromTo('.bal',{scale:0},{scale:1,duration:.16,ease:'elastic.out(1,.5)',stagger:.025,immediateRender:false},0)
    .fromTo('#hamwrap',{y:0},{y:-vh*1.55,duration:.82,ease:'power2.in',immediateRender:false},.1)
    .fromTo('#heroCenter',{y:0},{y:-vh*.95,duration:.7,ease:'power2.in',immediateRender:false},.22)
    .to('#heroCenter',{opacity:0,duration:.14},.74)
    .to('#cue',{opacity:0,duration:.08},0)
    .to('.mound',{y:140,duration:.5},.3)
    .to('.bl',{y:-260,scale:1.25,duration:.9,stagger:.05},.1)
    .to('.cloud',{y:-vh*.9,duration:.9,stagger:.08,ease:'power1.in'},.1);
  stk.forEach(function(s,i){
    tl.fromTo(s,{y:0},{y:-(vh+380)*R(.85,1.3),rotation:+s.dataset.r+R(-60,60),duration:R(.5,.7),ease:'power2.in',immediateRender:false},.12+i*.05);
  });
  window.addEventListener('pointermove',function(){});
}
gsap.ticker.add(function(){
  if(RM)return;
  var mx=(C.mouse.x/innerWidth-.5),my=(C.mouse.y/innerHeight-.5);
  stk.forEach(function(s){var d=+s.dataset.depth;s.style.translate=(-mx*d)+'px '+(-my*d)+'px'});
  $$('.bl').forEach(function(b,i){b.style.translate=(mx*(20+i*14))+'px '+(my*(16+i*10))+'px'});
  // 數據卡的臉：眼睛看向游標
  $$('.face').forEach(function(f){var r=f.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
    var dx=Math.max(-1,Math.min(1,(C.mouse.x-(r.left+r.width/2))/260)),dy=Math.max(-1,Math.min(1,(C.mouse.y-(r.top+r.height/2))/260));
    $$('i',f).forEach(function(e){e.style.translate=(dx*4)+'px '+(dy*4)+'px'})});
});
function intro(delay){
  var letters=$$('#hl span'),tiles=$$('.tile'),coin=$('.coin'),ham=$('#hamwrap');
  var hr=heroHam.getBoundingClientRect(),mx=hr.left+hr.width*.5,my=hr.top+hr.height*.62;
  gsap.set(letters,{y:-900,rotation:function(){return R(-50,50)},transformOrigin:'50% 100%'});
  gsap.set(tiles,{y:-1100});gsap.set(coin,{scale:0});gsap.set(ham,{y:620});
  gsap.set('.kick',{scale:0});gsap.set('.meta,.btns>*',{scale:.3,opacity:0});gsap.set('.nav',{y:-130});
  gsap.set('.bl',{scale:0});gsap.set('.cloud',{y:-320,opacity:0});gsap.set('#cue',{opacity:0});
  var rest=stk.map(function(s){var b=s.getBoundingClientRect();return [b.left+b.width/2-(+gsap.getProperty(s,'x')),b.top+b.height/2-(+gsap.getProperty(s,'y'))]});
  stk.forEach(function(s,i){gsap.set(s,{scale:0,x:mx-rest[i][0],y:my-rest[i][1]})});
  var t=gsap.timeline({delay:delay});
  t.to('.nav',{y:0,duration:1,ease:'bounce.out'},0)
   .to('.bl',{scale:1,duration:1.6,ease:'elastic.out(1,.5)',stagger:.14},.1)
   .to('.cloud',{y:0,opacity:1,duration:1.3,ease:'bounce.out',stagger:.15},.25)
   .to('.kick',{scale:1,duration:.7,ease:'back.out(3)'},.5)
   .to(letters,{y:0,rotation:0,duration:1.15,ease:'bounce.out',stagger:.07},.6)
   .fromTo(letters,{scaleY:1.4,scaleX:.8},{scaleY:1,scaleX:1,duration:1.3,ease:'elastic.out(1,.32)',stagger:.07},.9)
   .to(coin,{scale:1,duration:.9,ease:'elastic.out(1,.4)'},1.2)
   .to(tiles,{y:0,duration:1.05,ease:'bounce.out',stagger:.11},1.1)
   .fromTo(tiles,{scaleY:1.25,scaleX:.86},{scaleY:1,scaleX:1,duration:1.2,ease:'elastic.out(1,.3)',stagger:.11,transformOrigin:'50% 100%'},1.4)
   .add(function(){setRevenue(revenue)},2.0)
   .to(ham,{y:0,duration:1.4,ease:'elastic.out(1,.4)'},1.8);
  stk.forEach(function(s,i){
    var d=2.45+i*.13,r=+s.dataset.r;
    t.to(s,{scale:1,duration:.35,ease:'back.out(3)'},d)
     .to(s,{x:0,duration:1.15,ease:'power1.out'},d)
     .fromTo(s,{rotation:r+(i%2?-300:300)},{rotation:r,duration:1.15,ease:'power2.out'},d)
     .to(s,{keyframes:[{y:Math.min(mx*0+(my-rest[i][1]),0)-300,duration:.55,ease:'power2.out'},{y:0,duration:.62,ease:'bounce.out'}]},d);
  });
  t.to('.meta,.btns>*',{scale:1,opacity:1,duration:.8,ease:'elastic.out(1,.5)',stagger:.12},2.6)
   .to('#cue',{opacity:1,duration:.5},3.4);
}
if(RM){gsap.set('.stk',{scale:1})}else intro(C.rollEntering?1.5:0.2);

/* ---------- 區塊進場：由下往上彈跳升起（果凍） ---------- */
function jelly(els,trigger,start,stag){
  if(RM)return;
  gsap.set(els,{y:180,opacity:0,scaleX:.82,scaleY:1.3,transformOrigin:'50% 100%'});
  ScrollTrigger.create({trigger:trigger,start:start||'top 82%',once:true,onEnter:function(){
    gsap.to(els,{y:0,opacity:1,scaleX:1,scaleY:1,duration:1.4,ease:'elastic.out(1,.42)',stagger:stag==null?.1:stag})}});
}
$$('.scal').forEach(function(s){
  if(RM)return;gsap.set(s,{scaleY:0});
  ScrollTrigger.create({trigger:s.parentNode,start:'top 95%',once:true,onEnter:function(){gsap.to(s,{scaleY:1,duration:1.2,ease:'elastic.out(1,.4)'})}});
});
jelly($$('.sec-top>*'),'#stats','top 80%');
jelly($$('#stats .cell'),'.grid4','top 85%',.12);
$$('#stats .cell').forEach(function(c,i){gsap.set(c,{rotation:[-2.5,1.8,-1.4,2.4][i]})});
$$('.cell .no').forEach(function(n,i){
  var o={v:0};if(RM){n.textContent=n.dataset.n;n.dataset.shown=1;return}
  ScrollTrigger.create({trigger:'.grid4',start:'top 80%',once:true,onEnter:function(){var t=+n.dataset.n;n.dataset.shown=1;
    gsap.to(o,{v:t,duration:1.5,delay:.3+i*.12,ease:'power3.out',onUpdate:function(){n.textContent=Math.round(o.v)}});
    gsap.fromTo(n,{scale:.6},{scale:1,duration:1.2,delay:.3+i*.12,ease:'elastic.out(1,.4)'})}});
});
if(!RM)$$('.cell').forEach(function(c){
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
    gsap.to(c,{rotationY:px*10,rotationX:-py*8,y:-8,transformPerspective:1000,duration:.4,ease:'power2.out'})});
  c.addEventListener('pointerleave',function(){gsap.to(c,{rotationX:0,rotationY:0,y:0,duration:.9,ease:'elastic.out(1,.4)'})});
  c.addEventListener('pointerdown',function(){gsap.to(c,{scale:.94,duration:.12})});
  c.addEventListener('pointerup',function(){gsap.to(c,{scale:1,duration:.6,ease:'elastic.out(1,.35)'})});
});

/* ---------- 旗幟串（取代跑馬燈）：隨捲動速度擺盪 ---------- */
var gl=$('#gl'),flags=[],FC=['#FF8DAA','#FFD45E','#7BDDB5','#86C8FF','#FFB48A'];
var WORDS={fresh:[['新鮮','直送'],['今日','現採'],['好吃','推薦']],beauty:[['溫和','保養'],['新品','上架'],['送','小樣']],fashion:[['本週','新品'],['舒適','好穿'],['退換','無憂']],alley:[['每晚','上新'],['街頭','選貨'],['出清','5 折']]};
var GT=[];
function buildGarlandTexts(){
  var w=WORDS[T.shopKey()],D=T.D();
  GT=[w[0],w[1],[fmtN(revenue),'num'],[orders+' 張','訂單'],[T.todo().ship+' 筆','待出貨'],['開店','中！'],['謝謝','光臨'],w[2],['滿 '+D.settings.freeOver,'免運'],w[1],w[0]];
  if(typeof buildGarland==='function'&&flags)buildGarland();
}
buildGarlandTexts();
function buildGarland(){
  gl.innerHTML='';flags=[];var W=gl.clientWidth,ns='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(ns,'svg');gl.appendChild(svg);
  [[34,210,150],[170,40,330]].forEach(function(row,ri){
    var y0=row[0],cy=row[1]*0+y0+row[2]*1.0,y2=y0+(ri?-18:14);var P0=[-60,y0],P1=[W/2,cy],P2=[W+60,y2];
    var path=document.createElementNS(ns,'path');path.setAttribute('d','M'+P0+' Q'+P1+' '+P2);path.setAttribute('stroke','#8B6A58');path.setAttribute('stroke-width','4');path.setAttribute('fill','none');path.setAttribute('stroke-linecap','round');svg.appendChild(path);
    var N=Math.max(3,Math.round(W/(150*SC)));
    for(var i=0;i<N;i++){
      var t=(i+.5)/N,x=(1-t)*(1-t)*P0[0]+2*(1-t)*t*P1[0]+t*t*P2[0],y=(1-t)*(1-t)*P0[1]+2*(1-t)*t*P1[1]+t*t*P2[1];
      var dx=2*(1-t)*(P1[0]-P0[0])+2*t*(P2[0]-P1[0]),dy=2*(1-t)*(P1[1]-P0[1])+2*t*(P2[1]-P1[1]);
      var f=document.createElement('div');f.className='flag';f.style.width=(128*SC)+'px';f.style.height=(168*SC)+'px';f.style.fontSize=SC<1?(SC*1.3)+'em':'';f.style.setProperty('--c',FC[(i+ri*2)%5]);
      var tx=GT[(i+ri*4)%GT.length];
      f.innerHTML='<b></b><span'+(tx[1]==='num'?' class="num">'+tx[0]:'>'+tx[0]+'<br>'+tx[1])+'</span>';
      f.style.left=(x-64*SC)+'px';f.style.top=(y-2)+'px';gl.appendChild(f);
      flags.push({el:f,base:Math.atan2(dy,dx)*180/Math.PI,ph:i*.7+ri*1.9});
    }
  });
}
buildGarland();addEventListener('resize',buildGarland);
jelly([gl],'#garland','top 85%');
gsap.ticker.add(function(){
  if(RM){flags.forEach(function(f){f.el.style.transform='rotate('+f.base+'deg)'});return}
  var t=performance.now()/1000,v=Math.min(Math.abs(lenis?lenis.velocity:0)*.45,16);
  flags.forEach(function(f){f.el.style.transform='rotate('+(f.base+Math.sin(t*1.9+f.ph)*(3.5+v))+'deg)'});
});

/* ---------- 開店任務 ---------- */
var CARDS=[
 {c:'#7BDDB5',t:'上架商品',p:'已完成・11/01',s:'done'},
 {c:'#FFD45E',t:'設好運費與超商取貨',p:'已完成・11/02',s:'done'},
 {c:'#FF8DAA',t:'接上綠界金流與物流',p:'已完成・11/03',s:'done'},
 {c:'#86C8FF',t:'寄出第 100 張訂單',p:'87／100・再 13 張',s:'cur'},
 {c:'#FFB48A',t:'發出第一張折價券',p:'完成上一關後解鎖',s:'lock'},
 {c:'#FFF4E2',t:'領取「開店達人」徽章',p:'全部完成的獎勵',s:'lock'}];
function missionImgs(){var P=T.D().products;CARDS.forEach(function(d,i){var im=$('.ph img',d.el);if(im){var p=P[(i*2)%P.length];im.src=T.pimg(p);im.alt=''}});CARDS[0].el.querySelector('h3').textContent='上架 '+T.D().products.length+' 個商品'}
var mc=$('#mcards'),CIR=2*Math.PI*30;
function ringSVG(p){return '<svg viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="9"/><circle class="rp" cx="36" cy="36" r="30" fill="none" stroke="#4B2E22" stroke-width="9" stroke-linecap="round" stroke-dasharray="'+CIR+'" stroke-dashoffset="'+(CIR*(1-p/100))+'"/></svg><b class="rn">'+p+'</b>'}
CARDS.forEach(function(d){
  var el=document.createElement('div');el.className='card'+(d.s==='lock'?' lock':'');el.style.setProperty('--cc',d.c);d.el=el;
  var badge=d.s==='done'?'✓ 已完成':d.s==='cur'?'進行中':'未解鎖';
  var bot=d.s==='cur'?'<div class="ring">'+ringSVG(87)+'</div><button class="btn go" data-cur="完成">完成這一關（示範）</button>':d.s==='done'?'<span></span><button class="btn go done">✓ 完成</button>':'<span></span><button class="btn go done">未解鎖</button>';
  el.innerHTML='<div class="ph"><img src="" alt=""><span class="st">'+badge+'</span></div><div class="tx"><h3>'+d.t+'</h3><p>'+d.p+'</p></div><div class="bot">'+bot+'</div>';
  mc.appendChild(el);
});
missionImgs();
var msc=$('#mscroll'),drag=null;
msc.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;drag={x:e.clientX,l:msc.scrollLeft}});
window.addEventListener('pointermove',function(e){if(drag)msc.scrollLeft=drag.l-(e.clientX-drag.x)});
window.addEventListener('pointerup',function(){drag=null});
var cardEls=CARDS.map(function(d){return d.el});
jelly($$('.mh h2,.mh .ham'),'#missions','top 80%',.15);
jelly(cardEls,'#mscroll','top 88%',.1);
if(!RM)ScrollTrigger.create({trigger:'#missions',start:'top 55%',once:true,onEnter:function(){gsap.to(msc,{scrollLeft:Math.max(0,CARDS[3].el.offsetLeft-300),duration:1.8,ease:'power3.inOut',delay:.9})}});
var mHam=function(){return C.hams.filter(function(l){return l.el.classList.contains('ham-m')})[0]};
function completeMission(){
  var d=CARDS[3],el=d.el,rp=$('.rp',el),rn=$('.rn',el),o={v:87},btn=$('.go',el);
  if(el.dataset.done)return;el.dataset.done=1;btn.textContent='努力中…';
  gsap.to(o,{v:100,duration:1.2,ease:'power2.inOut',onUpdate:function(){rn.textContent=Math.round(o.v);rp.setAttribute('stroke-dashoffset',CIR*(1-o.v/100))},onComplete:function(){
    var r=el.getBoundingClientRect();C.burst(r.left+r.width/2,r.top+r.height*.5,220);
    btn.textContent='✓ 完成';btn.classList.add('done');$('.st',el).textContent='✓ 已完成';$('.tx p',el).textContent='已完成・今天';
    gsap.fromTo(el,{scale:1},{scale:1.06,duration:.2,yoyo:true,repeat:1,ease:'power2.out'});
    gsap.fromTo(rn,{scale:.5},{scale:1,duration:.9,ease:'elastic.out(1,.3)'});
    var nx=CARDS[4].el;nx.classList.remove('lock');$('.st',nx).textContent='進行中';$('.tx p',nx).textContent='解鎖了！去發第一張折價券';
    var b2=$('.go',nx);b2.textContent='開始';b2.classList.remove('done');
    gsap.fromTo(nx,{y:50,scaleY:.9},{y:0,scaleY:1,duration:1.2,ease:'elastic.out(1,.4)'});
    gsap.to(msc,{scrollLeft:Math.max(0,nx.offsetLeft-300),duration:1.1,ease:'power3.inOut',delay:.5});
    var L=mHam();if(L)C.jump(L,'破百了！太強了！');
  }});
}
mc.addEventListener('click',function(e){if(e.target.closest('.go')&&CARDS[3].el.contains(e.target))completeMission()});

/* ---------- 商品牆 ---------- */
var wall=$('#wall'),RCC=['#FFD45E','#7BDDB5','#86C8FF','#FF8DAA'],filt='all',cols=[];
for(var ci=0;ci<4;ci++){var cdiv=document.createElement('div');cdiv.className='col';wall.appendChild(cdiv);cols.push(cdiv)}
function buildWall(animate){
  var D=T.D(),ps=D.products.filter(function(p){return p.status==='on'}).sort(function(a,b){return b.sold30-a.sold30}).slice(0,12);
  cols.forEach(function(c){c.innerHTML=''});
  var pills=$('#pills');pills.innerHTML='';var cats=['all'].concat(D.cats.slice(0,3));
  cats.forEach(function(k){var b=document.createElement('button');b.className='btn sm'+(k===filt?' on':' w');b.dataset.f=k;b.textContent=k==='all'?'全部':k;pills.appendChild(b)});
  ps.forEach(function(p,i){
    var d=document.createElement('div');d.className='tile2';d.dataset.cat=p.cat;d.setAttribute('data-cur','看看');d.style.setProperty('--k',RCC[Math.max(0,D.cats.indexOf(p.cat))%4]);
    if(!p.img&&p.art)d.style.background=(p.art.c==='#FFFFFF'?'#BFD9EF':C.shade(p.art.c,.6));
    d.innerHTML='<img src="'+T.pimg(p)+'" alt="'+p.name+'"><span class="rk">'+(i+1)+'</span><div class="cap">'+p.name+'<small>近 30 天賣出 '+p.sold30+' 件</small></div>';
    gsap.set(d,{rotation:R(-1.8,1.8)});cols[i%4].appendChild(d);
    if(filt!=='all'&&p.cat!==filt)d.classList.add('off');
    if(!RM){
      d.addEventListener('pointerenter',function(){gsap.to(d,{rotation:0,scale:1.04,y:-6,duration:.5,ease:'elastic.out(1,.4)'})});
      d.addEventListener('pointerleave',function(){gsap.to(d,{rotation:R(-1.8,1.8),scale:1,y:0,duration:.6,ease:'elastic.out(1,.4)'})});
    }
  });
  if(animate&&!RM)gsap.fromTo($$('.tile2'),{scale:.3,opacity:0},{scale:1,opacity:1,duration:1,ease:'elastic.out(1,.45)',stagger:{each:.05,from:'random'}});
}
buildWall(false);
if(!RM){
  var tiles2=$$('.tile2');gsap.set(tiles2,{scale:.2,opacity:0});
  ScrollTrigger.create({trigger:'#wall',start:'top 85%',once:true,onEnter:function(){gsap.to($$('.tile2'),{scale:1,opacity:1,duration:1.2,ease:'elastic.out(1,.45)',stagger:{each:.07,from:'random'}})}});
  if(SC===1)cols.forEach(function(c,i){gsap.fromTo(c,{y:i%2?90:-30},{y:i%2?-60:50,ease:'none',scrollTrigger:{trigger:'#wallSec',start:'top bottom',end:'bottom top',scrub:true}})});
  jelly($$('.wh>*'),'#wallSec','top 80%',.1);
}
$('#pills').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  filt=b.dataset.f;$$('#pills .btn').forEach(function(x){x.classList.toggle('on',x===b);x.classList.toggle('w',x!==b)});
  $$('.tile2').forEach(function(t){t.classList.toggle('off',filt!=='all'&&t.dataset.cat!==filt)});
  var L=C.hams.filter(function(l){return l.el.classList.contains('ham-w')})[0];if(L&&!RM)C.jump(L,'挑好囉～')});

/* ---------- 換品牌：整套資料一起換 ---------- */
document.addEventListener('shopchange',function(){
  revenue=T.revenue(7);orders=T.report(7).ord;filt='all';live=0;
  buildBig(revenue);setRevenue(revenue,true);
  if(!RM)gsap.fromTo($$('.tile'),{y:-60},{y:0,duration:1,ease:'bounce.out',stagger:.08});
  fillMeta();fillStats(true);heroSrc();buildGarlandTexts();missionImgs();buildWall(true);
  if(!RM)gsap.fromTo(stk,{scale:.4},{scale:1,duration:.8,ease:'elastic.out(1,.45)',stagger:.06});
});
/* ---------- 換品牌（按鈕） ---------- */
$('#themes').addEventListener('click',function(e){var b=e.target.closest('.sw');if(!b)return;
  C.setTheme(b.dataset.theme);
  var r=b.getBoundingClientRect();C.burst(r.left+r.width/2,r.top+40,70);
  var L=C.hams.filter(function(l){return l.el.parentNode.classList.contains('trio')&&l.k==='lili'})[0];if(L)C.jump(L,'換好囉！');
  if(!RM)gsap.fromTo(b.firstElementChild,{scale:.6},{scale:1,duration:.9,ease:'elastic.out(1,.35)'});
});
if(!RM){
  jelly($$('.cta h2,.cta .sub,.themes .sw,.cta .btn'),'#cta','top 78%',.1);
  var trio=$$('.trio>div');gsap.set(trio,{y:340});
  ScrollTrigger.create({trigger:'#cta',start:'top 40%',once:true,onEnter:function(){gsap.to(trio,{y:0,duration:1.4,ease:'elastic.out(1,.4)',stagger:.18});
    trio.forEach(function(t,i){gsap.to(t,{y:-14,duration:1.2+i*.2,yoyo:true,repeat:-1,ease:'sine.inOut',delay:1.6})})}});
}
})();
