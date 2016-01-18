'use strict';

var courtresApp = angular.module('courtresApp', [
    'ngRoute',
    'restangular',
	'ngMaterial',
    'dndLists'
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
    var baseFacility = Restangular.all('facility');
	var baseTimeslot = Restangular.all('timeslots');
    
    $scope.init = function(){
        var facility = dataService.getKV('facility');
        var user = dataService.getKV('user');
        if (facility == null || user == null){
            //Stub the data.
            io.socket.get('/person?where={"email":{"equals":"dennis@gmail.com"}}', function (resData) {
                if (resData.length > 0){
                    dataService.setKV('user',resData[0]);
                    $scope.user = resData[0];
                    io.socket.get('/facility?where={"name":{"equals":"BadmintonNC"}}', function (resData) {
                        if (resData.length > 0){
                            dataService.setKV('facility',resData[0]);
                            $scope.facility = resData[0];
                            
                            baseTimeslot.getList().then(function(timeslots){
                                $scope.allTimeslots = timeslots;
                            });
                            
                            baseCourt.getList().then(function(courts){
                                $scope.allCourts = courts;
                            });
                            
                            $scope.courts = [];
                            //setTimeslotDetails($scope.facility);
			
                            //Listen to model change events.
                            io.socket.on("facility", function(event){$scope.onFacilityChange(event);})
                            io.socket.get("/facility", function(resData, jwres) {console.log(resData);})
                            //$location.path( "/" );
                        }
                    });
                }
            });
            
            
            
        }
        else{
            $scope.facility = dataService.getKV('facility');
            $scope.user = dataService.getKV('user');
			$scope.courts = [];
			setTimeslotDetails($scope.facility);
			
			//Listen to model change events.
			io.socket.on("facility", function(event){$scope.onFacilityChange(event);})
			io.socket.get("/facility", function(resData, jwres) {console.log(resData);})
        }
    };
    
    $scope.filterTimeSlots = function(court){
        return function(timeslot) {
            return timeslot.court.id == court.id;
        }
    };
    
	$scope.sortableOptions = {
		placeholder: ".dragdrop-element",
		connectWith: ".dragdrop-container"
	};
	
	/*Facility has court details but what I need here is two level deep data for the 
	timeslots also, Sails is providing me only one level of data at this point, 
	hence this looping.*/
    var setTimeslotDetails = function(facility){
		for (var i=0; i<facility.courts.length; i++){
			baseCourt.get(facility.courts[i].id).then(function(court){
                for(var j=0; j<court.timeSlots.length; j++){
                    court.timeSlots[j].reservation = [];
                }
                $scope.courts.push(court);
				validateAllResponses();
			});
		}
	};
    
	/*We are making a-sync calls to get the court details, 
	this is to ensure that we got all the court details before we start paining the UI. 
	TODO: there should be a better way to do this.*/
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
	
	$scope.onFacilityChange = function(event){
		/*
		TODO: 1. If using a local array, then unique items should be maintained.
			  2. Handle the situation of removing the checkedInMembers.
		*/
		if (event.verb == 'addedTo' && event.attribute == "checkedInMembers" && event.id == $scope.facility.id){
			baseFacility.get($scope.facility.id).then(function (facility){
				$scope.facility = facility;
			});
		}
	};
    
}]);

courtresApp.controller('AdminCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', function($scope, $routeParams, Restangular, dataService, $location){
    var baseFacility = Restangular.all('facility');
	
    $scope.init = function(){
        var facility = dataService.getKV('facility');
        var user = dataService.getKV('user');
        if (facility == null || user == null){
            $location.path( "/" );
        }
        else{
            $scope.facility = dataService.getKV('facility');
            $scope.user = dataService.getKV('user');
			
			//Listen to model change events.
			io.socket.on("facility", function(event){$scope.onFacilityChange(event);})
			io.socket.get("/facility", function(resData, jwres) {console.log(resData);})
        }
    };
	
	$scope.querySearch = function(query) {
      var results = query ? $scope.allMembers.filter( $scope.createFilterFor(query) ) : $scope.allMembers,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }
	
    $scope.searchTextChange = function(text) {
      console.log('Text changed to ' + text);
    }
	
    $scope.selectedItemChange = function(item) {
		item.checkedInToFacility = $scope.facility;
		item.save();
		console.log('Item changed to ' + JSON.stringify(item));
    }
	
	$scope.createFilterFor = function(query) {
      var lowercaseQuery = angular.lowercase(query);
      return function filterFn(person) {
		var localcasename = angular.lowercase(person.name);
		return (localcasename.indexOf(lowercaseQuery) === 0);
      };
    }
	
	$scope.onFacilityChange = function(event){
		/*
		TODO: 1. If using a local array, then unique items should be maintained.
			  2. Handle the situation of removing the checkedInMembers.
		*/
		if (event.verb == 'addedTo' && event.attribute == "checkedInMembers" && event.id == $scope.facility.id){
			baseFacility.get($scope.facility.id).then(function (facility){
				$scope.facility = facility;
			});
		}
		else if (event.verb == 'updated' && event.data.id == $scope.facility.id){
			$scope.facility = event.data;
		}
	};
	
    var basePerson = Restangular.all('person');
    
    basePerson.getList().then(function(persons) {
      $scope.allMembers = persons;
    });
    
	var getCachedPerson = function(id){
		for (var i=0; i<$scope.allMembers.length; i++){
			if ($scope.allMembers[i].id == id){
				return $scope.allMembers[i];
			}
		}
	}
   
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
    
	$scope.person = {'email':"dennis@gmail.com",'password':"abcd"};
	
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