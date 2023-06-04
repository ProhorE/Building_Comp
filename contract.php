<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/tpdf/tfpdf.php");

session_start();

$order_id = $_GET['id'];

$status = [];

$sql = "SELECT 
`Orders`.`Date_Of_Start`,
`Projects`.`Project_Name`,
`Projects`.`Project_Price`,
`Projects`.`Time_Of_Building`,
CONCAT(`Clients`.`Surname`, ' ', SUBSTRING(`Clients`.`Name`, 1, 1), '.', ' ', SUBSTRING(`Clients`.`Second_Name`, 1, 1), '.') AS 'Client_FIO',
`Clients`.`Passport_Number`,
`Clients`.`Passport_Series`,
`Clients`.`Phone_Number`,
`Brigades`.`Brigade_Id`,
(CONCAT(`Workers`.`Surname`, ' ', SUBSTRING(`Workers`.`Name`, 1, 1), '.',  ' ', SUBSTRING(`Workers`.`Second_Name`, 1, 1), '.')) AS 'Brigader_FIO'
FROM `Orders`
JOIN `Clients` 
ON `Clients`.`Client_Id` = `Orders`.`Client_Id`
JOIN `Projects`
ON `Projects`.`Project_Id` = `Orders`.`Project_Id`
JOIN `Brigades`
ON `Brigades`.`Brigade_Id` = `Orders`.`Brigade_Id`
JOIN `Workers`
ON `Workers`.`Brigade_Id` = `Brigades`.`Brigade_Id`
WHERE 
`Orders`.`Order_Id` = $order_id AND `Workers`.`Role_In_Brigade` = 'Бригадир';
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

$result = $result[0];

$total_cost = $result['Project_Price'];

$formattedDate = date("d.m.Y", strtotime($result['Date_Of_Start']));

$client_info = $result['Client_FIO'].", номер/серия паспорта: ".$result['Passport_Number']."/".$result['Passport_Series'].", телефон: ".$result['Phone_Number'];

$text_color = array(0, 0, 0);
$header_color = array(100, 100, 100);

$pdf = new tFPDF('P', 'mm', 'A4');

$pdf->SetTextColor($text_color[0], $text_color[1], $text_color[2]);
 
$pdf->AddPage();
 
$pdf->AddFont('NewRoman', '', 'timesnewromanpsmt.ttf', true);

$pdf->SetFont('NewRoman', '', 18);
$pdf->Cell(0, 0, 'ДОГОВОР №'.$order_id, 0, 0, 'C');

$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Cell(0, 15, 'на выполнение подрядных работ', 0, 0, 'C');

$pdf->Ln();
$pdf->Cell(0, 15, 'г. Москва', 0, 0);
$pdf->Cell(0, 15, $formattedDate.' г.', 0, 0, 'R');

$pdf->Ln();
$pdf->Write(5, 'Настоящий договор заключен между ООО "MASTERY OF ARCHITECTURE", действующим на основании свидетельства (серия 54 №542300495482 от 01.01.2023 г.), именуемый в дальнейшем "Подрядчик", с одной стороны, и '.$client_info.', именуемый в дальнейшем "Заказчик", с другой стороны.');
$pdf->Ln();
$pdf->Write(5, 'Заключили настоящий договор о нижеследующем:');

$pdf->SetFontSize(18);
$pdf->Ln();
$pdf->Cell(0, 15, '1. ПРЕДМЕТ ДОГОВОРА', 0, 0, 'C');

$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Write(5, '1.1 По настоящему договору "Подрядчик" обязуется по заданию "Заказчика" выполнить в соответствии с условиями настоящего Договора работу, а "Заказчик" обязуется принять эту работу и оплатить её.');
$pdf->Ln();
$pdf->Write(5, '1.2 Работа осуществляется на территории "Заказчика" назначенной "Подрядчиком" бригадой (номер бригады №'.$result['Brigade_Id'].'), руководитель бригады: '.$result['Brigader_FIO']);
$pdf->Ln();
$pdf->Write(5, '1.3 Виды работ и объемы определяются в пункте: "2. Требования заказчика к предмету договора".');

$pdf->SetFontSize(18);
$pdf->Ln();
$pdf->Cell(0, 15, '2. ТРЕБОВАНИЯ ЗАКАЗЧИКА К ПРЕДМЕТУ ДОГОВОРА', 0, 0, 'C');

$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Write(5, '2.1 Количественные характеристики предмета договора:');
$pdf->Ln();
$pdf->Write(5, '2.1.1 Наименование проекта дома: '.$result['Project_Name'].'.');
$pdf->Ln();
$pdf->Write(5, '2.2.2 Стоимость проекта дома: '.$result['Project_Price'].' рублей.');
$pdf->Ln();
$pdf->Write(5, '2.2.3 Количество полных дней строительства проекта дома: '.$result['Time_Of_Building'].' дней.');

if(!$addresult)
{
    $pdf->Ln();
    $pdf->Write(5, '2.2.4 Дополнительные услуги в составе договора: отсутствуют.');
}
else
{
    $pdf->Ln();
    $pdf->Write(5, '2.2.4 Дополнительные услуги в составе договора: ');
    for($i=0; $i<count($addresult); $i++)
    {
        $pdf->Ln();
        $pdf->Write(5, '2.2.4.' . ($i + 1) . ' ' . $addresult[$i]['Work_Name'] . ' x' . $addresult[$i]['Type_Of_Work_Amount'] . ' (' . $addresult[$i]['AddWork_Price'] . ') рублей.');
        $total_cost+= $addresult[$i]['AddWork_Price'];
    }
}

$pdf->SetFontSize(18);
$pdf->Ln();
$pdf->Cell(0, 15, '3. ПОРЯДОК РАСЧЕТА', 0, 0, 'C');
$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Write(5, '3.1 Итоговая договорная цена определена в размере: '.$total_cost. ' рублей.');

$pdf->Ln(15);
$pdf->Cell(0, 15, "_______________________________", 0, 0, "L");
$pdf->Cell(0, 15, "_______________________________", 0, 0, "R");
$pdf->Ln();
$pdf->Cell(0, 0, "Подпись подрядчика", 0, 0, "L");
$pdf->Cell(0, 0, "Подпись заказчика", 0, 0, "R");

$pdf->Output('contract.pdf', 'D');
?>