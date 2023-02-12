"use strict";
/* global monaco */
/* global main */

require.config( { paths: {
	"vs": g_monacoPath + "/min/vs",
	"min-maps": g_monacoPath + "/min-maps"
} } );

require( [ "vs/editor/editor.main" ], function () {
	setTimeout( function () {
		g_editor.init();
		g_editor.createEditor( document.querySelector( ".main-editor-body" ) )
		g_editor.setModel( 
			g_editor.createModel( "$.screen(\"300x200\");\n$.print(\"Hello World\");", "javascript" )
		);
	} );
} );

var g_editor = ( function ( $ ) {
	let editors = [];
	let activeEditor;

	return {
		"init": init,
		"createEditor": createEditor,
		"resize": resize,
		"createModel": createModel,
		"setModel": setModel,
		"addCommand": addCommand,
		"getValue": getValue
	};

	function init() {

		monaco.editor.defineTheme( "myCustomTheme", {
			base: "vs-dark", // can also be vs-dark or hc-black
			inherit: true, // can also be false to completely replace the builtin rules
			rules: [
				{ "token": "comment", "foreground": "aeaeae", "fontStyle": "italic" },
				{ "token": "keyword", "foreground": "e28964" },
				{ "token": "string", "foreground": "65b042" },
				{ "token": "number", "foreground": "3387cc" },
				{ "token": "delimiter", "foreground": "cccc33" }
			],
			colors: {
				"editor.foreground": "#ffffff",
				//"editorCursor.foreground": "#8B0000"
			}
		} );

		monaco.languages.typescript.javascriptDefaults.addExtraLib( pi.getMap(), "filename/fields.d.ts" );
	}

	function createEditor( containerElement ) {
		activeEditor = monaco.editor.create( containerElement, {
			"model": null,
			"theme": "myCustomTheme",
			"language": "javascript",
			"fontSize": "20px",
			"fontFamily": "IBM_FONT_8_14, monospace",
			"bracketPairColorization.enabled": true,
			"useShadowDOM": false
		} );
		editors.push( activeEditor );
	}

	function createModel( code, language ) {
		return monaco.editor.createModel( code, language );
	}

	function setModel( model ) {
		activeEditor.setModel( model );
	}

	function resize() {
		let $mainEditorBody = $( ".main-editor-body" );

		$mainEditorBody.css( "height", "calc(100% - " + $mainEditorBody.offset().top + "px)" );
		for( let i = 0; i < editors.length; i++ ) {
			editors[ i ].layout();
		}
	}

	function addCommand( name, command, keybindings ) {
		activeEditor.addAction( {
			"id": name,
			"label": name,
			"keybindings": keybindings,
			"contextMenuGroupId": 'navigation',
			"contextMenuOrder": 1.5,
			"run": function( editor ) {
				//alert( name );
				command();
			}
		} );
	}

	function getValue() {
		return activeEditor.getModel().getValue();
	}

} )( jQuery );

( function ( $ ) {
	$( "#btn-run" ).on( "click", function () {
		$.ajax( {
			type: 'POST',
			url: g_ajaxUrl,
			data: {
				action: 'playground_run_program',
				code: btoa( g_editor.getValue() ),
			},
			success: function( response ) {
				if( response.success ) {
					let href = window.location.href;
					let base_url = "";
					if( href.indexOf( "localhost" ) === -1 ) {
						base_url = "https://www.pijs-run.org/";
					} else {
						base_url = "http://localhost/pijs-run.org/";
					}
					let windowSettings = "width=950, height=650 top=200,left=200";
					let w = window.open( base_url + "runs/" + response.project_id, "_blank", windowSettings );
					if( w ) {
						w.focus();
					}
				}
			},
		} );
	} );
	let $btnHelp = $( "#btn-help" );
	$btnHelp.on( "click", function () {
		if( $btnHelp.hasClass( "menu-opened" ) ) {
			$btnHelp.removeClass( "menu-opened" );
			$btnHelp.addClass( "menu-closed" );
		} else {
			$btnHelp.removeClass( "menu-closed" );
			$btnHelp.addClass( "menu-opened" );
		}
		$(".vertical-resize-bar").fadeToggle();
		$( ".help-menu").slideToggle( function () {
			g_editor.resize();
		} );
	} );

	createVerticalResize(
		$( ".help-menu" ).get( 0 ),
		$( ".vertical-resize-bar" ).get( 0 ),
		$( ".main-editor-body" ).get( 0 )
	);

	function createVerticalResize( topElement, resizeElement, bottomElement ) {
		const CURSOR_HEIGHT = 0;
		const MIN_HEIGHT = 50;

		resizeElement.addEventListener( "mousedown", mouseDown );
		topElement.parentElement.addEventListener( "mousemove", mouseMove );
		window.addEventListener( "mouseup", mouseUp );

		let isMouseDown = false;
		let oldCursor;
		let resizeElementHeight = resizeElement.getBoundingClientRect().height;
		let resizeMiddlePosition = resizeElementHeight / 2;

		function mouseDown() {
			isMouseDown = true;
			oldCursor = topElement.style.cursor;
			topElement.parentElement.style.cursor = "n-resize";
		}
	
		function mouseMove( e ) {
			if( isMouseDown ) {
				let topTop = topElement.getBoundingClientRect().top;
				let topElementHeight = e.pageY - topTop - resizeMiddlePosition - CURSOR_HEIGHT;
				updateScrollWindow( topElementHeight );
			}
		}
	
		function mouseUp() {
			isMouseDown = false;
			topElement.parentElement.style.cursor = oldCursor;
		}

		function updateScrollWindow( topElementHeight ) {
			if( topElementHeight < MIN_HEIGHT ) {
				topElementHeight = MIN_HEIGHT;
			}
			topElement.style.height = topElementHeight + "px";
			bottomElement.style.height = "calc(100% - " + ( topElementHeight + resizeElementHeight ) + "px)";
			g_editor.resize();
		}
	}

} )( jQuery );
