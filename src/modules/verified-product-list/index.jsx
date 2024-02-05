import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, Table, Modal, Button } from 'react-bootstrap'
import './style.css'
// import del from "../../asserts/images/delete-icon.png";

const VerifiedProductsList = () => {
  const [products, setProducts] = useState([])
  const [reportData, setReportData] = useState({})
  const [reportedItems, setReportedItems] = useState([])
  const [showReportModal, setShowReportModal] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [allotments, setAllotments] = useState([])
  const [selectedAllotmentId, setSelectedAllotmentId] = useState('')
  const [isData, setIsData] = useState(false)
  const [isReportData, setIsReportData] = useState(false)
  const [noDataFound, setNoDataFound] = useState(false)
  const [
    selectedAllotmentForVerification,
    setSelectedAllotmentForVerification,
  ] = useState('')

  useEffect(() => {
    const fetchAllotments = async () => {
      try {
        const response = await axios.get(
          'https://devapi.grozep.com/v1/in/allotments?storeCode=JHGRH001&status=pending'
        )
        const data = response.data.data
        setAllotments(data)
        console.log('allotids', response.data.data)
      } catch (error) {
        console.error('Error fetching allotments:', error)
      }
    }

    fetchAllotments()
  }, [selectedAllotmentForVerification])

  useEffect(() => {
    if (selectedAllotmentId !== '') {
      fetchProducts(selectedAllotmentId)
    }
  }, [selectedAllotmentId])

  const fetchProducts = async (allotmentId) => {
    try {
      const response = await axios.get(
        `https://devapi.grozep.com/v1/in/allotments-items?storeAllotmentId=${allotmentId}`
      )
      const data = response.data.data
      console.log(response)
      setProducts(data)
      if (!data || data.length === 0) {
        setNoDataFound(true)
        setIsData(false)
      } else {
        setProducts(data)
        setIsData(true)
        setNoDataFound(false)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleAllotmentChange = (event) => {
    setSelectedAllotmentId(event.target.value)
    console.log(
      'selectedAllotmentForVerification:',
      selectedAllotmentForVerification
    )
    setSelectedAllotmentForVerification('')
  }

  const handleReportQuantityChange = (quantity) => {
    setReportData((prevReportData) => ({
      ...prevReportData,
      quantity: quantity,
    }))
  }

  const handleReportReasonChange = (reason) => {
    setReportData((prevReportData) => ({
      ...prevReportData,
      reason: reason,
    }))
  }

  const handleReport = () => {
    const { quantity, reason } = reportData

    if (!reason || reason.trim() === '') {
      alert('Please enter a reason for the report.')
      return
    }

    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity.')
      return
    }

    if (currentProduct) {
      const { id, productVariantId, storeAllotmentId } = currentProduct
      const productIndex = products.findIndex(
        (product) => product.id === id
      )

      if (productIndex !== -1) {
        const productCopy = { ...products[productIndex] }

        if (quantity > productCopy.quantity) {
          alert(
            'Please enter a quantity less than or equal to the available quantity.'
          )
          return
        }

        const updatedQuantity = productCopy.quantity - quantity
        const removedItem = {
          ...productCopy,
          removedQuantity: quantity,
          updatedQuantity: updatedQuantity,
          reason: reason,
        }

        setReportedItems((prevReportedItems) => [
          ...prevReportedItems,
          removedItem,
        ])

        productCopy.quantity = updatedQuantity
        setProducts((prevProducts) => [
          ...prevProducts.slice(0, productIndex),
          productCopy,
          ...prevProducts.slice(productIndex + 1),
        ])

        setReportData({})
        setCurrentProduct(null)
        setIsReportData(true)
      }
    }

    setShowReportModal(false)
  }

  const handleVerify = async () => {
    try {
      const damages = reportedItems.map((reportedItem) => ({
        storeCode: 'JHGRH001',
        productVariantId: reportedItem.productVariantId,
        storeAllotmentItemId: reportedItem.storeAllotmentId,
        quantity: reportedItem.removedQuantity,
        createdBy: 11,
        remark: reportedItem.reason,
      }))

      const payload = {
        status: 'completed',
        damages: damages ? damages : ' ',
      }

      const response = await axios.put(
        `https://devapi.grozep.com/v1/in/allotments/${selectedAllotmentId}`,
        payload
      )

      console.log('verification', response)

      if (response.data.status === false) {
        alert(response.data.message)
        setIsReportData(false)
        return
      }

      if (response.data.status === true) {
        alert('Verification successful: ' + response.data.status)
        console.log('Allotments before update:', allotments)

        setSelectedAllotmentForVerification(selectedAllotmentId)

        setSelectedAllotmentId('')
        console.log(
          'Selected Allotment ID after update:',
          selectedAllotmentId
        )
        setReportedItems([])
        setProducts([])
        setIsData(false)
        setIsReportData(false)
        return
      }

      setReportedItems([])
      setSelectedAllotmentId([])
    } catch (error) {
      console.error('Error verifying products:', error)
      alert(error)
    }
  }

  const handleRemoveItem = (reportedItem) => {
    const productIndex = products.findIndex(
      (product) => product.id === reportedItem.id
    )

    if (productIndex !== -1) {
      const updatedProducts = [...products]
      updatedProducts[productIndex].quantity +=
        reportedItem.removedQuantity

      setProducts(updatedProducts)
      setReportedItems((prevReportedItems) =>
        prevReportedItems.filter((item) => item.id !== reportedItem.id)
      )
    }
  }

  const openReportModal = (product) => {
    setCurrentProduct(product)
    setShowReportModal(true)
  }

  const closeReportModal = () => {
    setShowReportModal(false)
    setReportData({})
    setCurrentProduct(null)
  }

  return (
    <main>
      <section className="verified-items-s">
        <div className="product-details-section-allotment">
          <Card className="inner-card-allotment">
            <div className="allotment-select">
              <label htmlFor="allotment">Select Allotment:</label>
              <select
                id="allotment"
                value={selectedAllotmentId}
                onChange={handleAllotmentChange}
              >
                <option value="">Select Allotment Id : </option>
                {allotments.map(
                  (allotment) =>
                    selectedAllotmentForVerification !==
                    allotment.id && (
                      <option
                        key={allotment.id}
                        value={allotment.id}
                      >
                        {allotment.id}
                      </option>
                    )
                )}
              </select>
            </div>
            {isData ? (
              <div>
                <Table responsive className="bordered-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Image</th>
                      <th>Name & Brand</th>
                      <th>Quantity</th>
                      <th>Product Variant ID</th>
                      <th>Store Allotment ID</th>
                      <th>MRP</th>
                      <th>Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>
                          <img
                            src={
                              product
                                .product_variant
                                ?.images[0] ||
                              ''
                            }
                            alt={
                              product
                                .product_variant
                                ?.product
                                ?.name || ''
                            }
                            className="product-img"
                          />
                        </td>
                        <td>
                          {product.product_variant
                            ?.product?.name ||
                            ''}{' '}
                          {product.product_variant
                            ?.product?.brand ||
                            ''}{' '}
                        </td>

                        <td>{product.quantity}</td>
                        <td>
                          {product.productVariantId}
                        </td>
                        <td>
                          {product.storeAllotmentId}
                        </td>
                        <td>
                          {
                            product.trade_infos[0]
                              .inventory_stock
                              .retailPrice
                          }
                        </td>
                        <td>
                          {
                            product.trade_infos[0]
                              .inventory_stock
                              .sellingPrice
                          }
                        </td>
                        <td>
                          {product.quantity > 0 ? (
                            <div className="report-column-section">
                              <button
                                onClick={() =>
                                  openReportModal(
                                    product
                                  )
                                }
                              >
                                Report
                              </button>
                            </div>
                          ) : (
                            <span>
                              Out of stock
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="verify-btn">
                  <button onClick={handleVerify}>
                    Verify
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {!noDataFound ? (
                  <div className="no-data">
                    <p>Select allotment Id...</p>
                  </div>
                ) : (
                  <div className="no-data">
                    <p>
                      No data found with the allotment
                      Id...
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
        <div className="product-details-section-verify">
          <Card className="inner-card-verify">
            <div className="reported-heading">
              <p>Reported Products</p>
            </div>
            {reportedItems.length > 0 && isReportData ? (
              <div>
                <Table responsive className="bordered-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name & Brand</th>
                      <th>Product Variant ID</th>
                      <th>Store Allotment ID</th>
                      <th>MRP</th>
                      <th>Rate</th>
                      <th>Quantity</th>
                      {/* <th>Updated Quantity</th> */}
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportedItems.map(
                      (reportedItem, index) => (
                        <tr key={index}>
                          <td>{reportedItem.id}</td>
                          <td>
                            {reportedItem
                              .product_variant
                              ?.product?.name ||
                              ''}
                            {reportedItem
                              .product_variant
                              ?.product?.brand ||
                              ''}
                          </td>
                          <td>
                            {
                              reportedItem.productVariantId
                            }
                          </td>
                          <td>
                            {
                              reportedItem.storeAllotmentId
                            }
                          </td>
                          <td>
                            {
                              reportedItem
                                .trade_infos[0]
                                .inventory_stock
                                .retailPrice
                            }
                          </td>
                          <td>
                            {
                              reportedItem
                                .trade_infos[0]
                                .inventory_stock
                                .sellingPrice
                            }
                          </td>
                          <td>
                            {reportedItem.quantity}
                          </td>
                          {/* <td>
                            {
                              reportedItem.updatedQuantity
                            }
                          </td> */}
                          <td>
                            {reportedItem.reason}
                          </td>
                          <td>
                            <button
                              onClick={() =>
                                handleRemoveItem(
                                  reportedItem
                                )
                              }
                              className="remove-btn"
                            >
                              {/* <img src={del} alt="Remove" /> */}
                            </button>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="no-data">
                <p>Report products to verify...</p>
              </div>
            )}
          </Card>
        </div>
      </section>
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
                onChange={(e) =>
                  handleReportQuantityChange(
                    Number(e.target.value)
                  )
                }
              />
            </div>
            <div className="reason-input">
              <label htmlFor="reason">Select Reason:</label>
              <select
                id="reason"
                value={reportData.reason || ''}
                onChange={(e) =>
                  handleReportReasonChange(e.target.value)
                }
              >
                <option value="">Select Reason</option>
                <option value="Product damaged while handling">
                  Product damaged while handling
                </option>
                <option value="Product defective">
                  Product defective
                </option>
                <option value="Product expired">
                  Product expired
                </option>
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
  )
}

export default VerifiedProductsList