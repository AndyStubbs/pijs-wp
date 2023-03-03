/*
effects.js
*/

"use strict";

// Controls Script Container
var effectsScript = ( function () {

	function enableEffects( isDisabled ) {
		var effects, i;

		effects = document.querySelectorAll( "#effectsOption .buttonOption" );
		for( i = 0; i < effects.length; i++ ) {
			effects[ i ].disabled = isDisabled;
		}
	}

	function effectsFlipX( srcCanvas ) {
		flipSelectionPixels( true, srcCanvas );
	}

	function effectsFlipY( srcCanvas ) {
		flipSelectionPixels( false, srcCanvas );
	}

	function flipSelectionPixels( flipX, srcCanvas ) {
		var canvas, context;

		canvas = document.createElement( "canvas" );
		canvas.width = srcCanvas.width;
		canvas.height = srcCanvas.height;
		context = canvas.getContext( "2d" );
		if( flipX ) {
			context.translate( canvas.width, 0 );
			context.scale( -1, 1 );
		} else {
			context.translate( 0, canvas.height );
			context.scale( 1, -1 );
		}
		context.drawImage( srcCanvas, 0, 0 );
		context = srcCanvas.getContext( "2d" );
		context.clearRect( 0, 0, canvas.width, canvas.height );
		context.drawImage( canvas, 0, 0 );
	}

	function effectsGrayscale( srcCanvas ) {
		var context, imageData, data, i, avg;

		context = srcCanvas.getContext( "2d" );
		imageData = context.getImageData(
			0, 0, srcCanvas.width, srcCanvas.height
		);
		data = imageData.data;
		for( i = 0; i < data.length; i += 4 ) {
			avg = ( data[ i ] + data[ i + 1 ] + data[ i + 2 ] ) / 3;
			data[ i ] = avg;
			data[ i + 1 ] = avg;
			data[ i + 2 ] = avg;
		}
		context.putImageData( imageData, 0, 0 );
	}

	function effectsBlur( srcCanvas ) {
		var context, imageData, data, width, height, x, y, i, i2, i3, i4, i5, avg;

		context = srcCanvas.getContext( "2d" );
		imageData = context.getImageData(
			0, 0, srcCanvas.width, srcCanvas.height
		);
		data = imageData.data;
		width = srcCanvas.width;
		height = srcCanvas.height;

		for( y = 1; y < height - 1; y += 1 ){
			for( x = 1; x < width - 1; x += 1 ) {
				i = ( y * 4 ) * width + x * 4;
				i2 = ( ( y + 0 ) * 4 ) * width + ( x - 1 ) * 4;
				i3 = ( ( y + 0 ) * 4 ) * width + ( x + 1 ) * 4;
				i4 = ( ( y + 1 ) * 4 ) * width + ( x + 0 ) * 4;
				i5 = ( ( y - 1 ) * 4 ) * width + ( x + 0 ) * 4;

				// Update Red
				avg = Math.floor( (
					( data[ i ] * 8 ) + data[ i2 ] + data[ i3 ] +
					data[ i4 ] + data[ i5 ]
				) / 12 );
				data[ i ] = avg;

				// Update Green
				avg = Math.floor( (
					( data[ i + 1 ] * 8 ) + data[ i2 + 1 ] + data[ i3 + 1 ] +
					data[ i4 + 1 ] + data[ i5 + 1 ]
				) / 12 );
				data[ i + 1 ] = avg;

				// Update Blue
				avg = Math.floor( (
					( data[ i + 2 ] * 8 ) + data[ i2 + 2 ] + data[ i3 + 2 ] +
					data[ i4 + 2 ] + data[ i5 + 2 ]
				) / 12 );
				data[ i + 2 ] = avg;

				// Update Alpha
				avg = Math.floor( (
					( data[ i + 3 ] * 8 ) + data[ i2 + 3 ] + data[ i3 + 3 ] +
					data[ i4 + 3 ] + data[ i5 + 3 ]
				) / 12 );
				data[ i + 3 ] = avg;
			}
		}

		context.putImageData( imageData, 0, 0 );
	}

	function effectsDesaturate( srcCanvas ) {
		var context, imageData, data, i, avg, r, g, b;

		context = srcCanvas.getContext( "2d" );
		imageData = context.getImageData(
			0, 0, srcCanvas.width, srcCanvas.height
		);
		data = imageData.data;
		for( i = 0; i < data.length; i += 4 ) {
			r = data[ i ];
			g = data[ i + 1 ];
			b = data[ i + 2 ];
			avg = Math.floor(
				(
					Math.min( r, Math.min( g, b ) ) +
					Math.max( r, Math.max( g, b ) )
				) * 0.5 );
			data[ i ] = avg;
			data[ i + 1 ] = avg;
			data[ i + 2 ] = avg;
		}
		context.putImageData( imageData, 0, 0 );
	}

	function effectsBitMask( srcCanvas ) {
		var context, imageData, data, i, val;

		context = srcCanvas.getContext( "2d" );
		imageData = context.getImageData(
			0, 0, srcCanvas.width, srcCanvas.height
		);
		data = imageData.data;
		for( i = 0; i < data.length; i += 4 ) {
			val = 0;
			if( data[ i + 3 ] > 0 ) {
				data[ i ] = val;
				data[ i + 1 ] = val;
				data[ i + 2 ] = val;
				data[ i + 3 ] = 255;
			}
		}
		context.putImageData( imageData, 0, 0 );
	}

	function effects8Bit( srcCanvas ) {
		var context, imageData, data, i, allColors, colorCount, bitColors, step, c, c2, d,
			j, dr, dg, db, minD, mr, mg, mb, satUp, satDown, ditherColors, blackColor,
			x, y;

		colorCount = 16;
		allColors = [];
		context = srcCanvas.getContext( "2d" );
		imageData = context.getImageData(
			0, 0, srcCanvas.width, srcCanvas.height
		);
		data = imageData.data;

		// bitColors = [
		// 	"#000000", "#FFFFFF",
		// 	"#FF0000", "#888888",
		// 	"#FF0080", "#A6722C",
		// 	"#800080", "#333333",
		// 	"#8000FF",
		// 	"#0000FF",
		// 	"#00FFFF",
		// 	"#00FF00",
		// 	"#80FF00",
		// 	"#FFFF00",
		// 	"#FFAE42",
		// 	"#FF8000",
		// 	"#FF4000",
		// ];

		// bitColors = [
		// 	"#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
		// 	"#FF0000", "#D10000", "#A30000", "#740000", "#460000", "#00000000",
		// 	"#FF0080", "#D6006B", "#AC0056", "#830042", "#59002D", "#00000000",
		// 	"#800080", "#6B006B", "#560056", "#420042", "#2D002D", "#00000000",
		// 	"#8000FF", "#6B00D6", "#5600AC", "#420083", "#2D0059", "#00000000",
		// 	"#0000FF", "#0000D1", "#0000A3", "#000074", "#000046", "#00000000",
		// 	"#00FFFF", "#00D1D1", "#00A3A3", "#007474", "#004646", "#00000000",
		// 	"#00FF00", "#00D100", "#00A300", "#007400", "#004600", "#00000000",
		// 	"#80FF00", "#6BD600", "#56AC00", "#428300", "#2D5900", "#00000000",
		// 	"#FFFF00", "#D1D100", "#A3A300", "#747400", "#464600", "#00000000",
		// 	"#FFAE42", "#D29037", "#A6722C", "#795422", "#4D3617", "#00000000",
		// 	"#FF8000", "#D16900", "#A35300", "#743C00", "#462600", "#00000000",
		// 	"#FF4000", "#D13500", "#A32A00", "#741E00", "#461300", "#00000000"
		// ];

		// bitColors = [
		// 	"#000000",
		// 	"#FFFF00",
		// 	"#666666",
		// 	"#A30000",
		// 	"#AC0056",
		// 	"#560056",
		// 	"#5600AC",
		// 	"#0000A3",
		// 	"#00A3A3",
		// 	"#00A300",
		// 	"#56AC00",
		// 	"#A3A300",
		// 	"#A6722C",
		// 	"#A35300",
		// 	"#A32A00",
		// 	"#FFFFFF"
		// ];

		bitColors = [
			"#000000","#0000AA","#00AA00","#00AAAA","#AA0000",
			"#AA00AA", "#AA5500","#AAAAAA","#555555","#5555FF","#55FF55","#55FFFF",
			"#FF5555","#FF55FF","#FFFF55","#FFFFFF"
		];

		for( i = 0; i < bitColors.length; i++ ) {
			bitColors[ i ] = $.util.convertToColor( bitColors[ i ] );
		}

		ditherColors = [];
		for( i = 0; i < bitColors.length; i++ ) {
			for( j = i; j < bitColors.length; j++ ) {
				ditherColors.push( {
					"c": $.util.convertToColor( [
						Math.floor( ( bitColors[ i ].r + bitColors[ j ].r ) / 2 ),
						Math.floor( ( bitColors[ i ].g + bitColors[ j ].g ) / 2 ),
						Math.floor( ( bitColors[ i ].b + bitColors[ j ].b ) / 2 )
					] ),
					"i": i,
					"j": j
				} );
			}
		}

		blackColor = $.util.convertToColor( "#000000" );
		ditherColors.sort( function ( a, b ) {
			a.d = colourDistance( a.c, blackColor );
			b.d = colourDistance( b.c, blackColor );
			if( a.d > b.d ) {
				return 1;
			} else {
				return -1;
			}
		} );

		// for( i = 0; i < data.length; i += 4 ) {
		// 	if( data[ i + 3 ] > 0 ) {
		// 		allColors.push(
		// 			$.util.convertToColor( [ data[ i ], data[ i + 1 ], data[ i + 2 ], 255 ] )
		// 		);
		// 	}
		// }

		// // Sort the colors
		// allColors.sort( function ( a, b ) {
		// 	if( a.s > b.s ) {
		// 		return 1;
		// 	} else {
		// 		return -1;
		// 	}
		// } );

		// // Build our color palette
		// step = Math.floor( allColors.length / colorCount );
		// bitColors = [];
		// for( i = 0; i < colorCount; i += 1 ) {
		// 	bitColors.push( allColors[ i * step ] );
		// }

		// Loop back through the colors again
		satUp = 1.25;
		satDown = 0.75;
		for( i = 0; i < data.length; i += 4 ) {
			if( data[ i + 3 ] > 0 ) {
				c = $.util.convertToColor( [ data[ i ], data[ i + 1 ], data[ i + 2 ], 255 ] );
				if( c.r > c.g && c.r > c.b ) {
					c.r = Math.floor( Math.min( c.r * satUp, 255 ) );
					c.g = Math.floor( c.g * satDown );
					c.b = Math.floor( c.b * satDown );
				} else if ( c.g > c.r && c.g > c.b ) {
					c.r = Math.floor( c.r * satDown );
					c.g = Math.floor( Math.min( c.g * satUp, 255 ) );
					c.b = Math.floor( c.b * satDown );
				} else if( c.b > c.r && c.b > c.g ) {
					c.r = Math.floor( c.r * satDown );
					c.g = Math.floor( c.g * satDown );
					c.b = Math.floor( Math.min( c.b * satUp, 255 ) );
				}

				c2 = bitColors[ 0 ];
				minD = 999999999;
				for( j = 0; j < bitColors.length; j++ ) {
					// dr = ( c.r - bitColors[ j ].r );
					// dg = ( c.g - bitColors[ j ].g );
					// db = ( c.b - bitColors[ j ].b );
					// mr = 1;
					// mg = 1;
					// mb = 1;
					// c.r = Math.min( c.r * satUp, 255 );
					// c.g = Math.min( c.g * satUp, 255 );
					// c.b = Math.min( c.b * satUp, 255 );

					
					// d = ( dr * dr * mr + dg * dg * mg + db * db * mb );
					d = colourDistance( c, bitColors[ j ] );
					if( d < minD ) {
						minD = d;
						c2 = bitColors[ j ]
					}
				}

				// Add dithering
				if( minD > 100 ) {
					j = $.util.binarySearch( ditherColors, c, function ( search, color ) {
						d = colourDistance( search, color.c );
						if( d < minD ) {
							minD = d;
							c2 = color;
						}
					} );
					if( c2.i !== undefined && c2.j !== undefined ) {
						if( Math.random() > 0.5 ) {
							c2 = bitColors[ c2.i ];
						} else {
							c2 = bitColors[ c2.j ];
						}
					}
				}

				data[ i ] = c2.r;
				data[ i + 1 ] = c2.g;
				data[ i + 2 ] = c2.b;
			}
		}
		context.putImageData( imageData, 0, 0 );
	}

	function effectsDither( srcCanvas ) {
		var context, imageData, data, width, height, x, y, i;

		context = srcCanvas.getContext( "2d" );
		imageData = context.getImageData(
			0, 0, srcCanvas.width, srcCanvas.height
		);
		data = imageData.data;
		width = srcCanvas.width;
		height = srcCanvas.height;

		for( y = 0; y < height; y += 1 ) {
			if( y % 2 === 0 ) {
				for( x = 0; x < width; x += 1 ) {
					i = ( y * 4 ) * width + x * 4;
					if( data[ i + 3 ] > 0 ) {
						if( x % 2 === 0 ) {
							data[ i ] = 0;
							data[ i + 1 ] = 0;
							data[ i + 2 ] = 0;
							data[ i + 3 ] = 0;
						}
					}
				}
			} else {
				for( x = 1; x < width - 1; x += 1 ) {
					i = ( y * 4 ) * width + x * 4;
					if( data[ i + 3 ] > 0 ) {
						if( x % 2 === 1 ) {
							data[ i ] = 0;
							data[ i + 1 ] = 0;
							data[ i + 2 ] = 0;
							data[ i + 3 ] = 0;
						}
					}
				}
			}
		}

		context.putImageData( imageData, 0, 0 );
	}

	function colourDistance( e1, e2 ) {
		var rMean, r, g, b;

		rMean = ( e1.r + e2.r ) / 2;
		r = e1.r - e2.r;
		g = e1.g - e2.g;
		b = e1.b - e2.b;
		return Math.sqrt(
			( ( ( 512 + rMean ) * r * r ) >> 8 ) + 4 * g * g + ( ( ( 767 - rMean ) * b * b ) >> 8 )
		);
	}

	// Picture Script return API
	return {
		"enableEffects": enableEffects,
		"effectsFlipX": effectsFlipX,
		"effectsFlipY": effectsFlipY,
		"effectsFlip": flipSelectionPixels,
		"effectsGrayscale": effectsGrayscale,
		"effectsBlur": effectsBlur,
		"effectsDesaturate": effectsDesaturate,
		"effectsBitMask": effectsBitMask,
		"effects8Bit": effects8Bit,
		"effectsDither": effectsDither
	};

	// End of file encapsulation
} )();
