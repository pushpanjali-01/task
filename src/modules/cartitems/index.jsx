import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./style.css";
import { Card } from 'react-bootstrap';
import { Modal, Button } from 'react-bootstrap';

function CartItems() {
    const location = useLocation();
    const cartItemsFromLocation = location.state?.cartItems || [];
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState(cartItemsFromLocation);
    const [mobileNumber, setMobileNumber] = useState('');
    const [isRegistered, setIsRegistered] = useState(true);
    const [otp, setOtp] = useState(false);
    const [name, setName] = useState('');
    const [otpValue, setOtpvalue] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [payableTotal, setPayableTotal] = useState(0);
    const [redeemPoints, setRedeemPoints] = useState(0);
    const [voucherAmount, setVoucherAmount] = useState([]);
    const [selectedVoucher, setSelectedVoucher] = useState('');
    const [enteredRedeemPoints, setEnteredRedeemPoints] = useState('');
    const [plus, setPlus] = useState(false)
    const [isVoucher, setIsVoucher] = useState(false)
    const [isRedeem, setIsRedeem] = useState(false)
    const [isSelected, setIsSelected] = useState(false)
    const [showVoucherAmount, setShowVoucherAmount] = useState(false)
    const [prevEnteredPoints, setPrevEnteredPoints] = useState(0);
    const [isAlert, setAlert] = useState(false)
    const [isName, setIsName] = useState(false)

    const [userName, setUserName] = useState('')

    const [isMobileNumber, setIsMobileNumber] = useState(false)
    console.log(userName)
    console.log("payable", payableTotal)
    console.log("enetred", enteredRedeemPoints)
    console.log("selected", selectedVoucher)
    console.log("ccc", cartItems)

    const calculateDiscount = (stockItem) => {
        const retailPrice = parseFloat(stockItem.retailPrice);
        const sellingPrice = parseFloat(stockItem.sellingPrice);
        return retailPrice - sellingPrice;
      };

    const handleVerify = async (inputPhoneNumber) => {
        const userDetails = {
            phone: inputPhoneNumber
        };

        try {
            const response = await axios.post('https://devapi.grozep.com/v1/in/users/details', userDetails);
            console.log(response.data)
            const points = response.data.data.redeemPoint;
            const name = response.data.data.name;
            const voucher = response.data.data.voucher;
            const offerAmounts = voucher.map(voucher => voucher.OfferAmount);
            console.log(offerAmounts)
            // Assuming the API response contains redeemPoints field
            setRedeemPoints(points);
            setUserName(name)
            console.log(name)
            setIsName(true)
            console.log("ppp", redeemPoints)
            setVoucherAmount(offerAmounts);
            console.log(response.data)
            setIsRegistered(true);
            if (offerAmounts.length > 0) {
                setIsVoucher(true)
            }
            if (points > 0) {
                setIsRedeem(true)
            }
        } catch (error) {
            setIsRegistered(false);
            console.error('Error fetching user details:', error);
        }
    };

    const handleCreateUser = async () => {
        try {
            const userData = {
                number: mobileNumber,
                name: name
            };
            const createUserResponse = await axios.post('https://devapi.grozep.com/v1/in/users', userData);
            console.log('User created successfully:', createUserResponse.data);


            if (createUserResponse.data.status === true) {
                setIsRegistered(true)
                const user = createUserResponse.data.data.userDetails.name
                console.log(user)
                setUserName(user)
                setIsName(true)
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoBacktoCart = () => {
        navigate('/make-order', { state: { cartItems } });
    }

    function calculateStockValue(item) {
        let stockValue = 0;

        // Loop through supplies of the current item
        item.item.supplies.forEach((supply) => {
            stockValue += supply.remaining;
        });

        return stockValue;
    }


    const handleRemoveItem = (stockItemIdToRemove) => {
        setCartItems((prevCartItems) =>
            prevCartItems.map((cartItem) => {
                const updatedStockItems = cartItem.stockItems.filter((stockItem) => stockItem.id !== stockItemIdToRemove);
                if (updatedStockItems.length === 0) {
                    // If stockItems become empty, remove the cartItem from cartItems
                    return null;
                } else {
                    return { ...cartItem, stockItems: updatedStockItems };
                }
            }).filter(Boolean) // Remove null elements from cartItems
        );
    };

    useEffect(() => {
        // Check if cartItems are empty and navigate to 'make-order' if they are
        if (cartItems.length === 0) {
            navigate('/make-order', { state: { cartItems } });
        }
    }, [cartItems, navigate]);

    const handleIncrement = (item, stockItemId) => {
        const { stockItems, totalAmount } = calculateStockItems(item.item, item.quantity + 1);
      
        if (stockItems.length > 0) {
          const updatedCartItems = cartItems.map((cartItem) => {
            if (cartItem.item.id === item.item.id) {
              const updatedQuantity = cartItem.quantity + 1;
              if (updatedQuantity <= calculateStockValue(cartItem)) {
                // Find the specific stockItem based on stockItemId and update its quantity and amount
                const updatedStockItems = cartItem.stockItems.map((stockItem) =>
                  stockItem.id === stockItemId
                    ? {
                        ...stockItem,
                        remaining: stockItem.remaining + 1,
                        amount: (stockItem.remaining + 1) * stockItem.sellingPrice,
                      }
                    : stockItem
                );
      
                return {
                  ...cartItem,
                  quantity: updatedQuantity,
                  stockItems: updatedStockItems,
                  totalAmount, // Update the totalAmount for the item
                };
              }
              return cartItem; // Quantity exceeds stock, don't update the item
            }
            return cartItem;
          });
      
          setCartItems(updatedCartItems);
      
          // Recalculate the payableTotal whenever the quantity changes
          const updatedPayableTotal = payableTotal + totalAmount - item.totalAmount;
          setPayableTotal(updatedPayableTotal);
        }
      };
      
      const handleDecrement = (item, stockItemId) => {
        if (item.quantity > 1) {
          const { stockItems, totalAmount } = calculateStockItems(item.item, item.quantity - 1);
      
          const updatedCartItems = cartItems.map((cartItem) => {
            if (cartItem.item.id === item.item.id) {
              const updatedQuantity = cartItem.quantity - 1;
              // Find the specific stockItem based on stockItemId and update its quantity and amount
              const updatedStockItems = cartItem.stockItems.map((stockItem) =>
                stockItem.id === stockItemId
                  ? {
                      ...stockItem,
                      remaining: stockItem.remaining - 1,
                      amount: (stockItem.remaining - 1) * stockItem.sellingPrice,
                    }
                  : stockItem
              );
      
              return {
                ...cartItem,
                quantity: updatedQuantity,
                stockItems: updatedStockItems,
                totalAmount, // Update the totalAmount for the item
              };
            }
            return cartItem;
          });
      
          setCartItems(updatedCartItems);
      
          // Recalculate the payableTotal whenever the quantity changes
          const updatedPayableTotal = payableTotal + totalAmount - item.totalAmount;
          setPayableTotal(updatedPayableTotal);
        } else {
          // If quantity becomes 0, remove the item from the cart
          setCartItems((prevCartItems) =>
            prevCartItems.filter((cartItem) => cartItem.item.id !== item.item.id)
          );
      
          // Recalculate the payableTotal whenever the quantity changes
          const updatedPayableTotal = payableTotal - item.totalAmount;
          setPayableTotal(updatedPayableTotal);
        }
      };
      
      

    const calculateStockItems = (product, quantity) => {
        const supplies = product.supplies;
        const stockItems = [];
        let remainingCartQuantity = quantity;
        let totalAmount = 0; // Calculate the total amount

        for (const supply of supplies) {
            const remaining = supply.remaining;
            const retailPrice = parseFloat(supply.pricings[0].retailPrice);
            const sellingPrice = parseFloat(supply.pricings[0].sellingPrice);
            const id = supply.id
            // If the entered quantity is greater than the remaining quantity for this supply,
            // use the remaining quantity of the supply to calculate the amount
            const quantityToUse = Math.min(remainingCartQuantity, remaining);

            if (quantityToUse > 0) {
                const itemAmount = quantityToUse * sellingPrice;

                totalAmount += itemAmount;
                stockItems.push({
                    remaining: quantityToUse,
                    retailPrice,
                    sellingPrice,
                    amount: itemAmount,
                    supplyRemaining: remaining,
                    stockItemId: id,
                });

                remainingCartQuantity -= quantityToUse;
                if (remainingCartQuantity <= 0) {
                    break;
                }
            }
        }

        return { stockItems, totalAmount }; // Return stockItems and totalAmount as an object
    };

    const calculateSubtotal = () => {
        let subtotalAmount = 0;
        cartItems.forEach((item) => {
            subtotalAmount += item.totalAmount;
        });
        return subtotalAmount;
    };

    useEffect(() => {
        calculatePayableTotal(); // Calculate the initial payable total when the component mounts or cartItems change
    }, [cartItems]);

    const calculatePayableTotal = () => {
        let payableTotalAmount = 0;
        cartItems.forEach((item) => {
            payableTotalAmount += item.totalAmount;
        });
        setPayableTotal(payableTotalAmount);
    };

    const handleMobileNumberChange = (e) => {
        const inputPhoneNumber = e.target.value.replace(/\D/g, '').substring(0, 10); // Remove all non-digit characters
        if (inputPhoneNumber == "") {
            setIsName(false)
        }
        setMobileNumber(inputPhoneNumber);
        if (inputPhoneNumber.length < 10) {
            setIsMobileNumber(true)

        }
        if (inputPhoneNumber.length === 10) {
            setIsMobileNumber(false)
            console.log(inputPhoneNumber)
            console.log(mobileNumber)
            handleVerify(inputPhoneNumber);
        }
    }

    const handleAddPoints = () => {
        if (enteredRedeemPoints <= redeemPoints && enteredRedeemPoints <= payableTotal) {
            const updatedPayableTotal = payableTotal - enteredRedeemPoints;
            setPayableTotal(updatedPayableTotal);
            setIsSelected(true)
        } else if (enteredRedeemPoints > redeemPoints && enteredRedeemPoints > payableTotal) {
            // Show an alert if the entered redeem points are greater than the available points
            alert("")
            setEnteredRedeemPoints("")
            setIsSelected(false)
        }
    };
    const handleAddVoucher = () => {
        if (selectedVoucher) {

            const voucherAmountFloat = parseFloat(selectedVoucher);
            if (voucherAmountFloat <= payableTotal) {
                // Deduct the voucher amount from the payable total
                const updatedPayableTotal = payableTotal - voucherAmountFloat;
                setPayableTotal(updatedPayableTotal);
                // Find the index of the selected voucher in the list
                const selectedVoucherIndex = voucherAmount.findIndex(
                    (amount) => parseFloat(amount) === voucherAmountFloat
                );
                if (selectedVoucherIndex !== -1) {
                    // Remove the selected voucher from the list
                    setVoucherAmount((prevVoucherAmount) =>
                        prevVoucherAmount.filter((_, index) => index !== selectedVoucherIndex)
                    );
                }
                // Reset the selected voucher to an empty string
                setSelectedVoucher('');
            } else {
                // Show an alert if the voucher amount is greater than the payable total
                alert('Voucher amount is greater than payable total.');
                setSelectedVoucher('');
                setIsSelected(false)
            }
        }
    };

    const handleSelectOptionChange = (e) => {
        setSelectedVoucher(e.target.value)
        setIsSelected(true)
    }

    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [isOtpValidationSuccessful, setIsOtpValidationSuccessful] = useState(false);
    const [isOtpResending, setIsOtpResending] = useState(false);

    const handleOpenOtpModal = async () => {
        setIsOtpModalOpen(true);
        const resendData = {
            number: mobileNumber, // Replace this with your phone number
        };

        try {
            const response = await axios.post('https://devapi.grozep.com/login/v1/phone', resendData);
            console.log('OTP Resent Successfully:', response.data);
            alert('OTP Resent Successfully');
        } catch (error) {
            alert('Failed to resend OTP. Please try again.');
        }
    };

    const handleCloseOtpModal = () => {
        setIsOtpModalOpen(false);
        setOtpInput(''); // Reset OTP input when closing the modal
        setIsOtpValidationSuccessful(false); // Reset OTP validation status
        setIsOtpResending(false); // Reset OTP resending status
    };

    const handleValidateOtp = async () => {
        setIsOtpValidationSuccessful(false); // Reset OTP validation status before sending

        const otpData = {
            code: parseInt(otpInput),
            number: mobileNumber, // Replace this with your phone number
        };

        try {
            const response = await axios.post('https://devapi.grozep.com/login/v1/phone-verification', otpData);
            console.log(response.data);
            setIsOtpValidationSuccessful(true);
        } catch (error) {
            alert('OTP validation failed. Please try again.');
        }
    };

    const handleResendOtp = async () => {
        setIsOtpResending(true);

        const resendData = {
            number: mobileNumber, // Replace this with your phone number
        };

        try {
            await axios.post('https://devapi.grozep.com/login/v1/phone', resendData);
            alert('OTP Resent Successfully');
        } catch (error) {
            alert('Failed to resend OTP. Please try again.');
        }

        setIsOtpResending(false);
    };

    return (
        <main>
            <section className='cart-items-section'>
                <div className='back-btn'>
                    <button onClick={handleGoBack}>Back</button>
                </div>
                <div className='cart-portion'>
                    <Card className='cart-stored'>
                        <div>
                            <div className='cart-heading'>
                                <p>Cart Items</p>
                            </div>
                            <Card className='table-data-card'>
                                {cartItems && cartItems.length > 0 ? (
                                    <table className='search-table'>
                                        <thead className='search-head'>
                                            <tr>
                                                <th>ID</th>
                                                <th>Image</th>
                                                <th>Name</th>
                                                <th>Size</th>
                                                <th>MRP</th>
                                                <th>Discount</th>
                                                <th>Rate</th>
                                                <th>Total Stock</th>
                                                <th>Stock</th>
                                                <th>Quantity</th>
                                                <th>Total</th>
                                                <th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody className='search-body'>
                                            {cartItems && cartItems.length > 0 && (
                                                cartItems.map((item, index) => (
                                                    <React.Fragment key={index}>
                                                        {item.stockItems.map((stockItem, stockIndex) => (
                                                            <tr key={`${index}-${stockIndex}`}>
                                                                <td>{item.item.id}</td>
                                                                <td>
                                                                    <img src={item.item.product_variant.images[0]} />
                                                                </td>
                                                                <td>{item.item.product_variant.product.name}</td>
                                                                <td>{item.item.product_variant.product_size.value} {item.item.product_variant.product_size.unit}</td>
                                                                <td>{stockItem.retailPrice}</td>
                                                                <td>{calculateDiscount(stockItem)}</td>
                                                                <td>{stockItem.sellingPrice}</td>
                                                                <td>{calculateStockValue(item)}</td>
                                                                <td>{stockItem.supplyRemaining}</td>
                                                                <td>
                                                                    <button
                                                                        onClick={() => handleDecrement(item, stockItem.id)} // Pass stockItem ID to the handleDecrement function
                                                                        className='dec-inc-btn'
                                                                    >
                                                                        -
                                                                    </button>
                                                                    {stockItem.remaining}
                                                                    <button
                                                                        onClick={() => handleIncrement(item, stockItem.id)} // Pass stockItem ID to the handleIncrement function
                                                                        className='dec-inc-btn'
                                                                        disabled={stockItem.supplyRemaining === stockItem.remaining}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </td>
                                                                <td>{stockItem.amount}</td>
                                                                <td>
                                                                    <div>
                                                                        <button onClick={() => handleRemoveItem(stockItem.id)}>Remove</button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                ))
                                            )}
                                        </tbody>

                                    </table>
                                ) : (
                                    handleGoBacktoCart()
                                )}
                            </Card>
                        </div>
                    </Card>
                    <Card className='order-section'>
                        {!isRegistered ? (
                            <div className='create-user-section'>

                                <div className='mobile-input'>
                                    <input
                                        type='text'
                                        placeholder='Mobile Number'
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                    />
                                </div>
                                <div className='name-input'>
                                    <input
                                        type="text"
                                        placeholder='Name'
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <button onClick={handleCreateUser} className='place-order-btn'>Create user</button>
                                </div>
                            </div>
                        ) : (
                            <div className='invoice-details'>
                                <div className='invoice'>
                                    <p>Invoices</p>
                                </div>
                                {isName && (
                                    <p>{userName}</p>
                                )}
                                <div className='mobile-input'>
                                    <input
                                        type='text'
                                        placeholder='Mobile Number'
                                        value={mobileNumber}
                                        onChange={(e) => handleMobileNumberChange(e)}
                                    />
                                    {isMobileNumber && (
                                        <p>Enter 10-digit mobile number</p>
                                    )}
                                </div>
                                <div>
                                    {isVoucher && (
                                        <div>
                                            {voucherAmount && (
                                                <div className='select-voucher'>
                                                    <select
                                                        value={selectedVoucher}
                                                        onChange={handleSelectOptionChange} // Add this onChange event handler
                                                    >
                                                        <option value="">Select Voucher Amount</option>
                                                        {voucherAmount.map((amount, index) => (
                                                            <option key={index} value={amount}>
                                                                {amount}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            {selectedVoucher && (
                                                <p>Selected Voucher Amount: {selectedVoucher}</p>
                                            )}
                                            <button onClick={handleAddVoucher} className='add-voucher-button'>
                                                Add Voucher
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className='total-section'>
                                    <div className='sub-total-section'>
                                        <p className='sub-total'>Sub Total Amount: </p><p className='subtotal-value'>{calculateSubtotal()}</p> {/* Display subtotal */}
                                    </div>
                                </div>
                                <div>
                                    {isRedeem && (
                                        <div>
                                            {redeemPoints && (
                                                <div >
                                                    <div className='sub-total-section'>
                                                        <p className='sub-total'>Available Points:</p><p className='subtotal-value'> {redeemPoints}</p>
                                                    </div>
                                                    <div className='redeem-section'>
                                                        <div>
                                                            <p className='sub-total'>Redeem Points:</p>
                                                        </div>
                                                        <div className='redeem-input'>
                                                            <input
                                                                type='number'
                                                                value={enteredRedeemPoints}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === '' || parseInt(value) >= 0) {
                                                                        setEnteredRedeemPoints(value);
                                                                    }
                                                                }}
                                                            />


                                                            <button className='add-button' onClick={handleAddPoints}>
                                                                Add points
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {isSelected && (
                                    <div>
                                        <div>
                                            <p>Validate Loyality point or voucher : </p>
                                        </div>
                                        <div>
                                            <button onClick={handleOpenOtpModal}>Validate</button>
                                        </div>
                                    </div>
                                )}
                                <Modal show={isOtpModalOpen} onHide={handleCloseOtpModal}>
                                    <Modal.Header closeButton>
                                        <Modal.Title>OTP Verification</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <div>
                                            <label htmlFor="otp">Enter OTP:</label>
                                            <input
                                                type="number"
                                                id="otp"
                                                value={otpInput}
                                                onChange={(e) => setOtpInput(e.target.value)}
                                                disabled={isOtpValidationSuccessful || isOtpResending}
                                            />
                                        </div>
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <Button variant="secondary" onClick={handleCloseOtpModal} disabled={isOtpResending}>
                                            Cancel
                                        </Button>
                                        <Button variant="primary" onClick={handleValidateOtp} disabled={isOtpValidationSuccessful || isOtpResending}>
                                            Validate OTP
                                        </Button>
                                        <Button variant="secondary" onClick={handleResendOtp} disabled={isOtpValidationSuccessful || isOtpResending}>
                                            {isOtpResending ? 'Resending...' : 'Resend OTP'}
                                        </Button>
                                    </Modal.Footer>
                                </Modal>

                                <div className='sub-total-section'>
                                    <p className='sub-total'>Payable Amount: </p> <p className='subtotal-value'>{payableTotal}</p>
                                </div>
                                <div>
                                    <button className='place-order-btn'>Place Order</button>
                                </div>

                            </div>
                        )}
                    </Card>
                </div>
            </section>
        </main>
    );
}

export default CartItems;
