app.controller('RoomChargeCategoriesController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$anchorScroll', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $anchorScroll) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        //Index Page
        $scope.loadRoomChargeCategoriesList = function () {
            $scope.isLoading = true;
            $scope.rowCollection = [];

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/roomchargecategories/getroomchargelist')
                    .success(function (roomChargeCategorys) {
                        $scope.isLoading = false;

                        var prof_charge = {
                            "tenant_id": null,
                            "charge_cat_name": "Professional Charges",
                            "charge_cat_code": "PRF",
                            "charge_cat_description": "Professional Charges",
                            "subcategories": [{
                                    "charge_subcat_name": "Users who have been assigned 'Care Provider' status in user registration will be listed as the sub-categories"
                                }]
                        }
                        roomChargeCategorys.list = roomChargeCategorys.list.concat([prof_charge]);

                        $scope.rowCollection = roomChargeCategorys.list;
                        $scope.form_filter = null;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading roomChargeCategorys!";
                    });

        };

        $scope.$watch('form_filter', function (newValue, oldValue) {
            if (typeof newValue != 'undefined' && newValue != '' && newValue != null) {
                var footableFilter = $('table').data('footable-filter');
                footableFilter.clearFilter();
                footableFilter.filter(newValue);
            } 
            
            if(newValue == '') {
                $scope.loadRoomChargeCategoriesList();
            }
        }, true);

        $scope.addSubRow = function (id) {
            angular.forEach($scope.rowCollection, function (parent) {
                if (parent.charge_cat_id == id) {
                    $scope.inserted = {
                        temp_charge_cat_id: Math.random().toString(36).substring(7),
                        charge_cat_id: id,
                        charge_subcat_name: '',
                    };
                    parent.subcategories.push($scope.inserted);
                    return;
                }
            });
        };

        $scope.updateName = function (data, id, charge_cat_id, temp_charge_cat_id) {
            $scope.errorData = $scope.msg.successMessage = '';
            if (typeof data.charge_subcat_name != 'undefined') {
                if (typeof id != 'undefined') {
                    post_method = 'PUT';
                    post_url = $rootScope.IRISOrgServiceUrl + '/roomchargesubcategories/' + id;
                    succ_msg = 'Charge Category Updated successfully';
                } else {
                    post_method = 'POST';
                    post_url = $rootScope.IRISOrgServiceUrl + '/roomchargesubcategories';
                    angular.extend(data, {charge_cat_id: charge_cat_id});
                    succ_msg = 'Charge Category saved successfully';
                }
                $http({
                    method: post_method,
                    url: post_url,
                    data: data,
                }).success(
                        function (response) {
                            $scope.loadbar('hide');
                            $scope.msg.successMessage = succ_msg;

                            //Update Subcategory
                            angular.forEach($scope.rowCollection, function (parent) {
                                if (parent.charge_cat_id == charge_cat_id) {
                                    angular.forEach(parent.subcategories, function (sub) {
                                        if (typeof temp_charge_cat_id != 'undefined') {
                                            if (sub.temp_charge_cat_id == temp_charge_cat_id) {
                                                var index = parent.subcategories.indexOf(sub);
                                                parent.subcategories.splice(index, 1);
                                                parent.subcategories.push(response);
                                            }
                                        }
                                    });
                                }
                            });
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

        $scope.deleteSubRow = function (charge_cat_id, charge_subcat_id, temp_charge_cat_id) {
            //Remove Temp Row from Table
            if (typeof temp_charge_cat_id != 'undefined') {
                angular.forEach($scope.rowCollection, function (parent) {
                    if (parent.charge_cat_id == charge_cat_id) {
                        angular.forEach(parent.subcategories, function (sub) {
                            if (sub.temp_charge_cat_id == temp_charge_cat_id) {
                                var index = parent.subcategories.indexOf(sub);
                                parent.subcategories.splice(index, 1);
                            }
                        });
                    }
                });
            }
            //Remove Row from Table & DB
            if (typeof charge_subcat_id != 'undefined') {
                var conf = confirm('Are you sure to delete ?');
                if (conf) {
                    angular.forEach($scope.rowCollection, function (parent) {
                        if (parent.charge_cat_id == charge_cat_id) {
                            angular.forEach(parent.subcategories, function (sub) {
                                if (sub.charge_subcat_id == charge_subcat_id) {
                                    var index = parent.subcategories.indexOf(sub);
                                    $scope.loadbar('show');
                                    if (index !== -1) {
                                        $http({
                                            url: $rootScope.IRISOrgServiceUrl + "/roomchargesubcategory/remove",
                                            method: "POST",
                                            data: {id: charge_subcat_id}
                                        }).then(
                                                function (response) {
                                                    $scope.loadbar('hide');
                                                    if (response.data.success === true) {
                                                        parent.subcategories.splice(index, 1);
                                                        $scope.msg.successMessage = sub.charge_subcat_name + ' deleted successfully !!!';
                                                    }
                                                    else {
                                                        $scope.errorData = response.data.message;
                                                    }
//                                                    $scope.loadRoomChargeCategoriesList();
                                                }
                                        )
                                    }
                                }
                            });
                        }
                    });
                }
            }
        };
        //End
        $scope.checkInput = function (data, id) {
            if (!data) {
                return "Not empty";
            }
        };

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/roomchargecategories';
                method = 'POST';
                succ_msg = 'RoomChargeCategory saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/roomchargecategories/' + _that.data.charge_cat_id;
                method = 'PUT';
                succ_msg = 'RoomChargeCategory updated successfully';
            }

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {

                        //Save All Subcategories
                        $http({
                            method: 'POST',
                            url: $rootScope.IRISOrgServiceUrl + '/roomchargesubcategory/saveallsubcategory',
                            data: {'charge_cat_id': response.charge_cat_id, 'subcategories': $scope.subcategories},
                        }).success(
                                function (response) {
                                    if (response.success == true) {

                                        //Delete Subcategories
                                        $http({
                                            method: 'POST',
                                            url: $rootScope.IRISOrgServiceUrl + '/roomchargesubcategory/deleteallsubcategory',
                                            data: {'subcategories': $scope.deletedsubcategories},
                                        }).success(
                                                function (response) {
                                                    $anchorScroll();
                                                    if (response.success == true) {
                                                        $scope.loadbar('hide');
                                                        $scope.msg.successMessage = succ_msg;
                                                        $scope.data = {};
                                                        $timeout(function () {
                                                            $state.go('configuration.roomChargeCategory');
                                                        }, 1000)
                                                    } else {
                                                        $scope.loadbar('hide');
                                                        $scope.errorData = 'Failed to save subcategories';
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


                                    } else {
                                        $scope.loadbar('hide');
                                        $scope.errorData = 'Failed to save subcategories';
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

                        return false;
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
                url: $rootScope.IRISOrgServiceUrl + "/roomchargecategories/" + $state.params.id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;

                        //Load Subcategories
                        $http.get($rootScope.IRISOrgServiceUrl + '/roomchargesubcategory')
                                .success(function (roomChargeCategorys) {
                                    angular.forEach(roomChargeCategorys, function (sub) {
                                        if (sub.charge_cat_id == response.charge_cat_id) {
                                            $scope.inserted = {
                                                charge_subcat_id: sub.charge_subcat_id,
                                                charge_subcat_name: sub.charge_subcat_name,
                                            };
                                            $scope.subcategories.push($scope.inserted);
                                        }
                                    });
                                })
                                .error(function () {
                                    $scope.errorData = "An Error has occured while loading roomChargesubCategorys!";
                                });
                        //End
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
                var index = $scope.rowCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/roomchargecategory/remove",
                        method: "POST",
                        data: {id: row.charge_cat_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.msg.successMessage = row.charge_cat_name + ' deleted successfully !!!';
                                    $scope.rowCollection.splice(index, 1);
                                }
                                else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };

        // editable table
        $scope.subcategories = [];
        $scope.deletedsubcategories = [];

        // add Row
        $scope.addRow = function () {
            $scope.inserted = {
                charge_subcat_id: '',
                charge_subcat_name: '',
            };
            $scope.subcategories.push($scope.inserted);
        };

        // remove Row
        $scope.removeSubcat = function (index, id) {
            if (id != '')
                $scope.deletedsubcategories.push(id);
            $scope.subcategories.splice(index, 1);
        };

        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };
    }]);
