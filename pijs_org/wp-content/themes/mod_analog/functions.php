<?php
/**
 * AnaLog functions and definitions
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package AnaLog
 */

/**
 * analog setup
 */
if ( ! function_exists( 'analog_setup' ) ) :
	/**
	 * Sets up theme defaults and registers support for various WordPress features.
	 *
	 * Note that this function is hooked into the after_setup_theme hook, which
	 * runs before the init hook. The init hook is too late for some features, such
	 * as indicating support for post thumbnails.
	 */
	function analog_setup() {
		/*
		 * Make theme available for translation.
		 * Translations can be filed in the /languages/ directory.
		 * If you're building a theme based on X-Simply, use a find and replace
		 * to change 'analog' to the name of your theme in all the template files.
		 */
		load_theme_textdomain( 'analog', get_template_directory() . '/languages' );

		// Add default posts and comments RSS feed links to head.
		add_theme_support( 'automatic-feed-links' );

		/*
		 * Let WordPress manage the document title.
		 * By adding theme support, we declare that this theme does not use a
		 * hard-coded <title> tag in the document head, and expect WordPress to
		 * provide it for us.
		 */
		add_theme_support( 'title-tag' );

		/*
		 * Enable support for Post Thumbnails on posts and pages.
		 *
		 * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
		 */
		add_theme_support( 'post-thumbnails' );

		// This theme uses wp_nav_menu() in one location.
		register_nav_menus( array(
			'menu-1' => esc_html__( 'Primary', 'analog' ),
			'menu-2' => esc_html__( 'Secondary (no hierarchical entries)', 'analog' ),
			'menu-3' => esc_html__( 'Primary-Mobile', 'analog' ), //[MOD_PIJS]
		) );

		/*
		 * Switch default core markup for search form, comment form, and comments
		 * to output valid HTML5.
		 */
		add_theme_support( 'html5', array(
			'search-form',
			'comment-form',
			'comment-list',
			'gallery',
			'caption',
		) );

		// Set up the WordPress core custom background feature.
		add_theme_support( 'custom-background', apply_filters( 'analog_custom_background_args', array(
			'default-color' => '8BC5DD',
			'default-image' => '',
		) ) );

		// Add theme support for selective refresh for widgets.
		add_theme_support( 'customize-selective-refresh-widgets' );

		/**
		 * Add support for core custom logo.
		 *
		 * @link https://codex.wordpress.org/Theme_Logo
		 */
		add_theme_support( 'custom-logo', array(
			'height'      => 120,
			'width'       => 300,
			'flex-width'  => true,
			'flex-height' => false,
		) );
		
		// responsive embeds
		add_theme_support( "responsive-embeds" );

		// align wide
		add_theme_support( "align-wide" );

		// block styles
		add_theme_support( "wp-block-styles" );
		
		// refresh widgets
		add_theme_support( 'customize-selective-refresh-widgets' );
		
		/**
		 * Add editor style
		 * 
		 * @link https://developer.wordpress.org/reference/functions/add_editor_style/
		 */
		add_theme_support( 'editor-styles' );
		add_editor_style( trailingslashit( get_template_directory_uri() ) . 'css/editor-style.css' );
		
		/**
		 * Add Custom font to editor style
		 */
		$selected_font = get_theme_mod( 'analog_typography_choices', 'ibm_plex_mono' );
		$fonts = analog_fonts();
		$font  = sanitize_text_field( str_replace(" ", "+", $fonts[$selected_font] ) );
		$font_url = str_replace( ',', '%2C', "//fonts.googleapis.com/css?family={$font}:400,400i,700,700i&display=swap" );
		add_editor_style( $font_url );
	}
endif;
add_action( 'after_setup_theme', 'analog_setup' );

/**
 * Set the content width in pixels, based on the theme's design and stylesheet.
 *
 * Priority 0 to make it available to lower priority callbacks.
 *
 * @global int $content_width
 */
function analog_content_width() {
	// This variable is intended to be overruled from themes.
	// Open WPCS issue: {@link https://github.com/WordPress-Coding-Standards/WordPress-Coding-Standards/issues/1043}.
	// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound
	$GLOBALS['content_width'] = apply_filters( 'analog_content_width', 640 );
}
add_action( 'after_setup_theme', 'analog_content_width', 0 );

/**
 * Register widget area.
 *
 * @link https://developer.wordpress.org/themes/functionality/sidebars/#registering-a-sidebar
 */
function analog_widgets_init() {
	
	register_sidebar( array(
		'name'          => esc_html__( 'Sidebar', 'analog' ),
		'id'            => 'sidebar-1',
		'description'   => esc_html__( 'Add widgets here.', 'analog' ),
		'before_widget' => '<section id="%1$s" class="widget %2$s">',
		'after_widget'  => '</section>',
		'before_title'  => '<h2 class="widget-title">',
		'after_title'   => '</h2>',
	) );
}
add_action( 'widgets_init', 'analog_widgets_init' );

/**
 * Normalize char size for tag cloud widget
 * 
 * @var $args array
 * @return array
 */
function analog_set_tag_cloud_font_size($args) {

	// normalize size
    $args['smallest'] = 14; /* Set the smallest size to 14px */
	$args['largest'] = 14;  /* set the largest size to 14px */
	
    return $args; 
}
add_filter('widget_tag_cloud_args','analog_set_tag_cloud_font_size');

/**
 * Get font styles
 * 
 * @return array
 */
function analog_get_font_styles() {
	
	$font_sw = analog_font_styles();
	$capture = array();
	foreach( $font_sw as $k => $v ) {
		$r = (bool) get_theme_mod( 'analog_sw_' . $k );
		if( $r === true ) {
			$capture[] = $k;
		}
	}
	
	if( empty( $capture ) ) {
		$capture = ['400','400i','700','700i'];
	}
	
	return $capture;
	
}

/**
 * Enqueue scripts and styles.
 * 
 * @return void
 */
function analog_scripts(){
    
    // deregister Dashicons on front-end
    if( ! is_customize_preview() ) {
    	wp_deregister_style('dashicons');
	}

	if ( is_page_template( 'page-pixel.php' ) ) {
		return;
	}

    // load fontello
    wp_enqueue_style('analog-fontello', get_template_directory_uri() . '/assets/fontello/css/fontello.css' );
	
	$font_styles = implode(',', analog_get_font_styles() );

	// append font
	$selected_font = get_theme_mod( 'analog_typography_choices', 'ibm_plex_mono' );
	if( $selected_font !== 'system_ui' ) {
		$fonts = analog_fonts();
		$font  = sanitize_text_field( str_replace(" ", "+", $fonts[$selected_font] ) );
		$tag   = sanitize_title( $fonts[$selected_font] );
		$url   = esc_url( "https://fonts.googleapis.com/css?family={$font}:{$font_styles}&display=swap" );
		wp_enqueue_style( "analog-{$tag}", "{$url}");
	}
	
	// get main style
	wp_enqueue_style( 'analog-style', get_stylesheet_uri() );

	// css for device
	wp_enqueue_style( 'analog-device', get_template_directory_uri() . '/css/device.css' );

	wp_enqueue_script( 'analog-menu-nav', get_template_directory_uri() . '/js/menu-nav.js', array('jquery'), '1.0', true );

	wp_enqueue_script( 'analog-skip-link-focus-fix', get_template_directory_uri() . '/js/skip-link-focus-fix.js', array(), '20151215', true );

	// thread comments
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
		wp_enqueue_script( 'comment-reply' );
	}
}
add_action( 'wp_enqueue_scripts', 'analog_scripts' );

/**
 * Add inline css rules for AnaLog theme
 * 
 * @return void
 */
function analog_inline_css() {
	
	// an empty array to transport css rules
	$analog_css_rules = array();
	
	// add typography
	$selected_font = get_theme_mod( 'analog_typography_choices', 'ibm_plex_mono' );
	$fonts = analog_fonts();
	
	if( $selected_font !== 'system_ui' ) {
		$font = sanitize_text_field( $fonts[$selected_font] );
		$fs = '';
		$analog_css_rules[] = "body { font-family: \"{$font}\";{$fs} }";
	}
	
	// font size 
	$font_size = (string) get_theme_mod( 'analog_fontsize_choices', 'normal' );
	if( $font_size !== 'normal') {
		switch( $font_size ) {
			case 'small': $size = "16px"; break;
			case 'big': $size = "20px"; break;
		}
		$analog_css_rules[] = "body { font-size: {$size}; }";
	}

	// colors
	$analog_colors = analog_colors();
	foreach( $analog_colors as $k => $v ) {

		$value = sanitize_hex_color( get_theme_mod( $k, $v['default'] ) );
        $target = sanitize_text_field( $v['target'] );
        $css = sanitize_text_field( $v['css'] );
		$analog_css_rules[] = $target . ' {' .  $css . ':' . $value . ';}';
		if( $k === 'analog_content_link_color' ) {
			$hover = str_replace(' a', ' a:hover', $target );
			$value = '#000; border-bottom: 1px dotted #000001;';
			$analog_css_rules[] = $hover . ' {' .  $css . ':' . $value . '}';
		}
	}
	
	/**
	 * Semi-transparent background
	 */
	
	if( !empty( $analog_css_rules ) ) {
		$analog_css_rules_string = implode( PHP_EOL, $analog_css_rules );
		echo '<style type="text/css" id="analog-inline-css">';
		echo "{$analog_css_rules_string}";
		echo '</style>';
	}
}
add_action('wp_head', 'analog_inline_css', 9999 );

/**
 * Add inline js rules for AnaLog theme
 * 
 * @return void
 */
function analog_inline_js() {
	
	if( (bool) get_theme_mod( 'analog_ico_link_enable', 0 ) === true ) {
	
	$default_exclude = analog_icon_links_target_not();
	$target_exclude = trim( get_theme_mod('analog_ico_link_not', $default_exclude ) );
	$only_external  = get_theme_mod('analog_ico_link_ext', 0 );
	?>
	<script type="text/javascript" id="ico-link-js">
		var target_include = '.entry-content a, .comment-content a'; // only in content post/page or comments
		var target_exclude = '<?php echo sanitize_text_field( $target_exclude ); ?>';
		var only_external = '<?php echo absint( $only_external ); ?>';
		
		jQuery( function($) {
			
			/**
			 * Detected external link
			 */
			
			if( only_external == 1 ) {
				$(target_include).not(target_exclude).filter(function() {
					return this.hostname && this.hostname !== location.hostname;
				}).addClass("ico-link ico-external-link").removeClass('ico-internal-link');
			} else {
                $(target_include).not(target_exclude).filter(function() {
					if( this.hostname && this.hostname !== location.hostname ) {
                        $(this).addClass("ico-link ico-external-link").removeClass('ico-internal-links');
                    } else {
                        $(this).addClass('ico-link ico-internal-link');
                    }
				});
			}
			
			var parentImg = $('img.alignleft, img.alignright, img.aligncenter, img.alignnone').parent();
			if( parentImg.is('a') ) {
				parentImg.removeClass('ico-link').css('border-bottom', '0 none' );
			}
			
		});
	</script>

	<?php
		
	}

	$fixed_branding = (bool) get_theme_mod( 'analog_fixed_branding', 0 );

	if( $fixed_branding === false ) {
		return;
	}

	?><script type="text/javascript" id="onscroll-header-js">
		jQuery( function( $ ) {
			var headerHeight = $('.onscroll-header').height();

			$(window).scroll(function(){
			  var sticky = $('.onscroll-header');
			  var scrolling = $(window).scrollTop();
				
			  if (scrolling >= headerHeight) {
				sticky.addClass('fixed-h');
			  }
			  else {
				sticky.removeClass('fixed-h');
			  }
			});
		});
	</script><?php

}
add_action('wp_head', 'analog_inline_js', 9999 );

/**
 * Check if attachment has post parent
 * 
 * @return bool
 */
function analog_attachment_has_post_parent() {
	global $post;

	if(  $post->post_parent > 0 ) 
		return true;
	
	return false;
}

/**
 * Filter html to allow only <em> and <strong> html tag
 * 
 * @return string
 */
function analog_html_filter( $value ) {

	return wp_kses( $value, array('strong' => array(), 'em' => array() ) );

}

/**
 * Custom template tags for this theme.
 */
require get_template_directory() . '/inc/template-tags.php';

/**
 * Functions which enhance the theme by hooking into WordPress.
 */
require get_template_directory() . '/inc/template-functions.php';

/**
 * Customizer additions.
 */
require get_template_directory() . '/inc/customizer.php';

/**
 * Load Jetpack compatibility file.
 */
if ( defined( 'JETPACK__VERSION' ) ) {
	require get_template_directory() . '/inc/jetpack.php';
}


// Add a custom template option for the blank page.
function add_blank_page_template_option( $dropdown_args ) {
	$dropdown_args['show_option_blank_page'] = 'Blank Page';
	return $dropdown_args;
}

add_filter( 'page_attributes_dropdown_pages_args', 'add_blank_page_template_option' );

// Add the custom field value for the blank page to the post meta.
function save_blank_page_template( $post_id ) {
	if ( ! isset( $_POST['page_template'] ) ) {
		return;
	}

	if ( $_POST['page_template'] == 'page-blank.php' ) {
		update_post_meta( $post_id, '_wp_page_template', 'page-blank.php' );
	} else {
		update_post_meta( $post_id, '_wp_page_template', $_POST['page_template'] );
	}
}

add_action( 'save_post', 'save_blank_page_template' );

// Use the custom field value to determine if the page should be displayed as a blank page.
function display_blank_page( $template ) {
	global $post;

	if ( is_page() && 'page-blank.php' == get_post_meta( $post->ID, '_wp_page_template', true ) ) {
		$template = get_template_directory() . '/page-blank.php';
	}

	return $template;
}
add_filter( 'template_include', 'display_blank_page' );

function pijs_get_file_url( $filename ) {
	$directory = ABSPATH . 'files';
	return get_site_url() . '/files/' . $filename;
}

function pijs_get_latest_version_url( $fileStart, $fileEnd ) {
	$directory = ABSPATH . 'files';
	//error_log( "$directory\n", 3, WP_CONTENT_DIR . '/debug.log' );
	$latestFile = '';
	$latestVersion = '0.0.0';
	$files = scandir( $directory );

	foreach( $files as $file ) {
		if( strpos( $file, $fileStart ) === 0 && strpos( $file, $fileEnd ) !== false ) {
			$temp = substr( $file, strlen( $fileStart ) );
			//error_log(  "Trim start: $temp\n", 3, WP_CONTENT_DIR . '/debug.log' );
			$temp = substr( $temp, 0, strpos( $temp, $fileEnd ) );
			//error_log(  "Trim end: $temp\n", 3, WP_CONTENT_DIR . '/debug.log' );
			$parts = explode( ".", $temp );
			if( !pijs_is_valid_version( $parts ) ) {
				//error_log(  "Not a valid version #\n", 3, WP_CONTENT_DIR . '/debug.log' );
				continue;
			}
			$version = $parts[ 0 ] . "." . $parts[ 1 ] . "." . $parts[ 2 ];
			//error_log( "Count: " . count( $parts ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
			//error_log( "VersionCompare: " . version_compare( $version, $latestVersion ) . "\n", 3, WP_CONTENT_DIR . '/debug.log' );
			if( count( $parts ) == 3 && version_compare( $version, $latestVersion ) === 1 ) {
				$latestFile = $file;
				$latestVersion = $parts[ 0 ] . "." . $parts[ 1 ] . "." . $parts[ 2 ];
			}
		}
	}
	//$latestFile = 'pi-temp.js';
	$fullPath = get_site_url() . '/files/' . $latestFile;
	//error_log(  "Latest: $fullPath\n", 3, WP_CONTENT_DIR . '/debug.log' );
	return $fullPath;
}

function pijs_get_files_by_version( $fileStart, $fileEnd ) {
	$directory = ABSPATH . 'files';
	$versionedFiles = array();

	$files = scandir( $directory );
	foreach( $files as $file ) {
		if( strpos( $file, $fileStart ) === 0 && strpos( $file, $fileEnd ) !== false ) {
			$temp = substr( $file, strlen( $fileStart ) );
			$temp = substr( $temp, 0, strpos( $temp, $fileEnd ) );
			$parts = explode( ".", $temp );
			if( !pijs_is_valid_version( $parts ) ) {
				continue;
			}
			$version = $parts[ 0 ] . "." . $parts[ 1 ] . "." . $parts[ 2 ];
			$created = date("Y-m-d H:i:s", filectime($directory.'/'.$file));
			$fullPath = get_site_url() . '/files/' . $file;
			$versionedFiles[] = array(
				'version' => $version,
				'created' => $created,
				'path' => $fullPath
			);
		}
	}

	usort($versionedFiles, function($a, $b) {
		return version_compare($b['version'], $a['version']);
	});

	return $versionedFiles;
}

function pijs_is_valid_version( $parts ) {
	if( count( $parts ) !== 3 ) {
		return false;
	}
	foreach( $parts as $part ) {
		if( !is_numeric( $part ) ) {
			return false;
		}
	}
	return true;
}

remove_filter( 'the_content', 'wptexturize' );