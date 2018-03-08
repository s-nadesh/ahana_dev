app.controller('RefundAmountController', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', '$state', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, $state) {

        $rootScope.commonService.GetPaymentModes(function (response) {
            $scope.paymentModes = response;
        });
        $rootScope.commonService.GetCardTypes(function (response) {
            $scope.cardTypes = response;
        });

        $scope.calculation = scope.enc.selected.viewChargeCalculation;
        $scope.data = {};
        $scope.data.encounter_id = scope.enc.selected.encounter_id;
        $scope.data.patient_id = scope.enc.selected.patient_id;
        $scope.data.refund_date = moment().format('YYYY-MM-DD HH:mm:ss');
        $scope.data.bank_date = moment().format('YYYY-MM-DD HH:mm:ss');
        $scope.data.refund_amount = Math.abs($scope.calculation.balance);
        $scope.data.payment_mode = 'CA';

        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/patientrefundpayments';
            method = 'POST';
            succ_msg = 'Patient refund amount saved successfully';

            scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,

            }).success(
                    function (response) {
                        scope.loadbar('hide');
                        scope.msg.successMessage = succ_msg;
                        $scope.data = {};
                        $timeout(function () {
                            $modalInstance.dismiss('cancel');
                            $state.go($state.current, {}, {reload: true});
                        }, 1000)

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
  