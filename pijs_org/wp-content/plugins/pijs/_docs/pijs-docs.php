<?php

class Pijs_Docs {

	function __construct() {
		//error_log( "Pijs_Code_Example constructor called\n", 3, WP_CONTENT_DIR . '/debug.log' );

		add_shortcode( 'pijs_help_page', array( $this, 'pijs_code_example_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
	}

	function register_scripts() {
		if( is_page() ) {
			$content = get_post()->post_content;
			if( has_shortcode( $content, 'pijs_help_page' ) ) {
				$this->register_common_scripts();
				return $this->register_help_shortcode_scripts();
			}
		}
	}

	function register_common_scripts() {
		wp_register_style(
			'highlight-styles', plugins_url( 'libs/highlights/styles/sunburst.css', __FILE__ )
		);
		wp_register_style(
			'example-styles', plugins_url( '_code-example/example-styles.css', __FILE__ )
		);
		wp_register_script(
			'highlight-pack', plugins_url( 'libs/highlights/highlight.pack.js', __FILE__ )
		);
		wp_register_script(
			'apply-highlights', plugins_url( '_code-example/apply-highlights.js', __FILE__ ), null, '1.0', true
		);
		wp_register_script(
			'examples', plugins_url( '_code-example/examples.js', __FILE__ ), null, '1.0', true
		);
	}

	function register_help_shortcode_scripts() {
		wp_register_script(
			'examples', plugins_url( '_docs/help.js', __FILE__ ), null, '1.0', true
		);

		wp_enqueue_style( 'highlight-styles' );
		wp_enqueue_style( 'example-styles' );
		wp_enqueue_script( 'pijs', pijs_get_latest_version_url( 'pi-', '.js' ) );
		wp_enqueue_script( 'highlight-pack' );
		wp_enqueue_script( 'apply-highlights' );
		wp_enqueue_script( 'examples' );
		wp_enqueue_script( 'help.js' );
	}

	function pijs_help_page_shortcode() {
		$content = file_get_contents( plugin_dir_path( __FILE__ ) . 'pijs-help-page.php' );
		$content .= $this->get_link_scripts();
		return $content;
	}

	function get_link_scripts() {
		return "<script>" .
			"var g_helpFile = '" .  plugins_url( '_docs/help.json', __FILE__ ) . "';" .
		"</script>";
	}
}

