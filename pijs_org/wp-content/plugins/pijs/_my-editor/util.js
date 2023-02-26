"use strict";
let g_util = ( function () {
	const MB_SIZE = 1048576;
	const KB_SIZE = 1024;

	return {
		"getClickableTarget": getClickableTarget,
		"selectItem": selectItem,
		"formatAMPM": formatAMPM,
		"getMbKb": getMbKb,
		"getByteSize": getByteSize
	};

	// Make sure we are clicking on a file or folder
	function getClickableTarget( target, container ) {
		while( target && target !== container && ! target.dataset.clickable ) {
			target = target.parentElement;
		}
		if( target === container ) {
			return null;
		}
		return target;
	}

	function selectItem( element, className ) {
		document.querySelectorAll( "." + className ).forEach(
			( el ) => el.classList.remove( className )
		);

		element.classList.add( className );
	}

	function formatAMPM(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var seconds = ( "" + date.getSeconds() ).padStart( 2, "0" );
		var ampm = hours >= 12 ? 'pm' : 'am';
		hours = hours % 12;
		hours = hours ? hours : 12; // the hour '0' should be '12'
		minutes = minutes < 10 ? '0' + minutes : minutes;
		var strTime = hours + ':' + minutes + ":" + seconds + ' ' + ampm;
		return strTime;
	}

	function getMbKb( size ) {
		if( size < KB_SIZE * 100 ) {
			return ( size / KB_SIZE ).toFixed( 2 ) + " KB";
		} else {
			return ( size / MB_SIZE ).toFixed( 2 ) + " MB";
		}
	}

	function getByteSize( str ) {
		return new Blob( [ str ] ).size;
	}

} )();