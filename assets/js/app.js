'use strict';

var courtresApp = angular.module('courtresApp', [
    'ngRoute',
    'ngCookies',
    'restangular',
	'ngMaterial',
    'ngMessages',
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

courtresApp.controller('BoardCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', '$interval',
                                     function($scope, $routeParams, Restangular, dataService, $location, $interval){
    
    var baseCourt = Restangular.all('courts');
    var baseFacility = Restangular.all('facility');
	var baseTimeslot = Restangular.all('timeslots');
    var basePerson = Restangular.all('person');
    
    $scope.queueMembers = [];
                                         
    $scope.init = function(){
        var facility = dataService.getKV('facility');
        var user = dataService.getKV('user');
        if (facility === null || user === null){
            //Stub the data.
            io.socket.get('/person?where={"email":"dennis@gmail.com"}', function (resData) {
                if (resData.length > 0){
                    dataService.setKV('user',resData[0]);
                    $scope.user = resData[0];
                    io.socket.get('/facility?where={"name":"BadmintonNC"}', function (resData) {
                        if (resData.length > 0){
                            dataService.setKV('facility',resData[0]);
                            $scope.facility = resData[0];
                            
                            baseTimeslot.getList().then(function(timeslots){
                                $scope.allTimeslots = timeslots;
                                
                                var date = new Date();
                                var minutes = date.getMinutes();
                                $scope.updateTimeSlotsForCurrentTime(minutes);
                            });
                            
                            baseCourt.getList().then(function(courts){
                                $scope.allCourts = courts;
                            });
                            
                            $scope.updateQueue();
                            
                            $scope.courts = [];
                            //setTimeslotDetails($scope.facility);
			
                            //Listen to model change events.
                            io.socket.on("facility", function(event){$scope.onFacilityChange(event);})
                            //io.socket.get("/facility", function(resData, jwres) {console.log(resData);})
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
            
			 baseTimeslot.getList().then(function(timeslots){
                $scope.allTimeslots = timeslots;
            });

            baseCourt.getList().then(function(courts){
                $scope.allCourts = courts;
            });

            $scope.updateQueue();

            $scope.courts = [];
            //setTimeslotDetails($scope.facility);

            //Listen to model change events.
            io.socket.on("facility", function(event){$scope.onFacilityChange(event);})
            io.socket.get("/facility", function(resData, jwres) {console.log(resData);})
        }
    };
    
    $interval(function(){
    	//Get Minutes
    	var date = new Date();
    	var minutes = date.getMinutes();
    	$scope.updateTimeSlotsForCurrentTime(minutes);
    	
    }, 10000);
    
    $scope.updateTimeSlotsForCurrentTime = function(currMinutes){
    	_.forEach($scope.allTimeslots, function(timeslot) {
    		  if (currMinutes >= timeslot.startMin && currMinutes < timeslot.startMin+timeslot.duration){ //Current time Slot
    			  timeslot.current = true;
                  $scope.updateMembersInTimeSlot(timeslot, "Playing");
    		  }
    		  else {
                if (timeslot.current === true){ //Current state is changing for this slot, members should be kicked out of it.
                    $scope.updateMembersInTimeSlot(timeslot, "Queue");
                    $scope.moveTimeSlotMembersToQueue(timeslot);
                }
    			timeslot.current = false;
    		  }
    	});
    };

    $scope.moveTimeSlotMembersToQueue = function(timeslot){
        _.forEach(timeslot.reservation, function(member){
            $scope.queueMembers.push(member);
        });
        timeslot.reservation = null;
        timeslot.save();
    },

    $scope.updateMembersInTimeSlot = function(timeslot, status){
        _.forEach(timeslot.reservation, function(member){
            if (member.status != status){
                basePerson.get(member.id).then(function(person){
                    person.status = status;
                    person.save();
                });
                member.status = status;
            }
        });
    };
        
    $scope.filterTimeSlots = function(court){
        return function(timeslot) {
            return timeslot.court.id === court.id;
        }
    };
    
    $scope.updateQueue = function(){
        //TODO: Add facility ID to query.
        io.socket.get('/person?where={"checkedInToFacility":{"!":null}}', function (resData) {
            _.forEach(resData, function(checkedInMember){
                if (checkedInMember.reservation === undefined){
                    var exists = _.find($scope.queueMembers, function(qm){
                        if (qm.id === checkedInMember.id)
                            return true;
                        else
                            return false;
                    });
                    if (!exists){
                        $scope.queueMembers.push(checkedInMember);
                    }
                }
            });
        });
    };
    
    $scope.timeslotDrop = function(event, index, item, external, type, timeslot){
        basePerson.get(item.id).then(function(person){
            person.reservation = timeslot;
            person.save();
        });
       return item;
    };
	
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
		if (event.verb === 'addedTo' && event.attribute === "checkedInMembers" && event.id === $scope.facility.id){
			baseFacility.get($scope.facility.id).then(function (facility){
				$scope.facility = facility;
			});
            basePerson.get(event.addedId).then(function(person){
                $scope.queueMembers.push(person);
            });
		}
	};
    
    $scope.queueMove = function(event, index, item){
        $scope.queueMembers.splice(index, 1);
    };
    
}]);

courtresApp.controller('AdminCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', '$mdToast', 
    function($scope, $routeParams, Restangular, dataService, $location, $mdToast){
    var baseFacility = Restangular.all('facility');
    var basePerson = Restangular.all('person');
	
    $scope.init = function(){
        var facility = dataService.getKV('facility');
        var user = dataService.getKV('user');
        if (facility === undefined || user === undefined){
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

    $scope.createNewUser = function(person){
        person.type = "member";
        person.facilities = $scope.facility;
        person.checkedInToFacility = $scope.facility;
        basePerson.post(person);
        $scope.person = null;
        $mdToast.show(
            $mdToast.simple()
            .textContent('Saved successfully !')
            .hideDelay(3000)
        );
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
    
    basePerson.getList().then(function(persons) {
      $scope.allMembers = persons;
    });
    
	var getCachedPerson = function(id){
		for (var i=0; i<$scope.allMembers.length; i++){
			if ($scope.allMembers[i].id === id){
				return $scope.allMembers[i];
			}
		}
	}
   
}]);

courtresApp.controller('MemberCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', function($scope, $routeParams, Restangular, dataService, $location){
    
    $scope.init = function(){
        var facility = dataService.getKV('facility');
        var user = dataService.getKV('user');
        if (facility === null || user === null){
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

courtresApp.controller('FacilityCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', '$cookies',
                                        function($scope, $routeParams, Restangular, dataService, $location, $cookies){
    var baseFacility = Restangular.all('facility');
    
    baseFacility.getList().then(function(facilities) {
      $scope.allFacilities = facilities;
    });

    $scope.update = function(facility){
        baseFacility.post(facility);
    }
    $scope.init = function(){
        
        $scope.rememberMe = true;

        //Try to read data from cookies.
        var cUsername = $cookies.get('username');
        var cPassword = $cookies.get('password');
        //var cFacility = $cookies.get('facility');
        
        if (cUsername !== undefined && cPassword !== undefined && /*cFacility !== undefined &&*/
            cUsername !== null && cPassword !== null /*&& cFacility !== null*/){
            $scope.person = {'email':cUsername, 'password':cPassword};
            /*baseFacility.get(cFacility).then(function(fac) {
                $scope.facility = fac;
            });
            */
        }
    };
    
    $scope.login = function(person, facility, rememberMe){
        io.socket.get('/person?where={"email":"'+person.email+'","password":"'+person.password+'"}', function (resData) {
            if (resData !== null && resData.length > 0){
                $scope.authRequest = "success";
				var user = resData[0];
                dataService.setKV('user', user);
				
                var expireDate = new Date();
                expireDate.setDate(expireDate.getDate() + 7);
                
                if (rememberMe){
                    $cookies.put('username', person.email, {'expires': expireDate});
                    $cookies.put('password', person.password, {'expires': expireDate});
                    //$cookies.put('facility', facility, {'expires': expireDate});
                }
                else{
                    $cookies.remove('username');
                    $cookies.remove('password');
                }

                baseFacility.get(facility).then(function(fac) {
                    $scope.facility = fac;
                    dataService.setKV('facility', fac);

                    if (user.type === "admin")
                        $location.path("/admin")
                    else if (user.type === "member")
                        $location.path("/member")
                    else
                        console.log("Unknown member type:",user.type)
                });
                
				
            }
            else{
                $scope.authRequest = "failure";
            }
        });
    };
}]);