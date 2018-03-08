app.controller('VitalsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', function ($rootScope, $scope, $timeout, $http, $state, $filter) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.initForm = function () {
            $scope.data = {};

//            $http.get($rootScope.IRISOrgServiceUrl + '/organization/getshareorglist')
//                    .success(function (response) {
//                        $scope.organizations = response.org;
//
//                        $timeout(function () {
//                            $('#optgroup').multiSelect('refresh');
//                        }, 2000);
//                    })
//                    .error(function () {
//                        $scope.errorData = "An Error has occured while loading settings!";
//                    });

            $http.get($rootScope.IRISOrgServiceUrl + '/organization/getpatientshareresources?patient_id=' + $state.params.id)
                    .success(function (response) {
                        $scope.patient_resources = response.resources;
                        $scope.resources = [];
                        
                        angular.forEach(response.resources, function (resource) {
                            $scope.resources.push(resource.resource);
                        });

                        $http.get($rootScope.IRISOrgServiceUrl + '/appconfigurations')
                                .success(function (configurations) {
                                    $scope.config_share_data = [];

                                    angular.forEach(configurations, function (conf) {
                                        var string = conf.key;
                                        substring = "SHARE";

                                        if (string.indexOf(substring) > -1 == true) {
                                            $scope.config_share_data.push(conf);
                                        }

                                    });
                                })
                                .error(function () {
                                    $scope.errorData = "An Error has occured while loading settings!";
                                });

                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading settings!";
                    });
        }
//        $('#optgroup').multiSelect({selectableOptgroup: true});

        $scope.checkBoxEnabled = function (value) {
            result = $filter('filter')($scope.patient_resources, {resource: value});
            return result.length > 0;
        }

        $scope.toggleSelection = function (value) {
            result = $filter('filter')($scope.resources, value);
            
            if(result.length > 0){
                var index = $scope.resources.indexOf(result[0]);
                $scope.resources.splice(index, 1);
            }else{
                $scope.resources.push(value);
            }
        }

        //Save Both Add & Update Data
        $scope.saveForm = function () {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";
            
            angular.extend(_that.data, {
                patient_id: $state.params.id,
                share: $scope.resources
            });

            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/organization/updatepatientsharing',
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Patient share saved successfully';
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
                url: $rootScope.IRISOrgServiceUrl + "/patientvitals/" + $state.params.note_id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data = response;
                        $scope.encounter = {encounter_id: response.encounter_id};
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
                        url: $rootScope.IRISOrgServiceUrl + "/patientvitals/remove",
                        method: "POST",
                        data: {id: row.pat_note_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadPatVitalsList();
                                    $scope.msg.successMessage = 'Patient Note Deleted Successfully';
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