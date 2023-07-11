import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import "./style.css";
import { Card } from 'react-bootstrap';

function CartItems() {
    const location = useLocation();
    const cartItems = location.state.cartItems;
    const updatedStock = location.state.updatedStock;

    const [mobileNumber, setMobileNumber] = useState('');
    const [isRegistered, setIsRegistered] = useState(true);
    const [otp, setOtp] = useState(false);
    const [name, setName] = useState('');
    const [otpValue, setOtpvalue] = useState('');
    const [subtotal, setSubtotal] = useState(0);
    const [payableTotal, setPayableTotal] = useState(subtotal);
    const [redeemPoints, setRedeemPoints] = useState(0);
    const [voucherAmount, setVoucherAmount] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState('');
    const [enteredRedeemPoints, SetEnteredRedeemPoints] = useState('')
    // const [totalPayableAmount, setTotalPayableAmount] = useState(0);
    const calculateTotal = (item) => {
        return item.item.variant.supplies[0].mrp * item.quantity;
    };

    useEffect(() => {
        let total = 0;
        cartItems.forEach((item) => {
            total += calculateTotal(item);
        });
        setSubtotal(total);
        setPayableTotal(total); // For simplicity, setting payable total equal to the subtotal
    }, [cartItems]);

    const handlePlaceOrder = async () => {
        const userDetails = {
            phone: mobileNumber
        };

        try {
            const response = await axios.post('https://devapi.grozep.com/v1/in/users/details', userDetails);
            console.log(response.data)
            const points = response.data.data.redeemPoint;
            const voucher = response.data.data.voucher
            const offerAmounts = voucher.map(voucher => voucher.OfferAmount);
            console.log(offerAmounts)
            // Assuming the API response contains redeemPoints field
            setRedeemPoints(points);
            setVoucherAmount(offerAmounts)
            console.log(redeemPoints)
            console.log(response.data)
            setIsRegistered(true);
        } catch (error) {
            setIsRegistered(false);
            console.error('Error fetching user details:', error);
        }
    };

    const [accumulatedVoucherAmount, setAccumulatedVoucherAmount] = useState(0);
    const [totalPayableAmount, setTotalPayableAmount] = useState(subtotal);

    const handleApplyVoucher = () => {
        if (selectedVoucher !== '') {
            const voucherAmount = parseInt(selectedVoucher);
            if (voucherAmount > subtotal && payableTotal != 0) {
                window.alert('You cannot add a voucher amount greater than the subtotal.');
            } else {
                const newAccumulatedVoucherAmount = accumulatedVoucherAmount + voucherAmount;
                const newPayableAmount = Math.max(subtotal - newAccumulatedVoucherAmount, 0);
                setAccumulatedVoucherAmount(newAccumulatedVoucherAmount);
                setPayableTotal(newPayableAmount);
            }
        }
    };
    const handleAddredeemPoints = () => {
        if (enteredRedeemPoints !== '') {
            const redeemPointsoffer = parseInt(enteredRedeemPoints);
            if (redeemPointsoffer > subtotal && redeemPointsoffer > redeemPoints && payableTotal != 0) {
                window.alert('You cannot add redeem points');
            } else {
                const newAccumulatedVoucherAmount = accumulatedVoucherAmount + redeemPointsoffer;
                const updatedredeempoints = redeemPoints - newAccumulatedVoucherAmount;
                setRedeemPoints(updatedredeempoints);
                const newPayableAmount = Math.max(subtotal - newAccumulatedVoucherAmount, 0);
                setAccumulatedVoucherAmount(newAccumulatedVoucherAmount);
                setPayableTotal(newPayableAmount);
            }
        }

    }
    const handleCreateUser = async () => {
        try {
            const userData = {
                number: mobileNumber,
                name: name
            };
            const createUserResponse = await axios.post('https://devapi.grozep.com/v1/in/users', userData);
            console.log('User created successfully:', createUserResponse.data);

            const generateOTPResponse = await axios.post('https://devapi.grozep.com/login/v1/phone', { number: mobileNumber });
            console.log('OTP generated successfully:', generateOTPResponse.data);
            setOtp(true);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            const verifyOTPResponse = await axios.post('https://devapi.grozep.com/login/v1/phone-verification', { code: parseInt(otpValue), number: mobileNumber });
            console.log('OTP verified successfully:', verifyOTPResponse.data);
            setIsRegistered(true)
        } catch (error) {
            console.error('Error verifying OTP:', error);
        }
    };

    return (
        <main>
            <section className='cart-items-section'>
                <div className='cart-portion'>
                    <Card className='cart-stored'>
                        <div>
                            <div className='cart-heading'>
                                <p>Cart Items</p>
                            </div>
                            <Card className='table-data-card'>
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
                                            <th>Stock</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className='search-body'>
                                        {cartItems.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.item.id}</td>
                                                <td>
                                                    <img src={item.item.variant.imageURL[0]} alt={item.item.name} />
                                                </td>
                                                <td>{item.item.name}</td>
                                                <td>{item.item.variant.size}</td>
                                                <td>{item.item.variant.supplies[0].mrp}</td>
                                                <td>{item.item.variant.supplies[0].off}</td>
                                                <td>{item.item.variant.supplies[0].off}</td>
                                                <td>{updatedStock[item.item.id]}</td> {/* Display updated stock */}
                                                <td>{item.quantity}</td>
                                                <td>{calculateTotal(item)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                <div>
                                    {otp && (
                                        <div>
                                            <div>
                                                <input value={otpValue} onChange={(e) => setOtpvalue(e.target.value)} />
                                            </div>
                                            <div>
                                                <button onClick={handleVerifyOTP} >verify</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className='invoice-details'>
                                <div className='invoice'>
                                    <p>Invoices</p>
                                </div>
                                <div className='mobile-input'>
                                    <input
                                        type='text'
                                        placeholder='Mobile Number'
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                    />
                                </div>
                                <div>
                                    {voucherAmount && (
                                        <div className='select-voucher'>
                                            <select value={selectedVoucher} onChange={(e) => setSelectedVoucher(e.target.value)}>
                                                <option value="">Select Voucher Amount</option>
                                                {voucherAmount.map((amount, index) => (
                                                    <option key={index} value={amount}>
                                                        {amount}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                                <div className='total-section'>
                                    <div className='sub-total-section'>
                                        <p className='sub-total'>Sub Total Amount: </p><p className='subtotal-value'>{subtotal}</p> {/* Display subtotal */}
                                    </div>
                                </div>
                                <div>
                                    {redeemPoints >= 100 && (
                                        <div >
                                            <div className='sub-total-section'>
                                                <p className='sub-total'>Available Points:</p><p className='subtotal-value'> {redeemPoints}</p>
                                            </div>
                                            <div className='redeem-section'>
                                                <div className='redeem-input'>
                                                    <input type='text' value={enteredRedeemPoints} onChange={(e) => SetEnteredRedeemPoints(e.target.value)} />
                                                </div>
                                                <div className='redeem-add-btn'>
                                                    <button onClick={handleAddredeemPoints}>Add Points</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    {voucherAmount && (
                                        <div className='voucher-apply-section'>
                                            <div className='sub-total'>
                                                <p>Voucher Amount : </p>
                                            </div>
                                            <div>
                                                <button onClick={handleApplyVoucher} className='apply-voucher-btn'>Apply Voucher</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className='sub-total-section'>
                                    <p className='sub-total'>Payable Amount: </p> <p className='subtotal-value'>{payableTotal}</p>
                                </div>
                                <div>
                                    <button onClick={handlePlaceOrder} className='place-order-btn'>Place Order</button>
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
