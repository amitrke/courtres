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
    }).when('/member', {
      templateUrl: '/templates/member.html',
      controller: 'MemberCtrl'
    }).
    otherwise({
      redirectTo: '/home',
      caseInsensitiveMatch: true
    })
  }]);

courtresApp.controller('MemberCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', function($scope, $routeParams, Restangular, dataService, $location){
    
    $scope.init = function(){
        var facility = dataService.getKV('facility');
        var user = dataService.getKV('user');
        if (facility == null || user == null){
            $location.path( "/" );
        }
        else{
            $scope.facility = dataService.getKV('facility');
            $scope.user = dataService.getKV('user');
            
            io.socket.get('/person?where={"email":{"equals":"'+person.email+'"},"password":{"equals":"'+person.password+'"}}', function (resData) {
            if (resData != null && resData.length > 0){
                    $scope.authRequest = "success";
                    dataService.setKV('user', resData[0]);
                    $location.path( "/member" );
                }
                else{
                    $scope.authRequest = "failure";
                }
            });
        }
    };
    
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

courtresApp.controller('FacilityHomeCtrl', ['$scope', '$routeParams', 'Restangular', '$http', 'dataService', '$location',
                                            function($scope, $routeParams, Restangular, $http, dataService, $location){
    
    $scope.init = function(){
        
        var baseFacility = Restangular.all('facility');
    
        baseFacility.get($routeParams.facilityid).then(function(facility) {
            $scope.facility = facility;
            dataService.setKV('facility', facility);
        });

        if (dataService.getKV('user') != null && dataService.getKV('facility') != null){
            $location.path( "/member" );
        }
        else{
            $http({
              method  : 'GET',
              url     : '/person/getSession'
             })
             .success(function(data) {
                if (data!=null) {
                    if (data.session.facility != null){
                        dataService.setKV('facility', data.session.facility);
                    }
                    if (data.session.user != null){
                        dataService.setKV('user', data.session.user);
                        $location.path( "/member" );
                    }
                } else { //Show login failure
                    console.log("Error getting session details.");
                }
            });
        }
    }
    
    $scope.login = function(person){
        io.socket.get('/person?where={"email":{"equals":"'+person.email+'"},"password":{"equals":"'+person.password+'"}}', function (resData) {
            if (resData != null && resData.length > 0){
                $scope.authRequest = "success";
                dataService.setKV('user', resData[0]);
                $location.path( "/member" );
            }
            else{
                $scope.authRequest = "failure";
            }
        });
    };
}]);