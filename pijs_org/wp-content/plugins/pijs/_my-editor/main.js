/* global g_layout */
/* global g_file */
/* global g_editor */
"use strict";
var g_main = ( function ( $ ) {
	const HTML_TEMPLATE = "" +
`
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>[TITLE]</title>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
		<style>
			body {
				background-color: black;
			}
		</style>
	</head>
	<body>
		[SCRIPTS]
	</body>
</html>
`;
	const UNALLOWED_FILE_CHARACTERS = /[^a-zA-Z0-9_ \-\.\!\$]/g;
	const MAX_NAME_LENGTH = 20;
	const MAX_FILE_STORAGE_SIZE = 5242880;
	//const MAX_FILE_STORAGE_SIZE = 242880;
	//const OPEN_FOLDER_ENTITY = "&darr;";
	//const CLOSED_FOLDER_ENTITY = "&rarr;";
	const FILE_TYPE_IMAGE = "image";
	const FILE_TYPE_AUDIO = "audio";
	const FILE_TYPES = [
		g_file.FILE_TYPE_SCRIPT, g_file.FILE_TYPE_FOLDER
	];
	const FILE_TYPE_EXTENSIONS = {
		"javascript": ".js",
		"folder": "",
		"html": ".html",
		"css": ".css"
	};
	const OPEN_FOLDER_ENTITY = "▼";
	const CLOSED_FOLDER_ENTITY = "▲";
	const CLASS_NAMES = {
		"FILES": "files",
		"FILE_VIEWER": "file-viewer",
		"MAIN_EDITOR": "main-editor",
		"MAIN_EDITOR_TABS": "main-editor-tabs",
		"SELECTED_FILE": "selected-file",
		"SELECTED_TAB": "selected-tab",
		"LAST_SELECTED_FILE": "last-selected-file"
	};

	let m_lastFileClicked;
	let m_menuItems = {
		"File": []
	};
	let m_tabsElement = null;
	let m_zipFileUploads = null;
	let m_fileUploads = null;
	let m_models = {};
	let m_clickedOnRootFolder = null;
	let m_reRuns = 0;

	return {
		"init": init,
		"closeEditorModel": closeEditorModel,
		"createUploadDialog": createUploadDialog,
		"getSelectedFiles": getSelectedFiles,
		"getShortName": getShortName
	};

	function init() {
		function addMenuItem( menuName, name, title, shortcutName, keybindingsLocal, keybindingsMonaco, command ) {
			let menuItem = {
				"name": name,
				"command": command,
				"title": title,
				"shortcutName": shortcutName,
				"keybindingsLocal": keybindingsLocal,
				"keybindingsMonaco": keybindingsMonaco
			};
			m_menuItems[ menuName ].push( menuItem );
		}

		g_myIndexDB.init( "PI-JS Editor", "Items" );

		// Load the file system
		g_file.init( function () {
			let filesElement = document.querySelector( "." + CLASS_NAMES.FILE_VIEWER );
			filesElement.addEventListener( "mousedown", mouseDown );
			filesElement.addEventListener( "mouseup", mouseUp );
			createFileView( filesElement, g_file.getFilesFromFolder( "0" ), true, false, 0 );
			let tabs = g_file.getProjectSettings().tabs;
			let selectedTab = null;
			for( let i = 0; i < tabs.length; i++ ) {
				openFile( g_file.getFileById( tabs[ i ].fileId ) );
				if( tabs[ i ].isSelected ) {
					selectedTab = tabs[ i ];
				}
			}
			if( selectedTab ) {
				let file = g_file.getFileById( selectedTab.fileId );
				openFile( file );
				highlightSelectedFile( file );
			}
			updateFreespace();
		} );
		g_layout.createHorizontalResize(
			document.querySelector( "." + CLASS_NAMES.FILES ),
			document.querySelector( ".resize" ),
			document.querySelector( ".main-editor" )
		);

		//////////////////////////////////
		// Init Tabs
		//////////////////////////////////
		m_tabsElement = g_layout.createTabsElement(
			document.querySelector( "." + CLASS_NAMES.MAIN_EDITOR_TABS ),
			function ( tab ) {
				let file = g_file.getFileById( tab.dataset.fileId );
				g_util.selectItem( tab, CLASS_NAMES.SELECTED_TAB );
				openFileContents( file );
				highlightSelectedFile( file );
				g_editor.resize();
			}
		);

		//////////////////////////////////
		// Init File Move Drag and Drop
		//////////////////////////////////
		g_layout.initItemDrop( function( files, $dest ) {
			let fileId = $dest.get( 0 ).dataset.fileId;
			let dest = null;
			if( fileId != null ) {
				dest = g_file.getFileById( fileId ).fullpath;
			} else {
				dest = g_file.ROOT_NAME;
			}
			for( let i = 0; i < files.length; i++ ) {
				if( g_file.moveFile( files[ i ].fullpath, dest ) === true ) {
					refreshFileView();
				}
			}
		} );

		//////////////////////////////////
		// Init Menu
		//////////////////////////////////

		addMenuItem(
			"File", "Project Settings", "Manage project settings.", "Ctrl+P", { "key": "P", "ctrlKey": true },
			[ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP ], createProjectSettingsDialog
		);
		addMenuItem(
			"File", "Run", "Uploads your files and runs in a seperate window.", "Ctrl+R", { "key": "R", "ctrlKey": true },
			[ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR ], function () { runProgram( false, true ); }
		);
		addMenuItem(
			"File", "Update Program", "Uploads your files but doesn't open a new window.", "Ctrl+U", { "key": "U", "ctrlKey": true },
			[ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyU ], updateProgram
		);
		addMenuItem(
			"File", "Create new file", "New file dialog.", "Ctrl+G", { "key": "G", "ctrlKey": true },
			[ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG ], function() { createFileDialog( "create" );
		} );
		addMenuItem(
			"File", "Move/Rename file", "Move or rename file dialog.", "Ctrl+M", { "key": "M", "ctrlKey": true },
			[ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM ], function () { createFileDialog( "edit" ); }
		);
		addMenuItem(
			"File", "Upload file", "Upload a file to your project.", "Ctrl+L", { "key": "L", "ctrlKey": true },
			[ monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL ], createUploadDialog
		);	
		addMenuItem(
			"File", "Delete file", "Delete a file from your project.", "DEL", { "key": "DELETE", "ctrlKey": false },
			null, deleteSelectedFiles
		);
		let menuArray = [];
		for( let name in m_menuItems ) {
			let menuItem = {
				"name": name,
				"subItems": []
			};
			for( let i = 0; i < m_menuItems[ name ].length; i++ ) {
				menuItem.subItems.push( m_menuItems[ name ][ i ] );
			}
			menuArray.push( menuItem );
		}

		g_layout.createMenu( menuArray, document.querySelector( ".main-menu" ) );

		//////////////////////////////////
		// Init Events
		//////////////////////////////////
		$( document ).on( "mousedown", function ( e ) {
			if( $( document.elementFromPoint( e.pageX, e.pageY ) ).closest( "#contextMenu" ).length > 0 ) {
				return;
			}
			document.getElementById( "contextMenu" ).style.display = "none";
		} );
		$( "." + CLASS_NAMES.FILES ).on( "contextmenu", function ( e ) {
			e.preventDefault();

			let $contextMenu = $( "#contextMenu" );
			$contextMenu.css( "display", "" );
			$contextMenu.css( "left", e.pageX + "px" );
			$contextMenu.css( "top", e.pageY + "px" );

			if( m_clickedOnRootFolder ) {
				$contextMenu.find( "#contextMenuRenameFile" ).prop( "disabled", true );
				$contextMenu.find( "#contextMenuDeleteFile" ).prop( "disabled", true );
			} else {
				$contextMenu.find( "#contextMenuRenameFile" ).prop( "disabled", false );
				$contextMenu.find( "#contextMenuDeleteFile" ).prop( "disabled", false );
			}
		} );
		$( "#contextMenuNewFile" ).on( "click", function() {
			createFileDialog( "create", g_file.FILE_TYPE_SCRIPT );
			document.getElementById( "contextMenu" ).style.display = "none";
		} );
		$( "#contextMenuNewFolder" ).on( "click", function() {
			createFileDialog( "create", g_file.FILE_TYPE_FOLDER );
			document.getElementById( "contextMenu" ).style.display = "none";
		} );
		$( "#contextMenuRenameFile" ).on( "click", function() {
			createFileDialog( "edit" );
			document.getElementById( "contextMenu" ).style.display = "none";
		} );
		$( "#contextMenuDeleteFile" ).on( "click", function () {
			deleteSelectedFiles();
			document.getElementById( "contextMenu" ).style.display = "none";
		} );
		$( document.body ).on( "keydown", function ( e ) {
			if( ! $( "." + CLASS_NAMES.FILE_VIEWER ).hasClass( "viewer-focused" ) ) {
				return;
			}
			let keyDirection = 0;
			if( e.key === "ArrowUp" ) {
				keyDirection = -1;
			} else if( e.key === "ArrowDown" ) {
				keyDirection = 1;
			}
			if( keyDirection === 0 ) {
				return;
			}
			let $selectedFile = $( "." + CLASS_NAMES.LAST_SELECTED_FILE );
			if( $selectedFile.length === 0 ) {
				return;
			}
			let next = -1;
			let current = -1;
			let $allFiles = $( "." + CLASS_NAMES.FILE_VIEWER + " li" );
			$allFiles.each( function ( index ) {
				if( this === $selectedFile.get( 0 ) ) {
					next = index + keyDirection;
					current = index;
				}
			} );
			if( next === -1 ) {
				return;
			}
			if( e.shiftKey && current !== -1 ) {
				selectMultipleFiles( $allFiles.get( current ), $allFiles.get( next ) );
				addFileToSelectedFiles( $allFiles.get( next ), false );
			} else {
				addFileToSelectedFiles( $allFiles.get( next ), true );
			}
			let file = g_file.getFileById( $allFiles.get( next ).dataset.fileId );
			if( file.type !== g_file.FILE_TYPE_FOLDER ) {
				openFile( file, e.shiftKey );
			}
		} );
		$( "." + CLASS_NAMES.FILE_VIEWER ).on( "mousedown", function () {
			$( "." + CLASS_NAMES.FILE_VIEWER ).addClass( "viewer-focused" );
		} );
		$( "." + CLASS_NAMES.MAIN_EDITOR ).on( "mousedown", function () {
			$( "." + CLASS_NAMES.FILE_VIEWER ).removeClass( "viewer-focused" );
		} );
	}

	function runProgram( noRun, getOnlyRecentChanges ) {
		if( g_file.getFileStorageSize() > MAX_FILE_STORAGE_SIZE ) {
			g_layout.createPopup( "Error", "<p class='msg-error'>" +
				"You are over the max storage capacity. " +
				"You cannot run or update your program until you free up some file space.</p>" );
			return;
		}
		if( getOnlyRecentChanges === undefined ) {
			getOnlyRecentChanges = true;
		}
		let settings = g_file.getProjectSettings();
		let data = {
			"action": "editor_run_program",
			"files": g_file.getFilesForUpload( getOnlyRecentChanges ),
			"title": settings.name,
			"isFullProject": !getOnlyRecentChanges
		};
		$.post( g_ajaxUrl, data, function ( dataReturn ) {
			if( dataReturn.maxFileSizeExceeded ) {
				g_layout.createPopup( "Error", "<p class='msg-error'>" +
					"You are over the max storage capacity. " +
					"You cannot run or update your program until you free up some file space.</p>" );
				return;
			}
			if( dataReturn.needsRefresh && m_reRuns === 0 ) {
				m_reRuns += 1;
				runProgram( noRun, false );
				return;
			}
			m_reRuns = 0;
			if( !noRun && dataReturn.success ) {
				let href = window.location.href;
				let base_url = "http://localhost/pijs-run.org/";
				if( href.indexOf( "localhost" ) === -1 ) {
					base_url = "https://www.pijs-run.org/";
				}
				let url = base_url + "runs/" + dataReturn.project_id;
				g_file.resetFilesChanged();
				let w = null;
				if( settings.isFullscreen ) {
					w = window.open( url, "_blank" );
				} else {
					let windowSettings = "width=" + settings.width + ", height=" + settings.height + " top=200,left=200";
					w = window.open( url, "_blank", windowSettings );
				}
				if( w ) {
					w.focus();
				}
			}
		} );
	}

	function updateProgram() {
		runProgram( true, true );
	}

	function createFileView( element, folder, init, isHidden, level ) {
		let ul = document.createElement( "ul" );

		if( isHidden ) {
			ul.style.display = "none";
		}
		folder.sort( function ( a, b ) {
			if ( a.type === g_file.FILE_TYPE_FOLDER && b.type === g_file.FILE_TYPE_FOLDER ) {
				return a.fullname.localeCompare( b.fullname );
			} else if( a.type === g_file.FILE_TYPE_FOLDER ) {
				return -1;
			} else if( b.type === g_file.FILE_TYPE_FOLDER ) {
				return 1;
			} else {
				return a.fullname.localeCompare( b.fullname );
			}
		} );
		for( let i = 0; i < folder.length; i++ ) {
			let file = folder[ i ];
			let li = document.createElement( "li" );
			let div = document.createElement( "div" );
			let div2 = document.createElement( "div" );
			let spanFileName = document.createElement( "span" );
			let spanFileSize = document.createElement( "span" );
			spanFileName.classList.add( "file-name" );
			spanFileSize.classList.add( "file-size" );
			div2.classList.add( "file-title" );
			let toggle = document.createElement( "button" );
			g_layout.setDragItem( li );
			toggle.classList.add( "btn-check" );
			if( file.isActive ) {
				toggle.classList.add( "checked" );
				//toggle.value = "[●]";
				//toggle.value = "[✓]";
				//toggle.value = "[ ]";
				toggle.value = true;
				li.classList.add( "active-file" );
			} else if( file.isActive === false ) {
				toggle.classList.add( "unchecked" );
				//toggle.value = "[●]";
				//toggle.value = "[✓]";
				//toggle.value = "[ ]";
				toggle.value = false;
				li.classList.add( "inactive-file" );
			} else {
				toggle.value = null;
				li.classList.add( "someactive-file" );
			}
			toggle.onclick = activeToggleButtonClicked;
			div2.appendChild( toggle );
			div2.appendChild( spanFileName );
			div.appendChild( div2 );
			div.appendChild( spanFileSize );
			li.appendChild( div );
			//li.appendChild( spanFileSize );
			li.dataset.fileType = file.type;
			li.dataset.clickable = true;
			li.dataset.fileId = file.id;

			let displayName = "";
			if( level > 0 ) {
				for( let j = 0; j < level; j++ ) {
					displayName += "&nbsp;&nbsp;";
				}
			}
			li.dataset.displayName = displayName;
			if( file.type === g_file.FILE_TYPE_FOLDER ) {
				let fileContent = g_file.getFilesFromFolder( file.id );
				updateFolderName( li, file, !file.minimized );
				createFileView( li, fileContent, init, file.minimized, level + 1 );
			} else {
				displayName += file.fullname;
				spanFileName.innerHTML = displayName;
				spanFileSize.innerText = g_util.getMbKb( file.size );
			}
			ul.appendChild( li );
		}
		element.appendChild( ul );

		updateAllFileActiveCheckboxesClasses();
	}

	function activeToggleButtonClicked() {
		let file = g_file.getFileById( $( this ).closest( "li" ).get( 0 ).dataset.fileId );
		if( this.classList.contains( "unchecked" ) ) {
			g_file.setFileData( file.id, "isActive", true );
		} else {
			g_file.setFileData( file.id, "isActive", false );
		}

		// Make everything inside a folder the same state as the folder
		if( file.type === g_file.FILE_TYPE_FOLDER ) {
			let folders = [ g_file.getFilesFromFolder( file.id ) ];
			while( folders.length > 0 ) {
				let folder = folders.pop();
				for( let i = 0; i < folder.length; i++ ) {
					g_file.setFileData( folder[ i ].id, "isActive", file.isActive );
					if( folder[ i ].type === g_file.FILE_TYPE_FOLDER ) {
						folders.push( g_file.getFilesFromFolder( folder[ i ].id ) );
					}
				}
			}
		}

		// Update the status of the ancestry
		let parentFolder = g_file.getFileByFullpath( file.path );
		while( parentFolder.name !== g_file.ROOT_NAME ) {
			setFolderActiveStatus( parentFolder );
			parentFolder = g_file.getFileByFullpath( parentFolder.path );
		}

		// Update all checkbox classes
		updateAllFileActiveCheckboxesClasses();
	}

	function updateAllFileActiveCheckboxesClasses() {
		function setCheckStatus( checkFile, btnCheck, parentElement ) {
			if( checkFile.isActive ) {
				btnCheck.classList.remove( "unchecked" );
				btnCheck.classList.add( "checked" );
				parentElement.classList.remove( "inactive-file" );
				parentElement.classList.remove( "someactive-file" );
				parentElement.classList.add( "active-file" );
			} else if( checkFile.isActive === false ) {
				btnCheck.classList.remove( "checked" );
				btnCheck.classList.add( "unchecked" );
				parentElement.classList.add( "inactive-file" );
				parentElement.classList.remove( "someactive-file" );
				parentElement.classList.remove( "active-file" );
			} else {
				btnCheck.classList.remove( "unchecked" );
				btnCheck.classList.remove( "checked" );
				parentElement.classList.remove( "inactive-file" );
				parentElement.classList.add( "someactive-file" );
				parentElement.classList.remove( "active-file" );
			}
		}

		// Update all the file statuses first
		let $allFiles = $( ".file-viewer li" ).not( "[data-file-type='folder']" ).find( ".btn-check" );
		$allFiles.each( ( index, btnCheck ) => {
			let parentElement = $( btnCheck ).closest( "li" ).get( 0 );
			let checkFile = g_file.getFileById( parentElement.dataset.fileId );
			setCheckStatus( checkFile, btnCheck, parentElement );
		} );

		// Update all the folder statuses
		let $allFolders = $( ".file-viewer [data-file-type='folder']" );
		$allFolders.each( ( index, parentElement ) => {
			let btnCheck = $( parentElement ).find( ".btn-check" ).get( 0 );
			let fileId = parentElement.dataset.fileId;
			// Skip root directory
			if( !fileId ) {
				return;
			}
			let checkFile = g_file.getFileById( fileId );
			let $ul = $( parentElement ).find( "ul" );
			checkFile.isActive = null;
			let $allCheckButtons = $ul.find( "li" ).not( "[data-file-type='folder']" );
			let checkedLength = $allCheckButtons.find( ".btn-check.checked" ).length;
			if( checkedLength === $allCheckButtons.length ) {
				g_file.setFileData( checkFile.id, "isActive", true );
			} else {
				let uncheckedLength = $allCheckButtons.find( ".btn-check.unchecked" ).length;
				if( uncheckedLength === $allCheckButtons.length ) {
					g_file.setFileData( checkFile.id, "isActive", false );
				}
			}
			setCheckStatus( checkFile, btnCheck, parentElement );
		} );
	}

	function setFolderActiveStatus( folder ) {
		let folders = [ folder ];
		let subfileStatus = null;
		while( folders.length > 0 ) {
			let subfolder = folders.pop();
			let files = g_file.getFilesFromFolder( subfolder.id );
			for( let i = 0; i < files.length; i++ ) {
				if( subfileStatus === null ) {
					subfileStatus = files[ i ].isActive;
				} else if( subfileStatus !== files[ i ].isActive ) {
					g_file.setFileData( folder.id, "isActive", null );
					return;
				}
				if( files[ i ].type === g_file.FILE_TYPE_FOLDER ) {
					folders.push( files[ i ] );
				}
			}
		}
		g_file.setFileData( folder.id, "isActive", subfileStatus );
	}

	function openFile( file, noNewTabs ) {
		let isTabAlreadyOpen = m_tabsElement.createTab( {
			"id": file.id, "name": getShortName( file.fullname )
		}, noNewTabs );
		if( !noNewTabs || isTabAlreadyOpen ) {
			openFileContents( file );
		}
		g_editor.resize();
	}

	function closeEditorModel( file ) {
		if( m_models[ file.id ] ) {
			m_models[ file.id ].dispose();
			delete m_models[ file.id ];
		}
		m_tabsElement.closeTab( file.id );
	}

	function openFileContents( file ) {
		if( file.type === g_file.FILE_TYPE_SCRIPT ) {
			$( ".main-image-viewer" ).hide();
			$( ".main-audio-viewer" ).hide();
			$( ".main-editor-body" ).show();
			if( !m_models[ file.id ] ) {
				m_models[ file.id ] = g_editor.createModel( g_file.getFileContentById( file.id ), file.type );
				m_models[ file.id ].onDidChangeContent( function () {
					g_file.setFileContent( file.id, m_models[ file.id ].getValue() );
				} );
			}
			g_editor.setModel( m_models[ file.id ] );
		} else if( file.type === FILE_TYPE_IMAGE ) {
			let $imageViewer = $( ".main-image-viewer" );
			if( $imageViewer.data( "file" ) === file.fullpath ) {
				$( ".main-editor-body" ).hide();
				$( ".main-audio-viewer" ).hide();
				$imageViewer.show();
			} else {
				$( ".main-editor-body" ).hide();
				$( ".main-audio-viewer" ).hide();
				$imageViewer.html( "" ).show();
				let img = new Image();
				img.onload = function () {
					if( img.naturalWidth < $imageViewer.width() ) {
						img.style.imageRendering = "pixelated";
					}
				}
				img.src = g_file.getFileContentById( file.id );
				img.style.width = "100%";
				img.style.height = "100%";
				img.style.objectFit = "contain";
				$imageViewer.append( img );
				$imageViewer.data( "file", file.fullpath );
			}
		} else if( file.type === FILE_TYPE_AUDIO ) {
			$( ".main-image-viewer" ).hide();
			$( ".main-editor-body" ).hide();
			$( "#main-audio-player" ).get( 0 ).src = g_file.getFileContentById( file.id );
			$( ".main-audio-viewer" ).show();
		}
	}

	function highlightSelectedFile( file ) {
		let fileElement = document.querySelector( ".file-viewer [data-file-id='" + file.id + "']" );
		if( fileElement ) {
			$( "." + CLASS_NAMES.SELECTED_FILE ).removeClass( CLASS_NAMES.SELECTED_FILE );
			$( "." + CLASS_NAMES.LAST_SELECTED_FILE ).removeClass( CLASS_NAMES.LAST_SELECTED_FILE );
			fileElement.classList.add( CLASS_NAMES.SELECTED_FILE );
			fileElement.classList.add( CLASS_NAMES.LAST_SELECTED_FILE );
			fileElement.scrollIntoView( { behavior: "smooth", block: "end", inline: "nearest" } );
			$( fileElement ).parents( "ul" ).show();
			m_lastFileClicked = fileElement;
		}
	}

	function updateFolderName( element, file, isOpen ) {
		if( isOpen ) {
			element.querySelector( "span" ).innerHTML = element.dataset.displayName + OPEN_FOLDER_ENTITY + "&nbsp;" + file.fullname;
		} else {
			element.querySelector( "span" ).innerHTML = element.dataset.displayName + CLOSED_FOLDER_ENTITY + "&nbsp;" + file.fullname;
		}
	}

	function mouseDown( e ) {
		clickFiles( e, true );
	}

	function mouseUp( e ) {
		clickFiles( e, false );
	}

	function clickFiles( e, mouseDown ) {

		// Make sure we are not hovering over a button
		let hoverItem = document.elementFromPoint( e.pageX, e.pageY );
		if( hoverItem.tagName === "BUTTON" ) {
			return;
		}

		// Make sure we are clicking on a file or folder
		m_clickedOnRootFolder = false;
		let target = g_util.getClickableTarget( e.target, this );
		if( ! target ) {
			m_clickedOnRootFolder = true;
			return;
		}

		let file = g_file.getFileById( target.dataset.fileId );
		let parent = $( target ).closest( "li" );

		if( mouseDown ) {
			if( e.shiftKey && m_lastFileClicked ) {
				selectMultipleFiles( m_lastFileClicked, target );
			} else if( e.ctrlKey ) {
				// Toggle selected file
				if( target.classList.contains( CLASS_NAMES.SELECTED_FILE ) ) {
					target.classList.remove( CLASS_NAMES.SELECTED_FILE );
					if( target.classList.contains( CLASS_NAMES.LAST_SELECTED_FILE ) ) {
						target.classList.remove( CLASS_NAMES.LAST_SELECTED_FILE );
						m_lastFileClicked = $( "." + CLASS_NAMES.SELECTED_FILE ).first().get( 0 );
						if( m_lastFileClicked ) {
							m_lastFileClicked.classList.add( CLASS_NAMES.LAST_SELECTED_FILE );
						}
					}
				} else {
					m_lastFileClicked = target;
					addFileToSelectedFiles( target );
				}
			} else if( !target.classList.contains( CLASS_NAMES.SELECTED_FILE ) || e.which === 1 ) {
				m_lastFileClicked = target;
				addFileToSelectedFiles( target, true );
				if( target.dataset.fileType !== g_file.FILE_TYPE_FOLDER ) {
					openFile( file );
				}
			}
		} else if( file.type === g_file.FILE_TYPE_FOLDER && e.which === 1 ) {
			let ul = target.querySelector( "ul" );
			if( ul.style.display === "none" ) {
				ul.style.display = "";
				updateFolderName( target, file, true );
				file.minimized = false;
			} else {
				ul.style.display = "none";
				updateFolderName( target, file, false );
				file.minimized = true;
			}
		}
	}

	// Make sure that no parent folder is selected
	function addFileToSelectedFiles( element, isUnique ) {
		let $ancestor = $( element ).closest( "." + CLASS_NAMES.SELECTED_FILE );
		if( $ancestor.length === 0 || isUnique ) {
			if( isUnique ) {
				g_util.selectItem( element, CLASS_NAMES.SELECTED_FILE );
			} else {
				element.classList.add( CLASS_NAMES.SELECTED_FILE );
				let $children = $( element ).find( "li" );
				if( $children.length > 0 ) {
					$children.removeClass( CLASS_NAMES.SELECTED_FILE );
					$children.removeClass( CLASS_NAMES.LAST_SELECTED_FILE );
				}
			}
		}
		g_util.selectItem( element, CLASS_NAMES.LAST_SELECTED_FILE );
	}

	function selectMultipleFiles( startElement, endElement ) {
		let startElementRect = startElement.getBoundingClientRect();
		let endElementRect = endElement.getBoundingClientRect();
		let firstElement, lastElement;
		if( startElementRect.top < endElementRect.top ) {
			firstElement = startElement;
			lastElement = endElement;
		} else {
			firstElement = endElement;
			lastElement = startElement;
		}
		let $allFiles = $( "." + CLASS_NAMES.FILE_VIEWER + " li" );
		let isInRange = false;
		$allFiles.each( function () {
			if( this === firstElement ) {
				isInRange = true;
			}
			if( isInRange ) {
				addFileToSelectedFiles( this, false );
			}
			if( this === lastElement ) {
				isInRange = false;
			}
		} );
	}

	function getFolders( name, folderContents, folderArray ) {
		folderArray.push( name );
		for( let i = 0; i < folderContents.length; i++ ) {
			if( folderContents[ i ].type === g_file.FILE_TYPE_FOLDER ) {
				getFolders(
					name + "/" + folderContents[ i ].fullname,
					g_file.getFilesFromFolder( folderContents[ i ].id ),
					folderArray
				);
			}
		}
	}

	function createFolderOptions( defaultFolderPath ) {
		let folders = [];
		getFolders( g_file.ROOT_NAME, g_file.getFilesFromFolder( 0 ), folders );
		let folderOptions = "";
		for( let i = 0; i < folders.length; i++ ) {
			if( folders[ i ] === defaultFolderPath ) {
				folderOptions += "<option selected>" + folders[ i ] + "</option>";
			} else {
				folderOptions += "<option>" + folders[ i ] + "</option>";
			}
		}
		return folderOptions;
	}

	function getSelectedFiles() {
		let selectedFiles = [];
		document.querySelectorAll( "." + CLASS_NAMES.SELECTED_FILE ).forEach( ( selectedElement ) => {
			selectedFiles.push( g_file.getFileById( selectedElement.dataset.fileId ) );
		} );
		return selectedFiles;
	}

	function deleteSelectedFiles() {
		let selectedFiles = getSelectedFiles();
		for( let i = 0; i < selectedFiles.length; i++ ) {
			g_file.deleteFile( selectedFiles[ i ].fullpath );
		}
		if( selectedFiles.length > 0 ) {
			m_lastFileClicked = null;
			refreshFileView();
		}
	}

	function refreshFileView() {
		let $filesElement = $( ".file-viewer" );
		$filesElement.find( "ul" ).remove();
		createFileView( $filesElement.get( 0 ), g_file.getFilesFromFolder( 0 ), false, false, 0 );
		m_tabsElement.refreshTabs();

		// Highlight open tab if found
		let $selectedTab = $( ".selected-tab" );
		if( $selectedTab.length > 0 ) {
			let file = g_file.getFileById( $selectedTab.get( 0 ).dataset.fileId );
			highlightSelectedFile( file );
		}

		//resize();
	}

	function createProjectSettingsDialog() {
		function zipProjectFiles( file, zip, scripts, folder ) {
			if( file.type === g_file.FILE_TYPE_FOLDER ) {
				let fileContents = g_file.getFilesFromFolder( file.id );
				for( let i = 0; i < fileContents.length; i++ ) {
					let path = "";
					if( file.name === g_file.ROOT_NAME ) {
						path = "";
					} else if( folder === "" ) {
						path = file.name;
					} else {
						path = folder + "/" + file.name;
					}
					zipProjectFiles( fileContents[ i ], zip, scripts, path );
				}
			} else {
				let filename = "";
				if( folder === "" ) {
					filename = file.fullname;
				} else {
					filename = folder + "/" + file.fullname;
				}
				let content = g_file.getFileContentById( file.id );
				if( file.type === FILE_TYPE_IMAGE || file.type === FILE_TYPE_AUDIO ) {
					content = content.substr( content.indexOf( "base64," ) + "base64,".length );
					zip.file( filename, content, { "base64": true } );
				} else {
					zip.file( filename, content );
					scripts.push( "<script src='" + filename + "'></script>" );
				}
			}
		}

		function updateProjectSettings() {
			let isChecked = div.querySelector( ".btn-check" ).classList.contains( "checked" );
			g_file.setProjectSettings( "name", div.querySelector( "#project-name" ).value );
			g_file.setProjectSettings( "isFullscreen", isChecked );
			g_file.setProjectSettings( "width", parseInt( div.querySelector( "#project-width" ).value ) );
			g_file.setProjectSettings( "height", parseInt( div.querySelector( "#project-height" ).value ) );
		}

		function toggleFullscreenOptions() {
			let isChecked = div.querySelector( ".btn-check" ).classList.contains( "checked" );
			if( isChecked ) {
				$( ".project-size-container" )
					.css( "opacity", 0.5 )
					.find( "input" ).prop( "disabled", true );
			} else {
				$( ".project-size-container" )
					.css( "opacity", "" )
					.find( "input" ).prop( "disabled", false );
			}
		}

		let div = document.createElement( "div" );
		let settings = g_file.getProjectSettings();
		let checkClass = "unchecked";
		if( settings.isFullscreen ) {
			checkClass = "checked";
		}
		div.classList.add( "project-settings-popup" );
		div.innerHTML = "<p>" +
			"<span>Name:</span>&nbsp;&nbsp;" +
			"<input id='project-name' type='text' value='" + settings.name + "' maxlength='255' /> " +
			"</p><p>" +
			"<label><button class='btn-check " + checkClass + "' value='true'></button>Fullscreen</label>" +
			"</p><p class='project-size-container'>" + 
			"<span>Window Width:</span>&nbsp;&nbsp;" +
			"<input id='project-width' type='number' value='" + settings.width + "' /> " +
			"</p><p class='project-size-container'>" +
			"<span>Window Height:</span>&nbsp;&nbsp;" +
			"<input id='project-height' type='number' value='" + settings.height + "' />" +
			"</p><p style='text-align: center'>" +
			"<input id='btn-download-project' type='button' value='Download Project' class='btn-retro button-wide btn-8-14' />" +
			"</p>";

		g_layout.createPopup( "Project Settings", div, { "okCommand": function () {
			updateProjectSettings();
			return true;
		}, "cancelCommand": function () {} } );

		$( "#btn-download-project" ).on( "click", function () {
			let settings = g_file.getProjectSettings();
			updateProjectSettings();
			let indexHtml = HTML_TEMPLATE.replace( "[TITLE]", settings.name );
			let scripts = [ "<script src='https://pijs.org/pi-1.0.0.js'></script>" ];
			let zip = new JSZip();
			zipProjectFiles( g_file.getFileById( 0 ), zip, scripts, "" );
			indexHtml = indexHtml.replace( "[SCRIPTS]", scripts.join( "\n\t\t" ) );
			zip.file( "index.html", indexHtml );
			zip.generateAsync( { type: "blob" } )
				.then( function( content ) {
					saveAs( content, "PIJS_PROJECT_" + settings.name + ".zip" );
				} );
		} );

		div.querySelector( ".btn-check" ).addEventListener( "click", function () {
			if( this.classList.contains( "checked" ) ) {
				this.classList.remove( "checked" );
				this.classList.add( "unchecked" );
			} else {
				this.classList.remove( "unchecked" );
				this.classList.add( "checked" );
			}
			toggleFullscreenOptions();
		} );

		// When a file name has changed
		div.querySelector( "#project-name" ).addEventListener( "change", function () {
			let value = this.value;
			value = value.replace( UNALLOWED_FILE_CHARACTERS, "" );
			this.value = value;
		} );

		// When a file name has changed
		div.querySelector( "#project-name" ).addEventListener( "keypress", function ( e ) {
			if( UNALLOWED_FILE_CHARACTERS.test( e.key ) ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();
			}
			let value = this.value;
			value = value.replace( UNALLOWED_FILE_CHARACTERS, "" );
			this.value = value;
			if( e.key === "Enter" ) {
				$( ".popup-ok" ).click();
			}
		} );

		toggleFullscreenOptions();
	}

	function createFileDialog( dialogType, fileTypeSelected ) {
		let buttonText = "Create";
		let fileDialogTitle = "Create New File";
		let defaultName = "untitled";
		let defaultFolderName = g_file.ROOT_NAME;
		let defaultFileType = FILE_TYPES[ 0 ];
		let defaultExtension = FILE_TYPE_EXTENSIONS[ defaultFileType ];
		let excludedFileTypes = [];
		let selectedFile = null;

		if( fileTypeSelected ) {
			defaultFileType = fileTypeSelected;
			defaultExtension = FILE_TYPE_EXTENSIONS[ defaultFileType ];
		}

		// Get the last file selected in case of multi-selection
		if( m_lastFileClicked && !m_clickedOnRootFolder ) {
			selectedFile = g_file.getFileById( m_lastFileClicked.dataset.fileId );
			if( selectedFile.type === g_file.FILE_TYPE_FOLDER ) {
				defaultFolderName = selectedFile.fullpath;
			} else {
				defaultFolderName = selectedFile.path;
			}
		}

		// Check if we are editting the file or creating a new file
		if( dialogType === "edit" ) {

			// Need to make sure that a file was selected first
			if( ! m_lastFileClicked ) {
				g_layout.createPopup( "Notice", "Select a file to edit then try again." );
				return;
			}
			buttonText = "Update";

			// Setup the defaults
			defaultName = selectedFile.name;
			fileDialogTitle = "Update File: " + selectedFile.fullname;
			defaultFileType = selectedFile.type;
			defaultExtension = selectedFile.extension;
			if( defaultFileType === g_file.FILE_TYPE_FOLDER ) {
				for( let i = 0; i < FILE_TYPES.length; i++ ) {
					if( FILE_TYPES[ i ] !== g_file.FILE_TYPE_FOLDER ) {
						excludedFileTypes.push( FILE_TYPES[ i ] );
					}
				}
			} else {
				excludedFileTypes.push( g_file.FILE_TYPE_FOLDER );
			}
		}

		// Create the popup contents
		let div = document.createElement( "div" );
		let typeOptions = "";
		for( let i = 0; i < FILE_TYPES.length; i++ ) {
			if( excludedFileTypes.indexOf( FILE_TYPES[ i ] ) > -1 ) {
				continue;
			}
			if( FILE_TYPES[ i ] === defaultFileType ) {
				typeOptions += "<option selected>" + FILE_TYPES[ i ] + "</option>";
			} else {
				typeOptions += "<option>" + FILE_TYPES[ i ] + "</option>";
			}
		}
		let folderOptions = createFolderOptions( defaultFolderName );

		// Build the HTML
		div.className = "new-file-popup";

		let divContent = "";
		if( dialogType !== "edit" ) {
			divContent += "<p>" +
				"<span>File Type:</span>&nbsp;&nbsp;" +
				"<select id='new-file-language'>" + typeOptions + "</select>" +
				"</p>";
		}

		divContent += "<p>" +
			"<span>File Name:</span>&nbsp;&nbsp;" +
			"<input id='new-file-name' type='text' value='" + defaultName + "' maxlength='255'/> " +
			"<span id='new-file-extension'>" + defaultExtension + "</span>" + 
			"</p><p>" +
			"<span>Folder:</span>&nbsp;&nbsp;" +
			"<select id='new-file-folder'>" + folderOptions + "</select>" +
			"</p><p id='new-file-message'>&nbsp;</p>";
		
		div.innerHTML = divContent;

		// When a file name has changed
		div.querySelector( "#new-file-name" ).addEventListener( "change", function () {
			let value = this.value;
			value = value.replace( UNALLOWED_FILE_CHARACTERS, "" );
			this.value = value;
		} );

		// When a file name has changed
		div.querySelector( "#new-file-name" ).addEventListener( "keypress", function ( e ) {
			if( UNALLOWED_FILE_CHARACTERS.test( e.key ) ) {
				e.preventDefault();
				e.stopImmediatePropagation();
				e.stopPropagation();
			}
			let value = this.value;
			value = value.replace( UNALLOWED_FILE_CHARACTERS, "" );
			this.value = value;
			if( e.key === "Enter" ) {
				createButton.click();
			}
		} );

		let language = defaultFileType;

		if( dialogType !== "edit" ) {
			// When the language has changed
			div.querySelector( "#new-file-language" ).addEventListener( "change", function () {
				language = div.querySelector( "#new-file-language" ).value;
				div.querySelector( "#new-file-extension" ).innerText = FILE_TYPE_EXTENSIONS[ language ];
			} );
		}

		// Create the create/update button
		let createButton = document.createElement( "input" );
		createButton.classList.add( "btn-retro" );
		createButton.classList.add( "btn-8-14" );
		createButton.value = buttonText;
		createButton.type = "button";

		// When the create/update button is clicked
		createButton.addEventListener( "click", function () {

			// Get all input values
			if( dialogType !== "edit" ) {
				language = div.querySelector( "#new-file-language" ).value;
			}
			let name = div.querySelector( "#new-file-name" ).value;
			let folderPath = div.querySelector( "#new-file-folder" ).value;
			let fileExtension = FILE_TYPE_EXTENSIONS[ language ];
			let filePath = folderPath + "/" + name + fileExtension;
			let divMsg = document.getElementById( "new-file-message" );
			let defaultOp = "Created file: ";

			// If we are doing an update instead of create
			if( dialogType === "edit" ) {

				if( fileExtension === undefined ) {
					fileExtension = selectedFile.extension;
					filePath = folderPath + "/" + name + fileExtension;
				}

				// Find the destination file in case the location is different
				let searchForFile = g_file.getFileByFullpath( filePath );
				if( searchForFile ) {

					// If there already is a file in the destination folder with the same name
					// and it isn't the same file
					if( searchForFile !== selectedFile ) {
						divMsg.classList.remove( "msg-success" );
						divMsg.classList.add( "msg-error" );
						divMsg.innerText =  filePath + " already exists.";
						return false;
					} else {

						// No need to move the file since it's already in the destination folder
						selectedFile.name = name;
						selectedFile.fullname = name + fileExtension;
						selectedFile.isChanged = true;
						if( selectedFile.type === g_file.FILE_TYPE_FOLDER ) {
							repathFolder( selectedFile );
						}
						defaultOp = "Updated file: ";
					}
				} else {

					// Store temp values in case move fails
					let tempName = selectedFile.name;
					let tempFullname = selectedFile.fullname;
					let tempExtension = selectedFile.extension;

					selectedFile.name = name;
					selectedFile.fullname = name + fileExtension;
					selectedFile.extension = fileExtension;

					// Only move if the path is different
					if( selectedFile.path !== folderPath ) {
						let moveStatus = g_file.moveFile( selectedFile, folderPath );
						if( moveStatus !== true ) {
							selectedFile.name = tempName;
							selectedFile.fullname = tempFullname;
							selectedFile.extension = tempExtension;

							divMsg.classList.remove( "msg-success" );
							divMsg.classList.add( "msg-error" );
							divMsg.innerText =  "Move failed: " + moveStatus;
							return false;
						}
						selectedFile.isChanged = true;
						defaultOp = "Moved file to: ";
					} else {
						defaultOp = "Updated file: ";
					}
				}
			} else {

				// Create file

				// Check if file already exists
				if( g_file.getFileByFullpath( filePath ) ) {
					divMsg.classList.remove( "msg-success" );
					divMsg.classList.add( "msg-error" );
					divMsg.innerText =  filePath + " already exists.";
					return false;
				}

				let parent = g_file.getFileByFullpath( folderPath );
				let content = "";
				if( language === g_file.FILE_TYPE_FOLDER ) {
					content = [];
				}

				// Create the file
				let file = {
					"name": name,
					"type": language,
					"extension": fileExtension
				};
				if( parent.path === "" ) {
					g_file.createFile( file, g_file.ROOT_NAME, content );
				} else {
					g_file.createFile( file, parent.path + "/" + parent.fullname, content );
				}
			}

			refreshFileView();

			divMsg.classList.remove( "msg-error" );
			divMsg.classList.add( "msg-success" );
			divMsg.innerText = defaultOp + filePath;
			if( language === g_file.FILE_TYPE_FOLDER ) {
				div.querySelector( "#new-file-folder" ).innerHTML = createFolderOptions();
			}
		} );
		g_layout.createPopup(
			fileDialogTitle, div, { "extraButtons": [ createButton ], "okText": "Close" }
		);
		document.getElementById( "new-file-name" ).select();
	}

	function createUploadDialog( files ) {
		let div = document.createElement( "div" );
		let folderOptions = createFolderOptions();
		let freespaceMB = g_util.getMbKb( MAX_FILE_STORAGE_SIZE - g_file.getFileStorageSize() );
		div.innerHTML = "<p><input id='fileUploads' type='file' accept='audio/*,image/*,.js,.zip' multiple></p>" +
			"Storage Available: " + freespaceMB + "<br />" +
			"Zipped File(s): <span id='zippedFiles'></span><br />" +
			"Total File(s): <span id='fileCount'></span><br />" +
			"Total Size: <span id='fileSize'></span><br />" +
			"<p id='fileMessage'></p>" +
			"<p><span>Upload to Folder:</span>&nbsp;&nbsp;" +
			"<select id='new-file-folder'>" + folderOptions + "</select>" + "</p>";
		g_layout.createPopup( "Upload a File", div, {
			"okCommand": function () {
				let folderPath = div.querySelector( "#new-file-folder" ).value;
				for( let i = 0; i < m_fileUploads.length; i++ ) {
					let file = m_fileUploads[ i ];
					addNewUploadedFile(
						file.name, folderPath, file.extension, file.content, file.type
					);
				}
				for( let i = 0; i < m_zipFileUploads.length; i++ ) {
					saveUploadedZipFile( m_zipFileUploads[ i ], folderPath );
				}
				m_fileUploads = null;
				m_zipFileUploads = null;
				return true;
			},
			"cancelCommand": function () {
				m_zipFileUploads = null;
			}
		} );
		if( files ) {
			div.querySelector( "#fileUploads" ).files = files;
			checkUploadedFiles( div, true );
		}
		div.querySelector( "#fileUploads" ).addEventListener(
			"change", () => checkUploadedFiles( div, true )
		);
	}

	function saveUploadedZipFile( file, folderPath ) {
		let name = file.name;
		let extension = name.substr( name.lastIndexOf( "." ) );
		if( name.indexOf( "/" ) === -1 ) {
			name = file.name;
		} else {
			folderPath = folderPath + "/" + name.substr( 0, name.lastIndexOf( "/" ) );
			name = name.substr( -( name.length - name.lastIndexOf( "/" ) - 1 ) );
		}
		name = name.substr( 0, name.lastIndexOf( "." ) );
		addNewUploadedFile( name, folderPath, extension, file.content, file.type );
	}

	function saveUploadedFile( uploadedFile ) {
		let type = "";
		let reader = new FileReader ();

		if( uploadedFile.type.indexOf( "javascript" ) > -1 ) {
			type = g_file.FILE_TYPE_SCRIPT;
		} else if( uploadedFile.type.indexOf( "image" ) > -1 ) {
			type = FILE_TYPE_IMAGE;
		} else if( uploadedFile.type.indexOf( "audio" ) > -1 ) {
			type = FILE_TYPE_AUDIO;
		}

		// Runs after image is loaded
		reader.onloadend = function ( ev ) {
			let name = uploadedFile.name.substring( 0, uploadedFile.name.lastIndexOf( "." ) );
			let content = reader.result;
			let imageType = null;
			let audioType = null;
			let extension = ".js";
			if( type === FILE_TYPE_IMAGE ) {
				imageType = content.substring( content.indexOf( "data:" ) + 5, content.indexOf( ";" ) );
				extension = getExtensionFromImageType( imageType );
			}
			if( type === FILE_TYPE_AUDIO ) {
				audioType = content.substring( content.indexOf( "data:" ) + 5, content.indexOf( ";" ) );
				extension = getExtensionFromAudioType( audioType );
			}

			m_fileUploads.push( {
				"name": name,
				"extension": extension,
				"content": content,
				"type": type,
				"size": g_util.getByteSize( content )
			} );
			updateUploadedFileSizes();
			//addNewUploadedFile( name, folderPath, extension, content, type );
		};
		if( type === "javascript" ) {
			reader.readAsText( uploadedFile );
		} else {
			reader.readAsDataURL( uploadedFile );
		}
	}

	function addNewUploadedFile( name, folderPath, extension, content, type ) {
		let fullname = name + extension;
		let filePath = folderPath + "/" + fullname;
		let parent = g_file.getFileByFullpath( folderPath );
		if( !parent ) {
			let shortname = folderPath.substr( folderPath.lastIndexOf( "/" ) + 1 );
			parent = g_file.createFileFromPath( folderPath, {
				"extension": "",
				"name": shortname,
				"fullname": shortname,
				"type": g_file.FILE_TYPE_FOLDER
			}, [] );
		}
		let searchForFile = g_file.getFileByFullpath( filePath );
		let index = 0;
		while( searchForFile ) {
			name = getUpdatedName( name, ++index );
			fullname = name + extension;
			filePath = folderPath + "/" + fullname;
			searchForFile = g_file.getFileByFullpath( filePath );
		}
		let newFile = {
			"name": name,
			"fullname": fullname,
			"type": type,
			"extension": extension
		};
		if( parent.path === "" ) {
			g_file.createFile( newFile, g_file.ROOT_NAME, content );
		} else {
			g_file.createFile( newFile, parent.path + "/" + parent.fullname, content );
		}
		refreshFileView();
	}

	function getExtensionFromImageType( imageType ) {
		let extensions = {
			"image/bmp": ".bmp",
			"image/gif": ".gif",
			"image/jpeg": ".jpg",
			"image/png": ".png",
			"image/webp": ".webp"
		};
		if( extensions[ imageType ] ) {
			return extensions[ imageType ];	
		}
		return extensions[ "image/png" ];
	}

	function getTypeFromExtension( fileExtension ) {
		let mimeTypes = {
			".bmp": "image/bmp",
			".gif": "image/gif",
			".jpg": "image/jpeg",
			".png": "image/png",
			".webp": "image/webp",
			".wav": "audio/wav",
			".webm": "audio/webm",
			".ogg": "audio/ogg",
			".mp3": "audio/mpeg",
			".mid": "audio/mid",
			".mp4": "audio/mp4"
		};

		return mimeTypes[ fileExtension ];	
	}

	function getFileTypeFromExtension( fileExtension ) {
		let mimeTypes = {
			".bmp": FILE_TYPE_IMAGE,
			".gif": FILE_TYPE_IMAGE,
			".jpg": FILE_TYPE_IMAGE,
			".png": FILE_TYPE_IMAGE,
			".webp": FILE_TYPE_IMAGE,
			".wav": FILE_TYPE_AUDIO,
			".webm": FILE_TYPE_AUDIO,
			".ogg": FILE_TYPE_AUDIO,
			".mp3": FILE_TYPE_AUDIO,
			".mid": FILE_TYPE_AUDIO,
			".mp4": FILE_TYPE_AUDIO
		};

		return mimeTypes[ fileExtension ];	
	}

	function getExtensionFromAudioType( audioType ) {
		let extensions = {
			"audio/wave": ".wav",
			"audio/wav": ".wav",
			"audio/x-wav": ".wav",
			"audio/x-pn-wav": ".wav",
			"audio/webm": ".webm",
			"audio/ogg": ".ogg",
			"audio/mpeg": ".mp3",
			"audio/mid": ".mid",
			"audio/mp4": ".mp4"
		};
		if( extensions[ audioType ] ) {
			return extensions[ audioType ];	
		}
		return extensions[ "audio/mpeg" ];
	}

	function getUpdatedName( name, index ) {
		if( name.lastIndexOf( "." ) === -1 ) {
			return name + "_" + ( index + "" ).padStart( 3, "0" );
		}
		let extension = name.substring( name.lastIndexOf( "." ) );
		return name.substring( 0, name.lastIndexOf( "." ) ) + "_" + ( index + "" ).padStart( 3, "0" ) + extension;
	}

	function checkUploadedFiles( div, resetZipFiles ) {
		let files = div.querySelector( "#fileUploads" ).files;
		let msg = "";

		// Check for zip files - don't check rest of files until
		if( resetZipFiles ) {
			m_zipFileUploads = [];
			m_fileUploads = [];
			if( checkZipFiles( files, div ) ) {
				return;
			}
		}

		div.querySelector( "#zippedFiles" ).innerText = m_zipFileUploads.length;

		// Check the file types
		let filesData = checkFileTypes( files );
		
		for( let i = 0; i < filesData.bad.length; i++ ) {
			msg += "<p><span class='msg-error'>Unable to upload file: </span>" + filesData.bad[ i ].name + ".</p>";
		}
		div.querySelector( "#fileMessage" ).innerHTML = msg;
		let list = new DataTransfer();
		for( let i = 0; i < filesData.good.length; i++ ) {
			list.items.add( filesData.good[ i ] );
			saveUploadedFile( filesData.good[ i ] );
		}
		for( let i = 0; i < filesData.zip.length; i++ ) {
			list.items.add( filesData.zip[ i ] );
		}

		if( filesData.bad.length > 0 ) {
			div.querySelector( "#fileUploads" ).files = list.files;
			files = list.files;
		}

		let zipFiles = 0;
		if( m_zipFileUploads ) {
			zipFiles += m_zipFileUploads.length;
			updateUploadedFileSizes();
		}
		div.querySelector( "#fileCount" ).innerText = files.length + zipFiles - filesData.zip.length;
	}

	function checkZipFiles( files, div ) {
		let timeout = 0;
		let foundZipFile = false;

		Array.from( files ).forEach( ( file ) => {
			const extensions = [
				".bmp", ".gif", ".jpg", ".png", ".webp", ".wav",
				".webm", ".ogg", ".mp3", ".mid", ".mp4"
			];
			if( file.type.indexOf( "zip" ) > -1 ) {
				foundZipFile = true;
				JSZip.loadAsync( file ).then( function( zip ) {
					zip.forEach( function( relativePath, zipEntry ) {
						if( ! zipEntry.dir ) {
							if( zipEntry.name.endsWith( ".js" ) ) {
								zip.file( zipEntry.name ).async( "string" ).then( function( data ) {
									m_zipFileUploads.push( { "name": zipEntry.name, "content": data, "type": g_file.FILE_TYPE_SCRIPT } );
									clearTimeout( timeout );
									timeout = setTimeout( () => checkUploadedFiles( div, false ), 100 );
								} );
							} else {
								zip.file( zipEntry.name ).async( "base64" ).then( function( data ) {
									let content = "";
									let fileType = "";
									for( let j = 0; j < extensions.length; j++ ) {
										if( zipEntry.name.endsWith( extensions[ j ] ) ) {
											fileType = getFileTypeFromExtension( extensions[ j ] );
											content = "data:" + getTypeFromExtension( extensions[ j ] ) + ";base64," + data;
										}
									}
									if( content !== "" ) {
										m_zipFileUploads.push( {
											"name": zipEntry.name,
											"content": content,
											"type": fileType,
											"size": g_util.getByteSize( content )
										} );
									}
									clearTimeout( timeout );
									timeout = setTimeout( () => checkUploadedFiles( div, false ), 100 );
								} );
							}
						}
					} );
				} );
			}
		} );

		return foundZipFile;
	}

	function checkFileTypes( files ) {
		let badFiles = [];
		let goodFiles = [];
		let zipFiles = [];
		Array.from( files ).forEach( ( file ) => {
			if( 
				file.type.indexOf( "javascript" ) === -1 &&
				file.type.indexOf( "image" ) === -1 &&
				file.type.indexOf( "audio" ) === -1
			) {
				if( file.type.indexOf( "zip" ) === -1 ) {
					badFiles.push( file );
				} else {
					zipFiles.push( file );
				}
			} else {
				goodFiles.push( file );
			}
		} );
		return { "bad": badFiles, "good": goodFiles, "zip": zipFiles };
	}

	function updateUploadedFileSizes() {
		let msg = $( "#fileMessage" ).html();
		let fileSize = 0;
		for( let i = 0; i < m_fileUploads.length; i++ ) {
			fileSize += m_fileUploads[ i ].size;
		}
		for( let i = 0; i < m_zipFileUploads.length; i++ ) {
			fileSize += m_zipFileUploads[ i ].size;
		}
		let fileStorageUsed = g_file.getFileStorageSize();
		let freespace = MAX_FILE_STORAGE_SIZE - fileStorageUsed;
		let totalCapacityMB = g_util.getMbKb( fileStorageUsed );

		$( "#fileSize" ).text( g_util.getMbKb( fileSize ) );
		let okBtn = $( ".popup-ok" ).get( 0 );
		if( fileSize > freespace ) {
			msg += "<p><span class='msg-error msg-size-overflow'>Total size of files is above the max size of " +
			totalCapacityMB + ". If you have large images you can try to shrink the images or " +
				"increase the image compression.</span></p>";
			okBtn.setAttribute( "disabled", true );
		} else {
			okBtn.removeAttribute( "disabled" );
		}

		if( $( "#fileMessage" ).find( ".msg-size-overflow" ).length === 0 ) {
			$( "#fileMessage" ).html( msg );
		}
	}

	function updateFreespace() {
		let $fileSizeRemaining = $( ".file-size-remaining" );

		//if( m_failedLastSave ) {
		//	$fileSizeRemaining.text( "OVER" );
		//	$fileSizeRemaining.addClass( "msg-error" );
		//} else {
			let freespace = g_file.getFileStorageSize();
			$fileSizeRemaining.text( g_util.getMbKb( freespace ) )
				.attr( "title", g_util.getMbKb( freespace ) + " of " +
				g_util.getMbKb( MAX_FILE_STORAGE_SIZE ) + " storage used." );
		//	$fileSizeRemaining.removeClass( "msg-error" );
		//}
	}

	function getShortName( name ) {
		if( name.length >= MAX_NAME_LENGTH ) {
			let extensionStart = name.lastIndexOf( "." );
			if( extensionStart === -1 ) {
				return name.substring( 0, MAX_NAME_LENGTH - 1 ) + "~";
			}
			let extension = name.substr( extensionStart );
			return name.substring( 0, MAX_NAME_LENGTH - extension.length - 1 ) + "~" + extension;
		}
		return name;
	}

} )( jQuery );