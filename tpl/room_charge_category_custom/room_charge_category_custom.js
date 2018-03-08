app.controller('CustomRoomChargeCategoriesController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$anchorScroll', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $anchorScroll) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        //Index Page
        $scope.loadCustomRoomChargeCategoriesList = function () {
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            // Get data's from service
            $rootScope.commonService.GetChargeCategoryList('', '1', false, $state.params.code, function (response) {
                $scope.category = response.category;
                $scope.isLoading = false;
                $scope.rowCollection = response.categoryList;
                $scope.displayedCollection = [].concat($scope.rowCollection);
            });
        };

        $scope.initForm = function () {
            $http.get($rootScope.IRISOrgServiceUrl + '/roomchargecategories/' + $state.params.cat_id)
                    .success(function (category) {
                        $scope.category = category;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading cities!";
                    });
        }
        
        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/roomchargesubcategories';
                method = 'POST';
                succ_msg = 'Charge saved successfully';
                
                angular.extend(_that.data, {charge_cat_id: $scope.category.charge_cat_id});
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/roomchargesubcategories/' + _that.data.charge_subcat_id;
                method = 'PUT';
                succ_msg = 'Charge updated successfully';
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
                            if($scope.category.charge_cat_code == 'ALC')
                                $state.go('configuration.alliedCharge');
                            if($scope.category.charge_cat_code == 'PRC')
                                $state.go('configuration.procedure');
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
                url: $rootScope.IRISOrgServiceUrl + "/roomchargesubcategories/" + $state.params.id,
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
                        url: $rootScope.IRISOrgServiceUrl + "/roomchargesubcategory/remove",
                        method: "POST",
                        data: {id: row.charge_subcat_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadCustomRoomChargeCategoriesList();
                                    $scope.msg.successMessage = 'Charge Deleted successfully';
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
