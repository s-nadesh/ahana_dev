app.controller('MyworksController', ['$rootScope', '$scope', '$timeout', '$http', '$state', 'editableOptions', 'editableThemes', '$filter', function ($rootScope, $scope, $timeout, $http, $state, editableOptions, editableThemes, $filter) {

        editableThemes.bs3.inputClass = 'input-sm';
        editableThemes.bs3.buttonsClass = 'btn-sm';
        editableOptions.theme = 'bs3';
        $scope.family = [{"id":0, "name":"test one", "gender":"M", "age":"34", "pic":"img/profile.png", "father":1, "sibling":[], "spouse":4}, {"id":1, "name":"Father Name", "gender":"M", "age":"54", "pic":"img/profile.png", "child":[0, 3], "relation":"father", "spouse":2, "father":5, "sibling":[]}, {"id":2, "name":"Mother Name", "gender":"F", "age":"44", "pic":"img/profile-f.png", "relation":"spouse", "father":7}, {"id":3, "name":"S1", "gender":"M", "age":"40", "pic":"img/profile.png", "relation":"sibling"}, {"id":4, "name":"Wife", "gender":"F", "age":"40", "pic":"img/profile-f.png", "relation":"spouse"}, {"id":5, "name":"Grand Father", "gender":"M", "age":"60", "pic":"img/profile.png", "child":[1, 6], "relation":"father"}, {"id":6, "name":"asda", "gender":"F", "age":"40", "pic":"img/profile-f.png", "relation":"sibling", "spouse":8}, {"id":7, "name":"Test", "gender":"M", "age":"40", "pic":"img/profile.png", "child":[2], "relation":"father"}, {"id":8, "name":"Housband", "gender":"M", "age":"50", "pic":"img/profile.png", "relation":"spouse"}];
        $scope.initFamily = [
        {id: 0, name: "test one", gender: "M", age: "34", pic: "img/profile.png", parentId: - 1, relatoin: ""}
        ];
//        var pkFamily = null;    
        $scope.drawTree = function() {
        $timeout(function(){
        pkFamily = $('#pk-family-tree').pk_family({
        referenceVar: 'pkFamily',
                family: $scope.family,
                initFamily: $scope.initFamily,
        });
        }, 2000);
        };
        
        $scope.drawTree();
        $scope.treeSubmit = function () {
        tree = $.getFamily();
                console.log(tree);
        }

        //Organization Index
        $scope.loadData = function () {
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/organization/getorg",
                method: "GET"
            }).then(
            function (response) {
                if (response.data.success === true) {
                    _that.data = response.data.return;
                } else {
                    $scope.errorData = response.data;
                }
            })
        };
        
        $scope.loadCity = function () {
        $scope.rowCollection = [];
                $scope.maxSize = 5; // Limit number for pagination display number.  
                $scope.totalCount = 0; // Total number of items in all pages. initialize as a zero  
                $scope.pageIndex = 1; // Current page number. First page is 1.-->  
                $scope.pageSizeSelected = 5; // Maximum number of items per page.  
                $scope.sortOptions = 'city_id desc';

                $scope.getEmployeeList();
                //This method is calling from pagination number  
        };

        $scope.getEmployeeList = function () {
        $http.get($rootScope.IRISOrgServiceUrl + "/city/getcity?pageIndex=" + $scope.pageIndex + "&pageSize=" + $scope.pageSizeSelected +"&sortOptions=" +$scope.sortOptions).then(
                function (response) {
                $scope.rowCollection = response.data.totalData;
                        $scope.totalCount = response.data.totalCount;
                },
                function (err) {
                var error = err;
                });
        }
        
        $scope.sortChanged = function (a) {
            $scope.sortOptions = a;
            $scope.getEmployeeList();
        }
        
        $scope.pageChanged = function () {
            $scope.getEmployeeList();
        };
        //This method is calling from dropDown  
        $scope.changePageSize = function () {
            $scope.pageIndex = 1;
            $scope.getEmployeeList();
        };
//        var docDefinition = {
//            pageSize: {width: 4 * 72, height: 8 * 72},
//            pageOrientation: 'landscape',
////            pageMargins: [40, 160, 40, 60],
//
//            header: {text: 'Ahana', margin: 5},
//            footer: {
//                text: [
//                    {
//                        text: 'Report Genarate On : ',
//                        bold: true
//                    },
//                    '12/15/2016 12:05:11 PM'
//                ],
//                margin: 5
//            },
//            content: [
//                {
//                    style: 'demoTable',
//                    table: {
//                        headerRows: 1,
//                        widths: ['*', '*', '*', '*', '*', '*', '*', '*'],
//                        body: [
//                            [
//                                {text: 'S.No', style: 'header'},
//                                {text: 'Particulars', style: 'header'},
//                                {text: 'MFR', style: 'header'},
//                                {text: 'Batch', style: 'header'},
//                                {text: 'Expiry', style: 'header'},
//                                {text: 'Qty', style: 'header'},
//                                {text: 'Rate', style: 'header'},
//                                {text: 'Amount', style: 'header'},
//                            ],
//                            ['1', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['2', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['3', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['4', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['5', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['6', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', {text: '150.00', pageBreak: 'after'}],
//                            ['7', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['8', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['9', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['10', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['11', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', {text: '150.00', pageBreak: 'after'}],
//                            ['12', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['13', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['14', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                            ['15', 'Syp', 'RPG', '123456', '07/16', '5', '30.00', '150.00'],
//                        ]
//                    },
//                }
//            ],
//            styles: {
//                header: {
//                    bold: true,
//                    color: '#000',
//                    fontSize: 11
//                },
//                demoTable: {
//                    color: '#666',
//                    fontSize: 10
//                }
//            }
//        };

        var docDefinition = {
        pageSize: 'A5',
                pageOrientation: 'landscape',
                header: {
                text: "Ahana\nPHARMACY SERVICE - 24 HOURS",
                        margin: 5,
                        alignment: 'center'
                },
                styles: {
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
                        }
                },
                content: [
                {
                layout: 'noBorders',
                        table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                                body: [
                                [
                                {
                                colSpan: 7,
                                        layout: 'noBorders',
                                        table: {
                                        body: [
                                        [
                                        {
                                        text: 'Cash Bill',
                                                style: 'h1'
                                        }
                                        ],
                                        [
                                        {
                                        text: 'Ahana Pharmacy - Sale',
                                                style: 'normaltxt'
                                        }
                                        ],
                                        ]
                                        },
                                },
                                {}, {}, {}, {}, {}, {},
                                {
                                layout: 'noBorders',
                                        table: {
                                        body: [
                                        ['BarCode']
                                        ]
                                        },
                                }
                                ],
                                ]
                        },
                },
                {
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
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                                body: [
                                [
                                {
                                border: [false, true, false, false],
                                        colSpan: 7,
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
                                                text: 'Bill No',
                                                style: 'h2'
                                        },
                                        {
                                        text: ':',
                                                border: [false, false, false, false],
                                                style: 'h2'
                                        },
                                        {
                                        border: [false, false, false, false],
                                                text: 'SL00049',
                                                style: 'normaltxt'
                                        }
                                        ],
                                        [
                                        {
                                        border: [false, false, false, false],
                                                text: 'Patient',
                                                style: 'h2'
                                        },
                                        {
                                        text: ':',
                                                border: [false, false, false, false],
                                                style: 'h2'
                                        },
                                        {
                                        border: [false, false, false, false],
                                                text: 'Patient Name',
                                                style: 'normaltxt'
                                        }
                                        ],
                                        [
                                        {
                                        border: [false, false, false, false],
                                                text: 'Address',
                                                style: 'h2'
                                        },
                                        {
                                        text: ':',
                                                border: [false, false, false, false],
                                                style: 'h2'
                                        },
                                        {
                                        border: [false, false, false, false],
                                                text: 'Test Address',
                                                style: 'normaltxt'
                                        }
                                        ],
                                        [
                                        {
                                        border: [false, false, false, false],
                                                text: 'Doctor',
                                                style: 'h2'
                                        },
                                        {
                                        text: ':',
                                                border: [false, false, false, false],
                                                style: 'h2'
                                        },
                                        {
                                        border: [false, false, false, false],
                                                text: 'Dr Name',
                                                style: 'normaltxt'
                                        }
                                        ],
                                        ]
                                        },
                                },
                                {}, {}, {}, {}, {}, {},
                                {
                                border: [false, true, false, false],
                                        layout: 'noBorders',
                                        table: {
                                        body: [
                                        [
                                        {
                                        text: 'Date',
                                                style: 'h2'
                                        },
                                        {
                                        text: ':',
                                                style: 'h2'
                                        },
                                        {
                                        text: '2017-05-05 / 12:30 PM',
                                                style: 'normaltxt'
                                        }
                                        ],
                                        [
                                        {
                                        text: 'Reg No',
                                                style: 'h2'
                                        },
                                        {
                                        text: ':',
                                                style: 'h2'
                                        },
                                        {
                                        text: 'AH000027',
                                                style: 'normaltxt'
                                        }
                                        ],
                                        ]
                                        },
                                }
                                ],
                                ]
                        },
                },
                {
                layout: {
                hLineWidth: function (i, node) {
                return (i === 0) ? 3 : 1;
                }
                },
                        table: {
                        headerRows: 1,
                                widths: [100, 50, 50, 50, 50, 50, 50, '*'],
                                body: [
                                [
                                {
                                border: [false, true, false, true],
                                        text: 'Description',
                                        style: 'th'
                                },
                                {
                                border: [false, true, false, true],
                                        text: 'MFR',
                                        style: 'th'
                                },
                                {
                                border: [false, true, false, true],
                                        text: 'Batch',
                                        style: 'th'
                                },
                                {
                                border: [false, true, false, true],
                                        text: 'Expiry',
                                        style: 'th'
                                },
                                {
                                border: [false, true, false, true],
                                        text: 'Qty',
                                        style: 'th'
                                },
                                {
                                border: [false, true, false, true],
                                        text: 'Price',
                                        style: 'th'
                                },
                                {
                                border: [false, true, false, true],
                                        text: 'Vat%',
                                        style: 'th'
                                },
                                {
                                border: [false, true, false, true],
                                        text: 'Amount',
                                        style: 'th'
                                },
                                ],
                                [
                                {
                                border: [false, false, false, false],
                                        text: 'ABDIFER',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: 'AH002',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: 'kib12345',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '06/17',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '60',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '5.17',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '14.50',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '310.00',
                                        style: 'td'
                                },
                                ],
                                [
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: 'ABDIFER',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: 'AH002',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: 'kib12345',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '06/17',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '60',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '1.00',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '14.50',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '310.00',
                                        style: 'td'
                                },
                                ],
                                [
                                {
                                border: [false, false, false, false],
                                        text: 'ABDIFER',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: 'AH002',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: 'kib12345',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '06/17',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '60',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '5.17',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '14.50',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        text: '310.00',
                                        style: 'td'
                                },
                                ],
                                [
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: 'ABDIFER',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: 'AH002',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: 'kib12345',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '06/17',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '60',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '1.00',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '14.50',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, false],
                                        fillColor: '#eeeeee',
                                        text: '310.00',
                                        style: 'td'
                                },
                                ],
                                [
                                {
                                border: [false, false, false, true],
                                        text: 'ABDIFER',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, true],
                                        text: 'AH002',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, true],
                                        text: 'kib12345',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, true],
                                        text: '06/17',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, true],
                                        text: '60',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, true],
                                        text: '5.17',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, true],
                                        text: '14.50',
                                        style: 'td'
                                },
                                {
                                border: [false, false, false, true],
                                        text: '310.00',
                                        style: 'td'
                                },
                                ],
                                ]
                        }
                },
                {
                layout: 'noBorders',
                        table: {
                        widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
                                body: [
                                [
                                {
                                colSpan: 7,
                                        layout: 'noBorders',
                                        table: {
                                        body: [
                                        [
                                        {
                                        text: 'Billed By',
                                                style: 'h2'
                                        },
                                        {
                                        text: ':',
                                                style: 'h2'
                                        },
                                        {
                                        text: 'Name',
                                                style: 'normaltxt'
                                        },
                                        ],
                                        [
                                        {
                                        text: 'Billed At',
                                                style: 'h2'
                                        },
                                        {
                                        text: ':',
                                                style: 'h2'
                                        },
                                        {
                                        text: 'Ahana - K.K Nagar',
                                                style: 'normaltxt'
                                        },
                                        ],
                                        ]
                                        },
                                },
                                {}, {}, {}, {}, {}, {},
                                {
                                layout: 'noBorders',
                                        table: {
                                        body: [
                                        [
                                        {
                                        text: 'Total Value',
                                                style: 'h2',
                                                alignment: 'right'
                                        },
                                        {
                                        text: ':',
                                                style: 'h2'
                                        },
                                        {
                                        text: '323.20',
                                                alignment: 'right'
                                        },
                                        ],
                                        [
                                        {
                                        text: 'Round Off',
                                                style: 'h2',
                                                alignment: 'right'
                                        },
                                        {
                                        text: ':',
                                                style: 'h2'
                                        },
                                        {
                                        text: '0.20',
                                                alignment: 'right'
                                        },
                                        ],
                                        [
                                        {
                                        text: 'Grand Total',
                                                fillColor: '#000000',
                                                style: 'grandtotal',
                                                color: 'white'
                                        },
                                        {
                                        text: ':',
                                                fillColor: '#000000',
                                                style: 'grandtotal',
                                                color: 'white'
                                        },
                                        {
                                        text: 'INR 323.00',
                                                fillColor: '#000000',
                                                style: 'grandtotal',
                                                color: 'white'
                                        },
                                        ],
                                        ]
                                        },
                                }
                                ],
                                ]
                        },
                },
                ]
        }
$scope.openPdf = function () {
pdfMake.createPdf(docDefinition).open();
        };
        $scope.downloadPdf = function () {
        pdfMake.createPdf(docDefinition).download();
        };
        $scope.printPdf = function () {
        pdfMake.createPdf(docDefinition).print();
        };
}]);