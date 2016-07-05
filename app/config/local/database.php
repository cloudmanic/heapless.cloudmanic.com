<?php

return [

	'connections' => [

		'app' => [
			'driver'    => 'mysql',
			'host'      => 'localhost',
			'database'  => 'cloudmanic_heapless',
			'username'  => 'root',
			'password'  => 'foobar',
			'charset'   => 'utf8',
			'collation' => 'utf8_unicode_ci',
			'prefix'    => '',
		],
		
		'accounts' => [
			'driver'    => 'mysql',
			'host'      => 'localhost',
			'database'  => 'cloudmanic_accounts',
			'username'  => 'root',
			'password'  => 'foobar',
			'charset'   => 'utf8',
			'collation' => 'utf8_unicode_ci',
			'prefix'    => '',
		],		

	],

];
