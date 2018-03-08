app.controller('GenericModalInstanceCtrl', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http) {
        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/genericnames';
            method = 'POST';
            succ_msg = 'GenericName saved successfully';

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
                            scope.generics.push(response);
                            scope.data.generic_id = response.generic_id;
                            scope.showDrugDropdown = true;
                            scope.data.drug_name = '';
                            scope.data.drug_class_id = '';
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
  