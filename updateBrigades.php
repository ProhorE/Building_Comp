<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$current_date  = date("Y-m-d");

$status = [];

$sql = "UPDATE `Brigades`
JOIN `Orders` ON `Orders`.`Brigade_Id` = `Brigades`.`Brigade_Id`
SET `Brigades`.`Busyness` = 'Свободна'
WHERE `Orders`.`Date_Of_End` <= '$current_date'
AND `Orders`.`Order_Id` = (
    SELECT MAX(`Order_Id`)
    FROM `Orders`
    WHERE `Orders`.`Brigade_Id` = `Brigades`.`Brigade_Id`
    )";

$result = $db->Execute($sql);
?>