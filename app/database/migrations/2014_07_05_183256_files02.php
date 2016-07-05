<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class Files02 extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('Files', function($table)
		{		
    	$table->text('FilesNote')->after('FilesName'); 		
    	$table->string('FilesTags')->after('FilesName');     	
    	$table->string('FilesNotebook')->after('FilesName'); 
    	$table->string('FilesTitle')->after('FilesName');
			$table->string('FilesGuid')->after('FilesName');    	     	     	
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
    	$table->dropColumn('FilesNote'); 		
    	$table->dropColumn('FilesTags');     	
    	$table->dropColumn('FilesNotebook'); 
    	$table->dropColumn('FilesTitle');
			$table->dropColumn('FilesGuid'); 			
		});
	}

}
