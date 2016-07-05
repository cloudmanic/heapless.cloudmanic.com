<?php 
// Email Template parser

// spacer function
function br( $height ) {
	$img = '<img src="__path__/empty.gif" width="1" height="'.$height.'" style="height:'.$height.'px" alt="" />';
	return '<div style="font-size:0pt; line-height:0pt; height:'.$height.'px">'.$img.'</div>'."\n";
}

// border function
function border( $height, $color ) {
	global $p;
	$img = '<img src="__path__/empty.gif" width="1" height="'.$height.'" style="height:'.$height.'px" alt="" />';
	return '<div style="font-size:0pt; line-height:0pt; height:'.$height.'px; background:'.$color.'; ">'.$img.'</div>' . "\n";
}

// get all styles and covert them to array
function get_styles($css){
	$css = preg_replace('~\r\n~', '', $css);
	$css = preg_replace('~\t~', ' ', $css);
	$css = preg_replace('|\;(\s*?)\}|i', '}', $css); // removing the last ;
	preg_match_all('|\.(.*?)\{(.*?)\}|i', $css, $matches); // key + value
	
	$css_properties = array();
	$styles = array();
	
	$class_names = $matches[1];
	$values = $matches[2];
	$i=0;
	foreach($class_names as $class_name) {
		$v = trim($values[$i]);
		if(!empty($v)){
			$css_properties[trim(strtolower($class_name))][] = $v;
		}
		$i++;
	}
		
	$styles = array_map('implode_properties', $css_properties);
	
	return $styles;
}

function implode_properties($v){
	return implode('; ', $v);
}

function replace_classes(){
	global $styles;

	$matches = func_get_args();

	$class_name = $matches[0][1];

	if( isset($styles[$class_name]) )
		return $matches[0][0] . ' ' . 'style="' . $styles[$class_name] . '"';
	else 	
		return $matches[0][0];
}

function p() {
	global $p;
	return $p;
}

function replace_css_values(){
	global $styles;

	$matches = func_get_args();
	$style_class_name = trim(str_replace('.', '', $matches[0][2]));
	$css_class_name = $matches[0][1];

	if( isset( $styles[$style_class_name] ) ) {
		return $css_class_name . '{ ' . $styles[$style_class_name] . ' }';
	}
	return $css_class_name . '{ ' . $style_class_name . ' }';
	
}

function replace_br(){
	$matches = func_get_args();
	return br($matches[0][1]);
}

function replace_border(){
	$matches = func_get_args();
	return border($matches[0][1], $matches[0][3]);
}

// parse the template
function parse_template($template){
	global $styles;

	// patterns
	$php_css_pattern = '|<style type="text/css" media="php-parser">([^>]*)</style>|i';
	$screen_css_pattern = '|<style type="text/css" media="screen">([^>]*)</style>|i';
	$class_pattern = '|class="(.*?)"|i';
	
	// get styles for php array
	$php_css = preg_match($php_css_pattern, $template, $matches);
	$styles = get_styles($matches[1]);
	
	// replace class with style
	$new_template = preg_replace_callback($class_pattern, 'replace_classes', $template);

	// get screen css
	$screen_css = preg_match($screen_css_pattern, $new_template, $matches);
	$screen_css = $matches[1];
	$new_screen_css = preg_replace_callback('|(.*?)\{(.*?)\}|i', 'replace_css_values', $screen_css);

	// replace <br height="20" /> with image based space
	$br_pattern = '|<br height="([^>]*)"([^>]*)/>|i';
	$new_template = preg_replace_callback($br_pattern, 'replace_br', $new_template);

	// replace <border height="20" color="#dddddd" /> with image based border
	$border_pattern = '|<border height="([^>]*)"([^>]*)color="([^>]*)"([^>]*)/>|i';
	$new_template = preg_replace_callback($border_pattern, 'replace_border', $new_template);

	// replace a{ .link } with a{ styles }
	$new_template = preg_replace($screen_css_pattern, '<style type="text/css" media="screen">' . $new_screen_css . '</style>', $new_template);

	// replace path
	$new_template = str_replace('__path__', p(), $new_template);

	// remove php styles
	$new_template = preg_replace($php_css_pattern, '', $new_template);

	return $new_template;
}
ob_start("parse_template");

#################################################################################
#################################################################################

// Template Properties
$bg = '#424e5a';
$bg_shell = '#424e5a';
$p = 'images';

// Testing
//echo parse_template(file_get_contents('email-test.html'));
//exit;
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
	<title>Email</title>
	<style type="text/css" media="php-parser">
		/* PHP Styles - only classes accepted */
		.body { padding:0 !important; margin:0 !important; display:block !important; background:<?=$bg?>; -webkit-text-size-adjust: none; }

		.img { font-size:0pt; line-height:0pt; text-align:left; }
		.img-center { font-size:0pt; line-height:0pt; text-align:center; }
		.img-right { font-size:0pt; line-height:0pt; text-align:right; }

		.link { color:#92c90e; text-decoration:underline; }
		.link-2 { color:#a1a7ad; text-decoration:underline; }

		.text { color:#424e5a; font-family:Arial; font-size:14px; line-height:18px; text-align:left; }
		.text-2 { color:#424e5a; font-family:Arial; font-size:12px; line-height:16px; text-align:left; }
		.footer { color:#a1a7ad; font-family:Arial; font-size:11px; line-height:15px; text-align:center; }

		.h2 { color:#000000; font-family:Verdana; font-size:20px; line-height:24px; text-align:left; font-weight:bold;  }
		.h3 { color:#424e5a; font-family:Arial; font-size:18px; line-height:22px; text-align:left; font-weight:bold;  }
	</style>
	<style type="text/css" media="screen">
		/* Linked Styles */
		body { .body }
		a { .link }
	</style>
</head>
<body class="body">

<table width="100%" border="0" cellspacing="0" cellpadding="30" bgcolor="<?=$bg?>">
	<tr>
		<td align="center" valign="top">
			<table width="600" border="0" cellspacing="0" cellpadding="0">
				<!-- Header -->
				<tr>
					<td class="img">
						<a href="#" target="_blank"><img src="__path__/header.jpg" width="600" height="91" alt="" border="0" /></a>
					</td>
				</tr>
				<!-- END Header -->
				<!-- Content -->
				<tr>
					<td bgcolor="#ffffff">
						<table width="100%" border="0" cellspacing="0" cellpadding="30">
							<tr>
								<td>
									<table width="100%" border="0" cellspacing="0" cellpadding="0">
										<tr>
											<td class="text">
												<div class="h3">You're invited to join Heapless, our tool to organize your files.</div>
												<br height="15" />
												Dirman Suharno,
												<br height="15" />
												Spicer Matthews just set up an account for you.<br />
												Your temporary password is: <strong>N4YmXm&amp;X</strong>
												<br height="35" />

												<strong>Click this link to get started:</strong><br />
												<a href="https://spicer.heapless.com/invitations/898nksfhs3284293j42" class="link" target="_blank">https://spicer.heapless.com/invitations/898nksfhs3284293j42</a>
												<br height="20" />

												Enjoy,<br />
												HeapLess
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</td>
				</tr>
				<!-- END Header -->
				<!-- Footer -->
				<tr>
					<td class="img">
						<a href="#" target="_blank"><img src="__path__/footer.jpg" width="600" height="8" alt="" border="0" /></a>
					</td>
				</tr>
				<tr>
					<td class="img-center"><br height="15" /><a href="#" target="_blank"><img src="__path__/logo.jpg" width="189" height="44" alt="" border="0" /></a></td>
				</tr>
				<tr>
					<td class="footer">
						<br height="20" />
						2011 &copy; Copyright Cloudmanic Labs, LLC<br />
						3Monroe Parkway P105, Lake Oswego, OR, 97035
						<br height="20" />
					</td>
				</tr>
			</table>
		</td>
	</tr>
</table>

</body>
</html>
<?php ob_end_flush(); ?>