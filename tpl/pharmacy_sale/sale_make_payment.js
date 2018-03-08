app.controller('SaleMakePaymentController', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', '$state', '$filter', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, $state, $filter) {

        var sale_id = $modalInstance.data.sale_id;
        var checked_sale_id = $modalInstance.data.checked_sale_id;

        sale = $modalInstance.data.sale;

        var bill_amount = sale.sum_bill_amount;
        var paid = sale.sum_paid_amount;
        var balance = sale.sum_balance_amount;
        var sale_payment_type = sale.payment_type;
        var encounter_id = sale.encounter_id;

        $scope.bill_amount = bill_amount;
        $scope.paid = paid;
        $scope.balance = balance;
        $scope.data = {};
        $scope.data.paid_date = moment().format('YYYY-MM-DD');
        $scope.data.paid_amount = balance;
        $scope.patient_name = sale.patient_name;
        $scope.sale_payment_type = sale_payment_type;
        $scope.encounter_id = encounter_id;
        $scope.data.payment_mode = 'CA';

        $scope.saleitems = [];
        angular.forEach(sale.items, function (item) {
            if (item.payment_type != 'CA' && item.payment_status != 'C') {
                if (checked_sale_id == null || checked_sale_id == item.sale_id) {
                    item.checked = true;
                } else {
                    item.checked = false
                }
                $scope.saleitems.push(item);
            }
        });

        $rootScope.commonService.GetPaymentModes(function (response) {
            $scope.paymentModes = response;
        });

        $rootScope.commonService.GetCardTypes(function (response) {
            $scope.cardTypes = response;
        });


        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.maxDate = new Date();

        $scope.bills = [];

        amt = 0;
        angular.forEach($scope.saleitems, function (item) {
            if (checked_sale_id == null || checked_sale_id == item.sale_id) {
                $scope.bills.push(item.sale_id);
                var a = item.billings_total_balance_amount;
                a = a.replace(/\,/g, ''); // 1125, but a string, so convert it to number
                a = parseInt(a, 10);

                amt = amt + a;
            }
        });
        $scope.paid_amount = amt;
        $scope.data.paid_amount = amt;
        $scope.total_select_bill_amount = amt;

        $scope.updatePaid = function (saleitem) {
            $scope.paid_amount = 0;
            $scope.data.paid_amount = 0;
            amt = 0;

            $scope.bills = [];
            $('.chk:checked').each(function () {
                $scope.bills.push($(this).data('bill'));
                var a = $(this).val();
                a = a.replace(/\,/g, ''); // 1125, but a string, so convert it to number
                a = parseInt(a, 10);
                amt = amt + a;
            });

            $scope.paid_amount = amt;
            $scope.data.paid_amount = amt;
            $scope.total_select_bill_amount = amt;
        }

        $scope.saveForm = function () {
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
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacysalebilling/makepayment';
            method = 'POST';
            succ_msg = 'Payment added successfully';

            angular.extend(_that.data, {sale_ids: $scope.bills, encounter_id: $scope.encounter_id, payment_type: $scope.sale_payment_type, total_select_bill_amount: $scope.total_select_bill_amount});
            scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        if (response.success == false) {
                            scope.loadbar('hide');
                            if (status == 422)
                                $scope.errorData = scope.errorSummary(data);
                            else
                                $scope.errorData = response.message;
                        } else {
                            scope.loadbar('hide');
                            scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            $timeout(function () {
                                //scope.updateDisplayCollection($scope.encounter_id, response.sales[0]);
                                scope.loadSaleItemList('CR');
                                $modalInstance.dismiss('cancel');

//                                $state.go('pharmacy.sales');
                            }, 1000)
                        }
                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
  