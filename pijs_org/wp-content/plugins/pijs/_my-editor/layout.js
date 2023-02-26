"use strict";
var g_layout = ( function ( $ ) {
	const CURSOR_WIDTH = 0;
	const MIN_WIDTH = 300;
	const START_FILE_VIEWER_WIDTH = 375;
	let m_keys = {};
	let m_$dragItem;
	let m_lastMouse = null;
	let m_resizeElementWidth;
	let m_leftElement;
	let m_rightElement;

	init();
	return {
		"createHorizontalResize": createHorizontalResize,
		"createTabsElement": createTabsElement,
		"createMenu": createMenu,
		"createPopup": createPopup,
		"setDragItem": setDragItem,
		"initItemDrop": initItemDrop
	};

	function createHorizontalResize( leftElement, resizeElement, rightElement ) {
		resizeElement.addEventListener( "mousedown", mouseDown );
		m_leftElement = leftElement;
		m_rightElement = rightElement;
		leftElement.parentElement.addEventListener( "mousemove", mouseMove );
		window.addEventListener( "mouseup", mouseUp );

		let isMouseDown = false;
		let oldCursor;
		m_resizeElementWidth = resizeElement.getBoundingClientRect().width;
		let resizeMiddlePosition = m_resizeElementWidth / 2;
		function mouseDown() {
			isMouseDown = true;
			oldCursor = leftElement.style.cursor;
			leftElement.parentElement.style.cursor = "e-resize";
		}
	
		function mouseMove( e ) {
			if( isMouseDown ) {
				let leftElementWidth = e.pageX - resizeMiddlePosition - CURSOR_WIDTH;
				updateScrollWindow( leftElementWidth );
			}
		}
	
		function mouseUp() {
			isMouseDown = false;
			leftElement.parentElement.style.cursor = oldCursor;
		}
	}

	function updateScrollWindow( leftElementWidth ) {
		if( leftElementWidth < MIN_WIDTH ) {
			leftElementWidth = MIN_WIDTH;
		}
		m_leftElement.style.width = leftElementWidth + "px";
		m_rightElement.style.width = "calc(100% - " + ( leftElementWidth + m_resizeElementWidth ) + "px)";
		resizeMain();
	}

	function createTabsElement( tabsElement, tabSelected ) {
		let f_tabDrag = null;
		let f_tabsContainer = tabsElement;
		let $tabsElement = $( tabsElement );
		let f_tabUnderMouse = null;
		let f_closeAllTabsButton = null;
		let f_tabs = {};

		$tabsElement.on( "click", "input[type='button']", closeTabButtonClicked );
		$tabsElement.on( "mousedown", ".tab", mousedownTabs );
		$( ".main-editor-tabs" ).on( "mousemove", mousemoveTabs );
		window.addEventListener( "mouseup", mouseupWindow );
		window.addEventListener( "blur", mouseupWindow );

		function closeTabButtonClicked() {
			if( this === f_closeAllTabsButton ) {
				f_tabsContainer.querySelectorAll( ".tab" ).forEach( ( tab ) => {
					closeTab( tab.dataset.fileId );
				} )
			} else {
				let tab = this.parentElement;
				closeTab( tab.dataset.fileId );
			}
		}

		function mousedownTabs( e ) {
			let over = document.elementFromPoint( e.pageX, e.pageY );
			if( over && over.type === "button" ) {
				return;
			}
			f_tabDrag = this;
			if( f_tabDrag ) {
				tabSelected( f_tabDrag );
				saveTabs();
			} else {
				f_tabDrag = null;
			}
		}
	
		function mousemoveTabs( e ) {
			if( f_tabDrag ) {
				if( f_closeAllTabsButton ) {
					f_closeAllTabsButton.style.display = "none";
				}
				let $tabUnderMouse = $( 
					document.elementFromPoint( e.pageX, e.pageY )
				).closest( ".tab" );
				if( $tabUnderMouse.length > 0 ) {
					f_tabUnderMouse = $tabUnderMouse.get( 0 );
				} else {
					f_tabUnderMouse = null;
				}
				if( f_tabUnderMouse && f_tabUnderMouse !== f_tabDrag ) {
					let tabUnderMouseRect = f_tabUnderMouse.getBoundingClientRect();
					let tabDragRect = f_tabDrag.getBoundingClientRect();
					if( tabDragRect.top === tabUnderMouseRect.top ) {
						if( tabDragRect.left > tabUnderMouseRect.right ) {
							f_tabUnderMouse.parentElement.insertBefore( f_tabDrag, f_tabUnderMouse );
						} else {
							f_tabUnderMouse.parentElement.insertBefore( f_tabUnderMouse, f_tabDrag );
						}
					} else {
						if( tabDragRect.top > tabUnderMouseRect.top ) {
							f_tabUnderMouse.parentElement.insertBefore( f_tabDrag, f_tabUnderMouse );
						} else {
							f_tabUnderMouse.parentElement.insertBefore( f_tabUnderMouse, f_tabDrag );
						}
					}
					saveTabs();
				} else if( f_tabUnderMouse === null ) {
					if( f_closeAllTabsButton ) {
						f_tabsContainer.insertBefore( f_tabDrag, f_closeAllTabsButton );
					} else {
						f_tabDrag.parentElement.appendChild( f_tabDrag );
					}
					saveTabs();
				}
			}
		}
	
		function mouseupWindow() {
			f_tabDrag = null;
			f_tabUnderMouse = null;
			if( f_closeAllTabsButton ) {
				f_closeAllTabsButton.style.display = "";
			}
		}

		function createTab( tabData, noNewTabs ) {
			let existingTab = f_tabsContainer.querySelector( ".tab-" + tabData.id );
			let isTabAlreadyOpen = false;
			if( existingTab ) {
				g_util.selectItem( existingTab, "selected-tab" );
				isTabAlreadyOpen = true;
			} else if( !noNewTabs ) {
				let newTab = document.createElement( "div" );
				let tabTitle = document.createElement( "span" );
				let tabClose = document.createElement( "input" );
				tabClose.type = "button";
				tabClose.value = "x";
				tabClose.className = "close-button";
				newTab.append( tabTitle );
				newTab.append( tabClose );
				newTab.className = "tab tab-" + tabData.id + " disable-select";
				tabTitle.innerText = tabData.name;
				newTab.dataset.fileId = tabData.id;
				if( f_closeAllTabsButton ) {
					f_tabsContainer.insertBefore( newTab, f_closeAllTabsButton );
				} else {
					f_tabsContainer.append( newTab );
					if( f_tabsContainer.querySelectorAll( ".tab" ).length > 3 ) {
						f_closeAllTabsButton = document.createElement( "input" );
						f_closeAllTabsButton.type = "button";
						f_closeAllTabsButton.classList.add( "btn-retro" );
						f_closeAllTabsButton.classList.add( "btn-8-14" );
						f_closeAllTabsButton.value = "Close Tabs";
						f_tabsContainer.appendChild( f_closeAllTabsButton );
					}
				}

				g_util.selectItem( newTab, "selected-tab" );
				resizeMain();
				f_tabs[ tabData.id ] = newTab;
			}
			saveTabs();
			return isTabAlreadyOpen;
		}

		function closeTab( fileId ) {
			let tab = f_tabs[ fileId ];

			if( !tab ) {
				return;
			}

			// If selected tab then find a new tab to open
			if( tab.classList.contains( "selected-tab" ) ) {
				let nearestTab;
				if( tab.previousElementSibling ) {
					nearestTab = tab.previousElementSibling;
				} else {
					nearestTab = tab.nextElementSibling;
				}
				if( nearestTab ) {
					tabSelected( nearestTab );
				} else {
					g_editor.setModel( null );
					$( ".main-image-viewer" ).html( "" ).hide();
					$( ".main-editor-body" ).show();
				}
			}
			if( tab.parentElement ) {
				tab.parentElement.removeChild( tab );
				if( f_closeAllTabsButton && f_tabsContainer.querySelectorAll( ".tab" ).length <= 3 ) {
					f_closeAllTabsButton.parentElement.removeChild( f_closeAllTabsButton );
					f_closeAllTabsButton = null;
				}
				resizeMain();
				delete f_tabs[ fileId ];
			}
			saveTabs();
		}

		function refreshTabs() {
			let tabs = f_tabsContainer.querySelectorAll( ".tab" );
			for( let i = 0; i < tabs.length; i++ ) {
				let name = g_file.getFileById( tabs[ i ].dataset.fileId ).fullname;
				tabs[ i ].querySelector( "span" ).innerText = g_main.getShortName( name );
			}
		}

		function saveTabs() {
			let tabsData = [];
			let tabs = f_tabsContainer.querySelectorAll( ".tab" );
			for( let i = 0; i < tabs.length; i++ ) {
				tabsData.push( {
					"fileId": tabs[ i ].dataset.fileId,
					"isSelected": tabs[ i ].classList.contains( "selected-tab" )
				} );
			}
			g_file.setProjectSettings( "tabs", tabsData );
		}

		return {
			"createTab": createTab,
			"closeTab": closeTab,
			"refreshTabs": refreshTabs
		};
	}

	function resizeMain() {
		//let height = $( ".main-editor-tabs" ).height() + 4;

		let height = $( ".main-editor-tabs" ).get( 0 ).getBoundingClientRect().bottom;
		$( ".main-image-viewer" ).css( "height", "calc(100% - " + height + "px)" );
		$( ".main-editor-body" ).css( "height", "calc(100% - " + height + "px)" );
		g_editor.resize();
	}

	function createMenu( items, menuContainer ) {
		let submenu = document.createElement( "div" );
		let isOpenThisThread = false;
		let isMenuOpen = false;
		submenu.classList.add( "submenu" );
		submenu.style.display = "none";
		document.body.appendChild( submenu );
		window.addEventListener( "mousedown", mouseDown );
		window.addEventListener( "blur", blur );
		window.addEventListener( "keydown", keyDown );

		for( let i = 0; i < items.length; i++ ) {
			let item = items[ i ];
			let element = document.createElement( "span" );
			element.classList.add( "menu-item" );
			element.innerText = item.name;
			element.dataset.index = i;
			element.addEventListener( "mousedown", openSubMenu );
			menuContainer.appendChild( element );

			for( let j = 0; j < item.subItems.length; j++ ) {
				if( item.subItems[ j ].keybindingsLocal ) {
					m_keys[ item.subItems[ j ].keybindingsLocal.key ] = item.subItems[ j ];
				}
				if( item.subItems[ j ].keybindingsMonaco ) {
					g_editor.addCommand( item.subItems[ j ].name, item.subItems[ j ].command, item.subItems[ j ].keybindingsMonaco );
				}
			}
		}

		function openSubMenu() {
			submenu.innerText = "";
			let index = this.dataset.index;
			let item = items[ index ];
			for( let i = 0; i < item.subItems.length; i++ ) {
				let subItem = item.subItems[ i ];
				let submenuItem = document.createElement( "div" );
				submenuItem.innerHTML = "<span class='subitem-title'>" + subItem.name + "</span>" +
					"<span class='shortcut'>" + subItem.shortcutName + "</span>";
				submenuItem.classList.add( "submenu-item" );
				submenuItem.addEventListener( "click", function() {
					subItem.command();
					submenu.style.display = "none";
					isMenuOpen = false;
				} );
				submenuItem.title = subItem.title;
				submenu.appendChild( submenuItem );
			}
			let rect = this.getBoundingClientRect();
			submenu.style.top = ( rect.bottom - 2 ) + "px";
			submenu.style.left = rect.left + "px";
			submenu.style.display = "";
			isOpenThisThread = true;
			isMenuOpen = true;
			setTimeout( function () {
				isOpenThisThread = false;
			}, 0 );
		}

		function mouseDown( e ) {
			if( isMenuOpen && !isOpenThisThread ) {
				let $over = $( document.elementFromPoint( e.pageX, e.pageY ) ).closest( ".submenu-item" );
				if( $over.length === 0 ) {
					submenu.style.display = "none";
					isMenuOpen = false;
				}
			}
		}

		function blur() {
			submenu.style.display = "none";
			isMenuOpen = false;
		}

		function keyDown( e ) {
			// console.log( e );
			if( $( ".popup" ).length > 0 ) {
				return;
			}
			let item = m_keys[ e.key.toUpperCase() ];
			if( item ) {
				if( e.ctrlKey === item.keybindingsLocal.ctrlKey ) {
					item.command();
					e.preventDefault();
				}
			}
		}
	}

	function createPopup( title, contentElement, options ) {
		if( !options ) {
			options = {};
		}
		let okCommand = options.okCommand;
		let cancelCommand = options.cancelCommand;
		let popup = document.createElement( "div" );
		let okText = options.okText;

		if( title === "" ) {
			title = "&nbsp;";
		}
		popup.className = "popup";
		popup.innerHTML = "<div class='popup-title'>" +
			"<span>" + title + "</span>" +
			"<input class='popup-close close-button' type='button' value='x' />" +
			"</div>";
		if( typeof contentElement === "string" ) {
			let temp = contentElement;
			contentElement = document.createElement( "div" );
			contentElement.innerHTML = temp;
		}
		popup.appendChild( contentElement );

		let footer = document.createElement( "div" );
		footer.className = "popup-footer";
		if( options.extraButtons ) {
			for( let i = options.extraButtons.length - 1; i >= 0; i-- ) {
				footer.appendChild( options.extraButtons[ i ] );
			}
		}
		let okButton = document.createElement( "input" );
		okButton.classList.add( "btn-retro" );
		okButton.classList.add( "btn-8-14" );
		okButton.classList.add( "popup-ok" );
		okButton.type = "button";
		okButton.value = "Ok";
		if( okText ) {
			okButton.value = okText;
		}
		footer.appendChild( okButton );
		if( cancelCommand ) {
			let cancelButton = document.createElement( "input" );
			cancelButton.classList.add( "btn-retro" );
			cancelButton.classList.add( "btn-8-14" );
			cancelButton.classList.add( "popup-close" );
			cancelButton.type = "button";
			cancelButton.value = "Cancel";
			footer.appendChild( cancelButton );
		}
		popup.appendChild( footer );
		let popupOverlay = document.createElement( "div" );
		popupOverlay.classList.add( "popup-overlay" );
		popupOverlay.appendChild( popup );
		document.body.appendChild( popupOverlay );
		popup.querySelectorAll( ".popup-close" ).forEach( function ( element ) {
			element.addEventListener( "click", closePopup );
		} );
		popup.querySelectorAll( ".popup-ok" ).forEach( function ( element ) {
			element.addEventListener( "click", okPopup );
		} );

		function okPopup() {
			let success = true;
			if( okCommand ) {
				success = okCommand();
			}
			if( success ) {
				document.body.removeChild( popupOverlay );
			}
		}

		function closePopup() {
			if( cancelCommand ) {
				cancelCommand();
			}
			document.body.removeChild( popupOverlay );
		}
	}

	function init() {
		initializeDragDrop();
		window.addEventListener( "resize", resizeMain );
		setTimeout( function () {
			updateScrollWindow( START_FILE_VIEWER_WIDTH );
		}, 1000 );
	}

	function initializeDragDrop() {
		var dragEvents, i;

		// Prevent default behavior on drag events
		function noDrop( e ) {
			e.preventDefault();
			e.stopPropagation();
		}
		dragEvents = [
			"drag", "dragstart", "dragend", "dragover",
			"dragenter", "dragleave", "drop"
		];
		for( i = 0; i < dragEvents.length; i++ ) {
			document.body.addEventListener( dragEvents[ i ], noDrop );
		}

		// Change background on drag over
		function dragOver( e ) {
			let popupOverlay = document.querySelector( ".popup-overlay" );
			if( popupOverlay ) {
				popupOverlay.parentElement.removeChild( popupOverlay );
			}
			document.getElementById( "dragOverPopup" ).style.display = "block";
		}
		dragEvents = [ "dragover", "dragenter" ];
		for( i = 0; i < dragEvents.length; i++ ) {
			document.body.addEventListener( dragEvents[ i ], dragOver );
		}

		// Change background on drag out
		function dragOut( e ) {
			document.getElementById( "dragOverPopup" ).style.display = "none";
		}
		dragEvents = [ "dragleave", "dragend", "drop" ];
		for( i = 0; i < dragEvents.length; i++ ) {
			document.getElementById( "dragOverPopup" )
				.addEventListener( dragEvents[ i ], dragOut );
		}
		document.getElementById( "dragOverPopup" )
			.addEventListener( "drop", droppedFile );

		// Dropped File
		function droppedFile( e ) {
			g_main.createUploadDialog( e.dataTransfer.files );
		}
	}

	function setDragItem( item ) {
		$( item ).on( "mousedown", function ( e ) {
			setTimeout( function () {
				if( m_$dragItem ) {
					m_$dragItem.remove();
				}
				let selectedFiles = g_main.getSelectedFiles();
				let containsFolder = false;
				selectedFiles.forEach( ( file ) => {
					if( file.type === "folder" ) {
						containsFolder = true;
					}
				} )
				let msg = selectedFiles.length;
				if( containsFolder ) {
					msg += "*";
				}
				m_$dragItem = $( "<div class='dragFile'> " + msg + " </div>" );
				//selectedElements.forEach( function( selectedElement ) {
				//	m_$dragItem.find( "ul" ).first().append( $( selectedElement ).clone() );
				//} );
				//m_$dragItem.html( item.innerHTML );
				m_$dragItem.data( "files", selectedFiles );
				$( document.body ).append( m_$dragItem );
				let width = m_$dragItem.width();
				let height = m_$dragItem.height();
				let size = 0;
				if( width > height ) {
					size = width;
				} else {
					size = height;
				}
				m_$dragItem.css( "width", size );
				m_$dragItem.css( "height", size );
				m_$dragItem.css( "line-height", size + "px" );
				m_$dragItem.css( "left", e.pageX + size * 0.75 );
				m_$dragItem.css( "top", e.pageY + size * 0.75 );
				m_$dragItem.hide();
			} );
		} );
	}

	function initItemDrop( cmd ) {
		let f_$mouseOver = null;

		$( document.body ).on( "mousemove", function ( e ) {
			if( m_$dragItem ) {
				m_$dragItem.show();
				let offset = m_$dragItem.offset();
				let dx = e.pageX - m_lastMouse.x;
				let dy = e.pageY - m_lastMouse.y;
				m_$dragItem.css( "left", offset.left + dx );
				m_$dragItem.css( "top", offset.top + dy );
				m_$dragItem.hide();
				let $hover = $( document.elementFromPoint( e.pageX, e.pageY ) );
				m_$dragItem.show();
				let $mouseOver = $hover.closest( "[data-file-type='folder']" );
				$( ".drag-over-folder" ).removeClass( "drag-over-folder" );
				f_$mouseOver = null;
				if( $mouseOver.length > 0 ) {
					$mouseOver.addClass( "drag-over-folder" );
					f_$mouseOver = $mouseOver;
				} else {
					let $root = $hover.closest( ".file-viewer" );
					if( $root.length > 0 ) {
						$root = $( ".file-viewer > ul" );
						$root.addClass( "drag-over-folder" );
						f_$mouseOver = $root;
					}
				}
			} else {
				$( ".drag-over-folder" ).removeClass( "drag-over-folder" );
			}

			m_lastMouse = {
				"x": e.pageX,
				"y": e.pageY
			};
		} );
		$( window ).on( "mouseup", function () {
			if( m_$dragItem ) {
				if( f_$mouseOver !== null ) {
					cmd( m_$dragItem.data( "files" ), f_$mouseOver );
				}
				m_$dragItem.remove();
				f_$mouseOver = null;
				$( ".drag-over-folder" ).removeClass( "drag-over-folder" );
			}
			m_$dragItem = null;
		} );
		$( window ).on( "blur", function () {
			if( m_$dragItem ) {
				m_$dragItem.remove();
				f_$mouseOver = null;
				$( ".drag-over-folder" ).removeClass( "drag-over-folder" );
			}
			m_$dragItem = null;
		} );
	}

} )( jQuery );
