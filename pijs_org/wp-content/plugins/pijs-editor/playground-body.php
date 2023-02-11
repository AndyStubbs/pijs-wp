<style>
	.main-menu {
		height: 55px;
	}
	.main-menu button {
		width: 150px;
		cursor: pointer;
		margin: 5px;
		border: none;
		padding: 10px 0px;
		vertical-align: text-top;
	}
	.main-menu button:hover {
		background-color: #888;
	}
	.main-menu button.menu-closed::after {
		content: "\f107";
		font-family: Fontello;
		margin-left: 5px;
	}
	.main-menu button.menu-opened::after {
		content: "\f106";
		font-family: Fontello;
		margin-left: 5px;
	}
	.help-menu {
		height: 150px;
		background-color: black;
		border-top: 1px solid #888;
		color: #FFF;
	}
	body .main-editor-body {
		height: calc(100% - 60px);
	}
	body .vertical-resize-bar {
		background-color: black;
		height: 10px;
		cursor: n-resize;
		display: flex;
		align-content: center;
	}
	body .vertical-resize-bar div {
		background-color: #888;
		height: 2px;
		margin: auto;
		width: 100%;
	}

</style>
<div class="main-menu">
	<button id="btn-run">Run &#9658;</button>
	<button id="btn-help" class="menu-closed">Show Help</button>
</div>
<div class="help-menu" style="display: none">Help is on it's way.</div>
<div class="vertical-resize-bar" style="display: none;">
	<div>&nbsp;</div>
</div>
<div class="main-editor-body"></div>
<div id="exampleBox" style="display: none;">
	<div id="canvasContainer"></div>
	<input type="button" class="btn-retro btn-red btn-8-14 btn-large" id="closeExample" value="Close" onclick="closeExample()">
	<input type="button" class="btn-retro btn-red btn-8-14 btn-large" id="clearFocus" value="">
</div>