app.controller('ExtraConcessionController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.isPatientHaveActiveEncounter = function (callback) {
            $http.post($rootScope.IRISOrgServiceUrl + '/encounter/patienthaveunfinalizedencounter', {patient_id: $state.params.id, encounter_id: $state.params.enc_id})
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

        $scope.initCanExtraConcession = function () {
            $scope.isPatientHaveActiveEncounter(function (response) {
                if (response.success == false) {
                    alert("Sorry, you can't add charge");
                    $state.go("patient.billing", {id: $state.params.id});
                } else {
                    $scope.encounter = response.model;
                    $scope.data = {};
                    $scope.data.formtype = 'add';
                    $scope.data.ec_type = $state.params.ec_type;

                    $scope.initCategory($state.params.enc_id, $scope.patientObj.patient_id, $state.params.link_id, $state.params.ec_type);
                }
            });
        }

        $scope.initForm = function () {
            $rootScope.commonService.GetChargeCategoryList('', '1', false, 'ALC', function (response) {
                $scope.alliedCharges = response.categoryList;
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                angular.extend(_that.data, {
                    patient_id: $scope.patientObj.patient_id,
                    encounter_id: $scope.encounter.encounter_id,
                });
                post_url = $rootScope.IRISOrgServiceUrl + '/patientbillingextraconcession/addcharge';
                method = 'POST';
                succ_msg = 'Amount added successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientbillingextraconcessions/' + _that.data.ec_id;
                method = 'PUT';
                succ_msg = 'Amount updated successfully';
            }

            angular.extend(_that.data, {
                mode: $state.params.mode,
            });
                
            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');

                        if (response.success != false) {
                            $scope.msg.successMessage = succ_msg;
//                            $scope.data = {};
                            $timeout(function () {
                                $state.go('patient.billing', {id: $state.params.id});
                            }, 1000)
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

        //Get Data for update Form
        $scope.loadForm = function () {
            $scope.isPatientHaveActiveEncounter(function (response) {
                if (response.success == false) {
                    alert("Sorry, you can't add charge");
                    $state.go("patient.billing", {id: $state.params.id});
                } else {
                    $scope.encounter = response.model;
                    $scope.loadbar('show');
                    _that = this;
                    $scope.errorData = "";
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/patientbillingextraconcessions/" + $state.params.ec_id,
                        method: "GET"
                    }).success(
                            function (response) {
                                $scope.loadbar('hide');
                                $scope.data = response;
                                $scope.initCategory(response.encounter_id, response.patient_id, response.link_id, response.ec_type);

                            }
                    ).error(function (data, status) {
                        $scope.loadbar('hide');
                        if (status == 422)
                            $scope.errorData = $scope.errorSummary(data);
                        else
                            $scope.errorData = data.message;
                    });
                }
            });
        };
        
        //Init Category (Procedure or Consultant)
        $scope.initCategory = function(enc_id, patient_id, category_id, mode){
            if(mode == 'P'){
                post_url = $rootScope.IRISOrgServiceUrl + '/encounter/getnonrecurringprocedures?encounter_id=' + enc_id;
            }else if(mode == 'C'){
                post_url = $rootScope.IRISOrgServiceUrl + '/encounter/getnonrecurringprofessionals?encounter_id=' + enc_id;
            }
            post_url += '&patient_id=' + patient_id;
            post_url += '&category_id=' + category_id;
            method = 'GET';

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.data.link_id = response.category_id;
                        $scope.data.total_charge = response.total_charge;
                        $scope.data.extra_amount = response.extra_amount;
                        $scope.data.concession_amount = response.concession_amount;
                        $scope.data.headers = response.headers;
                        $scope.data.type = response.category;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        //Delete
        $scope.removeRow = function (row) {
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                $scope.loadbar('show');
                var index = $scope.displayedCollection.indexOf(row);
                if (index !== -1) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/patientnotes/remove",
                        method: "POST",
                        data: {id: row.pat_note_id}
                    }).then(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.data.success === true) {
                                    $scope.displayedCollection.splice(index, 1);
                                    $scope.loadPatNotesList();
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