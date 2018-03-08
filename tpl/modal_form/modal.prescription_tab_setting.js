app.controller('PrescriptiontabModalInstanceCtrl', ['scope', '$scope', '$modalInstance', '$state', '$rootScope', '$timeout', '$http', function (scope, $scope, $modalInstance, $state, $rootScope, $timeout, $http) {

        $scope.saveForm = function () {
            $scope.errorData = "";
            $scope.successMessage = "";

            data = $('#tabsettingForm').serializeArray();
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/patientprescription/updatetabsetting',
                data: data,
            }).success(
                    function (response) {
                        scope.loadbar('hide');
                        $scope.successMessage = 'Prescription tab settings updated successfully';
                        $timeout(function () {
                            $modalInstance.dismiss('cancel');
                            $state.reload();
                        }, 1000)
                    }
            ).error(function (data, status) {
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.initSettings = function () {
            $http.get($rootScope.IRISOrgServiceUrl + '/appconfigurations')
                    .success(function (configurations) {
                        $scope.tab_data = [];
                        angular.forEach(configurations, function (conf) {
                            var group = conf.group;
                            if (group == 'prescription_tab')
                            {
                                $scope.tab_data.push(conf);
                            }
                        });
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading settings!";
                    });
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
  