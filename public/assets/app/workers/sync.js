var busy = false;
var models = {};
var listings = {};
var site = {
	sync: {},
	config: {}	
}

importScripts('/assets/app/workers/rest.js');
importScripts('/assets/app/workers/sync/files.js');
importScripts('/assets/app/workers/sync/connections.js');
importScripts('/assets/app/workers/sync/evernotenotebooks.js');
importScripts('/assets/app/configs/indexeddb.js');
importScripts('/assets/app/bower/idbwrapper/idbstore.min.js');

self.requestFileSystemSync = self.webkitRequestFileSystemSync || self.requestFileSystemSync;
self.requestFileSystem = self.webkitRequestFileSystem || self.requestFileSystem;

try {
	// 1 GB
  var fs = requestFileSystemSync(TEMPORARY, 1024*1024*1000);
  
  // Functions we call on load.
  update_listings();
  sync_stores(0);
} catch (e) {
  onError(e);
}

//
// Go through and check for objects that have been updated and need to be 
// posted back to the server.
//
function post_updates(stores)
{
	// Do nothing if we are offline.
	if(! navigator.onLine)
	{
		return false;
	}
		
	// Loop through the different stores.
	var found = false;
	 	
	// Set stores temp array.
	if(stores[0])
	{
		var store = stores[0];
	} else
	{
		sync_stores(0);
		return false;
	}

	models[store].query(function (data) {
		for(var r in data)
	  {				
	  	site.sync[store].update(data[r], data[r].FilesId);
	  }
	  
	  stores.splice(stores.indexOf(store), 1);
	  post_updates(stores);
	}, 
	{
	  index: 'State',
	  keyRange: models[store].makeKeyRange({ only: 'updated' })
	});
}

//
// Setup the IndexDB stores.
// core: 0 = just core, 1 = just non-core, 2 = everything
//
function sync_stores(core)
{
	var ready = site.config.indexeddb.stores.length;
	var stores = [];
	
	// Loop through our different stores and create them.
	for(var i in site.config.indexeddb.stores)
	{		
		var st = site.config.indexeddb.stores[i];
			
		// Sometimes we just want to sync core stuff.
		if((core == 0) && (! site.config.indexeddb[st].core))
		{
			ready--;
			continue;
		}
		
		if((core == 1) && site.config.indexeddb[st].core)
		{
			ready--;
			continue;
		}		
		
		// Just collect the stores we plan to process.
		stores.push(site.config.indexeddb.stores[i]);
		
		models[site.config.indexeddb.stores[i]] = new IDBStore({
		  storeName: site.config.indexeddb.stores[i],
		  keyPath: 'id',
		  dbVersion: site.config.indexeddb[site.config.indexeddb.stores[i]].version,
		  storePrefix: '',
		  autoIncrement: true,
			indexes: site.config.indexeddb[site.config.indexeddb.stores[i]].indexes,	  
		  onStoreReady: function () {
				if(ready == 1)
				{
					for(var r in stores)
					{
						get_rest_data(stores[r]);
					}
				}
				
				ready--;
		  }
		});		
	}
}

//
// Get JSON data from our API.
//
function get_rest_data(store)
{
	// Make API call to get the new data.
	var json = site.sync[store].get();

	// Create GUID for the data.
	for(var r in json.data)
	{
	  json.data[r].id = guid();
	}		
	
	// Clear out old data.
	models[store].clear();			
	
	// Store in local IndexedDB
	models[store].putBatch(json.data, function () {	
	  self.postMessage({ action: 'sync-store', store: store });	
	});
	
	// See if this is a files store.
	if(store == 'Files')
	{
		// See if there are any thumbnails or pages we need to download.
		download_thumbnails(json.data);
		download_pages(json.data);		
	}
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
		post_updates(site.config.indexeddb.stores.slice(0));
				
		busy = false;
	}	
	
	// Sync action
	if(e.data.action == 'sync-non-core')
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
		sync_stores(1);
				
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