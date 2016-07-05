<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Files01 extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('Files', function($table)
		{
    	$table->increments('FilesId');
    	$table->integer('FilesAccountId')->index('FilesAccountId'); 
			$table->integer('FilesUserId')->index('FilesUserId');     	   	
    	$table->string('FilesHost');
    	$table->string('FilesName');
    	$table->text('FilesPath'); 
    	$table->text('FilesThumb');     	    	
    	$table->string('FilesType');
    	$table->string('FilesHash');
    	$table->integer('FilesSize');
    	$table->enum('FilesStatus', [ 'current', 'processing', 'processed', 'trash' ])->default('current')->index('FilesStatus');    	
    	$table->timestamp('FilesUpdatedAt');
    	$table->timestamp('FilesCreatedAt');
    });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('Files');
	}

}
