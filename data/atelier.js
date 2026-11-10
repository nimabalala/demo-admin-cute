/* T03 質感精品主題的示範店「深裁 ATELIER PROFOND」（虛構）。
   很薄的一層：沿用 alley 的商品資料與穿搭照，換店名、口號、活動字句與聯絡資料；商品照改用 img/atelier 的米色棚拍照。
   要放在 data/alley.js 之後。 */
(function(){var D=window.TX_DATA;if(!D||!D.alley||D.atelier)return;
var s=JSON.stringify(D.alley)
  .split('巷尾選物 ALLEY 27').join('深裁 ATELIER PROFOND')
  .split('巷尾選物').join('深裁')
  .split('alley27-demo').join('profond-demo')
  .split('街頭感十足').join('俐落有分寸')
  .split('很有街頭感').join('很有質感')
  .split('正式與街頭都能穿').join('正式與日常都能穿')
  .split('平價街頭選貨，每晚上新').join('少量裁製，一季只上幾件')
  .split('img/alley/a').join('img/atelier/a');/* 深裁用自己的棚拍商品照（img/atelier），巷尾選物不受影響 */
var a=JSON.parse(s);
a.key='atelier';a.name='深裁';a.slogan='為少而精的衣櫃而作';a.acc='atelier';a.logo='atelier';
a.banner=['秋冬系列 少量上架','滿 NT$1,500 免運','門市試穿 預約制'];
a.slides=[{title:'秋冬系列 少量上架',sub:'為少而精的衣櫃而作',link:'/new'},{title:'經典大衣 專屬修改',sub:'袖長與衣長免費調整',link:'/products'},{title:'滿 NT$1,500 免運',sub:'全館適用',link:'/products'}];
a.store={email:'atelier@profond-demo.example',phone:'02-0000-0303',addr:'台北市示範路 303 號（虛構）'};
a.menu=['首頁','全部商品','外套','鞋款','關於我們','聯絡我們'];
D.atelier=a})();
