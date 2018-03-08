app.controller('AddnoteController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', function ($rootScope, $scope, $timeout, $http, $state, $filter) {

        $scope.checkboxes = {'checked': false, items: []};

        $scope.data = {};
        $scope.vitalcong = {};
        $scope.data.vital_time = moment().format('YYYY-MM-DD HH:mm:ss');

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
            $scope.checkAddVitalaccess(type);
        };

        $scope.checkAddVitalaccess = function (type) {
            $scope.vital_enable_count = true;
            url = $rootScope.IRISOrgServiceUrl + '/patientvitals/checkvitalaccess?patient_type=' + type;
            $http.get(url)
                    .success(function (vitals) {
                        angular.forEach(vitals, function (row) {
                            var listName = row.code;
                            listName = listName.replace(/ /g, "_"); //Space replace to '_' like pain score convert to pain_score
                            $scope.vitalcong[listName] = row.value;
                            if (row.value == 1)
                                $scope.vital_enable_count = false;
                        });
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patientvital!";
                    });
        }

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
            if ((typeof _that.data.temperature == 'undefined' || _that.data.temperature == '') &&
                    (typeof _that.data.blood_pressure_systolic == 'undefined' || _that.data.blood_pressure_systolic == '') &&
                    (typeof _that.data.blood_pressure_diastolic == 'undefined' || _that.data.blood_pressure_diastolic == '') &&
                    (typeof _that.data.pulse_rate == 'undefined' || _that.data.pulse_rate == '') &&
                    (typeof _that.data.weight == 'undefined' || _that.data.weight == '') &&
                    (typeof _that.data.height == 'undefined' || _that.data.height == '') &&
                    (typeof _that.data.sp02 == 'undefined' || _that.data.sp02 == '') &&
                    (typeof _that.data.pain_score == 'undefined' || _that.data.pain_score == '')) {
                $scope.msg.errorMessage = "Cannot create blank entry";
                return;
            }
            angular.forEach($scope.checkboxes.items, function (value) {
                _that.data.patientdata.push({
                    encounter_id: value.encounter_id,
                    patient_id: value.row.apptPatientData.patient_id,
                });
            });

            post_url = $rootScope.IRISOrgServiceUrl + '/patientvitals/bulkinsert';
            method = 'POST';
            succ_msg = 'Patient Vital saved successfully';

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
                            $scope.data.vital_time = moment().format('YYYY-MM-DD HH:mm:ss');
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

        $scope.Calculatebmi = function () {
            if ($scope.data.height && $scope.data.weight) {
                $scope.data.bmi = (($scope.data.weight / $scope.data.height / $scope.data.height) * 10000).toFixed(2);
            }
        }

    }]);