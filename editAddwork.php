<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$id             = $_POST['id'];
$Work_Name      = $_POST['Work_Name'];
$Work_Price     = $_POST['Work_Price'];
$Material_Name  = $_POST['Material_Name'];
$Price_Of_One   = $_POST['Price_Of_One'];


$sql = "SELECT `Additional_Works`.`Work_Name`, `Additional_Works`.`Work_Price`, `Additional_Works`.`Material_Name`, `Materials`.`Price_Of_One` 
FROM Additional_Works 
JOIN `Materials` 
ON `Materials`.`Material_Name` = `Additional_Works`.`Material_Name` 
WHERE `Additional_Works`.`Work_Id` = $id";

$old_data = $db->SELECT($sql);

$sql2 = "UPDATE `Materials` 
SET `Material_Name` = '$Material_Name', `Price_Of_One`= '$Price_Of_One'
WHERE `Material_Name` = '".$old_data[0]['Material_Name']."'";

$sql3 = "UPDATE `Additional_Works` 
SET `Work_Name` = '$Work_Name', `Work_Price`= $Work_Price
WHERE `Work_Id` = $id";

$sqls = [$sql2, $sql3];

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