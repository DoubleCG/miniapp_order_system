let app = getApp();
let G = app.globalData;
// import dishs from '../../public/json/orderDetail.js';

Page({

   /**
    * 页面的初始数据
    */
   data: {

      isToTake:false,
      state:0,

      warmTipPic: '../../public/pic/clock.png',

      orderid: null,    
      theOrder: null,
      boxMoney:0,
      sendMoney:0,
      onlinePayCoupon:0,
      couponMoney:0,
      redPacketMoney:0,
      totalCount: 0,
      factPayMoney:0,
      // dishs,
      haveFoodBox: true,
      haveSendFare: true,
      haveOnlinePay: true,
      haveUseCoupon: true,
      haveUseRedPacket: true,
   },


   toTake(){
      this.setData({
         isToTake:true,
      })
   },

   cancelTake(){
      this.setData({
         isToTake:false
      })
   },

   ensureTake(){
      let t = this;
      wx.request({
         url:'https://mini.wggai.com/api/order/update',
         method:'POST',
         data:{
            third_session: wx.getStorageSync('sessionId'),
            orderid:t.data.orderid,
            state: 2 ,
         },
         success(res){
            console.log(res);
            t.setData({
               isToTake:false,
               state:2
            })
         }
      })
   },




   toComment(e) {
      let orderid = e.currentTarget.dataset.orderid;
      wx.redirectTo({
         url: '../orderComment/orderComment?orderid='+orderid,
      })
   },
   /**
    * 生命周期函数--监听页面加载
    */
   onLoad: function (options) {
      let t = this;
      let orderid = options.orderid;
      //通过orderid 去获得订单的详细信息

      // 一般会从 options 获得传参orderid，然后再从orderForm页面读取到的全局orderForms用 orderid 查询到对应的订单信息；
      let theOrder = null;
      for (let i of G.orderForms){
         if(i.id === orderid){
            theOrder = i;
            console.log(theOrder.state)
         }
      }


      // 如果没有查询到对应订单，则证明是新订单，要直接用orderid向数据库查询
      if(!theOrder){
         wx.request({
            url: 'https://mini.wggai.com/api/order/list',
            method: 'POST',
            data: {
               third_session: wx.getStorageSync('sessionId'),
               orderid,
            },
            success(res) {
               theOrder = res.data;
               console.log(theOrder.state)
               theOrder.food = JSON.parse(theOrder.food);
               
               // 填充订单中的餐品
               for (let i of theOrder.food) {
                  for (let j of G.dishs) {
                     if (i.foodid == j.id) {
                        j.number = i.number;
                        theOrder.food = [j];
                     }
                  }
               }
               clearing();
            }
         })
      }else{
         clearing();
      }


      // 清算
      function clearing(){
         let f = theOrder.food;
         let totalCount = 0;
         for (let i of f) {
            totalCount += i.price * i.number;
         }

         let
            boxMoney = 0,
            sendMoney = 0,
            onlinePayCoupon = 0,
            couponMoney = 0,
            redPacketMoney = 0;

         let factPayMoney = totalCount + boxMoney + sendMoney - onlinePayCoupon - couponMoney - redPacketMoney;

         t.setData({
            orderid,
            theOrder,
            boxMoney,
            sendMoney,
            onlinePayCoupon,
            couponMoney,
            redPacketMoney,
            totalCount,
            factPayMoney,
            state:theOrder.state
         })
      }

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