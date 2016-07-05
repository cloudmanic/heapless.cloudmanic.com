var busy = false;
var models = {};
var listings = {};
var site = {
	sync: {},
	config: {}	
}

importScripts('/assets/app/workers/rest.js');
importScripts('/assets/app/workers/sync/files.js');
importScripts('/assets/app/configs/indexeddb.js');
importScripts('/assets/app/bower/idbwrapper/idbstore.min.js');

self.requestFileSystemSync = self.webkitRequestFileSystemSync || self.requestFileSystemSync;
self.requestFileSystem = self.webkitRequestFileSystem || self.requestFileSystem;

try {
	// 1 GB
  var fs = requestFileSystemSync(TEMPORARY, 1024*1024*1000);
  
  // Functions we call on load.
  update_listings();
  setup_stores();
} catch (e) {
  onError(e);
}

//
// Go through and check for objects that have been updated and need to be 
// posted back to the server.
//
function post_updates()
{
	// Do nothing if we are offline.
	if(! navigator.onLine)
	{
		return false;
	}
		
	// Loop through the different stores.
	var found = false;
	 	
	for(var i in site.config.indexeddb.stores)
	{
		models[site.config.indexeddb.stores[i]].query(function (data) {
			var total = parseInt(data.length);
		
			if(data.length)
			{
				found = true;
			}
		
			for(var r in data)
			{				
				site.sync[site.config.indexeddb.stores[i]].update(data[r], data[r].FilesId, function (json) {
					total--;
					
					// Have we processed everything? If so do a full sync with our server.
					if((total <= 0) && ((i + 1) == site.config.indexeddb.stores.length))
					{
						get_files_data();
					}
				});
			}
		}, 
		{
			index: 'State',
			keyRange: models[site.config.indexeddb.stores[i]].makeKeyRange({ only: 'updated' })
		});
	}
	
	// If there was nothing to update.
	if(! found)
	{
		get_files_data();
	}
}

//
// Setup the IndexDB stores.
//
function setup_stores()
{
	// Init Files 
	models['Files'] = new IDBStore({
	  storeName: 'Files',
	  keyPath: 'id',
	  dbVersion: site.config.indexeddb.Files.version,
	  storePrefix: '',
	  autoIncrement: true,
		indexes: site.config.indexeddb.Files.indexes,	  
	  onStoreReady: get_files_data
	});
}

//
// Populate the model.
//
function populate_model(name, data)
{
	models[name].clear();

	for(var i in data)
	{
		data[i].id = guid();
	}
	
	models[name].putBatch(data, function () {
		// Report back that our sync is done. TODO: As we sync more data this will have to move.
		self.postMessage({ action: 'sync-done' });	
	});
}

//
// Make a hash of all the files we currently have.
//
function update_listings(dirReader)
{
	if(! dirReader)
	{
		var dirEntry = fs.root.getDirectory('/', {});
		var dirReader = dirEntry.createReader();
	}
	
	var entries = dirReader.readEntries();
	
	for(var i = 0; i < entries.length; i++) 
	{
	  var entry = entries[i];
	  
	  if(entry.isDirectory)
	  {
	    console.log('Directory: ' + entry.fullPath);
	  } else
	  {
			listings[entry.fullPath.replace('/', '').trim()] = entry.toURL();
	  }
	}
	
	if(entries.length > 0)
	{
		update_listings(dirReader);
	}
}

//
// Make JSON request.
//
function get_json(url)
{
  try {
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', url, false);
		
		xhr.send();
		
		return JSON.parse(xhr.response);
  } catch(e) {
		console.log('XHR Error ' + e.toString());
  }	
}

// 
// Make Ajax request to get a file.
//
function make_file_request(url) 
{
  try {
    var xhr = new XMLHttpRequest();
    
    // Note: synchronous
    xhr.open('GET', url, false); 
    
    xhr.responseType = 'arraybuffer';
    
    xhr.send();
    
    return xhr.response;
  } catch(e) {
		console.log('XHR Error ' + e.toString());
  }
}

//
// Generic file catcher.
//
function onError(e) 
{
  console.log('ERROR: ' + e.toString()); // Forward the error to main app.
}

//
// Download files data.
//
function get_files_data()
{
	if(! navigator.onLine)
	{
		console.log('Offline....');
		self.postMessage({ action: 'sync-done' });
		return false;
	}

	var url = 'http://heapless.cloudmanic.dev/api/v1/files?extra=true';
	var data = get_json(url);
	
	// Go through the data and see if we have local files.
	for(var i in data.data)
	{
		// Deal with thumbnails
		var base = data.data[i].ThumbUrl.split('/').reverse()[0];
		var id = data.data[i].ThumbUrl.split('/').reverse()[1];
		var hash = id + '_' + base;
		
		data.data[i].OldUrl = data.data[i].ThumbUrl;
		
		if(listings[hash])
		{
		  data.data[i].ThumbUrl = listings[hash];
		}
		
		// Deal with page thumbs.
		for(var p in data.data[i].Pages)
		{
			var thumb = 'thumb_' + data.data[i].Pages[p].ThumbUrl.split('/').reverse()[0].trim();
				
			data.data[i].Pages[p].OldThumbUrl = data.data[i].Pages[p].ThumbUrl;
			
			if(listings[thumb])
			{
			  data.data[i].Pages[p].ThumbUrl = listings[thumb];
			}			
		}
		
		// Deal with pages.
		for(var p in data.data[i].Pages)
		{
			var page = data.data[i].Pages[p].Url.split('/').reverse()[0].trim();
				
			data.data[i].Pages[p].OldUrl = data.data[i].Pages[p].Url;
			
			if(listings[page])
			{
			  data.data[i].Pages[p].Url = listings[page];
			}			
		}										
	}
	
	// Populate IndexDB
	populate_model('Files', data.data);
	
	// See if there are any thumbnails or pages we need to download.
	download_thumbnails(data.data);
	download_pages(data.data);
}

//
// Download page images.
//
function download_pages(data)
{
	for(var i in data)
	{	
		// Thumbnails
		for(var p in data[i].Pages)
		{
		  var thumb = 'thumb_' + data[i].Pages[p].OldThumbUrl.split('/').reverse()[0].trim();
		  
		  if(listings[thumb])
		  {
		  	continue;
		  }
		  
			var fileEntry = fs.root.getFile('/' + thumb, { create: true });
			
			try {	
			  var arrayBuffer = make_file_request(data[i].Pages[p].OldThumbUrl);
			  var blob = new Blob([ new Uint8Array(arrayBuffer) ], { type: 'image/jpeg' });
			
			  try {
			    fileEntry.createWriter().write(blob);
			  } catch (e) {
			    onError(e);
			  }	
			  
			} catch (e) {
			  onError(e);
			}
		}
			
		// Pages
		for(var p in data[i].Pages)
		{			
		  var page = data[i].Pages[p].OldUrl.split('/').reverse()[0].trim();
		  
		  if(listings[page])
		  {
		  	continue;
		  }
		  
			var fileEntry = fs.root.getFile('/' + page, { create: true });
			
			try {	
			  var arrayBuffer = make_file_request(data[i].Pages[p].OldUrl);
			  var blob = new Blob([ new Uint8Array(arrayBuffer) ], { type: 'image/jpeg' });
			
			  try {
			    fileEntry.createWriter().write(blob);
			  } catch (e) {
			    onError(e);
			  }	
			  
			} catch (e) {
			  onError(e);
			}			
		}	
	}	
}

//
// Download thumbnail images.
//
function download_thumbnails(data)
{
	for(var i in data)
	{		
	  var base = data[i].OldUrl.split('/').reverse()[0];
	  var id = data[i].OldUrl.split('/').reverse()[1];
		var hash = id + '_' + base;
	  
	  if(listings[hash])
	  {
	  	continue;
	  }
	  		
	  var fileEntry = fs.root.getFile('/' + id + '_' + base, { create: true });
	  
	  try {	
	  	var arrayBuffer = make_file_request(data[i].OldUrl);
	  	var blob = new Blob([ new Uint8Array(arrayBuffer) ], { type: 'image/jpeg' });
	  
	  	try {
	  	  fileEntry.createWriter().write(blob);
	  	} catch (e) {
	  	  onError(e);
	  	}	
	  	
	  } catch (e) {
	    onError(e);
	  }		
	}
}

//
// So we do not make more than one request to the server we just pass in the data to sync this way.
//
self.addEventListener('message', function(e) 
{
	// Get a list of known files.
	if(e.data.action == 'listing')
	{
		self.postMessage({ action: 'listing', data: listings });
	}

	// Sync action
	if(e.data.action == 'sync')
	{	
		if(busy)
		{
			console.log('busy');
			return false;
		} else
		{
			busy = true;
		}
	
		// Models to sync.
		update_listings();
		post_updates();
				
		busy = false;
	}	
}, false);

// --------------------- Helper Function ----------------- //

//
// Get a random GUID.
//
var guid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();