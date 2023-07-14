import React from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Export = ({ filteredStocks }) => {
  const exportAsPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredStocks.map((stock) => [
      stock.id,
      stock.dealer_allotment_item.id,  
      stock.dealer_allotment_item.product_variant.product.name,
      stock.dealer_allotment_item.product_variant.product.brand,
      stock.dealer_allotment_item.quantity,
      stock.dealer_allotment_item.product_variant.barcode,
      stock.dealer_allotment_item.product_variant.product.category,
      stock.dealer_allotment_item.product_variant.product.subcategory,
      stock.dealer_allotment_item.product_variant.product.hsnCode,
      stock.mfgDate,
      stock.expDate,
    ]);

    doc.autoTable({
      head: [
        ['ID', 'Variant ID', 'Brand', 'Name', 'Size', 'Quantity', 'Barcode', 'Category', 'Subcategory', 'HSN Code', 'Mfg Date', 'Exp Date'],
      ],
      body: tableData,
      styles: {
        cellPadding: 0.5,
        fontSize: 8,
        valign: 'middle',
        halign: 'center',
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: '#f5f5f5',
        textColor: '#000',
        fontSize: 9,
        fontStyle: 'bold',
        lineColor: [0, 0, 0], 
      },
      alternateRowStyles: {
        fillColor: '#f9f9f9',
      },
    });

    doc.save('dealer_allotment_stock.pdf');
  };

  const exportAsExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      filteredStocks.map((stock) => ({
        'ID': stock.id,
        'Variant ID': stock.dealer_allotment_item.id,
        'Name': stock.dealer_allotment_item.product_variant.product.name,
        'Brand': stock.dealer_allotment_item.product_variant.product.brand,
        'Quantity': stock.dealer_allotment_item.quantity,
        'Barcode': stock.dealer_allotment_item.product_variant.barcode,
        'Category': stock.dealer_allotment_item.product_variant.product.category,
        'Subcategory': stock.dealer_allotment_item.product_variant.product.subcategory,
        'HSN Code': stock.dealer_allotment_item.product_variant.product.hsnCode,
        'Mfg Date': stock.mfgDate,
        'Exp Date': stock.expDate,
      }))
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Dealer Allotment Stock');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const excelData = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(excelData, 'dealer_allotment_stock.xlsx');
  };

  return (
    <div className="export-buttons">
      <button onClick={exportAsPDF} className="export-btn">Export as PDF</button>
      <button onClick={exportAsExcel} className="export-btn">Export as Excel</button>
    </div>
  );
};

export default Export;
