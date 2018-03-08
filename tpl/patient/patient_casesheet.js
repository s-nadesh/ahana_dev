app.controller('PatientCaseSheetController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        //Patient Casesheet Form
        $scope.loadPatientCaseSheetForm = function () {
            $scope.loadbar('show');
            $scope.$watch('patientObj.activeCasesheetno', function (newValue, oldValue) {
                if (newValue != '') {
                    $scope.data = {};
                    $scope.data.casesheet_no = newValue;
                    $scope.loadbar('hide');
                }
            }, true);
        }

        $scope.saveCasesheetForm = function () {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/patientcasesheet/createcasesheet';
            method = 'POST';
            succ_msg = 'Case Sheet No saved successfully';

            angular.extend(_that.data, {patient_id: $scope.patientObj.patient_id});

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        if(response.success == true){
                            $scope.msg.successMessage = succ_msg;
                            $scope.patientObj.activeCasesheetno = _that.data.casesheet_no;
                        } else {
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