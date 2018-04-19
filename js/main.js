'use strict';

/* Controllers */
angular.module('app')
        .controller('AppCtrl', ['$scope', 'Idle', 'Keepalive', '$localStorage', '$window', '$rootScope', '$state', '$cookieStore', '$http', 'CommonService', '$timeout', 'AuthenticationService', 'toaster', 'hotkeys', '$modal', '$filter', 'deviceDetector', 'IO_BARCODE_TYPES',
            function ($scope, Idle, Keepalive, $localStorage, $window, $rootScope, $state, $cookieStore, $http, CommonService, $timeout, AuthenticationService, toaster, hotkeys, $modal, $filter, deviceDetector, IO_BARCODE_TYPES) {
//                socket.forward('someEvent', $scope);

                //Angular module to detect OS / Browser / Device
                $scope.deviceDetector = deviceDetector;

                $scope.$on('socket:someEvent', function (ev, data) {
                    console.log($scope.theData);
                });

                // add 'ie' classes to html
                var isIE = !!navigator.userAgent.match(/MSIE/i);
                isIE && angular.element($window.document.body).addClass('ie');
                isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

                // config
                $scope.app = {
                    name: 'IRIS',
                    page_title: 'IRIS',
                    org_name: '',
                    org_address: '',
                    org_country: '',
                    org_state: '',
                    org_city: '',
                    org_mobile: '',
                    org_full_address: '',
                    version: '',
                    username: '',
                    logged_tenant_id: '',
                    org_logo: '',
                    org_small_logo: '',
                    org_document_logo: '',
                    // for chart colors
                    color: {
                        primary: '#7266ba',
                        info: '#23b7e5',
                        success: '#27c24c',
                        warning: '#fad733',
                        danger: '#f05050',
                        light: '#e8eff0',
                        dark: '#3a3f51',
                        black: '#1c2b36'
                    },
                    settings: {
                        themeID: 1,
                        navbarHeaderColor: 'bg-black',
                        navbarCollapseColor: 'bg-white-only',
                        asideColor: 'bg-black',
                        headerFixed: true,
                        asideFixed: false,
                        asideFolded: false,
                        asideDock: false,
                        container: false,
                        patientTopBar: true,
                        patientSideMenu: true,
                        patientContentClass: 'app-content app-content2',
                        patientFooterClass: 'app-footer app-footer2',
                    },
                    patientDetail: {
                        patientSex: '',
                        patientMaritalStatus: '',
                        patientUnseenNotesCount: '0',
                        patientUnseenVitalsCount: '0',
                    },
                    IO: {
                        types: IO_BARCODE_TYPES,
                        code: '1234567890128',
                        type: 'CODE128B',
                        barcodeOptions: {
                            displayValue: true,
                            textAlign: 'center',
                            fontSize: 27,
                            height: 72,
                            width: 1.5,
                            font: 'monospace'
                        },
                    }
                }
                //Idle Provider coding start
                Idle.watch();
                function closeModals() {
                    if ($scope.warning) {
                        $scope.warning.close();
                        $scope.warning = null;
                    }

                    if ($scope.timedout) {
                        $scope.timedout.close();
                        $scope.timedout = null;
                    }
                }
                $scope.$on('IdleStart', function () {
                    closeModals();
                    $scope.warning = $modal.open({
                        templateUrl: 'warning-dialog.html',
                        windowClass: 'modal-danger'
                    });
                });

                $scope.$on('IdleEnd', function () {
                    closeModals();
                });

                $scope.$on('IdleTimeout', function () {
                    closeModals();
                    $scope.timedout = $modal.open({
                        templateUrl: 'timedout-dialog.html',
                        windowClass: 'modal-danger'
                    });
                    $scope.logout();
                });
                //Idle Provider coding end


                // save settings to local storage
//                if (angular.isDefined($localStorage.settings)) {
//                    $scope.app.settings = $localStorage.settings;
//                } else {
//                    $localStorage.settings = $scope.app.settings;
//                }

                $localStorage.settings = $scope.app.settings;

                $scope.$watch('app.settings', function () {
                    if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
                        // aside dock and fixed must set the header fixed.
                        $scope.app.settings.headerFixed = true;
                    }
                    // save to local storage
                    $localStorage.settings = $scope.app.settings;
                }, true);

//                $scope.loggedIn = function () {
//                    return Boolean($rootScope.globals.currentUser);
//                };

//
                $scope.logout = function () {
                    localStorage.setItem("Show_available_medicine", '0');
                    var state_name = $state.current.name;
                    var state_params = $state.params;

                    $http.post($rootScope.IRISOrgServiceUrl + '/user/logout')
                            .success(function (response) {
                                if (response.success) {
                                    if (AuthenticationService.ClearCredentials(state_name, state_params)) {
                                        $timeout(function () {
                                            $window.location.reload();
                                        }, 1000);
                                    }
                                } else {
                                    $scope.errorData = response.message;
                                }
                            })
                            .error(function () {
                                $scope.errorData = "An Error has occured";
                            });
                };

                //Change Status
                $scope.updateStatus = function (modelName, primaryKey) {
                    $scope.service = CommonService;
                    $scope.service.ChangeStatus(modelName, primaryKey, function (response) {
                        $scope.msg.successMessage = 'Status changed successfully !!!';
                    });
                }

                //Added print created by user
                $scope.updatePrintcreatedby = function (modelName, primaryKey) {
                    $scope.service = CommonService;
                    $scope.service.UpdatePrintUser(modelName, primaryKey, function (response) {
                        if (response.success === true) {
                            $scope.duplicate_copy = false;
                        } else {
                            $scope.duplicate_copy = true;
                        }
                    });
                }

                //error Summary
                $scope.errorSummary = function (error) {
                    var html = '<div><p>Please fix the following errors:</p><ul>';
                    angular.forEach(error, function (error) {
                        html += '<li>' + error.message + '</li>';
                    });

                    html += '</ul></div>';
                    return html;
                }

                //show/hide Load bar
                $scope.loadbar = function (mode) {
                    if (mode == 'show') {
                        $('.butterbar').removeClass('hide').addClass('active');
                        $('.save-btn,.get-report,.search-btn,.save-print,.save-future,.save-btn-1,.save-print-bill').attr('disabled', true).html("<i class='fa fa-spin fa-spinner'></i> Please Wait...");
                    } else if (mode == 'hide') {
                        $('.butterbar').removeClass('active').addClass('hide');
                        $('.save-btn').attr('disabled', false).html("Save");
                        $('.get-report').attr('disabled', false).html("Get Report");
                        $('.search-btn').attr('disabled', false).html("Search");
                        $('.save-btn-1').attr('disabled', false).html("<i class='fa fa-check'></i> Save");
                        $('.save-print').attr('disabled', false).html("<i class='fa fa-print'></i> Save and Print");
                        $('.save-print-bill').attr('disabled', false).html("<i class='fa fa-print'></i> Save and Print Bill");
                        $('.save-future').attr('disabled', false).html("Save & Future Appointment");
                    }
                }

                $scope.spinnerbar = function (mode) {
                    if (mode == 'show') {
                        $('.modalload').removeClass("hide").addClass("show");
                    } else if (mode == 'hide') {
                        $('.modalload').removeClass("show").addClass("hide");
                    }
                }


                function isSmartDevice($window)
                {
                    // Adapted from http://www.detectmobilebrowsers.com
                    var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                    // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                    return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
                }

                $scope.navigationMenu = '';
                $scope.getNavigationMenu = function (resourceName) {
                    $http.get($rootScope.IRISOrgServiceUrl + '/default/getnavigation?resourceName=' + resourceName)
                            .success(function (response) {
                                $scope.navigationMenu = response.navigation;
                            })
                            .error(function () {
                                $scope.errorData = "An Error has occured while loading posts!";
                            });
                }

                $scope.patientObj = {};
                $scope.leftNotificationNotes = [];
                $scope.leftNotificationVitals = [];
                $scope.patient_alert_html = '';

                $scope.loadPatientDetail = function () {
                    // Get data's from service
                    if (typeof $state.params.id != 'undefined') {
                        $http.post($rootScope.IRISOrgServiceUrl + '/patient/getpatientbyguid', {guid: $state.params.id})
                                .success(function (patient) {
                                    if (patient.success == false) {
                                        $scope.spinnerbar('hide');
                                        $state.go('myworks.dashboard');
                                        $scope.msg.errorMessage = "An Error has occured while loading patient!";
                                    } else {
                                        $scope.patientObj = patient;
                                        if ($scope.patientObj.have_encounter) {
                                            $http.post($rootScope.IRISOrgServiceUrl + '/patient/getpreviousnextpatient?addtfields=shortcut', {guid: $state.params.id, encounter_type: patient.encounter_type, consultant_id: patient.consultant_id})
                                                    .success(function (patientlist) {
                                                        $scope.patientObj.nextPatient = patientlist.next;
                                                        $scope.patientObj.prevPatient = patientlist.prev;
                                                        $scope.patientObj.allEncounter = patientlist.allencounterlist;
                                                    })
                                        }
                                        $rootScope.currentPage = patient.encounter_type;
                                        $scope.setPatientAleratHtml(patient);
                                        //$scope.setPatientAllergiesHtml(patient);

                                        $rootScope.commonService.GetLabelFromValue(patient.patient_gender, 'GetGenderList', function (response) {
                                            $scope.app.patientDetail.patientSex = response;
                                        });

                                        $rootScope.commonService.GetLabelFromValue(patient.patient_marital_status, 'GetMaritalStatus', function (response) {
                                            $scope.app.patientDetail.patientMaritalStatus = response;
                                        });
                                    }
                                })
                                .error(function () {
                                    $scope.msg.errorMessage = "An Error has occured while loading patient!";
                                });
                    }
                };

                $scope.checkPatientPage = function (patient_id) {
                    var vitals_arr = ["patient.vitals", "patient.vitalCreate", "patient.vitalUpdate"];
                    var documents_arr = ["patient.document", "patient.addDocument", "patient.editDocument", "patient.addScannedDocument", "patient.addOtherDocument", "patient.editOtherDocument", "patient.viewDocument", "patient.viewOtherDocument"];
                    var consultation_arr = ['patient.consultant', 'patient.consultantUpdate', 'patient.consultantCreate'];
                    var procedure_arr = ['patient.procedure', 'patient.add_procedure', 'patient.edit_procedure'];
                    var note_arr = ['patient.notes', 'patient.noteCreate', 'patient.noteUpdate', 'patient.noteView'];
                    var billing_arr = ['patient.allbilling', 'patient.billing', 'patient.viewBillingHistory'];

                    if (jQuery.inArray($state.current.name, vitals_arr) != -1) {
                        $state.go('patient.vitals', {id: patient_id});
                    } else if (jQuery.inArray($state.current.name, documents_arr) != -1) {
                        $state.go('patient.document', {id: patient_id});
                    } else if (jQuery.inArray($state.current.name, consultation_arr) != -1) {
                        $state.go('patient.consultant', {id: patient_id});
                    } else if (jQuery.inArray($state.current.name, procedure_arr) != -1) {
                        $state.go('patient.procedure', {id: patient_id});
                    } else if (jQuery.inArray($state.current.name, note_arr) != -1) {
                        $state.go('patient.notes', {id: patient_id});
                    } else if (jQuery.inArray($state.current.name, billing_arr) != -1) {
                        $state.go('patient.allbilling', {id: patient_id});
                    } else {
                        $state.go($state.current.name, {id: patient_id});
                    }
                }

                $scope.setPatientAleratHtml = function (patient) {
                    if (patient.alert) {
                        var alert_link = '#/patient/alert/' + patient.patient_guid + '/alert';
                        $scope.patient_alert_html = '<div>' + patient.alert + '<br><a class="text-info alert-read-more" ui-sref="patient.alert({id: $scope.patientObj.patient_guid,type:alert})" href="' + alert_link + '">ReadMore</a><div>';
                    }
                }

//                $scope.setPatientAllergiesHtml = function (patient) {
//                    if (patient.allergies) {
//                        var alert_link = '#/patient/alert/' + patient.patient_guid + '/allergies';
//                        $scope.patient_allergies_html = '<div>' + patient.allergies + '<br><a class="text-info allergies-read-more" ui-sref="patient.alert({id: $scope.patientObj.patient_guid,type:allergies})" href="' + alert_link + '">ReadMore</a><div>';
//                    }
//                }

                $scope.loadUserCredentials = function () {
                    var user = AuthenticationService.getCurrentUser();
                    $scope.app.logged_tenant_id = user.credentials.logged_tenant_id;
                    $scope.app.org_name = user.credentials.org;
                    $scope.app.org_address = user.credentials.org_address;
                    $scope.app.org_country = user.credentials.org_country;
                    $scope.app.org_state = user.credentials.org_state;
                    $scope.app.org_city = user.credentials.org_city;
                    $scope.app.org_mobile = user.credentials.org_mobile;
                    $scope.app.org_full_address = user.credentials.org_address + ', ' + user.credentials.org_city;
                    $scope.app.username = user.credentials.username;
                    $scope.app.page_title = $scope.app.name + '(' + $scope.app.org_name + ')';
                    if (user.credentials.user_timeout) {
                        Idle.setIdle(user.credentials.user_timeout * 60);
                    } else {
                        Idle.unwatch();
                    }
                };

                $scope.checkAccess = function (url) {
                    var ret = true;
                    $rootScope.commonService.CheckStateAccess(url, function (response) {
                        ret = response;
                    });
                    return ret;
                }

                $scope.checkAdminAccess = function () {
                    var ret = true;
                    $rootScope.commonService.CheckAdminAccess(function (response) {
                        ret = response;
                    });
                    return ret;
                }

                $scope.msg = {};
                $scope.msg.successMessage = "";
                $scope.msg.errorMessage = "";

                $scope.$watch('msg', function (newValue, oldValue) {
                    if (newValue != oldValue) {
                        $timeout(function () {
                            $scope.msg.successMessage = false;
                            $scope.msg.errorMessage = false;
                        }, 5000);
                    }
                }, true);

                //Avoid pagination problem, when come from other pages.
                //Used in all the controller index function.
                $scope.footable_redraw = function () {
                    $timeout(function () {
                        $('.table').trigger('footable_redraw');
                    }, 100);
                }

                $scope.child = {};
//                $scope.grouped = {};

                $scope.GetNote = function (id, note_id) {

                    $scope.errorData = "";
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/patientnotes/" + note_id,
                        method: "GET"
                    }).success(
                            function (response) {
                                $scope.loadbar('hide');
                                $scope.presc_right.notedata = response;
                                $scope.encounter = {encounter_id: response.encounter_id};
                            }
                    ).error(function (data, status) {
                        $scope.loadbar('hide');
                        if (status == 422)
                            $scope.errorData = $scope.errorSummary(data);
                        else
                            $scope.errorData = data.message;
                    });
                }

                $scope.addNotes = function () {

                    if (jQuery.isEmptyObject($scope.presc_right.notedata)) {
                        $scope.presc_right.notes_error = true;
                        return;
                    }
                    $scope.presc_right.notes_error = false;

                    $scope.errorData = "";
                    $scope.msg.successMessage = "";

                    angular.extend($scope.presc_right.notedata, {
                        patient_id: $scope.patientObj.patient_id,
                        encounter_id: $scope.encounter_id
                    });

                    $scope.loadbar('show');

                    if ($scope.presc_right.notedata.pat_note_id == null) {
                        var posturl = $rootScope.IRISOrgServiceUrl + '/patientnotes';
                        var method = 'POST';
                        var mode = 'add';
                    } else {
                        var posturl = $rootScope.IRISOrgServiceUrl + '/patientnotes/' + $scope.presc_right.notedata.pat_note_id;
                        var method = 'PUT';
                        var mode = 'update';
                    }

                    $http({
                        method: method,
                        url: posturl,
                        data: $scope.presc_right.notedata,
                    }).success(function (response) {
                        $scope.presc_right.notedata = {};

                        angular.extend(response, {
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            created_date: moment().format('YYYY-MM-DD'),
                        });

                        if (mode == "update")
                        {
                            var notes_exists = '';
                            notes_exists = $filter('filter')($scope.child.notes, {pat_note_id: response.pat_note_id});
                            if (notes_exists.length > 0) {
                                $scope.child.notes.splice($scope.child.notes.indexOf(notes_exists[0]), 1);
                            }
                        }

                        $scope.child.notes.unshift(response);
                        $scope.loadbar('hide');

//                        //groupBy for reverse order keep - Nad
//                        $scope.grouped.notes = [];
//                        $scope.grouped.notes = $filter('groupBy')($scope.child.notes, 'created_date');
//                        $scope.grouped.notes = Object.keys($scope.grouped.notes)
//                                .map(function (key) {
//                                    return $scope.grouped.notes[key];
//                                });

                        $(".vbox .row-row .cell:visible").animate({scrollTop: $('.vbox .row-row .cell:visible').prop("scrollHeight")}, 1000);
//                                $scope.msg.successMessage = 'Note saved successfully';
                    })
                            .error(function (data, status) {
                                $scope.loadbar('hide');
                                if (status == 422)
                                    $scope.errorData = $scope.errorSummary(data);
                                else
                                    $scope.errorData = data.message;
                            });
                }

                $scope.check_date = function (note_date) {
                    var spandate = new Date(note_date);
                    var today = new Date();
                    var yesterday = getYesterday(new Date());

                    var checkdate = makeYMD(spandate);
                    today = makeYMD(today);
                    yesterday = makeYMD(yesterday);

                    if (today == checkdate) {
                        return "Today";
                    } else if (yesterday == checkdate) {
                        return "Yesterday";
                    } else {
                        return spandate.getDate() + '/' + (spandate.getMonth() + 1) + '/' + spandate.getFullYear();
                    }
                }

                function makeYMD(d) {
                    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
                }
                function getYesterday(d) {
                    return new Date(d.setDate(d.getDate() - 1));
                }

                $scope.presc_right = {};
                $scope.GetVital = function (id, vital_id) {

                    $scope.errorData = "";
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/patientvitals/" + vital_id,
                        method: "GET"
                    }).success(
                            function (response) {
                                $scope.loadbar('hide');
                                $scope.presc_right.vitaldata = response;
                                $scope.encounter = {encounter_id: response.encounter_id};
                            }
                    ).error(function (data, status) {
                        $scope.loadbar('hide');
                        if (status == 422)
                            $scope.errorData = $scope.errorSummary(data);
                        else
                            $scope.errorData = data.message;
                    });
                }

                $scope.addVital = function () {
                    if (jQuery.isEmptyObject($scope.presc_right.vitaldata)) {
                        $scope.presc_right.vital_error = true;
                        return;
                    } else {
                        //Check atleast any one field entered
                        var keys = Object.keys($scope.presc_right.vitaldata);
                        var len = keys.length;
                        var emptylen = 0;
                        var textString = 0;
                        angular.forEach($scope.presc_right.vitaldata, function (value, key) {
                            var regex = /^[0-9.]+$/;
                            if (((value != null) && (value != '')) && (!regex.test(value)) && ((key == 'temperature') || (key == 'blood_pressure_systolic') || (key == 'blood_pressure_diastolic') || (key == 'pulse_rate') || (key == 'weight')))
                            {
                                textString += 1;
                            }

                            if (value == '')
                                emptylen += 1;
                        });
                        if (len == emptylen) {
                            $scope.presc_right.vital_number_error = false;
                            $scope.presc_right.vital_error = true;
                            return;
                        }
                        if (textString != 0) {
                            $scope.presc_right.vital_error = false;
                            $scope.presc_right.vital_number_error = true;
                            return;
                        }
                    }

                    $scope.presc_right.vital_error = false;
                    $scope.presc_right.vital_number_error = false;

                    $scope.errorData = "";
                    $scope.msg.successMessage = "";
                    angular.extend($scope.presc_right.vitaldata, {
                        patient_id: $scope.patientObj.patient_id,
                        encounter_id: $scope.encounter_id,
                        vital_time: moment().format('YYYY-MM-DD HH:mm:ss'),
                    });

                    if ($scope.presc_right.vitaldata.vital_id == null) {
                        var posturl = $rootScope.IRISOrgServiceUrl + '/patientvitals';
                        var method = 'POST';
                        var mode = 'add';
                    } else {
                        var posturl = $rootScope.IRISOrgServiceUrl + '/patientvitals/' + $scope.presc_right.vitaldata.vital_id;
                        var method = 'PUT';
                        var mode = 'update';
                    }

                    $scope.loadbar('show');

                    $http({
                        method: method,
                        url: posturl,
                        data: $scope.presc_right.vitaldata,
                    }).success(function (response) {
                        $scope.presc_right.vitaldata = {};
                        angular.extend(response, {
                            created_at: moment().format('YYYY-MM-DD HH:mm:ss'),
                            created_date: moment().format('YYYY-MM-DD'),
                        });

                        if (mode == "update")
                        {
                            var vital_exists = '';
                            vital_exists = $filter('filter')($scope.child.vitals, {vital_id: response.vital_id});
                            if (vital_exists.length > 0) {
                                $scope.child.vitals.splice($scope.child.vitals.indexOf(vital_exists[0]), 1);
                            }
                        }
                        $scope.child.vitals.unshift(response);

                        $scope.loadbar('hide');

                        $(".vbox .row-row .cell:visible").animate({
                            scrollTop: $('.vbox .row-row .cell:visible').prop("scrollHeight")
                        }, 1000);
                    })
                            .error(function (data, status) {
                                $scope.loadbar('hide');
                                if (status == 422)
                                    $scope.errorData = $scope.errorSummary(data);
                                else
                                    $scope.errorData = data.message;
                            });
                }

                //Toggle favorite product status in prescription page.
                $scope.toggleFavourite = function (favourite_id) {
                    $http({
                        url: $rootScope.IRISOrgServiceUrl + "/patientprescriptionfavourite/togglefavourite",
                        method: "POST",
                        data: {id: favourite_id}
                    }).then(
                            function (response) {
//                                console.log(response);
                            }
                    )
                }

                //Pass fav to patient_prescription.js
                $scope.addFavouritePrescForm = function (fav) {
                    $scope.$broadcast('presc_fav', fav);
                }

                //Hot Keys
//                hotkeys.add({
//                    combo: 'f5',
//                    description: 'Create',
//                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
//                    callback: function (event) {
//                        $scope.$broadcast('HK_CREATE');
//                        event.preventDefault();
//                    }
//                });
//
//                hotkeys.add({
//                    combo: 'f6',
//                    description: 'Save',
//                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
//                    callback: function (event) {
//                        $scope.$broadcast('HK_SAVE');
//                        event.preventDefault();
//                    }
//                });

//                hotkeys.add({
//                    combo: 'f7',
//                    description: 'Delete',
//                    callback: function (event) {
//                        $scope.$broadcast('HK_DELETE');
//                        event.preventDefault();
//                    }
//                });

//                hotkeys.add({
//                    combo: 'f8',
//                    description: 'Cancel',
//                    callback: function (event) {
//                        $scope.$broadcast('HK_CANCEL');
//                        event.preventDefault();
//                    }
//                });
//
//                hotkeys.add({
//                    combo: 'f9',
//                    description: 'List',
//                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
//                    callback: function (event) {
//                        $scope.$broadcast('HK_LIST');
//                        event.preventDefault();
//                    }
//                });
//
//                hotkeys.add({
//                    combo: 'f10',
//                    description: 'Print',
//                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
//                    callback: function (event) {
//                        $scope.$broadcast('HK_PRINT');
//                        event.preventDefault();
//                    }
//                });
//
//                hotkeys.add({
//                    combo: 'f11',
//                    description: 'View',
//                    allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
//                    callback: function (event) {
//                        $scope.$broadcast('HK_VIEW');
//                        event.preventDefault();
//                    }
//                });

//                hotkeys.add({
//                    combo: 'f12',
//                    description: 'Close',
//                    callback: function (event) {
//                        $scope.$broadcast('HK_CLOSE');
//                        event.preventDefault();
//                    }
//                });

//                hotkeys.add({
//                    combo: 's',
//                    description: 'Search',
//                    callback: function (event) {
//                        $scope.$broadcast('HK_SEARCH');
//                        event.preventDefault();
//                    }
//                });
//
//                hotkeys.add({
//                    combo: 'ctrl+left',
//                    description: 'Back',
//                    callback: function () {
//                        $window.history.back();
//                    }
//                });
//
//                hotkeys.add({
//                    combo: 'ctrl+right',
//                    description: 'Forward',
//                    callback: function () {
//                        $window.history.forward();
//                    }
//                });

//                 hotkeys.add({
//                    combo: 'ctrl+p',
//                    description: 'Save and Print',
//                    callback: function (event) {
//                        $scope.$broadcast('HK_SAVE_PRINT');
//                        event.preventDefault();
//                    }
//                });

                $rootScope.$on('unauthorized', function () {
                    toaster.clear();
//                    toaster.pop('error', 'Session Expired', 'Kindly Login Again');
                    $scope.logout();
                });

                $rootScope.$on('internalerror', function () {
                    toaster.clear();
                    toaster.pop('error', 'Internal Error', 'NetworkError: 500 Internal Server Error');
                    $scope.loadbar('hide');
                });

                $scope.$on('encounter_id', function (event, data) {
                    $scope.encounter_id = data;
                });

                $scope.$on('patient_obj', function (event, data) {
                    $scope.patientObj = data;
                });

                $scope.$on('patient_alert', function (event, data) {
                    $scope.patientObj.hasalert = data.hasalert;
                    $scope.patientObj.alert = data.alert;
                    $scope.setPatientAleratHtml($scope.patientObj);
                });

                $scope.$on('patient_allergies', function (event, data) {
                    $scope.patientObj.hasallergies = data.hasallergies;
                    $scope.patientObj.allergies = data.alert;
                    //$scope.setPatientAllergiesHtml($scope.patientObj);
                });

                $scope.openUploadForm = function (block) {
                    var modalInstance = $modal.open({
                        templateUrl: 'tpl/modal_form/modal.patient_image.html',
                        controller: "PatientImageController",
                        size: 'lg',
                        resolve: {
                            scope: function () {
                                return $scope;
                            },
                            block: function () {
                                return block;
                            },
                        }
                    });
                }

                //Different ORG
                $scope.importPatient = function (patient, key) {
                    var conf = confirm('Are you sure to import basic data ?')

                    if (!conf)
                        return;

                    $scope.errorData = "";
                    $scope.msg.successMessage = "";

                    $scope.loadbar('show');
                    $('#import_' + key).attr('disabled', true).html("<i class='fa fa-spin fa-spinner'></i> Please Wait...");

                    $http({
                        method: 'POST',
                        url: $rootScope.IRISOrgServiceUrl + '/patient/importpatient',
                        data: patient,
                    }).success(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.success == true) {
                                    $scope.msg.successMessage = 'Patient imported successfully';
                                    var patient_guid = response.patient.patient_guid;
                                    $('#import_' + key).html('Completed').toggleClass('btn-success').removeAttr('ng-click');
                                    $timeout(function () {
                                        $state.go('patient.view', {id: patient_guid});
                                    }, 1000);
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
                }
                //Same ORG But different branch so Import and book
                $scope.importBookPatient = function (patient, key) {
                    $scope.errorData = "";
                    $scope.msg.successMessage = "";

                    $scope.loadbar('show');
                    $('#import_book_' + key).attr('disabled', true).html("<i class='fa fa-spin fa-spinner'></i> Please Wait...");

                    $http({
                        method: 'POST',
                        url: $rootScope.IRISOrgServiceUrl + '/patient/importpatient',
                        data: patient,
                    }).success(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.success == true) {
                                    var patient_guid = response.patient.patient_guid;
//                                    $('#import_book_' + key).html('Completed').toggleClass('btn-success').removeAttr('ng-click');
                                    $timeout(function () {
                                        $state.go('patient.appointment', {id: patient_guid}, {reload: true});
                                    }, 1000);
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
                }
                //Same ORG But different branch so Import and View
                $scope.importViewPatient = function (patient_global_guid, key) {
                    $scope.errorData = "";
                    $scope.msg.successMessage = "";

                    $scope.loadbar('show');

                    $http({
                        method: 'POST',
                        url: $rootScope.IRISOrgServiceUrl + '/patient/importpatient',
                        data: {'patient_global_guid': patient_global_guid},
                    }).success(
                            function (response) {
                                $scope.loadbar('hide');
                                if (response.success == true) {
                                    var patient_guid = response.patient.patient_guid;
                                    $timeout(function () {
                                        $state.go('patient.view', {id: patient_guid}, {reload: true});
                                    }, 1000);
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
                }

                $scope.switched_branches_list = [];
                $scope.branch_switch = {};
                $scope.initSwitchedBranch = function () {
                    if (AuthenticationService.getCurrentUser()) {
                        $http({
                            url: $rootScope.IRISOrgServiceUrl + '/user/getswitchedbrancheslist?addtfields=switchbranch_dd&map=tenant_id,tenant_name',
                            method: "GET",
                        }).then(
                                function (response) {
                                    if (response.data.success) {
                                        $scope.switched_branches_list = response.data.branches;
                                        $scope.branch_switch.branch_id = response.data.default_branch;
                                        $scope.app.org_logo = response.data.org_logo;
                                        $scope.app.org_small_logo = response.data.org_small_logo;
                                        $scope.app.org_document_logo = response.data.org_document_logo;
                                    }
                                }
                        );
                    }
                }


                $scope.switchBranch = function () {
                    $http({
                        method: 'POST',
                        url: $rootScope.IRISOrgServiceUrl + '/default/switchbranch',
                        data: {'branch_id': $scope.branch_switch.branch_id},
                    }).success(
                            function (response) {
                                if (response.admin) {
                                    if (response.tenant) {
                                        $localStorage.switch_tenant_id = response.tenant.tenant_id;
                                        $localStorage.user.credentials.logged_tenant_id = response.tenant.tenant_id;
                                        $localStorage.user.credentials.org = response.tenant.tenant_name;
                                        $localStorage.user.credentials.org_address = response.tenant.tenant_address;
                                        $localStorage.user.credentials.org_country = response.tenant.tenant_country_name;
                                        $localStorage.user.credentials.org_state = response.tenant.tenant_state_name;
                                        $localStorage.user.credentials.org_city = response.tenant.tenant_city_name;
                                        $localStorage.user.credentials.org_mobile = response.tenant.tenant_mobile;
                                    }
//                                    $state.go('myworks.dashboard', {}, {reload: true});
                                    $state.go($state.current, {}, {reload: true});
                                } else {
                                    if (response.success && !jQuery.isEmptyObject(response.resources)) {
                                        if (response.tenant) {
                                            $localStorage.switch_tenant_id = response.tenant.tenant_id;
                                            $localStorage.user.credentials.logged_tenant_id = response.tenant.tenant_id;
                                            $localStorage.user.credentials.org = response.tenant.tenant_name;
                                            $localStorage.user.credentials.org_address = response.tenant.tenant_address;
                                            $localStorage.user.credentials.org_country = response.tenant.tenant_country_name;
                                            $localStorage.user.credentials.org_state = response.tenant.tenant_state_name;
                                            $localStorage.user.credentials.org_city = response.tenant.tenant_city_name;
                                            $localStorage.user.credentials.org_mobile = response.tenant.tenant_mobile;
                                        }
                                        //Branch wise resource assign.
                                        var currentUser = AuthenticationService.getCurrentUser();
                                        delete currentUser.resources;
                                        currentUser.resources = response.resources;
                                        AuthenticationService.setCurrentUser(currentUser);
//                                        $state.go('myworks.dashboard', {}, {reload: true});
                                        $state.go($state.current, {}, {reload: true});
                                    } else {
                                        $state.go($state.current, {}, {reload: true});
                                        $timeout(function () {
                                            toaster.clear();
                                            toaster.pop('info', '', 'Branch not set up');
                                        }, 1000);
                                    }
                                }

//                                if (Object.keys($state.params).length > 0 && Object.keys($scope.patientObj).length > 0 && $state.params.id == $scope.patientObj.patient_guid) {
//                                    $state.go('configuration.organization');
//                                    $timeout(function () {
//                                        toaster.clear();
//                                        toaster.pop('error', 'Internal Error', 'Do not switch between branches when loading screens with patient details');
//                                    }, 5000);
//                                } else {
//                                    $state.go($state.current, {}, {reload: true});
//                                }
                            }
                    );
                }

                $scope.$watch(function () {
                    return $localStorage.switch_tenant_id;
                }, function (newVal, oldVal) {
                    if (oldVal !== newVal) {
                        $timeout(function () {
                            $scope.loadUserCredentials();
                        }, 200);
                        $state.go($state.current, {}, {reload: true});
                    }
                })
                //Print OP Billing
                $scope.printBillData = {};
                $scope.printOPBill = function (item) {
                    $scope.printBillData.date = moment(item.date).format('DD/MM/YYYY hh:mm A');
                    $scope.printBillData.doctor = item.doctor;
                    $scope.updatePrintcreatedby('PatEncounter', item.encounter_id);

                    //Get appointment details
                    $http.post($rootScope.IRISOrgServiceUrl + '/encounter/appointmentseenencounter', {patient_id: $state.params.id, enc_id: item.encounter_id})
                            .success(function (response) {
                                //appointment seen amount
                                $scope.printBillData.op_amount = response.model.appointmentSeen.amount;
                                $scope.printBillData.op_amount_inwords = response.model.appointmentSeen_amt_inwords;
                                $scope.printBillData.bill_no = response.model.bill_no;
                                $scope.printBillData.encounter_id = item.encounter_id;
                                if (response.model.appointmentSeen.payment_mode == "CA")
                                    $scope.printBillData.payment_mode = 'Cash';
                                else if (response.model.appointmentSeen.payment_mode == "CD")
                                    $scope.printBillData.payment_mode = 'Card';
                                else if (response.model.appointmentSeen.payment_mode == "CH")
                                    $scope.printBillData.payment_mode = 'Cheque';
                                else
                                    $scope.printBillData.payment_mode = 'Online';

                                $http.post($rootScope.IRISOrgServiceUrl + '/procedure/getprocedureencounter?addtfields=billing', {enc_id: item.encounter_id})
                                        .success(function (billresponse) {
                                            $scope.printBillData.procedure = billresponse.procedure;
                                            var total = 0.00;
                                            angular.forEach(billresponse.procedure, function (bill_amount) {
                                                if (bill_amount.charge_amount)
                                                    total = total + parseFloat(bill_amount.charge_amount);
                                            });
                                            $scope.printBillData.op_bill_total = total + parseFloat($scope.printBillData.op_amount);
                                            $scope.opBillPrint($scope.printBillData);
                                        })

//                                $timeout(function () {
//                                    var innerContents = document.getElementById('Getprintval').innerHTML;
//                                    var popupWinindow = window.open('', '_blank', 'width=800,height=800,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
//                                    popupWinindow.document.open();
//                                    popupWinindow.document.write('<html><head><link href="css/print.css" rel="stylesheet" type="text/css" /></head><body onload="window.print()">' + innerContents + '</html>');
//                                    popupWinindow.document.close();
//                                }, 1000);
                            }, function (x) {
                                response = {success: false, message: 'Server Error'};
                            });
                }
                $scope.imgExport = function (imgID) {
                    var img = document.getElementById(imgID);
                    var canvas = document.createElement("canvas");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Copy the image contents to the canvas
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);

                    var dataURL = canvas.toDataURL("image/png");
                    return dataURL;
                }
                $scope.opBillPrint = function (printData) {
                    $scope.op_print = {};
                    $http.get($rootScope.IRISOrgServiceUrl + '/appconfiguration/getpresstatusbygroup?group=op_bill_print&addtfields=pres_configuration')
                            .success(function (response) {
                                angular.forEach(response, function (row) {
                                    var listName = row.code;
                                    $scope.op_print[listName] = row.value;
                                });
                            })
                    $timeout(function () {
                        $scope.printloader = '<i class="fa fa-spin fa-spinner"></i>';
                        var print_content = $scope.printContent(printData);
                        if ($scope.duplicate_copy) {
                            var bill = 'DUPLICATE COPY';
                        } else {
                            var bill = '';
                        }
                        if (print_content.length > 0) {
                            var docDefinition = {
                                watermark: {text: bill, color: 'lightgrey', opacity: 0.3},
                                header: $scope.printHeader(),
                                footer: $scope.printFooter(),
                                styles: $scope.printStyle(),
                                content: print_content,
                                defaultStyle: {
                                    fontSize: 10
                                },
                                //pageMargins: ($scope.deviceDetector.browser == 'firefox' ? 50 : 50),
                                pageMargins: [20, 20, 20, 48],
                                pageSize: $scope.op_print.PS,
                                pageOrientation: $scope.op_print.PL,
                            };
                            var pdf_document = pdfMake.createPdf(docDefinition);
                            var doc_content_length = Object.keys(pdf_document).length;
                            if (doc_content_length > 0) {
                                pdf_document.print();
                            }
                        }
                    }, 1000);
                }
                /*PRINT BILL*/
                $scope.printHeader = function () {
                    return {
                        text: '',
                        margin: 0,
                        alignment: 'center'
                    };
                }

                $scope.printFooter = function () {
                    return {
                        //text: [{text: 'PHARMACY SERVICE - 24 HOURS'}],
                        //fontSize: 8,
                        //margin: 0,
                        //alignment: 'center'
                    };
                }
                $scope.printStyle = function () {
                    return {
                        h1: {
                            fontSize: 11,
                            bold: true,
                        },
                        h2: {
                            fontSize: 9,
                            bold: true,
                        },
                        th: {
                            fontSize: 9,
                            bold: true,
                            margin: [0, 3, 0, 3]
                        },
                        td: {
                            fontSize: 8,
                            margin: [0, 3, 0, 3]
                        },
                        normaltxt: {
                            fontSize: 9,
                        },
                        grandtotal: {
                            fontSize: 15,
                            bold: true,
                            margin: [5, 3, 5, 3]
                        },
                        tableExample: {
                            margin: [0, 5, 0, 15]
                        },
                    };
                }

                $scope.printContent = function (printData) {
                    var content = [];
                    var perPageInfo = [];
                    var perPageItems = [];
                    //var groupedArr = createGroupedArray($scope.printBillData.procedure, 2); //Changed Description rows
                    var index = 1;
                    //var group_total_count = Object.keys(groupedArr).length;
                    printData.procedure.unshift({
                        charges: 'Professional Charges',
                        procedure_name: printData.doctor,
                        charge_amount: printData.op_amount
                    });

                    //angular.forEach(groupedArr, function (sales, key) {
                    //var group_key = key + 1;
                    var perPageItems = [];
                    perPageItems.push([
                        {
                            text: 'S.No',
                            style: 'th'
                        },
                        {
                            text: 'Service',
                            style: 'th'
                        },
                        {
                            text: 'Description',
                            style: 'th'
                        },
                        {
                            text: 'Amount',
                            style: 'th'
                        },
                    ]);
                    angular.forEach(printData.procedure, function (row, key) {
                        if (row.charges)
                            var charges = row.charges;
                        else
                            var charges = 'Procedure Charges';
                        perPageItems.push([
                            {
                                text: index,
                                alignment: 'left',
                            },
                            {
                                text: charges,
                                alignment: 'left',
                            },
                            {
                                text: row.procedure_name,
                                alignment: 'left',
                            },
                            {
                                text: row.charge_amount,
                                alignment: 'left',
                            },
                        ]);
                        index++;
                    });
                    perPageItems.push([{
                            colSpan: 4,
                            text: 'Bill Total : ' + printData.op_bill_total.toFixed(2),
                            alignment: 'right'
                        }, {}, {}, {}], [{
                            colSpan: 4,
                            text: 'Amount Paid : ' + printData.op_bill_total.toFixed(2),
                            alignment: 'right'
                        }, {}, {}, {}]);
                    //});
                    perPageInfo.push(
                            {
                                layout: 'noBorders',
                                table: {
                                    widths: ['*', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                                    body: [
                                        [
                                            {
                                                colSpan: 3,
                                                layout: 'noBorders',
                                                table: {
                                                    body: [
                                                        [
                                                            {
                                                                image: $scope.imgExport('ahana_print_logo'),
                                                                height: 20, width: 100,
                                                            },
                                                        ],
                                                    ]
                                                },
                                            }, {}, {},
                                            {
                                                colSpan: 3,
                                                layout: 'noBorders',
                                                table: {
                                                    body: [
                                                        [
                                                            {
                                                                text: 'OP BILL',
                                                                style: 'h2'
                                                            },
                                                        ],
                                                    ]
                                                },
                                            },
                                            {}, {},
                                            {
                                                layout: 'noBorders',
                                                table: {
                                                    body: [
                                                        [
                                                            {
                                                                margin: [0, 0, 0, 0],
                                                                text: $scope.patientObj.org_name,
                                                                fontSize: 8,
                                                                alignment: 'right'
                                                            },
                                                        ],
                                                    ]
                                                },
                                            }
                                        ],
                                    ]
                                },
                            });

                    perPageInfo.push({
                        layout: 'Borders',
                        table: {
                            widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    {
                                        border: [false, true, false, false],
                                        colSpan: 6,
                                        layout: {
                                            paddingLeft: function (i, node) {
                                                return 0;
                                            },
                                            paddingRight: function (i, node) {
                                                return 2;
                                            },
                                            paddingTop: function (i, node) {
                                                return 0;
                                            },
                                            paddingBottom: function (i, node) {
                                                return 0;
                                            },
                                        },
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'Patient Name',
                                                        style: 'h2',
                                                        margin: [-5, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: $scope.patientObj.fullname,
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'UHID',
                                                        style: 'h2',
                                                        margin: [-5, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: $scope.patientObj.patient_global_int_code,
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'Age / Sex',
                                                        style: 'h2',
                                                        margin: [-5, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: $scope.patientObj.patient_age_ym + '/' + $scope.app.patientDetail.patientSex,
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                            ]
                                        },
                                    },
                                    {}, {}, {}, {}, {},
                                    {
                                        border: [false, true, false, false],
                                        layout: 'noBorders',
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        border: [false, false, false, false],
                                                        text: 'Bill No',
                                                        style: 'h2',
                                                        margin: [-7, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        border: [false, false, false, false],
                                                        style: 'h2'
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: printData.bill_no,
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                                [
                                                    {
                                                        text: 'Bill Date',
                                                        style: 'h2',
                                                        margin: [-7, 0, 0, 0],
                                                    },
                                                    {
                                                        text: ':',
                                                        style: 'h2'
                                                    },
                                                    {
                                                        text: printData.date,
                                                        style: 'normaltxt'
                                                    }
                                                ],
                                            ]
                                        },
                                    }
                                ],
                            ]
                        },
                    }, {
                        table: {
                            widths: ['auto', 150, '*', 'auto'],
                            body: perPageItems,
                        },
                        layout: {
                            hLineColor: function (i, node) {
                                return (i === 0 || i === node.table.body.length) ? 'gray' : 'gray';
                            },
                            vLineColor: function (i, node) {
                                return (i === 0 || i === node.table.widths.length) ? 'gray' : 'gray';
                            },
                        }
                    });
                    perPageInfo.push({
                        style: 'tableExample',
                        layout: 'noBorders',
                        table: {
                            widths: ['*', 'auto', 'auto', '*', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    {
                                        colSpan: 6,
                                        layout: 'noBorders',
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        text: 'Payment Mode',
                                                        style: 'h2'
                                                    },
                                                    {
                                                        text: ':',
                                                        style: 'h2'
                                                    },
                                                    {
                                                        text: printData.payment_mode + '(' + printData.op_bill_total.toFixed(2) + ')',
                                                        style: 'normaltxt'
                                                    },
                                                ],
                                                [
                                                    {
                                                        colSpan: 3,
                                                        text: [
                                                            $filter('words')(printData.op_bill_total),
                                                            {text: 'Rupees Only'},
                                                        ]
                                                    },
                                                    {}, {},
                                                ],
                                            ]
                                        },
                                    }, {}, {}, {}, {}, {},
                                    {
                                        layout: 'noBorders',
                                        table: {
                                            body: [
                                                [
                                                    {
                                                        text: 'For ' + $scope.patientObj.org_name,
                                                        style: 'h2'
                                                    },
                                                    {
                                                        text: '',
                                                        style: 'h2'
                                                    },
                                                    {
                                                        text: '',
                                                        style: 'normaltxt'
                                                    },
                                                ],
                                                [
                                                    {
                                                        colSpan: 3,
                                                        text: 'Authorized Signatory',
                                                        style: 'h2',
                                                        margin: [0, 15, 0, 0],
                                                    },
                                                    {}, {},
                                                ],
                                            ]
                                        },
                                    }
                                ],
                            ]
                        },
                    });
                    content.push(perPageInfo);
                    return content;
                }
                var createGroupedArray = function (arr, chunkSize) {
                    var groups = [], i;
                    for (i = 0; i < arr.length; i += chunkSize) {
                        groups.push(arr.slice(i, i + chunkSize));
                    }
                    return groups;
                }
                //Medical case history auto save
                $scope.initMedicalSaveDocument = function (encounter_id, callback) {
                    var _data = [];
                    var url = $rootScope.IRISOrgServiceUrl + '/patientvitals/getvitalsbyencounter?addtfields=eprvitals&encounter_id=' + encounter_id;
                    $http.get(url)
                            .success(function (response) {
                                if (response.success == true) {
                                    _data.push({
                                        name: 'temperature',
                                        value: response.vitals.temperature,
                                    }, {
                                        name: 'bpsystolic',
                                        value: response.vitals.blood_pressure_systolic,
                                    }, {
                                        name: 'bpdiastolic',
                                        value: response.vitals.blood_pressure_diastolic,
                                    }, {
                                        name: 'pulse',
                                        value: response.vitals.pulse_rate,
                                    }, {
                                        name: 'weight',
                                        value: response.vitals.weight,
                                    }, {
                                        name: 'height',
                                        value: response.vitals.height,
                                    }, {
                                        name: 'sp02',
                                        value: response.vitals.sp02,
                                    }, {
                                        name: 'pain_score',
                                        value: response.vitals.pain_score,
                                    });
                                }
                            })
                    _data.push({
                        name: 'name',
                        value: $scope.patientObj.fullname,
                    }, {
                        name: 'uhid',
                        value: $scope.patientObj.patient_global_int_code,
                    }, {
                        name: 'age',
                        value: $scope.patientObj.patient_age,
                    }, {
                        name: 'gender',
                        value: $scope.app.patientDetail.patientSex,
                    }, {
                        name: 'martial_status',
                        value: $scope.app.patientDetail.patientMaritalStatus,
                    }, {
                        name: 'encounter_id',
                        value: encounter_id,
                    }, {
                        name: 'patient_id',
                        value: $state.params.id,
                    }, {
                        name: 'novalidate',
                        value: true,
                    }, {
                        name: 'status',
                        value: '0',
                    });
                    $scope.loadbar('show');
                    $timeout(function () {
                        $http({
                            url: $rootScope.IRISOrgServiceUrl + "/patientprescription/savemedicaldocument",
                            method: "POST",
                            data: _data,
                        }).then(
                                function (response) {
                                    $scope.loadbar('hide');
                                    if (response.data.success == true) {
                                        callback(response);
                                    }
                                }
                        );
                    }, 100);

                };
                //Medical case history common service
                $scope.medicalcasecommonservice = function () {
                    $rootScope.commonService.GetDiagnosisList(function (response) {
                        var availableTags = [];
                        angular.forEach(response.diagnosisList, function (diagnosis) {
                            availableTags.push(diagnosis.label);
                        });
                        $(".icd_code_autocomplete").autocomplete({
                            source: availableTags,
                        });
                    });
                }
                //Check Medical case history empty rows
                $scope.checkmedicalcaseemptyrow = function (a) {
                    $('#' + a + ' > tbody  > tr').each(function () {
                        //$("td:empty").remove(); //Remove Empty table td
                        $('td').each(function () {
                            var cellText = $(this).text();
                            if (cellText.trim() == "Hiding text") {
                                $(this).remove();
                            }
                        });
                        //$("tr:empty").remove(); //Remove Empty table tr

                        //Removed personal history empty heading
                        var personalText = $(this).find('tr.personal_history');
                        if (personalText.text().trim().length === 0) {
                            var personalTr = personalText.closest('tr').prev('tr');
                            personalTr.remove();
                        }
                        //Removed Physical examination empty heading
//                        var physicalText = $(this).find('tr.physical_examination');
//                        if (physicalText.text().trim().length === 0) {
//                            var physicalTr = physicalText.closest('tr').prev('tr');
//                            physicalTr.remove();
//                        }
                        //Removed Informant empty heading
                        var informantText = $(this).find('tr.informant_body');
                        if (informantText.text().trim().length === 0) {
                            var informantTr = informantText.closest('tr').prev('tr');
                            informantTr.remove();
                        }

                        var tr = $(this).find("tr");
                        $.each(tr, function () {
                            $this = $(this);
                            if ($(this).find("td").length > 0) {
                                if ($(this).find("td").text().trim().length === 0) {
                                    $this.remove();
                                }
                            }
                        });
                        $("tr:empty").remove(); //Remove Empty table tr
                        //Removed empty icd code row
                        $("#TBicdcode tbody tr td").each(function () {
                            var cellText = $.trim($(this).text());
                            if (cellText.length == 0) {
                                $(this).parent().remove();
                            }
                        });
                        var icd_code = $('#TBicdcode tbody').children().length;
                        if (icd_code == 0) {
                            $('#TBicdcode').remove();
                        }
                        //Removed empty prescription row
                        var prescription = $('#RGprevprescription tbody').children().length;
                        if (prescription == 0) {
                            $('#RGprevprescription').remove();
                        }
                        //Removed empty prescription row
                        var prescription = $('#RGvital tbody').children().length;
                        if (prescription == 0) {
                            $('#RGvital').remove();
                        }
                        //Removed empty referral row
                        var referral_code = $('#referral tbody').children().length;
                        if (referral_code == 0) {
                            $('#referral').remove();
                        }
                        //Removed empty past medical row
                        var past_medical = $('#past_medical_history tbody').children().length;
                        if (past_medical == 1) {
                            $('#past_medical_history').remove();
                        }

                        $(".header2").each(function () {
                            if ($(this).text() == 'Personal History') {
                                var header_class = $(this).next('div').text();
                                if (header_class == 'Physical Examination') {
                                    $(this).remove();
                                }
                            } else if ($(this).text() == 'Informant') {
                                var header_class = $(this).next('div').text();
                                if (header_class.length == 0) {
                                    $(this).remove();
                                }
                            }
                        });
                    });
                }

                //Excel Export
                $scope.tablesToExcel = (function () {
                    var uri = 'data:application/vnd.ms-excel;base64,'
                            , tmplWorkbookXML = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'
                            + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Axel Richter</Author><Created>{created}</Created></DocumentProperties>'
                            + '<Styles>'
                            + '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>'
                            + '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>'
                            + '<Style ss:ID="Bold"><Font ss:Bold="1"></Font></Style>'
                            + '</Styles>'
                            + '{worksheets}</Workbook>'
                            , tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>'
                            , tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>'
                            , base64 = function (s) {
                                return window.btoa(unescape(encodeURIComponent(s)))
                            }
                    , format = function (s, c) {
                        return s.replace(/{(\w+)}/g, function (m, p) {
                            return c[p];
                        })
                    }
                    return function (tabless, wsnames, wbname, appname) {
                        var ctx = "";
                        var workbookXML = "";
                        var worksheetsXML = "";
                        var rowsXML = "";

                        for (var i = 0; i < tabless.length; i++) {

                            var particularDiv = document.getElementById(tabless[i]);

                            if (particularDiv) {
                                var allTables = particularDiv.getElementsByTagName('table').length;
                                var tables = [];
                                for (var x = 0; x < allTables; x++) {
                                    tables[i] = document.getElementById(tabless[i]).getElementsByTagName('table')[x];
                                    for (var j = 0; j < tables[i].rows.length; j++) {
                                        rowsXML += '<Row>'
                                        for (var k = 0; k < tables[i].rows[j].cells.length; k++) {
                                            var dataType = tables[i].rows[j].cells[k].getAttribute("data-type");
                                            var dataStyle = tables[i].rows[j].cells[k].getAttribute("data-style");
                                            var dataValue = tables[i].rows[j].cells[k].getAttribute("data-value");
                                            var dataTagvalue = (dataValue) ? dataValue : tables[i].rows[j].cells[k].tagName;
                                            dataValue = (dataValue) ? dataValue : tables[i].rows[j].cells[k].innerText;

                                            if (dataTagvalue === 'TH')
                                                dataStyle = 'Bold';

                                            if (dataType == 'Number')
                                                dataValue = parseFloat(dataValue.replace(',', ''));

                                            var dataFormula = tables[i].rows[j].cells[k].getAttribute("data-formula");
                                            dataFormula = (dataFormula) ? dataFormula : (appname == 'Calc' && dataType == 'DateTime') ? dataValue : null;
                                            ctx = {attributeStyleID: (dataStyle == 'Currency' || dataStyle == 'Date' || dataStyle == 'Bold') ? ' ss:StyleID="' + dataStyle + '"' : ''
                                                , nameType: (dataType == 'Number' || dataType == 'DateTime' || dataType == 'Boolean' || dataType == 'Error') ? dataType : 'String'
                                                , data: (dataFormula) ? '' : dataValue
                                                , attributeFormula: (dataFormula) ? ' ss:Formula="' + dataFormula + '"' : ''
                                            };
                                            rowsXML += format(tmplCellXML, ctx);
                                        }
                                        rowsXML += '</Row>'
                                    }
                                }
                            }
                            ctx = {rows: rowsXML, nameWS: wsnames[i] || 'Sheet' + i};
                            worksheetsXML += format(tmplWorksheetXML, ctx);
                            rowsXML = "";
                        }

                        ctx = {created: (new Date()).getTime(), worksheets: worksheetsXML};
                        workbookXML = format(tmplWorkbookXML, ctx);

                        var link = document.createElement("A");
                        link.href = uri + base64(workbookXML);
                        link.download = wbname || 'Workbook.xls';
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                })();

//                //Print OP Billing
//                $scope.printBillData = {};
//                $scope.printOPBill = function (item) {
//                    $scope.printBillData.date = moment(item.date).format('DD/MM/YYYY hh:mm A');
//                    $scope.printBillData.doctor = item.consultant_name;
//
//                    //Patient Billing Types List
//                    $rootScope.commonService.GetPatientBillingList(function (response) {
//                        $scope.bill_types = response;
//                    });
//
//                    //Get appointment details
//                    $http.post($rootScope.IRISOrgServiceUrl + '/encounter/appointmentseenencounter', {patient_id: $state.params.id, enc_id: item.encounter_id})
//                            .success(function (response) {
//                                //appointment seen amount
//                                $scope.printBillData.op_amount = response.model.appointmentSeen.amount;
//                                $scope.printBillData.op_amount_inwords = response.model.appointmentSeen_amt_inwords;
//                                $scope.printBillData.bill_no = response.model.bill_no;
//
//                                //Get Patient Bill Type
//                                if (response.model.appointmentSeen.patient_bill_type) {
//                                    var billinfo = $filter('filter')($scope.bill_types, {
//                                        value: response.model.appointmentSeen.patient_bill_type
//                                    });
//                                    $scope.printBillData.patient_bill_type = billinfo[0].label;
//                                } else {
//                                    $scope.printBillData.patient_bill_type = '-';
//                                }
//
//                                //Patient Cateogry
//                                $http.get($rootScope.IRISOrgServiceUrl + '/default/getconsultantcharges?consultant_id=' + item.consultant_id)
//                                        .success(function (response2) {
//                                            $scope.chargesList = response2.chargesList;
//                                            var charge = $filter('filter')($scope.chargesList, {patient_cat_id: response.model.appointmentSeen.patient_cat_id});
//                                            if (typeof charge[0] != 'undefined') {
//                                                $scope.printBillData.patient_cat_name = charge[0].op_dept;
//                                            }
//                                        }, function (x) {
//                                            response2 = {success: false, message: 'Server Error'};
//                                        });
//                            }, function (x) {
//                                response = {success: false, message: 'Server Error'};
//                            });
//
//                    $timeout(function () {
//                        var innerContents = document.getElementById('Getprintval').innerHTML;
//                        var popupWinindow = window.open('', '_blank', 'width=800,height=800,scrollbars=yes,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
//                        popupWinindow.document.open();
//                        popupWinindow.document.write('<html><head><link href="css/print.css" rel="stylesheet" type="text/css" /></head><body onload="window.print()">' + innerContents + '</html>');
//                        popupWinindow.document.close();
//                    }, 1000);
//                }
            }]);

angular.module('app').filter('unsafe', ['$sce', function ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    }]);

angular.module('app').run(function ($window, $rootScope) {
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function () {
            $rootScope.online = false;
        });
    }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function () {
            $rootScope.online = true;
        });
    }, false);
});

angular.module("template/popover/popover.html", []).run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/popover/popover.html",
                "<div class=\"popover {{placement}}\" ng-class=\"{ in: isOpen(), fade: animation() }\">\n" +
                "  <div class=\"arrow\"></div>\n" +
                "\n" +
                "  <div class=\"popover-inner\">\n" +
                "      <h3 class=\"popover-title\" ng-bind-html=\"title | unsafe\" ng-show=\"title\"></h3>\n" +
                "      <div class=\"popover-content\"ng-bind-html=\"content | unsafe\"></div>\n" +
                "  </div>\n" +
                "</div>\n" +
                "");
    }]);

//Moment Filter
angular.module('app').filter('moment', function () {
    return function (dateString, format) {
        return moment(dateString).format(format);
    };
});

angular.module('app').filter('words', ['$rootScope', function ($rootScope) {
        return function (value) {
            var value1 = parseInt(value);
            if (value1 == '0')
                return 'Zero ';
            if (value1 && isInteger(value1))
                return  $rootScope.commonService.GettoWords(value1);

            return value;
        };

        function isInteger(x) {
            return x % 1 === 0;
        }
    }]);
//Form Upload with file data
angular.module('app').factory('fileUpload', ['$http', function ($http) {
        return {
            uploadFileToUrl: function (file, uploadUrl) {
                var fd = new FormData();
                fd.append('file', file);

                return $http.post(uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                })
                        .success(function (response) {
                        })
                        .error(function (data, status) {
                        });
            }
        }
    }]);

angular.module('app').controller('PatientLeftSideNotificationCtrl', ['$rootScope', '$scope', '$http', '$state', '$filter', '$timeout', function ($rootScope, $scope, $http, $state, $filter, $timeout) {
        $scope.loadPatientDetail();

        $scope.assignNotifications = function () {
            //Assign Notes
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/patientnotes/assignnotes',
                data: {'patient_guid': $state.params.id},
            }).success(
                    function (response) {
                        if (response.success) {
                            if (typeof $state.params.id != 'undefined') {
                                //Get Notes
                                $http.get($rootScope.IRISOrgServiceUrl + '/patientnotes/getpatientnotes?patient_id=' + $state.params.id)
                                        .success(function (notes) {
                                            angular.forEach(notes.result, function (result) {
                                                angular.forEach(result.all, function (note) {
                                                    $scope.leftNotificationNotes.push(note);
                                                });
                                            });
                                            $scope.unseen_notes = notes.usernotes;
                                            $scope.app.patientDetail.patientUnseenNotesCount = notes.usernotes.length;

                                            angular.forEach($scope.leftNotificationNotes, function (note) {
                                                note.seen_by = 1;
                                            });

                                            angular.forEach(notes.usernotes, function (note) {
                                                var seen_filter_note = $filter('filter')($scope.leftNotificationNotes, {pat_note_id: note.note_id});

                                                if (seen_filter_note.length > 0) {
                                                    seen_filter_note[0].seen_by = 0;
                                                }
                                            });
                                        })
                                        .error(function () {
                                            $scope.errorData = "An Error has occured while loading patientnote!";
                                        });
                            }

                        }
                    }
            );

            //Assign Vitals
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/patientvitals/assignvitals',
                data: {'patient_guid': $state.params.id},
            }).success(
                    function (response) {
                        if (response.success) {
                            if (typeof $state.params.id != 'undefined') {
                                // Get Vitals
                                $http.get($rootScope.IRISOrgServiceUrl + '/patientvitals/getpatientvitals?addtfields=eprvitals&patient_id=' + $state.params.id)
                                        .success(function (vitals) {
                                            angular.forEach(vitals.result, function (result) {
                                                angular.forEach(result.all, function (vital) {
                                                    $scope.leftNotificationVitals.push(vital);
                                                });
                                            });
                                            $scope.unseen_vitals = vitals.uservitals;
                                            $scope.app.patientDetail.patientUnseenVitalsCount = vitals.uservitals.length;

                                            angular.forEach($scope.leftNotificationVitals, function (vital) {
                                                vital.seen_by = 1;
                                            });

                                            angular.forEach(vitals.uservitals, function (vital) {
                                                var seen_filter_vital = $filter('filter')($scope.leftNotificationVitals, {vital_id: vital.vital_id});
                                                if (seen_filter_vital.length > 0) {
                                                    seen_filter_vital[0].seen_by = 0;
                                                }
                                            });
                                        })
                                        .error(function () {
                                            $scope.errorData = "An Error has occured while loading patientvitals!";
                                        });
                            }
                        }
                    }
            );
        };
        $scope.$on('$viewContentLoaded', function (event) {
            $scope.assignNotifications();
        });


        $scope.seen_notes_left_notification = function () {
            if ($scope.app.patientDetail.patientUnseenNotesCount > 0) {
                var unseen_filter_note = $filter('filter')($scope.leftNotificationNotes, {seen_by: 0});
                var note_ids = [];
                angular.forEach(unseen_filter_note, function (unseen, key) {
                    note_ids.push(unseen.pat_note_id);
                });

                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patientnotes/seennotes',
                    data: {'ids': note_ids, 'patient_guid': $state.params.id},
                }).success(
                        function (response) {
                            $timeout(function () {
                                angular.forEach($scope.leftNotificationNotes, function (note, key) {
                                    note.seen_by = 1;
                                });
                                $scope.app.patientDetail.patientUnseenNotesCount = 0;
                            }, 5000);
                        }
                );
            }
        }

        $scope.seen_vitals_left_notification = function () {
            if ($scope.app.patientDetail.patientUnseenVitalsCount > 0) {
                var unseen_filter_vital = $filter('filter')($scope.leftNotificationVitals, {seen_by: 0});
                var vital_ids = [];
                angular.forEach(unseen_filter_vital, function (unseen, key) {
                    vital_ids.push(unseen.vital_id);
                });

                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patientvitals/seenvitals',
                    data: {'ids': vital_ids, 'patient_guid': $state.params.id},
                }).success(
                        function (response) {
                            $timeout(function () {
                                angular.forEach($scope.leftNotificationVitals, function (vital, key) {
                                    vital.seen_by = 1;
                                });
                                $scope.app.patientDetail.patientUnseenVitalsCount = 0;
                            }, 5000);
                        }
                );
            }
        }
    }]);

//Patient image upload
angular.module('app').controller('PatientImageController', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', 'fileUpload', '$state', '$http', 'block', function (scope, $scope, $modalInstance, $rootScope, $timeout, fileUpload, $state, $http, block) {
        $scope.fileUpload = fileUpload;
        $scope.block = block;
        $scope.data = scope;

        $scope.uploadFile = function () {
            var file = $scope.myFile;
            var uploadUrl = $rootScope.IRISOrgServiceUrl + '/patient/uploadimage?patient_id=' + $state.params.id;
            fileUpload.uploadFileToUrl(file, uploadUrl).success(function (response) {
                if (response.success) {
                    scope.patientObj.patient_img_url = response.patient.patient_img_url + '?v=' + new Date().valueOf();
                    $scope.cancel();
                } else {
                    $scope.errorData2 = response.message;
                }
            }).error(function (data, status) {
                if (status == 422)
                    $scope.errorData2 = $scope.errorSummary(data);
                else
                    $scope.errorData2 = data.message;
            });
        };

        //Take Picture From WebCam.
        $scope.picture = '';

        $scope.$watch('picture', function (newValue, oldValue) {
            if (newValue != '') {
                $scope.uploadPatientPicture(newValue, $scope.block);
            }
        }, true);

        //Crop Picture Concept.
        $scope.myImage = '';
        $scope.myCroppedImage = '';

        var handleFileSelect = function (evt) {
            var file = evt.currentTarget.files[0];
            var reader = new FileReader();
            reader.onload = function (evt) {
                $scope.$apply(function ($scope) {
                    $scope.myImage = evt.target.result;
                });
            };
            reader.readAsDataURL(file);
        };

        $timeout(function () {
            angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
        }, 1000, false);

        //Upload file in database
        $scope.uploadPatientPicture = function (image_data, block) {
            $http({
                method: "POST",
                url: $rootScope.IRISOrgServiceUrl + '/patient/uploadimage?patient_id=' + $state.params.id,
                data: {file_data: image_data, block: block},
            }).success(
                    function (response) {
                        if (response.success) {
                            if (block == 'topbar')
                                scope.patientObj.patient_img_url = response.patient.patient_img_url + '?v=' + new Date().valueOf();

                            if (block == 'register') {
                                scope.$broadcast('register_patient_img_url', response.file);
                            }
                            $scope.cancel();
                        } else {
                            $scope.errorData2 = response.message;
                        }
                    }
            ).error(function (data, status) {
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

    }]);
