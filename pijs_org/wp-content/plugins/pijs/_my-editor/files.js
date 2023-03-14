/* global monaco */
/* global editor */

"use strict";

var g_file = ( function () {
	const FILE_TYPE_FOLDER = "folder";
	const FILE_TYPE_SCRIPT = "javascript";
	const ROOT_NAME = "[root]";
	let m_project = {};
	let m_filesContent = {};
	let m_saveTimeout = null;

	return {
		"FILE_TYPE_FOLDER": FILE_TYPE_FOLDER,
		"FILE_TYPE_SCRIPT": FILE_TYPE_SCRIPT,
		"ROOT_NAME": ROOT_NAME,
		"createFile": createFile,
		"createFileFromPath": createFileFromPath,
		"deleteFile": deleteFile,
		"init": init,
		"getFilesFromFolder": getFilesFromFolder,
		"getFileContentById": getFileContentById,
		"getFileById": getFileById,
		"getFileByFullpath": getFileByFullpath,
		"getFileStorageSize": getFileStorageSize,
		"getProjectSettings": getProjectSettings,
		"getFilesForUpload": getFilesForUpload,
		"setFileData": setFileData,
		"setFileContent": setFileContent,
		"setProjectSettings": setProjectSettings,
		"resetFilesChanged": resetFilesChanged,
		"moveFile": moveFile
	};

	function getUniqueId() {
		return btoa( ( new Date() ).getTime() ).substring( 0, 18 );
	}

	function initBlankProject() {
		m_project = {
			"id": getUniqueId(),
			"name": "untitled",
			"isFullscreen": false,
			"width": 800,
			"height": 600,
			"lastFileId": 0,
			"files": {
				"0": {
					"id": "0",
					"name": ROOT_NAME,
					"fullname": ROOT_NAME,
					"type": FILE_TYPE_FOLDER,
					"path": "",
					"fullpath": ROOT_NAME,
					"extension": "",
					"isActive": true,
					"isChanged": true
				}
			},
			"fileLookup": {},
			"tabs": [ { "fileId": "1", "isSelected": true } ]
		};
		m_project.fileLookup[ ROOT_NAME ] = "0";
		setFileContent( "0", [] );
		createFile(
			{ "name": "main", "type": FILE_TYPE_SCRIPT, "extension": ".js" },
			ROOT_NAME, "" +
				"$.screen( \"300x200\" );\n" +
				"$.circle( 150, 100, 50, \"red\" );\n" +
				"// This is a comment.\n" +
				"$.filterImg( function ( color, x, y ) {\n\t" +
				"let z = x + y;\n\t"+
				"color.r = color.r - Math.round( Math.tan( z / 10 ) * 128 );\n\t" +
				"color.g = color.g + Math.round( Math.cos( x / 7 ) * 128 );\n\t" +
				"color.b = color.b + Math.round( Math.sin( y / 5 ) * 128 );\n\t" +
				"return color;\n" +
				"} );"
		);

		saveProject();
	}

	async function init( onReady ) {
		let projectData = await g_myIndexDB.getItem( "projectData" );
		let filesLoaded = 0;
		if( projectData ) {
			m_filesContent = {};
			m_project = projectData;
			let fileCount = 0;
			Object.entries( m_project.files ).forEach( entry => {
				let fileId = entry[ 0 ];
				fileCount += 1;
				g_myIndexDB.getItem( getFileStoreName( fileId ) )
					.then( ( fileData ) => {
						if( fileData ) {
							m_filesContent[ fileId ] = fileData;
						}
						filesLoaded += 1;
						if( filesLoaded === fileCount ) {
							// Load complete
							onReady();
						}
					} );
			} );
		} else {
			initBlankProject();
			onReady();
		}
	}

	function getFileById( id ) {
		return m_project.files[ id ];
	}

	function getFileContentById( id ) {
		return m_filesContent[ id ];
	}

	function getFileByFullpath( fullpath ) {
		return getFileById( m_project.fileLookup[ fullpath ] );
	}

	function getFileStoreName( fileId ) {
		return "file_" + m_project.id + "_" + fileId;
	}

	function setFileContent( id, content, callback ) {
		m_filesContent[ id ] = content;
		getFileById( id ).isChanged = true;
		saveFile( id, content, callback );
		if( getFileById( id ).type !== FILE_TYPE_FOLDER ) {
			setFileData( id, "size", g_util.getByteSize( content ) );
		}
	}

	function setFileData( id, key, value ) {
		getFileById( id )[ key ] = value;
		saveProject();
	}

	function setProjectSettings( key, value ) {
		m_project[ key ] = value;
		saveProject();
	}

	function addFileToFolder( folderId, fileId, callback ) {
		let folder = getFileById( folderId );
		
		if( folder.type === FILE_TYPE_FOLDER ) {
			let folderContent = getFileContentById( folderId );
			folderContent.push( fileId );
			saveFile( folderId, folderContent, callback );
			m_project.fileLookup[ getFileById( fileId ).fullpath ] = fileId;
		}
	}

	function removeFileFromFolder( folderId, fileId, callback ) {
		let folder = getFileById( folderId );
		if( folder.type === FILE_TYPE_FOLDER ) {
			let folderContent = getFileContentById( folderId );
			folderContent.splice( folderContent.indexOf( fileId ), 1 );
			delete m_project.fileLookup[ getFileById( fileId ).fullpath ];
			saveFile( folderId, folderContent, callback );
		}
	}

	function getFilesFromFolder( id ) {
		let folder = getFileById( id );
		if( folder.type === FILE_TYPE_FOLDER ) {
			let folderContent = getFileContentById( id );
			let tempFolder = [];
			folderContent.forEach( fileId => {
				tempFolder.push( getFileById( fileId ) );
			} );
			return tempFolder;
		}
	}

	function getFileStorageSize() {
		let totalBytes = 0;
		Object.entries( m_filesContent ).forEach( entry => {
			totalBytes += g_util.getByteSize( entry[ 1 ] );
		} );
		return totalBytes;
	}

	function getProjectSettings() {
		return {
			"name": m_project.name,
			"isFullscreen": m_project.isFullscreen,
			"width": m_project.width,
			"height": m_project.height,
			"tabs": m_project.tabs
		};
	}

	function createFile( file, path, content, callback ) {
		let fileId = ( ++m_project.lastFileId ) + "";
		file.id = fileId;
		file.path = path;
		if( !file.fullname ) {
			file.fullname = file.name + file.extension;
		}
		file.fullpath = file.path + "/" + file.fullname;
		file.isChanged = true;
		file.isActive = true;
		if( file.type === FILE_TYPE_FOLDER ) {
			file.size = 0;
		} else {
			file.size = g_util.getByteSize( content );
		}
		m_filesContent[ fileId ] = content;
		m_project.files[ fileId ] = file;
		addFileToFolder( getFileByFullpath( file.path ).id, fileId );

		// Save file and project
		saveFile( file.id, content, callback );
		saveProject();
	}

	function createFileFromPath( filePath, fileData, content ) {
		var parts, name, i, temp, path;

		if( typeof filePath !== "string" ) {
			return "Invalid Filename";
		}

		fileData.path = filePath;
		path = "";

		// Create the folders
		parts = filePath.split( "/" );
		for( i = 0; i < parts.length; i++ ) {
			if( parts[ i ] === "" ) {
				continue;
			}
			name = parts[ i ];
			if( name === ROOT_NAME ) {
				path = name;
			} else {
				path += "/" + name;	
			}

			// Check if part is a folderName
			if( i !== parts.length - 1 ) {
	
				// If it's a new folder then create it
				if( ! getFileByFullpath( path ) ) {
	
					// Create the folder file
					temp = {
						"name": name,
						"fullname": name,
						"extension": "",
						"type": FILE_TYPE_FOLDER
					};
					createFile( temp, path.substring( 0, path.lastIndexOf( "/" ) ), [] );
				}
			} else {
	
				// Set the file name part to the file data
				fileData.name = name;
			}
		}

		// Create the file
		createFile( fileData, filePath.substring( 0, filePath.lastIndexOf( "/" ) ), content );

		return fileData;
	}

	function deleteFile( path, callback ) {
		let file = getFileByFullpath( path );
		if( !file ) {
			return false;
		}
		let parent = getFileByFullpath( file.path );
		if( !parent ) {
			return false;
		}
		if( file.type === FILE_TYPE_FOLDER ) {
			let tempFolder = getFilesFromFolder( file.id );
			for( let i = 0; i < tempFolder.length; i++ ) {
				deleteFile( tempFolder[ i ].fullpath, callback );
			}
		}

		// Clean up editor
		g_main.closeEditorModel( file );

		// Delete the file
		removeFileFromFolder( parent.id, file.id, callback );
		delete m_project.files[ file.id ];
		delete m_project.fileLookup[ file.fullpath ];
		delete m_filesContent[ file.id ];

		// Remove save file and save project
		let promise = g_myIndexDB.removeItem( getFileStoreName( file.id ) );
		promise.then( function () {
			if( typeof callback === "function" ) {
				callback();
			}
		} );
		saveProject();
	}

	function moveFile( pathSrc, pathDest ) {
		let file = pathSrc;
		if( typeof pathSrc === "string" ) {
			file = getFileByFullpath( pathSrc );
		}
		if( !file ) {
			return "Source file not found.";
		}
		let parent = getFileByFullpath( file.path );
		if( !parent ) {
			return "Source folder not found.";
		}
		let newParent = getFileByFullpath( pathDest );
		if( !newParent ) {
			return "Destination folder not found.";
		}
		if( isSubfolder( newParent, file ) ) {
			return "Cannot move a folder into itself.";
		}
		let conflict = getFileByFullpath( pathDest + "/" + file.fullname );
		if( conflict ) {
			return "A file already exists in the destination folder with same name.";
		}

		// Move the file
		removeFileFromFolder( parent.id, file.id );

		// Update the files new path
		if( newParent.path === "" ) {
			file.path = newParent.fullname;
		} else {
			file.path = newParent.path + "/" + newParent.fullname;
		}
		file.fullpath = file.path + "/" + file.fullname;
		addFileToFolder( newParent.id, file.id );
		file.isChanged = true;

		if( file.type === FILE_TYPE_FOLDER ) {
			repathFolder( file );
		}

		// Save the project
		saveProject();

		return true;
	}

	function isSubfolder( baseFolder, folder ) {
		if( baseFolder.id === folder.id ) {
			return true;
		} else if( folder.type !== FILE_TYPE_FOLDER ) {
			return false;
		}
		let folderContent = getFilesFromFolder( folder.id );
		for( let i = 0; i < folderContent.length; i++ ) {
			if(
				folderContent[ i ].type === FILE_TYPE_FOLDER &&
				isSubfolder( baseFolder, folderContent[ i ] )
			) {
				return true;
			}
		}
		return false;
	}

	function repathFolder( folder ) {
		let path = folder.path + "/" + folder.fullname;
		let folderContent = getFilesFromFolder( folder.id );
		for( let i = 0; i < folderContent.length; i++ ) {
			folderContent[ i ].path = path;
			folderContent[ i ].isChanged = true;
			if( folderContent[ i ].type === FILE_TYPE_FOLDER ) {
				repathFolder( folderContent[ i ] );
			}
		}
	}

	function saveFile( id, content, callback ) {
		let promise = g_myIndexDB.setItem( getFileStoreName( id ), content );
		promise.then( function () {
			if( typeof callback === "function" ) {
				callback();
			}
		} );
	}

	function saveProject() {
		clearTimeout( m_saveTimeout );
		m_saveTimeout = setTimeout( function () {
			g_myIndexDB.setItem( "projectData", m_project );
		} );
	}

	function getFilesForUpload( isRecentChangesOnly ) {
		function cloneFiles( item, clone ) {
			if( item.isActive === false ) {
				return false;
			}
			clone.name = item.name;
			clone.fullname = item.fullname
			clone.type = item.type;
			clone.path = item.path;
			clone.extension = item.extension;

			if( item.type === FILE_TYPE_FOLDER ) {
				clone.content = [];
				let itemContent = getFilesFromFolder( item.id );
				for( let i = 0; i < itemContent.length; i++ ) {
					let cloneItem = {};
					if( cloneFiles( itemContent[ i ], cloneItem ) ) {
						clone.content.push( cloneItem );
					}
				}
			} else {
				if( isRecentChangesOnly ) {
					if( item.isChanged ) {
						if( item.type === FILE_TYPE_SCRIPT ) {
							clone.content = btoa( getFileContentById( item.id ) );
						} else {
							clone.content = getFileContentById( item.id );
						}
					} else {
						isFullProject = false;
					}
				} else {
					if( item.type === FILE_TYPE_SCRIPT ) {
						clone.content = btoa( getFileContentById( item.id ) );
					} else {
						clone.content = getFileContentById( item.id );
					}
				}
			}

			return true;
		}

		let filesClone = {};
		let isFullProject = true;
		cloneFiles( getFileById( 0 ), filesClone );

		return { "files": filesClone, "isFullProject": isFullProject };
	}

	function resetFilesChanged() {
		Object.entries( m_project.files ).forEach( entry => {
			m_project.files[ entry[ 0 ] ].isChanged = false;
		} );
	}

} )();
