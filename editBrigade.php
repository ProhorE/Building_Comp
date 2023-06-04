<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$id              = $_POST['id'];

$B_Surname       = $_POST['B_Surname'];
$B_Name          = $_POST['B_Name'];
$B_Second_Name   = $_POST['B_Second_Name'];
$B_Phone_Number  = $_POST['B_Phone_Number'];

$M_Surname       = $_POST['M_Surname'];
$M_Name          = $_POST['M_Name'];
$M_Second_Name   = $_POST['M_Second_Name'];
$M_Phone_Number  = $_POST['M_Phone_Number'];

$P_Surname       = $_POST['P_Surname'];
$P_Name          = $_POST['P_Name'];
$P_Second_Name   = $_POST['P_Second_Name'];
$P_Phone_Number  = $_POST['P_Phone_Number'];

$sql = "UPDATE `Workers` SET `Surname` = '$B_Surname', `Name` = '$B_Name', `Second_Name` = '$B_Second_Name', `Phone_Number` = '$B_Phone_Number'
WHERE `Brigade_Id` = $id AND `Role_In_Brigade` = 'Бригадир'";

$sql2 = "UPDATE `Workers` SET `Surname` = '$M_Surname', `Name` = '$M_Name', `Second_Name` = '$M_Second_Name', `Phone_Number` = '$M_Phone_Number'
WHERE `Brigade_Id` = $id AND `Role_In_Brigade` = 'Маляр'";

$sql3 = "UPDATE `Workers` SET `Surname` = '$P_Surname', `Name` = '$P_Name', `Second_Name` = '$P_Second_Name', `Phone_Number` = '$P_Phone_Number'
WHERE `Brigade_Id` = $id AND `Role_In_Brigade` = 'Плотник'";

$sqls = [$sql, $sql2, $sql3]; 

$result = $db->ExecuteMany($sqls);

if (!$result)
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