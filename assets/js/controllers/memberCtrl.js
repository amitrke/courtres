courtresApp.controller('MemberCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', '$q', function($scope, $routeParams, Restangular, dataService, $location, $q){

  var baseTimeslot = Restangular.all('timeslots');
  var basePerson = Restangular.all('person');

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

      $scope.updatePersonObject($scope.user.id);

      io.socket.on("person", function(event){$scope.onPersonChange(event);});
    }
  };

  $scope.updatePersonObject = function(personid){
    basePerson.get(personid).then(function (person) {
        $scope.user = person;

        baseTimeslot.get(person.reservation.id).then(function (timeslot) {
          $scope.user.reservation = timeslot;
        })
      });
  };
  
  $scope.onPersonChange = function(event){
    /*
     TODO: 1. If using a local array, then unique items should be maintained.
     2. Handle the situation of removing the checkedInMembers.
     */
    if (event.verb === 'updated' && event.data.id === $scope.user.id && event.data.checkedInToFacility === $scope.facility.id){
      $scope.checkedInToFacility = event.data.checkedInToFacility;
      $scope.updatePersonObject(event.data.id);
    }
  };

  $scope.onRes = function(selectedTimeSlot){

    var basePerson = Restangular.all('person');
    var baseCourt = Restangular.all('courts');
    var baseTimeslot = Restangular.all('timeslots');

    basePerson.get($scope.user.id).then(function (person) {
      if (person.reservation === undefined){
        //Get the timeslot
        baseTimeslot.get(selectedTimeSlot).then(function (timeslot) {
          person.reservation = timeslot;
          //Update
          person.save();
        })
      }
      else{
        //Do something
      }
    });
  };

  $scope.cancelRes = function(){

    var basePerson = Restangular.all('person');

    basePerson.get($scope.user.id).then(function (person) {
      person.reservation = null;
      person.save();
    });
  };
}]);
