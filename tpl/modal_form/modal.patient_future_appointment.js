app.controller('ModalPatientFutureAppointmentController', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', '$state', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, $state) {

        //Scope Variables
        $scope.title = $modalInstance.data.title;
        $scope.app = scope.app;
        $scope.patientObj = scope.patientObj;
        $scope.show_appt_loader = false;

        //For Datepicker
        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        //Initialize Form
        $scope.initAppointmentForm = function () {
            $scope.data = {};
            $scope.data.status_date = moment($scope.date).format('YYYY-MM-DD');
            $scope.data.patient_id = $scope.patientObj.patient_id;
            //Load Doctor List
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
                $scope.data.consultant_id = $scope.patientObj.last_consultant_id;
                $scope.getTimeOfAppointment();
            });
            $scope.data.validate_casesheet = ($scope.patientObj.activeCasesheetno == null || $scope.patientObj.activeCasesheetno == '');
            $scope.minDate = new Date();
        }

        //Time Slots Preparation
        $scope.getTimeOfAppointment = function () {
            if (typeof (this.data) != "undefined") {
                if (typeof ($scope.data.consultant_id) != 'undefined' && typeof (this.data.status_date != 'undefined')) {
                    $scope.getTimeSlots($scope.data.consultant_id, this.data.status_date);
                }
            }
        }
        $scope.getTimeSlots = function (doctor_id, date) {
            $scope.show_appt_loader = true;
            $scope.data.status_time = '';
            $http.post($rootScope.IRISOrgServiceUrl + '/doctorschedule/getdoctortimeschedule', {doctor_id: doctor_id, schedule_date: date})
                    .success(function (response) {
                        $scope.timeslots = [];
                        angular.forEach(response.timerange, function (value) {
                            $scope.timeslots.push({
                                time: value.time,
                                color: value.color,
                                slot_12hour: value.slot_12hour,
                            });
                        });
                        $scope.show_appt_loader = false;
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                    });
        }

        //Save Form
        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/encounter/createappointment';
            method = 'POST';
            succ_msg = 'Appointment saved successfully';
            
            _that.data.status_date = moment(_that.data.status_date).format('YYYY-MM-DD');
            
            scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        scope.loadbar('hide');
                        if (response.success == true) {
                            scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            $timeout(function () {
                                $modalInstance.dismiss('cancel');
                                $state.go($state.current, {}, {reload: true});
                            }, 1000)
                        } else {
                            $scope.errorData = response.message;
                        }
                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        //Cancel Modal Popup
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
  