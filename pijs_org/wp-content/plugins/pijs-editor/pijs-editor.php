<?php
/*
Plugin Name: Pijs Editor
Description: A plugin that creates a code editor
Version: 1.0
Author: Andy Stubbs
*/

class Pijs_Editor {

	function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_shortcode( 'pijs_playground', array( $this, 'playground_shortcode' ) );
		add_action('wp_ajax_playground_run_program', array( $this, 'playground_run_program' ) );
		add_action('wp_ajax_nopriv_playground_run_program', array( $this, 'playground_run_program' ) );
	}

	function playground_shortcode() {
		$content = file_get_contents( plugin_dir_path( __FILE__ ) . 'playground-body.php' );
		$content .= "<script>" .
				"var g_monacoPath = '" .  plugins_url( 'monaco-editor', __FILE__ ) . "';" .
				"var g_ajaxUrl = '" . admin_url('admin-ajax.php') . "';" .
			"</script>";
		return $content;
	}

	function register_scripts() {
		if ( !is_single() && !has_shortcode( get_post()->post_content, 'pijs_playground' ) ) {
			return;
		}
		//error_log( "register_scripts function called\n", 3, WP_CONTENT_DIR . '/debug.log' );
		wp_register_style(
			'editor-styles', plugins_url( 'editor.css', __FILE__ )
		);
		wp_register_script(
			'monaco-editor', plugins_url( 'monaco-editor/min/vs/loader.js', __FILE__ )
		);
		wp_register_script(
			'playground', plugins_url( 'playground.js', __FILE__ ), null, '1.0', true
		);
		wp_enqueue_style( 'editor-styles' );
		wp_enqueue_script( 'pijs', 'https://pijs.org/files/pi-1.0.0.js' );
		wp_enqueue_script( 'pijs-extra', 'https://pijs.org/files/pi-extra-1.0.0.js' );
		wp_enqueue_script( 'monaco-editor' );
		wp_enqueue_script( 'playground' );
	}

	function playground_run_program() {
		$response = array(
			'success' => false,
			'code' => '',
		);
		if( !empty( $_POST[ 'code' ] ) ) {
			$response[ 'success' ] = true;
			$response[ 'code' ] = esc_html( $_POST[ 'code' ] );
		}
		wp_send_json( $response );
	}

	function build_template() {
		$content = file_get_contents( plugin_dir_path( __FILE__ ) . 'run-template.php' );
	}

}

new Pijs_Editor();