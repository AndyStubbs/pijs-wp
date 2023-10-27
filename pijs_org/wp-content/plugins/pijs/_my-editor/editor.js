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
		g_editor.createEditor( document.querySelector( ".main-editor-body" ) );
		g_main.init();
	} );
} );

var g_editor = ( function () {
	let editors = [];
	let activeEditor;

	return {
		"init": init,
		"createEditor": createEditor,
		"resize": resize,
		"createModel": createModel,
		"setModel": setModel,
		"addCommand": addCommand,
		"saveViewState": saveViewState,
		"restoreViewState": restoreViewState
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

		monaco.languages.typescript.javascriptDefaults.addExtraLib( piExtra.getMap(), "filename/fields.d.ts" );
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

	function saveViewState() {
		return activeEditor.saveViewState();
	}

	function restoreViewState( state ) {
		activeEditor.restoreViewState( state );
	}

	function resize() {
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
} )();
