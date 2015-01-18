/**
 * Created by Administrator on 2015/1/18.
 */

/**
 * Created by blaczom@gmail.com on 2014/10/1.
 */
var express = require('express'),
  router = express.Router(),
//  appDb =  require('../blac-bk-access'),   // 暂时放一下数据库，用grunt来生成。
  Q = require('q');

var rtnErr = function(aMsg, aErr) {
  return {rtnCode:-1, "rtnInfo":JSON.stringify(aMsg), "alertType":0, error:JSON.stringify(aErr), exObj:{} }
};
var rtnMsg = function(aMsg) {
  return {rtnCode:1, "rtnInfo":aMsg, "alertType":0, error: [], exObj:{} }
};

function logInfo(){console.log(arguments);};
function logErr(){console.log(arguments);};

router.get('/', function(req, res) {
  res.send('没有此功能。');
});

function checkLogin(req, res){ return(req.session.loginUser);};  // 只信任服务器端的数据。

router.post('/', function(req, res) {
  /* 除了userLogin, userReg, 以外，其余的功能都需要 ---登录检查，  */
  logInfo("get client rest: " , req.body);
  var lFunc = req.body['func']; // 功能名称： 'userlogin' 等等
  var lExparm = req.body['ex_parm'];  // 参数对象: {}
  if ("userlogin,userReg,exTools,,,".indexOf(lFunc+",") < 0) {   // 需要登录的对象。
    if (!checkLogin(req,res)) {
      var l_rtn = rtnErr('未登录，请先登录。');
      l_rtn.rtnCode = 0;
      l_rtn.appendOper = 'login';   // rtnCode = 0的时候，就是有附加操作的时候。
      res.json(l_rtn);
      return; // STOP HERE.
    }
  }
  // 正常功能处理：
  switch (lFunc){
    case "userlogin": { // lExparm.user:{name:xx,word:xx}
      req.session.loginUser = "testOk";
      req.session.userLevel = 7;
      res.json(rtnMsg('登录成功。' + "testOk" ));

      /* appDb.USER.getByNickName(lExparm.user.name, function (aErr, aRtn) {
        if (aErr) res.json(rtnErr(aErr));
        else {
          if (aRtn) {
            if (aRtn.WORD == lExparm.user.word) {
              req.session.loginUser = lExparm.user.name;
              req.session.userLevel = aRtn.LEVEL;
              res.json(rtnMsg('登录成功。'));
            }
            else {
              res.json(rtnErr('密码有误'));
            }
          }
          else
          {
            res.json(rtnErr('用户不存在'));
          }
        }
      }); */
      break;
    }
    default :
      res.json(rtnErr('不存在该请求：' + JSON.stringify(req.body)));
      break;
  }
});

module.exports = router;

