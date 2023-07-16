import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import './style.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function StoreAllotment() {
    const [storeCodes, setStoreCodes] = useState([]);
    const [selectedStoreCode, setSelectedStoreCode] = useState('');
    const [productData, setProductData] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchCartItems, setSearchCartItems] = useState([])
    const [searchResults, setSearchResults] = useState([]);
    const [storeAllotmentResponse, setStoreAllotmentResponse] = useState([])
    const [isStoreAlloted, setIsStoreAlloted] = useState(false)

    console.log(searchCartItems)
    console.log(cartItems)

    console.log(searchResults)
    useEffect(() => {
        fetchStoreCodes();
    }, []);

    useEffect(() => {
        if (selectedStoreCode) {
            fetchProductData();
        }
    }, [selectedStoreCode]);

    const fetchStoreCodes = async () => {
        try {
            const response = await axios.get('https://devapi.grozep.com/v1/in/stores');
            const codes = response.data.data.map((store) => store.code);
            setStoreCodes(codes);
        } catch (error) {
            console.log('Error fetching store codes:', error);
        }
    };

    const fetchProductData = async () => {
        try {
            const response = await axios.get(
                `https://devapi.grozep.com/v1/stores/allotments/generate?storecode=${selectedStoreCode}`
            );

            const dataWithOrderQuantity = response.data.data.map((product) => {
                const desiredCapacity = product.maxCapacity - product.minCapacity;
                const availableCapacity = product.supplies.reduce((sum, supply) => sum + supply.remaining, 0);
                let orderQuantity;

                if (desiredCapacity > availableCapacity) {
                    orderQuantity = availableCapacity;
                } else {
                    orderQuantity = desiredCapacity;
                }

                return {
                    ...product,
                    orderQuantity: orderQuantity,
                    cartQuantity: 0,
                    selected: false,
                };
            });

            setProductData(dataWithOrderQuantity);
        } catch (error) {
            console.log('Error fetching product data:', error);
        }
    };

    const handleStoreCodeChange = (event) => {
        setSelectedStoreCode(event.target.value);

    };

    const handleStorePlusClick = (product) => {
        const updatedProduct = { ...product };
        updatedProduct.cartQuantity += 1;
        updatedProduct.orderQuantity -= 1;

        setProductData((prevProductData) => {
            return prevProductData.map((prevProduct) => {
                if (prevProduct.id === updatedProduct.id) {
                    return updatedProduct;
                }
                return prevProduct;
            });
        });

        const existingItemIndex = cartItems.findIndex((item) => item.id === updatedProduct.id);

        if (existingItemIndex !== -1) {
            const updatedCartItems = [...cartItems];
            updatedCartItems[existingItemIndex].cartQuantity += 1;
            updatedCartItems[existingItemIndex].orderQuantity -= 1;
            setCartItems(updatedCartItems);
        } else {
            setCartItems((prevCartItems) => [
                ...prevCartItems,
                {
                    id: updatedProduct.id,
                    productVariantId: updatedProduct.productVariantId, // Add productVariantId
                    productVariant: updatedProduct.product_variant,
                    cartQuantity: 1,
                    orderQuantity: updatedProduct.orderQuantity,
                },
            ]);
        }
    };

    const handleStoreMinusClick = (product) => {
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);

        if (existingItemIndex === -1 || cartItems.length === 0) {
            alert('Cart is empty.');
            return;
        }

        const updatedCartItems = [...cartItems];
        const updatedItem = { ...updatedCartItems[existingItemIndex] };
        updatedItem.cartQuantity -= 1;
        updatedItem.orderQuantity += 1;

        if (updatedItem.cartQuantity === 0) {
            updatedCartItems.splice(existingItemIndex, 1);
        } else {
            updatedCartItems[existingItemIndex] = updatedItem;
        }

        setCartItems(updatedCartItems);

        const updatedProductData = productData.map((prevProduct) => {
            if (prevProduct.id === product.id) {
                return {
                    ...prevProduct,
                    cartQuantity: updatedItem.cartQuantity,
                    orderQuantity: updatedItem.orderQuantity,
                };
            }
            return prevProduct;
        });

        setProductData(updatedProductData);
    };

    const handleStoreRemoveItemClick = (item) => {
        const updatedProductData = productData.map((product) => {
            if (product.id === item.id) {
                return {
                    ...product,
                    orderQuantity: product.orderQuantity + item.cartQuantity,
                };
            }
            return product;
        });

        setProductData(updatedProductData);

        const updatedCartItems = cartItems.filter((cartItem) => cartItem.id !== item.id);
        setCartItems(updatedCartItems);
    };

    const handleSearchPlusClick = (result) => {
        if (result.orderQuantity === 0) {
            alert('Out of Stock');
            return;
        }

        const existingItemIndex = searchCartItems.findIndex((item) => item.id === result.id);

        if (existingItemIndex !== -1) {
            const updatedSearchCartItems = [...searchCartItems];
            updatedSearchCartItems[existingItemIndex].cartQuantity += 1;
            updatedSearchCartItems[existingItemIndex].orderQuantity -= 1;
            setSearchCartItems(updatedSearchCartItems);
        } else {
            setSearchCartItems((prevCartItems) => [
                ...prevCartItems,
                {
                    id: result.id,
                    productVariantId: result.product_variants[0].id, // Add productVariantId
                    productVariant: result.product_variants[0],
                    cartQuantity: 1,
                    orderQuantity: result.orderQuantity - 1,
                },
            ]);
        }

        const updatedSearchResults = searchResults.map((prevResult) => {
            if (prevResult.id === result.id) {
                return {
                    ...prevResult,
                    cartQuantity: prevResult.cartQuantity + 1,
                    orderQuantity: prevResult.orderQuantity - 1,
                };
            }
            return prevResult;
        });

        setSearchResults(updatedSearchResults);
    };

    const handleSearchMinusClick = (result) => {
        const existingItemIndex = searchCartItems.findIndex((item) => item.id === result.id);

        if (existingItemIndex === -1 || searchCartItems.length === 0) {
            alert('Cart is empty.');
            return;
        }

        const updatedSearchCartItems = [...searchCartItems];
        const updatedItem = { ...updatedSearchCartItems[existingItemIndex] };
        updatedItem.cartQuantity -= 1;
        updatedItem.orderQuantity += 1;

        if (updatedItem.cartQuantity === 0) {
            updatedSearchCartItems.splice(existingItemIndex, 1);
        } else {
            updatedSearchCartItems[existingItemIndex] = updatedItem;
        }

        setSearchCartItems(updatedSearchCartItems);

        const updatedSearchResults = searchResults.map((prevResult) => {
            if (prevResult.id === result.id) {
                return {
                    ...prevResult,
                    cartQuantity: prevResult.cartQuantity - 1,
                    orderQuantity: prevResult.orderQuantity + 1,
                };
            }
            return prevResult;
        });

        setSearchResults(updatedSearchResults);
    };

    const handleSearchRemoveItemClick = (item) => {
        const updatedSearchCartItems = searchCartItems.filter((cartItem) => cartItem.id !== item.id);
        setSearchCartItems(updatedSearchCartItems);
        const updatedSearchResults = searchResults.map((result) => {
            if (result.id === item.id) {
                return {
                    ...result,
                    orderQuantity: result.orderQuantity + item.cartQuantity,
                };
            }
            return result;
        });
        setSearchResults(updatedSearchResults);
    };

    const handleSelectAllChange = (event) => {
        const checked = event.target.checked;
        setSelectAll(checked);

        const updatedProductData = productData.map((product) => ({
            ...product,
            selected: checked,
        }));

        setProductData(updatedProductData);
    };

    const handleAddAllClick = () => {
        const selectedItems = productData.filter((product) => product.selected);

        if (selectedItems.length === 0) {
            alert('No items selected.');
            return;
        }

        const updatedCartItems = [...cartItems];

        selectedItems.forEach((item) => {
            const existingItemIndex = updatedCartItems.findIndex((cartItem) => cartItem.id === item.id);
            if (existingItemIndex !== -1) {
                const existingCartItem = updatedCartItems[existingItemIndex];
                existingCartItem.cartQuantity += item.orderQuantity;
                existingCartItem.orderQuantity -= item.orderQuantity;
            } else {
                updatedCartItems.push({
                    id: item.id,
                    productVariant: item.product_variant,
                    cartQuantity: item.orderQuantity,
                    orderQuantity: 0,
                });
            }
        });

        const updatedProductData = productData.map((product) => {
            if (product.selected) {
                return {
                    ...product,
                    orderQuantity: 0,
                    selected: false,
                };
            }
            return product;
        });

        setCartItems(updatedCartItems);
        setProductData(updatedProductData);
    };

    const searchProducts = async () => {
        try {
            setIsSearching(true);
            const response = await axios.get(
                `https://devapi.grozep.com/v1/in/inventory-search?q=${searchValue}`
            );
            const searchResults = response.data.data;
            console.log(searchResults)
            const searchResultsWithOrderQuantity = searchResults.map((result) => {
                const inventoryListings = result.product_variants[0].inventory_listings;
                const desiredCapacity =
                    inventoryListings[0].maxCapacity - inventoryListings[0].minCapacity;
                const availableCapacity = inventoryListings.reduce((sum, listing) => {
                    const remaining = listing.inventory_stocks.reduce(
                        (stockSum, stock) => stockSum + stock.remaining,
                        0
                    );
                    return sum + remaining;
                }, 0);
                let orderQuantity;
                console.log(availableCapacity)
                console.log(desiredCapacity)

                if (desiredCapacity > availableCapacity) {
                    orderQuantity = availableCapacity;
                } else {
                    orderQuantity = desiredCapacity;
                }
                console.log(orderQuantity)
                return {
                    ...result,
                    orderQuantity: orderQuantity,
                    cartQuantity: 0,
                    selected: false,
                };
            });

            setSearchResults(searchResultsWithOrderQuantity);
            console.log(searchResults)
        } catch (error) {
            console.log('Error fetching search results:', error);
        }
    };

    const handlePlaceOrder = async () => {
        const allCartItems = [...cartItems, ...searchCartItems];

        const orderItems = allCartItems.map((item) => ({
            quantity: item.cartQuantity,
            productVariantId: item.productVariantId,
        }));
        console.log(orderItems)
        const requestData = {
            storecode: selectedStoreCode,
            employeeId: 11,
            items: orderItems,
        };
        console.log(requestData)
        try {
            const response = await axios.post('https://devapi.grozep.com/v1/in/allotments', requestData);
            console.log('Order placed:', response.data);
            console.log(response.data.data)
            if (response.data.status === true) {
                console.log(storeAllotmentResponse)
                setStoreAllotmentResponse(response.data.data);
                setIsStoreAlloted(true);
            } else {
                console.log('Order placement failed:', response.data.message);
            }
        } catch (error) {
            console.log('Error placing the order:', error);
        }
    };

    const exportAsPDF = () => {
        if (!storeAllotmentResponse || !storeAllotmentResponse.result || !storeAllotmentResponse.storeAllotmentItem) {
            console.log('No data available to generate PDF.');
            return;
        }

        const { id, storecode, employeeId, status, createdAt } = storeAllotmentResponse.result;
        const itemCount = storeAllotmentResponse.storeAllotmentItem.length;

        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text(`Store Allotment Id: ${id}`, 10, 10);
        doc.text(`Store Code: ${storecode}`, 10, 20);
        doc.text(`Employee ID: ${employeeId}`, 10, 30);
        doc.text(`Status: ${status}`, 10, 40);
        doc.text(`Created At: ${createdAt}`, 10, 50);
        doc.text(`Item Count: ${itemCount}`, 10, 60);
        doc.text('Items:', 10, 70);

        const tableData = storeAllotmentResponse.storeAllotmentItem.map((item) => [
            item.id,
            item.productVariantId,
            item.quantity,
        ]);

        doc.autoTable({
            startY: 80,
            head: [['Item ID', 'Product Variant ID', 'Quantity']],
            body: tableData,
        });

        doc.save('store_allotment.pdf');
    };



    const exportAsExcel = () => {
        if (!storeAllotmentResponse || !storeAllotmentResponse.result || !storeAllotmentResponse.storeAllotmentItem) {
            console.log('No data available to export as Excel.');
            return;
        }

        const { id, storecode, employeeId, status, createdAt } = storeAllotmentResponse.result;
        const itemCount = storeAllotmentResponse.storeAllotmentItem.length;

        const workbook = XLSX.utils.book_new();
        const worksheetData = [
            {
                'ID': id,
                'Store Code': storecode,
                'Employee ID': employeeId,
                'Status': status,
                'Created At': createdAt,
                'Item Count': itemCount,
            },
        ];

        const itemsData = storeAllotmentResponse.storeAllotmentItem.map((item) => ({
            'Item ID': item.id,
            'Product Variant ID': item.productVariantId,
            'Quantity': item.quantity,
        }));

        const worksheet = XLSX.utils.json_to_sheet([...worksheetData, ...itemsData]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Store Allotment');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const excelData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(excelData, 'store_allotment.xlsx');
    };



    return (
        <main>
            <section className="store-allotment-section">
                <div className="card-section">

                    <Card className="container-card">
                        <div className="search-input-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => {
                                    setSearchQuery(event.target.value);
                                    setIsSearching(false);
                                    if (event.target.value.trim() !== "") {
                                        searchProducts();
                                        // setSelectedStoreCode([]);
                                    } else {
                                        setProductData([]);
                                        setIsSearching(false);
                                    }
                                }}
                                placeholder="Search by Id/Name/Brand/Barcode..."
                            />
                        </div>
                        <select value={selectedStoreCode} onChange={handleStoreCodeChange}>
                            <option value="" disabled>
                                Select Store
                            </option>
                            {storeCodes.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </select>
                        {!isSearching && selectedStoreCode && productData.length > 0 && (
                            <div>
                                <div className="action-container">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAllChange}
                                        disabled={productData.length === 0}
                                    />
                                    <button onClick={handleAddAllClick} disabled={productData.length === 0}>
                                        Add All To Cart
                                    </button>
                                </div>
                                <table className="table-container">
                                    <thead>
                                        <tr>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    checked={selectAll}
                                                    onChange={handleSelectAllChange}
                                                />
                                            </th>
                                            <th>ID</th>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Product Size</th>
                                            <th>Brand</th>
                                            <th>Barcode</th>
                                            <th>Order Quantity</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productData.map((product) => (
                                            <tr key={product.id}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={product.selected}
                                                        onChange={() => {
                                                            const updatedProductData = productData.map((prevProduct) => {
                                                                if (prevProduct.id === product.id) {
                                                                    return {
                                                                        ...prevProduct,
                                                                        selected: !prevProduct.selected,
                                                                    };
                                                                }
                                                                return prevProduct;
                                                            });
                                                            setProductData(updatedProductData);
                                                        }}
                                                    />
                                                </td>
                                                <td>{product.id}</td>
                                                <td>
                                                    <img
                                                        src={`https://media.grozep.com/images/products/${product.product_variant.images[0]}`}
                                                        alt="product-image"
                                                        className="image-item"
                                                    />
                                                </td>
                                                <td>{product.product_variant.product.name}</td>
                                                <td>
                                                    {product.product_variant.product_size.value}{" "}
                                                    {product.product_variant.product_size.unit}
                                                </td>
                                                <td>{product.product_variant.product.brand}</td>
                                                <td>{product.product_variant.barcode}</td>
                                                <td>
                                                    {product.orderQuantity === 0 ? (
                                                        <span className="out-of-stock">Out of Stock</span>
                                                    ) : (
                                                        <span>{product.orderQuantity}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {product.orderQuantity > 0 && (
                                                        <div className="action-buttons">
                                                            <button
                                                                onClick={() => handleStorePlusClick(product)}
                                                                className="plus"
                                                            >
                                                                +
                                                            </button>
                                                            <input
                                                                type="number"
                                                                value={product.cartQuantity}
                                                                readOnly
                                                            />
                                                            <button
                                                                onClick={() => handleStoreMinusClick(product)}
                                                                className="minus"
                                                            >
                                                                -
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {isSearching && (
                            <table className="table-container">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Product Size</th>
                                        <th>Brand</th>
                                        <th>Barcode</th>
                                        <th>Order Quantity</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {searchResults.map((result) => (
                                        <tr key={result.id}>
                                            <td>{result.id}</td>
                                            <td>
                                                <img
                                                    src={result.product_variants[0].images[0]}
                                                    alt='product-image'
                                                    className='image-item'
                                                />
                                            </td>
                                            <td>{result.name}</td>
                                            <td>
                                                {result.product_variants[0].product_size.value} {result.product_variants[0].product_size.unit}
                                            </td>
                                            <td>{result.brand}</td>
                                            <td>{result.product_variants[0].barcode}</td>
                                            <td>
                                                {result.orderQuantity === 0 ? (
                                                    <span className='out-of-stock'>Out of Stock</span>
                                                ) : (
                                                    <span>{result.orderQuantity}</span>
                                                )}
                                            </td>
                                            <td>
                                                {result.orderQuantity > 0 && (
                                                    <div className='action-buttons'>
                                                        <button onClick={() => handleSearchPlusClick(result)} className='plus'>+</button>
                                                        <input type='number' value={result.cartQuantity} readOnly />
                                                        <button onClick={() => handleSearchMinusClick(result)} className='minus'>-</button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>
                    <Card className='cart-section'>
                        <div className='cart-header-section'>
                            <div className='cart-headings'>
                                <p>Cart roducts</p>
                            </div>
                            <div className='place-order'>
                                <button onClick={handlePlaceOrder}>Place order</button>
                            </div>
                        </div>
                        <div>
                            {isStoreAlloted && (
                                <div className="export-buttons">
                                    <button onClick={exportAsPDF} className="export-btn">Export as PDF</button>
                                    <button onClick={exportAsExcel} className="export-btn">Export as Excel</button>
                                </div>
                            )}
                        </div>
                        <div className='table-container'>


                            {cartItems.length > 0 || searchCartItems.length > 0 ? (
                                <>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Size</th>
                                                <th>Barcode</th>
                                                <th>Updated Order Quantity</th>
                                                <th>Cart Quantity</th>
                                                <th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>
                                                        {item.productVariant.product_size.value} {item.productVariant.product_size.unit}
                                                    </td>
                                                    <td>{item.productVariant.barcode}</td>
                                                    <td>{item.orderQuantity}</td>
                                                    <td>{item.cartQuantity}</td>
                                                    <td>
                                                        <button onClick={() => handleStoreRemoveItemClick(item)} className='cart-remove-btn'>Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {searchCartItems.map((item) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    {/* <td>{item.productVariant.product.name}</td> */}
                                                    <td>
                                                        {item.productVariant.product_size.value} {item.productVariant.product_size.unit}
                                                    </td>
                                                    <td>{item.productVariant.barcode}</td>
                                                    <td>{item.orderQuantity}</td>
                                                    <td>{item.cartQuantity}</td>
                                                    <td>
                                                        <button onClick={() => handleSearchRemoveItemClick(item)} className='cart-remove-btn'>Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <div className='no-items'>
                                    <p>Add items to cart...</p>
                                </div>
                            )}

                        </div>
                    </Card>
                </div>
            </section>
        </main>
    );

}

export default StoreAllotment;
