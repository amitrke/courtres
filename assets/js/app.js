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
