app.controller('RoomChargesController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

        //Index Page
        $scope.loadRoomChargesList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/roomcharge')
                    .success(function (roomcharges) {
                        $scope.isLoading = false;
                        $scope.rowCollection = roomcharges;
                        
                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading roomcharges!";
                    });
        };

        //For Form
        $scope.initForm = function () {
            $rootScope.commonService.GetRoomChargeItemList('', '1', false, function (response) {
                $scope.chargeitems = response.chargeitemList;
            });
            $rootScope.commonService.GetRoomTypeList('', '1', false, function (response) {
                $scope.roomtypes = response.roomtypeList;
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/roomcharges';
                method = 'POST';
                succ_msg = 'RoomCharge saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/roomcharges/' + _that.data.charge_id;
                method = 'PUT';
                succ_msg = 'RoomCharge updated successfully';
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
                            $state.go('configuration.roomCharge');
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
                url: $rootScope.IRISOrgServiceUrl + "/roomcharges/" + $state.params.id,
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
                var index = $scope.rowCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/roomcharge/remove",
                        method: "POST",
                        data: {id: row.charge_id}
                    }).then(
                            function (response) {
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