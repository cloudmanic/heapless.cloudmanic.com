<?php
//
// Company: Cloudmanic Labs, LLC
// By: Spicer Matthews 
// Email: spicer@cloudmanic.com
// Website: http://cloudmanic.com
// Date: 5/6/2014
//

namespace Models;

use \URL;
use \Queue;
use \Config;
use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\Accounts\Accounts;

class Connections extends \Cloudmanic\System\Models\Acct
{
	public $delete_log = true;
	
	//
	// Format Get.
	//
	public function _format_get(&$data)
	{
		// Strip out some things that API should not return.
		if($this->_is_api)
		{
			$col = [ 'ConnectionsUserId', 'ConnectionsAccessToken', 'ConnectionsUrl', 'ConnectionsExpires' ];
		
			foreach($col AS $key => $row)
			{
				if(isset($data[$row]))
				{
					unset($data[$row]);
				}
			}			
		}
	}
}

/* End File */