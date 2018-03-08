app.controller('PurchaseController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$anchorScroll', '$filter', '$timeout', '$location', '$modal', '$log', '$localStorage', 'DTOptionsBuilder', 'DTColumnBuilder', '$compile', '$q', 'hotkeys', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $anchorScroll, $filter, $timeout, $location, $modal, $log, $localStorage, DTOptionsBuilder, DTColumnBuilder, $compile, $q, hotkeys) {

        hotkeys.bindTo($scope)
                .add({
                    combo: 'f5',
                    description: 'Create',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function () {
                        $state.go('pharmacy.purchaseCreate', {}, {reload: true});
                    }
                })
                .add({
                    combo: 'f8',
                    description: 'Cancel',
                    callback: function (e) {
                        if (confirm('Are you sure want to leave?')) {
                            $state.go('pharmacy.purchase', {}, {reload: true});
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
                            angular.element("#save_print").trigger('click');
                        }, 100);
                        e.preventDefault();
                    }
                })
                .add({
                    combo: 'ctrl+p',
                    description: 'Save and Print',
                    callback: function (e) {
                        submitted = true;
                        $timeout(function () {
                            angular.element("#save_print").trigger('click');
                        }, 100);
                        e.preventDefault();
                    }
                })
                .add({
                    combo: 's',
                    description: 'Search',
                    callback: function (e) {
                        $('#filter').focus();
                        e.preventDefault();
                    }
                })
                .add({
                    combo: 'f9',
                    description: 'List',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function (event) {
                        $state.go('pharmacy.purchase')
                        event.preventDefault();
                    }
                });
        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        //Expandable rows
        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        //Index Page
        $scope.itemsByPage = 10; // No.of records per page

        $scope.loadMorePurchaseItemList = function (payment_type) {
            if ($scope.isLoading)
                return;

            $scope.pageIndex++;
            $scope.isLoading = true;

            var pageURL = $rootScope.IRISOrgServiceUrl + '/pharmacypurchase/getpurchases?addtfields=viewlist&payment_type=' + payment_type + '&p=' + $scope.pageIndex + '&l=' + $scope.itemsByPage;
            if (typeof $scope.form_filter != 'undefined' && $scope.form_filter != '') {
                pageURL += '&s=' + $scope.form_filter;
            }

            if (typeof $scope.form_filter1 != 'undefined' && $scope.form_filter1 != '') {
                pageURL += '&dt=' + moment($scope.form_filter1).format('YYYY-MM-DD');
            }

            $http.get(pageURL)
                    .success(function (purchaseList) {
                        $scope.isLoading = false;
                        $scope.rowCollection = $scope.rowCollection.concat(purchaseList.purchases);
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading purchaseList!";
                    });
        };
        $scope.loadPurchaseItemList = function (payment_type) {
            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
            $rootScope.commonService.GetMonth(function (response) {
                $scope.months = response;
            });
            $rootScope.commonService.GetYear(function (response) {
                $scope.years = response;
            });
            $scope.errorData = $scope.msg.successMessage = '';
            $scope.purchase_payment_type_name = (payment_type == 'CA') ? 'Cash' : 'Credit';
            $scope.activeMenu = $scope.purchase_payment_type = payment_type;

            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.pageIndex = 1;
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            var pageURL = $rootScope.IRISOrgServiceUrl + '/pharmacypurchase/getpurchases?addtfields=viewlist&payment_type=' + payment_type + '&p=' + $scope.pageIndex + '&l=' + $scope.itemsByPage;

            if (typeof $scope.form_filter != 'undefined' && $scope.form_filter != '') {
                pageURL += '&s=' + $scope.form_filter;
            }

            if (typeof $scope.day != 'undefined' && $scope.day != '' && typeof $scope.month != 'undefined' && $scope.month != '' && typeof $scope.year != 'undefined' && $scope.year != '') {
                //pageURL += '&dt=' + moment($scope.form_filter1).format('YYYY-MM-DD');
                pageURL += '&dt=' + $scope.year + '-' + $scope.month + '-' + $scope.day;
            }
            // Get data's from service
            $http.get(pageURL)
//            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacypurchase')
                    .success(function (purchaseList) {
                        $scope.isLoading = false;
                        $scope.rowCollection = purchaseList.purchases;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
//                        $scope.form_filter = null;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading purchaseList!";
                    });
        };

        //Modal
        $scope.openMdl = function (size, ctrlr, tmpl, update_col) {
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

        //Datepicker
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
        $scope.minDate = $scope.minDate ? null : new Date();

        //For Form
        $scope.formtype = '';
        $scope.initForm = function (formtype) {
            $scope.data = {};
            if (formtype == 'add') {
                $scope.data.formtype = 'add';
                $scope.data.payment_type = 'CA';
                $scope.formtype = 'add';
            } else {
                $scope.data.formtype = 'update';
                $scope.formtype = 'update';
            }

            $scope.loadbar('show');

            $rootScope.commonService.GetVatList('', '1', false, function (response) {
                $scope.vatList = response.vatList;
            });
            $rootScope.commonService.GetPaymentType(function (response) {
                $scope.paymentTypes = response;

                $rootScope.commonService.GetSupplierList('', '1', false, function (response) {
                    $scope.suppliers = response.supplierList;

                    $rootScope.commonService.GetPackageUnitList('', '1', false, function (response) {
                        $scope.packings = response.packingList;

                        if ($scope.data.formtype == 'update') {
                            $scope.loadForm();
                        } else {
                            $scope.setFutureInternalCode('PG', 'gr_num');
                            $scope.data.invoice_date = moment().format('YYYY-MM-DD');
                            $scope.addRow();
                        }

                        $scope.products = [];

                        $scope.productloader = '<i class="fa fa-spin fa-spinner"></i>';
                        $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct?fields=product_id,full_name') //product_name, purchaseVat
                                .success(function (products) {
                                    $scope.products = products;
                                    $scope.productloader = '';
                                })
                                .error(function () {
                                    $scope.errorData = "An Error has occured while loading products!";
                                });

                        $scope.loadbar('hide');
                    });
                });
            });
        }

        // editable table
        $scope.purchaseitems = [];

        //Create page height
        $scope.css = {'style': ''};

        // add Row
        $scope.addRow = function () {
            $scope.product_item_error = '';
            $scope.inserted = {
                product_id: '',
                full_name: '',
                batch_no: '0',
                batch_details: '',
                expiry_date: '',
                quantity: '0',
                package_name: '',
                free_quantity: '0',
                free_quantity_unit: '',
                mrp: '0',
                purchase_rate: '0',
                purchase_amount: '0',
                discount_percent: '0',
                discount_amount: '0',
                vat_percent: '0',
                vat_amount: '0',
                total_amount: '0',
                temp_expiry_date: '',
                temp_package_name: '',
                temp_mrp: '0',
                is_temp: '0',
                exp_warning: ''
            };
            if ($scope.purchaseitems.length > 0) {
                if((!$scope.purchaseitems[$scope.purchaseitems.length-1].product_id) || ($scope.purchaseitems[$scope.purchaseitems.length-1].batch_no=='0')) {
                    $scope.product_item_error = "Kindly fill the items details";
                } else {
                    $scope.purchaseitems.push($scope.inserted);
                }
            } else {
                $scope.purchaseitems.push($scope.inserted);
            }

            if ($scope.purchaseitems.length > 1) {
                $timeout(function () {
                    $scope.setFocus('full_name', $scope.purchaseitems.length - 1);
                });
            }

            if ($scope.purchaseitems.length > 6) {
                $scope.css = {
                    'style': 'height:360px; overflow-y: auto; overflow-x: hidden;',
                };
            }
        };

        $scope.setFocus = function (id, index) {
            angular.element(document.querySelectorAll("#" + id))[index].focus();
        };

        // remove Row
        $scope.removeSubcat = function (index) {
            if ($scope.purchaseitems.length == 1) {
                alert('Can\'t Delete. Purchase Item must be atleast one.');
                return false;
            }
            $scope.removePurchase(index);
        };

        $scope.removePurchase = function (index) {
            $scope.purchaseitems.splice(index, 1);
            $scope.updatePurchaseRate();
            $timeout(function () {
                $scope.setFocus('full_name', $scope.purchaseitems.length - 1);
            });

            if ($scope.purchaseitems.length <= 6) {
                $scope.css = {
                    'style': '',
                };
            }
        };

        $scope.removeUpdateSubcat = function (index, purchase_item_id) {
            if ($scope.purchaseitems.length == 1) {
                alert('Can\'t Delete. Purchase Item must be atleast one.');
                return false;
            }
            if (purchase_item_id)
            {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/pharmacypurchase/checkitemdelete",
                    method: "POST",
                    data: {id: purchase_item_id}
                }).then(
                        function (response) {
                            if (response.data.success === true) {
                                $scope.removePurchase(index);
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                )
            } else {
                $scope.removePurchase(index);
            }

        }

        //Editable Form Validation
        $scope.checkInput = function (data) {
            if (typeof data == 'undefined') {
                return "Invalid data";
            } else if (!data) {
                return "Not empty.";
            }
        };

        $scope.checkAmount = function (data) {
            if (data <= 0) {
                return "Not be 0.";
            }
        };

        $scope.checkFreeQuantityUnit = function (data, tableform, key) {
            var errorExists = false;
            var errorMsg = '';
            if (data) {
                angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                    if (!errorExists && editableValue.scope.$index == key && editableValue.attrs.eName == 'free_quantity') {
                        if (editableValue.scope.$data == "0") {
                            errorExists = true;
                            errorMsg = "Free Not be 0.";
                        } else if (editableValue.scope.$data == "") {
                            errorExists = true;
                            errorMsg = "Free Not be empty.";
                        }
                    }
                });
            }

            if (errorExists) {
                return errorMsg;
            }
        }

        $scope.checkFreeQuantity = function (data, tableform, key) {
            var errorExists = false;
            var errorMsg = '';
            if (data > 0) {
                angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                    if (!errorExists && editableValue.scope.$index == key && editableValue.attrs.eName == 'free_quantity_unit') {
                        if (editableValue.scope.$data == "") {
                            errorExists = true;
                            errorMsg = 'Choose FreeUnit'
                        }
                    }
                });
            }

            if (data < 0) {
                errorExists = true;
                errorMsg = 'Not be 0.';
            }

            if (errorExists) {
                return errorMsg;
            }
        }

        $scope.checkExpDate = function (data, key) {
            var show_warning_count = '2'; // 0 - 2 Months
            var choosen_date = new Date(data);
            var today_date = new Date();

            var d1 = choosen_date, d2 = today_date;

            if (choosen_date < today_date) {
                d1 = today_date;
                d2 = choosen_date;
            }

            var m = (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
            if (d1.getDate() < d2.getDate())
                --m;

            if (m < show_warning_count) {
                $scope.purchaseitems[key].exp_warning = 'short expiry drug';
            } else {
                $scope.purchaseitems[key].exp_warning = '';
            }
        };

        $scope.checkTempValues = function (data, key) {
            if ($scope.purchaseitems[key].is_temp == '0') {
                if (typeof data == 'undefined') {
                    return "Invalid data";
                } else if (!data) {
                    return "Not empty.";
                } else if (data <= 0) {
                    return "Not be 0.";
                }
            }
        }

        $scope.checkQuantity = function (data, key) {
            if ($scope.formtype == 'update') {
                old = $scope.purchaseitems[key].old_quantity;
                if (old > data) {
                    package_unit = $scope.purchaseitems[key].package_unit;
                    current_qty = (old - data) * package_unit;
                    stock = $scope.purchaseitems[key].available_qty; //Stock
                    total_returned_quantity = $scope.purchaseitems[key].total_returned_quantity; // Prior returned quantities

                    if (current_qty > stock) {
                        return 'No stock';
                    } else if (total_returned_quantity > parseFloat(data)) {
                        return 'Qty Mismatch';
                    }
                }
            }
        }

        $scope.productDetail = function (product_id, product_obj) {
            var deferred = $q.defer();
            deferred.notify();
            var Fields = 'product_name,purchaseVat,product_batches';

            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproducts/' + product_id + '?fields=' + Fields + '&addtfields=pharm_purchase_prod_json')
                    .success(function (product) {
                        Fields.split(",").forEach(function (item) {
                            product_obj[item] = product[item];
                        });
                        deferred.resolve();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading product!";
                        deferred.reject();
                    });

            return deferred.promise;
        };

        //Update / Clear - Single Row
        $scope.updateProductRow = function (item, model, label, key) {
            var selectedObj = $filter('filter')($scope.products, {product_id: item.product_id}, true)[0];
            $scope.productDetail(item.product_id, selectedObj).then(function () {
                $scope.purchaseitems[key].product_id = item.product_id;
                $scope.purchaseitems[key].vat_percent = selectedObj.purchaseVat.vat;
                $scope.purchaseitems[key].batches = selectedObj.product_batches;

                $scope.purchaseitems[key].batch_no = '0';
                $scope.purchaseitems[key].batch_details = '';
                $scope.purchaseitems[key].expiry_date = '';
                $scope.purchaseitems[key].quantity = 0;
                $scope.purchaseitems[key].package_name = '';
                $scope.purchaseitems[key].free_quantity = 0;
                $scope.purchaseitems[key].free_quantity_unit = "";
                $scope.purchaseitems[key].mrp = 0;
                $scope.purchaseitems[key].purchase_rate = 0;
                $scope.purchaseitems[key].purchase_amount = 0;
                $scope.purchaseitems[key].discount_percent = 0;
                $scope.purchaseitems[key].discount_amount = 0;
                $scope.purchaseitems[key].vat_amount = 0;
                $scope.purchaseitems[key].total_amount = 0;
                $scope.purchaseitems[key].temp_expiry_date = '';
                $scope.purchaseitems[key].temp_package_name = '';
                $scope.purchaseitems[key].temp_mrp = 0;
                $scope.purchaseitems[key].is_temp = 0;
                $scope.purchaseitems[key].exp_warning = '';
                $scope.updateRow(key);
            });
        }

        $scope.clearProductRow = function (data, key) {
            if (!data) {
                $scope.purchaseitems[key].product_id = '';
                $scope.purchaseitems[key].vat_percent = '0';

                $scope.purchaseitems[key].batch_no = '0';
                $scope.purchaseitems[key].batch_details = '';
                $scope.purchaseitems[key].expiry_date = '';
                $scope.purchaseitems[key].quantity = 0;
                $scope.purchaseitems[key].package_name = '';
                $scope.purchaseitems[key].free_quantity = 0;
                $scope.purchaseitems[key].free_quantity_unit = "";
                $scope.purchaseitems[key].mrp = 0;
                $scope.purchaseitems[key].purchase_rate = 0;
                $scope.purchaseitems[key].purchase_amount = 0;
                $scope.purchaseitems[key].discount_percent = 0;
                $scope.purchaseitems[key].discount_amount = 0;
                $scope.purchaseitems[key].vat_amount = 0;
                $scope.purchaseitems[key].total_amount = 0;
                $scope.purchaseitems[key].temp_expiry_date = '';
                $scope.purchaseitems[key].temp_package_name = '';
                $scope.purchaseitems[key].temp_mrp = 0;
                $scope.purchaseitems[key].is_temp = 0;
                $scope.purchaseitems[key].exp_warning = '';

                $scope.showOrHideRowEdit('show', key);
                $scope.clearRowEditables(this.$form, key);
            }
        }

        $scope.clearRowEditables = function (form, key) {
            angular.forEach(form.$editables, function (editableValue, editableKey) {
                if (editableValue.scope.$index == key && editableValue.attrs.eName != 'full_name') {
                    if (editableValue.attrs.eName == 'quantity' ||
                            editableValue.attrs.eName == 'free_quantity' ||
                            editableValue.attrs.eName == 'mrp' ||
                            editableValue.attrs.eName == 'purchase_rate' ||
                            editableValue.attrs.eName == 'discount_percent') {
                        editableValue.scope.$data = "0";
                    } else {
                        editableValue.scope.$data = "";
                    }
                }
            });
            $scope.updateRow(key);
        }

        $scope.updateBatchRow = function (item, model, label, key) {
            $scope.purchaseitems[key].batch_no = item.batch_no;
            $scope.purchaseitems[key].temp_expiry_date = item.expiry_date;
            $scope.purchaseitems[key].temp_package_name = item.package_name;
            $scope.purchaseitems[key].temp_mrp = item.mrp;

            $scope.showOrHideRowEdit('hide', key);
        }

        $scope.clearBatchRow = function (data, key) {
            if (data) {
                $scope.purchaseitems[key].batch_no = data;
            } else {
                $scope.purchaseitems[key].batch_no = '0';
            }
            $scope.showOrHideRowEdit('show', key);
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

            //Validate isNumer
            qty = !isNaN(qty) ? qty : 0;
            rate = !isNaN(rate) ? rate : 0;
            disc_perc = !isNaN(disc_perc) ? disc_perc : 0;
            vat_perc = !isNaN(vat_perc) ? vat_perc : 0;

            var purchase_amount = (qty * rate).toFixed(2);
            var disc_amount = disc_perc > 0 ? (purchase_amount * (disc_perc / 100)).toFixed(2) : 0;
            var total_amount = (purchase_amount - disc_amount).toFixed(2);
            var vat_amount = (total_amount * (vat_perc / 100)).toFixed(2); // Excluding vat
//            var vat_amount = ((total_amount * vat_perc) / (100 + vat_perc)).toFixed(2); // Including vat

            $scope.purchaseitems[key].purchase_amount = purchase_amount;
            $scope.purchaseitems[key].discount_amount = disc_amount;
            $scope.purchaseitems[key].total_amount = total_amount;
            $scope.purchaseitems[key].vat_amount = vat_amount;

            $scope.updatePurchaseRate();
        }

        $scope.updatePurchaseRate = function () {
            var total_purchase_amount = total_discount_amount = total_vat_amount = 0;
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
            before_disc_amount = (total_purchase_amount + total_vat_amount).toFixed(2); // Excluding vat
//            before_disc_amount = (total_purchase_amount).toFixed(2); // Including vat
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

            $('#t_expiry_date_' + key).addClass(t_addclass).removeClass(t_removeclass);
            $('#t_mrp_' + key).addClass(t_addclass).removeClass(t_removeclass);
            $('#t_package_name_' + key).addClass(t_addclass).removeClass(t_removeclass);
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
            $('#i_batch_details_' + key).addClass(i_addclass).removeClass(i_removeclass);

            $('#t_full_name_' + key).addClass(t_addclass).removeClass(t_removeclass);
            $('#t_batch_details_' + key).addClass(t_addclass).removeClass(t_removeclass);
        }

        $scope.getBtnId = function (btnid) {
            $scope.btnid = btnid;
        }

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
//                    $scope.purchaseitems[key].free_quantity_unit = purchaseitem.free_quantity_unit;
                } else {
                    exp_date = purchaseitem.expiry_date;
                }

                packing_details = $filter('filter')($scope.packings, {package_name: $scope.purchaseitems[key].package_name}, true);
                $scope.purchaseitems[key].package_unit = packing_details[0].package_unit;

                if (purchaseitem.free_quantity > 0 && purchaseitem.free_quantity_unit != '') {
                    free_packing_details = $filter('filter')($scope.packings, {package_name: purchaseitem.free_quantity_unit}, true);
                    $scope.purchaseitems[key].free_quantity_package_unit = free_packing_details[0].package_unit;
                }

                $scope.purchaseitems[key].expiry_date = moment(exp_date).format('YYYY-MM-DD');

                if (angular.isObject(purchaseitem.full_name)) {
                    $scope.purchaseitems[key].full_name = purchaseitem.full_name.full_name;
                } else if (typeof purchaseitem.full_name == 'undefined') {
                    $scope.purchaseitems[key].product_id = '';
                }

                if (angular.isObject(purchaseitem.batch_details)) {
                    $scope.purchaseitems[key].batch_details = purchaseitem.batch_details.batch_details;
                } else if (typeof purchaseitem.batch_details == 'undefined') {
                    $scope.purchaseitems[key].batch_no = '';
                } else if ((purchaseitem.batch_no == '0' || purchaseitem.batch_no == '') && typeof purchaseitem.batch_details !== 'undefined') {
                    $scope.purchaseitems[key].batch_no = purchaseitem.batch_details;
                }
            });

            $scope.data2 = _that.data;
            $scope.purchaseitems2 = $scope.purchaseitems;

            if (_that.data.supplier_id != null)
                $scope.getSupplierDetail(_that.data.supplier_id);

            if (_that.data.payment_type != null)
                $scope.getPaytypeDetail(_that.data.payment_type);

            angular.extend(_that.data, {product_items: $scope.purchaseitems});

            var can_save = true;
            var loop_end = false;
            var batch_error_msg = [];
            var product_items = _that.data.product_items;

            for (var i = 0; i < product_items.length; i++) {
                for (var j = i; j < product_items.length; j++) {
                    if (i !== j) {
                        if (product_items[i].product_id == product_items[j].product_id &&
                                product_items[i].batch_no == product_items[j].batch_no &&
                                product_items[i].expiry_date == product_items[j].expiry_date) {
                            if (product_items[i].package_unit != product_items[j].package_unit) {
                                can_save = false;
                                batch_error_msg.push({
                                    message: 'Already PurchaseUnit (' + product_items[i].package_name + ') assigned to this Product (' + product_items[i].full_name + ') and Batch (' + product_items[i].batch_details + ') and Exp (' + product_items[i].expiry_date + '), So you can not choose different PurchaseUnit (' + product_items[j].package_name + ')'
                                });
                            }
                        }
                    }
                }

                if (i == product_items.length - 1) {
                    loop_end = true;
                }
            }
            if (loop_end && !can_save) {
                $scope.errorData = $scope.errorSummary(batch_error_msg);
            }

            if (loop_end && can_save) {
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
                                    $scope.msg.successMessage = 'New Purchase bill generated  ' + response.invoice_no;
                                } else {
                                    $scope.msg.successMessage = 'Purchase updated successfully';
                                }

                                if ($scope.btnid == "print") {
                                    $scope.printPurchaseBill(response.purchaseId);
                                    $state.go($state.current, {}, {reload: true});
                                } else {
                                    $state.go($state.current, {}, {reload: true});
                                }
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
            }
        };

        /*PRINT BILL*/
        $scope.printHeader = function () {
            return {
                text: "Purchase Bill",
                margin: 5,
                alignment: 'center'
            };
        }

        $scope.printFooter = function () {
//            return true;
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
            var generated_by = $scope.app.username;

            var content = [];
            var purchaseInfo = [];
            var purchaseItems = [];

            var result_count = Object.keys($scope.purchaseitems2).length;
            var index = 1;
            var loop_count = 0;

            var purchase = $scope.data2;
            purchaseItems.push([
                {text: 'S.No', style: 'header'},
                {text: 'Product Name', style: 'header'},
                {text: 'Batch No', style: 'header'},
                {text: 'Exp Date', style: 'header'},
                {text: 'Qty', style: 'header'},
                {text: 'P.Unit', style: 'header'},
                {text: 'Free', style: 'header'},
                {text: 'FreeUnit', style: 'header'},
                {text: 'MRP', style: 'header'},
                {text: 'P.Price', style: 'header'},
                {text: 'Amt', style: 'header'},
                {text: 'Dis %', style: 'header'},
                {text: 'Dis Amt', style: 'header'},
                {text: 'P.Vat%', style: 'header'},
                {text: 'Vat Amt', style: 'header'},
                {text: 'Total Amt', style: 'header'},
            ]);

            angular.forEach($scope.purchaseitems2, function (row, key) {
                purchaseItems.push([
                    index.toString(),
                    row.product.full_name,
                    row.batch_no,
                    moment(row.expiry_date).format('MM/YY'),
                    row.quantity.toString(),
                    row.package_name,
                    row.free_quantity,
                    (row.free_quantity_package_unit ? row.free_quantity_package_unit : '-'),
                    row.mrp,
                    row.purchase_rate,
                    row.purchase_amount,
                    (row.discount_percent ? row.discount_percent : '-'),
                    row.discount_amount,
                    row.vat_percent,
                    row.vat_amount,
                    row.total_amount,
                ]);
                index++;
                loop_count++;
            });

            purchaseInfo.push({
                columns: [
                    {
                        text: [
                            {text: 'Invoice No: ', bold: true},
                            purchase.invoice_no
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: [
                            {text: 'Payment Type: ', bold: true},
                            purchase.payment_type_name
                        ],
                        margin: [0, 0, 0, 10]
                    }

                ]
            }, {
                columns: [
                    {
                        text: [
                            {text: 'Invoice Date: ', bold: true},
                            purchase.invoice_date
                        ],
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: [
                            {text: ' Supplier Name: ', bold: true},
                            purchase.supplier_name
                        ],
                        margin: [0, 0, 0, 10]
                    }
                ]
            }, {
                columns: [
                    {
                        text: [
                            {text: 'GR No: ', bold: true},
                            purchase.gr_num
                        ],
                        margin: [0, 0, 0, 20]
                    },
                ]
            }, {
                style: 'demoTable',
                margin: [0, 0, 0, 20],
                table: {
                    headerRows: 1,
                    widths: [30, '*', '*', 40, 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', '*', 'auto', '*', 'auto', '*', '*'],
                    body: purchaseItems,
                },
//                pageBreak: (loop_count === result_count ? '' : 'after'),
            }, {
                columns: [
                    {
                        alignment: 'right',
                        text: [
                            {text: 'Total Disc. Amount: ', bold: true},
                            purchase.total_item_discount_amount + '\n\n',
                            {text: 'Total Vat Amount: ', bold: true},
                            purchase.total_item_vat_amount + '\n\n',
                            {text: 'Total Amount: ', bold: true},
                            purchase.total_item_purchase_amount + '\n\n',
                            {text: 'Disc(' + purchase.discount_percent + ') %: ', bold: true},
                            purchase.discount_amount + '\n\n',
                            {text: 'Before Disc. Total: ', bold: true},
                            purchase.before_disc_amount + '\n\n',
                            {text: 'After Disc. Total: ', bold: true},
                            purchase.after_disc_amount + '\n\n',
                            {text: 'Round Off: ', bold: true},
                            purchase.roundoff_amount + '\n\n',
                            {text: 'Net Amount: ', bold: true},
                            purchase.net_amount + '\n\n',
                        ],
                    }
                ]
            });
            content.push(purchaseInfo);
            if (index == result_count) {
                $scope.printloader = '';
            }
            return content;
        }

        var save_success = function () {
            if ($scope.btnid == "print") {
                $scope.printloader = '<i class="fa fa-spin fa-spinner"></i>';
                var print_content = $scope.printContent();
                if (print_content.length > 0) {
                    var docDefinition = {
                        header: $scope.printHeader(),
                        footer: $scope.printFooter(),
                        styles: $scope.printStyle(),
                        content: print_content,
                        pageSize: 'A4',
                        pageOrientation: 'landscape',
                    };
                    var pdf_document = pdfMake.createPdf(docDefinition);
                    var doc_content_length = Object.keys(pdf_document).length;
                    if (doc_content_length > 0) {
                        pdf_document.print();
                    }
                }
            } else {
                $state.go($state.current, {}, {reload: true});
            }
        }

        $scope.purchaseDetail = function (purchase_id) {
            $scope.data2 = {};
            $scope.purchaseitems2 = [];
            $scope.loadbar('show');

            var deferred = $q.defer();
            deferred.notify();

            $http.get($rootScope.IRISOrgServiceUrl + "/pharmacypurchases/" + purchase_id + "?addtfields=purchase_print")
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.data2 = response;

                        $scope.purchaseitems2 = response.items;
                        angular.forEach($scope.purchaseitems2, function (item, key) {
                            angular.extend($scope.purchaseitems2[key], {
                                full_name: item.product.full_name,
                                batch_no: item.batch.batch_no,
                                batch_details: item.batch.batch_details,
                                expiry_date: item.batch.expiry_date,
                                quantity: item.quantity,
                            });
                        });
                        deferred.resolve();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading purchase!";
                        deferred.reject();
                    });

            return deferred.promise;
        };

        $scope.printPurchaseBill = function (purchase_id) {
            $scope.purchaseDetail(purchase_id).then(function () {
                delete $scope.data2.items;
                $scope.btnid = 'print';
                save_success();
            });
        }

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/pharmacypurchases/" + $state.params.id + "?addtfields=purchase_update",
                method: "GET"
            }).success(
                    function (response) {

//                        $rootScope.commonService.GetProductList('', '1', false, function (response2) {
//                        });
                        $scope.loadbar('hide');

                        $scope.data = response;
                        if ($scope.data.supplier_id != null)
                            $scope.getSupplierDetail($scope.data.supplier_id);

                        if ($scope.data.payment_type != null)
                            $scope.getPaytypeDetail($scope.data.payment_type);

                        $scope.products = [];
//                            $scope.products = response2.productList;

                        $scope.purchaseitems = response.items;
                        angular.forEach($scope.purchaseitems, function (item, key) {
                            angular.extend($scope.purchaseitems[key], {
                                is_temp: '0',
                                full_name: item.product.full_name,
                                batch_no: item.batch.batch_no,
                                batch_details: item.batch.batch_details,
                                temp_expiry_date: item.batch.expiry_date,
                                temp_mrp: item.batch.mrp,
                                temp_package_name: item.package_name,
                                old_quantity: item.quantity,
                                available_qty: item.batch.available_qty,
                            });
                            $timeout(function () {
                                $scope.showOrHideRowEdit('hide', key);
                                $scope.showOrHideProductBatch('hide', key);
                            });
                        });

                        $timeout(function () {
                            delete $scope.data.supplier;
                            delete $scope.data.items;
                        }, 3000);
                        $scope.updatePurchaseRate();
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.changeGetSupplier = function () {
            _that = this;
            $scope.getSupplierDetail(_that.data.supplier_id);
        }

        $scope.getSupplierDetail = function (supplier_id) {
            supplier_details = $filter('filter')($scope.suppliers, {supplier_id: supplier_id});
            $scope.supplier_name_taken = supplier_details[0].supplier_name;
        }

        $scope.changeGetPayType = function () {
            _that = this;
            $scope.getPaytypeDetail(_that.data.payment_type);
        }

        $scope.getPaytypeDetail = function (payment_type) {
            payment_type_detail = $filter('filter')($scope.paymentTypes, {value: payment_type});
            $scope.purchase_type_name = payment_type_detail[0].label;
        }

        $scope.setFutureInternalCode = function (code, col) {
            $rootScope.commonService.GetInternalCodeList('', code, '1', false, function (response) {
                if (col == 'gr_num')
                    $scope.data.gr_num = response.code.next_fullcode;
            });
        }

        $scope.make_payment = function (purchase_id) {
            purchase = $filter('filter')($scope.displayedCollection, {purchase_id: purchase_id});

            var modalInstance = $modal.open({
                templateUrl: 'tpl/pharmacy_purchase/modal.makepayment.html',
                controller: "PurchaseMakePaymentController",
                size: 'md',
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });
            modalInstance.data = {
                purchase: purchase[0],
            };
        }

        $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var d = new Date();
            var n = d.getDate();
            var m = d.getMonth();
            var y = d.getFullYear();
            var today_date = (new Date(y, m, n)).valueOf();
            if (!$scope.checkAccess('pharmacy.backdatepurchase')) {
                angular.forEach($dates, function (date, key) {
                    var calender = new Date(date.localDateValue());
                    var calender_n = calender.getDate();
                    var calender_m = calender.getMonth();
                    var calender_y = calender.getFullYear();
                    var calender_date = (new Date(calender_y, calender_m, calender_n)).valueOf();
                    if (today_date > calender_date) {
                        $dates[key].selectable = false;
                    }
                });
            }
        }

        var changeTimer = false;

        $scope.getProduct = function (purchaseitem) {
//            var name = purchaseitem.full_name.$viewValue;
//            if (changeTimer !== false)
//                clearTimeout(changeTimer);
//
//            changeTimer = setTimeout(function () {
//                $scope.loadbar('show');
//                $rootScope.commonService.GetProductListByName(name, function (response) {
//                    if (response.productList.length > 0)
//                        $scope.products = response.productList;
//                    $scope.loadbar('hide');
//                });
//                changeTimer = false;
//            }, 300);
        }
        $scope.removeRow = function (purchase_id) {
            var conf = confirm('Are you sure to delete ?');
            if (conf)
            {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/pharmacypurchase/checkdelete",
                    method: "POST",
                    data: {id: purchase_id}
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadPurchaseItemList('CA');
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                )
            }
        }
    }]);