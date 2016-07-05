//
// Send messages between controllers.
//
app.factory('Broadcaster', function($rootScope) {
	var broadcaster = {};
	
	broadcaster.message = '';
	
	broadcaster.send = function(msg) {
		this.message = msg;
		$rootScope.$broadcast('broadcast');
	};
	
	return broadcaster;
});