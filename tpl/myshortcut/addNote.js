app.controller('AddnoteController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', function ($rootScope, $scope, $timeout, $http, $state, $filter) {

        $scope.checkboxes = {'checked': false, items: []};

        $scope.data = {};

        $scope.loadPatientsList = function (type) {
            $scope.isLoading = true;
            $('.op-btn-group button, .op-btn-group a').removeClass('active');
            $('.op-btn-group button.' + type + '-op-patient').addClass('active');
            var pageURL = $rootScope.IRISOrgServiceUrl + '/encounter/patientlist?addtfields=shortcut&type=' + type;
            $http.get(pageURL)
                    .success(function (patients) {
                        $scope.isLoading = false;
                        $scope.rowCollection = patients;
                        $scope.checkboxes = {'checked': false, items: []};
                        $scope.selectall = {'checked': false};
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading!";
                    });
        };

        $scope.updateCheckbox = function () {
            angular.forEach($scope.rowCollection, function (row) {
                row.selected = $scope.selectall;
            });

            $timeout(function () {
                angular.forEach($scope.rowCollection, function (row, ip_key) {
                    $scope.moreOptions(ip_key, row);
                });
            }, 800);
        };

        $scope.moreOptions = function (ip_key, row) {
            admission_exists = $filter('filter')($scope.checkboxes.items, {encounter_id: row.encounter_id});
            if ($("#iplist_" + ip_key).is(':checked')) {
                $("#iplist_" + ip_key).closest("tr").addClass("selected_row");
                if (admission_exists.length == 0) {
                    $scope.checkboxes.items.push({
                        encounter_id: row.encounter_id,
                        row: row
                    });
                }
            } else {
                $("#iplist_" + ip_key).closest("tr").removeClass("selected_row");
                if (admission_exists.length > 0) {
                    $scope.checkboxes.items.splice($scope.checkboxes.items.indexOf(admission_exists[0]), 1);
                }
            }
        };

        $scope.saveForm = function () {
            _that = this;
            _that.data.patientdata = [];
            angular.forEach($scope.checkboxes.items, function (value) {
                _that.data.patientdata.push({
                    encounter_id: value.encounter_id,
                    patient_id: value.row.apptPatientData.patient_id,
                });
            });
            
            post_url = $rootScope.IRISOrgServiceUrl + '/patientnotes/bulkinsert';
            method = 'POST';
            succ_msg = 'Patient Note saved successfully';

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        if (response.success == true) {
                            $scope.errorData = "";
                            $scope.loadbar('hide');
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            angular.forEach($scope.rowCollection, function (row) {
                                row.selected = $scope.selectall;
                            });
                        } else {
                            $scope.loadbar('hide');
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

    }]);