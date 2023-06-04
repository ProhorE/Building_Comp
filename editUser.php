<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$id                 = $_POST['id'];
$Surname            = $_POST['Surname'];
$Name               = $_POST['Name'];
$Second_Name        = $_POST['Second_Name'];
$Passport_Number    = $_POST['Passport_Number'];
$Passport_Series    = $_POST['Passport_Series'];
$Phone_Number       = $_POST['Phone_Number'];
$Mail               = $_POST['Mail'];
$Login              = $_POST['Login'];
$Password           = $_POST['Password'];

$sql = "UPDATE `Clients` 
SET `Surname` = '$Surname', `Name`= '$Name', `Second_Name` = '$Second_Name', `Passport_Number` = $Passport_Number, `Passport_Series` = $Passport_Series, `Phone_Number` = '$Phone_Number', `Mail` = '$Mail', `Login`= '$Login', `Password`= '$Password'
WHERE `Client_Id` = $id";

$insert_result = $db->Execute($sql);

if (!$insert_result)
{
    $status['status'] = 'error';
    $status['msg'] = 'Не удалось внести информацию';
}
else
{
    $status['status'] = 'ok';
    $status['msg'] = 'Информация внесена';
}

echo json_encode($status, JSON_UNESCAPED_UNICODE);
?>