app.controller('AppointmentRescheduleController', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', '$state', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, $state) {

        //Datepicker
        $scope.open = function () {
            $timeout(function () {
                $scope.opened = true;
            });
        };
        $scope.toggleMin = function () {
            $scope.minDate = $scope.minDate ? null : new Date();
//            $scope.minDate.setDate($scope.minDate.getDate() + 1);
        };
        $scope.toggleMin();

        //Initialize reschedule form
        $scope.rescheduledata = [];
        $scope.initRescheduleForm = function () {
            $scope.rescheduledata = $modalInstance.data;
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
            });

            $scope.data = {};
            $scope.data.status_date = moment($scope.rescheduledata[0].status_date).format('YYYY-MM-DD');
            $scope.data.consultant_id = $scope.rescheduledata[0].consultant_id;
            $scope.getTimeSlots($scope.data.consultant_id, $scope.data.status_date);
        }

        $scope.getTimeOfAppointment = function () {
            if (typeof (this.data) != "undefined") {
                if (typeof (this.data.consultant_id) != 'undefined' && typeof (this.data.status_date != 'undefined')) {
                    $scope.getTimeSlots(this.data.consultant_id, this.data.status_date);
                }
            }
        }

        $scope.getTimeSlots = function (doctor_id, date) {
            $http.post($rootScope.IRISOrgServiceUrl + '/doctorschedule/getdoctortimeschedule', {doctor_id: doctor_id, schedule_date: date})
                    .success(function (response) {
                        $scope.timeslots = [];
                        angular.forEach(response.timerange, function (value) {
                            $scope.timeslots.push({
                                time: value.time,
                                color: value.color,
                            });
                        });
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                    });
        }

        $scope.saveForm = function () {
            if ($scope.rescheduleForm.$valid) {

                _that = this;

                $scope.errorData = "";
                scope.msg.successMessage = "";

                post_url = $rootScope.IRISOrgServiceUrl + '/appointment/bulkreschedule';
                method = 'POST';
                succ_msg = 'Rescheduled successfully';
                
                _that.data.status_date = moment(_that.data.status_date).format('YYYY-MM-DD');

                scope.loadbar('show');
                $http({
                    method: method,
                    url: post_url,
                    data: {appointments: _that.rescheduledata, data: _that.data},
                }).success(
                        function (response) {
                            if (response.success == false) {
                                scope.loadbar('hide');
                                if (status == 422)
                                    $scope.errorData = scope.errorSummary(data);
                                else
                                    $scope.errorData = response.message;
                            } else {
                                scope.loadbar('hide');
                                scope.msg.successMessage = succ_msg;
                                $scope.data = {};
                                $scope.rescheduledata = [];
                                $timeout(function () {
                                    $modalInstance.dismiss('cancel');
                                }, 1000)
                            }
                        }
                ).error(function (data, status) {
                    scope.loadbar('hide');
                    if (status == 422)
                        $scope.errorData = scope.errorSummary(data);
                    else
                        $scope.errorData = data.message;
                });
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
  