import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import "./style.css";

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
            const createUserResponse = await axios.post('https://api.grozep.com/v1/in/users', userData);
            console.log('User created successfully:', createUserResponse.data);

            const generateOTPResponse = await axios.post('https://api.grozep.com/login/v1/phone', { number: mobileNumber });
            console.log('OTP generated successfully:', generateOTPResponse.data);
            setOtp(true);
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleVerifyOTP = async () => {
        try {
            const verifyOTPResponse = await axios.post('https://api.grozep.com/login/v1/phone-verification', { number: mobileNumber, otp: otpValue });
            console.log('OTP verified successfully:', verifyOTPResponse.data);
            setIsRegistered(true)
        } catch (error) {
            console.error('Error verifying OTP:', error);
        }
    };

    return (
        <main>
            <section className='cart-items-section'>
                <div>
                    <h1>Cart Items</h1>
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
                </div>
                {!isRegistered ? (
                    <div>
                        <div>
                            <input
                                type='text'
                                placeholder='Mobile Number'
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder='Name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <button onClick={handleCreateUser}>Create user</button>
                        </div>
                        <div>
                            {otp && (
                                <div>
                                    <div>
                                        <input value={otpValue} onChange={(e) => setOtpvalue(e.target.value)} />
                                    </div>
                                    <div>
                                        <button onClick={handleVerifyOTP}>verify</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div>
                            <p>Invoices</p>
                        </div>
                        <div>
                            <input
                                type='text'
                                placeholder='Mobile Number'
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            {voucherAmount && (
                                <div>
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
                        <div>
                            <p>Sub Total Amount: {subtotal}</p> {/* Display subtotal */}
                        </div>
                        <div>
                            {redeemPoints >= 100 && (
                                <div>
                                    <div>
                                        <p>Available Points: {redeemPoints}</p>
                                    </div>
                                    <div>
                                        <input type='text' value={enteredRedeemPoints} onChange={(e) => SetEnteredRedeemPoints(e.target.value)} /><button onClick={handleAddredeemPoints}>add redeem points</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            {voucherAmount && (
                                <div>
                                    <div>
                                        <p>Voucher Amount : </p>
                                    </div>
                                    <div>
                                        <button onClick={handleApplyVoucher}>Apply Voucher</button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <p>Payable Amount: {payableTotal}</p> {/* Display payable total */}
                        </div>
                        <div>
                            <button onClick={handlePlaceOrder}>Place Order</button>
                        </div>

                    </div>
                )}
            </section>
        </main>
    );
}

export default CartItems;
