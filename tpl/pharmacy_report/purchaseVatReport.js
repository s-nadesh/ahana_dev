app.controller('purchaseVatReportController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', '$filter', '$timeout', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, $filter, $timeout) {

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
            $scope.data.from = moment().subtract(1, 'months').format('YYYY-MM-DD');
            $scope.fromMaxDate = new Date($scope.data.to);
            $scope.toMinDate = new Date($scope.data.from);
        }

        $scope.initReport = function () {
            $scope.paymentTypes = [];
            $rootScope.commonService.GetPaymentType(function (response) {
                $scope.paymentTypes = response;
            });
            $scope.clearReport();
        }

        $scope.$watch('data.from', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.toMinDate = new Date($scope.data.from);
            }
        }, true);
        $scope.$watch('data.to', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined') {
                $scope.fromMaxDate = new Date($scope.data.to);
            }
        }, true);

        //Index Page
        $scope.loadReport = function () {
            $scope.records = [];
            $scope.purchase = {};
            $scope.loadbar('show');
            $scope.showTable = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            if (typeof $scope.data.from !== 'undefined' && $scope.data.from != '')
                angular.extend(data, {from: moment($scope.data.from).format('YYYY-MM-DD')});
            if (typeof $scope.data.to !== 'undefined' && $scope.data.to != '')
                angular.extend(data, {to: moment($scope.data.to).format('YYYY-MM-DD')});
            if (typeof $scope.data.payment_type !== 'undefined' && $scope.data.payment_type != '')
                angular.extend(data, {payment_type: $scope.data.payment_type});

            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacyreport/purchasereport?addtfields=purchasevatreport', data)
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
                text: "Purchase GST Report",
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
                {text: branch_name, style: 'header', colSpan: 8}, "", "", "", "", "", "", ""
            ]);
            reports.push([
                {text: 'S.No', style: 'header'},
                {text: 'Invoice no', style: 'header'},
                {text: 'Date Of Purchase', style: 'header'},
                {text: 'Supplier', style: 'header'},
                {text: 'Payment Type', style: 'header'},
                {text: 'Vat Purchase Amount', style: 'header'},
                {text: 'Vat Tax Amount', style: 'header'},
                {text: 'Total Amount', style: 'header'},
            ]);

            var serial_no = 1;
            var result_count = $scope.records.length;
            var purchase_amount = 0;
            var vat_amount = 0;
            var total_amount = 0;
            angular.forEach($scope.records, function (record, key) {
                var s_no_string = serial_no.toString();
                if (record.payment_type == 'CA') {
                    var payment = 'Cash';
                } else {
                    var payment = 'Credit';
                }
                reports.push([
                    s_no_string,
                    record.invoice_no,
                    record.invoice_date,
                    record.supplier_name,
                    payment,
                    record.total_item_purchase_amount,
                    record.total_item_vat_amount,
                    record.net_amount,
                ]);

                purchase_amount += parseFloat(record.total_item_purchase_amount);
                vat_amount += parseFloat(record.total_item_vat_amount);
                total_amount += parseFloat(record.net_amount);

                if (serial_no == result_count) {
                    $scope.printloader = '';
                }
                serial_no++;
            });
            reports.push([
                {
                    text: 'Total Purchase Value',
                    style: 'header',
                    alignment: 'right',
                    colSpan: 5
                },
                "",
                "",
                "",
                "",
                {
                    text: purchase_amount.toFixed(2).toString(),
                    style: 'header',
                    alignment: 'right'
                },
                {
                    text: vat_amount.toFixed(2).toString(),
                    style: 'header',
                    alignment: 'right'
                },
                {
                    text: total_amount.toFixed(2).toString(),
                    style: 'header',
                    alignment: 'right'
                },
            ]);

            var content = [];
            content.push({
                columns: [
                    {
                        text: [
                            {text: 'Report Name: ', bold: true},
                            'Purchase GST Report'
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
                    widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto'],
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
        $scope.nameReplace = function (a) {
            return a.replace('&', '');
        }
    }]);