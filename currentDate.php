<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");

$status = [];

$currnet_date = date("Y-m-d");

$order_id = $_GET['id'];

$sql = "SELECT Date_Of_End FROM Orders WHERE Order_Id = $order_id";

    $date_of_end = $db->Select($sql)[0]['Date_Of_End'];

    if($date_of_end > $currnet_date)
    {
        $status['status'] = 'error';
        $status['msg'] = 'Данный документ не доступен до даты завершения заказа';
        echo json_encode($status, JSON_UNESCAPED_UNICODE);
        return;
    }
    else
    {
        $status['status'] = 'ok';
        echo json_encode($status, JSON_UNESCAPED_UNICODE);
        return;
    }
?>