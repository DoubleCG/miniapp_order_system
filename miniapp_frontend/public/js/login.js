(function login(){

    let token = localStorage.getItem('token')||null;
    let expires_in = Number(localStorage.getItem('expires_in'))||null;
    let nowTime = new Date().getTime();

    if(token){
		if(nowTime >= expires_in){
			console.log('token expired');
		}else{
			window.location.href = '/main';
		}
    }

    // let rememberPwBtn = $('.remember>span')[0];
    let loginBtn = $('.login-btn')[0];
	let email = $('#email')[0];
	let password = $('#password')[0];
    let errTip = $('.error')[0];

    initialize();
    function initialize(){

        // rememberPwBtn.onclick = function(){
        //     let t = this;
        //     t.style.color = (t.on)?'transparent':'#20E737';
        //     t.on = !t.on;
        // };

        loginBtn.onclick = function(){
            let e = email.value.trim();
            let p = password.value.trim();
            $.ajax({
                url:'https://mini.wggai.com/api/login',
                type:'POST',
                data:{
                    email:e,
                    password:p
                },
                success(res){
                    if(res.error){
                        see(errTip);
                        setTimeout(function(){
                            unsee(errTip);
                        },2000);
                    }else{
                        localStorage.setItem('token',res.token);
                        localStorage.setItem('expires_in',Number(res.expires_in)+(new Date().getTime()));
                        window.location.href = '/main';
                    }
                },
            });
        };
	}

})();



