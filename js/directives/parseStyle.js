angular.module('app').directive('parseStyle', function () {
    return function (scope, elem)
    {
        elem.html(scope.$eval('\'' + elem.html() + '\''));
    };
});