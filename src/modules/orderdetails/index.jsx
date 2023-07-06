import React, { useState } from 'react';
import axios from 'axios';
import "./style.css"
const OrderDetailsPage = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [barcode, setBarcode] = useState('');
    const [scannedItems, setScannedItems] = useState([]);
    const [error, setError] = useState('');

    const handleOrderSubmit = async (e) => {
        e.preventDefault();
        try {
          const response = await axios.get(`https://api.grozep.com/v1/in/tasks/scans/items?orderid=${orderNumber}`);
          const data = response.data;
          setOrderData(data.data); // Update to access the nested data object
          console.log(data.data);
        } catch (error) {
          console.error(error);
        }
      };

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        if (!orderData || !orderData.order_invoice || !orderData.order_invoice.order_items) {
            setError('Order details not found.');
            return;
        }

        const matchedItems = orderData.order_invoice.order_items.filter((item) => item.barcode === barcode);
        if (matchedItems.length > 0) {
            setScannedItems((prevScannedItems) => [...prevScannedItems, ...matchedItems]);
            const remainingItems = orderData.order_invoice.order_items.filter((item) => item.barcode !== barcode);
            setOrderData((prevOrderData) => ({
                ...prevOrderData,
                order_invoice: {
                    ...prevOrderData.order_invoice,
                    order_items: remainingItems,
                },
            }));
            setBarcode('');
            setError('');
        } else {
            setError('Barcode does not match any item.');
        }
    };
    const handleOrderPacked = () => {
        // Implement the logic for when the order is packed
        // For example, you can make an API call to update the order status
        console.log('Order packed');
    };

    return (
        <main>
            <section className='orderdetails-section'>
                <div className='orderdetails-content'>
                    {!orderData && (
                        <div className="popup">
                            <div className="popup-inner">
                                <h2>Order Validation</h2>
                                <form onSubmit={handleOrderSubmit}>
                                    <label htmlFor="orderNumber" className='label-name'>Enter Order Number</label>
                                    <div className='order-input-section'>
                                        <input type="text" id="orderNumber" className='order-input' value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
                                        <div className='submit-btn-section'>
                                            <button type="submit" className='submit-btn'>SUBMIT</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {orderData && (
                        <section className='content-section'>
                            <div>
                                <div className='order-id'>
                                    <p>Order number: {orderNumber}, {orderData.order_invoice.delivery_addresses[0].location.address}</p>
                                </div>
                                <form onSubmit={handleBarcodeSubmit} className='barcode-validate'>
                                    <input type="text" id="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder='Barcode' />
                                    <button type="submit" className='scan-btn'>SCAN</button>
                                </form>
                                {error && <p className="error">{error}</p>}
                                <div className="tables-con">
                                    <div className='table-data'>
                                        <div className="table-total">
                                            <p className='table-heading'>Total Items</p>
                                            {orderData.order_invoice.order_items && orderData.order_invoice.order_items.length > 0 ? (
                                                <table className='table-main'>
                                                    <thead>
                                                        <tr>
                                                            <th>Sno</th>
                                                            <th>Barcode</th>
                                                            <th>Image</th>
                                                            <th>Name & Size</th>
                                                            <th>MRP</th>
                                                            <th>Qty</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderData.order_invoice.order_items.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{item.id}</td>
                                                                <td>{item.barcode}</td>
                                                                <td>
                                                                    <img src={item.imageUrl} alt={item.name} className='item-image' />
                                                                </td>
                                                                <td>{item.name}, {item.size}</td>
                                                                <td>{item.mrp}</td>
                                                                <td>{item.quantity}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p>No items found.</p>
                                            )}
                                        </div>
                                        <div className="table-scanned">
                                            <p className='table-heading'>Scaanned Items</p>
                                            {scannedItems.length > 0 ? (
                                                <table className='table-main'>
                                                    <thead>
                                                        <tr>
                                                            <th>Sno</th>
                                                            <th>Barcode</th>
                                                            <th>Image</th>
                                                            <th>Name</th>
                                                            <th>Size</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {scannedItems.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>{item.id}</td>
                                                                <td>{item.barcode}</td>
                                                                <td>
                                                                    <img src={item.imageUrl} alt={item.name} className='item-image' />
                                                                </td>
                                                                <td>{item.name}</td>
                                                                <td>{item.size}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p>No scanned items.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className='order-packed-btn'>
                                    <button onClick={handleOrderPacked}>Order Packed</button>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </section>
        </main>
    );
};

export default OrderDetailsPage;
