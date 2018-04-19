// this is a lazy load controller, 
// so start with "app." to register this controller

app.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
})
app.controller('ProcedureController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$timeout', '$filter', 'modalService', function ($rootScope, $scope, $timeout, $http, $state, $timeout, $filter, modalService) {

        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';

        $scope.open_date = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened_date = true;
        };

        $scope.disabled = function (date, mode) {
            date = moment(date).format('YYYY-MM-DD');
            return $.inArray(date, $scope.enabled_dates) === -1;
        };

        $scope.ctrl = {};
        $scope.allExpanded = true;
        $scope.expanded = true;
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        $scope.enc = {};
        $scope.$watch('patientObj.patient_id', function (newValue, oldValue) {
            if (newValue != '') {
                $rootScope.commonService.GetEncounterListByPatient($scope.app.logged_tenant_id, '0,1', false, $scope.patientObj.patient_id, function (response) {
                    angular.forEach(response, function (resp) {
                        resp.encounter_id = resp.encounter_id.toString();
                    });
                    $scope.encounters = response;
                    if (response != null) {
                        var activeSelected = $filter('filter')($scope.encounters, {status: '1'});
                        $scope.enc.selected = (activeSelected) ? activeSelected[0] : $scope.encounters[0];

                    }
                }, 'encounter_details');
            }
        }, true);

        $scope.$watch('enc.selected.encounter_id', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.loadProceduresList();
            }
        }, true);

        $scope.initProcedureIndex = function () {
            $scope.data = {};
        }

        $scope.enabled_dates = [];
        $scope.loadProceduresList = function (date) {
            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
            $rootScope.commonService.GetMonth(function (response) {
                $scope.months = response;
            });
            $rootScope.commonService.GetYear(function (response) {
                $scope.years = response;
            });
            $scope.loadbar('show');
            $scope.isLoading = true;
            // pagination set up
            $scope.rowCollection = [];  // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection);  // displayed collection

            if (typeof date == 'undefined') {
                url = $rootScope.IRISOrgServiceUrl + '/procedure/getprocedurebyencounter?patient_id=' + $state.params.id + '&addtfields=procedurelist';
            } else {
                date = moment(date).format('YYYY-MM-DD');
                url = $rootScope.IRISOrgServiceUrl + '/procedure/getprocedurebyencounter?patient_id=' + $state.params.id + '&date=' + date + '&addtfields=procedurelist';
            }

            // Get data's from service
            $http.get(url)
                    .success(function (procedures) {
                        $scope.loadbar('hide');
                        $scope.isLoading = false;
                        $scope.rowCollection = procedures.result;
                        $scope.displayedCollection = [].concat($scope.rowCollection);

                        angular.forEach($scope.rowCollection, function (row) {
                            angular.forEach(row.all, function (all) {
                                var result = $filter('filter')($scope.enabled_dates, moment(all.proc_date).format('YYYY-MM-DD'));
                                if (result.length == 0)
                                    $scope.enabled_dates.push(moment(all.proc_date).format('YYYY-MM-DD'));
                            });
                        });
                        $scope.$broadcast('refreshDatepickers');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading procedures!";
                    });
        };

        $scope.isPatientHaveActiveEncounter = function (callback) {
            $http.post($rootScope.IRISOrgServiceUrl + '/encounter/patienthaveactiveencounter', {patient_id: $state.params.id})
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

        $scope.active_encounter_date = '';
        $scope.initCanSaveAdmission = function () {
            $scope.showForm = false;
            $scope.isPatientHaveActiveEncounter(function (response) {
                is_success = true;
                if (response.success == true) {
                    $scope.active_encounter_date = response.model.encounter_date;
                    if (response.model.encounter_id != $state.params.enc_id) {
                        is_success = false;
                    }
                } else {
                    is_success = false;
                }

                if (!is_success) {
                    alert("This is not an active Encounter");
                    $state.go("patient.procedure", {id: $state.params.id});
                }
                $scope.showForm = true;
            });
        }

        $scope.initForm = function () {
            $scope.loadbar('show');
            $scope.data = {};
            $scope.data.proc_date = moment().format('YYYY-MM-DD HH:mm:ss');
            $rootScope.commonService.GetChargeCategoryList('', '1', false, 'PRC', function (response) {
                $scope.procedures = response.categoryList;
            });

            $scope.doctors = [];
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
                $scope.loadbar('hide');
            });
        }

        //Save Both Add & Update Data
        $scope.saveForm = function (mode) {
            _that = this;

            $scope.errorData = "";
            $scope.msg.successMessage = "";

            docIds = [];
            angular.forEach($scope.data.consultant_ids, function (list) {
                docIds.push(list.user_id);
            });
            _that.data.proc_consultant_ids = docIds;
            angular.extend(_that.data, {patient_id: $scope.patientObj.patient_id});
            _that.data.proc_date = moment(_that.data.proc_date).format('YYYY-MM-DD HH:mm:ss');

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/procedures';
                method = 'POST';
                succ_msg = 'Procedure Added successfully';
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/procedures/' + _that.data.proc_id;
                method = 'PUT';
                succ_msg = 'Procedure updated successfully';
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
                            $state.go('patient.procedure', {id: $scope.patientObj.patient_guid});
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
                url: $rootScope.IRISOrgServiceUrl + "/procedures/" + $state.params.proc_id,
                method: "GET"
            }).success(
                    function (response1) {
                        $scope.loadbar('hide');
                        $scope.ids = response1.proc_consultant_ids;
                        $scope.data = response1;

                        $scope.data.consultant_ids = [];
                        $scope.$watch('doctors', function (newValue, oldValue) {
                            angular.forEach($scope.doctors, function (n, i) {
                                if ($.inArray(n.user_id, $scope.ids) >= 0) {
                                    $scope.data.consultant_ids.push($scope.doctors[i]);
                                }
                            });
                        }, true);
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
        $scope.removeRow = function (id) {
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Procedure?',
                bodyText: 'Are you sure you want to delete this procedure?'
            };

            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loadbar('show');
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + "/procedure/remove",
                    data: {id: id},
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadProceduresList();
                                $scope.msg.successMessage = 'Procedure deleted successfully';
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                );
            });
        };

        //For Datepicker
        $scope.open = function ($event, mode) {
            $event.preventDefault();
            $event.stopPropagation();

            switch (mode) {
                case 'opened1':
                    $scope.opened1 = true;
                    break;
                case 'opened2':
                    $scope.opened2 = true;
                    break;
            }
        };

        //For Datetimepicker
        $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var today_date = new Date().valueOf();

            angular.forEach($dates, function (date, key) {
                if (today_date < date.localDateValue()) {
                    $dates[key].selectable = false;
                }
            });

            $scope.$watch('active_encounter_date', function (newValue, oldValue) {
                if (newValue != '' && typeof newValue != 'undefined') {
                    var admission_date_format = moment($scope.active_encounter_date).format('MM/DD/YYYY');
                    var admission_date = new Date(admission_date_format);
                    var admission_date_value = admission_date.valueOf();
                    var admission_date_m = admission_date.getMonth();
                    var admission_date_y = admission_date.getFullYear();
                    var admission_month_year = (new Date(admission_date_y, admission_date_m, '1')).valueOf();
                    var admission_year = (new Date(admission_date_y, '0', '1')).valueOf();

                    angular.forEach($dates, function (date, key) {
                        if (admission_date_value > date.localDateValue()) {
                            $dates[key].selectable = false;
                        }
                        if ($view == 'month' && admission_month_year == date.localDateValue()) {
                            $dates[key].selectable = true;
                        }
                        if ($view == 'year' && admission_year == date.localDateValue()) {
                            $dates[key].selectable = true;
                        }
                    });
                }
            }, true);
        }
        $scope.printProcedureBill = function (proc_id) {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $scope.updatePrintcreatedby('PatProcedure', proc_id);
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/procedures/" + proc_id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.opBillPrint(response);
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
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
            $scope.printloader = '<i class="fa fa-spin fa-spinner"></i>';
            var print_content = $scope.printContent(printData);
            if ($scope.duplicate_copy) {
                var bill = 'DUPLICATE COPY';
            } else {
                var bill = '';
            }
            if (print_content.length > 0) {
                $timeout(function () {
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
                }, 1000);
            }
        }

        $scope.printContent = function (printData) {
            var content = [];
            var perPageInfo = [];
            var perPageItems = [];
            var index = 1;

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
                    text: 'Doctor',
                    style: 'th'
                },
                {
                    text: 'Amount',
                    style: 'th'
                },
            ]);
            perPageItems.push([
                {
                    text: index,
                    alignment: 'left',
                },
                {
                    text: 'Procedure Charges',
                    alignment: 'left',
                },
                {
                    text: printData.procedure_name,
                    alignment: 'left',
                },
                {
                    text: printData.doctors,
                    alignment: 'left',
                },
                {
                    text: printData.charge_amount,
                    alignment: 'left',
                },
            ]);
            perPageItems.push([{
                    colSpan: 5,
                    text: 'Bill Total : ' + printData.charge_amount,
                    alignment: 'right'
                }, {}, {}, {}, {}], [{
                    colSpan: 5,
                    text: 'Amount Paid : ' + printData.charge_amount,
                    alignment: 'right'
                }, {}, {}, {}, {}]);
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
                                                        text: 'Procedure Bill',
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
                                                text: 'Procedure Date',
                                                style: 'h2',
                                                margin: [-7, 0, 0, 0],
                                            },
                                            {
                                                text: ':',
                                                style: 'h2'
                                            },
                                            {
                                                text: moment(printData.proc_date).format('DD-MM-YYYY hh:mm A'),
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
                    widths: ['auto', 'auto', '*', 'auto', 'auto'],
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
                                                colSpan: 3,
                                                text: [
                                                    $filter('words')(parseFloat(printData.charge_amount)),
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

    }]);
