app.controller('stockController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$modal', '$log', 'editableOptions', 'editableThemes', '$anchorScroll', '$filter', '$timeout', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', function ($rootScope, $scope, $timeout, $http, $state, $modal, $log, editableOptions, editableThemes, $anchorScroll, $filter, $timeout, $localStorage, DTOptionsBuilder, DTColumnBuilder, $compile) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        $scope.initForm = function () {
            $scope.searchByLists = [{'value': 'pha_product.product_name', 'label': 'Product Name'}, {'value': 'pha_product.product_code', 'label': 'Product Code'}, {'value': 'available_qty', 'label': 'Available'}, {'value': 'batch_no', 'label': 'Batch No'}, {'value': 'pha_product_batch_rate.mrp', 'label': 'MRP'}];
            $scope.searchTypes = [{'value': 'B', 'label': 'Begin With'}, {'value': 'C', 'label': 'Content With'}, {'value': 'E', 'label': 'End With'}];
        }


        $scope.displayedCollection = [];
        $scope.showTable = false;
        $scope.batchDetails = [];

        //Index Page
        $scope.loadStockList = function () {
            $scope.loadbar('show');
            $scope.showTable = true;
            $scope.isLoading = true;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.maxSize = 10;     // Limit number for pagination display number.  
            $scope.totalCount = 0;  // Total number of items in all pages. initialize as a zero  
            $scope.pageIndex = 1;   // Current page number. First page is 1.-->  
            $scope.pageSizeSelected = 10; // Maximum number of items per page.
            $scope.sortOptions = 'product_name desc';

            // pagination set up
            $scope.rowCollection = [];  // base collection
            //$scope.itemsByPage = 20; // No.of records per page
            //$scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection
            $scope.getStockList();

        };

        // Get data's from service
        $scope.getStockList = function () {
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/searchbycriteria?addtfields=stock_details&pageIndex=' + $scope.pageIndex + '&pageSize=' + $scope.pageSizeSelected + '&sortOptions=' + $scope.sortOptions, $scope.data)
                    .success(function (products) {
                        $scope.isLoading = false;
                        $scope.loadbar('hide');
                        angular.forEach(products.productLists, function (product, key) {
                            angular.extend(products.productLists[key], {add_stock: 0});
                        });
                        $scope.rowCollection = products.productLists;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                        $scope.totalCount = products.totalCount;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading products!";
                    });
        }

        $scope.pageChanged = function () {
            $scope.getStockList();
        };

        $scope.sortChanged = function (a) {
            if (angular.isUndefined(a)) {
                $scope.sortOptions = 'pha_product.product_name asc';
                $scope.sortClass = 'sorting_asc';
            } else if (a === 'sorting_asc') {
                $scope.sortOptions = 'pha_product.product_name desc';
                $scope.sortClass = 'sorting_desc';
            } else {
                $scope.sortOptions = 'pha_product.product_name asc';
                $scope.sortClass = 'sorting_asc';
            }
            $scope.getStockList();
        }

        //This method is calling from dropDown  
        $scope.changePageSize = function () {
            $scope.pageIndex = 1;
            $scope.getStockList();
        };

        //Batch details Index Page
        var pb = this;
        var token = $localStorage.user.access_token;
        pb.dtOptions = DTOptionsBuilder.newOptions()
                .withOption('ajax', {
                    url: $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getbatchdetails?access-token=' + token,
                    type: 'POST',
                    beforeSend: function (request) {
                        request.setRequestHeader("x-domain-path", $rootScope.clientUrl);
                    }
                })
                .withDataProp('data')
                .withOption('processing', true)
                .withOption('serverSide', true)
                .withOption('stateSave', true)
                .withOption('bLengthChange', false)
                //.withOption('order', [0, 'desc'])
                .withPaginationType('full_numbers')
                .withOption('createdRow', createdRow);

        pb.dtColumns = [
            DTColumnBuilder.newColumn('description_name').withTitle('Description').notSortable(),
            DTColumnBuilder.newColumn('full_name').withTitle('Product Name').notSortable(),
            DTColumnBuilder.newColumn('batch_no').withTitle('Batch No').notSortable(),
            DTColumnBuilder.newColumn('expiry_date').withTitle('Expiry Date').notSortable(),
            DTColumnBuilder.newColumn('mrp').withTitle('MRP').notSortable(),
            DTColumnBuilder.newColumn('sales_package_name').withTitle('Sales Unit').notSortable(),
            DTColumnBuilder.newColumn('sale_vat_percent').withTitle('Sales VAT').notSortable(),
            DTColumnBuilder.newColumn('batch_id').withTitle('Batch Id').notVisible(),
            DTColumnBuilder.newColumn(null).withTitle('Actions').notSortable().renderWith(actionsHtml)
        ];

        function createdRow(row, data, dataIndex) {
            // Recompiling so we can bind Angular directive to the DT
            $compile(angular.element(row).contents())($scope);
        }

        function actionsHtml(data, type, full, meta) {
            //return '<a class="label bg-dark" title="Edit" check-access  ui-sref="configuration.brandUpdate({id: ' + data.batch_id + '})">' +
            //        '   <i class="fa fa-pencil"></i>' +
            //        '</a>';
            return '<a ng-click="editBatchDetails({id: ' + data.batch_id + '})" title="Edit" class="label bg-dark">' +
                    '<i class="fa fa-pencil"></i>' +
                    '</a>';
        }

//          Batch details Index Page
        $scope.loadBatchList = function () {
            $scope.loadbar('show');

            $scope.maxSize = 5; // Limit number for pagination display number.  
            $scope.totalCount = 0; // Total number of items in all pages. initialize as a zero  
            $scope.pageIndex = 1; // Current page number. First page is 1.-->  
            $scope.pageSizeSelected = 10; // Maximum number of items per page.

            $scope.isLoading = true;

            $scope.errorData = "";
            $scope.msg.successMessage = "";
//            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getbatchlists?addtfields=viewlist')
//                    .success(function (response) {
//                        $scope.batch = response;
//                    })
//                    .error(function () {
//                        $scope.errorData = "An Error has occured while loading products!";
//                    });

            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.loadBatch();
        };

        $scope.loadBatch = function ()
        {
            var pageURL = $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getbatchdetails?addtfields=stock_details&pageIndex=' + $scope.pageIndex + '&pageSize=' + $scope.pageSizeSelected;
            if (typeof $scope.form_filter != 'undefined' && $scope.form_filter != '') {
                pageURL += '&s=' + $scope.form_filter;
            }
            if (typeof $scope.form_filter1 != 'undefined' && $scope.form_filter1 != '') {
                pageURL += '&text=' + $scope.form_filter1;
            }

            // Get data's from service
            $http.get(pageURL)
                    .success(function (products) {
                        $scope.isLoading = false;
                        $scope.loadbar('hide');
//                        angular.forEach(products.productLists, function (product, key) {
//                            angular.extend(products.productLists[key], {full_name: product.product.full_name, description_name: product.product.description_name});
//                        });
                        $scope.rowCollection = products.productLists;
                        $scope.totalCount = products.totalCount;
                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading products!";
                    });
        }
        $scope.pageChanged = function () {
            $scope.loadBatch();
        };


        $scope.editBatchDetails = function (batch_id) {
            $scope.batchDetails = batch_id;
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.batch.html',
                controller: 'BatchupdateController',
                resolve: {
                    scope: function () {
                        return $scope;
                    }
                }
            });
            modalInstance.data = $scope.batchDetails;

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });


            //alert(JSON.stringify(batch_id));
        }
        $scope.adjustStock = function ($data, batch_id, key) {
            $scope.loadbar('show');
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/adjuststock?addtfields=stock_details', {'batch_id': batch_id, 'adjust_qty': $data})
                    .success(function (response) {
                        $scope.loadbar('hide');
                        if (response.success === true) {
                            $scope.msg.successMessage = 'Stock Adjusted successfully';
                            $scope.displayedCollection[key].available_qty = response.batch.available_qty;
                            $scope.displayedCollection[key].add_stock = 0;
                        } else {
                            $scope.errorData = response.message;
                        }
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading products!";
                    });
        }

        $scope.updateBatch = function ($data, batch_id, key) {
            $scope.loadbar('show');
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            angular.extend($data, {'batch_id': batch_id});
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/updatebatch', $data)
                    .success(function (response) {
                        $scope.loadbar('hide');
                        if (response.success === true) {
                            $scope.msg.successMessage = 'Batch Details saved successfully';
//                            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getbatchlists?addtfields=viewlist')
//                                    .success(function (response) {
//                                        $scope.batch = response;
//                                    })
//                                    .error(function () {
//                                        $scope.errorData = "An Error has occured while loading products!";
//                                    });
//                            $scope.rowCollection[key].available_qty = response.batch.available_qty;
//                            $scope.rowCollection[key].add_stock = 0;
                        } else {
                            $scope.errorData = response.message;
                        }
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading products!";
                    });
        }

        $scope.checkInput = function (data) {
            if (!data || data == 0) {
                return "Not empty";
            }
        };
    }]);

//app.filter('moment', function () {
//    return function (dateString, format) {
//        return moment(dateString).format(format);
//    };
//});
