let token;

getToken();
function getToken(){
	token = localStorage.getItem('token');
}
function clearToken(){
	localStorage.removeItem('token');
}


const picPrefix = 'https://mini.wggai.com/storage/';
const imagesPrefix = 'https://mini.wggai.com/storage/images/';
const typePicPrefix = 'https://mini.wggai.com/storage/img/main-dish-management/type-icons/';



// function C(e){
// 	console.log(e);
// }



let doc = document;
console.log('assist');

// Object.prototype.one = function(e){
// 	return this.querySelector(e);
// };
// Object.prototype.all = function(e){
// 	return this.querySelectorAll(e);
// };
// Object.prototype.next = function(){
// 	return this.nextElementSibling;
// };
// Object.prototype.pre = function(){
// 	return this.previousElementSibling;
// };


function see(b){
    b.style.visibility = 'visible';
}
function unsee(b){
    b.style.visibility = 'hidden';
}
function hide(b){
    b.style.display = 'none';
}
function show(b){
    b.style.display = 'block';
}

// function one(e){
// 	return doc.querySelector(e);
// }
// function all(e){
//     return doc.querySelectorAll(e);
// }


let MakePageChooser = function(args){

	console.log(args);

	let 
		obj = args.obj,    // 需要加工的对象
		current = args.current || 1,   // 当前页 ，默认为 1
		total = args.total || 1,  //总页数， 一般确定后就不再改变
		pageNumber = args.pageNumber || 6,  // 页码最长显示，默认为 6
		callback = args.callback || function(p){console.log('GOT '+p)}; //回调，默认使用：当页数发生改变时传出页数

	let toFirstPageBtn = obj.querySelector('.first');
	let toLastPageBtn = obj.querySelector('.last');
	let pageNumbers = obj.querySelector('.numbers');
	toFirstPageBtn.onclick = function(){
		current = 1;
        callback(current);
        updatePageChooser();
	};
	toLastPageBtn.onclick = function(){
		current = total;
        callback(current);
		updatePageChooser();
	};

	obj.to = function(page){
		current = page;
        callback(current);
        updatePageChooser();
    };

	updatePageChooser();
	function updatePageChooser(){
		pageNumbers.innerHTML = '';
		if(total>pageNumber){
			if(current===1 || current===2){
				for(let i=1;i<=pageNumber;i++){
					let span = null;
					if(i===pageNumber && i<=total){
						span = createNumberSpan('...');
					}else{
						span = createNumberSpan(i);
					}
					if(i === current){
						pageNumberActive(span);
					}
					pageNumbers.appendChild(span);
				}
			}else if(current === total || current===total-1 || current==total-2){
				for(let i=total-5;i<=total;i++){
					let span = null;
					if(i===total-5){
						span = createNumberSpan('...');
					}else{
						span = createNumberSpan(i);
					}
					if(i === current){
						pageNumberActive(span);
					}
					pageNumbers.appendChild(span);
				}
			}else{
				for(let i=current-2,l=current-2+pageNumber-1;i<=l;i++){
					let span = null;
					if(i===current-2+pageNumber-1 && i<=total){
						span = createNumberSpan('...');
					}else{
						span = createNumberSpan(i);
					}
					if(i === current){
						pageNumberActive(span);
					}
					pageNumbers.appendChild(span);
				}
			}
		}else{
			for(let i=1;i<=total;i++){
				let span = createNumberSpan(i);
				if(i === current){
					pageNumberActive(span);
				}
				pageNumbers.appendChild(span);
			}
		}
	}

	function createNumberSpan(p){
		let span = doc.createElement('span');
		span.innerText = p;
		if(p !== '...'){
			span.onclick = function(){
				current = p;
				updatePageChooser();
				callback(p);
			}
		}
		return span;
	}

	function pageNumberActive(span){
		span.style.color = '#F56985';
		span.style.textDecoration = 'underline';
	}
};


function ArrayHas(arr,a){
	for(let i of arr){
		if(i === a){
			return true;
		}
	}
	return false;
};


function TodayAndWeekAgo(){
    let week = 7*24*60*60*1000;
    let today = new Date();
    let weekAgo = new Date(today.getTime() - week);
    return [GetInputTime(weekAgo),GetInputTime(today)];
}
function GetInputTime(d){
    return d.getFullYear()+'-'+
        String('0'+(d.getMonth()+1)).slice(-2)+'-'+
        String('0'+d.getDate()).slice(-2);
}


/* 四舍五入计算今天离某个时间相差天数 */
function getDifferDays(theDay){
	let today = new Date().getTime();
    return Math.ceil( (today - new Date(theDay).getTime()) / (1000*60*60*24));
}


/* 对 jquery 的formSerializeArray转换 */
function EasyJson(serializeArray){
    let data = {};
    for(let i of serializeArray){
        data[i.name] = i.value;
    }
    return data;
}


/* 数组方法 */
function ArrRank(arr){
    let l = arr.length;
    for(let i=0;i<l;i++){
        for(let j=0;j<l-i-1;j++){
            if(arr[j] < arr[j+1]){
                let t = arr[j+1];
                arr[j+1] = arr[j];
                arr[j] = t;
            }
        }
    }
    return arr;
}

function RankOnProperty(objs,property,filter,high=true){
	let l = objs.length-1;
	let f = (typeof(filter) === 'function')?filter:function(p){return p;};
	for(let i=0;i<l;i++){
        for(let j=0,_l=l-i;j<_l;j++){
			if(f(objs[j][property]) < f(objs[j+1][property])){
				let t = objs[j+1];
				objs[j+1] = objs[j];
				objs[j] = t;
			}
        }
	}

	if(!high){
		for(let i=0,_l=Math.floor(l/2);i<_l;i++){
			let t = objs[l-i];
			objs[l] = objs[i];
			objs[i] = t;
		}
	}
}




/* 当前项目miniappshop专用 */
function Request(r){
	console.log('Ajax:');
    console.log(r);

    var s = Object.prototype.toString.call(r.data);
    var sm = s.match(/\[object (.*?)\]/)[1].toLowerCase();

    let isFormData = (sm === 'formdata');

    $.ajax({
        url:'https://mini.wggai.com/api/admin/' + r.url,
        type:r.type || 'GET',
        headers:{
            Authorization:'Bearer '+token,
        },
        processData: !isFormData,
        contentType: isFormData? false : "application/x-www-form-urlencoded",
        data:r.data,
        success:function(res){
            if(r.success) {
                r.success(res);
            }
        },
		complete:function(res){
        	if(r.complete){
                r.complete(res);
			}
		}
    });
}


let Sequence = function(){
    let i = -1, args = arguments, l = args.length;
    (function lambda(){
        return new Promise((next)=>{
            i ++;
            if(i<l) args[i](next);
        }).then(lambda);
    })();
};







function PaintStars(n){
    let starImgs = '';
    for(let i=0;i<n;i++){
        starImgs += "<img class='star' src='https://mini.wggai.com/storage/img/main-comment-management/selected.jpg'>";
    }
    return starImgs;
}



