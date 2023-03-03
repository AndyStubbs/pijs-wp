/*
shapeTool.js
*/

"use strict";

// Shape Tool
var shapeTool = ( function () {
	var m_isDrawing, m_options, m_settings, m_shapes, m_rects, m_cps,
		m_cpSize, m_hasControlPoints, m_curves, m_colorButton;

	m_options = [
		"shapeToolOption", "sizeOption", "shapeOption", "noiseOption",
		"drawOption", "reflectOption"
	];
	m_settings = {
		"sizeInput": 1,
		"shapeOption": "shapeSquare",
		"noiseInput": 0,
		"drawOption": "drawPixel",
		"reflectOption": "reflectN",
		"shapeToolOption": "shapeToolLine"
	};
	m_isDrawing = false;
	m_shapes = {
		"shapeSquare": "square",
		"shapeCircle": "circle"
	};
	m_rects = [ {
		"x": -1,
		"y": -1,
		"width": -1,
		"height": -1
	} ];
	m_cps = [];
	m_cpSize = 10;
	m_hasControlPoints = false;
	m_curves = [];

	// Create Tool
	function createTool( button ) {
		button.addEventListener( "click", selectTool );
		button.innerHTML = "<div style='background-image:url(" + g_themeUrl + "/pixel/star.png);'>" +
			"</div>";
		initializeControlPoints();
	}

	function initializeControlPoints() {
		var i, id, element;

		for( i = 1; i < 5; i++ ) {
			id = "cp" + i;
			element = document.getElementById( id );
			element.dataset.index = i - 1;

			m_cps.push( {
				"x": 0,
				"y": 0,
				"element": element,
			} );

			pixel.initElementDragging(
				"#" + id, cpMoveStarted, cpMoved, cpMoveStop,
				cpGetLimits
			);
		}
	}

	function cpMoveStarted() {}

	function cpMoved( dx, dy, index ) {
		var cp, i, curve, pen, tPen;

		cp = m_cps[ index ];
		pen = { "x": cp.x, "y": cp.y };
		pen.x += pixel.pixelX2( dx );
		pen.y += pixel.pixelY2( dy );

		for( i = 0; i < m_curves.length; i++ ) {
			curve = m_curves[ i ];
			if( curve.reflect ) {
				tPen = curve.reflect( pen );
				curve.pts[ index ][ 0 ] = Math.floor( tPen.x );
				curve.pts[ index ][ 1 ] = Math.floor( tPen.y );
			} else {
				curve.pts[ index ][ 0 ] = Math.floor( pen.x );
				curve.pts[ index ][ 1 ] = Math.floor( pen.y );
			}
		}
		layerScript.refreshTemp();
		drawShapes( pixel.activePicture.$temp );
	}

	function cpMoveStop( dx, dy, index ) {
		var cp;

		cp = m_cps[ index ];
		cp.x += pixel.pixelX2( dx );
		cp.y += pixel.pixelY2( dy );
	}

	function cpGetLimits() {
		var rect;

		rect = pixel.getScreenLimits( m_cpSize * 2 );
		rect.x1 -= m_cpSize;
		rect.y1 -= m_cpSize;
		rect.x2 += m_cpSize;
		rect.y2 += m_cpSize;

		return rect;
	}

	function finalizeShape( layer ) {
		var action;

		if( layer == null ) {
			layer = pixel.activeLayer;
		}

		layerScript.refreshTemp( layer );
		action = undoScript.startDrawAction( "pen", layer );
		drawShapes( layer.picture.$temp );
		layerScript.finalizeTemp( layer );
		action.undoDraw = true;
		action.redoDraw = true;
		undoScript.addAction( action, layer.picture );
		updateCps( true );
		layerScript.refreshTemp( layer );
		pixel.undoAction = null;
	}

	// Select Tool
	function selectTool() {
		toolScript.setActiveTool( shapeTool, m_options, m_settings );
	}

	function deselectTool() {
		pixel.activePicture.$effects.cls();
		if( m_hasControlPoints ) {
			finalizeShape();
		}
	}

	// Pen Down
	function penDown( $screen, pen ) {
		var $temp, tPen;

		if( m_hasControlPoints ) {
			finalizeShape();
		}
		pixel.activePicture.$effects.cls();
		$temp = pixel.activePicture.$temp;
		m_colorButton = pen.buttons;
		m_rects = [];
		m_isDrawing = true;
		m_rects.push( {
			"x": pen.x,
			"y": pen.y,
			"width": 0,
			"height": 0,
			"reflect": null
		} );

		// Draw Reflected X
		if(
			m_settings[ "reflectOption" ] === "reflectX" ||
			m_settings[ "reflectOption" ] === "reflectXY"
		) {
			tPen = reflectX( pen );
			m_rects.push( {
				"x": tPen.x,
				"y": tPen.y,
				"width": 0,
				"height": 0,
				"reflect": reflectX
			} );
		}

		// Draw Reflected Y
		if(
			m_settings[ "reflectOption" ] === "reflectY" ||
			m_settings[ "reflectOption" ] === "reflectXY"
		) {
			tPen = reflectY( pen );
			m_rects.push( {
				"x": tPen.x,
				"y": tPen.y,
				"width": 0,
				"height": 0,
				"reflect": reflectY
			} );
		}

		// Draw Reflected XY
		if( m_settings[ "reflectOption" ] === "reflectXY" ) {
			tPen = reflectXY( pen );
			m_rects.push( {
				"x": tPen.x,
				"y": tPen.y,
				"width": 0,
				"height": 0,
				"reflect": reflectXY
			} );
		}

		// Draw the rects
		layerScript.refreshTemp();
		drawShapes( pixel.activePicture.$temp );
	}

	// Pen Move
	function penMove( $screen, pen ) {
		var $temp, tPen, $effects , i;

		if( m_isDrawing ) {
			for( i = 0; i < m_rects.length; i++ ) {
				if( m_rects[ i ].reflect ) {
					tPen = m_rects[ i ].reflect( pen );
				} else {
					tPen = pen;
				}
				m_rects[ i ].width = tPen.x - m_rects[ i ].x;
				m_rects[ i ].height = tPen.y - m_rects[ i ].y;
			}

			// Draw the rects
			layerScript.refreshTemp();
			if( m_settings[ "shapeToolOption" ] === "shapeToolCurve" ) {
				createCurves();
			}
			drawShapes( pixel.activePicture.$temp );
		} else {
			$effects = pixel.activePicture.$effects;
			$effects.cls();
			$effects.setPen(
				m_shapes[ m_settings.shapeOption ], m_settings.sizeInput
			);
			$effects.setColor( pixel.selectorColor );
			drawPixel( $effects, pen );
			$effects.setPen( "pixel", 1 );
			layerScript.drawLayers();
		}
	}

	// Pen Up
	function penUp( $screen, pen ) {
		// Drawing is done
		if( m_isDrawing ) {
			m_isDrawing = false;
			if( m_settings[ "shapeToolOption" ] === "shapeToolCurve" ) {
				updateCps( false );
			} else {
				finalizeShape();
			}
		}
	}

	function updateCps( isHidden ) {
		var i, cp, limits;

		if( isHidden || m_curves.length === 0 ) {
			for( i = 0; i < m_cps.length; i++ ) {
				cp = m_cps[ i ];
				cp.element.style.display = "none";
			}
			m_hasControlPoints = false;
			m_curves = [];
			return;
		}

		pixel.undoAction = cancelShape;
		m_hasControlPoints = true;
		for( i = 0; i < m_cps.length; i++ ) {
			cp = m_cps[ i ];
			cp.screenX = pixel.screenX( cp.x + 0.5 ) - m_cpSize;
			cp.screenY = pixel.screenY( cp.y + 0.5 ) - m_cpSize;
			limits = pixel.getScreenLimits( m_cpSize * 2 );
			if(
				cp.screenX >= limits.x1 &&
				cp.screenX <= limits.x2 &&
				cp.screenY >= limits.y1 &&
				cp.screenY <= limits.y2
			) {
				cp.element.style.display = "block";
				cp.element.style.left = cp.screenX + "px";
				cp.element.style.top = cp.screenY + "px";
			} else {
				cp.element.style.display = "none";
			}
		}
	}

	function cancelShape() {
		updateCps( true );
		layerScript.refreshTemp();
		layerScript.drawLayers();
	}

	function startPen( $screen ) {
		var noise;
		if( m_colorButton === 1 ) {
			$screen.setColor( colorScript.getColor() );
		} else {
			$screen.setColor( colorScript.getColor2() );
		}
		if( m_settings.noiseInput > 0 ) {
			noise = Math.floor( ( m_settings.noiseInput / 100 ) * 255 );
			$screen.setPen(
				m_shapes[ m_settings.shapeOption ], m_settings.sizeInput,
				noise
			);
		} else {
			$screen.setPen(
				m_shapes[ m_settings.shapeOption ], m_settings.sizeInput
			);
		}

		if( m_settings[ "drawOption" ] === "drawPixel" ) {
			$screen.setPixelMode( true );
		} else if( m_settings[ "drawOption" ] === "drawAliased" ) {
			$screen.setPixelMode( false );
		}
	}

	function stopPen( $screen ) {
		if( m_settings[ "drawOption" ] === "drawAliased" ) {
			$screen.setPixelMode( true );
		}
		$screen.setPen( "pixel", 1 );
	}

	function reflectX( pen ) {
		return {
			"x": pen.x * -1 + pixel.activePicture.width - 1,
			"y": pen.y,
			"lastX": pen.lastX * -1 + pixel.activePicture.width - 1,
			"lastY": pen.lastY
		};
	}

	function reflectY( pen ) {
		return {
			"x": pen.x,
			"y": pen.y * -1 + pixel.activePicture.height - 1,
			"lastX": pen.lastX,
			"lastY": pen.lastY * -1 + pixel.activePicture.height - 1
		};
	}

	function reflectXY( pen ) {
		return {
			"x": pen.x * -1 + pixel.activePicture.width - 1,
			"y": pen.y * -1 + pixel.activePicture.height - 1,
			"lastX": pen.lastX * -1 + pixel.activePicture.width - 1,
			"lastY": pen.lastY * -1 + pixel.activePicture.height - 1
		};
	}

	function drawShapes( $screen ) {
		startPen( $screen );

		switch( m_settings[ "shapeToolOption" ] ) {
			case "shapeToolLine":
				drawLines( $screen );
				break;
			case "shapeToolCurve":
				drawCurves( $screen );
				break;
			case "shapeToolRect":
				drawRects( $screen );
				break;
			case "shapeToolEllipse":
				drawEllipses( $screen );
				break;
			case "shapeToolCircle":
				drawCircles( $screen );
				break;
			case "shapeToolStar":
				drawStars( $screen );
				break;
			case "shapeToolArrow":
				drawArrows( $screen );
				break;
		}
		$screen.render();
		stopPen( $screen );

		layerScript.drawLayers();
	}

	function drawLines( $screen ) {
		var i;

		for( i = 0; i < m_rects.length; i++ ) {
			$screen.line(
				m_rects[ i ].x,
				m_rects[ i ].y,
				m_rects[ i ].x + m_rects[ i ].width,
				m_rects[ i ].y + m_rects[ i ].height
			);
		}
	}

	function createCurves() {
		var i, curve, tRect, right, bottom, pts;

		// Create the curves
		m_curves = [];
		for( i = 0; i < m_rects.length; i++ ) {
			curve = {
				"reflect": m_rects[ i ].reflect,
				"pts": []
			};
			//tRect = normalizeRect( m_rects[ i ] );
			tRect = m_rects[ i ];
			right = tRect.x + tRect.width;
			bottom = tRect.y + tRect.height;
			curve.pts.push( [ tRect.x, tRect.y ] );
			curve.pts.push( [ right, tRect.y ] );
			curve.pts.push( [ tRect.x, bottom ] );
			curve.pts.push( [ right, bottom ] );
			m_curves.push( curve );
		}

		// Update the control points
		pts = m_curves[ 0 ].pts;
		m_cps[ 0 ].x = pts[ 0 ][ 0 ];
		m_cps[ 0 ].y = pts[ 0 ][ 1 ];
		m_cps[ 1 ].x = pts[ 1 ][ 0 ];
		m_cps[ 1 ].y = pts[ 1 ][ 1 ];
		m_cps[ 2 ].x = pts[ 2 ][ 0 ];
		m_cps[ 2 ].y = pts[ 2 ][ 1 ];
		m_cps[ 3 ].x = pts[ 3 ][ 0 ];
		m_cps[ 3 ].y = pts[ 3 ][ 1 ];
	}

	function drawCurves( $screen ) {
		var i, pts

		for( i = 0; i < m_curves.length; i++ ) {
			pts = m_curves[ i ].pts;
			$screen.bezier(
				pts[ 0 ][ 0 ], pts[ 0 ][ 1 ],
				pts[ 1 ][ 0 ], pts[ 1 ][ 1 ],
				pts[ 2 ][ 0 ], pts[ 2 ][ 1 ],
				pts[ 3 ][ 0 ], pts[ 3 ][ 1 ]
			);
		}
	}

	function drawRects( $screen ) {
		var i;

		for( i = 0; i < m_rects.length; i++ ) {
			$screen.rect(
				m_rects[ i ].x,
				m_rects[ i ].y,
				m_rects[ i ].width + 1,
				m_rects[ i ].height + 1
			);
		}
	}

	function drawEllipses( $screen ) {
		var i, radiusX, radiusY, tRect;

		for( i = 0; i < m_rects.length; i++ ) {
			tRect = normalizeRect( m_rects[ i ] );
			radiusX = tRect.width / 2;
			radiusY = tRect.height / 2;
			if( radiusY === 0 ) {
				$screen.line(
					tRect.x + 1,
					tRect.y,
					tRect.x + tRect.width - 1,
					tRect.y,
				);
			} else {
				$screen.ellipse(
					tRect.x + radiusX,
					tRect.y + radiusY,
					radiusX,
					radiusY
				);
			}
		}
	}

	function drawCircles( $screen ) {
		var i, x, y, width, height, radius, radiusX, radiusY;

		for( i = 0; i < m_rects.length; i++ ) {
			if( m_rects[ i ].width < 0 ) {
				width = m_rects[ i ].width * -1;
			} else {
				width = m_rects[ i ].width;
			}
			if( m_rects[ i ].height < 0 ) {
				height = m_rects[ i ].height * -1;
			} else {
				height = m_rects[ i ].height;
			}
			x = m_rects[ i ].x;
			y = m_rects[ i ].y;
			radiusX = Math.round( width + 1 );
			radiusY = Math.round( height + 1 );
			radius = Math.max( radiusX, radiusY );
			$screen.circle( x, y, radius );
		}
	}

	function drawStars( $screen ) {
		var points;

		points = [
			[ 0.5,  0    ],
			[ 0.6,  0.4  ],
			[ 1,    0.4  ],
			[ 0.7,  0.6  ],
			[ 0.8,  1    ],
			[ 0.5,  0.75 ],
			[ 0.2,  1    ],
			[ 0.3,  0.6  ],
			[ 0,    0.4  ],
			[ 0.4,  0.4  ]
		];

		drawPoints( points, $screen );
	}

	function drawArrows( $screen ) {
		var points;

		points = [
			[ 0.5,  0    ],
			[ 1,    0.5  ],
			[ 0.5,  1    ],
			[ 0.5,  0.75 ],
			[ 0,    0.75 ],
			[ 0,    0.25 ],
			[ 0.5,  0.25 ]
		];
		drawPoints( points, $screen, true );
	}

	function drawPoints( points, $screen, flip ) {
		var i, j, point1, point2, tRect;

		for( i = 0; i < m_rects.length; i++ ) {
			if( flip ) {
				tRect = m_rects[ i ];
			} else {
				tRect = normalizeRect( m_rects[ i ] );
			}
			for( j = 0; j < points.length; j += 1 ) {
				if( j + 1 < points.length ) {
					point1 = getDrawPoint(
						tRect, points[ j ][ 0 ], points[ j ][ 1 ]
					);
					point2 = getDrawPoint(
						tRect, points[ j + 1 ][ 0 ], points[ j + 1 ][ 1 ]
					);
				} else {
					point1 = getDrawPoint(
						tRect, points[ j ][ 0 ], points[ j ][ 1 ]
					);
					point2 = getDrawPoint(
						tRect, points[ 0 ][ 0 ], points[ 0 ][ 1 ]
					);
				}
				$screen.line( point1.x, point1.y, point2.x, point2.y );
			}
		}
	}

	function getDrawPoint( rect, x, y ) {
		return {
			"x": rect.x + Math.floor( x * rect.width ),
			"y": rect.y + Math.floor( y * rect.height )
		};
	}

	function drawPixel( $temp, pen ) {
		var tPen;

		// Draw Normal
		$temp.pset( pen.x, pen.y );

		// Draw Reflected X
		if(
			m_settings[ "reflectOption" ] === "reflectX" ||
			m_settings[ "reflectOption" ] === "reflectXY"
		) {
			tPen = reflectX( pen );
			$temp.pset( tPen.x, tPen.y );
		}

		// Draw Reflected Y
		if(
			m_settings[ "reflectOption" ] === "reflectY" ||
			m_settings[ "reflectOption" ] === "reflectXY"
		) {
			tPen = reflectY( pen );
			$temp.pset( tPen.x, tPen.y );
		}

		// Draw Reflected XY
		if( m_settings[ "reflectOption" ] === "reflectXY" ) {
			tPen = reflectXY( pen );
			$temp.pset( tPen.x, tPen.y );
		}

		$temp.render();
	}

	function normalizeRect( rect ) {
		var tRect;

		tRect = {};
		if( rect.width < 0 ) {
			tRect.width = rect.width * -1;
			tRect.x = rect.x - tRect.width;
		} else {
			tRect.x = rect.x;
			tRect.width = rect.width;
		}
		if( rect.height < 0 ) {
			tRect.height = rect.height * -1;
			tRect.y = rect.y - tRect.height;
		} else {
			tRect.y = rect.y;
			tRect.height = rect.height;
		}
		return tRect;
	}

	// Update Option
	function updateOption( name, value ) {
		if( name === "shapeToolOption" ) {
			if( m_settings[ name ] === "shapeToolCurve" ) {
				finalizeShape();
			}
			updateCps( false );
		}
		m_settings[ name ] = value;
		if(
			m_settings[ "shapeToolOption" ] === "shapeToolCurve" &&
			m_hasControlPoints
		) {
			layerScript.refreshTemp();
			drawShapes( pixel.activePicture.$temp );
		}
	}

	function layerChanged( oldLayer ) {
		if( oldLayer == null ) {
			updateCps( true );
		} else {
			if( m_hasControlPoints ) {
				finalizeShape( oldLayer );
			}
		}
		layerScript.refreshTemp();
	}

	function getMessage() {
		return " - Shape Tool";
	}

	function zoomSet() {
		updateCps( ! m_hasControlPoints );
	}

	function colorChanged() {
		if(
			m_settings[ "shapeToolOption" ] === "shapeToolCurve" &&
			m_hasControlPoints
		) {
			layerScript.refreshTemp();
			drawShapes( pixel.activePicture.$temp );
		}
	}

	// Pen Tool API return
	return {
		"createTool": createTool,
		"selectTool": selectTool,
		"deselectTool": deselectTool,
		"penDown": penDown,
		"penMove": penMove,
		"penUp": penUp,
		"updateOption": updateOption,
		"layerChanged": layerChanged,
		"name": "shape-tool",
		"usesColors": true,
		"getMessage": getMessage,
		"zoomSet": zoomSet,
		"onScrollEvent": zoomSet,
		"colorChanged": colorChanged
	};

// End of file encapsulation
} )();

toolScript.addTool( shapeTool );
