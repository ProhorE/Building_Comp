<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");


define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', '99955577tT');

session_start();

$login = $_POST['Login'];
$password = $_POST['Password'];

$status = [];

if($login == ADMIN_USERNAME)
{
    if($password == ADMIN_PASSWORD)
    {
        $status['status'] = 'ok';
        $status['msg'] = 'Успешный вход';
        $status['is_admin'] = true;
        $status['user_name'] = 'Администратор';

        $_SESSION['user_id'] = -1;
        $_SESSION['user_name'] = 'Администратор';
    }
    else
    {
        $status['status'] = 'error';
        $status['msg'] = 'Введен неверный пароль';
        $status['name'] = 'Password';
    }
    echo json_encode($status);
    return;
}

$sql = "SELECT * FROM Clients WHERE Login = '$login'";
$result = $db->Select($sql);

if (count($result) == 0)
{
    $status['status'] = 'error';
    $status['msg'] = 'Логин не найден';
    $status['name'] = 'Login';
}
else if($result[0]['Password'] == $password)
{
    $status['status'] = 'ok';
    $status['msg'] = 'Успешный вход';
    $status['user_name'] = $result[0]['Name'];

    $_SESSION['user_id'] = $result[0]['Client_Id'];
    $_SESSION['user_name'] = $result[0]['Name'];
}
else
{
    $status['status'] = 'error';
    $status['msg'] = 'Введен неверный пароль';
    $status['name'] = 'Password';
}

echo json_encode($status);
?>