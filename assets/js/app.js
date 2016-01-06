'use strict';

var courtresApp = angular.module('courtresApp', [
    'ngRoute',
    'ui.bootstrap',
    'restangular',
    'ui.sortable',
    'ui.layout'
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
    }).when('/board', {
      templateUrl: '/templates/board.html',
      controller: 'BoardCtrl'
    }).
    otherwise({
      redirectTo: '/home',
      caseInsensitiveMatch: true
    })
  }]);

courtresApp.controller('BoardCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', function($scope, $routeParams, Restangular, dataService, $location){
    
    var baseCourt = Restangular.all('courts');
    
    $scope.init = function(){
        var facility = dataService.getKV('facility');
        var user = dataService.getKV('user');
        if (facility == null || user == null){
            $location.path( "/" );
        }
        else{
            $scope.facility = dataService.getKV('facility');
            $scope.user = dataService.getKV('user');
			$scope.courts = [];
			setTimeslotDetails($scope.facility);
        }
    };
    
	//Facility has court details but what I need here is two level deep data for the timeslots also, Sails is providing me only one level of data at this point, hence this looping.
    var setTimeslotDetails = function(facility){
		for (var i=0; i<facility.courts.length; i++){
			baseCourt.get(facility.courts[i].id).then(function(court){
				$scope.courts.push(court);
				validateAllResponses();
			});
		}
	};
    
	//We are making a-sync calls to get the court details, this is to ensure that we got all the court details before we start paining the UI. TODO: there should be a better way to do this.
	var validateAllResponses = function(){
		if ($scope.courts.length >= $scope.facility.courts.length){
			$scope.allCourts = $scope.courts;
		}
	}
	
    $scope.getCourtTimeSlots = function(id){
        baseCourt.get(id).then(function(court){
            return court.timeSlots;
        });
    };
    
}]);

courtresApp.controller('AdminCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', function($scope, $routeParams, Restangular, dataService, $location){
    
    $scope.checkedInMembers = [];
    
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
    
    $scope.checkinOnSelect = function ($item, $model, $label) {
        $scope.$item = $item;
        $scope.$model = $model;
        $scope.$label = $label;
        $scope.checkedInMembers.push($item);
    };
    
    $scope.sortableOptions = {
        update: function(e, ui) {
          var logEntry = tmpList.map(function(i){
            return i.value;
          }).join(', ');
          $scope.sortingLog.push('Update: ' + logEntry);
        },
        stop: function(e, ui) {
          // this callback has the changed model
          var logEntry = tmpList.map(function(i){
            return i.value;
          }).join(', ');
          $scope.sortingLog.push('Stop: ' + logEntry);
        }
    };
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
            var user = dataService.getKV('user');
            
            if (user.type == "admin")
                $location.path("/admin")
            else if (user.type == "member")
                $location.path("/member")
            else
                console.log("Unknown member type:",user.type)
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