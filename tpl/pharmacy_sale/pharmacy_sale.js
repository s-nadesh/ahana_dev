/* global words */
app.filter('words', function () {
    return function (value) {
        var value1 = parseInt(value);
        if (value1 && isInteger(value1))
            return  toWords(value1);

        return value;
    };

    function isInteger(x) {
        return x % 1 === 0;
    }
});

var th = ['', 'thousand', 'million', 'billion', 'trillion'];
var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function toWords(s)
{
    s = s.toString();
    s = s.replace(/[\, ]/g, '');
    if (s != parseFloat(s))
        return 'not a number';
    var x = s.indexOf('.');
    if (x == -1)
        x = s.length;
    if (x > 15)
        return 'too big';
    var n = s.split('');
    var str = '';
    var sk = 0;
    for (var i = 0; i < x; i++)
    {
        if ((x - i) % 3 == 2)
        {
            if (n[i] == '1')
            {
                str += tn[Number(n[i + 1])] + ' ';
                i++;
                sk = 1;
            } else if (n[i] != 0)
            {
                str += tw[n[i] - 2] + ' ';
                sk = 1;
            }
        } else if (n[i] != 0)
        {
            str += dg[n[i]] + ' ';
            if ((x - i) % 3 == 0)
                str += 'hundred ';
            sk = 1;
        }


        if ((x - i) % 3 == 1)
        {
            if (sk)
                str += th[(x - i - 1) / 3] + ' ';
            sk = 0;
        }
    }
    if (x != s.length)
    {
        var y = s.length;
        str += 'point ';
        for (var i = x + 1; i < y; i++)
            str += dg[n[i]] + ' ';
    }
    return capitalise(str.replace(/\s+/g, ' '));
}

function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toUpperCase();
}

window.toWords = toWords;

app.controller('SaleController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$anchorScroll', '$filter', '$timeout', '$modal', '$location', '$q', 'hotkeys', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $anchorScroll, $filter, $timeout, $modal, $location, $q, hotkeys) {

        hotkeys.bindTo($scope)
                .add({
                    combo: 'f5',
                    description: 'Create',
                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
                    callback: function () {
                        $state.go('pharmacy.saleCreate', {}, {reload: true});
                    }
                })
                .add({
                    combo: 'f8',
                    description: 'Cancel',
                    callback: function (e) {
                        if (confirm('Are you sure want to leave?')) {
                            $state.go('pharmacy.sales', {}, {reload: true});
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
                        $state.go('pharmacy.sales')
                        event.preventDefault();
                    }
                });
        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        $scope.show_patient_loader = false;
        $scope.show_consultant_loader = false;
        $scope.show_encounter_loader = false;
        $scope.show_group_loader = false;

        //Expand table in Index page
        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        //Create page height
        $scope.css = {'style': ''};

        //Index Page

        $scope.loadSaleItemList = function (payment_type) {
            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
            $rootScope.commonService.GetMonth(function (response) {
                $scope.months = response;
            });
            $rootScope.commonService.GetYear(function (response) {
                $scope.years = response;
            });
            $scope.payment_type = payment_type;
            $scope.maxSize = 5; // Limit number for pagination display number.  
            $scope.totalCount = 0; // Total number of items in all pages. initialize as a zero  
            $scope.pageIndex = 1; // Current page number. First page is 1.-->  
            $scope.pageSizeSelected = 10; // Maximum number of items per page.

            $scope.errorData = $scope.msg.successMessage = '';
            $scope.isLoading = true;


            // pagination set up
            $scope.rowCollection = [];  // base collection
            //$scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            $scope.getSaleList(payment_type);

            //Consultant List - Index Print Bill Section 
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
            });
        };

        $scope.getSaleList = function (payment_type) {
            if (payment_type == 'CA') {
                $scope.sale_payment_type_name = 'Cash';
            }
            if (payment_type == 'CR') {
                $scope.sale_payment_type_name = 'Credit';
            }
            if (payment_type == 'COD') {
                $scope.sale_payment_type_name = 'Cash On Deleivery';
            }
            $scope.sale_payment_type = payment_type;

            $scope.activeMenu = payment_type;
            var pageURL = $rootScope.IRISOrgServiceUrl + '/pharmacysale/getsales?addtfields=sale_list&payment_type=' + payment_type + '&pageIndex=' + $scope.pageIndex + '&pageSize=' + $scope.pageSizeSelected;

            if (typeof $scope.form_filter != 'undefined' && $scope.form_filter != '') {
                pageURL += '&s=' + $scope.form_filter;
            }
            if (typeof $scope.day != 'undefined' && $scope.day != '' && typeof $scope.month != 'undefined' && $scope.month != '' && typeof $scope.year != 'undefined' && $scope.year != '') {
                pageURL += '&dt=' + $scope.year + '-' + $scope.month + '-' + $scope.day;
            }
            // Get data's from service
            //$http.get($rootScope.IRISOrgServiceUrl + '/pharmacysale/getsales?payment_type=' + payment_type + '&addtfields=sale_list')
            $http.get(pageURL)
                    .success(function (saleList) {
                        $scope.isLoading = false;
                        $scope.rowCollection = saleList.sales;
                        $scope.totalCount = saleList.totalCount;

                        angular.forEach($scope.rowCollection, function (row) {
                            row.all_dates = '';
                            angular.forEach(row.items, function (saleitem) {
                                row.all_dates += saleitem.sale_date + " ";
                            });
                        });

                        $scope.displayedCollection = [].concat($scope.rowCollection);
                        //$scope.form_filter = null;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading saleList!";
                    });
        }

        $scope.pageChanged = function () {
            $scope.getSaleList($scope.payment_type);
        };
        //This method is calling from dropDown  
        $scope.changePageSize = function () {
            $scope.pageIndex = 1;
            $scope.getSaleList($scope.payment_type);
        };

        //For Form
        $scope.formtype = '';
        $scope.initForm = function (formtype) {
            $scope.data = {};
            if (formtype == 'add') {
                $scope.formtype = 'add';
                $scope.data.payment_type = 'CA';
                $scope.data.payment_mode = 'CA';
                $scope.data.sale_date = moment().format('YYYY-MM-DD');
                $scope.data.formtype = 'add';
//                $scope.setFutureInternalCode('SA', 'bill_no');
                $scope.addRow();
            } else {
                $scope.formtype = 'update';
                $scope.data.formtype = 'update';
                $scope.loadForm(); // Waiting For testing
            }

            $scope.encounters = [];

            $scope.show_consultant_loader = true;
            //Consultant List
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
                $scope.show_consultant_loader = false;
            });

            //Payment types
            $rootScope.commonService.GetPaymentType(function (response) {
                $scope.paymentTypes = response;
                $scope.paymentTypes.push({value: 'COD', label: 'Cash On Delivery'});
            });

            //Patient Groups
            $scope.show_group_loader = true;
            $rootScope.commonService.GetPatientGroup('1', false, function (response) {
                $scope.patientgroups = response.patientgroupList;
                $scope.show_group_loader = false;
            });

            $rootScope.commonService.GetHsnCode('1', false, function (response) {
                $scope.hsncodes = response.hsncodeList;
            });

            $rootScope.commonService.GetPaymentModes(function (response) {
                $scope.paymentModes = response;
            });

            $rootScope.commonService.GetCardTypes(function (response) {
                $scope.cardTypes = response;
            });

            $scope.productloader = '<i class="fa fa-spin fa-spinner"></i>';
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct?fields=product_id,full_name&not_expired=1&full_name_with_stock=1')
                    .success(function (products) {
                        $scope.products = products;
                        $scope.productloader = '';
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading products!";
                    });
        }

        $scope.showExpiryDate = function (saleitem) {
            if (saleitem.expiry_date) {
                return moment(saleitem.expiry_date).format('MMM YYYY');
            } else {
                return 'empty';
            }
        };

        $scope.formatPatient = function ($item, $model, $label) {
            $scope.data.patient_id = $item.patient_id;
            $scope.data.patient_guid = $item.patient_guid;
            $scope.data.patient_name = $item.fullname;
            $scope.data.consultant_id = $item.last_consultant_id;
            $scope.data.consultant_name = $item.consultant_name;
            var patient_int_code = $item.patient_global_int_code;
            $scope.patient_int_code = patient_int_code;
            $scope.getEncounter($item.patient_id, 'add', '');
            $scope.getPatientGroupByPatient($item.patient_guid);
        }
        $scope.changePatient = function () {
            $scope.data.patient_id = '';
            $scope.data.patient_guid = '';
            $scope.data.consultant_id = '';
            $scope.data.consultant_name = '';
            $scope.data.patient_group_id = '';
            $scope.data.patient_group_name = '';
            $scope.data.encounter_id = '';
        }

        $scope.formatDoctor = function ($item, $model, $label) {
            $scope.data.consultant_id = $item.user_id;
            $scope.data.consultant_name = $item.fullname;
        }

        $scope.getEncounter = function (patient_id, mode, encounter_id) {
            if (patient_id) {
                $scope.show_encounter_loader = true;
                $rootScope.commonService.GetEncounterListByTenantSamePatient('', '0,1', false, patient_id, function (response) {
                    //$rootScope.commonService.GetEncounterListByPatient('', '0,1', false, patient_id, function (response) {
                    angular.forEach(response, function (resp) {
                        resp.encounter_id = resp.encounter_id.toString();
                    });
                    $scope.encounters = response;
                    if (response.length > 0 && response != null && mode == 'add') {
                        $scope.data.encounter_id = response[0].encounter_id;
                        $scope.getPrescription(); //Waiting For testing
                    } else if (mode == 'edit') {
                        $scope.data.encounter_id = encounter_id.toString();
                    }
                    $scope.show_encounter_loader = false;
                }, 'sale_encounter_id', '', 'old_encounter');
            }

        }

        $scope.getPatientGroupByPatient = function (patient_id) {
            if (patient_id) {
                $scope.show_group_loader = true;
                $http.get($rootScope.IRISOrgServiceUrl + '/patientgroup/getpatientgroupbypatient?id=' + patient_id)
                        .success(function (response) {
                            $scope.data.patient_group_id = $scope.data.patient_group_name = '';
                            if (response.groups.length) {
                                $scope.data.patient_group_id = response.groups[0].patient_group_id;
                                $scope.data.patient_group_name = response.groups[0].group_name;
                            }
                            $scope.show_group_loader = false;
                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured while loading groups!";
                        });
            }
        }

        $scope.updatePatientGroupname = function () {
            selected = $filter('filter')($scope.patientgroups, {patient_group_id: $scope.data.patient_group_id}, true);
            if (selected.length)
                $scope.data.patient_group_name = selected[0].group_name;
            else
                $scope.data.patient_group_name = '';
        }

        //Sale Date Datepicker
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

        // Sale Items Array
        $scope.saleItems = [];
        // Add first row in sale item table.
        $scope.addRow = function (focus) {
            $scope.sale_item_error = '';
            $scope.inserted = {
                product_id: '',
                product_name: '',
                product_location: '',
                full_name: '',
                batch_no: '',
                batch_details: '',
                expiry_date: '',
                quantity: '0',
                package_name: '',
                mrp: '0',
                item_amount: '0',
                discount_percentage: '0',
                discount_amount: '0',
                vat_percent: '0',
                vat_amount: '0',
                total_amount: '0',
                generic_id: '',
            };
            if ($scope.saleItems.length > 0) {
                if ((!$scope.saleItems[$scope.saleItems.length - 1].product_id) || (!$scope.saleItems[$scope.saleItems.length - 1].batch_no)) {
                    $scope.sale_item_error = "Kindly fill the items details";
                } else {
                    $scope.saleItems.push($scope.inserted);
                }
            } else {
                $scope.saleItems.push($scope.inserted);
            }

            if (focus) {
                if ($scope.saleItems.length > 1) {
                    $timeout(function () {
                        $scope.setFocus('full_name', $scope.saleItems.length - 1);
                    });
                }
            }

            if ($scope.saleItems.length > 6) {
                $scope.css = {
                    'style': 'height:360px; overflow-y: auto; overflow-x: hidden;',
                };
            }
        };

        // Remove Sale Item
        $scope.removeSaleItem = function (index) {
            if ($scope.saleItems.length == 1) {
                alert('Can\'t Delete. Sale Item must be atleast one.');
                return false;
            }
            $scope.removeSaleRow(index);
        };

        $scope.removeSaleRow = function (index) {
            $scope.updateBatch('delete');
            $scope.saleItems.splice(index, 1);
            $scope.updateSaleRate();
            $timeout(function () {
                $scope.setFocus('full_name', $scope.saleItems.length - 1);
            });

            if ($scope.saleItems.length <= 6) {
                $scope.css = {
                    'style': '',
                };
            }
        };

        //Update Page Remove Sale Item
        $scope.updateremoveSaleItem = function (index, sale_item_id) {
            if ($scope.saleItems.length == 1) {
                alert('Can\'t Delete. Sale Item must be atleast one.');
                return false;
            }
            if (sale_item_id)
            {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/pharmacysale/checkitemdelete",
                    method: "POST",
                    data: {id: sale_item_id}
                }).then(
                        function (response) {
                            if (response.data.success === true) {
                                $scope.removeSaleRow(index);
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                )
            } else {
                $scope.removeSaleRow(index);
            }
        }

        //Set cursor to first input box
        $scope.setFocus = function (id, index) {
            angular.element(document.querySelectorAll("#" + id))[index].focus();
        };

        //Check all the input box.
        $scope.checkInput = function (data, key, index) {
            item = $scope.saleItems[key];
            if (typeof item != 'undefined') {
                if (key > 0 && item.product_name == '' && item.batch_no == '' && item.quantity == 0) {
                    $scope.removeSaleItem(index);
                } else {
                    if (!data) {
                        return "Not empty";
                    }
                }
            }
        };

        $scope.checkHsn = function (data, key, index) {
            item = $scope.saleItems[key];
            if (typeof item != 'undefined') {
                if (key > 0 && item.product_name == '' && item.batch_no == '' && item.quantity == 0) {

                } else {
                    if (!data && !item.hsn_no && !item.temp_hsn_no) {
                        return "Not empty";
                    }
                }
            }
        };

        $scope.checkAmount = function (data, key, index) {
            item = $scope.saleItems[key];
            if (typeof item != 'undefined') {
                if (key > 0 && item.product_name == '' && item.batch_no == '' && item.quantity == 0) {
//                    $scope.removeSaleItem(index);
                } else {
                    if (data <= 0) {
                        return "Not be 0";
                    }
                }
            }
        };

        $scope.checkTotalpercentage = function (data, key, index) {
            item = $scope.saleItems[key];
            if (typeof item != 'undefined') {
                if (item.discount_percentage > 100) {
                    return "Discount percentage less than 100";
                }
            }
        }

        $scope.checkQuantity = function (data, key) {
            if ($scope.formtype == 'update') {
                var old = $scope.saleItems[key].old_quantity;
                var package_unit = $scope.saleItems[key].package_unit;
                var stock = $scope.saleItems[key].available_qty; //Stock
                var total_returned_quantity = $scope.saleItems[key].total_returned_quantity; // Prior returned quantities

                var error_exists = false;
                var error_msg = '';
                if (old > data) {
                    if (parseFloat(total_returned_quantity) > parseFloat(data)) {
                        error_exists = true;
                        error_msg = 'Qty Mismatch';
                    }
                } else {
                    var current_qty = (data - old) * package_unit;
                    if (current_qty > stock) {
                        error_exists = true;
                        error_msg = 'No stock';
                    }
                }

                if (error_exists && error_msg != '') {
                    return error_msg;
                }
            } else {
                if (data <= 0) {
                    return "Not be 0";
                }
            }
        }

        $scope.clearProductRow = function (data, key) {
            if (!data) {
                $scope.saleItems[key].product_id = '';
                $scope.saleItems[key].product_name = '';
                $scope.saleItems[key].product_location = '';
                $scope.saleItems[key].vat_percent = '0';
                $scope.saleItems[key].package_name = '';
                $scope.saleItems[key].batch_details = '';
                $scope.saleItems[key].batch_no = '';
                $scope.saleItems[key].expiry_date = '';
                $scope.saleItems[key].hsn_no = '';
                $scope.saleItems[key].temp_hsn_no = '';
                $scope.saleItems[key].mrp = 0;
                $scope.saleItems[key].quantity = 0;
                $scope.saleItems[key].discount_percentage = 0;
                $scope.saleItems[key].generic_id = '';
                $scope.saleItems[key].product_batches = [];
                $scope.showOrHideRowEdit('show', key);
                $scope.clearFormEditables(this.$form, key);
            }
        }

        $scope.clearFormEditables = function (form, key) {
            angular.forEach(form.$editables, function (editableValue, editableKey) {
                if (editableValue.scope.$index == key && editableValue.attrs.eName != 'full_name') {
                    if (editableValue.attrs.eName == 'quantity' ||
                            editableValue.attrs.eName == 'mrp' ||
                            editableValue.attrs.eName == 'discount_percentage') {
                        editableValue.scope.$data = "0";
                    } else {
                        editableValue.scope.$data = "";
                    }
                }
            });
            $scope.updateRow(key);
        }

        $scope.productDetail = function (product_id, product_obj) {
            var deferred = $q.defer();
            deferred.notify();
            var Fields = 'product_name,product_location,product_reorder_min,full_name,salesVat,salesPackageName,availableQuantity,generic_id,product_batches,hsnCode,originalQuantity,gst';

            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproducts/' + product_id + '?fields=' + Fields + '&addtfields=pharm_sale_prod_json&full_name_with_stock=1')
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

        $scope.updateAlternateProductRow = function (data, key, index) {
            if (data) {
                var selectedObj = $filter('filter')($scope.products, {product_id: data.product_id}, true)[0];
                $scope.productDetail(data.product_id, selectedObj).then(function () {
                    $scope.saleItems[key].product_id = selectedObj.product_id;
                    $scope.saleItems[key].full_name = selectedObj.full_name;
                    $scope.saleItems[key].product_name = selectedObj.product_name;
                    $scope.saleItems[key].product_location = selectedObj.product_location;
                    $scope.saleItems[key].vat_percent = selectedObj.salesVat.vat;
                    $scope.saleItems[key].package_name = selectedObj.salesPackageName;
                    $scope.saleItems[key].generic_id = selectedObj.generic_id;
                    $scope.saleItems[key].product_batches = selectedObj.product_batches;
                    $('#i_full_name_' + key + ' #full_name').val(selectedObj.full_name);

                    $scope.productInlineAlert(selectedObj, key);

                    $scope.updateRow(key);

                    if (!$scope.saleItems[key].out_of_stock_msg) {
                        $('#i_alternate_medicine_' + key).addClass('hide');
                        $scope.setFocus('batch_details', index);
                    }
                });
            }
        }

        //After product choosed, then update some obejct attributes in the sale items array.
        $scope.updateProductRow = function (item, model, label, key) {
            var selectedObj = $filter('filter')($scope.products, {product_id: item.product_id}, true)[0];
            $scope.productDetail(item.product_id, selectedObj).then(function () {
                $scope.saleItems[key].product_id = selectedObj.product_id;
                $scope.saleItems[key].product_name = selectedObj.product_name;
                $scope.saleItems[key].product_location = selectedObj.product_location;
                $scope.saleItems[key].full_name = selectedObj.full_name;
                $scope.saleItems[key].vat_percent = selectedObj.salesVat.vat;
                $scope.saleItems[key].package_name = selectedObj.salesPackageName;
                $scope.saleItems[key].generic_id = selectedObj.generic_id;
                $scope.saleItems[key].product_batches = selectedObj.product_batches;
                if (selectedObj.gst != '-') {
                    $scope.saleItems[key].sgst_percent = (parseFloat(selectedObj.gst) / 2).toFixed(2);
                    $scope.saleItems[key].cgst_percent = (parseFloat(selectedObj.gst) / 2).toFixed(2);
                } else {
                    $scope.saleItems[key].sgst_percent = 2.5;
                    $scope.saleItems[key].cgst_percent = 2.5;
                }
                $scope.saleItems[key].temp_hsn_no = selectedObj.hsnCode;

                $scope.getreadyBatch(selectedObj, key);
                $scope.productInlineAlert(selectedObj, key);
                if (selectedObj.hsnCode)
                    $scope.showOrHideRowEdit('hide', key);

                $scope.updateRow(key);
            });
        }

        $scope.showOrHideRowEdit = function (mode, key) {
            if (mode == 'hide') {
                i_addclass = t_removeclass = 'hide';
                i_removeclass = t_addclass = '';
            } else {
                i_addclass = t_removeclass = '';
                i_removeclass = t_addclass = 'hide';
            }
            $('#i_hsn_no_' + key).addClass(i_addclass).removeClass(i_removeclass);

            $('#t_hsn_no_' + key).addClass(t_addclass).removeClass(t_removeclass);
        }

        $scope.getreadyBatch = function (item, key) {
            $scope.saleItems[key].batch_details = '';
            $scope.saleItems[key].batch_no = '';
            $scope.saleItems[key].expiry_date = '';
            $scope.saleItems[key].mrp = 0;
            $scope.saleItems[key].quantity = 0;
            if (item.availableQuantity <= 0) {
                $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getproductlistbygeneric?generic_id=' + item.generic_id + '&addtfields=pharm_sale_alternateprod')
                        .success(function (product) {
                            //For alternate medicines
                            item.alternateproducts = product.productList.filter(function (n) {
                                return (n.product_id != item.product_id && n.product_batches_count > '0')
                            });
                            $scope.saleItems[key].alternateproducts = item.alternateproducts;
                            if ($scope.saleItems[key].alternateproducts.length) {
                                $('#i_alternate_medicine_' + key).removeClass('hide');
                            } else {
                                $('#i_alternate_medicine_' + key).addClass('hide');
                            }
                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured while loading product!";
                        });
            }
        }

        $scope.productInlineAlert = function (item, key) {
            $scope.saleItems[key].min_reorder_msg = '';
            $scope.saleItems[key].out_of_stock_msg = '';

            if (item.availableQuantity == 0) {
                $scope.saleItems[key].out_of_stock_msg = 'Out of stock';
            } else if (item.availableQuantity <= item.product_reorder_min) {
                $scope.saleItems[key].min_reorder_msg = 'reached min order level (' + item.product_reorder_min + ')';
            }
        }

        $scope.updateDisplayCollection = function (enc_id, resp) {
            selected = $filter('filter')($scope.displayedCollection, {encounter_id: enc_id});
            var index = $scope.displayedCollection.indexOf(selected[0]);
            $scope.displayedCollection.splice(index, 1);
            $scope.displayedCollection.push(resp);
        }

        $scope.showBatch = function (batch, key) {
            if (batch) {
                prod_batches = $scope.saleItems[key].product_batches;
                selected = $filter('filter')(prod_batches, {batch_details: batch}, true);
                if (selected) {
                    return selected.length ? selected[0].batch_details : 'Not set';
                } else {
                    return 'Not set';
                }
            }
        };

        $scope.showAlternateProduct = function (product) {
            var selected = [];
            if (product.product_id) {
                selected = $filter('filter')($scope.products, {product_id: product.product_id});
            }
            if (selected) {
                return selected.length ? selected[0].full_name : 'Not set';
            } else {
                return 'Not set';
            }
        };

        //After barch choosed, then update some values in the row.
        $scope.updateBatchRow = function (batch, key) {
            var prod_batches = $scope.saleItems[key].product_batches;
            var selected = $filter('filter')(prod_batches, {batch_details: batch}, true);
            if (selected.length > 0) {
                item = selected[0];
                $scope.saleItems[key].batch_details = item.batch_details;
                $scope.saleItems[key].batch_no = item.batch_no;
                $scope.saleItems[key].expiry_date = item.expiry_date;
//            $scope.saleItems[key].mrp = item.mrp;
                $scope.saleItems[key].mrp = item.per_unit_price;

                $scope.setFocus('quantity', key);
                $scope.checkExpDate(item.expiry_date, key);
//            $scope.addRowWhenFocus(key);
            }
        }

        $scope.checkExpDate = function (data, key) {
            var choosen_date = new Date(data);
            var choosen_date_month = choosen_date.getMonth();
            var choosen_date_year = choosen_date.getYear();

            var today_date = new Date();
            var today_date_month = today_date.getMonth();
            var today_date_year = today_date.getYear();

            var show_warning_count = '3';
            var show_warning = parseFloat(choosen_date_month) - parseFloat(today_date_month);

            if (show_warning < show_warning_count && today_date_year == choosen_date_year) {
                $scope.saleItems[key].exp_warning = 'short expiry drug';
            } else {
                $scope.saleItems[key].exp_warning = '';
            }
        };

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
            $('#i_hsn_no_' + key).addClass(i_addclass).removeClass(i_removeclass);

            $('#t_full_name_' + key).addClass(t_addclass).removeClass(t_removeclass);
            $('#t_batch_details_' + key).addClass(t_addclass).removeClass(t_removeclass);
            $('#t_hsn_no_' + key).addClass(t_addclass).removeClass(t_removeclass);
        }

        $scope.updateColumn = function ($data, key, column, tableform) {
            $scope.saleItems[key][column] = $data;
            $scope.updateRow(key, column, tableform);
        }

        //Update other informations in the row
        $scope.updateRow = function (key, column, tableform) {
            //Get Data
            var qty = parseFloat($scope.saleItems[key].quantity);
            var mrp = parseFloat($scope.saleItems[key].mrp);
            var disc_perc = parseFloat($scope.saleItems[key].discount_percentage);
            var disc_amount = parseFloat($scope.saleItems[key].discount_amount);
            var vat_perc = parseFloat($scope.saleItems[key].vat_percent);
            var cgst_perc = parseFloat($scope.saleItems[key].cgst_percent);
            var sgst_perc = parseFloat($scope.saleItems[key].sgst_percent);

            //Validate isNumer
            qty = !isNaN(qty) ? qty : 0;
            disc_perc = !isNaN(disc_perc) ? disc_perc : 0;
            disc_amount = !isNaN(disc_amount) ? disc_amount : 0;
            vat_perc = !isNaN(vat_perc) ? vat_perc : 0;


//            var vat_amount = (item_amount * (vat_perc / 100)).toFixed(2); // Exculding vat

            var taxable_value = (((mrp / (100 + sgst_perc + cgst_perc)) * 100).toFixed(2) * qty).toFixed(2);
            //var cgst_amount = ((total_amount * cgst_perc) / (100 + cgst_perc)).toFixed(2); // Including vat
            //var sgst_amount = ((total_amount * sgst_perc) / (100 + sgst_perc)).toFixed(2); // Including vat
            var cgst_amount = (((taxable_value * cgst_perc) / 100)).toFixed(2); // Including vat
            var sgst_amount = (((taxable_value * sgst_perc) / 100)).toFixed(2); // Including vat

            var item_amount = (parseFloat(taxable_value) + parseFloat(cgst_amount) + parseFloat(sgst_amount));

//            var item_amount = item_amount.toFixed(2);
            if (column && column == 'discount_amount')
                var disc_perc = disc_amount > 0 ? ((disc_amount / item_amount) * 100).toFixed(2) : 0;
            if (column && column == 'discount_percentage')
                var disc_amount = disc_perc > 0 ? (item_amount * (disc_perc / 100)).toFixed(2) : 0;

            var total_amount = (item_amount - disc_amount).toFixed(2);
            var vat_amount = ((total_amount * vat_perc) / (100 + vat_perc)).toFixed(2);

            $scope.saleItems[key].item_amount = item_amount;
            $scope.saleItems[key].discount_percentage = disc_perc;
            $scope.saleItems[key].discount_amount = disc_amount;
            $scope.saleItems[key].total_amount = total_amount;
            $scope.saleItems[key].vat_amount = vat_amount;

            $scope.saleItems[key].cgst_amount = cgst_amount;
            $scope.saleItems[key].sgst_amount = sgst_amount;
            $scope.saleItems[key].taxable_value = taxable_value;

            if (tableform) {
                angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                    if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'discount_percentage') {
                        editableValue.scope.$data = $scope.saleItems[key].discount_percentage;
                    }
                });

                angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                    if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'discount_amount') {
                        editableValue.scope.$data = $scope.saleItems[key].discount_amount;
                    }
                });
            }
            $scope.updateSaleRate();
        }

        $scope.updateSaleRate = function (column) {

            var roundoff_amount = bill_amount = total_item_discount_amount = total_item_amount = 0;

            //Get Total Sale, VAT, Discount Amount
            var total_item_vat_amount = total_item_sale_amount = 0;
            angular.forEach($scope.saleItems, function (item) {
                total_item_vat_amount = total_item_vat_amount + parseFloat(item.taxable_value);
                total_item_sale_amount = total_item_sale_amount + parseFloat(item.total_amount);
            });

            $scope.data.total_item_sale_amount = total_item_sale_amount.toFixed(2);
            $scope.data.total_item_vat_amount = total_item_vat_amount.toFixed(2);

            //Get Before Discount Amount (Total Sale Amount + Total VAT)
//            var before_discount_total = (total_item_sale_amount + total_item_vat_amount).toFixed(2); // Exculding vat
            var before_discount_total = (total_item_sale_amount).toFixed(2); // Inculding vat

            if (column && column == 'amount')
            {
                var disc_amount = parseFloat($scope.data.total_item_discount_amount);
                disc_amount = !isNaN(disc_amount) ? (disc_amount).toFixed(2) : 0;

                var disc_perc = disc_amount > 0 ? ((disc_amount / before_discount_total) * 100).toFixed(2) : 0;
                $scope.data.total_item_discount_percent = disc_perc;
            } else {
                var disc_perc = parseFloat($scope.data.total_item_discount_percent);
                disc_perc = !isNaN(disc_perc) ? (disc_perc).toFixed(2) : 0;

                var disc_amount = disc_perc > 0 ? (total_item_sale_amount * (disc_perc / 100)).toFixed(2) : 0;
                $scope.data.total_item_discount_amount = disc_amount;
            }

            var after_discount_item_amount = (parseFloat(before_discount_total) - parseFloat(disc_amount));
            $scope.data.total_item_amount = after_discount_item_amount.toFixed(2);

            //Get Welfare Amount
            var welfare = 0;
            if ($scope.data.welfare_amount) {
                var welfare = parseFloat($scope.data.welfare_amount).toFixed(2);
            }

            // Bill Amount = (Total Amount - Discount Amount) +- RoundOff
            var total_bill_amount = parseFloat(after_discount_item_amount) + parseFloat(welfare);
            bill_amount = Math.round(total_bill_amount);
            roundoff_amount = Math.abs(bill_amount - total_bill_amount);

            $scope.data.roundoff_amount = roundoff_amount.toFixed(2);
            $scope.data.bill_amount = bill_amount.toFixed(2);
            $scope.data.amount_received = bill_amount;
            $scope.updateBalance();
            $scope.updateBatch('update');
        }

        $scope.updateBatch = function (action) {
            angular.forEach($scope.saleItems, function (item, key) {
                var item_product_id = item.product_id;
                var item_expiry_date = item.expiry_date;
                var item_batch_no = item.batch_no;
                var item_batch_details = item.batch_details;
                var item_quantity = item.quantity;

                angular.forEach($scope.saleItems, function (item1, key1) {
                    if (key != key1) {
                        if (item_product_id == item1.product_id) {
                            angular.forEach(item1.product_batches, function (batch) {
                                if ((batch.batch_no == item_batch_no) && (batch.expiry_date == item_expiry_date)) {
                                    if (action == 'update') {
                                        batch.available_qty = batch.originalQuantity - item_quantity;
                                        var batch_qty = batch.batch_details.split(" / ");
                                        batch_qty[1] = batch.originalQuantity - item_quantity;
                                        batch.batch_details = batch_qty[0] + ' / ' + batch_qty[1];
                                    } else {
                                        batch.available_qty = batch.originalQuantity;
                                        var batch_qty = batch.batch_details.split(" / ");
                                        batch_qty[1] = batch.originalQuantity;
                                        batch.batch_details = batch_qty[0] + ' / ' + batch_qty[1];
                                    }

                                }
                            });
                        }
                    }
                });
            });
        }

        $scope.updateBalance = function () {
            $scope.data.balance = $scope.data.amount_received - $scope.data.bill_amount;
        }

        $scope.checkTotalpercent = function () {
            if ($scope.data.total_item_discount_percent > 100)
            {
                $scope.percentageErrormessage = "Discount percentage less than 100";
                return false;
            }
        }

        $scope.getBtnId = function (btnid)
        {
            $scope.btnid = btnid;
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            if (!$scope.tableform.$valid) {
                $scope.data.patient_id = '';
            }
            _that = this;
            if (_that.data.payment_mode != 'CD') {
                _that.data.card_type = '';
                _that.data.card_number = '';
            }

            if (_that.data.payment_mode != 'CH') {
                _that.data.cheque_no = '';
            }

            if (_that.data.payment_mode != 'ON') {
                _that.data.ref_no = '';
            }

            if ((_that.data.payment_mode != 'ON') && (_that.data.payment_mode != 'CH')) {
                _that.data.bank_name = '';
                _that.data.bank_date = '';
            }

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            $scope.data.sale_date = moment($scope.data.sale_date).format('YYYY-MM-DD');

            angular.forEach($scope.saleItems, function (saleitem, key) {
                $scope.saleItems[key].expiry_date = moment(saleitem.expiry_date).format('YYYY-MM-DD');

                if (angular.isObject(saleitem.full_name)) {
                    $scope.saleItems[key].full_name = saleitem.full_name.full_name;
                } else if (typeof saleitem.full_name == 'undefined') {
                    $scope.saleItems[key].product_id = '';
                }

                if (saleitem.temp_hsn_no) {
                    $scope.saleItems[key].hsn_no = saleitem.temp_hsn_no;
                }

                if (angular.isObject(saleitem.batch_details)) {
                    $scope.saleItems[key].batch_details = saleitem.batch_details.batch_details;
                } else if (typeof saleitem.batch_details == 'undefined') {
                    $scope.saleItems[key].batch_no = '';
                } else if ((saleitem.batch_no == '0' || saleitem.batch_no == '') && typeof saleitem.batch_details !== 'undefined') {
                    $scope.saleItems[key].batch_no = saleitem.batch_details;
                }

                //Unset unwanted columns 
                delete saleitem.alternate_product;
                delete saleitem.alternateproducts;
//                delete saleitem.product_batches; // Need product batches if form success false.
            });
            angular.extend(_that.data, {product_items: $scope.saleItems});
            var valueArr = $scope.saleItems.map(function (item) {
                return item.full_name + '-' + item.batch_no
            });
            var isDuplicate = valueArr.some(function (item, idx) {
                return valueArr.indexOf(item) != idx
            });
            if (isDuplicate)
            {
                $scope.duplicateErrormessage = 'Duplicate product is exits';
                return false;
            } else {
                $scope.duplicateErrormessage = '';
            }
            /* For print bill */
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacysale/savesale',
                data: _that.data,
            }).success(
                    function (response) {
                        $anchorScroll();
                        if (response.success == true) {
                            $scope.loadbar('hide');
                            if (mode == 'add') {
                                msg = 'New bill generated ' + response.bill_no;
                            } else {
                                msg = 'Bill updated successfully';
                            }
                            $scope.msg.successMessage = msg;
                            if ($scope.btnid == "print") {
                                $scope.printSaleBill(response.saleId);
                                $state.go($state.current, {}, {reload: true});
                            } else {
                                $state.go($state.current, {}, {reload: true});
                            }
                        } else {
//                            $scope.tableform.$show();
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
        };

        $scope.changeGetConsultant = function () {
            _that = this;
            $scope.getConsultantDetail(_that.data.consultant_id);
        }

        $scope.getConsultantDetail = function (consultant_id) {
            if (consultant_id) {
                consultant_details = $filter('filter')($scope.doctors, {user_id: consultant_id}, true);
                if (consultant_details) {
                    $scope.consultant_name_taken = consultant_details.length > 0 ? consultant_details[0].fullname : '';
                }
            }
        }

        $scope.changeGetPayType = function () {
            _that = this;
            $scope.getPaytypeDetail(_that.data.payment_type);
        }

        $scope.getPaytypeDetail = function (payment_type) {
            if (payment_type == 'CA') {
                $scope.purchase_type_name = 'Cash';
            }
            if (payment_type == 'CR') {
                $scope.purchase_type_name = 'Credit';
            }
            if (payment_type == 'COD') {
                $scope.purchase_type_name = 'Cash On Delivery';
            }
        }

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/pharmacysales/" + $state.params.id + "?addtfields=sale_update",
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
//                        $scope.data.patient_name = response.patient.fullname;
                        $scope.data.patient_guid = response.patient.patient_guid;
                        $scope.getConsultantDetail($scope.data.consultant_id);
                        $scope.getPaytypeDetail($scope.data.payment_type);

                        $scope.saleItems = response.items;
                        angular.forEach($scope.saleItems, function (item, key) {
                            angular.extend($scope.saleItems[key], {
                                full_name: item.product.full_name,
                                temp_hsn_no: item.hsn_no,
                                batch_no: item.batch.batch_no,
                                batch_details: item.batch.batch_details,
                                expiry_date: item.batch.expiry_date,
                                oldAttributeQuantity: item.quantity,
                                old_quantity: item.quantity,
                                available_qty: item.batch.available_qty,
                            });
                            $timeout(function () {
                                $scope.showOrHideProductBatch('hide', key);
                            });
                        });

                        $scope.getEncounter(response.patient.patient_id, 'edit', response.encounter_id);

                        $timeout(function () {
                            delete $scope.data.items;
                        }, 3000);
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.make_payment = function (sale_id, checked_sale_id) {
            sale = $filter('filter')($scope.displayedCollection, {sale_id: sale_id}, true);

            var modalInstance = $modal.open({
                templateUrl: 'tpl/pharmacy_sale/modal.makepayment.html',
                controller: "SaleMakePaymentController",
                size: 'lg',
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });
            modalInstance.data = {
                sale_id: sale_id,
                sale: sale[0],
                checked_sale_id: checked_sale_id,
            };
        }

        var canceler;
        $scope.getPatients = function (patientName) {
            if (canceler)
                canceler.resolve();
            canceler = $q.defer();

            $scope.show_patient_loader = true;

            return $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/patient/getpatient?addtfields=salecreate&only=patients&showall=yes',
                data: {'search': patientName},
                timeout: canceler.promise,
            }).then(
                    function (response) {
                        $scope.patients = [];
                        $scope.patients = response.data.patients;
                        $scope.loadbar('hide');
                        $scope.show_patient_loader = false;
                        return $scope.patients;
                    }
            );
        };

        var canceler1;
        $scope.getDoctors = function (doctorName) {
            if (canceler1)
                canceler1.resolve();
            canceler1 = $q.defer();

            $scope.show_consultant_loader = true;

            return $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/user/getdoctor?only=doctors&showall=yes',
                data: {'search': doctorName},
                timeout: canceler1.promise,
            }).then(
                    function (response) {
                        $scope.doctors = [];
                        $scope.doctors = response.data.doctors;
                        $scope.loadbar('hide');
                        $scope.show_consultant_loader = false;
                        return $scope.doctors;
                    }
            );
        };

        $scope.getPrescription = function () {
            $scope.loadbar('show');
            $http.get($rootScope.IRISOrgServiceUrl + '/patientprescription/getsaleprescription?patient_id=' + $scope.data.patient_guid + '&encounter_id=' + $scope.data.encounter_id + '&addtfields=prev_presc')
                    .success(function (prescriptionList) {
                        $scope.loadbar('hide');
                        $scope.saleItems = [];

                        ids = [];
//                        angular.forEach(prescriptionList.prescriptions, function (prescription) {
                        if (prescriptionList.prescription) {
                            angular.forEach(prescriptionList.prescription.items, function (item) {
                                $scope.inserted = {
                                    full_name: item.product.full_name,
                                    batch_details: '',
                                    product_id: item.product_id,
                                    product_name: item.product_name,
                                    package_name: '',
                                    vat_percent: '0',
                                    batch_no: '',
                                    expiry_date: '',
                                    mrp: '0',
                                    quantity: '0',
                                    vat_amount: '0',
                                    item_amount: '0',
                                };

                                exists = $filter('filter')($scope.saleItems, {product_id: item.product_id}, true);
                                if (exists.length == 0) {
                                    $scope.saleItems.push($scope.inserted);
                                    ids.push(item.product_id);
                                }
                            });
                        }

//                        });

//                        $rootScope.commonService.GetBatchListByProduct(ids, function (response) {
//                            $scope.batches = response.batchList;
//                        });

                        if ($scope.saleItems.length == 0) {
                            $scope.addRow();
                        } else {
                            angular.forEach($scope.saleItems, function (item, key) {
                                $scope.updateProductRow(item, '', '', key);
                            });
                        }

                        $timeout(function () {
                            $scope.setFocus('full_name', $scope.saleItems.length - 1);
                        });
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading list!";
                    });
        }

        /*PRINT BILL*/
        $scope.printHeader = function () {
            return {
                text: '',
                margin: 0,
                alignment: 'center'
            };
        }

        $scope.printFooter = function () {
            return {
                text: [{text: 'PHARMACY SERVICE - 24 HOURS \n DEVELOPED BY : SUMANAS TECHNOLOGIES'}],
                fontSize: 7,
                margin: 0,
                alignment: 'center'
            };
        }

        $scope.printStyle = function () {
            return {
                h1: {
                    fontSize: 11,
                    bold: true,
                },
                h2: {
                    fontSize: 9,
                    bold: true,
                },
                th: {
                    fontSize: 9,
                    bold: true,
                    margin: [0, 3, 0, 3]
                },
                td: {
                    fontSize: 8,
                    margin: [0, 3, 0, 3]
                },
                normaltxt: {
                    fontSize: 9,
                },
                grandtotal: {
                    fontSize: 15,
                    bold: true,
                    margin: [5, 3, 5, 3]
                }
            };
        }

        $scope.imgExport = function (imgID) {
            var img = document.getElementById(imgID);
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            // Copy the image contents to the canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // Get the data-URL formatted image
            // Firefox supports PNG and JPEG. You could check img.src to
            // guess the original format, but be aware the using "image/jpg"
            // will re-encode the image.
            var dataURL = canvas.toDataURL("image/png");
            return dataURL;
        }

        $scope.printloader = '';
        $scope.printContent = function () {
            //Sale Details print
            var content = [];
            var result_count = Object.keys($scope.saleItems2).length;
            var index = 1;
            var loop_count = 0;
            var cgst_total = 0;
            var sgst_total = 0;
            if ($scope.saleReturnItems2) {
                var salereturnbreak = 'after';
            } else {
                var salereturnbreak = '';
            }

            var groupedArr = createGroupedArray($scope.saleItems2, 6); //Changed Description rows
            var sale_info = $scope.data2;
            var group_total_count = Object.keys(groupedArr).length;
            angular.forEach(groupedArr, function (sales, key) {


                var group_key = key + 1;
                var perPageInfo = [];
                var perImageInfo = [];

                var perPageItems = [];
                perPageItems.push([
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'S.No',
                        style: 'th'
                    },
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'Description',
                        style: 'th'
                    },
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'HSN Code',
                        style: 'th'
                    },
//                {
//                    border: [false, true, false, false],
//                    rowspan: 2,
//                    text: 'MFR',
//                    style: 'th'
//                },
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'Batch',
                        style: 'th'
                    },
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'Expiry',
                        style: 'th'
                    },
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'Qty',
                        style: 'th'
                    },
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'Price',
                        style: 'th'
                    },
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'Taxable value',
                        style: 'th'
                    },
                    {
                        border: [false, true, false, true],
                        colSpan: 2,
                        alignmanet: 'center',
                        text: 'CGST',
                        style: 'th'
                    }, {},
                    {
                        border: [false, true, false, true],
                        colSpan: 2,
                        alignmanet: 'center',
                        text: 'SGST',
                        style: 'th'
                    }, {},
                    {
                        border: [false, true, false, false],
                        rowspan: 2,
                        text: 'Total',
                        style: 'th'
                    },
                ], [
                    {
                        border: [false, false, false, true],
                        text: ''
                    }, {
                        border: [false, false, false, true],
                        text: ''
                    }, {
                        border: [false, false, false, true],
                        text: ''
                    }, {
                        border: [false, false, false, true],
                        text: ''
                    },
//                {
//                    border: [false, false, false, true],
//                    text: ''
//                },
                    {
                        border: [false, false, false, true],
                        text: ''
                    }, {
                        border: [false, false, false, true],
                        text: ''
                    }, {
                        border: [false, false, false, true],
                        text: ''
                    }, {
                        border: [false, false, false, true],
                        text: ''
                    },
                    {
                        border: [false, true, false, true],
                        text: 'Rate %',
                        fontSize: 05,
                    },
                    {
                        border: [false, true, false, true],
                        text: 'Amount',
                        fontSize: 05,

                    },
                    {
                        border: [false, true, false, true],
                        text: 'Rate %',
                        fontSize: 05,
                    },
                    {
                        border: [false, false, false, true],
                        text: 'Amount',
                        fontSize: 05,

                    },
                    {
                        border: [false, false, false, true],
                        text: ''
                    },
                ]);


                angular.forEach(sales, function (row, key) {
                    var percentage = parseInt(row.discount_percentage);
                    if (percentage > 0) {
                        var particulars = row.product.full_name + '(' + percentage.toString() + ')';
                    } else {
                        var particulars = row.product.full_name;
                    }

                    cgst_total += parseFloat(row.cgst_amount);
                    sgst_total += parseFloat(row.sgst_amount);

                    if (loop_count % 2 == 0)
                        var color = '';
                    else
                        var color = '#eeeeee';
                    if (result_count == loop_count + 1)
                        var border = [false, false, false, true];
                    else
                        var border = [false, false, false, false];
                    perPageItems.push([
                        {
                            border: border,
                            text: index,
                            fillColor: color,
                            style: 'td',
                            alignment: 'left',
                        },
                        {
                            border: border,
                            text: particulars,
                            fillColor: color,
                            style: 'td'
                        },
                        {
                            border: border,
                            text: [row.hsn_no || '-'],
                            fillColor: color,
                            style: 'td'
                        },
                        {
                            border: border,
                            text: row.batch_no,
                            fillColor: color,
                            style: 'td'
                        },
                        {
                            border: border,
                            text: moment(row.expiry_date).format('MM/YY'),
                            fillColor: color,
                            style: 'td'
                        },
                        {
                            border: border,
                            text: row.quantity.toString(),
                            fillColor: color,
                            style: 'td'
                        },
                        {
                            border: border,
                            text: row.mrp,
                            fillColor: color,
                            style: 'td'
                        },
//                    {
//                        border: border,
//                        text: row.total_amount,
//                        fillColor: color,
//                        style: 'td',
//                    },
                        {
                            border: border,
                            text: [row.taxable_value || '-'],
                            fillColor: color,
                            style: 'td',
                        },
                        {
                            border: border,
                            text: [row.cgst_percent || '-'],
                            fillColor: color,
                            style: 'td',
                        },
                        {
                            border: border,
                            text: [row.cgst_amount || '-'],
                            fillColor: color,
                            style: 'td',
                        },
                        {
                            border: border,
                            text: [row.sgst_percent || '-'],
                            fillColor: color,
                            style: 'td',
                        },
                        {
                            border: border,
                            text: [row.sgst_amount || '-'],
                            fillColor: color,
                            style: 'td',
                        },
                        {
                            border: border,
                            text: row.total_amount,
                            fillColor: color,
                            style: 'td',
                            alignment: 'right',
                        },
                    ]);
                    index++;
                    loop_count++;
                });


                if (sale_info.payment_type == 'CA')
                    var payment = 'Cash';
                if (sale_info.payment_type == 'CR')
                    var payment = 'Credit';
                if (sale_info.payment_type == 'COD')
                    var payment = 'Cash On Delivery';

                var ahana_log = $('#sale_logo').attr('src');
                var barcode = sale_info.patient.patient_global_int_code;
                var bar_image = $('#' + barcode).attr('src');
                if (bar_image) //Check Bar image is empty or not
                {
                    var bar_img = [{image: bar_image, height: 20, width: 100, alignment: 'right'}];
                } else
                {
                    var bar_img = [{text: ''}];
                }
                perPageInfo.push({layout: 'noBorders',
                    table: {
                        widths: ['*', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {
                                    colSpan: 3,
                                    layout: 'noBorders',
                                    table: {
                                        body: [
                                            [
                                                {
                                                    image: $scope.imgExport('sale_logo'),
                                                    height: 20, width: 100,

                                                }
                                            ],
                                            [
                                                {
                                                    text: 'GST No : 33AAQFA999IEIZI',
                                                    fontSize: 07,
                                                }
                                            ],
                                            [
                                                {
                                                    text: sale_info.branch_address,
                                                    fontSize: 09,
                                                }
                                            ],
                                        ]
                                    },
                                },
                                {}, {}, {
                                    colSpan: 3,
                                    layout: 'noBorders',
                                    table: {
                                        body: [
                                            [
                                                {
                                                    text: 'Sale Bill',
                                                    fontSize: 09,
                                                }
                                            ],
                                        ]
                                    },
                                }, {}, {},
                                {
                                    layout: 'noBorders',
                                    table: {
                                        body: [
                                            [
                                                {
                                                    text: 'DL Nos. : MDU/5263/20,21',
                                                    fontSize: 07,
                                                    alignment: 'right'
                                                }
                                            ],
                                            [
                                                {
                                                    text: 'Cash on Delivery : ' + [sale_info.branch_phone],
                                                    fontSize: 09,
                                                    alignment: 'right'
                                                }
                                            ],
                                            bar_img
                                        ]
                                    },
                                },
                            ],
                        ]
                    },
                });


                perPageInfo.push({
                    layout: 'Borders',
                    table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {
                                    border: [false, true, false, false],
                                    colSpan: 6,
                                    layout: {
                                        paddingLeft: function (i, node) {
                                            return 0;
                                        },
                                        paddingRight: function (i, node) {
                                            return 2;
                                        },
                                        paddingTop: function (i, node) {
                                            return 0;
                                        },
                                        paddingBottom: function (i, node) {
                                            return 0;
                                        },
                                    },
                                    table: {
                                        body: [
                                            [
                                                {
                                                    border: [false, false, false, false],
                                                    text: 'Patient',
                                                    style: 'h2',
                                                    margin: [-5, 0, 0, 0],
                                                },
                                                {
                                                    text: ':',
                                                    border: [false, false, false, false],
                                                    style: 'h2'
                                                },
                                                {
                                                    border: [false, false, false, false],
                                                    text: $scope.toTitleCase(sale_info.patient_name || '-'),
                                                    style: 'normaltxt'
                                                }
                                            ],
                                            [
                                                {
                                                    border: [false, false, false, false],
                                                    text: 'UHID',
                                                    style: 'h2',
                                                    margin: [-5, 0, 0, 0],
                                                },
                                                {
                                                    text: ':',
                                                    border: [false, false, false, false],
                                                    style: 'h2'
                                                },
                                                {
                                                    border: [false, false, false, false],
                                                    text: [sale_info.patient.patient_global_int_code || '-'],
                                                    style: 'normaltxt'
                                                }
                                            ],
                                            [
                                                {
                                                    border: [false, false, false, false],
                                                    text: 'Address',
                                                    style: 'h2',
                                                    margin: [-5, 0, 0, 0],
                                                },
                                                {
                                                    text: ':',
                                                    border: [false, false, false, false],
                                                    style: 'h2'
                                                },
                                                {
                                                    border: [false, false, false, false],
                                                    text: $scope.toTitleCase(sale_info.patient.printpermanentaddress || '-'),
                                                    style: 'normaltxt'
                                                }
                                            ],
                                            [
                                                {
                                                    border: [false, false, false, false],
                                                    text: 'Doctor',
                                                    style: 'h2',
                                                    margin: [-5, 0, 0, 0],
                                                },
                                                {
                                                    text: ':',
                                                    border: [false, false, false, false],
                                                    style: 'h2'
                                                },
                                                {
                                                    border: [false, false, false, false],
                                                    text: [sale_info.consultant_name || '-'],
                                                    style: 'normaltxt'
                                                }
                                            ],
                                        ]
                                    },
                                },
                                {}, {}, {}, {}, {},
                                {
                                    border: [false, true, false, false],
                                    layout: 'noBorders',
                                    table: {
                                        body: [
                                            [
                                                {
                                                    border: [false, false, false, false],
                                                    text: 'Bill No',
                                                    style: 'h2',
                                                    margin: [-7, 0, 0, 0],
                                                },
                                                {
                                                    text: ':',
                                                    border: [false, false, false, false],
                                                    style: 'h2'
                                                },
                                                {
                                                    border: [false, false, false, false],
                                                    text: [sale_info.bill_no] + '/' + [payment],
                                                    style: 'normaltxt'
                                                }
                                            ],
                                            [
                                                {
                                                    text: 'Date',
                                                    style: 'h2',
                                                    margin: [-7, 0, 0, 0],
                                                },
                                                {
                                                    text: ':',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: moment(sale_info.created_at).format('YYYY-MM-DD hh:mm A'),
                                                    style: 'normaltxt'
                                                }
                                            ],
                                        ]
                                    },
                                }
                            ],
                        ]
                    },
                },
                        {
                            layout: {
                                hLineWidth: function (i, node) {
                                    return (i === 0) ? 3 : 1;
                                }
                            },
                            table: {
                                headerRows: 1,
                                widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                                body: perPageItems,
                            },

                        }, {
                    layout: 'noBorders',
                    margin: [200, 10, 10, 10],
                    table: {
                        body: [
                            [
                                {
                                    text: (group_total_count === group_key ? '' : 'To Be Continue'),
                                    bold: true,
                                    alignment: 'center',
                                    fontSize: 14,
                                    style: 'normaltxt'
                                },
                            ],
                        ]
                    },
                    pageBreak: (loop_count === result_count ? '' : 'after'),
                });

//                perPageInfo.push({
//                    text: [
//                        $filter('words')(sale_info.bill_amount),
//                        {text: 'RUPEES ONLY'},
//                    ]});


                content.push(perPageInfo);

                if (index == result_count) {
                    $scope.printloader = '';
                }
//                perPageInfo.push({
//                    text: [
//                        {text: 'To be continue'},
//                    ]});
            });
            var perPageInfo = [];
            perPageInfo.push({
                layout: 'noBorders',
                table: {
                    widths: ['*', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            {
                                colSpan: 3,
                                layout: 'noBorders',
                                table: {
                                    body: [
                                        [
                                            {
                                                text: 'Billed By',
                                                style: 'h2'
                                            },
                                            {
                                                text: ':',
                                                style: 'h2'
                                            },
                                            {
                                                text: sale_info.billed_by,
                                                style: 'normaltxt'
                                            },
                                        ],
                                    ]
                                },
                            }, {}, {},
                            {
                                colSpan: 3,
                                layout: 'noBorders',
                                table: {
                                    body: [
                                        [
                                            {
                                                text: 'CGST',
                                                style: 'h2'
                                            },
                                            {
                                                text: ':',
                                                style: 'h2'
                                            },
                                            {
                                                text: cgst_total.toFixed(2),
                                                style: 'normaltxt'
                                            },
                                        ],
                                        [
                                            {
                                                text: 'SGST',
                                                style: 'h2'
                                            },
                                            {
                                                text: ':',
                                                style: 'h2'
                                            },
                                            {
                                                text: sgst_total.toFixed(2),
                                                style: 'normaltxt'
                                            },
                                        ],
                                    ]
                                },
                            },
                            {}, {},
                            {
                                layout: 'noBorders',
                                table: {
                                    body: [
                                        [
                                            {
                                                text: 'GST',
                                                style: 'h2',
                                                alignment: 'right'
                                            },
                                            {
                                                text: ':',
                                                style: 'h2'
                                            },
                                            {
                                                text: (parseFloat(cgst_total) + parseFloat(sgst_total)).toFixed(2),
                                                alignment: 'right'
                                            },
                                        ],
                                        [
                                            {
                                                text: 'Total Value',
                                                style: 'h2',
                                                alignment: 'right'
                                            },
                                            {
                                                text: ':',
                                                style: 'h2'
                                            },
                                            {
                                                text: sale_info.total_item_amount,
                                                alignment: 'right'
                                            },
                                        ],
                                        [
                                            {
                                                text: 'Round Off',
                                                style: 'h2',
                                                alignment: 'right'
                                            },
                                            {
                                                text: ':',
                                                style: 'h2'
                                            },
                                            {
                                                text: sale_info.roundoff_amount,
                                                alignment: 'right'
                                            },
                                        ],
                                        [
                                            {
                                                text: 'Grand Total',
                                                fillColor: '#eeeeee',
                                                style: 'grandtotal',
                                                //color: 'white'
                                            },
                                            {
                                                text: ':',
                                                fillColor: '#eeeeee',
                                                style: 'grandtotal',
                                                //color: 'white'
                                            },
                                            {
                                                text: 'INR ' + [sale_info.bill_amount],
                                                fillColor: '#eeeeee',
                                                style: 'grandtotal',
                                                //color: 'white'
                                            },
                                        ],
                                    ]
                                },
                            }
                        ],
                    ]
                },
                pageBreak: salereturnbreak
            });
            content.push(perPageInfo);

            //Sale Return Details Bill
            if ($scope.saleReturnItems2) {
                var SRcontent = [];
                var result_count = Object.keys($scope.saleReturnItems2).length;
                var index = 1;
                var loop_count = 0;

                var cgst_total = 0;
                var sgst_total = 0;
                var SRsale_info = $scope.SRdata2;

                var SRgroupedArr = createGroupedArray($scope.saleReturnItems2, 6); //Changed Description rows
                var sale_info = $scope.data2;
                var group_total_count = Object.keys(SRgroupedArr).length;

                angular.forEach(SRgroupedArr, function (SRsales, key) {


                    var group_key = key + 1;
                    var SRperPageInfo = [];
                    var SRperImageInfo = [];

                    var SRperPageItems = [];
                    SRperPageItems.push([
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'S.No',
                            style: 'th'
                        },
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'Description',
                            style: 'th'
                        },
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'HSN Code',
                            style: 'th'
                        },
//                {
//                    border: [false, true, false, false],
//                    rowspan: 2,
//                    text: 'MFR',
//                    style: 'th'
//                },
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'Batch',
                            style: 'th'
                        },
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'Expiry',
                            style: 'th'
                        },
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'Qty',
                            style: 'th'
                        },
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'Price',
                            style: 'th'
                        },
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'Taxable value',
                            style: 'th'
                        },
                        {
                            border: [false, true, false, true],
                            colSpan: 2,
                            alignmanet: 'center',
                            text: 'CGST',
                            style: 'th'
                        }, {},
                        {
                            border: [false, true, false, true],
                            colSpan: 2,
                            alignmanet: 'center',
                            text: 'SGST',
                            style: 'th'
                        }, {},
                        {
                            border: [false, true, false, false],
                            rowspan: 2,
                            text: 'Total',
                            style: 'th'
                        },
                    ], [
                        {
                            border: [false, false, false, true],
                            text: ''
                        }, {
                            border: [false, false, false, true],
                            text: ''
                        }, {
                            border: [false, false, false, true],
                            text: ''
                        }, {
                            border: [false, false, false, true],
                            text: ''
                        },
//                {
//                    border: [false, false, false, true],
//                    text: ''
//                },
                        {
                            border: [false, false, false, true],
                            text: ''
                        }, {
                            border: [false, false, false, true],
                            text: ''
                        }, {
                            border: [false, false, false, true],
                            text: ''
                        }, {
                            border: [false, false, false, true],
                            text: ''
                        },
                        {
                            border: [false, true, false, true],
                            text: 'Rate %',
                            fontSize: 05,
                        },
                        {
                            border: [false, true, false, true],
                            text: 'Amount',
                            fontSize: 05,

                        },
                        {
                            border: [false, true, false, true],
                            text: 'Rate %',
                            fontSize: 05,
                        },
                        {
                            border: [false, false, false, true],
                            text: 'Amount',
                            fontSize: 05,

                        },
                        {
                            border: [false, false, false, true],
                            text: ''
                        },
                    ]);


                    angular.forEach(SRsales, function (row, key) {
                        var percentage = parseInt(row.discount_percentage);
                        if (percentage > 0) {
                            var particulars = row.product.full_name + '(' + percentage.toString() + ')';
                        } else {
                            var particulars = row.product.full_name;
                        }

                        cgst_total += parseFloat(row.cgst_amount);
                        sgst_total += parseFloat(row.sgst_amount);

                        if (loop_count % 2 == 0)
                            var color = '';
                        else
                            var color = '#eeeeee';
                        if (result_count == loop_count + 1)
                            var border = [false, false, false, true];
                        else
                            var border = [false, false, false, false];
                        SRperPageItems.push([
                            {
                                border: border,
                                text: index,
                                fillColor: color,
                                style: 'td',
                                alignment: 'left',
                            },
                            {
                                border: border,
                                text: particulars,
                                fillColor: color,
                                style: 'td'
                            },
                            {
                                border: border,
                                text: [row.hsn_no || '-'],
                                fillColor: color,
                                style: 'td'
                            },
                            {
                                border: border,
                                text: row.batch_no,
                                fillColor: color,
                                style: 'td'
                            },
                            {
                                border: border,
                                text: moment(row.expiry_date).format('MM/YY'),
                                fillColor: color,
                                style: 'td'
                            },
                            {
                                border: border,
                                text: row.quantity.toString(),
                                fillColor: color,
                                style: 'td'
                            },
                            {
                                border: border,
                                text: row.mrp,
                                fillColor: color,
                                style: 'td'
                            },
//                    {
//                        border: border,
//                        text: row.total_amount,
//                        fillColor: color,
//                        style: 'td',
//                    },
                            {
                                border: border,
                                text: [row.taxable_value || '-'],
                                fillColor: color,
                                style: 'td',
                            },
                            {
                                border: border,
                                text: [row.cgst_percent || '-'],
                                fillColor: color,
                                style: 'td',
                            },
                            {
                                border: border,
                                text: [row.cgst_amount || '-'],
                                fillColor: color,
                                style: 'td',
                            },
                            {
                                border: border,
                                text: [row.sgst_percent || '-'],
                                fillColor: color,
                                style: 'td',
                            },
                            {
                                border: border,
                                text: [row.sgst_amount || '-'],
                                fillColor: color,
                                style: 'td',
                            },
                            {
                                border: border,
                                text: row.total_amount,
                                fillColor: color,
                                style: 'td',
                                alignment: 'right',
                            },
                        ]);
                        index++;
                        loop_count++;
                    });

                    var ahana_log = $('#sale_logo').attr('src');
                    var barcode = sale_info.patient.patient_global_int_code;
                    var bar_image = $('#' + barcode).attr('src');
                    if (bar_image) //Check Bar image is empty or not
                    {
                        var bar_img = [{image: bar_image, height: 20, width: 100, alignment: 'right'}];
                    } else
                    {
                        var bar_img = [{text: ''}];
                    }
                    SRperPageInfo.push({layout: 'noBorders',
                        table: {
                            widths: ['*', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    {
                                        colSpan: 3,
                                        layout: 'noBorders',
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        image: $scope.imgExport('sale_logo'),
                                                        height: 20, width: 100,

                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'GST No : 33AAQFA999IEIZI',
                                                        fontSize: 07,
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: sale_info.branch_address,
                                                        fontSize: 09,
                                                    }
                                                ],
                                            ]
                                        },
                                    },
                                    {}, {}, {
                                        colSpan: 3,
                                        layout: 'noBorders',
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        text: 'Sale Return Bill',
                                                        fontSize: 09,
                                                    }
                                                ],
                                            ]
                                        },
                                    }, {}, {},
                                    {
                                        layout: 'noBorders',
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        text: 'DL Nos. : MDU/5263/20,21',
                                                        fontSize: 07,
                                                        alignment: 'right'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'Cash on Delivery : ' + [sale_info.branch_phone],
                                                        fontSize: 09,
                                                        alignment: 'right'
                                                    }
                                                ],
                                                bar_img
                                            ]
                                        },
                                    },
                                ],
                            ],
                        },
                    });


                    SRperPageInfo.push({
                        layout: 'Borders',
                        table: {
                            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    {
                                        border: [false, true, false, false],
                                        colSpan: 6,
                                        layout: {
                                            paddingLeft: function (i, node) {
                                                return 0;
                                            },
                                            paddingRight: function (i, node) {
                                                return 2;
                                            },
                                            paddingTop: function (i, node) {
                                                return 0;
                                            },
                                            paddingBottom: function (i, node) {
                                                return 0;
                                            },
                                        },
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'Patient',
                                                        style: 'h2',
                                                        margin: [-5, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: $scope.toTitleCase(sale_info.patient_name || '-'),
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'UHID',
                                                        style: 'h2',
                                                        margin: [-5, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: [sale_info.patient.patient_global_int_code || '-'],
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'Address',
                                                        style: 'h2',
                                                        margin: [-5, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: $scope.toTitleCase(sale_info.patient.printpermanentaddress || '-'),
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'Doctor',
                                                        style: 'h2',
                                                        margin: [-5, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: [sale_info.consultant_name || '-'],
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                            ]
                                        },
                                    },
                                    {}, {}, {}, {}, {},
                                    {
                                        border: [false, true, false, false],
                                        layout: 'noBorders',
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'Bill No',
                                                        style: 'h2',
                                                        margin: [-7, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: [SRsale_info.bill_no] + '/' + [SRsale_info.sale_payment_type],
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'Date',
                                                        style: 'h2',
                                                        margin: [-7, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        style: 'h2'
                                                    },
                                                    {
                                                        text: moment(SRsale_info.created_at).format('YYYY-MM-DD hh:mm A'),
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                            ]
                                        },
                                    }
                                ],
                            ]
                        },
                    },
                            {
                                layout: {
                                    hLineWidth: function (i, node) {
                                        return (i === 0) ? 3 : 1;
                                    }
                                },
                                table: {
                                    headerRows: 1,
                                    widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                                    body: SRperPageItems,
                                },

                            }, {
                        layout: 'noBorders',
                        margin: [200, 10, 10, 10],
                        table: {
                            body: [
                                [
                                    {
                                        text: (group_total_count === group_key ? '' : 'To Be Continue'),
                                        bold: true,
                                        alignment: 'center',
                                        fontSize: 14,
                                        style: 'normaltxt'
                                    },
                                ],
                            ]
                        },
                        pageBreak: (loop_count === result_count ? '' : 'after'),
                    });
                    content.push(SRperPageInfo);

                    if (index == result_count) {
                        $scope.printloader = '';
                    }
                });
                var SRperPageInfo = [];
                SRperPageInfo.push({
                    layout: 'noBorders',
                    table: {
                        widths: ['*', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                {
                                    colSpan: 3,
                                    layout: 'noBorders',
                                    table: {
                                        body: [
                                            [
                                                {
                                                    text: 'Billed By',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: ':',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: SRsale_info.billed_by,
                                                    style: 'normaltxt'
                                                },
                                            ],
                                        ]
                                    },
                                }, {}, {},
                                {
                                    colSpan: 3,
                                    layout: 'noBorders',
                                    table: {
                                        body: [
                                            [
                                                {
                                                    text: 'CGST',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: ':',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: cgst_total.toFixed(2),
                                                    style: 'normaltxt'
                                                },
                                            ],
                                            [
                                                {
                                                    text: 'SGST',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: ':',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: sgst_total.toFixed(2),
                                                    style: 'normaltxt'
                                                },
                                            ],
                                        ]
                                    },
                                },
                                {}, {},
                                {
                                    layout: 'noBorders',
                                    table: {
                                        body: [
                                            [
                                                {
                                                    text: 'GST',
                                                    style: 'h2',
                                                    alignment: 'right'
                                                },
                                                {
                                                    text: ':',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: (parseFloat(cgst_total) + parseFloat(sgst_total)).toFixed(2),
                                                    alignment: 'right'
                                                },
                                            ],
                                            [
                                                {
                                                    text: 'Total Value',
                                                    style: 'h2',
                                                    alignment: 'right'
                                                },
                                                {
                                                    text: ':',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: SRsale_info.total_item_amount,
                                                    alignment: 'right'
                                                },
                                            ],
                                            [
                                                {
                                                    text: 'Round Off',
                                                    style: 'h2',
                                                    alignment: 'right'
                                                },
                                                {
                                                    text: ':',
                                                    style: 'h2'
                                                },
                                                {
                                                    text: SRsale_info.roundoff_amount,
                                                    alignment: 'right'
                                                },
                                            ],
                                            [
                                                {
                                                    text: 'Grand Total',
                                                    fillColor: '#eeeeee',
                                                    style: 'grandtotal',
                                                    //color: 'white'
                                                },
                                                {
                                                    text: ':',
                                                    fillColor: '#eeeeee',
                                                    style: 'grandtotal',
                                                    //color: 'white'
                                                },
                                                {
                                                    text: 'INR ' + [SRsale_info.bill_amount],
                                                    fillColor: '#eeeeee',
                                                    style: 'grandtotal',
                                                    //color: 'white'
                                                },
                                            ],
                                        ]
                                    },
                                }
                            ],
                        ]
                    },
                });
                SRcontent.push(SRperPageInfo);
                content.push(SRcontent);
            }
            return content;
        }

        var createGroupedArray = function (arr, chunkSize) {
            var groups = [], i;
            for (i = 0; i < arr.length; i += chunkSize) {
                groups.push(arr.slice(i, i + chunkSize));
            }
            return groups;
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
                        defaultStyle: {
                            fontSize: 10
                        },
                        //pageMargins: ($scope.deviceDetector.browser == 'firefox' ? 50 : 50),
                        pageMargins: [20, 20, 20, 48],
                        pageSize: 'A5',
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

        $scope.saleDetail = function (sale_id) {
            $scope.data2 = {};
            $scope.saleItems2 = [];
            $scope.saleReturnItems2 = [];
            $scope.loadbar('show');

            var deferred = $q.defer();
            deferred.notify();

            $http.get($rootScope.IRISOrgServiceUrl + "/pharmacysales/" + sale_id + "?addtfields=sale_print")
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.data2 = response;
                        $scope.data2.patient_name = response.patient_name;
                        $scope.data2.patient_guid = response.patient_uhid;

//                        $scope.getConsultantDetail($scope.data2.consultant_id);
                        $scope.getPaytypeDetail($scope.data2.payment_type);
                        $scope.data2.payment_type_name = $scope.purchase_type_name;

                        $scope.saleItems2 = response.items;
                        angular.forEach($scope.saleItems2, function (item, key) {
                            angular.extend($scope.saleItems2[key], {
                                full_name: item.product.full_name,
                                batch_no: item.batch.batch_no,
                                batch_details: item.batch.batch_details,
                                expiry_date: item.batch.expiry_date,
                                quantity: item.quantity,
                                taxable_value: item.taxable_value,
                                cgst_amount: item.cgst_amount,
                                cgst_percent: item.cgst_percent,
                                sgst_amount: item.sgst_amount,
                                sgst_percent: item.sgst_percent,
                            });
                        });
                        $scope.SRdata2 = response.sale_return_item;
                        if ($scope.saleReturnItems2) {
                            $scope.saleReturnItems2 = response.sale_return_item.items;
                            angular.forEach($scope.saleReturnItems2, function (item, key) {
                                angular.extend($scope.saleReturnItems2[key], {
                                    full_name: item.product.full_name,
                                    batch_no: item.batch.batch_no,
                                    batch_details: item.batch.batch_details,
                                    expiry_date: item.batch.expiry_date,
                                    quantity: item.quantity,
                                    taxable_value: item.taxable_value,
                                    cgst_amount: item.cgst_amount,
                                    cgst_percent: item.cgst_percent,
                                    sgst_amount: item.sgst_amount,
                                    sgst_percent: item.sgst_percent,
                                });
                            });
                        }
                        deferred.resolve();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading sale!";
                        deferred.reject();
                    });

            return deferred.promise;
        };

        $scope.toTitleCase = function (str)
        {
            return str.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        $scope.printSaleBill = function (sale_id) {
            $scope.saleDetail(sale_id).then(function () {
                delete $scope.data2.items;
                $scope.btnid = 'print';
                save_success();
            });
        }

        $scope.removeRow = function (sale_id) {
            //console.log(sale_id);
            var conf = confirm('Are you sure to delete ?');
            if (conf)
            {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/pharmacysale/checkdelete",
                    method: "POST",
                    data: {id: sale_id}
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadSaleItemList('CA')
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                )
            }
        }

        $scope.check_sale_return = function (sale_return_id, sale_id) {
            if (sale_return_id) {
                alert("Can't Edit this sale bill, Because its depends sales return bill");
            } else {
                $state.go('pharmacy.saleUpdate', {id: sale_id});
            }
        }

//        // Get Patient Name
//        var changeTimer = false;
//        $scope.$watch('data.patient_name', function (newValue, oldValue) {
//            if (newValue != '') {
//                if (changeTimer !== false)
//                    clearTimeout(changeTimer);
//
//                $scope.loadbar('show');
//                changeTimer = setTimeout(function () {
//                    $http({
//                        method: 'POST',
//                        url: $rootScope.IRISOrgServiceUrl + '/patient/search',
//                        data: {'search': newValue},
//                    }).success(
//                            function (response) {
//                                $scope.patients = [];
//                                angular.forEach(response.patients, function (list) {
//                                    $scope.patients.push(list.Patient);
//                                });
//                                $scope.loadbar('hide');
//                            }
//                    );
//                    changeTimer = false;
//                }, 300);
//            }
//        }, true);
        //Get the products
//        var changeTimer = false;
//        $scope.productFilter = function (product, key) {
//            return product.product_id != $scope.saleItems[key].product_id;
//        }

//        $scope.getProduct = function (saleitem) {
//            var name = saleitem.full_name.$viewValue;
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
//        }

//        $scope.setFutureInternalCode = function (code, col) {
//            $rootScope.commonService.GetInternalCodeList('', code, '1', false, function (response) {
//                if (col == 'bill_no' && response.code)
//                    $scope.data.bill_no = response.code.next_fullcode;
//            });
//        }

        //Hide by Nad.
//        $scope.addRowWhenFocus = function (key) {
//            //Add New Row when focus Quantity
//            if (key + 1 == $scope.saleItems.length) {
//                $scope.addRow(false);
//            }
//        }

        //Get selected patient mobile no.
//        $scope.getPatientMobileNo = function (id) {
//            var patient_id = id;
//            var patient_mobile_no = $.grep($scope.patients, function (patient) {
//                return patient.Patient.patient_id == patient_id;
//            })[0].Patient.patient_mobile;
//            $scope.data.mobile_no = patient_mobile_no;
//        }
    }]);