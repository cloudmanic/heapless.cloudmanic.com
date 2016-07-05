$(function() {
	$(document).on('click', '.account-nav .toggle', function() {
		$(this).toggleClass('open').next().slideToggle(200);
		return false;
	});

	$(document).on('click', '.sync-button', function() {
		$(this).parent().addClass('open-sync');
	});

	$(document).on('click', '.sync-dropdown .cancel', function() {
		$(this).parents('.open-sync').removeClass('open-sync');
		return false;
	});

	$(document).on('click', '.sort-menu .toggle', function() {
		$(this).parent().find('.dropdown').toggle();
		return false;
	});

	$(document).on('click', '.sort-menu .dropdown a', function() {
		$(this).addClass('active').siblings('.active').removeClass('active');
		var new_txt = 'Sort by ' + $(this).text();
		$('.sort-menu .toggle').text(new_txt);
		$('.sort-menu .dropdown').hide();
		return false;
	});

	$(document).on('click', '.advertisement .ico-remove', function() {
		$.colorbox({
			href: 'popups/upgrade.html',
			initialWidth: 60,
			initialHeight: 60,
			opacity: .8
		});
	});

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

	$(document).on('click', '.send-link', function(e) {
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

	$(document).on('click', '.uploading-modal .minimize', function() {
		$('.uploading-modal .body').slideUp(400, function() {
			$('.uploading-modal .minimize').addClass('maximize').removeClass('minimize');
		});
	});

	$(document).on('click', '.uploading-modal .maximize', function() {
		$('.uploading-modal .body').slideDown(400, function() {
			$('.uploading-modal .maximize').addClass('minimize').removeClass('maximize');
		});
	});

	$(document).on('click', '.uploading-modal .close', function() {
		$('.uploading-modal').fadeOut(400);
	});

	$(document).on('click', '.l-add-user', function() {
		$(this).hide(0, function() {
			$('.add-user').slideDown(300, function() {
				sidebar_height();
			});
		});
		return false;
	});

	$(document).on('click', '.add-user .l-cancel', function() {
		$('.add-user').slideUp(300, function() {
			$('.l-add-user').show();
			sidebar_height();
		});
		return false;
	});

	$(document).on('click', '#colorbox .rating span', function() {
		var idx = $(this).index();
		$('.rating .act').removeClass('act');
		$(this).parent().find('span').each(function() {
			if($(this).index() <= idx) {
				$(this).addClass('act');
			}
		});
	});

	$(document).on('click', '#colorbox .l-add-label', function() {
		var container = $('#colorbox .th-wid-200');

		if(container.is(':hidden')) {
			container.slideDown(300, function() {
				$.colorbox.resize();
				$('#colorbox .l-add-label').text('Cancel');
			});
		} else {
			container.slideUp(300, function() {
				$.colorbox.resize();
				$('#colorbox .l-add-label').text('Add new label');
			});
		}

		return false;
	});

	$(document).on('click', '#colorbox .btn-add', function() {
		var labels = $(this).prev('.th-field').val();
		if(labels != '') {
			labels = labels.split(',');
			var labels_leng = labels.length;
			for(i=0;i<labels_leng;i++) {
				$('#colorbox .th-checklabel:last').after('<label class="th-checklabel"><input type="checkbox" class="th-checkbox" name="' + labels[i] + '" />' + labels[i] + '</label>');
			}
			$(this).prev('.th-field').val('');
			$.colorbox.resize();
		}
		return false;
	});

	$(document).on('click', '.l-add-vendor', function() {
		$(this).slideUp(300).prev().slideUp(300, function() {
			$('.add-vendors').slideDown(300, function() {
				$.colorbox.resize();
			});
		})
		return false;
	});

	$(document).on('click', '.ico-date', function() {
		$(this).prev('input').focus();
	});

	$(document).on('click', '.file-viewer .ico-trash', function() {
		if(!$(this).hasClass('clicked')) {
			$(this).addClass('clicked');

			var win_half = $(window).width()/2;

			var mask_wid = $(this).outerWidth() - 2;
			var dialog_top = $(this).offset().top + $(this).outerHeight() - 2;
			var dialog_left = $(this).offset().left - ($('.delete-dialog').outerWidth() - $(this).outerWidth()) - win_half;

			$('.delete-dialog .hide-border').css({
				width: mask_wid
			});

			$('.delete-dialog').css({
				top: dialog_top,
				marginLeft: dialog_left
			}).show();
		}
		return false;
	});

	$(document).on('mouseenter', '*[data-tooltip]', function() {
		$('.info-tooltip').html($(this).attr('data-tooltip')).addClass($(this).attr('data-class')).css({
			top: $(this).offset().top,
			left: $(this).offset().left + $(this).outerWidth() + 14
		}).show();
	}).on('mouseleave', '*[data-tooltip]', function() {
		$('.info-tooltip').hide().removeAttr('style').html('');
	});

	$(document).on('cbox_complete', function() {
		if($('#colorbox input[data-tags]').length) {
			init_tagit();
		}
		if($('.date-field').length) {
			$('.date-field').datepicker();
		}
	});

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

	$(window).load(function() {
		if($('#sidebar').length) {
			sidebar_height();
		}
	});

	$('a[data-type="popup"]').colorbox({
		opacity: .8,
		initialWidth: 60,
		initialHeight: 60
	});

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

	$('.uploading-modal .uploads-list').jScrollPane({
		verticalGutter: 0,
		autoReinitialise: true
	});

	if($('.success-row').length) {
		demo_success();
	}

	if($('input[data-tags]').length) {
		init_tagit();
	}
});

var tags_demo = ['Camera gear', 'photography', 'Meals & Entertainment', 'Biz expenses', 'Biz expensesss', 'Biz expensesssss', 'Biz expensessssss'];
function init_tagit() {
	var tagit_length = $('input[data-tags]').length;
	for(i=0;i<tagit_length;i++) {
		if($('input[data-tags]').eq(i).attr('id') == undefined) {
			$('input[data-tags]').eq(i).attr('id', 'tagit-' + i);

			$('#tagit-' + i).tagit({
				availableTags: tags_demo,
				allowSpaces: true,
				singleField: true
			});
		}
	}

	$('.ui-autocomplete-input').attr('placeholder', 'add a tag')
}

function sidebar_height() {
	if($('#content').outerHeight() > $('#sidebar').outerHeight()) {
		var sidebar_height = $('#content').outerHeight();
		$('#sidebar').css('height', sidebar_height);
	}
}

function demo_connect() {
	$('#colorbox .th-button').addClass('th-spinner').html('<span>Please wait...</span>');

	setTimeout(function() {
		$('#colorbox .error-row').slideDown(300, function() {
			$.colorbox.resize();
			$('#colorbox .th-button').removeClass('th-spinner').html('Connect');
		});
	}, 1000);
}

function demo_success() {
	$('.success-row').slideDown(300, function() {
		sidebar_height();
	});
}

var pass_error = false;
function demo_password() {
	$('#colorbox .th-button').addClass('th-spinner').html('<span>Please wait...</span>');

	setTimeout(function() {
		if(pass_error) {
			pass_changed();
		} else {
			$('.password-popup .error-row').slideDown(300, function() {
				$.colorbox.resize();
				pass_error = true;
			});
			$('#colorbox .th-button').removeClass('th-spinner').html('Login');
		}
	}, 1000);
}

function pass_changed() {
	$.colorbox({
		href: 'popups/password-changed.html',
		opacity: .8
	});
}

function add_spinner(selector) {
	selector.addClass('th-spinner').html('<span>Please wait...</span>');
}

function user_error() {
	$('.add-user .error-row').slideDown(200, function() {
		sidebar_height();
	});
}

function my_account_demo() {
	$('.my-account .th-button').addClass('th-spinner').html('<span>Please wait...</span>');

	setTimeout(function() {
		$('.my-account .error-row').slideDown(300, function() {
			sidebar_height();
		});
		$('.my-account .error-tooltip').fadeIn(300);
		$('.my-account .th-button').removeClass('th-spinner').html('Change');
	}, 1000);
}

function demo_upgrade() {
	$('.th-button').addClass('th-spinner').html('<span>Please wait...</span>');
	setTimeout(function() {
		$('.error-tooltip').fadeIn(300);
		$('.error-row').slideDown(300, function() {
			$('.th-button').removeClass('th-spinner').html('Upgrade');
			sidebar_height();
		});
	}, 1000);
}

function demo_connect() {
	$('.th-button').addClass('th-spinner').html('<span>Please wait...</span>');
	setTimeout(function() {
		$('.error-tooltip').fadeIn(300);
		$('.th-button').removeClass('th-spinner').html('Send It Now');
	}, 1000);
}