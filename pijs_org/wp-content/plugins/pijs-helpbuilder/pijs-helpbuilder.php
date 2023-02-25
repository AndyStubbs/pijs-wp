<?php
/*
Plugin Name: PIJS Help Builder
Description: Allows you to upload a JSON file to build PIJS help content through the WordPress admin menu.
Version: 1.0
Author: Your Name
*/

class PIJS_Help_Builder {

	public function __construct() {
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
		add_action( 'admin_post_pijs_help_builder_upload', array( $this, 'handle_upload' ) );
	}

	// Add the admin menu
	public function admin_menu() {
		add_menu_page(
			'PIJS Help Builder',      // Page title
			'PIJS Help Builder',      // Menu title
			'manage_options',         // Capability
			'pijs-help-builder',      // Menu slug
			array( $this, 'page' )      // Callback function
		);
	}

	// Display the upload form on the admin page
	public function page() {
		?>
		<div class="wrap">
		  <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
		  <form method="post" enctype="multipart/form-data" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
			<input type="hidden" name="action" value="pijs_help_builder_upload" />
			<?php wp_nonce_field('pijs_help_builder_upload', 'pijs_help_builder_upload_nonce'); ?>
			<p>
			  <label for="help_file"><?php esc_html_e('Select a JSON file:', 'pijs-help-builder'); ?></label><br>
			  <input type="file" name="help_file" id="help_file">
			</p>
			<?php submit_button( esc_html__('Upload File', 'pijs-help-builder') ); ?>
		  </form>
		</div>
		<?php
		
	  }
	  

	// Handle the form submission
	public function handle_upload() {
		error_log( 'Handle Upload Started' . "\n", 3, WP_CONTENT_DIR . '/debug.log' );

		error_log( 'POST:' . print_r( $_POST, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
		//pijs_help_builder_upload_nonce
		// Check nonce
		if(!isset($_POST['pijs_help_builder_upload_nonce']) || !wp_verify_nonce($_POST['pijs_help_builder_upload_nonce'], 'pijs_help_builder_upload')) {
			wp_die('Security check failed.');
		}

		error_log( 'Nonce is good' . "\n", 3, WP_CONTENT_DIR . '/debug.log' );

		// Check user capability
		if( !current_user_can( 'manage_options' ) ) {
			wp_redirect( admin_url() );
			exit;
		}

		error_log( 'You have access' . "\n", 3, WP_CONTENT_DIR . '/debug.log' );

		// Check file upload
		if( !isset( $_FILES[ 'help_file' ] ) || !is_uploaded_file( $_FILES[ 'help_file' ][ 'tmp_name' ] ) ) {
			wp_die( 'No file uploaded.' );
		}

		error_log( 'File is detected' . "\n", 3, WP_CONTENT_DIR . '/debug.log' );

		// Read the uploaded file
		$json = file_get_contents( $_FILES[ 'help_file' ][ 'tmp_name' ] );

		// Do something with the JSON data
		// For example, you could save it to a WordPress option or post meta field
		error_log( 'Upload: ' . print_r( $json, true ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );

		// Redirect back to the admin page
		wp_redirect( admin_url( 'admin.php?page=pijs-help-builder' ) );
		exit;
	}
}

// Initialize the plugin
$pijs_help_builder = new PIJS_Help_Builder();
