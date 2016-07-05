controllers.main = {}

//
// Core template.
//
controllers.main.template = ['$scope', '$rootScope', '$http', '$location', '$fileUploader', 'Broadcaster', 'Rest', 'Idbstore', function($scope, $rootScope, $http, $location, $fileUploader, Broadcaster, Rest, Idbstore)
{
	$scope.loading = true;

	$rootScope.models = {
		Files: []
	}
	
	// --------------------------- Offline / Online Stuff --------------------------- //
	
	$rootScope.online = navigator.onLine ? true : false;

	function updateOnlineStatus(event) {
		$rootScope.online = navigator.onLine ? true : false;
		$scope.$apply();
		sync_worker.postMessage({ action: 'sync' });
	}

	window.addEventListener('online',  updateOnlineStatus);
	window.addEventListener('offline', updateOnlineStatus);
	

	// --------------------------- Search Bar Stuff --------------------------- //	
	
	$rootScope.search_term = '';

	$scope.search = function ()
	{
		Broadcaster.send({ action: 'site-search', term: $scope.search_term });
	}

	// --------------------------- Sidebar Stuff --------------------------- //	
	
	$scope.summery = {
		counts: {
			current: 0,
			processing: 0,
			processed: 0,
			trash: 0
		}		
	}
	
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
	$scope.get_counts = function (first)
	{	
		var counts = {
			current: 0,
			processing: 0,
			processed: 0,
			trash: 0			
		}
	
		var store = new IDBStore({
			storeName: 'Files',
			keyPath: 'id',
			dbVersion: site.config.indexeddb.Files.version,
			storePrefix: '',
			autoIncrement: true,
			indexes: site.config.indexeddb.Files.indexes,			
			onStoreReady: function () {
				store.getAll(function (data) {
					for(var i in data)
					{
						counts[data[i].FilesStatus]++;
					}
					
					for(var i in counts)
					{
					  $scope.summery.counts[i] = counts[i];
					}
					
					if(first)
					{
						$scope.$apply();											
					}
				});			
			}		
		});
	}

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
				case 'sync-done':
					// Tell everyone the first sync is done.
					if(! site.state.first_synced)
					{
						// Set first sync done.
						site.state.first_synced = true;
						
						$scope.get_counts(true);
											
						Broadcaster.send({ action: 'sync-done', first: true });
					} else
					{
						$scope.get_counts();
						Broadcaster.send({ action: 'sync-done', first: false });
					}				

					// Hide loading message.
					$scope.loading = false;			
				break;
			}
	
		}, false);
	}

	// --------------------------- Accounts Stuff --------------------------- //	
	
	$scope.get_current_acccount = function ()
	{
		Rest.get('/api/v1/account').success(function (json) {
			$scope.account = json.data;
		});		
	}
	
	$scope.get_app_acccounts = function ()
	{
		Rest.get('/api/v1/account/by_app').success(function (json) {
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
	
	$scope.refresh_connections();

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
			
				// Check to see if we are offline.
				if(! navigator.onLine)
				{
					alert('Sorry, we can only upload files when we have an Internet connection.');
					return false;
				}
			
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