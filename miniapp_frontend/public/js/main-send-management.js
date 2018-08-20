console.log('配送管理');



(function mainSendManagement(){

    let Page = $('.main-send-management')[0];

    let rankwaySelect = Page.querySelectorAll('.rankway-select');

    for(let i of rankwaySelect){
        i.onclick = function(){
            let rankwaySelectOptions = i.querySelectorAll('.options>div');
            let onHeight = 24 + 30 * rankwaySelectOptions.length;
            let offHeight = 24;
            i.style.height = (i.on?offHeight:onHeight) + 'px';
            i.on = !i.on;
            for(let j of rankwaySelectOptions){
                j.onclick = function(){
                    i.querySelector('span').innerText = this.innerText;
                    i.value = this.dataset.v;
                }
            }
        }
    }







    let keyWord = Page.querySelector('.keyword');
    let keyWordCloseBtn = $(keyWord).next()[0];
    keyWord.onkeyup = function(){
        let v = this.value;
        if(v){
            see(keyWordCloseBtn);
        }else{
            unsee(keyWordCloseBtn);
        }
    };
    keyWordCloseBtn.onclick = function(){
        keyWord.value = '';
        unsee(this);
    };
})();