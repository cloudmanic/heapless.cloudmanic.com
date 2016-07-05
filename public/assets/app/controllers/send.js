controllers.send = {}

//
// Send to Evernote.
//
controllers.send.evernote = ['$scope', '$rootScope', '$http', '$location', 'Broadcaster', 'Rest', function($scope, $rootScope, $http, $location, Broadcaster, Rest)
{
	$scope.file = {};
	$scope.connection = {};	
	$scope.save_btn = 'Send It Now';
	$scope.ConnectionsId = $location.search().ConnectionsId;
	$scope.FilesId = $location.search().FilesId;

	$scope.notebooks = [] 	

	$scope.errors = {}
	$scope.fields = {
		FilesId: $location.search().FilesId,
		FilesTitle: '',
		FilesNotebook: '',
		FilesTags: '',
		FilesNote: ''
	}

	// Get Evernote notebooks.
	Rest.get('/api/v1/connections/evernote/notebooks', { ConnectionsId: $scope.ConnectionsId }).success(function (json) {
		$scope.notebooks = json.data;
		
		if(json.data.length)
		{
			$scope.fields.FilesNotebook = json.data[0].guid;
		}
	});	

	// Make an api call and get this file.
	Rest.get('/api/v1/files/' + $scope.FilesId).success(function (json) {
		$scope.file = json.data;
	});

	// Make an api call and get this connection.
	Rest.get('/api/v1/connections/' + $scope.ConnectionsId).success(function (json) {
		$scope.connection = json.data;
	});
	
	// Submit to API to send to Evernote. 
	$scope.save = function ()
	{
		$scope.errors = {}
		$scope.save_btn = 'Saving...';
		
		Rest.post('/api/v1/connections/evernote/send?ConnectionsId=' + $scope.ConnectionsId, $scope.fields).success(function (json) {
			$scope.save_btn = 'Send It Now';
			
			// Deal with validation.
			if(! json.status)
			{
				for(var i in json.errors)
				{
					$scope.errors[json.errors[i].field] = json.errors[i].error;
				}
			} else
			{
				$.colorbox.close();
				
				for(var i in $rootScope.models.Files)
				{
					if($rootScope.models.Files[i].FilesId == $location.search().FilesId)
					{
						$rootScope.models.Files[i].FilesStatus = 'processing';
					}
				}
				
				sync_worker.postMessage({ action: 'sync' });
				Broadcaster.send({ action: 'refresh-sidebar' });
			}
		});
	}

}];