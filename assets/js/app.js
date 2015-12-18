'use strict';

var courtresApp = angular.module('courtresApp', [
    'ngRoute',
    'ui.bootstrap',
    'restangular'
]);

courtresApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/ng/user/new', {
      templateUrl: '/templates/updatePerson.html',
      controller: 'PersonCtrl'
    }).when('/home', {
      templateUrl: '/templates/homepage.html',
      controller: 'FacilityCtrl'
    }).when('/ng/facility/:facilityid', {
      templateUrl: '/templates/facilityHome.html',
      controller: 'FacilityHomeCtrl'
    }).
    otherwise({
      redirectTo: '/home',
      caseInsensitiveMatch: true
    })
  }]);

courtresApp.controller('PersonCtrl', ['$scope', '$routeParams', 'Restangular', function($scope, $routeParams, Restangular){
    var basePerson = Restangular.all('person');
    
    $scope.update = function(person){
        basePerson.post(person);
    }
    
}]);

courtresApp.controller('FacilityCtrl', ['$scope', '$routeParams', 'Restangular', function($scope, $routeParams, Restangular){
    var baseFacility = Restangular.all('facility');
    
    baseFacility.getList().then(function(facilities) {
      $scope.allFacilities = facilities;
    });

    $scope.update = function(facility){
        baseFacility.post(facility);
    }
    
}]);

courtresApp.controller('FacilityHomeCtrl', ['$scope', '$routeParams', 'Restangular', '$http', function($scope, $routeParams, Restangular, $http){
    var baseFacility = Restangular.all('facility');
    
    baseFacility.get($routeParams.facilityid).then(function(facility) {
      $scope.facility = facility;
    });
    
    $scope.login = function(person){
        $http({
          method  : 'POST',
          url     : '/person/login',
          data    : $.param(person),  // pass in data as strings
          headers : { 'Content-Type': 'application/x-www-form-urlencoded' }  // set the headers so angular passing info as form data (not request payload)
         })
         .success(function(data) {
            console.log(data);
        
            if (!data.success) {
              // if not successful, bind errors to error variables
              $scope.errorName = data.errors.name;
              $scope.errorSuperhero = data.errors.superheroAlias;
            } else {
              // if successful, bind success message to message
              $scope.message = data.message;
            }
        });
    }
}]);