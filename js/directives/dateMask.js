/* global Webcam */
(function (angular) {
    'use strict';

    angular
            .module('app')
            .directive('myDate', dateInput);

    dateInput.$inject = ["$filter", "$parse"];
    function dateInput($filter, $parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            replace: true,
            transclude: true,
            template: '<input ng-transclude ui-mask="39/19/2999" ui-mask-raw="false" ng-keypress="limitToValidDate($event)" placeholder="DD/MM/YYYY"/>',
            link: function (scope, element, attrs, controller) {
                scope.limitToValidDate = limitToValidDate;
                var dateFilter = $filter("date");
                var today = new Date();
                var date = {};

                function isValidMonth(month) {
                    return month >= 0 && month < 13;
                }

                function isValidDay(day) {
                    return day > 0 && day < 32;
                }

                function isValidYear(year) {
                    return year > (today.getFullYear() - 115) && year < (today.getFullYear() + 115);
                }

                function isValidDate(inputDate) {
                    var dateAr = inputDate.split('/');
                    if(dateAr.length && dateAr[0]){
                        //Custom validation script by prakash for change dateformat d/m/y => m/d/Y
                        return (isValidMonth(dateAr[1]) && isValidDay(dateAr[0].slice(-2)) && isValidYear(dateAr[2]));
                    }else{
                        inputDate = new Date(formatDate(inputDate));
                        if (!angular.isDate(inputDate)) {
                            return false;
                        }
                        date.month = inputDate.getMonth();
                        date.day = inputDate.getDate();
                        date.year = inputDate.getFullYear();
                        return (isValidMonth(date.month) && isValidDay(date.day) && isValidYear(date.year));
                    }
                }

                function formatDate(newDate) {
                    var modelDate = $parse(attrs.ngModel);
                    newDate = dateFilter(newDate, "MM/dd/yyyy");
                    modelDate.assign(scope, newDate);
                    return newDate;
                }

                controller.$validators.date = function (modelValue) {
                    return angular.isDefined(modelValue) && isValidDate(modelValue);
                };                
                
                //MM/DD/YYYY
//                var pattern = "^(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)\\d\\d$" +
//                        "|^(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)\\d$" +
//                        "|^(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)$" +
//                        "|^(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[12]$" +
//                        "|^(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$" +
//                        "|^(0[1-9]|1[012])([0-3])$" +
//                        "|^(0[1-9]|1[012])$" +
//                        "|^[01]$";

                //DD/MM/YYYY
                var pattern = "^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)\\d\\d$" +
                        "|^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)\\d$" +
                        "|^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])(19|20)$" +
                        "|^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])[12]$" +
                        "|^(0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012])$" +
                        "|^(0[1-9]|[12][0-9]|3[01])([0-3])$" +
                        "|^(0[1-9]|[12][0-9]|3[01])$" +
                        "|^[0123]$";
                var regexp = new RegExp(pattern);

                function limitToValidDate(event) {
                    var key = event.charCode ? event.charCode : event.keyCode;
                    if ((key >= 48 && key <= 57) || key === 9 || key === 46) {
                        var character = String.fromCharCode(event.which);
                        var start = element[0].selectionStart;
                        var end = element[0].selectionEnd;
                        var testValue = (element.val().slice(0, start) + character + element.val().slice(end)).replace(/\s|\//g, "");
                        if (!(regexp.test(testValue))) {
                            event.preventDefault();
                        }
                    }
                }
            }
        }
    }

})(angular);
