'use strict';

var courtresApp = angular.module('courtresApp', [
    'ngRoute',
    'ui.bootstrap',
    'restangular'
]);

courtresApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/ng', {
      templateUrl: '/templates/todo.html',
      controller: 'NewPersonCtrl'
    }).when('/', {
      templateUrl: '/templates/homepage.html',
      controller: 'NewPersonCtrl'
    }).otherwise({
      redirectTo: '/',
      caseInsensitiveMatch: true
    })
  }]);

courtresApp.controller('NewPersonCtrl', ['$scope', 'Restangular', function($scope, Restangular){
    $scope.addPerson = function(){
        //$scope.todo = "A";
    }
}]);

/*
courtresApp.controller('TodoCtrl', ['$scope', '$rootScope', 'TodoService', function($scope, $rootScope, TodoService) {
  $scope.formData = {};
  $scope.todos = [];

  TodoService.getTodos().then(function(response) {
    $scope.todos = response;
  });

  $scope.addTodo = function() {
    TodoService.addTodo($scope.formData).then(function(response) {
      $scope.todos.push($scope.formData)
      $scope.formData = {};
    });
  }

  $scope.removeTodo = function(todo) {
    TodoService.removeTodo(todo).then(function(response) {
      $scope.todos.splice($scope.todos.indexOf(todo), 1)
    });
  }
}]);
*/
