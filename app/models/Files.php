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
use \App;
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
use Cloudmanic\System\Models\Accounts\AcctUsersLu;

class Files extends \Cloudmanic\System\Models\Acct
{
	public $delete_log = true;
	private $_users_list = null;
	
	//
	// Add File by path. Just a wrapper for inserting a file.
	//
	public function add_by_path($path, $data = [])
	{
		// Make sure we have a file.
		if(! is_file($path))
		{
			return false;
		}
	
		// Make sure we have a name.
		if((! isset($data['FilesName'])) || empty($data['FilesName']))
		{
			$data['FilesName'] = basename($path);
		}
		
		// Make sure we have a status.
		if((! isset($data['FilesStatus'])) || empty($data['FilesStatus']))
		{
			$data['FilesStatus'] = 'current';
		}		
		
		// Get Mime type
		$finfo = finfo_open(FILEINFO_MIME_TYPE); 
		$mime = finfo_file($finfo, $path);
		finfo_close($finfo);
		
		// Setup the meta data.
		$data['FilesHost'] = 'local'; 
		$data['FilesType'] = $mime;
		$data['FilesAssigned'] = 1;
		$data['FilesHash'] = md5_file($path);
		$data['FilesSize'] = filesize($path);
		$data['FilesPath'] = basename($path);
		$data['FilesUserId'] = Me::get('UsersId');
	
		// Insert into the database.
		$id = $this->insert($data);
		
		// Now that we have the id append it onto the path name.
		$new = $id . '_' . $data['FilesPath'];
		rename($path, Config::get('site.upload_dir') . $new);
		$this->update([ 'FilesPath' => $new ], $id);
	
		return $id;
	}
	
	//
	// Build a thumbnail for this file. We pass in the id 
	// of the file we want to build the thumbnail for.
	// And the local path to the file we need to create a thumb of.
	// We have to run this function before we ship the core file to AWS.
	//
	public function build_thumb($id, $path)
	{	
		// Just double check.
		if(! $file = $this->get_by_id($id))
		{
			return false;
		}
	
		// Make sure this file has not been sent to Amazon yet.
		if($file['FilesHost'] != 'local')
		{
			return false;
		}
		
		// Make sure we have not already created the thumb.
		if(! empty($file['FilesThumb']))
		{
			return false;
		}
	
		// Thumb path.
		$thumb = $id . '_' . uniqid() . '_400x400.jpeg';
		
		// If image Create Thumbnail (400x400)
		if(getimagesize($path))
		{
			$image = ImageWorkshop::initFromPath($path);
			$image->cropMaximumInPixel(0, 0, 'MT');
			$image->resizeInPixel(400, null, true);
			$image->save(Config::get('site.upload_dir'), $thumb);
		} 
		
		// If this is a PDF create a thumbnail (300x300).
		if($file['FilesType'] == 'application/pdf')
		{
			// Get first page of PDF
			$im = new Imagick();
			$im->setResolution(300, 300);
			$im->readimage($path . '[0]');
			$im->setImageFormat('jpeg');
			$im->writeImage(Config::get('site.upload_dir') . $thumb); 
			
			// Make a thumbnail of the PDF
			$image = ImageWorkshop::initFromPath(Config::get('site.upload_dir') . $thumb);
			$image->cropMaximumInPixel(0, 0, 'MT');
			$image->resizeInPixel(400, 400, true);
			$image->save(Config::get('site.upload_dir'), $thumb);
		}
		
		// Update database with path to thumb.
		$this->update([ 'FilesThumb' => $thumb ], $id);
		
		// Return happy.
		return true;		
	}
	
	//
	// Upload file and thumb to AWS.
	// We pass in the file id.
	//
	public function aws_upload($id)
	{
		$file = $this->get_by_id($id);
		$path = Config::get('site.upload_dir') . $file['FilesPath'];
		$thumb_path = Config::get('site.upload_dir') . $file['FilesThumb'];		
		
		// Make sure we have not already uploaded the file.
		if($file['FilesHost'] != 'local')
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
			$this->build_thumb($id, $path);			
		}	
		
		// --- If we made it this far time to upload the file. --- //
		
		// Setup s3 object.
		$s3 = Aws::factory([
			'key' => Config::get('site.s3_access_key'),
			'secret' => Config::get('site.s3_secret_key'),
			'region' => Region::US_EAST_1
		])->get('s3');
		
		// Upload file. - FilesPath
		try {
			$s3->putObject([
				'Bucket' => Config::get('site.s3_bucket'),
				'Key' => $file['FilesAccountId'] . '/' . basename($path),
				'SourceFile' => $path,
				'CacheControl' => 'max-age=86400',
				'Metadata' => [ 'FilesId' => $file['FilesId'] ]
			]);
		} catch (S3Exception $e) {
			return false;
		}	
		
		// Upload thumb. - FilesThumb
		try {
			$s3->putObject([
				'Bucket' => Config::get('site.s3_bucket'),
				'Key' => $file['FilesAccountId'] . '/' . basename($thumb_path),
				'SourceFile' => $thumb_path,
				'CacheControl' => 'max-age=86400',
				'Metadata' => [ 'FilesId' => $file['FilesId'] ]
			]);
		} catch (S3Exception $e) {
			return false;
		}
		
		// Delete the files we no longer need.
		//@unlink($path);
		//@unlink($thumb_path);
		
		// Update the file record in the database.
		$this->update([
			'FilesHost' => 'aws',
			'FilesPath' => $file['FilesAccountId'] . '/' . basename($path),
			'FilesThumb' => $file['FilesAccountId'] . '/' . basename($thumb_path)
		], $file['FilesId']);
		
		// Return happy.
		return true;				
	}
	
	//
	// Format Get.
	//
	public function _format_get(&$data)
	{
		// See if we need to bring in the list of users.
		if(is_null($this->_users_list))
		{
			$this->_users_list = AcctUsersLu::get_index_user_list(Me::get_account_id());
		}
		
		// Merge the user into this array. (Poor man's join).
		if(isset($data['FilesUserId']) && isset($this->_users_list[$data['FilesUserId']]))
		{
			$data = array_merge($data, $this->_users_list[$data['FilesUserId']]);
		}
	
		// A more simple file type.
		if(isset($data['FilesType']))
		{
			$tmp = explode('/', $data['FilesType']);
			$data['Type'] = (isset($tmp[1])) ? $tmp[1] : 'nnknown';
		}
	
		// Add the pages.
		if($this->_extra && isset($data['FilesId']))
		{
			$pages_model = App::make('Models\Pages');
			$pages_model->set_col('PagesFileId', $data['FilesId']);
			$pages_model->set_select([ 'PagesId', 'PagesFileId', 'PagesHost', 'PagesPath', 'PagesThumb', 'PagesOrder' ]);
			$pages_model->set_order('PagesOrder', 'asc');
			$data['Pages'] = $pages_model->get();
		}
		
		// Add the Thumb URL
		if(isset($data['FilesId']) && isset($data['FilesThumb']))
		{
			$data['ThumbUrl'] = URL::to('api/v1/files/thumb/' . $data['FilesId'] . '/thumb.jpeg');
		}
		
		// Add file url.
		if(isset($data['FilesId']) && isset($data['FilesName']))
		{
			$data['Url'] = URL::to('api/v1/files/get/' . $data['FilesId'] . '/' . $data['FilesName']);
		}				
	}	
}

/* End File */