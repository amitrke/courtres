courtresApp.controller('BoardCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', '$interval',
  function($scope, $routeParams, Restangular, dataService, $location, $interval) {

    var baseCourt = Restangular.all('courts');
    var baseFacility = Restangular.all('facility');
    var baseTimeslot = Restangular.all('timeslots');
    var basePerson = Restangular.all('person');

    $scope.queueMembers = [];

    $scope.init = function () {
      var facility = dataService.getKV('facility');
      var user = dataService.getKV('user');
      if (facility === null || user === null) {
        $location.path( "/" );
      }
      else {
        $scope.facility = dataService.getKV('facility');
        $scope.user = dataService.getKV('user');
        $scope.courts = [];

        baseTimeslot.getList().then(function (timeslots) {
          $scope.allTimeslots = timeslots;

          var date = new Date();
          var minutes = date.getMinutes();
          $scope.updateTimeSlotsForCurrentTime(minutes);
        });

        baseCourt.getList().then(function (courts) {
          $scope.allCourts = courts;
        });

        $scope.updateQueue();

        $scope.courts = [];
        //setTimeslotDetails($scope.facility);

        //Listen to model change events.
        io.socket.on("facility", function (event) {
          $scope.onFacilityChange(event);
        })
        io.socket.get("/facility", function (resData, jwres) {
          console.log(resData);
        })
      }
    };

    $interval(function () {
      //Get Minutes
      var date = new Date();
      var minutes = date.getMinutes();
      $scope.updateTimeSlotsForCurrentTime(minutes);

    }, 10000);

    $scope.updateTimeSlotsForCurrentTime = function (currMinutes) {
      _.forEach($scope.allTimeslots, function (timeslot) {
        if (currMinutes >= timeslot.startMin && currMinutes < timeslot.startMin + timeslot.duration) { //Current time Slot
          timeslot.current = true;
          $scope.updateMembersInTimeSlot(timeslot, "Playing");
        }
        else {
          if (timeslot.current === true) { //Current state is changing for this slot, members should be kicked out of it.
            $scope.updateMembersInTimeSlot(timeslot, "Queue");
            $scope.moveTimeSlotMembersToQueue(timeslot);
          }
          timeslot.current = false;
        }
      });
    };

    $scope.moveTimeSlotMembersToQueue = function (timeslot) {
      _.forEach(timeslot.reservation, function (member) {
        $scope.queueMembers.push(member);
      });
      timeslot.reservation = null;
      timeslot.save();
    },

      $scope.updateMembersInTimeSlot = function (timeslot, status) {
        _.forEach(timeslot.reservation, function (member) {
          if (member.status !== status) {
            basePerson.get(member.id).then(function (person) {
              person.status = status;
              person.save();
            });
            member.status = status;
          }
        });
      };

    $scope.filterTimeSlots = function (court) {
      return function (timeslot) {
        return timeslot.court.id === court.id;
      }
    };

    $scope.updateQueue = function () {
      //TODO: Add facility ID to query.
      io.socket.get('/person?where={"checkedInToFacility":{"!":null}}', function (resData) {
        _.forEach(resData, function (checkedInMember) {
          if (checkedInMember.reservation === undefined) {
            var exists = _.find($scope.queueMembers, function (qm) {
              if (qm.id === checkedInMember.id)
                return true;
              else
                return false;
            });
            if (!exists) {
              $scope.queueMembers.push(checkedInMember);
            }
          }
        });
      });
    };

    $scope.timeslotDrop = function (event, index, item, external, type, timeslot) {
      basePerson.get(item.id).then(function (person) {
        person.reservation = timeslot;
        person.save();
      });
      return item;
    };

    $scope.getCourtTimeSlots = function (id) {
      baseCourt.get(id).then(function (court) {
        return court.timeSlots;
      });
    };

    $scope.onFacilityChange = function (event) {
      /*
       TODO: 1. If using a local array, then unique items should be maintained.
       2. Handle the situation of removing the checkedInMembers.
       */
      if (event.verb === 'addedTo' && event.attribute === "checkedInMembers" && event.id === $scope.facility.id) {
        baseFacility.get($scope.facility.id).then(function (facility) {
          $scope.facility = facility;
        });
        basePerson.get(event.addedId).then(function (person) {
          $scope.queueMembers.push(person);
        });
      }
    };

    $scope.queueMove = function (event, index, item) {
      $scope.queueMembers.splice(index, 1);
    };

  }]);
