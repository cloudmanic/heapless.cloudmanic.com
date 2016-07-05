<?php

/*
|--------------------------------------------------------------------------
| Browser Filter
|--------------------------------------------------------------------------
|
| We only support some browsers. No IE. 
|
*/
Route::filter('browser-check', function() 
{
	if(BrowserDetect::isIE())
	{
		return Response::view('errors.browser-sucks');
	}
});

/*
|--------------------------------------------------------------------------
| API V1 Filter - Connections
|--------------------------------------------------------------------------
|
| Here we make sure the user pass in a connection ID.
|
*/

Route::filter('api-v1-connections', function() 
{
	// Helper for returning the JSON in a failure.
	$controller = new \Cloudmanic\System\Controllers\ApiController();

	// Make sure there is a connection id.
	if(! Input::get('ConnectionsId'))
	{
	  return $controller->api_response(null, 0, null, [ [ 'field' => 'ConnectionsId', 'error' => 'ConnectionsId is required.' ] ]);
	}
	
	// Make sure the ConnectionsId is valid. 
	if(! App::make('Models\Connections')->get_by_id(Input::get('ConnectionsId')))
	{
	  return $controller->api_response(null, 0, null, [ [ 'field' => 'ConnectionsId', 'error' => 'Unknown ConnectionsId.' ] ]);
	}
});

/*
|--------------------------------------------------------------------------
| API V1 Filter
|--------------------------------------------------------------------------
|
| Here we authenicate the user. If they do not have a proper session or
| are not passing in an access_token we tell them to go away.
|
*/

Route::filter('api-v1-before', function() 
{
	// Helper for returning the JSON in a failure.
	$controller = new \Cloudmanic\System\Controllers\ApiController();

	// If this returns false we know we are not authorized.
	if(! Cloudmanic\System\Libraries\CloudAuth::apiinit())
	{
		Session::flush();
		return $controller->api_response(null, 0, null, [ [ 'field' => 'authentication', 'error' => 'Invalid access token.' ] ]);
	}
});



/*
|--------------------------------------------------------------------------
| App Filter
|--------------------------------------------------------------------------
|
| A user needs to have a session with us to access the app or we 
| redirect them to the login page.
|
*/
Route::filter('app-before', function() 
{
	// First we need to make sure this is an https request.
	if((App::environment() != 'local') && ($_SERVER['SERVER_PORT'] != '443'))
	{
		return Redirect::to(Config::get('app.url'));
	}
	
	// If this returns false we know we are not authorized.
	if(! $state = Cloudmanic\System\Libraries\CloudAuth::sessioninit())
	{	
		return 'Not Authorized...';
	}
	
	// See what actions we do based on the return.
	if($state === 'redirect')
	{
		return Redirect::to('');
	}
});

/*
|--------------------------------------------------------------------------
| API V1 Filter
|--------------------------------------------------------------------------
|
| Here we authenicate the user. If they do not have a proper session or
| are not passing in an access_token we tell them to go away.
|
*/
Route::filter('api-v1-before', function() 
{
	// Helper for returning the JSON in a failure.
	$controller = new \Cloudmanic\System\Controllers\ApiController();

	// If this returns false we know we are not authorized.
	if(! Cloudmanic\System\Libraries\CloudAuth::apiinit())
	{
		Session::flush();
		return $controller->api_response(null, 0, null, [ [ 'field' => 'authentication', 'error' => 'Invalid access token.' ] ]);
	}
});

/*
|--------------------------------------------------------------------------
| Application & Route Filters
|--------------------------------------------------------------------------
|
| Below you will find the "before" and "after" events for the application
| which may be used to do any work before or after a request into your
| application. Here you may also register your custom route filters.
|
*/

App::before(function($request)
{
	//
});


App::after(function($request, $response)
{
	//
});

/*
|--------------------------------------------------------------------------
| Authentication Filters
|--------------------------------------------------------------------------
|
| The following filters are used to verify that the user of the current
| session is logged into this application. The "basic" filter easily
| integrates HTTP Basic authentication for quick, simple checking.
|
*/

Route::filter('auth', function()
{
	if (Auth::guest()) return Redirect::guest('login');
});


Route::filter('auth.basic', function()
{
	return Auth::basic();
});

/*
|--------------------------------------------------------------------------
| Guest Filter
|--------------------------------------------------------------------------
|
| The "guest" filter is the counterpart of the authentication filters as
| it simply checks that the current user is not logged in. A redirect
| response will be issued if they are, which you may freely change.
|
*/

Route::filter('guest', function()
{
	if (Auth::check()) return Redirect::to('/');
});

/*
|--------------------------------------------------------------------------
| CSRF Protection Filter
|--------------------------------------------------------------------------
|
| The CSRF filter is responsible for protecting your application against
| cross-site request forgery attacks. If this special token in a user
| session does not match the one given in this request, we'll bail.
|
*/

Route::filter('csrf', function()
{
	if (Session::token() != Input::get('_token'))
	{
		throw new Illuminate\Session\TokenMismatchException;
	}
});