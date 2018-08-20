console.log('登出');



(function mainExit(){

	let Page = $('.main-exit')[0];
	let mainExitCloseBtn = Page.querySelector('.window>.title>img');
	let mainExitEnsureBtn = Page.querySelector('.window>.content>.btns>button');

	mainExitCloseBtn.onclick = function(){
		hide(Page);
	};

	mainExitEnsureBtn.onclick = function(){
		clearToken();
		window.location.href = '/';
	}

})();