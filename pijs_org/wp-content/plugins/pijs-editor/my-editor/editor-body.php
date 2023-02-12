<div class="body">
	<div class="files disable-select" ondragstart="return false;">
		<div class="main-menu disable-select">
			<span class="file-size-remaining" title="Estimated amount of freespace available for current project."></span>
		</div>
		<div class="file-viewer"></div>
	</div>
	<div class="resize disable-select" ondragstart="return false;"><div></div></div>
	<div class="main-editor">
		<div class="main-editor-tabs"></div>
		<div class="main-editor-body"></div>
		<div class="main-image-viewer" style="display:none;"></div>
		<div class="main-audio-viewer" style="display:none;">
			<audio id="main-audio-player" controls></audio>
		</div>
	</div>
</div>
<div id="dragOverPopup">
	<div>
		<h1>Import Image</h1>
	</div>
</div>
<div id="contextMenu" style="display: none">
	<ul>
		<li><input type="button" id="contextMenuNewFile" value="New JS file" /></li>
		<li><input type="button" id="contextMenuNewFolder" value="New folder" /></li>
		<li><input type="button" id="contextMenuRenameFile" value="Rename file" /></li>
		<li><input type="button" id="contextMenuDeleteFile" value="Delete file(s)" /></li>
	</ul>
</div>