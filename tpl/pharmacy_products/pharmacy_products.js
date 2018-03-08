app.controller('ProductsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$modal', '$log', '$filter', '$location', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', 'hotkeys', function ($rootScope, $scope, $timeout, $http, $state, $modal, $log, $filter, $location, $localStorage, DTOptionsBuilder, DTColumnBuilder, $compile, hotkeys) {

        hotkeys.bindTo($scope)
                .add({
                    combo: 'f5',
                    description: 'Create',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function () {
                        $state.go('configuration.productAdd', {}, {reload: true});
                    }
                })
                .add({
                    combo: 'f8',
                    description: 'Cancel',
                    callback: function (e) {
                        if (confirm('Are you sure want to leave?')) {
                            $state.go('configuration.products', {}, {reload: true});
                            e.preventDefault();
                        }
                    }
                })
                .add({
                    combo: 'f6',
                    description: 'Save',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function (e) {
                        submitted = true;
                        $timeout(function () {
                            angular.element("#save").trigger('click');
                        }, 100);
                        e.preventDefault();
                    }
                })
                .add({
                    combo: 'f9',
                    description: 'List',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function (event) {
                        $state.go('configuration.products')
                        event.preventDefault();
                    }
                });

        var vm = this;
        var token = $localStorage.user.access_token;
        vm.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    // Either you specify the AjaxDataProp here
                    // dataSrc: 'data',
                    url: $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getproducts?access-token=' + token,
                    type: 'POST',
                    beforeSend: function (request) {
                        request.setRequestHeader("x-domain-path", $rootScope.clientUrl);
                    }
                })
                // or here
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('stateSave', true)
                .withOption('bLengthChange', false)
                .withPaginationType('full_numbers')
                .withOption('createdRow', createdRow);
        vm.dtColumns = [
            DTColumnBuilder.newColumn('product_id').withTitle('Product ID').notVisible(),
            DTColumnBuilder.newColumn('product_name').withTitle('Product Name'),
            DTColumnBuilder.newColumn('product_code').withTitle('Product Code'),
            DTColumnBuilder.newColumn('product_type').withTitle('Product Type'),
            DTColumnBuilder.newColumn('product_brand').withTitle('Product Brand'),
            DTColumnBuilder.newColumn('product_generic').withTitle('Generic Name'),
            DTColumnBuilder.newColumn('status').withTitle('Status').notSortable().renderWith(statusHtml),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        function actionsHtml(data, type, full, meta) {
            return '<a class="label bg-dark" title="Edit" check-access  ui-sref="configuration.productEdit({id: ' + data.product_id + '})">' +
                    '   <i class="fa fa-pencil"></i>' +
                    '</a>&nbsp;&nbsp;&nbsp;' +
                    '<a class="hide" title="Delete" ng-click="removeRow(row)">' +
                    '   <i class="fa fa-trash"></i>' +
                    '</a>';
        }

        vm.selected = {};
        function statusHtml(data, type, full, meta) {
            if (full.status === '1') {
                vm.selected[full.product_id] = true;
            } else {
                vm.selected[full.product_id] = false;
            }
            var model_name = "'" + "PhaProduct" + "'";
            return '<label class="i-checks ">' +
                    '<input type="checkbox" ng-model="showCase.selected[' + full.product_id + ']" ng-change="updateStatus(' + model_name + ', ' + full.product_id + ')">' +
                    '<i></i>' +
                    '</label>';
        }

        //Index Page
//        $scope.loadProductsList = function () {
//            $scope.isLoading = true;
//            // pagination set up
//            $scope.rowCollection = [];  // base collection
//            $scope.itemsByPage = 10; // No.of records per page
//            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection
//
//            // Get data's from service
//            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct')
//                    .success(function (products) {
//                        $scope.isLoading = false;
//                        $scope.rowCollection = products;
//                        $scope.displayedCollection = [].concat($scope.rowCollection);
//                    })
//                    .error(function () {
//                        $scope.errorData = "An Error has occured while loading brand!";
//                    });
//        };

        //For Form
        $scope.initForm = function () {
            // Product Units list
            $rootScope.commonService.GetProductUnitsList('1', false, function (response) {
                $scope.productUnits = response.productunitlist;
            });

            // Product Description list
            $rootScope.commonService.GetProductDescriptionList('', '1', false, function (response) {
                $scope.productDescriptions = response.productDescriptionList;
            });

            // Brand list
            $rootScope.commonService.GetBrandsList('', '1', false, function (response) {
                $scope.brands = response.brandList;
            });

            // Division list
            $rootScope.commonService.GetDivisionsList('', '1', false, function (response) {
                $scope.divisions = response.divisionList;
            });

            // Generic list
            $rootScope.commonService.GetGenericList('', '1', false, false, function (response) {
                $scope.generics = response.genericList;
            });

            // Drug Class list
            $rootScope.commonService.GetDrugClassList('', '1', false, false, function (response) {
                $scope.drugClasses = response.drugList;
            });

            // Vat list
            $rootScope.commonService.GetVatList('', '1', false, function (response) {
                $scope.vats = response.vatList;
            });

            // Packing unit list
            $rootScope.commonService.GetPackageUnitList('', '1', false, function (response) {
                $scope.packingUnits = response.packingList;
            });

            $rootScope.commonService.GetSupplierList('', '1', false, function (response) {
                $scope.suppliers = response.supplierList;
            });

            $rootScope.commonService.GetHsnCode('1', false, function (response) {
                $scope.hsncode = response.hsncodeList;
            });

            $rootScope.commonService.GetGstCode('', '1', false, function (response) {
                $scope.gstlist = response.gstList;
            });


            if ($scope.data.formtype == 'add') {
                $scope.data.product_reorder_min = 0;
                $scope.data.product_reorder_max = 50;
            }
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyproducts?addtfields=pha_product';
                method = 'POST';
                succ_msg = 'Product saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyproducts/' + _that.data.product_id + '?addtfields=pha_product';
                method = 'PUT';
                succ_msg = 'Product updated successfully';
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
                        $timeout(function () {
                            $state.go('configuration.products');
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
                url: $rootScope.IRISOrgServiceUrl + "/pharmacyproducts/" + $state.params.id + '?addtfields=pha_product',
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
                        $scope.setGst();
                        $scope.setPackageUnit();
                        //If Drug Class is empty then give option to choose new drug class.
                        if (!$scope.data.drug_class_id) {
                            $scope.showDrugDropdown = true;
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

        $scope.cgst = '';
        $scope.setGst = function () {
            gstPackage = $filter('filter')($scope.gstlist, {gst_id: $scope.data.sales_gst_id});
            if (gstPackage.length > 0) {
                sgst = gstPackage[0].gst;
                $scope.cgst = (parseFloat(sgst) / 2).toFixed(2);
            } else {
                $scope.cgst = '';
            }
        }

        $scope.showDrugDropdown = false;
        $scope.getDrugByGeneric = function () {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            if ($scope.data.generic_id) {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + '/pharmacydrugclass/getdrugbygeneric?generic_id=' + $scope.data.generic_id,
                    method: "GET",
                }).then(
                        function (response) {
                            if (response.data.drug) {
                                $scope.data.drug_name = response.data.drug.drug_name;
                                $scope.data.drug_class_id = response.data.drug.drug_class_id;
                                $scope.showDrugDropdown = false;
                            } else {
                                $scope.data.drug_name = '';
                                $scope.data.drug_class_id = '';
                                $scope.showDrugDropdown = true;
                            }
                        }
                );
            } else {
                $scope.data.drug_name = '';
                $scope.data.drug_class_id = '';
                $scope.showDrugDropdown = false;
            }
        }

        //Delete
//        $scope.removeRow = function (row) {
//            var conf = confirm('Are you sure to delete ?');
//            if (conf) {
//                $scope.loadbar('show');
//                var index = $scope.displayedCollection.indexOf(row);
//                if (index !== -1) {
//                    $http({
//                        url: $rootScope.IRISOrgServiceUrl + "/pharmacybrandrep/remove",
//                        method: "POST",
//                        data: {id: row.brand_id}
//                    }).then(
//                            function (response) {
//                                $scope.loadbar('hide');
//                                if (response.data.success === true) {
//                                    $scope.displayedCollection.splice(index, 1);
//                                    $scope.loadBrandsList();
//                                    $scope.msg.successMessage = 'Brand Rep Deleted Successfully';
//                                }
//                                else {
//                                    $scope.errorData = response.data.message;
//                                }
//                            }
//                    )
//                }
//            }
//        };

        $scope.open = function (size, ctrlr, tmpl, update_col) {
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
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.setVat = function (mode) {
            if (mode == 'sale') {
                $scope.data.sales_vat_id = $scope.data.purchase_vat_id;
            } else if (mode == 'purchase') {
                $scope.data.purchase_vat_id = $scope.data.sales_vat_id;
            }
        }

        $scope.packing_unit = 0;
        $scope.setPackageUnit = function () {
            purchasePackage = $filter('filter')($scope.packingUnits, {package_id: $scope.data.purchase_package_id});
            if (purchasePackage.length > 0) {
                $scope.packing_unit = purchasePackage[0].package_unit;
                $timeout(function () {
                    $('.selectpicker').selectpicker('refresh');
                }, 0);
            } else {
                $scope.packing_unit = 0;
                $scope.data.sales_package_id = '';
            }
        }
    }]);

app.filter('packingunitFilter', function () {
    return function (items, validate_package_unit) {
        var filtered = [];
        angular.forEach(items, function (item) {
            if (item.package_unit <= validate_package_unit) {
                filtered.push(item);
            }
        });
        return filtered;
    }
});