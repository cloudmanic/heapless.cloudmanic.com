<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Connections01 extends Migration 
{

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('Connections', function($table)
		{
    	$table->increments('ConnectionsId');
    	$table->integer('ConnectionsAccountId')->index('ConnectionsAccountId');       	  	
    	$table->string('ConnectionsType')->index('ConnectionsType');
    	$table->string('ConnectionsName');
    	$table->text('ConnectionsAccessToken');
    	$table->text('ConnectionsUrl');
    	$table->string('ConnectionsUserId');
    	$table->integer('ConnectionsExpires');
    	$table->enum('ConnectionsSync', [ 'yes', 'no' ])->default('no');    	 
    	$table->timestamp('ConnectionsUpdatedAt');
    	$table->timestamp('ConnectionsCreatedAt');
    });
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('Connections');
	}

}
