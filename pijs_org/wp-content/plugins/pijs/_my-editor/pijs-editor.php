<?php
/*
Plugin Name: Pijs Editor
Description: A plugin that creates a code editor
Version: 1.0
Author: Andy Stubbs
*/

class Pijs_Editor {

	private $scripts;
	private $errors;
	private $projectfiles;

	function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );
		add_shortcode( 'pijs_playground', array( $this, 'playground_shortcode' ) );
		add_shortcode( 'pijs_editor', array( $this, 'editor_shortcode' ) );
		add_action('wp_ajax_playground_run_program', array( $this, 'playground_run_program' ) );
		add_action('wp_ajax_nopriv_playground_run_program', array( $this, 'playground_run_program' ) );
		add_action('wp_ajax_editor_run_program', array( $this, 'editor_run_program' ) );
		add_action('wp_ajax_nopriv_editor_run_program', array( $this, 'editor_run_program' ) );
		add_filter( 'upload_size_limit', array( $this, 'pijs_ajax_upload_max_size' ), 10, 1 );
	}

	function isSameSite() {
		$referer = $_SERVER[ 'HTTP_REFERER' ];
		$site_url = get_site_url();
		return strpos( $referer, $site_url ) === 0;
	}

	function playground_shortcode() {
		//error_log( 'CODE: ' . print_r( $_POST, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		
		$content = '';
		if( $this->isSameSite() && isset( $_POST[ 'code' ] ) ) {
			$code = $_POST[ 'code' ];
			$content .= "<script>g_playgroundCode = '$code';</script>";
		} else {
			$content .= "<script>g_playgroundCode = false;</script>";
		}
		$content .= file_get_contents( plugin_dir_path( __FILE__ ) . '/playground-body.php' );
		$content .= $this->get_link_scripts();
		return $content;
	}

	function editor_shortcode() {
		$content = file_get_contents( plugin_dir_path( __FILE__ ) . '/editor-body.php' );
		$content .= $this->get_link_scripts();
		return $content;
	}

	function get_link_scripts() {
		return "<script>" .
			"var g_monacoPath = '" .  plugins_url( '../libs/monaco-editor', __FILE__ ) . "';" .
			"var g_ajaxUrl = '" . admin_url( 'admin-ajax.php' ) . "';" .
		"</script>";
	}

	function register_scripts() {
		if( is_page() ) {
			$content = get_post()->post_content;
			if( has_shortcode( $content, 'pijs_playground' ) ) {
				$this->register_common_scripts();
				return $this->register_playground_scripts();
			}
			if( has_shortcode( $content, 'pijs_editor' ) ) {
				$this->register_common_scripts();
				return $this->register_editor_scripts();
			}
		}
	}

	function register_common_scripts() {
		wp_register_style(
			'playground-styles', plugins_url( 'playground.css', __FILE__ )
		);
		wp_register_style(
			'editor-styles', plugins_url( 'editor.css', __FILE__ )
		);
		wp_register_style(
			'page-styles', plugins_url( 'editor-page.css', __FILE__ )
		);
		wp_register_script(
			'filesaver', plugins_url( '../libs/filesaver.js', __FILE__ )
		);
		wp_register_script(
			'jszip-utils', plugins_url( '../libs/jszip-utils.min.js', __FILE__ )
		);
		wp_register_script(
			'jszip', plugins_url( '../libs/jszip.min.js', __FILE__ )
		);
		wp_register_script(
			'myindexdb', plugins_url( '../libs/db.js', __FILE__ )
		);
		wp_register_script(
			'monaco-editor', plugins_url( '../libs/monaco-editor/min/vs/loader.js', __FILE__ )
		);
		wp_register_script(
			'playground', plugins_url( 'playground.js', __FILE__ ), null, '1.0', true
		);
		wp_register_script(
			'editor-files', plugins_url( 'files.js', __FILE__ ), null, '1.0', true
		);
		wp_register_script(
			'editor-util', plugins_url( 'util.js', __FILE__ ), null, '1.0', true
		);
		wp_register_script(
			'editor-main', plugins_url( 'main.js', __FILE__ ), null, '1.0', true
		);
		wp_register_script(
			'editor-layout', plugins_url( 'layout.js', __FILE__ ), null, '1.0', true
		);
		wp_register_script(
			'editor-editor', plugins_url( 'editor.js', __FILE__ ), null, '1.0', true
		);
	}

	function register_playground_scripts() {
		//pijs_get_latest_version_url( 'pi-extra', '.js' )
		//error_log( 'pi-extra: ' . pijs_get_latest_version_url( 'pi-extra-', '.js' ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		wp_enqueue_style( 'editor-styles' );
		wp_enqueue_style( 'playground-styles' );
		wp_enqueue_script( 'pijs-extra', pijs_get_latest_version_url( 'pi-extra-', '.js' ) );
		wp_enqueue_script( 'monaco-editor' );
		wp_enqueue_script( 'playground' );
	}

	function register_editor_scripts() {
		//pijs_get_latest_version_url( 'pi-extra', '.js' )
		//error_log( 'pi-extra: ' . pijs_get_latest_version_url( 'pi-extra-', '.js' ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		wp_enqueue_style( 'editor-styles' );
		wp_enqueue_style( 'page-styles' );
		wp_enqueue_script( 'pijs-extra', pijs_get_latest_version_url( 'pi-extra-', '.js' ) );
		wp_enqueue_script( 'filesaver' );
		wp_enqueue_script( 'jszip-utils' );
		wp_enqueue_script( 'jszip' );
		wp_enqueue_script( 'myindexdb' );
		wp_enqueue_script( 'monaco-editor' );
		wp_enqueue_script( 'editor-files' );
		wp_enqueue_script( 'editor-util' );
		wp_enqueue_script( 'editor-main' );
		wp_enqueue_script( 'editor-layout' );
		wp_enqueue_script( 'editor-editor' );
	}

	function pijs_ajax_upload_max_size( $size ) {
		if (
			isset( $_REQUEST[ 'action' ] ) && (
				$_REQUEST[ 'action' ] == 'playground_run_program' ||
				$_REQUEST[ 'action' ] == 'editor_run_program' 
			)
		) {
			return 6 * 1024 * 1024; // 6 MB in bytes
		}
		return $size;
	}

	function playground_run_program() {
		$response = array(
			'success' => false,
			'project_id' => '',
		);
		if( !$this->isSameSite() ) {
			wp_send_json( $response );
			return;
		}
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
		if( !isset( $_SESSION[ 'playground_id' ] ) ) {
			$_SESSION[ 'playground_id' ] = $this->uniqidReal( 6 );
		}
		//error_log( 'Post: ' . print_r( $_SESSION, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		$response[ 'project_id' ] = $_SESSION[ 'playground_id' ];
		$pijsFile = pijs_get_latest_version_url( 'pi-', '.js' );
		$code = str_replace( "\n", "\n\t\t\t", $code );
		$scripts = "<script src='$pijsFile'></script>\n\t\t<script>\n\t\t\t$code\n\t\t</script>";
		$this->build_template( 'Playground', $scripts, $_SESSION[ 'playground_id' ] );
		wp_send_json( $response );
	}

	function build_template( $title, $scripts, $projectId ) {
		$template = file_get_contents( plugin_dir_path( __FILE__ ) . 'run-template.php' );
		$template = str_replace( '[TITLE]', $title, $template );
		$template = str_replace( '[SCRIPTS]', $scripts, $template );
		$parent_directory = dirname( ABSPATH );
		$pathname = $parent_directory . '/pijs-run.org/runs/' . $projectId;
		$filename = $pathname . '/index.php';
		//error_log( "$template\n", 3, WP_CONTENT_DIR . '/debug.log' );
		//error_log( "$filename\n", 3, WP_CONTENT_DIR . '/debug.log' );
		if( ! file_exists( $pathname ) ) {
			mkdir( $pathname, 0777, true );
		} else {
			touch( $pathname );
		}
		file_put_contents( $filename, $template );
	}

	function editor_run_program() {
		if( !$this->isSameSite() ) {
			$response = array(
				'success' => false,
				'project_id' => '',
			);
			wp_send_json( $response );
			return;
		}
		if( ! session_id() ) {
			session_start();
		}
		$isNewSession = false;
		if( !isset( $_SESSION[ 'project_id' ] ) ) {
			$_SESSION[ 'project_id' ] = $this->uniqidReal( 6 );
			$isNewSession = true;
		}
		$response = array(
			'success' => true,
			'project_id' => $_SESSION[ 'project_id' ],
			'needsRefresh' => false
		);
		$isFullProject = filter_var( $_POST[ 'isFullProject' ], FILTER_VALIDATE_BOOLEAN );
		$doesProjectExist = file_exists( $this->getProjectPath() );

		/*
		if( !$isFullProject ) {
			error_log( 'IS NOT FULL PROJECT' . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		}
		if( !$doesProjectExist ) {
			error_log( 'PROJECT FILES DO NOT EXIST' . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		}
		if( $isNewSession ) {
			error_log( 'IS A NEW SESSION' . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		}
		*/

		if(
			!$isFullProject &&
			( !$doesProjectExist || $isNewSession )
		) {
			//error_log( 'NEEDS REFRESH' . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
			$response[ 'needsRefresh' ] = true;
			$response[ 'success' ] = false;
			wp_send_json( $response );
			return;
		}
		$pijsFile = pijs_get_latest_version_url( 'pi-', '.js' );
		$this->scripts = "<script src='$pijsFile'></script>";
		$this->buildFiles( $_POST[ 'files' ], '' );
		$this->build_template( htmlentities( $_POST[ 'title' ] ), $this->scripts, $_SESSION[ 'project_id' ] );
		wp_send_json( $response );
	}

	function getProjectPath() {
		$parent_directory = dirname( ABSPATH );
		return $parent_directory . '/pijs-run.org/runs/' . $_SESSION[ 'project_id' ];
	}

	function buildFiles( $file, $path ) {
		//error_log( 'Build File: ' . $file[ 'name' ] . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		$projectpath = $this->getProjectPath();
		$name = preg_replace( '/[^a-zA-Z0-9_ \-\.]/', '', $file[ 'name' ] );
		if( $file[ 'type' ] === 'folder' ) {
			//error_log( "FILE IS FOLDER\n", 3, WP_CONTENT_DIR . '/debug.log' );
			if( $path . '/' . $name !== '/root' ) {
				$newpath = $path . '/' . $name;
				//echo 'Making dir: ' . $projectpath . $newpath . "-- \n";
				if( !file_exists( $projectpath . $newpath ) ) {
					mkdir( $projectpath . $newpath, 0777, true );
				} else {
					touch( $projectpath. $newpath );
				}
			} else {
				//echo 'Skipping root dir: ' . $path . "-- \n";
				$newpath = $path;
			}
			if( array_key_exists( 'content', $file ) ) {
				foreach( $file[ 'content' ] as $subFile ) {
					$this->buildFiles( $subFile, $newpath );
				}
			} else {
				//logText( print_r( $file, true ) );
			}
		} else {
			if( $file[ 'type' ] === 'javascript' ) {
				if( $path !== '' ) {
					$filename = $path . '/' . $name . '.js';	
				} else {
					$filename = $name . '.js';
				}
				$filepath = $projectpath . $path . '/' . $name. '.js';
				if( substr( $filename, 0, 1 ) === '/' ) {
					$filename = substr( $filename, 1 );
				}
				$this->scripts .= "\n\t\t" . '<script src="' . $filename . '"></script>';
				if( array_key_exists( 'content', $file ) ) {
					file_put_contents( $filepath, base64_decode( $file[ 'content' ] ) );
				} else {
					touch( $filepath );
				}
			} elseif ( $file[ 'type' ] === 'image' ) {
				$filepath = $projectpath . $path . '/' . $name;
				if( array_key_exists( 'content', $file ) ) {
					$this->convertToImage( $file[ 'content' ], $filepath );
				} else {
					touch( $filepath . $file[ 'extension' ] );
				}
			} elseif ( $file[ 'type' ] === 'audio' ) {
				$filepath = $projectpath . $path . '/' . $name;
				if( array_key_exists( 'content', $file ) ) {
					$this->convertToAudio( $file[ 'content' ], $filepath );
				} else {
					touch( $filepath . $file[ 'extension' ] );
				}
			}
		}
	}

	function convertToImage( $content, $filename ) {
		//error_log( "Convert to Image: $filename\n", 3, WP_CONTENT_DIR . '/debug.log' );
		//error_log( "**********************\n\n$content\n\n*********************\n\n", 3, WP_CONTENT_DIR . '/debug.log' );
		$start = strpos( $content, 'data:' ) + 5;
		$end = strpos( $content, ';', $start );
		$imageType = substr( $content, $start, $end - $start );
		$b64 = substr( $content, strpos( $content, 'base64,' ) + 7 );

		//echo $filename;
		//echo " -- \n";
		//echo $imageType;
		//echo " -- \n";
		//echo $b64;

		// Obtain the original content (usually binary data)
		$bin = base64_decode( $b64 );

		ob_start();

		// Load GD resource from binary data
		$im = imageCreateFromString( $bin );

		ob_end_clean();

		// Make sure that the GD library was able to load the image
		// This is important, because you should not miss corrupted or unsupported images
		if ( !$im ) {
			return;
		}
		switch( $imageType ) {
			case 'image/bmp':
				imagebmp( $im, $filename . '.bmp' );
				break;
			case 'image/gif':
				imagegif( $im, $filename . '.gif' );
				break;
			case 'image/jpeg':
				imagejpg( $im, $filename . '.jpg' );
				break;
			case 'image/png':
				imagepng( $im, $filename . '.png' );
				break;
			case 'image/webp':
				imagewebp( $im, $filename . '.webp' );
				break;
			default: return false;
		}
	}

	function convertToAudio( $content, $filename ) {
		$start = strpos( $content, 'data:' ) + 5;
		$end = strpos( $content, ';', $start );
		$audioType = substr( $content, $start, $end - $start );
		$b64 = substr( $content, strpos( $content, 'base64,' ) + 7 );

		// Obtain the original content (usually binary data)
		$bin = base64_decode( $b64 );

		// Get the extension from audioType
		switch( $audioType ) {
			case 'audio/wave':
				$filename .= '.wav';
				break;
			case 'audio/wav':
				$filename .= '.wav';
				break;
			case 'audio/x-wav':
				$filename .= '.wav';
				break;
			case 'audio/x-pn-wav':
				$filename .= '.wav';
				break;
			case 'audio/webm':
				$filename .= '.webm';
				break;
			case 'audio/ogg':
				$filename .= '.ogg';
				break;
			case 'audio/mpeg':
				$filename .= '.mp3';
				break;
			case 'audio/mid':
				$filename .= '.mid';
				break;
			case 'audio/mp4':
				$filename .= '.mp4';
				break;
			default:
				return;
		}
		file_put_contents( $filename, $bin );
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