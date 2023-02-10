<?php
/*
Plugin Name: Pijs Code Example
Description: A plugin that creates a runnable example on the page.
Version: 1.0
Author: Andy Stubbs
*/

class Pijs_Code_Example {
	private $example_shortcode_name = 'pijs_code_example';
	private $isFooterActive = false;
	private $exampleCode = "var examples = [];\n";
	private $examples = 0;

	function __construct() {
		//error_log( "Pijs_Code_Example constructor called\n", 3, WP_CONTENT_DIR . '/debug.log' );

		add_shortcode( $this->example_shortcode_name, array( $this, 'pijs_code_example_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_action( 'wp_footer', array( $this, 'pijs_code_example_footer' ) );
		add_filter( 'content_save_pre', array( $this, 'process_shortcode_content' ) );
	}

	function register_scripts() {
		//error_log( "register_scripts function called\n", 3, WP_CONTENT_DIR . '/debug.log' );
		wp_register_style(
			'highlight-styles', plugins_url( 'highlights/styles/sunburst.css', __FILE__ )
		);
		wp_register_style(
			'example-styles', plugins_url( 'example-styles.css', __FILE__ )
		);
		wp_register_script(
			'highlight-pack', plugins_url( 'highlights/highlight.pack.js', __FILE__ )
		);
		wp_register_script(
			'apply-highlights', plugins_url( 'apply-highlights.js', __FILE__ ), null, '1.0', true
		);
		wp_register_script(
			'examples', plugins_url( 'examples.js', __FILE__ ), null, '1.0', true
		);
		wp_enqueue_style( 'highlight-styles' );
		wp_enqueue_style( 'example-styles' );
		wp_enqueue_script( 'pijs', 'https://pijs.org/files/pi-1.0.0.js' );
		wp_enqueue_script( 'highlight-pack' );
		wp_enqueue_script( 'apply-highlights' );
		wp_enqueue_script( 'examples' );
	}


	function process_shortcode_content2( $content ) {
		$shortcode = $this->example_shortcode_name;
		$pattern = get_shortcode_regex( array( $shortcode ) );
		preg_match_all( '/' . $pattern . '/s', $content, $matches );
		foreach( $matches[ 0 ] as $match ) {
			$new_content = html_entity_decode( $match, ENT_QUOTES, 'UTF-8' );
			$new_content = htmlentities( $new_content, ENT_QUOTES, 'UTF-8' );
			$content = str_replace( $match, $new_content, $content );
		}
		return $content;
	}

	function process_shortcode_content3( $content ) {
		$shortcode = $this->example_shortcode_name;
		$pattern = get_shortcode_regex( array( $shortcode ) );
		preg_match_all( '/' . $shortcode . '\s*\](.*)\[\/' . $shortcode . '/s', $content, $matches );
		error_log( print_r( $matches, true ) . "\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
		foreach( $matches[1] as $match ) {
			$shortcode_content = $match[0];
			error_log( "$shortcode_content\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
			$new_content = html_entity_decode( $shortcode_content, ENT_QUOTES, 'UTF-8' );
			$new_content = htmlentities( $new_content, ENT_QUOTES, 'UTF-8' );
			$content = str_replace( $shortcode_content, $new_content, $content );
		}
		return $content;
	}

	function process_shortcode_content( $content ) {
		$shortcode = $this->example_shortcode_name;
		$start_pos = 0;
		while( $start_pos < strlen( $content ) ) {
			error_log( $start_pos . "\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
			$shortcode_tag_start_pos = strpos( $content, '[' . $shortcode, $start_pos );
			if( $shortcode_tag_start_pos === false ) {
				error_log( '[' . $shortcode . ' ' . "Shortcode not found\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
				//$input_string .= substr( $input_string, $start_pos );
				break;
			} else {
				$shortcode_tag_end_pos = strpos( $content, ']', $shortcode_tag_start_pos );
				if( $shortcode_tag_end_pos === false ) {
					break;
				}
				$shortcode_content_start = $shortcode_tag_end_pos + 1;
				$shortcode_content_end = strpos( $content, '[/' . $shortcode, $shortcode_tag_start_pos );
				if( $shortcode_content_end === false ) {
					break;
				}
				$shortcode_content_length = $shortcode_content_end - $shortcode_content_start;
				$shortcode_content = substr( $content, $shortcode_content_start, $shortcode_content_length );
				$shortcode_content = html_entity_decode( $shortcode_content, ENT_QUOTES, 'UTF-8' );
				$shortcode_content = htmlentities( $shortcode_content, ENT_QUOTES, 'UTF-8' );

				$content_beg = substr( $content, 0, $shortcode_content_start  );
				$content_end = substr( $content, $shortcode_content_end );
				$content = $content_beg . $shortcode_content . $content_end;

				error_log( "BEGINNING\n" . $content_beg . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
				error_log( "MIDDLE\n" . $shortcode_content . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
				error_log( "END\n" . $content_end . "\n\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
			}

			$start_pos = strpos( $content, '[/' . $shortcode, $shortcode_tag_start_pos );
			if( $start_pos === false ) {
				break;
			}
		}
		return $content;
	}

	function pijs_code_example_shortcode( $atts, $content = null ) {
		$atts = shortcode_atts( array(
			'lang' => 'javascript',
			'no_run' => false,
			'on_close' => ''
		), $atts );
		$content = preg_replace( '/<br[^>]*>/i', '', $content );
		$content = str_replace( '&#215;', 'x', $content );
		$content = str_replace( '&times;', 'x', $content );
		//$this->findNonAsciiChars( $content );
		$content = html_entity_decode( $content, ENT_QUOTES, 'UTF-8' );
		$content = trim( $content );
		$this->findNonAsciiChars( $content );
		$id = "id='example-code-$this->examples'";
		$final = "<pre><code $id class='language-{$atts[ 'lang' ]}'>$content</code></pre>";
		if( !$atts[ 'no_run' ] ) {
			$this->addExampleCode( $content, $atts[ 'on_close' ] );
			$btnClass = 'class="btn-retro btn-red btn-8-14"';
			$final .= "<input type='button' $btnClass value='Run' onclick='runExample( $this->examples );'>";
			$final .= "<input type='button' $btnClass value='Copy' onclick='copyExample( $this->examples );'>";
			if( !$this->isFooterActive ) {
				$this->isFooterActive = true;
			}
			$this->examples += 1;
		}
		//error_log( "$content\n", 3, WP_CONTENT_DIR . '/debug.log' );
		return $final;
	}

	function findNonAsciiChars($input_string) {
		$non_ascii_chars = array();
		$msg = '';
		for( $i = 0; $i < strlen( $input_string ); $i++ ) {
			$char = $input_string[ $i ];
			$line = $char . ' - ' . ord( $char ) . "\n";
			$msg .= $line;
			if( ord( $char ) > 127 ) {
				array_push( $non_ascii_chars, $line );
			}
		}
		if( count( $non_ascii_chars ) > 0 ) {
			error_log( print_r( $non_ascii_chars, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
			//error_log( $msg . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		}
		//return $non_ascii_chars;
	}

	function addExampleCode( $code, $codeOnclose ) {
		$code = $this->insertScreenContainer( $code );
		$this->exampleCode .= "/**** Example $this->examples ****/\nexamples.push( function() {\n$code\nonExampleClose = function () { $codeOnclose };\n } );\n";
	}

	function insertScreenContainer( $input_string ) {
		$insert_text = ', "canvasContainer"';
		$start_pos = 0;
		while( $start_pos < strlen( $input_string ) ) {
			$screen_pos = strpos( $input_string, 'screen(', $start_pos );
			if( $screen_pos === false ) {
				//$input_string .= substr( $input_string, $start_pos );
				break;
			} else {
				$end = strpos( $input_string, ')', $screen_pos );
				$input_string = substr_replace( $input_string, $insert_text, $end, 0 );
			}
			$start_pos = strpos( $input_string, ')', $screen_pos ) + 1;
		}
		return $input_string;
	}

	function pijs_code_example_footer() {
		//error_log( "FOOTER $this->exampleCode \n", 3, WP_CONTENT_DIR . '/debug.log' );
		if( $this->examples === 0 ) {
			return;
		}
		$btnClass = 'class="btn-retro btn-red btn-8-14 btn-large"';
		echo "<div id='exampleBox' style='display: none;'>\n" .
				"<div id='canvasContainer'></div>\n" .
				"<input type='button' $btnClass id='closeExample' value='Close' onclick='closeExample()' />\n" .
				"<input type='button' $btnClass id='clearFocus' value='' />\n" .
			"</div>\n";
		echo "<script>\n$this->exampleCode\n</script>";
	}
}

new Pijs_Code_Example();
