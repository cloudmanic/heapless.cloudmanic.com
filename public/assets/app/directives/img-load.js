//
// Load images
//
/*
app.directive('imgLoad', ['$rootScope', function($rootScope) {
	return {
	  restrict: 'A',
	  
	  scope: {
	    ngSrc: '@',
			imgLoader: '='
	  },
	  
	  link: function(scope, element, attrs) {
	    element.on('load', function() {
				scope.$apply(function() {
					scope.imgLoader = false;
				});
	    }).on('error', function() {
	      //
	    });
	  }
	};
}]);
*/

//
// Lazy load images.
//
app.directive('imgLazy', [function() {
	return {
	  restrict: 'A',
	  
	  link: function (scope, elm) {
			setTimeout(function() {
				$(elm).lazyload({
				  effect: 'fadeIn',
				  effectspeed: 500,
				  'skip_invisible': false
				});
			}, 0);
	  }
	}
}]);

