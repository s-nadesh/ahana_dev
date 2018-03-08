app.controller('ConsultantVisitController', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', '$state', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, $state) {

        //Initialize consultant visit form
        $scope.patientdata = [];
        $scope.initForm = function () {
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
            });
            $scope.patientdata = $modalInstance.data;

            $scope.data = {};
            $scope.data.consult_date = moment().format('YYYY-MM-DD HH:mm:ss');
        }

        $scope.saveForm = function () {
            if ($scope.consultantVisitForm.$valid) {
                _that = this;
                _that.data.consult_date = moment(_that.data.consult_date).format('YYYY-MM-DD HH:mm:ss');

                $scope.errorData = "";
                $scope.successMessage = "";

                post_url = $rootScope.IRISOrgServiceUrl + '/patientconsultant/bulkinsert';
                method = 'POST';
                succ_msg = 'Consultant visit added successfully';

                scope.loadbar('show');
                $http({
                    method: method,
                    url: post_url,
                    data: {consultant_visit: _that.patientdata, data: _that.data},
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
                                $scope.successMessage = succ_msg;
                                $scope.data = {};
                                $scope.patientdata = [];
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

        $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var d = new Date();
            var n = d.getDate();
            var m = d.getMonth();
            var y = d.getFullYear();
            var today_date = (new Date(y, m, n)).valueOf();

            var upto_date = (d.setDate(d.getDate() - 3)).valueOf();

            if (scope.checkAccess('patient.backdateconsultant')) {
                angular.forEach($dates, function (date, key) {
                    var calender = new Date(date.localDateValue());
                    var calender_n = calender.getDate();
                    var calender_m = calender.getMonth();
                    var calender_y = calender.getFullYear();
                    var calender_date = (new Date(calender_y, calender_m, calender_n)).valueOf();

                    //Hide - Future Dates OR More than 3 days before
                    if (today_date < calender_date || upto_date > calender_date) {
                        $dates[key].selectable = false;
                    }
                });
            } else {
                angular.forEach($dates, function (date, key) {
                    var calender = new Date(date.localDateValue());
                    var calender_n = calender.getDate();
                    var calender_m = calender.getMonth();
                    var calender_y = calender.getFullYear();
                    var calender_date = (new Date(calender_y, calender_m, calender_n)).valueOf();

                    //Hide - Future and Past Dates
                    if (today_date != calender_date) {
                        $dates[key].selectable = false;
                    }
                });
            }
        }
    }]);
  