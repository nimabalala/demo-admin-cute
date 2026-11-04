/* ==========================================================================
   config.js ── 「我也要這樣的後台」LINE 按鈕與追蹤設定（只改這一個檔案）
   --------------------------------------------------------------------------
   lineUrl     棠序 LINE 官方帳號加好友連結，例如 'https://lin.ee/xxxxxxx'。
               留空字串 ''：按鈕照常可點，只在 console 與頁面提示記錄，不跳轉。
   ga4Id       GA4 評估 ID，例如 'G-XXXXXXXXXX'。留空＝不載入 GA4。
   metaPixelId Meta Pixel 數字 ID，例如 '1234567890123456'。留空＝不載入 Pixel。
   utm         網址標籤：utm_source=demo-admin&utm_medium=button&utm_campaign=web-build
               ＆utm_content=<按鈕位置>（位置來自 HTML 的 data-line）。
   事件        GA4：line_cta_click；Meta Pixel：標準事件 Contact（另送自訂事件 line_cta_click）。
   全部留空也不會出錯。
   ========================================================================== */
window.DEMO_CONFIG = {
  lineUrl: '',        // 棠序 LINE 官方帳號連結（琮暉還沒給，先留空）
  ga4Id: '',          // GA4 評估 ID（先留空）
  metaPixelId: '',    // Meta Pixel ID（先留空）
  utm: { source: 'demo-admin', medium: 'button', campaign: 'web-build' },
  eventName: 'line_cta_click',
  openInNewTab: true
};
