<?php
/*
Template Name: Blank Page
*/
?>

<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="https://gmpg.org/xfn/11">

	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
	<?php wp_body_open(); ?>

	<?php 
		while ( have_posts() ) :
			the_post();

			the_content();
		endwhile; // End of the loop.
		wp_footer();
	?>

</body>
</html>