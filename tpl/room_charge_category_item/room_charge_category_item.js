app.controller('RoomChargeCategoryItemsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

        //Index Page
        $scope.loadRoomChargeCategoryItemsList = function () {
            $scope.isLoading = true;
            $scope.rowCollection = [];  // base collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/roomchargeitems')
                    .success(function (roomChargeCategoryItems) {
                        $scope.isLoading = false;
                        $scope.rowCollection = roomChargeCategoryItems;

                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading roomChargeCategoryItems!";
                    });
        };

        //For Form
        $scope.initForm = function () {
//            $rootScope.commonService.GetRoomChargeCategoryList('', '1', false, function (response) {
//                $scope.categories = response.categoryList;
//            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/roomchargeitems';
                method = 'POST';
                succ_msg = 'RoomChargeCategory saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/roomchargeitems/' + _that.data.charge_item_id;
                method = 'PUT';
                succ_msg = 'RoomChargeCategory updated successfully';
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
                            $state.go('configuration.roomChargeCategoryItem');
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
                url: $rootScope.IRISOrgServiceUrl + "/roomchargeitems/" + $state.params.id,
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
                var index = $scope.rowCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/roomchargeitem/remove",
                        method: "POST",
                        data: {id: row.charge_item_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.rowCollection.splice(index, 1);
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