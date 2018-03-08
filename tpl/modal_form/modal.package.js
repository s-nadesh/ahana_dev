app.controller('PackageModalInstanceCtrl', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', 'column', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, column) {
        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacypackings';
            method = 'POST';
            succ_msg = 'Packing saved successfully';

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
                            scope.packingUnits.push(response);

                            if (column == 'purchase')
                                scope.data.purchase_package_id = response.package_id;
                            else if (column == 'sale')
                                scope.data.sales_package_id = response.package_id;

                            $modalInstance.dismiss('cancel');
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
  