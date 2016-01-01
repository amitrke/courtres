'use strict';

var courtresApp = angular.module('courtresApp', [
    'ngRoute',
    'ui.bootstrap',
    'restangular'
]);

courtresApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.when('/user/new', {
      templateUrl: '/templates/updatePerson.html',
      controller: 'PersonCtrl'
    }).when('/home', {
      templateUrl: '/templates/homepage.html',
      controller: 'FacilityCtrl'
    }).when('/facility/:facilityid', {
      templateUrl: '/templates/facilityHome.html',
      controller: 'FacilityHomeCtrl'
    }).when('/member', {
      templateUrl: '/templates/member.html',
      controller: 'MemberCtrl'
    }).when('/admin', {
      templateUrl: '/templates/admin.html',
      controller: 'AdminCtrl'
    }).
    otherwise({
      redirectTo: '/home',
      caseInsensitiveMatch: true
    })
  }]);

courtresApp.controller('AdminCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', function($scope, $routeParams, Restangular, dataService, $location){
    
    $scope.init = function(){
        var facility = dataService.getKV('facility');
        var user = dataService.getKV('user');
        if (facility == null || user == null){
            $location.path( "/" );
        }
        else{
            $scope.facility = dataService.getKV('facility');
            $scope.user = dataService.getKV('user');
        }
    };
    
    var basePerson = Restangular.all('person');
    
    basePerson.getList().then(function(persons) {
      $scope.allMembers = persons;
    });
    
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
    }
    
    $scope.login = function(person){
        io.socket.get('/person?where={"email":{"equals":"'+person.email+'"},"password":{"equals":"'+person.password+'"}}', function (resData) {
            if (resData != null && resData.length > 0){
                $scope.authRequest = "success";
				var user = resData[0];
                dataService.setKV('user', user);
				
				if (user.type == "admin")
					$location.path("/admin")
				else if (user.type == "member")
					$location.path("/member")
				else
					console.log("Unknown member type:",user.type)
            }
            else{
                $scope.authRequest = "failure";
            }
        });
    };
}]);