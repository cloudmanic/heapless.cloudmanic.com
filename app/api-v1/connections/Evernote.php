<?php

namespace Api\V1\Connections;

use \App;
use \DB;
use \URL;
use \Queue;
use \Input;
use \Config;
use \Crypt;
use \Redirect;
use \Response;
use \Validator;
use \Session;
use Cloudmanic\Evernote\Api;
use Cloudmanic\Evernote\OAuthWrapper;
use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\DupKeys;
use Cloudmanic\System\Libraries\Events;
use Cloudmanic\System\Models\Accounts\Users;
use Cloudmanic\System\Models\Accounts\Plans;
use Cloudmanic\System\Models\Accounts\Accounts;

class Evernote extends \Cloudmanic\System\Controllers\Api
{
	public $no_model = true;
	private $oauth = null;
	private $connection = null;
	
	//
	// Construct.
	//
	public function __construct()
	{
		parent::__construct();
		
		// Get the connection. We know this will work because of the route filter.
		$this->connection = App::make('Models\Connections')->get_by_id(Input::get('ConnectionsId'));
		
		// Base url, during development use the sandbox
		$baseUrl = (Config::get('site.evernote_sandbox')) ? 'https://sandbox.evernote.com/' : 'https://www.evernote.com/'; 
		
		// Setup the oauth request.
		$this->oauth = new OAuthWrapper($baseUrl);
		$this->oauth->setConsumerKey(Config::get('site.evernote_key'))
		      			->setConsumerSecret(Config::get('site.evernote_secret'))
								->setCallbackUrl(URL::to('api/v1/connections/evernote/callback?ConnectionsId=' . $this->connection['ConnectionsId']));	
								
		// Set access token if we have it.
		if(! empty($this->connection['ConnectionsAccessToken']))
		{
			Api::set_access_token(Crypt::decrypt($this->connection['ConnectionsAccessToken']), Config::get('site.evernote_sandbox'));
		}									
	}
	
	//
	// Save connection.
	//
	public function send()
	{
		$input = Input::all();
		
		// Validate this API request.
		$validator = Validator::make(Input::all(), [
			'ConnectionsId' => 'required|integer|exists:Connections,ConnectionsId,ConnectionsAccountId,' . Me::get_account_id(),
			'FilesId' => 'required|integer|exists:Files,FilesId,FilesAccountId,' . Me::get_account_id(),
			'FilesNotebook' => 'required|min:1',
			'FilesTitle' => 'required|min:1'		
		]);
		
		$validator->setAttributeNames([
			'FilesTitle' => 'title',
			'FilesNotebook' => 'notebook'
		]); 		
		
		if($validator->fails())
		{
			$messages = $validator->messages();
			return $this->api_response(null, 0, $messages);
		}		
		
		// Update the files table.
		App::make('Models\Files')->update([
			'FilesTitle' => Input::get('FilesTitle'),
			'FilesNotebook' => Input::get('FilesNotebook'),
			'FilesNote' => Input::get('FilesNote'),
			'FilesTags' => Input::get('FilesTags'),
			'FilesConnectionId' => Input::get('ConnectionsId'),
			'FilesStatus' => 'processing'																	
		], Input::get('FilesId'));		
				
		// Send action to queue for processing
		Queue::push('Queue\Evernote@send', [ 
			'FilesId' => Input::get('FilesId'),
			'AccountId' => Me::get_account_id()
		]);	

		// Return happy.
		return $this->api_response();
	}
	
	// ----------- Calls To Evernote ---------- //
	
	//
	// Ping Evernote.
	//
	public function ping()
	{
		if(empty($this->connection['ConnectionsAccessToken']))
		{
			return $this->api_response(null, 0, null, [ 'No Access Token Setup.' ], false);
		}	
	
		// Just make a random call to the API to see if things are good.
		if(! $data = Api::get_user())
		{
			return $this->api_response(null, 0, null, [ Api::get_error_string() ], false);
		} else
		{
			return $this->api_response();
		}		
	}
	
	//
	// Get user.
	//
	public function user()
	{		
		if(empty($this->connection['ConnectionsAccessToken']))
		{
			return $this->api_response(null, 0, null, [ 'No Access Token Setup.' ], false);
		}
	
		return $this->_evernote_api_return(Api::get_user());					
	}
	
	//
	// Get notebooks.
	//
	public function notebooks()
	{		
		if(empty($this->connection['ConnectionsAccessToken']))
		{
			return $this->api_response(null, 0, null, [ 'No Access Token Setup.' ], false);
		}	
	
		return $this->_evernote_api_return(Api::get_notebooks());	
	}	
	
	//
	// Get tags.
	//
	public function tags()
	{		
		if(empty($this->connection['ConnectionsAccessToken']))
		{
			return $this->api_response(null, 0, null, [ 'No Access Token Setup.' ], false);
		}
			
		return $this->_evernote_api_return(Api::get_tags());	
	}		
	
	// ----------- Oauth Stuff ---------------- //
	
	//
	// Authenicate the user.
	//
	public function auth()
	{
		$r = $this->oauth->requestTempCredentials();
		Session::put('oauth', $r);
		Session::put('redirect', Input::get('redirect'));
		return Redirect::to($this->oauth->makeAuthUrl());
	}
	
	//
	// Callback after we have make our request to Evernote.
	//
	public function callback()
	{
		// Make sure we have a verifier.
		$verifier = Input::get('oauth_verifier');
		if(empty($verifier)) 
		{
			die('Error connecting with Evernote (#001)');
		}
	
		// Get temp token
		$tempToken = Session::get('oauth');
	
		// Request Access token
		$token = $this->oauth->requestAuthCredentials(
		  $tempToken['oauth_token'],
		  $tempToken['oauth_token_secret'],
		  $verifier
		);
		
		// Store the access tokens.
		App::make('Models\Connections')->update([
			'ConnectionsAccessToken' => Crypt::encrypt($token['oauth_token']),
			'ConnectionsUserId' => $token['edam_userId'],
			'ConnectionsExpires' => $token['edam_expires']
		], $this->connection['ConnectionsId']);
		
		return Redirect::to(Session::get('redirect'));
	}
	
	// ----------- Private Helper Stuff ------------ //
	
	//
	// Generic way to return evernote api calls.
	//
	private function _evernote_api_return($data)
	{
		// Get the user attached to this access token.
		if(! $data)
		{
			return $this->api_response(null, 0, null, [ Api::get_error_string() ], false);
		} else
		{
			return $this->api_response($data);
		}			
	}
}


/* End File */