var site = {
	active_click: null
}

$(function() {
	$('html').on('click', function(e) {
		if($(e.target).parents('.account-nav').length < 1) {
			$('.account-nav .open').removeClass('open');
			$('.account-nav .dropdown').slideUp(200);
		}

		if($(e.target).parents('.sort-menu').length < 1) {
			$('.sort-menu .dropdown:visible').hide();
		}

		if($(e.target).parents('.send-dropdown').length < 1) {
			$('.send-link.active').removeClass('active');
			$('.send-dropdown:visible').removeClass('left-aligned').removeClass('right-aligned').removeAttr('style').hide();
		}

		if($(e.target).parents('.delete-dialog').length < 1) {
			$('.ico-trash.clicked').removeClass('clicked');
			$('.delete-dialog').removeAttr('style');
		}
	});

	$(document).on('click', '.account-nav .toggle', function() {
		$(this).toggleClass('open').next().slideToggle(200);
		return false;
	});
	
/*
	$(document).on('click', '.heap-thumbs li', function(e) {
		if(!$(e.target).hasClass('.send-link') || !$(e.target).hasClass('.btn-view')) {
			$(this).toggleClass('selected');
		}
		var selected_leng = $('.heap-thumbs .selected').length;
		if(selected_leng) {
			$('.the-heap h2 .delete-link').show();
			if(selected_leng > 1) {
				$('.the-heap h2 .send-link').show();
			} else {
				$('.the-heap h2 .send-link').hide();
			}
		} else {
			$('.the-heap h2 .delete-link').hide();
		}
	});
*/

	$(document).on('click', '.send-link', function(e) {
	
		// Set the active click.
		site.active_click = $(this).data('id');
	
		var win_half = $(window).width()/2;
		var dd_offset = $(this).offset().left;
		var mask_wid = $(this).outerWidth();

		if($('.send-link.active').length) {
			$('.send-link.active').removeClass('active');
		}

		$(this).addClass('active');

		var pos_t = $(this).offset().top + $(this).outerHeight();
		var pos_l;

		if(dd_offset > win_half) {
			$('.send-dropdown').addClass('right-aligned').removeClass('left-aligned');
			pos_l = $(this).offset().left - $('.send-dropdown').outerWidth() + mask_wid - win_half;
		} else {
			$('.send-dropdown').addClass('left-aligned').removeClass('right-aligned');
			pos_l = 0 - (win_half - dd_offset);
		}

		$('.send-dropdown .hide-shadow').css({
			width: mask_wid
		});

		$('.send-dropdown').css({
			top: pos_t,
			marginLeft: pos_l
		}).show();
		return false;
	});

	$(document).on('click', '.delete-link', function() {
		$('.selected').each(function() {
			$(this).fadeOut(300, function() {
				$(this).remove();
			});
		});
		return false;
	});
	
/*
	$('.search-field').on('keypress', function(e) {
		if(e.keyCode == 13) {
			$('.search-button').hide();
			$('#search').append('<span class="th-spinner" />');
			return false;
		}
	});

	$('.heap-list .th-checkbox').on('change', function() {
		if($(this).is(':checked')) {
			$(this).parents('li:eq(0)').addClass('selected');
		} else {
			$(this).parents('li:eq(0)').removeClass('selected');
		}

		var checks_leng = $('.heap-list .selected').length;
		if(checks_leng) {
			$('.the-heap h2 .delete-link').show();
			if(checks_leng > 1) {
				$('.the-heap h2 .send-link').show();
			} else {
				$('.the-heap h2 .send-link').hide();
			}
		} else {
			$('.the-heap h2 .delete-link').hide();
		}
	});	
*/	
});