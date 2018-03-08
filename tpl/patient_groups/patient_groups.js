app.controller('PatientGroupsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'toaster', 'editableThemes', 'editableOptions', '$q', '$filter', 'fileUpload', 'modalService', function ($rootScope, $scope, $timeout, $http, $state, toaster, editableThemes, editableOptions, $q, $filter, fileUpload, modalService) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';

        //Index Page
        $scope.loadPatientGroupsList = function () {
            $scope.isLoading = true;
            $scope.rowCollection = [];

            // Get data's from service
            $http.get($rootScope.IRISOrgServiceUrl + '/patientgroup')
                    .success(function (patientGroups) {
                        $scope.isLoading = false;
                        $scope.rowCollection = patientGroups;

                        //Avoid pagination problem, when come from other pages.
                        $scope.footable_redraw();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patientGroups!";
                    });
        };

        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };
        
        $scope.loadPharmacyPatientGroupsList = function () {
            $scope.isLoading = true;
            $scope.rowCollection = [];
            $scope.patients = [];
            $scope.maxSize = 5; // Limit number for pagination display number.  
            $scope.totalCount = 0; // Total number of items in all pages. initialize as a zero  
            $scope.pageIndex = 1; // Current page number. First page is 1.-->  
            $scope.pageSizeSelected = 10; // Maximum number of items per page.
            $scope.getPharmacyPatientGroupsList();
        };
        $scope.getPharmacyPatientGroupsList = function(){
            var pageURL = $rootScope.IRISOrgServiceUrl + '/patientgroup/patientgroup?onlyfields=pharmacylist&p=' + $scope.pageIndex + '&l=' + $scope.pageSizeSelected;
            if (typeof $scope.form_filter != 'undefined' && $scope.form_filter != '') {
                pageURL += '&s=' + $scope.form_filter;
            }
            // Get data's from service
            $http.get(pageURL)
                    .success(function (response) {
                        $scope.isLoading = false;
                        $scope.rowCollection = response.patientgroups;
                        $scope.totalCount = response.totalCount;
                       // $scope.form_filter = null;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading groups!";
                    });
        }
        $scope.pageChanged = function () {
            $scope.isLoading = true
            $scope.getPharmacyPatientGroupsList();
        };
        //This method is calling from dropDown  
        $scope.changePageSize = function () {
            $scope.isLoading = true
            $scope.pageIndex = 1;
            $scope.getPharmacyPatientGroupsList();
        };
        $scope.addSubRow = function (id) {
            angular.forEach($scope.rowCollection, function (parent) {
                if (parent.patient_group_id == id) {
                    $scope.inserted = {
                        temp_patient_group_id: Math.random().toString(36).substring(7),
                        patient_title_code: '',
                        patient_firstname: '',
                        global_patient_id: '',
                    };
                    parent.patients.push($scope.inserted);
                    return;
                }
            });
        };

        var canceler;

        $scope.getPatients = function (patientName) {
            if (canceler)
                canceler.resolve();
            canceler = $q.defer();

            $scope.show_patient_loader = true;

            return $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/patient/getpatient',
                data: {'search': patientName},
                timeout: canceler.promise,
            }).then(
                    function (response) {
                        $scope.patients = [];
                        angular.forEach(response.data.patients, function (list) {
                            if (!list.Patient.have_patient_group)
                                $scope.patients.push(list.Patient);
                        });
                        $scope.loadbar('hide');
                        $scope.show_patient_loader = false;
                        return $scope.patients;
                    }
            );
        };

        $scope.updatePatient = function (data, id, patient_group_id, temp_patient_group_id) {
            $scope.errorData = $scope.msg.successMessage = '';

            if (typeof data.patient.patient_id != 'undefined') {
                post_method = 'POST';
                post_url = $rootScope.IRISOrgServiceUrl + '/patientgroup/syncpatient';
                var post_data = {patient_group_id: patient_group_id, patient_guid: data.patient.patient_guid, sync: 'link'}
                succ_msg = 'Patient saved successfully';

                var selected_group = $filter('filter')($scope.rowCollection, {patient_group_id: patient_group_id});
                if (selected_group.length) {
                    var selected_patient = $filter('filter')(selected_group[0].patients, {temp_patient_group_id: temp_patient_group_id});
                    var filter_global_patient = $filter('filter')($scope.patients, {patient_global_guid: data.patient.patient_global_guid});

                    if (selected_patient.length) {
                        selected_patient[0].patient_title_code = filter_global_patient[0].patient_title_code;
                        selected_patient[0].patient_firstname = filter_global_patient[0].patient_firstname;

                        $scope.loadbar('show');
                        $http({
                            method: post_method,
                            url: post_url,
                            data: post_data,
                        }).success(
                                function (response) {
                                    $scope.loadbar('hide');
                                    $scope.msg.successMessage = succ_msg;
                                    var index = selected_group[0].patients.indexOf(selected_patient);
                                    selected_group[0].patients.splice(index, 1);
                                    selected_group[0].patients.push(response.patient);
                                }
                        ).error(function (data, status) {
                            $scope.loadbar('hide');
                            if (status == 422)
                                $scope.errorData = $scope.errorSummary(data);
                            else
                                $scope.errorData = data.message;
                        });
                    }
                }
            }
        };

        $scope.deleteSubRow = function (patient_group_id, global_patient_id, temp_patient_group_id) {
            //Remove Temp Row from Table
            if (typeof temp_patient_group_id != 'undefined') {
                angular.forEach($scope.rowCollection, function (parent) {
                    if (parent.patient_group_id == patient_group_id) {
                        angular.forEach(parent.patients, function (sub) {
                            if (sub.temp_patient_group_id == temp_patient_group_id) {
                                var index = parent.patients.indexOf(sub);
                                parent.patients.splice(index, 1);
                            }
                        });
                    }
                });
            }
            //Remove Row from Table & DB
            if (typeof global_patient_id != 'undefined' && global_patient_id) {
                console.log(global_patient_id);
                selected_group = $filter('filter')($scope.rowCollection, {patient_group_id: patient_group_id});
                if (selected_group.length) {
                    var pat = $filter('filter')(selected_group[0].patients, {global_patient_id: global_patient_id});
                    if (pat.length) {
                        var conf = confirm('Are you sure to delete ?');
                        if (conf) {
                            $http({
                                url: $rootScope.IRISOrgServiceUrl + "/patientgroup/syncpatient",
                                method: "POST",
                                data: {patient_group_id: patient_group_id, global_patient_id: global_patient_id, sync: 'unlink'}
                            }).then(
                                    function (response) {
                                        $scope.loadbar('hide');
                                        var index = selected_group[0].patients.indexOf(pat);
                                        selected_group[0].patients.splice(index, 1);
                                        $scope.msg.successMessage = pat[0].patient_firstname + ' deleted successfully !!!';
                                    }
                            );
                        }
                    }
                }

            }
        };

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientgroups';
                method = 'POST';
                succ_msg = 'PatientGroup saved successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientgroups/' + _that.data.patient_group_id;
                method = 'PUT';
                succ_msg = 'PatientGroup updated successfully';
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
                            //$state.go('configuration.patientgroup');
                            $scope.back();
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
                url: $rootScope.IRISOrgServiceUrl + "/patientgroups/" + $state.params.id,
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
        
        $scope.back = function () {
            window.history.back();
        }

        //Delete
        $scope.removeRow = function (row) {
            $scope.msg.errorMessage = "";
            $scope.msg.successMessage = "";
            
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Patient Group?',
                bodyText: 'Are you sure to delete this patient group?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loadbar('show');
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patientgroup/remove',
                    data: {id: row.patient_group_id}
                }).success(
                        function (response) {
                            if (response.success) {
                                $scope.msg.successMessage = 'Group Deleted Successfully';
                            } else {
                                $scope.msg.errorMessage = response.message;
                            }
                            $scope.loadbar('hide');
                            $scope.loadPatientGroupsList();
                        }
                ).error(function (data, status) {
                    $scope.loadbar('hide');
                    if (status === 422)
                        $scope.errorData = $scope.errorSummary(data);
                    else
                        $scope.errorData = data.message;
                });
            });
        };
    }]);