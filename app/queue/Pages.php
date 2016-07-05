<?php

namespace Queue;

use \App;
use \Config;
use \Imagick;
use Aws\Common\Aws;
use Aws\S3\Enum\StorageClass;
use Aws\S3\Enum\CannedAcl;
use Aws\Common\Enum\Region;
use Aws\S3\Exception\S3Exception;
use Aws\S3\Exception\Parser;
use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\Accounts\Accounts;

class Pages 
{
	//
	// Create page image
	//
	public function create_page_image($job, $data)
	{			
		$this->_log('Job: Pages::create_page_image - ' . json_encode($data));

		// Get account.
		if(! $account = Accounts::get_by_id($data['AccountId']))
		{
			$this->_log('Job: Pages::create_page_image - Account Not Found.');
			return false;			
		}
		
		// Set account.
		Me::set_account($account);
		
		// Setup needed models.
		$files_model = App::make('Models\Files');
		$pages_model = App::make('Models\Pages');		
		
		// Get page.
		if(! $page = $pages_model->get_by_id($data['PagesId']))
		{
			$this->_log('Job: Pages::create_page_image - Page Not Found.');
			return false;			
		}
		
		// Get file.
		if(! $file = $files_model->get_by_id($data['FilesId']))
		{
			$this->_log('Job: Pages::create_page_image - File Not Found.');
			return false;			
		}		
		
		// Create the image of the page.	
		$file_path = Config::get('site.upload_dir') . $file['FilesPath'];
		
		// Create an image of the page.
		$pages_model->create_image_from_page($page, $file_path);
		
		// Create a thumbnail. 
		$pages_model->create_page_thumb($page['PagesId']);
				
		// Delete Job.
		$job->delete(); 
	}
		
	//
	// Output a log message.
	//
	private function _log($msg)
	{
		echo '[' . date('n-j-Y g:i:s a') . "] $msg\n";
	}
}

/* End File */