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
            const response = await fetch('https://devapi.grozep.com/v1/in/inventory-listings');
            const data = await response.json();
            setStocks(data.data);
            console.log(data.data)
        } catch (error) {
            console.error('Error fetching stocks:', error);
        }
    };


    const indexOfLastStock = currentPage * stocksPerPage;
    const indexOfFirstStock = indexOfLastStock - stocksPerPage;
    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        const filteredResults = stocks.filter((stock) => {
            const { id, product_variant } = stock;
            const { product } = product_variant;

            const searchValue = query.toLowerCase();
            const barcodeValue = product_variant.barcode ? product_variant.barcode.toLowerCase() : '';
            const nameValue = product.name ? product.name.toLowerCase() : '';
            const brandValue = product.brand ? product.brand.toLowerCase() : '';
            const idValue = String(id).toLowerCase();

            return (
                barcodeValue.includes(searchValue) ||
                nameValue.includes(searchValue) ||
                brandValue.includes(searchValue) ||
                idValue.includes(searchValue)
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

        let sortedData;
        if (searchQuery) {
            sortedData = [...searchResults].sort((a, b) => {
                const aValue = getFieldByPath(a, column);
                const bValue = getFieldByPath(b, column);

                if (aValue !== undefined && bValue !== undefined) {
                    if (sortOrder === 'asc') {
                        return aValue.toString().localeCompare(bValue.toString());
                    } else {
                        return bValue.toString().localeCompare(aValue.toString());
                    }
                }

                return 0;
            });
            setSearchResults(sortedData);
        } else {
            sortedData = [...stocks].sort((a, b) => {
                const aValue = getFieldByPath(a, column);
                const bValue = getFieldByPath(b, column);

                if (aValue !== undefined && bValue !== undefined) {
                    if (sortOrder === 'asc') {
                        return aValue.toString().localeCompare(bValue.toString());
                    } else {
                        return bValue.toString().localeCompare(aValue.toString());
                    }
                }

                return 0;
            });
            setStocks(sortedData);
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

    const currentStocks = searchQuery ? searchResults.slice(indexOfFirstStock, indexOfLastStock) : stocks.slice(indexOfFirstStock, indexOfLastStock);
    const handleFirstClick = () => {
        setCurrentPage(1);
    };

    const handlePreviousClick = () => {
        setCurrentPage((prevPage) => prevPage - 1);
    };

    const handleNextClick = () => {
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handleLastClick = () => {
        const totalPages = Math.ceil((searchQuery ? searchResults.length : stocks.length) / stocksPerPage);
        setCurrentPage(totalPages);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const exportAsPDF = () => {
        const doc = new jsPDF();
        const tableData = currentStocks.map((stock) => [
            stock.id,
            stock.productVariantId,
            stock.product_variant.product.brand,
            stock.product_variant.product.name,
            stock.inventory_stocks[0].quantity,
            stock.product_variant.barcode,
            stock.product_variant.product.category,
            stock.product_variant.product.subcategory,
            stock.product_variant.product.hsnCode,
            stock.inventory_stocks[0].mfgDate,
            stock.inventory_stocks[0].expDate,
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
                'Variant ID': stock.productVariantId,
                'Brand': stock.product_variant.product.brand,
                'Name': stock.product_variant.product.name,
                'Quantity': stock.inventory_stocks[0].quantity,
                'Barcode': stock.product_variant.barcode,
                'Category': stock.product_variant.product.category,
                'Subcategory': stock.product_variant.product.subcategory,
                'HSN Code': stock.product_variant.product.hsnCode,
                'Mfg Date': stock.inventory_stocks[0].mfgDate,
                'Exp Date': stock.inventory_stocks[0].expDate,
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
                        <div className="search-input-container-stock">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="export-buttons-stock">
                            <button onClick={exportAsPDF} className="export-btn">Export as PDF</button>
                            <button onClick={exportAsExcel} className="export-btn">Export as Excel</button>
                        </div>
                    </div>
                    <div className="table-container">
                        {searchQuery && searchResults.length > 0 ? (
                            <table className="product-table">
                                <thead className="table-header">
                                    <tr>
                                        <th onClick={() => handleSortClick('id')}>ID</th>
                                        <th onClick={() => handleSortClick('productVariantId')}>Variant ID</th>
                                        <th>Image</th>
                                        <th onClick={() => handleSortClick('product_variant.product.name')}>Name</th>
                                        <th>Brand</th>
                                        <th onClick={() => handleSortClick('inventory_stocks[0].quantity')}>Quantity</th>
                                        <th onClick={() => handleSortClick('product_variant.barcode')}>Barcode</th>
                                        <th onClick={() => handleSortClick('product_variant.product.category')}>Category</th>
                                        <th onClick={() => handleSortClick('product_variant.product.subcategory')}>Subcategory</th>
                                        <th onClick={() => handleSortClick('product_variant.product.hsnCode')}>HSN Code</th>
                                        <th onClick={() => handleSortClick('inventory_stocks[0].mfgDate')}>Mfg Date</th>
                                        <th onClick={() => handleSortClick('inventory_stocks[0].expDate')}>Exp Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStocks.map((stock) => (
                                        <tr key={stock.id}>
                                            <td>{stock.id}</td>
                                            <td>{stock.productVariantId}</td>
                                            <td>
                                                <img
                                                    src={stock.product_variant.images[0]}
                                                    alt="product-image"
                                                    className="image-item"
                                                />
                                            </td>
                                            <td>{stock.product_variant.product.name}</td>
                                            <td>{stock.product_variant.product.brand}</td>
                                            <td>{stock.inventory_stocks[0].quantity}</td>
                                            <td>{stock.product_variant.barcode}</td>
                                            <td>{stock.product_variant.product.category}</td>
                                            <td>{stock.product_variant.product.subcategory}</td>
                                            <td>{stock.product_variant.product.hsnCode}</td>
                                            <td>{stock.inventory_stocks[0].mfgDate}</td>
                                            <td>{stock.inventory_stocks[0].expDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <table className="product-table">
                                <thead className="table-header">
                                    <tr>
                                        <th onClick={() => handleSortClick('id')}>ID</th>
                                        <th onClick={() => handleSortClick('productVariantId')}>Variant ID</th>
                                        <th>Image</th>
                                        <th onClick={() => handleSortClick('product_variant.product.name')}>Name</th>
                                        <th>Brand</th>
                                        <th onClick={() => handleSortClick('inventory_stocks[0].quantity')}>Quantity</th>
                                        <th onClick={() => handleSortClick('product_variant.barcode')}>Barcode</th>
                                        <th onClick={() => handleSortClick('product_variant.product.category')}>Category</th>
                                        <th onClick={() => handleSortClick('product_variant.product.subcategory')}>Subcategory</th>
                                        <th onClick={() => handleSortClick('product_variant.product.hsnCode')}>HSN Code</th>
                                        <th onClick={() => handleSortClick('inventory_stocks[0].mfgDate')}>Mfg Date</th>
                                        <th onClick={() => handleSortClick('inventory_stocks[0].expDate')}>Exp Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentStocks.map((stock) => (
                                        <tr key={stock.id}>
                                            <td>{stock.id}</td>
                                            <td>{stock.productVariantId}</td>
                                            <td>
                                                <img
                                                    src={stock.product_variant.images[0]}
                                                    alt="product-image"
                                                    className="image-item"
                                                />
                                            </td>
                                            <td>{stock.product_variant.product.name}</td>
                                            <td>{stock.product_variant.product.brand}</td>
                                            <td>{stock.inventory_stocks[0].quantity}</td>
                                            <td>{stock.product_variant.barcode}</td>
                                            <td>{stock.product_variant.product.category}</td>
                                            <td>{stock.product_variant.product.subcategory}</td>
                                            <td>{stock.product_variant.product.hsnCode}</td>
                                            <td>{stock.inventory_stocks[0].mfgDate}</td>
                                            <td>{stock.inventory_stocks[0].expDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="pagination-container">
                        <Pagination
                            currentPage={currentPage}
                            productsPerPage={stocksPerPage}
                            totalProducts={searchQuery ? searchResults.length : stocks.length}
                            paginate={paginate}
                            handleFirstClick={handleFirstClick}
                            handlePreviousClick={handlePreviousClick}
                            handleNextClick={handleNextClick}
                            handleLastClick={handleLastClick}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
};

export default DealerAllotmentStock;