<?php
/*
Plugin Name: Pijs List Child Pages
Description: Adds a shortcode to list all child pages of the current page
Version: 1.0
Author: Andy Stubbs
*/

class Pijs_List_Child_Pages {

	function __construct() {
		add_shortcode( 'child_pages', array( $this, 'list_child_pages_shortcode' ) );
	}

	function list_child_pages_shortcode() {
		global $post;

		// Get all child pages
		$child_pages = get_pages( array( 'child_of' => $post->ID ) );

		// Check if there are any child pages
		if ( ! empty( $child_pages ) ) {
			// Start the list
			$output = '<ul>';

			// Loop through the child pages
			foreach ( $child_pages as $page ) {
				$output .= '<li><a href="' . get_page_link( $page->ID ) . '">' . $page->post_title . '</a></li>';
			}

			// End the list
			$output .= '</ul>';
		} else {
			// If there are no child pages, display a message
			$output = '<p>No child pages found.</p>';
		}

		return $output;
	}

}

new Pijs_List_Child_Pages();
