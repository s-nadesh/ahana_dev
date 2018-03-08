app.controller('CityModalInstanceCtrl', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', 'state_id', 'country_id', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, state_id, country_id) {
        $scope.data = {};
        
        $scope.countries = scope.countries;
        $scope.states = scope.states;
        
//        $scope.updateState();
        
        $scope.data.country_id = country_id;
        
        $scope.updateState = function () {
            $scope.availableStates = [];
            $scope.availableCities = [];

            _that = this;
            angular.forEach($scope.states, function (value) {
                if (value.countryId == _that.data.country_id) {
                    var obj = {
                        value: value.value,
                        label: value.label
                    };
                    $scope.availableStates.push(obj);
                }
            });
            $scope.data.state_id = state_id;
        }
        
        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/cities';
            method = 'POST';
            succ_msg = 'City saved successfully';

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
                            new_city = {
                                value: response.city_id,
                                label: response.city_name,
                                stateId: response.state_id,
                            };
                            scope.cities.push(new_city);
                            scope.afterCityAdded(response.city_id);
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
  