app.controller('CountryModalInstanceCtrl', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http) {
        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/countries';
            method = 'POST';
            succ_msg = 'Country saved successfully';

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
                            new_country = {
                                value: response.country_id,
                                label: response.country_name,
                            };
                            scope.countries.push(new_country);
                            scope.afterCountryAdded(response.country_id);
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
  