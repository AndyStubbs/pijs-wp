<?php
/*
Plugin Name: Pijs Code Example
Description: A plugin that creates a runnable example on the page.
Version: 1.0
Author: Andy Stubbs
*/

class Pijs_Code_Example {
	private $example_shortcode_name = 'pijs_code_example';

	function __construct() {
		error_log( "Pijs_Code_Example constructor called\n", 3, WP_CONTENT_DIR . '/debug.log' );

		add_shortcode( $this->example_shortcode_name, array( $this, 'pijs_code_example_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_filter( 'content_save_pre', array( $this, 'remove_br_tags' ) );
	}

	function register_scripts() {
		error_log( "register_scripts function called\n", 3, WP_CONTENT_DIR . '/debug.log' );
		wp_register_style(
			'highlight-styles', plugins_url( 'highlights/styles/sunburst.css', __FILE__ )
		);
		wp_register_script(
			'highlight-pack', plugins_url( 'highlights/highlight.pack.js', __FILE__ )
		);
		wp_register_script(
			'apply-highlights', plugins_url( 'apply-highlights.js', __FILE__ ), null, '1.0', true
		);
		wp_enqueue_style( 'highlight-styles' );
		wp_enqueue_script( 'highlight-pack' );
		wp_enqueue_script( 'apply-highlights' );
	}

	function remove_br_tags( $content ) {
		if ( has_shortcode( $content, $this->example_shortcode_name ) ) {
			$content = preg_replace(
				'/' . $this->example_shortcode_name . '([^\]]+)\]/',
				$this->example_shortcode_name . '$1]', $content
			);
			$content = preg_replace( '/<br[^>]*>/i', '', $content );
		}
		//$content = htmlentities( $content, ENT_QUOTES, 'UTF-8' );*/
		error_log( "POST: $content\n", 3, WP_CONTENT_DIR . '/debug.log' );
		return $content;
	}

	function pijs_code_example_shortcode( $atts, $content = null ) {
		$atts = shortcode_atts( array(
			'lang' => 'javascript',
			'no_run' => false,
		), $atts );
		$content = preg_replace( '/<br[^>]*>/i', '', $content );
		$content = htmlentities( $content, ENT_QUOTES, 'UTF-8', false );
		error_log( "$content\n", 3, WP_CONTENT_DIR . '/debug.log' );
		return "<pre><code class='language-{$atts[ 'lang' ]}'>$content</code></pre>";
	}

}

new Pijs_Code_Example();
