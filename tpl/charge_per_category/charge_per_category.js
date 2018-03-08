app.controller('ChargePerCategoriesController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$modal', 'editableOptions', 'editableThemes', '$anchorScroll', function ($rootScope, $scope, $timeout, $http, $state, $modal, editableOptions, editableThemes, $anchorScroll) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        //Index Page
        $scope.loadChargePerCategoriesList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/chargepercategory')
                    .success(function (charge_per_categories) {
                        $scope.isLoading = false;
                        $scope.rowCollection = charge_per_categories;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                        $scope.form_filter = null;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading charges!";
                    });

            $rootScope.commonService.GetPatientCateogryList('1', false, function (response) {
                $scope.patient_categories = [];
                angular.forEach(response.patientcategoryList, function (value) {
                    value.amount = '';
                    $scope.patient_categories.push(value);
                });
            });
            $rootScope.commonService.GetRoomTypeList('', '1', false, function (response) {
                $scope.room_types = [];
                angular.forEach(response.roomtypeList, function (value) {
                    value.amount = '';
                    $scope.room_types.push(value);
                });
            });

            $http.get($rootScope.IRISOrgServiceUrl + '/chargepersubcategory/getcustomlist').success(function (data) {
                $scope.allSubCategories = data;
            });
        };
        
        $scope.$watch('form_filter', function (newValue, oldValue) {
            if (typeof newValue != 'undefined' && newValue != '' && newValue != null) {
                var footableFilter = $('table').data('footable-filter');
                footableFilter.clearFilter();
                footableFilter.filter(newValue);
            }

            if (newValue == '') {
                $scope.loadChargePerCategoriesList();
            }
        }, true);
        
        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        //For Form
        $scope.initForm = function () {
            $scope.loadbar('show');

            $rootScope.commonService.GetRoomChargeCategoryList('', '1', false, function (response) {
                $scope.categories = response.categoryList;

//                $scope.categories = $.grep($scope.categories, function (e) {
//                    return e.charge_cat_code != 'ALC';
//                });

                $rootScope.commonService.GetRoomChargeSubCategoryList('', '1', false, '', function (response) {
                    $scope.sub_categories = response.subcategoryList;

                    //Load Doctor List
                    $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                        var insert_cat = {
                            charge_cat_id: '-1',
                            charge_cat_name: 'Professional Charges',
                        };
                        $scope.categories.push(insert_cat);
                        angular.forEach(response.doctorsList, function (doctor) {
                            var insert_subcat = {
                                charge_subcat_id: doctor.user_id,
                                charge_cat_id: '-1',
                                charge_subcat_name: doctor.name,
                            };
                            $scope.sub_categories.push(insert_subcat);
                        });

                        $rootScope.commonService.GetPatientCateogryList('1', false, function (response) {
                            $scope.patient_categories = [];
                            angular.forEach(response.patientcategoryList, function (value) {
                                value.amount = '';
                                $scope.patient_categories.push(value);
                            });

                            $rootScope.commonService.GetRoomTypeList('', '1', false, function (response) {
                                $scope.room_types = [];
                                angular.forEach(response.roomtypeList, function (value) {
                                    value.amount = '';
                                    $scope.room_types.push(value);
                                });
                                $scope.loadbar('hide');
                            });
                        });

                    });
                });

            });


        }

        $scope.updateSubCateogry = function () {
            $scope.availableSubcategories = [];

            _that = this;
            angular.forEach($scope.sub_categories, function (value) {
                if (value.charge_cat_id == _that.data.charge_cat_id) {
                    $scope.availableSubcategories.push(value);
                }
            });
        }

        //Save Both Add Data
        $scope.saveForm = function (mode) {
            if ($scope.chargeForm.$valid) {
                _that = this;

                $scope.errorData = "";
                $scope.msg.successMessage = "";

                if (mode == 'add') {
                    post_url = $rootScope.IRISOrgServiceUrl + '/chargepercategories';
                    method = 'POST';
                    succ_msg = 'Charges for Category saved successfully';
                } else {
                    post_url = $rootScope.IRISOrgServiceUrl + '/chargepercategories/' + _that.data.charge_id;
                    method = 'PUT';
                    succ_msg = 'Charges for Category updated successfully';
                }

                if (_that.data.charge_cat_id == -1) {
                    _that.data.charge_cat_type = 'P';
                } else {
                    _that.data.charge_cat_type = 'C';
                }

                $scope.loadbar('show');

                $http({
                    method: method,
                    url: post_url,
                    data: _that.data,
                }).success(
                        function (response) {
                            form_datas = [];
                            angular.forEach($scope.patient_categories, function (value) {
                                if (typeof value.amount != 'undefined' && value.amount != '') {
                                    form_data = {};
                                    form_data.charge_id = response.charge_id;
                                    form_data.charge_type = 'OP';
                                    form_data.charge_link_id = value.patient_cat_id;
                                    form_data.charge_amount = value.amount;

                                    form_datas.push(form_data);
                                }
                            });

                            angular.forEach($scope.room_types, function (value) {
                                if (typeof value.amount !== 'undefined' && value.amount != '') {
                                    form_data = {};
                                    form_data.charge_id = response.charge_id;
                                    form_data.charge_type = 'IP';
                                    form_data.charge_link_id = value.room_type_id;
                                    form_data.charge_amount = value.amount;

                                    form_datas.push(form_data);
                                }
                            });

                            //Save all Subcategories
                            $http.post($rootScope.IRISOrgServiceUrl + '/chargepersubcategory/saveallchargecategory', {'subcategories': form_datas})
                                    .success(function (response) {

                                        $anchorScroll();
                                        if (response.success == true) {
                                            $scope.loadbar('hide');
                                            $scope.msg.successMessage = succ_msg;
                                            $scope.data = {};
                                            $timeout(function () {
                                                $state.go('configuration.chargePerCategory');
                                            }, 1000)
                                        } else {
                                            $scope.loadbar('hide');
                                            $scope.errorData = 'Failed to save subcategories';
                                        }
                                    })
                                    .error(function (data, status) {
                                        $scope.loadbar('hide');
                                        if (status == 422)
                                            $scope.errorData = $scope.errorSummary(data);
                                        else
                                            $scope.errorData = data.message;
                                        return false;
                                    });

//                            angular.forEach(form_datas, function (form_data) {
//                                $http.post($rootScope.IRISOrgServiceUrl + '/chargepersubcategories', form_data)
//                                        .error(function (data, status) {
//                                            $scope.loadbar('hide');
//                                            if (status == 422)
//                                                $scope.errorData = $scope.errorSummary(data);
//                                            else
//                                                $scope.errorData = data.message;
//                                            return false;
//                                        });
//                            });

                        }
                ).error(function (data, status) {
                    $anchorScroll();
                    $scope.loadbar('hide');
                    if (status == 422)
                        $scope.errorData = $scope.errorSummary(data);
                    else
                        $scope.errorData = data.message;
                });
                return false;
            } else {
                $scope.errorData = 'Please fill the required fields';
            }
        };

        $scope.updateAmount = function (data, id, charge_id, charge_type, charge_link_id) {
            $scope.errorData = $scope.msg.successMessage = '';
            if (typeof data.charge_amount != 'undefined') {
                if (typeof id != 'undefined') {
                    post_method = 'PUT';
                    post_url = $rootScope.IRISOrgServiceUrl + '/chargepersubcategories/' + id;
                    succ_msg = 'Charges for Category Updated successfully';
                } else {
                    post_method = 'POST';
                    post_url = $rootScope.IRISOrgServiceUrl + '/chargepersubcategories';
                    angular.extend(data, {charge_id: charge_id, charge_type: charge_type, charge_link_id: charge_link_id});
                    succ_msg = 'Charges for Category saved successfully';
                }
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
        };

        $scope.updateDefaultAmount = function (data, id) {
            $scope.errorData = $scope.msg.successMessage = '';
            if (typeof data.charge_default != 'undefined') {
                $http({
                    method: 'PUT',
                    url: $rootScope.IRISOrgServiceUrl + '/chargepercategories/' + id,
                    data: data,
                }).success(
                        function (response) {
                            $scope.loadbar('hide');
                            $scope.msg.successMessage = 'Default Charge Updated successfully';
                        }
                ).error(function (data, status) {
                    $scope.loadbar('hide');
                    if (status == 422)
                        $scope.errorData = $scope.errorSummary(data);
                    else
                        $scope.errorData = data.message;
                });
            }
        };

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/chargepercategories/" + $state.params.id,
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
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                $scope.loadbar('show');
                var index = $scope.displayedCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/charge/remove",
                        method: "POST",
                        data: {id: row.charge_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadChargePerCategoriesList();
                                }
                                else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };

        //Update Modal
//        $scope.open = function (size) {
//            var modalInstance = $modal.open({
//                templateUrl: 'myModalContent.html',
//                controller: 'ModalInstanceCtrl',
//                size: size,
////                resolve: {
////                    items: function () {
////                        return 'test';
////                    }
////                }
//            });
//        };

    }]);

//app.controller('ModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
//
//        $scope.ok = function () {
//            $modalInstance.close($scope.selected.item);
//        };
//
//        $scope.cancel = function () {
//            $modalInstance.dismiss('cancel');
//        };
//    }]); 
