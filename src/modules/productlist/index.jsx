import React, { useEffect, useState } from 'react';
import './style.css';
import Pagination from '../../components/pagination';
import 'jspdf-autotable';
import search from "../../asserts/images/searchicon.svg"
import ExportOptions from '../../components/exportdata';
function ProductList() {
  const [productData, setProductData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [exportOption, setExportOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortColumn, setSortColumn] = useState('');

  useEffect(() => {
    fetchProductData();
  }, []);

  const fetchProductData = async () => {
    try {
      const response = await fetch(
        'https://api.grozep.com/v1/in/listings/stores?storeCode=JHDTO001'
      );
      const data = await response.json();
      setProductData(data.data);
      console.log(data.data)
    } catch (error) {
      console.error('Failed to fetch product data:', error);
    }
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  const matchesSearchQuery = (product, query) => {
    const searchFields = ['id', 'brand', 'name', 'variant.size', 'variant.barcode', 'variant.supplies[0].off', 'category', 'subcategory'];
    for (const field of searchFields) {
      const value = getFieldByPath(product, field);
      if (value && value.toString().toLowerCase().includes(query.toLowerCase())) {
        return true;
      }
    }
    return false;
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

  const sortedProducts = [...productData].sort((a, b) => {
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

  const filteredProducts = sortedProducts.filter((product) =>
    matchesSearchQuery(product, searchQuery)
  );

  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handlePreviousClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleFirstClick = () => {
    setCurrentPage(1);
  };

  const handleLastClick = () => {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    setCurrentPage(totalPages);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when search query changes
  };

  const handleSortClick = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortOrder('asc');
    }
  };
  return (
    <main>
      <section>
        <div className="product-list">
          <div className='header'>
            <div className="search-container">
              <img src={search} alt="" className='search-icon' />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <div className="export-buttons">
              <ExportOptions filteredProducts={filteredProducts} />
            </div>
          </div>
          <div className="table-container" >
            <table className="product-table">
              <thead className="table-header">
                <tr>
                  <th onClick={() => handleSortClick('id')}>ID</th>
                  <th onClick={() => handleSortClick('variant.id')}>Variant ID</th>
                  <th>Image</th>
                  <th onClick={() => handleSortClick('brand')}>Brand</th>
                  <th onClick={() => handleSortClick('name')}>Name</th>
                  <th onClick={() => handleSortClick('variant.size')}>Size</th>
                  <th>Locations</th>
                  <th onClick={() => handleSortClick('variant.barcode')}>Barcode</th>
                  <th onClick={() => handleSortClick('variant.supplies[0].mrp')}>MRP</th>
                  <th>Discount</th>
                  <th>Rate</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Stock</th>
                  <th>HSN Code</th>
                  <th>Mfg Date</th>
                  <th>Exp Date</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product, index) => (
                  <tr key={index}>
                    <td>{product.id}</td>
                    <td>{getFieldByPath(product, 'variant.id')}</td>
                    <td>
                      <img
                        src={product.variant?.imageURL[0]}
                        alt="Product"
                        className="product-image"
                      />
                    </td>
                    <td>{product.brand}</td>
                    <td>{product.name}</td>
                    <td>{getFieldByPath(product, 'variant.size')}</td>
                    <td>{product.locations}</td>
                    <td>{product.variant.barcode}</td>
                    <td>{product.variant.supplies[0].mrp}</td>
                    <td>{product.variant.supplies[0].off}</td>
                    <td>{product.rate}</td>
                    <td>{product.category}</td>
                    <td>{product.subcategory}</td>
                    <td>{product.variant.supplies[0].quantity}</td>
                    <td>{product.hsncode}</td>
                    <td>{getFieldByPath(product, 'variant.supplies[0].mfgDate')}</td>
                    <td>{getFieldByPath(product, 'variant.supplies[0].expDate')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-container">
            <Pagination
              currentPage={currentPage}
              productsPerPage={productsPerPage}
              totalProducts={filteredProducts.length}
              paginate={paginate}
              handlePreviousClick={handlePreviousClick}
              handleNextClick={handleNextClick}
              handleFirstClick={handleFirstClick}
              handleLastClick={handleLastClick}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProductList;
