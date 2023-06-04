<?php

$status = [];

session_start();

if(isset($_SESSION))
{
    $status['status'] = 'ok';
    $status['msg'] = 'Вы успешно вышли из системы';
    session_start();
    session_destroy();
}
else 
{
    $status['status'] = 'error';
    $status['msg'] = 'Возникли неполадки при попытке покинуть систему';
}

echo json_encode($status);
?>