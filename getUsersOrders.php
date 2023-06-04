<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $id = $_GET['id'];

    $sql = "SELECT `Order_Id`, `Date_Of_Start`, `Date_Of_End` FROM `Orders` WHERE `Client_id` = $id";

    $result = $db->Select($sql);

    if ($result) {
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
    }
    else {
        $result[0]['Order_Id'] = 0 ;
        echo json_encode($result, JSON_UNESCAPED_UNICODE);
    }
?>