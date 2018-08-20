console.log('评论管理');



(function mainCommentManagement(){


    let Page = $('.main-comment-management')[0];

    // 评论数据 部分
    let commentsDataBody = Page.querySelector('.comments-data>tbody');

    // 回复评论 输入框
    let commentsReply = $('.comments-reply')[0];
	let commentsReplyCloseBtn = commentsReply.querySelector('.title>img');
	let commentsReplyEnsureBtn = commentsReply.querySelector('.content>button');

    // 回复评论 确认框
	let commentsEnsurePart = $('.comments-ensure-part')[0];
    let commentsEnsurePartCloseBtn = commentsEnsurePart.querySelector('.title>img');
    let commentsEnsurePartCancelBtn = commentsEnsurePart.querySelector('.content>.btns>button:first-of-type');
    let commentsEnsurePartEnsureBtn = commentsEnsurePart.querySelector('.content>.btns>button:last-of-type');

    // 查询评论的前后时间
	let queryStartTime = $('#start-time')[0];
	let queryEndTime = $('#end-time')[0];


	let G = {
        currentPage: 1,
        totalPage: 1,
        theOrderId:null,
		pageNumbersNumber: 6,
        comments:[],
	};

    // 排位方式选择
    let rankwaySelect = Page.querySelector('.rankway-select');
    let rankwaySelectOptions = rankwaySelect.querySelectorAll('.options>div');

    // 有待优化部分
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
                    RankOnProperty(go,'created_at', (p)=> new Date(p));
                    break;
                }
                case "2":{  // created_at: old to new
                    RankOnProperty(go,'created_at',(p)=> new Date(p), false);
                    break;
                }
                case "3":{  // 置顶自提订单
                    RankOnProperty(go,'take',(p)=>(p === 'self')?Infinity:-Infinity );
                    break;
                }
                case "4":{  // 置顶配送订单
                    RankOnProperty(go,'take', (p)=>(p === 'send')?Infinity:-Infinity);
                    break;
                }
                case "5":{  // 置顶已取餐订单
                    RankOnProperty(go,'state',(p)=>(p == 0)?Infinity:-Infinity);
                    break;
                }
                case "6":{  // 置顶已送出订单
                    RankOnProperty(go,'state',(p)=>(p == 1)?Infinity:-Infinity);
                    break;
                }
                case "7":{  // 置顶未送出订单
                    RankOnProperty(go,'state',(p)=>(p == 2)?Infinity:-Infinity);
                    break;
                }
            }
            updateComments();
        }
    }



    // 向数据库查询评论
    function checkComments(p){
        Request({
            url:'comment/list',
            data:{
                page:p||1
            },
            success(res){
                G.comments = res.data;
                G.currentPage = p;
                G.totalPage = res.last_page;
                updateComments();

                // 制作分页器
                MakePageChooser({
                    obj:$('.comment-page-chooser')[0],
                    current:G.currentPage,
                    total:G.totalPage,
                    pageNumber:G.pageNumbersNumber,
                    callback(d){
                        checkComments(d);
                    },
                });
            }
        })
    }

    // 更新评论
    function updateComments(){
        let b = $(commentsDataBody);
        b.html('');
        let gc = G.comments;
        for(let i of gc){
            b.append(`
                <tr>
                    <th>${i.id}</th>
                    <th>${i.created_at}</th>
                    <th>${PaintStars(5)}</th>
                    <th>${i.content}</th>
                    <th>
                        ${getReplyBtn(i.reply)}
                        <img class='icon' src="https://mini.wggai.com/storage/img/main-comment-management/minus.png">
                    </th>
                </tr>
            `);
        }

        initializeChangeBtns();

        function getReplyBtn(reply){
            let src = "https://mini.wggai.com/storage/img/main-comment-management/letter"+Number(Boolean(reply));
            return "<img class='icon' data-v="+Boolean(reply)+" src="+ src +">";
        }
    }



    // 初始化 页面 及 功能
    initialize();
    function initialize(){
        checkComments();
        initializeQueryInputTime();
        initializeChangeBtns();

        // 评论框关闭按钮
        commentsReplyCloseBtn.onclick = function(){
            hide(commentsReply);
        };
        // 评论框关闭按钮
        commentsReplyEnsureBtn.onclick = function(){

            let reply = commentsReply.querySelector('.content>textarea').value.trim();

            Request({
                url:'comment/reply',
                type:'POST',
                data:{
                    id:G.theOrderId,
                    reply:reply,
                },
                success(res){
                    if(res.success === 'reply created succeed'){
                        checkComments();
                        hide(commentsReply);
                    }
                }
            })
        };


        // 评论确认提醒框 确认按钮
        commentsEnsurePartEnsureBtn.onclick = function(){
            Request({
                url:'comment/delete',
                type:'POST',
                data:{
                    id:G.theOrderId
                },
                success(){
                    hide(commentsEnsurePart);
                    checkComments();
                }
            })
        };

        // 评论确认提醒框 关闭按钮
        commentsEnsurePartCloseBtn.onclick = function(){
            hide(commentsEnsurePart);
        };
        // 评论确认提醒框 取消按钮
        commentsEnsurePartCancelBtn.onclick = function(){
            hide(commentsEnsurePart);
        }
    }


    // 初始化查询部分的输入时间
    function initializeQueryInputTime(){
		let twa = TodayAndWeekAgo();
		queryStartTime.value = twa[0];
        queryStartTime.max = twa[1];
        queryEndTime.value = twa[1];
        queryEndTime.max = twa[1];
        queryEndTime.min = twa[0];

        queryStartTime.onchange = function(){
            queryEndTime.min = this.value;
        };
        queryEndTime.onchange = function(){
            queryStartTime.max = this.value;
        };
    }




    // 初始化修改按钮
    function initializeChangeBtns(){

        // 获得评论框回复按钮， 每次刷新数据时都要调用一次
        let commentReplyBtns = commentsDataBody.querySelectorAll('tr>th:last-of-type>img:first-of-type');

        // 评论删除按钮， 每次刷新数据时都要调用一次
        let commentDeleteBtns = commentsDataBody.querySelectorAll('tr>th:last-of-type>img:last-of-type');

        // 重新给这些按钮赋予功能
        for(let i of commentReplyBtns){
            i.onclick = function(){
                if(this.dataset.v) return;
                commentsReply.querySelector('.content>textarea').value = '';
                G.theOrderId = $(this.parentNode).siblings()[0].innerText;
                show(commentsReply);
            }
        }
        for(let i of commentDeleteBtns){
            i.onclick = function(){
                G.theOrderId = $(this.parentNode).siblings()[0].innerText;
                show(commentsEnsurePart);
            }
        }
    }

})();