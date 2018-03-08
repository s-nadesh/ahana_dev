app.controller('RoutesController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

        //Index Page
        $scope.loadRoutesList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyroutes')
                    .success(function (routes) {
                        $scope.isLoading = false;
                        $scope.rowCollection = routes;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading Routes!";
                    });
        };

        //For Form
        $scope.initForm = function () {
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyroutes';
                method = 'POST';
                succ_msg = 'Route saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyroutes/' + _that.data.route_id;
                method = 'PUT';
                succ_msg = 'Route updated successfully';
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
                        $scope.data = {};
                        $timeout(function () {
                            $state.go('configuration.routes');
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

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/pharmacyroutes/" + $state.params.id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        //Delete
//        $scope.removeRow = function (row) {
//            var conf = confirm('Are you sure to delete ?');
//            if (conf) {
//                $scope.loadbar('show');
//                var index = $scope.displayedCollection.indexOf(row);
//                if (index !== -1) {
//                    $http({
//                        url: $rootScope.IRISOrgServiceUrl + "/pharmacyprodesc/remove",
//                        method: "POST",
//                        data: {id: row.route_id}
//                    }).then(
//                            function (response) {
//                                $scope.loadbar('hide');
//                                if (response.data.success === true) {
//                                    $scope.displayedCollection.splice(index, 1);
//                                    $scope.loadRoutesList();
//                                    $scope.msg.successMessage = 'Routes Deleted Successfully';
//                                }
//                                else {
//                                    $scope.errorData = response.data.message;
//                                }
//                            }
//                    )
//                }
//            }
//        };
    }]);