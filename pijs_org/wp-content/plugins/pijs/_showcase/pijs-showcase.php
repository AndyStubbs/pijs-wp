<?php
/*
Plugin Name: Pijs Showcase
Description: A plugin that creates a code editor
Version: 1.0
Author: Andy Stubbs
*/

class Pijs_Showcase {

	function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_shortcode( 'pijs_showcase', array( $this, 'showcase_shortcode' ) );
	}

	function register_scripts() {
		wp_enqueue_script( 'pijs', pijs_get_latest_version_url( 'pi-', '.js' ) );
	}

	function showcase_shortcode( $atts, $content = null ) {
		$atts = shortcode_atts( array(
			'demo' => 'platformer',
			'scrollable' => false
		), $atts );

		$showcaseName = $atts[ 'demo' ];
		$showcaseDir = plugin_dir_path( __FILE__ ) . "/$showcaseName";
		$showcaseUrl = plugins_url( $showcaseName, __FILE__ );
		$template = file_get_contents( plugin_dir_path( __FILE__ ) . 'showcase-template.php' );

		if( $showcaseName == 'dr_ascii') {
			$template .= $this->get_dr_ascii_scripts( $showcaseUrl );
		} elseif( $showcaseName == 'pirate' ) {
			$template .= $this->get_pirate_scripts( $showcaseUrl );
		}

		if( $atts[ 'scrollable' ] ) {
			$template .= "<script>\n\t" .
				"let tempInterval = setInterval( function() {\n\t\t" .
					"let canvas = document.querySelector( '#showcase canvas' );\n\t\t" .
					"if( canvas ) {\n\t\t\t" .
						"canvas.style.position = 'static';\n\t\t\t" .
						"clearInterval( tempInterval );\n\t\t\t" .
					"}\n\t\t" .
				"}, 30 );\n\t" .
			"</script>\n";
		}
		$template .= $this->get_link_scripts( $showcaseUrl );
		return $template;
	}

	function get_pirate_scripts( $showcaseUrl ) {
		return "" .
			"<div class='pirate-images' style='display: none'>" .
				"<img src='" . plugins_url( 'pirate/pirate-ship.png', __FILE__ ) . "' id='bgShip' style='display: none';/>" .
				"<img src='" . plugins_url( 'pirate/parrot-bay.png', __FILE__ ) . "' id='bgParrotBay' style='display: none';/>" .
				"<img src='" . plugins_url( 'pirate/shallow-ocean.png', __FILE__ ) . "' id='bgShallowOcean' style='display: none';/>" .
				"<img src='" . plugins_url( 'pirate/pirate-city.png', __FILE__ ) . "' id='bgPirateCity' style='display: none';/>" .
				"<img src='" . plugins_url( 'pirate/skull-cavern.png', __FILE__ ) . "' id='bgSkullCavern' style='display: none';/>" .
				"<img src='" . plugins_url( 'pirate/high-plains-desert.png', __FILE__ ) . "' id='bgHighPlainsDesert' style='display: none';/>" .
				"<img src='" . plugins_url( 'pirate/jungle.png', __FILE__ ) . "' id='bgJungle' style='display: none';/>" .
			"</div>";
	}

	function get_dr_ascii_scripts( $showcaseUrl ) {
		return "" . 
			"<script src='$showcaseUrl/data.js'></script>" .
			"<script src='$showcaseUrl/menu.js'></script>";
	}

	function get_link_scripts( $showcaseUrl ) {
		return "" . 
			"<script>" .
				"var g_showcaseLink = '$showcaseUrl/';" .
			"</script>" .
			"<script src='$showcaseUrl/demo.js'></script>";
	}
}
