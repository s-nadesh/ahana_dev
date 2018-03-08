app.controller('patientReportController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', '$filter', '$timeout', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, $filter, $timeout) {

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
            $scope.data.to = moment().format('YYYY-MM-DD');
            $scope.data.patient_group_name = '';
            $scope.data.tenant_id = '';
            $scope.deselectAll();
        }
        
        $scope.deselectAll = function () {
            $timeout(function () {
                // anything you want can go here and will safely be run on the next digest.
                var patient_group_button = $('button[data-id="patient_group"]').next();
                var patient_group_deselect_all = patient_group_button.find(".bs-deselect-all");
                patient_group_deselect_all.click();
            });
        }

        $scope.initReport = function () {
            $scope.saleGroups = {};
            $scope.saleGroupsLength = 0;
            $rootScope.commonService.GetSaleGroups('', '1', false, function (response) {
                $scope.saleGroups = response.saleGroupsList;
                $scope.saleGroupsLength = Object.keys($scope.saleGroups).length;
            });
            $scope.tenants = [];
            $rootScope.commonService.GetTenantList(function (response) {
                if (response.success == true) {
                    $scope.tenants = response.tenantList;
                }
            });
            
            $scope.clearReport();
        }

        //Index Page
        $scope.loadReport = function () {
            $scope.records = [];
            $scope.loadbar('show');
            $scope.showTable = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            if (typeof $scope.data.to !== 'undefined' && $scope.data.to != '')
                angular.extend(data, {to: moment($scope.data.to).format('YYYY-MM-DD')});
            if (typeof $scope.data.patient_group_name !== 'undefined' && $scope.data.patient_group_name != '')
                angular.extend(data, {patient_group_name: $scope.data.patient_group_name});
            if (typeof $scope.data.tenant_id !== 'undefined' && $scope.data.tenant_id != '')
                angular.extend(data, {tenant_id: $scope.data.tenant_id});

            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacysale/outstandingreport?addtfields=patient_report', data)
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.records = response.report;
                        $scope.generated_on = moment().format('YYYY-MM-DD hh:mm A');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured";
                    });
        };

        $scope.parseFloat = function (row) {
            return parseFloat(row);
        }

        //For Print
        $scope.printHeader = function () {
            return {
                text: "Patient Outstanding Report",
                margin: 5,
                alignment: 'center'
            };
        }

        $scope.printFooter = function () {
//            return true;
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
                }
            };
        }

        $scope.printloader = '';
        $scope.printContent = function () {
            var generated_on = $scope.generated_on;
            var generated_by = $scope.app.username;
            var date_rage = "Upto " + moment($scope.data.to).format('YYYY-MM-DD');
            var branch_name = $scope.records[0].branch_name;

            var reports = [];
//            reports.push([
//                {text: branch_name, style: 'header', colSpan: 7}, "", "", "", "", "", ""
//            ]);

            var patient_wise = $filter('groupBy')($scope.records, 'patient_name');

            reports.push([
                {text: 'S.No', style: 'header'},
                {text: 'Patient Name', style: 'header'},
                {text: 'Patient UHID', style: 'header'},
                {text: 'Patient Group', style: 'header'},
                {text: 'Total Pending Amount', style: 'header'},
            ]);

            var serial_no = 1;
            var result_count = $scope.records.length;
            angular.forEach(patient_wise, function (detail, patient_name) {
                var total = 0;
                var s_no_string = serial_no.toString();
                angular.forEach(detail, function (record, key) {
                    total += $scope.parseFloatIgnoreCommas(record.billings_total_balance_amount);
                });
                reports.push([
                    s_no_string,
                    patient_name,
                    detail[0].patient_uhid,
                    detail[0].patient_group_name,
                    total
                ]);
                serial_no++;
                if (serial_no == result_count) {
                    $scope.printloader = '';
                }
            });

            var content = [];
            content.push({
                columns: [
                    {
                        text: [
                            {text: 'Report Name: ', bold: true},
                            'Patient Outstanding Report'
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: [
                            {text: ' Generated On: ', bold: true},
                            generated_on
                        ],
                        margin: [0, 0, 0, 20]
                    }
                ]
            }, {
                columns: [
                    {
                        text: [
                            {text: 'Date: ', bold: true},
                            date_rage
                        ],
                        margin: [0, 0, 0, 20]
                    },
                    {
                        text: [
                            {text: ' Generated By: ', bold: true},
                            generated_by
                        ],
                        margin: [0, 0, 0, 20]
                    }
                ]
            }, {
                columns: [
                    {
                        text: [
                            {text: 'Branch Name: ', bold: true},
                            branch_name
                        ],
                        margin: [0, 0, 0, 20]
                    }, ]
            }, {
                style: 'demoTable',
                table: {
                    headerRows: 1,
                    widths: ['auto', 'auto', '*', 'auto', 'auto'],
                    body: reports,
                    dontBreakRows: true,
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                    }
                }
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

        $scope.total_pending = function (a, b) {
            if (a == undefined)
                return b;
            if (a != undefined)
            {
                var total = parseFloat(a.replace(',', '')) + parseFloat(b.replace(',', ''));
                return total.toFixed(2);
            }
        }

        $scope.nameReplace = function (a) {
            return a.replace('&', '');
        }

        $scope.parseFloatIgnoreCommas = function (amount) {
            var numberNoCommas = amount.replace(/,/g, '');
            return parseFloat(numberNoCommas);
        }
    }]);