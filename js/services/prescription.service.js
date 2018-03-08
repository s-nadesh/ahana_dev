'use strict';

angular.module('app').factory('PrescriptionService', PrescriptionService);

PrescriptionService.$inject = ['$http', '$cookieStore', '$rootScope', '$window', '$localStorage', '$filter'];
function PrescriptionService($http, $cookieStore, $rootScope, $window, $localStorage, $filter) {
    var prescription_patient_id;
    var items = [];
    var mainitems = [];

    return {
        setPatientId: function (id) {
            if (prescription_patient_id) {
                if (prescription_patient_id != id) {
                    items.length = 0;
                    prescription_patient_id = id;
                }
            } else {
                prescription_patient_id = id;
            }
        },
        getPrescriptionItems: function () {
            if (items.length > 0) {
                // convert available_quantity to type Number to make to orderBy to work as it should.
                angular.forEach(items, function (item) {
                    item.available_quantity = parseFloat(item.available_quantity);
                });
                
//                //Separate 0 qty products.
//                var zero_qty_products = [];
//                //Remove 0 qty products in the array
//                for (var i = items.length - 1; i >= 0; i--) {
//                    if (items[i].available_quantity <= 0) {
//                        zero_qty_products.push(items[i]);
//                        items.splice(i, 1);
//                    }
//                }
//                //push 0 qty products at top of the array
//                angular.forEach(zero_qty_products, function (zero_qty_product) {
//                    items.unshift(zero_qty_product);
//                });
                
                angular.forEach(items, function (value, key) {
                    value.item_key = key;
                });
                
                return items;
            }
            return items;
        },
        addPrescriptionItem: function (item) {
            //unshift - push at first position
            items.unshift(item);
        },
        deletePrescriptionItem: function (item) {
            var index = items.indexOf(item);
            items.splice(index, 1);
        },
        deleteAllPrescriptionItem: function () {
            items = [];
        },
        addPrescriptionmainItem: function (item) {
            mainitems.unshift(item);
        },
        getPrescriptionmainItem: function () {
            return mainitems;
        }
    };
}