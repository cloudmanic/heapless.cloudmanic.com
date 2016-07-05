<?php

namespace Api\V1;

use \App;
use \DB;
use \Mail;
use \Queue;
use \Input;
use \Config;
use \Redirect;
use \Response;
use \Validator;
use \Imagick;
use Aws\Common\Aws;
use Aws\S3\Enum\StorageClass;
use Aws\S3\Enum\CannedAcl;
use Aws\Common\Enum\Region;
use Aws\S3\Exception\S3Exception;
use Aws\S3\Exception\Parser;
use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\DupKeys;
use Cloudmanic\System\Libraries\Events;
use Cloudmanic\System\Models\Accounts\Users;
use Cloudmanic\System\Models\Accounts\Plans;
use Cloudmanic\System\Models\Accounts\Accounts;

class Files extends \Cloudmanic\System\Controllers\Api
{
	// 
	// Get a summery of the files.
	//
	public function summery()
	{
		$ai = Me::get_account_id();
		
		$rt = [
			'counts' => [
				'current' => DB::table('Files')->where('FilesStatus', '=', 'current')->where('FilesAccountId', '=', $ai)->count(),
				'processing' => DB::table('Files')->where('FilesStatus', '=', 'processing')->where('FilesAccountId', '=', $ai)->count(),
				'processed' => DB::table('Files')->where('FilesStatus', '=', 'processed')->where('FilesAccountId', '=', $ai)->count(),
				'trash' => DB::table('Files')->where('FilesStatus', '=', 'trash')->where('FilesAccountId', '=', $ai)->count()
			]
		];
	
		return $this->api_response($rt);
	}

	//
	// Get file.
	//
	public function get($fileid, $name)
	{
		$files_model = App::make('Models\Files');
	
		// First lets get the file.
		if(! $file = $files_model->get_by_id($fileid))
		{
			return $this->api_response(null, 0);
		}
		
		// Make sure the files names match.
		if($file['FilesName'] != $name)
		{
			return $this->api_response(null, 0);			
		}
			
		return $this->_return_file($file['FilesPath'], $name, $file['FilesType']);
	}

	//
	// Get file thumb.
	//
	public function thumb($fileid, $name)
	{
		$files_model = App::make('Models\Files');
	
		// First lets get the file.
		if(! $file = $files_model->get_by_id($fileid))
		{
			return $this->api_response(null, 0);
		}
		
		// See if we already have a thumb or if we need to create one.
		if(empty($file['FilesThumb']) && ($file['FilesHost'] == 'local'))
		{
			// Build thumbnail.
			$files_model->build_thumb($fileid, Config::get('site.upload_dir') . $file['FilesPath']);

			// Update the file obj.
			$file = $files_model->get_by_id($fileid);
		} 
		
		// Return the image.
		return $this->_return_file($file['FilesThumb'], $file['FilesName'], 'image/jpeg');
	}

	//
	// Get a page thumbnail.
	//
	public function page_thumb($fileid, $page_num, $name)
	{		
		// Do some validation.
		if(! $val = $this->_shared_validation('thumb', $fileid, $page_num, $name))
		{
			return $this->api_response(null, 0);
		} 
				
		// Return the image.
		return $this->_return_file($val['page']['PagesThumb'], basename($val['page']['PagesThumb']), $val['page']['PagesType']);
	}
	

	//
	// Get a page of a document.
	//
	public function page($fileid, $page_num, $name)
	{		
		// Do some validation.
		if(! $val = $this->_shared_validation('page', $fileid, $page_num, $name))
		{
			return $this->api_response(null, 0);
		} 
		
		// Return the image.
		return $this->_return_file($val['page']['PagesPath'], basename($val['page']['PagesPath']), $val['page']['PagesType']);
	}

	//
	// Upload.
	//
	public function upload()
	{		
		// Check dupkey here. If this is a Dup post just return.
		if(Input::get('DupKey') && DupKeys::get_by_key(Input::get('DupKey')))
		{
			return $this->api_response(null, 0);
		}	
	
		// Validation rules
		$validator = Validator::make(
    	Input::all(),
			[
				'file_0' => 'required|mimes:jpeg,png,gif,pdf|max:25600|uploadlimit'
			],
			[
				'uploadlimit' => 'Your monthly upload limit has been reached. Please upgrade your account.'
			]
		);
		
		// Validate the file upload.
		if($validator->fails())
		{
			$messages = $validator->messages();			
			return $this->api_response(null, 0, $messages);
		}
		
		// Set data.
		$data = Input::all();
		
		// Store the file we just uploaded.
		$uniqid = uniqid();
		$org_name = Input::file('file_0')->getClientOriginalName();
		$final =  $uniqid . '.' . Input::file('file_0')->guessExtension();
		Input::file('file_0')->move(Config::get('site.upload_dir'), $final);
	
		// Set up models.
		$files_model = App::make('Models\Files');
		$pages_model = App::make('Models\Pages');			 			
		
		// Add this file to the files table. 
		$id = $files_model->add_by_path(Config::get('site.upload_dir') . $final, [ 'FilesName' => $org_name ]);			
		
		// Build thumbnail.
		$files_model->build_thumb($id, Config::get('site.upload_dir') . $id . '_' . $final);		
		
		// Get page count - this way is faster than Imagick.
		exec('/usr/bin/pdfinfo '. Config::get('site.upload_dir') . $id . '_' . $final . ' | awk \'/Pages/ {print $2}\'', $output);
		$count = (isset($output[0])) ? $output[0] : 1; 					
		
		for($i = 0; $i < $count; $i++)
		{
			$pid = $pages_model->insert([ 'PagesFileId' => $id, 'PagesOrder' => $i ]);
			$pages_model->update([ 'PagesPath' => $pid . '_page_' . $uniqid . '.jpeg' ], $pid);

			// Send create page image to the queue.
			Queue::push('Queue\Pages@create_page_image', 
			[ 
				'FilesId' => $id, 
				'PagesId' => $pid, 
				'AccountId' => Me::get_account_id() 
			]);	
		}
		
		// Return happy
		return $this->api_response([ 'Id' => $id ]);
	}
	
	// ---------------- Private Helper Functions -------------------- //
	
	//
	// Return file.
	//
	private function _return_file($path, $name, $type)
	{
		// If we do not have the file locally grab it from AWS.
		if(! is_file(Config::get('site.upload_dir') . basename($path)))
		{
			// If it is not in cache it must be at Amazon.
			$s3 = Aws::factory([
			  'key' => Config::get('site.s3_access_key'),
			  'secret' => Config::get('site.s3_secret_key'),
			  'region' => Region::US_EAST_1
			])->get('s3');	
			  
			$signed = $s3->getObjectUrl(Config::get('site.s3_bucket'), $path, '+3 minutes');					
			$raw = file_get_contents($signed);
			file_put_contents(Config::get('site.upload_dir') . basename($path), $raw);	
		}		
	
		// Set headers.
		header('Pragma: public');
		header('Cache-Control: max-age=86400');
		header('Expires: '. gmdate('D, d M Y H:i:s \G\M\T', time() + 86400));		  
		header('Content-type: ' . $type);
		header('Content-Disposition: filename="' . $name . '"');
		
		// Send file to the browser.
		readfile(Config::get('site.upload_dir') . basename($path));
		
		// Exit go no further.
		exit;		
	}
	
	//
	// Shared validation for files.
	//
	private function _shared_validation($type, $fileid, $page_num, $name)
	{
		$files_model = App::make('Models\Files');
		$pages_model = App::make('Models\Pages');
	
		// First lets get the file.
		if(! $file = $files_model->get_by_id($fileid))
		{
			return false;
		}
		
		// Double check to see if the page is valid.
		$pages_model->set_col('PagesFileId', $fileid);
		$pages_model->set_col('PagesOrder', $page_num);		
		if(! $page = $pages_model->get())
		{
			return false;			
		} else
		{
			$page = $page[0];
		}
		
		// Set file path
		$file_path = Config::get('site.upload_dir') . basename($file['FilesPath']);		
		
		// If the page file is empty we should generate it.
		if(empty($page['PagesHost']))
		{	
			// Make sure the file is local.
			if(! is_file($file_path))
			{
				// If it is not in cache it must be at Amazon.
				$s3 = Aws::factory([
				  'key' => Config::get('site.s3_access_key'),
				  'secret' => Config::get('site.s3_secret_key'),
				  'region' => Region::US_EAST_1
				])->get('s3');	
				  
				$signed = $s3->getObjectUrl(Config::get('site.s3_bucket'), $file['FilesPath'], '+5 minutes');					
				$raw = file_get_contents($signed);
				file_put_contents($file_path, $raw);
			}
	
			// Create the page image.
			$pages_model->create_image_from_page($page, $file_path);
			
			// Create a thumbnail. 
			$pages_model->create_page_thumb($page['PagesId']);			
			
			// Update our page var.
			$page = $pages_model->get_by_id($page['PagesId']);
		}
		
		return [ 'file' => $file, 'page' => $page, 'file_path' => $file_path ];			
	}
}

//
// Validate if this this request is over our plan limit.
//
Validator::extend('uploadlimit', function($attribute, $value, $parameters)
{
	return true;
	//return Usage::is_scan_allowed();
});

/* End File */