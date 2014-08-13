
angular.module('core.markdown-directive', []).directive('markdown', function() {
    // Usage:
    // <div data-markdown="{{vm.content}}"></div>

    var converter = new Showdown.converter();

    var directive = {
        link: link,
        restrict: 'A'
    };
    return directive;

    function link(scope, element, attrs) {
        attrs.$observe('markdown', function (value) {
            var markup = converter.makeHtml(value);
            element.html(markup);
        });
    }
});
