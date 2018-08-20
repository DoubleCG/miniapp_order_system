// 导入菜单测试数据
// import menusData from './public/json/menus.js';
import coupons from './public/json/coupons.js';

//app.js
App({
   globalData: {

      isDev: true, // 设置是否为开发环境
      
      // 餐品图片前缀
      picPrefix:'https://mini.wggai.com/storage/images/',
      // 菜单类别图片前缀
      typePicPrefix: 'https://mini.wggai.com/storage/img/main-dish-management/type-icons/',

     // 用户信息
      userInfo: null,

      // 默認的電話號碼
      phonenumber: '0000***0000',
      
      // 用户积分
      score:0,

      // 优惠券列表
      coupons: [],
      
      // 目前用户是否有优惠券
      hasCoupon:false,
      
      consume:0,
      consumeTime:0,


      // 订单表记录
      orderForms: [],
      
      // 是否正在选购餐品
      isShopping: false,

      // 选择了的餐品记录
      chosenFoods: [],
      
      // 餐品
      dishs:null,
      
      // 类型
      types:null,

      // 菜单记录
      menus:null,

      // 是否正在处于付款状态
      isPaying:false,
      
      // 优惠券部分（暂时没用）
      couponid: null, 
      couponname: '选择优惠券',  //优惠券名称提示
      couponmoney: 0,  //优惠金额
      
      // 选择餐品的问题
      total: {
         count: 0,
         money: 0,
      },

      // 下单付款时的备注
      remark: '',
      
      // 获取在缓存中的默认地址
      defaultAddressData: wx.getStorageSync('defaultAddressData'),
      

      // 统一对提示的封装
      feedbackModal(content,successEvent) {
         wx.showModal({
            title: '通知',
            content,
            showCancel: false,
            success(){
               if(typeof successEvent === 'function'){
                  successEvent();
               }
            }
         });
         return;
      }
   },

   onLaunch() {

      var g = this.globalData;

      // 获得完整的菜单列表
      wx.request({
         url: 'https://mini.wggai.com/api/menu/list',
         data:{   // 新增all
            all:1, 
         },
         success(res) {

            let menusData = res.data;
            let dishs = menusData[0];
            let menus = menusData[1];  // 这里仅是初始化menus，需后面转换
            for (let i of menus) { 
               i.pic = g.typePicPrefix+i.pic;
               i.dishs = [];
            }
            for (let i of dishs) {
               i.averageLevel = new Array(Math.ceil(i.level / i.judge_times));
               i.pic = g.picPrefix + i.pic; 
               i.count = 0;
               for (let j of menus) {
                  if (i.type === j.id) { 
                     j.dishs.push(i);
                  }
               }
            }

            // 判断有无设置热销的餐品，如果有，则新增热销菜单在第一项
            let hotDishs = [];

            for (let i of dishs) {
               if (Boolean(i.hot)) {
                  hotDishs.push(i);
               }
            }

            // 手动新增热销项
            if (hotDishs.length) {
               menus.unshift({
                  dishs:hotDishs,
                  id:'hot',
                  name:"热销",
                  pic: g.typePicPrefix +'hot.png',
                  tag:'HOT'
               })
            }

            g.dishs = menusData[0];
            g.types = menusData[1];
            g.menus = menus;
            console.log(menus);
         },

         fail() {
            console.log('fail to get menus from db');
         }
      })




      // 无论如何都需要在第一时间获得sessionId;
      if(g.isDev){

         console.log('Developing...');

         wx.login({
            success(res) {
               // code 每次从微信服务器得到的都是随机且不重复的
               // 发送 res.code 到后台换取  sessionId, openId, unionId
               console.log(res);
               wx.request({
                  url: 'https://mini.wggai.com/api/user/login?code=' + res.code,
                  success(res) {
                     console.log('api: user/login')
                     console.log(res);
                     wx.setStorageSync('sessionId', res.data.third_session);
                  },
                  fail() {
                     console.log('fail to call api: user/login')
                  }
               })
            },
            fail() {
               console.log('fail to call wx.login');
            }
         })

      }else{
         wx.checkSession({
            success(res) {
               //session 未过期，并且在本生命周期一直有效
               console.log(res)
               console.log('user session ok!');
            },
            fail() {
               // 登录状态过期，重新登录
               console.log('-----fail to checksession-----')
               wx.login({
                  success(res) {
                     // 发送 res.code 到后台换取 openId, sessionKey, unionId
                     console.log('login info :')
                     console.log(res);
                     wx.request({
                        url: 'https://mini.wggai.com/api/user/login?code=' + res.code,
                        success(session) {
                           wx.setStorageSync("sessionId", session.data.third_session)
                        },
                        fail() {
                           console.log('fail to call api: user/login')
                        }
                     })
                  },
                  fail() {
                     console.log('fail to call wx.login');
                  }
               })
            }
         })
      }
   },

   enablePullDownRefresh:false,
})