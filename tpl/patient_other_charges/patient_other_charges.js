app.controller('BillingOtherChargeController', ['$rootScope', '$scope', '$timeout', '$http', '$state', function ($rootScope, $scope, $timeout, $http, $state) {

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

        $scope.initCanAddOtherCharge = function () {
            $scope.isPatientHaveActiveEncounter(function (response) {
                if (response.success == false) {
                    alert("Sorry, you can't add other charge");
                    $state.go("patient.billing", {id: $state.params.id});
                } else {
                    $scope.encounter = response.model;
                    $scope.data = {};
                    $scope.data.formtype = 'add';
                    $scope.data.no_of_days = '01';
                    //$scope.data.charge_cat_id = '2'; // Allied charges primary id - co_room_charge_category
                }
            });
        }

        $scope.category = function () {
            $http({
                url: $rootScope.IRISOrgServiceUrl + '/roomchargecategory/getcategory',
                method: "GET"
            }).then(
                    function (response) {
                        $scope.chargecategory = response.data.category;
                    }
            );
        }

        $scope.subCategorylist = function () {
            $http({
                url: $rootScope.IRISOrgServiceUrl + '/roomchargesubcategory/getcategory',
                method: "GET"
            }).then(
                    function (response) {
                        $scope.subCategory = response.data.subCategory;
                        $scope.updateSubcategory();
                    }
            );
        }
        $scope.initForm = function () {
            $scope.category();
            $scope.subCategorylist();
            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientbillingothercharges';
                method = 'POST';
                succ_msg = 'Billing other charge saved successfully';

                angular.extend(_that.data, {
                    patient_id: $scope.patientObj.patient_id,
                    encounter_id: $scope.encounter.encounter_id
                });
                data = _that.data;
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientbillingothercharge/updatecharges';
                method = 'POST';
                succ_msg = 'Billing other charge updated successfully';
                data = {data: _that.data, sub_data: _that.alldata};
            }

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: data,
            }).success(
                    function (response) {
                        if (response.success == false) {
                            $scope.errorData = response.message;
                            $scope.loadbar('hide');
                        } else {
                            $scope.loadbar('hide');
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            $timeout(function () {
                                $state.go('patient.billing', {id: $state.params.id});
                            }, 1000)
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
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientbillingothercharge/getallothercharges",
                data: {id: $state.params.other_charge_id},
                method: "POST"
            }).success(
                    function (response) {
                        console.log(response);
                        $scope.loadbar('hide');
                        $scope.alldata = response;
                        $scope.data = response[0];
                        $scope.category();
                        $scope.subCategorylist();
                        $scope.encounter = {encounter_id: response[0].encounter_id};
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
                                } else {
                                    $scope.errorData = response.data.message;
                                }
                            }
                    )
                }
            }
        };

        $scope.updateSubcategory = function () {
            $scope.availableSubcategory = [];
            _that = this;
            angular.forEach($scope.subCategory, function (value) {
                if (_that.data.charge_cat_id == 'undefined' || _that.data.charge_cat_id == null)
                {
                    catId = _that.data.charge_cat_id;
                } else {
                    catId = _that.data.charge_cat_id;
                }
                if (value.charge_cat_id == catId) {
                    var obj = {
                        value: value.charge_subcat_id,
                        label: value.charge_subcat_name
                    };
                    $scope.availableSubcategory.push(obj);
                }
            });
        };

        $scope.updateChargeamount = function () {
            var charge_category_id = _that.data.charge_cat_id;
            var encounter_type = $scope.patientObj.encounter_type;
            var pat_category = $scope.patientObj.patient_category_id;
            var room_category_id = $scope.patientObj.current_room_type_id;
            var charge_sub_category = _that.data.charge_subcat_id;

            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientbillingothercharge/getotherchargeamount",
                method: "POST",
                data: {encounter_type: encounter_type, pat_category: pat_category, charge_sub_category: charge_sub_category, charge_category: charge_category_id, room_category: room_category_id}
            }).then(
                    function (response) {
                        $scope.data.charge_amount = response.data;
                    }
            )
        }

        $scope.updateEmptyrepeat = function () {
            $('input[name=repeat]').attr('checked', false);
        }
    }]);