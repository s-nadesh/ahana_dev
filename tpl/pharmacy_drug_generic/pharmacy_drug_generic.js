app.controller('drugGenericController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$anchorScroll', '$filter', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $anchorScroll, $filter) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        $scope.itemsByPage = 15; // No.of records per page

        $scope.loadmoredrugGenericList = function () {
            if ($scope.isLoading)
                return;

            $scope.pageIndex++;
            $scope.isLoading = true;
            $scope.errorData = $scope.msg.successMessage = '';

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacydruggeneric/getdruggeneric?addtfields=drug_genericnames&p=' + $scope.pageIndex + '&l=' + $scope.itemsByPage)
                    .success(function (drugGenerics) {
                        $scope.isLoading = false;
                        $scope.rowCollection = $scope.rowCollection.concat(drugGenerics.generics);
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading drugGenerics!";
                    });
        };

        //Index Page
        $scope.loaddrugGenericList = function () {
            $scope.errorData = $scope.msg.successMessage = '';
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            //$scope.itemsByPage = 10; // No.of records per page
            $scope.pageIndex = 1;
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            $scope.generics = {};
            $rootScope.commonService.GetGenericList('', '1', false, false, function (response) {
                $scope.setGenericList(response);
                // Get data's from service
                $http.get($rootScope.IRISOrgServiceUrl + '/pharmacydruggeneric/getdruggeneric?addtfields=drug_genericnames&p=' + $scope.pageIndex + '&l=' + $scope.itemsByPage)
                        .success(function (drugGenerics) {
                            $scope.isLoading = false;
                            $scope.rowCollection = drugGenerics.generics;
                            $scope.displayedCollection = [].concat($scope.rowCollection);
                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured while loading drugGenerics!";
                        });
            });
        };

        // editable table
        $scope.genericnames = [];
        $scope.deletedgenericnames = [];

        $scope.showGeneric = function (generic_id) {
            var selected = $filter('filter')($scope.generics, {value: generic_id});
            return (generic_id && selected.length) ? selected[0].text : 'Not set';
        };

        //For Form
        $scope.initForm = function () {
            $scope.loadbar('show');
            $rootScope.commonService.GetDrugClassList('', '1', false, true, function (response) {
                $scope.drugs = response.drugList;

                $rootScope.commonService.GetGenericList('', '1', false, true, function (response) {
                    $scope.setGenericList(response);
                });
            });

        }

        $scope.getGenericList = function (response) {
            $rootScope.commonService.GetGenericList('', '1', false, true, function (response) {
                $scope.setGenericList(response);
            });
        }

        $scope.setGenericList = function (response) {
            $scope.generics = [];

            angular.forEach(response.genericList, function (generic) {
                $scope.generics.push({'value': generic.generic_id, 'text': generic.generic_name});
            });
        }

        $scope.addSubRow = function (id) {
            angular.forEach($scope.displayedCollection, function (parent) {
                if (parent.drug_class_id == id) {
                    $scope.inserted = {
                        temp_drug_class_id: Math.random().toString(36).substring(7),
                        drug_class_id: id,
                    };
                    parent.genericnames.push($scope.inserted);
                    return;
                }
            });
        };

        $scope.updateName = function (data, drug_class_id, key, gKey) {
            $scope.errorData = $scope.msg.successMessage = '';
            if (typeof data.generic_id != 'undefined') {

                angular.extend(data, {drug_class_id: drug_class_id, mode: 'update'});
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/pharmacydruggeneric/updatedruggeneric',
                    data: data,
                }).success(
                        function (response) {
                            $scope.loadbar('hide');
                            $anchorScroll();
                            if (response.success == true) {
                                $scope.msg.successMessage = 'Drug class assigned successfully';
                                delete $scope.displayedCollection[key].genericnames[gKey].temp_drug_class_id;
                            } else {
                                $scope.errorData = response.message;
                                $scope.displayedCollection[key].genericnames.splice(gKey, 1);
                            }
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

        $scope.deleteSubRow = function (drug_class_id, generic_id, temp_drug_class_id) {
            $scope.errorData = $scope.msg.successMessage = '';
            //Remove Temp Row from Table
            if (typeof temp_drug_class_id != 'undefined') {
                angular.forEach($scope.displayedCollection, function (parent) {
                    if (parent.drug_class_id == drug_class_id) {
                        angular.forEach(parent.genericnames, function (sub) {
                            if (sub.temp_drug_class_id == temp_drug_class_id) {
                                var index = parent.genericnames.indexOf(sub);
                                parent.genericnames.splice(index, 1);
                            }
                        });
                    }
                });
            }
            //Remove Row from Table & DB
            if (typeof generic_id != 'undefined') {
                var conf = confirm('Are you sure to delete ?');
                if (conf) {
                    angular.forEach($scope.displayedCollection, function (parent, key) {
                        if (parent.drug_class_id == drug_class_id) {
                            angular.forEach(parent.genericnames, function (sub) {
                                if (sub.generic_id == generic_id) {
                                    var index = parent.genericnames.indexOf(sub);
                                    $scope.loadbar('show');
                                    if (index !== -1) {
                                        var data = {};
                                        var generics = [];
                                        angular.forEach(parent.genericnames, function (genericname) {
                                            generics.push(genericname.generic_id);
                                        })
                                        angular.extend(data, {drug_class_id: drug_class_id, generic_id: generic_id, generic_ids: generics, mode: 'delete'});
                                        $http({
                                            url: $rootScope.IRISOrgServiceUrl + "/pharmacydruggeneric/updatedruggeneric",
                                            method: "POST",
                                            data: data
                                        }).success(
                                                function (response) {
                                                    $scope.loadbar('hide');
                                                    parent.genericnames.splice(index, 1);

                                                    if (parent.genericnames.length == 0) {
                                                        $scope.displayedCollection.splice(key, 1);
                                                    }
                                                    $scope.msg.successMessage = sub.generic_name + ' deleted successfully !!!';
                                                }
                                        ).error(function (data, status) {
                                            $scope.loadbar('hide');
                                            if (status == 422)
                                                $scope.errorData = $scope.errorSummary(data);
                                            else
                                                $scope.errorData = data.message;
                                        });
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

            var generics = [];

            angular.forEach($scope.genericnames, function (genericname) {
                generics.push(genericname.generic_id);
            })
            angular.extend(_that.data, {generic_ids: generics});
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacydruggeneric/savedruggeneric',
                data: _that.data,
            }).success(
                    function (response) {
                        $anchorScroll();
                        if (response.success == true) {
                            $scope.loadbar('hide');
                            $scope.msg.successMessage = 'Drug class assigned successfully';
                            $scope.data = {};
                            $timeout(function () {
                                $state.go('configuration.drugGeneric');
                            }, 1000)
                        } else {
                            $scope.loadbar('hide');
                            $scope.errorData = response.message;
                        }

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
                url: $rootScope.IRISOrgServiceUrl + "/drugGeneric/" + $state.params.id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;

                        //Load genericnames
                        $http.get($rootScope.IRISOrgServiceUrl + '/roomchargegenericname')
                                .success(function (drugGenerics) {
                                    angular.forEach(drugGenerics, function (sub) {
                                        if (sub.drug_class_id == response.drug_class_id) {
                                            $scope.inserted = {
                                                generic_id: sub.generic_id,
                                                generic_id: sub.generic_id,
                                            };
                                            $scope.genericnames.push($scope.inserted);
                                        }
                                    });
                                })
                                .error(function () {
                                    $scope.errorData = "An Error has occured while loading roomChargegenericnames!";
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
                var index = $scope.displayedCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/drugGeneric/remove",
                        method: "POST",
                        data: {id: row.drug_class_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.msg.successMessage = row.charge_cat_name + ' deleted successfully !!!';
                                    $scope.displayedCollection.splice(index, 1);
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };


        // add Row
        $scope.addRow = function () {
            $scope.inserted = {
                generic_id: '',
            };
            $scope.genericnames.push($scope.inserted);
        };

        // remove Row
        $scope.removeSubcat = function (index, id) {
            if (id != '')
                $scope.deletedgenericnames.push(id);
            $scope.genericnames.splice(index, 1);
        };

        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };
    }]);
