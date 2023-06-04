<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$sql = "SELECT Brigade_Id FROM Brigades WHERE Busyness = 'Свободна' LIMIT 1";

$brigade_id = $db->Select($sql)[0]['Brigade_Id'];

if (!$brigade_id)
{
    $sql2 = "SELECT Brigade_Id, Last_Order_Date AS Min_Last_Order_Date
    FROM (
        SELECT Brigade_Id, MAX(Date_Of_End) AS Last_Order_Date
        FROM Orders
        GROUP BY Brigade_Id
    ) AS subquery
    WHERE Last_Order_Date = (
        SELECT MIN(Last_Order_Date)
        FROM (
            SELECT Brigade_Id, MAX(Date_Of_End) AS Last_Order_Date
            FROM Orders
            GROUP BY Brigade_Id
        ) AS inner_subquery
    )";

    $result = $db->Select($sql2)[0];

    $status['status'] = 'error';
    $status['msg'] = 'В данный момент нет свободных бригад';
    $status['brigade_id'] = $result['Brigade_Id'];
    $status['date'] = date("d.m.Y", strtotime($result['Min_Last_Order_Date']));
    
    echo json_encode($status, JSON_UNESCAPED_UNICODE);
    return;
}
else
{
    $status['status'] = 'ok';
    $status['brigade_id'] = $brigade_id; 
    echo json_encode($status, JSON_UNESCAPED_UNICODE);
    return;
}
?>