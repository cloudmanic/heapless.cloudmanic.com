function login_demo() {
	$('.th-button').addClass('th-spinner').html('<span>Please wait...</span>');
	setTimeout(function() {
		$('.th-button.th-spinner').removeClass('th-spinner').html('Login');
		$('.error-row').slideDown(400);
	}, 1000);
}

var error_state = false;
function forgot_demo() {
	$('.th-button').addClass('th-spinner').html('<span>Please wait...</span>');
	setTimeout(function() {
		if(error_state) {
			document.location = 'sent-password.html';
		} else {
			$('.th-button').removeClass('th-spinner').html('Get a new password');
			$('.th-field-row').addClass('th-error');
			error_state = true;
		}
	}, 1000);
}