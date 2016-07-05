site.config.indexeddb = {
	stores: [ 'Files', 'Connections', 'EvernoteNotebooks' ],

	Connections: {
		version: 1,
		
		core: false,
		
		indexes: [
			{ name: 'ConnectionsId', keyPath: 'ConnectionsId', unique: false, multiEntry: false },
			{ name: 'ConnectionsAccountId', keyPath: 'ConnectionsAccountId', unique: false, multiEntry: false },
			{ name: 'ConnectionsSync', keyPath: 'ConnectionsSync', unique: false, multiEntry: false },
			{ name: 'State', keyPath: 'State', unique: false, multiEntry: false }					
		]		
	},
	
	EvernoteNotebooks: {
		version: 1,
		
		core: false,		
		
		indexes: [
			{ name: 'guid', keyPath: 'guid', unique: false, multiEntry: false },
			{ name: 'State', keyPath: 'State', unique: false, multiEntry: false }					
		]		
	},	

	Files: {
		version: 1,
		
		core: true,		
		
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