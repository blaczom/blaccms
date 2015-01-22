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
      templateUrl: "partials/actopleft.html"
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
      templateUrl: "partials/actoplist.html"
    })
    .state('actop.listsec', {
      url: "/listsec/:nodeId",
      templateUrl: "partials/actoplistsec.html"
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
  lp.lUser = {rem:blacStore.localRem(), name:blacStore.localUser(), word:blacStore.localWord()  };

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
app.controller("ctrlManage", function($scope,blacUtil,$window,$location,$http) {
  var lp = $scope;

  // 后台管理端：栏目设置。
  {
    lp.treeData = [];
    lp.treeState = {new: "new", dirty: 'dirty', clean: "clean"};

    lp.wrapConfirm = function(aMsg, aObj){
    // wrapConfirm("确认放弃修改么？", initColumDefTree)
      if ( $window.confirm(aMsg) )
        aObj.apply(null, Array.prototype.slice.call(arguments,2) );
    };

    lp.initColumDefTree = function() {
      $http.post('/rest', { func: 'getAdminColumn', ex_parm: {} }).
        success(function (data, status, headers, config) {
          if (data.rtnCode == 1) lp.treeData = JSON.parse(data.exObj.columnTree);
            else console.log(data);

        }).
        error(function (data, status, headers, config) {
            console.log(status, data);
        });
      };
    lp.wrapInitColumDefTree = function() {
      $http.post('/rest', { func: 'getAdminColumn', ex_parm: {} }).
        success(function (data, status, headers, config) {
          if (data.rtnCode == 1) lp.treeData = JSON.parse(data.exObj.columnTree);
          else console.log(data);
        }).
        error(function (data, status, headers, config) {
          console.log(status, data);
        });
    };
    lp.wrapRemove = function (aNode) {
      var nodeData = aNode.$modelValue;
      if (nodeData.id == 0) return;
      if ($window.confirm("确认删除他和所有的子记录么？"))
        if (nodeData.state == lp.treeState.new)
          aNode.remove();
        else {
          lp.treeData[0].deleteId.push(nodeData.id);
          aNode.remove();
        }

    };
    lp.newSubItem = function (aNode) {
      var nodeData = aNode.$modelValue;
      if (aNode.collapsed) {
        console.log('colapsed.');
        aNode.expand();
      }
      nodeData.items.push({
        id: blacUtil.createUUID(), // nodeData.id * 10 + nodeData.items.length,
        parentId: nodeData.id,
        title: '新节点', // nodeData.title + '.' + (nodeData.items.length + 1),
        state: lp.treeState.new,
        ex_parm: {},
        items: []
      });
    };
    lp.nodeClick = function (aNode) {
      if (aNode.$modelValue.id == 0) return;
      lp.clickNode = aNode.$modelValue;
      $location.path('/actop/list/' + lp.clickNode.id);
    };
    lp.nodeTitleChanged = function (aCurNode) {
      if (aCurNode.state != lp.treeState.new) aCurNode.state = lp.treeState.dirty;
    };
    lp.treeExpandAll = function(){
      angular.element(document.getElementById("tree-root")).scope().expandAll();
    };
    lp.saveTree = function(){
      $http.post('/rest', { func: 'setAdminColumn', ex_parm: { columnTree: JSON.stringify(lp.treeData) }}).
        success(function (data, status, headers, config) {
          if (data.rtnCode == 1) console.log('save ok. ');
          else console.log(data);
        }).
        error(function (data, status, headers, config) {
          console.log(status, data);
        });
    }
  }

  // 后台管理端：  用户录入内容。
  {
    $http.post('/rest', { func: 'getAdminColumn', ex_parm: {} }).
      success(function (data, status, headers, config) {
        if (data.rtnCode == 1) lp.treeContentData = JSON.parse(data.exObj.columnTree)[0].items;
        else console.log(data);

      }).
      error(function (data, status, headers, config) {
      console.log(status, data);
    });

    lp.node4ContentClick = function (aNode) {
      if (aNode.$modelValue.id == 0) return;
      lp.clickNode = aNode.$modelValue;
      $location.path('/actop/listsec/' + lp.clickNode.id);
    };
  }

});
