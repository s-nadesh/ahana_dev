app.controller('PatientAlertsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$filter', '$anchorScroll', 'modalService', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $filter, $anchorScroll, modalService) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        $scope.checkName = function (data) {
            if (!data) {
                return "Value should not empty";
            }
        };

        $scope.initTab = function () {
            type = ($state.params.type) ? $state.params.type : 'alert';
            $scope.changeTab(type);
        }
        $scope.changeTab = function (type) {
            $('.op-btn-group button, .op-btn-group a').removeClass('active');
            $('.op-btn-group button.' + type + '-tab').addClass('active');
            $scope.current_tab = type;
            $scope.errorData = "";
            $scope.msg.successMessage = "";
        }

        selected = [];
        $scope.showStatus = function (row) {
            selected = [];
            if (row && row.alert_type) {
                selected = $filter('filter')($scope.alerts, {alert_name: row.alert_type});
            }
            return selected.length > 0 ? selected[0].alert_name : 'Not set';
        };

        //Index Page
        $scope.loadPatientAlertsList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/patientalert/getpatientalerts?patient_id=' + $state.params.id)
                    .success(function (alerts) {
                        $scope.isLoading = false;
                        $scope.rowCollection = alerts.result;
                        $scope.displayedCollection = [].concat($scope.rowCollection);

                        if ($scope.rowCollection.length == 0) {
                            $scope.$emit('patient_alert', {hasalert: false, alert: ''});
                        } else {
                            active = $filter('filter')($scope.rowCollection, {status: '1'}, true);
                            if (active.length > 0) {
                                $scope.$emit('patient_alert', {hasalert: true, alert: active[0].alert_description});
                            } else {
                                $scope.$emit('patient_alert', {hasalert: false, alert: ''});
                            }
                        }
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patientalert!";
                    });
        };

        //For Form
        $scope.initForm = function () {
            $rootScope.commonService.GetAlertList('', '1', false, function (response) {
                $scope.alerts = response.alertList;
            });
        }

        $scope.updateAlert = function ($data, pat_alert_id) {
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.loadbar('show');
            $http({
                method: 'PUT',
                url: $rootScope.IRISOrgServiceUrl + '/patientalerts/' + pat_alert_id,
                data: $data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = response.alert_description + ' (Alert) updated successfully';
                        $timeout(function () {
                            $scope.loadPatientAlertsList();
                            $anchorScroll();
//                            $state.go('patient.alert', {id: $state.params.id});
                        }, 1000)
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientalerts';
                method = 'POST';
                succ_msg = 'Alert saved successfully';

                angular.extend(_that.data, {patient_id: $scope.patientObj.patient_id});
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientalerts/' + _that.data.pat_alert_id;
                method = 'PUT';
                succ_msg = 'Alert updated successfully';
            }

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
                        $scope.data.formtype = 'add';
                        $scope.$emit('patient_alert', {hasalert: true, alert: response.alert_description});
                        $timeout(function () {
                            $scope.loadPatientAlertsList();
                            $anchorScroll();
//                            $state.go('patient.alert', {id: $state.params.id});
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
                url: $rootScope.IRISOrgServiceUrl + "/patientalerts/" + $state.params.alert_id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
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
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Alert?',
                bodyText: 'Are you sure you want to delete this alert?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loadbar('show');
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + "/patientalert/remove",
                    data: {id: row.pat_alert_id},
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadPatientAlertsList();
                                $scope.msg.successMessage = 'Alert deleted successfully';
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                );
            });
        };

        //Check encounter_id
        $scope.isPatientHaveActiveEncounter = function (callback) {
            $http.post($rootScope.IRISOrgServiceUrl + '/encounter/patienthaveactiveencounter', {patient_id: $state.params.id})
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }
        $scope.initAllergiesForm = function () {
            $scope.allergies_data = {};
            $scope.allergies_data.formtype = 'add';
            $scope.initCanCreateNote();
            $scope.loadPatientAllergiesList();
            $scope.allergies_data.status = '1';
        }

        $scope.initCanCreateNote = function () {
            $scope.isPatientHaveActiveEncounter(function (response) {
                if (response.success == false) {
                    alert("Sorry, you can't create a Allergies");
                } else {
                    if (!$scope.encounter)
                        $scope.encounter = response.model;

                    $scope.all_encounters = response.encounters;
                    if (!$scope.allergies_data.encounter_id)
                        $scope.allergies_data.encounter_id = $scope.encounter.encounter_id;
                }
            });
        }
        $scope.allergiesSave = function (mode) {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            _that = this;

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientallergies';
                method = 'POST';
                succ_msg = 'Allergies saved successfully';
                angular.extend(_that.allergies_data, {patient_id: $scope.patientObj.patient_id});
            }
            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.allergies_data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = succ_msg;
                        $scope.allergies_data.notes = '';
                        $scope.allergies_data.formtype = 'add';
                        $scope.$emit('patient_allergies', {hasallergies: true, alert: response.notes});
                        $timeout(function () {
                            $scope.loadPatientAllergiesList();
                            $anchorScroll();
                        }, 1000)

                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.loadPatientAllergiesList = function () {
            $http.get($rootScope.IRISOrgServiceUrl + '/patientallergies/getpatientallergie?patient_id=' + $state.params.id)
                    .success(function (list) {
                        $scope.isLoading = false;
                        $scope.allergiesCollection = list.result;
                        if ($scope.allergiesCollection.length == 0) {
                            $scope.$emit('patient_allergies', {hasallergies: false, alert: ''});
                        } else {
                            active = $filter('filter')($scope.allergiesCollection, {status: '1'}, true);
                            if (active.length > 0) {
                                $scope.$emit('patient_allergies', {hasallergies: true, alert: active[0].notes});
                            } else {
                                $scope.$emit('patient_allergies', {hasallergies: false, alert: ''});
                            }
                        }
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patientalert!";
                    });
        }

        $scope.updateAllergies = function ($data, pat_allergies_id) {
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.loadbar('show');
            $http({
                method: 'PUT',
                url: $rootScope.IRISOrgServiceUrl + '/patientallergies/' + pat_allergies_id,
                data: $data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Allergies updated successfully';
                        $timeout(function () {
                            $scope.loadPatientAllergiesList();
                            $anchorScroll();
                        }, 1000)
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.removeAllergies = function (row) {
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Allergies?',
                bodyText: 'Are you sure you want to delete this Allergy?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/patientallergies/remove",
                    method: "POST",
                    data: {id: row.pat_allergies_id}
                }).then(
                        function (response) {
                            $scope.errorData = "";
                            $scope.msg.successMessage = "";
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadPatientAllergiesList();
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                )
            });

        }

    }]);