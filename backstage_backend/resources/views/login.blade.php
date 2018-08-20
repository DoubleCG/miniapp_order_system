<!DOCTYPE html>
<html><head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
  <!-- Standard Meta -->
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link href="https://cdn.bootcss.com/semantic-ui/2.3.1/semantic.min.css" rel="stylesheet">
  <script defer src="https://cdn.bootcss.com/jquery/3.3.1/jquery.min.js"></script>
  <script defer src="https://cdn.bootcss.com/semantic-ui/2.3.1/semantic.min.js"></script>

  <script defer src="{{asset('/js/login.js') }}"></script>


  <title>五宫格点餐商户后台管理系统 | 登录</title>

  <style type="text/css">
    body {
      background-color: #DADADA;
    }
    body > .grid {
      height: 100%;
    }
    .image {
      margin-top: -100px;
    }
    .column {
      max-width: 450px;
    }
  </style>

</head>
<body cz-shortcut-listen="true">

<div class="ui middle aligned center aligned grid">
  <div class="column">
    <h2 class="ui teal image header">
      <div class="content">
        五宫格点餐商户后台管理
      </div>
    </h2>
    <form class="ui large form">
      <div class="ui stacked segment">
        <div class="field">
          <div class="ui left icon input">
            <i class="user icon"></i>
            <input name="email" placeholder="账号" type="text">
          </div>
        </div>
        <div class="field">
          <div class="ui left icon input">
            <i class="lock icon"></i>
            <input name="password" placeholder="密码" type="password">
          </div>
        </div>
        <div onclick='toLogin()' class="ui fluid large teal submit button">登录</div>
      </div>

    </form>
    <div class="ui error message" style='display:none;'>您的账号或密码输入错误！</div>
  </div>
</div>




</body>


</html>