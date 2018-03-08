app.controller('PatientRegisterController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', '$anchorScroll', '$modal', '$log', '$q', function ($rootScope, $scope, $timeout, $http, $state, $filter, $anchorScroll, $modal, $log, $q) {

        $scope.app.settings.patientTopBar = false;
        $scope.app.settings.patientSideMenu = false;
        $scope.app.settings.patientContentClass = 'app-content app-content3';
        $scope.app.settings.patientFooterClass = 'app-footer app-footer3';

        $scope.$on('register_patient_img_url', function (event, img) {
            $scope.data.PatPatient.patient_img_url = img;
        });

        $scope.show_loader = false;

        var canceler;
        //Index Page
        $scope.loadPatientsList = function () {
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/patient')
                    .success(function (patients) {
                        $scope.rowCollection = patients;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patients!";
                    });
        };

        $scope.initForm = function () {
            $scope.data = {};
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $rootScope.commonService.GetFloorList('', '1', false, function (response) {
                $scope.floors = response.floorList;
            });

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
            });

            $rootScope.commonService.GetCityList(function (response) {
                $scope.cities = response.cityList;
            });

            $rootScope.commonService.GetPatientRegisterModelList(function (response) {
                $scope.registerModes = response;
            });

            $rootScope.commonService.GetTitleCodes(function (response) {
                $scope.titleCodes = response;
            });

            $rootScope.commonService.GetMaritalStatus(function (response) {
                $scope.maritalStatus = response;
            });

            $rootScope.commonService.GetBloodList(function (response) {
                $scope.bloods = response;
            });

            $rootScope.commonService.GetPatientCateogryList('1', false, function (response) {
                $scope.categories = response.patientcategoryList;
                var result = $filter('filter')($scope.categories, {patient_short_code: 'SD'});
                if (result.length > 0)
                    $scope.data.PatPatient.patient_category_id = result[0].patient_cat_id;
            });



            $rootScope.commonService.GetCareTaker(function (response) {
                $scope.careTakers = response;
            });
        }

        $scope.back = function () {
            window.history.back();
        }

        $scope.updateState2 = function () {
            $scope.availableStates2 = [];
            $scope.availableCities2 = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if (value.countryId == _that.data.PatPatientAddress.addr_country_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableStates2.push(obj);
                }
            });
        }

        $scope.updateCity2 = function () {
            $scope.availableCities2 = [];

            _that = this;
            angular.forEach($scope.cities, function (value) {
                if (value.stateId == _that.data.PatPatientAddress.addr_state_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableCities2.push(obj);
                }
            });
        }

        $scope.updateState = function () {
            $scope.availableStates = [];
            $scope.availableCities = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if (_that.data.PatPatientAddress != null) {
                    if (value.countryId == _that.data.PatPatientAddress.addr_perm_country_id) {
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
                if (_that.data.PatPatientAddress != null) {
                    if (value.stateId == _that.data.PatPatientAddress.addr_perm_state_id) {
                        var obj = {
                            value: value.value,
                            label: value.label
                        };
                        $scope.availableCities.push(obj);
                    }
                }
            });
        }

        $scope.CopyAddress = function () {
            if ($scope.data.is_permanent) {
                $scope.data.PatPatientAddress.addr_perm_address = $scope.data.PatPatientAddress.addr_current_address;
                $scope.data.PatPatientAddress.addr_perm_country_id = $scope.data.PatPatientAddress.addr_country_id;
                $scope.data.PatPatientAddress.addr_perm_state_id = $scope.data.PatPatientAddress.addr_state_id;
                $scope.data.PatPatientAddress.addr_perm_city_id = $scope.data.PatPatientAddress.addr_city_id;
                $scope.data.PatPatientAddress.addr_perm_zip = $scope.data.PatPatientAddress.addr_zip;
                $scope.updateState();
                $scope.updateCity();
            }
        }

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.maxDate = new Date();

//        $scope.disabled = function (date, mode) {
//            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
//        };

        var changeTimer = false;

        $scope.$watch('data.PatPatient.patient_firstname', function (newValue, oldValue) {
            $scope.post_search(newValue);
        }, true);

//        $scope.$watch('data.PatPatient.patient_lastname', function (newValue, oldValue) {
//            $scope.post_search(newValue);
//        }, true);

        $scope.$watch('data.PatPatient.patient_mobile', function (newValue, oldValue) {
            $scope.post_search(newValue);
        }, true);

        $scope.$watch('data.is_advance', function (newValue, oldValue) {
            if (newValue) {
                $('.search-patientcont-div').css('max-height', '1352px');
            } else {
                $('.search-patientcont-div').css('max-height', '508px');
            }
        }, true);

        $scope.post_search = function (newValue) {
            if (newValue != '') {
                if (canceler)
                    canceler.resolve();
                canceler = $q.defer();

                if (changeTimer !== false)
                    clearTimeout(changeTimer);

                $scope.show_loader = true;

                changeTimer = setTimeout(function () {
                    $http({
                        method: 'POST',
                        url: $rootScope.IRISOrgServiceUrl + '/patient/search?addtfields=search',
                        timeout: canceler.promise,
                        data: {'search': newValue},
                    }).success(
                            function (response) {
                                $scope.matchings = response.patients;
                                $scope.show_loader = false;
                            }
                    );
                    changeTimer = false;
                }, 300);
            }
        }

        $scope.setDateEmpty = function () {
            $scope.data.PatPatient.patient_dob = '';
        }

        $scope.setAgeEmpty = function () {
            $scope.data.PatPatient.patient_age = '';
            $scope.data.PatPatient.patient_age_month = '';
        }

        $scope.getDOB = function () {
            var newValue = this.data.PatPatient.patient_age;
            var newValue2 = this.data.PatPatient.patient_age_month;

            if (!isNaN(newValue) && !isNaN(newValue2)) {
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patient/getdatefromage',
                    data: {'age': newValue, 'month': newValue2},
                }).success(
                        function (response) {
                            var date_of_birth = moment(response.dob, 'YYYY-MM-DD').format('DD/MM/YYYY');
                            $scope.data.PatPatient.patient_dob = date_of_birth;
                        }
                );
            }
        }

        $scope.getAge = function () {
            var newValue = this.data.PatPatient.patient_dob;
            if (newValue != '') {
                var date_of_birth = moment(newValue, 'DD/MM/YYYY').format('YYYY-MM-DD');
                if (date_of_birth != "Invalid date") {
                    $http({
                        method: 'POST',
                        url: $rootScope.IRISOrgServiceUrl + '/patient/getagefromdate',
                        data: {'date': date_of_birth},
                    }).success(
                            function (response) {
                                $scope.data.PatPatient.patient_age = response.age;
                                $scope.data.PatPatient.patient_age_month = response.month;
                            }
                    );
                }

            }
        }

        //Save Both Add Data
        $scope.saveForm = function (mode) {
            _that = this;
            reg_mode = _that.data.PatPatient.patient_reg_mode;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/patient/registration';
            method = 'POST';
            succ_msg = 'Patient saved successfully';

            if (_that.data.PatPatient.patient_dob != '' && typeof _that.data.PatPatient.patient_dob != 'undefined') {
                _that.data.PatPatient.patient_dob = _that.data.PatPatient.patient_dob;
            }

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $anchorScroll();
                        $scope.loadbar('hide');
                        if (response.success == true) {
                            $scope.msg.successMessage = succ_msg;
                            var patient_guid = response.patient_guid;
                            $timeout(function () {
                                if (reg_mode == "IP") {
                                    $state.go('patient.admission', {id: patient_guid});
                                } else if (reg_mode == "OP") {
                                    $state.go('patient.appointment', {id: patient_guid});
                                } else {
                                    $state.go('patient.view', {id: patient_guid});
                                }
                            }, 1000);
                        } else {
                            $scope.errorData = response.message;
                        }

                    }
            ).error(function (data, status) {
                $anchorScroll();
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
                url: $rootScope.IRISOrgServiceUrl + "/patients/" + $state.params.id,
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
            var conf = confirm('Are you sure to delete ? \nNote: All the Rooms under this patient will also be deleted !!!');
            if (conf) {
                $scope.loadbar('show');
                var index = $scope.displayedCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/patient/remove",
                        method: "POST",
                        data: {id: row.patient_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadPatientsList();
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };

        $scope.openModal = function (size, ctrlr, tmpl, update_col) {
            if (typeof $scope.data.PatPatientAddress == 'undefined') {
                $scope.data.PatPatientAddress = {};
            }

            var modalInstance = $modal.open({
                templateUrl: tmpl,
                controller: ctrlr,
                size: size,
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                    column: function () {
                        return update_col;
                    },
                    country_id: function () {
                        return $scope.data.PatPatientAddress.addr_country_id;
                    },
                    state_id: function () {
                        return $scope.data.PatPatientAddress.addr_state_id;
                    },
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.afterCountryAdded = function (country_id) {
            if (typeof $scope.data.PatPatientAddress == 'undefined') {
                $scope.data.PatPatientAddress = {};
            }
            $scope.data.PatPatientAddress.addr_country_id = country_id;
            $scope.updateState2();
        }

        $scope.afterStateAdded = function (state_id) {
            if (typeof $scope.data.PatPatientAddress == 'undefined') {
                $scope.data.PatPatientAddress = {};
            }
            $scope.data.PatPatientAddress.addr_state_id = state_id;
            $scope.updateState2();
        }

        $scope.afterCityAdded = function (city_id) {
            if (typeof $scope.data.PatPatientAddress == 'undefined') {
                $scope.data.PatPatientAddress = {};
            }
            $scope.data.PatPatientAddress.addr_city_id = city_id;
            $scope.updateCity2();
        }
    }]);

app.filter('highlight', function ($sce) {
    return function (text, phrase) {
        if (phrase)
            text = text.replace(new RegExp('(' + phrase + ')', 'gi'),
                    '<span class="highlighted">$1</span>')

        return $sce.trustAsHtml(text)
    }
});
;