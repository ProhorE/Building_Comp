<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $id = $_GET['id'];
    
    $sql = "SELECT `Additional_Works`.`Work_Name`, `Additional_Works`.`Work_Price`, `Additional_Works`.`Material_Name`, `Materials`.`Price_Of_One` 
    FROM Additional_Works 
    JOIN `Materials` 
    ON `Materials`.`Material_Name` = `Additional_Works`.`Material_Name` 
    WHERE `Additional_Works`.`Work_Id` = $id";

    $result = $db->Select($sql);

    echo json_encode($result[0], JSON_UNESCAPED_UNICODE);
?>