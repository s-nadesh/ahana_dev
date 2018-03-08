app.controller('DoctorSchedulesController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', 'editableOptions', 'editableThemes', function ($rootScope, $scope, $timeout, $http, $state, $filter, editableOptions, editableThemes) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        //Index Page
        $scope.loadDoctorSchedulesList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection
            $rootScope.commonService.GetIntervalList(function (response) {
                $scope.intervals = response;
            });

            //Load All Doctor schedules
            $http.get($rootScope.IRISOrgServiceUrl + '/doctorschedule')
                    .success(function (docSchedules) {
                        var doctorSchedules = {};
                        angular.forEach(docSchedules, function (sub) {
                            if (typeof doctorSchedules[sub.user_id] == 'undefined') {
                                doctorSchedules[sub.user_id] = {};
                            }
                            doctorSchedules[sub.user_id]['name'] = sub.doctor_name;
                            doctorSchedules[sub.user_id]['user_id'] = sub.user_id;
                            //Get doctor interval details
                            doctorSchedules[sub.user_id]['interval'] = sub.interval;

                            if (typeof doctorSchedules[sub.user_id]['days'] == 'undefined') {
                                doctorSchedules[sub.user_id]['days'] = {};
                            }

                            if (typeof doctorSchedules[sub.user_id]['days'][sub.schedule_day] == 'undefined') {
                                doctorSchedules[sub.user_id]['days'][sub.schedule_day] = {};
                            }
                            doctorSchedules[sub.user_id]['days'][sub.schedule_day]['dayname'] = sub.available_day;
                            doctorSchedules[sub.user_id]['days'][sub.schedule_day]['schedule_day'] = sub.schedule_day;

                            if (typeof doctorSchedules[sub.user_id]['days'][sub.schedule_day]['timing'] == 'undefined') {
                                doctorSchedules[sub.user_id]['days'][sub.schedule_day]['timing'] = {};
                            }

                            if (typeof doctorSchedules[sub.user_id]['days'][sub.schedule_day]['timing'][sub.schedule_id] == 'undefined') {
                                doctorSchedules[sub.user_id]['days'][sub.schedule_day]['timing'][sub.schedule_id] = {};
                            }

                            doctorSchedules[sub.user_id]['days'][sub.schedule_day]['timing'][sub.schedule_id]['schedule_id'] = sub.schedule_id;
                            doctorSchedules[sub.user_id]['days'][sub.schedule_day]['timing'][sub.schedule_id]['schedule_time_in'] = sub.time_in;
                            doctorSchedules[sub.user_id]['days'][sub.schedule_day]['timing'][sub.schedule_id]['schedule_time_out'] = sub.time_out;
                        });

//                        $scope.rowCollection = doctorSchedules;
//                        $scope.displayedCollection = [].concat($scope.rowCollection);
                        $scope.displayedCollection = doctorSchedules;
                        $scope.isLoading = false;
                        $scope.form_filter = null;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading roomChargesubCategorys!";
                    });
        };

        $scope.$watch('interval', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                var selected = $filter('filter')($scope.intervals, {id: interval});
                $scope.intervals.value = selected.length ? selected[0].text : null;
            }
        });
        $scope.$watch('form_filter', function (newValue, oldValue) {
            if (typeof newValue != 'undefined' && newValue != '' && newValue != null) {
                var footableFilter = $('table').data('footable-filter');
                footableFilter.clearFilter();
                footableFilter.filter(newValue);
            }

            if (newValue == '') {
                $scope.loadDoctorSchedulesList();
            }
        }, true);

        //For Form
        $scope.initForm = function () {
            $scope.loadbar('show');
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;

                $rootScope.commonService.GetDayList(function (response) {
                    $scope.days = response;
                    angular.forEach($scope.days, function (day) {
                        day.checked = true;
                    });
                });

                $rootScope.commonService.GetIntervalList(function (response) {
                    $scope.intervals = response;
                });

                $scope.is_show = false;
                $scope.day_type = {
                    name: 'A'
                };
                $scope.loadbar('hide');
                if ($scope.data.formtype == 'update') {
                    $scope.loadForm();
                }
            });

        }

        $scope.checkDays = function (is_all) {
            angular.forEach($scope.days, function (day) {
                day.checked = is_all;
            });
        }

        $scope.checkInput = function (data) {
            if (typeof data === 'undefined' || !data) {
                return "Not empty";
            }
        };

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            //Validate Custom Day
            if ($scope.day_type.name == 'C') {
                var keepGoing = true;
                angular.forEach($scope.days, function (day) {
                    if (keepGoing) {
                        if (day.checked) {
                            keepGoing = false;
                        }
                    }
                });
                if (keepGoing) {
                    alert('Select alteast one day !!!')
                    return false;
                }
            }
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/doctorschedule/createschedule';
                method = 'POST';
                succ_msg = 'DoctorSchedule saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/doctorschedules/' + _that.data.charge_cat_id;
                method = 'PUT';
                succ_msg = 'DoctorSchedule updated successfully';
            }

            _that.data.day_type = $scope.day_type.name;
            _that.data.custom_day = $scope.days;
            _that.data.timings = $scope.timings;

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.success == false) {
                            $scope.errorData = response.message;
                        } else {
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            $timeout(function () {
                                $state.go('configuration.docSchedule');
                            }, 1000)
                        }
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
                return false;
            });

        };

        // editable table
        $scope.timings = [{
                schedule_time_in: '',
                schedule_time_out: '',
            }];

        // add Row
        $scope.addRow = function () {
            $scope.inserted = {
                schedule_time_in: '',
                schedule_time_out: '',
            };
            $scope.timings.push($scope.inserted);
        };

        // remove Row
        $scope.removeTime = function (index) {
            if ($scope.timings.length == 1)
                alert('You can\'t delete this row. Timings should not be empty !!!')
            else
                $scope.timings.splice(index, 1);
        };

        $scope.updateInterval = function (data, id) {
            $scope.errorData = $scope.msg.successMessage = '';
            post_method = 'POST';
            post_url = $rootScope.IRISOrgServiceUrl + '/doctorinterval/setintervaltime?userid=' + id;
            succ_msg = 'Doctorinterval Updated successfully';
            $http({
                method: post_method,
                url: post_url,
                data: data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = succ_msg;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.updateTimings = function (data, id) {
            $scope.errorData = $scope.msg.successMessage = '';
            post_method = 'PUT';
            post_url = $rootScope.IRISOrgServiceUrl + '/doctorschedules/' + id;
            succ_msg = 'Doctorschedule Updated successfully';

            $http({
                method: post_method,
                url: post_url,
                data: data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = succ_msg;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.deleteTiming = function (schedule_id, user_id, schedule_day) {
            //Remove Row from Table & DB
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                angular.forEach($scope.displayedCollection, function (parent, index1) {
                    if (parent.user_id == user_id) {
                        angular.forEach(parent.days, function (sub, index2) {
                            if (sub.schedule_day == schedule_day) {

                                angular.forEach(sub.timing, function (timing, index3) {
                                    if (timing.schedule_id == schedule_id) {
                                        $scope.loadbar('show');
                                        if (index3 !== -1) {
                                            $http({
                                                url: $rootScope.IRISOrgServiceUrl + "/doctorschedule/remove",
                                                method: "POST",
                                                data: {id: schedule_id}
                                            }).then(
                                                    function (response) {
                                                        $scope.loadbar('hide');
                                                        if (response.data.success === true) {
                                                            delete $scope.displayedCollection[index1]['days'][index2]['timing'][index3];
                                                            $scope.msg.successMessage = 'Timing deleted successfully !!!';
                                                        } else {
                                                            $scope.errorData = response.data.message;
                                                        }
                                                    }
                                            )
                                        }

                                    }
                                });
                            }
                        });
                    }
                });
            }
        };

        $scope.deleteAllTimings = function (user_id) {
            //Remove Row from Table & DB
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                angular.forEach($scope.displayedCollection, function (parent, index) {
                    if (parent.user_id == user_id) {
                        $scope.loadbar('show');
                        if (index !== -1) {
                            $http({
                                url: $rootScope.IRISOrgServiceUrl + "/doctorschedule/removeall",
                                method: "POST",
                                data: {id: user_id}
                            }).then(
                                    function (response) {
                                        $scope.loadbar('hide');
                                        if (response.data.success === true) {
                                            delete $scope.displayedCollection[index];
                                            $scope.msg.successMessage = 'Doctor Schedule deleted successfully !!!';
                                        } else {
                                            $scope.errorData = response.data.message;
                                        }
                                    }
                            )
                        }
                    }
                });
            }
        };
        //End

        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        $scope.initTimepicker = function () {
            $('.timepicker').timepicker();
        }

    }]);
