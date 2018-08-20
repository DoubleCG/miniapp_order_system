let app = getApp();
let G = app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
     phone:'../../public/baseImg/phone.png',
     arrowR:'../../public/baseImg/arrow-right.png',
     phonenumber:'0000***0000',
     score:0,
     coupons:[],
     consume:0,
     consumeTime:0,
  },

   viewCoupons(){
      wx.navigateTo({
         url: '../coupons/coupons',
      });
      this.setData({
         hasNewcoupons: false
      })
   },

   toOrderForm(){
      wx.navigateTo({
         url: '../orderForm/orderForm',
      })
   },


   toSayProblem(){
      wx.redirectTo({
         url: '../sayProblem/sayProblem',
      })
   },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
     let t = this;
      let userInfo = G.userInfo;
      t.setData({
         avatarUrl: userInfo.avatarUrl,
         nickName: userInfo.nickName,
         phonenumber: G.phonenumber,
         coupons: G.coupons,
         score: G.score,
         consume:G.consume,
         consumeTime:G.consumeTime
      });

  },

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
//   onPullDownRefresh: function () {
  
//   },

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