app.controller('OrganizationController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', 'transformRequestAsFormPost', 'fileUpload', 'AuthenticationService', '$modal', '$localStorage', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, transformRequestAsFormPost, fileUpload, AuthenticationService, $modal, $localStorage) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        //Organization Index
        $scope.loadData = function () {
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/organization/getorg",
                method: "GET"
            }).then(
                    function (response) {
                        if (response.data.success === true) {
                            _that.data = response.data.return;
                        } else {
                            $scope.errorData = response.data;
                        }
                    }
            )
        };

        //ChangePassword
        $scope.initChangePassword = function () {
            $('.sb-toggle-right').trigger('click');
        }

        $scope.changePassword = function () {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/user/changepassword';
            method = 'POST';
            succ_msg = 'Password changed successfully';

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.success == true) {
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {};
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
        }

        $scope.checkValue = function (data) {
            if (!data) {
                return "Not empty";
            }
        };

        $scope.initSettings = function () {
//            $('.sb-toggle-right').trigger('click');
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/appconfigurations')
                    .success(function (configurations) {
                        $scope.config_data = [];
                        $scope.config_share_data = [];
                        $scope.config_print_data = [];

                        angular.forEach(configurations, function (conf) {
                            var string = conf.key;
                            var code = conf.code;
                            substring = "SHARE";
                            op_substring = "OP_V_";
                            ip_substring = "IP_V_";

                            if (conf.group == 'prescription_print') {
                                $scope.config_print_data.push(conf);
                            } else {
                                if (!conf.group) {
                                    if (string.indexOf(substring) > -1 == false) {
                                        if ((string.indexOf(op_substring) > -1 == false) && (string.indexOf(ip_substring) > -1 == false)) {
                                            $scope.config_data.push(conf);
                                        }
                                    } else {
                                        $scope.config_share_data.push(conf);
                                    }
                                }

                            }

//                            if (code == 'SA' || code == 'SD' || code == 'SPF')
//                            {
//                                $scope.config_print_data.push(conf);
//                            } else
//                            {
//                                if (string.indexOf(substring) > -1 == false) {
//                                    if ((string.indexOf(op_substring) > -1 == false) && (string.indexOf(ip_substring) > -1 == false)) {
//                                        $scope.config_data.push(conf);
//                                    }
//                                } else {
//                                    $scope.config_share_data.push(conf);
//                                }
//                            }
                        });

                        $scope.isLoading = false;
                        $scope.rowCollection = $scope.config_data;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading settings!";
                    });
        }

        $scope.updateSetting = function ($data, config_id) {
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.loadbar('show');
            if (($data == 1) || ($data == 0)) {
                $data = {value: $data}
            }

            $http({
                method: 'PUT',
                url: $rootScope.IRISOrgServiceUrl + '/appconfigurations/' + config_id,
                data: $data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Updated successfully';
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.updateEmptypharmacy = function ($data) {
            if ($data == '0') {
                $('input[name=pharmacy_branch]').attr('checked', false);
            }
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.loadbar('show');
            $data = {value: $data}

            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/appconfiguration/updateprescription',
                data: $data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Updated successfully';
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.updateShareSetting = function () {
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            _data = $('#shareform').serialize();
//            _data = $('#shareform').serialize() + '&' + $.param({
//                'encounter_id': $scope.encounter.encounter_id,
//                'patient_id': $state.params.id,
//            });

            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/organization/updatesharing',
                transformRequest: transformRequestAsFormPost,
                data: _data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Share Settings Updated successfully';
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.initImportParams = function () {
            $scope.import_process_text = '';
            $scope.progress_imported_rows = $scope.success_import_rows = $scope.failed_import_rows = $scope.total_import_rows = $scope.import_percent = 0;
            $scope.import_error_log = false;
        }

        $scope.importCsv = function () {
            $scope.initImportParams();
            $scope.loadbar('show');
            $scope.import_process_text = 'Fetching the Excel Data. Please wait until the importing begins. This might take few mins';
            $scope.import_log = Date.parse(moment().format());
            var currentUser = AuthenticationService.getCurrentUser();
            fileUpload.uploadFileToUrl($scope.myFile, $rootScope.IRISOrgServiceUrl + '/pharmacypurchase/import?tenant_id=' + currentUser.credentials.logged_tenant_id + '&import_log=' + $scope.import_log).success(function (response) {
                if (response.success) {
                    $scope.total_import_rows = response.message.total_rows;
                    $scope.import_process_text = 'Importing started';
                    $scope.import_start(response.message.id, response.message.max_id);
                } else {
                    $scope.loadbar('hide');
                    $scope.import_process_text = '';
                    $scope.errorData = response.message;
                }
            }).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.import_start = function (id, max) {
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacypurchase/importstart',
                data: {id: id, max_id: max, import_log: $scope.import_log},
            }).success(
                    function (response) {
                        if (response.success) {
                            $scope.success_import_rows++;
                            $scope.progress_imported_rows++;
                        } else if (response.continue) {
                            $scope.failed_import_rows++;
                            $scope.progress_imported_rows++;
                        }

                        $scope.import_process_text = 'Import progressing (' + $scope.progress_imported_rows + '/' + $scope.total_import_rows + ')';
                        $scope.import_percent = ($scope.progress_imported_rows / $scope.total_import_rows) * 100;

                        if (response.continue) {
                            $scope.import_start(response.continue, max);
                        } else {
                            $scope.import_process_text = 'Import completed (' + $scope.progress_imported_rows + '/' + $scope.total_import_rows + ')';
                            $scope.import_error_log = true;
                        }
                        $scope.loadbar('hide');
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.showImportErrorLog = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.pharmacy_purchase_import_errorlog.html',
                controller: "PurchaseImportErrorLogController",
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });
            modalInstance.data = {import_log: $scope.import_log};
        }

        $scope.initProductImportParams = function () {
            $scope.product_import_process_text = '';
            $scope.progress_product_imported_rows = $scope.success_product_import_rows = $scope.failed_product_import_rows = $scope.total_product_import_rows = $scope.import_product_percent = 0;
            $scope.product_import_error_log = false;
        }

        $scope.importProducts = function () {
            $scope.initProductImportParams();
            $scope.loadbar('show');
            $scope.product_import_process_text = 'Fetching the Excel Data. Please wait until the importing begins. This might take few mins';
            $scope.import_log = Date.parse(moment().format());
            var currentUser = AuthenticationService.getCurrentUser();

            fileUpload.uploadFileToUrl($scope.masterProducts, $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/import?tenant_id=' + currentUser.credentials.logged_tenant_id + '&import_log=' + $scope.import_log).success(function (response) {
                if (response.success) {
                    $scope.total_product_import_rows = response.message.total_rows;
                    $scope.product_import_process_text = 'Importing started';
                    $scope.productImportStart(response.message.id, response.message.max_id);
                } else {
                    $scope.loadbar('hide');
                    $scope.product_import_process_text = '';
                    $scope.errorData = response.message;
                }
            }).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.productImportStart = function (id, max) {
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/importstart',
                data: {id: id, max_id: max, import_log: $scope.import_log},
            }).success(
                    function (response) {
                        if (response.success) {
                            $scope.success_product_import_rows++;
                            $scope.progress_product_imported_rows++;
                        } else if (response.continue) {
                            $scope.failed_product_import_rows++;
                            $scope.progress_product_imported_rows++;
                        }

                        $scope.product_import_process_text = 'Import progressing (' + $scope.progress_product_imported_rows + '/' + $scope.total_product_import_rows + ')';
                        $scope.import_product_percent = ($scope.progress_product_imported_rows / $scope.total_product_import_rows) * 100;

                        if (response.continue) {
                            $scope.productImportStart(response.continue, max);
                        } else {
                            $scope.product_import_process_text = 'Import completed (' + $scope.progress_product_imported_rows + '/' + $scope.total_product_import_rows + ')';
                            $scope.product_import_error_log = true;
                        }
                        $scope.loadbar('hide');
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        //In-Progress
        $scope.showProductImportErrorLog = function () {

        }

        //Stock Batchwise import
        $scope.initStkImportParams = function () {
            $scope.stk_import_process_text = '';
            $scope.progress_stk_imported_rows = $scope.success_stk_import_rows = $scope.failed_stk_import_rows = $scope.total_stk_import_rows = $scope.import_stk_percent = 0;
            $scope.stk_import_error_log = false;
        }

        $scope.importStockBatchwise = function () {
            $scope.initStkImportParams();
            $scope.loadbar('show');
            $scope.stk_import_process_text = 'Fetching the Excel Data. Please wait until the importing begins. This might take few mins';
            $scope.import_log = Date.parse(moment().format());
            var currentUser = AuthenticationService.getCurrentUser();

            fileUpload.uploadFileToUrl($scope.stockBatchwise, $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/stockbatchwiseimport?tenant_id=' + currentUser.credentials.logged_tenant_id + '&import_log=' + $scope.import_log).success(function (response) {
                if (response.success) {
                    $scope.total_stk_import_rows = response.message.total_rows;
                    $scope.stk_import_process_text = 'Importing started';
                    $scope.stockImportStart(response.message.id, response.message.max_id);
                } else {
                    $scope.loadbar('hide');
                    $scope.stk_import_process_text = '';
                    $scope.errorData = response.message;
                }
            }).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.stockImportStart = function (id, max) {
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/stockimportstart',
                data: {id: id, max_id: max, import_log: $scope.import_log},
            }).success(
                    function (response) {
                        if (response.success) {
                            $scope.success_stk_import_rows++;
                            $scope.progress_stk_imported_rows++;
                        } else if (response.continue) {
                            $scope.failed_stk_import_rows++;
                            $scope.progress_stk_imported_rows++;
                        }

                        $scope.stk_import_process_text = 'Import progressing (' + $scope.progress_stk_imported_rows + '/' + $scope.total_stk_import_rows + ')';
                        $scope.import_stk_percent = ($scope.progress_stk_imported_rows / $scope.total_stk_import_rows) * 100;

                        if (response.continue) {
                            $scope.stockImportStart(response.continue, max);
                        } else {
                            $scope.stk_import_process_text = 'Import completed (' + $scope.progress_stk_imported_rows + '/' + $scope.total_stk_import_rows + ')';
                            $scope.stk_import_error_log = true;
                        }
                        $scope.loadbar('hide');
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        //In-Progress
        $scope.showStockImportErrorLog = function () {

        }

        //Pha Masters Update
        $scope.initPhaMastersParams = function () {
            $scope.pha_master_import_process_text = '';
            $scope.progress_pha_master_imported_rows = $scope.success_pha_master_import_rows = $scope.failed_pha_master_import_rows = $scope.total_pha_master_import_rows = $scope.import_pha_master_percent = 0;
            $scope.pha_master_import_error_log = false;
        }

        $scope.importPhaMasters = function () {
            $scope.initPhaMastersParams();
            $scope.loadbar('show');
            $scope.pha_master_import_process_text = 'Fetching the Excel Data. Please wait until the importing begins. This might take few mins';
            $scope.import_log = Date.parse(moment().format());
//            $scope.import_log = '1501669314000';
            var currentUser = AuthenticationService.getCurrentUser();

            fileUpload.uploadFileToUrl($scope.phaMastersUpdate, $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/phamastersupdate?tenant_id=' + currentUser.credentials.logged_tenant_id + '&import_log=' + $scope.import_log).success(function (response) {
                if (response.success) {
                    $scope.total_pha_master_import_rows = response.message.total_rows;
                    $scope.pha_master_import_process_text = 'Importing started';
                    $scope.phaMastersUpdateStart(response.message.id, response.message.max_id);
                } else {
                    $scope.loadbar('hide');
                    $scope.pha_master_import_process_text = '';
                    $scope.errorData = response.message;
                }
            }).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.phaMastersUpdateStart = function (id, max) {
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/phamastersupdatestart',
                data: {id: id, max_id: max, import_log: $scope.import_log},
            }).success(
                    function (response) {
                        if (response.success) {
                            $scope.success_pha_master_import_rows++;
                            $scope.progress_pha_master_imported_rows++;
                        } else if (response.continue) {
                            $scope.failed_pha_master_import_rows++;
                            $scope.progress_pha_master_imported_rows++;
                        }

                        $scope.pha_master_import_process_text = 'Import progressing (' + $scope.progress_pha_master_imported_rows + '/' + $scope.total_pha_master_import_rows + ')';
                        $scope.import_pha_master_percent = ($scope.progress_pha_master_imported_rows / $scope.total_pha_master_import_rows) * 100;

                        if (response.continue) {
                            $scope.phaMastersUpdateStart(response.continue, max);
                        } else {
                            $scope.pha_master_import_process_text = 'Import completed (' + $scope.progress_pha_master_imported_rows + '/' + $scope.total_pha_master_import_rows + ')';
                            $scope.pha_master_import_error_log = true;
                        }
                        $scope.loadbar('hide');
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        //In-Progress
        $scope.showphaMastersUpdateErrorLog = function () {

        }

        //Product GST update
        $scope.initProductGstParams = function () {
            $scope.product_gst_import_process_text = '';
            $scope.progress_product_gst_imported_rows = $scope.success_product_gst_import_rows = $scope.failed_product_gst_import_rows = $scope.total_product_gst_import_rows = $scope.import_product_gst_percent = 0;
            $scope.product_gst_import_error_log = false;
        }

        $scope.importProductGST = function () {
            $scope.initProductGstParams();
            $scope.loadbar('show');
            $scope.product_gst_import_process_text = 'Fetching the Excel Data. Please wait until the importing begins. This might take few mins';
            $scope.import_log = Date.parse(moment().format());
            //$scope.import_log = '1510558655000';
            var currentUser = AuthenticationService.getCurrentUser();

            fileUpload.uploadFileToUrl($scope.productGSTImport, $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/productgstupdate?tenant_id=' + currentUser.credentials.logged_tenant_id + '&import_log=' + $scope.import_log).success(function (response) {
                if (response.success) {
                    $scope.total_product_gst_import_rows = response.message.total_rows;
                    $scope.product_gst_import_process_text = 'Importing started';
                    $scope.productGstUpdateStart(response.message.id, response.message.max_id);
                } else {
                    $scope.loadbar('hide');
                    $scope.product_gst_import_process_text = '';
                    $scope.errorData = response.message;
                }
            }).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.productGstUpdateStart = function (id, max) {
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/productgstupdatestart',
                data: {id: id, max_id: max, import_log: $scope.import_log},
            }).success(
                    function (response) {
                        if (response.success) {
                            $scope.success_product_gst_import_rows++;
                            $scope.progress_product_gst_imported_rows++;
                        } else if (response.continue) {
                            $scope.failed_product_gst_import_rows++;
                            $scope.progress_product_gst_imported_rows++;
                        }

                        $scope.product_gst_import_process_text = 'Import progressing (' + $scope.progress_product_gst_imported_rows + '/' + $scope.total_product_gst_import_rows + ')';
                        $scope.import_product_gst_percent = ($scope.progress_product_gst_imported_rows / $scope.total_product_gst_import_rows) * 100;

                        if (response.continue) {
                            $scope.productGstUpdateStart(response.continue, max);
                        } else {
                            $scope.product_gst_import_process_text = 'Import completed (' + $scope.progress_product_gst_imported_rows + '/' + $scope.total_product_gst_import_rows + ')';
                            $scope.product_gst_import_error_log = true;
                        }
                        $scope.loadbar('hide');
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        //In-Progress
        $scope.showphaMastersUpdateErrorLog = function () {

        }

        //Product Price update
        $scope.initProductPriceParams = function () {
            $scope.product_price_import_process_text = '';
            $scope.progress_product_price_imported_rows = $scope.success_product_price_import_rows = $scope.failed_product_price_import_rows = $scope.total_product_price_import_rows = $scope.import_product_price_percent = 0;
            $scope.product_price_import_error_log = false;
        }

        $scope.importProductPrice = function () {
            $scope.initProductPriceParams();
            $scope.loadbar('show');
            $scope.product_price_import_process_text = 'Fetching the Excel Data. Please wait until the importing begins. This might take few mins';
            $scope.import_log = Date.parse(moment().format());
            //$scope.import_log = '1510558655000';
            var currentUser = AuthenticationService.getCurrentUser();

            fileUpload.uploadFileToUrl($scope.productPriceImport, $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/productpriceupdate?tenant_id=' + currentUser.credentials.logged_tenant_id + '&import_log=' + $scope.import_log).success(function (response) {
                if (response.success) {
                    $scope.total_product_price_import_rows = response.message.total_rows;
                    $scope.product_price_import_process_text = 'Importing started';
                    $scope.productPriceUpdateStart(response.message.id, response.message.max_id);
                } else {
                    $scope.loadbar('hide');
                    $scope.product_price_import_process_text = '';
                    $scope.errorData = response.message;
                }
            }).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.productPriceUpdateStart = function (id, max) {
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/productpriceupdatestart',
                data: {id: id, max_id: max, import_log: $scope.import_log},
            }).success(
                    function (response) {
                        if (response.success) {
                            $scope.success_product_price_import_rows++;
                            $scope.progress_product_price_imported_rows++;
                        } else if (response.continue) {
                            $scope.failed_product_price_import_rows++;
                            $scope.progress_product_price_imported_rows++;
                        }

                        $scope.product_price_import_process_text = 'Import progressing (' + $scope.progress_product_price_imported_rows + '/' + $scope.total_product_price_import_rows + ')';
                        $scope.import_product_price_percent = ($scope.progress_product_price_imported_rows / $scope.total_product_price_import_rows) * 100;

                        if (response.continue) {
                            $scope.productPriceUpdateStart(response.continue, max);
                        } else {
                            $scope.product_price_import_process_text = 'Import completed (' + $scope.progress_product_price_imported_rows + '/' + $scope.total_product_price_import_rows + ')';
                            $scope.product_price_import_error_log = true;
                        }
                        $scope.loadbar('hide');
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.initPharmacyBranch = function () {
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/productbranch?addtfields=app_setting_pharmacy')
                    .success(function (response) {
                        $scope.pha_branch = response.model;
                        if (response.appConfig) {
                            $scope.pharmacy_branch = response.appConfig.value;
                        } else {
                            $scope.pharmacy_branch = '';
                        }
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                    });
        }

        $scope.initSessionInterval = function () {
            $scope.timeout = [{value: '10', label: '10'}, {value: '20', label: '20'}, {value: '30', label: '30'}, {value: '40', label: '40'}, {value: '50', label: '50'},
                {value: '60', label: '60'}]
            var time_sess = $localStorage.user.credentials.user_timeout;
            $scope.session_timeout = time_sess.toString();
        }

        $scope.updateTimeout = function () {
            var data = {};
            //$localStorage.user.credentials.user_timeout = $scope.session_timeout;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.loadbar('show');
            data.user_session_timeout = $scope.session_timeout;

            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/user/changeusertimeout',
                data: data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Updated successfully';
                        $localStorage.user.credentials.user_timeout = $scope.session_timeout;
                        var stay_date = moment().add($scope.session_timeout, 'minutes');
                        $localStorage.stay = moment(stay_date).format("YYYY-MM-DD hh:mm:ss");
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

    }]);

// I provide a request-transformation method that is used to prepare the outgoing
// request as a FORM post instead of a JSON packet.
app.factory(
        "transformRequestAsFormPost",
        function () {
            // I prepare the request data for the form post.
            function transformRequest(data, getHeaders) {
                var headers = getHeaders();
                headers[ "Content-type" ] = "application/x-www-form-urlencoded; charset=utf-8";
                return(serializeData(data));
            }
            // Return the factory value.
            return(transformRequest);
            // ---
            // PRVIATE METHODS.
            // ---
            // I serialize the given Object into a key-value pair string. This
            // method expects an object and will default to the toString() method.
            // --
            // NOTE: This is an atered version of the jQuery.param() method which
            // will serialize a data collection for Form posting.
            // --
            // https://github.com/jquery/jquery/blob/master/src/serialize.js#L45
            function serializeData(data) {
                // If this is not an object, defer to native stringification.
                if (!angular.isObject(data)) {
                    return((data == null) ? "" : data.toString());
                }
                var buffer = [];
                // Serialize each key in the object.
                for (var name in data) {
                    if (!data.hasOwnProperty(name)) {
                        continue;
                    }
                    var value = data[ name ];
                    buffer.push(
                            encodeURIComponent(name) +
                            "=" +
                            encodeURIComponent((value == null) ? "" : value)
                            );
                }
                // Serialize the buffer and clean it up for transportation.
                var source = buffer
                        .join("&")
                        .replace(/%20/g, "+")
                        ;
                return(source);
            }
        }
);