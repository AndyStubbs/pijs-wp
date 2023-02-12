<div class="main-menu">
	<button id="btn-run">Run &#9658;</button>
	<button id="btn-help" class="menu-closed">Show Help</button>
	<button id="btn-options">Options</button>
</div>
<div class="help-menu" style="display: none">Help is on it's way.</div>
<div class="vertical-resize-bar" style="display: none;">
	<div>&nbsp;</div>
</div>
<div class="main-editor-body"></div>
<!-- The Modal -->
<div id="myModal" class="modal">
	<!-- Modal content -->
	<div class="modal-content">
		<span class="close">&times;</span>
		<div class="modal-title">Options</div>
		<form>
			<label for="widthInput">Width:</label>
			<input type="text" id="widthInput" name="width">
			<br><br>
			<label for="heightInput">Height:</label>
			<input type="text" id="heightInput" name="height">
			<br><br>
			<input type="checkbox" id="fullScreen" name="fullScreen">
			<label for="fullScreen">Full Screen</label>
			<br><br>
			<input type="button" value="OK">
			<input type="button" value="Cancel">
		</form>
	</div>
</div>
