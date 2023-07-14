import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Placeholder, Table } from 'react-bootstrap';
import './style.css';

const VerifiedProducts = () => {
    const [products, setProducts] = useState([]);
    const [reportData, setReportData] = useState({});
    const [updatedProducts, setUpdatedProducts] = useState([]);
    const [reportedItems, setReportedItems] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(
                    'https://devapi.grozep.com/v1/in/allotments-items'
                );
                const data = response.data.data;
                setProducts(data);
                setUpdatedProducts(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleReportQuantityChange = (listingId, supplyId, quantity) => {
        setReportData((prevReportData) => ({
            ...prevReportData,
            [listingId]: {
                ...(prevReportData[listingId] || {}),
                [supplyId]: {
                    ...prevReportData[listingId]?.[supplyId],
                    quantity: quantity,
                },
            },
        }));
    };

    const handleReportReasonChange = (listingId, supplyId, reason) => {
        setReportData((prevReportData) => ({
            ...prevReportData,
            [listingId]: {
                ...(prevReportData[listingId] || {}),
                [supplyId]: {
                    ...prevReportData[listingId]?.[supplyId],
                    reason: reason,
                },
            },
        }));
    };

    const handleReport = (supply, listing) => {
        const { id: supplyId } = supply;
        const { id: listingId } = listing;
        const { quantity, reason } = reportData[listingId]?.[supplyId] || {};
      
        if (!reason || reason.trim() === '') {
          alert('Please enter a reason for the report.');
          return;
        }
      
        if (!quantity || quantity <= 0) {
          alert('Please enter a valid quantity.');
          return;
        }
      
        if (quantity > supply.quantity) {
          alert('Please enter a quantity less than or equal to the available quantity.');
          return;
        }
      
        const updatedProductsCopy = [...updatedProducts];
        const productIndex = updatedProductsCopy.findIndex((product) => product.id === listingId);
        const supplyIndex = updatedProductsCopy[productIndex]?.product_variant?.listings.findIndex(
          (l) => l.id === listingId
        );
      
        if (productIndex !== -1 && supplyIndex !== -1) {
          const supplyCopy = updatedProductsCopy[productIndex]?.product_variant?.listings[
            supplyIndex
          ]?.supplies.find((s) => s.id === supplyId);
      
          if (supplyCopy) {
            const updatedQuantity = supplyCopy.quantity - quantity;
      
            if (updatedQuantity <= 0) {
              const existingItem = reportedItems.find(
                (item) => item.id === supplyCopy.id && item.listingId === listingId
              );
      
              if (existingItem) {
                existingItem.removedQuantity += quantity;
                existingItem.updatedQuantity = 0;
                existingItem.reason = reason;
              } else {
                const removedItem = {
                  ...supplyCopy,
                  listingId,
                  reason,
                  removedQuantity: quantity,
                  updatedQuantity: 0,
                };
                setReportedItems((prevReportedItems) => [...prevReportedItems, removedItem]);
              }
      
              updatedProductsCopy[productIndex].product_variant.listings[
                supplyIndex
              ].supplies = updatedProductsCopy[productIndex].product_variant.listings[
                supplyIndex
              ].supplies.filter((s) => s.id !== supplyId);
            } else {
              const existingItem = reportedItems.find(
                (item) => item.id === supplyCopy.id && item.listingId === listingId
              );
      
              if (existingItem) {
                existingItem.removedQuantity += quantity;
                existingItem.updatedQuantity = updatedQuantity;
                existingItem.reason = reason;
              } else {
                const updatedItem = {
                  ...supplyCopy,
                  listingId,
                  reason,
                  removedQuantity: quantity,
                  updatedQuantity,
                };
                setReportedItems((prevReportedItems) => [...prevReportedItems, updatedItem]);
              }
      
              updatedProductsCopy[productIndex].product_variant.listings[
                supplyIndex
              ].supplies = updatedProductsCopy[productIndex].product_variant.listings[
                supplyIndex
              ].supplies.map((s) =>
                s.id === supplyId ? { ...s, quantity: updatedQuantity } : s
              );
            }
      
            setUpdatedProducts(updatedProductsCopy);
          }
        }
      
        setReportData((prevReportData) => ({
          ...prevReportData,
          [listingId]: {
            ...(prevReportData[listingId] || {}),
            [supplyId]: {},
          },
        }));
      };
      

    const handleRemove = (reportedItem) => {
        const { id: supplyId, listingId } = reportedItem;
        const productIndex = updatedProducts.findIndex((product) => product.id === listingId);
        const supplyIndex = updatedProducts[productIndex]?.product_variant?.listings.findIndex(
            (l) => l.id === listingId
        );

        if (productIndex !== -1 && supplyIndex !== -1) {
            const supplyCopy = updatedProducts[productIndex]?.product_variant?.listings[
                supplyIndex
            ]?.supplies.find((s) => s.id === supplyId);

            if (supplyCopy) {
                const { removedQuantity } = reportedItem;
                const updatedQuantity = supplyCopy.quantity + removedQuantity;

                updatedProducts[productIndex].product_variant.listings[
                    supplyIndex
                ].supplies = updatedProducts[productIndex].product_variant.listings[
                    supplyIndex
                ].supplies.map((s) =>
                    s.id === supplyId ? { ...s, quantity: updatedQuantity } : s
                );

                setUpdatedProducts([...updatedProducts]);
                setReportedItems((prevReportedItems) =>
                    prevReportedItems.filter((item) => item.id !== reportedItem.id)
                );
            }
        }
    };

    return (
        <main>
            <div className="verified-Products">
                <section className="verified-items-section">
                    <Card className="product-details-card">
                        <div className="product-details-section">
                            {products.map((product) => (
                                <div key={product.id} className="product-details">
                                    <Card className="product-card">
                                        <div className="details-product">
                                            <div>
                                                <img
                                                    src={product.product_variant?.images[0] || ''}
                                                    alt={product.product_variant?.product?.name || ''}
                                                    className="product-img"
                                                />
                                            </div>
                                            <div className="product-name">
                                                <p>{product.product_variant?.product?.name || ''}</p>
                                            </div>
                                        </div>

                                        <Table responsive className="bordered-table">
                                            <thead >
                                                <tr>
                                                    <th>ID</th>
                                                    <th>Quantity</th>
                                                    <th>Cost Price</th>
                                                    <th>Selling Price</th>
                                                    <th>Retail Price</th>
                                                    <th>Report</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {product.product_variant?.listings.flatMap((listing) =>
                                                    listing.supplies.map((supply) => (
                                                        <tr key={supply.id}>
                                                            <td>{supply.id}</td>
                                                            <td>{supply.quantity}</td>
                                                            <td>{supply.pricings[0].costPrice}</td>
                                                            <td>{supply.pricings[0].sellingPrice}</td>
                                                            <td>{supply.pricings[0].retailPrice}</td>
                                                            <td>
                                                                {supply.quantity > 0 ? (
                                                                    <div className="report-column">
                                                                        <div className="report-inputs">
                                                                            <input
                                                                                type="number"
                                                                                min="1"
                                                                                value={reportData[listing.id]?.[supply.id]?.quantity || ''}
                                                                                onChange={(e) =>
                                                                                    handleReportQuantityChange(
                                                                                        listing.id,
                                                                                        supply.id,
                                                                                        Number(e.target.value)
                                                                                    )
                                                                                }
                                                                                Placeholder="Enter quantity"
                                                                            />
                                                                            <input
                                                                                type="text"
                                                                                value={reportData[listing.id]?.[supply.id]?.reason || ''}
                                                                                onChange={(e) =>
                                                                                    handleReportReasonChange(
                                                                                        listing.id,
                                                                                        supply.id,
                                                                                        e.target.value
                                                                                    )
                                                                                }
                                                                                Placeholder="Enter reason"
                                                                                className="reason-input"
                                                                            />
                                                                        </div>
                                                                        <div className="report-btn">
                                                                            <button onClick={() => handleReport(supply, listing)}>
                                                                                Report
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <span>Out of stock</span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </Table>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>
                <section className="reported-items-section">
                    <Card className="product-details-card">
                        <div className="product-details-section">
                            <Card className='inner-card'>
                                <div className='reported-heading'>
                                    <p>Reported Products</p>
                                </div>
                                <Table responsive className="bordered-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Quantity</th>
                                            <th>Cost Price</th>
                                            <th>Selling Price</th>
                                            <th>Retail Price</th>
                                            <th>Reported Quantity</th>
                                            <th>Updated Quantity</th>
                                            <th>Reason</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportedItems.map((reportedItem, index) => (
                                            <tr key={index}>
                                                <td>{reportedItem.id}</td>
                                                <td>{reportedItem.quantity}</td>
                                                <td>{reportedItem.pricings[0].costPrice}</td>
                                                <td>{reportedItem.pricings[0].sellingPrice}</td>
                                                <td>{reportedItem.pricings[0].retailPrice}</td>
                                                <td>{reportedItem.removedQuantity}</td>
                                                <td>{reportedItem.updatedQuantity}</td>
                                                <td>{reportedItem.reason}</td>
                                                <td>
                                                    <div className="remove-btn">
                                                        <button onClick={() => handleRemove(reportedItem)}>Remove</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                <div>
                                    <button>Verify</button>
                                </div>
                            </Card>
                        </div>
                    </Card>
                </section>
            </div>
        </main>
    );
};

export default VerifiedProducts;
