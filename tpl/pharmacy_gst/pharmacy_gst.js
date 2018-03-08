app.controller('GstController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

        //Index Page
        $scope.loadGstList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacygst')
                    .success(function (gst) {
                        $scope.isLoading = false;
                        $scope.rowCollection = gst;
                        $scope.displayedCollection = [].concat($scope.rowCollection);
                        
                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading vat!";
                    });
        };

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;
            
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacygsts';
                method = 'POST';
                succ_msg = 'Gst saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/pharmacygsts/' + _that.data.gst_id;
                method = 'PUT';
                succ_msg = 'Gst updated successfully';
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
                            $state.go('configuration.gst');
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
                url: $rootScope.IRISOrgServiceUrl + "/pharmacygsts/" + $state.params.id,
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
                        url: $rootScope.IRISOrgServiceUrl + "/pharmacyvat/remove",
                        method: "POST",
                        data: {id: row.vat_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadVatsList();
                                    $scope.msg.successMessage = 'Vat Deleted Successfully';
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