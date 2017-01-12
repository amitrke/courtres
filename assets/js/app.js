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

courtresApp.controller('FacilityCtrl', ['$scope', '$routeParams', 'Restangular', 'dataService', '$location', '$cookies', '$window','$timeout',
  function($scope, $routeParams, Restangular, dataService, $location, $cookies, $window, $timeout){

    var auth2;

    $scope.user = {};

    $timeout(function(){
      console.log('appStart()');
      gapi.load('auth2', initSigninV2);
    }, 3000);

    $window.appStart = function() {
      console.log('appStart()');
      gapi.load('auth2', initSigninV2);
    };

    var initSigninV2 = function() {
      console.log('initSigninV2()');
      auth2 = gapi.auth2.getAuthInstance();
      auth2.isSignedIn.listen(signinChanged);
      auth2.currentUser.listen(userChanged);

      if(auth2.isSignedIn.get() == true) {
        auth2.signIn();
      }
    };

    var signinChanged = function(isSignedIn) {
      console.log('signinChanged() = ' + isSignedIn);
      if(isSignedIn) {
        console.log('the user must be signed in to print this');
        var googleUser = auth2.currentUser.get();
        var authResponse = googleUser.getAuthResponse();
        var profile = googleUser.getBasicProfile();
        $scope.user.id          = profile.getId();
        $scope.user.fullName    = profile.getName();
        $scope.user.firstName   = profile.getGivenName();
        $scope.user.lastName    = profile.getFamilyName();
        $scope.user.photo       = profile.getImageUrl();
        $scope.user.email       = profile.getEmail();
        $scope.user.domain      = googleUser.getHostedDomain();
        $scope.user.idToken     = authResponse.id_token;
        $scope.user.expiresAt   = authResponse.expires_at;
        $scope.$digest();
      } else {
        console.log('the user must not be signed in if this is printing');
        $scope.user = {};
        $scope.$digest();
      }
    };

    var userChanged = function(user) {
      console.log('userChanged()');
    };

    $scope.signOut = function() {
      console.log('signOut()');
      auth2.signOut().then(function() {
        signinChanged(false);
      });
      console.log(auth2);
    };

    $scope.disconnect = function() {
      console.log('disconnect()');
      auth2.disconnect().then(function() {
        signinChanged(false);
      });
      console.log(auth2);
    };

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
