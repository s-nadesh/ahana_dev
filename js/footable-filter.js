$(document).ready(function () {
    $('.footablefilter').footable().bind('footable_filtering', function (e) {
        var selected = $('.filter-date').val();
        if (selected && selected.length > 0) {
            e.filter += (e.filter && e.filter.length > 0) ? ' ' + selected : selected;
            e.clear = !e.filter;
        }
    });

    $('.clear-filter').click(function (e) {
        e.preventDefault();
        $('.filter-date').val('');
        $('.footablefilter').trigger('footable_clear_filter');
    });

    $('.filter-date').focus(function (e) {
        e.preventDefault();
        $('.footablefilter').trigger('footable_filter', {
            filter: $('#filter').val()
        });
    });
});