<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $sql = "SELECT `Project_Id`, `Project_Name`, `House_Size`, `House_Foundation_Material`, `Project_Price`, `Img` 
    FROM `Projects`";

    $result = $db->Select($sql);

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>