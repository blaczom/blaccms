/**
 * Created by Administrator on 2015/1/15.
 */
var myApp = angular.module('blacapp', ['ui.router']);

myApp.config(function($stateProvider, $urlRouterProvider) {
  //
  // For any unmatched url, redirect to /state1
  $urlRouterProvider.otherwise("/top");

  $stateProvider
    .state('top', {
      url: "/top",
      templateUrl: "partials/top.html"
    })
    .state('top.list', {
      url: "/list",
      templateUrl: "partials/toplist.html",
      controller: function($scope) {
        $scope.items = ["A", "List", "Of", "Items"];
      }
    })
    .state('sec', {
      url: "/sec",
      templateUrl: "partials/sec.html"
    })
    .state('sec.list', {
      url: "/list",
      templateUrl: "partials/seclist.html",
      controller: function($scope) {
        $scope.things = ["A", "Set", "Of", "Things"];
      }
    });
});