<?php
// Налаштування відправки
require 'config.php';

//Від кого лист
$mail->setFrom('some@gmail.com', 'Лист від ЧФ4'); // Вказати потрібний E-mail
//Кому відправити
$mail->addAddress('some@gmail.com'); // Вказати потрібний E-mail
//Тема листа
$mail->Subject = 'Вітання! Це Чертоги Фрілансера 4';

//Тіло листа
$body = '<h1>Зустрічайте супер листа!</h1>';

//if(trim(!empty($_POST['email']))){
//$body.=$_POST['email'];
//}	

/*
	//Прикріпити файл
	if (!empty($_FILES['image']['tmp_name'])) {
		//шлях завантаження файлу
		$filePath = __DIR__ . "/files/sendmail/attachments/" . $_FILES['image']['name']; 
		//грузимо файл
		if (copy($_FILES['image']['tmp_name'], $filePath)){
			$fileAttach = $filePath;
			$body.='<p><strong>Фото у додатку</strong>';
			$mail->addAttachment($fileAttach);
		}
	}
	*/

$mail->Body = $body;

//Відправляємо
if (!$mail->send()) {
	$message = 'Помилка';
} else {
	$message = 'Дані надіслані!';
}

$response = ['message' => $message];

header('Content-type: application/json');
echo json_encode($response);
