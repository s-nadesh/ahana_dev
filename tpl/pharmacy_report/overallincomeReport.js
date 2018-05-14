app.controller('OverallincomeController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', '$filter', '$timeout', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, $filter, $timeout) {

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
            $scope.data.tenant_id = '';
            $scope.data.to = moment().format('YYYY-MM-DD');
            $scope.data.from = moment($scope.data.to).add(-15, 'days').format('YYYY-MM-DD');
            $scope.deselectAll('branch_wise');
            $scope.fromMaxDate = new Date($scope.data.to);
            $scope.toMinDate = new Date($scope.data.from);
        }

        $scope.$watch('data.from', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.toMinDate = new Date($scope.data.from);
                var from = moment($scope.data.from);
                var to = moment($scope.data.to);
                var difference = to.diff(from, 'days') + 1;

                if (difference > 16) {
                    $scope.data.to = moment($scope.data.from).add(+15, 'days').format('YYYY-MM-DD');
                }
            }
        }, true);
        $scope.$watch('data.to', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.fromMaxDate = new Date($scope.data.to);
                var from = moment($scope.data.from);
                var to = moment($scope.data.to);
                var difference = to.diff(from, 'days') + 1;

                if (difference > 16) {
                    $scope.data.from = moment($scope.data.to).add(-15, 'days').format('YYYY-MM-DD');
                }
            }
        }, true);

        $scope.initReport = function () {
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
                }
                $('#get_report').attr("disabled", true);
            });
        }

        $scope.parseFloat = function (row) {
            return parseFloat(row);
        }

        //Index Page
        $scope.loadReport = function () {
            $scope.sale = $scope.op_income = $scope.ip_income = [];
            $scope.loadbar('show');
            $scope.loading = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            if (typeof $scope.data.from !== 'undefined' && $scope.data.from != '')
                angular.extend(data, {from: moment($scope.data.from).format('YYYY-MM-DD')});
            if (typeof $scope.data.to !== 'undefined' && $scope.data.to != '')
                angular.extend(data, {to: moment($scope.data.to).format('YYYY-MM-DD')});
            if (typeof $scope.data.tenant_id !== 'undefined' && $scope.data.tenant_id != '')
                angular.extend(data, {tenant_id: $scope.data.tenant_id});
            
            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacysalebilling/overallincome?addtfields=overall_income_report', data)
                    .success(function (response) {
                        $scope.sale_new = $scope.op_income_new = $scope.ip_income_new = $scope.ipwise = $scope.opwise = $scope.salewise ={};
                        $scope.loadbar('hide');
                        $scope.loading = false;
                        $scope.showTable = true;
                        $scope.sale = response.sale;
                        $scope.op_income = response.op_income;
                        $scope.ip_income = response.ip_income;
                        angular.forEach($scope.ip_income, function (obj) {
                            payment_date = moment(obj.payment_date).format('YYYY-MM-DD');
                            obj.payment_date = payment_date;
                        });
                        angular.forEach($scope.op_income, function (obj) {
                            consult_date = moment(obj.consult_date).format('YYYY-MM-DD');
                            obj.consult_date = consult_date;
                        });
                        $scope.tableid = [];
                        $scope.sheet_name = [];
                        if($scope.sale.length && $scope.sale.length > 0 ) {
                            $scope.tableid.push('sale_income_report');
                            $scope.sheet_name.push('Sales Income');
                        }
                        if($scope.op_income.length && $scope.op_income.length > 0 ) {
                            $scope.tableid.push('op_income_report');
                            $scope.sheet_name.push('OP Income');
                        }
                        if($scope.ip_income.length && $scope.ip_income.length > 0 ) {
                            $scope.tableid.push('ip_income_report');
                            $scope.sheet_name.push('IP Income');
                        }
                        $scope.generated_on = moment().format('YYYY-MM-DD hh:mm A');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured";
                    });
        };

        //For Print
        $scope.printHeader = function () {
            return {
                text: "Pharmacy Credit Make Payment Report",
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
                    margin: [0, 0, 0, 20]
                }
            };
        }

        $scope.printloader = '';
        $scope.printContent = function () {

            var content = [];

            var date_rage = moment($scope.data.from).format('YYYY-MM-DD') + " - " + moment($scope.data.to).format('YYYY-MM-DD');
            var generated_on = $scope.generated_on;
            var generated_by = $scope.app.username;

            var branch_wise = $filter('groupBy')($scope.records, 'branch_name');
            var result_count = Object.keys(branch_wise).length;
            var index = 1;
            angular.forEach(branch_wise, function (branch, branch_name) {
                var items = [];
                var content_info = [];
                content_info.push({
                    columns: [
                        {
                            text: [
                                {text: 'Branch Name: ', bold: true},
                                branch_name
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
                                {text: 'Date: ', bold: true},
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
                });

                var patient_wise = $filter('groupBy')(branch, 'patient_name');

                items.push([
                    {text: 'S.No', style: 'header'},
                    {text: 'Patient UHID', style: 'header'},
                    {text: 'Patient Name', style: 'header'},
                    {text: 'Patient Group', style: 'header'},
                    {text: 'Total Paid Amount', style: 'header'},
                ]);
                var serial_no = 1;
                var result_count = $scope.records.length;


                angular.forEach(patient_wise, function (detail, patient_name) {
                    var total = 0;
                    angular.forEach(detail, function (record, key) {
                        total += $scope.parseFloatIgnoreCommas(record.paid_amount);
                    });
                    var s_no_string = serial_no.toString();
                    items.push([
                        s_no_string,
                        detail[0].sale_details.patient_uhid,
                        patient_name,
                        detail[0].sale_details.patient_group_name,
                        total
                    ]);
                    serial_no++;
                    if (serial_no == result_count) {
                        $scope.printloader = '';
                    }
                });
                content_info.push({
                    style: 'demoTable',
                    table: {
                        widths: ['auto', '*', '*', '*','*'],
                        headerRows: 1,
                        body: items,
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                        }
                    },
                    //pageBreak: (index === result_count ? '' : 'after'),
                });
                content.push(content_info);

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
        $scope.parseFloatIgnoreCommas = function (amount) {
            var numberNoCommas = amount.replace(/,/g, '');
            return parseFloat(numberNoCommas);
        }
    }]);