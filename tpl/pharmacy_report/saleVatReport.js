app.controller('saleVatReportController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', '$filter', '$timeout', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, $filter, $timeout) {

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

        $scope.clearReport = function () {
            $scope.showTable = false;
            $scope.data = {};
            $scope.data.to = moment().format('YYYY-MM-DD');
            $scope.data.from = moment($scope.data.to).add(-1, 'days').format('YYYY-MM-DD');
            $scope.fromMaxDate = new Date($scope.data.to);
            $scope.toMinDate = new Date($scope.data.from);
        }

        $scope.initReport = function () {
            $scope.clearReport();
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

        //Index Page
        $scope.loadReport = function () {
            $scope.records = [];
            $scope.sale = {};
            $scope.loadbar('show');
            $scope.showTable = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            if (typeof $scope.data.from !== 'undefined' && $scope.data.from != '')
                angular.extend(data, {from: moment($scope.data.from).format('YYYY-MM-DD')});
            if (typeof $scope.data.to !== 'undefined' && $scope.data.to != '')
                angular.extend(data, {to: moment($scope.data.to).format('YYYY-MM-DD')});

            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacyreport/salevatreport?addtfields=salevatreport', data)
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.records = response.report;
                        $scope.generated_on = moment().format('YYYY-MM-DD hh:mm A');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured";
                    });
        };
        
        $scope.checkNextrecord = function (a,b,c) {
            if(a==b) {
                return parseFloat(0);
            } else {
                return parseFloat(c);
            }
        }

        $scope.parseFloat = function (row) {
            return parseFloat(row);
        }

        //For Print
        $scope.printHeader = function () {
            return {
                text: "Sale GST Report",
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
            var date_rage = moment($scope.data.from).format('YYYY-MM-DD') + " - " + moment($scope.data.to).format('YYYY-MM-DD');
            var branch_name = $scope.app.org_name;

            var reports = [];
            reports.push([
                {text: branch_name, style: 'header', colSpan: 10}, "", "", "", "","","","","",""
            ]);
            reports.push([
                {text: 'S.No', style: 'header'},
                {text: 'Bill No', style: 'header'},
                {text: 'Bill Date', style: 'header'},
                {text: 'Patient UHID', style: 'header'},
                {text: 'Patient Name', style: 'header'},
                {text: 'Tax Rate', style: 'header'},
                {text: 'Taxable Value', style: 'header'},
                {text: 'CGST', style: 'header'},
                {text: 'SGST', style: 'header'},
                {text: 'Round Off', style: 'header'},
            ]);

            var serial_no = 1;
            var result_count = $scope.records.length;
            var tax_rate = 0;
            var taxable_value = 0;
            var cgst_amount = 0;
            var sgst_amount = 0;
            var roundoff_amount = 0;
            angular.forEach($scope.records, function (record, key) {
                var s_no_string = serial_no.toString();

                reports.push([
                    s_no_string,
                    record.bill_no,
                    record.sale_date,
                    record.patient_global_int_code,
                    record.patient_name,
                    record.tax_rate,
                    record.taxable_value,
                    record.cgst_amount,
                    record.sgst_amount,
                    record.roundoff_amount,
                ]);

                tax_rate += parseFloat(record.tax_rate);
                taxable_value += parseFloat(record.taxable_value);
                cgst_amount += parseFloat(record.cgst_amount);
                sgst_amount += parseFloat(record.sgst_amount);
                roundoff_amount +=parseFloat(record.roundoff_amount);
                
                if (serial_no == result_count) {
                    $scope.printloader = '';
                }
                serial_no++;
            });
//            reports.push([
//                {
//                    text: 'Totals',
//                    style: 'header',
//                    alignment: 'right',
//                    colSpan: 5
//                },
//                "",
//                "",
//                "",
//                "",
//                {
//                    text: sale_amount.toFixed(2).toString(),
//                    style: 'header',
//                    alignment: 'right'
//                },
//                {
//                    text: vat_amount.toFixed(2).toString(),
//                    style: 'header',
//                    alignment: 'right'
//                },
//                {
//                    text: cgst_amount.toFixed(2).toString(),
//                    style: 'header',
//                    alignment: 'right'
//                },
//                {
//                    text: sgst_amount.toFixed(2).toString(),
//                    style: 'header',
//                    alignment: 'right'
//                },
//                {
//                    text: roundoff_amount.toFixed(2).toString(),
//                    style: 'header',
//                    alignment: 'right'
//                },
//            ]);

            var content = [];
            content.push({
                columns: [
                    {
                        text: [
                            {text: 'Report Name: ', bold: true},
                            'Sale GST Report'
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
                style: 'demoTable',
                table: {
                    headerRows: 2,
                    widths: ['auto', 'auto', '*', '*', 'auto', 'auto', 'auto', 'auto', 'auto','auto'],
                    //widths: [20, 'auto', 'auto', 'auto', '*', 'auto', 25, 25, 25, 25],
                    body: reports,
                    //dontBreakRows: true,
                },
//                layout: {
//                    hLineWidth: function (i, node) {
//                        return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
//                    }
//                }
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
        
        $scope.nameReplace = function (a) {
            return a.replace('&', '');
        }
    }]);