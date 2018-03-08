app.controller('PatientProcedureController', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', '$state', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http, $state) {

        //Initialize procedures done form
        $scope.patientdata = [];
        $scope.initForm = function () {
            $scope.data = {};
            $scope.data.proc_date = moment().format('YYYY-MM-DD HH:mm:ss');

            $rootScope.commonService.GetChargeCategoryList('', '1', false, 'PRC', function (response) {
                $scope.procedures = response.categoryList;
            });

            $scope.doctors = [];
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
            });

            $scope.patientdata = $modalInstance.data;
        }

        $scope.saveForm = function () {
            if ($scope.proceduresForm.$valid) {
                _that = this;

                $scope.errorData = "";
                $scope.successMessage = "";

                docIds = [];
                angular.forEach($scope.data.consultant_ids, function (list) {
                    docIds.push(list.user_id);
                });
                _that.data.proc_consultant_ids = docIds;
                _that.data.proc_date = moment(_that.data.proc_date).format('YYYY-MM-DD HH:mm:ss');

                post_url = $rootScope.IRISOrgServiceUrl + '/procedure/bulkinsert';
                method = 'POST';
                succ_msg = 'Procedure added successfully';

                scope.loadbar('show');
                $http({
                    method: method,
                    url: post_url,
                    data: {procedures_done: _that.patientdata, data: _that.data},
                }).success(
                        function (response) {
                            if (response.success == false) {
                                scope.loadbar('hide');
                                if (status == 422)
                                    $scope.errorData = scope.errorSummary(data);
                                else
                                    $scope.errorData = response.message;
                            } else {
                                scope.loadbar('hide');
                                $scope.successMessage = succ_msg;
                                $scope.data = {};
                                $scope.patientdata = [];
                                $timeout(function () {
                                    $modalInstance.dismiss('cancel');
                                }, 1000)
                            }
                        }
                ).error(function (data, status) {
                    scope.loadbar('hide');
                    if (status == 422)
                        $scope.errorData = scope.errorSummary(data);
                    else
                        $scope.errorData = data.message;
                });
            }
        };

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
})
  