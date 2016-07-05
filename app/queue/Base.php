<?php

namespace Queue;

use \App;
use \Config;
use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\Accounts\Accounts;

class Base
{
	//
	// Validate request.
	//
	public function validate_request($job, $data, $text)
	{
		$this->log("Job: $text - " . json_encode($data));	
	
		// Get account.
		if(! $account = Accounts::get_by_id($data['AccountId']))
		{
			$this->log("Job: $text - Account Not Found.");
			return false;			
		}
		
		// Set account.
		Me::set_account($account);
		
		return true;
	}
		
	//
	// Output a log message.
	//
	public function log($msg)
	{
		echo '[' . date('n-j-Y g:i:s a') . "] $msg\n";
	}
}

/* End File */