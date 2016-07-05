controllers.main = {}

//
// Core template.
//
controllers.main.template = ['$scope', '$rootScope', '$http', '$location', '$fileUploader', 'Broadcaster', 'Rest', function($scope, $rootScope, $http, $location, $fileUploader, Broadcaster, Rest)
{
	$scope.loading = true;

	$rootScope.models = {
		Files: []
	}

	// --------------------------- Search Bar Stuff --------------------------- //	
	
	$rootScope.search_term = '';

	$scope.search = function ()
	{
		Broadcaster.send({ action: 'site-search', term: $scope.search_term });
	}

	// --------------------------- Sidebar Stuff --------------------------- //	
	
	$scope.summery = {}
	$scope.count_current = 0;
	$scope.display_type = 'thumbs';
	$scope.folder = 'current';

	// What for URL changes.
	$rootScope.$watch(function() {
		return $location.path(); 
	}, 
	function(a) {  
		$scope.folder = $location.path().split('/')[3];
	});	
			
	if($location.path().split('/')[3])
	{
		$scope.folder = $location.path().split('/')[3];
	}	
	
	if($location.search().display)
	{
		$scope.display_type = $location.search().display;
	} else if($location.path().split('/')[2])
	{
		$scope.display_type = $location.path().split('/')[2];
	}
	
	// Grab any broadcasted messages and deal with them.
	$scope.$on('broadcast', function() {
		switch(Broadcaster.message.action)
		{			
			case 'refresh-sidebar':
				$scope.folder = $location.path().split('/')[3];
				$scope.get_counts();
			break;
		}
	});	
	
	// Get counts for the sidebar.
	$scope.get_counts = function ()
	{
		Rest.get('/api/v1/files/summery', {}).success(function (json) {
			$scope.summery = json.data;
			$scope.count_current = json.data.counts.current;
			$scope.count_processed = json.data.counts.processed;
			$scope.count_processing = json.data.counts.processing;
			$scope.count_trash = json.data.counts.trash;						
		});
	}
	
	$scope.get_counts();

	// --------------------------- Syncing Stuff --------------------------- //	

	// Setup sync worker.
	if(typeof Worker != 'undefined') 
	{
		var first_files_sync = false;
		sync_worker = new Worker('/assets/app/workers/sync.js');
	
		// Listen for messages from the worker.
		sync_worker.addEventListener('message', function(e) {
	
	  	switch(e.data.action)
	  	{
				case 'model':
					// Do some data comparing.
					if($rootScope.models[e.data.model].length != e.data.data.length)
					{
						$rootScope.models[e.data.model] = e.data.data;
					} else
					{
						for(var i in $rootScope.models[e.data.model])
						{
							if(! angular.equals($rootScope.models[e.data.model][i], e.data.data[i]))
							{
								$rootScope.models[e.data.model][i] = e.data.data[i];
							} 
						}
					}
					
					// Set first sync done.
					state.first_files_sync = true;
					
					// Send a message on the first files sync
					if(e.data.model == 'Files')
					{
						Broadcaster.send({ action: 'files-sync' });
					}
					
					$scope.loading = false;
					$scope.$apply();				
				break;
			}
	
		}, false);
	}

	// --------------------------- Accounts Stuff --------------------------- //	
	
	$scope.get_current_acccount = function ()
	{
		Rest.get('/api/v1/account', {}).success(function (json) {
			$scope.account = json.data;
		});		
	}
	
	$scope.get_app_acccounts = function ()
	{
		Rest.get('/api/v1/account/by_app', {}).success(function (json) {
			$scope.accounts = json.data;		
		});		
	}	
	
	$scope.get_app_acccounts();
	$scope.get_current_acccount();

	// --------------------------- Connections Stuff ------------------------ //
	
	$scope.connections = [];
	
	// Clicked on a connection to send.
	$scope.connection_send = function (index)
	{
		$location.search('ConnectionsId', $scope.connections[index].ConnectionsId);
		$location.search('FilesId', site.active_click);
	}
	
	// Get the possible connections.
	$scope.refresh_connections = function ()
	{
		$http.get('/api/v1/connections?order=ConnectionsId&sort=asc').success(function (json) {
			$scope.connections = json.data;
		});
	}
	
	//$scope.refresh_connections();

	// --------------------------- Uploader Stuff ------------------------ //

	$scope.uploading_min_right = '36px';
	$scope.upload_model_minimize = false;
	$scope.upload_model_hide = true;
	$scope.uploading = false;
	$scope.uploading_count = 0;	

	// When we close the uploading modal.
	$scope.uploading_close = function ()
	{
		$scope.upload_model_hide = true;
		$scope.uploader.queue = [];
	}
	
	// When we minimize the uploading modal.
	$scope.uploading_minimize = function ()
	{	
		if($scope.upload_model_minimize)
		{
			$scope.upload_model_minimize = false;
		} else
		{
			$scope.upload_model_minimize = true;
		}
	}	

	// Setup file uploader.
	$scope.uploader = $fileUploader.create({
		scope: $scope,
		autoUpload: true, 
		alias: 'file_0',                         
		url: '/api/v1/files/upload',
		filters: [
			function (item) { 
				return true;
/*
				// Are we over our usage limits?
				if($scope.data.over_limit)
				{			
					return false;
				}
			
				// We only support images.
				if((item.type == 'image/jpeg') || (item.type == 'image/png'))
				{
					return true;
				}	else
				{		
					alert('Sorry we only support jpegs and pngs.');
					return false;
				}
*/
			}
		]		
	});	
	
	// On successfull upload.
	$scope.uploader.bind('success', function(event, xhr, item, response)  {
		var count = 0;
		
		angular.forEach($scope.uploader.queue, function(row, key)
		{
			if(! row.isSuccess)
			{
				count++;
			}
		});
		
		$scope.uploading_count = count;
		
		// Send message that we have a new upload.
		Broadcaster.send({ action: 'upload-new', id: response.data.Id });
		Broadcaster.send({ action: 'refresh-sidebar', id: response.data.Id });
	});
	
	// After files have been added.
	$scope.uploader.bind('afteraddingall', function (event, items) {
		$scope.uploading = true;
		$scope.upload_model_hide = false;
		$scope.uploading_min_right = '10px';

		var count = 0;
		
		angular.forEach($scope.uploader.queue, function(row, key)
		{
			if(! row.isSuccess)
			{
				count++;
			}
		});
		
		$scope.uploading_count = count;
	});	
	
	// Called when all files have been uploaded.
	$scope.uploader.bind('completeall', function (event, items) {
		$scope.uploading = false;
		$scope.uploading_min_right = '36px';
/*
		$scope.uploader.queue = [];
		$scope.refresh();
*/
	});					
}];