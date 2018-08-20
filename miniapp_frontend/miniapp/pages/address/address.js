//获取应用实例
const app = getApp();
const G = app.globalData;

Page({
   data: {

      myName: '',
      myPhone: '',
      myAddress: '',
      isShopping: false,
   },


   onReady() {
      let t = this;
      t.setData({
         isShopping: G.isShopping
      })

      // 如果全局有默认地址数据，则加载到本地
      if (Boolean(G.defaultAddressData)) {
         let res = G.defaultAddressData;
         t.setData({
            myName: res.userName,
            myPhone: res.telNumber,
            myAddress: res.provinceName + res.cityName + res.countyName + res.detailInfo
         })
      }
   },


   // 获得地址
   getAddress() {
      let t = this;

      // 调用小程序对微信的地址选择接口
      wx.chooseAddress({

         success(res) {
            // 把获得的地址存入缓存
            wx.setStorageSync('defaultAddressData', res);
            // 记录为全局默认地址
            G.defaultAddressData = res;

            t.setData({
               myName: res.userName,
               myPhone: res.telNumber,
               myAddress: res.provinceName + res.cityName + res.countyName + res.detailInfo
            })

            G.feedbackModal('修改默认地址成功', ()=>{
               // 如果处于购物状态，则跳转到付款页面，否转返回主页
               wx.redirectTo({
                  url: (t.data.isShopping) ? '../chooseOK/chooseOK' : '../index/index',
               })
            })
         },

         fail(res) {
            if (res.errMsg === "chooseAddress:fail auth deny") {
               wx.showModal({
                  title: '提示',
                  content: '您拒绝了授权地址信息，如需使用请设置授权。',
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

   // 返回 或者 付款
   backOrPay() {
      if (G.isShopping) {
         if (!G.defaultAddressData) {
            G.feedbackModal('尊敬的顾客，您必须选择地址和联系方式，我们才能为您配送！');
         } else {
            wx.redirectTo({
               url: "../chooseOK/chooseOK?chosenFoods=" + JSON.stringify(G.chosenFoods)
            })
         }
      } else {
         wx.redirectTo({
            url: '../index/index'
         })
      }
   }
})