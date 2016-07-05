<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

// Route group for API versioning V1 that require authenication.
Route::group([ 'prefix' => 'api/v1', 'before' => 'api-v1-before' ], function() 
{    
	// api/v1/files
	Route::get('files', 'Api\V1\Files@index');
	Route::get('files/get/{id}/{name}', 'Api\V1\Files@get');	
	Route::get('files/ids', 'Api\V1\Files@ids');	
	Route::get('files/summery', 'Api\V1\Files@summery');	
	Route::get('files/{id}', 'Api\V1\Files@id');	
	Route::get('files/thumb/{id}/{name}', 'Api\V1\Files@thumb');
	Route::get('files/page/{id}/{page}/{name}', 'Api\V1\Files@page');
	Route::get('files/page_thumb/{id}/{page}/{name}', 'Api\V1\Files@page_thumb');	
	Route::post('files/update/{id}', 'Api\V1\Files@update');	
	Route::post('files/upload', 'Api\V1\Files@upload');
	
	// api/v1/connections	
	Route::get('connections', 'Api\V1\Connections@index');
	Route::get('connections/ids', 'Api\V1\Connections@ids');		
	Route::get('connections/{id}', 'Api\V1\Connections@id');
	Route::post('connections/create', 'Api\V1\Connections@create');	
	Route::post('connections/update/{id}', 'Api\V1\Connections@update');
	Route::post('connections/delete/{id}', 'Api\V1\Connections@delete');	
	
	// api/v1/account
	Route::get('account', 'Api\V1\Account@index');
	Route::get('account/by_app', 'Api\V1\Account@accounts_by_app');			
});

// Route group for API versioning V1 that require authenication and some extra magic because
// they are connections. So we add a extra filter to this group.
Route::group([ 'prefix' => 'api/v1/connections', 'before' => 'api-v1-before|api-v1-connections' ], function() 
{    	
	// api/v1/connections/evernote
	Route::get('evernote/ping', 'Api\V1\Connections\Evernote@ping');
	Route::get('evernote/user', 'Api\V1\Connections\Evernote@user');
	Route::get('evernote/notebooks', 'Api\V1\Connections\Evernote@notebooks');
	Route::get('evernote/tags', 'Api\V1\Connections\Evernote@tags');		
	Route::get('evernote/auth', 'Api\V1\Connections\Evernote@auth');
	Route::get('evernote/callback', 'Api\V1\Connections\Evernote@callback');
	Route::post('evernote/send', 'Api\V1\Connections\Evernote@send');		
});


// Route group for when you are logged into the app.
Route::group([ 'before' => 'browser-check|app-before' ], function() 
{
	// heap
	Route::get('/', 'BaseController@main');
	Route::get('/heap/thumbs', 'BaseController@main');
	Route::get('/heap/thumbs/{folder}', 'BaseController@main');		
	Route::get('/heap/list', 'BaseController@main');
	Route::get('/heap/list/{folder}', 'BaseController@main');				
	Route::get('/heap/view/{id}', 'BaseController@main');
		
	
	// settings
	Route::get('/settings/users', 'BaseController@main');
	Route::get('/settings/account', 'BaseController@main');
	Route::get('/settings/billing-history', 'BaseController@main');	
	
	// connections				
	Route::get('/connections', 'BaseController@main');
});