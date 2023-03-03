<?php
/*
Template Name: Pixel Editor
*/

	wp_dequeue_style( 'analog-fontello' );
	wp_dequeue_style( 'analog-style' );
	wp_dequeue_style( 'analog-device' );
	wp_dequeue_style( 'analog-ibm-plex-mono-css' );

?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">
	
	<?php wp_head(); ?>
	<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri( 'pixel/index.css' ); ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri( 'pixel/light-mode.css' ); ?>">
	<link rel="stylesheet" type="text/css" href="<?php echo get_theme_file_uri( 'pixel/dark-mode.css' ); ?>">
	<script>
		var g_themeUrl = "<?php echo get_theme_file_uri(); ?>";
	</script>
	<script src="<?php echo pijs_get_latest_version_url( 'pi-', '.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/db.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/pixel.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/controls.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/tools.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/colors.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/layers.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/picture.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/undo.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/penTool.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/eraserTool.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/shapeTool.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/paintTool.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/dropperTool.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/selectorTool.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/zoomTool.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/optionsTool.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/shift.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/animator.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/effects.js' ); ?>"></script>
	<script src="<?php echo get_theme_file_uri( 'pixel/src/help.js' ); ?>"></script>
</head>
<body class="noselect light-mode">
	<div id="leftContainer">
		<div id="colorbar" class="noselect">
			<div id="alpha-slider">
				<span class="slider-span">100%</span>
				<input class="slider" type="range" min="0" max="255" value="255" step="1" />
			</div>
		</div>
		<div class="controlButtons" style="height: 30px;">
			<input type="button" id="resetColorsButton" value="Reset Colors" class="button button-long" />
			<input type="button" id="animatorButton" value="Animator" class="button button-long" />
			<input type="button" id="helpButton" value="Help" class="button button-long" />
		</div>
		<div id="toolbar">
			<div id="tools"></div>
			<div id="optionsbar" style="margin-top: 5px;"></div>
		</div>
	</div>
	<div id="screenContainer" class="noselect">
		<div id="screen">
			<canvas id="grid"></canvas>
		</div>
		<div id="layersContainer">
			<div id="layersMenu" style="text-align: center;">
				<input id="newLayer" type="button" class="button" value="+" />
				<input id="deleteLayer" type="button" class="button" value="&nbsp;" />
				<input id="mergeLayer" type="button" class="button" value="&nbsp;" />
				<input id="copyLayer" type="button" class="button" value="&nbsp;" />
				<input id="moveLayerUp" type="button" class="button" value="&nbsp;" />
				<input id="moveLayerDown" type="button" class="button" value="&nbsp;" />
			</div>
			<div id="layers"></div>
		</div>
	</div>
	<div id="rightContainer">
		<div class="controls">
			<input id="newImageButton" type="button" class="button" value="New">
			<input id="loadImageButton" type="button" class="button" value="Load">
			<input id="copyImageButton" type="button" class="button" value="Copy" />
			<input id="saveImageButton" type="button" class="button" value="Save">
			<input id="deleteImageButton" type="button" class="button" value="Delete" />
		</div>
		<div id="preview"></div>
	</div>
	<div id="statusbar">
		<div id="statusColor1" class="status-color back-light"><div>&nbsp;</div></div>
		<div id="statusColor2" class="status-color back-light"><div>&nbsp;</div></div>
		<div id="statusMsg"></div>
	</div>
	<div id="selectorNW" class="selectorDot" data-lockx=""  data-locky="">&nbsp;</div>
	<div id="selectorN" class="selectorDot"  data-lockx="1" data-locky="">&nbsp;</div>
	<div id="selectorNE" class="selectorDot" data-lockx=""  data-locky="">&nbsp;</div>
	<div id="selectorE" class="selectorDot"  data-lockx=""  data-locky="1">&nbsp;</div>
	<div id="selectorSE" class="selectorDot" data-lockx=""  data-locky="">&nbsp;</div>
	<div id="selectorS" class="selectorDot"  data-lockx="1" data-locky="">&nbsp;</div>
	<div id="selectorSW" class="selectorDot" data-lockx=""  data-locky="">&nbsp;</div>
	<div id="selectorW" class="selectorDot"  data-lockx=""  data-locky="1">&nbsp;</div>
	<div id="selectorMove" data-lockX="" data-lockY="" data-index="-1">&nbsp;</div>
	<div id="selectorAngle" data-lockX="" data-lockY="" data-index="-1">0&deg;</div>
	<div id="cp1" class="selectorDot controlPoint">1</div>
	<div id="cp2" class="selectorDot controlPoint">2</div>
	<div id="cp3" class="selectorDot controlPoint">3</div>
	<div id="cp4" class="selectorDot controlPoint">4</div>
	<div id="colorPickerView" class="colorPicker back-light"><div>&nbsp;</div></div>
	<div id="loadingDiv">
		<div>
			<h1>Pi.js Pixel Editor</h1>
			<h1>By</h1>
			<h1>Andy Stubbs</h1>
		</div>
	</div>
	<div id="modalPopup">
		<div id="newImagePopup" class="imagePopup">
			<h3>New Image</h3>
			<label>
				<input id="newImageWorkspace" type="checkbox" />
				<span>Clear Workspace</span>
			</label>
			<div class="newImageItem" style="margin-top:10px">
				<label>
					<span>Image Width:</span> <input id="newImageWidth" type="number" value="100" min="1" step="1"/> pixels
				</label>
			</div>
			<div class="newImageItem">
				<label>
					<span>Image Height:</span> <input id="newImageHeight" type="number" value="100" min="1" step="1"/> pixels
				</label>
			</div>
			<div class="newImageItem">
				<label>
					<span>Image Count:</span> <input id="newImageCount" type="number" value="1" min="1" step="1"/> images
				</label>
			</div>
			<div class="newImageControls">
				<input id="newImageOk" type="button" class="button button-long" value="Ok" />
				<input id="newImageCancel" type="button" class="button button-long" value="Cancel" />
			</div>
		</div>
		<div id="saveImagePopup" class="imagePopup">
			<h3> Save Image</h3>
			<div class="newImageItem">
				<label>
					<span>Save Type:</span>
					<select id="saveImageType" style="width: 220px">
						<option value="workspace">Workspace (.pixel)</option>
						<option value="spritesheet">Workspace as Spritesheet (.png)</option>
						<option value="layers">Image with Layers (.pixel)</option>
						<option value="image">Image Export (.png)</option>
					</select>
				</label>
			</div>
			<div class="newImageItem">
				<label>
					<span>Filename:</span>
					<input id="saveFilename" type="text" style="width: 212px;" value="Untitled" />
				</label>
			</div>
			<div class="newImageItem" style="display: none;">
				<label>
					<span>Margin X:</span> <input id="saveSpriteMarginX" type="number" value="1" min="0" step="1"/> pixels
				</label>
			</div>
			<div class="newImageItem" style="display: none;">
				<label>
					<span>Margin Y:</span> <input id="saveSpriteMarginY" type="number" value="1" min="0" step="1"/> pixels
				</label>
			</div>
			<div class="newImageItem" style="display: none;">
				<label>
					<span>Add Images:</span> <input id="addFlipX" type="checkbox" style="width: auto;" /> Flip X
				</label>
			</div>
			<div class="newImageItem" style="display: none;">
				<label>
					<span>Add Images:</span> <input id="addFlipY" type="checkbox" style="width: auto;" /> Flip Y
				</label>
			</div>
			<div class="newImageControls" style="left: 83px">
				<input id="saveImageOk" type="button" class="button button-long" value="Ok" />
				<input id="saveImageCancel" type="button" class="button button-long" value="Cancel" />
			</div>
		</div>
		<div id="loadImagePopup" class="imagePopup">
			<h3>Load Image</h3>
			<input type="file" id="loadImageFile" class="input-file" name="image" accept="image/*,.pixel" />
			<div id="loadImageStats" style="width: 225px; display: none;">
				<div class="newImageItem">
					<label>
						<span style="font-weight: bold;">Type:</span><span id="loadImageType"></span>
					</label>
				</div>
				<div class="newImageItem">
					<label>
						<span style="font-weight: bold;" id="loadImagePicturesTitle">Pictures:</span><span id="loadImagePictures"></span>
					</label>
				</div>
			</div>
			<div id="loadImageSpriteForm" style="width: 225px;display: inline-block;">
				<label style="display: none;">
					<input id="loadImageSpritesheet" type="checkbox" />
					<span>Spritesheet</span>
				</label>
			</div>
			<div class="loadImageMidSection" style="display: none;">
				<div id="loadImageViewer" class="back-light"></div>
				<div class="editSpritesheetFrames" style="opacity: 0.5;">
					<div class="newImageSpritesheetSection">
						<div class="newImageItem" style="margin-top: 10px;">
							<label>
								<input id="chkAutoDetect" type="checkbox" checked disabled/>
								<span>Auto Detect</span>
							</label>
						</div>
					</div>
					<div class="newImageSpritesheetSection">
						<div class="newImageItem" style="margin-top: 10px;">
							<label>
								<span>Width:</span>
								<input id="loadImageWidth" type="number" value="32" min="4" step="1" disabled /> pixels
							</label>
						</div>
						<div class="newImageItem" >
							<label>
								<span>Height:</span>
								<input id="loadImageHeight" type="number" value="32" min="4" step="1" disabled/> pixels
							</label>
						</div>
						<div class="newImageItem">
							<label>
								<span>Margin X:</span>
								<input id="loadImageMarginX" type="number" value="0" min="0" step="1" disabled/> pixels
							</label>
						</div>
						<div class="newImageItem">
							<label>
								<span>Margin Y:</span>
								<input id="loadImageMarginY" type="number" value="0" min="0" step="1" disabled/> pixels
							</label>
						</div>
						<input id="btnGenerateFrames" class="half" type="button" value="Generate" />
						<input id="btnResetFrames" class="half" type="button" value="Reset" />
					</div>
					<div class="newImageSpritesheetSection" style="height: calc(100% - 210px);">
						<h3 style="margin-bottom: 5px;">Frames</h3>
						<select id="selAllFrames" multiple disabled></select>
						<input id="btnMoveFrameUp" class="moveFrameButton" type="button" value="&nbsp;" />
						<input id="btnMoveFrameDown" class="moveFrameButton" type="button" value="&nbsp;" />
						<input id="btnUnselect" class="half" type="button" value="Unselect" />
						<div>
							<span id="newImageItemMessage">&nbsp;</span>
						</div>
						<div class="newImageItem">
							<label>
								<span>Frame X:</span>
								<input id="loadImageFrameX" type="number" value="0" min="0" step="1" disabled/> pixels
							</label>
						</div>
						<div class="newImageItem">
							<label>
								<span>Frame Y:</span>
								<input id="loadImageFrameY" type="number" value="0" min="0" step="1" disabled/> pixels
							</label>
						</div>
						<div class="newImageItem">
							<label>
								<span>Frame Width:</span>
								<input id="loadImageFrameWidth" type="number" value="32" min="4" step="1" disabled/> pixels
							</label>
						</div>
						<div class="newImageItem">
							<label>
								<span>Frame Height:</span>
								<input id="loadImageFrameHeight" type="number" value="32" min="4" step="1" disabled/> pixels
							</label>
						</div>
						<input id="btnUpdateFrame" class="half" type="button" value="Update" />
						<input id="btnCreateFrame" class="half" type="button" value="Create" />
						<input id="btnRemoveFrame" class="half" type="button" value="Remove" />
						<input id="btnUndoFrames" class="half" type="button" value="Undo" disabled/>
					</div>
				</div>
			</div>
			<div id="workspacePreview" class="back-light" style="display: none;">
			</div>
			<div class="newImageControls" style="left: 32px; bottom: 20px;">
				<input id="loadImageOk" type="button" class="button button-long" value="Ok" disabled="disabled" />
				<input id="loadImageCancel" type="button" class="button button-long" value="Cancel" />
			</div>
		</div>
		<div id="animatorPopup" class="animatorPopup">
			<div id="animatorWindow">
				<canvas id="animatorCanvas" class="back-light"></canvas>
			</div>
			<div id="animatorControls">
				<input type="button" value="Play" id="animatorPlay" class="button button-long" />
				Delay:
				<input type="number" value="15" id="animatorDelay" style="width:35px;" min="1" />
				<label>Bounce: <input type="checkbox" id="animatorBounce" /></label>
				<input type="button" value="Insert Frame" id="animatorInsertFrame" class="button button-long" />
				<input type="button" value="Delete Frame" id="animatorDeleteFrame" class="button button-long" />
				<input type="button" value="Reset Frames" id="animatorResetFrames" class="button button-long" />
				<input type="button" value="&lt;&lt;" id="animatorMoveFrameLeft" class="button button-long" />
				<input type="button" value="&gt;&gt;" id="animatorMoveFrameRight" class="button button-long" />
				<input type="button" value="Close" id="animatorClose" class="button button-long" />
			</div>
			<div id="animatorFramesContainer">
				<div id="animatorFrames"></div>
			</div>
			<div id="animatorSize">
				<strong>Size: </strong>
				<select id="animatorSizeSelect">
					<option selected="selected" value="100">100%</option>
					<option value="75">75%</option>
					<option value="50">50%</option>
					<option value="25">25%</option>
					<option value="15">15%</option>
					<option value="10">10%</option>
					<option value="5">5%</option>
					<option value="0">Actual Size</option>
				</select>
			</div>
			<div id="animatorPickFrame">
				<div id="animatorSelectFrame"></div>
				<input type="button" value="Cancel" id="animatorPickFrameCancel" class="button button-long" style="position: absolute; bottom:5px;" />
			</div>
		</div>
		<div id="helpPopup" class="helpPopup">
			<h2>Pi.js Pixel Editor - Help</h2>
			<div class="helpNavigation">
				<input id="helpLeft" class="helpNavButton" type="button" disabled value="" />
				<div id="helpTitle">Colorbar</div>
				<input id="helpRight" class="helpNavButton" type="button" value="" />
			</div>
			<div style="height: calc(100% - 135px);">
				<div id="helpMessage">
					<div id="help-commands" class="activeHelpMessage">
						<h3>Screen Commands</h3>
						<ul>
							<li>Control + Left Click Screen - Zoom in</li>
							<li>Control + Right Click Screen - Zoom out</li>
						</ul>
						<h3>Keyboard Shortcuts</h3>
						<ul>
							<li>Control + A - Select entire screen</li>
							<li>Control + C - Copy image from active layer</li>
							<li>Control + X - Cut image from active layer</li>
							<li>Control + L - Copy image from all layers</li>
							<li>Control + K - Cut image from all layers</li>
							<li>Control + V - Paste image onto layer</li>
							<li>Delete - Delete selection from active layer</li>
							<li>Control + Delete - Delete selection from all layers</li>
						</ul>
						<h3>Rotate Command</h3>
						<ul>
							<li>Hold Control while rotating image to snap rotation to 15&deg; increments</li>
						</ul>
						<h3>Image Command</h3>
						<ul>
							<li>Control + Left Click Image - Toggle overlay image</li>
						</ul>
					</div>
					<div id="help-color">
						This is the color bar section. From here you can set the colors for left and right click.
						<ul>
							<li>Left click color to set <strong>1</strong></li>
							<li>Right click color to set <strong>2</strong></li>
							<li>Double click a color to change the color</li>
							<li>Use the slider to set the color alpha</li>
						</ul>
					</div>
					<div id="help-color-buttons">
						This is the control buttons section.
						<ul>
							<li>Reset Colors - Resets the color bar to default palette</li>
							<li>Animator - Opens the animator window</li>
							<li>Help - Opens this help page</li>
						</ul>
					</div>
					<div id="help-toolbar">
						This is the toolbar section.
						<ul>
							<li>Pencil - Used for drawing freestyle</li>
							<li>Eraser - Used for erasing freestyle</li>
							<li>Shapes - Used for drawing different shapes</li>
							<li>Paint bucket - Used for filling in colors</li>
							<li>Color Selector - Used for getting a color from an image</li>
							<li>Selection - Used for selecting an area of the tool</li>
							<li>Zoom - Used for zooming in and zooming out</li>
							<li>Options - Used for editor/image options</li>
						</ul>
					</div>
					<div id="help-tool-options">
						This is the options section. This is used to set the various options used by each tool.
					</div>
					<div id="help-screen">
						This is the main screen viewer. This is where you draw on your image.
					</div>
					<div id="help-layer-buttons">
						This is the layer buttons section.
						<ul>
							<li>Add - Adds a new layer</li>
							<li>Trash - Deletes the active layer</li>
							<li>Merge - Merges the active layer with the layer above</li>
							<li>Copy - Copies the active layer into a new layer</li>
							<li>Move Up - Moves the active layer up</li>
							<li>Move Down - Moves the active layer down</li>
						</ul>
					</div>
					<div id="help-layers">
						This is the layers section. From here you set each layer's transparency, hide the layer, or select the layer.
					</div>
					<div id="help-image-controls">
						This is the image buttons section.
						<ul>
							<li>New - Creates a new image</li>
							<li>Load - Imports an image into a new image</li>
							<li>Copy - Copies the active image into a new image</li>
							<li>Save - Saves the active image</li>
							<li>Delete - Deletes the active image</li>
						</ul>
					</div>
					<div id="help-images">
						<p>This is the images section. From here you can select the image. Control + Click to set an image as an overlay image.
						This is helpful when doing animations.</p>
						Control + Click again to unset the overlay.
					</div>
					<div id="help-status-bar">
						This is the status bar. There is useful information about the active operation such as x y coordinates of the cursor.
					</div>
				</div>
				<img id="helpImage" src="<?php echo get_theme_file_uri( 'pixel/help-color.png' ); ?>" />
			</div>
			<div>
				<input id="helpOk" type="button" value="Ok" class="button-long" />
			</div>
		</div>
	</div>
	<div id="dragOverPopup">
		<div>
			<h1>Import Image</h1>
		</div>
	</div>
	<div id="optionsTemplates">
		<div id="sizeOption" class="option">
			<label>
				<span>Size:</span>
				<input id="sizeInput" type="number" value="1" min="1" step="1" style="width: 35px" /> pixels
			</label>
		</div>
		<div id="shapeOption" class="option clickOptionContainer">
			<label>Shape:</label>
			<div class="shape selected-clickOption clickOption" id="shapeSquare">
				<div>&nbsp;</div>
			</div>
			<div class="shape clickOption" id="shapeCircle">&#8226;</div>
		</div>
		<div id="noiseOption" class="option">
			<label>
				<span>Noise:</span>
				<input id="noiseInput" type="number" value="0" min="0" max="100" step="1" style="width: 40px" />
			</label>
		</div>
		<div id="zoomLevel" class="option">
			<label>
				<span>Zoom Level:</span>
				<input id="zoom" type="number" value="1" min="1" step="1" style="width: 30px" />
			</label>
		</div>
		<div id="selectorAction" class="option clickOptionContainer">
			<div class="action selected-clickOption clickOption" id="actionSelect">Select</div>
			<div class="action clickOption" id="actionMove">Move</div>
		</div>
		<div id="selectorFinalize" class="option">
			<input class="buttonOption" type="button" value="Cancel" id="actionClearSelect" disabled="disabled" />
			<input class="buttonOption" type="button" value="Complete" id="actionFinalize" disabled="disabled" />
		</div>
		<div id="drawOption" class="option clickOptionContainer">
			<div class="draw selected-clickOption clickOption" id="drawPixel">Pixel</div>
			<div class="draw clickOption" id="drawAliased">Smooth</div>
		</div>
		<div id="snapToAngleOption" class="option">
			<label>
				<span>Snap Angle:</span>
				<input id="snapToAngle" type="number" value="1" min="1" max="99" step="1" style="width: 30px" />
			</label>
		</div>
		<div id="reflectOption" class="option clickOptionContainer">
			<label>Mirror:</label><br />
			<div class="reflect selected-clickOption clickOption" id="reflectN">No Flip</div>
			<div class="reflect clickOption" id="reflectX">Flip X</div>
			<div class="reflect clickOption" id="reflectY">Flip Y</div>
			<div class="reflect clickOption" id="reflectXY">Flip XY</div>
		</div>
		<div id="toleranceOption" class="option">
			<label>
				<span>Tolerance:</span>
				<input id="toleranceInput" type="number" value="0" min="0" max="100" step="1" style="width: 40px" />
			</label>
		</div>
		<div id="backgroundOption" class="option clickOptionContainer">
			<label>Background:</label><br />
			<div class="background selected-clickOption clickOption" id="backgroundLight"><div>&nbsp;</div></div>
			<div class="background clickOption" id="backgroundMed"><div>&nbsp;</div></div>
			<div class="background clickOption" id="backgroundDark"><div>&nbsp;</div></div>
			<div class="background clickOption" id="backgroundMix"><div>&nbsp;</div></div>
		</div>
		<div id="shapeToolOption" class="option clickOptionContainer">
			<div class="shapeTool selected-clickOption clickOption" id="shapeToolLine">&nbsp;</div>
			<div class="shapeTool clickOption" id="shapeToolCurve">&nbsp;</div>
			<div class="shapeTool clickOption" id="shapeToolRect">&nbsp;</div>
			<div class="shapeTool clickOption" id="shapeToolEllipse">&nbsp;</div>
			<div class="shapeTool clickOption" id="shapeToolCircle">&nbsp;</div>
			<div class="shapeTool clickOption" id="shapeToolStar">&nbsp;</div>
			<div class="shapeTool clickOption" id="shapeToolArrow">&nbsp;</div>
		</div>
		<div id="showGridOption" class="option clickOptionContainer">
			<label>Grid:</label><br />
			<div class="showGrid selected-clickOption clickOption" id="showGridShow">Show</div>
			<div class="showGrid clickOption" id="showGridHide">Hide</div>
		</div>
		<div id="gridSizeOption" class="option">
			<label>
				<span>Grid Size:</span>
				<input id="minGridSize" type="number" value="30" min="0" max="100" step="1" style="width: 40px" />
			</label>
		</div>
		<div id="overlayVisOption" class="option">
			<label>
				<span>Overlay Pct:</span>
				<input id="overlayVisPct" type="number" value="50" min="0" max="100" step="1" style="width: 40px" />
			</label>
		</div>
		<div id="effectsOption" class="option">
			<label>Image Effects:</label><br />
			<input class="buttonOption" type="button" value="Flip X" id="effectsFlipX" />
			<input class="buttonOption" type="button" value="Flip Y" id="effectsFlipY" />
			<input class="buttonOption" type="button" value="Grayscale" id="effectsGrayscale" />
			<input class="buttonOption" type="button" value="Desaturate" id="effectsDesaturate" />
			<input class="buttonOption" type="button" value="Bitmask" id="effectsBitMask" />
			<input class="buttonOption" type="button" value="Blur" id="effectsBlur" />
			<input class="buttonOption" type="button" value="8-Bit Colors" id="effects8Bit" />
			<input class="buttonOption" type="button" value="Dither" id="effectsDither" />
		</div>
	</div>
</body>
</html>