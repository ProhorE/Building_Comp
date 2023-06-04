<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $sql = "SELECT `Additional_Works`.`Work_Id`, `Additional_Works`.`Work_Name`, (`Additional_Works`.`Work_Price` + `Materials`.`Price_Of_One`) AS 'Full_Price', `Additional_Works`.`Material_Name` FROM `Additional_Works`
    JOIN `Materials`
    ON `Materials`.`Material_Name` = `Additional_Works`.`Material_Name`
    WHERE `Materials`.`Material_Name` = `Additional_Works`.`Material_Name`";

    $result = $db->Select($sql);

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>