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
      if (event.verb === 'addedTo' && event.attribute === "checkedInMembers" && event.id === $scope.facility.id){
        baseFacility.get($scope.facility.id).then(function (facility){
          $scope.facility = facility;
        });
      }
      else if (event.verb === 'updated' && event.data.id === $scope.facility.id){
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
