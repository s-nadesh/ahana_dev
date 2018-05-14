app.controller('PharmacyconcessionController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {
        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.initCanAddPharmacyCharge = function () {
            $scope.isPatientHaveActiveEncounter(function (response) {
                if (response.success == false) {
                    alert("Sorry, you can't add other charge");
                    $state.go("patient.billing", {id: $state.params.id});
                } else {
                    $scope.encounter = response.model;
                    $scope.data = {};
                    $scope.data.encounter_id = response.model.encounter_id;
                    $scope.loadPharmacybill();
                }
            });
        }

        $scope.isPatientHaveActiveEncounter = function (callback) {
            $http.post($rootScope.IRISOrgServiceUrl + '/encounter/patienthaveunfinalizedencounter', {patient_id: $state.params.id, encounter_id: $state.params.enc_id})
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

        $scope.loadPharmacybill = function () {
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacysale/getpendingsalebill?addtfields=patient_report&encounter_id=' + $scope.data.encounter_id,
            }).success(
                    function (response) {
                        $scope.pharmacyBill = response.sale;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.addPharmacycharge = function (key, bill_no) {
            var row_id = '#pharmacy_' + key;
            if ($(row_id).is(':checked')) {
                $('#concession_' + key).prop('readonly', false);
            } else {
                $('#concession_' + key).prop('readonly', true);
                $scope.data.concession_[bill_no] = '';
            }
        }

        $scope.saveConcessionForm = function () {
            _that = this;
            if (!_that.data.concession_) {
                $scope.errorData = 'Kindly choose any one bill';
                return false;
            }
            $scope.data.bill_details = [];
            $scope.concessionFormSubmit = false;
            angular.forEach($scope.pharmacyBill, function (row, key) {
                if (($scope.data.concession_[row.bill_no]) && ($scope.data.concession_[row.bill_no] != '0')) {
                    if ($scope.parseFloatIgnoreCommas(row.billings_total_balance_amount) < $scope.data.concession_[row.bill_no]) {
                        $scope.errorData = 'Kindly check ' + row.bill_no + ' bill number';
                        $scope.data.bill_details = [];
                        $scope.concessionFormSubmit = true;
                    } else {
                        $scope.data.bill_details.push({
                            sale_id: row.sale_id,
                            concession_amount: $scope.data.concession_[row.bill_no],
                        });
                    }
                }
            });
            if ($scope.concessionFormSubmit) {
                $scope.data.bill_details = [];
                return false;
            } else {
                if ($scope.data.bill_details.length == 0) {
                    $scope.errorData = 'Kindly choose any one bill';
                    return false;
                }
            }

            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacysalebilling/concessionpayment';
            method = 'POST';
            succ_msg = 'pharmacy concession amount added successfully';

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        if (response.success == true) {
                            $scope.loadbar('hide');
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            $timeout(function () {
                                $state.go('patient.billing', {id: $state.params.id});
                            }, 1000)
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

        $scope.parseFloatIgnoreCommas = function (amount) {
            var numberNoCommas = amount.replace(/,/g, '');
            return parseFloat(numberNoCommas);
        }
    }]);