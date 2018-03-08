app.controller('BatchupdateController', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', '$state', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, $state) {
        
        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
        
        $scope.initForm = function () {
            $scope.batch = $modalInstance.data;
            
            $scope.data = {};
            $scope.data.batch_id = $scope.batch.id;
            $scope.errorData = "";
            var Fields = 'batch_id,batch_no,expiry_date,mrp';
            $http({
                url : $rootScope.IRISOrgServiceUrl + '/pharmacyproductbatches/' + $scope.data.batch_id + '?fields=' + Fields,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.data = response;
                    }
            ).error(function (data, status) {
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }
        
        $scope.updateBatch = function () {
            _that = this;
            scope.loadbar('show');
            $scope.errorData = "";
            $scope.successMessage = "";
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/updatebatch',  _that.data)
                    .success(function (response) {
                        scope.loadbar('hide');
                        if (response.success === true) {
                            $scope.successMessage = 'Batch Details saved successfully';
                            $timeout(function () {
                                $modalInstance.dismiss('cancel');
                                $state.go($state.current, {}, {reload: true});
                            }, 1000)
                        } else {
                            $scope.errorData = response.message;
                        }
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading products!";
                    });
        }
        
        
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
  