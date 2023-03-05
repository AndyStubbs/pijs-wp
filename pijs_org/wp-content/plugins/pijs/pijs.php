<?php

/*
Plugin Name: Pijs
Description: A plugin that creates the components of pijs apps
Version: 1.0
Author: Andy Stubbs
*/

class Pijs_Util {

	private $interval = 'hourly';  // 15 minutes

	function __construct() {
		add_action( 'wp_loaded', array( $this, 'schedule_cron_jobs' ) );
		add_shortcode( 'pijs_downloads', array( $this, 'pijs_downloads_shortcode' ) );
	}

	function schedule_cron_jobs() {
		//error_log( "*****************" . time() . "****************************\n", 3, WP_CONTENT_DIR . '/debug.log' );
		if ( ! wp_next_scheduled( 'pijs_clean_cron_job_hook' ) ) {
			//error_log( "First time scheduled\n", 3, WP_CONTENT_DIR . '/debug.log' );
			wp_schedule_event( time(), $this->interval, 'pijs_clean_cron_job_hook' );
		}
		add_action( 'pijs_clean_cron_job_hook', array( $this, 'pijs_clean' ) );
	}

	function deleteFolder( $path ) {
		if ( is_dir( $path ) === true ) {
			$files = array_diff( scandir( $path ), array( '.', '..' ) );
			foreach ( $files as $file ) {
				$this->deleteFolder( realpath( $path ) . '/' . $file );
			}
			return rmdir( $path );
		}
		else if ( is_file( $path ) === true ) {
			return unlink( $path );
		}
		return false;
	}

	function pijs_clean() {
		error_log( "************************\nCalling clean function\n", 3, WP_CONTENT_DIR . '/debug.log' );
		$parent_directory = dirname( ABSPATH );
		$path = $parent_directory . '/pijs-run.org/runs';
		$maxTime = 3600;  // 1 hour
		$date = new DateTimeImmutable();
		$t = $date->getTimestamp();
		$files = array_diff( scandir( $path ), array( '.', '..' ) );
		foreach( $files as $file ) {
			$filepath = $path . '/' . $file;
			if( is_dir( $filepath ) ) {
				$modtime = filemtime( $filepath );
				if( ( $t - $modtime ) > $maxTime ) {
					error_log( "Deleting File: $filepath\n", 3, WP_CONTENT_DIR . '/debug.log' );
					$this->deleteFolder( $filepath );
				}
			}
		}
	}

	function pijs_downloads_shortcode() {
		$filesFull = pijs_get_files_by_version('pi-', '.js');
		$filesMin = pijs_get_files_by_version('pi-', '.min.js');
		$filesMap = pijs_get_files_by_version('pi-', '.min.js.map');

		$allFiles = array_merge($filesFull, $filesMin, $filesMap);

		error_log( "ALL FILES:\n" . print_r( $allFiles, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );

		$groupedFiles = array();

		foreach( $allFiles as $file ) {
			$version = $file[ 'version' ];
			if( !isset( $groupedFiles[ $version ] ) ) {
				$groupedFiles[ $version ] = array();
			}
			$groupedFiles[ $version ][ $file[ 'path' ] ] = $file;
		}

		error_log( "GROUPED FILES:\n" . print_r( $groupedFiles, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );

		$html = '';

		foreach( $groupedFiles as $version => $files ) {
			if( !empty( $files ) ) {
				$created = date( 'Y-m-d', strtotime( reset( $files )[ 'created' ] ) );
				$html .= "<h2>Version $version ($created)</h2>";
				foreach( $files as $path => $file ) {
					$html .= '<li><a href="' . $path . '" download>' . $path . '</a></li>';
				}
			}
		}

		return $html;
	}
}

new Pijs_Util();

require( '_code-example/pijs-code-example.php' );
require( '_my-editor/pijs-editor.php' );
require( '_showcase/pijs-showcase.php' );

new Pijs_Code_Example();
new Pijs_Editor();
new Pijs_Showcase();