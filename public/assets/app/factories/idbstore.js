//
// A wrapper for making restful api calls.
//
app.factory('Idbstore', [ function() {
	var obj = {
		store: null
	}
	
	//
	// Setup connection.
	//
	obj.connect = function (name, ready)
	{
		obj.store = new IDBStore({
			storeName: name,
			keyPath: 'id',
			dbVersion: site.config.indexeddb[name].version,
			storePrefix: '',
			autoIncrement: true,
			onStoreReady: ready,
			indexes: site.config.indexeddb[name].indexes		
		});			
	}
	
	//
	// Get data from the store.
	//
	obj.get = function (name, callback)
	{
		obj.connect(name, function () {
			obj.store.getAll(callback);
			obj.store = null;
		});	
	}
	
	//
	// Get one record by id from the store.
	//
	obj.get_by_db_id = function (name, id, callback)
	{
		obj.get_where(name, name + 'Id', id, function (data) {
			if(data.length)
			{
				callback(data[0]);
			} else
			{
				callback(null);
			}
			
			obj.store = null;
		});
	}	
	
	//
	// Set the store name.
	//
	obj.get_where = function (name, col, val, callback)
	{
		obj.connect(name, function () {
				
			// Run query.
			obj.store.query(callback, {
			  index: col,
			  keyRange: obj.store.makeKeyRange({ only: val })
			});
				
			obj.store = null;
		});	
	}	
	
	// 
	// Update. We set the state here with update.
	//
	obj.update = function (name, data, callback)
	{
		// Set state to updated.
		data.State = 'updated';
	
		obj.connect(name, function () {
			obj.store.put(data, callback);
			
			obj.store = null;
		});		
	}
	
	// Return the object.
	return obj;       
}]);