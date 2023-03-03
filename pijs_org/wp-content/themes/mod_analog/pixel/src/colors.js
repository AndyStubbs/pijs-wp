/*
colors.js
*/

"use strict";

// Color Script Container
var colorScript = ( function () {

	var m_color1, m_color2, m_defaultColors;

	m_defaultColors = [ 
		"#123456",
		"#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
		"#FF0000", "#D10000", "#A30000", "#740000", "#460000", "#00000000",
		"#FF0080", "#D6006B", "#AC0056", "#830042", "#59002D", "#00000000",
		"#800080", "#6B006B", "#560056", "#420042", "#2D002D", "#00000000",
		"#8000FF", "#6B00D6", "#5600AC", "#420083", "#2D0059", "#00000000",
		"#0000FF", "#0000D1", "#0000A3", "#000074", "#000046", "#00000000",
		"#00FFFF", "#00D1D1", "#00A3A3", "#007474", "#004646", "#00000000",
		"#00FF00", "#00D100", "#00A300", "#007400", "#004600", "#00000000",
		"#80FF00", "#6BD600", "#56AC00", "#428300", "#2D5900", "#00000000",
		"#FFFF00", "#D1D100", "#A3A300", "#747400", "#464600", "#00000000",
		"#FFAE42", "#D29037", "#A6722C", "#795422", "#4D3617", "#00000000",
		"#FF8000", "#D16900", "#A35300", "#743C00", "#462600", "#00000000",
		"#FF4000", "#D13500", "#A32A00", "#741E00", "#461300", "#00000000"
	];

	// Initialize Color Script
	function initialize() {
		initColors();
		createColorbar();
		initColorSlider();
		document.getElementById( "statusColor1" ).onclick = function () {
			selectColor(
				document.querySelector( ".sel-color-1" ), "sel-color-1"
			);
		};
		document.getElementById( "statusColor2" ).onclick = function () {
			selectColor(
				document.querySelector( ".sel-color-2" ), "sel-color-2"
			);
		};
		document.getElementById( "resetColorsButton" ).onclick = function () {
			setColors( m_defaultColors );
		};
	}

	// Initialize Colors
	function initColors() {
		$.setDefaultPal( m_defaultColors );

		// Remove the first color, this is because the first color in the
		// the default palette is the transparency color used by Pi.js
		// After setting the default palette we don't need it and
		// m_defaultColors is needed later if someone clicks reset colors
		// button
		m_defaultColors.splice( 0, 1 );
	}

	// Create color bar
	function createColorbar() {
		var colorbar, i, button, button2, colors, colorRow, rowCount, count,
			val;
		rowCount = 6;
		count = 0;
		colorbar = document.getElementById( "colorbar" );
		colors = $.getDefaultPal();
		colorRow = document.createElement( "div" );
		colorRow.className = "color-row";
		for( i = 1; i < colors.length; i++ ) {
			button = document.createElement( "div" );
			button2 = document.createElement( "div" );
			button.className = "color-button back-light";
			button2.style.backgroundColor = colors[ i ].s;
			button2.style.color = colors[ i ].s;
			button2.innerHTML = "&nbsp;";
			button.id = "color-" + i;
			button.addEventListener( "click", selectColorClick );
			button.addEventListener( "dblclick", changeColor );
			button.addEventListener( "contextmenu", onContextMenu );
			if( i === 1 ) {
				button2.innerHTML = "1";
				button2.style.color = "white";
				button.className += " sel-color-1 selected-color";
				m_color1 = colors[ i ];
			}
			if( i === 6 ) {
				button2.innerHTML = "2";
				button2.style.color = "black";
				button.className += " sel-color-2";
				m_color2 = colors[ i ];
			}
			button.appendChild( button2 );
			colorRow.appendChild( button );
			count += 1;
			if( count === rowCount ) {
				colorbar.appendChild( colorRow );
				colorRow = document.createElement( "div" );
				colorRow.className = "color-row";
				count = 0;
			}
		}
		if( count !== 0 ) {
			colorbar.appendChild( colorRow );
		}
	}

	// Init color slider
	function initColorSlider() {
		var slider, colorButton, colorParent, color, colorName;

		slider = document.querySelector( "#alpha-slider .slider" );
		slider.addEventListener( "input", function () {
			colorButton = document.querySelector( ".selected-color > div" );
			colorParent = colorButton.parentElement;
			color = $.util.convertToColor( colorButton.style.backgroundColor );
			color.a = parseInt( this.value );
			color = $.util.convertToColor( color );
			colorButton.style.backgroundColor = color.s;
			if( colorParent.className.indexOf( "sel-color-1" ) > -1 ) {
				colorName = "sel-color-1";
				m_color1 = color;
			}
			if( colorParent.className.indexOf( "sel-color-2" ) > -1 ) {
				colorName = "sel-color-2";
				m_color2 = color;
			}

			// Update the slider Text
			document.querySelector(
				"#alpha-slider .slider-span"
			).innerHTML = Math.round( ( color.a / 255 ) * 100 ) + "%";

			// If the active tool doesn't use colors then select the last
			// draw tool
			if( ! pixel.activeTool.usesColors ) {
				pixel.lastDrawTool.selectTool();
			}

			pixel.updateStatusBar();
		} );
	}

	// Change color value
	function changeColor( e ) {
		var input, button;

		button = this.querySelector( "div" );
		input = document.createElement( "input" );
		input.setAttribute( "type", "color" );
		input.value = $.util.colorStringToHex( button.style.backgroundColor );
		document.getElementById( "modalPopup" ).style.display = "block";
		document.getElementById( "modalPopup" ).addEventListener(
			"mousedown", function () {
				document.getElementById( "modalPopup" ).style.display = "none";
			}, {
				"once": true
		} );
		input.onchange = function () {
			button.style.backgroundColor = input.value;
			button.click();
		};
		input.click();
	}

	// Selected color click
	function selectColorClick( e ) {
		selectColor( this, "sel-color-1" );
	}

	function onContextMenu( e ) {
		e.preventDefault();
		selectColor( this, "sel-color-2" );
		return false;
	}

	// Select a color
	function selectColor( colorButton, colorName ) {
		var color, slider, selColorDiv, selColorDiv2, elem, elem2,
			oppColorName, colorText, oppColorText, colorButton2;

		if( colorName === undefined ) {
			colorName = "sel-color-1";
		}

		if( colorName === "sel-color-1" ) {
			colorText = "1";
			oppColorText = "2";
			oppColorName = "sel-color-2";
		} else {
			colorText = "2";
			oppColorText = "1";
			oppColorName = "sel-color-1";
		}

		colorButton2 = colorButton.querySelector( "div" );
		if( colorButton2 == null ) {
			colorButton2 = colorButton;
		}
	
		// Get the color of the button
		color = $.util.convertToColor(
			colorButton2.style.backgroundColor
		);

		// Remove the tag last element with the selected-color tag
		elem = document.querySelector( ".selected-color" );
		elem.className = elem.className.replace( "selected-color", "" ).trim();

		// Remove the tag of last element with the colorName tag
		elem = document.querySelector( "." + colorName );
		elem.className = elem.className.replace( colorName, "" ).trim();
		elem2 = elem.querySelector( "div" );
		if( elem2 == null ) {
			elem2 = elem;
		}

		// Check if it was both colors
		if( elem.className.indexOf( "sel-color" ) === -1 ) {
			elem2.style.color = elem2.style.backgroundColor;
			elem2.innerHTML = "&nbsp;";
		} else {
			elem2.innerHTML = oppColorText;
		}

		// update the class name of the color button
		colorButton.className += " " + colorName + " selected-color";

		// Add the text of the button to match which color button used
		if( colorButton.className.indexOf( oppColorName ) === -1 ) {
			colorButton2.innerHTML = colorText;
		} else {
			colorButton2.innerHTML = "3";
		}

		// Update the slider values
		slider = document.querySelector( "#alpha-slider .slider" );
		if( color.r + color.b + color.g < 550 ) {
			slider.style.backgroundImage = "linear-gradient(to right, white, " +
				color.s2 + ")";
		} else {
			slider.style.backgroundImage = "linear-gradient(to left, black, " +
				color.s2 + ")";
		}
		slider.style.setProperty( "--SliderColor", color.s2 );
		slider.value = color.a;

		// Update the slider Text
		document.querySelector(
			"#alpha-slider .slider-span"
		).innerHTML = Math.round( ( color.a / 255 ) * 100 ) + "%";

		// Update the color of the button
		selColorDiv = document.querySelector( ".selected-color" );
		if( selColorDiv ) {
			selColorDiv2 = selColorDiv.querySelector( "div" );
			if( selColorDiv2 == null ) {
				selColorDiv2 = selColorDiv;
			}
			selColorDiv2.style.color = selColorDiv2.style.backgroundColor;
		}

		// Set the background color of the button
		if( color.r + color.b + color.g < 550 ) {
			colorButton2.style.color = "white";
		} else {
			colorButton2.style.color = "black";
		}

		// Set the active color for drawing
		if( colorName === "sel-color-1" ) {
			m_color1 = color;
		} else {
			m_color2 = color;
		}

		// If the active tool doesn't use colors then select the last draw tool
		if( ! pixel.activeTool.usesColors ) {
			pixel.lastDrawTool.selectTool();
		}

		if( $.util.isFunction( pixel.activeTool.colorChanged ) ) {
			pixel.activeTool.colorChanged();
		}
		pixel.updateStatusBar();
	}

	function getColor() {
		return m_color1;
	}

	function getColor2() {
		return m_color2;
	}

	function getColors() {
		var colorButtons, colors, i;

		colorButtons = document.querySelectorAll(
			"#colorbar .color-button > div"
		);
		colors = [];
		for( i = 0; i < colorButtons.length; i++ ) {
			colors.push(
				$.util.convertToColor(
					colorButtons[ i ].style.backgroundColor
				).s
			);
		}

		return colors;
	}

	function setColors( newColors ) {
		var colorButtons, i;

		colorButtons = document.querySelectorAll(
			"#colorbar .color-button > div"
		);
		for( i = 0; i < colorButtons.length; i++ ) {
			if( i < newColors.length ) {
				colorButtons[ i ].style.backgroundColor = newColors[ i ];
			}
		}
		m_color1 = $.util.convertToColor(
			document.querySelector( ".sel-color-1 > div" ).style.backgroundColor
		);
		m_color2 = $.util.convertToColor(
			document.querySelector( ".sel-color-2 > div" ).style.backgroundColor
		);
	}

	function setColor( newColor, button ) {
		var colorButtonClass, colorButton;

		if( button === 1 ) {
			colorButtonClass = "sel-color-1";
			
		} else {
			colorButtonClass = "sel-color-2";
		}
		colorButton = findColor( newColor );
		if( ! colorButton ) {
			colorButton = findBlankCustomColor();
		}
		colorButton.querySelector( "div" ).style.backgroundColor = newColor.s;
		selectColor( colorButton, colorButtonClass );
	}

	function findBlankCustomColor() {
		var colorButtons, i, color;
		colorButtons = document.querySelectorAll(
			"#colorbar .color-button > div"
		);
		for( i = colorButtons.length - 1; i >= 0; i-- ) {
			color = $.util.convertToColor(
				colorButtons[ i ].style.backgroundColor
			);
			if(
				color.r === 0 &&
				color.g === 0 &&
				color.b === 0 &&
				color.a === 0
			) {
				return colorButtons[ i ].parentElement;
			}
		}
		return colorButtons[ 0 ].parentElement;
	}

	function findColor( searchColor ) {
		var colorButtons, i, color;

		colorButtons = document.querySelectorAll(
			"#colorbar .color-button > div"
		);
		for( i = 0; i < colorButtons.length; i++ ) {
			color = $.util.convertToColor(
				colorButtons[ i ].style.backgroundColor
			);
			if( searchColor.r === color.r &&
				searchColor.g === color.g &&
				searchColor.b === color.b && 
				searchColor.a === color.a
			) {
				return colorButtons[ i ].parentElement;
			}
		}
		return false;
	}

	// colorScript API - Return
	return {
		"initialize": initialize,
		"selectColor": selectColor,
		"getColor": getColor,
		"getColor2": getColor2,
		"getColors": getColors,
		"setColors": setColors,
		"setColor": setColor
	};

// End of file encapsulation
} )();
