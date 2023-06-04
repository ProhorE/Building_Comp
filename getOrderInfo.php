<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$id = $_GET['id'];
    
$sql = "SELECT 
`Orders`.`Order_Id`, 
`Orders`.`Brigade_Id`, 
`Orders`.`Date_Of_Start`, 
`Orders`.`Date_Of_End`, 
CONCAT(`Clients`.`Surname`, ' ', SUBSTRING(`Clients`.`Name`, 1, 1), '.',  ' ', SUBSTRING(`Clients`.`Second_Name`, 1, 1), '.') AS 'FIO', 
`Projects`.`Project_Name`, 
`Projects`.`Project_Price`
FROM `Orders` 
JOIN `Clients`
ON `Orders`.`Client_Id` = `Clients`.`Client_Id`
JOIN `Projects`
ON `Orders`.`Project_Id` = `Projects`.`Project_Id`
WHERE `Orders`.`Order_Id` = $id";

$sql2 = "SELECT
`Additional_Works`.`Work_Name`,
`Additional_Works_In_Order`.`Type_Of_Work_Amount`,
(IFNULL(`Materials`.`Price_Of_One`,0) * IFNULL(`Additional_Works_In_Order`.`Type_Of_Work_Amount`,0)) + (IFNULL(`Additional_Works`.`Work_Price`,0) * IFNULL(`Additional_Works_In_Order`.`Type_Of_Work_Amount`,0)) AS 'AddWork_Price'
FROM `Additional_Works_In_Order`
LEFT JOIN `Additional_Works`
ON `Additional_Works_In_Order`.`Work_Id` = `Additional_Works`.`Work_Id`
LEFT JOIN `Materials`
ON `Additional_Works`.`Material_Name` = `Materials`.`Material_Name`
JOIN `Orders`
ON `Orders`.`Order_Id` = `Additional_Works_In_Order`.`Order_Id`
WHERE `Orders`.`Order_Id` = $id";

$result = $db->Select($sql)[0];
$result['Additional_Works'] = $db->Select($sql2);
$order_price = $result['Project_Price'];

for($i=0; $i<count($result['Additional_Works']); $i++)
{
    $order_price+= $result['Additional_Works'][$i]['AddWork_Price'];
}

$result['Order_Price'] = $order_price;

echo json_encode($result, JSON_UNESCAPED_UNICODE);
?>