<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="shortcut icon" href="<?php echo get_stylesheet_directory_uri(); ?>/pijs.ico" />
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header id="header">
	<div class="page">
		<div class="logo inline">
			<nav>
				<a href="<?php echo esc_url( home_url( '/' ) ); ?>" rel="home">
					╔════════╗ ║&nbsp;<?php bloginfo( 'name' ); ?>&nbsp;&nbsp;║ ╚════════╝
				</a>
			</nav>
		</div>
		<div class="inline">
			<nav id="site-navigation" class="main-navigation">
				<?php
				wp_nav_menu( array(
					'theme_location' => 'menu-1',
					'menu_id'        => 'primary-menu',
					'menu'            => '',
					'container'       => '',
					'container_class' => 'menu-{menu slug}-container',
					'container_id'    => '',
					'menu_class'      => 'menu',
					'echo'            => true,
					'fallback_cb'     => 'wp_page_menu',
					'before'          => '',
					'after'           => '',
					'link_before'     => '',
					'link_after'      => '',
					'items_wrap'      => '<ul>%3$s</ul>',
					//'depth'           => 3,
					//'walker'          => new Pijs_Custom_Walker()
				) );
				//wp_nav_menu( array(
				//	'theme_location' => 'primary',
			//		'walker' => new Pijs_Custom_Walker()
			//	) );
			//	wp_nav_menu( array(
			//		'theme_location' => 'menu-1',
			//		'menu_id'        => 'primary-menu',
					//'walker' => new My_Custom_Walker
			//	) );
				//$custom_walker = new My_Custom_Walker;
				//var_dump($custom_walker);
				//exit;
				//wp_nav_menu( array( 'walker' => $custom_walker ) );

				?>
			</nav>
		</div>
	</div>
</header>
