app.controller('ReordersController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$anchorScroll', '$filter', '$timeout', 'modalService', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $anchorScroll, $filter, $timeout, modalService) {
        //demo start
        $scope.pageChanged = function (mode) {
            $scope.loadReordersList2(mode);
        };
        //This method is calling from dropDown  
        $scope.changePageSize = function (mode) {
            $scope.pageIndex = 1;
            $scope.loadReordersList2(mode);
        };
        // Demo End 

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        //Expand table in Index page
        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        $scope.paginationInit = function () {
            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
            $rootScope.commonService.GetMonth(function (response) {
                $scope.months = response;
            });
            $rootScope.commonService.GetYear(function (response) {
                $scope.years = response;
            });
            $scope.maxSize = 5; // Limit number for pagination display number.  
            $scope.totalCount = 0; // Total number of items in all pages. initialize as a zero  
            $scope.pageIndex = 1; // Current page number. First page is 1.-->  
            $scope.pageSizeSelected = 10; // Maximum number of items per page.
        }

        //Index Page
        $scope.initReordersList = function () {
            //Demo start
            $scope.paginationInit();
            // pagination set up
            $scope.records = [];  // base collection
            //$scope.itemsByPage = 10; // No.of records per page
            $scope.dispCollection = [].concat($scope.records);  // displayed collection
            // Demo End

            $rootScope.commonService.GetSupplierList('', '1', false, function (response) {
                $scope.suppliers = response.supplierList;

                $http({
                    url: $rootScope.IRISOrgServiceUrl + '/user/getuserslistbyuser',
                    method: "GET"
                }).then(
                        function (response) {
                            $scope.users = response.data.userList;
                            var currentUser = $rootScope.authenticationService.getCurrentUser();
                            $scope.user_id = currentUser.credentials.user_id;
                            //$scope.loadReordersList('RE');
                            $scope.loadReordersList2('RE');
                        }
                );
            });
        }

        $scope.loadReordersList2 = function (mode)
        {
            $scope.loadbar('show');
            $scope.isLoading = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            $scope.activeMenu = mode;

            if (mode == 'RE') {
                $scope.reorder_page_heading = 'Reorders';
                // Get data's from service
                var pageURL = $rootScope.IRISOrgServiceUrl + '/pharmacyreorderhistory/reorder?pageIndex=' + $scope.pageIndex + '&pageSize=' + $scope.pageSizeSelected;
                if (typeof $scope.form_filter != 'undefined' && $scope.form_filter != '')
                {
                    pageURL += '&s=' + $scope.form_filter;
                }
                $http.post(pageURL)
                        .success(function (response) {
                            $scope.loadbar('hide');
                            $scope.isLoading = false;
                            $scope.records = response.report;
                            $scope.date = moment().format('YYYY-MM-DD HH:MM:ss');

                            // $scope.rowCollection = response.report;
                            $scope.totalCount = response.totalCount;
                            $scope.dispCollection = [].concat($scope.records);
                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured while loading products!";
                        });

            } else if (mode == 'RH')
            {
                $scope.reorder_page_heading = 'Reorders History';
                // Get data's from service
                var pageURL = $rootScope.IRISOrgServiceUrl + '/pharmacyreorderhistory/reorderhistory?addtfields=viewlist&pageIndex=' + $scope.pageIndex + '&pageSize=' + $scope.pageSizeSelected;
                if (typeof $scope.rh_form_filter != 'undefined' && $scope.rh_form_filter != '')
                {
                    pageURL += '&s=' + $scope.rh_form_filter;
                }
                if (typeof $scope.day != 'undefined' && $scope.day != '' && typeof $scope.month != 'undefined' && $scope.month != '' && typeof $scope.year != 'undefined' && $scope.year != '')
                {
                    pageURL += '&d=' + $scope.year + '-' + $scope.month + '-' + $scope.day;
                }
                $http.get(pageURL)
                        .success(function (response) {
                            $scope.isLoading = false;
                            $scope.loadbar('hide');
                            $scope.rowCollection = response.report;
                            $scope.totalCount = response.totalCount;
                            $scope.displayedCollection = [].concat($scope.rowCollection);
                            $scope.form_filter = null;
                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured while loading saleList!";
                        });
            }
        }

        $scope.loadReordersList = function (mode) {
            $scope.paginationInit();
            $scope.loadReordersList2(mode);
        };

        $scope.moreOptions = function (key, row) {
            if ($("#reorder_" + key).is(':checked')) {
                $("#reorder_" + key).closest("tr").addClass("selected_row");
            } else {
                $("#reorder_" + key).closest("tr").removeClass("selected_row");
            }
        }

        //Save Both Add & Update Data
        $scope.addReorderHistory = function () {
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyreorderhistory/addreorderhistory';
            method = 'POST';
            succ_msg = 'Reorder saved successfully';

            records = [];
            angular.forEach($scope.records, function (record) {
                if (record.selected == '1') {
                    records.push(record);
                }
            })

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: {records: records, user_id: $scope.user_id},
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.success == true) {
                            $scope.msg.successMessage = succ_msg;
                            $scope.user_id = '';

                            for (var i = 0; i < $scope.records.length; i++) {
                                var obj = $scope.records[i];
                                if (obj.selected == '1') {
                                    $scope.records.splice(i, 1);
                                }
                            }
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

        //Delete
        $scope.removeRow = function (reorderitem) {
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Reorder Item?',
                bodyText: 'Are you sure you want to delete this reorder item?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loadbar('show');
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + "/pharmacyreorderhistory/removeitem",
                    data: {id: reorderitem.reorder_item_id},
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadReordersList("RH");
                                $scope.msg.successMessage = 'Deleted successfully';
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                );
            });
        };

        $scope.printHeader = function () {
            return {
                text: "Reorder History",
                margin: 5,
                alignment: 'center'
            };
        }

        $scope.printFooter = function () {
            return {
                text: [
                    {
                        text: 'Report Genarate On : ',
                        bold: true
                    },
                    moment().format('YYYY-MM-DD HH:mm:ss')
                ],
                margin: 5
            };
        }

        $scope.printStyle = function () {
            return {
                header: {
                    bold: true,
                    color: '#000',
                    fontSize: 11
                },
                demoTable: {
                    color: '#000',
                    fontSize: 10
                }
            };
        }

        $scope.printloader = '';
        $scope.printContent = function () {
            var generated_on = $scope.generated_on;
            var generated_by = $scope.app.username;

            var content = [];
            var reorder_content = $scope.print_reorder;

            var result_count = Object.keys(reorder_content.items).length;
            var index = 1;
            var content_info = [];
            var reorder_items = [];

            reorder_items.push([
                {text: 'S.No', style: 'header'},
                {text: 'Product', style: 'header'},
                {text: 'Quantity', style: 'header'}
            ]);

            var serial_no = 1;
            angular.forEach(reorder_content.items, function (row, key) {
                var s_no_string = serial_no.toString();
                reorder_items.push([
                    s_no_string,
                    row.product.full_name,
                    row.quantity.toString(),
                ]);
                serial_no++;
            });

            content_info.push({
                columns: [
                    {
                        text: [
                            {text: 'Supplier Name: ', bold: true},
                            reorder_content.supplier.supplier_name
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: [
                            {text: 'Reorder Date: ', bold: true},
                            reorder_content.reorder_date
                        ],
                        margin: [0, 0, 0, 20]
                    }

                ]
            }, {
                columns: [
                    {
                        text: [
                            {text: 'Reorder By: ', bold: true},
                            reorder_content.user.fullname
                        ],
                        margin: [0, 0, 0, 20]
                    }
                ]
            }, {
                style: 'demoTable',
                table: {
                    headerRows: 1,
                    widths: ['*', '*', '*'],
                    body: reorder_items,
                },
                pageBreak: (index === result_count ? '' : 'after'),
            });
            content.push(content_info);
            if (index == result_count) {
                $scope.printloader = '';
            }
            index++;
            return content;
        }

        $scope.printReport = function () {
            $scope.printloader = '<i class="fa fa-spin fa-spinner"></i>';
            $timeout(function () {
                var print_content = $scope.printContent();
                if (print_content.length > 0) {
                    var docDefinition = {
                        header: $scope.printHeader(),
                        footer: $scope.printFooter(),
                        styles: $scope.printStyle(),
                        content: print_content,
                        pageMargins: ($scope.deviceDetector.browser == 'firefox' ? 75 : 50),
                        pageSize: 'A4',
                    };
                    var pdf_document = pdfMake.createPdf(docDefinition);
                    var doc_content_length = Object.keys(pdf_document).length;
                    if (doc_content_length > 0) {
                        pdf_document.print();
                    }
                }
            }, 1000);
        }

        $scope.print_reorder = '';
        $scope.printReorderHistory = function (reorder_id) {
            reorder_history = $filter('filter')($scope.displayedCollection, {reorder_id: reorder_id});
            if (reorder_history) {
                $scope.print_reorder = reorder_history[0];
                $scope.printReport();
            }
        }

        //For Form - Nad
        $scope.initForm = function () {
            $scope.loadbar('show');
            $scope.showform = false;
            $rootScope.commonService.GetVatList('', '1', false, function (response) {
                $scope.vatList = response.vatList;
            });
            $rootScope.commonService.GetPaymentType(function (response) {
                $scope.paymentTypes = response;
                $rootScope.commonService.GetPackageUnitList('', '1', false, function (response) {
                    $scope.loadForm();
                    $scope.packings = response.packingList;
                    $scope.loadbar('hide');
                });
            });

        }

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/pharmacyreorderhistories/" + $state.params.id + "?addtfields=reorderhistory",
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.status == '1') {
                            $scope.showform = true;
                            $scope.data = response;
                            $scope.data.invoice_date = moment().format('YYYY-MM-DD');
                            $scope.data.payment_type = 'CA';
                            if ($scope.data.payment_type != null)
                                $scope.getPaytypeDetail($scope.data.payment_type);

                            $scope.products = [];
                            $scope.batches = [];

                            $scope.purchaseitems = response.items;
                            angular.forEach($scope.purchaseitems, function (item, key) {
                                angular.extend($scope.purchaseitems[key], {
                                    is_temp: '0',
                                    full_name: item.product.full_name,
//                                batch_no: item.batch.batch_no,
//                                batch_details: item.batch.batch_details,
//                                temp_expiry_date: item.batch.expiry_date,
//                                temp_mrp: item.batch.mrp,
//                                temp_package_name: item.package_name,
//                                temp_free_quantity_unit: item.free_quantity_unit
                                });

                                $scope.updateProductRow(item, key);

                                $timeout(function () {
                                    $scope.showOrHideRowEdit('show', key);
                                    $scope.showOrHideProductBatch('hide', key);
                                });
                            });

                            $scope.tableform.$show();

                            $timeout(function () {
//                            delete $scope.data.supplier;
//                            delete $scope.data.items;
                            }, 3000);
                        } else {
                            $state.go('pharmacy.reorder');
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

        $scope.updateProductRow = function (item, key) {
            $scope.purchaseitems[key].product_id = item.product_id;
            $scope.purchaseitems[key].vat_percent = item.product.purchaseVat.vat;

            $scope.loadbar('show');
//            $scope.updateRow(key);

            $rootScope.commonService.GetBatchListByProduct(item.product_id, function (response) {
                $scope.loadbar('hide');

                angular.forEach(response.batchList, function (item, key) {
                    batch_details = $filter('filter')($scope.batches, {batch_id: item.batch_id});
                    if (batch_details.length == 0) {
                        $scope.batches.push(item);
                    } else {
                        batch_details[0].available_qty = item.available_qty;
                        batch_details[0].batch_details = item.batch_details;
                    }
                });

                $scope.purchaseitems[key].batch_no = '';
                $scope.purchaseitems[key].expiry_date = '';
                $scope.purchaseitems[key].temp_expiry_date = '';
                $scope.purchaseitems[key].mrp = 0;
                $scope.purchaseitems[key].temp_mrp = 0;
                $scope.purchaseitems[key].package_name = '';
                $scope.purchaseitems[key].temp_package_name = '';
                $scope.purchaseitems[key].quantity = 0;
                $scope.purchaseitems[key].free_quantity = 0;
                $scope.purchaseitems[key].free_quantity_unit = "";
                $scope.purchaseitems[key].temp_free_quantity_unit = "";
                $scope.purchaseitems[key].purchase_rate = 0;
                $scope.purchaseitems[key].discount_percent = 0;
            });
        }

        $scope.updateBatchRow = function (item, model, label, key) {
            //console.log(item); return false;
            $scope.purchaseitems[key].batch_no = item.batch_no;
            $scope.purchaseitems[key].temp_expiry_date = item.expiry_date;
            $scope.purchaseitems[key].temp_mrp = item.mrp;
            $scope.purchaseitems[key].temp_package_name = item.product.purchasePackageName;
            // $scope.purchaseitems[key].temp_free_quantity_unit = model.free_quantity_unit;

            $scope.showOrHideRowEdit('hide', key);
        }

        $scope.updateColumn = function ($data, key, column) {
            $scope.purchaseitems[key][column] = $data;
            $scope.updateRow(key);
        }

        $scope.updateRow = function (key) {
            //Get Data
            var qty = parseFloat($scope.purchaseitems[key].quantity);
            var rate = parseFloat($scope.purchaseitems[key].purchase_rate);
            var disc_perc = parseFloat($scope.purchaseitems[key].discount_percent);
            var vat_perc = parseFloat($scope.purchaseitems[key].vat_percent);
            var free_qty = parseFloat($scope.purchaseitems[key].free_quantity);

            //Validate isNumer
            qty = !isNaN(qty) ? qty : 0;
            rate = !isNaN(rate) ? rate : 0;
            disc_perc = !isNaN(disc_perc) ? disc_perc : 0;
            vat_perc = !isNaN(vat_perc) ? vat_perc : 0;
            free_qty = !isNaN(free_qty) ? free_qty : 0;

            var purchase_amount = (qty * rate).toFixed(2);
            var disc_amount = disc_perc > 0 ? (purchase_amount * (disc_perc / 100)).toFixed(2) : 0;

            var total_amount = (purchase_amount - disc_amount).toFixed(2);
            var vat_amount = (purchase_amount * (vat_perc / 100)).toFixed(2);

            $scope.purchaseitems[key].purchase_amount = purchase_amount;
            $scope.purchaseitems[key].discount_amount = disc_amount;
            $scope.purchaseitems[key].total_amount = total_amount;
            $scope.purchaseitems[key].vat_amount = vat_amount;
            $scope.purchaseitems[key].free_quantity_unit = free_qty;

            $scope.updatePurchaseRate();
        }

        $scope.updatePurchaseRate = function () {
            var total_purchase_amount = total_discount_amount = total_vat_amount = total_amount = 0;
            var before_disc_amount = after_disc_amount = roundoff_amount = net_amount = 0;

            //Get Total Purchase, VAT, Discount Amount
            angular.forEach($scope.purchaseitems, function (item) {
                total_purchase_amount = total_purchase_amount + parseFloat(item.total_amount);
                total_discount_amount = total_discount_amount + parseFloat(item.discount_amount);
                total_vat_amount = total_vat_amount + parseFloat(item.vat_amount);
            });

            $scope.data.total_item_purchase_amount = total_purchase_amount.toFixed(2);
            $scope.data.total_item_discount_amount = total_discount_amount.toFixed(2);
            $scope.data.total_item_vat_amount = total_vat_amount.toFixed(2);

            //Get Before Discount Amount (Total Purchase Amount + Total VAT)
            before_disc_amount = (total_purchase_amount + total_vat_amount).toFixed(2);
            $scope.data.before_disc_amount = before_disc_amount;

            //Get Discount Amount
            var disc_perc = parseFloat($scope.data.discount_percent);
            disc_perc = !isNaN(disc_perc) ? (disc_perc).toFixed(2) : 0;

            var disc_amount = disc_perc > 0 ? (total_purchase_amount * (disc_perc / 100)).toFixed(2) : 0;
            $scope.data.discount_amount = disc_amount;

            after_disc_amount = (parseFloat(before_disc_amount) - parseFloat(disc_amount));
            $scope.data.after_disc_amount = after_disc_amount.toFixed(2);

            // Net Amount = (Total Amount - Discount Amount) +- RoundOff
            net_amount = Math.round(parseFloat(after_disc_amount));
            roundoff_amount = Math.abs(net_amount - after_disc_amount);

            $scope.data.roundoff_amount = roundoff_amount.toFixed(2);
            $scope.data.net_amount = net_amount.toFixed(2);
        }

        $scope.getBtnId = function (btnid)
        {
            $scope.btnid = btnid;
        }

        $scope.getPaytypeDetail = function (payment_type) {
            if (payment_type == 'CA') {
                $scope.purchase_type_name = 'Cash';
            }
            if (payment_type == 'CR') {
                $scope.purchase_type_name = 'Credit';
            }
        }

        $scope.showOrHideRowEdit = function (mode, key) {
            if (mode == 'hide') {
                i_addclass = t_removeclass = 'hide';
                i_removeclass = t_addclass = '';
                $scope.purchaseitems[key].is_temp = '1';
            } else {
                i_addclass = t_removeclass = '';
                i_removeclass = t_addclass = 'hide';
                $scope.purchaseitems[key].is_temp = '0';
            }
            $('#i_expiry_date_' + key).addClass(i_addclass).removeClass(i_removeclass);
            $('#i_mrp_' + key).addClass(i_addclass).removeClass(i_removeclass);
            $('#i_package_name_' + key).addClass(i_addclass).removeClass(i_removeclass);
            $('#i_free_quantity_unit_' + key).addClass(i_addclass).removeClass(i_removeclass);

            $('#t_expiry_date_' + key).addClass(t_addclass).removeClass(t_removeclass);
            $('#t_mrp_' + key).addClass(t_addclass).removeClass(t_removeclass);
            $('#t_package_name_' + key).addClass(t_addclass).removeClass(t_removeclass);
            $('#t_free_quantity_unit_' + key).addClass(t_addclass).removeClass(t_removeclass);
        }

        $scope.showOrHideProductBatch = function (mode, key) {
            if (mode == 'hide') {
                i_addclass = t_removeclass = 'hide';
                i_removeclass = t_addclass = '';
            } else {
                i_addclass = t_removeclass = '';
                i_removeclass = t_addclass = 'hide';
            }
            $('#i_full_name_' + key).addClass(i_addclass).removeClass(i_removeclass);
//            $('#i_batch_details_' + key).addClass(i_addclass).removeClass(i_removeclass);

            $('#t_full_name_' + key).addClass(t_addclass).removeClass(t_removeclass);
//            $('#t_batch_details_' + key).addClass(t_addclass).removeClass(t_removeclass);
        }

        $scope.open = function ($event, mode) {
            $event.preventDefault();
            $event.stopPropagation();

            switch (mode) {
                case 'opened1':
                    $scope.opened1 = true;
                    break;
                case 'opened2':
                    $scope.opened1 = true;
                    break;
            }
        };

        $scope.checkvatInput = function (data) {
            if (typeof data == 'undefined') {
                return "Invalid data";
            } else if (!data) {
                return "Not empty.";
            }
        };

        $scope.minDate = $scope.minDate ? null : new Date();

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.data.invoice_date = moment($scope.data.invoice_date).format('YYYY-MM-DD');

            angular.forEach($scope.purchaseitems, function (purchaseitem, key) {
                //Manual functions for Temp records//               
                if (purchaseitem.is_temp == '1') {
                    exp_date = purchaseitem.temp_expiry_date;
                    $scope.purchaseitems[key].mrp = purchaseitem.temp_mrp;
                    $scope.purchaseitems[key].package_name = purchaseitem.temp_package_name;
                    $scope.purchaseitems[key].free_quantity_unit = purchaseitem.free_quantity_unit;
                } else {
                    exp_date = purchaseitem.expiry_date;
                }

                $scope.purchaseitems[key].expiry_date = moment(exp_date).format('YYYY-MM-DD');

                if (angular.isObject(purchaseitem.full_name)) {
                    $scope.purchaseitems[key].full_name = purchaseitem.full_name.full_name;
                } else if (typeof purchaseitem.full_name == 'undefined') {
                    $scope.purchaseitems[key].product_id = '';
                }

                packing_details = $filter('filter')($scope.packings, {package_name: $scope.purchaseitems[key].package_name}, true);
                if (!$.isEmptyObject(packing_details)) {
                    $scope.purchaseitems[key].package_unit = packing_details[0].package_unit;
                }

                if (purchaseitem.batch_details) {
                    $scope.purchaseitems[key].batch_no = purchaseitem.batch_details;
                } else if (typeof purchaseitem.batch_details == 'undefined') {
                    $scope.purchaseitems[key].batch_no = '';
                } else if ((purchaseitem.batch_no == '0' || purchaseitem.batch_no == '') && typeof purchaseitem.batch_details !== 'undefined') {
                    $scope.purchaseitems[key].batch_no = purchaseitem.batch_details;
                }
            });
            $scope.data2 = _that.data;
            $scope.purchaseitems2 = $scope.purchaseitems;

//            if (_that.data.supplier_id != null)
//                $scope.getSupplierDetail(_that.data.supplier_id);

            if (_that.data.payment_type != null)
                $scope.getPaytypeDetail(_that.data.payment_type);

            angular.extend(_that.data, {
                product_items: $scope.purchaseitems,
                reorder_id: $state.params.id
            });
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacypurchase/savepurchase',
                data: _that.data,
            }).success(
                    function (response) {
                        $anchorScroll();
                        if (response.success == true) {

                            $scope.loadbar('hide');
                            if (mode == 'add') {
                                $scope.data = {};
                                $scope.msg.successMessage = 'New Purchase bill generated  ' + response.invoice_no;
                                $timeout(function () {
                                    $state.go('pharmacy.reorder');
                                }, 1000);
                            } else {
                                $scope.msg.successMessage = 'Purchase updated successfully';
                            }
                            $timeout(function () {
                                save_success();
                            }, 1000);
                        } else {
                            $scope.loadbar('hide');
                            $scope.errorData = response.message;
                        }

                        return false;
                    }
            ).error(function (data, status) {
                $anchorScroll();
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });

//            var save_success = function () {
//                if ($scope.btnid == "print")
//                {
//                    var innerContents = document.getElementById("Getprintval").innerHTML;
//                    var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
//                    popupWinindow.document.open();
//                    popupWinindow.document.write('<html><head><link href="css/print.css" rel="stylesheet" type="text/css" /></head><body onload="window.print()">' + innerContents + '</html>');
//                    popupWinindow.document.close();
//                } else {
////                    $scope.data = {};
////                    $timeout(function () {
////                        $state.go('pharmacy.purchase');
////                    }, 1000)
//                }
//            }
        };
    }]);