app.controller('opSummaryReportController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', '$filter', '$timeout', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, $filter, $timeout) {

        //For Datepicker
        $scope.open = function ($event, mode) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened1 = $scope.opened2 = false;
            switch (mode) {
                case 'opened1':
                    $scope.opened1 = true;
                    break;
                case 'opened2':
                    $scope.opened2 = true;
                    break;
            }
        };
        
        //Expand table in Index page
        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };

        $scope.clearReport = function () {
            $scope.showTable = false;
            $scope.data = {};
            $scope.data.consultant_id = '';
            $scope.data.tenant_id = '';
            $scope.data.to = moment().format('YYYY-MM-DD');
            $scope.data.from = moment($scope.data.to).add(-30, 'days').format('YYYY-MM-DD');
            $scope.fromMaxDate = new Date($scope.data.to);
            $scope.toMinDate = new Date($scope.data.from);
            $scope.deselectAll('branch_wise');
            $scope.deselectAll('consultant_wise');
        }

        $scope.initReport = function () {
            $scope.doctors = [];
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
            });

            $scope.tenants = [];
            $rootScope.commonService.GetTenantList(function (response) {
                if (response.success == true) {
                    $scope.tenants = response.tenantList;
                }
            });

            $scope.clearReport();
        }

        $scope.deselectAll = function (type) {
            $timeout(function () {
                // anything you want can go here and will safely be run on the next digest.
                if (type == 'branch_wise') {
                    var branch_wise_button = $('button[data-id="branch_wise"]').next();
                    var branch_wise_deselect_all = branch_wise_button.find(".bs-deselect-all");
                    branch_wise_deselect_all.click();
                } else if (type == 'consultant_wise') {
                    var consultant_wise_button = $('button[data-id="consultant_wise"]').next();
                    var consultant_wise_deselect_all = consultant_wise_button.find(".bs-deselect-all");
                    consultant_wise_deselect_all.click();
                }
                $('#get_report').attr("disabled", true);
            });
        }

        $scope.$watch('data.from', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.toMinDate = new Date($scope.data.from);
                var from = moment($scope.data.from);
                var to = moment($scope.data.to);
                var difference = to.diff(from, 'days') + 1;

                if (difference > 31) {
                    $scope.data.to = moment($scope.data.from).add(+30, 'days').format('YYYY-MM-DD');
                }
            }
        }, true);
        $scope.$watch('data.to', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.fromMaxDate = new Date($scope.data.to);
                var from = moment($scope.data.from);
                var to = moment($scope.data.to);
                var difference = to.diff(from, 'days') + 1;

                if (difference > 31) {
                    $scope.data.from = moment($scope.data.to).add(-30, 'days').format('YYYY-MM-DD');
                }
            }
        }, true);

        //Index Page
        $scope.loadReport = function () {
            $scope.records = [];
            $scope.branchwise_new = {};
            $scope.loadbar('show');
            $scope.loading = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            if (typeof $scope.data.from !== 'undefined' && $scope.data.from != '')
                angular.extend(data, {from: moment($scope.data.from).format('YYYY-MM-DD')});
            if (typeof $scope.data.to !== 'undefined' && $scope.data.to != '')
                angular.extend(data, {to: moment($scope.data.to).format('YYYY-MM-DD')});
            if (typeof $scope.data.consultant_id !== 'undefined' && $scope.data.consultant_id != '')
                angular.extend(data, {consultant_id: $scope.data.consultant_id});
            if (typeof $scope.data.tenant_id !== 'undefined' && $scope.data.tenant_id != '')
                angular.extend(data, {tenant_id: $scope.data.tenant_id});

            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + '/myworkreports/opsummaryreport', data)
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.loading = false;
                        $scope.showTable = true;
                        $scope.records = response.report;
                        $scope.tableid = [];
                        $scope.sheet_name = [];
                        angular.forEach(response.sheetname, function (item, key) {
                            $scope.tableid.push('table_' + item.consultant_id);
                            $scope.sheet_name.push(item.consultant_name);
                        });
                        $scope.tableid.push('table_doctorwise_report');
                        $scope.tableid.push('table_datewise_report');
                        $scope.sheet_name.push('Doctorwise Report');
                        $scope.sheet_name.push('Datewise Report');
                        $scope.generated_on = moment().format('YYYY-MM-DD hh:mm A');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured";
                    });
        };
        $scope.total_pending = function (a, b) {
            if (a == undefined)
                return b;
            if (a != undefined)
            {
                var total = parseFloat(a.replace(',', '')) + parseFloat(b.replace(',', ''));
                return total.toFixed(2);
            }
        }
        $scope.parseFloat = function (row) {
            return parseFloat(row);
        }

        //For Print
        $scope.printHeader = function () {
            return {
                text: "OP Payments",
                margin: 5,
                alignment: 'center'
            };
        }

        $scope.printFooter = function () {
            return {
                text: [
                    {
                        text: 'Report Genarate On : ',
                        bold: true
                    },
                    moment().format('YYYY-MM-DD HH:mm:ss')
                ],
                margin: 5
            };
        }

        $scope.printStyle = function () {
            return {
                header: {
                    bold: true,
                    color: '#000',
                    fontSize: 11
                },
                demoTable: {
                    color: '#000',
                    fontSize: 10,
                    margin: [0, 0, 0, 20]
                }
            };
        }

        $scope.printloader = '';
        $scope.printContent = function () {
            var content = [];
            var consultant_wise = $filter('groupBy')($scope.records, 'consultant_name');
            var result_count = Object.keys(consultant_wise).length;
            var index = 1;
            angular.forEach(consultant_wise, function (details, doctor_name) {
                var content_info = [];
                var date_rage = moment($scope.data.from).format('DD-MM-YYYY') + " - " + moment($scope.data.to).format('DD-MM-YYYY');
                var generated_on = $scope.generated_on;
                var generated_by = $scope.app.username;
                var consultant_wise_total = 0;
                //Branchwise
                var branch_wise = $filter('groupBy')(details, 'branch_name');
                var branches = [];
                branches.push(
                        [{text: 'Branches', alignment: 'center', style: 'header', colSpan: 2}, ""],
                        [{text: 'Branch Name', style: 'header'}, {text: 'Amount', style: 'header'}]
                        );
                angular.forEach(branch_wise, function (branch, branch_name) {
                    var branch_wise_total = 0;
                    angular.forEach(branch, function (record, key) {
                        branch_wise_total += parseFloat(record.payment_amount);
                        consultant_wise_total += parseFloat(record.payment_amount);
                    });
                    var branch_total = branch_wise_total.toString();
                    branches.push([
                        {text: branch_name},
                        {text: branch_total, alignment: 'right'}
                    ]);
                });
                branches.push([
                    {
                        text: 'Total',
                        style: 'header',
                        alignment: 'right'
                    },
                    {
                        text: consultant_wise_total.toString(),
                        style: 'header',
                        alignment: 'right'
                    }
                ]);
                content_info.push({
                    columns: [
                        {
                            text: [
                                {text: 'Name of the Doctor: ', bold: true},
                                doctor_name
                            ],
                            margin: [0, 0, 0, 5]
                        },
                        {
                            text: [
                                {text: 'Generated On: ', bold: true},
                                generated_on
                            ],
                            margin: [0, 0, 0, 5]
                        }
                    ]
                }, {
                    columns: [
                        {
                            text: [
                                {text: 'Date Range: ', bold: true},
                                date_rage
                            ],
                            margin: [0, 0, 0, 5]
                        },
                        {
                            text: [
                                {text: ' Generated By: ', bold: true},
                                generated_by
                            ],
                            margin: [0, 0, 0, 5]
                        }
                    ]
                }, {
                    text: [
                        {text: 'Total Amount: ', bold: true},
                        consultant_wise_total.toString()
                    ],
                    margin: [0, 0, 0, 5]
                }, {
                    style: 'demoTable',
                    table: {
                        headerRows: 1,
                        widths: ['*', '*'],
                        body: branches,
                    }
                });
                angular.forEach(branch_wise, function (branch, branch_name) {
                    var items = [];
                    items.push([
                        {text: branch_name, style: 'header', colSpan: 6}, "", "", "", "", ""
                    ]);
                    items.push([
                        {text: 'S.No', style: 'header'},
                        {text: 'Patient Name', style: 'header'},
                        {text: 'UHID', style: 'header'},
                        {text: 'Mobile', style: 'header'},
                        {text: 'Seen On', style: 'header'},
                        {text: 'Amount', style: 'header'}
                    ]);
                    var items_serial_no = 1;
                    var total = 0;
                    branch = $filter('orderBy')(branch, ['-new_op', 'op_seen_date_time']);
                    angular.forEach(branch, function (record, key) {
                        var s_no_string = items_serial_no.toString();
                        var seen_date_time = moment(record.op_seen_date_time).format('DD-MM-YYYY hh:mm A');
                        items.push([
                            s_no_string,
                            record.patient_name,
                            record.patient_global_int_code,
                            record.patient_mobile,
                            seen_date_time,
                            record.payment_amount
                        ]);
                        total += parseFloat(record.payment_amount);
                        items_serial_no++;
                    });
                    items.push([
                        {
                            text: "Total",
                            colSpan: 5,
                            alignment: 'right',
                            style: 'header'
                        }, "", "", "", "", {
                            text: total.toString(),
                            style: 'header'
                        }
                    ]);
                    content_info.push({
                        style: 'demoTable',
                        table: {
                            widths: [40, '*', '*', 'auto', '*', 'auto'],
                            headerRows: 2,
                            dontBreakRows: true,
                            body: items,
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                            }
                        },
                        pageBreak: (index === result_count ? '' : 'after'),
                    });
                });
                content.push(content_info);
                if (index == result_count) {
                    $scope.printloader = '';
                }
                index++;
            });

            var doctor_branch_wise = $filter('groupBy')($scope.records, 'branch_name');
            var doctor_info = [];
            doctor_info.push({
                columns: [
                    {
                        text: [
                            {text: 'Doctor Wise Report: ', bold: true},
                        ],
                        margin: [0, 0, 0, 5]
                    }, ]
            });
            angular.forEach(doctor_branch_wise, function (detail, branch_name) {
                var branch_item = [];

                branch_item.push([
                    {text: branch_name, style: 'header', colSpan: 2}, ""
                ]);

                branch_item.push([
                    {text: 'Doctor Name', style: 'header'},
                    {text: 'Amount', style: 'header'},
                ]);

                var branch_doctor_wise = $filter('groupBy')(detail, 'consultant_name');

                angular.forEach(branch_doctor_wise, function (branch, consultant_name) {
                    var branch_wise_total = 0;
                    angular.forEach(branch, function (record, key) {
                        branch_wise_total += parseFloat(record.payment_amount);
                    });
                    var branch_total = branch_wise_total.toString();
                    branch_item.push([
                        {text: consultant_name},
                        {text: branch_total, alignment: 'right'}
                    ]);
                });

                doctor_info.push({
                    style: 'demoTable',
                    table: {
                        widths: ['*', 'auto'],
                        headerRows: 2,
                        dontBreakRows: true,
                        body: branch_item,
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                        }
                    },
                });
                content.push(doctor_info);
                doctor_info = [];
            });

            var date_wise = $filter('groupBy')($scope.records, 'branch_name');
            var date_info = [];
            date_info.push({
                columns: [
                    {
                        text: [
                            {text: 'Date Wise Report: ', bold: true},
                        ],
                        margin: [0, 0, 0, 5]
                    }, ]
            });
            angular.forEach(date_wise, function (detail, branch_name) {
                var branch_item = [];

                branch_item.push([
                    {text: branch_name, style: 'header', colSpan: 3}, "", ""
                ]);

                branch_item.push([
                    {text: 'Date', style: 'header'},
                    {text: 'Doctor Name', style: 'header'},
                    {text: 'Amount', style: 'header'},
                ]);
                detail = $filter('orderBy')(detail, 'op_seen_date');
                var branch_doctor_wise = $filter('groupBy')(detail, '[op_seen_date, consultant_name]');
                branch_doctor_wise = $filter('orderBy')(branch_doctor_wise, '-op_seen_date');

                angular.forEach(branch_doctor_wise, function (branch, consultant_name) {
                    var branch_wise_total = 0;
                    angular.forEach(branch, function (record, key) {
                        branch_wise_total += parseFloat(record.payment_amount);
                    });
                    var branch_total = branch_wise_total.toString();
                    branch_item.push([
                        {text: branch[0].op_seen_date},
                        {text: branch[0].consultant_name},
                        {text: branch_total, alignment: 'right'}
                    ]);
                });

                date_info.push({
                    style: 'demoTable',
                    table: {
                        widths: ['auto', '*', 'auto'],
                        headerRows: 2,
                        dontBreakRows: true,
                        body: branch_item,
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                        }
                    },
                });
                content.push(date_info);
                date_info = [];
            });

            return content;
        }

        $scope.printReport = function () {
            $scope.printloader = '<i class="fa fa-spin fa-spinner"></i>';
            $timeout(function () {
                var print_content = $scope.printContent();
                if (print_content.length > 0) {
                    var docDefinition = {
                        header: $scope.printHeader(),
                        footer: $scope.printFooter(),
                        styles: $scope.printStyle(),
                        content: print_content,
                        pageMargins: ($scope.deviceDetector.browser == 'firefox' ? 75 : 50),
                        pageSize: 'A4',
                    };
                    var pdf_document = pdfMake.createPdf(docDefinition);
                    var doc_content_length = Object.keys(pdf_document).length;
                    if (doc_content_length > 0) {
                        pdf_document.print();
                    }
                }
            }, 1000);
        }
    }]);