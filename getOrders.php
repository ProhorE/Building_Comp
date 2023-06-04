<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $sql = "SELECT `Order_Id`, `Date_Of_Start`, `Date_Of_End` FROM `Orders`";

    $result = $db->Select($sql);

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>