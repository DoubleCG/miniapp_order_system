Component({
  properties: {
    title: { // 属性名
      type: String, // 类型（必填），
      value: '', // 属性初始值（可选），如果未指定则会根据类型选择一个
      observer: function (newVal, oldVal) {
      } // 属性被改变时执行的函数（可选），也可以写成在methods段中定义的方法名字符串, 如：'_propertyChange'
      
    },
    links: {
      type: Boolean,
      value: true,
      observer: function (newVal, oldVal) {
        console.log(newVal, oldVal)
      } 
    }
  },
  data: {
  },
  methods: {
    onTap: function () {
      var myEventDetail = {} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    },
  }
})