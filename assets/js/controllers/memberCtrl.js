courtresApp.controller('MemberCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', '$q', function($scope, $routeParams, Restangular, dataService, $location, $q){

  var baseTimeslot = Restangular.all('timeslots');

  $scope.init = function(){

    var facility = dataService.getKV('facility');
    var user = dataService.getKV('user');
    $scope.checkedInToFacility = undefined;

    if (facility === undefined || user === undefined){
      $location.path( "/" );
    }
    else{
      $scope.facility = dataService.getKV('facility');
      $scope.user = dataService.getKV('user');
      $scope.checkedInToFacility = $scope.user.checkedInToFacility;

      baseTimeslot.getList().then(function(timeslots){ //TODO: Fetch only the timeslots for this facility.
        $scope.timeslots = timeslots;
      });

      io.socket.on("person", function(event){$scope.onPersonChange(event);});
    }
  };

  $scope.onPersonChange = function(event){
    /*
     TODO: 1. If using a local array, then unique items should be maintained.
     2. Handle the situation of removing the checkedInMembers.
     */
    if (event.verb === 'updated' && event.data.id === $scope.user.id && event.data.checkedInToFacility === $scope.facility.id){
      $scope.checkedInToFacility = event.data.checkedInToFacility;
    }
  };

  $scope.onRes = function(selectedCourt, selectedTimeSlot){

    var basePerson = Restangular.all('person');
    var baseCourt = Restangular.all('court');
    var baseTimeslot = Restangular.all('timeslot');

    basePerson.get($scope.user.id).then(function (person) {
      if (person.reservation === undefined){
        //Get the court
        baseCourt.get(selectedCourt).then(function (court) {
          //Get the timeslot
          baseTimeslot.get(selectedTimeSlot, court).then(function (timeslot) {
            person.reservation = timeslot;
            //Update
            person.save();
          })
        })
      }
      else{
        //Do something
      }
    });
    console.log(selectedCourt + selectedTimeSlot);
  };

}]);
