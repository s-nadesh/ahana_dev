app.controller('ipBillStatusController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', '$filter', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, $filter) {

        $scope.clearReport = function () {
            $scope.showTable = false;
            $scope.data = {};
            $scope.data.consultant_id = '';
            $scope.data.tenant_id = '';
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

        $scope.$watch('data.consultant_id', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                if ($scope.data.consultant_id.length == $scope.doctors.length) {
                    $timeout(function () {
                        $scope.deselectAll('branch_wise');
                    });
                }
            }
        }, true);
        $scope.$watch('data.tenant_id', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                if ($scope.data.tenant_id.length == Object.keys($scope.tenants).length) {
                    $timeout(function () {
                        $scope.deselectAll('consultant_wise');
                    });
                }
            }
        }, true);

        //Index Page
        $scope.loadReport = function () {
            $scope.records = [];
            $scope.loadbar('show');
            $scope.loading = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            if (typeof $scope.data.consultant_id !== 'undefined' && $scope.data.consultant_id != '')
                angular.extend(data, {consultant_id: $scope.data.consultant_id});
            if (typeof $scope.data.tenant_id !== 'undefined' && $scope.data.tenant_id != '')
                angular.extend(data, {tenant_id: $scope.data.tenant_id});

            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + '/myworkreports/ipbillstatus', data)
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.loading = false;
                        $scope.showTable = true;
                        $scope.records = response;
                        $scope.tableid = [];
                        $scope.sheet_name = [];
                        var newunique = {}; var newunique1 = {};
                        angular.forEach(response, function (item, key) {
                            if (!newunique[item.tenant_id]) {
                                $scope.tableid.push('table_' + item.tenant_id);
                                newunique[item.tenant_id] = item;
                            }
                            if (!newunique1[item.branch_name]) {
                                $scope.sheet_name.push(item.branch_name);
                                newunique1[item.branch_name] = item;
                            }
                        });
                        $scope.generated_on = moment().format('YYYY-MM-DD hh:mm A');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured";
                    });
        };

        $scope.printHeader = function () {
            return {
                text: "IP Bill Status",
                margin: 5,
                alignment: 'center'
            };
        }

        $scope.printFooter = function () {
//            return {
//                text: [
//                    {
//                        text: 'Report Genarate On : ',
//                        bold: true
//                    },
//                    moment().format('YYYY-MM-DD HH:mm:ss')
//                ],
//                margin: 5
//            };
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

            var content = [];
            var branch_wise = $filter('groupBy')($scope.records, 'branch_name');

            var result_count = Object.keys(branch_wise).length;
            var index = 1;
            angular.forEach(branch_wise, function (details, branch_name) {
                var content_info = [];

                var branches = [];
                branches.push([
                    {text: branch_name, style: 'header', colSpan: 10}, "", "", "", "", "", "", "", "", ""
                ]);

                branches.push([
                    {text: 'S.No', style: 'header'},
                    {text: 'UHID', style: 'header'},
                    {text: 'Patient Name', style: 'header'},
                    {text: 'Admission Date', style: 'header'},
                    {text: 'Stay Duration', style: 'header'},
                    {text: 'Room', style: 'header'},
                    {text: 'Total Charges', style: 'header'},
                    {text: 'Consultant', style: 'header'},
                    {text: 'Advance', style: 'header'},
                    {text: 'Due', style: 'header'}
                ]);

                var serial_no = 1;
                angular.forEach(details, function (row, key) {
                    var s_no_string = serial_no.toString();
                    branches.push([
                        s_no_string,
                        row.apptPatientData.patient_global_int_code,
                        row.apptPatientData.fullname,
                        row.encounter_date,
                        row.stay_duration.toString(),
                        row.apptPatientData.current_room,
                        (row.viewChargeCalculation.total_charge - row.viewChargeCalculation.total_concession).toString(),
                        row.patient.consultant_name,
                        (row.viewChargeCalculation.total_paid || '0.00').toString(),
                        row.viewChargeCalculation.balance.toString(),
                    ]);
                    serial_no++;
                });

                content_info.push({
                    columns: [
                        {
                            text: [
                                {text: 'Generated On: ', bold: true},
                                generated_on
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
                    style: 'demoTable',
                    table: {
                        headerRows: 1,
                        widths: ['auto', 'auto', '*', '*', 'auto', '*', 'auto', '*', 'auto', 'auto'],
                        body: branches,
                    },
                    pageBreak: (index === result_count ? '' : 'after'),
                });
                content.push(content_info);
                if (index == result_count) {
                    $scope.printloader = '';
                }
                index++;
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
                        pageOrientation: 'landscape',
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