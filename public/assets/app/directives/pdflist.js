angular.module('pdflist', []).directive('pdflist', [ '$parse', function($parse) {
	
	return {
		restrict: "E",
		template: '<div class="full" ng-style="{ width: cont_width }" ng-repeat="row in pages"><img src="{{ row }}" width="{{ width }}" /></div>',
		scope: {
			width: '@',
			src: '@'
		},
		
		controller: [ '$scope', function($scope) {
			$scope.pages = [];
			$scope.numPages = 0;
			$scope.currPage = 1;
			$scope.width = '500';
			$scope.cont_width = '500px';

			$scope.loadPDF = function(path) {
				PDFJS.getDocument(path).then(function(pdf) {
					$scope.pdfDoc = pdf;
					
					$scope.numPages = pdf.pdfInfo.numPages;
					
					// Set width.
					$scope.cont_width = $scope.width + 'px';
					
					//Start with first page
					pdf.getPage(1).then($scope.handlePages);
				
				}, function(message, exception) {
					console.log("PDF load error: " + message);
				});
			};
			
			$scope.handlePages = function (page)
			{
				// This gives us the page's dimensions at full scale
				var viewport = page.getViewport(1);
				
				// We'll create a canvas for each page to draw it on
				var canvas = document.createElement('canvas');
				canvas.style.display = 'block';
				var context = canvas.getContext('2d');
				canvas.height = viewport.height;
				canvas.width = viewport.width;
				
				//Draw it on the canvas
				page.render({ canvasContext: context, viewport: viewport }).promise.then(function() {
					$scope.$apply(function () {
					  $scope.pages.push(canvas.toDataURL());
					});				
				});
				
				//Move to next page
				$scope.currPage++;
				if(($scope.pdfDoc !== null) && ($scope.currPage <= $scope.numPages))
				{
					$scope.pdfDoc.getPage($scope.currPage).then($scope.handlePages);
				}
			}			
			
		}],
		
		link: function(scope, element, attr) {
			
			attr.$observe('src', function(v) {
				if(v !== undefined && v !== null && v !== '') 
				{
					scope.loadPDF(scope.src);
				}
			});
		}
	};
	
}]);