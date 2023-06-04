<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$surname = $_POST['Surname'];
$name = $_POST['Name'];
$second_name = $_POST['Second_Name'];
$passport_number = $_POST['Passport_Number'];
$passport_series = $_POST['Passport_Series'];
$phone_number = $_POST['Phone_Number'];
$mail = $_POST['Mail'];
$login = $_POST['Login'];
$password = $_POST['Password'];

$status = [];

$sql = "INSERT INTO Clients 
VALUES(NULL, '$surname', '$name', '$second_name', $passport_number, $passport_series, '$phone_number', '$mail', '$login', '$password')";

$result = $db->Execute($sql);

if (!$result)
{
    $status['status'] = 'error';
    $status['msg'] = 'Не удалось зарегистрироваться';
}
else
{
    $status['status'] = 'ok';
    $status['msg'] = 'Регистрация прошла успешно';
}

echo json_encode($status);
?>