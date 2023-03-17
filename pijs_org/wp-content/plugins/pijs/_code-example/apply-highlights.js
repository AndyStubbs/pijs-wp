document.querySelectorAll( "pre code" ).forEach( ( block ) => {
	if( block.classList.contains("language-html") ) {
		return;
	}
	let parts = block.innerText.split( "\n" );
	let msg = "";
	for( let i = 0; i < parts.length; i++ ) {
		if( i > 0 && parts[ i ].trim().startsWith( "//" ) ) {
			msg += "\n"
		}
		msg += parts[ i ];
		if( i !== parts.length -1 ) {
			msg += "\n";
		}
	}
	block.innerHTML = msg;
} );
setTimeout( function () {
	document.querySelectorAll( "pre code" ).forEach( ( block ) => {
		hljs.highlightBlock( block );
	} );
});

