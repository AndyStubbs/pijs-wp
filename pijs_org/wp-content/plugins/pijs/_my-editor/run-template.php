<?php
	$allowed_domains = array( 'localhost', 'pijs.org', 'www.pijs.org' );

	// Get the referring domain from the HTTP_REFERER header
	$referer = isset($_SERVER['HTTP_REFERER']) ? parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST) : null;

	// Check if the referring domain is in the list of allowed domains
	if (!$referer || !in_array( $referer, $allowed_domains ) ) {
		die( 'You can only access this page through pijs.org editor or playground.' );
	}
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<title>[TITLE]</title>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
		<style>
			body {
				background-color: black;
			}
		</style>
	</head>
	<body>
		[SCRIPTS]
	</body>
</html>