/**
 * Created by Administrator on 2015/1/15.
 */
var app = angular.module('blacapp', ['ui.router', 'blac-util', 'ui.tree']);

app.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/login");

  $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: "partials/login.html"
    })
    .state('acadmin', {
      url: "/acadmin",
      templateUrl: "partials/acadminleft.html"
    })
    .state('acadmin.cover', {
      url: "/cover",
      templateUrl: "partials/acadmincover.html",
      controller: function($scope) {
          $scope.items = ["acAc", "Listac", "acOf", "acItems"];
      }
    })
    .state('acadmin.selflist', {
      url: "/selflist/:nodeId",
      templateUrl: "partials/acadminselflistcol.html"
    })
    .state('acadmin.listart', {
      url: "/listart/:columnId",
      templateUrl: "partials/acadminlistart.html"
    });
});



app.controller("ctrlAdminTop",function($scope,blacStore,blacAccess) {
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
        $location.path('/acadmin/cover');
      }
      else{
        lp.rtnInfo = data.rtnInfo;
      }
    }, function (error) {  lp.rtnInfo = JSON.stringify(status); });
  };
});
app.controller("ctrlAdminLeft", function($scope,blacUtil,$window,$location,$http) {
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
      $location.path('/acadmin/selflist/' + lp.clickNode.id);
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

    // 点击用户栏目，列出下级文章。
    lp.clickContentNode = { id: 0 };  // init;

    lp.clickCol4ConList = function (aNode) {
      if (aNode.$modelValue.id == 0) return;
      if (lp.clickContentNode.id != aNode.$modelValue.id) {
        lp.clickContentNode = aNode.$modelValue;
        lp.psContentInfo = { pageCurrent: 1, pageRows: 10, pageTotal: 0  };
        $location.path('/acadmin/listart/' + lp.clickContentNode.id);
      }
    };
  }
});

app.controller("ctrlAdminListArt", function($scope,blacUtil,$window,$location,$http,$stateParams) {
  var lp = $scope;

  // console.log();

  var lColumnId = $stateParams.columnId;
  lp.psContentInfo = { pageCurrent: 1, pageRows: 10, pageTotal: 0  }; // init;
  lp.clickContentNode = { id : 0 };  // init;
  lp.contentList = [];


  lp.psGetContent = function (aPageNumber) {
    var lNoNeed = false;

    switch (aPageNumber) {
      case -1:
        if (lp.psContentInfo.pageCurrent > 1) lp.psContentInfo.pageCurrent = 1; else lNoNeed = true;
        break;
      case -2:
        if (lp.psContentInfo.pageCurrent > 1) lp.psContentInfo.pageCurrent -= 1; else lNoNeed = true;
        break;
      case -3:
        if (lp.psContentInfo.pageCurrent < lp.psContentInfo.pageTotal) lp.psContentInfo.pageCurrent += 1; else lNoNeed = true;
        break;
      case -4:
        if (lp.psContentInfo.pageCurrent < lp.psContentInfo.pageTotal) lp.psContentInfo.pageCurrent = lp.psContentInfo.pageTotal; else lNoNeed = true;
        break;
      case 0:
        break
    }

    if (!lNoNeed) {
      var lLocation = { pageCurrent: lp.psContentInfo.pageCurrent, pageRows: lp.psContentInfo.pageRows, pageTotal: lp.psContentInfo.pageTotal };
      /* $http.post('/rest', { func: 'getContentList', ex_parm: { location: lLocation} } ).
       success(function (data, status, headers, config) {
       if (data.rtnCode == 1) {
       //"exObj":{ rowCount:xxx,  contentList: [ {id:xx, title:xx, recname:xx, rectime:xxxx},...] } }
       if (lp.psContentInfo.pageTotal) lp.psContentInfo.pageTotal = Math.floor(data.exObj.rowCount / lp.psContentInfo.pageRows ) + 1;
       lp.contentList = data.exObj.contentList;
       }
       else console.log(data);

       }).
       error(function (data, status, headers, config) {
       console.log(status, data);
       });
       // http over
       */    //  测试
      //"exObj":{ rowCount:xxx,  contentList: [ {id:xx, title:xx, recname:xx, rectime:xxxx},...] } }
      lp.psContentInfo.pageTotal = Math.floor(23 / lp.psContentInfo.pageRows) + 1;
      lp.contentList = [
        {id: 'xx1', parentid:'1234', title: 'xxtitlexx111', recname: 'xx1', rectime: 'xxxx1'},
        {id: 'xx2', parentid:'1234',title: 'xxtitlexx2222', recname: 'xx2', rectime: 'xxxx2'},
        {id: 'xx3', parentid:'1234',title: 'xxtitlexx3333', recname: 'xx3', rectime: 'xxxx3'},
        {id: 'xx4', parentid:'1234',title: 'xxtitlexx444', recname: 'xx2', rectime: 'xxxx2'},
        {id: 'xx5', parentid:'1234',title: '5555555', recname: 'xx2', rectime: 'xxxx2'},
        {id: 'xx6', parentid:'1234',title: '6666666', recname: 'xx2', rectime: 'xxxsx2'},
        {id: 'xx7', parentid:'1234',title: '7777777', recname: 'xx2', rectime: 'xxxx2'},
        {id: 'xx8', parentid:'1234',title: '8888888', recname: 'xx2', rectime: 'xxxx2'},
        {id: 'xx9', parentid:'1234', title: '9999999', recname: 'xx2', rectime: 'xxxx2'},
        {id: 'xx10', parentid:'1234', title: '1111000000', recname: 'xx2', rectime: 'xxxx2'}
      ];

      lp.contentHasPrior = true;
      lp.contentHasLast = true;
      if (lp.psContentInfo.pageCurrent == lp.psContentInfo.pageTotal) lp.contentHasLast = false;
      if (lp.psContentInfo.pageCurrent == 1) lp.contentHasPrior = false;
    }
  };
    // 编辑和录入内容
  lp.singArticle = {};

  lp.editArticle = function(aArg){
    if (aArg == 0 ) {  // 在当前的父栏目下面增加新的内容。
      lp.singArticle = {state:"new", id: blacUtil.createUUID(), parentid:0, kind:"", title:"", content:"", imglink:"", videolink:"", recname:"", rectime:""};
    }
    else {  // 根据lColumnId 查询出点击的article，并且搞到他。
      for (i=0;i<lp.contentList.length;i++){
        if (aArg ==lp.contentList[i].id ) {
          lp.singArticle = lp.contentList[i];
          break;
        }
      }
      lp.singArticle.state = "dirty";
    };
    $('#myModal').modal( { backdrop: "static" } );
  };
  lp.saveArticle = function(){
    // 如果是增加，就增加到 lp.contentList 的最前面。如果是edit，就直接更新。
    // 远程保存成功否？
    if (lp.singArticle.state == "new") {
      console.log(lp.contentList.length);
      lp.contentList.unshift(lp.singArticle);
      console.log(lp.contentList.length);
      lp.singArticle.state = "dirty";
      console.log("new");
    }
    else{
      for (i=0;i<lp.contentList.length;i++){
        if (lp.singArticle.id ==lp.contentList[i].id ) {
          lp.contentList[i] = lp.singArticle;
          console.log("update");
          break;
        }
      }

    }


  };


  lp.psGetContent(0);

});
