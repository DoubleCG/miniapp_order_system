console.log('订单明细');


(function mainOrderDetail(){

	let Page = $('.main-order-detail')[0];
	let keyWord = Page.querySelector('.keyword');
	let keyWordCloseBtn = $(keyWord).next()[0];

	// 查询按钮
	let queryBtn = Page.querySelector('.detail>.query>button');



    let ordersDataBody = Page.querySelector('.orders-data>tbody');

	let G = {
        hasInitializePageChooser:false,
        currentPage: 1,
        totalPage: 1,
		pageNumbersNumber: 6,
		maxPageNumber: 30,
		ordersData:[],
		dishsData:[],
	};
	

	function getDishsData(callback){
		Request({
			url:'food/list',
			data:{
				all:1
			},
			success(res){
				G.dishsData = res;
				if(typeof callback === 'function') callback();
			}
		})
	}

	function checkOrders(keyword){
		Request({
			url:'order/list',
			data:{
				limit:G.maxPageNumber,
				page:G.currentPage,
				all:1,
				keyword:keyword || null,
			},
			success(res){
				G.ordersData = res.data;
                updateOrdersData();

                if(!G.hasInitializePageChooser){
                    G.totalPage = Math.ceil(res.total / G.maxPageNumber);
                    MakePageChooser({
                        obj: Page.querySelector('.page-chooser'),
                        current:G.currentPage,
                        total:G.totalPage,
                        pageNumber:G.pageNumbersNumber,
                        callback:function(p){
							G.currentPage = p;
							checkOrders();
						},
                    });
                    G.hasInitializePageChooser = true;
				}
			}
		})
	}

	// 更新订单数据
	function updateOrdersData(){
        let gd = G.ordersData;
		let o = $(ordersDataBody);
        o.html('');
        for(let i=0,l=gd.length;i<l;i++){
        	o.append(`
			<tr>
				<th>${gd[i].id}</th>
				<th>${getFoodsDataDetail(JSON.parse(gd[i].food))}</th>
				<th>${gd[i].name+ ' 电话：'+ gd[i].phone}</th>
				<th>${gd[i].address}</th>
				<th>${gd[i].created_at}</th>
				<th>${gd[i].remark?gd[i].remark:"没有留言"}</th>
				<th>
					<button data-status='2' class='got'>已取餐</button>
				</th>
			</tr>
        `)
		}
        initializeButtons();
	}

	// 获得餐品数据详情
	function getFoodsDataDetail(foods){
		let result = '',gd=G.dishsData;
		for(let i of foods){
			for(let j of gd){
                if(i.foodid == j.id){
                	result += j.name + ' * ' + i.number +' ';
                	break;
                }
			}
		}
		return result;
	}

	// 初始化按钮
	function initializeButtons(){

		let notSendBtns = ordersDataBody.querySelectorAll('button.not-send');
		let sendingBtns = ordersDataBody.querySelectorAll('button.sending');

		for(let i of notSendBtns){
			i.onclick = function(){
				changeBtnStatus(this);
			}
		}

		for(let i of sendingBtns){
			i.onclick = function(){
				changeBtnStatus(this);
			}
		}

		function changeBtnStatus(btn){
			if(btn.dataset.status==='1'){
				btn.dataset.status='0';
				btn.className = 'not-send';
				btn.innerText = '未配出';
			}else if(btn.dataset.status==='0'){
				btn.dataset.status='1';
				btn.className = 'sending';
				btn.innerText = '已送出';
			}
		}
	}


	initialize();
	function initialize(){
        getDishsData(checkOrders);
		keyWord.onkeyup = function(){
			let v = this.value;
			G.keyword = v;
			if(v){
				see(keyWordCloseBtn);
			}else{
				unsee(keyWordCloseBtn);
			}
		};

        queryBtn.onclick = function(){
        	console.log('queryBtn');
			checkOrders(G.keyword);

		};

		keyWordCloseBtn.onclick = function(){
			keyWord.value = '';
			unsee(this);
		};


        // 排位选择器
        let rankwaySelect = Page.querySelector('.rankway-select');
        let rankwaySelectOptions = rankwaySelect.querySelectorAll('.options>div');

        rankwaySelect.onclick = function(){
            let t = this;
            let onHeight = 24 + 30 * rankwaySelectOptions.length;
            let offHeight = 24;
            t.style.height = (t.on?offHeight:onHeight) + 'px';
            t.on = !t.on;
        };

        for(let i of rankwaySelectOptions){
            i.onclick = function(){
                let v = this.dataset.v;
                rankwaySelect.value = v;
                rankwaySelect.querySelector('span').innerText = this.innerText;

                let go = G.ordersData;
                switch(v){
                    case "1":{  // created_at: new to old
                        RankOnProperty(go,'created_at', (p)=>new Date(p));
                        break;
                    }
                    case "2":{  // created_at: old to new
                        RankOnProperty(go,'created_at',(p)=>new Date(p),false);
                        break;
                    }
                    case "3":{  // 置顶自提订单
                        RankOnProperty(go,'take',(p)=>(p == 0)?Infinity:-Infinity);
                        break;
                    }
                    case "4":{  // 置顶配送订单
                        RankOnProperty(go,'take',(p)=>(p == 1)?Infinity:-Infinity);
                        break;
                    }
                    case "5":{  // 置顶已取餐订单
                        RankOnProperty(go,'state',(p)=>(p == 2)?Infinity:-Infinity);
                        break;
                    }
                    case "6":{  // 置顶已送出订单
                        RankOnProperty(go,'state',(p)=>(p == 1)?Infinity:-Infinity);
                        break;
                    }
                    case "7":{  // 置顶未送出订单
                        RankOnProperty(go,'state',(p)=>(p == 0)?Infinity:-Infinity);
                        break;
                    }
                }
                updateOrdersData();
            }
        }
	}
})();