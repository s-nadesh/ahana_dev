angular.module('app').directive('checkAccess', function () {
    return {
        link: function (scope, element, attrs) {
            element.addClass('hide');
            if (scope.checkAccess(element.attr('ui-sref'))) {
                element.addClass('show2');
            }
        }
    }
});
angular.module('app').directive('checkAccessButton', function () {
    return {
        link: function ($scope, element, attrs) {
            var url = element.attr('ng-click').match(/'([^']+)'/)[1];
            element.addClass('hide');
            if ($scope.checkAccess(url)) {
                element.addClass('show2');
            }
        }
    }
});
angular.module('app').directive('checkAccessCustom', function () {
    return {
        link: function ($scope, element, attrs) {
            var url = element.data('button');
            element.addClass('hide');
            if ($scope.checkAccess(url)) {
                element.addClass('show2');
            }
        }
    }
});
angular.module('app').directive('checkAccessCustom2', function () {
    return {
        link: function ($scope, element, attrs) {
            exp = element.attr('href').split('/');
            url = exp[1] + '.' + exp[2];
            element.addClass('hide');
            if ($scope.checkAccess(url)) {
                element.addClass('show2');
            }
        }
    }
});
angular.module('app').directive('checkAccessCustom3', function ($timeout) {
    return {
        link: function ($scope, element, attrs) {
            element.addClass('hide');
            $timeout(function () {
                var url = element.data('url');
                if ($scope.checkAccess(url)) {
                    element.addClass('show2');
                }
            }, 1000);
        }
    }
});
angular.module('app').directive('checkAccessAdmin', function ($timeout) {
    return {
        link: function ($scope, element, attrs) {
            element.addClass('hide');
            $timeout(function () {
                if ($scope.checkAdminAccess()) {
                    element.addClass('show2');
                }
            }, 1000);
        }
    }
});