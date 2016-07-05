site.config.indexeddb = {
	stores: [ 'Files' ],

	Files: {
		version: 1,
		
		indexes: [
			{ name: 'FilesStatus', keyPath: 'FilesStatus', unique: false, multiEntry: false },
			{ name: 'FilesAccountId', keyPath: 'FilesAccountId', unique: false, multiEntry: false },
			{ name: 'FilesUserId', keyPath: 'FilesUserId', unique: false, multiEntry: false },
			{ name: 'FilesConnectionId', keyPath: 'FilesConnectionId', unique: false, multiEntry: false },
			{ name: 'FilesId', keyPath: 'FilesId', unique: false, multiEntry: false },
			{ name: 'State', keyPath: 'State', unique: false, multiEntry: false }				
		]
	}	
}