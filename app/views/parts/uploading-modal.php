<div class="uploading-modal" ng-hide="upload_model_hide" ng-file-drop> 
  <div class="top">
  	<h4>
  		<span ng-hide="uploading_count">&nbsp;</span>
  		<span ng-show="uploading_count">Uploading</span> 
  		<span ng-show="uploading_count"> 
  			<span class="num">{{ uploading_count }}</span> of 
				<span class="total">{{ uploader.queue.length }}</span>
  		</span>
		</h4>
  	<span class="minimize th-notext" ng-style="{ 'right': uploading_min_right }" ng-click="uploading_minimize()">Minimize</span>
  	<span class="close th-notext" ng-hide="uploading" ng-click="uploading_close()">Close</span>
  </div>
  
  <div class="body" ng-hide="upload_model_minimize">
  	<div class="uploads-list">
<?php
/*
			<div class="drag-placeholder" ng-file-over>
			  <p>Drag files here to start uploading....</p>
			</div> 
*/
?>			 	
			
  		<ul>
  			<li ng-repeat="row in uploader.queue">
  				<div ng-hide="(row.isSuccess || (row.progress == 100))">
  					<p><span class="doc-icon icon th-left"></span> {{ row.file.name | truncate:50 }}</p>
						<p>
  						<span class="th-right">
  							{{ row.file.size/1024/1024 | number:2 }} Mb ({{ row.progress }}%)
							</span> 
							<span class="progress">
								<span ng-style="{ 'width': row.progress + '%' }"></span>
							</span>
						</p>
  				</div>
  				
  				<div class="processing" ng-show="((! row.isSuccess) && (row.progress >= 100))">
  					<p><span class="doc-icon icon th-left"></span>{{ row.file.name | truncate:50 }}</p>
						<p class="note">Processing...</p>  				
  				</div>  				
  				
  				<div ng-show="row.isSuccess">
  					<p><span class="doc-icon icon th-left"></span>{{ row.file.name | truncate:50 }}</p>
						<p><span class="clear th-right" ng-click="row.remove()">Clear</span> Uploaded on 12 May 2011 at 9:43PM</p>  				
  				</div>
  			</li> 								  			
  		</ul>
  	</div>
  	<div class="bottom">
  		<p>
  			<a href="popups/upgrade.html" data-type="popup" class="th-right">Upgrade your Heapless</a>
				You are using 2 MB of 5MB Total
			</p>
  	</div>
  </div>
</div>





<?php
/*


<div class="uploading-modal">
  <h2>The queue. Length: {{ uploader.queue.length }}</h2>
  
  <div class="top">
  	<h4>Uploading .... <span class="num">1</span> of <span class="total">3</span></h4>
  	<span class="minimize th-notext">Minimize</span>
  	<span class="close th-notext">Close</span>
  </div>
  <div class="body">
  	<div class="uploads-list">
  		<ul>
  			<li>
  				<p><span class="doc-icon icon th-left"></span> PS-template.doc</p>
  				<p><span class="th-right">944KB (75%)</span> <span class="progress"><span style="width: 75%;"></span></span></p>
  			</li>
  			<li>
  				<p><span class="image-icon icon th-left"></span> QuickCell Technologies.jpg</p>
  				<p><span class="clear th-right">Clear</span> <span class="ico-trash th-right th-notext">Trash</span> Uploaded on 12 May 2011 at 9:43PM</p>
  			</li>
  			<li class="error">
  				<p><span class="doc-icon icon th-left"></span> PS-template2011.exe</p>
  				<p><span class="clear th-right">Clear</span> Invalid file type [.exe]</p>
  			</li>
  			<li>
  				<p><span class="doc-icon icon th-left"></span> PS-template.doc</p>
  				<p><span class="th-right">944KB (75%)</span> <span class="progress"><span style="width: 75%;"></span></span></p>
  			</li>
  			<li>
  				<p><span class="image-icon icon th-left"></span> QuickCell Technologies.jpg</p>
  				<p><span class="clear th-right">Clear</span> <span class="ico-trash th-right th-notext">Trash</span> Uploaded on 12 May 2011 at 9:43PM</p>
  			</li>
  			<li>
  				<p><span class="doc-icon icon th-left"></span> PS-template.doc</p>
  				<p><span class="th-right">944KB (75%)</span> <span class="progress"><span style="width: 75%;"></span></span></p>
  			</li>
  			<li>
  				<p><span class="image-icon icon th-left"></span> QuickCell Technologies.jpg</p>
  				<p><span class="clear th-right">Clear</span> <span class="ico-trash th-right th-notext">Trash</span> Uploaded on 12 May 2011 at 9:43PM</p>
  			</li>
  		</ul>
  	</div>
  	<div class="bottom">
  		<p><a href="popups/upgrade.html" data-type="popup" class="th-right">Upgrade your Heapless</a>You are using 2 MB of 5MB Total</p>
  	</div>
  </div>
</div>






		<!--#if expr="$DOCUMENT_NAME = the-heap-uploading.html" -->
		<div class="uploading-modal">
			<div class="top">
				<h4>Uploading .... <span class="num">1</span> of <span class="total">3</span></h4>
				<span class="minimize th-notext">Minimize</span>
				<span class="close th-notext">Close</span>
			</div>
			<div class="body">
				<div class="uploads-list">
					<ul>
						<li>
							<p><span class="doc-icon icon th-left"></span> PS-template.doc</p>
							<p><span class="th-right">944KB (75%)</span> <span class="progress"><span style="width: 75%;"></span></span></p>
						</li>
						<li>
							<p><span class="image-icon icon th-left"></span> QuickCell Technologies.jpg</p>
							<p><span class="clear th-right">Clear</span> <span class="ico-trash th-right th-notext">Trash</span> Uploaded on 12 May 2011 at 9:43PM</p>
						</li>
						<li class="error">
							<p><span class="doc-icon icon th-left"></span> PS-template2011.exe</p>
							<p><span class="clear th-right">Clear</span> Invalid file type [.exe]</p>
						</li>
					</ul>
				</div>
				<div class="bottom">
					<p><a href="popups/upgrade.html" data-type="popup" class="th-right">Upgrade your Heapless</a>You are using 2 MB of 5MB Total</p>
				</div>
			</div>
		</div>


		<!--#elif expr="$DOCUMENT_NAME = the-heap-uploading-drag.html" -->
		<div class="uploading-modal">
			<div class="top">
				<h4>Uploading .... <span class="num">1</span> of <span class="total">3</span></h4>
				<span class="minimize th-notext">Minimize</span>
				<span class="close th-notext">Close</span>
			</div>
			<div class="body">
				<div class="uploads-list">
					<div class="drag-placeholder">
						<p>Drag files here to start uploading....</p>
					</div>
					<ul>
						<li>
							<p><span class="doc-icon icon th-left"></span> PS-template.doc</p>
							<p><span class="th-right">944KB (75%)</span> <span class="progress"><span style="width: 75%;"></span></span></p>
						</li>
						<li>
							<p><span class="image-icon icon th-left"></span> QuickCell Technologies.jpg</p>
							<p><span class="clear th-right">Clear</span> <span class="ico-trash th-right th-notext">Trash</span> Uploaded on 12 May 2011 at 9:43PM</p>
						</li>
						<li class="error">
							<p><span class="doc-icon icon th-left"></span> PS-template2011.exe</p>
							<p><span class="clear th-right">Clear</span> Invalid file type [.exe]</p>
						</li>
					</ul>
				</div>
				<div class="bottom">
					<p><a href="popups/upgrade.html" data-type="popup" class="th-right">Upgrade your Heapless</a>You are using 2 MB of 5MB Total</p>
				</div>
			</div>
		</div>

		<!--#elif expr="$DOCUMENT_NAME = the-heap-uploading-success.html" -->
		<div class="uploading-modal">
			<div class="top">
				<h4>Uploading .... <span class="num">1</span> of <span class="total">3</span></h4>
				<span class="minimize th-notext">Minimize</span>
				<span class="close th-notext">Close</span>
			</div>
			<div class="body">
				<div class="uploads-list">
					<ul>
						<li>
							<p><span class="doc-icon icon th-left"></span> PS-template.doc</p>
							<p><span class="th-right">944KB (75%)</span> <span class="progress"><span style="width: 75%;"></span></span></p>
						</li>
						<li>
							<p><span class="image-icon icon th-left"></span> QuickCell Technologies.jpg</p>
							<p><span class="clear th-right">Clear</span> <span class="ico-trash th-right th-notext">Trash</span> Uploaded on 12 May 2011 at 9:43PM</p>
						</li>
						<li class="error">
							<p><span class="doc-icon icon th-left"></span> PS-template2011.exe</p>
							<p><span class="clear th-right">Clear</span> Invalid file type [.exe]</p>
						</li>
					</ul>
				</div>
				<div class="bottom">
					<p><a href="popups/upgrade.html" data-type="popup" class="th-right">Upgrade your Heapless</a>You are using 2 MB of 5MB Total</p>
				</div>
			</div>
		</div>
		<!--#endif -->

*/
?>