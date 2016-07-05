<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Pages01 extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('Pages', function($table)
		{
    	$table->increments('PagesId');
    	$table->integer('PagesAccountId')->index('PagesAccountId');  
    	$table->integer('PagesFileId')->index('PagesFileId');      	  	
    	$table->string('PagesHost');
    	$table->text('PagesPath');
    	$table->text('PagesThumb');    	     	
    	$table->string('PagesType');
    	$table->string('PagesHash');
    	$table->integer('PagesOrder');    	
    	$table->timestamp('PagesUpdatedAt');
    	$table->timestamp('PagesCreatedAt');
    });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('Pages');
	}

}
