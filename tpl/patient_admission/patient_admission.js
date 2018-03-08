app.controller('PatientAdmissionController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$filter', function ($rootScope, $scope, $timeout, $http, $state, $filter) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.isPatientHaveActiveEncounter = function (callback) {
            $http.post($rootScope.IRISOrgServiceUrl + '/encounter/patienthaveactiveencounter', {patient_id: $state.params.id})
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

        $scope.initCanCreateAdmission = function () {
            $scope.showForm = false;
            $scope.isPatientHaveActiveEncounter(function (response) {
                if (response.success == true) {
                    alert("This patient already have an active admission. You can't create a new admission");
                    $state.go("patient.view", {id: $state.params.id});
                }
                $scope.showForm = true;
            });
        }

        $scope.initCanSaveAdmission = function () {
            $scope.showForm = false;
            $scope.isPatientHaveActiveEncounter(function (response) {
                is_success = true;
                if (response.success == true) {
                    if (response.model.encounter_id != $state.params.enc_id) {
                        is_success = false;
                    }
                } else {
                    is_success = false;
                }

                if (!is_success) {
                    alert("This is not an active Encounter");
                    $state.go("patient.encounter", {id: $state.params.id});
                }
                $scope.showForm = true;

                $rootScope.commonService.GetDischargeTypes(function (response) {
                    $scope.dischargeTypes = response;
                });

                $scope.last_encounter_status_date = response.encounters[0].currentAdmission.status_date;
            });
        }

        $scope.initCanSwapAdmission = function () {
            $scope.showForm = false;
            $scope.isPatientHaveActiveEncounter(function (response) {
                is_success = true;
                if (response.success == true) {
                    if (response.model.encounter_id != $state.params.enc_id) {
                        is_success = false;
                    }
                } else {
                    is_success = false;
                }

                if (!is_success) {
                    alert("This is not an active Encounter");
                    $state.go("patient.encounter", {id: $state.params.id});
                }
                $scope.showForm = true;
                $scope.activeEncounter = response.model;

                $scope.data.PatAdmission.floor_id = response.model.currentAdmission.floor_id;
                $scope.data.PatAdmission.ward_id = response.model.currentAdmission.ward_id;
                $scope.data.PatAdmission.room_id = response.model.currentAdmission.room_id;
                $scope.updateRoomType();
//                $scope.data.PatAdmission.room_type_id = response.model.currentAdmission.room_type_id;


                $http.get($rootScope.IRISOrgServiceUrl + '/encounter/inpatients')
                        .success(function (inpatients) {
                            $scope.encounterList = inpatients;
                            $scope.roomList = [];

                            angular.forEach(inpatients, function (ip, key) {
                                if (ip.encounter_id != response.model.encounter_id) {
                                    label = ip.currentAdmission.room.ward_detail.floor_name + ' > ' + ip.currentAdmission.room.ward_detail.ward_name + ' > ' + ip.currentAdmission.room.bed_name;
                                    $scope.roomList.push({'value': ip.encounter_id, 'label': label});
                                }
                            });

                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured while loading floors!";
                        });
            });
        }

        $scope.initForm = function () {
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
            });

            $rootScope.commonService.GetFloorList('', '1', false, function (response) {
                $scope.floors = response.floorList;
            });

            $rootScope.commonService.GetWardList('', '1', false, function (response) {
                $scope.wards = response.wardList;
            });

            $rootScope.commonService.GetRoomList('', '1', false, '0', function (response) {
                $scope.rooms = response.roomList;
            });

            $rootScope.commonService.GetRoomTypeList('', '1', false, function (response) {
                $scope.roomTypes = response.roomtypeList;
            });

            $rootScope.commonService.GetRoomTypesRoomsList('', function (response) {
                $scope.roomTypesRoomsList = response.roomtypesroomsList;
            });

            $rootScope.commonService.GetRoomTypesRoomsList('', function (response) {
                $scope.roomTypesRoomsList = response.roomtypesroomsList;
            });
        }

        $scope.initAdmissionForm = function () {
            $scope.data = {};
            $scope.data.PatEncounter = {};
            $scope.data.PatEncounter.encounter_date = moment().format('YYYY-MM-DD HH:mm:ss');
            $scope.data.validate_casesheet = ($scope.patientObj.activeCasesheetno == null || $scope.patientObj.activeCasesheetno == '');
        }

        $scope.$watch('patientObj.activeCasesheetno', function (newValue, oldValue) {
            $scope.data.validate_casesheet = ($scope.patientObj.activeCasesheetno == null || $scope.patientObj.activeCasesheetno == '');
        }, true);

        $scope.initTransferForm = function () {
            $rootScope.commonService.GetTenantList(function (response) {
                $scope.alltenantlist = response.tenantList;
            });

            $scope.transferTypes = [
                {'value': 'TD', 'label': 'Consultant'},
                {'value': 'TR', 'label': 'Room'},
                {'value': 'TRT', 'label': 'Room Type'},
                {'value': 'TB', 'label': 'Branch'},
            ];

            // Room Type Transfer
            $scope.isPatientHaveActiveEncounter(function (response) {
                $scope.roomDetails = response;
                $scope.availableTypes = [];

                _that = this;
                angular.forEach($scope.roomTypesRoomsList, function (value) {
                    if (value.room_id == response.model.currentAdmission.room_id) {
                        var obj = {
                            room_type_id: value.room_type_id,
                            room_type_name: value.room_type_name
                        };
                        $scope.availableTypes.push(obj);
                    }
                });
            });

            $timeout(function () {
                $scope.data.PatAdmission.status_date = moment().format('YYYY-MM-DD HH:mm:ss');
            }, 1000)
        }

        $scope.initSwappingForm = function () {
            $rootScope.commonService.GetRoomTypesRoomsList('', function (response) {
                $scope.roomTypesRoomsList = response.roomtypesroomsList;
                $scope.updateRoomType();
            });
            $timeout(function () {
                $scope.data.PatAdmission.status_date = moment().format('YYYY-MM-DD HH:mm:ss');
                $scope.data.PatAdmission.swapRoom = '-';
            }, 1000)
        }

        $scope.setSwappingDetails = function () {
            $scope.data.PatAdmission.swapPatientId = '';
            $scope.data.PatAdmission.swapRoomTypeId = '';
            $scope.data.PatAdmission.swapRoom = '-';
            $scope.data.PatAdmission.swapRoomId = '';
            $scope.data.PatAdmission.swapPatientName = '';

            var filterAdmission = $filter('filter')($scope.encounterList, {encounter_id: $scope.data.PatAdmission.swapEncounterId});

            if (typeof filterAdmission[0] != 'undefined') {
                $scope.data.PatAdmission.swapFloorId = filterAdmission[0].currentAdmission.floor_id;
                $scope.data.PatAdmission.swapWardId = filterAdmission[0].currentAdmission.ward_id;
                $scope.data.PatAdmission.swapRoomId = filterAdmission[0].currentAdmission.room_id;
                $scope.data.PatAdmission.swapRoom = filterAdmission[0].currentAdmission.room.bed_name;

                $scope.data.PatAdmission.swapRoomTypeId = $scope.activeEncounter.currentAdmission.room_type_id;
                $scope.data.PatAdmission.room_type_id = filterAdmission[0].currentAdmission.room_type_id;

                $scope.data.PatAdmission.swapPatientId = filterAdmission[0].patient_id;
                $scope.data.PatAdmission.swapPatientName = filterAdmission[0].patient.fullname;
            }

            $scope.updateRoomType2();
        }

        //For Datepicker
        $scope.open = function ($event, mode) {
            $event.preventDefault();
            $event.stopPropagation();

            switch (mode) {
                case 'opened1':
                    $scope.opened1 = true;
                    break;
            }
        };

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };

        $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var d = new Date();
            var n = d.getDate();
            var m = d.getMonth();
            var y = d.getFullYear();
            var today_date = (new Date(y, m, n)).valueOf();

            if ($scope.checkAccess('patient.backdateadmission')) {
                angular.forEach($dates, function (date, key) {
                    var calender = new Date(date.localDateValue());
                    var calender_n = calender.getDate();
                    var calender_m = calender.getMonth();
                    var calender_y = calender.getFullYear();
                    var calender_date = (new Date(calender_y, calender_m, calender_n)).valueOf();

                    //Hide - Future Dates only
                    if (today_date < calender_date) {
                        $dates[key].selectable = false;
                    }
                });
            } else {
                angular.forEach($dates, function (date, key) {
                    var calender = new Date(date.localDateValue());
                    var calender_n = calender.getDate();
                    var calender_m = calender.getMonth();
                    var calender_y = calender.getFullYear();
                    var calender_date = (new Date(calender_y, calender_m, calender_n)).valueOf();

                    //Hide - Future and Past Dates
                    if (today_date != calender_date) {
                        $dates[key].selectable = false;
                    }
                });
            }
        }

        $scope.updateWard = function () {
            $scope.availableWards = [];
            $scope.availableRooms = [];
            $scope.availableRoomtypes = [];

            _that = this;
            angular.forEach($scope.wards, function (value) {
                if (value.floor_id == _that.data.PatAdmission.floor_id) {
                    var obj = {
                        ward_id: value.ward_id,
                        ward_name: value.ward_name
                    };
                    $scope.availableWards.push(obj);
                }
            });
        }

        $scope.updateBranch = function () {
            $rootScope.commonService.GetFloorList($scope.data.PatAdmission.tenant_id, '1', false, function (response) {
                $scope.floors = response.floorList;
            });

            $rootScope.commonService.GetWardList($scope.data.PatAdmission.tenant_id, '1', false, function (response) {
                $scope.wards = response.wardList;
            });

            $rootScope.commonService.GetRoomList($scope.data.PatAdmission.tenant_id, '1', false, '0', function (response) {
                $scope.rooms = response.roomList;
            });

            $rootScope.commonService.GetRoomTypeList($scope.data.PatAdmission.tenant_id, '1', false, function (response) {
                $scope.roomTypes = response.roomtypeList;
            });
            $rootScope.commonService.GetRoomTypesRoomsList($scope.data.PatAdmission.tenant_id, function (response) {
                $scope.roomTypesRoomsList = response.roomtypesroomsList;
            });
        }
        $scope.no_vacant_beds = false;
        $scope.updateRoom = function () {
            $scope.availableRooms = [];
            $scope.availableRoomtypes = [];

            _that = this;
            angular.forEach($scope.rooms, function (value) {
                if (value.ward_id == _that.data.PatAdmission.ward_id) {
                    var obj = {
                        room_id: value.room_id,
                        bed_name: value.bed_name
                    };
                    $scope.availableRooms.push(obj);
                }
            });

            if ($scope.availableRooms.length == 0) {
                $scope.no_vacant_beds = true;
            } else {
                $scope.no_vacant_beds = false;
            }
        }

        $scope.updateRoomType = function () {
            $scope.availableRoomtypes = [];

            _that = this;
            angular.forEach($scope.roomTypesRoomsList, function (value) {
                if (value.room_id == _that.data.PatAdmission.room_id) {
                    var obj = {
                        room_type_id: value.room_type_id,
                        room_type_name: value.room_type_name
                    };
                    $scope.availableRoomtypes.push(obj);
                }
            });
        }

        $scope.updateRoomType2 = function () {
            $scope.availableRoomtypes2 = [];

            _that = this;
            angular.forEach($scope.roomTypesRoomsList, function (value) {
                if (value.room_id == _that.data.PatAdmission.swapRoomId) {
                    var obj = {
                        room_type_id: value.room_type_id,
                        room_type_name: value.room_type_name
                    };
                    $scope.availableRoomtypes2.push(obj);
                }
            });
        }

        //Save Both Add Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (typeof (_that.data) != "undefined") {
                if (_that.data.hasOwnProperty('PatAdmission')) {
                    angular.extend(_that.data.PatAdmission, {patient_id: $scope.patientObj.patient_id});
                }

                if (_that.data.hasOwnProperty('PatEncounter')) {
                    angular.extend(_that.data.PatEncounter, {patient_id: $scope.patientObj.patient_id});
                }
            }

            _that.data.PatAdmission.status_date = moment(_that.data.PatAdmission.status_date).format('YYYY-MM-DD HH:mm:ss');

            if (typeof _that.data.PatEncounter.encounter_date != 'undefined')
                _that.data.PatEncounter.encounter_date = moment(_that.data.PatEncounter.encounter_date).format('YYYY-MM-DD HH:mm:ss');

            if (mode == 'create') {
                post_url = $rootScope.IRISOrgServiceUrl + '/encounter/createadmission';
                method = 'POST';
                form_data = _that.data;
            } else if (mode == 'update') {
                post_url = $rootScope.IRISOrgServiceUrl + '/encounter/updateadmission';
                method = 'PUT';
                form_data = _that.data;
            }
            succ_msg = 'Admission saved successfully';

            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: form_data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.success == true) {
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            if ($scope.checkAccess('patient.inPatients') && mode == 'create') {
                                $state.go("patient.inPatients");
                            } else {
                                $state.go("patient.encounter", {id: $state.params.id});
                            }
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

        $scope.saveAdmissionForm = function (mode) {
            _that = this;
            //console.log(_that.data.PatAdmission); return false;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            if (typeof (_that.data) != "undefined") {
                if (_that.data.hasOwnProperty('PatAdmission')) {
                    angular.extend(_that.data.PatAdmission, {patient_id: $scope.patientObj.patient_id, encounter_id: $state.params.enc_id});
                }
            }

            method = 'POST';

            //Discharge
            if (mode == 'discharge') {
                post_url = $rootScope.IRISOrgServiceUrl + '/admissions';
                succ_msg = 'Patient Discharged successfully';
            } else if (mode == 'swap') {
                post_url = $rootScope.IRISOrgServiceUrl + '/admission/patientswap';
                succ_msg = 'Patient Swapped successfully';
            } else if (mode == 'transfer') {
                post_url = $rootScope.IRISOrgServiceUrl + '/admissions';
                //Transfer
                if (_that.data.PatAdmission.type_of_transfer == 'TD') {
                    _that.data.PatAdmission.admission_status = 'TD';
                    succ_msg = "Doctor Transfered successfully";
                } else if (_that.data.PatAdmission.type_of_transfer == 'TR' || _that.data.PatAdmission.type_of_transfer == 'TRT') {
                    _that.data.PatAdmission.admission_status = 'TR';
                    if (_that.data.PatAdmission.type_of_transfer == 'TRT') {
                        _that.data.PatAdmission.floor_id = $scope.roomDetails.model.currentAdmission.floor_id;
                        _that.data.PatAdmission.ward_id = $scope.roomDetails.model.currentAdmission.ward_id;
                        _that.data.PatAdmission.room_id = $scope.roomDetails.model.currentAdmission.room_id;
                    }
                    succ_msg = "Room Transfered successfully";
                } else if (_that.data.PatAdmission.type_of_transfer == 'TB') {
                    _that.data.PatAdmission.admission_status = 'TB';
                    succ_msg = "Branch Transfered successfully";
                }
            }
                        _that.data.PatAdmission.status_date = moment(_that.data.PatAdmission.status_date).format('YYYY-MM-DD HH:mm:ss');


            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data.PatAdmission,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.success == false) {
                            $scope.errorData = response.message;
                        } else {
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            $state.go("patient.encounter", {id: $state.params.id});
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

        $scope.loadAdmissionForm = function () {
            $scope.showForm = false;
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/encounters/" + $state.params.enc_id,
                method: "GET"
            }).success(
                    function (response) {
                        if (response.currentAdmission.admission_status != 'A') {
                            alert("You can't modify a this admission");
                            $state.go("patient.encounter", {id: $state.params.id});
                        }
                        $scope.showForm = true;
                        $scope.loadbar('hide');
                        $scope.data = {};
                        $scope.data.formtype = 'update'
                        $scope.data.PatEncounter = response;
                        $scope.data.PatAdmission = response.liveAdmission;
                        $scope.updateWard();

                        $rootScope.commonService.GetRoomList('', '1', false, '0', function (list) {
                            $scope.rooms = list.roomList;
                            $scope.rooms.push(response.currentAdmission.room);
                            $scope.updateRoom();
                            $scope.updateRoomType();
                        });
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        //For Datetimepicker
        $scope.dischargeBeforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var today_date = new Date().valueOf();

            angular.forEach($dates, function (date, key) {
                if (today_date < date.localDateValue()) {
                    $dates[key].selectable = false;
                }

                var d = new Date($scope.last_encounter_status_date);
                d.setDate(d.getDate() - 1);
                var last_sts_date = d.valueOf();
                if (date.localDateValue() < last_sts_date) {
                    $dates[key].selectable = false;
                }
            });

        }
    }]);