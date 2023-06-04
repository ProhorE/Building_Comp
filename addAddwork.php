<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$Work_Name     = $_POST['Work_Name'];
$Work_Price    = $_POST['Work_Price'];
$Material_Name = $_POST['Material_Name'];
$Price_Of_One  = $_POST['Price_Of_One'];

$sql1 = "INSERT INTO Materials 
VALUES('$Material_Name', $Price_Of_One)";

$sql2 = "INSERT INTO Additional_Works
VALUES(NULL, '$Work_Name', $Work_Price, '$Material_Name')";

$sqls = [$sql1, $sql2]; 

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