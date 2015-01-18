/**
 * Created by Administrator on 2015/1/15.
 */
var myApp = angular.module('blacapp', ['ui.router']);

myApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/login");

  $stateProvider
    .state('actop', {
      url: "/actop",
      templateUrl: "partials/actop.html"
    })
    .state('actop.list', {
      url: "/list",
      templateUrl: "partials/actoplist.html",
      controller: function($scope) {
        $scope.items = ["acAc", "Listac", "acOf", "acItems"];
      }
    })
    .state('acsec', {
      url: "/acsec",
      templateUrl: "partials/acsec.html"
    })
    .state('acsec.list', {
      url: "/aclist",
      templateUrl: "partials/acseclist.html",
      controller: function($scope) {
        $scope.things = ["Ac", "acSet", "acOf", "acThings"];
      }
    }).state('login', {
      url: "/login",
      templateUrl: "partials/login.html"
    });
});

app.controller("ctrlAdmin",function($scope,$location,exStore,exUtil) {
  var lp = $scope;
  lp.currentUser = exStore.getUser().name;
  lp.$on('event:login', function(){
    lp.currentUser = exStore.getUser().name;
    exUtil.shareCache.ctrlStateCache = {}; // 清空。。。
  });
});
app.controller("ctrlLogin",function($rootScope,$scope,$location,exStore,exAccess) {
  var lp = $scope;
  lp.rtnInfo = "";
  lp.l_logUser = exStore.getUserList();   // 下拉菜单用户名。
  lp.l_tmpUser = exStore.getUser();       // 当前用户

  lp.userLogin = function () {
    lp.user = exAccess.USER.newUser();
    lp.user.NICKNAME = lp.l_tmpUser.name;
    lp.user.REMPASS = lp.l_tmpUser.rempass;
    lp.user.PASS = lp.l_tmpUser.pass;
    exAccess.userLoginPromise(lp.user).then( function(data) {
      if (data.rtnCode > 0) {
        exStore.setUserList(lp.user.NICKNAME, lp.user.PASS, lp.user.REMPASS );
        $rootScope.$broadcast('event:login');
        $location.path('/taskList/main');
      }
      else{
        lp.rtnInfo = data.rtnInfo;
      }
    }, function (error) {  lp.rtnInfo = JSON.stringify(status); });
  };
});
app.controller("ctrlRegUser", function($scope,exStore,exAccess){
  var lp = $scope;
  lp.user = exAccess.USER.newUser();
  lp.user.authCode = "";
  lp.rtnInfo = "";
  lp.namePattern = new RegExp('(\\w|@|\\.)+');
  lp.userReg = function(){
    exAccess.userRegPromise(lp.user).
      then(function (data) {
        exStore.log("---got the rtn date", data);
        lp.rtnInfo = data.rtnInfo;
        if (!exStore.getUser()) exStore.setUser(lp.user.NICKNAME);
      } , function (status) {
        lp.rtnInfo = JSON.stringify(status);
      });
  };
});