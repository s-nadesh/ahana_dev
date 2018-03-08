app.controller('WardsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

        //Index Page
        $scope.loadWardsList = function () {
            $scope.rowCollection = [];  // base collection
            $scope.isLoading = true;
 
            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/ward')
                    .success(function (wards) {
                        $scope.isLoading = false;
                        $scope.rowCollection = wards;
                        
                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading wards!";
                    });
        };

        //For Form
        $scope.initForm = function () {
            $rootScope.commonService.GetFloorList('', '1', false, function (response) {
                $scope.floors = response.floorList;
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/wards';
                method = 'POST';
                succ_msg = 'Ward saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/wards/' + _that.data.ward_id;
                method = 'PUT';
                succ_msg = 'Ward updated successfully';
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
                            $state.go('configuration.wards');
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
                url: $rootScope.IRISOrgServiceUrl + "/wards/" + $state.params.id,
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
            var conf = confirm('Are you sure to delete ? \nNote: All the Rooms under this ward will also be deleted !!!');
            if (conf) {
                $scope.loadbar('show');
                var index = $scope.rowCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/ward/remove",
                        method: "POST",
                        data: {id: row.ward_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.rowCollection.splice(index, 1);
                                    $scope.loadWardsList();
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