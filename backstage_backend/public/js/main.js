$(document).ready(function() {
    let token = localStorage.getItem('token');
    if(!token) {
        window.location.href = '/';
    }
    let doc = document;

    let picPrefix = 'https://mini.wggai.com/storage/';
    let types = [];
    let theDishId = null;
    let theTypeId = null;
    let updateForm = doc.getElementById('update-form');
    let removeDiv = doc.getElementById('remove-div');
    let updateTypeForm = doc.getElementById('update-type-form');
    let removeTypeDiv = doc.getElementById('remove-type-div');

    initialPage();
    initialAdd();
    initialCheck();
    initialTipBlock(updateForm);
    initialTipBlock(removeDiv);
    initialTipBlock(updateTypeForm);
    initialTipBlock(removeTypeDiv);



    let commentChecker = new CommentChecker();
    commentChecker.check();

    /* 评论查询器 */
    let CommentChecker = function(){
        console.log('create a commentChecker')
        let limit = 10;    //默认每页的显示上限

        this.check = function(page){
            /* 初始化查询评论模块 */
            console.log('initialCheckComment');
            let commentPart = doc.getElementById('comment-part');
            console.log(commentPart);
            let p = page || 1;   //page应该是number 类型
           $.ajax({
                url:'https://mini.wggai.com/api/admin/comment/list',
                type:'POST',
                headers:{
                    Authorization:'Bearer '+token
                },
                data:{
                    limit: limit,
                    skip: (p-1) * limit,
                },
                success(res){
                    for(let i of res){
                        let li = document.createElement('li');
                        li.dataset.orderid = res.id;
                        $(li).append(`
                       <div>评论时间:${i.created_at}</div> 
                        <div>内容: <br> ${i.content}</div>
                        <button class="ui primary button">回复</button>
                    `);
                        commentPart.appendChild(li);
                        initialRepay();
                    }
                }
            });
        };

        function initialRepay(){
            $(commentPart).find('>li>button').click(function(e){
                console.log(e);
                console.log(e.target);
            })
        }

    };























    /* 初始化 */

    /* 初始化提示框 */
    function initialTipBlock(block){
        let s = block.style;
        s.position = 'fixed';
        s.top = '50%';
        s.left = '50%';
        s.transform = 'translateX(-50%) translateY(-50%)';
        s.backgroundColor = 'rgba(240,240,240,0.7)';
        s.padding = '20px';
        s.border = '2px dashed #999';
    }


    /*初始化页面*/
    function initialPage(){
        $('.ui.selection.dropdown').dropdown();
        $('.ui.menu .ui.dropdown').dropdown({
            on: 'hover'
        });
        let selectDivs = doc.getElementsByClassName('select-div');
        let showDivs = doc.getElementsByClassName('show-div');

        for(let i=0,l=selectDivs.length;i<l;i++){
            hide(showDivs[i]);
            selectDivs[i].onclick = function(){
                /*隐藏所有传参的Div*/
                for(let j=0,l=showDivs.length;j<l;j++){
                    hide(showDivs[j]);
                }
                show(showDivs[i]);
            };
        }
    }




    /* 初始化添加模块*/
    function initialAdd(){
        console.log('initialAdd...')
        let addDishForm = $('#add-dish-form');
        let addTypeForm = $('#add-type-form');
        let addDishBtn = doc.getElementById('add-dish-btn');
        let addTypeBtn = doc.getElementById('add-type-btn');
        let addSelectType = doc.getElementById('add-select-type');

        $.ajax({
            url:'https://mini.wggai.com/api/admin/menu/list',
            headers:{
                Authorization:'Bearer '+token
            },
            success(res){
                for(let i of res){
                    let o = doc.createElement('option');
                    o.value = i.id;
                    o.innerText = i.name;
                    addSelectType.appendChild(o);
                }
            }

        });

        addDishBtn.onclick = function(){
            let serializeArray = addDishForm.serializeArray();
            let data = toEasyJson(serializeArray);
            let photo = doc.querySelector('input[name="add-photo"]').files[0];

            if(!Boolean(photo)){
                alert('请上传图片');
                return;
            }else if(photo.size > 1024000){
                alert('上传的图片太大');
                return;
            }

            let formData = new FormData();
            formData.append('photo',photo);
            formData.append('name',data.name);
            formData.append('price',data.price);
            formData.append('description',data.description);
            formData.append('type',data.type);

            console.log(formData);
            $.ajax({
                url:'https://mini.wggai.com/api/admin/food/add',
                headers:{
                    Authorization:'Bearer '+token
                },
                processData: false,
                contentType: false,
                type:'POST',
                data:formData,
                success(res){
                    console.log(res);
                    alert('新增餐品 成功');
                }
            })
        };

        addTypeBtn.onclick = function(){

            let serializeArray = addTypeForm.serializeArray();
            let data = toEasyJson(serializeArray);
            console.log(data);
            if(!data.tag || !data.name){
                alert('请确保没有一项为空');
                return;
            }
            $.ajax({
                url:'https://mini.wggai.com/api/admin/menu/add',
                headers:{
                    Authorization:'Bearer '+token
                },
                type:'POST',
                data,
                success(res){
                    console.log(res);
                    alert('新增类型 成功');
                }
            })

        };

    }





    /* 初始化查询模块 */
    function initialCheck(){
        let checkForm = doc.getElementById('check-form');
        let dishCheckBtn = doc.getElementById('dish-check-btn');
        let checkBtn = doc.getElementById('check-btn');

        checkForm.style.display = 'none';
        dishCheckBtn.onclick = function(){
            if(!this.on){
                this.on = true;
                dishCheckBtn.innerText = '关闭查询方式';
                checkForm.style.display = 'block';
            }else{
                this.on = false;
                dishCheckBtn.innerText = '显示查询方式';
                checkForm.style.display = 'none';
            }
        };


        checkDishs();
        checkBtn.onclick = function(){
            let checkFormSerialize = $(checkForm).serialize();
            checkDishs(checkFormSerialize);
        };


        let showTypeBtn = doc.getElementById('show-type-btn');
        showTypeBtn.onclick = function(){
            $.ajax({
                url:'https://mini.wggai.com/api/admin/menu/list',
                headers:{
                    Authorization:'Bearer '+token
                },
                success(res){
                    let s = $('#show-type-tbody');
                    s.html('');
                    for(let i=0,l=res.length;i<l;i++){
                        s.append(`
                       <tr>
                          <td>${res[i].id}</td>
                          <td>暂未开放</td>
                          <!--<td><img style='width:100px;height:70px;' src="${picPrefix+res[i].pic}"></td>-->
                          <td>${res[i].name}</td>
                          <td>${res[i].tag}</td>
                          <td>
                            <button class="update-type-btn">修改</button>
                            <button class="remove-type-btn">删除</button>
                          </td>
                       </tr>
                    `);
                    }
                    initialTypeUpdate();
                    initialTypeRemove();
                }
            });
        }
    }



    /* 查询餐品模块 */
    function checkDishs(data){
        console.log(data);
        $.ajax({
            url:'https://mini.wggai.com/api/admin/food/list',
            headers:{
                Authorization:'Bearer '+token
            },
            data:data||{},
            success(res){
                let s = $('#show-dish-tbody');
                s.html('');
                for(let i=0,l=res.length;i<l;i++){
                    s.append(`
                   <tr>
                      <td>${res[i].id}</td>
                      <td><img style='width:100px;height:70px;' src="${picPrefix+res[i].pic}"></td>
                      <td>${res[i].name}</td>
                      <td>${res[i].type}</td>
                      <td>${res[i].description}</td>
                      <td>${res[i].price}</td>
                      <td>${res[i].sales}</td>
                      <td>${res[i].judge_times}</td>
                      <td>${String(res[i].level / res[i].judge_times).slice(0,4)}</td>
                      <td>${res[i].created_at}</td>
                      <td>
                        <button class='update-btn'>修改</button>
                        <button class='remove-btn'>删除</button>
                      </td>
                   </tr>
                `);
                }
                initialUpdate();
                initialRemove();
            }
        });
    }


    /* 初始化更新模块 */
    function initialUpdate(){
        let updateBtns = doc.getElementsByClassName('update-btn');
        let formUpdateBtn = doc.getElementById('form-update-btn');

        for(let i of updateBtns){
            i.onclick = function(){
                let p = this.parentElement.parentElement;
                let tds = $(p).find('>td');
                let id = tds[0].textContent;
                theDishId = id;
                show(updateForm);
            }
        }

        formUpdateBtn.onclick = function(){

            if(!theDishId) return ;

            let formData = new FormData();
            let data = toEasyJson($(updateForm).serializeArray());
            let photo = updateForm.querySelector('input[name="update-photo"]').files[0];

            console.log(data);

            if(!Boolean(photo) || !data.type || !data.name || !data.price || !data.description){
                alert('请确保上传图片并填好所有信息！');
                return;
            }else if(photo.size > 1024000){
                alert('上传的图片太大！');
                return;
            }

            formData.append('id',theDishId);
            formData.append('type',data.type);
            formData.append('name',data.name);
            formData.append('description',data.description);
            formData.append('price',data.price);
            formData.append('photo',photo);


            console.log('Current data of updating: ');
            console.log(formData.get('id'));
            console.log(formData.get('type'));
            console.log(formData.get('name'));
            console.log(formData.get('description'));
            console.log(formData.get('price'));
            console.log(formData.get('photo'));


            $.ajax({
                url:'https://mini.wggai.com/api/admin/food/update',
                type: 'POST',
                headers:{
                    Authorization:'Bearer '+token
                },
                processData: false,
                contentType: false,
                date:formData,
                success(res){
                    console.log(res);
                    alert('更新成功！');
                    hide()
                    hideUpdateFrame(updateForm);
                }
            });
        };

        $('#form-update-cancel-btn').click(function(){
            hide(updateForm);
        })
    }

    /* 初始化删除模块 */
    function initialRemove(){
        let removeBtns = doc.getElementsByClassName('remove-btn');
        for(let i of removeBtns){
            i.onclick = function(){
                let p = this.parentElement.parentElement;
                let tds = $(p).find('td');
                let id = tds[0].textContent;
                theDishId = id;
                show(removeDiv);
            }
        }
        let removeBtn = doc.getElementById('remove-btn');
        let removeCancelBtn = doc.getElementById('remove-cancel-btn');

        removeBtn.onclick = function(){
            console.log('正在删除： '+theDishId);

            $.ajax({
                url:'https://mini.wggai.com/api/admin/food/delete',
                type:'POST',
                headers:{
                    Authorization:'Bearer '+token
                },
                // processData: false,
                // contentType: false,
                data:{
                    id:theDishId
                },
                success(res){
                    console.log(res);
                    alert('删除成功,下次登入将会见到效果');
                    hide(removeDiv);
                }
            })
        };

        removeCancelBtn.onclick = function(){
            hide(removeDiv);
        };
    }


    /* 初始化餐品类型更新模块 */
    function initialTypeUpdate(){
        let updateTypeBtns = doc.getElementsByClassName('update-type-btn');
        for(let i of updateTypeBtns){
            i.onclick = function(){
                let p = this.parentElement.parentElement;
                let tds = $(p).find('td');
                theTypeId = tds[0].textContent;
                console.log(theTypeId);
                doc.getElementById('form-type-update-cancel-btn').onclick = function(){
                    hide(updateTypeForm);
                }
                show(updateTypeForm);
                doc.getElementById('form-type-update-btn').onclick = function(){

                    if(!theTypeId) return ;

                    let data = toEasyJson($(updateTypeForm).serializeArray());

                    data.id = theTypeId;
                    $.ajax({
                        url:'https://mini.wggai.com/api/admin/menu/update',
                        type:'POST',
                        headers:{
                            Authorization:'Bearer '+token
                        },
                        // processData: false,
                        // contentType: false,
                        data,
                        success(res){
                            console.log(res);
                            alert('修改成功！');
                            hide(updateTypeForm);
                        }
                    })
                }
            }
        }
    }

    /* 初始化类型删除模块 */
    function initialTypeRemove(){
        let removeTypeBtns = doc.getElementsByClassName('remove-type-btn');
        for(let i of removeTypeBtns){
            i.onclick = function(){
                let p = this.parentElement.parentElement;
                let tds = $(p).find('td');
                let id = tds[0].textContent;
                theTypeId = id;

                show(removeTypeDiv);
                doc.getElementById('remove-type-cancel-btn').onclick = function(){
                    hide(removeTypeDiv);
                }
                doc.getElementById('remove-type-btn').onclick = function(){

                    if(!theTypeId) return ;

                    $.ajax({
                        url:'https://mini.wggai.com/api/admin/menu/delete',
                        type:'POST',
                        headers:{
                            Authorization:'Bearer '+token
                        },
                        // processData: false,
                        // contentType: false,
                        data:{
                            id:theTypeId
                        },
                        success(res){
                            console.log(res);
                            alert('删除成功,下次登入将会见到效果');
                            hide(removeTypeDiv);
                        }
                    })
                }
            }
        }
    }





    /* ----------- 辅助函数------------- */


    function hide(block){
        block.style.display = 'none';
    }
    function show(block){
        block.style.display = 'block';
    }

    /* jquery的formSerializeArray转换 */
    function toEasyJson(serializeArray){
        let data = {};
        for(let i of serializeArray){
            data[i.name] = i.value;
        }
        return data;
    }


});