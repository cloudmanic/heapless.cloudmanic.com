controllers.connections = {}

//
// Index Page.
//
controllers.connections.index = ['$scope', '$http', '$location', 'Broadcaster', 'Rest', function($scope, $http, $location, Broadcaster, Rest)
{
	$scope.connections = [];
		
	// Grab any broadcasted messages and deal with them.
	$scope.$on('broadcast', function() {
		switch(Broadcaster.message.action)
		{
			case 'connections-update':
				$scope.refresh_connections();
			break;
		}
	});
	
	// Delete the connection.
	$scope.delete_con = function (index)
	{
		var cc = confirm('Are you sure you want to delete this connection.');

		if(! cc)
		{
			return false;
		}
		
		// Set index.
		var index = $scope.connections[index].ConnectionsId;
	
		// Delete by id.
		Rest.post('/api/v1/connections/delete/' + index, {}).success(function (json) {	
			$scope.refresh_connections();
		});		
	}			
		
	// Refresh Connections.
	$scope.refresh_connections = function ()
	{
		Rest.get('/api/v1/connections', { order: 'ConnectionsId', sort: 'desc' }).success(function (json) {	
			$scope.connections = json.data;
		});		
	}
	
	// Load data.
	$scope.refresh_connections();
}];

//
// Evernote - Settings.
//
controllers.connections.evernote_settings = ['$scope', '$http', '$location', 'Broadcaster', 'Rest', function($scope, $http, $location, Broadcaster, Rest)
{
	$scope.is_error = false;
	$scope.connection = {
		ConnectionsName: ''
	}
	
	// Connect with evernote.
	$scope.submit = function ()
	{	
		$scope.is_error = false;
		
		if(! $scope.connection.ConnectionsName.length)
		{
			$scope.is_error = true;
			return false;
		} 
		
		// Setup post
		var post = {
			ConnectionsName: $scope.connection.ConnectionsName, 
			ConnectionsType: 'evernote', 
			ConnectionsSync: 'no'		
		}
		
		// Create / Update the connection.
		if($scope.id)
		{		
			Rest.post('/api/v1/connections/update/' + $scope.id, post).success(function (json) {	
				Broadcaster.send({ action: 'connections-update', id: $scope.id });
				$.colorbox.close();
			});
		} else
		{
			Rest.post('/api/v1/connections/create', post).success(function (json) {	
				window.location = '/api/v1/connections/evernote/auth?redirect=/connections&ConnectionsId=' + json.data.Id;
			});			
		}	
	}
	
	// See if this is an edit or not.
	if($scope.id)
	{
		Rest.get('/api/v1/connections/' + $scope.id, {}).success(function (json) {	
			$scope.connection = json.data;
			//$scope.$apply();
		});		
	}	
}];