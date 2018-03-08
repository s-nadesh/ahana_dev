angular.module('app').directive('focusMe', function ($timeout) {
    return {
        link: function (scope, element, attrs) {
            scope.$watch(attrs.focusMe, function (value) {
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                        element[0].select();
                    }, 1000);
                }
            });
        }
    };
});