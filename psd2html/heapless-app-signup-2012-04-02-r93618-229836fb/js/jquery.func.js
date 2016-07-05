$(function() {
	$(document).on('click', 'span.check', function() {
		$(this).addClass('th-loader').text('Please wait...');

		setTimeout(function() {
			$('.check.th-loader').removeClass('th-loader').addClass('available').text('Nice name!');
		}, 1000);
	});

	$(document).on('mouseenter', '*[data-tooltip]', function() {
		$('.info-tooltip').html($(this).attr('data-tooltip')).addClass($(this).attr('data-class')).css({
			top: $(this).offset().top,
			left: $(this).offset().left + $(this).outerWidth() + 14
		}).show();
	}).on('mouseleave', '*[data-tooltip]', function() {
		$('.info-tooltip').hide().removeAttr('style').html('');
	});
});

function demo_signup() {
	$('form .th-button').addClass('th-spinner').html('<span>Please wait...</span>');
	setTimeout(function() {
		$('.th-button.th-spinner').removeClass('th-spinner').html('Create my account');
		$('.grey-area .check').removeClass('th-available').addClass('error').text('This name is not available');
	}, 1000);
}

function demo_paid() {
	$('form .th-button').addClass('th-spinner').html('<span>Please wait...</span>');
	setTimeout(function() {
		$('.th-button.th-spinner').removeClass('th-spinner').html('Create my account');
		$('form .required').each(function() {
			$(this).parents('.th-field-row').addClass('th-error');
		});
	}, 1000);
}

function demo_unsubscribe() {
	$('form .th-button').addClass('th-spinner').html('<span>Please wait...</span>');
}