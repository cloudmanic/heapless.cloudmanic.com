<?php

// ------------ Config ---------- //

return [
	// Application / oAuth Settings.
	'app_code' => '',
	'app_clientid' => '',
	'app_secret' => '',
	'app_redirect' => URL::to(''),
	'app_scopes' => '',

	// Configs.
	'logout_url' => '',
	'upload_dir' => storage_path() . '/uploads/',
	'cache_dir' => storage_path() . '/cache/',
	'data_export' => [],	
	
	// Amazon S3 Configs.
	's3_access_key' => '',
	's3_secret_key' => '',
	's3_bucket' => '',
	's3_tmp_access_key' => '',
	's3_tmp_secret_key' => '',
	's3_tmp_bucket' => '',
	
	// Evernote stuff
	'evernote_key' => '',
	'evernote_secret' => '',
	'evernote_sandbox' => false		
];