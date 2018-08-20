<!DOCTYPE html>
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link href="https://cdn.bootcss.com/semantic-ui/2.3.1/semantic.min.css" rel="stylesheet">
<script src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
<script src="https://cdn.bootcss.com/semantic-ui/2.3.1/semantic.min.js"></script>
<script defer src="{{asset('/js/main.js') }}"></script>

<title>五宫格点餐商户后台管理系统 | 主页</title>

</head>
<body cz-shortcut-listen="true" >

<div class="ui small indicating progress" id='loading-progress'>
  <div class="bar"></div>
</div>
<script>
    var mainPercent = 0;
    var mainP = $('#loading-progress');
    var mainS = setInterval(function(){
        mainP.progress({
            percent:mainPercent
        });
        if(mainPercent > 90){
            mainP.css('display','none');
            clearInterval(mainS);
        }

        mainPercent += Math.random()*10;
    },150);
</script>

<div class="ui grid container"  style='margin-top:40px;'>

  <div class="row">
    <div class="column">
      <h1 class="ui header">五宫格商户端餐品管理 </h1>
      <div class="ui divider"></div>
      <div class="ui selection dropdown" tabindex="0">
        <input name="selection" type="hidden">
        <i class="dropdown icon"></i>
        <div class="default text">选择操作</div>
        <div class="menu transition hidden" tabindex="-1">
          <div class="item select-div">查看餐品及类型</div>
          <div class="item select-div">增加餐品及类型</div>
          <div class="item select-div">查看评论</div>
        </div>
      </div>
    </div>
  </div>


  <div class="ui divider" style='margin-bottom:60px;'></div>









  <div class='row show-div'>


    <h2 class="ui header">餐品</h2>


    <button id='dish-check-btn' class='ui teal button'>显示查询方式</button>

    <form class="ui large form" id='check-form'>
        <br>
        <br>
        名称关键词：<input style='width:200px;height:30px;' name='keyword'></input>
        <br>
        <br>
        类型：<input style='width:200px;height:30px;' name='type'></input>
        <br>
        <br>
        价格区间上限：<input style='width:200px;height:30px;' name='price_en'></input>
        <br>
        <br>
        价格区间下限：<input style='width:200px;height:30px;'name='price_st'></input>
        <br>
        <br>
        <span style='margin-left:20px;'>按上架时间先后</span>
        <input name='time' type='checkbox'></input>

        <span style='margin-left:20px;'>按价格高低</span>
        <input name='price_or'  type='checkbox'></input>

        <span style='margin-left:20px;'>按总销量排名</span>
        <input name='sale'  type='checkbox'></input>

        <span style='margin-left:20px;'>按总评论数排名</span>
        <input name='comment' type='checkbox'></input>
        <br>        <br>

        <div class="ui fluid large teal submit button" id='check-btn'>开始查询</div>
    </form>


    <form class="ui large form" id='update-form' style='display:none'>
      <div class="field">
        <label>餐品名</label>
        <input name="name" type="text">
      </div>
      <div class="field">
        <label>图片（小于1M）</label>
        <input name="update-photo" type="file">
      </div>
      <div class="field">
        <label>餐品分类</label>
        <select name="type"  id="update-select-type"> </select>
      </div>
      <div class="field">
        <label>价格</label>
        <input name="price" type="text">
      </div>
      <div class="field">
        <label>描述</label>
        <input name="description" type="text">
      </div>
        <div class="ui fluid large teal submit button" id='form-update-btn'>修改</div>
        <div class="ui fluid large youtube button" id='form-update-cancel-btn'>取消</div>
    </form>


    <div class="ui large form" id='remove-div' style='display:none'>
        <div class="ui fluid large teal submit button" id='remove-btn'>确认删除</div>
        <div class="ui fluid large youtube button" id='remove-cancel-btn'>取消</div>
    </div>

    <form class="ui large form" id='update-type-form' style='display:none'>
      <div class="field">
        <label>名字</label>
        <input name="name" type="text">
      </div>
      <div class="field">
        <label>标签描述</label>
        <input name="tag" type="text">
      </div>
        <div class="ui fluid large teal submit button" id='form-type-update-btn'>修改</div>
        <div class="ui fluid large youtube button" id='form-type-update-cancel-btn'>取消</div>
    </form>


    <div class="ui large form" id='remove-type-div' style='display:none'>
        <div class="ui fluid large teal submit button" id='remove-type-btn'>确认删除</div>
        <div class="ui fluid large youtube button" id='remove-type-cancel-btn'>取消</div>
    </div>


    <table class="ui celled table">
      <thead>
        <tr>
          <th>ID</th>
          <th>图片</th>
          <th>名称</th>
          <th>所属类别</th>
          <th>描述</th>
          <th>价格</th>
          <th>总销量</th>
          <th>被评星次数</th>
          <th>平均星级</th>
          <th>上架时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody id='show-dish-tbody'>

      </tbody>
      <!--
      <tfoot>
        <tr>
            <th colspan="11">
                <div class="ui right floated pagination menu">

                    <a class="icon item">
                        <i class="left chevron icon"></i>
                    </a>

                    <a class="item">1</a>
                    <a class="item">2</a>
                    <a class="item">3</a>

                    <a class="icon item">
                        <i class="right chevron icon"></i>
                    </a>
                </div>
            </th>
        </tr>
      </tfoot>
      -->
    </table>

    <div class="ui divider" style='margin:60px;'></div>

    <button id='show-type-btn' class='ui button'>显示类别</button>

    <table class="ui celled table">
      <thead>
        <tr>
          <th>ID</th>
          <th>图片</th>
          <th>名称</th>
          <th>标签描述</th>
          <th></th>
        </tr>
      </thead>
      <tbody id='show-type-tbody'>
      </tbody>
    </table>



  </div>
















  <div class='row show-div'>
  <h3> 在添加餐品之前，请先确保有对应的类型。</h3>
    <form class="ui form" id='add-dish-form'>
      <div class="field">
        <label>餐品名</label>
        <input name="name" type="text">
      </div>
      <div class="field">
        <label>图片（小于1M）</label>
        <input name="add-photo" type="file">
      </div>
      <div class="field">
        <label>餐品分类</label>
        <select name="type" id="add-select-type"> </select>
      </div>
      <div class="field">
        <label>价格</label>
        <input name="price" type="text">
      </div>
      <div class="field">
        <label>描述</label>
        <input name="description" type="text">
      </div>
      <button class="ui button" id='add-dish-btn' type="button">新增餐品</button>
    </form>


      <div class="ui divider" style='margin:60px 0;'></div>

    <form class="ui form" id='add-type-form'>
      <div class="field">
        <label>餐品类型名</label>
        <input name="name" type="text">
      </div>
      <div class="field">
        <label>标签描述</label>
        <input name="tag" type="text">
      </div>
      <button class="ui button" id='add-type-btn' type="button">新增类型</button>
    </form>


  </div>



  <ul class='row show-div' id='comment-part'>
  </ul>

</body>
</html>