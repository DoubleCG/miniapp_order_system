(function onload(){
    var token = localStorage.getItem('token')||null;
    var expires_in = Number(localStorage.getItem('expires_in'))||null;
    var nowTime = new Date().getTime();

    if(Boolean(token)){
		if(nowTime >= expires_in){
			console.log('The token is expired..');
		}else{
			console.log('The token is valid..');
			window.location.href = '/main';
		}
    }
})();


function toLogin(){
	console.log('tologin')
	var doc = document;

	var e = doc.querySelector('input[name="email"]').value.trim();
	var p = doc.querySelector('input[name="password"]').value.trim();
    var token = localStorage.getItem('token')||null;

	$.ajax({
		url:'https://mini.wggai.com/api/login',
		headers:{
			 Authorization:'Bearer '+token
		},
		type:'POST',
		data:{
			email:e,
			password:p
		},
		success:function(res){
			console.log(res)
			if(res.error){
				tip();
			}else{
                localStorage.setItem('token',res.token);
                localStorage.setItem('expires_in',Number(res.expires_in)+(new Date().getTime()));
                window.location.href = '/main';
			}
		},
	});







	function tip(){
		var err = doc.querySelector('.error');
        err.style.display = 'block';
        setTimeout(function(){
            err.style.display = 'none';
		},2000);
	}
}
