//Not working - Prescriotion Search Form. 
//From Element to next input not find correctly. 
angular.module('app').directive('nextOnTab', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, elem, attrs) {
            elem.bind('keydown', function (e) {
                var code = e.keyCode || e.which;
                if (code === 9) {
                    $timeout(function () {
                        elem.next().focus();
                    }, 10);
                }
            });
        }
    }
});