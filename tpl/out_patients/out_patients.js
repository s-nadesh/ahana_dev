app.controller('OutPatientsController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$filter', '$modal', '$log', 'modalService', '$interval', '$cookieStore', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $filter, $modal, $log, modalService, $interval, $cookieStore) {

        $scope.app.settings.patientTopBar = false;
        $scope.app.settings.patientSideMenu = false;
        $scope.app.settings.patientContentClass = 'app-content app-content3';
        $scope.app.settings.patientFooterClass = 'app-footer app-footer3';
        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        //index.html - To Avoid the status column design broken, used the below controlsTpl
        editableThemes.bs3.controlsTpl = '<div class="editable-controls" ng-class="{\'has-error\': $error}"></div>';
        editableOptions.theme = 'bs3';
        var currentUser = $rootScope.authenticationService.getCurrentUser();
        $scope.ctrl = {};
        $scope.allExpanded = false;

//        $scope.expanded = true;
        $scope.ctrl.expandAll = function (expanded) {
            $scope.expandAllRow(expanded);
        };
        //Checkbox initialize
        $scope.checkboxes = {'checked': false, items: []};
        $scope.currentAppointmentSelectedItems = [];
        $scope.currentAppointmentSelected = 0;
        //Index page height
        $scope.css = {'style': ''};
        function dateCheck(month, year)
        {
            $scope.isLoading = true;
            $scope.loadOutPatientsList('Future', '', month, year);
        }

        $scope.resetDatepicker = function () {
            $("#appointment").datepicker().datepicker("setDate", new Date());
        }

        function cb(start, end, type) {
            $scope.range_filter_start = start.format('YYYY-MM-DD');
            $scope.range_filter_end = end.format('YYYY-MM-DD');
            if (typeof type == 'undefined') {
                var current_type = type;
            } else {
                var current_type = $scope.op_type;
            }
            $scope.loadOutPatientsList(current_type);
            $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        }

        $scope.startDaterangepicker = function (type) {
            //$(function () {
            $scope.range_filter_start = '';
            $scope.range_filter_end = '';

            var start = moment().subtract(1, 'days');
            var end = moment().subtract(1, 'days');

            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                maxDate: moment().subtract(1, 'days'),
                ranges: {
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(7, 'days'), moment().subtract(1, 'days')],
                    'Last 30 Days': [moment().subtract(30, 'days'), moment().subtract(1, 'days')],
                    'This Month': [moment().startOf('month'), moment().subtract(1, 'days')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            }, cb);
            cb(start, end, type);
            //});
        }

        //Index Page
        $scope.loadOutPatientsList = function (type, clearObj, month, year) {
            if (typeof type == 'undefined') {
                type = ($state.params.type) ? $state.params.type : 'current';
            }
            $("#appointment").datepicker({
                minDate: new Date(),
                changeMonth: true,
                changeYear: true,
                showButtonPanel: true,
                dateFormat: 'MM yy',
                onChangeMonthYear: function (year, month, inst) {
                    dateCheck(month, year);
                },
            });
            $scope.op_type = type;
            $('.op-btn-group button, .op-btn-group a').removeClass('active');
            $('.op-btn-group button.' + type + '-op-patient').addClass('active');
            // pagination set up
            if (typeof clearObj == 'undefined') {
                $scope.isLoading = true;
                $scope.rowCollection = []; // base collection
                $scope.itemsByPage = 10; // No.of records per page
                $scope.displayedCollection = [].concat($scope.rowCollection); // displayed collection
            }

            var cid = currentUser.credentials.user_id;
            if ($scope.checkAccess('patient.viewAllDoctorsAppointments')) {
                cid = -1;
            }

            // Get data's from service
            if ($scope.range_filter_start && $scope.range_filter_end && $scope.op_type == 'previous') {
                var url = $rootScope.IRISOrgServiceUrl + '/encounter/outpatients?addtfields=oplist&type=' + type + '&cid=' + cid + '&seen=false&month=' + month + '&year=' + year + '&range_filter_start=' + $scope.range_filter_start + '&range_filter_end=' + $scope.range_filter_end;
            } else {
                var url = $rootScope.IRISOrgServiceUrl + '/encounter/outpatients?addtfields=oplist&type=' + type + '&cid=' + cid + '&seen=false&month=' + month + '&year=' + year;
            }
            $http.get(url)
                    .success(function (OutPatients) {
                        var prepared_result = $scope.prepareCollection(OutPatients);
                        $scope.rowCollection = prepared_result;
                        //                        $scope.rowCollection = OutPatients.result;

                        $scope.updateCollection();
                        //Checkbox initialize
                        $scope.checkboxes = {'checked': false, items: []};
                        $scope.currentAppointmentSelectedItems = [];
                        $scope.currentAppointmentSelected = 0;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patients!";
                    });
        };
        $scope.expandSeen = function (cid, rowopen) {
            if (rowopen) {
                var seenrowcoll = $filter('filter')($scope.rowCollection, {consultant_id: cid})[0];
                seenrowcoll.rowSeenLoading = true;
                if ($scope.range_filter_start && $scope.range_filter_end && $scope.op_type == 'previous') {
                    var url = $rootScope.IRISOrgServiceUrl + '/encounter/outpatients?addtfields=oplist&type=' + $scope.op_type + '&cid=' + cid + '&seen=true&only=results&range_filter_start=' + $scope.range_filter_start + '&range_filter_end=' + $scope.range_filter_end;
                } else {
                    var url = $rootScope.IRISOrgServiceUrl + '/encounter/outpatients?addtfields=oplist&type=' + $scope.op_type + '&cid=' + cid + '&seen=true&only=results';
                }
                $http.get(url)
                        .success(function (OutPatients) {
                            seenrowcoll.seen_records = OutPatients.result;
                            seenrowcoll.rowSeenLoading = false;
                            $timeout(function () {
                                profilePhoto(".patientImage");
                            }, 1000);
                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured while loading seen data!";
                            seenrowcoll.rowSeenLoading = false;
                        });
            }
        }

        $timeout(function () {
            $scope.startAutoRefresh();
        }, 5000);
        var stop;
        $scope.last_log_id = "";
        $scope.startAutoRefresh = function () {
            // Don't start a new fight if we are already fighting
            if (angular.isDefined(stop))
                return;
            stop = $interval(function () {
                // Get data's from service
                $http.get($rootScope.IRISOrgServiceUrl + '/default/getlog')
                        .success(function (log) {
                            setTimeout(function () {
                                if ($scope.last_log_id === "") {
                                    $scope.last_log_id = log.last_log_id;
                                } else {
                                    if ($scope.last_log_id != log.last_log_id) {
                                        $scope.loadOutPatientsList('current', true);
                                        $scope.last_log_id = log.last_log_id;
                                    }
                                }
                            }, 100);
                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured";
                        });
            }, 20000);
        };
        $scope.stopAutoRefresh = function () {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };
        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $scope.stopAutoRefresh();
        });
        $scope.updateCheckbox = function (parent, parent_key) {
            angular.forEach($scope.displayedCollection, function (value, op_key) {
                value.selected = '0';
                if (parent_key == op_key)
                    value.selected = parent.selected;
                angular.forEach(value.act_enc, function (row, key) {
                    row.selected = '0';
                    if (parent_key == op_key) {
                        row.selected = parent.selected;
                    }
                });
            });
            $timeout(function () {
                angular.forEach($scope.displayedCollection, function (value, op_key) {
                    angular.forEach(value.act_enc, function (row, key) {
                        $scope.moreOptions(op_key, key, row.consultant_id, row.apptBookingData.appt_id, row);
                    });
                });
            }, 800);
        }

        $scope.moreOptions = function (op_key, key, consultant_id, appt_id, row) {
            appt_exists = $filter('filter')($scope.checkboxes.items, {appt_id: appt_id});
            if ($('#oplist_' + op_key + '_' + key).is(':checked')) {
                $('#oplist_' + op_key + '_' + key).closest('tr').addClass('selected_row');
                $('.tr_oplistcheckbox').not('.tr_oplistcheckbox_' + op_key).each(function () {
                    $(this).removeClass('selected_row');
                });
                if (appt_exists.length == 0) {
                    consultant_exists = $filter('filter')($scope.checkboxes.items, {consultant_id: consultant_id});
                    rowData = row.apptBookingData;
                    angular.extend(rowData, {patient_name: row.apptPatientData.fullname, consultant_id: row.consultant_id, encounter_id: row.encounter_id, patient_id: row.patient_id});
                    if (consultant_exists.length == 0) {
                        $('.oplistcheckbox').not('.oplistcheckbox_' + op_key).attr('checked', false);
//                        $('.oplistcheckbox').not('#oplist_' + op_key + '_' + key).attr('checked', false);
                        $scope.checkboxes.items = [];
                        $scope.checkboxes.items.push({
                            appt_id: appt_id,
                            consultant_id: consultant_id,
                            row: rowData
                        });
                    } else {
                        $scope.checkboxes.items.push({
                            appt_id: appt_id,
                            consultant_id: consultant_id,
                            row: rowData
                        });
                    }
                }
            } else {
                $('#oplist_' + op_key + '_' + key).closest('tr').removeClass('selected_row');
                if (appt_exists.length > 0) {
                    $scope.checkboxes.items.splice($scope.checkboxes.items.indexOf(appt_exists[0]), 1);
                }
            }
            $scope.prepareMoreOptions();
        }

        $scope.prepareMoreOptions = function () {
            $scope.currentAppointmentSelectedItems = [];
            angular.forEach($scope.checkboxes.items, function (item) {
                $scope.currentAppointmentSelectedItems.push(item.row);
            });
            $scope.currentAppointmentSelected = $scope.currentAppointmentSelectedItems.length;
        }

        $scope.rescheduleAppointments = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal_form/modal.patient_appointment_reschedule.html',
                controller: "AppointmentRescheduleController",
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                }
            });
            modalInstance.data = $scope.currentAppointmentSelectedItems;
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
//                $scope.loadOutPatientsList($scope.op_type);
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        $scope.cancelAppointments = function () {
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Cancel Appointments?',
                bodyText: 'Are you sure to cancel these appointments ?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loadbar('show');
                post_url = $rootScope.IRISOrgServiceUrl + '/appointment/bulkcancel';
                method = 'POST';
                succ_msg = 'Appointment cancelled successfully';
                $http({
                    method: method,
                    url: post_url,
                    data: $scope.currentAppointmentSelectedItems
                }).success(
                        function (response) {
                            $scope.msg.successMessage = succ_msg;
                            $scope.loadbar('hide');
                            $scope.loadOutPatientsList($scope.op_type);
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
        $scope.statuses = [
            {value: 'A', text: 'Arrived'},
        ];
        $scope.arr_statuses = [
            {value: 'S', text: 'Seen'},
        ];
        $scope.updatePatient = function (id, _data, val) {
            if (val == '') {
                return 'Mobile can not be empty';
            }
            if (!val.match(/^[0-9]{10}$/)) {
                return 'Mobile must be 10 digits only';
            }
            $http({
                method: 'PUT',
                url: $rootScope.IRISOrgServiceUrl + '/patients/' + id,
                data: _data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Patient updated successfully';
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.setTimings = function (op_key, key, mode) {
            if (mode == 'set') {
                st_d = moment().format('YYYY-MM-DD');
                st_t = moment().format('hh:mm A');
            } else {
                st_d = st_t = '';
            }
            $scope.displayedCollection[op_key]['act_enc'][key].sts_date = st_d;
            $scope.displayedCollection[op_key]['act_enc'][key].sts_time = st_t;
        }

        $scope.onTimeSet = function (newDate, oldDate, op_key, key) {
            $scope.displayedCollection[op_key]['act_enc'][key].sts_date = moment(newDate).format('YYYY-MM-DD');
            $scope.displayedCollection[op_key]['act_enc'][key].sts_time = moment(newDate).format('hh:mm A');
        }

        $scope.changeAppointmentStatus = function (_data, op_key, key) {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            $scope.loadbar('show');
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/appointments',
                data: _data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = 'Status changed successfully';
                        $scope.rowCollection[op_key]['act_enc'][key].apptArrivalData = response;
                        $scope.displayedCollection[op_key]['act_enc'][key].apptArrivalData = response;
                        angular.forEach($scope.displayedCollection, function (value, parent_key) {
                            if (parent_key == op_key) {
                                value.booking_count--;
                                value.arrived_count++;
                            }
                        });
                        $scope.updateCollection();
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };
        $scope.prepareCollection = function (OutPatients) {
            var result = [];
            var key_index = 0;
            $scope.census = OutPatients.result.length;
            if ($scope.census > 6) {
                $scope.css = {
                    'style': 'height:550px; overflow-y: auto; overflow-x: hidden;',
                };
            }

//            grouped_result = $filter('groupBy')(OutPatients.result, 'consultant_id');
            angular.forEach(OutPatients.consultants, function (value, key) {
                var act_enc = $filter('filter')(OutPatients.result, {consultant_id: key, apptSeenData: "-"});
                result[key_index] = {
                    consultant_id: key,
                    consultant_name: value.consultant_name,
                    act_enc: act_enc,
                    seen_records: {},
                    seen_count: value.seen,
                    booking_count: value.booked,
                    arrived_count: value.arrival,
                    selected: '0',
                    seenExpanded: false,
                    rowLoading: false,
                    rowSeenLoading: false,
                };
                key_index++;
            });
            return result
        }

        $scope.updateCollection = function () {
            $scope.isLoading = true;
            rowCollection = $scope.rowCollection;
            displayedCollection = $scope.rowCollection;
            $scope.rowCollection = []; // base collection
            $scope.displayedCollection = [].concat($scope.rowCollection); // displayed collection

            $timeout(function () {
                $scope.rowCollection = rowCollection;
                angular.forEach($scope.rowCollection, function (row) {
                    angular.forEach(row.act_enc, function (appt) {
                        if (appt.apptArrivalData == '-' && appt.apptSeenData == '-') {
                            appt.sts = 'B';
                        }
                        if (appt.apptArrivalData != '-' && appt.apptSeenData == '-') {
                            appt.sts = 'A';
                        }
                        appt.selected = '0';
                    });
                    row.expanded = $scope.getRowExpand(row.consultant_id);
                    row.act_enc = $filter('orderBy')(row.act_enc, ['sts', 'apptArrivalData.status_datetime', 'apptBookingData.status_datetime', 'apptSeenData.status_datetime']);
                });
                $scope.displayedCollection = [].concat($scope.rowCollection);
                $scope.isLoading = false;
                $timeout(function () {
                    profilePhoto(".patientImage");
                }, 1000);
            }, 200);
        }

        $.cookie.json = true;
        $scope.setRowExpanded = function (cid, rowopen) {
            if ($scope.op_type == 'Future')
            {
                var month = parseInt($(".ui-datepicker-month").val()) + 1;
                var year = $(".ui-datepicker-year").val();
            }
            var opRowExpand = [];
            if (typeof $.cookie('opRowExp') !== 'undefined') {
                opRowExpand = $.cookie('opRowExp');
            }
            exists = $filter('filter')(opRowExpand, {consultant_id: cid});
            if (exists.length == 0) {
                opRowExpand.push({
                    'consultant_id': cid,
                    'rowopen': rowopen,
                });
            } else {
                exists[0].rowopen = rowopen;
            }
            $.cookie('opRowExp', opRowExpand, {path: '/'});
            if (rowopen) {
                var docRow = $filter('filter')($scope.rowCollection, {consultant_id: cid})[0];
                docRow.rowLoading = true;
                if ($scope.range_filter_start && $scope.range_filter_end && $scope.op_type == 'previous') {
                    var url = $rootScope.IRISOrgServiceUrl + '/encounter/outpatients?addtfields=oplist&type=' + $scope.op_type + '&cid=' + cid + '&seen=false&only=results&month=' + month + '&year=' + year + '&range_filter_start=' + $scope.range_filter_start + '&range_filter_end=' + $scope.range_filter_end;
                } else {
                    var url = $rootScope.IRISOrgServiceUrl + '/encounter/outpatients?addtfields=oplist&type=' + $scope.op_type + '&cid=' + cid + '&seen=false&only=results&month=' + month + '&year=' + year;
                }
                $http.get(url)
                        .success(function (OutPatients) {
                            docRow.act_enc = OutPatients.result;
                            docRow.rowLoading = false;
                        })
                        .error(function () {
                            $scope.errorData = "An Error has occured while loading seen data!";
                            docRow.rowLoading = false;
                        });
                $timeout(function () {
                    profilePhoto(".patientImage");
                }, 1000);
            }
        }

        $scope.getRowExpand = function (consultant_id) {
            if (typeof $.cookie('opRowExp') !== 'undefined') {
                var opRowExpand = $.cookie('opRowExp');
                exists = $filter('filter')(opRowExpand, {consultant_id: consultant_id});
                if (exists.length == 0) {
                    return false;
                } else {
                    return exists[0].rowopen;
                }
            }
            return true;
        };
        $scope.expandAllRow = function (expanded) {
            angular.forEach($scope.rowCollection, function (row) {
                if (expanded && row.expanded)
                    return; // If already opened

                row.expanded = expanded;
                $scope.setRowExpanded(row.consultant_id, expanded);
            });
        };
    }]);