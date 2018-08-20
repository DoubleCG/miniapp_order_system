console.log('菜品管理');
	
(function mainDishManagement(){
    if(!token) window.location.href = '/';

    let Page = $(".main-dish-management")[0];

    // 关键词
    let keyword = Page.querySelector('input[name="keyword"]');

    // 较低价格框
    let lower_price = Page.querySelector('.lower_price');

    // 较高价格框
    let upper_price = Page.querySelector('.upper_price');

    // 查询餐品框
    let checkDishesBtn = Page.querySelector('.dishs>.detail>button');


    // 餐品数据部分
    let dishesDataBody = $('.dishs-data>tbody')[0];
    // 前去添加餐品的按钮
    let addDishBtn = $('.dishs-data>tfoot button')[0];
    // 添加餐品框
    let addDishsPart = $('.add-dishs-part')[0];
    // 添加餐品框的标题
    let addDishsPartTitleWord = addDishsPart.querySelector('.window>.title>span');
    // 添加餐品表单
    let addDishsForm = addDishsPart.querySelector('form');
    // 添加餐品框确认按钮
    let addDishsPartEnsureBtn = addDishsPart.querySelector('form>button');
    // 添加餐品关闭按钮
    let addDishsPartCloseBtn = addDishsPart.querySelector('.window>.title>img');

    // 类型数据体
    let typesDataBody = $('.types-data>tbody')[0];

    // 前去添加类型的按钮
    let addTypeBtn = $('.types-data>tfoot button')[0];

    let addTypesPart = $('.add-types-part')[0];
    // 添加类型框的标题
    let addTypesPartTitleWord = addTypesPart.querySelector('.window>.title>span');
    // 添加类型表单
    let addTypesForm = addTypesPart.querySelector('form');
    // 添加类型表单的选择类型按钮
    let addTypesFormToSelectTypesBtn = addTypesForm.querySelector('.toSelectImg');
    // 类型Icon组
    let typeIconsPart = addTypesForm.querySelector('.type-icons');
    // 添加类型部分确认按钮
    let addTypesPartEnsureBtn = addTypesPart.querySelector('form>button');
    // 添加类型部分关闭按钮
    let addTypesPartCloseBtn = addTypesPart.querySelector('.window>.title>img');

    // 确认弹框
    let ensurePart = $('.ensure-part')[0];

    // 确认弹框 关闭按钮
    let ensurePartCloseBtn = ensurePart.querySelector('.window>.title>img');
    // 确认弹框 取消按钮
    let ensurePartCancelBtn = ensurePart.querySelector('.btns>button:first-child');
    // 确认弹框 提示
    let ensurePartTip = ensurePart.querySelector('.content>p:last-of-type');

    // 排位选择器
    let rankwaySelect = Page.querySelector('.rankway-select');
    let rankwaySelectOptions = rankwaySelect.querySelectorAll('.options>div');

    let G = {
        changingDishs:false,
        updatingDishs:false,
        addingTypes:false,
        updatingTypes:false,
        typesData:[],
        dishesData:[],
        theDishId:null,
        theDishName:null,
        theTypeId:null,
        theTypeName:null,
        theTypeIconSrc:null,
        imgRecorder: null // 记录图片，处理兼容
    };

    // 通过ID获得类型名
    function getTypeNameById(id){
        for(let i of G.typesData){
            if(i.id === id){
                return i.name;
            }
        }
    }
    // 通过类型名获得ID
    function getTypeIdByName(name){
        for(let i of G.typesData){
            if(i.name === name){
                return i.id;
            }
        }
    }






    /* ============================== DISH ============================== */

    // 初始化设置热销按钮
    function initializeSetHotBtns(){
        let setHotBtns = dishesDataBody.querySelectorAll('tr>th:nth-last-of-type(2)>button');
        for(let i of setHotBtns){
            i.onclick = function(){
                let t = this;
                let id = t.dataset.id;
                let v = t.dataset.v;
                if(v==='1'){
                    t.dataset.v = '0';
                    t.className = 'isHot-off';
                    t.innerText = '设为热销';
                    updateDishsHot(id,'0');
                }else if(v==='0'){
                    t.dataset.v = '1';
                    t.className = 'isHot-on';
                    t.innerText = '取消热销';
                    updateDishsHot(id,'1');
                }
            }
        }

        function updateDishsHot(id,h){
            Request({
                url:'food/update',
                type:'POST',
                data:{
                    id:id,
                    hot:h
                },
                success(res){
                    console.log(res);
                }
            });
        }
    }

    // 初始化全部添加类型的Icon
    function initializeAllAddTypeIcons(){
        let addTypeIcons = addTypesForm.querySelectorAll('.type-icons>.icon');
        for(let i of addTypeIcons){
            i.onclick = function(){
                G.theTypeIconSrc = this.src;
                addTypesFormToSelectTypesBtn.querySelector('img:first-of-type').src = G.theTypeIconSrc;
            }
        }
    }

    // 初始化菜品修改按钮
    function initializeDishesChangeBtns(){

        let dishesUpdateBtns = dishesDataBody.querySelectorAll('tr>th:last-of-type>img:first-of-type');
        for(let i of dishesUpdateBtns){
            i.onclick = function(){
                show(addDishsPart);
                G.changingDishs = true;
                G.updatingDishs = true;
                if(G.updatingDishs) addDishsPartTitleWord.innerText = '修改餐品';

                let ths = $(this.parentNode).siblings();
                let id = ths[0].innerText;
                let img = ths[1].querySelector('img').src;
                let type = ths[3].innerText;
                initializeAddDishsPart(type);
                G.theDishId = id;
                G.theDishName = ths[2].innerText;  // 记录当前正在修改的餐品名字

                let adf = addDishsForm;
                adf.querySelector('input[name="name"]').value = ths[2].innerText;
                let theImg = adf.querySelector('img');
                theImg.src = img;

                adf.querySelector('input[name="price"]').value = ths[4].innerText;
                adf.querySelector('input[name="store"]').value = ths[6].innerText;
                adf.querySelector('input[name="description"]').value = ths[7].innerText;
            }
        }
        

        let dishesDeleteBtns = dishesDataBody.querySelectorAll('tr>th:last-of-type>img:last-of-type');
        for(let i of dishesDeleteBtns){
            i.onclick = function(){
                show(ensurePart);
                let id = $(this.parentNode).siblings()[0].innerText;
                let name = $(this.parentNode).siblings()[2].innerText;

                let tip = ensurePart.querySelector('.content>p>span');
                tip.innerText = name;
                tip.style.color = '#FA4E5C';

                let ensurePartEnsureBtn = ensurePart.querySelector('.btns>button:last-child');
                ensurePartEnsureBtn.onclick = function(){
                    Request({
                        url:'food/delete',
                        type:'POST',
                        data:{
                            id
                        },
                        success(){
                            hide(ensurePart);
                            checkDishes();
                        }
                    });
                }
            }
        }
    }


    // 初始化添加菜品列表
    function initializeAddDishsPart(type){
        let adf = addDishsForm;
        G.theDishId = null;
        adf.querySelector('input[name="name"]').value = '';
        adf.querySelector('input[name="img"]').value = '';
        adf.querySelector('img').src = picPrefix + 'img/main-dish-management/food.png';
        adf.querySelector('select[name="types"]').value = '';
        adf.querySelector('input[name="price"]').value = '';
        adf.querySelector('input[name="store"]').value = '';
        adf.querySelector('input[name="description"]').value = '';

        initializeAddDishesPartTypeSelect(type);

        addDishsForm.querySelector('input[name="img"]').onchange = function(){
            let t = this;
            let r = new FileReader();

            if(t.files[0]){
                r.readAsDataURL(t.files[0]);
                G.imgRecorder = t.files;
                r.onload = function(){
                    addDishsForm.querySelector('img').src = r.result;
                }
            }else{
                t.files = G.imgRecorder;
            }
        };
    }

    // 初始化 添加餐品部分类型选择
    function initializeAddDishesPartTypeSelect(typeName){
        let typeSelect = addDishsForm.querySelector('select[name="types"]');

        // ========== 修补google 兼容 ========== //
        typeSelect.onchange = function(e){
            if(this.value === '+ 添加类别'){
                hide(addDishsPart);
                show(addTypesPart);
            }
        };
        // ===============  =  =============== //


        typeSelect.value = typeName?getTypeIdByName(typeName):null;

        let gt = G.typesData;

        $(typeSelect).html('');
        $(typeSelect).append(`
                <option style='display:none;'>${typeName || "选择/新建菜品类型"}</option>
            `);
        for(let i of gt){
            $(typeSelect).prepend(`
                    <option data-id="${i.id}">${i.name}</option>
                `);
        }
        $(typeSelect).append(`
                <option onchange="return selected(this.options[this.selectedIndex].value)">+ 添加类别</option>
            `);
        addDishsPart.querySelector('form>select>option:last-of-type').onclick = function(){
            hide(addDishsPart);
            show(addTypesPart);
        };
    }


	initialize();
    function initialize(){
        checkTypes(checkDishes);

        // 检查餐品按钮
        checkDishesBtn.onclick = function(){
            checkDishes({
                keyword: keyword.value.trim(),
                price_st: lower_price.value.trim(),
                price_en: upper_price.value.trim(),
                price_or:0,
            });
        };

        // 添加餐品按钮
        addDishBtn.onclick = function(){
            G.changingDishs = true;
            G.updatingDishs = false;
            G.theDishName = name;
            G.theDishId = null;
            initializeAddDishsPart();
            if(!G.updatingDishs) addDishsPartTitleWord.innerText = '添加餐品';
            show(addDishsPart);
        };

        addDishsPartCloseBtn.onclick = function(){
            hide(addDishsPart);
            G.changingDishs = false;
        };

        ensurePartCloseBtn.onclick = function(){
            hide(ensurePart);
            hide(ensurePartTip);
        };
        ensurePartCancelBtn.onclick = function(){
            hide(ensurePart);
            hide(ensurePartTip);
        };


        addDishsPartEnsureBtn.onclick = function(){
            let adf = addDishsForm;
            let id = G.theDishId;
            let name = adf.querySelector('input[name="name"]').value.trim();
            let imgInput = adf.querySelector('input[name="img"]');
            let type = adf.querySelector('select[name="types"]').value.trim();
            let price = adf.querySelector('input[name="price"]').value.trim();
            let store = adf.querySelector('input[name="store"]').value.trim();
            let description = adf.querySelector('input[name="description"]').value.trim();

            // 判断在修改时有没有修改名字
            if(name !== G.theDishName){
                for(let i of G.dishesData){
                    if(i.name === name){
                        alert('已存在这样的菜名！');
                        return;
                    }

                }
            }

            /* 校验判断 */
            if(!name || name.length>14){
                alert('请输入长度小于14的菜名！');
            }else if(imgInput.files[0]){
                if(!imgInput.files[0] && !G.changingDishs){
                    alert('请选择图片！');
                }else if(imgInput.files[0].size > 1024*1024){
                    alert('图片必须小于1M');
                }
            }else if(type==='选择/新建菜品类型'||type==='+ 添加类别'){
                alert('请选择类别！');
            }else if(!price){
                alert('请设定价格！');
            }else if( !(Number(price) > -Infinity) ){
                alert('输入的价格非法！');
            }else if((Number(price*100) % 1)!==0){
                alert('价格必须最小以 一分 为单位');
            }else if(Number(price) <= 0){
                alert('输入的价格必须大于 0 ');
            }else if(price.length > 8) {
                alert('价格长度必须小于8位！');
            }else if(!store){
                alert('请设定每日限量！');
            }else if(!(Number(store) > -Infinity)){
                alert('每日限量数值非法！');
            }else if((Number(store) % 1) !==0 ){
                alert('每日限量必须最小以 1 为单位！');
            }else if(Number(store) < 0){
                alert('每日限量必须大于 -1 ！');
            }

            let formData = new FormData();
            formData.append('id',id);
            formData.append('name',name);
            formData.append('photo',imgInput.files[0]);
            formData.append('type',getTypeIdByName(type));
            formData.append('price',price);
            formData.append('store',store);
            formData.append('description',description||'');

            Request({
                url:'food/' + (G.updatingDishs?'update':'add'),
                type:'POST',
                data:formData,
                success(){
                    alert(G.updatingDishs?'修改成功！':'添加成功！');
                    checkDishes();
                    hide(addDishsPart);
                    G.updatingDishs = false;
                    G.changingDishs = false;
                }
            });
        };

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

                let gd = G.dishesData;
                switch(v){
                    case "1":{  // created_at: new to old
                        RankOnProperty(gd,'created_at',(p)=>new Date(p));
                        break;
                    }
                    case "2":{  // created_at: old to new
                        RankOnProperty(gd,'created_at',(p)=>new Date(p),false);
                        break;
                    }
                    case "3":{  // price: high to low
                        RankOnProperty(gd,'price',(p)=>Number(p));
                        break;
                    }
                    case "4":{  // price: low to high
                        RankOnProperty(gd,'price',(p)=>Number(p),false);
                        break;
                    }
                    case "5":{  // sales: high to low
                        RankOnProperty(gd,'sales',(p)=>Number(p));
                        break;
                    }
                    case "6":{  // sales: low to high
                        RankOnProperty(gd,'sales',(p)=>Number(p),false);
                        break;
                    }
                }
                updateDishesBodyData();
            }
        }



        /* ================ TYPE ==================*/


        initializeAllAddTypeIcons();

        // 添加类型按钮
        addTypeBtn.onclick = function(){
            show(addTypesPart);
            G.addingTypes = true;
            addTypesPartTitleWord.innerText = "新增类型";
            G.theTypeIconSrc = null;

            /* 清空新增框数据 */
            addTypesForm.querySelector('input[name="name"]').value = '';
            addTypesForm.querySelector('.toSelectImg>img:first-of-type').src='https://mini.wggai.com/storage/img/main-dish-management/image-default.png';
            addTypesForm.querySelector('input[name="description"]').value = '';
        };

        // 添加类型按钮
        addTypesPart.onclick = function(){
            hide(typeIconsPart);
            addTypesPartEnsureBtn.style.zIndex = '1';
        };

        // 添加类型表单中的选择类型按钮
        addTypesFormToSelectTypesBtn.onclick = function(e){
            let event = e||window.event;
            if (event&&event.stopPropagation) {
                event.stopPropagation();
            }else{
                window.event.cancelBubble = true;
            }
            show(typeIconsPart);
            addTypesPartEnsureBtn.style.zIndex = '-1';
        };

        // 添加类型部分关闭按钮
        addTypesPartCloseBtn.onclick = function(){
            hide(addTypesPart);
            if(G.changingDishs) show(addDishsPart);
        };

        // 添加类型部分确认按钮
        addTypesPartEnsureBtn.onclick = function(){
            let name = addTypesForm.querySelector('input[name="name"]').value.trim();
            let description = addTypesForm.querySelector('input[name="description"]').value;

            // 数据校验

            if(name !== G.theTypeName){
                if(!name||name.length > 5){
                    alert('请输入长度小于5的菜单名称！');
                }else{
                    for(let i of G.typesData){
                        if(i.name === name){
                            alert('已存在这样的类型名！');
                            return;
                        }
                    }
                }
            }

            if(!description){ alert('请输入标签描述！'); return; }
            if(!G.theTypeIconSrc){ alert('请选择图片！'); return; }

            let typeIcon = G.theTypeIconSrc.split('/');

            Request({
                url:'menu/'+(G.updatingTypes?'update':'add'),
                type:'POST',
                data:{
                    id:G.theTypeId,
                    name:name,
                    pic:typeIcon[typeIcon.length-1],
                    tag:description
                },
                success(){
                    hide(addTypesPart);
                    checkTypes();
                    G.updatingTypes = false;
                    if(G.changingDishs) show(addDishsPart);
                }
            })
        };


        let keyWord = Page.querySelector('.keyword');
        let keyWordCloseBtn = $(keyWord).next()[0];

        keyWord.onkeyup = function(){
            if(this.value){
                see(keyWordCloseBtn);
            }else{
                unsee(keyWordCloseBtn);
            }
        };
        keyWordCloseBtn.onclick = function(){
            keyWord.value = '';
            unsee(this);
        };
    }


    // 检查餐品
    function checkDishes(data){
        Request({
            url:'food/list',
            data:data||{},
            success(res){
                G.dishesData = res;
                updateDishesBodyData();
            }

        });
    }

    // 更新所有餐品列表信息
    function updateDishesBodyData(){
        let gd = G.dishesData;
        dishesDataBody.innerHTML = '';


        /* ====================请勿乱修改===================== */

        for(let i=0,l=gd.length;i<l;i++){
            $(dishesDataBody).append(`
               <tr>
                  <th>${gd[i].id}</th>
                  <th>
                    <img class="dish-img" src="${imagesPrefix  + gd[i].pic}"></th>
                  <th>${gd[i].name}</th>
                  <th>${getTypeNameById(gd[i].type)}</th>
                  <th>${gd[i].price}</th>
                  <th>${ (gd[i].sales / getDifferDays(gd[i].created_at)).toFixed(2)}</th>
                  <th>${gd[i].store}</th>
                  <th>${gd[i].description}</th>
                  <th>
                    ${  
                        (gd[i].hot==1)?
                        "<button data-v='1' data-id= "+gd[i].id+ " class='isHot-on'> 取消热销 </button>":
                        "<button data-v='0' data-id= "+gd[i].id+ " class='isHot-off'> 设置热销</button>"
                    }
                  </th>
                  <th>
                    <img class='icon' src="${picPrefix + 'img/main-dish-management/edit.png'}">
                    <img class='icon' src="${picPrefix + 'img/main-dish-management/minus.png'}">
                  </th>
               </tr>
            `);
        }

        /* ===================================================== */

        initializeSetHotBtns();
        initializeDishesChangeBtns();
    }


/* ======================================================== */












    /* ============================== TYPE ==============================*/
    function initializeTypesChangeBtns(){

        // 类型添加按钮
        let typesUpdateBtns = typesDataBody.querySelectorAll('tr>th:last-of-type>img:first-of-type');
        for(let i of typesUpdateBtns){
            i.onclick = function(){

                show(addTypesPart);
                G.updatingTypes = true;
                let ths = $(this.parentNode).siblings();
                G.theTypeId = ths[0].innerText;
                let theImgSrc = ths[1].querySelector('img').src;
                G.theTypeIconSrc = theImgSrc;
                addTypesFormToSelectTypesBtn.querySelector('img:first-of-type').src = G.theTypeIconSrc;

                let name = ths[2].innerText;
                let description = ths[3].innerText;
                addTypesForm.querySelector('input[name="name"]').value = name;
                G.theTypeName = name;

                addTypesForm.querySelector('input[name="description"]').value = description;

                addTypesPartTitleWord.innerText = "修改类型";


            };
        }


        // 类型删除按钮
        let typesDeleteBtns = typesDataBody.querySelectorAll('tr>th:last-of-type>img:last-of-type');
        for(let i of typesDeleteBtns){
            i.onclick = function(){
                show(ensurePart);
                show(ensurePartTip);
                G.updatingTypes = true;
                let siblings = $(this.parentNode).siblings();
                G.theTypeId = siblings[0].innerText;
                let theName = siblings[2].innerText;
                addTypesPartTitleWord.innerText = theName;

                let tip = ensurePart.querySelector('.content>p>span');
                tip.innerText = theName;
                tip.style.color = '#FA4E5C';

                let ensurePartEnsureBtn = ensurePart.querySelector('.btns>button:last-child');
                ensurePartEnsureBtn.onclick = function(){
                    Request({
                        url:'menu/delete',
                        type:'POST',
                        data:{
                            id:G.theTypeId,
                        },
                        success(){
                            hide(ensurePart);
                            checkTypes(checkDishes);
                        }
                    })
                };
            }
        }
    }


    // 检查类型
    function checkTypes(callback){
        Request({
            url:'menu/list',
            success(res){
                G.typesData = res;
                let gt = G.typesData;
                initializeAddDishesPartTypeSelect(gt[0].name);
                let s = $(typesDataBody);
                s.html('');

                if(!gt.length) return;

                /* ====================请勿乱修改===================== */
                for(let i=0,l=gt.length;i<l;i++){
                    s.append(`
                       <tr>
                          <th>${res[i].id}</th>
                          <th>
                            <img class='type-img' src="${typePicPrefix + res[i].pic}">
                          </th>
                          <th>${res[i].name}</th>
                          <th>${res[i].tag}</th>
                          <th>
                            <img class='icon' src="https://mini.wggai.com/storage/img/main-dish-management/edit.png">
                            <img class='icon' src="https://mini.wggai.com/storage/img/main-dish-management/minus.png">
                          </th>
                       </tr>
                    `);
                }
                /* ===================================================*/

                initializeTypesChangeBtns();
                if(typeof callback === 'function') callback();
            }
        });
    }
})();