app.controller('ProductModalInstanceCtrl', ['scope', '$scope', '$modalInstance', '$rootScope', '$timeout', '$http', function (scope, $scope, $modalInstance, $rootScope, $timeout, $http) {
        $scope.data = {};
        $scope.popupdata = {};
        $scope.product_type = false;
        $scope.product_unit = false;
        $scope.addBrandname = false;
        $scope.adddivision = false;
        //$scope.countries = scope.countries;

        //$scope.data.country_id = country_id;

        $rootScope.commonService.GetProductUnitsList('1', false, function (response) {
            $scope.productUnits = response.productunitlist;
        });

        // Product Description list
        $rootScope.commonService.GetProductDescriptionList('', '1', false, function (response) {
            $scope.productDescriptions = response.productDescriptionList;
        });

        // Brand list
        $rootScope.commonService.GetBrandsList('', '1', false, function (response) {
            $scope.brands = response.brandList;
        });

        // Division list
        $rootScope.commonService.GetDivisionsList('', '1', false, function (response) {
            $scope.divisions = response.divisionList;
        });

        // Generic list
        $rootScope.commonService.GetGenericList('', '1', false, false, function (response) {
            $scope.generics = response.genericList;
        });

        // Drug Class list
        $rootScope.commonService.GetDrugClassList('', '1', false, false, function (response) {
            $scope.drugClasses = response.drugList;
        });

        $rootScope.commonService.GetVatList('', '1', false, function (response) {
            $scope.vats = response.vatList;
        });
        $scope.saveForm = function () {
            _that = this;
            _that.data.purchase_vat_id = (typeof ($scope.vats[0]) != "undefined" && $scope.vats[0] !== null) ? $scope.vats[0].vat_id : '';
            _that.data.sales_vat_id = (typeof ($scope.vats[0]) != "undefined" && $scope.vats[0] !== null) ? $scope.vats[0].vat_id : '';

            $scope.errorData = "";
            scope.msg.successMessage = "";

            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyproduct/saveprescriptionproduct';
            method = 'POST';
            succ_msg = 'Product saved successfully';

            scope.loadbar('show');
            $http({
                method: method,
                url: post_url,
                data: _that.data,
            }).success(
                    function (response) {
                        scope.loadbar('hide');
                        if (response.success == true) {
                            scope.msg.successMessage = succ_msg;
                            $scope.data = {};
                            $timeout(function () {
                                scope.afterdrugAdded(response.drug, response.generic_id, response.product_id);
                                $modalInstance.dismiss('cancel');
                            }, 1000)
                        } else {
                            $scope.errorData = response.message;
                        }
                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
        };

        $scope.showDrugDropdown = false;
        $scope.getDrugByGeneric = function () {
            $scope.errorData = "";
            if ($scope.data.generic_id) {
                $http({
                    url: $rootScope.IRISOrgServiceUrl + '/pharmacydrugclass/getdrugbygeneric?generic_id=' + $scope.data.generic_id,
                    method: "GET",
                }).then(
                        function (response) {
                            if (response.data.drug) {
                                $scope.data.drug_name = response.data.drug.drug_name;
                                $scope.data.drug_class_id = response.data.drug.drug_class_id;
                                $scope.showDrugDropdown = false;
                            } else {
                                $scope.data.drug_name = '';
                                $scope.data.drug_class_id = '';
                                $scope.showDrugDropdown = true;
                            }
                        }
                );
            } else {
                $scope.data.drug_name = '';
                $scope.data.drug_class_id = '';
                $scope.showDrugDropdown = false;
            }
        }

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.openProductunit = function () {
            $scope.product_unit = true;
        }

        $scope.productunitCancel = function () {
            $scope.product_unit = false;
        }

        $scope.addProductunit = function () {
            description = {
                status: '1',
                product_unit: $scope.popupdata.product_unit
            };
            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyproductunits';
            method = 'POST';
            succ_msg = 'Product Unit saved successfully';

            $http({
                method: method,
                url: post_url,
                data: description,
            }).success(
                    function (response) {
                        scope.msg.successMessage = succ_msg;
                        $scope.popupdata = {};
                        $timeout(function () {
                            $scope.productUnits.push(response);
                            $scope.data.product_unit = response.product_unit;
                        }, 100)

                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });

            $scope.product_unit = false;
        }

        $scope.openProducttype = function () {
            $scope.product_type = true;
        }

        $scope.productCancel = function () {
            $scope.product_type = false;
        }

        $scope.addProduct = function () {
            description = {
                status: '1',
                description_name: $scope.popupdata.textdescription_name
            };
            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacyprodescs';
            method = 'POST';
            succ_msg = 'Brand Division saved successfully';

            $http({
                method: method,
                url: post_url,
                data: description,
            }).success(
                    function (response) {
                        scope.msg.successMessage = succ_msg;
                        $scope.popupdata = {};
                        $timeout(function () {
                            $scope.productDescriptions.push(response);
                            $scope.data.product_description_id = response.description_id;
                        }, 100)

                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });

            $scope.product_type = false;
        }

        $scope.brandCancel = function () {
            $scope.addBrandname = false;
        }

        $scope.openBrandtextbox = function () {
            $scope.addBrandname = true;
        }

        $scope.addBrand = function (name, code) {
            brand = {
                status: '1',
                brand_name: $scope.popupdata.textbrand_name,
                brand_code: $scope.popupdata.brand_code
            };
            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacybrands';
            method = 'POST';
            succ_msg = 'Brand saved successfully';

            $http({
                method: method,
                url: post_url,
                data: brand,
            }).success(
                    function (response) {
                        scope.msg.successMessage = succ_msg;
                        $scope.popupdata = {};
                        $timeout(function () {
                            $scope.brands.push(response);
                            $scope.data.brand_id = response.brand_id;
                        }, 1000)

                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
            $scope.addBrandname = false;
        }
        $scope.openDivisiontextbox = function () {
            $scope.adddivision = true;
        }
        $scope.divisionCancel = function () {
            $scope.adddivision = false;
        }
        $scope.addDivision = function (value) {
            division = {
                status: '1',
                division_name: $scope.popupdata.textdivision_name,
            };
            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacybranddivisions';
            method = 'POST';
            succ_msg = 'Brand Division saved successfully';

            $http({
                method: method,
                url: post_url,
                data: division,
            }).success(
                    function (response) {
                        scope.msg.successMessage = succ_msg;
                        $scope.popupdata = {};
                        $timeout(function () {
                            $scope.divisions.push(response);
                            $scope.data.division_id = response.division_id;
                        }, 100)

                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
            $scope.adddivision = false;
            $('#division_name_textbox').val('');
        }
        $scope.openGenerictextbox = function () {
            $scope.addgeneric = true;
        }
        $scope.genericCancel = function () {
            $scope.addgeneric = false;
        }
        $scope.addGeneric = function (value) {
            generic = {
                status: '1',
                generic_name: $scope.popupdata.textgeneric_name,
            };
            post_url = $rootScope.IRISOrgServiceUrl + '/genericnames';
            method = 'POST';
            succ_msg = 'GenericName saved successfully';

            $http({
                method: method,
                url: post_url,
                data: generic,
            }).success(
                    function (response) {
                        scope.msg.successMessage = succ_msg;
                        $scope.popupdata = {};
                        $timeout(function () {
                            $scope.generics.push(response);
                            $scope.data.generic_id = response.generic_id;
                            $scope.data.drug_name = '';
                            $scope.data.drug_class_id = '';
                            $scope.showDrugDropdown = true;
                        }, 100)

                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
            $scope.addgeneric = false;
            $('#textgeneric_name').val('');
        }
        $scope.openDrugtextbox = function () {
            $scope.adddrug = true;
        }
        $scope.drugCancel = function () {
            $scope.adddrug = false;
        }
        $scope.addDrug = function (value) {
            drug = {
                status: '1',
                drug_name: $scope.popupdata.textdrug_name,
            };
            post_url = $rootScope.IRISOrgServiceUrl + '/pharmacydrugclasses';
            method = 'POST';
            succ_msg = 'DrugName saved successfully';

            $http({
                method: method,
                url: post_url,
                data: drug,
            }).success(
                    function (response) {
                        scope.msg.successMessage = succ_msg;
                        $scope.popupdata = {};
                        $timeout(function () {
                            $scope.drugClasses.push(response);
                            $scope.data.drug_class_id = response.drug_class_id;
                        }, 100)
                    }
            ).error(function (data, status) {
                scope.loadbar('hide');
                if (status == 422)
                    $scope.errorData = scope.errorSummary(data);
                else
                    $scope.errorData = data.message;
            });
            $scope.adddrug = false;
            $('#drug_name_textbox').val('');
        }
    }]);
  