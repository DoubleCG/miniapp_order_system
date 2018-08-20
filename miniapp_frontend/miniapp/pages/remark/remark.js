let app = getApp();
let G = app.globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
      content:'',
      tag1:"background-color:#FFF",
      tag2:"background-color:#FFF",
  },


   // 返回付款页
  backtopay(){
     setTimeout(function(){
         if (G.remark.length>50){
            G.feedbackModal('字数超出限制');
         }else{
            console.log('../chooseOK/chooseOK');
            wx.redirectTo({
               url: '../chooseOK/chooseOK',
            });
         }
      }, 1000);
  },

   // 绑定文本域 失去焦点
   bindTextAreaBlur: function (e) {
      G.remark = e.detail.value;
   },

   onTag1(){
      this.setData({
         tag1: "background-color:#EEE",
      })
   },

   onTag2(){
      this.setData({
         tag2: "background-color:#EEE",
      })
   },






  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.setData({
         content:app.globalData.remark
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