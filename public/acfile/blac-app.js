/**
 * Created by Administrator on 2015/1/15.
 */
var app = angular.module('blacapp', ['ui.router', 'blac-util', 'ui.tree']);

app.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/login");

  $stateProvider
    .state('actop', {
      url: "/actop",
      templateUrl: "partials/actop.html"
    })
    .state('actop.cover', {
      url: "/cover",
      templateUrl: "partials/actopcover.html",
      controller: function($scope) {
          $scope.items = ["acAc", "Listac", "acOf", "acItems"];
      }
    })
    .state('actop.list', {
      url: "/list/:nodeId",
      templateUrl: "partials/actoplist.html",
      controller: ctrlArticleList
    })
    .state('acsec', {
      url: "/acsec",
      templateUrl: "partials/acsec.html"
    })
    .state('acsec.list', {
      url: "/aclist",
      templateUrl: "partials/acseclist.html"
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
        $location.path('/actop/cover');
      }
      else{
        lp.rtnInfo = data.rtnInfo;
      }
    }, function (error) {  lp.rtnInfo = JSON.stringify(status); });
  };
});

app.controller("ctrlManage",function($scope) {
  var lp = $scope;
  lp.nodeAdd = function (aArg) {
    console.log('add',aArg);
  };
  lp.nodeDelete = function (aArg) {
    console.log('delete',aArg);
  };

  lp.treeData = [ {"id": 0, "title": "根", "items": [] } ];

  lp.newSubItem = function(scope) {
    var nodeData = scope.$modelValue;
    if (scope.collapsed) {
      console.log('colapsed.');
      scope.expand();
    }
    nodeData.items.push({
      id: 1, // nodeData.id * 10 + nodeData.items.length,
      title: '1', // nodeData.title + '.' + (nodeData.items.length + 1),
      items: []
    });
  };

});

function ctrlArticleList ($scope, $stateParams) {
  var lp = $scope;
  console.log('link',$stateParams);

};

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