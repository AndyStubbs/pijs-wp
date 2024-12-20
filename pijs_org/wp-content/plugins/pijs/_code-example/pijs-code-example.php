<?php

class Pijs_Code_Example {
	private $example_shortcode_name = 'pijs_code_example';
	private $help_page_shortcode_name = 'pijs_help_page';
	private $isFirst = true;
	private $exampleCode = "var examples = [];\n";
	private $examples = 0;

	function __construct() {
		//error_log( "Pijs_Code_Example constructor called\n", 3, WP_CONTENT_DIR . '/debug.log' );

		add_shortcode( $this->example_shortcode_name, array( $this, 'pijs_code_example_shortcode' ) );
		add_shortcode( $this->help_page_shortcode_name, array( $this, 'pijs_help_page_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_action( 'wp_footer', array( $this, 'pijs_code_example_footer' ) );
		add_filter( 'content_save_pre', array( $this, 'process_shortcode_content' ) );
	}

	function register_scripts() {
		$content = get_post()->post_content;
		if( has_shortcode( $content, $this->example_shortcode_name ) ) {
			$this->register_common_scripts();
			return $this->register_example_shortcode_scripts();
		}
		if( has_shortcode( $content, $this->help_page_shortcode_name ) ) {
			$this->register_common_scripts();
			return $this->register_help_shortcode_scripts();
		}
	}

	function register_common_scripts() {
		wp_register_style(
			'highlight-styles', plugins_url( '../libs/highlights/styles/sunburst.css', __FILE__ )
		);
		wp_register_style(
			'example-styles', plugins_url( 'example-styles.css', __FILE__ )
		);
		wp_register_script(
			'highlight-pack', plugins_url( '../libs/highlights/highlight.pack.js', __FILE__ )
		);
		wp_register_script(
			'apply-highlights', plugins_url( 'apply-highlights.js', __FILE__ ), null, '1.0', true
		);
		wp_register_script(
			'examples', plugins_url( 'examples.js', __FILE__ ), null, '1.0', true
		);
	}

	function register_example_shortcode_scripts() {
		//error_log( "register_scripts function called\n", 3, WP_CONTENT_DIR . '/debug.log' );
		wp_enqueue_style( 'highlight-styles' );
		wp_enqueue_style( 'example-styles' );
		wp_enqueue_script( 'pijs', pijs_get_latest_version_url( 'pi-', '.js' ) );
		wp_enqueue_script( 'highlight-pack' );
		wp_enqueue_script( 'apply-highlights' );
		wp_enqueue_script( 'examples' );
	}

	function register_help_shortcode_scripts() {
		wp_register_style(
			'help-styles', plugins_url( 'help-styles.css', __FILE__ )
		);
		wp_register_script(
			'pijs_help', plugins_url( 'help.js', __FILE__ ), null, '1.0', true
		);

		wp_enqueue_style( 'highlight-styles' );
		wp_enqueue_style( 'example-styles' );
		wp_enqueue_style( 'help-styles' );
		wp_enqueue_script( 'pi-examples', pijs_get_file_url( 'pi-examples.js' ) );
		wp_enqueue_script( 'pijs', pijs_get_latest_version_url( 'pi-', '.js' ) );
		wp_enqueue_script( 'highlight-pack' );
		wp_enqueue_script( 'examples' );
		wp_enqueue_script( 'pijs_help' );
	}

	function process_shortcode_content( $content ) {
		$shortcode = $this->example_shortcode_name;
		$start_pos = 0;
		while( $start_pos < strlen( $content ) ) {
			//error_log( $start_pos . "\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
			$shortcode_tag_start_pos = strpos( $content, '[' . $shortcode, $start_pos );
			if( $shortcode_tag_start_pos === false ) {
				//error_log( '[' . $shortcode . ' ' . "Shortcode not found\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
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

				//error_log( "BEGINNING\n" . $content_beg . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
				//error_log( "MIDDLE\n" . $shortcode_content . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
				//error_log( "END\n" . $content_end . "\n\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
			}

			$start_pos = strpos( $content, '[/' . $shortcode, $shortcode_tag_start_pos );
			if( $start_pos === false ) {
				break;
			}
		}
		return $content;
	}

	function pijs_code_example_shortcode( $atts, $content = null ) {
		//error_log( "pijs_code_example_shortcode function called\n", 3, WP_CONTENT_DIR . '/debug.log' );
		$atts = shortcode_atts( array(
			'lang' => 'javascript',
			'no_run' => false,
			'on_close' => ''
		), $atts );
		$content = preg_replace( '/<p[^>]*>/i', '', $content );
		$content = preg_replace( '/<\/p[^>]*>/i', "", $content );
		$content = preg_replace( '/<br[^>]*>/i', "", $content );
		//$content = str_replace( "\n\n", "\n", $content );
		$content = str_replace( '&#215;', 'x', $content );
		$content = str_replace( '&times;', 'x', $content );
		//$this->findNonAsciiChars( $content );
		$content = html_entity_decode( $content, ENT_QUOTES, 'UTF-8' );
		$content = trim( $content );
		$this->findNonAsciiChars( $content );
		if( $atts[ 'lang' ] == 'html' ) {
			$content = htmlentities( $content );
		}
		$id = "id='example-code-$this->examples'";
		$final = "<pre><code $id class='language-{$atts[ 'lang' ]}'>$content</code></pre>";
		$btnClass = 'class="btn-retro btn-red btn-8-14"';
		//error_log( print_r( $atts, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		if( !$atts[ 'no_run' ] && $atts[ 'lang' ] == 'javascript' ) {
			$this->addExampleCode( $content, $atts[ 'on_close' ] );
			$final .= "<input type='button' $btnClass value='Run' onclick='runExample( $this->examples );'>";
			if( $this->isFirst ) {
				$this->isFirst = false;
			}
		} else {
			$this->exampleCode .= "/**** Example $this->examples ****/\nexamples.push( function() { } );\n";
		}
		$final .= "<input type='button' $btnClass value='Copy' onclick='copyExample( $this->examples );'>";
		if( !$atts[ 'no_run' ] && $atts[ 'lang' ] == 'javascript' ) {
			$final .= "<input type='button' $btnClass value='Playground' onclick='gotoPlayground( $this->examples );'>";
		}
		$this->examples += 1;
		//error_log( "$content\n", 3, WP_CONTENT_DIR . '/debug.log' );

		//error_log( "$final\n", 3, WP_CONTENT_DIR . '/debug.log' );
		return $final;
	}

	function pijs_help_page_shortcode() {
		$content = file_get_contents( plugin_dir_path( __FILE__ ) . 'pijs-help-page.php' );
		$content .= $this->get_link_scripts();
		return $content;
	}

	function get_link_scripts() {
		return "<script>" .
			"var g_helpFile = '" . pijs_get_file_url( 'pi-help.json' ) . "';" .
			"var g_playgroundLink = '" . get_site_url() . "/apps/playground';" .
		"</script>";
	}

	function findNonAsciiChars( $input_string ) {
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
			//error_log( print_r( $non_ascii_chars, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
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
		echo "<script>\n" .
				"var g_playgroundLink = '" . get_site_url() . "/apps/playground';" .
			"\n</script>";
	}
}

