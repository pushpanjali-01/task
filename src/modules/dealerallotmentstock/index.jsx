import React, { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Pagination from '../../components/pagination';
import "./style.css"
const DealerAllotmentStock = () => {
    const [stocks, setStocks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [stocksPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [sortOrder, setSortOrder] = useState('asc');
    const [sortColumn, setSortColumn] = useState('');

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        try {
            const response = await fetch('https://devapi.grozep.com/v1/in/dealers-stocks');
            const data = await response.json();
            setStocks(data.data);
            setSearchResults(data.data);
        } catch (error) {
            console.error('Error fetching stocks:', error);
        }
    };

    const indexOfLastStock = currentPage * stocksPerPage;
    const indexOfFirstStock = indexOfLastStock - stocksPerPage;

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchClick = () => {
        const filteredResults = stocks.filter((stock) => {
            const { id, dealer_allotment_item } = stock;
            const { product_variant } = dealer_allotment_item;
            const { barcode, name, brand } = product_variant;

            const query = searchQuery.toLowerCase();
            const barcodeValue = barcode ? barcode.toLowerCase() : '';
            const nameValue = name ? name.toLowerCase() : '';
            const brandValue = brand ? brand.toLowerCase() : '';
            const idValue = String(id).toLowerCase();

            return (
                barcodeValue.includes(query) ||
                nameValue.includes(query) ||
                brandValue.includes(query) ||
                idValue.includes(query)
            );
        });

        setSearchResults(filteredResults);
        setCurrentPage(1);
    };

    const handleSortClick = (column) => {
        if (sortColumn === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortOrder('asc');
        }
    };

    const getFieldByPath = (obj, path) => {
        const keys = path.split('.');
        let value = obj;
        for (const key of keys) {
            if (value && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        return value;
    };

    const sortedStocks = [...searchResults].sort((a, b) => {
        const aValue = getFieldByPath(a, sortColumn);
        const bValue = getFieldByPath(b, sortColumn);

        if (aValue && bValue) {
            if (sortOrder === 'asc') {
                return aValue.toString().localeCompare(bValue.toString());
            } else {
                return bValue.toString().localeCompare(aValue.toString());
            }
        }

        return 0;
    });

    const currentStocks = sortedStocks.slice(indexOfFirstStock, indexOfLastStock);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const exportAsPDF = () => {
        const doc = new jsPDF();
        const tableData = currentStocks.map((stock) => [
            stock.id,
            stock.dealer_allotment_item.id,
            stock.dealer_allotment_item.product_variant.product.brand,
            stock.dealer_allotment_item.product_variant.product.name,
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
                ['ID', 'Variant ID', 'Brand', 'Name', 'Quantity', 'Barcode', 'Category', 'Subcategory', 'HSN Code', 'Mfg Date', 'Exp Date'],
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
            currentStocks.map((stock) => ({
                'ID': stock.id,
                'Variant ID': stock.dealer_allotment_item.id,
                'Brand': stock.dealer_allotment_item.product_variant.product.brand,
                'Name': stock.dealer_allotment_item.product_variant.product.name,
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
        <main>
            <section className='dealer-stock-section'>
                <div>
                    <h5>Dealer Stocks</h5>
                    <div className='header'>
                        <div className="search-input-container">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                            <button onClick={handleSearchClick} className='search-btn'>Search</button>
                        </div>
                        <div className="export-buttons">
                            <button onClick={exportAsPDF} className="export-btn">Export as PDF</button>
                            <button onClick={exportAsExcel} className="export-btn">Export as Excel</button>
                        </div>
                    </div>
                    <div className="table-container">
                        {currentStocks.length > 0 ? (
                            <table className="product-table">
                                <thead className="table-header">
                                    <tr>
                                        <th onClick={() => handleSortClick('id')}>ID</th>
                                        <th onClick={() => handleSortClick('dealer_allotment_item.id')}>Variant ID</th>
                                        <th>Image</th>
                                        <th onClick={() => handleSortClick('dealer_allotment_item.product_variant.product.name')}>Name</th>
                                        <th>Brand</th>
                                        <th onClick={() => handleSortClick('dealer_allotment_item.quantity')}>Quantity</th>
                                        <th onClick={() => handleSortClick('dealer_allotment_item.product_variant.barcode')}>Barcode</th>
                                        <th onClick={() => handleSortClick('dealer_allotment_item.product_variant.product.category')}>Category</th>
                                        <th onClick={() => handleSortClick('dealer_allotment_item.product_variant.product.subcategory')}>Subcategory</th>
                                        <th onClick={() => handleSortClick('dealer_allotment_item.product_variant.product.hsnCode')}>HSN Code</th>
                                        <th onClick={() => handleSortClick('mfgDate')}>Mfg Date</th>
                                        <th onClick={() => handleSortClick('expDate')}>Exp Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStocks.map((stock) => (
                                        <tr key={stock.id}>
                                            <td>{stock.id}</td>
                                            <td>{stock.dealer_allotment_item.id}</td>
                                            <td>
                                                <img
                                                    src={`https://media.grozep.com/images/products/${stock.dealer_allotment_item.product_variant.images[0]}`}
                                                    alt="product-image"
                                                    className="image-item"
                                                />
                                            </td>

                                            <td>{stock.dealer_allotment_item.product_variant.product.name}</td>
                                            <td>{stock.dealer_allotment_item.product_variant.product.brand}</td>
                                            <td>{stock.dealer_allotment_item.quantity}</td>
                                            <td>{stock.dealer_allotment_item.product_variant.barcode}</td>
                                            <td>{stock.dealer_allotment_item.product_variant.product.category}</td>
                                            <td>{stock.dealer_allotment_item.product_variant.product.subcategory}</td>
                                            <td>{stock.dealer_allotment_item.product_variant.product.hsnCode}</td>
                                            <td>{stock.mfgDate}</td>
                                            <td>{stock.expDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No matching results found.</p>
                        )}
                    </div>
                    <div className="pagination-container">
                        <Pagination
                            currentPage={currentPage}
                            productsPerPage={stocksPerPage}
                            totalProducts={searchResults.length}
                            paginate={paginate}
                        />
                    </div>

                </div>
            </section>
        </main>
    );

};

export default DealerAllotmentStock;
