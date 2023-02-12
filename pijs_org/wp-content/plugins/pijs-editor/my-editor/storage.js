let storage = ( function ( $ ) {
	"use strict";

	let m_totalCapacity = null;
	let m_readyCommands = [];

	return {
		"calculateLocalStorageCapacity": calculateLocalStorageCapacity,
		"getTotalCapacity": function () { return m_totalCapacity; },
		"getStorageUsed": getStorageUsed,
		"getFreeSpace": getFreeSpace,
		"onReady": onReady
	};

	function calculateLocalStorageCapacity() {
		let delta = 4194304;
		let size = delta;
		let overMin = 16777216;
		let underMax = 0;
		runCapacityChecks();
			
		function runCapacityChecks() {
			let quickCheck = false;
			if( size >= overMin ) {
				quickCheck = true;
			}
			if( size < overMin && checkCapacity( size ) ) {
				size += delta;
				setTimeout( runCapacityChecks, 0 );
			} else {
				if( overMin - underMax <= 1 || delta === 1 ) {
					reportSize();
					return;
				}
				size = underMax;
				delta /= 2;
				while( size + delta >= overMin ) {
					delta /= 2;
				}
				if( delta < 1 ) {
					reportSize();
					return;
				}
				size += delta;
				if( quickCheck ) {
					runCapacityChecks();
				} else {
					setTimeout( runCapacityChecks, 0 );
				}
			}
		}
		
		function checkCapacity( size ) {
			try {
				let test = localStorage.getItem( "test" );
				if( ! test ) {
					test = "";
				}
				let newTest = test + ( new Array( size - test.length + 1 ).join( "a" ) );
				localStorage.setItem( "test", newTest );	
			} catch {
				if( overMin === -1 || overMin > size ) {
					overMin = size;
				}
				return false;
			}
			if( size > underMax ) {
				underMax = size;
			}
			return true;
		}
		
		function reportSize() {
			m_totalCapacity = new Blob( Object.values( localStorage ) ).size;
			localStorage.removeItem( "test" );
			for( let i = 0; i < m_readyCommands.length; i++ ) {
				m_readyCommands[ i ]();
			}
		}
	}

	function getStorageUsed() {
		return new Blob( Object.values( localStorage ) ).size;
	}

	function getFreeSpace() {
		if( m_totalCapacity ) {
			return m_totalCapacity - getStorageUsed();
		}
		return null;
	}

	function onReady( cmd ) {
		if( m_totalCapacity === null ) {
			m_readyCommands.push( cmd );
		} else {
			cmd();
		}
	}

} )( jQuery );

