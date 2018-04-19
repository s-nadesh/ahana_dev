angular.module('app').directive('optionsClass', function ($parse) {
    return {
        require: 'select',
        link: function (scope, elem, attrs, ngSelect) {
            // get the source for the items array that populates the select.
            var optionsSourceStr = attrs.ngOptions.split(' ').pop(),
                    // use $parse to get a function from the options-class attribute
                    // that you can use to evaluate later.
                    getOptionsClass = $parse(attrs.optionsClass);

            scope.$watch(optionsSourceStr, function (items) {
                // when the options source changes loop through its items.
                angular.forEach(items, function (item, index) {
                    //check negative numbers
                    item.availableQuantity = parseFloat(item.availableQuantity) <= 0 ? 0 : parseFloat(item.availableQuantity);
                    // evaluate against the item to get a mapping object for
                    // for your classes.
                    var classes = getOptionsClass(item),
                            // also get the option you're going to need. This can be found
                            // by looking for the option with the appropriate index in the
                            // value attribute.
                            option = elem.find('option[value=' + index + ']');
                            
                    //Bc-179 Dropdown - Qty
                    angular.element(option).attr('data-availableQuantity', item.availableQuantity);

                    // now loop through the key/value pairs in the mapping object
                    // and apply the classes that evaluated to be truthy.
                    angular.forEach(classes, function (add, className) {
                        if (add) {
                            angular.element(option).addClass(className);
                        }
                    });
                });
            });
        }
    };
});