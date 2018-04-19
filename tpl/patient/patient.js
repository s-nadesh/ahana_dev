app.controller('PatientController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', 'fileUpload', '$modal', '$log', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, fileUpload, $modal, $log) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.orgData = {};

        $scope.changeMode = function (mode) {
            $scope.mode = mode;
//            if(mode == 'update'){
//                $scope.data = {};
//                $scope.data.PatPatient = $scope.orgData;
//                $scope.data.PatPatientAddress = $scope.orgData.address;
//            }else{
//                $scope.setViewData($scope.orgData);
//            }
        }

        $scope.loadView = function () {
            $timeout(function () {
                $scope.getPatientdetail();
            }, 3000);
        }

        $scope.getPatientdetail = function () {
            $scope.mode = 'view';
            if (typeof $state.params.id != 'undefined') {
                $http.post($rootScope.IRISOrgServiceUrl + '/patient/getpatientbyguid', {guid: $state.params.id})
                        .success(function (patient) {
                            if (patient.success == false) {
                                $state.go('myworks.dashboard');
                                $scope.msg.errorMessage = "An Error has occured while loading patient!";
                            } else {
                                $scope.orgData = patient;
                                $scope.setViewData(patient);
                                $scope.setFormData(patient);
                            }
                        })
                        .error(function () {
                            $scope.msg.errorMessage = "An Error has occured while loading patient!";
                        });
            }

        }

        $scope.setViewData = function (patient) {
            $scope.view_data = {};
            $scope.view_data = patient;
            $rootScope.commonService.GetLabelFromValue(patient.patient_bill_type, 'GetPatientBillingList', function (response) {
                $scope.view_data.bill_type = response;
            });

            $rootScope.commonService.GetLabelFromValue(patient.patient_reg_mode, 'GetPatientRegisterModelList', function (response) {
                $scope.view_data.reg_mode = response;
            });

            $rootScope.commonService.GetLabelFromValue(patient.patient_marital_status, 'GetMaritalStatus', function (response) {
                $scope.view_data.marital_status = response;
            });

            $rootScope.commonService.GetLabelFromValue(patient.patient_blood_group, 'GetBloodList', function (response) {
                $scope.view_data.blood_group = response;
            });

            $rootScope.commonService.GetLabelFromValue(patient.patient_care_taker, 'GetCareTaker', function (response) {
                $scope.view_data.care_taker = response;
            });
        }

        $scope.setFormData = function (patient) {
            $scope.patdata = {};
            $scope.patdata.PatPatient = patient;
            $scope.patdata.PatPatientAddress = patient.address;
            $scope.patdata.is_permanent = false;
            if (patient.patient_dob)
                $scope.patdata.PatPatient.patient_dob = moment(patient.patient_dob, 'YYYY-MM-DD').format('DD/MM/YYYY');

            if ((patient.address != null) &&
                    (patient.address.addr_current_address == patient.address.addr_perm_address) &&
                    (patient.address.addr_country_id == patient.address.addr_perm_country_id) &&
                    (patient.address.addr_state_id == patient.address.addr_perm_state_id) &&
                    (patient.address.addr_city_id == patient.address.addr_perm_city_id) &&
                    (patient.address.addr_zip == patient.address.addr_perm_zip)) {
                $scope.patdata.is_permanent = true;
            }
        }

        $scope.$watch('patientObj.patient_id', function (newValue, oldValue) {
            if (newValue != '') {
                $scope.data = {};
                $scope.data.PatPatient = $scope.patientObj;
                $scope.data.PatPatientAddress = $scope.patientObj.address;

                $scope.initForm();
            }
        }, true);

        $scope.initForm = function () {

            $rootScope.commonService.GetGenderList(function (response) {
                $scope.genders = response;
            });

            $rootScope.commonService.GetPatientBillingList(function (response) {
                $scope.bill_types = response;
            });

            $rootScope.commonService.GetCountryList(function (response) {
                $scope.countries = response.countryList;
            });

            $rootScope.commonService.GetStateList(function (response) {
                $scope.states = response.stateList;
                $scope.updateState2();
                $scope.updateState();
            });

            $rootScope.commonService.GetCityList(function (response) {
                $scope.cities = response.cityList;
                $scope.updateCity2();
                $scope.updateCity();
            });

            $rootScope.commonService.GetPatientRegisterModelList(function (response) {
                $scope.registerModes = response;
            });

            $rootScope.commonService.GetTitleCodes(function (response) {
                $scope.titleCodes = response;
            });

            $rootScope.commonService.GetMaritalStatus(function (response) {
                $scope.maritalStatuses = response;
            });

            $rootScope.commonService.GetPatientCateogryList('1', false, function (response) {
                $scope.categories = response.patientcategoryList;
            });

            $rootScope.commonService.GetBloodList(function (response) {
                $scope.bloods = response;
            });

            $rootScope.commonService.GetCareTaker(function (response) {
                $scope.careTakers = response;
            });
        }

        $scope.updateState2 = function () {
            $scope.availableStates2 = [];
            $scope.availableCities2 = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if ((typeof _that.patdata !== 'undefined' && _that.patdata.PatPatientAddress != null) || (typeof _that.data !== 'undefined' && _that.data.PatPatientAddress != null)) {
                    if (typeof _that.patdata !== 'undefined' && _that.patdata.PatPatientAddress != null) {
                        cId = _that.patdata.PatPatientAddress.addr_country_id;
                    } else if (typeof _that.data !== 'undefined' && _that.data.PatPatientAddress != null) {
                        cId = _that.data.PatPatientAddress.addr_country_id;
                    }
                    if (value.countryId == cId) {
                        var obj = {
                            value: value.value,
                            label: value.label
                        };
                        $scope.availableStates2.push(obj);
                    }
                }
            });
        }

        $scope.updateCity2 = function () {
            $scope.availableCities2 = [];

            _that = this;
            angular.forEach($scope.cities, function (value) {
                if ((typeof _that.patdata !== 'undefined' && _that.patdata.PatPatientAddress != null) || (typeof _that.data !== 'undefined' && _that.data.PatPatientAddress != null)) {
                    if (typeof _that.patdata !== 'undefined' && _that.patdata.PatPatientAddress != null) {
                        sId = _that.patdata.PatPatientAddress.addr_state_id;
                    } else if (typeof _that.data !== 'undefined' && _that.data.PatPatientAddress != null) {
                        sId = _that.data.PatPatientAddress.addr_state_id;
                    }
                    if (value.stateId == sId) {
                        var obj = {
                            value: value.value,
                            label: value.label
                        };
                        $scope.availableCities2.push(obj);
                    }
                }
            });
        }

        $scope.updateState = function () {
            $scope.availableStates = [];
            $scope.availableCities = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if ((typeof _that.patdata !== 'undefined' && _that.patdata.PatPatientAddress != null) || (typeof _that.data !== 'undefined' && _that.data.PatPatientAddress != null)) {
                    if (typeof _that.patdata !== 'undefined' && _that.patdata.PatPatientAddress != null) {
                        cId = _that.patdata.PatPatientAddress.addr_perm_country_id;
                    } else if (typeof _that.data !== 'undefined' && _that.data.PatPatientAddress != null) {
                        cId = _that.data.PatPatientAddress.addr_perm_country_id;
                    }
                    if (value.countryId == cId) {
                        var obj = {
                            value: value.value,
                            label: value.label
                        };
                        $scope.availableStates.push(obj);
                    }
                }
            });
        }

        $scope.updateCity = function () {
            $scope.availableCities = [];

            _that = this;
            angular.forEach($scope.cities, function (value) {
                if ((typeof _that.patdata !== 'undefined' && _that.patdata.PatPatientAddress != null) || (typeof _that.data !== 'undefined' && _that.data.PatPatientAddress != null)) {
                    if (typeof _that.patdata !== 'undefined' && _that.patdata.PatPatientAddress != null) {
                        sId = _that.patdata.PatPatientAddress.addr_perm_state_id;
                    } else if (typeof _that.data !== 'undefined' && _that.data.PatPatientAddress != null) {
                        sId = _that.data.PatPatientAddress.addr_perm_state_id;
                    }
                    if (value.stateId == sId) {
                        var obj = {
                            value: value.value,
                            label: value.label
                        };
                        $scope.availableCities.push(obj);
                    }
                }
            });
        }

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.maxDate = new Date();


        $scope.setDateEmpty = function () {
            $scope.patdata.PatPatient.patient_dob = '';
        }

        $scope.setAgeEmpty = function () {
            $scope.patdata.PatPatient.patient_age_year = '';
            $scope.patdata.PatPatient.patient_age_month = '';
        }

        $scope.getDOB = function () {
            var newValue = this.patdata.PatPatient.patient_age_year;
            var newValue2 = this.patdata.PatPatient.patient_age_month;
            if (!isNaN(newValue) || !isNaN(newValue2)) {
                if (!newValue)
                    var newValue = 0;
                if (!newValue2)
                    var newValue2 = 0;
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patient/getdatefromage',
                    data: {'age': newValue, 'month': newValue2},
                }).success(
                        function (response) {
                            var date_of_birth = moment(response.dob, 'YYYY-MM-DD').format('DD/MM/YYYY');
                            $scope.patdata.PatPatient.patient_dob = date_of_birth;
                        }
                );
            }
        }

        $scope.getAge = function () {
            var newValue = this.patdata.PatPatient.patient_dob;
            if (newValue != '') {
                var date_of_birth = moment(newValue, 'DD/MM/YYYY').format('YYYY-MM-DD');
                if (date_of_birth != "Invalid date") {
                    $http({
                        method: 'POST',
                        url: $rootScope.IRISOrgServiceUrl + '/patient/getagefromdate',
                        data: {'date': date_of_birth},
                    }).success(
                            function (response) {
                                $scope.patdata.PatPatient.patient_age_year = response.age;
                                $scope.patdata.PatPatient.patient_age_month = response.month;
                            }
                    );
                }
            }
        }

        $scope.CopyAddress = function () {
            if ($scope.patdata.is_permanent) {
                $scope.patdata.PatPatientAddress.addr_perm_address = $scope.patdata.PatPatientAddress.addr_current_address;
                $scope.patdata.PatPatientAddress.addr_perm_country_id = $scope.patdata.PatPatientAddress.addr_country_id;
                $scope.patdata.PatPatientAddress.addr_perm_state_id = $scope.patdata.PatPatientAddress.addr_state_id;
                $scope.patdata.PatPatientAddress.addr_perm_city_id = $scope.patdata.PatPatientAddress.addr_city_id;
                $scope.patdata.PatPatientAddress.addr_perm_zip = $scope.patdata.PatPatientAddress.addr_zip;
                $scope.updateState();
                $scope.updateCity();
            } else {
                $scope.patdata.PatPatientAddress.addr_perm_address = '';
                $scope.patdata.PatPatientAddress.addr_perm_country_id = '';
                $scope.patdata.PatPatientAddress.addr_perm_state_id = '';
                $scope.patdata.PatPatientAddress.addr_perm_city_id = '';
                $scope.patdata.PatPatientAddress.addr_perm_zip = '';
                $scope.updateState();
                $scope.updateCity();
            }
        }

        //Save Both Add Data
        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/patient/registration';
            method = 'POST';
            succ_msg = 'Patient saved successfully';

            _that.data.PatPatient.patient_dob = moment(_that.data.PatPatient.patient_dob).format('YYYY-MM-DD');

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.patdata,
            }).success(
                    function (response) {
                        $anchorScroll();
                        $scope.loadbar('hide');
                        if (response.success == true) {
                            $scope.msg.successMessage = succ_msg;
                            $scope.$emit('patient_obj', response.patient);
                            $scope.orgData = response;
                            $rootScope.commonService.GetLabelFromValue(response.patient.patient_gender, 'GetGenderList', function (resp) {
                                $scope.app.patientDetail.patientSex = resp;
                            });

                            $scope.setViewData(response.patient);
                            $scope.setFormData(response.patient);

                            $timeout(function () {
                                $scope.mode = 'view';
                                $scope.msg.successMessage = succ_msg;
//                                $state.go('patient.view', {id: response.patient.patient_guid});
                            }, 2000)
                        } else {
                            $scope.errorData = response.message;
                        }

                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.printLabel = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.patient_label.html',
                controller: 'PatientLabelController',
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
    }]);
