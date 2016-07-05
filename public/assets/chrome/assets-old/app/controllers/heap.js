controllers.heap = {}

//
// Landing Page.
//
controllers.heap.index = ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'Broadcaster', 'Rest', function($scope, $rootScope, $http, $location, $routeParams, Broadcaster, Rest)
{
	$scope.first_run = false;
	
	$scope.img_loader = false;
	$scope.folder = 'current';
	$scope.order = 'FilesId';
	$scope.sort = true;
	$scope.files = [];
	$scope.filter = '';
	$scope.search_term = '';
	
	if($routeParams.folder)
	{
		$scope.folder = $routeParams.folder;
	}

	// Set search filter.
	$scope.search = { FilesStatus: $scope.folder }

	// Grab any broadcasted messages and deal with them.
	$scope.$on('broadcast', function() {
		switch(Broadcaster.message.action)
		{
			case 'files-sync':
				$scope.set_first_run();
			break;
		
			case 'site-search':
				$scope.search_term = Broadcaster.message.term;
			break;

			case 'upload-new':
				// We need to get this new page and add it to the heap.
				$http.get('/api/v1/files/' + Broadcaster.message.id).success(function (json) {		
				  $scope.models.Files.unshift(json.data);
					sync_worker.postMessage({ action: 'sync' });
				});			
			break;
		}
	});
	
	// Delete a file.
	$scope.toast = function (row)
	{		
		row.FilesStatus = 'trash';
		var id = row.FilesId;
		
		Rest.post('/api/v1/files/update/' + id, { FilesStatus: 'trash' }).success(function (json) {
			Broadcaster.send({ action: 'refresh-sidebar' });
			sync_worker.postMessage({ action: 'sync' });
		});
	}	
	
	// Restore a file in the trash.
	$scope.restore = function (row)
	{
		var id = row.FilesId;
		row.FilesStatus = 'current';
		
		Rest.post('/api/v1/files/update/' + id, { FilesStatus: 'current' }).success(function (json) {
			Broadcaster.send({ action: 'refresh-sidebar' });
			sync_worker.postMessage({ action: 'sync' });		
		});
	}	
	
	// Figure out first run.
	$scope.set_first_run = function ()
	{
		// First run?
		var triggered = false;
		for(var i in $scope.models.Files)
		{
		  if($scope.models.Files[i].FilesStatus == $scope.folder)
		  {
		  	triggered = true;
		  	$scope.first_run = false;
		  	break;
		  }
		} 
		
		if(! triggered)
		{
		  $scope.first_run = true;
		}			
	}
	
	// We need to do a first sync first.
	if(state.first_files_sync)
	{
		$scope.set_first_run();	
	}
}];

//
// File view Page.
//
controllers.heap.view = ['$scope', '$rootScope', '$http', '$location', '$routeParams', function($scope, $rootScope, $http, $location, $routeParams)
{	
	$scope.img_loader = false;
	$scope.file = {};
	$scope.back_display = 'thumbs';
	$scope.file_current = '';
	$scope.file_current_page = 1;

	if($location.search().display)
	{
		$scope.back_display = $location.search().display;
	}

	// Click on prev.
	$scope.page_prev = function ()
	{
		var index = $scope.file_current_page - 2;
		$scope.file_current = $scope.file.Pages[index].Url;
		$scope.file_current_page = index + 1;
	}

	// Click on next.
	$scope.page_next = function ()
	{
		var index = $scope.file_current_page;
		$scope.file_current = $scope.file.Pages[index].Url;
		$scope.file_current_page = index + 1;
	}

	// Click on a page to load it.
	$scope.page_click = function (index)
	{
		$scope.file_current = $scope.file.Pages[index].Url;
		$scope.file_current_page = index + 1;
	}

	// Load page data.
	$scope.refresh_file = function ()
	{
		if($rootScope.models.Files.length)
		{
			for(var i in $rootScope.models.Files)
			{
				if($rootScope.models.Files[i].FilesId == $routeParams.id)
				{
					$scope.file = $rootScope.models.Files[i];
					$scope.file_current = $rootScope.models.Files[i].Pages[0].Url;
					$scope.count = $rootScope.models.Files[i].Pages.length + 1;
					//$scope.pre_load_imgs();		
					break;
				}
			}
		} else
		{
			$http.get('/api/v1/files/' + $routeParams.id + '?extra=true').success(function (json) {		
				$scope.file = json.data;
				$scope.file_current = json.data.Pages[0].Url;
				$scope.count = json.data.Pages.length + 1;
				//$scope.pre_load_imgs();
			});
		}			
	}
	
/*
	// Preload the viewing images.
	$scope.pre_load_imgs = function ()
	{
		setTimeout(function() {
			var images = new Array();
			
			for(var i in $scope.file.Pages)
			{
				images[i] = new Image()
				images[i].src = $scope.file.Pages[i].Url;
			}
		}, 1000); 
	}	
*/
	
	// Load page data.
	$scope.refresh_file();
}];
