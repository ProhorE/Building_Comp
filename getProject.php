<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $id = $_GET['id'];
    
    $sql = "SELECT `Project_Id`, `Project_Name`, `House_Size`, `House_Foundation_Material`, `House_Cover_Material`, `House_Roof_Material`, `Project_Price`, `Time_Of_Building`, `Img` 
    FROM `Projects`
    WHERE `Project_Id` = $id";

    $result = $db->Select($sql);

    echo json_encode($result[0], JSON_UNESCAPED_UNICODE);
?>