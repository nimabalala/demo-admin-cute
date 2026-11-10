T03 質感精品主題自帶字型（只在 html.sk-t03 載入）
- GenWanMin2TW-EL-t03.woff2／GenWanMin2TW-R-t03.woff2：源雲明體月 GenWanMin2 TW（ButTaiwan），SIL OFL 1.1，見 OFL-GenWanMin2TW.txt。
  依網站實際用到的字元子集化（pyftsubset，掃 *.html、js/、data/），字型名稱未更改。缺字自動退回 Noto Serif TC。
- BodoniModa-t03.woff2／BodoniModa-Italic-t03.woff2：Bodoni Moda（indestructible type），SIL OFL 1.1，見 OFL-BodoniModa.txt。
  只保留拉丁字元，保留 wght、opsz 可變軸。
重新產生：python3 tools/t03_fonts.py
