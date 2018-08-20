const app = getApp();
const G = app.globalData;


// 如果需要画动画则创建画布，目前不要
// const ctx = wx.createCanvasContext('chooseFoodCanvas');

Page({
   data: {

      // 是否有在顶部查询状态
      isSearching:false,
      // 查询的关键词
      searchKeyword:'',
      // 是否展示已查询到的餐品
      showSearchedFoods: false,
      // 查询到餐品列表
      searchedFoods: [],


      // 左下角购物车默认与原大小比例，活跃时会是 1.5；
      bigCart: "transform:scale(1);",

      // 加载图片前缀
      picprefix: G.picprefix,

      // 循环五星
      stars: new Array(5),
      // 五星的默认图片
      normalSrc: '../../public/baseImg/normal.jpg',
      selectedSrc: '../../public/baseImg/selected.jpg',

      // 点餐动画部分，（没用）
      indicatorDots: true,
      vertical: false,
      autoplay: false,
      interval: 3000,
      duration: 1200,

      // 左栏定位用
      toView: '', 
      
      //记录每个菜单的定位锚点
      menusTop: {},

      // 加载全局餐品列表  
      dishs: G.dishs,

      // 伪注册菜单列表，在onload函数内加载全局
      menus:[],
      
      // 所选择的菜单列表ID
      selectedMenuId: 0,

      // 是否展示所选择的菜品
      showChosenFoods: false,
      
      // 加载全局所选餐品
      chosenFoods: G.chosenFoods,
      
      // 伪注册购物车记录，在onload加载全局
      total: {},

      // 所选择的优惠券id
      couponid:null,
      couponname:"选择优惠券",
   },


   // 顶部查询餐品
   searchFoods(e) {
      let t = this;

      let v = e.detail.value;   // 关键词
      let l = e.detail.cursor;  // 位置

      // 如果没有关键词，则清空
      if (!v) {
         this.setData({
            searchedFoods: [],
            showSearchedFoods: false,
            isSearching:false
         });
         return;
      }else{
         t.setData({
            searchedFoods:[]
         })
      }

      // 获得查询的餐品
      let searchedFoods = t.data.searchedFoods;
      for (let i of G.menus) {
         for (let j of i.dishs) {
            if (j.name.match(v)) { 
               searchedFoods.push(j);
            }
         }
      }

      t.setData({
         searchedFoods,
         showSearchedFoods: true,
         isSearching:true
      });
   },

   //选择相应品类的菜单,然后改变对应的菜单类型
   selectMenu: function (e) {
      let t = this;
      let data = e.currentTarget.dataset;
      t.setData({
         toView: 'v' + data.id,
         selectedMenuId: data.id
      })
   },


   showDishDetail(e){
      console.log(e);
      // wx.redirectTo({
      //    url: '../singleDish/singleDish',
      // })
   },




   //1.所选择的餐品 this.data.chosenFoods;
   //2.菜单列表中的数目; this.data.menus
   //3.全局所选餐品 : G.chosenFoods;
   //4.全局所选的餐品价格和数目: G.total;
   //5.全局的菜单 : G.menus

   // 增加某个餐品
   addCount (e) {
      let t = this;

      let currentId = e.currentTarget.dataset.id;
      let _type = e.currentTarget.dataset.type;
      let total = G.total;
      let menus = G.menus;
      let chosenFoods = G.chosenFoods;
      let searchedFoods = t.data.searchedFoods;



      let chosen = false;
      for (let i of chosenFoods) {
         if (i.id === currentId) chosen = true;
      }

      for (let i of menus) {
         let f = false;
         for (let j of i.dishs) {
            if (j.id === currentId) {
               if(j.remain <= 0){
                  return;
               }
               j.remain--;
               total.count++;
               total.money += j.price;
               j.count++;
               f = true;
               if (!chosen){
                  chosenFoods.unshift(j);
               }
            }
         }
         if (f) break;
      }


      if(searchedFoods.length){
         for (let i of searchedFoods) {
            if (i.id == currentId) i.count++;
         }
      }




      t.setData({
         menus,
         total,
         chosenFoods,
         searchedFoods,
         bigCart: 'transform:scale(1.5)',
      });

      // 点击 + 的活跃效果
      setTimeout(function () {
         t.setData({
            bigCart: 'transform:scale(1)',
         })
      }, 500);
   },

   // 查询完成
   searchFinish() {
      this.setData({
         searchedFoods: [],
         showSearchedFoods: false,
         isSearching: false,
         searchKeyword: '',
      });
   },

// 减少某个餐品
   minusCount(e) {
      let t = this;

      let currentId = e.currentTarget.dataset.id;
      let total = G.total
      let menus = G.menus;
      let chosenFoods = G.chosenFoods;
      let searchedFoods = t.data.searchedFoods;
      total.count--;

      for (let i of menus) {
         let f = false;
         for (let j of i.dishs) {
            if (j.id === currentId) {
               if (j.count <= 0){
                  j.count = 0;
               }else{
                  j.remain++;
               }
               f = true;
               break;
            }
         }
         if(f) break;
      }


      if (total.count <= 0) {
         total.count = 0;
         t.keepChoose();
      }

      if (searchedFoods.length) {
         for (let i of searchedFoods) {
            if (i.id == currentId) i.count--;
            if (i.count < 0) i.count = 0; 
         }
      }



      for (let i = 0; i < chosenFoods.length; i++) {
         if (chosenFoods[i].id === currentId) {
            chosenFoods[i].count--;
            total.money -= chosenFoods[i].price;
            if (chosenFoods[i].count <= 0)  chosenFoods.splice(i, 1);
            break;
         }
      }

      t.setData({
         menus,
         total,
         chosenFoods,
         searchedFoods,
      });



   },



   // 展示出已经选择产品的开关
   showChoose(e) {
      let showChosenFoods = !this.data.showChosenFoods;
      this.setData({
         showChosenFoods,
      })
   },

   toPay() {
      let t = this;

      let chosenFoods = G.chosenFoods;
      if (!chosenFoods.length){
         G.feedbackModal('未选择餐品');
         return;
      }


      /**这部分还仅仅是测试 */
      if(G.couponid && G.total.money < 30){
         G.feedbackModal('菜品未选满30元，不能使用该券！');
         return;
      }



      if (!G.defaultAddressData) {
         G.isShopping = true;
         wx.navigateTo({ url: '../address/address' })
      } else {
         wx.navigateTo({
            url: "../chooseOK/chooseOK?chosenFoods=" + JSON.stringify(chosenFoods)
         })
      }
   },

   toLowest() {
      let m = G.menus;
      this.setData({
         selectedMenuId: m[m.length-1].id
      })
   },
   toScroll(e) {
      let top = e.detail.scrollTop;
      let t = this.data.menusTop;
      for(let i in t){
         if (top >= t[i] - 100 && top <= t[i] + 100) {
            this.setData({
               selectedMenuId: i
            });
            break;
         }
      }
   },

   keepChoose(){
      this.setData({
         showChosenFoods : false,
      })
   },

   onLoad: function () {
      let t = this;

      if (!G.menus){
         console.log('can not get menus data from G');
         return;
      }

      let menus = G.menus;
      let menusTop = {};
      let mark = 0;

      console.log(menus);


      for (let i = 0, l = menus.length; i < l; i++) {
         menusTop[menus[i].id] = mark;
         mark += 46.6;
         for (let j = 0, l = menus[i].dishs.length; j < l; j++) {
            mark += 106;
         }
      }

      t.setData({
         menusTop,
         menus:G.menus,
         total:G.total,
         selectedMenuId:menus[0].id,
         couponid: G.couponid,
         couponname: G.couponname,
       })
      
   },


   removeCoupon(){
      let t=this;
      G.couponid = null;
      G.couponname = '选择优惠券';
      G.couponmoney = 0;
      t.setData({
         couponid:null,
         couponname:'选择优惠券',
      })
   },

   onReady: function () {
      // 页面渲染完成

   },
   onShow: function () {
      // 页面显示
   },
   onHide: function () {
      // 页面隐藏
   },
   onUnload: function () {
      // 页面关闭
   },
   onScroll: function (e) {
      console.log(e)
   }
})