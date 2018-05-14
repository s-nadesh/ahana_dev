app.controller('ResourceController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$modal', '$log', function ($rootScope, $scope, $timeout, $http, $state, $modal, $log) {


        $scope.load_resource = function () {
            $scope.data = {};
            $http({
                url: $rootScope.IRISAdminServiceUrl + '/resource/getparentresource',
                method: "GET"
            }).then(
                    function (response) {
                        if (response.data.success === true) {
                            $scope.parent_resource = response.data.model;
                        } else {
                            $scope.errorData = response.data.message;
                        }
                    }
            );
        }

        $scope.updateChild = function () {
            $scope.data.sub_child_id = $scope.data.child_id = '';
            $scope.sub_child_resource = $scope.child_resource = [];
            $http({
                url: $rootScope.IRISAdminServiceUrl + '/resource/getchildresource',
                method: "POST",
                data: $scope.data.parent_id
            }).then(
                    function (response) {
                        if (response.data.success === true) {
                            $scope.child_resource = response.data.model;
                        } else {
                            $scope.errorData = response.data.message;
                        }
                    }
            );
        }

        $scope.updatesubChild = function () {
            $scope.data.sub_child_id = '';
            $scope.sub_child_resource = [];
            $http({
                url: $rootScope.IRISAdminServiceUrl + '/resource/getchildresource',
                method: "POST",
                data: $scope.data.child_id
            }).then(
                    function (response) {
                        if (response.data.success === true) {
                            $scope.sub_child_resource = response.data.model;
                        } else {
                            $scope.errorData = response.data.message;
                        }
                    }
            );
        }

        $scope.saveResource = function () {
            if ($scope.data.sub_child_id) {
                $scope.data.parent_id = $scope.data.sub_child_id;
            } else if ($scope.data.child_id) {
                $scope.data.parent_id = $scope.data.child_id;
            }

            $http({
                method: 'POST',
                url: $rootScope.IRISAdminServiceUrl + '/resources',
                data: $scope.data,
            }).success(
                    function (response) {
                        $scope.successMessage = 'Resources added successfully';
                        $scope.data = {};
                        $timeout(function () {
                            $state.go('app.org_list');
                        }, 1000)
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });

        }
    }]);
