<?php

namespace Commands;

use \App;
use \DB;
use Illuminate\Console\Command;
use Cloudmanic\System\Libraries\Me;
use Cloudmanic\System\Models\Accounts\Accounts;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Input\InputArgument;

class AmazonS3Push extends Command 
{
	protected $name = 'heapless:amazons3push';
	protected $description = 'Push any files that have not been pushed to Amazon to AWS S3.';

	//
	// Run the command.
	//
	public function fire()
	{
		$files_model = App::make('Models\Files');
		$pages_model = App::make('Models\Pages');	
			
		$this->info('[' . date('n-j-Y g:i:s a') . '] Starting AWS S3 Push');
		
		// Get all the files that have not been shipped to Amazon.
		$rt = DB::table('Files')->where('FilesHost', 'local')->get();
		foreach($rt AS $key => $row)
		{
			// Get account.
			$account = Accounts::get_by_id($row->FilesAccountId);
			Me::set_account($account);
		
			$this->info('[' . date('n-j-Y g:i:s a') . '] Uploading FilesId - #' . $row->FilesId);
			if(! $files_model->aws_upload($row->FilesId))
			{
				$this->error('[' . date('n-j-Y g:i:s a') . '] File upload to AWS failed for FilesId - #' . $row->FilesId);
			}
		}

		// Get all the pages that need to be shipped to Amazon.
		$rt = DB::table('Pages')->where('PagesHost', 'local')->get();
		foreach($rt AS $key => $row)
		{
			// Get account.
			$account = Accounts::get_by_id($row->PagesAccountId);
			Me::set_account($account);		
		
			$this->info('[' . date('n-j-Y g:i:s a') . '] Uploading PagesId - #' . $row->PagesId);
			if(! $pages_model->aws_upload($row->PagesId))
			{
				$this->error('[' . date('n-j-Y g:i:s a') . '] File upload to AWS failed for PagesId - #' . $row->PagesId);
			}
		}		
		
		$this->info('[' . date('n-j-Y g:i:s a') . '] Ending AWS S3 Push');	
	}
}

/* End File */