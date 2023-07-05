import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import "./style.css";

function Employee() {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeData, setEmployeeData] = useState([]);
    const [responseData, setResponseData] = useState(null);

    useEffect(() => {
        fetchEmployeeData();
    }, []);

    const fetchEmployeeData = async () => {
        const requestBody = {
            role: "cashier",
            storeCode: "JHGRH001"
        };

        try {
            const response = await fetch("https://api.grozep.com/v1/in/employees/role", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            setEmployeeData(data.data);
            console.log('role', data.data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleSelectChange = async (e) => {
        const selectedValue = e.target.value;
        setSelectedEmployee(selectedValue);

        const requestBody = {
            storeCode: "JHGRH001",
            employeeId: 11
        };

        try {
            const response = await fetch("https://api.grozep.com/v1/in/orders/admin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            setResponseData(data.data);
            console.log(data.data);
            console.log(data.data[0].id);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleCollectClick = async () => {
        const requestBody = [
            {
                employeeId: 11,
                managerId: 11,
                items: [
                    {
                        orderInvoiceId: 90,
                        loyaltyPoint: 200,
                        deliveryCharge: 15,
                        promoDiscount: 120,
                        paymentMode: "postPaid",
                        totalAmount: 1400,
                        orderedAt: "2023-07-12"
                    },
                    {
                        orderInvoiceId: 91,
                        loyaltyPoint: 200,
                        deliveryCharge: 15,
                        promoDiscount: 120,
                        paymentMode: "postPaid",
                        totalAmount: 1400,
                        orderedAt: "2023-07-12"
                    }
                ]
            }
        ]
        try {
            const response = await axios.post(
                'https://api.grozep.com/v1/in/orders/collected/admin',
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = response.data;
            setResponseData(data.data);
            console.log(data.data);

            toast.success('Order collected!', {
                position: toast.POSITION.TOP_RIGHT,
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const calculateTotals = () => {
        let totalAmount = 0;
        let totalLoyaltyPoints = 0;
        let totalPromoDiscount = 0;

        if (responseData && responseData.length > 0) {
            for (const order of responseData) {
                totalAmount += order.orderAmount || 0;
                totalLoyaltyPoints += order.loyaltyPoint || 0;
                totalPromoDiscount += order.promoDiscount || 0;
            }
        }

        return { totalAmount, totalLoyaltyPoints, totalPromoDiscount };
    };

    const { totalAmount, totalLoyaltyPoints, totalPromoDiscount } = calculateTotals();

    return (
        <main>
            <ToastContainer />
            <section className='employee-section'>
                <div className='employee-select-section'>
                    <select id="employeeSelect" value={selectedEmployee} onChange={handleSelectChange} className='employee-select'>
                        <option value="">Select</option>
                        {employeeData.map((employee) => (
                            <option key={employee.employeeId} value={employee.name}>{employee.name}</option>
                        ))}
                    </select>
                    <button onClick={handleCollectClick} className='collect-order-button'>Collect Order</button>
                </div>
                <div className='table-container'>
                    {responseData && (
                        <table className='order-table'>
                            <thead className='table-header'>
                                <tr>
                                    <th>Sno</th>
                                    <th>Date & Time</th>
                                    <th>OrderNumber</th>
                                    <th>Payment Mode</th>
                                    <th>Coupon Amount</th>
                                    <th>Redeem Amount</th>
                                    <th>Amount</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody className='table-body'>
                                {responseData && responseData.length > 0 && responseData.map((order, index) => (
                                    <tr key={order.id}>
                                        <td>{index + 1}</td>
                                        <td>{order.dateTime}</td>
                                        <td>{order.id}</td>
                                        <td>{order.paymentType}</td>
                                        <td>{order.promoDiscount}</td>
                                        <td>{order.loyaltyPoint}</td>
                                        <td>{order.orderAmount}</td>
                                        <td>{order.phone}</td>
                                        <td>{order.address.address}</td>
                                        <td>{order.status}</td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="4" className="table-footer">Total:</td>
                                    <td>{totalPromoDiscount}</td>
                                    <td>{totalLoyaltyPoints}</td>
                                    <td>{totalAmount}</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </main>
    );
}

export default Employee;




