$(function() {
	$('.field, textarea').each(function() {
		if(this.title==this.value) {
            $(this).css('color', '');
        } else {
        	$(this).css('color', '#000');
        }
	});
	$('.field, textarea').focus(function() {
        if(this.title==this.value) {
            this.value = '';
            $(this).css('color', '#000');
        }
    }).blur(function(){
        if(this.value=='') {
            this.value = this.title;
            $(this).css('color', '');
        }
    });
});