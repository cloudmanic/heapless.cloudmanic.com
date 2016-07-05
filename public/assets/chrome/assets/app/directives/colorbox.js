//
// Load colorbox
//
app.directive('colorbox', function($compile, $rootScope) {
  return {
    link: function(scope, element, attrs) {
      element.click('bind', function() {
        var id = element.attr('data-id');
        
        $.colorbox({
          href: attrs.colorbox,
          onComplete: function() {
            $rootScope.id = id;
            $rootScope.$apply(function() {
              var content = $('#cboxLoadedContent');
              $compile(content)($rootScope);      
            });
          }
        });
      });
    }
  };
});