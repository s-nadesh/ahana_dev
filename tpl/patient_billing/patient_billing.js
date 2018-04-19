// this is a lazy load controller, 
// so start with "app." to register this controller

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
})

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
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

window.toWords = toWords;

app.controller('BillingController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', '$modal', '$log', 'toaster', function ($rootScope, $scope, $timeout, $http, $state, $filter, $modal, $log, toaster) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.more_max = 4;
        $scope.total_billing = 0;

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.disabled = function (date, mode) {
            date = moment(date).format('YYYY-MM-DD');
            return $.inArray(date, $scope.enabled_dates) === -1;
        };

        //All Billing Page
        $scope.enabled_dates = [];
        $scope.loadPatientAllBilling = function (type, date) {
            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
            $rootScope.commonService.GetMonth(function (response) {
                $scope.months = response;
            });
            $rootScope.commonService.GetYear(function (response) {
                $scope.years = response;
            });
            $scope.errorData = '';
            $scope.isLoading = true;
            $scope.rowCollection = [];  // base collection
//            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            if (typeof date == 'undefined') {
                url = $rootScope.IRISOrgServiceUrl + '/encounter/getallbilling?id=' + $state.params.id + '&type=' + type;
            } else {
                date = moment(date).format('YYYY-MM-DD');
                url = $rootScope.IRISOrgServiceUrl + '/encounter/getallbilling?id=' + $state.params.id + '&type=' + type + '&date=' + date;
            }

            $http.get(url)
                    .success(function (response) {
                        if (response.success == true) {
                            $scope.isLoading = false;
                            $scope.rowCollection = response.encounters;

                            angular.forEach($scope.rowCollection, function (row) {
                                var result = $filter('filter')($scope.enabled_dates, moment(row.date_time).format('YYYY-MM-DD'));
                                if (result.length == 0)
                                    $scope.enabled_dates.push(moment(row.date_time).format('YYYY-MM-DD'));
                            });
                            $scope.$broadcast('refreshDatepickers');
                        } else {
                            $scope.errorData = response.message;
                        }
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading encounter!";
                    });
        };

        //Collapse / Expand 
        $scope.ctrl = {};
        $scope.allExpanded = true;
        $scope.expanded = true;
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        $scope.enc = {};
        $scope.$watch('patientObj.patient_id', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $rootScope.commonService.GetEncounterListByPatientAndType($scope.app.logged_tenant_id, '0,1', false, $scope.patientObj.patient_id, 'IP', function (response) {
                    //Most probably because splice() mutates the array, and angular.forEach() uses invalid indexes
                    //That's y used while instead of foreach
                    var i = response.length;
                    while (i--) {
                        var patient_details = response[i];
                        if (patient_details.encounter_type == 'IP') {
                            patient_details.encounter_id = patient_details.encounter_id.toString();
                        } else {
                            response.splice(i, 1);
                        }
                    }
                    $scope.encounters = response;
                    if (response != null) {
                        var sel_enc = $scope.encounters[0];
                        if ($state.params.enc_id) {
                            sel_enc = $filter('filter')($scope.encounters, {encounter_id: $state.params.enc_id});
                            sel_enc = sel_enc[0];
                        }
                        $scope.enc.selected = sel_enc;
                        if (($scope.enc.selected.encounter_status == '0') && ($scope.enc.selected.viewChargeCalculation.balance < 0)) {
                            $scope.add_payment = false;
                        } else {
                            $scope.add_payment = true;
                        }
                    }
                });
            }
        }, true);

        $scope.$watch('enc.selected.encounter_id', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $('#view_billing').addClass('active');
                $scope.loadBillingCharges(newValue);
                $scope.loadRoomConcession(newValue);
                $scope.loadPharmacybill(newValue);
            }
        }, true);

        $scope.saveBillNotes = function () {
            $scope.notes_error = false;
            if ($scope.enc.selected.bill_notes) {
                data = {
                    encounter_id: $scope.enc.selected.encounter_id,
                    bill_notes: $scope.enc.selected.bill_notes,
                };

                $scope.errorData = "";

                post_url = $rootScope.IRISOrgServiceUrl + '/encounter/savebillnote';
                method = 'POST';

                $scope.loadbar('show');
                $http({
                    method: method,
                    url: post_url,
                    data: data,
                }).success(
                        function (response) {
                            if (response.success == true) {
                                $scope.loadbar('hide');
                                toaster.clear();
                                toaster.pop('success', 'Success', 'Billing Notes Updated Successfully!!');
                            }
                        }
                ).error(function (data, status) {
                    $scope.loadbar('hide');
                    if (status == 422)
                        $scope.errorData = $scope.errorSummary(data);
                    else
                        $scope.errorData = data.message;
                });
            } else {
                $scope.notes_error = true;
            }

        }

        $scope.loadRoomConcession = function (enc_id) {
            var encounter_id = enc_id;
            var selected_encounter = $.grep($scope.encounters, function (encounter) {
                return encounter.encounter_id == encounter_id;
            })[0];
            $scope.data = selected_encounter;
        }

        $scope.saveRoomConcession = function () {
            var total = 0;
            angular.forEach($scope.recurring_charges, function (recurring_charge) {
                total = total + parseFloat(recurring_charge.total_charge);
            });

            _that = this;

            angular.extend(_that.data, {total_amount: total});
            if ((parseFloat(_that.data.concession_amount) == '0') || (!_that.data.concession_amount))
            {
                $scope.errorData = 'Concession Amount is invalid. Kindly check the amount';
                return false;
            }
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/encounters/' + _that.data.encounter_id;
            method = 'PUT';
            succ_msg = 'updated successfully';

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
                            $state.go('patient.billing', {id: $state.params.id});
                        }, 1000)
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.loadBillingCharges = function (enc_id) {
            $scope.billing = {};
            $scope.recurr_billing = {};
            $scope.loadRefundCharge(enc_id);
            $scope.loadRecurringBilling(enc_id);
            $scope.loadNonRecurringBilling(enc_id);
            $scope.loadRoomChargeHistory(enc_id);
        }

        $scope.loadRecurringBilling = function (enc_id) {
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/encounter/getrecurringbilling?encounter_id=' + enc_id,
            }).success(
                    function (response) {
                        $scope.recurring_charges = null;

                        if (typeof response.recurring != 'undefined')
                            $scope.recurring_charges = response.recurring;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.loadNonRecurringBilling = function (enc_id) {
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/encounter/getnonrecurringbilling?encounter_id=' + enc_id,
            }).success(
                    function (response) {
                        $scope.procedures = null;
                        $scope.consultants = null;
                        $scope.other_charges = null;
                        $scope.advances = null;

                        if (typeof response.Procedure != 'undefined')
                            $scope.procedures = response.Procedure;

                        if (typeof response.Consults != 'undefined')
                            $scope.consultants = response.Consults;

                        if (Object.keys(response.OtherCharge).length)
                            $scope.other_charges = response.OtherCharge;

                        if (Object.keys(response.Advance).length)
                            $scope.advances = response.Advance;

                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.loadRoomChargeHistory = function (enc_id) {
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/encounter/getroomchargehistory?encounter_id=' + enc_id,
            }).success(
                    function (response) {
                        $scope.charge_alerts = response.history;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.loadPharmacybill = function (enc_id) {
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacysale/getsalebilling?addtfields=patient_report&encounter_id=' + enc_id,
            }).success(
                    function (response) {
                        $scope.pharmacy_charge = response.sale;
                        $scope.pharmacy_bill = response.billing;
                        $scope.pharmacy_concession = response.pharmacy_concession;
                        $scope.logged_tenant_id = response.logged_tenant;
                        var grandTotal = 0;
                        angular.forEach($scope.pharmacy_charge, function (obj) {
                            grandTotal += $scope.parseFloatIgnoreCommas(obj.bill_amount);
                            obj.net_amount = grandTotal;
                        });
                        var grandTotal = 0;
                        angular.forEach($scope.pharmacy_bill, function (obj) {
                            grandTotal += $scope.parseFloatIgnoreCommas(obj.sale_details.billings_total_paid_amount_using_pharmacy);
                            obj.net_amount = grandTotal;
                        });
                        var grandTotal = 0;
                        angular.forEach($scope.pharmacy_concession, function (obj) {
                            grandTotal += $scope.parseFloatIgnoreCommas(obj.sale_details.billings_total_paid_amount_using_concession);
                            obj.net_amount = grandTotal;
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

        $scope.loadRefundCharge = function (enc_id) {
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/patientrefundpayment/getrefundcharge?encounter_id=' + enc_id,
            }).success(
                    function (response) {
                        $scope.refund = response.model;
                        if ($scope.refund) {
                            $scope.refund_amount = $scope.refund.refund_amount;
                        } else {
                            $scope.refund_amount = 0;
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

        $scope.moreOptions = function (key, type, pk_id, link_id, concession_amount, extra_amount, mode_id) {
            var row_id = '#enc_' + type + '_' + key;
            $scope.more_li = [];
            $scope.more_advance_li = [];
            $scope.more_advance_hidden = [];

            $('.enc_chk').not(row_id).attr('checked', false);

            if ($(row_id).is(':checked')) {
                if (type == 'advance') {
                    $scope.more_advance_li.push({href: 'patient.editPayment({id: "' + $state.params.id + '", payment_id: ' + pk_id + ', enc_id: "' + $scope.enc.selected.encounter_id + '"})', name: 'Modify Payment', mode: 'sref', i_class: 'fa fa-pencil'});
                    $scope.more_advance_li.push({href: "deletePayment('" + $state.params.id + "', " + pk_id + ")", name: 'Delete Payment', mode: 'click', i_class: 'fa fa-trash', url: 'patient.deletePayment'});
                }

                if (type == 'other') {
                    $scope.more_li.push({href: 'patient.editOtherCharge({id: "' + $state.params.id + '", other_charge_id: ' + pk_id + '})', name: 'Modify Other Charge', mode: 'sref', i_class: 'fa fa-pencil'});
                } else if (type == 'procedure' || type == 'consultant') {
                    var ec_type = '';
                    if (type == 'procedure') {
                        ec_type = 'P';
                    }
                    if (type == 'consultant') {
                        ec_type = 'C';
                    }

                    if (extra_amount == '0.00') {
                        $scope.more_li.push({href: 'patient.addExtraAmount({id: "' + $state.params.id + '", ec_type: "' + ec_type + '", link_id: "' + link_id + '", enc_id: "' + $scope.enc.selected.encounter_id + '"})', name: 'Add Extra Amount', mode: 'sref', i_class: 'fa fa-plus-square'});
                    } else {
                        $scope.more_li.push({href: 'patient.editExtraAmount({id: "' + $state.params.id + '", ec_id: "' + pk_id + '", enc_id: "' + $scope.enc.selected.encounter_id + '"})', name: 'Edit Extra Amount', mode: 'sref', i_class: 'fa fa-pencil'});
                    }

                    if (concession_amount == '0.00') {
                        $scope.more_li.push(
                                {href: 'patient.addConcessionAmount({id: "' + $state.params.id + '", ec_type: "' + ec_type + '", link_id: "' + link_id + '", enc_id: "' + $scope.enc.selected.encounter_id + '"})', name: 'Add Concession Amount', mode: 'sref', i_class: 'fa fa-plus-square'}
                        );
                    } else {
                        $scope.more_li.push(
                                {href: 'patient.editConcessionAmount({id: "' + $state.params.id + '", ec_id: "' + pk_id + '", enc_id: "' + $scope.enc.selected.encounter_id + '"})', name: 'Edit Concession Amount', mode: 'sref', i_class: 'fa fa-pencil'}
                        );
                    }
                }
            }
        }

        $scope.getTotalPrice = function (row) {
            tot = parseFloat(row.total_charge) + parseFloat(row.extra_amount) - parseFloat(row.concession_amount);
            return tot;
        }

        $scope.getTotalRecurringPrice = function (row) {
            tot = parseFloat(row.total_charge);
            return tot;
        }

        $scope.parseFloat = function (row) {
            return parseFloat(row);
        }

        //Delete
        $scope.deletePayment = function (patient_id, payment_id) {
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                $scope.loadbar('show');
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/patientbillingpayment/remove",
                    method: "POST",
                    data: {id: payment_id}
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.$watch('enc.selected.encounter_id', function (newValue, oldValue) {
                                    if (newValue != '' && typeof newValue != 'undefined') {
                                        $scope.loadBillingCharges(newValue);
                                    }
                                }, true);
                                $scope.more_advance_li = {};
                                $scope.msg.successMessage = 'Advance Payment Deleted Successfully';
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                )
            }
        };

        $scope.password_auth = function (encounter_id, column, value, title) {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.password_auth.html',
                controller: "PasswordAuthController",
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });
            modalInstance.data = {
                encounter_id: encounter_id,
                column: column,
                value: value,
                title: title,
            };

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        $scope.refundAmount = function (encounter_id, column, value, title) {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.refund_amount.html',
                controller: "RefundAmountController",
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });
            modalInstance.data = {
                encounter_id: encounter_id,
                column: column,
                value: value,
                title: title,
            };

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //Delete
        $scope.removeRow = function (row) {
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                $scope.loadbar('show');
                var index = $scope.displayedCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/patientconsultants/remove",
                        method: "POST",
                        data: {id: row.pat_consult_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadPatConsultantsList();
                                    $scope.msg.successMessage = 'Patient Consultant Deleted Successfully';
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };

        $scope.changeRoomChargeHistory = function (mode, alert) {
            var conf = confirm('Are you sure to ' + mode + ' ?');
            if (!conf)
                return;

            if (mode == 'apply') {
                url = $rootScope.IRISOrgServiceUrl + "/encounter/updaterecurringroomcharge";
            } else {
                url = $rootScope.IRISOrgServiceUrl + "/encounter/cancelroomchargehistory";
            }

            var index = $scope.charge_alerts.indexOf(alert);
            $http({
                url: url,
                method: "POST",
                data: {charge_hist_id: alert.charge_hist_id}
            }).then(
                    function (resp) {
                        $scope.recurr_billing.total = {};
                        $scope.recurring_charges = null;
                        $scope.recurring_charges = resp.data.recurring;
                        $scope.charge_alerts.splice(index, 1);
                    }
            )
            return false;
        }

        $scope.printVoucher = {};
        $scope.setVoucher = function (row, id, model, pk_id) {
            $scope.updatePrintcreatedby(model, pk_id);
            $scope.printVoucher = row;
            $timeout(function () {
                var innerContents = document.getElementById(id).innerHTML;
                var popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
                popupWinindow.document.open();
                popupWinindow.document.write('<html><head><link href="css/print.css" rel="stylesheet" type="text/css" /></head><body onload="window.print()">' + innerContents + '</html>');
                popupWinindow.document.close();
            }, 1000)
        }

        $scope.openPrintBill = function (size) {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.print_bill.html',
                controller: "PrintBillController",
                size: size,
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });

//            modalInstance.data = {
//                enc: $scope.enc,
//            };

            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }

        //Patient Billing History
        $scope.loadBillingHistory = function () {
            $scope.errorData = '';
            $scope.isLoading = true;
            $scope.rowCollection = [];  // base collection
//            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            var url = $rootScope.IRISOrgServiceUrl + '/patientbillingpayment/billinghistory?id=' + $state.params.id + '&enc_id=' + $state.params.enc_id;

            $http.get(url)
                    .success(function (response) {
                        if (response.success == true) {
                            $scope.isLoading = false;
                            $scope.rowCollection = response.result;
                            $scope.displayedCollection = [].concat($scope.rowCollection);
                        } else {
                            $scope.errorData = response.message;
                        }
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading billing history!";
                    });
        }

        $scope.parseFloatIgnoreCommas = function (amount) {
            var numberNoCommas = amount.replace(/,/g, '');
            return parseFloat(numberNoCommas);
        }

        $scope.increasePrintCount = function () {
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/patientrefundpayment/increaseprintcount?encounter_id=' + $scope.enc.selected.encounter_id,
            }).success(
                    function (response) {
                        return true;
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