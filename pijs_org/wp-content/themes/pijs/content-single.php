<main id="post-<?php the_ID(); ?>" <?php post_class( 'page-8-14' ); ?>>
	<section class="hero">
		<?php the_title( '<h1 class="entry-title">', '</h1>' ); ?>
	</section>
	<!--div class="entry-meta">
		<?php the_date(); ?>
		<?php the_author(); ?>
	</div-->
	<section class="page-doc">
		<article><?php the_content(); ?></article>
		<?php
			$articles = get_post_meta( $post->ID, '_pijs_articles', true );
			foreach( $articles as $article ) {
				echo "<article>$article</article>";
			}
		?>
	</section>

	<!--div class="entry-content">
		<?php wp_link_pages( array( 'before' => '<div class="page-links">' . __( 'Pages:', 'pijs' ), 'after' => '</div>' ) ); ?>
	</div-->

	<!--footer class="entry-footer">
		<?php the_tags( '<span class="tags-links">', ', ', '</span>' ); ?>
		<?php edit_post_link( __( 'Edit', 'pijs' ), '<span class="edit-link">', '</span>' ); ?>
	</footer-->
</main>
