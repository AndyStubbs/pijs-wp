let g_myIndexDB = ( function () {
	const VERSION = 1;
	let m_dataName = "data";
	let m_objectStore = "items";
	let m_db = null;
	let m_stashedRequests = [];

	function init( dataName, objectStore ) {
		m_dataName = dataName;
		m_objectStore = objectStore;
		let openRequest = indexedDB.open( m_dataName, VERSION );

		openRequest.onupgradeneeded = function() {
			m_db = openRequest.result;
			if ( !m_db.objectStoreNames.contains( m_objectStore ) ) {
				m_db.createObjectStore( m_objectStore, { "keyPath": "key" } );
			}
		};

		openRequest.onerror = function() {
		  console.error( "Error", openRequest.error );
		};
	
		openRequest.onsuccess = function() {
			m_db = openRequest.result;
	
			m_db.onversionchange = function() {
				m_db.close();
			};
			//console.log( "DB Loaded", stashedRequests.length );
			for( let i = 0; i < m_stashedRequests.length; i++ ) {
				let req = m_stashedRequests[ i ];
				req.cmd( req.resolve, req.reject, req.params );
			}
		};
	}

	function setItem( resolve, reject, params ) {
		let key = params[ 0 ];
		let value = params[ 1 ];
		if( typeof key !== "string" ) {
			return reject( "Invalid type for key." );
		}
		let transaction = m_db.transaction( m_objectStore, "readwrite" );
		let items = transaction.objectStore( m_objectStore );
		let item = {
			"key": key,
			"value": value
		};
		let request = items.put( item );
		request.onsuccess = function() {
			return resolve( true );
		};
		request.onerror = function() {
			return reject( request.error );
		};
	}

	function getItem( resolve, reject, params ) {
		let key = params[ 0 ];
		if( typeof key !== "string" ) {
			return reject( "Invalid type for key." );
		}
		let transaction = m_db.transaction( m_objectStore, "readonly");
		let items = transaction.objectStore( m_objectStore );
		let request = items.get( key );
		request.onsuccess = function ( event ) {
			if( event.target.result ) {
				return resolve( event.target.result.value );	
			} else {
				return resolve( null );
			}
		};
		request.onerror = function() {
			return reject( request.error );
		};
	}
	
	function getAll( resolve, reject, params ) {
		let transaction = m_db.transaction( m_objectStore, "readonly");
		let items = transaction.objectStore( m_objectStore );
		let request = items.getAll();
		request.onsuccess = function ( event ) {
			if( event.target.result ) {
				return resolve( event.target.result );	
			} else {
				return resolve( null );
			}
		};
		request.onerror = function() {
			return reject( request.error );
		};
	}
	
	function removeItem( resolve, reject, params ) {
		let key = params[ 0 ];
		if( typeof key !== "string" ) {
			return reject( "Invalid type for key." );
		}
		let transaction = m_db.transaction( m_objectStore, "readwrite");
		let items = transaction.objectStore( m_objectStore );
		let request = items.delete( key );
		request.onsuccess = function ( event ) {
			return resolve( true );
		};
		request.onerror = function() {
			return reject( request.error );
		};
	}
	
	function clear( resolve, reject, params ) {
		let transaction = m_db.transaction( m_objectStore, "readwrite");
		let items = transaction.objectStore( m_objectStore );
		let request = items.clear();
		request.onsuccess = function ( event ) {
			return resolve( true );
		};
		request.onerror = function() {
			return reject( request.error );
		};
	}

	function runRequest( cmd, params ) {
		return new Promise( function ( resolve, reject ) {
			if( m_db === null ) {
				m_stashedRequests.push( {
					"cmd": cmd,
					"params": params,
					"resolve": resolve,
					"reject": reject
				} );
			} else {
				cmd( resolve, reject, params );
			}
		} );
	}

	return {
		"init": init,
		"setItem": function ( key, value ) {
			return runRequest( setItem, [ key, value ] );
		},
		"getItem": function ( key ) {
			return runRequest( getItem, [ key ] );
		},
		"getAll": function () {
			return runRequest( getAll, [] );
		},
		"removeItem": function ( key ) {
			return runRequest( removeItem, [ key ] );
		},
		"clear": function () {
			return runRequest( clear, [] );
		}
	};
} )();
