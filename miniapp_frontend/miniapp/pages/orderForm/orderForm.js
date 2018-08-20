// pages/orderForm/orderForm.js
let app = getApp();
let G = app.globalData;

Page({

   /**
    * 页面的初始数据
    */
   data: {

      isToTake: false,


      menus: app.globalData.menus,
      orderForms: [],
      coupons: [],
      keepGetmore: true,
   },



   toTake(e) {
      let d = e.currentTarget.dataset;
      
      this.setData({
         isToTake: true,
         orderid:d.id
      })
   },

   cancelTake() {
      this.setData({
         isToTake: false
      })
   },

   ensureTake() {
      let t = this;
      let orderid = t.data.orderid;
      wx.request({
         url: 'https://mini.wggai.com/api/order/delete',
         method: 'POST',
         data: {
            third_session: wx.getStorageSync('sessionId'),
            orderid
         },
         success() {
            let orderForms = t.data.orderForms;
            for (let i = 0, l = orderForms.length; i < l; i++) {
               if (orderForms[i].id === orderid) {
                  console.log(orderForms.splice(i, 1));
                  break;
               }
            }
            t.setData({
               orderForms,
               isToTake: false
            });
         }

      })
   },


   // 前往评论
   toComment(e) {
      let d = e.currentTarget.dataset;
      let orderid = d.orderid;
      let comment = d.comment;
      let state = d.state;
      if (!comment && state==2){
         wx.redirectTo({
            url: '../orderComment/orderComment?orderid='+orderid,
         })
      }

   },


   // 显示订单细节
   showOrderDetail(e) {
      let t = this;
      let orderid = e.currentTarget.dataset.id;
      wx.redirectTo({
         url: '../orderDetail/orderDetail?orderid=' + orderid,
      })
   },

   // 获得更多订单，首次进入该页面时也会触发这里
   getMoreOrders(e) {
      let t = this;
      let orderForms = t.data.orderForms;
      let time = t.data.orderForms[orderForms.length-1].created_at;

      if (t.data.keepGetmore) {
         wx.request({
            url: 'https://mini.wggai.com/api/order/list',
            method: 'POST',
            data: {
               third_session: wx.getStorageSync('sessionId'),
               time,
               method: 'down'
            },
            success(res) {
               let neworderForms = res.data;
               for (let i of neworderForms) {
                  i.food = JSON.parse(i.food);
                  for (let j = 0; j < i.food.length; j++) {
                     for (let k of G.dishs) {
                        if (i.food[j].foodid == k.id) {
                           k.number = i.food[j].number;
                           i.food[j] = k;
                        }
                     }
                  }
               }
               G.orderForms = orderForms.concat(neworderForms);
               t.setData({
                  orderForms: orderForms.concat(neworderForms)
               })
            }
         })
         t.setData({
            keepGetmore: false
         })
      } else {
         setTimeout(function () {
            t.setData({
               keepGetmore: true
            });
         }, 2000)
      }


   },
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      let t = this;

      if (!wx.getStorageSync('sessionId')) {
         G.feedbackModal('请先登录');
         return;
      }

      t.setData({
         coupons: G.coupons
      })

      wx.request({
         url: 'https://mini.wggai.com/api/order/list',
         method: 'POST',
         data: {
            third_session: wx.getStorageSync('sessionId'),
         },
         success(res) {
            //1.从后台获取订单后，把订单中的餐品属性格式化；
            if (res.data.error) {
               console.log(res.data.error);
               return;
            }
            // console.log(res.data)
            let orderForms = res.data;
            for (let i of orderForms) {
               i.food = JSON.parse(i.food); 
            }

            // 补充更多餐品信息
            for(let i of orderForms){
               for(let j=0; j<i.food.length; j++){
                  for (let k of G.dishs){
                     if (i.food[j].foodid == k.id){
                        // console.log(i.food[j].number);
                        k.number = i.food[j].number;
                        i.food[j] = k;
                     }
                  }
               }
            }

            G.orderForms = orderForms;
            t.setData({ orderForms })
         }
      })
   },

   // 再次付款
   rePay(e){
      wx.request({
         url: 'https://mini.wggai.com/api/payment/pay',
         method: 'POST',
         data: {
            third_session: wx.getStorageSync('sessionId'),
            orderid: e.currentTarget.dataset.orderid
         },

         success(res) {
            let d = res.data;
            wx.requestPayment({
               'timeStamp': String(d.timeStamp),
               'nonceStr': d.nonce_str,
               'package': 'prepay_id=' + d.prepay_id,
               'signType': 'MD5',
               'paySign': d.sign,
               success(res) {
                  console.log('pay success:')
                  console.log(res);
                  wx.redirectTo({
                     url: '../index/index',
                  });
               },
               fail(res) {
                  // 如果取消了付款，将会进入这一步;
                  if (res.errMsg == 'requestPayment:fail cancel') {
                     G.feedbackModal('您取消了付款！');
                  } else {
                     G.feedbackModal('付款失败：您的身份无法识别！可能订单已过期。');
                  }
               }
            })
         }
      })
   },

   // 显示二维码
   showPayCode(e) {

      let t = this;
      let orderid = e.currentTarget.dataset.orderid;

      sendOrder();

      // if (!g.coupons) {
      //    sendOrder();
      // } else {
         // wx.showModal({
         //    title: '优惠提醒',
         //    content: '是否在本次消费中使用优惠券？',
         //    confirmText: '是',
         //    cancelText: '否',
         //    success(res) {
         //       console.log('orderForm:');
         //       console.log(res);
         //       if (res.confirm) {
         //          let itemorderForms = [];
         //          console.log('in confirm')
         //          let coupons = t.data.coupons;
         //          for (let i of coupons) {
         //             itemorderForms.push(i.name);
         //          }
         //          wx.showActionSheet({
         //             itemorderForms,
         //             success(res) {
         //                console.log('success in showA..')
         //                console.log(res);
         //                t.setData({
         //                   couponid: coupons[res.tapIndex].id
         //                })
         //                sendOrder();
         //             },
         //          })
         //       } else if (res.cancel) {
         //          sendOrder();
         //       }
         //    },
         // })
      // }

      function sendOrder() {
         let couponid = t.data.couponid;
         let orderForms = t.data.orderForms;

         let theOrder = null;
         for(let i of orderForms){
            if(i.id === orderid){
               theOrder = new Object(i);
               break;
            }
         }

         // 菜品数据优化器
         function dishsDataFilter(foods) {
            if (!foods.length) return;
            let niceChosenFoods = [];
            for (let i = 0; i < foods.length; i++) {
               niceChosenFoods[i] = {};
               niceChosenFoods[i].foodid = String(foods[i].id);
               niceChosenFoods[i].number = foods[i].number;
            }
            return niceChosenFoods;
         }

         // 去除订单不必要属性
         delete theOrder.id;
         delete theOrder.created_at;
         delete theOrder.expired_date;
         delete theOrder.updated_at;
         delete theOrder.price;
         delete theOrder.status;
         delete theOrder.comment;

         theOrder.food = JSON.stringify(dishsDataFilter(theOrder.food));
         theOrder.third_session = wx.getStorageSync('sessionId');
         theOrder.couponid = null;
         console.log(theOrder);

         // 去获得订单
         wx.request({
            url: 'https://mini.wggai.com/api/order/create',
            method: 'POST',
            data:theOrder,
            header: {
               'content-type': 'application/json'
            },

            success(res) {
               if(res.error){
                  console.log(res.error);
                  return;
               }
               let d = res.data;
               wx.requestPayment({
                  'timeStamp': String(d.timeStamp),
                  'nonceStr': d.nonce_str,
                  'package': 'prepay_id=' + d.prepay_id,
                  'signType': 'MD5',
                  'paySign': d.sign,
                  success(res) {
                     wx.redirectTo({
                        url: '../index/index',
                     });
                  },
                  fail(res) {
                     if (res.errMsg == 'requestPayment:fail cancel') {
                        G.feedbackModal( '您取消了付款！' );
                     } else {
                        G.feedbackModal('付款失败：您的身份无法识别！');
                     }
                  }
               })
            }
         });
      }
   },

   //   toPay(e){
   //      console.log(e)
   //       let orderId = e.currentTarget.dataset.orderid;
   //       console.log(orderId);
   //       /* to pay the order*/
   //   },

   /**
    * 生命周期函数--监听页面初次渲染完成
    */
   onReady: function () {

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