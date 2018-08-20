let app = getApp();
let G = app.globalData;

Page({
   data: {
      chosenFoods: null,
      totalPrice: 0,
      coupons: [],
      warmTipPic:'../../public/pic/warm-tip.png',
      active1:'background-color:#68ED11',
      active2:'background-color:#FFF,',
      hadChooseAddress: true,
      address: '未选择地址',
      couponid: null,
      couponname:'选择优惠券',
      couponmoney:0,
      remark:null,
      hadChoosenCoupon:false,
      take:0,  //是否自提   0:自提  1:配送
   },

   // 选择优惠券
   chooseCoupon(){
      let t = this;
      
      // 设置状态为 “paying”
      G.isPaying = true;
      
      wx.redirectTo({
         url: '../coupons/coupons',
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
            G.feedbackModal('修改成功'
               //, success() {
                  //   wx.redirectTo({
                  //      url: (t.data.isShopping) ? '../chooseOK/chooseOK' : '../index/index',
                  //   })
               // }
            )
               
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


   // 亮出 二维码，一般都是要付款了
   showPayCode() {
      let t = this;

      if (!t.data.hadChooseAddress){
         G.feedbackModal('请选择配送方式');
         return;
      }

      if (!G.defaultAddressData) {
         wx.redirectTo({ 
            url: '../address/address'
         });
         return;
      }

      if (!G.coupons) {
         sendOrder();
      } else {
         let useCoupon = false;
         if (!G.hasCoupon){
            sendOrder();
         }else{

            /* 计算总价：G.chosenFoods */
            let totalCount = 0;
            for(let i of G.chosenFoods){
               totalCount = i.count * i.price;
            }

            sendOrder();

            /* 这一部分是优惠券选择提示 */

            // if(totalCount < 10){
            //    sendOrder();
            // }else{
            //    wx.showModal({
            //       title: '优惠提醒',
            //       content: '是否在本次消费中使用优惠券？',
            //       confirmText: '是',
            //       cancelText: '否',
            //       success(res) {
            //          if (res.confirm) {
            //             let itemList = [];
            //             for (let i of t.data.coupons) {
            //                itemList.push(i.name);
            //             }
            //             wx.showActionSheet({
            //                itemList,
            //                success(res) {
            //                   console.log(t.data.coupons[res.tapIndex]);
            //                   t.setData({
            //                      couponid: t.data.coupons[res.tapIndex].id
            //                   })
            //                   sendOrder();
            //                },
            //             })
            //          } else if (res.cancel) {
            //             sendOrder();
            //          }
            //       },
            //    })
            // }
         }
      }

      /* 发送订单 */
      function sendOrder() {

         // 餐品列表优化器
         function dishsDataFilter(foods) {
            if (!foods.length) return;
            let niceChosenFoods = [];
            for (let i = 0; i < foods.length; i++) {
               niceChosenFoods[i] = {};
               niceChosenFoods[i].foodid = String(foods[i].id);
               niceChosenFoods[i].number = foods[i].count;
            }
            return niceChosenFoods;
         }

         // 优化的餐品列表
         let niceChosenFoods = dishsDataFilter(G.chosenFoods);

         let ada =G.defaultAddressData;


         // 测试状态
         if (G.isDev){
            let state = Math.floor(Math.random() * 3);
            let take = Math.round(Math.random());
            console.log('随机状态 take和 state');
            console.log(take,state)
         }

         console.log({
            third_session: wx.getStorageSync('sessionId'),
               name: ada.userName,
                  address: ada.provinceName + ada.cityName + ada.countyName + ada.detailInfo,
                     food: JSON.stringify(niceChosenFoods), // JSON格式化所选餐品列表
                        phone: ada.telNumber,  // 电话号码
                           couponid: G.couponid,  //所选优惠券id
                              remark: G.remark,  // 备注
                                 state: 0,    /* 测试阶段 0 1 2 随机*/
                                    take: 0
            //t.data.take     /* 测试阶段 0自提 1配送 随机 */
         })




         // 开始创建订单
         wx.request({
            url: 'https://mini.wggai.com/api/order/create',
            method: 'POST',
            data: {
               third_session: wx.getStorageSync('sessionId'),
               name: ada.userName,
               address: ada.provinceName + ada.cityName + ada.countyName + ada.detailInfo,
               food: JSON.stringify(niceChosenFoods), // JSON格式化所选餐品列表
               phone: ada.telNumber,  // 电话号码
               couponid: G.couponid,  //所选优惠券id
               remark: G.remark,  // 备注
               state: 0,    /* 测试阶段 0 1 2 随机*/
               take: 0
               //t.data.take     /* 测试阶段 0 1 随机 */
            },
            header: {
               'content-type': 'application/json'
            },

            success(res) {
               // 创建订单成功
               let d = res.data;
               let orderid = d.orderid;

               // 请求付款
               wx.requestPayment({
                  'timeStamp': String(d.timeStamp),
                  'nonceStr': d.nonce_str,
                  'package': 'prepay_id=' + d.prepay_id,
                  'signType': 'MD5',
                  'paySign': d.sign,
                  success(res) {
                     
                     t.setData({
                        chosenFoods: [],
                        total: {
                           count: 0,
                           money: 0
                        }
                     })

                     /* 付款成功清空对应数据 */
                     G.isPaying=false;
                     G.couponid=null;
                     G.couponname= '选择优惠券';
                     G.couponmoney = 0;
                     G.isPaying = false;
                     G.remark =  '';
                     

                     /* 跳转到订单详情页 */
                     wx.redirectTo({
                        url: '../orderDetail/orderDetail?orderid='+ orderid,
                     })

 
                  },


                  fail(res) {
                     // 创建订单失败
                     if (res.errMsg == 'requestPayment:fail cancel') {
                        G.feedbackModal(
                           '您取消了付款！正在前往“订单”页面.',
                           function(){
                              G.isPaying = false;
                              wx.redirectTo({
                                 url: '../orderForm/orderForm'
                              })
                           }
                        );
                     } else {
                        G.feedbackModal('付款失败:您的身份无法识别！');
                     }
                  }
               })
            }
         })
      }
   },
   upper: function (e) {
      console.log(e)
   },
   lower: function (e) {
      console.log(e)
   },
   scroll: function (e) {
      console.log(e)
   },


   // ************** 以下代码用于备注记录 **************

   tip1(){
      this.setData({
         active1:'background-color:#68ED11',
         active2:'background-color:#FFF',
         hadChooseAddress:true,
         take:0
      });
      
      console.log(this.data.take);
   },

   tip2(){
      wx.showModal({
         title: '反馈',
         content: '敬请期待',
         showCancel: false
      });
      console.log(this.data.take);
      
      return;
      this.setData({
         active2: 'background-color:#68ED11',
         active1: 'background-color:#FFF',
         hadChooseAddress:true,
         take:1,
      })
   },

// ******************************************************

   // 前往备注
   toRemark(){
      wx.redirectTo({
         url: '../remark/remark'
      })

   },

   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      let t = this;

      if (G.defaultAddressData) {
         let ada = G.defaultAddressData;
         let address = ada.provinceName + ada.cityName + ada.countyName + ada.detailInfo;
         t.setData({
            address,
            couponid: G.couponid,
            couponname:G.couponname,
            couponmoney: G.couponmoney,
            remark:G.remark
         });
      }else{
         // wx.redirectTo({ 
         //    url: '../address/address'
         // })
      }

      // let chosenFoods = JSON.parse(options.chosenFoods);
      let chosenFoods = G.chosenFoods;
      let totalPrice = 0;
      for (let i of chosenFoods) {
         totalPrice += i.count * i.price;
      }

      t.setData({
         chosenFoods,
         totalPrice,
      })
   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {
      this.setData({
         coupons: G.coupons
      })
   },

   /**
    * 生命周期函数--监听页面显示
    */
   onShow: function () {

   },

   /**
    * 生命周期函数--监听页面隐藏
    */
   onHide: function () {

   },

   /**
    * 生命周期函数--监听页面卸载
    */
   onUnload: function () {

   },

   /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
   // onPullDownRefresh: function () {

   // },

   /**
    * 页面上拉触底事件的处理函数
    */
   onReachBottom: function () {

   },

   /**
    * 用户点击右上角分享
    */
   onShareAppMessage: function () {

   }
})