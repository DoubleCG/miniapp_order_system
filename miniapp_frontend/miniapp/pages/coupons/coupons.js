// import coupons from "../../public/json/coupons.js";
let app = getApp();
let G = app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
     textColor1: 'color:red', 
     textColor2: 'color:#BBB',
     textColor3: 'color:#BBB',
     couponState: 'toUse' || 'hadUse' || 'hadExpire',
  },

   t1(){
      this.setData({
         textColor1:'color:red',
         textColor2:'color:#BBB',
         textColor3:'color:#BBB',
         couponState:'toUse'
      })
   },
   t2(){
      this.setData({
         textColor1: 'color:#BBB',
         textColor2: 'color:red',
         textColor3: 'color:#BBB',
         couponState: 'hadUse'
      })
   },
   t3(){
      this.setData({
         textColor1: 'color:#BBB',
         textColor2: 'color:#BBB',
         textColor3: 'color:red',
         couponState: 'hadExpire'
      })
   },

   toBuy(e){

      if(true){
         G.feedbackModal('未开放优惠券，敬请期待！');
         return;
      }

      let isPaying = G.isPaying;
      let d = e.currentTarget.dataset;

      if (G.isPaying && G.total.money < 30) {
         G.feedbackModal('未满30元，不能选择该优惠券。');
         return;
      }

      G.couponid = d.couponid;
      G.couponname = d.couponname;
      G.couponmoney = d.couponmoney;

      wx.redirectTo({
         url: isPaying?'../chooseOK/chooseOK':'../chooseFood/chooseFood',
      });
   },

  /**
   * 生命周期函数--监听页面加载
   */
   onLoad: function (options) {
      this.setData({
         coupons: app.globalData.coupons
      })
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