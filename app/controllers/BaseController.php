<?php

use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\Accounts\AcctUsersLu;

class BaseController extends Controller 
{
	//
	// Main Shell
	//
	protected function main($id = 0)
	{				
		return View::make('templates.main');
	}

	//
	// Setup the layout used by the controller.
	//
	// @return void
	//
	protected function setupLayout()
	{
		if ( ! is_null($this->layout))
		{
			$this->layout = View::make($this->layout);
		}
	}

}

/* End File */