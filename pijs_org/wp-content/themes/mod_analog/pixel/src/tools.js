/*
tools.js
*/

"use strict";

// Tool Script Container
var toolScript = ( function () {

	// Add a tool
	function addTool( tool ) {
		pixel.tools.push( tool );
	}

	// Initialize tool script
	function initialize() {
		setupOptions();
		createToolbar();

		// Add this event in case mouse up occurs outside of canvas
		document.body.addEventListener( "mouseup", function () {
			penUp( {
				"x": -1,
				"y": -1,
				"buttons": 0
			} );
		} );
	}

	// Add button event handlers
	function setupOptions() {
		var elements, i;

		// Number options
		elements = document
			.querySelectorAll( "#optionsTemplates input[type=number]" );

		for( i = 0; i < elements.length; i++ ) {
			addNumberEvent( elements[ i ] );
		}

		// Click options
		elements = document
			.querySelectorAll( "#optionsTemplates .clickOption" );

		for( i = 0; i < elements.length; i++ ) {
			addClickOptionEvent( elements[ i ] );
		}

		// Button options
		elements = document
			.querySelectorAll( "#optionsTemplates .buttonOption" );

		for( i = 0; i < elements.length; i++ ) {
			addButtonEvent( elements[ i ] );
		}
	}

	function addNumberEvent( element ) {
		element.addEventListener( "change",
			function () {
				pixel.activeTool.updateOption(
					element.id, parseInt( this.value )
				);
		} );
	}

	function addClickOptionEvent( element ) {
		element.addEventListener( "click",
			function () {
				pixel.selectItem(
					element,
					"selected-clickOption",
					"#" + element.parentElement.id + " .selected-clickOption"
				);
				pixel.activeTool.updateOption(
					element.parentElement.id, element.id
				);
		} );
	}

	function addButtonEvent( element ) {
		element.addEventListener( "click",
			function () {
				pixel.activeTool.updateOption(
					element.parentElement.id, element.id
				);
		} );
	}

	function updateOption( id, value ) {
		var element;

		element = document.getElementById( id );
		if( element.type === "number" ) {
			element.value = value;
		} else if( element.className.indexOf( "clickOption" ) > -1 ) {
			pixel.selectItem(
				element,
				"selected-clickOption",
				"#" + element.parentElement.id + " .selected-clickOption"
			);
		}
	}

	// Create Toolbar
	function createToolbar() {
		var toolbar, i, button;

		toolbar = document.getElementById( "tools" );
		for( i = 0; i < pixel.tools.length; i++ ) {
			button = document.createElement( "div" );
			button.className = "tool-button";
			button.id = pixel.tools[ i ].name;
			toolbar.appendChild( button );

			pixel.tools[ i ].createTool( button );
			pixel.tools[ i ].button = button;
		}

		// Select the first tool
		pixel.tools[ 0 ].selectTool();
	}

	// Pen Down
	function penDown() {
		var activeLayer;

		// Control + Click = Zoom
		if( $.inkey( "Control" ) ) {
			activeLayer = pixel.activeLayer;
			zoomTool.penDown(
				activeLayer.$screen, pixel.mouse.pen,
				pixel.activePicture.$effects
			);
			return;
		}

		activeLayer = pixel.activeLayer;
		pixel.activeTool.penDown(
			activeLayer.$screen, pixel.mouse.pen, pixel.activePicture.$effects
		);
	}

	// Pen Up
	function penUp() {
		var activeLayer;

		activeLayer = pixel.activeLayer;
		pixel.activeTool.penUp(
			activeLayer.$screen, pixel.mouse.pen, pixel.activePicture.$effects
		);
	}

	// Pen Move
	function penMove() {
		var activeLayer;

		activeLayer = pixel.activeLayer;
		pixel.activeTool.penMove(
			activeLayer.$screen, pixel.mouse.pen, pixel.activePicture.$effects
		);
	}

	// Activate Tool
	function setActiveTool( tool, options, settings ) {
		var i, optionsbar, currentOptions, optionsTemplates, option,
			element;

		// Set the cursor for the tool
		document.getElementById( "grid" ).className = "cursor-" + tool.name;

		// Make sure this isn't the first time tool activated
		if( pixel.activeTool ) {

			if( pixel.activeTool.usesColors ) {
				pixel.lastDrawTool = pixel.activeTool;
			}

			// Deselect the last tool
			pixel.activeTool.deselectTool();

			// Clear the $temp canvas
			pixel.activePicture.$effects.cls();
			layerScript.refreshTemp();
			layerScript.drawLayers();

		} else {
			pixel.lastDrawTool = penTool;
		}

		// Set the active tool
		pixel.activeTool = tool;

		// Get the options
		optionsTemplates = document.getElementById( "optionsTemplates" );
		optionsbar = document.getElementById( "optionsbar" );
		currentOptions = optionsbar.querySelectorAll( ".option" );

		// Move the old options back to the template
		for( i = 0; i < currentOptions.length; i++ ) {
			optionsTemplates.appendChild( currentOptions[ i ] );
		}

		// Build the optionsbar with the new options
		for( i = 0; i < options.length; i++ ) {
			option = document.getElementById( options[ i ] );
			optionsbar.appendChild( option );
		}

		// Update the settings
		for( i in settings ) {
			option = document.querySelector( "#" + i );

			// Set value for click option
			if( option.className.indexOf( "clickOptionContainer" ) > -1 ) {
				element = option.querySelector( "#" + settings[ i ] );
				pixel.selectItem(
					element,
					"selected-clickOption",
					"#" + element.parentElement.id + " .selected-clickOption"
				);
			} else {

				// Set value for input option
				option.value = settings[ i ];
			}

		}

		// Select the tool button
		pixel.selectItem(
			tool.button, "selected-tool", "#tools .selected-tool"
		);

		pixel.updateStatusBar();
	}

	// Return API
	return {
		"addTool": addTool,
		"initialize": initialize,
		"setActiveTool": setActiveTool,
		"updateOption": updateOption,
		"penDown": penDown,
		"penMove": penMove,
		"penUp": penUp
	};

// End of file encapsulation
} )();
