/* T03 質感精品主題的示範店「深裁 ATELIER PROFOND」（虛構）。
   很薄的一層：沿用 alley 的商品資料，換店名、口號、活動字句與聯絡資料；商品照改用 img/atelier 的米色棚拍照（含非主色），穿搭輪盤的模特兒照也改用 img/atelier/lookN 棚拍照；首屏與品牌故事用 img/atelier/fullN（同一批棚拍照的完整版）；商品名稱不含顏色字。
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
/* 深裁專用：商品名稱拿掉顏色字（顏色改由規格顯示；購物車、訂單顯示「品名／顏色／尺寸」）。巷尾選物的名稱不變 */
var RN={'落肩駝色長大衣':'落肩長大衣','炭灰直筒寬褲':'直筒寬褲','白色厚底板鞋':'厚底板鞋','卡其雙排扣風衣':'雙排扣風衣','黑色德比皮鞋':'德比皮鞋','軍綠百褶長裙':'百褶長裙','深棕樂福鞋':'樂福鞋','炭灰單排扣西裝外套':'單排扣西裝外套','灰色打褶西裝褲':'打褶西裝褲','奶油白低筒帆布鞋':'低筒帆布鞋','奶油白針織開衫':'針織開衫','咖啡燈芯絨長裙':'燈芯絨長裙','黑色切爾西短靴':'切爾西短靴','奶油白高領針織衫':'高領針織衫','深藍錐形長褲':'錐形長褲','白色牛津襯衫':'牛津襯衫'};
Object.keys(RN).forEach(function(k){s=s.split(k).join(RN[k])});
var a=JSON.parse(s);a.rename=RN;
a.key='atelier';a.name='深裁';a.slogan='為少而精的衣櫃而作';a.acc='atelier';a.logo='atelier';
a.banner=['秋冬系列 少量上架','滿 NT$1,500 免運','門市試穿 預約制'];
a.slides=[{title:'秋冬系列 少量上架',sub:'為少而精的衣櫃而作',link:'/new'},{title:'經典大衣 專屬修改',sub:'袖長與衣長免費調整',link:'/products'},{title:'滿 NT$1,500 免運',sub:'全館適用',link:'/products'}];
/* 深裁專用：非主色的棚拍照（img/atelier/aXX-代碼.webp、-2 細節、-3 另一面），商品頁切換顏色時換圖；商店列表維持主色 */
a.cshots={a01:{'黑':'k'},a02:{'黑':'k'},a03:{'黑白':'kw'},a04:{'黑':'k'},a05:{'黑':'k'},a07:{'黑':'k','灰':'g'},a08:{'黑':'k'},a09:{'黑':'k'},a10:{'黑':'k'},a11:{'黑':'k'},a13:{'淺藍':'lb'},a14:{'黑':'k'},a15:{'黑':'k'},a16:{'灰':'g'},a17:{'黑':'k'},a19:{'黑':'k'},a20:{'淺藍':'lb'}};
/* 深裁專用：穿搭輪盤的米色棚拍模特兒照（順序對應 lbMap 的 6 套） */
a.lookImgs=[1,2,3,4,5,6].map(function(i){return 'img/atelier/look'+i+'.webp'});
/* 棚拍模特兒照的熱點位置（百分比，順序同 lbMap） */
a.lbXY=[[[78,45],[52,24],[50,75]],[[28,35],[48,65],[62,93]],[[55,33],[50,62],[43,93]],[[27,36],[46,66],[50,25]],[[30,33],[55,62],[72,93]],[[56,30],[55,65],[42,92]]];
a.store={email:'atelier@profond-demo.example',phone:'02-0000-0303',addr:'台北市示範路 303 號（虛構）'};
a.menu=['首頁','全部商品','外套','鞋款','關於我們','聯絡我們'];
D.atelier=a})();
