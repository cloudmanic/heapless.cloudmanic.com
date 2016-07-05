var controllers = {}
var sync_worker = null;
var state = {
	first_files_sync: false
}

var app = angular.module('app', [ 
	'ngRoute', 
	'ngAnimate',
	'angularFileUpload'
]);

// Config Location Providers
app.config(['$locationProvider', function ($locationProvider) { 
	$locationProvider.html5Mode(true); 
}]);

//
// Sanitize images and hrefs for local storage.
//
app.config([ '$compileProvider', function($compileProvider) {
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|filesystem|file|ftp|mailto|chrome-extension):/);
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|filesystem|file|ftp|mailto|chrome-extension):/);
}]);