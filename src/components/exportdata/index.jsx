import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import "./style.css"
const ExportOptions = ({ filteredProducts }) => {
  const exportAsPDF = () => {
    const doc = new jsPDF();
    const tableData = filteredProducts.map((product) => [
      product.id,
      product.variant.id,
      product.brand,
      product.name,
      product.variant.size,
      product.locations,
      product.variant.barcode,
      product.variant.supplies[0].mrp,
      product.variant.supplies[0].off,
      product.rate,
      product.category,
      product.subcategory,
      product.variant.supplies[0].quantity,
      product.hsncode,
      product.variant.supplies[0].mfgDate,
      product.variant.supplies[0].expDate,
    ]);

    doc.autoTable({
      head: [
        ['ID', 'Variant ID', 'Brand', 'Name', 'Size', 'Locations', 'Barcode', 'MRP', 'Discount', 'Rate', 'Category', 'Subcategory', 'Stock', 'HSN Code', 'Mfg Date', 'Exp Date'],
      ],
      body: tableData,
      styles: {
        cellPadding: 0.5,
        fontSize: 5,
        valign: 'middle',
        halign: 'center',
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: '#f5f5f5',
        textColor: '#000',
        fontSize: 7,
        fontStyle: 'bold',
        lineColor: [0, 0, 0], 
      },
      alternateRowStyles: {
        fillColor: '#f9f9f9',
      },
    });

    doc.save('product_list.pdf');
  };

  const exportAsExcel = () => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map((product) => ({
        'ID': product.id,
        'Variant ID': product.variant.id,
        'Brand': product.brand,
        'Name': product.name,
        'Size': product.variant.size,
        'Locations': product.locations,
        'Barcode': product.variant.barcode,
        'MRP': product.variant.supplies[0].mrp,
        'Discount': product.variant.supplies[0].off,
        'Rate': product.rate,
        'Category': product.category,
        'Subcategory': product.subcategory,
        'Stock': product.variant.supplies[0].quantity,
        'HSN Code': product.hsncode,
        'Mfg Date': product.variant.supplies[0].mfgDate,
        'Exp Date': product.variant.supplies[0].expDate,
      }))
    );

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Product List');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const excelData = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(excelData, 'product_list.xlsx');
  };

  return (
    <div className="export-buttons">
      <button onClick={exportAsPDF} className='export-btn'>Export as PDF</button>
      <button onClick={exportAsExcel} className='export-btn'>Export as Excel</button>
    </div>
  );
};

export default ExportOptions;
