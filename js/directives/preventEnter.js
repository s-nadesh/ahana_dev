angular.module('app').directive('preventEnter', function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.bind('keydown keypress keyup', function (event) {
                if (event.keyCode != 9) {
                    event.preventDefault();
                }
            });
        }
    };
});