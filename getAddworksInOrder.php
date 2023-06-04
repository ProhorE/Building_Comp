<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$date_of_start = date("Y-m-d");

$project_id = $_GET['id'];

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

    $active_order = $db->SELECT($sql)[0]['Order_Id'];

    if($active_order)
    {
        $status['status'] = 'error';
        $status['msg'] = 'В данный момент у вас уже есть активный заказ';
        echo json_encode($status, JSON_UNESCAPED_UNICODE);
        return;
    }

    $sql2 = "SELECT * FROM Additional_Works";

    $result = $db->SELECT($sql2);

echo json_encode($result, JSON_UNESCAPED_UNICODE);
}
?>