// Config Routes
app.config(['$routeProvider', function($routeProvider, $routeParams) {
		  
	// heap/thumbs/:folder
  $routeProvider.when('/heap/thumbs/:folder', { 
  	templateUrl: '/assets/app/views/heap/thumbs.html',   
  	controller: controllers.heap.index
  });  
  
	// heap/list
  $routeProvider.when('/heap/list', { 
  	templateUrl: '/assets/app/views/heap/list.html',   
  	controller: controllers.heap.index
  }); 
  
	// heap/list/:folder
  $routeProvider.when('/heap/list/:folder', { 
  	templateUrl: '/assets/app/views/heap/list.html',   
  	controller: controllers.heap.index
  });    
  
	// heap/view/:id
  $routeProvider.when('/heap/view/:id', { 
  	templateUrl: '/assets/app/views/heap/view.html',   
  	controller: controllers.heap.view
  });  
  
	// settings/users
  $routeProvider.when('/settings/users', { 
  	templateUrl: '/assets/app/views/settings/users.html',   
  	controller: controllers.settings.users
  }); 
  
	// settings/account
  $routeProvider.when('/settings/account', { 
  	templateUrl: '/assets/app/views/settings/account.html',   
  	controller: controllers.settings.accounts
  }); 
  
	// settings/billing_history
  $routeProvider.when('/settings/billing-history', { 
  	templateUrl: '/assets/app/views/settings/billing-history.html',   
  	controller: controllers.settings.billing_history
  });
  
	// connections
  $routeProvider.when('/connections', { 
  	templateUrl: '/assets/app/views/connections/index.html',   
  	controller: controllers.connections.index 
  });            
  
  // Default
	$routeProvider.otherwise({ redirectTo: '/heap/thumbs/current' });
}]);