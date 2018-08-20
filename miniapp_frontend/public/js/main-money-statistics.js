console.log('营业额统计');


(function mainMoneyStatistics(){

	let Page = $('.main-money-statistics')[0];

	// 单日多日切换器
	let dayChooser = Page.querySelector('.day-chooser');
	let singleDayChooser = dayChooser.querySelector('div:first-of-type');
	let manyDayChooser = dayChooser.querySelector('div:last-of-type');

    // 多日的 餐品业绩 切换器
	let appearChooser = $('.appear-chooser')[0];
	let appearRadios =  appearChooser.querySelectorAll('input[type="radio"]');

	const G = {
	    aDay:1000*60*60*24,
		dishesData:[],  // 载入餐品数据
		typesData:[],  // 载入餐品类型数据
        pageState:1,

        sSalesData:[],      // 单日未整合的餐品销售数据
		sRankData:[],       // 单日已整合的餐品销售数据，用于展示，
        sRankKeyData:null,    // 单日关键数据
        sPageChooser:{      // 单日数据的分页选择器数据
            current:1,
            total:1,
        },
        sMaxItemShow:20,  // 单日数据项每页最大展示数目

        mSalesData:[],      // 多日未整合的餐品销售数据
        mDishesRankData:[],       // 多日已整合的餐品销售数据，用于展示，
        mDishesRankKeyData:null,  // 多日关键数据
        mDishesPageChooser:{      // 多日数据的分页选择器数据
            current:1,
            total:1,
        },

        mDaysData:[],   // 多日的销售额数据
        mPerformanceRankData:[],    // 多日已整合的餐品销售数据，用于展示，
        mPerformanceRankKeyData:null,   // 多日关键数据
        mPerformancePageChooser:{   // 多日数据的分页选择器数据
            current:1,
            total:1,
        },

        mMaxItemShow: 30,  // 多日数据项每页最大展示数目
        manyDayDataState:'dishes' || 'performance',  //多日数据在 展示餐品 和 展示业绩 的两种可转换状态
	};

    function GetDishById(id){  //通过 id 去获得某餐品数据
        let gd = G.dishesData;
        for(let i of gd){
            if(i.id == id){
                return i;
            }
        }
    }

    function GetTypeById(id){  //通过 id 去获得某餐品类型数据
        let gt = G.typesData;
        for(let i of gt){
            if(i.id == id){
                return i;
            }
        }
    }








    /* =========================== 单日数据 ============================= */


    // 单日部分
    let singleDayPart = Page.querySelector('.single-day-part');
    // 单页的分页选择器
    let sPageChooser = singleDayPart.querySelector('.page-chooser');


    // 初始化单日数据
    initializeSingleDayData();
    function initializeSingleDayData(){ //关于单日的操作

        // 异步事件顺序执行， 可能会有浏览器兼容问题
        Sequence(
            n=>{
                checkDishes(n);    //查询菜品
            },
            n=>{
                checkTypes(n);    //查询菜品类别
            },
            n=>{
                checkSales('','',n);    //查询销售数据
            },
            n=>{
                computeSingleDayRankData(n);  //计算单日排位数据
            },
            n=>{
                refleshSingleDayData(n);  //刷新单日数据
            },
            n=>{
                updateSingleDayMoney();
                updateSingleDayDatePageChooser(n) //刷新单日分页选择器
            }
        );
    }


    // 检查餐品
    function checkDishes(n){   // 获得餐品数据
        console.log('checkDishes');
        Request({
            url:'food/list',
            data:{
                all:1,
            },
            success(res){
				G.dishesData = res;
				console.log(res);
				if(typeof n === 'function') n();
            }
        })
    }

    // 检查类别
    function checkTypes(n){  // 获得餐品类型数据
		console.log('checkTypes');
        Request({
			url:'menu/list',
            data:{
                all:1,
            },
			success(res){
				G.typesData = res;
                console.log(res);
                if(typeof n === 'function') n();
            }
		})
    }


    function checkSales(start,end,n){   // 检查单日或多日销售额
        // 如果start和end都是传入 空字符串 '' 的话就是返回当天数据；
        // 如果start和end相同就是返回某一天数据；
        // 如果start和end有差距，则返回多天数据；
        Request({
			url:'sale/get',
            data:{
			    start,
                end,
            },
			success(res){
                console.log('G.salesData');
                let l = 0   ;
                for(let i in res) l++;  //计算这段时间售出的不同餐品数

                if(start==='' || end==='' || start===end){
                    console.log('just get single day');
                    G.sSalesData = res;
                    G.sPageChooser.total = Math.ceil(l / G.sMaxItemShow);
                }else{
                    console.log('just get many day');
                    console.log('get: '+l+' data');
                    G.mSalesData = res;
                    G.mDishesPageChooser.total = Math.ceil(l / G.mMaxItemShow);
                }

                if(typeof n === 'function') n();
			},
            complete(res){
			    console.log('status: '+res.status);
            }
		})
	}

	/*  计算单日排位数据 */
	function computeSingleDayRankData(n){
	    console.log('computeSingleDayRankData');
		let gs = G.sSalesData;
		G.sRankData = [];

        // 把获得的销售数据和 dishesData、typesData 结合并输入到排位数据
        for(let i in gs){
            let theDish = GetDishById(i);
            G.sRankData.push({
                dishname:theDish.name,
                typename:GetTypeById(theDish.type).name,
                comment:Math.round(gs[i].comment / (gs[i].commented+1)),
                totalSale:gs[i].send + gs[i].self,
                selfSale:gs[i].self,
                sendSale:gs[i].send,
                price:theDish.price,
                totalMoney:(gs[i].self + gs[i].send) * theDish.price
            });
        }
        if(typeof n === 'function') n();
	}


	// 更新单页数据
    function refleshSingleDayData(n){
        console.log('refleshSingleDayData');

        let d = G.sRankKeyData || G.sRankData;
        let limit = G.sMaxItemShow;  // 每一页的限制
        let skip = limit * (G.sPageChooser.current - 1);  // 跳过项数

        let b = $('.single-day-part table>tbody');
        b.html('');
        if(!d.length){
            b.append(`<tr><th colspan="8">没有更多数据</th></tr>`)
        }else{
            for(let i=skip,l=skip+limit;i<l;i++){
                if(i >= d.length) break;

                /* =========== 请勿乱修改 ========== */
                b.append(`
                    <tr>
                        <th>${d[i].dishname}</th>
                        <th>${d[i].typename}</th>
                        <th>${PaintStars(d[i].comment)}</th>
                        <th>${d[i].totalSale}</th>
                        <th>${d[i].selfSale}</th>
                        <th>${d[i].sendSale}</th>
                        <th>${d[i].price}</th>
                        <th>${d[i].totalMoney}</th>
                    </tr>
                `);

                /* ============================== */
            }
        }

        if(typeof n === 'function') n();
    }

    // 更新单日销售额
    function updateSingleDayMoney(n){
        console.log('updateSingleDayMoney');
        let d = G.sRankKeyData || G.sRankData;

        let sumSelf = 0, sumSend = 0;
        for(let i of d){
            sumSelf += i.price * i.selfSale;
            sumSend += i.price * i.sendSale;
        }

        // 统计销售额
        let sMoney = singleDayPart.querySelector('.total-money');
        sMoney.querySelector('div:first-of-type>span:first-of-type').innerText  = sumSelf + sumSend;
        sMoney.querySelector('div:last-of-type>span:first-of-type').innerText = sumSelf;
        sMoney.querySelector('div:last-of-type>span:last-of-type').innerText = sumSend;

        if(typeof n === 'function') n();
    }

    // 刷新单日数据的分页选择器
    function updateSingleDayDatePageChooser(n){
        console.log('updateSingleDayDatePageChooser');

        // 制作分页选择器
        MakePageChooser({
            obj: sPageChooser,
            current:G.sPageChooser.current,
            total:G.sPageChooser.total,
            callback(p){
                G.sPageChooser.current = p;
                refleshSingleDayData();
            },
        });

	    if(typeof n === 'function') n();
    }



    // 初始化单日选择器
    let sDateInput = singleDayPart.querySelector('.query>.detail-li:first-of-type>input');
    sDateInput.value = TodayAndWeekAgo()[1];
    sDateInput.max = TodayAndWeekAgo()[1];
    sDateInput.onchange = function(){
        checkSales(this.value,this.value,function(){
            computeSingleDayRankData();
            refleshSingleDayData();
            updateSingleDayMoney();
            updateSingleDayDatePageChooser();
        });
    };


    // 单日关键词
    let sKeyWord = singleDayPart.querySelector('.keyword');
    let sKeyWordCloseBtn = $(sKeyWord).next()[0];

    sKeyWord.onkeyup = function(){
        if(this.value){
            see(sKeyWordCloseBtn);
        }else{
            unsee(sKeyWordCloseBtn);
            G.sRankKeyData = null;
            refleshSingleDayData();
            updateSingleDayMoney();
            show(sPageChooser);
        }
    };

    sKeyWordCloseBtn.onclick = function(){
        sKeyWord.value = '';
        G.sRankKeyData = null;
        unsee(this);
        updateSingleDayMoney();
        refleshSingleDayData();
        show(sPageChooser);
    };

    // 初始化关键词确认按钮
    let sQueryBtn = singleDayPart.querySelector('.query>button');
    sQueryBtn.onclick = querySingleDayKey;
    sKeyWord.onkeydown = function(e){
        if(e.keyCode === 13) querySingleDayKey();
    };

    // 查询单日关键词
    function querySingleDayKey(){
        let k = sKeyWord.value.trim();
        if(!k) return;

        hide(sPageChooser);
        let rd = G.sRankData;

        let record = [];
        for(let i of rd){
            if(i.dishname.match(k) || i.typename.match(k)){
                record.push(i);
            }
        }

        G.sRankKeyData = record;
        refleshSingleDayData();
        updateSingleDayMoney();
    };



    // 单日部分右上角手动刷新按钮
    singleDayPart.querySelector('.query>a').onclick = function(){
        sDateInput.value = TodayAndWeekAgo()[1];
        initializeSingleDayData();
    };

    // 单日排位选择器
    let sRankwaySelect = Page.querySelector('.rankway-select');
    let sRankwaySelectOptions = sRankwaySelect.querySelectorAll('.options>div');

    sRankwaySelect.onclick = function(){
        let t = this;
        let onHeight = 24 + 30 * sRankwaySelectOptions.length;
        let offHeight = 24;
        t.style.height = (t.on?offHeight:onHeight) + 'px';
        t.on = !t.on;
    };

    for(let i of sRankwaySelectOptions){
        i.onclick = function(){
            // 同时把 G.sRankKeyData  G.sRankData 刷新排位
            let rkd = G.sRankKeyData;
            let rd = G.sRankData;
            console.log(rd);
            let v = this.dataset.v;
            sRankwaySelect.value = v;
            sRankwaySelect.querySelector('span').innerText = this.innerText;

            switch(v){
                case "1":{  // sales high to low
                    RankOnProperty(rd,'totalSale',(p)=>Number(p));
                    if(rkd) RankOnProperty(rkd, 'totalSale', (p)=>Number(p));
                    break;
                }
                case "2":{  // sales low to high
                    RankOnProperty(rd,'totalSale',(p)=>Number(p),false);
                    if(rkd) RankOnProperty(rkd, 'totalSale', (p)=>Number(p),false);
                    break;
                }
                case "3":{  // 评分从高到低
                    RankOnProperty(rd,'comment',(p)=>Number(p));
                    if(rkd) RankOnProperty(rkd, 'comment', (p)=>Number(p));
                    break;
                }
                case "4":{  // 评分从低到高
                    RankOnProperty(rd,'comment',(p)=>Number(p),false);
                    if(rkd) RankOnProperty(rkd, 'comment', (p)=> Number(p),false);
                    break;
                }
                case "5":{  // 销售额从高到低
                    RankOnProperty(rd,'totalMoney',(p)=>Number(p));
                    if(rkd) RankOnProperty(rkd, 'totalMoney', (p)=>Number(p));
                    break;
                }
                case "6":{  // 销售额从低到高
                    RankOnProperty(rd,'totalMoney',(p)=>Number(p),false);
                    if(rkd) RankOnProperty(rkd,'totalMoney',(p)=>Number(p),false);
                    break;
                }
            }
            refleshSingleDayData();
        }
    }


    /* =================================================================== */












/*======================多日数据部分========================*/

    let manyDayPart = Page.querySelector('.many-day-part');

    let dates = manyDayPart.querySelectorAll('.detail>.query>.detail-li:first-of-type>input');
    let mPageChooser = manyDayPart.querySelectorAll('.page-chooser');
	let mMoneyDatas = manyDayPart.querySelectorAll('.money-data-table-wrap>table');
    let mMoney = manyDayPart.querySelector('.total-money');

    hide(mPageChooser[1]);
    updateManyDayDatePageChooser();

    initializeManyDataInput();
    function initializeManyDataInput(){
        let d = TodayAndWeekAgo();

        dates[0].value = d[0];
        dates[0].max = GetInputTime(new Date(new Date(d[1]).getTime() - G.aDay));
        dates[1].value = d[1];
        dates[1].max = d[1];
        dates[1].min = GetInputTime(new Date(new Date(d[0]).getTime() + G.aDay));

        dates[0].onchange = function(){
            dates[1].min = GetInputTime(new Date(new Date(this.value).getTime() + G.aDay));
            mCheck();
        };
        dates[1].onchange = function(){
            dates[0].max = GetInputTime(new Date(new Date(this.value).getTime() - G.aDay));
            mCheck();
        };
    }


    function mCheck(){
        checkSales(dates[0].value,dates[1].value,function(){
            getManyDayPerformance(dates[0].value,dates[1].value,function(){
                computeManyDayRankData();  //计算多日排位数据
                refleshManyDayData();  //刷新多日数据
                updateManyDayMoney();
                updateManyDayDatePageChooser() //刷新分页选择器
            });
        })
    }


    let mKeyWord = manyDayPart.querySelector('.keyword');
    let mKeyWordCloseBtn = $(mKeyWord).next()[0];
    mKeyWord.onkeyup = function(){
        let v = this.value;
        if(v){
            see(mKeyWordCloseBtn);
        }else{
            unsee(mKeyWordCloseBtn);
            G.mDishesRankKeyData = null;
            refleshManyDayData();
            updateManyDayMoney();
            show(mPageChooser[0]);
        }
    };
    mKeyWordCloseBtn.onclick = function(){
        mKeyWord.value = '';
        unsee(this);
        G.mDishesRankKeyData = null;
        updateManyDayMoney();
        refleshManyDayData();
        show(mPageChooser[0]);
    };


    // 初始化关键词确认按钮；
    let mQueryBtn = manyDayPart.querySelector('.query>button');
    mQueryBtn.onclick = queryManyDayKey;
    mKeyWord.onkeydown = function(e){
        if(e.keyCode === 13) queryManyDayKey();
    };
    function queryManyDayKey(){
        let k = mKeyWord.value.trim();
        if(!k) return;

        hide(mPageChooser);
        let rd = G.mDishesRankData;

        let record = [];
        for(let i of rd){
            if(i.dishname.match(k) || i.typename.match(k)){
                record.push(i);
            }
        }
        G.mDishesRankKeyData = record;
        refleshManyDayData();
        updateManyDayMoney();

    };


    /*  计算多日排位数据 */
    function computeManyDayRankData(n){
        console.log('computeManyDayRankData');
        let gs = G.mSalesData;
        G.mDishesRankData = [];

        // 把获得的销售数据和整合并输入到排位数据
        for(let i in gs){
            let theDish = GetDishById(i);
            G.mDishesRankData.push({
                dishname:theDish.name,
                typename:GetTypeById(theDish.type).name,
                comment:Math.round(gs[i].comment / (gs[i].commented+1)),
                totalSale:gs[i].send + gs[i].self,
                selfSale:gs[i].self,
                sendSale:gs[i].send,
                price:theDish.price,
                totalMoney:(gs[i].self + gs[i].send) * theDish.price
            });
        }

        RankOnProperty(G.mDishesRankData,'totalSale', (p)=>Number(p));

        if(typeof n === 'function') n();
    }

    // 更新单页数据
    function refleshManyDayData(n){
        console.log('refleshManyDayData');
        let d = G.mDishesRankKeyData || G.mDishesRankData;
        let limit = G.mMaxItemShow;  // 每一页的限制
        let skip = limit * (G.mDishesPageChooser.current - 1);  // 跳过项数

        let b = $('.many-day-part table>tbody')[0];
        $(b).html('');
        if(!d.length){
            $(b).append(`<tr><th colspan="8">没有更多数据</th></tr>`)
        }else{
            for(let i=skip,l=skip+limit;i<l;i++){
                if(i >= d.length) break;
                $(b).append(`
				<tr>
					<th>${d[i].dishname}</th>
					<th>${d[i].typename}</th>
					<th>${PaintStars(d[i].comment)}</th>
					<th>${d[i].totalSale}</th>
					<th>${d[i].selfSale}</th>
					<th>${d[i].sendSale}</th>
					<th>${d[i].price}</th>
					<th>${d[i].totalMoney}</th>
				</tr>
    		`);
            }
        }

        let d1 = G.mPerformanceRankKeyData || G.mPerformanceRankData;
        let limit1 = G.mMaxItemShow;
        let skip1 = limit1 * (G.mPerformancePageChooser.current - 1); // 跳过项数

        let b1 = $('.many-day-part table>tbody')[1];

        console.log('get b1:');
        console.log(b1);

        $(b1).html('');
        if(!d1.length){
            $(b1).append(`<tr><th colspan="8">没有更多数据</th></tr>`)
        }else{
            for(let i=skip1,l=skip1+limit1;i<l;i++){
                if(i >= d1.length) break;
                $(b1).append(`
				<tr>
					<th>${d1[i].day}</th>
					<th>${d1[i].selfPerformance}</th>
					<th>${d1[i].sendPerformance}</th>
					<th>${d1[i].totalPerformance}</th>
					<th>${d1[i].bestDish}</th>
				</tr>
    		`);
            }
        }

        if(typeof n === 'function') n();
    }

    // 更新单日或包含关键项销售额
    function updateManyDayMoney(n){
        console.log('updateManyDayMoney');
        let d = G.mDishesRankKeyData || G.mDishesRankData;

        let sumSelf = 0, sumSend = 0;
        for(let i of d){
            sumSelf += i.price * i.selfSale;
            sumSend += i.price * i.sendSale;
        }

        mMoney.querySelector('div:first-of-type>span:first-of-type').innerText  = sumSelf + sumSend;
        mMoney.querySelector('div:last-of-type>span:first-of-type').innerText = sumSelf;
        mMoney.querySelector('div:last-of-type>span:last-of-type').innerText = sumSend;

        if(typeof n === 'function') n();
    }

    // 刷新多日数据的分页选择器
    function updateManyDayDatePageChooser(n){
        console.log('updateManyDayDatePageChooser');

        MakePageChooser({
            obj: mPageChooser[0],
            current:G.mDishesPageChooser.current,
            total:G.mDishesPageChooser.total,
            callback:function(p){
                G.mDishesPageChooser.current = p;
                refleshManyDayData();
            },
        });
        MakePageChooser({
            obj: mPageChooser[1],
            current:G.mPerformancePageChooser.current,
            total:G.mPerformancePageChooser.total,
            callback:function(p){
                G.mPerformancePageChooser.current = p;
                refleshManyDayData();
            },
        });

        if(typeof n === 'function') n();
    }


    // 获得多日业绩报表数据
    function getManyDayPerformance(start,end,n){
        Request({
            url:'sale/detail',
            data:{
                start,
                end,
            },
            success(res){
                console.log(res);
                G.mDaysData = res;
                let mdd = G.mDaysData;
                G.mPerformanceRankData = [];   // 先清空
                let mprd = G.mPerformanceRankData;

                for(let i in mdd){
                    let selfPerformance = 0;
                    let sendPerformance = 0;

                    let bestDish = null;
                    let bestDishPerformance = 0;

                    for(let j in mdd[i]){

                        let theDish = GetDishById(j);

                        // console.log(theDish);

                        let price = theDish.price;
                        let selfMoney = price * mdd[i][j].self;
                        let sendMoney = price * mdd[i][j].send;


                        selfPerformance += selfMoney;
                        sendPerformance += sendMoney;

                        if(selfMoney + sendMoney > bestDishPerformance){
                            bestDishPerformance = selfMoney + sendMoney;
                            bestDish = theDish.name;
                        }
                    }
                    mprd.push({
                        day:i,
                        selfPerformance,
                        sendPerformance,
                        totalPerformance:selfPerformance + sendPerformance,
                        bestDish,
                    })
                }
                if(typeof n === 'function') n();
            }
        })
    }

    setTimeout(initializeManyDayData,3000);

    function initializeManyDayData(){
        Sequence(
            n=>{
                checkSales(dates[0].value,dates[1].value,n);    //查询销售数据
            },
            n=>{
                getManyDayPerformance(dates[0].value,dates[1].value,n);
            },
            n=>{
                computeManyDayRankData(n);  //计算单日排位数据
            },
            n=>{
                refleshManyDayData(n);  //刷新单日数据
            },
            n=>{
                updateManyDayMoney();
                updateManyDayDatePageChooser(n) //刷新单日分页选择器
            }
        );
    }


    // 单日部分右上角手动刷新按钮
    manyDayPart.querySelector('.query>a').onclick = function(){
        initializeManyDataInput();
        initializeManyDayData();
    };

    let mRankwaySelect = manyDayPart.querySelectorAll('.rankway-select');
    let mDishesRankwaySelectOptions = mRankwaySelect[0].querySelectorAll('.options>div');
    let mPerformanceRankwaySelectOptions = mRankwaySelect[1].querySelectorAll('.options>div');

    mRankwaySelect[0].onclick = function(){
        let t = this;
        let onHeight = 24 + 30 * mDishesRankwaySelectOptions.length;
        let offHeight = 24;
        t.style.height = (t.on?offHeight:onHeight) + 'px';
        t.on = !t.on;
    };
    mRankwaySelect[1].onclick = function(){
        let t = this;
        let onHeight = 24 + 30 * mPerformanceRankwaySelectOptions.length;
        let offHeight = 24;
        t.style.height = (t.on?offHeight:onHeight) + 'px';
        t.on = !t.on;
    };
    hide(mRankwaySelect[1]);

    for(let i of mDishesRankwaySelectOptions){
        i.onclick = function(){
            // 同时把 G.sRankKeyData  G.sRankData 刷新排位
            let rkd = G.mDishesRankKeyData;
            let rd = G.mDishesRankData;
            console.log(rd);
            let v = this.dataset.v;
            mRankwaySelect[0].value = v;
            mRankwaySelect[0].querySelector('span').innerText = this.innerText;

            switch(v){
                case "1":{  // sales high to low !!
                    RankOnProperty(rd,'totalSale', (p)=>Number(p));
                    if(rkd) RankOnProperty(rkd, 'totalSale', (p)=>Number(p) );
                    break;
                }
                case "2":{  // sales low to high
                    RankOnProperty(rd,'totalSale', (p)=> Number(p) ,false);
                    if(rkd) RankOnProperty(rkd, 'totalSale', (p)=>Number(p) ,false);
                    break;
                }
                case "3":{  // 销售额从高到低
                    RankOnProperty(rd,'totalMoney',(p)=>Number(p));
                    if(rkd) RankOnProperty(rkd, 'totalMoney', (p)=>Number(p));
                    break;
                }
                case "4":{  // 销售额从低到高
                    RankOnProperty(rd,'totalMoney', (p)=>Number(p), false);
                    if(rkd) RankOnProperty(rkd, 'totalMoney', (p)=>Number(p),false);
                    break;
                }
                case "5":{  // 评分从高到低
                    RankOnProperty(rd,'comment', (p)=> Number(p));
                    if(rkd) RankOnProperty(rkd, 'comment', (p)=>Number(p));
                    break;
                }
                case "6":{  // 评分从低到高
                    RankOnProperty(rd,'comment',(p)=> Number(p),false);
                    if(rkd) RankOnProperty(rkd,'comment',(p)=>Number(p),false);
                    break;
                }
            }
            refleshManyDayData();
        }
    }



    for(let i of mPerformanceRankwaySelectOptions){
        i.onclick = function(){
            // 同时把 G.sRankKeyData  G.sRankData 刷新排位
            let rkd = G.mPerformanceRankKeyData;
            let rd = G.mPerformanceRankData;
            let v = this.dataset.v;
            mRankwaySelect[1].value = v;
            mRankwaySelect[1].querySelector('span').innerText = this.innerText;

            switch(v){
                case "1":{  // totalPerformance high to low
                    RankOnProperty(rd,'totalPerformance',(p)=>Number(p));
                    if(rkd) RankOnProperty(rkd, 'totalPerformance', (p)=>Number(p));
                    break;
                }
                case "2":{  // 总业绩从低到高
                    RankOnProperty(rd,'totalPerformance',(p)=>Number(p),false);
                    if(rkd) RankOnProperty(rkd, 'totalPerformance', (p) =>Number(p),false);
                    break;
                }
                case "3":{   //自提业绩从高到低
                    RankOnProperty(rd,'selfPerformance',(p)=>Number(p));
                    if(rkd) RankOnProperty(rkd, 'selfPerformance', (p)=>Number(p));
                    break;
                }
                case "4":{  // 自提业绩从低到高
                    RankOnProperty(rd,'selfPerformance',(p)=>Number(p),false);
                    if(rkd) RankOnProperty(rkd, 'selfPerformance', (p)=>Number(p),false);
                    break;
                }
                case "5":{  // 配送业绩从高到低
                    RankOnProperty(rd,'sendPerformance',(p)=>Number(p););
                    if(rkd) RankOnProperty(rkd, 'sendPerformance',  (p)=>Number(p));
                    break;
                }
                case "6":{  // 销售额从低到高
                    RankOnProperty(rd,'sendPerformance',(p)=>Number(p),false);
                    if(rkd) RankOnProperty(rkd,'sendPerformance',(p)=>Number(p),false);
                    break;
                }
            }
            refleshManyDayData();
        }
    }

//=======================================================================
















/* ======================= 初始化页面的基本布局功能 ===================*/

    updatePagePart();
    hide(mMoneyDatas[1]);
    hide(mMoney);

    singleDayChooser.onclick = function(){
        G.pageState = 1;
        singleDayChooser.className='active';
        manyDayChooser.className='';
        updatePagePart()
    };
    manyDayChooser.onclick = function(){
        G.pageState = 'n';
        singleDayChooser.className='';
        manyDayChooser.className='active';
        updatePagePart()
    };

    appearRadios[0].checked = true;
    appearRadios[1].checked = false;
    appearRadios[0].onclick = function(){
        appearRadios[0].checked = true;
        appearRadios[1].checked = false;
        G.manyDayDataState = 'dishes';
        updateManyDayData();
    };
    appearRadios[1].onclick = function(){
        appearRadios[0].checked = false;
        appearRadios[1].checked = true;
        G.manyDayDataState = 'performance';
        updateManyDayData();
    };

	function updatePagePart(){
		let state = G.pageState;
		if(state===1){
			show(singleDayPart);
			hide(manyDayPart);
		}else if(state==='n'){

			show(manyDayPart);
			hide(singleDayPart);
		}
	}




	function updateManyDayData(){
	    console.log(mRankwaySelect);
		let state = G.manyDayDataState;
	    let mKeywordLi = manyDayPart.querySelector('.detail>.query>.detail-li:nth-of-type(2)');

		if(state === 'dishes'){
			show(mMoneyDatas[0]);
            hide(mMoneyDatas[1]);
            show(mRankwaySelect[0]);
            hide(mRankwaySelect[1]);
            show(mKeywordLi);
            hide(mMoney);
            show(mPageChooser[0]);
            hide(mPageChooser[1]);
        }else if(state === 'performance'){
			show(mMoneyDatas[1]);
			hide(mMoneyDatas[0]);
            show(mRankwaySelect[1]);
            hide(mRankwaySelect[0]);
            show(mMoney);
            hide(mKeywordLi);
            show(mPageChooser[1]);
            hide(mPageChooser[0]);
        }
	}
})();