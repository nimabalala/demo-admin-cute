/* 追蹤：有填 ID 才載入 GA4／Meta Pixel；LINE 按鈕點擊送事件。設定在 config.js。 */
(function(){
var CFG=window.DEMO_CONFIG||{};
function load(src){var s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s)}
try{if(CFG.ga4Id){window.dataLayer=window.dataLayer||[];window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};load('https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(CFG.ga4Id));window.gtag('js',new Date());window.gtag('config',CFG.ga4Id)}}catch(e){console.warn('[track] GA4 初始化失敗',e)}
try{if(CFG.metaPixelId&&!window.fbq){(function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)})(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');window.fbq('init',CFG.metaPixelId);window.fbq('track','PageView')}}catch(e){console.warn('[track] Meta Pixel 初始化失敗',e)}
function href(loc){if(!CFG.lineUrl)return '';try{var u=new URL(CFG.lineUrl),m=CFG.utm||{};
 if(m.source)u.searchParams.set('utm_source',m.source);if(m.medium)u.searchParams.set('utm_medium',m.medium);if(m.campaign)u.searchParams.set('utm_campaign',m.campaign);u.searchParams.set('utm_content',loc);return u.toString()}
 catch(e){console.warn('[track] config.js 的 lineUrl 不是有效網址：',CFG.lineUrl);return ''}}
window.trackCTA=function(loc,text){
 var url=href(loc),p={button_location:loc,button_text:text||'',link_url:url,page:(location.hash||location.pathname.split('/').pop()||'index.html')};
 console.info('[track]',CFG.eventName||'line_cta_click',p);
 try{if(CFG.ga4Id&&typeof window.gtag==='function')window.gtag('event',CFG.eventName||'line_cta_click',Object.assign({transport_type:'beacon'},p))}catch(e){console.warn('[track] GA4 事件送出失敗',e)}
 try{if(CFG.metaPixelId&&typeof window.fbq==='function'){window.fbq('track','Contact',{content_name:loc});window.fbq('trackCustom',CFG.eventName||'line_cta_click',p)}}catch(e){console.warn('[track] Pixel 事件送出失敗',e)}
 if(url){if(CFG.openInNewTab===false)location.href=url;else window.open(url,'_blank','noopener')}
 else if(window.TXUI&&TXUI.toast)TXUI.toast('LINE 連結還沒設定','這是示範頁，點擊已記錄（見 config.js）');
 return url};
document.addEventListener('click',function(e){var l=e.target.closest('[data-line]');if(l){e.preventDefault();window.trackCTA(l.getAttribute('data-line'),(l.textContent||'').trim())}});
})();
