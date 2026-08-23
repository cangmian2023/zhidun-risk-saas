import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from './PageShell'

/* 集团户 · 1:1 复刻
 * 央企：record/qixin/营销 - 集团户 - 央企.html（97 家）
 * 国企：record/qixin/营销 - 集团户 - 国企.html（100 家）+ 截图前 12 条实时数字修正
 */

type GroupRow = { name: string; member: string; core?: string; logo?: string; logoSvg?: React.ReactNode }

type TabDef = { key: string; label: string }

const TABS: TabDef[] = [
  { key: 'watch', label: '关注' },
  { key: 'yangqi', label: '央企' },
  { key: 'guoqi', label: '国企' },
  { key: 'minying', label: '民营' },
  { key: 'waizi', label: '外资' },
  { key: 'jigou', label: '机构' },
]

const YANGQI_GROUPS: GroupRow[] = [
  { name: '中国移动通信集团', member: '71,156', core: '75', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/357a8c353939cfa76621717ab649fa38.jpg' },
  { name: '中国石化集团', member: '59,973', core: '83', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/c1025525272108fb5544625134ed4e90.jpg' },
  { name: '中国电信集团', member: '47,712', core: '51', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/52ec4c84f4e841605374515110db8712.jpg' },
  { name: '中国石油天然气集团', member: '43,845', core: '129', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/8e8be0402fefba9ae011e5f465a25479.jpg' },
  { name: '中国联通集团', member: '42,628', core: '23', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/7ea1c4a1b6c0e11fb54c8a8bda8a8c68.jpg' },
  { name: '国家电网集团', member: '36,507', core: '230', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/c82329786656c751f0c8d373855fb038.jpg' },
  { name: '中国医药集团', member: '21,030', core: '187', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/be7ec03d5aa824108bf7252f6279c05e.jpg' },
  { name: '华润集团', member: '16,104', core: '72', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/21bdc686b7b7d103deff6f41a909c77e.jpg' },
  { name: '中国建筑集团', member: '10,480', core: '192', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/185f9983a97b764f9ccb638272df1af9.jpg' },
  { name: '中国铁路工程集团', member: '8,746', core: '622', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/cdf6432ebf5fd7a018e31793eadd30fe.jpg' },
  { name: '中国铁道建筑集团', member: '8,252', core: '696', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fa658c5746ca1e51967cb57d66014a39.jpg' },
  { name: '国家电力投资集团', member: '7,237', core: '171', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/16b7c9b151e7f6c2901703f991627829.jpg' },
  { name: '中国电力建设集团', member: '6,522', core: '239', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/7ea16e0f68bd01ccc5e80900825fa5ea.jpg' },
  { name: '中国交通建设集团', member: '6,370', core: '110', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/25fa10b3fcc49dba232a1c4f4034eca4.jpg' },
  { name: '招商局集团', member: '6,126', core: '51', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5eb9106be34660dd769ad7f9be1d48c7.jpg' },
  { name: '中国五矿集团', member: '5,870', core: '150', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/9ab4a0f6dfdb5b3006962e0da1a055a4.jpg' },
  { name: '国家能源投资集团', member: '5,453', core: '158', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/731c20e323d7fbc34c300d82b43ff141.jpg' },
  { name: '中国保利集团', member: '5,276', core: '46', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/86be6b1d2e2d22b2ad74eef17179c4a6.jpg' },
  { name: '中国旅游集团', member: '5,268', core: '41', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/7dcfe21d0b0fbfe3705088f36b7a88f2.jpg' },
  { name: '中国华能集团', member: '5,223', core: '77', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fe9ccbc3d763b6ed8ead0a2fb66bf804.jpg' },
  { name: '中国航空工业集团', member: '5,077', core: '102', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d4c5d161ef3b9dbdcd9e57ccb0d420a4.jpg' },
  { name: '中国核工业集团', member: '5,022', core: '53', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/4743dd22f093170c9b81498fa091e867.jpg' },
  { name: '中国能源建设集团', member: '4,491', core: '129', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0c18db32e5fc31fe46047b3ae45cedc2.jpg' },
  { name: '中国机械工业集团', member: '4,256', core: '113', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d242032d05b172b9cbfa3f1d912d61dd.jpg' },
  { name: '中国建材集团', member: '4,110', core: '104', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d9e5aedc46d378290d49d17509805b7e.jpg' },
  { name: '中国华电集团', member: '3,460', core: '69', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a14f6c39564b0dd7a992154bcf43b29a.jpg' },
  { name: '中国南方电网集团', member: '3,322', core: '77', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/92994dcb2a6469a99e326b8298fd1191.jpg' },
  { name: '中国通用技术集团', member: '3,320', core: '71', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b36470e7f2c9a57c824295eb4f7a86ec.jpg' },
  { name: '中国电子信息产业集团', member: '3,181', core: '79', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/514119fa81fff03b595714b088cc8dd9.jpg' },
  { name: '中国兵器工业集团', member: '3,124', core: '95', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/feef7890c8ce9acb57243d8ef508a5e2.jpg' },
  { name: '东风汽车集团', member: '3,112', core: '25', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/969c3e34045feb2625eb51897bffded3.jpg' },
  { name: '中国远洋海运集团', member: '3,032', core: '37', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2e72a59744fed5ff3ef90f97e16a814c.jpg' },
  { name: '中国宝武钢铁集团', member: '2,900', core: '69', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2eaa7f11f07958296d5b0661d04e1825.jpg' },
  { name: '中国中化控股集团', member: '2,788', core: '39', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/3f2d1048e7477e78f306b1d3579ec4ef.jpg' },
  { name: '中国航天科工集团', member: '2,716', core: '43', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/ecd04b92fe32bafcbb27b62fcb75414d.jpg' },
  { name: '中国铝业集团', member: '2,706', core: '49', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d6c2ce6ffefefac93c5c8feae7a12122.jpg' },
  { name: '中粮集团', member: '2,470', core: '63', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2a69b978ec976e9ffe104b5db5842ef7.jpg' },
  { name: '中国海洋石油集团', member: '2,432', core: '30', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/1939bc2b5bb614dcb9d384d508a193b3.jpg' },
  { name: '中国电科集团', member: '2,412', core: '70', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/83267e8cf5c085b525229b0299dc85b5.jpg' },
  { name: '中国大唐集团', member: '2,217', core: '74', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/17d2f0191430747e37ef24b0a316381d.jpg' },
  { name: '中国节能环保集团', member: '2,215', core: '184', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0f4198f230979bd577365943bda06a69.jpg' },
  { name: '国家开发投资集团', member: '2,152', core: '54', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/ce34cac854e6b65bf78d2271cfaf933a.jpg' },
  { name: '中国长江三峡集团', member: '1,959', core: '84', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/35a64fc1401ed52157023fc30945422b.jpg' },
  { name: '中国诚通集团', member: '1,912', core: '60', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b54e843b09e0416ecd6d34bd11750397.jpg' },
  { name: '中国中车集团', member: '1,890', core: '41', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a77899e897ac96c320137497b2236f84.jpg' },
  { name: '中国中煤能源集团', member: '1,890', core: '55', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d3b895b9036983339dabba5c205c0dc2.jpg' },
  { name: '中国储备粮管理集团', member: '1,842', core: '413', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/649915f95ea754640082b5d78ea2826c.jpg' },
  { name: '中国物流集团', member: '1,832', core: '44', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a516d67b6b61044709b9cf2cd35d5c20.jpg' },
  { name: '深圳华侨城集团', member: '1,666', core: '40', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/868c3483e16ec295b882e65bf1be2b01.jpg' },
  { name: '鞍钢集团', member: '1,642', core: '84', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/87b8a66502d5f9c218426044e4539580.jpg' },
  { name: '中国广核集团', member: '1,516', core: '33', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/9fe709b05e753c8877c865ffd0677603.jpg' },
  { name: '中国航天科技集团', member: '1,499', core: '46', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/27a684980091d9e86ecfc1f07c9fa39e.jpg' },
  { name: '中国南方航空集团', member: '1,495', core: '23', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d7ca1c683c538bd115ecd3e5834181d4.jpg' },
  { name: '中国化学工程集团', member: '1,412', core: '37', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5a2c784975272a86f367e6d042213acd.jpg' },
  { name: '中国兵器装备集团', member: '1,357', core: '56', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/e9716b4f50a5a0e1f52d6b677985dbd6.jpg' },
  { name: '中国国际技术智力合作集团', member: '1,319', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2dd948dd28840b47c6ba93a008c347b6.jpg' },
  { name: '新兴际华集团', member: '1,304', core: '30', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/30671049633258113b42137728f03aa1.jpg' },
  { name: '中国长安汽车集团', member: '1,289', core: '20', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0c929daa9a01caab6f4627b8eecbcdae.jpg' },
  { name: '中国盐业集团', member: '1,235', core: '45', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d1e697f58f9fbe09304ea452c1ec913f.jpg' },
  { name: '中国东方航空集团', member: '1,209', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/da03144e5cb16852371eeb57bd0002dc.jpg' },
  { name: '中国航空集团', member: '1,150', core: '17', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/007947e407937b1cca7c5d43016de736.jpg' },
  { name: '中国农业集团', member: '1,095', core: '38', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/befcf424a0691ced4a5f0605c9c0959e.jpg' },
  { name: '中国船舶集团', member: '1,002', core: '42', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d1fbb6c21a2afe0b8c3788d5c6b30cdf.jpg' },
  { name: '中国检验认证集团', member: '929', core: '72', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/556e46c220a7110bd2c9fedce030167a.jpg' },
  { name: '中国煤炭地质总局集团', member: '853', core: '40', logo: '' },
  { name: '中国林业集团', member: '831', core: '62', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/cfb6051186e755fe24898777c45dee6a.jpg' },
  { name: '中国有色矿业集团', member: '820', core: '26', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/64823b2fbcd89456a0ba931844670da1.jpg' },
  { name: '中国第一汽车集团', member: '818', core: '17', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/56500d6fefc6422df74f77705a4402e8.jpg' },
  { name: '中国融通集团', member: '791', core: '15', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5ff0724f6f9ce2acd739d821e6ed0d6f.jpg' },
  { name: '中国电气装备集团', member: '695', core: '44', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a477fcb39d761c0813e452e117354273.jpg' },
  { name: '中国冶金集团', member: '684', core: '31', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/11c4c142131231afb3f04b3f1780f109.jpg' },
  { name: '中国黄金集团', member: '674', core: '71', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fad01b9fe8eee65a75fff01214218a0f.jpg' },
  { name: '中国煤炭科工集团', member: '640', core: '41', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a3a8c1f6bf48761eb52eb148f249d5ab.jpg' },
  { name: '中国铁路通信信号集团', member: '623', core: '38', logo: '' },
  { name: '中国航空发动机集团', member: '480', core: '30', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/927d10495d80076c8009f6688d4f4b89.jpg' },
  { name: '建筑科学研究院集团', member: '379', core: '16', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/6c135473935aa3c72fd880fa1b9b76b1.jpg' },
  { name: '中国建设科技集团', member: '335', core: '11', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/7a6d03c1eb7de6e920341bb9cb478b8a.jpg' },
  { name: '中国东方电气集团', member: '332', core: '23', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/1f0cde4701da405e74ec11da122224b7.jpg' },
  { name: '中国南光集团', member: '277', core: '18', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5f18c439686e47d49f4bbb55e60485ca.jpg' },
  { name: '中国机械科学研究总院集团', member: '248', core: '23', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/64988122bf4710280ba6b741c72f9754.jpg' },
  { name: '国家石油天然气管网集团', member: '246', core: '54', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f67a091e22e97ef17ff706ad60bf1ae3.jpg' },
  { name: '中国南水北调集团', member: '237', core: '16', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/3bf4eda2604b4b006020b603f4bcd306.jpg' },
  { name: '中国信息通信科技集团', member: '236', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f0db78bbf4d812a2ed2304ac209b282c.jpg' },
  { name: '中国资源循环集团', member: '235', core: '19', logo: '' },
  { name: '哈尔滨电气集团', member: '224', core: '30', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/118ef1ae7bd02d3faef6436305eacaf8.jpg' },
  { name: '中国国际工程咨询集团', member: '223', core: '16', logo: '' },
  { name: '中国钢研科技集团', member: '213', core: '19', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/16c31447194224c8a736f5d1e9c94043.png' },
  { name: '中国稀土集团', member: '209', core: '24', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/188fc3150c946cb29a5674d60def7302.jpg' },
  { name: '中国商用飞机集团', member: '139', core: '13', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/aa50f8d109ba92eae4f7150a36d3a0b7.jpg' },
  { name: '中国航空器材集团', member: '137', core: '24', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/ca319246825f2a0a9bb9ce8e7f84899b.jpg' },
  { name: '中国有研科技集团', member: '123', core: '19', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/32fc8ea2bccfc9f098a1345b24d7dc49.jpg' },
  { name: '一重集团', member: '104', core: '23', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b8be76f63580de7f9d8e0278d924fc6b.jpg' },
  { name: '中国民航信息集团', member: '100', core: '17', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a3e93716141d73b40984ed03761f444c.jpg' },
  { name: '中国安能建设集团', member: '99', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/bf769dc8e15c21b2571284e87ba16a01.jpg' },
  { name: '矿冶科技集团', member: '94', core: '22', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/bba3a6a2ebaba72e6bed75ac69bca57f.jpg' },
  { name: '中国卫星网络集团', member: '14', core: '8', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2bc41ebeaf7cb45715c68057ae23c0ec.jpg' },
  { name: '中国矿产资源集团', member: '9', core: '7', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f9ab300fa4187795541357b9ea28348e.jpg' },
]

const GUOQI_GROUPS: GroupRow[] = [
  { name: '中国邮政集团', member: '122,062', core: '31', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/054719c3a7c5e12ab294a8469619ba53.jpg' },
  { name: '农业银行集团', member: '52,903', core: '45', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/8c10d1ee682a55859db65da4f5fc003b.jpg' },
  { name: '工商银行集团', member: '39,531', core: '42', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/6bc9469db41c9ddcd6e2c422b2acf33d.jpg' },
  { name: '建设银行集团', member: '32,540', core: '54', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/df7cf242a1b31a39d2521532981b28f4.jpg' },
  { name: '中国人寿保险集团', member: '27,836', core: '12', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/eb71d528a50a423ec4784c396add149f.jpg' },
  { name: '中国国家铁路集团', member: '27,257', core: '138', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a85f3a5c8281f91666b52250755bc8dd.jpg' },
  { name: '中国人保集团', member: '19,876', core: '15', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b502dc9bc36de1fbe55c5fcb17d6fb6a.jpg' },
  { name: '中国银行集团', member: '18,746', core: '13', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0d3bca63495f69d33a019237ca66639a.jpg' },
  { name: '中国烟草集团', member: '15,048', core: '103', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/265866bf3723bb7614dd4584ed0779e3.jpg' },
  { name: '光明食品集团', member: '11,850', core: '111', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f58d4b38ecb160dec65019aea2c7c308.jpg' },
  { name: '中国中信集团', member: '9,595', core: '101', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/8d7f93a848125956f158c77d0af24b47.jpg' },
  { name: '北京首都旅游集团', member: '9,473', core: '54', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d8585620fa11670c5f5d7d88f78680fe.jpg' },
  { name: '中国太平洋保险股份集团', member: '8,949', core: '13', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/66bc1bef71378a9a31baea620ab09272.jpg' },
  { name: '四川商业投资集团', member: '6,439', core: '52', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/4648732a00638e187996ff6b91e2a2a4.jpg' },
  { name: '百联集团', member: '6,207', core: '48', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/26a888fa19835b0c22078900d51b0875.jpg' },
  { name: '交通银行集团', member: '6,018', core: '18', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/911e239955822ffcad6a3ba4fa06202d.png' },
  { name: '中国供销集团', member: '5,884', core: '131', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/862d640ad4bbfb42559b126475892bbe.jpg' },
  { name: '中国光大集团', member: '5,828', core: '29', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/81a98539c10c2d887b0b122293074fd2.jpg' },
  { name: '北京国资运营管理集团', member: '5,718', core: '73', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/148087a3485a76415863908c0375022b.jpg' },
  { name: '四川发展集团', member: '5,245', core: '137', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/6edfc94520b9f32acb04e570206214cc.jpg' },
  { name: '中国东方资产管理集团', member: '5,109', core: '213', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/961335c641d9fec014d4dae620d07b52.jpg' },
  { name: '珠海华发集团', member: '4,902', core: '95', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/8e495a6c39d23baa0780b3509efc5983.jpg' },
  { name: '上海上实集团', member: '4,465', core: '36', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f9f71c8e58aa1aa20ad72f32452e783b.jpg' },
  { name: '北大荒农垦集团', member: '4,316', core: '327', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a884d84e5edab402bdd7c08dbca08eca.jpg' },
  { name: '中国广播电视网络集团', member: '4,206', core: '33', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/4fae0d35180838f99a731c274bbf33b1.jpg' },
  { name: '山东高速集团', member: '4,027', core: '119', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/bf1f960c50af3cf1424e0db10855e105.jpg' },
  { name: '阳光保险集团', member: '3,976', core: '12', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/64d3cd6c6126a2a0dd51693e3f4056fc.jpg' },
  { name: '新疆维吾尔自治区供销合作社联合社集团', member: '3,765', core: '22', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/54d8e43a32ea2cee2e159f0ce040fb3a.jpg' },
  { name: '陕西延长石油集团', member: '3,612', core: '86', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a105117737092ef738d48f78d7eeb367.jpg' },
  { name: '中国太平保险集团', member: '3,482', core: '13', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/71d2dd88f181a735774ea5c9c2f316c6.jpg' },
  { name: '农发行集团', member: '3,466', core: '40', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/9278b51883fe86eb74e69f4df0646c0f.jpg' },
  { name: '中国同仁堂集团', member: '3,382', core: '24', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/1094a8f246a6582f27780a0cea0891ef.png' },
  { name: '兴业银行集团', member: '3,318', core: '13', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/db99b5baf6ef67d6a42a241f0480f7b1.jpg' },
  { name: '山东能源集团', member: '3,301', core: '221', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/43c342bc6374fe2cfff2698ac5fd2b16.jpg' },
  { name: '河南投资集团', member: '3,254', core: '94', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5a1c5933c2e6dfe5b0b76251b3db7b95.jpg' },
  { name: '中百集团', member: '3,238', core: '15', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/3f6490659f56a7412defdeab79f29b47.jpg' },
  { name: '上海汽车工业集团', member: '3,201', core: '21', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b41a9e028db4c8473c81f4377496a07d.jpg' },
  { name: '重庆化医集团', member: '3,116', core: '98', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/08b1c8ec1333f019ec405095b900855e.jpg' },
  { name: '四川金融集团', member: '3,069', core: '15', logo: '' },
  { name: '上海电气集团', member: '3,047', core: '87', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5a97c9583df7d299fd281821abedee8e.jpg' },
  { name: '浦发银行集团', member: '3,002', core: '31', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2164278bbf81e60f2a0568dc1dcb0e13.png' },
  { name: '南京新工投资集团', member: '2,951', core: '51', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/6fbec0e8dafe7a77eea4c71f67cd6f85.jpg' },
  { name: '北京首农食品集团', member: '2,896', core: '32', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f27edf928b3539be5809230e00432006.jpg' },
  { name: '海尔集团', member: '2,868', core: '58', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/c2cd725eaba511b3bc871744f7aa7dfb.jpg' },
  { name: '中国再保险集团', member: '2,728', core: '7', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5eefc54912374d1e68370092a55afaef.jpg' },
  { name: '山东省国投集团', member: '2,681', core: '59', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/c205c257ddbe09f5deb40272d671e7de.jpg' },
  { name: '水发集团', member: '2,648', core: '119', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/e56c1d9b1c0eda37627055bdb66c191c.jpg' },
  { name: '重庆渝富集团', member: '2,480', core: '16', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/16da5daeb8176d0225ba8ac8da48f6e8.jpg' },
  { name: '广州建筑集团', member: '2,454', core: '74', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/3d7a55c6c2604364bbf9445e235176ee.jpg' },
  { name: '锦江国际集团', member: '2,437', core: '36', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/bdcd3317be5436d7391e60336b135571.jpg' },
  { name: '申能集团', member: '2,412', core: '30', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d5ebfe85d3e44ba3e91685f2fbc2b05f.jpg' },
  { name: '中国出版集团', member: '2,402', core: '26', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5531cc8b9c7be0dba69f11464ca28249.jpg' },
  { name: '甘肃省国投集团', member: '2,360', core: '83', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/93dcecca3599f390809b8dcfe29154d5.jpg' },
  { name: '天津泰达投资集团', member: '2,345', core: '73', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b15b4f6ec9ab51e1bfdc2b22540831aa.jpg' },
  { name: '中国化工集团', member: '2,299', core: '53', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/7141dcf179cfa26d00594dbe48dbea53.jpg' },
  { name: '广州市城建投资集团', member: '2,299', core: '65', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5def46571c2409d863db544ab0f1a004.jpg' },
  { name: '江西省国资运营控股集团', member: '2,283', core: '112', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/8761b229231f7c1c192ab8951354e0fe.jpg' },
  { name: '内蒙古农商行集团', member: '2,235', core: '3', logo: '' },
  { name: '物产中大集团', member: '2,203', core: '44', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/868b03e585c671b20089199ac07fe095.jpg' },
  { name: '四川能源投资集团', member: '2,155', core: '82', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/45cf4c7a544ece3970eceaeae008843b.jpg' },
  { name: '湖南建工集团', member: '2,153', core: '70', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/535aa60da2e10dd3bd1294e1ba4836ee.jpg' },
  { name: '新华保险集团', member: '2,109', core: '11', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/edad3c59646715fc51fd66cb0404cd02.jpg' },
  { name: '重庆物流集团', member: '2,101', core: '37', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a43c7f9c4b93ce2fedb31293a52c969f.jpg' },
  { name: '广东出版集团', member: '2,099', core: '121', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f9d8b5a5d08d1d466ef4b204acf9322d.jpg' },
  { name: '广州越秀集团', member: '2,083', core: '62', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d7ca7df94a1a01b28d61f81fd070d82d.jpg' },
  { name: '广东省建工集团', member: '2,029', core: '66', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/e7e3212e689001129e94ce2f2e3fd4c8.jpg' },
  { name: '西安曲江文化控股集团', member: '2,026', core: '50', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/371a60768efb65140a4eba801d8b2d75.jpg' },
  { name: '杭州市城建投资集团', member: '2,023', core: '45', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/316cbfad7620044bf4be8992a3e8ed96.jpg' },
  { name: '四川旅游投资集团', member: '2,009', core: '28', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/cc15688ef1119a122465c61078689c6c.jpg' },
  { name: '浙江交通投资集团', member: '1,993', core: '103', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/38a3582ff92c2e9f23b830d20f279fb2.jpg' },
  { name: '广东环保集团', member: '1,987', core: '55', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0a9955935e666f0ab087b6dfb39d6a4d.jpg' },
  { name: '长江产业投资集团', member: '1,987', core: '61', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fd0ddcef03d73fce4c8e87c5c4d28568.jpg' },
  { name: '黑龙江建设投资集团', member: '1,969', core: '52', logo: '' },
  { name: '陕西煤业化工集团', member: '1,935', core: '126', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/1e30903408539a1135126127c7894db8.png' },
  { name: '广州岭南商旅投资集团', member: '1,915', core: '37', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/9aa78a72dd33ba41971cef4a73fbcab7.jpg' },
  { name: '云南建设投资集团', member: '1,910', core: '158', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5b154043b8158b873bd6f3ea26076085.jpg' },
  { name: '甘肃建设投资集团', member: '1,896', core: '90', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/3757816ae7f1ea5ab3a432ccd5a22e93.jpg' },
  { name: '吉林金融集团', member: '1,896', core: '28', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5c7c4ee9088057bb8490dd98c8b64457.jpg' },
  { name: '湛江资产运营集团', member: '1,876', core: '92', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fb02c2523722c7a1951fb15fae79b7ce.jpg' },
  { name: '大家保险集团', member: '1,867', core: '11', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/1473d0e8e40c2f2e01f3bef140ee84e8.jpg' },
  { name: '辽宁金融集团', member: '1,853', core: '15', logo: '' },
  { name: '渝农商行集团', member: '1,852', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/30b1b907be92b02ed7d1b2bb6a30a274.jpg' },
  { name: '海南农垦投资集团', member: '1,842', core: '63', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/8d983316037db8dac79abefedbc12bcd.jpg' },
  { name: '浙江省国贸集团', member: '1,827', core: '74', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/77f81e713e5dddb9750f70ff0648f185.jpg' },
  { name: '山西建设投资集团', member: '1,813', core: '68', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2b099cd337e771a86feece26b853c491.jpg' },
  { name: '陕西旅游集团', member: '1,806', core: '48', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/bdce0d665bbae43e1bec8ae7da144c01.jpg' },
  { name: '上海纺织集团', member: '1,770', core: '48', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/866ca5e09e2f3ed00d99b4cf8ecd772c.jpg' },
  { name: '合肥建设投资集团', member: '1,766', core: '65', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/6221a62b8c12cbb6a1b566c3c73e884c.jpg' },
  { name: '首钢集团', member: '1,700', core: '72', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/64ae7999cfb11064a07c23586ceff783.jpg' },
  { name: '中石油昆仑燃气集团', member: '1,689', core: '15', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fd73d5fc3bf9b8a90a9bafb6d5f3d44b.jpg' },
  { name: '佛山投资集团', member: '1,686', core: '28', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/9f39e308a0265386f17bd990029acbe5.jpg' },
  { name: '安徽交通集团', member: '1,681', core: '78', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/8ddfdc530e884bf26d28e4a0162da0cd.jpg' },
  { name: '中国信达集团', member: '1,680', core: '202', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2e616755264524935127a82341982390.jpg' },
  { name: '江苏苏豪集团', member: '1,658', core: '70', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5ba2ced21d33db821c1969cc36534c53.jpg' },
  { name: '北京国际信托集团', member: '1,650', core: '95', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/cae8738adf031acacd51813d3f342d9d.jpg' },
  { name: '山西焦煤集团', member: '1,649', core: '236', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/4c67ae9d1edcbcd266c700488375cbad.jpg' },
  { name: '北京城建集团', member: '1,635', core: '54', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a7579cc0c69f34301df0b7341f6dc109.jpg' },
  { name: '山东商业集团', member: '1,607', core: '71', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f0faaf69cfbc1fc37874324af525bde8.jpg' },
  { name: '陕西建工集团', member: '1,602', core: '90', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/5cbfde9afcc28a1ba5038d64fd5a0867.jpg' },
  { name: '浙江能源集团', member: '1,586', core: '135', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0913088238ad0a8299ab73f3bff176b7.jpg' },
]

const MINYING_GROUPS: GroupRow[] = [
  { name: '南京沃德凯斯投资资产管理集团', member: '57,349', core: '-', logo: '' },
  { name: '顺丰控股集团', member: '16,818', core: '13', logo: '' },
  { name: '一心堂集团', member: '15,526', core: '32', logo: '' },
  { name: '大参林集团', member: '14,387', core: '125', logo: '' },
  { name: '中国平安集团', member: '13,363', core: '51', logo: '' },
  { name: '北京盈科环球控股集团', member: '9,242', core: '18', logo: '' },
  { name: '万科企业集团', member: '8,539', core: '110', logo: '' },
  { name: '健之佳集团', member: '7,849', core: '35', logo: '' },
  { name: '深圳海王集团', member: '7,652', core: '20', logo: '' },
  { name: '易购集团', member: '7,436', core: '298', logo: '' },
  { name: '南京云致享网络集团', member: '7,228', core: '17', logo: '' },
  { name: '漱玉平民集团', member: '5,828', core: '9', logo: '' },
  { name: '北京惠宜选即时科技集团', member: '4,555', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/25838852c9312bf281bc5446250b2dd7.jpg' },
  { name: '国美电器集团', member: '2,883', core: '19', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d4cb3073cfbe966eb1e776256b38bc3a.jpg' },
  { name: '北京艺龙网信息集团', member: '2,416', core: '10', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2a74567607d045ce505ce8fd31c8267f.jpg' },
  { name: '北京融创集团', member: '2,310', core: '26', logo: '' },
  { name: '北京麦当劳食品集团', member: '2,191', core: '1', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/460e3c3a921a9b110c728f38f84c5120.jpg' },
  { name: '北京中原房地产集团', member: '2,130', core: '43', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f85f3904a6c895f08b9b5952e1036187.jpg' },
  { name: '华泰保险集团', member: '2,040', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/9da31bfc2a62ae60a8cf4fbdce89e79c.jpg' },
  { name: '联想控股集团', member: '1,695', core: '32', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fa6e7f434ca46ad3ebe18c7a0364c35f.jpg' },
  { name: '中化化肥集团', member: '1,588', core: '5', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/90200c69264a5a5f1719cddbd7220b74.jpg' },
  { name: '北京正大畜牧投资集团', member: '1,498', core: '11', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2437cd345b26962be09a7bb96a2b2d99.jpg' },
  { name: '北京象鲜科技集团', member: '1,444', core: '29', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/ec40037bb19405567160d5f27fd9c071.jpg' },
  { name: '北京理想汽车集团', member: '1,219', core: '17', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/57f878b69f15a2231b986070c1d555cb.jpg' },
  { name: '中和农信农业集团', member: '1,181', core: '7', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0c90b9b05d2c99f3e313a6244ccccd1a.jpg' },
  { name: '北京金瓜子科技集团', member: '1,140', core: '15', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/4605b16f05353f20b8cc3c6cb4eff1ad.jpg' },
  { name: '北京金尊科技集团', member: '1,084', core: '76', logo: '' },
  { name: '北京转转一零二四科技集团', member: '914', core: '12', logo: '' },
  { name: '众合云科信息集团', member: '900', core: '11', logo: '' },
  { name: '北京泡泡玛特文创集团', member: '892', core: '10', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/abf45d9f90de66f92b60f4cd625fa9a8.jpg' },
  { name: '中民燃气集团', member: '860', core: '15', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/46a835d4d857786cfef7b6c9d4aa024e.jpg' },
  { name: '北京粉笔上岸科技集团', member: '853', core: '14', logo: '' },
  { name: '北京阿帕科蓝科技集团', member: '834', core: '76', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/6631f0ab48c826d3da41ed8e3e753b7d.jpg' },
  { name: '神州优车集团', member: '794', core: '8', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/dff917e7e55fb55922c852b1ad8b7fc0.jpg' },
  { name: '中国柒一拾壹投资集团', member: '794', core: '3', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0f76e22956965c8ef54a61afab3f3c4e.jpg' },
  { name: '北京圆心科技集团', member: '788', core: '16', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/45bc99a093e9b12b46de22fce0b30cf6.jpg' },
  { name: '北京百丽鞋业集团', member: '732', core: '271', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/694ac8068df5cfaa6f51123118e12673.jpg' },
  { name: '小米通讯技术集团', member: '619', core: '13', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/0fdc38734e0d78909d09b2348afa680c.jpg' },
  { name: '北京京能国际综合智慧能源集团', member: '591', core: '26', logo: '' },
  { name: '北京远洋万方企管咨询集团', member: '590', core: '9', logo: '' },
  { name: '北京顺驰不动产网络集团', member: '573', core: '-', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/a45be42e5473bb4f96464669e304f02c.jpg' },
  { name: '中国壳牌集团', member: '560', core: '19', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fd369be8574c0eeabecb80f26105e7e3.jpg' },
  { name: '中国水务投资集团', member: '531', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/70f7a879b33a9a5e369de371d4e4c110.jpg' },
  { name: '北京动向体育发展集团', member: '512', core: '36', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/6afa8ad9eaa2f521939e0b8ca97da059.jpg' },
  { name: '斯维登置业顾问集团', member: '510', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f64f5162f3621e0edf735dec0211e161.jpg' },
  { name: '北京埃菲特国际特许经营咨询服务集团', member: '506', core: '27', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/8c6ded8fd7966f977ca2a5ee142cbae9.jpg' },
  { name: '北京安湃声听力科技中心集团', member: '504', core: '17', logo: '' },
  { name: '北京远璟荣达企服集团', member: '489', core: '9', logo: '' },
  { name: '润平投资集团', member: '478', core: '1', logo: '' },
  { name: '北京诗嘉管理咨询集团', member: '475', core: '10', logo: '' },
  { name: '北京比格餐饮集团', member: '473', core: '101', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b468a068075124efb9756c8cb937949a.jpg' },
  { name: '软通动力集团', member: '452', core: '21', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/40c6e49c59feb0969fc2119aba8bf998.jpg' },
  { name: '北京第一物业集团', member: '435', core: '5', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fd567e408f7a2ccc9c967ec1bb2b4d7e.jpg' },
  { name: '启迪协信科技城投资集团', member: '425', core: '12', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/fccd7cb3e1c21b5b3dc601df1507479b.jpg' },
  { name: '正大卜蜂贸易发展集团', member: '398', core: '6', logo: '' },
  { name: '北京友信科技集团', member: '389', core: '1', logo: '' },
  { name: '北京益世控制科技集团', member: '384', core: '14', logo: '' },
  { name: '北京咖世家咖啡集团', member: '377', core: '1', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/327d56d13abecf1dcd6b3882586e35e6.jpg' },
  { name: '万达宝贝王集团', member: '349', core: '45', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/2e25a5ea2a1a6052100e765424a4a4ca.jpg' },
  { name: '中国久运发展投资集团', member: '347', core: '12', logo: '' },
  { name: '北京童程时代科技集团', member: '346', core: '8', logo: '' },
  { name: '北京永和大王餐饮集团', member: '344', core: '3', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/e51a8fc5fffa105b5d4ec87ae4e89bff.jpg' },
  { name: '北京被窝装饰集团', member: '313', core: '8', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f5612fa639a3ff1ae0251d2af68e0a24.jpg' },
  { name: '好未来集团', member: '308', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/473a4e8fd7cbbf68ac1d4e9886d3942a.jpg' },
  { name: '乐普医疗集团', member: '302', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/64f9e1952144ea52b4562dfa98320c38.jpg' },
  { name: '北京字跳网络技术集团', member: '301', core: '16', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/9ae10b049057f862b2b2593b05e1c510.jpg' },
  { name: '北京中软国际信息集团', member: '299', core: '15', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/f51ae34809f641f582507753df986edf.jpg' },
  { name: '协合风电投资集团', member: '293', core: '8', logo: '' },
  { name: '北京合生绿洲房地产集团', member: '289', core: '22', logo: '' },
  { name: '北京悦活餐饮集团', member: '284', core: '18', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/1205a2f153db0e6f515c1ac99cbf9ccb.jpg' },
  { name: '北京雍禾医疗科技集团', member: '282', core: '5', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b468a068075124efb9756c8cb937949a.jpg' },
  { name: '均豪不动产管理集团', member: '275', core: '71', logo: '' },
  { name: '太古中萃发展集团', member: '253', core: '6', logo: '' },
  { name: '阳光海天智能集团', member: '248', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d9f0b3077524165bde4a37afc2a52ec8.jpg' },
  { name: '生活物业集团', member: '247', core: '9', logo: '' },
  { name: '艾丝碧西投资集团', member: '236', core: '7', logo: '' },
  { name: '中国松下电器集团', member: '233', core: '38', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/1ba913bac37d5cad4b0235cf4f3a4763.jpg' },
  { name: '天壕能源集团', member: '232', core: '13', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/48713ddc3f13f06113672377be3c2d01.jpg' },
  { name: '北京天空人服饰集团', member: '223', core: '6', logo: '' },
  { name: '北京瑞尔圣彬医疗科技集团', member: '219', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/af6ae331016c5bb448af667e4073d708.jpg' },
  { name: '北京智慧能源集团', member: '219', core: '26', logo: '' },
  { name: '北京讯通通信服务集团', member: '217', core: '8', logo: '' },
  { name: '资生堂丽源化妆品集团', member: '213', core: '5', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/865e7b4629cd7ced2c3351cf306d7fbb.jpg' },
  { name: '中企动力科技集团', member: '213', core: '6', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/21442cf16abfd4a3b3f07f79f390ef05.jpg' },
  { name: '北控环境服务集团', member: '211', core: '18', logo: '' },
  { name: '北京彩峰科技集团', member: '211', core: '13', logo: '' },
  { name: '北京普信恒业科技集团', member: '210', core: '25', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/9d24b62c4ad6abf8873b40e166fbf691.jpg' },
  { name: '中国永旺幻想儿童游乐集团', member: '206', core: '1', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/c1d10d63b52285dd33c7969fd4567ec1.jpg' },
  { name: '中国西门子集团', member: '203', core: '20', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/22e49a86d41969e2dc0e0013a0115cb0.jpg' },
  { name: '嘉顺达物流集团', member: '199', core: '28', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/99a61287e8a1a23359f14a0925bf3f99.jpg' },
  { name: '北京雷杰思商务集团', member: '195', core: '116', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b74793edea963877ba9506e140276a83.jpg' },
  { name: '北京中关村科金技术集团', member: '194', core: '12', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/e1c60f9750962579012f8d46f41cd212.jpg' },
  { name: '天九共享集团', member: '193', core: '11', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/e70ac45edaecd8b00187245cddc3576b.jpg' },
  { name: '北京知珑装备科技集团', member: '193', core: '7', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b9d1cf881c038ff4f2ebab118961d64b.jpg' },
  { name: '阳光壹佰置业集团', member: '188', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/68e3d0e37e0c1c862049a45ca86cc9fe.jpg' },
  { name: '北京百事可乐饮料集团', member: '182', core: '8', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/724c4c9a988c127b33a2b3bbda93cf58.jpg' },
  { name: '北京桑德环境集团', member: '182', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b4ea9a4f2e43a43b07b18325caa53503.jpg' },
  { name: '北京大发正大集团', member: '180', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/68ee3364f69c04f24bd74f4c1a07ee48.jpg' },
  { name: '北京恒荣汇彬保险代理集团', member: '178', core: '34', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b3c6bea4e694b45c730e11e0b4bf2d0a.jpg' },
  { name: '中国中信资本集团', member: '178', core: '8', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d45c3008a526fe4b0ea0540731afde83.jpg' },
  { name: '中英人寿保险集团', member: '177', core: '1', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/d1945bf3318db4b8e223adb6608af96d.jpg' },
  { name: '中国东方资产管理集团', member: '174', core: '80', logo: '' },
  { name: '中粮肉食投资集团', member: '174', core: '6', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/936320d0d108b269115a510e4c5c01d4.jpg' },
  { name: '中国SMC集团', member: '167', core: '5', logo: '' },
  { name: '中国大众投资集团', member: '163', core: '14', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/4477a3a19dab180e9ca2b629eb8bcc3e.jpg' },
  { name: '北京恒安成达控股集团', member: '163', core: '70', logo: '' },
  { name: '北京斗米优聘科技集团', member: '161', core: '22', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/6bbde51a9058a9ca88da827dc28d5374.jpg' },
  { name: '中国阿里健康科技集团', member: '161', core: '6', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/54ec14d1e0476e2f91a8609e507895cc.jpg' },
  { name: '北京燃气集团', member: '159', core: '16', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/b6f3dca3f5b354e07ebf5a7894d06823.jpg' },
  { name: '北京长生众康医院管理集团', member: '153', core: '9', logo: '' },
  { name: '北京国锐创享商管集团', member: '149', core: '11', logo: '' },
  { name: '北京云杉世界信息集团', member: '149', core: '9', logo: 'https://qxb-logo-url.oss-cn-hangzhou.aliyuncs.com/OriginalUrl/3b541ab2b5091c6ae183308ce7dccba6.jpg' },
]

const PROVINCES = ['全国', '北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '台湾省', '香港特别行政区', '澳门特别行政区']

/* ============ 外资 tab · 品牌标识（设计稿 1:1） ============ */
const WZ_LOGO = 'h-10 w-10'

const WzLuckin = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <path d="M25 8 C20 8 16 12 16 17 C16 20 18 23 21 24 L18 28 C16 30 15 33 15 36 L20 36 C20 34 21 32 23 31 L27 31 C29 32 30 34 30 36 L35 36 C35 33 34 30 32 28 L29 24 C32 23 34 20 34 17 C34 12 30 8 25 8 Z" fill="#002855" />
    <path d="M22 16 C23 14 25 13 27 14 C26 16 24 17 22 16 Z" fill="#FFFFFF" />
    <path d="M23 20 C25 19 27 20 28 22 C26 23 24 23 23 20 Z" fill="#FFFFFF" />
    <text x="25" y="46" textAnchor="middle" fontSize="5" fill="#002855" fontWeight="bold" fontFamily="Arial">luckin coffee</text>
  </svg>
)

const WzYum = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <circle cx="25" cy="20" r="14" fill="#E60012" />
    <text x="25" y="20" textAnchor="middle" fontSize="9" fill="#FFFFFF" fontWeight="bold">百胜</text>
    <text x="25" y="27" textAnchor="middle" fontSize="5" fill="#FFFFFF" fontWeight="bold" fontFamily="Arial">Yum</text>
    <text x="25" y="44" textAnchor="middle" fontSize="6.5" fill="#E60012" fontWeight="bold" fontFamily="Arial">YumChina</text>
  </svg>
)

const WzFangchebao = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <path d="M15 22 L25 12 L35 22 L35 32 L15 32 Z" fill="#E60012" />
    <rect x="20" y="24" width="10" height="8" fill="#FFFFFF" />
    <rect x="15" y="32" width="20" height="4" fill="#E60012" />
    <text x="25" y="46" textAnchor="middle" fontSize="7" fill="#E60012" fontWeight="bold">房车宝</text>
  </svg>
)

const WzHaiwai = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <text x="25" y="20" textAnchor="middle" fontSize="8" fill="#0066B3" fontWeight="bold">海外旅业</text>
    <text x="25" y="30" textAnchor="middle" fontSize="7" fill="#0066B3" fontWeight="bold" fontFamily="Arial">OTC</text>
    <line x1="10" y1="34" x2="40" y2="34" stroke="#0066B3" strokeWidth="1" />
    <path d="M10 34 C15 30 20 38 25 34 C30 30 35 38 40 34" fill="none" stroke="#0066B3" strokeWidth="1.5" />
  </svg>
)

const WzGaoji = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <rect x="8" y="8" width="34" height="34" rx="3" fill="#F78A2E" />
    <text x="25" y="30" textAnchor="middle" fontSize="16" fill="#FFFFFF" fontWeight="bold">高济</text>
  </svg>
)

const WzBeike = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <rect x="8" y="8" width="34" height="34" rx="4" fill="#E8F3FF" />
    <text x="25" y="24" textAnchor="middle" fontSize="11" fill="#165DFF" fontWeight="bold">天津</text>
    <text x="25" y="38" textAnchor="middle" fontSize="11" fill="#165DFF" fontWeight="bold">贝壳</text>
  </svg>
)

const WzYifeng = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <path d="M25 8 C22 8 20 10 20 13 C20 16 22 18 25 20 C28 18 30 16 30 13 C30 10 28 8 25 8 Z" fill="#00A651" />
    <path d="M25 20 L25 36" stroke="#00A651" strokeWidth="3" />
    <path d="M18 28 C18 24 21 22 25 22 C29 22 32 24 32 28" fill="none" stroke="#00A651" strokeWidth="2.5" />
    <text x="25" y="44" textAnchor="middle" fontSize="5.5" fill="#00A651" fontWeight="bold">益丰大药房</text>
    <text x="25" y="49" textAnchor="middle" fontSize="4" fill="#00A651" fontFamily="Arial">Yifeng Pharmacy</text>
  </svg>
)

const WzLaobaixing = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <rect x="8" y="14" width="16" height="10" rx="2" fill="#165DFF" />
    <text x="16" y="22" textAnchor="middle" fontSize="7" fill="#FFFFFF" fontWeight="bold">老百姓</text>
    <rect x="26" y="14" width="16" height="10" rx="2" fill="#E60012" />
    <text x="34" y="22" textAnchor="middle" fontSize="7" fill="#FFFFFF" fontWeight="bold">大药房</text>
    <text x="25" y="38" textAnchor="middle" fontSize="5" fill="#4E5969" fontFamily="Arial">LBX PHARMACY</text>
  </svg>
)

const WzDada = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <circle cx="18" cy="22" r="8" fill="#165DFF" />
    <text x="18" y="25" textAnchor="middle" fontSize="7" fill="#FFFFFF" fontWeight="bold">达达</text>
    <circle cx="32" cy="22" r="8" fill="#00A651" />
    <text x="32" y="25" textAnchor="middle" fontSize="7" fill="#FFFFFF" fontWeight="bold">集团</text>
    <text x="25" y="42" textAnchor="middle" fontSize="5" fill="#4E5969" fontFamily="Arial">DADA GROUP</text>
  </svg>
)

const WzStarbucks = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <circle cx="25" cy="25" r="17" fill="#00704A" />
    <circle cx="25" cy="25" r="13" fill="none" stroke="#FFFFFF" strokeWidth="1" />
    <path d="M25 12 C22 14 20 17 20 21 C20 24 22 26 25 27 C28 26 30 24 30 21 C30 17 28 14 25 12 Z" fill="#FFFFFF" />
    <circle cx="22" cy="19" r="1.5" fill="#00704A" />
    <circle cx="28" cy="19" r="1.5" fill="#00704A" />
    <path d="M22 23 C23 24 27 24 28 23" fill="none" stroke="#00704A" strokeWidth="1" />
    <path d="M18 28 C16 30 15 33 16 36 L20 36 C20 34 21 32 23 31 L27 31 C29 32 30 34 30 36 L34 36 C35 33 34 30 32 28" fill="#FFFFFF" />
    <text x="25" y="48" textAnchor="middle" fontSize="3.5" fill="#00704A" fontWeight="bold">TM</text>
  </svg>
)

const WzLaiyang = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <rect x="8" y="8" width="34" height="34" rx="4" fill="#E8F3FF" />
    <text x="25" y="24" textAnchor="middle" fontSize="11" fill="#165DFF" fontWeight="bold">莱阳</text>
    <text x="25" y="38" textAnchor="middle" fontSize="11" fill="#165DFF" fontWeight="bold">中国</text>
  </svg>
)

const WzTengyue = () => (
  <svg viewBox="0 0 50 50" className={WZ_LOGO}>
    <path d="M15 20 L25 10 L35 20 L35 24 L15 24 Z" fill="#F78A2E" />
    <rect x="15" y="24" width="20" height="14" fill="#004FA3" />
    <rect x="20" y="28" width="4" height="4" fill="#FFFFFF" />
    <rect x="26" y="28" width="4" height="4" fill="#FFFFFF" />
    <rect x="20" y="34" width="4" height="4" fill="#FFFFFF" />
    <rect x="26" y="34" width="4" height="4" fill="#FFFFFF" />
    <text x="25" y="48" textAnchor="middle" fontSize="5.5" fill="#4E5969" fontWeight="bold">腾越建科</text>
  </svg>
)

const WAIZI_GROUPS: GroupRow[] = [
  { name: '中国瑞幸咖啡集团', member: '26,514', core: '9', logoSvg: <WzLuckin /> },
  { name: '百胜中国集团', member: '21,558', core: '54', logoSvg: <WzYum /> },
  { name: '房车宝集团', member: '20,560', core: '16', logoSvg: <WzFangchebao /> },
  { name: '重庆海外旅业集团', member: '19,435', core: '8', logoSvg: <WzHaiwai /> },
  { name: '天津高济集团', member: '15,663', core: '10', logoSvg: <WzGaoji /> },
  { name: '天津贝壳投资集团', member: '14,930', core: '8', logoSvg: <WzBeike /> },
  { name: '益丰药房集团', member: '14,766', core: '8', logoSvg: <WzYifeng /> },
  { name: '老百姓集团', member: '13,183', core: '12', logoSvg: <WzLaobaixing /> },
  { name: '上海达疆网络集团', member: '13,095', core: '9', logoSvg: <WzDada /> },
  { name: '星巴克咖啡集团', member: '9,286', core: '9', logoSvg: <WzStarbucks /> },
  { name: '莱阳中国网通集团', member: '7,959', logoSvg: <WzLaiyang /> },
  { name: '腾越建筑集团', member: '6,066', core: '13', logoSvg: <WzTengyue /> },
]

/* ============ 机构 tab · 政府部门（设计稿 1:1） ============ */
const JIGOU_GROUPS: GroupRow[] = [
  { name: '北京发改委' },
  { name: '北京经济和信息化局' },
  { name: '北京科学技术局' },
  { name: '北京公安局' },
  { name: '北京民政局' },
  { name: '北京司法局' },
  { name: '北京财政局' },
  { name: '北京人社局' },
  { name: '北京规划和自然资源局' },
  { name: '北京生态环境局' },
  { name: '北京城乡建设委员会' },
  { name: '北京住房保障和房产管理局' },
  { name: '北京园林文物局' },
  { name: '北京交通运输局' },
  { name: '北京林业水利局' },
]

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="none" width="16" height="16">
      <path d="M448 64a384 384 0 0 1 301.3 622.7l196.4 196.3a42.7 42.7 0 0 1-60.4 60.4L688.9 747.3A384 384 0 1 1 448 64zm0 85.3a298.7 298.7 0 1 0 0 597.4 298.7 298.7 0 0 0 0-597.4z" fill="#9aa0ad" />
    </svg>
  )
}

function GroupCard({ row, onClick }: { row: GroupRow; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false)
  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer items-center rounded-[4px] bg-white p-3 transition-shadow hover:shadow-[0_4px_12px_4px_rgba(27,28,46,.06)]"
    >
      {row.logoSvg ? (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">{row.logoSvg}</div>
      ) : imgErr || !row.logo ? (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[4px] bg-[#e5eeff] text-base font-semibold text-[#1a53ff]">
          {row.name.slice(0, 1)}
        </div>
      ) : (
        <img
          src={row.logo}
          alt={row.name}
          onError={() => setImgErr(true)}
          className="h-10 w-10 flex-shrink-0 object-contain"
        />
      )}
      <div className="ml-3 min-w-0 flex-1">
        <div className="flex items-center">
          <span className="flex-1 truncate text-sm font-semibold leading-5 text-slate-800">{row.name}</span>
          <button
            onClick={(e) => { e.stopPropagation() }}
            className="ml-2 hidden h-5 rounded-[14px] bg-[#ffc300] px-3 text-xs leading-5 text-[#00000a] group-hover:inline-block"
          >
            关注
          </button>
        </div>
        <div className="mt-1 text-[13px] leading-[18px] text-[#76788b]">
          <span className="mr-3">成员: {row.member}家</span>
          {row.core !== undefined && row.core !== '' && <span>核心: {row.core}家</span>}
        </div>
      </div>
    </div>
  )
}

/* 机构卡片：蓝底部门标识（每行 2 字）+ 机构名称，无成员/核心数 */
function deptTag(name: string): [string, string] {
  const rest = name.replace(/^北京/, '')
  return [rest.slice(0, 2), rest.slice(2, 4)]
}

function JigouCard({ name, onClick }: { name: string; onClick: () => void }) {
  const [l1, l2] = deptTag(name)
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center rounded-[4px] bg-white p-3 transition-shadow hover:shadow-[0_4px_12px_4px_rgba(27,28,46,.06)]"
    >
      <div className="flex h-[56px] w-[56px] flex-shrink-0 items-center justify-center rounded-[4px] bg-[#e8f3ff] text-center text-[15px] font-semibold leading-tight text-[#165DFF]">
        {l1}
        <br />
        {l2}
      </div>
      <div className="ml-3 min-w-0 flex-1">
        <div className="truncate text-sm font-semibold leading-5 text-slate-800">{name}</div>
      </div>
    </div>
  )
}

function FilterRow({ label, options, value, onChange, showMore }: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  showMore?: boolean
}) {
  return (
    <div className="flex items-start py-2">
      <div className="w-20 flex-shrink-0 pt-1 text-sm text-[#76788b]">{label}</div>
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {options.map((opt) => {
          const active = value === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`rounded px-2.5 py-0.5 text-sm transition-colors ${
                active ? 'bg-[#1a53ff] text-white' : 'text-[#393a51] hover:text-[#1a53ff]'
              }`}
            >
              {opt}
            </button>
          )
        })}
        {showMore && (
          <button className="ml-auto text-sm text-[#1a53ff] hover:underline">更多</button>
        )}
      </div>
    </div>
  )
}

export default function DmGroupAccount() {
  const nav = useNavigate()
  const [tab, setTab] = useState('yangqi')
  const [kw, setKw] = useState('')
  const [province, setProvince] = useState('全国')
  const [city, setCity] = useState('不限')
  const [region, setRegion] = useState('不限')

  const activeLabel = TABS.find((t) => t.key === tab)?.label ?? ''

  const listData = useMemo(() => {
    if (tab === 'yangqi') return YANGQI_GROUPS
    if (tab === 'guoqi') return GUOQI_GROUPS
    if (tab === 'minying') return MINYING_GROUPS
    if (tab === 'waizi') return WAIZI_GROUPS
    if (tab === 'jigou') return JIGOU_GROUPS
    return []
  }, [tab])

  const filtered = useMemo(() => {
    const q = kw.trim()
    if (!q) return listData
    return listData.filter((g) => g.name.includes(q))
  }, [kw, listData])

  const onCardClick = (name: string) => {
    nav(`/console/dm/group-account-detail?name=${encodeURIComponent(name)}&back=/console/dm/group-account`)
  }

  const showFilters = tab === 'guoqi' || tab === 'minying' || tab === 'waizi' || tab === 'jigou'
  const totalLabel = tab === 'guoqi' ? '17,490' : tab === 'minying' ? '202,399' : tab === 'waizi' ? '17,101' : undefined

  return (
    <>
      <PageShell title="集团户" crumb="数字营销 / 潜客挖掘" subtitle={`集团客户管理 · ${activeLabel}`} legend={false} />

      {/* Tab 导航 */}
      <div className="bg-white px-6">
        <div className="flex items-stretch border-b border-[#e8e8e8]">
          {TABS.map((t) => {
            const active = t.key === tab
            return (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key)
                  if (t.key === 'jigou') { setProvince('北京市'); setCity('直辖市') }
                  else { setProvince('全国'); setCity('不限') }
                  setRegion('不限'); setKw('')
                }}
                className={`relative px-4 py-3 text-base font-medium transition-colors ${
                  active ? 'text-[#1a53ff]' : 'text-[#76788b] hover:text-[#393a51]'
                }`}
              >
                {t.label}
                {active && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a53ff]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 内容区 */}
      <div className="min-h-[600px] bg-[#f4f5fc] px-6 py-3">
        {tab === 'yangqi' || tab === 'guoqi' || tab === 'minying' || tab === 'waizi' || tab === 'jigou' ? (
          <>
            {/* 筛选器（仅国企 tab 显示） */}
            {showFilters && (
              <div className="mb-3 rounded-[4px] bg-white px-4">
                <FilterRow label="选择省份" options={PROVINCES.slice(0, 16)} value={province} onChange={(v) => { setProvince(v); setCity(tab === 'jigou' ? '直辖市' : '不限'); setRegion('不限') }} showMore />
                <div className="border-t border-dashed border-slate-100" />
                <FilterRow label="选择城市" options={tab === 'jigou' ? ['直辖市'] : ['不限']} value={city} onChange={setCity} />
                {tab !== 'jigou' && (
                  <>
                    <div className="border-t border-dashed border-slate-100" />
                    <FilterRow label="选择区域" options={['不限']} value={region} onChange={setRegion} />
                  </>
                )}
              </div>
            )}

            {/* 搜索 + 总数 */}
            <div className={`mb-3 flex items-center ${totalLabel ? 'justify-between' : 'justify-end'}`}>
              {totalLabel && (
                <div className="text-sm text-[#393a51]">
                  <span className="font-semibold text-[#1a53ff]">{province}</span>
                  <span className="ml-2 text-[#76788b]">{totalLabel}</span>
                </div>
              )}
              <div className="relative w-72">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={kw}
                  onChange={(e) => setKw(e.target.value)}
                  placeholder="输入企业或集团关键字"
                  className="h-8 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#1a53ff]"
                />
              </div>
            </div>

            {/* 卡片网格 */}
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
              {filtered.map((g) =>
                tab === 'jigou' ? (
                  <JigouCard key={`${tab}-${g.name}`} name={g.name} onClick={() => onCardClick(g.name)} />
                ) : (
                  <GroupCard key={`${tab}-${g.name}`} row={g} onClick={() => onCardClick(g.name)} />
                ),
              )}
            </div>
            {filtered.length === 0 && (
              <div className="py-20 text-center text-sm text-[#76788b]">未找到匹配「{kw}」的结果</div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-base font-medium text-slate-500">{activeLabel}内容待提供</div>
            <div className="mt-2 text-sm text-slate-400">后续会把「{activeLabel}」选项卡的数据发来，到时再填充</div>
          </div>
        )}
      </div>
    </>
  )
}
