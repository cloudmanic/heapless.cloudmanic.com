<?php

namespace Queue;

use \App;
use \Crypt;
use \Config;
use Aws\Common\Aws;
use Aws\S3\Enum\StorageClass;
use Aws\S3\Enum\CannedAcl;
use Aws\Common\Enum\Region;
use Aws\S3\Exception\S3Exception;
use Aws\S3\Exception\Parser;
use Cloudmanic\Evernote\Api;
use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\Accounts\Accounts;

class Evernote extends Base 
{
	//
	// Send a heap entry to Evernote.
	//
	public function send($job, $data)
	{
		// Validate request.
		if(! $this->validate_request($job, $data, 'Evernote::send'))
		{
			return false;				
		}
		
		// Setup needed models.
		$files_model = App::make('Models\Files');
		$connections_model = App::make('Models\Connections');	
		
		// Get page.
		if(! $file = $files_model->get_by_id($data['FilesId']))
		{
			$this->log('Job: Evernote::send - File Not Found.');
			return false;			
		}
		
		// Get the connection we are trying to access.
		if(! $con = $connections_model->get_by_id($file['FilesConnectionId']))
		{
			$this->log('Job: Evernote::send - Connection not found.');
			return false;			
		}
		
		// Get & Set this users's access token to Evernote.
		Api::set_access_token(Crypt::decrypt($con['ConnectionsAccessToken']), Config::get('site.evernote_sandbox'));
		
		// See if the file is at Amazon or locally stored.
		if(! is_file(Config::get('site.upload_dir') . basename($file['FilesPath'])))
		{
			// If it is not in cache it must be at Amazon.
			$s3 = Aws::factory([
			  'key' => Config::get('site.s3_access_key'),
			  'secret' => Config::get('site.s3_secret_key'),
			  'region' => Region::US_EAST_1
			])->get('s3');	
			  
			$signed = $s3->getObjectUrl(Config::get('site.s3_bucket'), $file['FilesPath'], '+3 minutes');					
			$raw = file_get_contents($signed);
			file_put_contents(Config::get('site.upload_dir') . basename($file['FilesPath']), $raw);	
		}
		
		// Deal with tags.
		$tags = explode(',', $file['FilesTags']);
		
		foreach($tags AS $key => $row)
		{
			if(! empty($row))
			{
				Api::add_tag($row);			
			}
		}
		
		// Add file we are sending to evernote.
		Api::add_file(Config::get('site.upload_dir') . basename($file['FilesPath']));
		
		// Setup the note body.
		if(! empty($file['FilesNote']))
		{
			$msg = '<p>' . nl2br($file['FilesNote']) . '</p>';
		} else
		{
			$msg = '';
		}
		
		// Send this file to Evernote
		if(! $note_guid = Api::new_note($file['FilesTitle'], $msg, $file['FilesNotebook']))
		{
			echo Api::get_error_string();
			
			$this->log('Job: Evernote::send - Error sending to Evernote (' . Api::get_error_string() . ').');
			return false;				
		} else
		{
			// Update files record with the note id.
			$files_model->update([
				'FilesStatus' => 'processed',
				'FilesGuid' => trim($note_guid)
			], $file['FilesId']);
			
			$this->log('Job: Evernote::send - File Id ' . $file['FilesId'] . ' was successfully sent to Evernote.');
		}
	
		// Delete Job.
		$job->delete();	
	}
}

/* End File */