<?php
/**
 * PIJS functions and definitions
 *
 * @package WordPress
 * @subpackage pijs
 * @since pijs 1.0
 */

add_theme_support( 'automatic-feed-links' );
add_theme_support( 'html5', array( 'search-form', 'comment-form', 'comment-list', 'gallery', 'caption' ) );
add_theme_support( 'custom-header' );
add_theme_support( 'title-tag' );

/**
 * Enqueue scripts and styles.
 */
function pijs_scripts() {
	wp_enqueue_style( 'pijs-style', get_stylesheet_uri() );
	//wp_enqueue_script( 'pijs-scripts', get_template_directory_uri() . '/js/scripts.js', array(), '1.0.0', true );
}
add_action( 'wp_enqueue_scripts', 'pijs_scripts' );

/**
 * Register widget areas
 */
function pijs_widgets_init() {
	register_sidebar( array(
		'name'          => __( 'Sidebar', 'pijs' ),
		'id'            => 'sidebar-1',
		'description'   => __( 'Add widgets here to appear in your sidebar.', 'pijs' ),
		'before_widget' => '<section id="%1$s" class="widget %2$s">',
		'after_widget'  => '</section>',
		'before_title'  => '<h2 class="widget-title">',
		'after_title'   => '</h2>',
	) );
}
add_action( 'widgets_init', 'pijs_widgets_init' );

function pijs_theme_setup() {
	add_theme_support( 'title-tag' );
}
add_action( 'after_setup_theme', 'pijs_theme_setup' );

/**
 * Custom template tags for this theme
 */
//require get_template_directory() . '/inc/template-tags.php';

/**
 * Customizer additions
 */
//require get_template_directory() . '/inc/customizer.php';

function pijs_register_my_menu() {
	register_nav_menu( 'header-menu',__( 'Header Menu', 'pijs' ) );
}
add_action( 'init', 'pijs_register_my_menu' );

function pijs_custom_bullet_points( $wp_customize ) {
	$wp_customize->add_section( 'custom_bullet_points' , array(
		'title'    => __( 'Bullet Points', 'pijs' ),
		'priority' => 30,
	) );
	$wp_customize->add_setting( 'bullet_point_1_title' , array(
		'default'     => '',
		'transport'   => 'refresh',
		'sanitize_callback' => 'sanitize_text_field'
	) );
	$wp_customize->add_setting( 'bullet_point_1_content' , array(
		'default'     => '',
		'transport'   => 'refresh',
		'sanitize_callback' => 'sanitize_text_field'
	) );
	$wp_customize->add_setting( 'bullet_point_2_title' , array(
		'default'     => '',
		'transport'   => 'refresh',
		'sanitize_callback' => 'sanitize_text_field'
	) );
	$wp_customize->add_setting( 'bullet_point_2_content' , array(
		'default'     => '',
		'transport'   => 'refresh',
		'sanitize_callback' => 'sanitize_text_field'
	) );
	$wp_customize->add_setting( 'bullet_point_3_title' , array(
		'default'     => '',
		'transport'   => 'refresh',
		'sanitize_callback' => 'sanitize_text_field'
	) );
	$wp_customize->add_setting( 'bullet_point_3_content' , array(
		'default'     => '',
		'transport'   => 'refresh',
		'sanitize_callback' => 'sanitize_text_field'
	) );
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bullet_point_1_title', array(
		'label'    => __( 'Bullet Point 1 Title', 'pijs' ),
		'section'  => 'custom_bullet_points',
		'settings' => 'bullet_point_1_title',
		'type'     => 'text',
	) ) );
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bullet_point_1_content', array(
		'label'    => __( 'Bullet Point 1 Content', 'pijs' ),
		'section'  => 'custom_bullet_points',
		'settings' => 'bullet_point_1_content',
		'type'     => 'textarea',
	) ) );
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bullet_point_2_title', array(
		'label'    => __( 'Bullet Point 2 Title', 'pijs' ),
		'section'  => 'custom_bullet_points',
		'settings' => 'bullet_point_2_title',
		'type'     => 'text',
	) ) );
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bullet_point_2_content', array(
		'label'    => __( 'Bullet Point 2 Content', 'pijs' ),
		'section'  => 'custom_bullet_points',
		'settings' => 'bullet_point_2_content',
		'type'     => 'textarea',
	) ) );
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bullet_point_3_title', array(
		'label'    => __( 'Bullet Point 3 Title', 'pijs' ),
		'section'  => 'custom_bullet_points',
		'settings' => 'bullet_point_3_title',
		'type'     => 'text',
	) ) );
	$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'bullet_point_3_content', array(
		'label'    => __( 'Bullet Point 3 Content', 'pijs' ),
		'section'  => 'custom_bullet_points',
		'settings' => 'bullet_point_3_content',
		'type'     => 'textarea',
	) ) );
}
add_action( 'customize_register', 'pijs_custom_bullet_points' );

/****************************************************
 * Adding some meta data to Pages
 ****************************************************/
function pijs_articles_callback( $post ) {

	// Add a nonce field so we can check for it later.
	$nonceName = 'pijs_articles_' . $post->ID;
	$nonce = wp_create_nonce( $nonceName );
	$articleCount = ( int )get_post_meta( $post->ID, '_pijs_article_count', true );
	$values = get_post_meta( $post->ID, '_pijs_articles', true );

	echo '<input id="pijs_articles_nonce" name="pijs_articles_nonce" type="hidden" value="' . $nonce . '" />';
	echo '<label for="pijs_article_count">';
	_e( 'Article Count: ', 'pijs' );
	echo '<input id="pijs_article_count" name="pijs_article_count" type="number" value="' . $articleCount . '" min="0" />';
	echo '</label> ';

	for ( $i = 0; $i < $articleCount; $i++ ) {
		if( isset( $values[ $i ] ) ) {
			$value = $values[ $i ];
		} else {
			$value = '';
		}
		echo '<p><label for="pijs_article_' . $i .'">';
		_e( 'Article Content:', 'pijs' );
		echo '</label> ';
		$articleId = "pijs_article_$i";
		wp_editor( $value, $articleId, array(
			'textarea_name' => 'pijs_article_fields[]',
			'textarea_rows' => 10,
			'tinymce' => true,
			'quicktags' => true,
			'media_buttons' => true,
		) );
	}
}

function pijs_add_articles() {
	add_meta_box(
		'pijs-articles',
		__( 'Pi.js Articles', 'pijs' ),
		'pijs_articles_callback',
		'page',
		'normal',
		'default'
	);
}
add_action( 'add_meta_boxes', 'pijs_add_articles' );

// Save the custom meta box data
function pijs_save_custom_articles( $post_id ) {
	// Check if nonce is set
	$nonceName = 'pijs_articles_' . $post_id;
	
	$nonce = '';
	if ( ! isset( $_POST[ 'pijs_articles_nonce' ] ) ) {
		return;
	} else {
		$nonce = $_POST[ 'pijs_articles_nonce' ];
	}
	// Verify nonce
	if ( ! wp_verify_nonce( $nonce, 'pijs_articles_' . $post_id ) ) {
		return;
	}
	// Check if user has permissions
	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	// Check if the custom field is set
	if ( isset( $_POST[ 'pijs_article_count' ] ) ) {
		$articleCount = ( int )$_POST[ 'pijs_article_count' ];
		update_post_meta( $post_id, '_pijs_article_count', $articleCount );
	}

	if ( isset( $_POST[ 'pijs_article_fields' ] ) ) {
		$rawValues = $_POST[ 'pijs_article_fields' ];
		$values = array();
		foreach( $rawValues as $value ) {
			if( strlen( $value ) > 0 ) {
				error_log( "Value: $value" );
				$content = wp_kses_post( $value );
				error_log( "Content: $content" );
				$values[] = $content;
			}
		}
		update_post_meta( $post_id, '_pijs_articles', $values );
	}
}
add_action( 'save_post', 'pijs_save_custom_articles' );



class Pijs_Custom_Walker extends Walker_Nav_Menu {
	public function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
		$output .= '<li class="my-custom-class">';
		$output .= '<a href="' . $item->url . '">' . $item->title . '</a>';
		$output .= '</li>';
	}
}


class My_Custom_Walker extends Walker_Nav_Menu {
	function start_el( &$output, $item, $depth = 0, $args = array(), $id = 0 ) {
		$output .= '<li class="my-custom-class">';
		$output .= '<a href="' . $item->url . '">' . $item->title . '</a>';
	}

	function end_el( &$output, $item, $depth = 0, $args = array() ) {
		$output .= '</li>';
	}
}

function add_search_form($items, $args) {
	if( $args->theme_location == 'menu-1' ){
	$items .= '<li class="menu-item">'
			. '<form role="search" method="get" class="search-form" action="'.home_url( '/' ).'">'
			. '<label>'
			. '<span class="screen-reader-text">' . _x( 'Search for:', 'label' ) . '</span>'
			. '<input type="search" class="search-field" placeholder="' . esc_attr_x( 'Search …', 'placeholder' ) . '" value="' . get_search_query() . '" name="s" title="' . esc_attr_x( 'Search for:', 'label' ) . '" />'
			. '</label>'
			. '<input type="submit" class="search-submit" value="'. esc_attr_x('Search', 'submit button') .'" />'
			. '</form>'
			. '</li>';
	}
  return $items;
}
add_filter( 'wp_nav_menu_items', 'add_search_form', 10, 2 );
