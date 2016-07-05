angular.module('pdfthumb', []).directive('pdfthumb', [ '$parse', function($parse) {
	
	return {
		restrict: "E",
		template: '<img alt="" ng-hide="hide" />',
		scope: {
			width: '@',
			page: '@',
			src: '@',
			id: '='
		},
		
		controller: [ '$scope', function($scope) {
			$scope.width = 200;
			$scope.img = null;
			$scope.hide = true;
			$scope.pdfDoc = null;

			$scope.loadPDF = function(path) {
				PDFJS.getDocument(path).then(function(_pdfDoc) {
					$scope.pdfDoc = _pdfDoc;
					$scope.renderPage(parseInt($scope.page) + 1);
				}, function(message, exception) {
					console.log("PDF load error: " + message);
				});
			};

			$scope.renderPage = function(num) {
				$scope.pdfDoc.getPage(num).then(function(page) {						  
					// Build the canvas.
					var viewport = page.getViewport(1);				
					var canvas = document.createElement('canvas');
					var ctx = canvas.getContext('2d');
					canvas.height = viewport.height;
					canvas.width = viewport.width;					
					
					// Set the image we are about to display.
					$scope.img.width = $scope.width;

					// Render page to the canvas then set the src of the image we are trying to show.
					page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function() {
							$scope.$apply(function () {
								$scope.hide = false; 
								$scope.img.src = canvas.toDataURL();
							});
						}, 
						function() {
							console.log('page.render failed');
						}
					);
				});
			};

		} ],
		
		link: function(scope, element, attr) {
			scope.img = element.find('img')[0];

			attr.$observe('src', function(v) {
				if(v !== undefined && v !== null && v !== '') 
				{
					scope.loadPDF(scope.src);
				}
			});
		}
	};
}]);