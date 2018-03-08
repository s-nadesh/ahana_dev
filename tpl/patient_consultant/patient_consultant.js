// this is a lazy load controller, 
// so start with "app." to register this controller

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
})
app.controller('PatConsultantsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', 'modalService', function ($rootScope, $scope, $timeout, $http, $state, $filter, modalService) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.disabled = function (date, mode) {
            date = moment(date).format('YYYY-MM-DD');
            return $.inArray(date, $scope.enabled_dates) === -1;
        };

        $scope.isPatientHaveActiveEncounter = function (callback) {
            $http.post($rootScope.IRISOrgServiceUrl + '/encounter/patienthaveactiveencounter', {patient_id: $state.params.id})
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

        $scope.initCanCreatePatConsultant = function () {
            $scope.showForm = false;
            $scope.isPatientHaveActiveEncounter(function (response) {
                $scope.all_encounters = response.encounters;
                enc_id = (!$scope.data.encounter_id) ? $state.params.enc_id : $scope.data.encounter_id;

                is_success = true;
                if (response.success == true) {
                    var actEnc = $filter('filter')($scope.all_encounters, {
                        encounter_id: enc_id
                    });
                    if (actEnc.length == 0) {
                        is_success = false;
                    }
                } else {
                    is_success = false;
                }

                if (!is_success) {
                    alert("Sorry, you can't create a Consultant for this encounter");
                    $state.go("patient.consultant", {id: $state.params.id});
                }

                $scope.showForm = true;
                $scope.encounter = response.model;
                if (!$scope.data.encounter_id)
                    $scope.data.encounter_id = $scope.encounter.encounter_id;
            });
        }

        $scope.ctrl = {};
        $scope.allExpanded = true;
        $scope.expanded = true;
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        $scope.enc = {};
        $scope.$watch('patientObj.patient_id', function (newValue, oldValue) {
            if (newValue != '') {
                $rootScope.commonService.GetEncounterListByPatient($scope.app.logged_tenant_id, '0,1', false, $scope.patientObj.patient_id, function (response) {
                    angular.forEach(response, function (resp) {
                        resp.encounter_id = resp.encounter_id.toString();
                    });
                    $scope.encounters = response;
                    if (response != null) {
                        $scope.enc.selected = $scope.encounters[0];
                        var actEnc = $filter('filter')($scope.encounters, {status: '1'});
                    }
                }, 'encounter_details');
            }
        }, true);

        $scope.$watch('enc.selected.encounter_id', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.loadPatConsultantsList();
            }
        }, true);

        $scope.initPatConsultantIndex = function () {
            $scope.data = {};
        }

        $scope.enabled_dates = [];
        $scope.loadPatConsultantsList = function (date) {

            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
            $rootScope.commonService.GetMonth(function (response) {
                $scope.months = response;
            });
            $rootScope.commonService.GetYear(function (response) {
                $scope.years = response;
            });
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            if ((typeof date == 'undefined')) {
                url = $rootScope.IRISOrgServiceUrl + '/patientconsultant/getpatconsultantsbyencounter?patient_id=' + $state.params.id;
            } else {
                date = moment(date).format('YYYY-MM-DD');
                url = $rootScope.IRISOrgServiceUrl + '/patientconsultant/getpatconsultantsbyencounter?patient_id=' + $state.params.id + '&date=' + date;
            }

            // Get data's from service
            $http.get(url)
                    .success(function (patientconsultants) {
                        $scope.isLoading = false;
                        $scope.rowCollection = patientconsultants.result;
                        $scope.displayedCollection = [].concat($scope.rowCollection);

                        angular.forEach($scope.rowCollection, function (row) {
                            angular.forEach(row.all, function (all) {
                                var result = $filter('filter')($scope.enabled_dates, moment(all.consult_date).format('YYYY-MM-DD'));
                                if (result.length == 0)
                                    $scope.enabled_dates.push(moment(all.consult_date).format('YYYY-MM-DD'));
                            });
                        });
                        $scope.$broadcast('refreshDatepickers');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patient consultants!";
                    });
        };

        //For Form
        $scope.initForm = function () {
            $scope.data = {};
            $scope.data.consult_date = moment().format('YYYY-MM-DD HH:mm:ss');
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
            });
            $timeout(function () {
                $('.selectpicker').selectpicker({
                    dropupAuto: false
                });
            }, 1000);
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientconsultants';
                method = 'POST';
                succ_msg = 'Consultant saved successfully';

                angular.extend(_that.data, {patient_id: $scope.patientObj.patient_id});
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientconsultants/' + _that.data.pat_consult_id;
                method = 'PUT';
                succ_msg = 'Consultant updated successfully';
            }
            _that.data.consult_date = moment(_that.data.consult_date).format('YYYY-MM-DD HH:mm:ss');

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = succ_msg;
                        $scope.data = {};
                        $timeout(function () {
                            $state.go('patient.consultant', {id: $state.params.id});
                        }, 1000)

                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientconsultants/" + $state.params.cons_id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
                        $scope.initCanCreatePatConsultant();
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        //Delete
        $scope.removeRow = function (row) {
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Consultation Visit?',
                bodyText: 'Are you sure you want to delete this consultation visit?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loadbar('show');
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + "/patientconsultants/remove",
                    data: {id: row.pat_consult_id},
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadPatConsultantsList();
                                $scope.msg.successMessage = 'Patient Consultation Visit Deleted Successfully';
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                );
            });
        };

        $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var d = new Date();
            var n = d.getDate();
            var m = d.getMonth();
            var y = d.getFullYear();
            var today_date = (new Date(y, m, n)).valueOf(); //19

            var upto_date = (d.setDate(d.getDate() - 3)).valueOf(); // 17

            if ($scope.checkAccess('patient.backdateconsultant')) {
                angular.forEach($dates, function (date, key) {
                    var calender = new Date(date.localDateValue());
                    var calender_n = calender.getDate();
                    var calender_m = calender.getMonth();
                    var calender_y = calender.getFullYear();
                    var calender_date = (new Date(calender_y, calender_m, calender_n)).valueOf();

                    //Hide - Future Dates OR More than 3 days before
//                    if (today_date < calender_date || upto_date > calender_date) {
//                        $dates[key].selectable = false;
//                    }
                    if (today_date < calender_date) {
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

            //            $http.post($rootScope.IRISOrgServiceUrl + '/user/getuser')
//                    .success(function (response) {
//                        if (response.return.tenant_id != 0) {
//                            var d = new Date();
//                            var n = d.getDate();
//                            var m = d.getMonth();
//                            var y = d.getFullYear();
//                            var current = (new Date(y, m, n)).valueOf();
//
//                            var today_date = new Date();
//                            var upto_date = (today_date.setDate(today_date.getDate() + 3)).valueOf();
//
//                            angular.forEach($dates, function (date, key) {
//                                if (current > date.localDateValue() || upto_date < date.localDateValue()) {
//                                    $dates[key].selectable = false;
//                                }
//                            });
//                        }
//                    }, function (x) {
//                        $scope.errorData = 'Error while authorize the user';
//                    });
        }
    }]);