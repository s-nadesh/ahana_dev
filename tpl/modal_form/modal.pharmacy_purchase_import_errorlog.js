app.controller('PurchaseImportErrorLogController', ['scope', '$scope', '$rootScope', '$modalInstance', '$http', 'AuthenticationService', function (scope, $scope, $rootScope, $modalInstance, $http, AuthenticationService, scope) {

        $scope.loadErrorLogs = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 100; // No.of records per page
            $scope.rowCollection = [].concat($scope.rowCollection);  // displayed collection

            var currentUser = AuthenticationService.getCurrentUser();
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/pharmacypurchase/getimporterrorlog?tenant_id=' + currentUser.credentials.logged_tenant_id + '&import_log=' + $modalInstance.data.import_log,
            }).success(
                    function (response) {
                        $scope.isLoading = false;
                        $scope.rowCollection = response.result;
                        $scope.rowCollection = [].concat($scope.rowCollection);
                    }
            ).error(function (data, status) {
                $scope.errorData = "An Error has occured while loading errors!";
            });
        }
    }]);
  