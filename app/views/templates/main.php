<!DOCTYPE html>
<html lang="en" ng-app="app" ng-controller="controllers.main.template">
<head>
	<title>Heapless</title>
	<meta charset="utf-8" />
	<link rel="shortcut icon" href="/assets/app/styles/images/theme/favicon.ico" />
	
	<script>
		var site_url = '<?=URL::to('')?>';
	</script>	
	
	<?=View::make('templates.app-dev-css-js')?>
		
	<?php /* TODO: Figure out how to minify  ?>
	<?php if(App::environment() == 'local') : ?>
	  <?=View::make('templates.app-dev-css-js')?> 
	  
	<?php else : ?>
	  <?=View::make('templates.app-prod-css-js')?>   
	<?php endif; */ ?>				
</head>

<body ng-file-drop>
	<div id="loading" ng-show="loading">
		<p>Loading....</p>
	</div>
	
	<section class="shell">
		<header>
			<h1 id="logo"><a href="/" class="th-notext">Heapless</a></h1>

			<div class="account-nav th-right">
				<a href="#" class="toggle" ng-bind="account.AccountsDisplayName"></a>
				
				<div class="dropdown">
					<p ng-show="accounts.length > 1">Switch Account</p>

					<ul class="accounts-list" ng-show="accounts.length > 1" ng-repeat="row in accounts">						
						<li ng-class="{ current: (row.AccountsId == account.AccountsId) }">
							<a href="#">
								<b ng-show="(row.AccountsId == account.AccountsId)">{{ row.AccountsDisplayName }}</b>
								<span ng-hide="(row.AccountsId == account.AccountsId)">{{ row.AccountsDisplayName }}</span>
							</a>
						</li>
					</ul>

					<ul>
						<li><a href="/connections">Connections</a></li>
<!--
						<li><a href="/settings/users">Settings</a></li>	
						<li><a href="popups/update-pass.html" data-type="popup">My Account</a></li>	
-->										
						<li><a href="http://cloudmanic.com/support?utm_campaign=heapless-app" target="_blank">Get Help</a></li>
						<li><a href="<?=Config::get('site.logout_url')?>" target="_self">Sign Out</a></li>
					</ul>
				</div>
			</div>
		</header>

		<nav class="top">
		  <form action="#" method="post" id="upload" class="th-left" ng-class="{ disabled: ! online }">
		  	<span class="th-button th-round-20">
		  		Upload Now 
		  		<input ng-file-select type="file" name="file_0" accept="image/png, image/jpeg, application/pdf" multiple />
				</span>
		  </form>
		
		  <form action="#" method="post" id="search" class="th-right">
		  	<input type="text" class="search-field" placeholder="Search your files" ng-model="search_term" ng-change="search()" />
		  	<input type="submit" class="search-button th-notext" value="Search" />
		  </form>
		</nav>

		<section id="main" class="th-cl">
		
			<section id="sidebar" class="th-left">
				<nav>
					<a href="/heap/{{ display_type }}/current" ng-class="{ current: (folder == 'current') }">
						<span class="icon ico-heap"></span> The Heap 
						<span class="red circle" ng-bind="summery.counts.current"></span>
					</a>
					
					<a href="/heap/{{ display_type }}/processed" ng-show="summery.counts.processed" ng-class="{ current: (folder == 'processed') }">
						<span class="icon ico-processed"></span> Processed 
						<span class="green circle" ng-bind="summery.counts.processed"></span>
					</a>
					
					<a href="/heap/{{ display_type }}/processing" ng-show="summery.counts.processing" ng-class="{ current: (folder == 'processing') }">
						<span class="icon ico-processing"></span> Pending 
						<span class="green circle" ng-bind="summery.counts.processing"></span>
					</a>		
					
					<a href="/heap/{{ display_type }}/trash" ng-show="summery.counts.trash" ng-class="{ current: (folder == 'trash') }">
						<span class="icon ico-trash"></span> Trash 
						<span class="grey circle" ng-bind="summery.counts.trash"></span>
					</a>
				</nav>
			
				<div class="advertisement">
					<h6>Advertisement</h6>
					<div class="container">
						<a href="http://cloudmanic.com/skyclerk?utm_campaign=heapless-app" target="_blank">
							<img src="/assets/app/styles/images/advertisement.jpg" alt="" />
						</a>
						<span class="ico-remove th-notext">Remove this ad</span>
					</div>
				</div>
			</section>
		
			<section id="content" class="th-right">
			
			  <div ng-cloak>
			    <div ng-view></div>
			  </div>
			  
			</section>	
			
		</section>

		<footer>
			<nav class="th-left">
				<div class="col th-left">
					<h4>Heapless</h4>
					<ul>
						<li><a href="/heap/thumbs">The Heap</a></li>
						<li><a href="/heap/{{ display_type }}/processed">Processed</a></li>
						<li><a href="/heap/{{ display_type }}/trash">Trash</a></li>
					</ul>
				</div>
				<div class="col th-left">
					<h4>Account Settings</h4>
					<ul>
						<li><a href="/connections">Connections</a></li>
						<li><a href="/settings/users">Settings</a></li>
						<li><a href="#">My Account</a></li>
					</ul>
				</div>
				<div class="col th-left">
					<h4>Help Desk</h4>
					<ul>
						<li><a href="http://cloudmanic.com/support?utm_campaign=heapless-app" target="_blank">Support</a></li>
						<li><a href="http://twitter.com/cloudmanic" target="_blank">Twitter</a></li>
						<li><a href="http://facebook.com/cloudmanic" target="_blank">Facebook</a></li>
						<li><a href="http://cloudmanic.com/blog?utm_campaign=heapless-app" target="_blank">Blog</a></li>
					</ul>
				</div>
			</nav>

			<section class="copyright th-right">
				<a href="http://cloudmanic.com?utm_campaign=heapless-app" class="th-notext" id="logo-footer">Heapless is a product of Cloudmanic Labs</a>

				<p>2014 © Copyright Cloudmanic Labs, LLC</p>
			</section>
		</footer>

		<div class="send-dropdown th-cl">
			<span class="hide-shadow"></span>

			<ul>
				<li ng-repeat="row in connections">
					<a href="#" colorbox="/assets/app/views/connections/popups/{{ row.ConnectionsType }}-send.html" ng-click="connection_send($index)">
						<span class="icon {{ row.ConnectionsType }}"></span> 
						{{ row.ConnectionsName }}
					</a>
				</li>
<?php
/*
				<li><a href="popups/connect-skyclerk.html" data-type="popup"><span class="icon skyclerk"></span> Skyclerk - Cloudmanic</a></li>
				<li><a href="popups/connect-skyclerk.html" data-type="popup"><span class="icon skyclerk"></span> Skyclerk - Matthews Etc.</a></li>
				<li><a href="popups/connect-dropbox.html" data-type="popup"><span class="icon dropbox"></span> Dropbox - Matthews Etc.</a></li>
				<li><a href="popups/connect-evernote.html" data-type="popup"><span class="icon evernote"></span> Evernote - Cloudmanic</a></li>
				<li><a href="popups/connect-googledocs.html" data-type="popup"><span class="icon googledocs"></span> GDocs - Matthews Etc.</a></li>
				<li><a href="popups/connect-freshbooks.html" data-type="popup"><span class="icon freshbooks"></span> Freshbooks - Matthew...</a></li>
				<li><a href="popups/connect-winenotes.html" data-type="popup"><span class="icon winenotes"></span> Winenotes - Cloudma...</a></li>
				<li><a href="popups/connect-rackspace.html" data-type="popup"><span class="icon rackspace"></span> Rackspace - Matthew...</a></li>
				<li><a href="popups/connect-amazon.html" data-type="popup"><span class="icon amazon"></span> Connect to Amazon S3</a></li>
*/
?>
			</ul>

			<?php /* <a href="#" class="th-button th-left th-round-20 th-mg-l-10">Send it Now</a> */ ?>

			<a href="/connections" class="l-add-connection th-right th-mg-r-15">Add a new connection</a>
		</div>		
		
		<?=View::make('parts.uploading-modal')?>

		<div class="info-tooltip"></div>

		<div class="delete-dialog">
			<span class="hide-border"></span>
			
			<p>Are you sure you want to delete this file?</p>

			<span class="confirm th-left">YES</span>
			<span class="l-cancel th-left">No, Cancel</span>
		</div>
	</section>
</body>
</html>