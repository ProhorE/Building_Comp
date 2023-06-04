<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$Project_Name               = $_POST['Project_Name'];
$House_Size                 = $_POST['House_Size'];
$House_Foundation_Material  = $_POST['House_Foundation_Material'];
$House_Cover_Material       = $_POST['House_Cover_Material'];
$House_Roof_Material        = $_POST['House_Roof_Material'];
$Project_Price              = $_POST['Project_Price'];
$Time_Of_Building           = $_POST['Time_Of_Building'];

$name_parts = pathinfo($_FILES['file']['name']);
$extension = $name_parts['extension'];
$photo_tmp_path = $_FILES['file']['tmp_name'];
$photo_main_path = '/home/s/s96458su/s96458su.beget.tech/public_html/img/houses/'.$_POST['Project_Name'].'.'.$extension;
$copy_result = copy($photo_tmp_path, $photo_main_path);

if (!$copy_result)
{
    $status['status'] = 'error';
    $status['msg'] = 'Not saved pic';
    echo json_encode($status);
    return;
}

$img_pos = strpos($photo_main_path, 'img');
$img = './'.substr($photo_main_path, $img_pos);

$sql = "INSERT INTO Projects 
VALUES(NULL, '$Project_Name', $House_Size, '$House_Foundation_Material', '$House_Cover_Material', '$House_Roof_Material', $Project_Price, $Time_Of_Building, '$img')";

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