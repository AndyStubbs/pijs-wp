var onExampleClose = function () {};

function runExample( index ) {
	document.body.style.overflow = "hidden";
	document.getElementById( "exampleBox" ).style.display = "block";
	document.getElementById( "clearFocus" ).focus();
	examples[ index ]();
}

function copyExample( index ) {
	navigator.clipboard.writeText( document.getElementById( "example-code-" + index ).innerText.trim() );
}

function gotoPlayground( index ) {
	let code = document.getElementById( "example-code-" + index ).innerText.trim();
	let data = btoa( code );
	const form = document.createElement( "form" );
	form.method = "POST";
	form.action = g_playgroundLink;
	const input = document.createElement( "input" );
	input.type = "hidden";
	input.name = "code";
	input.value = data;
	form.appendChild( input );
	document.body.appendChild( form );
	form.submit();
}

function closeExample() {
	$.removeAllScreens();
	$.clearKeys();
	document.getElementById( "exampleBox" ).style.display = "none";
	onExampleClose();
	document.body.style.overflow = "";
}
