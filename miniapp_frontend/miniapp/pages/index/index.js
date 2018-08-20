//获取应用实例
const app = getApp();
const G = app.globalData;

Page({
   data: {
      imgUrls: [
         '../../resources/aaa.png',
         '../../resources/bbb.png',
         '../../resources/ccc.png',
      ],
      vipicon: '../../resources/VIP-b.png',
      icon1: '../../resources/address.png',
      icon2: '../../resources/score.png',
      icon3: '../../resources/order.png',
      icon4: '../../resources/gift.png',
      icon5: '../../resources/my.png',
      score: 0,
      defaultSize: 'default',
      primarySize: 'default',
      warnSize: 'default',
      disabled: false,
      plain: false,
      loading: false,
      indicatorDots: true,
      autoplay: true,
      interval: 5000,
      duration: 500,
      userInfo: '',
      hasUserInfo: false,
      userName: '',
      isVip: false,
      hasUnpayOrders: true,
      unPayOrdersNumber: 5,
      newCouponsNumber: 0,
   },


   onReady() {

      let res = wx.getSystemInfoSync();
      console.log(res.version)
      console.log(res.SDKVersion)

      let t = this;
      wx.request({
         url: 'https://mini.wggai.com/api/user/check',
         method: 'POST',
         data: {
            third_session: wx.getStorageSync('sessionId'),
         },
         success(res) {


            console.log(res);


            let score = res.data.score;
            let coupons = res.data.coupons;
            let phonenumber = res.data.phone;
            let consume = res.data.consume;
            let consumeTime = res.data.consumeTime;


            console.log(consume,consumeTime);


            if (score) {
               t.setData({
                  isVip: true,
                  score,
                  newCouponsNumber: coupons.length,
               });
               G.hasCoupon = true;
               G.coupons = coupons;
               G.score = score;
               G.phonenumber = phonenumber;
               G.consume = consume;
               G.consumeTime = consumeTime;
            }
         }
      })


      // 获取用户的当前微信（授权）设置。
      wx.getSetting({
         success(res) {

            // 如果已授权，可直接调用 getUserInfo 获取用户信息
            if (!res.authSetting['scope.userInfo']) return;

            wx.getUserInfo({
               success(res) {
                  G.userInfo = res.userInfo;
                  t.setData({
                     userInfo: res.userInfo,
                     hasUserInfo: true,
                  })
               }
            })
         },
         fail() {
            console.log('fail to call wx.getSetting')
         },
      })
   },


   // 获取用户地址信息
   getAddress() {
      let t = this;
      wx.chooseAddress({
         success(res) {
            wx.setStorageSync('defaultAddressData', res)
            app.globalData.defaultAddressData = res;
            t.setData({
               myName: res.userName,
               myPhone: res.telNumber,
               myAddress: res.provinceName + res.cityName + res.countyName + res.detailInfo
            })

            G.feedbackModal('修改地址成功', function () {
               //   wx.navigateTo({
               //      url: (t.data.isShopping) ? '../chooseOK/chooseOK' : '../index/index',
               //   })
            })
         },
         fail(res) {
            if (res.errMsg === "chooseAddress:fail auth deny") {
               wx.showModal({
                  title: '提示',
                  content: '您拒绝了授权地址信息，如需使用请在授权设置中打开。',
                  cancelText: '暂不需要',
                  confirmText: '前去设置',
                  success(res) {
                     if (res.confirm) {
                        wx.openSetting({});
                     }
                  }
               })
            }
         }
      })
   },

   // 前往订单查询页面
   viewOrders() {
      if (!G.userInfo) {
         G.feedbackModal('请先登录');
      } else {
         wx.navigateTo({
            url: '../orderForm/orderForm',
         });
         this.setData({
            hasUnpayOrders: false
         })
      }
   },

   // 前往优惠券查询页
   viewCoupons() {
      if (!G.userInfo) {
         G.feedbackModal('请先登录');
      } else {
         wx.navigateTo({
            url: '../coupons/coupons',
         });
         this.setData({
            newCouponsNumber: 0
         })
      }
   },


   // 前往我的页面
   viewMy() {
      if (!G.userInfo) {
         G.feedbackModal('请先登录');
      } else {
         wx.navigateTo({
            url: "../my/my"
         });
      }
   },


   //如果用户本来就是会员
   //则向服务器获取该用户的积分和优惠券。
   getPhoneNumber(e) {
      var t = this;
      wx.request({
         url: 'https://mini.wggai.com/api/user/phone/get',
         method: 'POST',
         data: {
            third_session: wx.getStorageSync('sessionId'),
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
         },
         success(res) {
            let d = res.data;
            if (d.error) {
               console.log(d.error);
               return;
            }

            let score = d.score;
            let coupons;
            if (d.coupons) {
               coupons = JSON.parse(d.coupons);
            }
            // 如果可以获取到分数，则代表账号存在
            if (score) {
               G.feedbackModal('激活成功！');
               t.setData({
                  isVip: true,
                  score,
               });
            }
         },
         fail() {
            console.log('fail to get phone info');
         }
      })
   },

   // 获取用户信息
   getUserInfo: function (e) {
      if (e.detail.errMsg === "getUserInfo:fail auth deny") {
         wx.showModal({
            title: '提示',
            content: '您拒绝了授权用户信息，如需使用请在授权设置中打开。',
            cancelText: '暂不需要',
            confirmText: '前去设置',
            success(res) {
               if (res.confirm) {
                  // 打开授权设置页面
                  wx.openSetting({
                     success(res) {
                        // 再次授权地址成功
                        if (res.authSetting['scope.userInfo']) { }
                     }
                  })
               }
            }
         })
      } else {
         G.userInfo = e.detail.userInfo
         this.setData({
            userInfo: e.detail.userInfo,
            hasUserInfo: true,
         })
      }
   },




   //-------------------Skip to chooseFood page----------
   toChooseFood: function () {
      wx.navigateTo({
         url: '../chooseFood/chooseFood',
      })
   }


})