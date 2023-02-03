/*!
 * Menu nav
 * 
 * @package AnaLog
 */

jQuery(function($) {

    var tgl = 200;

    $('button.menu-toggle').click( function( e ) {
        e.preventDefault();

        var menu_id = $('button.menu-toggle').attr('data-menu');
        $('.main-navigation ul#' + menu_id).slideToggle( tgl, function() {
				if( $(this).is(':hidden') ) {
					$(this).removeAttr('style');
				}
		 } );

        if( $('.main-navigation').hasClass('toggled') ) {
            $('.main-navigation').removeClass('toggled');
            $('.sub-menu').hide(tgl).removeAttr('style');
            $( this ).attr('aria-expanded', 'false' );
        } else {
            $('.main-navigation').addClass('toggled');
            $( this ).attr('aria-expanded', 'true' );
        }
    });

    $('.menu-item-has-children > a').attr('href', '#');

	$(document).on('click', '.menu-item-has-children > a', function(e) {
		e.preventDefault();
		$(this).closest("li").toggleClass("menu-open");
		var menuToggle = $(this).parent().children('.sub-menu');
		menuToggle.slideToggle( tgl, function() {
			$(this).find('ul').hide(tgl).removeAttr('style');
		} );
	});

	$(document.body).on('click', function(e) {
		let $underCursor = $(document.elementFromPoint(e.pageX, e.pageY)).closest(".menu-item");
		if( $underCursor.length > 0 ){
			return;
		}
		let $menuOpen = $( ".menu-open" );
		if( $menuOpen.length > 0 ) {
			$menuOpen.closest("li").find(".sub-menu").first().slideToggle( tgl, function () {
				$(this).find('ul').hide(tgl).removeAttr('style');
			});
			$menuOpen.removeClass("menu-open");
		}
	});

});
