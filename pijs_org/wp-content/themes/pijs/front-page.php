<?php
/**
 * The front page template file
 *
 * @package WordPress
 * @subpackage pijs
 * @since pijs 1.0
 */

get_header(); 
?>
<main class="page">
	<section class="hero">
		<div style="text-align: center; padding: 55px 0 35px 0;">
			<img src="<?php echo get_header_image(); ?>" alt="Header Image">
		</div>
		<h1>
			<?php bloginfo('name'); ?> - <span class="retro">Retro</span> Game
			Library for <span class="accent">JavaScript</span>
		</h1>
		<p>
			<?php bloginfo('description'); ?>
		</p>
	</section>
	<section class="action">
		<div>
			<a href="docs/" class="btn-retro btn-large btn-red">Get Started</a>
		</div>
	</section>
	<section class="intro">
		<article>
			<h2><?php echo esc_html( get_theme_mod( 'bullet_point_1_title' ) ); ?></h2>
			<p><?php echo esc_html( get_theme_mod( 'bullet_point_1_content' ) ); ?></p>
		</article>
		<article>
			<h2><?php echo esc_html( get_theme_mod( 'bullet_point_2_title' ) ); ?></h2>
			<p><?php echo esc_html( get_theme_mod( 'bullet_point_2_content') ) ; ?></p>
		</article>
		<article>
			<h2><?php echo esc_html( get_theme_mod( 'bullet_point_3_title' ) ); ?></h2>
			<p><?php echo esc_html( get_theme_mod( 'bullet_point_3_content' ) ); ?></p>
		</article>
	</section>
	<section id="showcase" class="showcase" style="margin: 0; padding: 0; width: 100%; height: 600px;">
	</section>
</main>
<?php
get_sidebar();
get_footer();
