<? const VITE_HOST = 'http://localhost:1111'; ?>
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>PHP-сервер | Чертоги Фрілансера</title>
	<? echo '<script type="module" src="' . VITE_HOST . '/@vite/client"></script>'; ?>
	<? echo '<script type="module" src="' . VITE_HOST . '/js/app.js"></script>'; ?>
	<? echo '<link rel="stylesheet" href="' . VITE_HOST . '/styles/style.scss">'; ?>
</head>

<body style="text-align: center;padding: 30px;background-color: #333;color: #fff;font-family:Arial;">
	<img width="200" src="https://www.php.net/images/logos/php-logo-white.svg" alt="Image">
	<h1><? echo "Вітаю на PHP-сервері" ?></h1>
</body>

</html>