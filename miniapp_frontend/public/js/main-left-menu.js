console.log('左栏导航');

(function mainLeftMenu(){
	let mul = $('.main-left-menu>ul')[0];
	let mlis = mul.querySelectorAll('li');
	
	let mdm = $('.main-dish-management')[0];
	let msm = $('.main-send-management')[0];
	let mod = $('.main-order-detail')[0];
	let mcm = $('.main-comment-management')[0];
	let mms = $('.main-money-statistics')[0];
	let me = $('.main-exit')[0];

    show(mdm);

	let contents = [mdm,msm,mod,mcm,mms,me];
    active(mlis[0]);
    mlis[0].on = true;

    for(let i=0,l=mlis.length;i<l;i++){
		mlis[i].onclick = function(){
            if(i!==mlis.length-1){
				hideAll();
                this.on = true;
                active(this);
            }
			show(contents[i]);
		};
        mlis[i].onmouseover = function(){
        	if(i!==mlis.length-1){
                active(this);
			}
		};
		mlis[i].onmouseout = function(){
			if(this.on) return;
			unActive(this);
		}
	}

	function hideAll(){
		contents.forEach(function(e){
			hide(e);
		});
        mlis.forEach(function(e){
        	e.on = false;
            unActive(e);
		})
	}

	function unActive(e){
        e.style.backgroundColor = 'transparent';
        e.style.borderLeftColor = 'transparent';
	}

	function active(e){
        e.style.backgroundColor = 'rgba(255,255,255,0.5)';
        e.style.borderLeftColor = '#5b42d6';
	}

})();