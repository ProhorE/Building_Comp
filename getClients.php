<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $sql = "SELECT `Client_Id`, (CONCAT(`Clients`.`Surname`, ' ', SUBSTRING(`Clients`.`Name`, 1, 1), '.',  ' ', SUBSTRING(`Clients`.`Second_Name`, 1, 1), '.')) AS 'FIO', `Phone_Number`, `Mail` 
    FROM `Clients`";

    $result = $db->Select($sql);

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>