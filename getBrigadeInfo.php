<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $id = $_GET['id'];
    
    $sql = "SELECT `Surname`, `Name`, `Second_Name`, `Role_In_Brigade`, `Phone_Number`
    FROM `Workers`
    WHERE `Brigade_Id` = $id 
    GROUP BY `Role_In_Brigade` ASC" ;

    $result = $db->Select($sql);

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>


