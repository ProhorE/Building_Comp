<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$date_of_start = date("Y-m-d");

$project_id = $_GET['id'];

$brigade_id = $_GET['brigade_id'];

session_start();

if (!$_SESSION['user_id'])
{
    $status['status'] = 'error';
    $status['msg'] = 'Чтобы оформить заказ войдите в систему';
    echo json_encode($status, JSON_UNESCAPED_UNICODE);
    return;
}
else 
{
    $client_id = $_SESSION['user_id'];

    $sql = "SELECT Order_Id FROM Orders WHERE Client_Id = $client_id AND Date_Of_End >= $date_of_start";

    $active_order = $db->Select($sql)[0]['Order_Id'];

    if($active_order)
    {
        $status['status'] = 'error';
        $status['msg'] = 'В данный момент у вас уже есть активный заказ';
        echo json_encode($status, JSON_UNESCAPED_UNICODE);
        return;
    }

    $sql2 = "SELECT `Brigades`.`Busyness`, `Orders`.`Date_Of_End` AS `Last_Date`
    FROM `Brigades`
    JOIN `Orders` ON `Orders`.`Brigade_Id` = `Brigades`.`Brigade_Id`
    WHERE `Brigades`.`Brigade_Id` = $brigade_id
    ORDER BY `Orders`.`Date_Of_End` DESC
    LIMIT 1";

    $busyness = $db->Select($sql2)[0];

    if($busyness['Busyness'] == 'Занята')
    {
        $date_of_start = $busyness['Last_Date'];
    }

    $sql3 = "SELECT Time_Of_Building FROM Projects WHERE Project_Id = $project_id";

    $new_date = $db->Select($sql3)[0]['Time_Of_Building'];

    $date_of_end = date("Y-m-d", strtotime("$date_of_start + $new_date days"));

    $sql4 = "INSERT INTO Orders 
    VALUES(NULL, $client_id, $project_id, $brigade_id, '$date_of_start', '$date_of_end')";

    $insert_result = $db->Execute($sql4);

    if (!$insert_result)
    {
        $status['status'] = 'error';
        $status['msg'] = 'Не удалось оформить заказ';
    }
    else
    {
        $status['status'] = 'ok';
        $status['msg'] = 'Ваш заказ успешно оформлен';
    }
    echo json_encode($status);
}
?>