<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/tpdf/tfpdf.php");

session_start();

$order_id = $_GET['id'];

$status = [];

$sql = "SELECT 
`Orders`.`Date_Of_End`,
`Projects`.`Project_Name`,
`Projects`.`Project_Price`,
`Brigades`.`Brigade_Id`,
`Workers`.`Worker_Id`,
(CONCAT(`Workers`.`Surname`, ' ', SUBSTRING(`Workers`.`Name`, 1, 1), '.',  ' ', SUBSTRING(`Workers`.`Second_Name`, 1, 1), '.')) AS 'Worker_FIO',
`Workers`.`Role_In_Brigade`
FROM `Orders`
JOIN `Projects`
ON `Projects`.`Project_Id` = `Orders`.`Project_Id`
JOIN `Brigades`
ON `Brigades`.`Brigade_Id` = `Orders`.`Brigade_Id`
JOIN `Workers`
ON `Workers`.`Brigade_Id` = `Brigades`.`Brigade_Id`
WHERE 
`Orders`.`Order_Id` = $order_id;
";

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
WHERE `Orders`.`Order_Id` = $order_id
";

$result = $db->Select($sql);

$addresult = $db->Select($sql2);

$total_cost = $result[0]['Project_Price'];

for($i=0; $i<count($addresult); $i++)
{
    $total_cost+= $addresult[$i]['AddWork_Price'];
}

$formattedDate = date("d.m.Y", strtotime($result[0]['Date_Of_End']));

$workers_amount = 3;

$full_earn = $total_cost * 0.1;

$earn = ceil(($total_cost / $workers_amount) * 0.1);

$text_color = array(0, 0, 0);
$header_color = array(100, 100, 100);

$pdf = new tFPDF('P', 'mm', 'A4');

$pdf->SetTextColor($text_color[0], $text_color[1], $text_color[2]);
 
$pdf->AddPage();
 
$pdf->AddFont('NewRoman', '', 'timesnewromanpsmt.ttf', true);

$pdf->SetFont('NewRoman', '', 18);
$pdf->Cell(0, 0, 'ПЛАТЕЖНАЯ ВЕДОМОСТЬ БРИГАДЕ', 0, 0, 'C');

$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Cell(0, 15, 'за выполнение подрядных работ', 0, 0, 'C');
$pdf->Ln();
$pdf->Cell(0, 15, 'по договору №'.$order_id, 0, 0, 'C');

$pdf->Ln();
$pdf->Cell(0, 15, 'г. Москва', 0, 0);
$pdf->Cell(0, 15, $formattedDate.' г.', 0, 0, 'R');

$pdf->Ln();
$pdf->Write(5, 'По настоящей платежной ведомости бригаде №'.$result[0]['Brigade_Id'].' выплачена сумма, равная 10% от суммы выполненного заказа (общая сумма заказа: '.$total_cost.' рублей), а именно: '.$full_earn.' рублей.');
$pdf->Ln();
$pdf->Write(5, 'Подробный перечень выполненных работ: ');

$pdf->SetFontSize(18);
$pdf->Ln();
$pdf->Cell(0, 15, '1. ПЕРЕЧЕНЬ ВЫПОЛНЕННЫХ РАБОТ', 0, 0, 'C');

$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Write(5, '1.1 Наименование проекта дома: '.$result[0]['Project_Name'].'.');
$pdf->Ln();
$pdf->Write(5, '1.2 Стоимость проекта дома: '.$result[0]['Project_Price'].' рублей.');

if(!$addresult)
{
    $pdf->Ln();
    $pdf->Write(5, '1.3 Дополнительные услуги в составе договора: отсутствуют.');
}
else
{
    $pdf->Ln();
    $pdf->Write(5, '1.3 Дополнительные услуги в составе договора: ');
    for($i=0; $i<count($addresult); $i++)
    {
        $pdf->Ln();
        $pdf->Write(5, '1.3' . ($i + 1) . ' ' . $addresult[$i]['Work_Name'] . ' x' . $addresult[$i]['Type_Of_Work_Amount'] . ' (' . $addresult[$i]['AddWork_Price'] . ') рублей.');
    }
}

$pdf->SetFontSize(18);
$pdf->Ln();
$pdf->Cell(0, 15, '2. РАСПРЕДЕЛЕНИЕ ВЫПЛАЧЕННЫХ СРЕДСТВ', 0, 0, 'C');

$pdf->SetFontSize(12);
for($i=0; $i<count($result); $i++)
{
    $pdf->Ln();
    $pdf->Write(5, '2.' . ($i + 1) . ' ' . "Табельный номер: ".$result[$i]['Worker_Id'].", Ф.И.О. работника: ".$result[$i]['Worker_FIO'].", должность в бригаде: ".$result[$i]['Role_In_Brigade'].", выплата: ".$earn." рублей.");
}

$pdf->Ln(15);
$pdf->Cell(0, 15, "_______________________________", 0, 0, "L");
$pdf->Cell(0, 15, "_______________________________", 0, 0, "R");
$pdf->Ln();
$pdf->Cell(0, 0, "Подпись подрядчика", 0, 0, "L");
$pdf->Cell(0, 0, "Подпись бригадира", 0, 0, "R");

$pdf->Output('contract.pdf', 'D');
?>