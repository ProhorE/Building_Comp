<?php
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/open_db.php");
require_once("/home/s/s96458su/s96458su.beget.tech/public_html/scripts/tpdf/tfpdf.php");

session_start();

$order_id = $_GET['id'];

$status = [];

$sql = "SELECT 
`Orders`.`Date_Of_Start`,
`Orders`.`Date_Of_End`,
`Projects`.`Project_Name`,
`Projects`.`Project_Price`,
CONCAT(`Clients`.`Surname`, ' ', SUBSTRING(`Clients`.`Name`, 1, 1), '.', ' ', SUBSTRING(`Clients`.`Second_Name`, 1, 1), '.') AS 'Client_FIO',
`Clients`.`Passport_Number`,
`Clients`.`Passport_Series`,
`Clients`.`Phone_Number`
FROM `Orders`
JOIN `Clients` 
ON `Clients`.`Client_Id` = `Orders`.`Client_Id`
JOIN `Projects`
ON `Projects`.`Project_Id` = `Orders`.`Project_Id`
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

$result = $result[0];

$total_cost = $result['Project_Price'];

$formattedDate_Start = date("d.m.Y", strtotime($result['Date_Of_Start']));
$formattedDate_End = date("d.m.Y", strtotime($result['Date_Of_End']));

$client_info = $result['Client_FIO'].", номер/серия паспорта: ".$result['Passport_Number']."/".$result['Passport_Series'].", телефон: ".$result['Phone_Number'];

$text_color = array(0, 0, 0);
$header_color = array(100, 100, 100);

$pdf = new tFPDF('P', 'mm', 'A4');

$pdf->SetTextColor($text_color[0], $text_color[1], $text_color[2]);
 
$pdf->AddPage();
 
$pdf->AddFont('NewRoman', '', 'timesnewromanpsmt.ttf', true);

$pdf->SetFont('NewRoman', '', 18);
$pdf->Cell(0, 0, 'АКТ', 0, 0, 'C');

$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Cell(0, 15, 'приемки объекта строительства', 0, 0, 'C');
$pdf->Ln();
$pdf->Cell(0, 15, 'к Договору №'.$order_id.' от '.$formattedDate_Start, 0, 0, 'C');

$pdf->Ln();
$pdf->Cell(0, 15, 'г. Москва', 0, 0);
$pdf->Cell(0, 15, $formattedDate_End.' г.', 0, 0, 'R');

$pdf->Ln();
$pdf->Write(5, 'Мы, нижеподписавшиеся, представитель ООО "MASTERY OF ARCHITECTURE", действующим на основании свидетельства (серия 54 №542300495482 от 01.01.2023 г.), именуемый в дальнейшем "Подрядчик", с одной стороны, и '.$client_info.', именуемый в дальнейшем "Заказчик", с другой стороны.');
$pdf->Ln();
$pdf->Write(5, 'Составили настоящий акт о том, что:');

$pdf->Ln();
$pdf->Write(5, '1. "Заказчик" принял в пользование помещение/загородный дом.' );
$pdf->Ln();
$pdf->Write(5, '2. На момент приемки, помещение и его инженерное и санитарно-техническое оборудование находятся в надлежащем состоянии, пригодном к дальнейшему использованию.');
$pdf->Ln();
$pdf->Write(5, '3. По техническому состоянию помещения у "Заказчика" претензий нет.');
$pdf->Ln();
$pdf->Write(5, '4. Ключи от помещения "Заказчик" получил.');

$pdf->SetFontSize(18);
$pdf->Ln();
$pdf->Cell(0, 15, '1. ПЕРЕЧЕНЬ ВЫПОЛНЕННЫХ РАБОТ', 0, 0, 'C');

$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Write(5, '1.1 Наименование проекта дома: '.$result['Project_Name'].'.');
$pdf->Ln();
$pdf->Write(5, '1.2 Стоимость проекта дома: '.$result['Project_Price'].' рублей.');

if(!$addresult)
{
    $pdf->Ln();
    $pdf->Write(5, '1.3 Выполненные дополнительные услуги: отсутствовали в договоре.');
}
else
{
    $pdf->Ln();
    $pdf->Write(5, '1.3 Выполненные дополнительные услуги: ');
    for($i=0; $i<count($addresult); $i++)
    {
        $pdf->Ln();
        $pdf->Write(5, '1.3.' . ($i + 1) . ' ' . $addresult[$i]['Work_Name'] . ' x' . $addresult[$i]['Type_Of_Work_Amount'] . ' (' . $addresult[$i]['AddWork_Price'] . ') рублей.');
        $total_cost+= $addresult[$i]['AddWork_Price'];
    }
}

$pdf->SetFontSize(18);
$pdf->Ln();
$pdf->Cell(0, 15, '2. ПОРЯДОК РАСЧЕТА', 0, 0, 'C');
$pdf->SetFontSize(12);
$pdf->Ln();
$pdf->Write(5, '2.1 Итоговая договорная цена определена в размере: '.$total_cost. ' рублей.');

$pdf->Ln(15);
$pdf->Cell(0, 15, "_______________________________", 0, 0, "L");
$pdf->Cell(0, 15, "_______________________________", 0, 0, "R");
$pdf->Ln();
$pdf->Cell(0, 0, "Подпись подрядчика", 0, 0, "L");
$pdf->Cell(0, 0, "Подпись заказчика", 0, 0, "R");

$pdf->Output('contract.pdf', 'D');
?>