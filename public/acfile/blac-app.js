/**
 * Created by Administrator on 2015/1/15.
 */
var app = angular.module('blacapp', ['ui.router', 'blac-util']);

app.config(function($stateProvider, $urlRouterProvider) {
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

app.controller("ctrlAdmin",function($scope,blacStore,blacAccess) {
  var lp = $scope;
  lp.$on(blacAccess.gEvent.login, function(){
    lp.loginedUser = blacStore.localUser();
  });
});

app.controller("ctrlLogin",function($rootScope,$scope,$location,blacStore,blacAccess) {
  var lp = $scope;
  lp.rtnInfo = "";
  lp.lUser = {rem:blacStore.localRem(), name:blacStore.localUser(), word:blacStore.localWord()  }

  lp.userLogin = function () {
    blacAccess.userLoginQ(lp.lUser).then( function(data) {
      if (data.rtnCode > 0) {
        blacStore.localUser(lp.lUser.name);
        blacStore.localWord(lp.lUser.word);
        blacStore.localRem(lp.lUser.rem);
        $rootScope.$broadcast(blacAccess.gEvent.login);
        $location.path('/');
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