let app = getApp();
let G = app.globalData;
// pages/orderComment/orderComment.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
     tags: ['口味极佳','极具分量','配送态度良好'],
     normal: '../../public/baseImg/normal.jpg',
     selected: '../../public/baseImg/selected.jpg',
     starLevel: [false, false, false, false, false],
     level:-1,
     content: '',
     orderid: '',
  },


   imageover(e){
      let t = this;
      let level = e.currentTarget.dataset.level;
      let starLevel = t.data.starLevel;
      for(let i=0;i<5;i++){
         starLevel[i] = Boolean(i<=level);
      }
      t.setData({
         starLevel,
         level,
      });
   },

   bindTextAreaBlur: function (e) {
      this.setData({
         content: e.detail.value
      })
   }, 

   finishComment(){
      let t = this;

      let level = t.data.level + 1;
      if(!level){
         G.feedbackModal('请为本单就餐体验打分');
         return;
      }



      setTimeout(function(){

         wx.request({
            url: 'https://mini.wggai.com/api/comment/create',
            method: 'POST',
            data: {
               third_session: wx.getStorageSync('sessionId'),
               orderid: t.data.orderid,
               level: t.data.level + 1,
               content: t.data.content,
            },
            success(e) {
               console.log(e)
            }
         });

      },500);

      G.feedbackModal('感谢您的评价和建议', ()=>{
         wx.redirectTo({
            url: '../orderForm/orderForm',
         })
      })
   },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log(options)
      this.setData({
         orderid:options.orderid
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