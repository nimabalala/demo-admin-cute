# 示範後台｜棠序問策股份有限公司建置（完整網站）

給潛在客戶點著玩的「電商後台」示範：換成你的品牌，就是你的後台。**純前端靜態網站**（不需要伺服器、資料庫），所有資料都是虛構的。

## 怎麼打開
- **最簡單**：雙擊 `index.html`（首頁）。後台在 `app.html`，從首頁選單點進去即可。
- 資料存在瀏覽器的 localStorage（金鑰 `tx-demo-v1`）。右上角「重設示範資料」可一鍵還原（會保留目前選的品牌）。
- 想用本機伺服器看：`cd site && python3 -m http.server 8080`，開 `http://localhost:8080/`。

## 頁面
| 主選單 | 內容 | 網址 |
|---|---|---|
| 總覽（首頁） | 動畫首頁：近 7 天營收積木數字、今天的四件事、旗幟串、開店任務、熱賣商品牆、換品牌 | `index.html` |
| 訂單與出貨 | 全部訂單（狀態頁籤、搜尋、篩選、批次動作）／批次出貨（綠界取號、手動出貨、CSV、列印出貨單）／退換貨／出貨紀錄／訂單詳情 | `app.html#/orders` 等 |
| 商品 | 商品列表（卡片／清單）／新增與編輯（蝦皮式兩層規格）／庫存／分類／評價 | `#/products` 等 |
| 顧客與客服 | 客服訊息（快速回覆）／顧客名單／會員等級與點數 | `#/customers/inbox` 等 |
| 行銷 | 折價券／優惠活動 | `#/marketing` 等 |
| 網店 | 外觀與首頁（含即時預覽）／頁面／網站選單 | `#/shop` 等 |
| 報表 | 營收折線圖、熱賣前 10、分類佔比、CSV 匯出 | `#/reports` |
| 設定 | 店家資料／運費與出貨／付款／通知／帳號與權限 | `#/settings` 等 |

三家虛構店可隨時切換（右上「換品牌」）：晨露鮮蔬（生鮮）、玫瑰小舖（美妝）、北風衣櫥（服飾）。店名、Logo、主色、商品、訂單、顧客一起換。

可實際操作的重點：批次取號與標記已處理、標記運送中、新增商品、編輯兩層規格（新增／改名／刪除選項、套用到所有款式、錯誤提示）、取消訂單與退貨（自動回補庫存）、折價券與優惠活動、換品牌、重設。

**綠界規則**：付款設定頁沒有任何向顧客加收刷卡手續費的欄位，也不依金額拒絕訂單，並用白話寫明。

## 填入你的 LINE、GA4、Meta Pixel（`config.js`）
```js
window.DEMO_CONFIG = {
  lineUrl: '',        // 例：'https://lin.ee/xxxx' 或 'https://line.me/R/ti/p/@你的ID'
  ga4Id: '',          // 例：'G-XXXXXXXXXX'
  metaPixelId: '',    // 例：'1234567890'
  ...
};
```
- 全部留空也能正常開：按 LINE 按鈕只會跳出提示並在主控台記錄。
- 填了 `lineUrl` 後，每個 LINE 按鈕會自動加上 `utm_source=demo-admin&utm_medium=button&utm_campaign=web-build&utm_content=<按鈕位置>`（位置如 `topbar-cta`、`cta-bottom`、`brand-menu`、`mobile-menu`）。
- 填了 `ga4Id` 才會載入 GA4，按鈕點擊送出事件 `line_cta_click`（帶按鈕位置、文字、頁面）。
- 填了 `metaPixelId` 才會載入 Pixel，按鈕點擊送出 `Contact`。
- 沒填的追蹤碼，網站**不會**連到第三方。

## 重新產生示範資料
`python3 tools/gen_data.py`（產生 `data/*.json` 與 `data/data.js`；`data.js` 是為了雙擊開檔也能讀到資料）。改字後可 `python3 tools/subset.py` 重新子集化字型。

## 部署（尚未部署，只是準備好）
整個資料夾就是靜態網站，丟到任何靜態主機即可（Cloudflare Pages、Netlify、GitHub Pages、Render Static Site、一般虛擬主機）。**上傳時請排除 `_qa/`（截圖與影片，約 15MB）與 `tools/`**；其餘約 3.6MB。首頁是 `index.html`。

## 授權
- 字型：源泉圓體 TW、Fredoka，皆 SIL OFL 1.1（`fonts/OFL-GenSenRounded.txt`）。
- 動畫程式庫：GSAP 3.15.1（含 ScrollTrigger）、Lenis，放在 `vendor/` 離線使用。**正式上線前請再確認 GSAP 目前授權條款適用於你的用途。**
- 倉鼠與服飾／部分美妝插圖：程式繪製，沒有使用 AI 生圖。生鮮與美妝照片來自 Unsplash（免費授權，已剔除含品牌標誌的照片）。
- 所有品牌、客戶、訂單、顧客資料皆為虛構。

## 已知不足
- 資料是靜態假資料；沒有串接真實綠界、金流或物流。
- 服飾與部分美妝商品用自繪插圖，不是實拍照。
- 首頁動畫在低階手機可能不夠順（系統開啟「減少動態」時會自動簡化）。
- 沒有在真實手機上測過，只用 Chromium 模擬 390px 寬。
- 重新整理或清除瀏覽器資料會讓示範資料回到初始（這是預期行為）。

## 品質檢查（`_qa/`）
`desktop_*.png`（1440 寬）、`mobile_*.png`（390 寬）每頁截圖，`op_*.png` 實際操作截圖，`tour.mp4` 約 60 秒導覽影片。檢查腳本在 `tools/`（`smoke.py`、`qa_all.py`、`ops.py`、`home_ops.py`、`tour.py`）。
