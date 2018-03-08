'use strict';

//TODO need to move in properties file

/*Global path declaration */
var path="/ahanaServices/services/";

/* Controllers */
app
  // Registration controller
  .controller('RegistrationController', ['$scope','$http', function($scope, $http) {
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
      $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
      return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
      $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.openDateOfBirth = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.openedDateOfBirth = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      class: 'datepicker'
    };

    $scope.initDate = new Date('2016-15-20');
    $scope.formats = ['dd/MM/yyyy hh:mm:ss', 'dd/MM/yyyy'];
    $scope.format = $scope.formats[0];
    $scope.formatDOB = $scope.formats[1];

      /**Copy current address to permanent address if checkbox is checked*/
      $scope.copyCurrentAddress = function(){
        if($scope.data.sameAsCurrentAddress){
          $scope.data.permanentAddress = $scope.data.address;
          $scope.data.permanentCountry = $scope.data.country;
          $scope.data.permanentState = $scope.data.state;
          $scope.data.permanentCity = $scope.data.city;
          $scope.data.permanentZip = $scope.data.zip;
        }
      }

      /**Save Patient Registration data*/
      $scope.saveRegistration = function(){
        console.log($scope.registrationForm);
        if($scope.registrationForm.$valid){
          $http({
            url: path+"rest/registration/savePatient",
            method: "POST",
            data: $scope.data
            //headers: {'Content-Type': 'application/x-www-form-urlencoded'}
          }).then(
              function(){
                $scope.data = {};
                $scope.registrationMessage = "Registration saved successfully";
              },
              /**Error handling*/
              function(){
                $scope.registrationMessage = "Failed registration";
              }
          )
        }
      }
  }]);