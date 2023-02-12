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
				"var g_ajaxUrl = '" . admin_url( 'admin-ajax.php' ) . "';" .
			"</script>";
		return $content;
	}

	function register_scripts() {
		if ( is_page() && has_shortcode( get_post()->post_content, 'pijs_playground' ) ) {
			return $this->register_playground_scripts();
		}
	}

	function register_playground_scripts() {
		wp_register_style(
			'editor-styles', plugins_url( 'editor.css', __FILE__ )
		);
		wp_register_script(
			'monaco-editor', plugins_url( 'monaco-editor/min/vs/loader.js', __FILE__ )
		);
		wp_register_script(
			'playground', plugins_url( 'playground.js', __FILE__ ), null, '1.0', true
		);
		//get_latest_version_url( 'pi-extra', '.js' )
		//error_log( 'pi-extra: ' . get_latest_version_url( 'pi-extra-', '.js' ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		wp_enqueue_style( 'editor-styles' );
		wp_enqueue_script( 'pijs-extra', get_latest_version_url( 'pi-extra-', '.js' ) );
		wp_enqueue_script( 'monaco-editor' );
		wp_enqueue_script( 'playground' );
	}

	function playground_run_program() {
		$response = array(
			'success' => false,
			'project_id' => '',
		);
		$code = '';
		//error_log( 'Post: ' . print_r( $_POST[ 'code' ], true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		if( !empty( $_POST[ 'code' ] ) ) {
			$response[ 'success' ] = true;
			$code = $_POST['code'];
			$code = base64_decode( $_POST[ 'code' ] );
			//error_log( 'Code: ' . $code . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		}
		if( ! session_id() ) {
			session_start();
		}
		if( !isset( $_SESSION[ 'project_id' ] ) ) {
			$_SESSION[ 'project_id' ] = $this->uniqidReal( 6 );
		}
		$response[ 'project_id' ] = $_SESSION[ 'project_id' ];
		$pijsFile = get_latest_version_url( 'pi-', '.js' );
		$code = str_replace( "\n", "\n\t\t\t", $code );
		$scripts = "<script src='$pijsFile'></script>\n\t\t<script>\n\t\t\t$code\n\t\t</script>";
		$this->build_template( 'Playground', $scripts );
		wp_send_json( $response );
	}

	function build_template( $title, $scripts ) {
		$template = file_get_contents( plugin_dir_path( __FILE__ ) . 'run-template.php' );
		$template = str_replace( '[TITLE]', $title, $template );
		$template = str_replace( '[SCRIPTS]', $scripts, $template );
		$parent_directory = dirname( ABSPATH );
		$pathname = $parent_directory . '/pijs-run.org/runs/' . $_SESSION[ 'project_id' ];
		$filename = $pathname . '/index.php';
		//error_log( "$pathname\n", 3, WP_CONTENT_DIR . '/debug.log' );
		//error_log( "$filename\n", 3, WP_CONTENT_DIR . '/debug.log' );
		if( ! file_exists( $pathname ) ) {
			mkdir( $pathname, 0777, true );
		} else {
			touch( $pathname );
		}
		file_put_contents( $filename, $template );
	}

	function uniqidReal( $length = 13 ) {
		// uniqid gives 13 chars, but you could adjust it to your needs.
		if ( function_exists( 'random_bytes' ) ) {
			$bytes = random_bytes( ceil( $length / 2 ) );
		} elseif ( function_exists( 'openssl_random_pseudo_bytes' ) ) {
			$bytes = openssl_random_pseudo_bytes( ceil( $length / 2 ) );
		} else {
			throw new Exception( 'no cryptographically secure random function available' );
		}
		return substr( bin2hex( $bytes ), 0, $length );
	}

}

new Pijs_Editor();