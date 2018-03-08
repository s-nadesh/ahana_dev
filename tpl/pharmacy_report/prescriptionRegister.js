app.controller('prescriptionRegisterController', ['$rootScope', '$scope', '$timeout', '$http', '$state', '$anchorScroll', '$filter', '$timeout', function ($rootScope, $scope, $timeout, $http, $state, $anchorScroll, $filter, $timeout) {

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
            $scope.data.consultant_id = '';
            $scope.data.tenant_id = '';
            $scope.data.from = moment().format('YYYY-MM-DD');
            $scope.fromMaxDate = new Date();
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

        //Index Page
        $scope.loadReport = function () {
            $scope.records = [];
            $scope.loadbar('show');
            $scope.loading = true;
            $scope.errorData = "";
            $scope.msg.successMessage = "";

            var data = {};
            if (typeof $scope.data.from !== 'undefined' && $scope.data.from != '')
                angular.extend(data, {from: moment($scope.data.from).format('YYYY-MM-DD')});
            if (typeof $scope.data.consultant_id !== 'undefined' && $scope.data.consultant_id != '')
                angular.extend(data, {consultant_id: $scope.data.consultant_id});
            if (typeof $scope.data.tenant_id !== 'undefined' && $scope.data.tenant_id != '')
                angular.extend(data, {tenant_id: $scope.data.tenant_id});

            // Get data's from service
            $http.post($rootScope.IRISOrgServiceUrl + '/pharmacyreport/prescriptionregisterreport?addtfields=prescregister', data)
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.loading = false;
                        $scope.showTable = true;
                        $scope.records = response.report;
                        $scope.tableid = [];
                        $scope.sheet_name = [];
                        var newunique = {};
                        angular.forEach(response.report, function (item, key) {
                            if (!newunique[item.branch_name]) {
                                $scope.sheet_name.push(item.branch_name);
                                $scope.tableid.push('table_' + item.branch_name);
                                newunique[item.branch_name] = item;
                            }
                        });
                        $scope.generated_on = moment().format('YYYY-MM-DD hh:mm A');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured";
                    });
        };

        //For Print
        $scope.printHeader = function () {
            return {
                text: "Prescription Register",
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
            
            var date_rage = moment($scope.data.from).format('YYYY-MM-DD');
            var generated_on = $scope.generated_on;
            var generated_by = $scope.app.username;

            var branch_wise = $filter('groupBy')($scope.records, 'branch_name');
            var result_count = Object.keys(branch_wise).length;
            var index = 1;
            angular.forEach(branch_wise, function (sales, branch_name) {
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

                angular.forEach(sales, function (sale, sale_key) {
                    var items = [];
                    var sale_header = sale.sale_date + ' ' + sale.bill_no + ' ' + sale.consultant_name + ' ' + sale.patient_name;
                    items.push([
                        {text: sale_header, style: 'header', colSpan: 6}, "", "", "", "", ""
                    ]);
                    items.push([
                        {text: 'Product Name', style: 'header'},
                        {text: 'Qty', style: 'header'},
                        {text: 'Brand', style: 'header'},
                        {text: 'Batch', style: 'header'},
                        {text: 'Expiry', style: 'header'},
                        {text: 'Pharmacist Signature', style: 'header'}
                    ]);
                    angular.forEach(sale.items, function (item, item_key) {
                        items.push([
                            item.product.full_name,
                            item.quantity.toString(),
                            item.product.brand_code,
                            item.batch.batch_no,
                            moment(item.batch.expiry_date).format('MM/YYYY'),
                            ''
                        ]);
                    });

                    content_info.push({
                        style: 'demoTable',
                        table: {
                            widths: ['*', 'auto', 'auto', 'auto', 'auto', '*'],
                            headerRows: 2,
                            dontBreakRows: true,
                            body: items,
                        },
                        layout: {
                            hLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                            }
                        }                        
                    });
                });
                
                content_info.push({
                    text: '',
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