import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Table, Modal, Button } from 'react-bootstrap';
import './style.css';

const VerifiedProductsList = () => {
  const [products, setProducts] = useState([]);
  const [reportData, setReportData] = useState({});
  const [reportedItems, setReportedItems] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://devapi.grozep.com/v1/in/allotments-items?storeAllotmentId=1'
        );
        const data = response.data.data;
        setProducts(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleReportQuantityChange = (quantity) => {
    setReportData((prevReportData) => ({
      ...prevReportData,
      quantity: quantity,
    }));
  };

  const handleReportReasonChange = (reason) => {
    setReportData((prevReportData) => ({
      ...prevReportData,
      reason: reason,
    }));
  };

  const handleReport = () => {
    const { quantity, reason } = reportData;

    if (!reason || reason.trim() === '') {
      alert('Please enter a reason for the report.');
      return;
    }

    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity.');
      return;
    }

    if (currentProduct) {
      const { id, productVariantId, storeAllotmentId } = currentProduct;
      const productIndex = products.findIndex((product) => product.id === id);

      if (productIndex !== -1) {
        const productCopy = { ...products[productIndex] };

        if (quantity > productCopy.quantity) {
          alert(
            'Please enter a quantity less than or equal to the available quantity.'
          );
          return;
        }

        const updatedQuantity = productCopy.quantity - quantity;
        const removedItem = {
          ...productCopy,
          removedQuantity: quantity,
          updatedQuantity: updatedQuantity,
          reason: reason,
        };

        setReportedItems((prevReportedItems) => [...prevReportedItems, removedItem]);

        productCopy.quantity = updatedQuantity;
        setProducts((prevProducts) => [
          ...prevProducts.slice(0, productIndex),
          productCopy,
          ...prevProducts.slice(productIndex + 1),
        ]);

        setReportData({});
        setCurrentProduct(null);
      }
    }

    setShowReportModal(false);
  };

  const handleVerify = async () => {
    try {
      const damages = reportedItems.map((reportedItem) => ({
        storeCode: 'JHGRH001',
        productVariantId: reportedItem.productVariantId,
        storeAllotmentItemId: reportedItem.storeAllotmentId,
        quantity: reportedItem.removedQuantity,
        createdBy: 11,
        remark: reportedItem.reason,
      }));
  
      const payload = {
        status: 'completed',
        damages: damages,
      };
  
      const response = await axios.put(
        'https://devapi.grozep.com/v1/in/allotments/1',
        payload
      );
  
      console.log('Verification response:', response.data);
  
      if (response.data.status === false) {
        alert(response.data.message); // Display the error message
        return;
      }
  
      setReportedItems([]);
    } catch (error) {
      console.error('Error verifying products:', error);
    }
  };
  

  const handleRemoveItem = (reportedItem) => {
    const productIndex = products.findIndex((product) => product.id === reportedItem.id);

    if (productIndex !== -1) {
      const updatedProducts = [...products];
      updatedProducts[productIndex].quantity += reportedItem.removedQuantity;

      setProducts(updatedProducts);
      setReportedItems((prevReportedItems) =>
        prevReportedItems.filter((item) => item.id !== reportedItem.id)
      );
    }
  };

  const openReportModal = (product) => {
    setCurrentProduct(product);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setReportData({});
    setCurrentProduct(null);
  };

  return (
    <main>
      <div className="verified-Products">
        <section className="verified-items-s">
          <Card className="product-details-card">
            <div className="product-details-section">
              <Card className="inner-card">
                <Table responsive className="bordered-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Product Variant ID</th>
                      <th>Store Allotment ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          <img
                            src={product.product_variant?.images[0] || ''}
                            alt={product.product_variant?.product?.name || ''}
                            className="product-img"
                          />
                        </td>
                        <td>{product.product_variant?.product?.name || ''}</td>
                        <td>{product.quantity}</td>
                        <td>{product.productVariantId}</td>
                        <td>{product.storeAllotmentId}</td>
                        <td>
                          {product.quantity > 0 ? (
                            <div className="report-column-section">
                              <button
                                onClick={() => openReportModal(product)}
                              >
                                Report
                              </button>
                            </div>
                          ) : (
                            <span>Out of stock</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>
            </div>
          </Card>
        </section>

        <section className="reported-items-section">
          <Card className="product-details-card">
            <div className="product-details-section">
              <Card className="inner-card">
                <div className="reported-heading">
                  <p>Reported Products</p>
                </div>
                <Table responsive className="bordered-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Product Variant ID</th>
                      <th>Store Allotment ID</th>
                      <th>Removed Quantity</th>
                      <th>Updated Quantity</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportedItems.map((reportedItem, index) => (
                      <tr key={index}>
                        <td>{reportedItem.id}</td>
                        <td>
                          {reportedItem.product_variant?.product?.name || ''}
                        </td>
                        <td>{reportedItem.quantity}</td>
                        <td>{reportedItem.productVariantId}</td>
                        <td>{reportedItem.storeAllotmentId}</td>
                        <td>{reportedItem.removedQuantity}</td>
                        <td>{reportedItem.updatedQuantity}</td>
                        <td>{reportedItem.reason}</td>
                        <td>
                          <button
                            onClick={() => handleRemoveItem(reportedItem)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="verify-btn">
                  <button onClick={handleVerify}>Verify</button>
                </div>
              </Card>
            </div>
          </Card>
        </section>
      </div>

      <Modal show={showReportModal} onHide={closeReportModal}>
        <Modal.Header closeButton>
          <Modal.Title>Report Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="quantity-input">
              <label htmlFor="quantity">Enter Quantity:</label>
              <input
                type="number"
                min="1"
                id="quantity"
                value={reportData.quantity || ''}
                onChange={(e) => handleReportQuantityChange(Number(e.target.value))}
              />
            </div>
            <div className="reason-input">
              <label htmlFor="reason">Select Reason:</label>
              <select
                id="reason"
                value={reportData.reason || ''}
                onChange={(e) => handleReportReasonChange(e.target.value)}
              >
                <option value="">Select Reason</option>
                <option value="Product damaged while handling">
                  Product damaged while handling
                </option>
                <option value="Product defective">Product defective</option>
                <option value="Product expired">Product expired</option>
              </select>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleReport}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
};

export default VerifiedProductsList;
