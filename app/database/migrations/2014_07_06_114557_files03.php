<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Files03 extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('Files', function($table)
		{		
    	$table->integer('FilesConnectionId')->after('FilesName');  	     	     	
    });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function table()
	{
		Schema::table('Files', function($table)
		{
    	$table->dropColumn('FilesConnectionId');			
		});
	}


}
