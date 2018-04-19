app.controller('PrescriptionController', ['$rootScope', '$scope', '$anchorScroll', '$http', '$state', '$filter', '$modal', '$location', '$log', '$timeout', 'IO_BARCODE_TYPES', 'toaster', 'PrescriptionService', '$q', 'hotkeys', 'modalService', '$interval', function ($rootScope, $scope, $anchorScroll, $http, $state, $filter, $modal, $location, $log, $timeout, IO_BARCODE_TYPES, toaster, PrescriptionService, $q, hotkeys, modalService, $interval) {
        hotkeys.bindTo($scope)
                .add({
                    combo: 'f6',
                    description: 'Save',
                    callback: function (e) {
                        submitted = true;
                        angular.element("#save").trigger('click');
                        e.preventDefault();
                    }
                })
                .add({
                    combo: 'ctrl+p',
                    description: 'Save and Print',
                    callback: function (e) {
                        submitted = true;
                        $timeout(function () {
                            angular.element("#save_print").trigger('click');
                        }, 100);
                        e.preventDefault();
                    }
                })
                .add({
                    combo: 'f8',
                    description: 'Cancel',
                    callback: function (e) {
                        $timeout(function () {
                            angular.element("#clear").trigger('click');
                        }, 100);
                        e.preventDefault();
                    }
                })
        $scope.app.settings.patientTopBar = true;
        $scope.app.settings.patientSideMenu = true;
        $scope.app.settings.patientContentClass = 'app-content patient_content ';
        $scope.app.settings.patientFooterClass = 'app-footer';
        $scope.show_prescription_loader = false;
        $scope.today = new Date();
        $scope.globalData = {};
        $scope.globalData.freq_type = 3;
        $scope.prescription_tab = {};
        $scope.prescription_print = {};
        $scope.vitalcong = {};
        $scope.prescription_print = {};
        $scope.medical_history = 'index'
        //Start Init Variables, Objects, Arrays
        $scope.pres_status = 'current';
        $scope.enc = {};
        $scope.drugs = {};
        $scope.routes = {};
        $scope.frequencies = {};
        $scope.prescription_print_content = false;
        var secretEmptyKey = '[$empty$]'
        $scope.stateComparator = function (state, viewValue) {
            return viewValue === secretEmptyKey || ('' + state).toLowerCase().indexOf(('' + viewValue).toLowerCase()) > -1;
        };
        //Expand table in Index page
        $scope.ctrl = {};
        $scope.ctrl.expandAll = function (expanded) {
            $scope.$broadcast('onExpandAll', {expanded: expanded});
        };
        Array.prototype.max = function () {
            return Math.max.apply(null, this);
        };
        Array.prototype.min = function () {
            return Math.min.apply(null, this);
        };
        $scope.openTabsetting = function (size, ctrlr, tmpl, update_col) {
            var modalInstance = $modal.open({
                templateUrl: tmpl,
                controller: ctrlr,
                size: size,
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                    column: function () {
                        return update_col;
                    },
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        //Start Watch Functions
        $scope.$watch('patientObj.patient_id', function (newValue, oldValue) {
            $scope.spinnerbar('show');
            if (typeof newValue !== 'undefined' && newValue != '') {
                $rootScope.commonService.GetEncounterListByPatient($scope.app.logged_tenant_id, '0,1', false, $scope.patientObj.patient_id, function (response) {
                    angular.forEach(response, function (resp) {
                        resp.encounter_id = resp.encounter_id.toString();
                    });
                    $scope.encounters = response;
                    if (response.length > 0) {
                        $scope.enc.selected = $scope.encounters[0];
                        if ($scope.encounters[0].encounter_type == 'IP') {
                            $scope.data.consultant_id = $scope.encounters[0].liveAdmission.consultant_id;
                        } else if ($scope.encounters[0].encounter_type == 'OP') {
                            $scope.data.consultant_id = $scope.encounters[0].liveAppointmentBooking.consultant_id;
                        }
                        //Get all active encounter
                        $scope.data.encounter_id = $scope.enc.selected.encounter_id;
                        $scope.default_encounter_id = $scope.data.encounter_id;
                        $rootScope.commonService.GetEncounterListByPatient('', '1', false, $scope.patientObj.patient_id, function (response) {
                            $scope.all_encounters = response;
                        }, 'encounter_details');
                        //var actEnc = $filter('filter')($scope.encounters, {status: '1'});
                        //$scope.all_encounters = actEnc;
                        $scope.spinnerbar('hide')
                    }
                    //$scope.loadPrevPrescriptionsList();
                    $scope.getConsultantFreq();
                    $scope.checkVitalaccess();
                }, 'prescription', '', '', '1');
            }
        }, true);
        $scope.$watch('enc.selected.encounter_id', function (newValue, oldValue) {
            $scope.spinnerbar('show');
            if (newValue != '' && typeof newValue != 'undefined') {
                //$scope.spinnerbar('hide');
                PrescriptionService.setPatientId($scope.patientObj.patient_id);
//                $scope.loadPrevPrescriptionsList();
//                $scope.getConsultantFreq();
//                $scope.checkVitalaccess();
                //$scope.loadSideMenu();
                $scope.$emit('encounter_id', newValue);
            }
        }, true);
        $timeout(function () {
            $scope.$watchGroup(['data.number_of_days', 'data.next_visit', 'data.consultant_id'], function (newValue, oldValue) {
                if (newValue != '' && typeof newValue != 'undefined' && newValue != oldValue) {
                    mainprescriptionItems = {
                        numberofdays: $scope.data.number_of_days,
                        nextVisit: $scope.data.next_visit,
                        consultantId: $scope.data.consultant_id
                    };
                    PrescriptionService.addPrescriptionmainItem(mainprescriptionItems);
                }
            }, true);
        }, 7000);
        $scope.$watch('data.number_of_days', function (newValue, oldValue) {
            if (newValue != '' && typeof newValue != 'undefined' && newValue != oldValue) {
                $scope.getVisit();
            }
        }, true);
        //Always Form visible
        $scope.$watch('tableform.$visible', function () {
            $scope.tableform.$show();
        });
        //Stop Watch Functions

        $scope.open = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
        $scope.checkVitalaccess = function () {
            $scope.vital_enable_count = true;
            patient_type = $scope.patientObj.encounter_type;
            url = $rootScope.IRISOrgServiceUrl + '/patientvitals/checkvitalaccess?addtfields=pres_configuration&patient_type=' + patient_type;
            $http.get(url)
                    .success(function (vitals) {
                        angular.forEach(vitals, function (row) {
                            var listName = row.code;
                            listName = listName.replace(/ /g, "_"); //Space replace to '_' like pain score convert to pain_score
                            $scope.vitalcong[listName] = row.value;
                            if (row.value == 1)
                                $scope.vital_enable_count = false;
                        });
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patientvital!";
                    });
        }

        $scope.clearPrescription = function () {
//            $scope.data.consultant_id = '';
            $scope.prescription = '';
            $scope.data.prescriptionItems = [];
            PrescriptionService.deleteAllPrescriptionItem();
        };
        $scope.priceTotal = function () {
            total = 0;
            angular.forEach($scope.data.prescriptionItems, function (item) {
                total = total + parseFloat(item.total);
            });
            return total;
        }

        $scope.checkTextboxAction = function (days, item, key, tableform) {
            if ((typeof days != '') && (days != 0)) {
                $scope.data.prescriptionItems[key].manual_textbox = true;
            } else
                $scope.data.prescriptionItems[key].manual_textbox = false;
        }

        $scope.numberDaysChange = function (days, item, key, tableform) {
            if (typeof days != 'undefined') {
//                $scope.data.prescriptionItems[key].frequency = $('#freq_' + key + '_' + item.freqType + ' input').val();
                $scope.data.prescriptionItems[key].frequency = item.frequency;
                $scope.data.prescriptionItems[key].number_of_days = days;
                $scope.data.prescriptionItems[key].qty = $scope.calculate_qty($scope.data.prescriptionItems[key].frequency, days, item.product_description_id, item.description_name);
                $scope.data.prescriptionItems[key].total = $scope.calculate_price($scope.data.prescriptionItems[key].qty, item.price);
                $scope.data.prescriptionItems[key].in_stock = (parseInt(item.available_quantity) >= parseInt($scope.data.prescriptionItems[key].qty));
            } else {
                $scope.data.prescriptionItems[key].number_of_days = '';
            }

//            if (days == 0) {
//                $scope.data.prescriptionItems[key].available_quantity = 0;
//            }

//Number of days update in the editable form 
            angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'number_of_days') {
                    editableValue.scope.$data = $scope.data.prescriptionItems[key].number_of_days;
                }
            });
            //Qty update in the editable form 
            angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'qty') {
                    editableValue.scope.$data = $scope.data.prescriptionItems[key].qty;
                }
            });

            //Bc-179 Dropdown - Qty 
            angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'product_id') {
                    var options = editableValue.inputEl[0].childNodes;
                    angular.forEach(options, function (optionValue, optionKey) {
                        if (parseFloat(optionValue.dataset.availablequantity) < parseFloat($scope.data.prescriptionItems[key].qty))
                            optionValue.className = 'out-of-stock';
                        else
                            optionValue.className = 'in-stock';
                    });
                }
            });
        };
        $scope.qtyChange = function (qty, item, key, tableform) {
            if (typeof qty != 'undefined') {
                $scope.data.prescriptionItems[key].total = $scope.calculate_price(qty, item.price);
                $scope.data.prescriptionItems[key].in_stock = (parseInt(item.available_quantity) >= parseInt(qty));
            }

            //Bc-179 Dropdown - Qty 
            angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'product_id') {
                    var options = editableValue.inputEl[0].childNodes;
                    angular.forEach(options, function (optionValue, optionKey) {
                        if (parseFloat(optionValue.dataset.availablequantity) < parseFloat(qty))
                            optionValue.className = 'out-of-stock';
                        else
                            optionValue.className = 'in-stock';
                    });
                }
            });
        };

        $scope.getFav = function () {
            $http.get($rootScope.IRISOrgServiceUrl + '/patientprescriptionfavourite/getpatientprescriptionfavourite?patient_id=' + $state.params.id)
                    .success(function (favourites) {
                        $scope.child.favourites = favourites.result;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patientvitals!";
                    });
        }

//For Form
        $scope.initForm = function () {
            $scope.loadPrevPrescriptionsList();
            $scope.getFav();
            if (localStorage.getItem("Show_available_medicine") === null) {
                $scope.available_medicine = '0';
                localStorage.setItem("Show_available_medicine", '0');
            } else {
                var available = localStorage.getItem("Show_available_medicine");
                if (available == 1)
                    $scope.available_medicine = '1';
                else
                    $scope.available_medicine = '0';
            }
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacydrugclass?addtfields=prescription_drug&page_action=branch_pharmacy')
                    .success(function (response) {
                        $scope.drugs = response;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading drugclass!";
                    });
            $http.get($rootScope.IRISOrgServiceUrl + '/appconfiguration/getpresstatusbycode?code=CSP&addtfields=pres_configuration')
                    .success(function (response) {
                        $scope.presc_stock_status = response.value;
                    })

            $http.get($rootScope.IRISOrgServiceUrl + '/appconfiguration/getpresstatusbygroup?group=prescription_tab&addtfields=pres_configuration')
                    .success(function (response) {
                        angular.forEach(response, function (row) {
                            var listName = row.code;
                            $scope.prescription_tab[listName] = row.value;
                        });
                    })

            $http.get($rootScope.IRISOrgServiceUrl + '/appconfiguration/getpresstatusbygroup?group=prescription_print&addtfields=pres_configuration')
                    .success(function (response) {
                        angular.forEach(response, function (row) {
                            var listName = row.code;
                            $scope.prescription_print[listName] = row.value;
                        });
                    })

//            $http.get($rootScope.IRISOrgServiceUrl + '/appconfiguration/getpresstatus?key=ALLERGIES')
//                    .success(function (response) {
//                        $scope.print_allergies = response.value;
//                    })
//
//            $http.get($rootScope.IRISOrgServiceUrl + '/appconfiguration/getpresstatus?key=Prescription Footer')
//                    .success(function (response) {
//                        $scope.print_prescription_footer = response.value;
//                    })
//
//            $http.get($rootScope.IRISOrgServiceUrl + '/appconfiguration/getpresstatus?key=DIAGNOSIS')
//                    .success(function (response) {
//                        $scope.print_diagnosis = response.value;
//                    })

            $http.get($rootScope.IRISOrgServiceUrl + '/genericname?addtfields=prescription_generic&page_action=branch_pharmacy')
                    .success(function (response) {
                        $scope.allgenerics = response;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading generics!";
                    });
            $rootScope.commonService.GetDoctorList('', '1', false, '1', function (response) {
                $scope.doctors = response.doctorsList;
            }, 'prescription_doctor');
//            $rootScope.commonService.GetDiagnosisList(function (response) {
//                  $scope.diagnosis =response.diagnosisList
//            });
//            $rootScope.commonService.GetPatientRoute('', '1', false, function (response) {
//                $scope.routes = response.routelist;
//            });
//            $rootScope.commonService.GetPatientFrequency('', '1', false, function (response) {
//                $scope.frequencies = response.frequencylist;
//            });
            //$scope.data.next_visit = moment().format('YYYY-MM-DD');
            //$scope.getDays();
            $scope.globalData.frequency_3_0 = '0';
            $scope.globalData.frequency_3_1 = '0';
            $scope.globalData.frequency_3_2 = '0';
            $("#current_prescription").focus();
            $rootScope.commonService.GetDay(function (response) {
                $scope.days = response;
            });
            $rootScope.commonService.GetMonth(function (response) {
                $scope.months = response;
            });
            $rootScope.commonService.GetYear(function (response) {
                $scope.years = response;
            });
        }

        var canceler;
        $scope.getdiagnosis = function (diagonsis) {
            if (canceler)
                canceler.resolve();
            canceler = $q.defer();
            $scope.show_patient_loader = true;
            return $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/patientprescription/getdiagnosis?page_action=branch_pharmacy&diag_description=' + diagonsis,
                timeout: canceler.promise,
            }).then(
                    function (response) {
                        $scope.data.diag_id = '';
                        $scope.Diag = [];
                        $scope.Diag = response.data;
                        $scope.loadbar('hide');
                        $scope.show_patient_loader = false;
                        return $scope.Diag;
                    }
            );
        }

        $scope.checkAvailable = function (a) {
            localStorage.setItem("Show_available_medicine", a);
            if (a == '1') {
                $scope.commonCheckAvailable();
            } else {
                $scope.spinnerbar('show');
                PrescriptionService.deleteAllPrescriptionItem();
                angular.forEach($scope.data.prescriptionItems, function (item, key) {
                    items = {
                        'product_id': item.product_id,
                        'product_name': item.product_name,
                        'generic_id': item.generic_id,
                        'generic_name': item.generic_name,
                        'drug_class_id': item.drug_class_id,
                        'drug_name': item.drug_name,
                        'manual_textbox': false,
                        'route': item.route,
                        'frequency': item.frequency,
                        'number_of_days': 0,
                        'food_type': item.food_type,
                        'is_favourite': item.is_favourite,
                        'route_id': item.route_id,
                        'description_routes': item.description_routes,
                        'presc_date': moment().format('YYYY-MM-DD HH:mm:ss'),
                        'price': item.price,
                        'total': item.total,
                        'freqMask': item.freqMask,
                        'freqMaskCount': item.freqMaskCount,
                        'available_quantity': item.available_quantity,
                        'item_key': key,
                        'all_products': item.all_available_medicine,
                        'qty': item.qty,
                        'product_description_id': item.product_description_id,
                        'description_name': item.description_name,
                        'in_stock': item.in_stock,
                        'freqType': item.freqType,
                    };
                    PrescriptionService.addPrescriptionItem(items);
                });
                $timeout(function () {
                    $scope.data.prescriptionItems = PrescriptionService.getPrescriptionItems();
                }, 1000);
                $timeout(function () {
                    $scope.showOrhideFrequency();
                }, 2000);
                $timeout(function () {
                    $scope.spinnerbar('hide');
                }, 3000);
            }
        }

        $scope.commonCheckAvailable = function () {
            var check_available = localStorage.getItem("Show_available_medicine");
            if (check_available == '1') {
                angular.forEach($scope.data.prescriptionItems, function (item, key) {
                    if (!$scope.data.prescriptionItems[key].all_available_medicine) {
                        $scope.data.prescriptionItems[key].all_available_medicine = $scope.data.prescriptionItems[key].all_products;
                    }
                    $scope.data.prescriptionItems[key].all_products = $filter('filter')($scope.data.prescriptionItems[key].all_products, {availableQuantity: '!0'});
                });
            }
        }

        $scope.setDiagid = function ($item) {
            $scope.data.diag_id = $item.diag_id;
        }

        $scope.diagname_desc = function (Diag) {
            if (Diag == null || Diag == undefined)
                return;
            var label = Diag.diag_name + " " + Diag.diag_description;
            return label;
        }

        $scope.generics = [];
        $scope.products = [];
        $scope.getGeneric = function ($item, $model, $label) {
//            &full_name_with_stock=1
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getgenericlistbydrugclass?drug_class_id=' + $item.drug_class_id + '&addtfields=presc_search&page_action=branch_pharmacy')
                    .success(function (response) {
                        $scope.generics = response.genericList;
                        $scope.products = $scope.allproducts = response.productList;
                    }, function (x) {
                        $scope.errorData = "An Error has occured while loading generic!";
                    });
        }

        $scope.getDrugProduct = function ($item, $model, $label) {
//            &full_name_with_stock=1
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getdrugproductbygeneric?generic_id=' + $item.generic_id + '&addtfields=presc_search&page_action=branch_pharmacy')
                    .success(function (response) {
                        $scope.addData = {};
                        $scope.addData = {
                            drug_class: response.drug,
                            generic: $item,
                        };
                        $scope.products = $scope.allproducts = response.productList;
                    }, function (x) {
                        $scope.errorData = "An Error has occured while loading generic!";
                    });
        }

        $scope.getRelatedProducts = function (generic_id) {
            var deferred = $q.defer();
            deferred.notify();
            $scope.errorData = "";
//            &full_name_with_stock=1
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getproductlistbygeneric?generic_id=' + generic_id + '&addtfields=presc_search&page_action=branch_pharmacy')
                    .success(function (response) {
                        $scope.products = $scope.allproducts = response.productList;
                        deferred.resolve();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading related products!";
                        deferred.reject();
                    });
            return deferred.promise;
        }

        $scope.watchDrug = function (search_form, selector) {
            if (search_form) {
                if (selector.addData.drug_class == '') {
                    $scope.reset();
                }
            }
        }

        $scope.reset = function () {
            $('#advanceSearchForm')[0].reset();
            $scope.addData = {};
            $scope.generics = [];
            $scope.products = [];
            $scope.routes = {};
        }

        $scope.afterdrugAdded = function (drug, generic, product) {
            $scope.pres_drug = [];
            $scope.generics = [];
            $scope.products = [];
            $scope.addData = {};
            $scope.addData.drug_class = drug;
            //reupdate master products
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct?fields=product_id,full_name,generic_id&page_action=branch_pharmacy')
                    .success(function (products) {
                        $scope.all_products = products;
                    });
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getgenericlistbydrugclass?drug_class_id=' + drug.drug_class_id + '&addtfields=presc_search&page_action=branch_pharmacy&page_action=branch_pharmacy')
                    .success(function (response) {
                        $scope.generics = response.genericList;
                        //Set generic_id in dropdown list
                        selected = $filter('filter')($scope.generics, {generic_id: generic});
                        var index = $scope.generics.indexOf(selected[0]);
                        $scope.addData.generic = $scope.generics[index];
                        //Set product_id in dropdown list
                        $scope.products = $scope.allproducts = response.productList;
                        selectedProduct = $filter('filter')($scope.products, {product_id: product});
                        var index = $scope.products.indexOf(selectedProduct[0]);
                        $scope.addData.product = $scope.products[index];
                        $scope.setGeneric();
                        $scope.getRoutes(false, null, null);
                        $("#search_presc_dropdown").trigger("click");
                        angular.element(document.querySelectorAll("#frequency_3_0")).focus();
                    }, function (x) {
                        $scope.errorData = "An Error has occured while loading generic!";
                    });
        }

        $scope.setGeneric = function () {
            result = $filter('filter')($scope.generics, {generic_id: $scope.addData.product.generic_id});
            if (result.length > 0)
                $scope.addData.generic = result[0];
        }

        $scope.setProductId = function ($data, key, tableform) {
            result = $filter('filter')($scope.data.prescriptionItems[key].all_products, {product_id: $data});
            if (result.length > 0) {
                qty_count = $scope.calculate_qty($scope.data.prescriptionItems[key].frequency, $scope.data.prescriptionItems[key].number_of_days, result[0].product_description_id, result[0].description_name);
                //hide by nad
//                if (qty_count > 0) {
                $scope.data.prescriptionItems[key].product_id = result[0].product_id;
                $scope.data.prescriptionItems[key].product_name = result[0].full_name;
                $scope.data.prescriptionItems[key].description_routes = [];
                $scope.data.prescriptionItems[key].description_routes = result[0].description_routes;
                $scope.data.prescriptionItems[key].available_quantity = result[0].availableQuantity;
                $scope.data.prescriptionItems[key].in_stock = (parseInt(result[0].availableQuantity) >= parseInt(qty_count));
                $scope.data.prescriptionItems[key].price = result[0].latest_price;
                $scope.data.prescriptionItems[key].product_description_id = result[0].product_description_id;
                $scope.data.prescriptionItems[key].description_name = result[0].description_name;
                $scope.data.prescriptionItems[key].qty = qty_count;
                $scope.data.prescriptionItems[key].total = $scope.calculate_price(qty_count, result[0].latest_price);
                angular.forEach(tableform.$editables, function (editableValue, editableKey) {
                    if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'qty') {
                        editableValue.scope.$data = $scope.data.prescriptionItems[key].qty;
                    }
                });
//                }
            }
        }

        $scope.setRouteId = function ($data, key) {
            result = $filter('filter')($scope.data.prescriptionItems[key].description_routes, {route_name: $data});
            if (result.length > 0) {
                $scope.data.prescriptionItems[key].route_id = result[0].route_id;
            }
        }

        $scope.showProduct = function (item) {
            var selected = [];
            if (item.product_id) {
                selected = $filter('filter')($scope.all_products, {product_id: item.product_id});
            }
            return selected.length ? selected[0].full_name : 'Not set';
        }

        $scope.showRoute = function (item) {
            var selected = [];
            if (item.route_id) {
                selected = $filter('filter')($scope.all_products, {product_id: item.product_id});
            }
            return selected.length ? selected[0].full_name : 'Not set';
        }

        $scope.getProduct = function ($item, $model, $label) {
            if (!$item)
                $item = $scope.addData.generic;
            result = $filter('filter')($scope.allproducts, {generic_id: $item.generic_id});
            if (result.length > 0)
                $scope.products = result;
//            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getproductlistbygeneric?generic_id=' + $item.generic_id)
//                    .success(function (response) {
//                        $scope.products = response.productList;
//                    }, function (x) {
//                        $scope.errorData = "An Error has occured while loading generic!";
//                    });
        }

        $scope.getRoutes = function ($item, $model, $label) {
            if (!$item)
                $item = $scope.addData.product;
            $scope.routes = $item.description_routes;
        }

        $scope.data = {};
        $scope.data.prescriptionItems = [];
        $scope.addForm = function () {
            $scope.searchForm.DrugClass.$setValidity('required', true);
            if ($scope.searchForm.$valid) {
                var result = $filter('filter')($scope.data.prescriptionItems, {product_id: $scope.addData.product.product_id}, true);
                if (result.length > 0) {
                    alert('This Product already added');
                } else {
                    if (!angular.isObject($scope.addData.drug_class)) {
                        $scope.searchForm.DrugClass.$setValidity('required', false);
                        return false;
                    } else {
                        $scope.searchForm.DrugClass.$setValidity('required', true);
                    }

                    $scope.addData.frequency = $scope.addData.frequency_3_0 + '-' + $scope.addData.frequency_3_1 + '-' + $scope.addData.frequency_3_2;
                    qty_count = $scope.calculate_qty($scope.addData.frequency, $scope.addData.number_of_days, $scope.addData.product.product_description_id, $scope.addData.product.description_name);
                    if (qty_count > 0) {
                        items = {
                            'product_id': $scope.addData.product.product_id,
                            'product_name': $scope.addData.product.full_name,
                            'generic_id': $scope.addData.generic.generic_id,
                            'generic_name': $scope.addData.generic.generic_name,
                            'drug_class_id': $scope.addData.drug_class.drug_class_id,
                            'drug_name': $scope.addData.drug_class.drug_name,
                            'manual_textbox': false,
                            'route_id': $scope.addData.route.route_id,
                            'route': $scope.addData.route.route_name,
                            'frequency': $scope.addData.frequency,
                            'number_of_days': $scope.addData.number_of_days,
                            'is_favourite': 0,
                            'food_type': 'NA',
                            'description_routes': $scope.addData.product.description_routes,
                            'presc_date': moment().format('YYYY-MM-DD HH:mm:ss'),
                            'price': $scope.addData.product.latest_price,
                            'total': $scope.calculate_price(qty_count, $scope.addData.product.latest_price),
                            'freqMask': '9-9-9-9',
                            'freqMaskCount': 4,
                            'available_quantity': $scope.addData.product.availableQuantity,
                            'item_key': $scope.data.prescriptionItems.length,
                            'all_products': $scope.products,
                            'qty': qty_count,
                            'product_description_id': $scope.addData.product.product_description_id,
                            'description_name': $scope.addData.product.description_name,
                            'in_stock': (parseInt($scope.addData.product.availableQuantity) >= parseInt(qty_count)),
                            'freqType': '3'
                        };
                        var fav = $filter('filter')($scope.child.favourites, {product_id: $scope.addData.product.product_id});
                        if (fav.length > 0) {
                            angular.extend(items, {is_favourite: 1});
                        }

                        PrescriptionService.addPrescriptionItem(items);
                        //Delay For Trigger Frequency click event
                        $timeout(function () {
                            $scope.data.prescriptionItems = PrescriptionService.getPrescriptionItems();
                        }, 1000);
                        $timeout(function () {
                            $scope.showOrhideFrequency();
                            $scope.commonCheckAvailable();
                        }, 2000);
                        $scope.addData = {};
                        $scope.reset();
                        $timeout(function () {
                            $("#search-form-div").removeClass('open');
                            $scope.setFocus('number_of_days', $scope.data.prescriptionItems.length - 1);
                        });
                    }
                }
            }
        }

        $scope.addToPrescriptionList = function (value) {
            $scope.getRelatedProducts(value.generic_id).then(function () {
                qty_count = $scope.calculate_qty(value.frequency_name, value.number_of_days, value.product.product_description_id, value.product.description_name);
                var no_of_days = $scope.data.number_of_days;
                if (!$scope.data.number_of_days) {
                    var no_of_days = 0;
                }
                if (value.food_type) {
                    var food_type = value.food_type;
                } else {
                    var food_type = 'NA';
                }
                items = {
                    'product_id': value.product_id,
                    'product_name': value.product.full_name,
                    'generic_id': value.generic_id,
                    'generic_name': value.generic_name,
                    'drug_class_id': value.drug_class_id,
                    'drug_name': value.drug_name,
                    'manual_textbox': false,
                    'route': value.route_name,
                    'frequency': value.frequency_name,
                    'number_of_days': no_of_days,
                    'is_favourite': 0,
                    'food_type': food_type,
                    'route_id': value.route_id,
                    'description_routes': value.product.description_routes,
                    'presc_date': moment().format('YYYY-MM-DD HH:mm:ss'),
                    'price': value.product.latest_price,
                    'total': $scope.calculate_price(qty_count, value.product.latest_price),
                    'freqMask': '9-9-9-9',
                    'freqMaskCount': 4,
                    'available_quantity': value.product.availableQuantity,
                    'item_key': $scope.data.prescriptionItems.length,
                    'all_products': $scope.products,
                    'qty': qty_count,
                    'product_description_id': value.product.product_description_id,
                    'description_name': value.product.description_name,
                    'in_stock': (parseInt(value.product.availableQuantity) >= parseInt(qty_count)),
                    'freqType': value.freqType
                };
                var fav = $filter('filter')($scope.child.favourites, {product_id: value.product_id});
                if (fav && fav.length > 0) {
                    angular.extend(items, {is_favourite: 1});
                }
                //In Master table product, changed geneic and drug glass remove the product   
                var chkProduct = $filter('filter')(items.all_products, {product_id: items.product_id}, true);
                if (chkProduct.length != 0) {
                    PrescriptionService.addPrescriptionItem(items);
                }
            });
        }
        $scope.addToCurrentPrescription = function () {
            if ($scope.previousPresSelected > 0) {
                var loop_total = $scope.previousPresSelectedItems.length;
                var loop_start = 0;
                angular.forEach($scope.previousPresSelectedItems, function (value, key) {
                    var result = $filter('filter')($scope.data.prescriptionItems, {product_id: value.product_id, route_id: value.route_id});
                    if (result.length == 0) {
                        $scope.addToPrescriptionList(value);
                    }

                    loop_start = parseFloat(loop_start) + parseFloat(1);
                    if (loop_total == loop_start) {
                        $timeout(function () {
                            $scope.data.prescriptionItems = PrescriptionService.getPrescriptionItems();
                        }, 1000);
                        $timeout(function () {
                            $scope.showOrhideFrequency();
                            $scope.commonCheckAvailable();
                        }, 2000);
                    }
                });
                $scope.pres_status = 'current';
                $("#current_prescription").focus();
                //toaster.clear();
                //toaster.pop('success', '', 'Medicine has been added to the current prescription');
                $scope.msg.successMessage = "Medicine has been added to the current prescription";
            }
        }

        $scope.addToReprescribe = function () {
            PrescriptionService.deleteAllPrescriptionItem();
            if ($scope.represcribeSelected > 0) {
                var loop_total = $scope.represcribeSelectedItems.length;
                var loop_start = 0;
                angular.forEach($scope.represcribeSelectedItems, function (value, key) {
                    $scope.addToPrescriptionList(value);
                    loop_start = parseFloat(loop_start) + parseFloat(1);
                    if (loop_total == loop_start) {
                        $timeout(function () {
                            $scope.data.prescriptionItems = PrescriptionService.getPrescriptionItems();
                        }, 1000);
                        $timeout(function () {
                            $scope.showOrhideFrequency();
                            $scope.commonCheckAvailable();
                        }, 2000);
                    }
                });
                $scope.pres_status = 'current';
                $("#current_prescription").focus();
                //toaster.clear();
                //toaster.pop('success', '', 'Medicine has been added to the represcribe');
                $scope.msg.successMessage = "Medicine has been added to the represcribe";
            }
        }

        $scope.addGlobalSearch = function (prescription) {
            var result = $filter('filter')($scope.data.prescriptionItems, {product_id: parseInt(prescription.product_id)}, true);
            if (result.length > 0) {
                alert('This Product already added');
                $scope.prescription_lists = {};
                $scope.lastSelected = {};
                $scope.prescription = '';
            } else {
                var fav = $filter('filter')($scope.child.favourites, {product_id: prescription.product_id});
                if (fav.length > 0) {
                    angular.extend(prescription, {is_favourite: 1});
                }

                var fiter = $filter('filter')($scope.all_products, {product_id: parseInt(prescription.product_id)}, true);
                var product = fiter[0];
                var Fields = 'full_name,description_routes,latest_price,availableQuantity,product_description_id,description_name';
//                + '&full_name_with_stock=1'
                $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproducts/' + product.product_id + '?page_action=branch_pharmacy&fields=' + Fields)
                        .success(function (product) {
                            $scope.getRelatedProducts(prescription.generic_id).then(function () {
                                qty_count = $scope.calculate_qty(prescription.frequency, 1, product.product_description_id, product.description_name);
                                if (qty_count > 0) {
                                    var no_of_days = $scope.data.number_of_days;
                                    if (!$scope.data.number_of_days) {
                                        var no_of_days = 0;
                                    }
                                    if (typeof prescription.route != 'undefined' && prescription.route != '') {
                                        route = prescription.route;
                                    } else {
                                        route = '';
                                        if (product.description_routes.length > 0)
                                            route = product.description_routes[0].route_name;
                                    }
                                    if (typeof prescription.frequency == 'undefined')
                                        prescription.frequency = '0-0-0';
                                    items = {
                                        'product_id': prescription.product_id,
                                        'product_name': product.full_name,
                                        'generic_id': parseInt(prescription.generic_id),
                                        'generic_name': prescription.generic_name,
                                        'drug_class_id': prescription.drug_class_id,
                                        'drug_name': prescription.drug_name,
                                        'manual_textbox': false,
                                        'route': route,
                                        'frequency': prescription.frequency,
                                        'number_of_days': no_of_days,
                                        'food_type': 'NA',
                                        'is_favourite': prescription.is_favourite,
                                        'route_id': prescription.route_id,
                                        'description_routes': product.description_routes,
                                        'presc_date': moment().format('YYYY-MM-DD HH:mm:ss'),
                                        'price': product.latest_price,
                                        'total': $scope.calculate_price(qty_count, product.latest_price),
                                        'freqMask': '9-9-9-9',
                                        'freqMaskCount': 4,
                                        'available_quantity': product.availableQuantity,
                                        'item_key': $scope.data.prescriptionItems.length,
                                        'all_products': $scope.products,
                                        'qty': qty_count,
                                        'product_description_id': product.product_description_id,
                                        'description_name': product.description_name,
                                        'in_stock': (parseInt(product.availableQuantity) >= parseInt(qty_count)),
                                        'freqType': '3',
                                    };
                                    //Multiple entries created, Check duplicate once again 
                                    var chkDuplicate = $filter('filter')($scope.data.prescriptionItems, {product_id: items.product_id}, true);
                                    if (chkDuplicate.length == 0) {
                                        PrescriptionService.addPrescriptionItem(items);
                                    }

                                    $scope.data.prescriptionItems = PrescriptionService.getPrescriptionItems();
                                    $timeout(function () {
                                        $("#prescriptioncont-header.search-patientcont-header").hide();
                                        if (!prescription.hasOwnProperty('route')) {
                                            $scope.setFocus('route', $scope.data.prescriptionItems.length - 1);
                                        } else if (!prescription.hasOwnProperty('frequency')) {
                                            $scope.setFocus('frequency', $scope.data.prescriptionItems.length - 1);
                                        } else {
                                            $scope.setFocus('number_of_days', $scope.data.prescriptionItems.length - 1);
                                        }

                                        if (typeof prescription.frequency != 'undefined')
                                            $scope.showOrhideFrequency();
                                    });
                                    $scope.prescription_lists = {};
                                    $scope.lastSelected = {};
                                    $scope.prescription = '';
                                }
                            });
                        });
            }
        }

        $scope.showOrhideFrequency = function () {
            angular.forEach($scope.data.prescriptionItems, function (item, key) {
                if (typeof item.frequency != 'undefined') {
                    $scope.curPrescFreqSele(item.frequency, item.freqType, item, key);
//                    var len = item.frequency.length;
//                    if (len == 5) {
//                        $('#change_mask_' + key + '_3').trigger('click');
//                    } else if (len == 7) {
//                        $('#change_mask_' + key + '_4').trigger('click');
//                    } else if (len == 9) {
//                        $('#change_mask_' + key + '_5').trigger('click');
//                    }
                }
            });
            var dropdownMenu;
            $('body').on('show.bs.dropdown', '.dropdown', function (e) {
// grab the menu        
                dropdownMenu = $(e.target).find('ul.dropdown-menu.curPrescFreq');
                // detach it and append it to the body
                $('body').append(dropdownMenu.detach());
                // grab the new offset position
                var eOffset = $(e.target).offset();
                // make sure to place it where it would normally go (this could be improved)
                dropdownMenu.css({
                    'display': 'block',
                    'top': eOffset.top + $(e.target).outerHeight(),
                    'left': eOffset.left - 133.5
                });
            });
            $('body').on('hide.bs.dropdown', '.dropdown', function (e) {
                $(e.target).append(dropdownMenu.detach());
                dropdownMenu.hide();
            });
        }

//Get the value from main.js
        $scope.$on('presc_fav', function (event, args) {
            var result = $filter('filter')($scope.data.prescriptionItems, {product_id: args.product_id});
            if (result.length > 0) {
                alert('This Product already added');
            } else {
                $scope.getRelatedProducts(args.generic_id).then(function () {
                    items = {
                        'product_id': args.product_id,
                        'product_name': args.product_name,
                        'generic_id': args.generic_id,
                        'generic_name': args.generic_name,
                        'drug_class_id': args.drug_class_id,
                        'drug_name': args.drug_name,
                        'manual_textbox': false,
                        'route_id': '',
                        'route': '',
                        'frequency': '',
                        'number_of_days': 0,
                        'is_favourite': 1,
                        'description_routes': args.description_routes,
                        'presc_date': moment().format('YYYY-MM-DD HH:mm:ss'),
                        'price': args.product_price,
                        'total': 0,
                        'freqMask': '9-9-9-9',
                        'freqMaskCount': 4,
                        'available_quantity': args.availableQuantity,
                        'item_key': $scope.data.prescriptionItems.length,
                        'all_products': $scope.products,
                        'qty': 1,
                    };
                    $scope.data.prescriptionItems.push(items);
                    $timeout(function () {
                        $scope.setFocus('route', $scope.data.prescriptionItems.length - 1);
                    });
                    //toaster.clear();
                    //toaster.pop('success', 'Favourite', 'Medicine has been added to the current prescription');
                    $scope.msg.successMessage = "Medicine has been added to the current prescription";
                });
            }
        });
        $scope.setFocus = function (id, index) {
            angular.element(document.querySelectorAll("#" + id))[index].focus();
        };
        $scope.updateFavourite = function (val, id) {
            angular.forEach($scope.data.prescriptionItems, function (item, key) {
                if (item.product_id == id) {
                    item.is_favourite = val;
                }
            });
        }

        $scope.minDate = $scope.minDate ? null : new Date();
        $scope.concatFrequency = function (item, freqType) {
            if (freqType == 3) {
                return item.frequency_3_0 + '-' + item.frequency_3_1 + '-' + item.frequency_3_2;
            } else if (freqType == 4) {
                return item.frequency_4_0 + '-' + item.frequency_4_1 + '-' + item.frequency_4_2 + '-' + item.frequency_4_3;
            } else {
                return item.frequency
            }
        }

        $scope.saveForm = function () {
            _that = this;
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            post_url = $rootScope.IRISOrgServiceUrl + '/patientprescription/saveprescription';
            method = 'POST';
            succ_msg = 'Prescription saved successfully';
            if ($scope.data.next_visit)
                $scope.data.next_visit = moment($scope.data.next_visit).format('YYYY-MM-DD');
            if (!$scope.data.diag_id)
                $scope.data.diag_text = $scope.diagnosis;
            angular.extend($scope.data, {
//                encounter_id: $scope.enc.selected.encounter_id,
                patient_id: $scope.patientObj.patient_id,
                pres_date: _that.data.prescriptionItems[0].presc_date,
            });
            angular.forEach(_that.data.prescriptionItems, function (prescriptionItem, key) {
                if (angular.isObject(prescriptionItem.product_name)) {
                    _that.data.prescriptionItems[key].product_name = prescriptionItem.product_name.full_name;
                } else if (typeof prescriptionItem.product_name == 'undefined') {
                    _that.data.prescriptionItems[key].product_name = '';
                }

                _that.data.prescriptionItems[key].frequency = $scope.concatFrequency(prescriptionItem, _that.data.prescriptionItems[key].freqType);
                //qty_count = $scope.calculate_qty(_that.data.prescriptionItems[key].frequency, prescriptionItem.number_of_days, prescriptionItem.product_description_id, prescriptionItem.description_name);
                qty_count = prescriptionItem.qty;
                _that.data.prescriptionItems[key].quantity = qty_count;
                _that.data.prescriptionItems[key].total = $scope.calculate_price(qty_count, prescriptionItem.price);
                _that.data.prescriptionItems[key].in_stock = (parseInt(prescriptionItem.available_quantity) >= parseInt(qty_count));
            });
            var valueArr = _that.data.prescriptionItems.map(function (item) {
                return item.product_name
            });
            var isDuplicate = valueArr.some(function (item, idx) {
                return valueArr.indexOf(item) != idx
            });
            if (isDuplicate)
            {
                $scope.duplicateErrormessage = 'Duplicate product is exits';
                return false;
            } else {
                $scope.duplicateErrormessage = '';
            }


            /* For print bill */
            $scope.data2 = _that.data;
            $scope.prescriptionItems2 = $scope.data.prescriptionItems;
            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        $anchorScroll();
                        $scope.loadbar('hide');
                        if (response.success) {
                            $scope.current_time = response.date;
                            $scope.msg.successMessage = succ_msg;
                            $scope.data = {prescriptionItems: []};
                            $scope.data.encounter_id = $scope.default_encounter_id;
                            $scope.data.consultant_id = response.model.consultant_id;
                            $scope.consultant_name = response.model.consultant_name;
                            $('#diagnosis').val("");
                            $timeout(function () {
                                save_success(true, response);
                            });
                            $timeout(function () {
                                $scope.getFav();
                                $scope.getConsultantFreq();
//                                $state.go('patient.prescription', {id: $state.params.id});
                            }, 1000)
                        } else {
                            $scope.errorData = response.message;
                        }
                    }
            ).error(function (data, status) {
                $anchorScroll();
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.getBtnId = function (btnid) {
            $scope.btnid = btnid;
        }

        $scope.getFrequencyExists = function (freq, key, freqType) {
            if (typeof freq != 'undefined') {
                if (freqType == 'txt') {
                    return freq;
                } else {
                    var result = freq.split('-');
                    if (result[key] == "0" || typeof result[key] == 'undefined')
                    {
                        return "-";
                    } else {
                        if (result[key] != Math.floor(result[key])) {
                            var decimalFreq = result[key].split('.');
                            var wholeNumber = (decimalFreq[0] == '0' ? '' : decimalFreq[0] + ' ')
                            if (wholeNumber) {
                                if (decimalFreq[1] == '25')
                                    return wholeNumber + '<i>1/4</i>';
                                else if (decimalFreq[1] == '5')
                                    return wholeNumber + '<i>1/2</i>';
                                else if (decimalFreq[1] == '75')
                                    return wholeNumber + '<i>3/4</i>';
                            } else {
                                if (decimalFreq[1] == '25')
                                    return wholeNumber + '1/4';
                                else if (decimalFreq[1] == '5')
                                    return wholeNumber + '1/2';
                                else if (decimalFreq[1] == '75')
                                    return wholeNumber + '3/4';
                            }

                        } else {
                            return result[key];
                        }
                    }
                }
            }
        }

        $scope.removeItem = function (item) {
            PrescriptionService.deletePrescriptionItem(item);
            $scope.data.prescriptionItems = PrescriptionService.getPrescriptionItems();
//            var index = $scope.data.prescriptionItems.indexOf(item);
//            $scope.data.prescriptionItems.splice(index, 1);
        }

        $scope.loadRecurringPrescription = function (enc_id) {
            $http({
                method: 'GET',
                url: $rootScope.IRISOrgServiceUrl + '/encounter/getrecurringprescription?encounter_id=' + enc_id,
            }).success(
                    function (response) {
                        $scope.recurring_charges = null;
                        if (typeof response.recurring != 'undefined')
                            $scope.recurring_charges = response.recurring;
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.setDayEmpty = function () {
            $scope.data.number_of_days = '';
        }

        $scope.getDays = function () {
            var newValue = moment(this.data.next_visit).format('YYYY-MM-DD');
            if (newValue != '') {
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patient/getnextvisitdaysfromdate',
                    data: {'date': newValue},
                }).success(
                        function (response) {
                            $scope.data.number_of_days = response.days;
                            //Update all the No.of Days column in prescription form 
                            angular.forEach($scope.data.prescriptionItems, function (item, key) {
//                                if (!item.number_of_days || item.number_of_days == '0') {
//                                    $scope.numberDaysChange(response.days, item, key, $scope.tableform);
//                                }
                                if (!item.manual_textbox)
                                    $scope.numberDaysChange(response.days, item, key, $scope.tableform);
                            });
                        }
                );
            }
        }

        $scope.setDateEmpty = function () {
            $scope.data.next_visit = '';
        }

        $scope.getVisit = function () {
            var newValue = this.data.number_of_days;
            if (parseInt(newValue) >= 0 && !isNaN(newValue)) {
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patient/getdatefromdays',
                    data: {'days': newValue},
                }).success(
                        function (response) {
                            $('#next_visit_date_picker').datepicker('setDate', response.date);
                            $scope.data.next_visit = response.date;
                        }
                );
                //Update all the No.of Days column in prescription form 
                angular.forEach($scope.data.prescriptionItems, function (item, key) {
//                    if (!item.number_of_days || item.number_of_days == '0') {
//                        $scope.numberDaysChange(newValue, item, key, $scope.tableform);
//                    }
                    if (!item.manual_textbox)
                        $scope.numberDaysChange(newValue, item, key, $scope.tableform);
                });
            }
        }

        $scope.checkInput = function (data) {
            if (!data) {
                return "Not empty.";
            }
        };
        $scope.checkFrequency = function (data, item, key, freqType, freqPosition) {
            var validFractionFreq = ['0.75', '0.5', '0.25'];
            if (item.freqType == freqType) {

                if (parseFloat(data) == '0') {
                    var empty_data = item.frequency.split('-');
                    if (freqType == '3')
                    {
                        if ((parseFloat(empty_data[0]) == '0') && (parseFloat(empty_data[1]) == '0') && (parseFloat(empty_data[2]) == '0'))
                            return "Wrong";
                    }
                    if (freqType == '4')
                    {
                        if ((parseFloat(empty_data[0]) == '0') && (parseFloat(empty_data[1]) == '0') && (parseFloat(empty_data[2]) == '0') && (parseFloat(empty_data[3]) == '0'))
                            return "Wrong";
                    }
                }
//                if (freqType == 'txt')
//                    var freqVal = $('input#frequency_' + key + '_' + item.freqType).val();
//                else
//                    var freqVal = $('input#frequency_' + key + '_' + item.freqType + '_' + freqPosition).val();

                if (freqType == 'txt')
                    var freqVal = $('div#freq_' + key + '_' + item.freqType + ' input:nth(0)').val();
                else
                    var freqVal = $('div#freq_' + key + '_' + item.freqType + ' input:nth(' + freqPosition + ')').val();
                if (typeof freqVal == 'undefined' || freqVal == '') {
                    return "Wrong";
                }

                if (freqType != 'txt' && data != Math.floor(data)) {
                    var decimalFreq = data.split('.');
                    if ($.inArray('0.' + decimalFreq[1], validFractionFreq) === -1)
                        return "Wrong";
                }
            }
        };
        $scope.prescription = '';
        var changeTimer = false;
        $scope.prescription_lists = {};
        $scope.$watch('prescription', function (newValue, oldValue) {
            if (newValue != '' && newValue.length > 1 && !$scope.pickProduct) {
                $scope.show_prescription_loader = true;
                if (changeTimer !== false)
                    clearTimeout(changeTimer);
                changeTimer = setTimeout(function () {
                    _data = {};
                    _data['search'] = newValue;
                    if (!jQuery.isEmptyObject($scope.lastSelected) && $scope.lastSelected) {
                        _data['product_id'] = $scope.lastSelected.product_id;
                        if (typeof $scope.lastSelected.route_id != 'undefined')
                            _data['route_id'] = $scope.lastSelected.route_id;
                    }
                    if (typeof $scope.available_medicine != 'undefined')
                        _data['available_medicine'] = $scope.available_medicine;
                    $http({
                        method: 'POST',
                        url: $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/getprescription?page_action=branch_pharmacy',
                        data: _data,
                    }).success(
                            function (response) {
                                $scope.prescription_lists = response.prescription;
                                if ($scope.lastSelected) {
                                    $scope.show_prescription_loader = false;
                                    var result = $filter('filter')($scope.prescription_lists, {prescription: $scope.lastSelected.prescription});
                                    if (result.length > 0)
                                        result[0].selected = 'selected';
                                }
                            }
                    );
                    changeTimer = false;
                }, 300);
            } else {
                if (newValue != oldValue) {
                    $scope.pickProduct = false;
                }
                $scope.prescription_lists = {};
                $scope.pickProduct = false;
            }
        }, true);
        $scope.disabled = function (date, mode) {
            date = moment(date).format('YYYY-MM-DD');
            return $.inArray(date, $scope.enabled_dates) === -1;
        };
        //Checkbox initialize
        $scope.checkboxes = {'checked': false, items: []};
        $scope.previousPresSelectedItems = [];
        $scope.previousPresSelected = 0;
        $scope.represcribeSelectedItems = [];
        $scope.represcribeSelected = 0;
        $scope.enabled_dates = [];
        $scope.loadPrevPrescriptionsList = function (date) {
            $scope.topfilterdate = date;
            $scope.maxSize = 5; // Limit number for pagination display number.  
            $scope.totalCount = 0; // Total number of items in all pages. initialize as a zero  
            $scope.pageIndex = 1; // Current page number. First page is 1.-->  
            $scope.pageSizeSelected = 5; // Maximum number of items per page.

            //$scope.isLoading = true;
            //$scope.spinnerbar('show');
            // pagination set up

            $scope.rowCollection = []; // base collection
            //$scope.itemsByPage = 10; // No.of records per page
            $scope.displayedCollection = [].concat($scope.rowCollection); // displayed collection

            $scope.getPreviouspres($scope.topfilterdate);
            //$scope.$broadcast('refreshDatepickers');
        };
        $scope.getPreviouspres = function (date) {
            //            &full_name_with_stock=1
            $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproduct?fields=product_id,full_name,generic_id&page_action=branch_pharmacy')
                    .success(function (products) {
                        $scope.all_products = products;
                        if (typeof date == 'undefined') {
//                            &full_name_with_stock=1
                            url = $rootScope.IRISOrgServiceUrl + '/patientprescription/getpreviousprescription?patient_id=' + $state.params.id + '&addtfields=prev_presc&pageIndex=' + $scope.pageIndex + '&pageSize=' + $scope.pageSizeSelected;
                        } else {
                            date = moment(date).format('YYYY-MM-DD');
//                            &full_name_with_stock=1
                            url = $rootScope.IRISOrgServiceUrl + '/patientprescription/getpreviousprescription?patient_id=' + $state.params.id + '&date=' + date + '&addtfields=prev_presc&pageIndex=' + $scope.pageIndex + '&pageSize=' + $scope.pageSizeSelected;
                        }

                        // Get data's from service
                        $http.get(url)
                                .success(function (prescriptionList) {
                                    //$scope.spinnerbar('hide');
                                    $scope.rowCollection = prescriptionList.prescriptions;
                                    $scope.totalCount = prescriptionList.totalCount;
                                    if ($scope.rowCollection.length > 0) {
                                        angular.forEach($scope.rowCollection, function (row) {

                                            /* Visible only existing presc dates in datepicker */
                                            var result = $filter('filter')($scope.enabled_dates, moment(row.pres_date).format('YYYY-MM-DD'));
                                            if (result.length == 0)
                                                $scope.enabled_dates.push(moment(row.pres_date).format('YYYY-MM-DD'));
                                            angular.forEach(row.items, function (item) {
                                                item.selected = '0';
                                            });
                                            row.selected = '0';
                                        });
                                        if (typeof date == 'undefined') {
                                            var typed_prescription = PrescriptionService.getPrescriptionItems();
                                            if (typed_prescription.length > 0) {
                                                angular.forEach(typed_prescription, function (item) {
                                                    item.number_of_days = 0;
                                                    item.qty = 0;
                                                });
                                                $scope.data.prescriptionItems = typed_prescription;
                                            } else {
                                                if ($scope.rowCollection[0].tenant_id == $scope.app.logged_tenant_id) {
                                                    var loop_total = $scope.rowCollection[0].items.length;
                                                    var loop_start = 0;
                                                    angular.forEach($scope.rowCollection[0].items, function (item, k) {
                                                        $scope.getRelatedProducts(item.generic_id).then(function () {
                                                            qty_count = $scope.calculate_qty(item.frequency_name, item.number_of_days, item.product.product_description_id, item.product.description_name);
                                                            items = {
                                                                'product_id': item.product_id,
                                                                'product_name': item.product.full_name,
                                                                'generic_id': item.generic_id,
                                                                'generic_name': item.generic_name,
                                                                'drug_class_id': item.drug_class_id,
                                                                'drug_name': item.drug_name,
                                                                'manual_textbox': false,
                                                                'route': item.route_name,
                                                                'frequency': item.frequency_name,
                                                                'number_of_days': 0,
                                                                'food_type': item.food_type,
                                                                'is_favourite': 0,
                                                                'route_id': item.route_id,
                                                                'description_routes': item.product.description_routes,
                                                                'presc_date': moment().format('YYYY-MM-DD HH:mm:ss'),
                                                                'price': item.product.latest_price,
                                                                'total': $scope.calculate_price(qty_count, item.product.latest_price),
                                                                'freqMask': '9-9-9-9',
                                                                'freqMaskCount': 4,
                                                                'available_quantity': item.product.availableQuantity,
                                                                'item_key': k,
                                                                'all_products': $scope.products,
                                                                'qty': qty_count,
                                                                'product_description_id': item.product.product_description_id,
                                                                'description_name': item.product.description_name,
                                                                'in_stock': (parseInt(item.product.availableQuantity) >= parseInt(qty_count)),
                                                                'freqType': item.freqType
                                                            };
                                                            var fav = $filter('filter')($scope.child.favourites, {product_id: item.product_id});
                                                            if (fav && fav.length > 0) {
                                                                angular.extend(items, {is_favourite: 1});
                                                            }

                                                            //Multiple entries created, Check duplicate once again 
                                                            var chkDuplicate = $filter('filter')(PrescriptionService.getPrescriptionItems(), {product_id: items.product_id}, true);

                                                            //In Master table product, changed geneic and drug glass remove the product   
                                                            var chkProduct = $filter('filter')(items.all_products, {product_id: items.product_id}, true);
                                                            if (chkDuplicate.length == 0 && chkProduct.length != 0) {
                                                                PrescriptionService.addPrescriptionItem(items);
                                                            }
                                                            loop_start = parseFloat(loop_start) + parseFloat(1);
                                                            if (loop_total == loop_start) {
                                                                $timeout(function () {
                                                                    $scope.data.prescriptionItems = PrescriptionService.getPrescriptionItems();
                                                                    $scope.commonCheckAvailable();
                                                                }, 1000);
                                                                $timeout(function () {
                                                                    $scope.showOrhideFrequency();
                                                                }, 2000);
                                                            }
                                                        });
                                                    });
                                                }
                                            }
                                        }
                                    } else {
                                        //$scope.isLoading = false;
                                        $scope.spinnerbar('hide');
                                        if (typeof date == 'undefined') {
                                            var typed_prescription = PrescriptionService.getPrescriptionItems();
                                            if (typed_prescription.length > 0) {
                                                $scope.data.prescriptionItems = typed_prescription;
                                            }
                                        }
                                    }
                                    $timeout(function () {
                                        $scope.showOrhideFrequency();
                                    }, 2000);
                                    $scope.displayedCollection = [].concat($scope.rowCollection);
                                    //Checkbox initialize
                                    $scope.checkboxes = {'checked': false, items: []};
                                    $scope.previousPresSelectedItems = [];
                                    $scope.previousPresSelected = 0;
                                    var main_prescription = PrescriptionService.getPrescriptionmainItem();
                                    if (main_prescription.length > 0) {
                                        if (main_prescription[0]['numberofdays'])
                                            $scope.data.number_of_days = main_prescription[0]['numberofdays'];
                                        if (main_prescription[0]['nextVisit'])
                                            $scope.data.next_visit = main_prescription[0]['nextVisit'];
                                        if (main_prescription[0]['consultantId'])
                                            $scope.data.consultant_id = main_prescription[0]['consultantId'];
                                    }


                                    $scope.$broadcast('refreshDatepickers');
                                })
                                .error(function () {
                                    $scope.errorData = "An Error has occured while loading list!";
                                });
                        $timeout(function () {
                            $scope.spinnerbar('hide');
                            //$scope.isLoading = false;
                        }, 2500);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading brand!";
                    });
        }

        $scope.pageChanged = function (ind) {
            $scope.pageIndex = ind;
            $scope.getPreviouspres($scope.topfilterdate);
        };
        //This method is calling from dropDown  
        $scope.changePageSize = function () {
            $scope.pageIndex = 1;
            $scope.getPreviouspres($scope.topfilterdate);
        };
        $scope.calculate_qty = function (freq, days, product_description_id, description_name) {
            if (typeof freq != 'undefined') {
                var freq_count = 0;
                $.each(freq.split('-'), function (key, item) {
                    freq_count = freq_count + parseFloat(item);
                });
                var qtyCalcDescNames = ["tablet", "capsule", "tablets", "capsules"];
                if ($.inArray(description_name.toLowerCase(), qtyCalcDescNames) >= 0 &&
                        !isNaN(freq_count) && angular.isNumber(freq_count)) {
                    //Tablets
                    return Math.round(parseFloat(days) * parseFloat(freq_count));
                } else {
                    return 1;
                }
            }
            return 1;
        }

        $scope.calculate_price = function (qty, price) {
            if (typeof qty != 'undefined') {
                return (parseFloat(qty) * parseFloat(price));
            }
            return 0;
        }

        $scope.seen_notes = function () {
            $scope.scrollBottom();
            if ($scope.unseen_notes_count > 0) {
                unseen_filter_note = $filter('filter')($scope.child.notes, {seen_by: 0});
                note_ids = [];
                angular.forEach(unseen_filter_note, function (unseen, key) {
                    note_ids.push(unseen.pat_note_id);
                });
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patientnotes/seennotes',
                    data: {'ids': note_ids, 'patient_guid': $state.params.id},
                }).success(
                        function (response) {
                            $timeout(function () {
                                angular.forEach($scope.child.notes, function (note, key) {
                                    note.seen_by = 1;
                                });
                                $scope.unseen_notes_count = 0;
                            }, 5000);
                        }
                );
            }
        }

        $scope.seen_vitals = function () {
            $scope.scrollBottom();
            if ($scope.unseen_vitals_count > 0) {
                unseen_filter_vital = $filter('filter')($scope.child.vitals, {seen_by: 0});
                vital_ids = [];
                angular.forEach(unseen_filter_vital, function (unseen, key) {
                    vital_ids.push(unseen.vital_id);
                });
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + '/patientvitals/seenvitals',
                    data: {'ids': vital_ids, 'patient_guid': $state.params.id},
                }).success(
                        function (response) {
                            $timeout(function () {
                                angular.forEach($scope.child.vitals, function (vital, key) {
                                    vital.seen_by = 1;
                                });
                                $scope.unseen_vitals_count = 0;
                            }, 5000);
                        }
                );
            }
        }

        $scope.scrollBottom = function () {
            $timeout(function () {
                if ($(".vbox .row-row .cell").is(':visible')) {
                    elem = $(".vbox .row-row .cell:visible");
                    elem.animate({scrollTop: elem.prop("scrollHeight")}, 1000);
                }
            }, 500);
        }

        $scope.types = IO_BARCODE_TYPES;
        $scope.code = '1234567890128';
        $scope.type = 'CODE128B';
        $scope.barcodeOptions = {
            displayValue: true,
            textAlign: 'center',
            fontSize: 18,
            height: 70,
            width: 1.2,
        }

        $scope.presSelected = {items: []};
        $scope.updateCheckbox = function (parent, parent_key) {
            angular.forEach($scope.displayedCollection, function (value, pres_key) {
                value.selected = '0';
                if (parent_key == pres_key)
                    value.selected = parent.selected;
                angular.forEach(value.items, function (row, key) {
                    row.selected = '0';
                    if (parent_key == pres_key)
                        row.selected = parent.selected;
                });
            });
            $timeout(function () {
                angular.forEach($scope.displayedCollection, function (value, pres_key) {
                    angular.forEach(value.items, function (row, key) {
                        $scope.moreOptions(pres_key, key, row);
                        $scope.prepareMainPrescrption();
                    });
                });
            }, 1000);
        }

        $scope.moreOptions = function (pres_key, key, row) {
            product_exists = $filter('filter')($scope.checkboxes.items, {product_id: row.product_id}, true);
            pres_exists = $filter('filter')($scope.checkboxes.items, {pres_id: row.pres_id}, true);
            if ($('#prevpres_' + pres_key + '_' + key).is(':checked')) {
                $('#prevpres_' + pres_key + '_' + key).closest('tr').addClass('selected_row');
                $('.tr_prevprescheckbox').not('.tr_prevprescheckbox_' + pres_key).each(function () {
                    $(this).removeClass('selected_row');
                });
                if (pres_exists.length == 0) {
                    $('.prevprescheckbox').not('.prevprescheckbox_' + pres_key).attr('checked', false);
                    $scope.checkboxes.items = [];
                    $scope.checkboxes.items.push({
                        pres_id: row.pres_id,
                        product_id: row.product_id,
                        row: row
                    });
                } else {
                    if (product_exists.length == 0) {
                        $scope.checkboxes.items.push({
                            pres_id: row.pres_id,
                            product_id: row.product_id,
                            row: row
                        });
                    }
                }
            } else {
                $('#prevpres_' + pres_key + '_' + key).closest('tr').removeClass('selected_row');
                if (product_exists.length > 0 && pres_exists.length > 0) {
                    $scope.checkboxes.items.splice($scope.checkboxes.items.indexOf(product_exists[0]), 1);
                }
            }
            $scope.prepareMoreOptions();
        }

        $scope.prepareMoreOptions = function () {
            $scope.previousPresSelectedItems = [];
            angular.forEach($scope.checkboxes.items, function (item) {
                $scope.previousPresSelectedItems.push(item.row);
            });
            $scope.previousPresSelected = $scope.previousPresSelectedItems.length;
        }

        $scope.prepareMainPrescrption = function () {
            $scope.represcribeSelectedItems = [];
            angular.forEach($scope.checkboxes.items, function (item) {
                $scope.represcribeSelectedItems.push(item.row);
            });
            $scope.represcribeSelected = $scope.represcribeSelectedItems.length;
        }

        $scope.lastSelected = {};
        //.off() - This will remove all event handlers:
        $("body").off().on('keydown', '#prescription_global_search', function (e) {
            var selected = $("#prescriptioncont-header .selected");
            var li_count = $("#prescriptioncont-header li").length;
            if (e.keyCode == 40 || e.keyCode == 38) {
                $("#prescriptioncont-header li").removeClass("selected");
                if (selected.length == 0 && e.keyCode == 40) {
                    var selected = $("#prescriptioncont-header li:last");
                } else if (selected.length == 0 && e.keyCode == 38) {
                    var selected = $("#prescriptioncont-header li:first");
                }

                if (li_count == 1) {
                    var selected = $("#prescriptioncont-header li:first");
                    selected.addClass('selected');
                }

                if (e.keyCode == 38) { // up
                    if (selected.prev().length == 0) {
                        selected.siblings().last().addClass("selected");
                    } else {
                        selected.prev().addClass("selected");
                    }
                }

                if (e.keyCode == 40) { // down
                    if (selected.next().length == 0) {
                        selected.siblings().first().addClass("selected");
                    } else {
                        selected.next().addClass("selected");
                    }
                }

//Scroll dropdown when key up / down
                $timeout(function () {
                    var selected_li = $('ul.search-patientcont-header li.selected');
                    if (selected_li.index() < 12) {
                        var selected_ind = 0;
                    } else {
                        var selected_ind = selected_li.index() - 12;
                    }
                    $('ul.search-patientcont-header')[0].scrollTop = selected_ind * selected_li.outerHeight();
                });
                var a = $("#prescriptioncont-header .selected a");
                if (a.length > 0) {
                    $scope.$apply(function () {
                        $scope.lastSelected = $scope.prescription_lists[a.data('key')];
                    });
                    $(this).val($scope.lastSelected.prescription);
                }
            }

//While Backspace
            if (e.keyCode == 8 || e.keyCode == 46) {
                $scope.lastSelected = {};
            }

            if ($(this).val() == '') {
                $scope.lastSelected = {};
            }

            if (e.keyCode == 13) { // enter
                if ($("#prescriptioncont-header").is(":visible")) {
                    $scope.selectOption();
                }
            }
        });
        $("body").on("mouseover", "#prescriptioncont-header li", function () {
            $("#prescriptioncont-header li").removeClass("selected");
            $(this).addClass("selected");
            $scope.$apply(function () {
                if (!jQuery.isEmptyObject($scope.prescription_lists)) {
                    var Selected = $scope.prescription_lists[$(this).find("a").data('key')];
                    if (typeof Selected != 'undefined') {
                        $('#prescription_global_search').val(Selected.prescription);
                    }
                }
            });
        });
        $scope.selectOption = function () {
            var link_tag = $("#prescriptioncont-header .selected").find("a");
            $scope.$apply(function () {
                var Selected = $scope.prescription_lists[link_tag.data('key')];
                $('#prescription_global_search').val(Selected.prescription);
            });
            if (link_tag.length > 0) {
                $(link_tag).trigger("click");
            } else {
                $(".selected button").trigger("click");
            }
            return false;
        }

        var save_success = function (prev_refresh, response) {
//            if ($scope.btnid == "print") {
//                $scope.printloader = '<i class="fa fa-spin fa-spinner"></i>';
//                $timeout(function () {
//                    var print_content = $scope.printContent();
//                    if (print_content.length > 0) {
//                        var docDefinition = {
//                            header: $scope.printHeader(),
//                            footer: $scope.printFooter(),
//                            styles: $scope.printStyle(),
//                            content: print_content,
//                            pageMargins: ($scope.deviceDetector.browser == 'firefox' ? 75 : 50),
//                            pageSize: 'A4',
//                        };
//                        var pdf_document = pdfMake.createPdf(docDefinition);
//                        var doc_content_length = Object.keys(pdf_document).length;
//                        if (doc_content_length > 0) {
//                            pdf_document.print();
//                        }
//                    }
//                }, 1000);
//            }
            if ($scope.btnid == "print") {
                $scope.printPres(response.pres_id);
            }

            if (prev_refresh) {
                $scope.pres_status = 'prev';
                $("#prev_prescription").focus();
                $scope.filterdate = '';
                $scope.loadPrevPrescriptionsList();
            }

        }

        $scope.imgExport = function (imgID) {
            var img = document.getElementById(imgID);
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            // Copy the image contents to the canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            // Get the data-URL formatted image
            // Firefox supports PNG and JPEG. You could check img.src to
            // guess the original format, but be aware the using "image/jpg"
            // will re-encode the image.
            var dataURL = canvas.toDataURL("image/png");
            return dataURL;
        }

        $scope.presDetail = function (pres_id) {
            $scope.prescription_print_content = true;
            $scope.data2 = {};
            $scope.prescriptionItems2 = [];
            $scope.loadbar('show');
            var total_qty = [];
            var deferred = $q.defer();
            deferred.notify();
            $http.get($rootScope.IRISOrgServiceUrl + "/patientprescriptions/" + pres_id + "?addtfields=presc_print")
                    .success(function (response) {
                        $scope.loadbar('hide');
                        $scope.data2 = response;
                        $scope.vital = response.encounter;
                        $scope.prescriptionItems2 = response.items;
                        //angular.forEach($scope.prescriptionItems2, function (item, key) {
//                            angular.extend($scope.prescriptionItems2[key], {
//                                frequency: item.frequency_name,
//                            });
                        // });
                        angular.forEach($scope.prescriptionItems2, function (item, key) {
                            if (item.quantity)
                            {
                                item.total_qty = item.quantity;
                            } else
                            {
                                item.total_qty = $scope.calculate_qty(item.frequency_name, item.number_of_days, item.product.product_description_id, item.product.description_name);
                            }

                        });
                        deferred.resolve();
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading prescription!";
                        deferred.reject();
                    });
            return deferred.promise;
        }

        $scope.printPres = function (pres_id) {
            $scope.presDetail(pres_id).then(function () {
                delete $scope.data2.items;
                $timeout(function () {
                    $("#print_previous_pres").print({
                        globalStyles: false,
                        mediaPrint: false,
                        stylesheet: $rootScope.IRISOrgUrl + "/css/prescription_print.css",
                        noPrintSelector: ".no-print",
                        iframe: false,
                        append: '',
                        prepend: '',
                        title: $scope.app.org_name,
                    });
                }, 500);
//                $('#print_previous_pres').printThis({
//                    pageTitle: $scope.app.org_name,
//                    debug: false,
//                    importCSS: false,
//                    importStyle: false,
//                    loadCSS: [$rootScope.IRISOrgUrl + "/css/prescription_print.css"],
//                });
            });
        }

        $scope.freqChange = function (freq, freq_type, item, key, tableform, freqPosition) {
            if (typeof freq == 'undefined')
                freq = '';
            if (typeof freq != 'undefined') {
                var result = item.frequency.split('-');
                result[freqPosition] = freq;
                org_freq = result.join('-');
//                org_freq = chunk(freq, 1).join('-');
                $scope.curPrescFreqSele(org_freq, freq_type, item, key);
            }
        };
        $scope.curPrescFreqSele = function (freq, ftype, item, key, method) {
            if (typeof freq != 'undefined') {
                $('.freq_div_' + key).addClass('hide');
                $('#freq_' + key + '_' + ftype).removeClass('hide');
                $scope.data.prescriptionItems[key].frequency = freq;
                $scope.data.prescriptionItems[key].freqType = ftype;
                $scope.data.prescriptionItems[key].qty = $scope.calculate_qty(freq, item.number_of_days, item.product_description_id, item.description_name);
                $scope.data.prescriptionItems[key].total = $scope.calculate_price($scope.data.prescriptionItems[key].qty, item.price);
                $scope.data.prescriptionItems[key].in_stock = (parseInt(item.available_quantity) >= parseInt($scope.data.prescriptionItems[key].qty));
            }

            angular.forEach($scope.tableform.$editables, function (editableValue, editableKey) {
                if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'qty') {
                    editableValue.scope.$data = $scope.data.prescriptionItems[key].qty
                }
                if (editableValue.attrs.eIndex == key && editableValue.attrs.eName == 'masked') {
                    editableValue.scope.$data = '';
                }

                if (ftype == 'txt') {
                    if (editableValue.attrs.eIndex == key && editableValue.attrs.eId == 'frequency_' + key + '_' + ftype) {
                        editableValue.scope.$data = $scope.data.prescriptionItems[key].frequency;
                    }
                } else {
                    var result = $scope.data.prescriptionItems[key].frequency.split('-');
                    if (result.length > 0) {
                        angular.forEach(result, function (freqvalue, freqkey) {
                            if (editableValue.attrs.eIndex == key && editableValue.attrs.eId == 'frequency_' + key + '_' + ftype + '_' + freqkey) {
                                editableValue.scope.$data = freqvalue;
                            }
                        });
                    }
                }
            });
            if (method == 'select') {
                $('div.editable-error').html(''); //clear all error msg
                if (ftype == 'txt') {
                    angular.element(document.querySelectorAll('#frequency_' + key + '_' + ftype))[0].focus();
                } else {
                    angular.element(document.querySelectorAll('#frequency_' + key + '_' + ftype + '_0'))[0].focus();
                }
            }

        }

        $scope.defaultMask3 = {
            'freq_name': '1-1-1',
            'freq_type': '3'
        };
        $scope.defaultMask4 = {
            'freq_name': '1-1-1-1',
            'freq_type': '4'
        };
        $scope.defaultMaskTxt = {
            'freq_name': 'Custom',
            'freq_type': 'txt'
        };
        $scope.consultantFreq = [];
        $scope.getConsultantFreq = function () {
            $scope.consultantFreq = [];
            $http.get($rootScope.IRISOrgServiceUrl + '/patientprescription/getconsultantfreq?addtfields=pres_frequency&consultant_id=' + $scope.data.consultant_id)
                    .success(function (response) {
                        if (response.freq.length > 0)
                            $scope.consultantFreq = response.freq;
                        else {
                            $scope.consultantFreq.push($scope.defaultMask3);
                            $scope.consultantFreq.push($scope.defaultMask4);
                            $scope.consultantFreq.push($scope.defaultMaskTxt);
                        }
                        $scope.prepareCurrPresFreq();
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                    });
            //Consultant wise no of days record
            $scope.getConsultantNoofdays();
        }

//Consultant wise no of days 
        $scope.consultantNoofdays = [];
        $scope.fillNoofdays = [];
        $scope.getConsultantNoofdays = function () {
            $scope.consultantNoofdays = [];
            $scope.fillNoofdays = [];
            $http.get($rootScope.IRISOrgServiceUrl + '/patientprescription/getconsultantnoofdays?consultant_id=' + $scope.data.consultant_id)
                    .success(function (response) {
                        if (response.noofdays.length > 0)
                            $scope.consultantNoofdays = response.noofdays;
                        $scope.consultantNoofdays = $filter('orderBy')($scope.consultantNoofdays, '-created_at');
                        angular.forEach($scope.consultantNoofdays, function (item, item_key) {
                            $scope.fillNoofdays.push(item.number_of_days);
                        });
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                    });
        }

        $scope.currPresMask3 = [];
        $scope.currPresMask4 = [];
        $scope.currPresMaskTxt = [];
        $scope.prepareCurrPresFreq = function () {
            $scope.commonFrequency($scope.consultantFreq);
        }

        $scope.commonFrequency = function (frequency) {
            $scope.currPresMask3 = [];
            $scope.currPresMask4 = [];
            $scope.currPresMaskTxt = [];
            $scope.fillFrequency3 = {};
            $scope.fillFrequency4 = {};
            //if (frequency.length > 0) {
            //check mask3 is exist, otherswise push default set
            var mask3 = $filter('filter')(frequency, {freq_type: '3'});
            if (mask3.length == 0) {
                $scope.currPresMask3.push($scope.defaultMask3);
            } else {
                $scope.currPresMask3 = mask3;
            }

//check mask4 is exist, otherswise push default set
            var mask4 = $filter('filter')(frequency, {freq_type: '4'});
            if (mask4.length == 0) {
                $scope.currPresMask4.push($scope.defaultMask4);
            } else {
                $scope.currPresMask4 = mask4;
            }

//check maskTxt is exist, otherswise push default set
            var maskTxt = $filter('filter')(frequency, {freq_type: 'txt'});
            if (maskTxt.length == 0) {
                $scope.currPresMaskTxt.push($scope.defaultMaskTxt);
            } else {
                $scope.currPresMaskTxt = maskTxt;
            }

//Make "Custom" is a first option in the array. 
            var maskCustomTxt = $filter('filter')($scope.currPresMaskTxt, {freq_name: 'Custom'});
            if (maskCustomTxt.length == 0) {
                $scope.currPresMaskTxt.unshift($scope.defaultMaskTxt);
            }
//}
//Freq Typeahead concept 
            angular.forEach($scope.currPresMask3, function (value, key) {
                var result = value.freq_name.split('-');
                angular.forEach(result, function (item, item_key) {
                    value['freq_name_' + item_key] = item;
                    if (typeof $scope.fillFrequency3[item_key] == 'undefined') {
                        $scope.fillFrequency3[item_key] = [];
                    }
                    if ($scope.fillFrequency3[item_key].indexOf(item) === -1) {
                        $scope.fillFrequency3[item_key].push(item);
                    }
                });
            });
            angular.forEach($scope.currPresMask4, function (value, key) {
                var result = value.freq_name.split('-');
                angular.forEach(result, function (item, item_key) {
                    value['freq_name_' + item_key] = item;
                    if (typeof $scope.fillFrequency4[item_key] == 'undefined') {
                        $scope.fillFrequency4[item_key] = [];
                    }
                    if ($scope.fillFrequency4[item_key].indexOf(item) === -1) {
                        $scope.fillFrequency4[item_key].push(item);
                    }
                });
            });
        }


        $scope.checkProducttype = function (type) {
            var product_freq = '';
            if (type == 'SYRUP') {
                product_freq = $filter('filter')($scope.consultantFreq, {product_type: 'SYRUP'});
            } else {
                product_freq = $filter('filter')($scope.consultantFreq, {product_type: '!SYRUP'});
            }
            $scope.commonFrequency(product_freq);
        }

        $scope.removeRow = function (pres_id) {
            var conf = confirm('Are you sure to delete ?');
            if (conf)
            {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/patientprescription/remove",
                    method: "POST",
                    data: {id: pres_id}
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.pres_status = 'prev';
                                $("#prev_prescription").focus();
                                $scope.filterdate = '';
                                $scope.loadPrevPrescriptionsList();
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                )
            }
        }

        $scope.selectFreq = function (freqType, freqPosition, item, key) {
            var result = item.frequency.split('-');
            return result[freqPosition];
        }

        $scope.clearCache = function (freq_id) {
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientprescription/frequencyremove",
                method: "POST",
                data: {id: freq_id, consultant_id: $scope.data.consultant_id}
            }).then(
                    function (response) {
                        if (response.data.success === false) {
                            $scope.errorData = response.data.message;
                        } else {
                            $scope.getConsultantFreq();
                        }
                    }
            )
        }

        $scope.openModel = function (size, ctrlr, tmpl, update_col) {
            var modalInstance = $modal.open({
                templateUrl: tmpl,
                controller: ctrlr,
                size: size,
                resolve: {
                    scope: function () {
                        return $scope;
                    },
                    column: function () {
                        return update_col;
                    },
                }
            });
            modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };
        $scope.trimSpace = function (string) {
            if (!angular.isString(string)) {
                return string;
            }
            return string.replace(/[\s]/g, '');
        }
//New prescription top add Form
        $scope.addGlobalForm = function () {
            globalPrescription = $scope.globalData.globalprescription;
            if (!globalPrescription) {
                $scope.errorData = 'Prescription cannot be empty';
                return false;
            }
            if ($scope.globalData.freq_type == 'txt') {
                if ((!$scope.globalData.frequency_txt)) {
                    $scope.errorData = 'Frequency cannot be empty';
                    return false;
                }
            }
            if ($scope.globalData.freq_type == '3') {
                if ((!$scope.globalData.frequency_3_0) || (!$scope.globalData.frequency_3_1) || (!$scope.globalData.frequency_3_2)) {
                    $scope.errorData = 'Frequency cannot be empty';
                    return false;
                } else if ($scope.globalData.frequency_3_0 == 0 && $scope.globalData.frequency_3_1 == 0 && $scope.globalData.frequency_3_2 == 0) {
                    $scope.errorData = 'All values of frequency cannot be 0';
                    return false;
                }
            }
            if ($scope.globalData.freq_type == '4') {
                if ((!$scope.globalData.frequency_4_0) || (!$scope.globalData.frequency_4_1) || (!$scope.globalData.frequency_4_2) || (!$scope.globalData.frequency_4_3)) {
                    $scope.errorData = 'Frequency cannot be empty';
                    return false;
                } else if ($scope.globalData.frequency_4_0 == 0 && $scope.globalData.frequency_4_1 == 0 && $scope.globalData.frequency_4_2 == 0 && $scope.globalData.frequency_4_3 == 0) {
                    $scope.errorData = 'All values of frequency cannot be 0';
                    return false;
                }
            }

            var result = $filter('filter')($scope.data.prescriptionItems, {product_id: parseInt(globalPrescription.product_id)}, true);
            if (result.length > 0) {
                alert('This Product already added');
                $scope.prescription_lists = {};
                $scope.lastSelected = {};
                $scope.prescription = '';
                $scope.globalData = {};
                $scope.globalData.freq_type = 3;
                $scope.globalData.frequency_3_0 = '0';
                $scope.globalData.frequency_3_1 = '0';
                $scope.globalData.frequency_3_2 = '0';
                $("#prescription_global_search").focus();
            } else {
                var fav = $filter('filter')($scope.child.favourites, {product_id: globalPrescription.product_id});
                if (fav && fav.length > 0) {
                    angular.extend(globalPrescription, {is_favourite: 1});
                }

                var fiter = $filter('filter')($scope.all_products, {product_id: parseInt(globalPrescription.product_id)}, true);
                var product = fiter[0];
                var Fields = 'full_name,description_routes,latest_price,availableQuantity,product_description_id,description_name,product_id';
                $http.get($rootScope.IRISOrgServiceUrl + '/pharmacyproducts/' + product.product_id + '?page_action=branch_pharmacy&fields=' + Fields)
                        .success(function (product) {
                            $scope.getRelatedProducts(globalPrescription.generic_id).then(function () {
                                var no_of_days = $scope.globalData.no_of_days;
                                var g_no_of_days = $scope.trimSpace($scope.globalData.no_of_days);
                                var f_no_of_days = $scope.trimSpace($scope.data.number_of_days);
                                var manual = true;
                                if (!$scope.globalData.no_of_days || g_no_of_days.length < 1) {
                                    if (!$scope.data.number_of_days || f_no_of_days.length < 1) {
                                        var no_of_days = 0;
                                        $scope.globalData.no_of_days = 1;
                                    } else {
                                        var no_of_days = $scope.data.number_of_days;
                                        $scope.globalData.no_of_days = $scope.data.number_of_days;
                                    }
                                    var manual = false;
                                }
                                if ($scope.globalData.freq_type == 'txt')
                                    globalPrescription.frequency = $scope.globalData.frequency_txt;
                                else if ($scope.globalData.freq_type == '4')
                                    globalPrescription.frequency = $scope.globalData.frequency_4_0 + '-' + $scope.globalData.frequency_4_1 + '-' + $scope.globalData.frequency_4_2 + '-' + $scope.globalData.frequency_4_3;
                                else
                                    globalPrescription.frequency = $scope.globalData.frequency_3_0 + '-' + $scope.globalData.frequency_3_1 + '-' + $scope.globalData.frequency_3_2;
                                qty_count = $scope.calculate_qty(globalPrescription.frequency, $scope.globalData.no_of_days, product.product_description_id, product.description_name);
                                if (qty_count > 0) {

                                    if (globalPrescription.route) {
                                        route = globalPrescription.route;
                                    } else {
                                        route = (product.description_routes && product.description_routes.length > 0) ? product.description_routes[0].route_name : '';
                                    }
                                    items = {
                                        'product_id': product.product_id,
                                        'product_name': product.full_name,
                                        'generic_id': parseInt(globalPrescription.generic_id),
                                        'generic_name': globalPrescription.generic_name,
                                        'drug_class_id': globalPrescription.drug_class_id,
                                        'drug_name': globalPrescription.drug_name,
                                        'manual_textbox': manual,
                                        'route': route,
                                        'frequency': globalPrescription.frequency,
                                        'number_of_days': no_of_days,
                                        'food_type': 'NA',
                                        'is_favourite': globalPrescription.is_favourite,
                                        'route_id': globalPrescription.route_id,
                                        'description_routes': product.description_routes,
                                        'presc_date': moment().format('YYYY-MM-DD HH:mm:ss'),
                                        'price': product.latest_price,
                                        'total': $scope.calculate_price(qty_count, product.latest_price),
                                        'freqMask': '9-9-9-9',
                                        'freqMaskCount': 4,
                                        'available_quantity': product.availableQuantity,
                                        'item_key': $scope.data.prescriptionItems.length,
                                        'all_products': $scope.products,
                                        'qty': qty_count,
                                        'product_description_id': product.product_description_id,
                                        'description_name': product.description_name,
                                        'in_stock': (parseInt(product.availableQuantity) >= parseInt(qty_count)),
                                        'freqType': $scope.globalData.freq_type,
                                        'remarks': $scope.globalData.remarks,
                                    };
                                    //Multiple entries created, Check duplicate once again 
                                    var chkDuplicate = $filter('filter')($scope.data.prescriptionItems, {product_id: items.product_id}, true);
                                    if (chkDuplicate.length == 0) {
                                        PrescriptionService.addPrescriptionItem(items);
                                    }
                                    $scope.data.prescriptionItems = PrescriptionService.getPrescriptionItems();
                                    $timeout(function () {
                                        $scope.commonCheckAvailable();
                                        $("#prescriptioncont-header.search-patientcont-header").hide();
//                                        if (!globalPrescription.hasOwnProperty('route')) {
//                                            $scope.setFocus('route', $scope.data.prescriptionItems.length - 1);
//                                        } else if (!globalPrescription.hasOwnProperty('frequency')) {
//                                            $scope.setFocus('frequency', $scope.data.prescriptionItems.length - 1);
//                                        } else {
//                                            $scope.setFocus('number_of_days', $scope.data.prescriptionItems.length - 1);
//                                        }

                                        if (typeof globalPrescription.frequency != 'undefined')
                                            $scope.showOrhideFrequency();
                                    });
                                    $scope.prescription_lists = {};
                                    $scope.lastSelected = {};
                                    $scope.prescription = '';
                                    $scope.globalData = {};
                                    $scope.globalData.freq_type = 3;
                                    $scope.globalData.frequency_3_0 = '0';
                                    $scope.globalData.frequency_3_1 = '0';
                                    $scope.globalData.frequency_3_2 = '0';
                                    $("#prescription_global_search").focus();
                                } else {
                                    alert('Quantity is not available');
                                    return false;
                                }
                            });
                        });
            }
        }

        $scope.TopFreqSele = function (freq, ftype) {
            $scope.globalData.freq_type = ftype;
            if (ftype == 'txt') {
                $scope.globalData['frequency_' + ftype] = freq;
            } else {
                var result = freq.split('-');
                if (result.length > 0) {
                    angular.forEach(result, function (topfreqvalue, topfreqkey) {
                        $scope.globalData['frequency_' + ftype + '_' + topfreqkey] = topfreqvalue;
                    });
                }
            }
        }

//New prescription top form reset the value
        $scope.resetGlobalForm = function () {
            $scope.globalData = {};
            $scope.globalData.freq_type = 3;
            $scope.globalData.frequency_3_0 = '0';
            $scope.globalData.frequency_3_1 = '0';
            $scope.globalData.frequency_3_2 = '0';
            $scope.prescription = '';
            $scope.errorData = '';
        }

//Set global search li value assign to variable
        $scope.pickProduct = false;
        $scope.pick = function (e) {
            $scope.prescription_lists = {};
            $scope.lastSelected = {};
            $scope.prescription = e.prescription;
            //Avoid Form submission. 
            $timeout(function () {
                $('#globalDataFreq').find('input:first').focus().select();
            }, 100);
            $scope.globalData.globalprescription = e;
            $scope.pickProduct = true;
        }

//Load tab all vital list
        $scope.HaveActEnc = false;
        $scope.loadVitals = function () {
            $scope.isLoading = true;
            $scope.vitalCollection = []; // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.vitaldisplayedCollection = [].concat($scope.vitalCollection); // displayed collection

            if (typeof date == 'undefined') {
                url = $rootScope.IRISOrgServiceUrl + '/patientvitals/getpatientvitals?page_action=branch_pharmacy&addtfields=eprvitals&only=result,actenc&patient_id=' + $state.params.id;
            } else {
                date = moment(date).format('YYYY-MM-DD');
                url = $rootScope.IRISOrgServiceUrl + '/patientvitals/getpatientvitals?page_action=branch_pharmacy&addtfields=eprvitals&only=result,actenc&patient_id=' + $state.params.id + '&date=' + date;
            }

            $http.get(url)
                    .success(function (vitals) {
                        $scope.isLoading = false;
                        $scope.vitalCollection = vitals.result;
                        $scope.vitaldisplayedCollection = [].concat($scope.vitalCollection);
                        $scope.HaveActEnc = vitals.HaveActEnc;
                        angular.forEach($scope.vitalCollection, function (row) {
                            angular.forEach(row.all, function (all) {
                                if (!row.encounter_id)
                                    row.encounter_id = all.encounter_id;
                                if (!row.branch_name)
                                    row.branch_name = all.branch_name;
                            });
                        });
                        $scope.setvitalgraph();
                        $scope.$broadcast('refreshDatepickers');
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patientvital!";
                    });
        }

//Set vitals graph value
        $scope.setvitalgraph = function () {
            url = $rootScope.IRISOrgServiceUrl + '/patientvitals/getvitalsgraph?page_action=branch_pharmacy&addtfields=eprvitals&patient_id=' + $state.params.id;
            $http.get(url)
                    .success(function (vitals) {

                        //Temperature chart data
                        $scope.tem_graph_data = [];
                        $scope.tem_graph_tick = [];
                        var tem = vitals.temperature.length;
                        angular.forEach(vitals.temperature, function (row) {
                            if (row.temperature) {
                                $scope.tem_graph_data.push([tem, row.temperature]);
                                $scope.tem_graph_tick.push([tem, moment(row.vital_time).format('DD-MM-YY')]);
                                tem--;
                            }
                        });
                        //Weight chart data
                        $scope.weight_graph_data = [];
                        $scope.weight_graph_tick = [];
                        var weight_max_min = [];
                        var wht = vitals.weight.length;
                        angular.forEach(vitals.weight, function (row) {
                            if (row.weight) {
                                weight_max_min.push(row.weight);
                                $scope.weight_graph_data.push([wht, row.weight]);
                                $scope.weight_graph_tick.push([wht, moment(row.vital_time).format('DD-MM-YY')]);
                                wht--;
                            }
                        });
                        $scope.min_weight = weight_max_min.min() - 5;
                        $scope.max_weight = weight_max_min.max() + 5;
                        //Height chart data
                        $scope.height_graph_data = [];
                        $scope.height_graph_tick = [];
                        var hgt = vitals.height.length;
                        angular.forEach(vitals.height, function (row) {
                            if (row.height) {
                                $scope.height_graph_data.push([hgt, row.height]);
                                $scope.height_graph_tick.push([hgt, moment(row.vital_time).format('DD-MM-YY')]);
                                hgt--;
                            }
                        });
                        //Pulse chart data
                        $scope.pulse_graph_data = [];
                        $scope.pulse_graph_tick = [];
                        var pul = vitals.pulse.length;
                        angular.forEach(vitals.pulse, function (row) {
                            if (row.pulse_rate) {
                                $scope.pulse_graph_data.push([pul, row.pulse_rate]);
                                $scope.pulse_graph_tick.push([pul, moment(row.vital_time).format('DD-MM-YY')]);
                                pul--;
                            }
                        });
                        //Sp02 chart data
                        $scope.sp02_graph_data = [];
                        $scope.sp02_graph_tick = [];
                        var sp = vitals.sp02.length;
                        angular.forEach(vitals.sp02, function (row) {
                            if (row.sp02) {
                                $scope.sp02_graph_data.push([sp, row.sp02]);
                                $scope.sp02_graph_tick.push([sp, moment(row.vital_time).format('DD-MM-YY')]);
                                sp--;
                            }
                        });
                        //Pain Score chart data
                        $scope.pain_graph_data = [];
                        $scope.pain_graph_tick = [];
                        var pain = vitals.painScore.length;
                        angular.forEach(vitals.painScore, function (row) {
                            if (row.pain_score) {
                                $scope.pain_graph_data.push([pain, row.pain_score]);
                                $scope.pain_graph_tick.push([pain, moment(row.vital_time).format('DD-MM-YY')]);
                                pain--;
                            }
                        });
                        //Blood pressure chart data
                        $scope.bps_graph_data = [];
                        $scope.bpd_graph_data = [];
                        $scope.bp_graph_tick = [];
                        var bp = vitals.bp.length;
                        angular.forEach(vitals.bp, function (row) {
                            if ((row.blood_pressure_systolic) || (row.blood_pressure_diastolic)) {
                                if (row.blood_pressure_systolic)
                                    $scope.bps_graph_data.push([bp, row.blood_pressure_systolic]);
                                if (row.blood_pressure_diastolic)
                                    $scope.bpd_graph_data.push([bp, row.blood_pressure_diastolic]);
                                $scope.bp_graph_tick.push([bp, moment(row.vital_time).format('DD-MM-YY')]);
                                bp--;
                            }
                        });
                    })
        }

//Accordation menu open and close method
        $scope.oneAtATime = true;
        $scope.status = {
            isFirstOpen: true,
            isFirstDisabled: false
        };
        //Store vitals datas to form
        $scope.savevitalForm = function (mode) {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            $scope.msg.errorMessage = "";
            vital_data = $scope.vitaldata;
            if ((typeof vital_data.temperature == 'undefined' || vital_data.temperature == '') &&
                    (typeof vital_data.blood_pressure_systolic == 'undefined' || vital_data.blood_pressure_systolic == '') &&
                    (typeof vital_data.blood_pressure_diastolic == 'undefined' || vital_data.blood_pressure_diastolic == '') &&
                    (typeof vital_data.pulse_rate == 'undefined' || vital_data.pulse_rate == '') &&
                    (typeof vital_data.weight == 'undefined' || vital_data.weight == '') &&
                    (typeof vital_data.height == 'undefined' || vital_data.height == '') &&
                    (typeof vital_data.sp02 == 'undefined' || vital_data.sp02 == '') &&
                    (typeof vital_data.pain_score == 'undefined' || vital_data.pain_score == '')) {
                $scope.msg.errorMessage = "Cannot create blank entry";
                return;
            }

            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientvitals';
                method = 'POST';
                succ_msg = 'Vital saved successfully';
                angular.extend(vital_data, {
                    patient_id: $scope.patientObj.patient_id,
                    encounter_id: $scope.encounter_id,
                    vital_time: moment().format('YYYY-MM-DD HH:mm:ss'),
                });
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientvitals/' + vital_data.vital_id;
                method = 'PUT';
                succ_msg = 'Vital updated successfully';
            }
            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: vital_data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.errorMessage = "";
                        $scope.msg.successMessage = succ_msg;
                        $scope.vitaldata = {};
                        $timeout(function () {
                            $scope.loadVitals();
                        }, 100)

                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };
        //Reset the tab vitals form
        $scope.resetvitalForm = function () {
            $scope.vitaldata = {};
        }
//Remove vitals row
        $scope.removevitalRow = function (row) {
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Vital?',
                bodyText: 'Are you sure you want to delete this vital?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loadbar('show');
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + "/patientvitals/remove",
                    data: {id: row},
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadVitals();
                                $scope.msg.successMessage = 'Patient Vital Deleted Successfully';
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                );
            });
        };
        //Update vitals form
        $scope.updatevitalRow = function (vital_id) {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientvitals/" + vital_id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.vitaldata = response;
                        $scope.vitaldata.formtype = 'update';
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };
        $scope.initResultForm = function () {
            $scope.resultdata = {};
            $scope.resultdata.formtype = 'add';
            $scope.loadResultbypatient();
        }

        $scope.saveresultForm = function (mode) {
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            $scope.msg.errorMessage = "";
            result_data = $scope.resultdata;
            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientresults';
                method = 'POST';
                succ_msg = 'Result saved successfully';
                angular.extend(result_data, {
                    patient_id: $scope.patientObj.patient_id,
                    encounter_id: $scope.encounter_id,
                    tenant_id: $scope.app.logged_tenant_id,
                });
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientresults/' + result_data.pat_result_id;
                method = 'PUT';
                succ_msg = 'Result updated successfully';
            }
            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: result_data,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.errorMessage = "";
                        $scope.msg.successMessage = succ_msg;
                        $scope.resultdata = {};
                        $scope.resultdata.formtype = 'add';
                        $timeout(function () {
                            $scope.loadResultbypatient();
                        }, 100)
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.loadResultbypatient = function () {
            $scope.isLoading = true;
            $scope.resultCollection = []; // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.resultdisplayedCollection = [].concat($scope.resultCollection); // displayed collection

            if (typeof date == 'undefined') {
                url = $rootScope.IRISOrgServiceUrl + '/patientresults/getpatientresults?patient_id=' + $state.params.id;
            } else {
                date = moment(date).format('YYYY-MM-DD');
                url = $rootScope.IRISOrgServiceUrl + '/patientresults/getpatientresults?patient_id=' + $state.params.id + '&date=' + date;
            }
// Get data's from service
            $http.get(url)
                    .success(function (notes) {
                        $scope.isLoading = false;
                        $scope.resultCollection = notes.result;
                        $scope.resultdisplayedCollection = [].concat($scope.resultCollection);
                        angular.forEach($scope.resultCollection, function (row) {
                            angular.forEach(row.all, function (all) {
                                var result = $filter('filter')($scope.enabled_dates, moment(all.created_at).format('YYYY-MM-DD'));
                                if (result.length == 0)
                                    $scope.enabled_dates.push(moment(all.created_at).format('YYYY-MM-DD'));
                            });
                        });
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patientnote!";
                    });
        }
        $scope.resetresultForm = function () {
            $scope.resultdata = {};
            $scope.resultdata.formtype = 'add';
        }

        $scope.updateResultFormRow = function (pat_result_id) {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientresults/" + pat_result_id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.resultdata = response;
                        $scope.resultdata.formtype = 'update';
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        }

        $scope.removeresultRow = function (pat_result_id) {
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Result?',
                bodyText: 'Are you sure you want to delete this result?'
            };
            modalService.showModal({}, modalOptions).then(function () {
                $scope.loadbar('show');
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + "/patientresults/remove",
                    data: {id: pat_result_id},
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadResultbypatient();
                                $scope.msg.successMessage = 'Patient Result Deleted Successfully';
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                );
            });
        };
        $scope.loadConsultantsList = function (date) {
            $scope.isLoading = true;
            // pagination set up
            $scope.consultantCollection = []; // base collection
            $scope.itemsByPage = 10; // No.of records per page
            $scope.displayedconsultantCollection = [].concat($scope.consultantCollection); // displayed collection

            if (typeof date == 'undefined') {
                url = $rootScope.IRISOrgServiceUrl + '/patientconsultant/getpatconsultantsbyencounter?patient_id=' + $state.params.id;
            } else {
                date = moment(date).format('YYYY-MM-DD');
                url = $rootScope.IRISOrgServiceUrl + '/patientconsultant/getpatconsultantsbyencounter?patient_id=' + $state.params.id + '&date=' + date;
            }

            // Get data's from service
            $http.get(url)
                    .success(function (patientconsultants) {
                        $scope.isLoading = false;
                        $scope.consultantCollection = patientconsultants.result;
                        $scope.displayedconsultantCollection = [].concat($scope.consultantCollection);
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patient consultant notes!";
                    });
        };
        $scope.initConsultantForm = function () {
            $scope.consFormData = {};
            $scope.consFormData.formtype = 'add';
            $scope.consFormData.consult_date = moment().format('YYYY-MM-DD HH:mm:ss');
            $timeout(function () {
                $scope.consFormData.consultant_id = $scope.data.consultant_id;
            }, 2000)
            $scope.loadConsultantsList();
        };
        $scope.saveConsultantForm = function (mode) {
            consData = $scope.consFormData;
            $scope.errorData = "";
            $scope.msg.successMessage = "";
            if (mode == 'add') {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientconsultants';
                method = 'POST';
                succ_msg = 'Consultant saved successfully';
                angular.extend(consData, {
                    encounter_id: $scope.enc.selected.encounter_id,
                    patient_id: $scope.patientObj.patient_id,
                });
            } else {
                post_url = $rootScope.IRISOrgServiceUrl + '/patientconsultants/' + consData.pat_consult_id;
                method = 'PUT';
                succ_msg = 'Consultant updated successfully';
            }
            consData.consult_date = moment(consData.consult_date).format('YYYY-MM-DD HH:mm:ss');
            $scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: consData,
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.msg.successMessage = succ_msg;
                        $scope.consFormData = {};
                        $scope.consFormData.formtype = 'add';
                        $scope.consFormData.consultant_id = $scope.data.consultant_id;
                        $timeout(function () {
                            $scope.loadConsultantsList();
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
        $scope.updateconsulRow = function (id) {
            $scope.loadbar('show');
            _that = this;
            $scope.errorData = "";
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientconsultants/" + id,
                method: "GET"
            }).success(
                    function (response) {
                        $scope.loadbar('hide');
                        $scope.consFormData = response;
                        $scope.consFormData.formtype = 'update';
                    }
            ).error(function (data, status) {
                $scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = $scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };
        $scope.resetconsultantForm = function () {
            $scope.consFormData = {};
            $scope.consFormData.formtype = 'add';
            $scope.consFormData.consultant_id = $scope.data.consultant_id;
        }

        $scope.removeconsultantRow = function (consult_id) {
            var modalOptions = {
                closeButtonText: 'No',
                actionButtonText: 'Yes',
                headerText: 'Delete Consultation Visit?',
                bodyText: 'Are you sure you want to delete this consultation visit?'
            };
            modalService.showModal({}, modalOptions).then(function (result) {
                $scope.loadbar('show');
                $http({
                    method: 'POST',
                    url: $rootScope.IRISOrgServiceUrl + "/patientconsultants/remove",
                    data: {id: consult_id},
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.loadConsultantsList();
                                $scope.msg.successMessage = 'Patient Consultation Visit Deleted Successfully';
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                );
            });
        };
        //Pat Consultant update issues
        $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var d = new Date();
            var n = d.getDate();
            var m = d.getMonth();
            var y = d.getFullYear();
            var today_date = (new Date(y, m, n)).valueOf(); //19

            var upto_date = (d.setDate(d.getDate() - 3)).valueOf(); // 17

            if ($scope.checkAccess('patient.backdateconsultant')) {
                angular.forEach($dates, function (date, key) {
                    var calender = new Date(date.localDateValue());
                    var calender_n = calender.getDate();
                    var calender_m = calender.getMonth();
                    var calender_y = calender.getFullYear();
                    var calender_date = (new Date(calender_y, calender_m, calender_n)).valueOf();
                    if (today_date < calender_date) {
                        $dates[key].selectable = false;
                    }
                });
            } else {
                angular.forEach($dates, function (date, key) {
                    var calender = new Date(date.localDateValue());
                    var calender_n = calender.getDate();
                    var calender_m = calender.getMonth();
                    var calender_y = calender.getFullYear();
                    var calender_date = (new Date(calender_y, calender_m, calender_n)).valueOf();
                    //Hide - Future and Past Dates
                    if (today_date != calender_date) {
                        $dates[key].selectable = false;
                    }
                });
            }
        }
        $scope.medicalcasecommonservice = function () {
            $rootScope.commonService.GetDiagnosisList(function (response) {
                var availableTags = [];
                angular.forEach(response.diagnosisList, function (diagnosis) {
                    availableTags.push(diagnosis.label);
                });
                $(".icd_code_autocomplete").autocomplete({
                    source: availableTags,
                });
            });
        }

        $scope.initmedicalhistory = function () {
            $scope.getAllPastmedical();
            $scope.getMCHdocument();
            $scope.getDocumentType(function (doc_type_response) {
                if (doc_type_response.success == false) {
                    alert("Sorry, you can't create a document");
                    $state.go("patient.prescription", {id: $state.params.id});
                } else {
                    $scope.medical_history = 'form';
                    $scope.xslt = doc_type_response.result.document_xslt;
                    $scope.$watch('patientObj', function (newValue, oldValue) {
                        if (Object.keys(newValue).length > 0) {
                            $scope.initMedicalSaveDocument($scope.enc.selected.encounter_id, function (auto_save_document) {
                                $scope.encounter = {encounter_id: $scope.enc.selected.encounter_id};
                                $scope.xml = auto_save_document.data.xml;
                                $scope.doc_id = auto_save_document.data.doc_id; // Set Document id
                                $timeout(function () {
                                    $scope.medicalcasecommonservice();
                                    $scope.ckeditorReplace();
                                }, 2000);
                                $timeout(function () {
                                    $("#patient-details").parent().hide();
                                }, 1500);
                                $scope.medicalAutoSaveStart(auto_save_document.data.doc_id);
                            });
                        }
                    }, true);
                }
            });
        }

        $scope.getMCHdocument = function () {
            $scope.data.current_mch_id = '';
            $http.get($rootScope.IRISOrgServiceUrl + '/patientprescription/getmchdocument?patient_id=' + $state.params.id)
                    .success(function (pastmedical) {
                        $scope.MCHdocument = pastmedical.result;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patient medical history!";
                    });
        }

        $scope.getdocumentdetails = function () {
            $scope.view_xml = '';
            if ($scope.data.current_mch_id) {
                $scope.getDocumentType(function (doc_type_response) {
                    if (doc_type_response.success == false) {
                        $scope.isLoading = false;
                        alert("Sorry, you can't view a document");
                        $state.go("patient.document", {id: $state.params.id});
                    } else {
                        $scope.viewxslt = doc_type_response.result.document_out_xslt;
                        $scope.getDocument($scope.data.current_mch_id, function (pat_doc_response) {
                            $scope.encounter = {encounter_id: pat_doc_response.result.encounter_id};
                            $scope.test_view_xml = pat_doc_response.result.document_xml;
                            $scope.loadResultFromDatabase($scope.test_view_xml, function (resultxml) {
                                $scope.loadVitalsFromDatabase(resultxml, false, function (newxml) {
                                    $scope.view_xml = newxml;
                                    $timeout(function () {
                                        $scope.setRefferedBy();
                                        $scope.checkmedicalcaseemptyrow('print_medical_case');
                                    }, 100);
                                });
                            });
                        });
                    }
                });
            }
        }

        $scope.getAllPastmedical = function () {
            $http.get($rootScope.IRISOrgServiceUrl + '/patientprescription/getpastmedicalhistory?patient_id=' + $state.params.id)
                    .success(function (pastmedical) {
                        $scope.pastMedical = pastmedical.result;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patient medical history!";
                    });
        }

        var stop;
        $scope.medicalAutoSaveStart = function (doc_id) {
            // Don't start a new fight if we are already fighting
            if (angular.isDefined(stop))
                return;
            stop = $interval(function () {
                $scope.ckeditorupdate();
                _data = $('#xmlform').serializeArray();
                _data.push({
                    name: 'encounter_id',
                    value: $scope.encounter.encounter_id,
                }, {
                    name: 'patient_id',
                    value: $state.params.id,
                }, {
                    name: 'novalidate',
                    value: true,
                }, {
                    name: 'doc_id',
                    value: doc_id,
                });
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/patientprescription/savemedicaldocument",
                    method: "POST",
//                    transformRequest: transformRequestAsFormPost,
                    data: _data
                });
            }, 60000);
        };
        $scope.medicalAutoSaveStop = function () {
            if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
            }
        };
        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $scope.medicalAutoSaveStop();
        });
        $scope.getDocumentType = function (callback) {
            $http.get($rootScope.IRISOrgServiceUrl + '/patientdocuments/getdocumenttype?doc_type=MCH')
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

        $scope.savemedicalForm = function () {
            $scope.ckeditorupdate();
            _data = $('#xmlform').serializeArray();
            _data.push({
                name: 'encounter_id',
                value: $scope.encounter.encounter_id,
            }, {
                name: 'patient_id',
                value: $state.params.id,
            }, {
                name: 'doc_id',
                value: $scope.doc_id,
            }, {
                name: 'novalidate',
                value: false,
            });
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientprescription/savemedicaldocument",
                method: "POST",
                data: _data,
            }).then(
                    function (response) {
                        $scope.loadbar('hide');
                        if (response.data.success == true) {
                            $scope.msg.successMessage = 'Document Saved Successfully';
                            $scope.medical_history = 'index';
                            $scope.errorData = '';
                            //$scope.initmedicalhistory();
                            $scope.loadmedicalcasehistory();
                            $('#xmlform')[0].reset();
                        } else {
                            $scope.errorData = response.data.message;
                            $anchorScroll();
                        }
                    }
            );
        }



        $scope.clearmedicalForm = function () {
            $scope.medical_history = 'index';
            $('#xmlform')[0].reset();
            $scope.errorData = '';
        }

        $scope.loadmedicalcasehistory = function () {
            $scope.isLoading = true;
            $scope.medicalAutoSaveStop();
            $('html, body').animate({
                scrollTop: 0
            }, 'fast');
            $scope.MCHCollection = [];
            $scope.medical_history = 'index';
            $http.get($rootScope.IRISOrgServiceUrl + '/patientprescription/getpatientdocuments?patient_id=' + $state.params.id)
                    .success(function (documents) {
                        $scope.isLoading = false;
                        $scope.MCHCollection = documents.result;
                    })
                    .error(function () {
                        $scope.errorData = "An Error has occured while loading patient documents!";
                    });
        }

        $scope.Updatemedicaldocument = function (doc_id) {
            $scope.getAllPastmedical();
            $scope.getMCHdocument();
            $scope.getDocumentType(function (doc_type_response) {
                if (doc_type_response.success == false) {
                    $scope.isLoading = false;
                    alert("Sorry, you can't update a document");
                } else {
                    $scope.medical_history = 'form';
                    $scope.xslt = doc_type_response.result.document_xslt;
                    $scope.getDocument(doc_id, function (pat_doc_response) {
                        $scope.encounter = {encounter_id: pat_doc_response.result.encounter_id};
                        $scope.test_xml = pat_doc_response.result.document_xml;
                        $scope.loadResultFromDatabase($scope.test_xml, function (resultxml) {
                            $scope.loadVitalsFromDatabase(resultxml, true, function (newxml) {
                                $scope.xml = newxml;
                                $scope.doc_id = doc_id; // Set Document id
                                $timeout(function () {
                                    $scope.medicalcasecommonservice();
                                    $scope.ckeditorReplace();
                                }, 2000);
                                $timeout(function () {
                                    $("#patient-details").parent().hide();
                                }, 200);
                                $scope.medicalAutoSaveStart(doc_id);
                            });
                        });
                    });
                }
            });
        }

        $scope.loadResultFromDatabase = function (xml, callback) {
            var _data = {};
            angular.extend(_data, {
                xml: xml,
                encounter: $scope.encounter.encounter_id,
                table_id: 'RGprevprescription'
            });
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientprescription/loadprescriptionvaluefromdatabase",
                method: "POST",
                data: _data,
            }).then(
                    function (response) {
                        callback(response.data);
                    }
            );
        }

        $scope.loadVitalsFromDatabase = function (xml, vital_action, callback) {
            var _data = {};
            angular.extend(_data, {
                xml: xml,
                encounter: $scope.encounter.encounter_id,
                table_id: 'RGvital',
                add_vital: vital_action,
            });
            $http({
                url: $rootScope.IRISOrgServiceUrl + "/patientprescription/loadvitalvaluefromdatabase",
                method: "POST",
                data: _data,
            }).then(
                    function (response) {
                        callback(response.data);
                    }
            );
        }

        $scope.getDocument = function (doc_id, callback) {
            $http.get($rootScope.IRISOrgServiceUrl + '/patientdocuments/getdocument?doc_id=' + doc_id)
                    .success(function (response) {
                        callback(response);
                    }, function (x) {
                        response = {success: false, message: 'Server Error'};
                        callback(response);
                    });
        }

        $scope.Setempty_tab = function () {
            $scope.errorData = '';
            $scope.successMessage = '';
            $scope.msg.successMessage = '';
            $scope.msg.errorMessage = '';
        }

        $("body").on("click", ".MCHaddMore", function () {
            if (!jQuery.isEmptyObject($scope.encounter_id)) {
                $scope.spinnerbar('show');
                var button_id = $(this).attr('id');
                var table_id = $(this).data('table-id');
                var rowCount = $('#' + table_id + ' tbody  tr').length;
                //var firstMsg = $('#' + table_id).find("tr:last");
                //var curOffset = firstMsg.offset().top - $(document).scrollTop();
                $scope.ckeditorupdate();
                _data = $('#xmlform').serializeArray();
                _data.push({
                    name: 'encounter_id',
                    value: $scope.enc.selected.encounter_id,
                }, {
                    name: 'patient_id',
                    value: $state.params.id,
                }, {
                    name: 'button_id',
                    value: button_id,
                }, {
                    name: 'table_id',
                    value: table_id,
                }, {
                    name: 'rowCount',
                    value: rowCount,
                }, {
                    name: 'novalidate',
                    value: true,
                }, {
                    name: 'doc_id',
                    value: $scope.doc_id,
                });
                $http({
                    url: $rootScope.IRISOrgServiceUrl + "/patientprescription/savemedicaldocument",
                    method: "POST",
                    data: _data,
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success == true) {
                                $scope.xml = response.data.xml;
                                $timeout(function () {
                                    $scope.medicalcasecommonservice();
                                }, 2000);
                                $timeout(function () {
                                    angular.forEach($scope.panel_bars, function (bar) {
                                        if (bar.opened) {
                                            $('#' + bar.div)
                                                    .siblings('.panel-heading')
                                                    .find('i')
                                                    .removeClass("fa-angle-right")
                                                    .addClass("fa-angle-down");
                                            $('#' + bar.div)
                                                    .toggleClass('collapse in')
                                                    .attr('aria-expanded', true)
                                                    .removeAttr("style");
                                        } else {
                                            $('#' + bar.div)
                                                    .toggleClass('collapse')
                                                    .attr('aria-expanded', false);
                                        }
                                    });
                                    $scope.ckeditorReplace();
                                    var firstMsg = $('#' + table_id).find("tr:last");
                                    //$(document).scrollTop(firstMsg.offset().top - curOffset);
                                    $scope.spinnerbar('hide');
                                }, 500);
                            } else {
                                $scope.spinnerbar('hide');
                                $scope.errorData = response.data.message;
                                $anchorScroll();
                            }
                        }
                );
            }

        });
        //Delete
        $scope.deleteDocument = function (doc_id) {
            URL = $rootScope.IRISOrgServiceUrl + "/patientdocuments/remove";
            var conf = confirm('Are you sure to delete ?');
            if (conf) {
                $scope.loadbar('show');
                $http({
                    url: URL,
                    method: "POST",
                    data: {doc_id: doc_id}
                }).then(
                        function (response) {
                            $scope.loadbar('hide');
                            if (response.data.success === true) {
                                $scope.successMessage = 'Document Deleted Successfully';
                                $scope.loadmedicalcasehistory();
                            } else {
                                $scope.errorData = response.data.message;
                            }
                        }
                )
            }
        };
        $scope.ckeditorupdate = function () {
            for (instance in CKEDITOR.instances)
                CKEDITOR.instances[instance].updateElement();
        };
        $scope.printMedicaldocument = function (doc_id) {
            $scope.printxslt = '';
            $scope.getDocumentType(function (doc_type_response) {
                if (doc_type_response.success == false) {
                    $scope.isLoading = false;
                    alert("Sorry, you can't view a document");
                } else {
                    $scope.printxslt = doc_type_response.result.document_out_print_xslt;
                    $scope.getDocument(doc_id, function (pat_doc_response) {
                        $scope.created_by = pat_doc_response.result.created_user;
                        $scope.created_at = pat_doc_response.result.created_at;
                        $scope.modified_at = pat_doc_response.result.modified_at;
                        $scope.encounter = {encounter_id: pat_doc_response.result.encounter_id};
                        $scope.test_xml = pat_doc_response.result.document_xml;
                        $scope.loadResultFromDatabase($scope.test_xml, function (resultxml) {
                            $scope.loadVitalsFromDatabase(resultxml, false, function (newxml) {
                                $scope.xml = newxml;
                            });
                        });
                        $timeout(function () {
                            $scope.setRefferedBy();
                        }, 100);
                        $timeout(function () {
                            $scope.checkmedicalcaseemptyrow('medical_case_history');
                            $scope.printElement();
                        }, 1000);
                    });
                }
            });
        }

        $scope.printElement = function () {
            $('#printMedicaldocument').printThis({
                pageTitle: "",
                debug: false,
                importCSS: false,
                importStyle: false,
                loadCSS: [$rootScope.IRISOrgUrl + "/css/print.css"],
            });
        }

        $scope.ckeditorReplace = function () {
            CKEDITOR.replaceAll('classy-edit');
            CKEDITOR.config.disableNativeSpellChecker = true,
                    CKEDITOR.config.scayt_autoStartup = true
            CKEDITOR.config.toolbar = [
                ['Styles', 'Format', 'Font', 'FontSize', 'spellchecker'],
                ['Bold', 'Italic', 'Underline', 'StrikeThrough', '-', 'Undo', 'Redo', '-', 'Cut', 'Copy', 'Paste', 'Find', 'Replace', '-', 'Outdent', 'Indent', '-', 'Print'],
                ['NumberedList', 'BulletedList', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
                ['-', 'Link', 'Flash', 'Smiley', 'TextColor', 'BGColor', 'Source', '-', 'SpellChecker', 'Scayt']
            ];
            CKEDITOR.config.toolbarGroups = [

                {name: 'editing', groups: ['find', 'selection', 'spellchecker']},
            ];
        };
        $scope.Calculatebmi = function () {
            if ($scope.vitaldata.height && $scope.vitaldata.weight) {
                $scope.vitaldata.bmi = (($scope.vitaldata.weight / $scope.vitaldata.height / $scope.vitaldata.height) * 10000).toFixed(2);
            }
        }

        $scope.viewMedicaldocument = function (doc_id) {
            $scope.getAllPastmedical();
            $scope.getDocumentType(function (doc_type_response) {
                if (doc_type_response.success == false) {
                    $scope.isLoading = false;
                    alert("Sorry, you can't view a document");
                    $state.go("patient.document", {id: $state.params.id});
                } else {
                    $scope.viewxslt = doc_type_response.result.document_out_xslt;
                    $scope.printxslt = doc_type_response.result.document_out_print_xslt;
                    $scope.getDocument(doc_id, function (pat_doc_response) {
                        $scope.medical_history = 'view';
                        $scope.created_by = pat_doc_response.result.created_user;
                        $scope.created_at = pat_doc_response.result.created_at;
                        $scope.modified_at = pat_doc_response.result.modified_at;
                        $scope.encounter = {encounter_id: pat_doc_response.result.encounter_id};
                        $scope.test_view_xml = pat_doc_response.result.document_xml;
                        $scope.loadResultFromDatabase($scope.test_view_xml, function (resultxml) {
                            $scope.loadVitalsFromDatabase(resultxml, false, function (newxml) {
                                $scope.view_xml = newxml;
                                $timeout(function () {
                                    $scope.setRefferedBy();
                                }, 100);
                            });
                        });
                    });
                }
            });
        }

        $scope.printMedicalcasedocument = function () {
            $timeout(function () {
                $scope.setRefferedBy();
            }, 10);
            $scope.checkmedicalcaseemptyrow('medical_case_history');
            $('#printCasedocument').printThis({
                pageTitle: "",
                debug: false,
                importCSS: false,
                importStyle: false,
                loadCSS: [$rootScope.IRISOrgUrl + "/css/print.css"],
            });
        }

        $scope.setRefferedBy = function () {
            $(".classy-edit").each(function () {
                $(this).removeClass("form-control");
                $(this).html($(this).text());
            });
            var created_by = $scope.created_by;
            var date = new Date($scope.modified_at);
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var output = (('' + day).length < 2 ? '0' : '') + day + '/' +
                    (('' + month).length < 2 ? '0' : '') + month + '/' +
                    date.getFullYear();
            var create_date = new Date($scope.created_at);
            var create_month = create_date.getMonth() + 1;
            var create_day = create_date.getDate();
            var create_output = (('' + create_day).length < 2 ? '0' : '') + create_day + '/' +
                    (('' + create_month).length < 2 ? '0' : '') + create_month + '/' +
                    create_date.getFullYear();
            var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
            var am_pm = date.getHours() >= 12 ? "PM" : "AM";
            hours = hours < 10 ? "0" + hours : hours;
            var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
            //var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
            time = hours + ":" + minutes + am_pm;
            $timeout(function () {
                $('#created_name').html(created_by);
                $('#created_date').html(create_output);
                $('#date_name').html(output);
                $('#time').html(time);
            }, 100);
        }

        $scope.updatePastmedical = function ($data, past_medical_id) {
            angular.extend($data, {
                pat_past_medical_id: past_medical_id,
            });
            $http({
                method: 'POST',
                url: $rootScope.IRISOrgServiceUrl + '/patientprescription/updatepastmedical',
                data: $data,
            });
        }

// Prescription - Frequency Tab Navigation.
        var acDefaultOptions = {minimumChars: 0, activateOnFocus: true, positionUsingJQuery: false};
        $scope.autoCompleteOptions_3_0 = angular.extend({}, acDefaultOptions, {
            data: function (searchText) {
                return $scope.fillFrequency3[0];
            }
        });
        $scope.autoCompleteOptions_3_1 = angular.extend({}, acDefaultOptions, {
            data: function (searchText) {
                return $scope.fillFrequency3[1];
            }
        });
        $scope.autoCompleteOptions_3_2 = angular.extend({}, acDefaultOptions, {
            data: function (searchText) {
                return $scope.fillFrequency3[2];
            }
        });
        $scope.autoCompleteOptions_4_0 = angular.extend({}, acDefaultOptions, {
            data: function (searchText) {
                return $scope.fillFrequency4[0];
            }
        });
        $scope.autoCompleteOptions_4_1 = angular.extend({}, acDefaultOptions, {
            data: function (searchText) {
                return $scope.fillFrequency4[1];
            }
        });
        $scope.autoCompleteOptions_4_2 = angular.extend({}, acDefaultOptions, {
            data: function (searchText) {
                return $scope.fillFrequency4[2];
            }
        });
        $scope.autoCompleteOptions_4_3 = angular.extend({}, acDefaultOptions, {
            data: function (searchText) {
                return $scope.fillFrequency4[3];
            }
        });
        $scope.autoCompleteOptionsNoofdays = angular.extend({}, acDefaultOptions, {
            data: function (searchText) {
                return $scope.fillNoofdays;
            }
        });
//        var ps_typeahead_content = ''; //ps - current prescription search
//        $scope.psTypeaheadKeyup = function (event, ng_model_name) {
//            ps_typeahead_content = $scope['globalData'][ng_model_name];
//        }
//        $scope.psTypeaheadKeydown = function (event, ng_model_name, next_model_id) {
//            if (event.keyCode === 9) {
//                $scope['globalData'][ng_model_name] = ps_typeahead_content;
//                ps_typeahead_content = '';
//                if (!event.shiftKey) { //Tab forward move 
//                    $timeout(function () {
//                        angular.element(document.querySelector('#'+next_model_id))[0].focus();
//                    }, 100);
//                }
//            }
//        }
//Not Used

//        $scope.loadSideMenu = function () {
//            $scope.presc_right.notedata = {};
//            $scope.presc_right.vitaldata = {};
//            //Get Notes
//            $http.get($rootScope.IRISOrgServiceUrl + '/patientnotes/getpatientnotes?patient_id=' + $state.params.id)
//                    .success(function (notes) {
//
//                        $scope.child.notes = [];
//                        angular.forEach(notes.result, function (result) {
//                            angular.forEach(result.all, function (note) {
//                                $scope.child.notes.push(note);
//                            });
//                        });
////                        var unseen = $filter('filter')($scope.child.notes, {seen_by: 0});
////                        $scope.unseen_notes = unseen.length;
//                        $scope.unseen_notes = notes.usernotes;
//                        $scope.unseen_notes_count = notes.usernotes.length;
//                        angular.forEach($scope.child.notes, function (note) {
//                            note.seen_by = 1;
//                        });
//                        angular.forEach(notes.usernotes, function (note) {
//                            seen_filter_note = $filter('filter')($scope.child.notes, {pat_note_id: note.note_id});
//                            if (seen_filter_note.length > 0) {
//                                seen_filter_note[0].seen_by = 0;
//                            }
//                        });
////                        //groupBy for reverse order keep - Nad
////                        $scope.grouped.notes = [];
////                        $scope.grouped.notes = $filter('groupBy')($scope.child.notes, 'created_date');
////                        $scope.grouped.notes = Object.keys($scope.grouped.notes)
////                                .map(function (key) {
////                                    return $scope.grouped.notes[key];
////                                });
//                    })
//                    .error(function () {
//                        $scope.errorData = "An Error has occured while loading patientnote!";
//                    });
//            //Get Vitals
//            $http.get($rootScope.IRISOrgServiceUrl + '/patientvitals/getpatientvitals?addtfields=eprvitals&patient_id=' + $state.params.id)
//                    .success(function (vitals) {
//                        $scope.child.vitals = [];
//                        angular.forEach(vitals.result, function (result) {
//                            angular.forEach(result.all, function (vital) {
//                                $scope.child.vitals.push(vital);
//                            });
//                        });
//                        $scope.unseen_vitals = vitals.uservitals;
//                        $scope.unseen_vitals_count = vitals.uservitals.length;
//                        angular.forEach($scope.child.vitals, function (vital) {
//                            vital.seen_by = 1;
//                        });
//                        angular.forEach(vitals.uservitals, function (vital) {
//                            seen_filter_vital = $filter('filter')($scope.child.vitals, {vital_id: vital.vital_id});
//                            if (seen_filter_vital.length > 0) {
//                                seen_filter_vital[0].seen_by = 0;
//                            }
//                        });
//                    })
//                    .error(function () {
//                        $scope.errorData = "An Error has occured while loading patientvitals!";
//                    });
//            //Get Fav
//            $scope.getFav();
//        }
//        $scope.changeFreqMask = function (key, freq) {
//            $('.freq_div_' + key).addClass('hide');
//            $('.change_mask_' + key).addClass('hide');
//            $('#freq_' + key + '_' + freq).removeClass('hide');
//            $('.change_mask_' + key + ':not("#change_mask_' + key + '_' + freq + '")').removeClass('hide');
//            $scope.data.prescriptionItems[key].frequency = $('#freq_' + key + '_' + freq + ' input').val();
//            $scope.data.prescriptionItems[key].freqMaskCount = freq;
//            $scope.data.prescriptionItems[key].qty = $scope.calculate_qty($scope.data.prescriptionItems[key].frequency, $scope.data.prescriptionItems[key].number_of_days, $scope.data.prescriptionItems[key].product_description_id);
//            $('#qty_div_' + key + ' input').val($scope.data.prescriptionItems[key].qty);
//            $scope.data.prescriptionItems[key].total = $scope.calculate_price($scope.data.prescriptionItems[key].qty, $scope.data.prescriptionItems[key].price);
//            $scope.data.prescriptionItems[key].in_stock = (parseInt($scope.data.prescriptionItems[key].available_quantity) > parseInt($scope.data.prescriptionItems[key].qty));
//        }

//        $scope.greaterThan = function (prop, val) {
//            return function (item) {
//                return item[prop] > val;
//            }
//        }
//
//        $scope.lesserThan = function (prop, val) {
//            return function (item) {
//                return item[prop] <= val;
//            }
//        }

//PRINT Prescription
//        $scope.printHeader = function () {
//            return {
//                text: "Prescription",
//                margin: 5,
//                alignment: 'center'
//            };
//        }
//
//        $scope.printFooter = function () {
//            return {
//                text: "Printed Date : " + moment($scope.current_time).format('DD-MM-YYYY HH:mm'),
//                margin: 5,
//                alignment: 'center'
//            };
//        }
//
//        $scope.printStyle = function () {
//            return {
//                header: {
//                    bold: true,
//                    color: '#000',
//                    fontSize: 11,
//                    margin: [0, 5, 0, 0]
//                },
//                demoTable: {
//                    color: '#000',
//                    fontSize: 10
//                },
//                tableRows: {
//                    margin: [0, 10, 0, 10]
//                }
//            };
//        }
//
//        $scope.printloader = '';
//        $scope.printContent = function () {
//            var content = [];
//            var prescInfo = [];
//            var prescItems = [];
//
//            var items = $scope.prescriptionItems2;
//            prescItems.push([
//                {
//                    text: 'Description',
//                    style: 'header'
//                },
//                {
//                    image: $scope.imgExport('weather1'),
//                    width: 25
//                },
//                {
//                    image: $scope.imgExport('weather2'),
//                    width: 25
//                },
//                {
//                    image: $scope.imgExport('weather3'),
//                    width: 25
//                },
//                {
//                    image: $scope.imgExport('weather4'),
//                    width: 25
//                },
//                {
//                    image: $scope.imgExport('weather4'),
//                    width: 25
//                },
//                {
//                    text: 'Remarks',
//                    style: 'header'
//                },
//            ]);
//
//            angular.forEach(items, function (item, key) {
//                var freq_0 = $scope.getFrequencyExists(item.frequency, 0);
//                var freq_1 = $scope.getFrequencyExists(item.frequency, 1);
//                var freq_2 = $scope.getFrequencyExists(item.frequency, 2);
//                var freq_3 = $scope.getFrequencyExists(item.frequency, 3);
//                var freq_4 = $scope.getFrequencyExists(item.frequency, 4);
//                prescItems.push([
//                    {
//                        text: item.product_name + "(" + item.number_of_days + " days)",
//                        style: "tableRows"
//                    },
//                    {
//                        alignment: 'center',
//                        text: freq_0,
//                        style: "tableRows"
//                    },
//                    {
//                        alignment: 'center',
//                        text: freq_1,
//                        style: "tableRows"
//                    },
//                    {
//                        alignment: 'center',
//                        text: freq_2,
//                        style: "tableRows"
//                    },
//                    {
//                        alignment: 'center',
//                        text: freq_3,
//                        style: "tableRows"
//                    },
//                    {
//                        alignment: 'center',
//                        text: freq_4,
//                        style: "tableRows"
//                    },
//                    {
//                        text: (item.remarks ? item.remarks : '-'),
//                        style: "tableRows"
//                    }
//                ]);
//            });
//
//            prescInfo.push({
//                columns: [
//                    {},
//                    {
//                        image: $("#patient_barcode").attr('src'),
//                        width: 180,
//                        margin: [20, 20, 20, 20]
//                    }
//                ]
//            }, {
//                columns: [
//                    {
//                        text: [
//                            {text: $scope.patientObj.fullname + "(" + $scope.patientObj.patient_age + " yrs)", bold: true},
//                        ],
//                        margin: [0, 0, 0, 30]
//                    },
//                    {
//                        alignment: 'right',
//                        text: [
//                            {text: ' Date :', bold: true},
//                            moment($scope.data2.pres_date).format('DD-MM-YYYY HH:mm')
//
//                        ],
//                        margin: [0, 0, 0, 30]
//                    }
//                ]
//            }, {
//                style: 'demoTable',
//                table: {
//                    headerRows: 1,
//                    widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto', '*'],
//                    body: prescItems,
//                }
//            }, {
//                columns: [
//                    {},
//                    {
//                        alignment: 'right',
//                        text: [
//                            {text: ' Next Review :', bold: true},
//                            moment($scope.data2.next_visit).format('DD-MM-YYYY')
//                        ],
//                        margin: [0, 20, 0, 0]
//                    }
//                ]
//            });
//            content.push(prescInfo);
//            return content;
//        }

    }]);
// Filter HTML Code
app.filter("sanitize", ['$sce', function ($sce) {
        return function (htmlCode) {
            return $sce.trustAsHtml(htmlCode);
        }
    }]);