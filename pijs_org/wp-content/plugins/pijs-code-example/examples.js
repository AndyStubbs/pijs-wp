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

function closeExample() {
	$.removeAllScreens();
	$.clearKeys();
	document.getElementById( "exampleBox" ).style.display = "none";
	onExampleClose();
	document.body.style.overflow = "";
}
