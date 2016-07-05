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
use \Imagick;
use Aws\Common\Aws;
use Aws\S3\Enum\StorageClass;
use Aws\S3\Enum\CannedAcl;
use Aws\Common\Enum\Region;
use Aws\S3\Exception\S3Exception;
use Aws\S3\Exception\Parser;
use PHPImageWorkshop\ImageWorkshop;
use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\Accounts\Accounts;

class Pages extends \Cloudmanic\System\Models\Acct
{
	public $delete_log = true;
	private $_s3 = null;
	
	//
	// Construct.
	//
	public function __construct()
	{
		parent::__construct();

		// Setup S3 obj.
		$this->_s3 = Aws::factory([
		  'key' => Config::get('site.s3_access_key'),
		  'secret' => Config::get('site.s3_secret_key'),
		  'region' => Region::US_EAST_1
		])->get('s3');			
	}
	
	//
	// Upload file and thumb to AWS.
	// We pass in the file id.
	//
	public function aws_upload($id)
	{
		$file = $this->get_by_id($id);
		$path = Config::get('site.upload_dir') . $file['PagesPath'];
		$thumb_path = Config::get('site.upload_dir') . $file['PagesThumb'];		
		
		// Make sure we have not already uploaded the file.
		if($file['PagesHost'] != 'local')
		{
			return false;
		}
		
		// Make sure we still have a copy of the file locally.
		if(! is_file($path))
		{
			return false;			
		}
		
		// Make sure we have a thumbnail
		if(! is_file($thumb_path))
		{
			$this->create_page_thumb($id);			
		}	
		
		// --- If we made it this far time to upload the file. --- //
				
		// Upload file. - PagesPath
		try {
			$this->_s3->putObject([
				'Bucket' => Config::get('site.s3_bucket'),
				'Key' => $file['PagesAccountId'] . '/' . basename($path),
				'SourceFile' => $path,
				'Expires' => gmdate('D, d M Y H:i:s \G\M\T', time() + 86400),
				'CacheControl' => 'max-age=86400',
				'Metadata' => [ 'PagesId' => $file['PagesId'] ]
			]);
		} catch (S3Exception $e) {
			return false;
		}	
		
		// Upload thumb. - PagesThumb
		try {
			$this->_s3->putObject([
				'Bucket' => Config::get('site.s3_bucket'),
				'Key' => $file['PagesAccountId'] . '/' . basename($thumb_path),
				'SourceFile' => $thumb_path,
				'CacheControl' => 'max-age=86400',
				'Expires' => gmdate('D, d M Y H:i:s \G\M\T', time() + 86400),				
				'Metadata' => [ 'PagesId' => $file['PagesId'] ]
			]);
		} catch (S3Exception $e) {
			return false;
		}
		
		// Delete the files we no longer need.
		//@unlink($path);
		//@unlink($thumb_path);
		
		// Update the file record in the database.
		$this->update([
			'PagesHost' => 'aws',
			'PagesPath' => $file['PagesAccountId'] . '/' . basename($path),
			'PagesThumb' => $file['PagesAccountId'] . '/' . basename($thumb_path)
		], $file['PagesId']);
		
		// Return happy.
		return true;				
	}	
	
	// 
	// Create a thumbnail of the page. We pass in the id of the page.
	//
	public function create_page_thumb($id)
	{
		// Get file	by id.
		if(! $page = $this->get_by_id($id))
		{
			return false;
		}
		
		// Thumb & Path.
		$path = Config::get('site.upload_dir') . basename($page['PagesPath']);
		$base = explode('.', basename($path))[0];
		$thumb = $base . '_thumb.jpeg';		
		
		// See if we have already create the page.
		if(is_file(Config::get('site.upload_dir') .  $thumb))
		{
			return [ 'path' => Config::get('site.upload_dir') .  $thumb, 'thumb' => $thumb ];
		}
			
		// Make sure the file is stored locally. We can only create a thumbnail 
		// if the file is stored locally. 
		if(! is_file($path))
		{
			// If it is not in cache it must be at Amazon.				
			$signed = $this->_s3->getObjectUrl(Config::get('site.s3_bucket'), $page['PagesPath'], '+2 minutes');		
						
			if(! $raw = @file_get_contents($signed))
			{
				return false;
			}
			
			file_put_contents($path, $raw);
		}
		
		// If image Create Thumbnail (600px)
		if(getimagesize($path))
		{
			$image = ImageWorkshop::initFromPath($path);
			$image->resizeInPixel(600, null, true);
			$image->save(Config::get('site.upload_dir'), $thumb, false, null, 95);
		} 
		
		// Update database with new path.
		$this->update([ 'PagesThumb' => $thumb ], $id);
		
		// Return path.
		return [ 'path' => Config::get('site.upload_dir') .  $thumb, 'thumb' => $thumb ];		
	}		
	
	//
	// Create image from the page. We pass in the full 
	// page object (what we get back from get_by_id).
	// We also pass in the local file path to the orginal file.
	//
	public function create_image_from_page($page, $file_path)
	{
		$thumb = Config::get('site.upload_dir') . basename($page['PagesPath']);	
	
		// See if we have already create the page.
		if(is_file($thumb))
		{
			return [ 'path' => $thumb ];	
		}
		
		// Make sure the file is stored locally. We can only create a thumbnail 
		// if the file is stored locally. 
		if(! is_file(Config::get('site.upload_dir') . basename($file_path)))
		{
			// If it is not in cache it must be at Amazon.
			$signed = $this->_s3->getObjectUrl(Config::get('site.s3_bucket'), $page['PagesPath'], '+2 minutes');		
						
			if(! $raw = @file_get_contents($signed))
			{
				return false;
			}
			
			file_put_contents(Config::get('site.upload_dir') . basename($file_path), $raw);
		}		
	
		// Create the page image.
		$im = new Imagick();
		$im->setResolution(300, 300);
		$im->readImage(Config::get('site.upload_dir') . basename($file_path) . '[' . $page['PagesOrder'] . ']');
		$im->setImageFormat('jpeg');
		$im->writeImage($thumb);
		$im->clear(); 
		$im->destroy();	
		
		// Our page stores should be 700px wide
		$r = getimagesize($thumb);
		if($r[0] > 700)
		{
			$image = ImageWorkshop::initFromPath($thumb);
			$image->resizeInPixel(700, null, true);
			$image->save(Config::get('site.upload_dir'), basename($thumb), false, null, 95);
		}
		
		// Store this newly created page.
		$this->update([ 
		  'PagesHost' => 'local', 
		  'PagesPath' => basename($thumb),
		  'PagesType' => 'image/jpeg', 
		  'PagesHash' => md5_file($thumb)  
		], $page['PagesId']);	
		
		// Return path.
		return [ 'path' => Config::get('site.upload_dir') . $page['PagesPath'] ];	
	}
	
	//
	// Format Get.
	//
	public function _format_get(&$data)
	{
		// Setup full URLs for images.
		if(isset($data['PagesFileId']) && isset($data['PagesOrder']) && 
				isset($data['PagesPath']) && isset($data['PagesThumb']))
		{
			$data['Url'] = URL::to('api/v1/files/page/' . $data['PagesFileId'] . '/' . 
			  							$data['PagesOrder'] . '/' . basename($data['PagesPath']));
			$data['ThumbUrl'] = URL::to('api/v1/files/page_thumb/' . $data['PagesFileId'] . '/' . 
			  							$data['PagesOrder'] . '/' . basename($data['PagesPath']));
		}
	}	
}

/* End File */