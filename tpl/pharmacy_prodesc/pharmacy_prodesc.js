Array.prototype.indexOfObjectWithProperty = function (propertyName, propertyValue) {
    for (var i = 0, len = this.length; i < len; i++) {
        if (this[i][propertyName] === propertyValue)
            return i;
    }
    return -1;
};
Array.prototype.containsObjectWithProperty = function (propertyName, propertyValue) {
    return this.indexOfObjectWithProperty(propertyName, propertyValue) != -1;
};

app.controller('ProDescController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

        //Index Page
        $scope.loadProDescList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyprodesc')
                    .success(function (alerts) {
                        $scope.isLoading = false;
                        $scope.rowCollection = alerts;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                        
                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading prodesc!";
                    });
        };

        //For Form
        $scope.initForm = function () {
            //Get Active Routes
            $http({
                url: $rootScope.IRISOrgServiceUrl + '/patientprescription/getactiveroutes',
                method: "GET"
            }).then(
                    function (response) {
                        $scope.routes = {};
                        $scope.routes = response.data.routes;
                    }
            );
        }

        $scope.selectedRoutes = [];
        $scope.toggleSelection = function (route) {
            var index = $scope.selectedRoutes.indexOfObjectWithProperty('route_id', route.route_id);
            if (index > -1) {
                // Is currently selected, so remove it
                $scope.selectedRoutes.splice(index, 1);
            }
            else {
                // Is currently unselected, so add it
                $scope.selectedRoutes.push(route);
            }
        };

        $scope.getDescriptionRoutes = function () {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + '/patientprescription/getdescriptionroutes?id=' + $state.params.id,
                method: "GET",
                data: {id: $state.params.id}
            }).then(
                    function (response) {
                        $scope.selectedRoutes = response.data.routes;
                    }
            );
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            $scope.routeList = [];

            angular.forEach($scope.selectedRoutes, function (parent) {
                $scope.routeList.push(parent.route_id);
            });
            if (typeof this.data != "undefined") {
                this.data.route_ids = [];
                this.data.route_ids = $scope.routeList;
            }

            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";
            
            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyprodesc/adddescriptionroutes';
            method = 'POST';

            if (mode == 'add') {
                succ_msg = 'Product Type saved successfully';
            } else {
                succ_msg = 'Product Type updated successfully';
            }

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.success === true) {
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            $timeout(function () {
                                $state.go('configuration.prodesc');
                            }, 1000)
                        }
                        else {
                            $scope.errorData = response.message;
                        }
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
            $scope.getDescriptionRoutes();

            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/pharmacyprodescs/" + $state.params.id,
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
        $scope.removeRow = function (row) {
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                $scope.loadbar('show');
                var index = $scope.displayedCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/pharmacyprodesc/remove",
                        method: "POST",
                        data: {id: row.description_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadProDescList();
                                    $scope.msg.successMessage = 'Product Type Deleted Successfully';
                                }
                                else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };
    }]);