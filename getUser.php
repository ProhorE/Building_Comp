<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $id = $_GET['id'];

    $sql = "SELECT `Client_Id`, `Surname`, `Name`, `Second_Name`, `Passport_Number`, `Passport_Series`, `Phone_Number`, `Mail`, `Login`, `Password` 
    FROM `Clients` 
    WHERE `Client_id` = $id";

    $result = $db->Select($sql);

    echo json_encode($result[0], JSON_UNESCAPED_UNICODE);
?>