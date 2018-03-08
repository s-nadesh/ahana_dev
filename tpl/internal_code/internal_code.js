/* Controllers */
app.controller('InternalCodeController', ['$scope', '$http', '$filter', '$state', '$rootScope', '$timeout', function ($scope, $http, $filter, $state, $rootScope, $timeout) {

        $scope.billnoPrefix = function () {
            //Get Billing code details
            $rootScope.commonService.GetInternalCodeList('', 'B', '1', false, function (response) {
                $scope.data = response.code;
                if (response.code == null)
                    $scope.data = {formtype: 'add'};
            });
        }

        $scope.casesheetPrefix = function () {
            //Get CaseSheet code details
            $rootScope.commonService.GetInternalCodeList('', 'CS', '1', false, function (response) {
                $scope.data2 = response.code;
                if (response.code == null)
                    $scope.data2 = {formtype: 'add'};
            });
        }

        $scope.purchasePrefix = function () {
            //Get PUrchase code details
            $rootScope.commonService.GetInternalCodeList('', 'PU', '1', false, function (response) {
                $scope.data3 = response.code;
                if (response.code == null)
                    $scope.data3 = {formtype: 'add'};
            });
        }

        $scope.salePrefix = function () {
            //Get SAle code details
            $rootScope.commonService.GetInternalCodeList('', 'SA', '1', false, function (response) {
                $scope.data4 = response.code;
                if (response.code == null)
                    $scope.data4 = {formtype: 'add'};
            });
        }

        $scope.purchaseGRPrefix = function () {
            //Get Purchase GR code details
            $rootScope.commonService.GetInternalCodeList('', 'PG', '1', false, function (response) {
                $scope.data5 = response.code;
                if (response.code == null)
                    $scope.data5 = {formtype: 'add'};
            });
        }


        //Save Both Add & Update Data
        $scope.saveForm = function (mode, data) {
            var _that = {};

            if (data == 1) {
                _that.data = this.data;
            } else if (data == 2) {
                _that.data = this.data2;
            } else if (data == 3) {
                _that.data = this.data3;
            } else if (data == 4) {
                _that.data = this.data4;
            } else if (data == 5) {
                _that.data = this.data5;
            }

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/internalcodes';
                method = 'POST';
                succ_msg = 'Internal code saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/internalcodes/' + _that.data.internal_code_id;
                method = 'PUT';
                succ_msg = 'Internal code updated successfully';
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
                        $timeout(function () {
                            $state.go('configuration.internalCode');
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

    }]);

app.filter('zpad', function () {
    return function (input, n) {
        if (input === undefined)
            input = ""
        if (input.length >= n)
            return input
        var zeros = "0".repeat(n);
        return (zeros + input).slice(-1 * n)
    };
});