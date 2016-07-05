<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include_once '../vendor/autoload.php';

$min = new Cloudmanic\System\Libraries\Minify([
	'config_file' => '../.minify.json',
	'base_dir' => '../public/',
	'js_dir' => '../public/assets/minify/',
	'css_dir' => '../public/assets/minify/',
	'css_url' => 'https://heapless.cloudmanic.com/assets/minify/',
	'js_url' => 'https://heapless.cloudmanic.com/assets/minify/',
	'dev_file' => '../app/views/templates/app-dev-css-js.php',
	'prod_file' => '../app/views/templates/app-prod-css-js.php'
]);

$min->minify();