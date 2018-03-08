app.controller('StateModalInstanceCtrl', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', 'country_id', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, country_id) {
        $scope.data = {};
        $scope.countries = scope.countries;
        
        $scope.data.country_id = country_id;
        
        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/states';
            method = 'POST';
            succ_msg = 'State saved successfully';

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
                            new_state = {
                                value: response.state_id,
                                label: response.state_name,
                                countryId: response.country_id,
                            };
                            scope.states.push(new_state);
                            scope.afterStateAdded(response.state_id);
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
  