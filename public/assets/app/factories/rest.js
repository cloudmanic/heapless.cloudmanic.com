//
// A wrapper for making restful api calls.
//
app.factory('Rest', [ '$http', function($http) {
	var obj = {}
	
	//
	// Send a get request.
	//
	obj.get = function (url, parms) 
	{
		return $http.get(url + '?' + obj.encodequery(parms));			
	}
	
	//
	// Send a post request.
	//
	obj.post = function (url, parms) 
	{
		return $http.post(url, parms);			
	}	
	
	//
	// Encode a query string to pass in the url for a GET request.
	//
	obj.encodequery = function (data)
	{
		var ret = [];
		
		for(var d in data)
		{
		  ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
		}
		
		return ret.join("&");
	}
	
	// Return the object.
	return obj;       
}]);