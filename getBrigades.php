<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

    $sql = "SELECT `Brigades`.`Brigade_Id`, (CONCAT(`Workers`.`Surname`, ' ', SUBSTRING(`Workers`.`Name`, 1, 1), '.',  ' ', SUBSTRING(`Workers`.`Second_Name`, 1, 1), '.')) AS 'FIO', `Busyness`
    FROM `Brigades`
    JOIN `Workers` ON `Workers`.`Brigade_Id`=`Brigades`.`Brigade_Id`
    WHERE `Workers`.`Role_In_Brigade`='Бригадир'";

    $result = $db->Select($sql);

    echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>