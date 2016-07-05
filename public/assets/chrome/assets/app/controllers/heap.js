controllers.heap = {}

//
// Landing Page.
//
controllers.heap.index = ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'Broadcaster', 'Idbstore', function($scope, $rootScope, $http, $location, $routeParams, Broadcaster, Idbstore)
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

	// Grab any broadcasted messages and deal with them.
	$scope.$on('broadcast', function() {
		switch(Broadcaster.message.action)
		{
			case 'sync-done':
				if(Broadcaster.message.first)
				{
					$scope.refresh_files();
				} else
				{
					// TODO: write some compare library and just update the stuff that has changed.
					// Maybe the worker should comare and on sync-done return a list of objects that 
					// changed.
				}
			break;
		
			case 'site-search':
				$scope.search_term = Broadcaster.message.term;
			break;

			case 'upload-new':
				// We need to get this new page and add it to the heap.
				// TODO: Make this work offline
				$http.get('/api/v1/files/' + Broadcaster.message.id).success(function (json) {		
				  $scope.files.unshift(json.data);
					sync_worker.postMessage({ action: 'sync' });
				});			
			break;
		}
	});
	
	// Delete a file.
	$scope.toast = function (row)
	{		
		row.FilesStatus = 'trash';
		$scope.files.splice($scope.files.indexOf(row), 1);
		
		// Update record in IndexedDB
		Idbstore.update('Files', row, function (id) {
			Broadcaster.send({ action: 'refresh-sidebar' });
			sync_worker.postMessage({ action: 'sync' });
		});
	}	
	
	// Restore a file in the trash.
	$scope.restore = function (row)
	{
		row.FilesStatus = 'current';
		$scope.files.splice($scope.files.indexOf(row), 1);
		
		// Update record in IndexedDB
		Idbstore.update('Files', row, function (id) {
			Broadcaster.send({ action: 'refresh-sidebar' });
			sync_worker.postMessage({ action: 'sync' });
		});
	}	
	
	// Update files.
	$scope.refresh_files = function ()
	{	
		Idbstore.get_where('Files', 'FilesStatus', $scope.folder, function (data) {
			$scope.files = data;
			
			// First run?
			if($scope.files.length)
			{
				$scope.first_run = false;
			} else
			{
				$scope.first_run = true;
			}
			
			$scope.$apply();
		});
	}
	
	// We do not call this on the first page load of the site.
	if(site.state.first_synced)
	{
		$scope.refresh_files();
	}
}];

//
// File view Page.
//
controllers.heap.view = ['$scope', '$rootScope', '$http', '$location', '$routeParams', 'Broadcaster', 'Idbstore', function($scope, $rootScope, $http, $location, $routeParams, Broadcaster, Idbstore)
{	
	$scope.img_loader = false;
	$scope.file = {};
	$scope.back_display = 'thumbs';
	$scope.file_current = '';
	$scope.file_current_page = 1;

	// Grab any broadcasted messages and deal with them.
	$scope.$on('broadcast', function() {
		switch(Broadcaster.message.action)
		{
			case 'sync-done':
				if(Broadcaster.message.first)
				{
					$scope.refresh_file();
				} else
				{
					// TODO: write some compare library and just update the stuff that has changed.
					// Maybe the worker should comare and on sync-done return a list of objects that 
					// changed.
				}
			break;
		}
	});

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
		Idbstore.get_by_db_id('Files', $routeParams.id, function (data) {
			$scope.file = data;	
			$scope.file_current = data.Pages[0].Url;
			$scope.count = data.Pages.length + 1;					
			$scope.$apply();
		});		
	}
	
	// We do not call this on the first page load of the site.
	if(site.state.first_synced)
	{	
		$scope.refresh_file();
	}
}];