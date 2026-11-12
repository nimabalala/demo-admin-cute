/* 介面小零件：提示、彈窗、確認、進場動畫、數字跳動。後台頁面共用。 */
(function(){
var C=window.CUTE,TX=window.TX,$=C.$,$$=C.$$,RM=C.RM;
var U=window.TXUI={};
U.h=TX.esc;
var CHECK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
U.toast=function(t,s){var box=$('#toastbox');if(!box){box=document.createElement('div');box.id='toastbox';document.body.appendChild(box)}
  var e=document.createElement('div');e.className='tst';e.setAttribute('role','status');e.innerHTML='<i>'+CHECK+'</i><div>'+TX.esc(t)+(s?'<small>'+TX.esc(s)+'</small>':'')+'</div>';box.appendChild(e);
  if(!RM)gsap.from(e,{y:30,scale:.8,opacity:0,duration:.5,ease:'back.out(2.2)'});
  setTimeout(function(){if(RM){e.remove();return}gsap.to(e,{y:20,opacity:0,duration:.3,onComplete:function(){e.remove()}})},3200)};
var open=null;
U.modal=function(html,o){o=o||{};U.closeModal(true);
  var sc=$('#scrim');if(!sc){sc=document.createElement('div');sc.id='scrim';sc.className='scrim';document.body.appendChild(sc)}
  var last=document.activeElement;
  sc.innerHTML='<div class="modal'+(o.wide?' wide':'')+'" role="dialog" aria-modal="true" aria-label="'+TX.esc(o.label||'視窗')+'"><button class="x" type="button" aria-label="關閉" data-close>✕</button>'+html+'</div>';
  sc.classList.add('open');var m=$('.modal',sc);
  if(!RM){gsap.to(sc,{opacity:1,duration:.2});gsap.fromTo(m,{y:50,scale:.92,opacity:0},{y:0,scale:1,opacity:1,duration:.5,ease:'back.out(1.8)'})}else sc.style.opacity=1;
  document.body.classList.add('noscroll');
  var f=$('input,textarea,select,button.btn,button.act',m);if(f&&!o.noFocus)setTimeout(function(){f.focus()},60);
  open={sc:sc,m:m,last:last,o:o};
  sc.onclick=function(e){if(e.target===sc||e.target.closest('[data-close]'))U.closeModal()};
  return m};
U.closeModal=function(quick){if(!open)return;var s=open;open=null;var done=function(){s.sc.classList.remove('open');s.sc.innerHTML='';s.sc.style.opacity=0;document.body.classList.remove('noscroll');if(s.last&&s.last.focus&&document.contains(s.last))s.last.focus()};
  if(quick||RM){done();return}gsap.to(s.m,{y:30,opacity:0,scale:.95,duration:.2});gsap.to(s.sc,{opacity:0,duration:.22,onComplete:done})};
document.addEventListener('keydown',function(e){if(e.key==='Escape')U.closeModal();
  if(e.key==='Tab'&&open){var f=$$('button,input,textarea,select,a[href]',open.m).filter(function(x){return !x.disabled&&x.offsetParent});if(!f.length)return;var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
U.confirm=function(title,body,yes,label,danger){var m=U.modal('<h3>'+TX.esc(title)+'</h3><p class="sd">'+TX.esc(body||'')+'</p><div class="mf"><button class="btn w sm" type="button" data-close>先不要</button><button class="btn sm'+(danger?' pk':'')+'" type="button" data-yes>'+TX.esc(label||'好')+'</button></div>',{label:title});
  $('[data-yes]',m).onclick=function(){U.closeModal();yes&&yes()}};
/* 進場：果凍升起（工作區之間切換用輕量版） */
U.enter=function(root,light){var kids=[].slice.call(root.children);if(RM||!kids.length)return;
  gsap.fromTo(kids,{y:light?14:40,opacity:0,scale:light?.985:.96},{y:0,opacity:1,scale:1,duration:light?.38:.8,stagger:light?.035:.07,ease:light?'power3.out':'back.out(1.7)',clearProps:'transform,opacity'})};
U.count=function(el,to,dur){to=+to||0;if(RM){el.textContent=TX.num(to);return}var o={v:0};gsap.to(o,{v:to,duration:dur||.9,ease:'power2.out',onUpdate:function(){el.textContent=TX.num(o.v)}})};
U.st=function(s){return '<span class="st s-'+TX.esc(s)+'">'+TX.esc(s)+'</span>'};
U.debounce=function(f,ms){var t;return function(){var a=arguments,s=this;clearTimeout(t);t=setTimeout(function(){f.apply(s,a)},ms||180)}};
U.tg=function(on,attrs){return '<button type="button" class="tg'+(on?' on':'')+'" role="switch" aria-checked="'+(!!on)+'" '+(attrs||'')+'><i></i></button>'};
U.check=function(on,attrs){return '<button type="button" class="cb'+(on?' on':'')+'" role="checkbox" aria-checked="'+(!!on)+'" '+(attrs||'')+'><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>'};
U.icon={search:'<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.1"/></svg>',spark:'<svg viewBox="0 0 24 24" fill="#FFD45E"><path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z"/></svg>'};
/* 圖片縮小後再存（避免 localStorage 爆掉） */
U.shrink=function(file,max,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.72))};im.onerror=function(){cb(null)};im.src=r.result};r.onerror=function(){cb(null)};r.readAsDataURL(file)};
})();
/* C3（第 7 輪）：檔案上傳欄改成中文按鈕「選擇檔案」與檔名，不顯示瀏覽器預設的英文 Choose File */
(function(){
'use strict';
function fx(i){if(i.hasAttribute('data-fx')||i.hidden)return;i.setAttribute('data-fx','1');i.classList.add('fx-in');
  var w=document.createElement('span');w.className='fpick';w.setAttribute('aria-hidden','true');w.innerHTML='<b>選擇檔案</b><em>還沒選檔案</em>';i.insertAdjacentElement('afterend',w);
  w.addEventListener('click',function(e){if(!i.closest('label')){e.preventDefault();i.click()}})}
function scan(r){(r||document).querySelectorAll&&(r||document).querySelectorAll('input[type=file]:not([data-fx])').forEach(fx)}
document.addEventListener('change',function(e){var i=e.target;if(!i||i.type!=='file')return;var w=i.nextElementSibling;if(!w||!w.classList.contains('fpick'))return;
  var n=i.files&&i.files.length?(i.files.length>1?i.files.length+' 個檔案':i.files[0].name):'還沒選檔案';w.querySelector('em').textContent=n;w.classList.toggle('has',!!(i.files&&i.files.length))},true);
if(document.readyState!=='loading')scan();else document.addEventListener('DOMContentLoaded',function(){scan()});
new MutationObserver(function(){scan()}).observe(document.documentElement,{childList:true,subtree:true});
})();
