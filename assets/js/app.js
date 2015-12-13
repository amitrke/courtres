'use strict';

var courtresApp = angular.module('courtresApp', [
    'ngRoute',
    'ui.bootstrap',
    'restangular'
]);

courtresApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/ng/:facility/user/new', {
      templateUrl: '/templates/updatePerson.html',
      controller: 'PersonCtrl'
    }).when('/', {
      templateUrl: '/templates/homepage.html',
      controller: 'NewPersonCtrl'
    }).otherwise({
      redirectTo: '/',
      caseInsensitiveMatch: true
    })
  }]);

courtresApp.controller('PersonCtrl', ['$scope', '$routeParams', 'Restangular', function($scope, $routeParams, Restangular){
    var basePerson = Restangular.all('person');
    
    $scope.update = function(person){
        basePerson.post(person);
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
