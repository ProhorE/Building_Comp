<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$Brigade_Id     = $_POST['Brigade_Id'];
$Busyness       = 'Свободна';

$B_Surname       = $_POST['B_Surname'];
$B_Name          = $_POST['B_Name'];
$B_Second_Name   = $_POST['B_Second_Name'];
$B_Role          = 'Бригадир';
$B_Phone_Number = $_POST['B_Phone_Number'];

$M_Surname      = $_POST['M_Surname'];
$M_Name         = $_POST['M_Name'];
$M_Second_Name  = $_POST['M_Second_Name'];
$M_Role         = 'Маляр';
$M_Phone_Number = $_POST['M_Phone_Number'];

$P_Surname      = $_POST['P_Surname'];
$P_Name         = $_POST['P_Name'];
$P_Second_Name  = $_POST['P_Second_Name'];
$P_Role         = 'Плотник';
$P_Phone_Number = $_POST['P_Phone_Number'];

$sql1 = "INSERT INTO Brigades 
VALUES('$Brigade_Id', '$Busyness')";

$sql2 = "INSERT INTO Workers
VALUES(NULL, '$B_Surname', '$B_Name', '$B_Second_Name', $Brigade_Id, '$B_Role', '$B_Phone_Number')";

$sql3 = "INSERT INTO Workers
VALUES(NULL, '$M_Surname', '$M_Name', '$M_Second_Name', $Brigade_Id, '$M_Role', '$M_Phone_Number')";

$sql4 = "INSERT INTO Workers
VALUES(NULL, '$P_Surname', '$P_Name', '$P_Second_Name', $Brigade_Id, '$P_Role', '$P_Phone_Number')";

$sqls = [$sql1, $sql2, $sql3, $sql4]; 

$insert_result = $db->ExecuteMany($sqls);

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