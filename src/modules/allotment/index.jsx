// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import './style.css';
// import { Card } from 'react-bootstrap';

// function Allotment() {
//   const [inventoryListings, setInventoryListings] = useState([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [enteredQuantities, setEnteredQuantities] = useState({});
//   const [isCartOpen, setIsCartOpen] = useState(false);
//   console.log(cartItems);
//   useEffect(() => {
//     const fetchInventoryListings = async () => {
//       try {
//         const response = await axios.get('https://devapi.grozep.com/v1/in/inventory-listings');
//         setInventoryListings(response.data.data);
//       } catch (error) {
//         console.error('Error fetching inventory listings:', error);
//       }
//     };

//     fetchInventoryListings();
//   }, []);

//   const handleQuantityChange = (e, stockId) => {
//     const inputQuantity = parseInt(e.target.value);
//     setEnteredQuantities((prevQuantities) => ({
//       ...prevQuantities,
//       [stockId]: inputQuantity,
//     }));
//   };

//   const handleAddToCart = (stock) => {
//     const enteredQuantity = enteredQuantities[stock.id] || 0;

//     if (enteredQuantity > stock.quantity) {
//       alert('Enter a quantity less than or equal to the available stock.');
//     } else if (enteredQuantity > 0) {
//       const updatedStock = { ...stock, quantity: enteredQuantity };
//       setCartItems((prevCartItems) => {
//         const existingCartItem = prevCartItems.find((item) => item.id === stock.id);

//         if (existingCartItem) {
//           existingCartItem.quantity += enteredQuantity;
//           return [...prevCartItems];
//         } else {
//           return [...prevCartItems, updatedStock];
//         }
//       });

//       stock.quantity -= enteredQuantity;
//       setEnteredQuantities((prevQuantities) => ({
//         ...prevQuantities,
//         [stock.id]: 0,
//       }));
//     }
//   };

//   const handleRemoveFromCart = (stock) => {
//     const cartItem = cartItems.find((item) => item.id === stock.id);

//     if (!cartItem) {
//       alert('Item not found in the cart.');
//       return;
//     }

//     if (cartItem.quantity === 0) {
//       alert('Item quantity in the cart is already zero.');
//       return;
//     }

//     const enteredQuantity = enteredQuantities[stock.id] || 0;

//     if (enteredQuantity > cartItem.quantity) {
//       alert('Enter a quantity less than or equal to the cart quantity.');
//       return;
//     }

//     setCartItems((prevCartItems) => {
//       const updatedCartItems = prevCartItems.map((item) => {
//         if (item.id === stock.id) {
//           return { ...item, quantity: item.quantity - enteredQuantity };
//         }
//         return item;
//       });
//       return updatedCartItems.filter((item) => item.quantity > 0);
//     });

//     stock.quantity += enteredQuantity;
//     setEnteredQuantities((prevQuantities) => ({
//       ...prevQuantities,
//       [stock.id]: 0,
//     }));
//   };

//   const handleCartButtonClick = () => {
//     setIsCartOpen((prevIsCartOpen) => !prevIsCartOpen);
//   };

//   const calculateCartQuantity = () => {
//     let totalQuantity = 0;
//     cartItems.forEach((item) => {
//       totalQuantity += item.quantity;
//     });
//     return totalQuantity;
//   };

//   return (
//     <main>
//       <section className="allot-items-section">
//         <Card className="left-section-container">
//           <div className="left-section-content">
//             {inventoryListings.map((listing) => (
//               <div key={listing.id} className="product-item">
//                 <Card className="details-card">
//                   <div>
//                     <div className="product-details-div">
//                       {listing.product_variant.images && listing.product_variant.images.length > 0 ? (
//                         <img
//                           src={`https://media.grozep.com/images/products/${listing.product_variant.images[0]}`}
//                           alt={listing.product_variant.product.name}
//                           className="product-image"
//                         />
//                       ) : (
//                         <p>No Image</p>
//                       )}
//                       <div className="product-details-section">
//                         <div>
//                           <p>{listing.product_variant.product.name}</p>
//                         </div>
//                         <div>
//                           <p>
//                             Size: {listing.product_variant.product_size.value}
//                             {listing.product_variant.product_size.unit}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <div className="stock-table">
//                         <table className="stock-table">
//                           <thead>
//                             <tr>
//                               <th>ID</th>
//                               <th>Quantity</th>
//                               <th>Cost Price</th>
//                               <th>Selling Price</th>
//                               <th>Retail Price</th>
//                               <th>Trade Price</th>
//                               <th>Mfg Date</th>
//                               <th>Exp Date</th>
//                               <th>Action</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {listing.inventory_stocks.map((stock) => (
//                               <tr key={stock.id}>
//                                 <td>{stock.id}</td>
//                                 <td>{stock.quantity}</td>
//                                 <td>{stock.costPrice}</td>
//                                 <td>{stock.sellingPrice}</td>
//                                 <td>{stock.retailPrice}</td>
//                                 <td>{stock.tradePrice}</td>
//                                 <td>{stock.mfgDate}</td>
//                                 <td>{stock.expDate}</td>
//                                 <td>
//                                   <div>
//                                     <div>
//                                       <input
//                                         type="number"
//                                         onChange={(e) => handleQuantityChange(e, stock.id)}
//                                         value={enteredQuantities[stock.id] || ''}
//                                       />
//                                     </div>
//                                     <div>
//                                       <button onClick={() => handleAddToCart(stock)}>Add</button>
//                                       <button onClick={() => handleRemoveFromCart(stock)}>Remove</button>
//                                     </div>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 </Card>
//               </div>
//             ))}
//           </div>
//         </Card>
//         <Card className="cart-portion">
//           <div>
//             <button onClick={handleCartButtonClick}>Go To Cart <span>({calculateCartQuantity()})</span></button>
//           </div>
//           {isCartOpen && (
//             <div className="cart-table-container">
//               <h2>Cart Items</h2>
//               <table className="stock-table">
//                 <thead>
//                   <tr>
//                     <th>ID</th>
//                     <th>Cost Price</th>
//                     <th>Selling Price</th>
//                     <th>Retail Price</th>
//                     <th>Trade Price</th>
//                     <th>Mfg Date</th>
//                     <th>Exp Date</th>
//                     <th>Quantity</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {cartItems.map((item) => (
//                     <tr key={item.id}>
//                       <td>{item.id}</td>
//                       <td>{item.costPrice}</td>
//                       <td>{item.sellingPrice}</td>
//                       <td>{item.retailPrice}</td>
//                       <td>{item.tradePrice}</td>
//                       <td>{item.mfgDate}</td>
//                       <td>{item.expDate}</td>
//                       <td>{item.quantity}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </Card>
//       </section>
//     </main>
//   );
// }

// export default Allotment;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './style.css';
import { Card } from 'react-bootstrap';

function Allotment() {
    const [inventoryListings, setInventoryListings] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [enteredQuantities, setEnteredQuantities] = useState({});
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const fetchInventoryListings = async () => {
            try {
                const response = await axios.get('https://devapi.grozep.com/v1/in/inventory-listings');
                setInventoryListings(response.data.data);
            } catch (error) {
                console.error('Error fetching inventory listings:', error);
            }
        };

        fetchInventoryListings();
    }, []);

    const handleQuantityChange = (e, stockId) => {
        const inputQuantity = parseInt(e.target.value);
        setEnteredQuantities((prevQuantities) => ({
            ...prevQuantities,
            [stockId]: inputQuantity,
        }));
    };

    const handleAddToCart = (stock) => {
        const enteredQuantity = enteredQuantities[stock.id] || 0;

        if (enteredQuantity > stock.quantity) {
            alert('Enter a quantity less than or equal to the available stock.');
        } else if (enteredQuantity > 0) {
            const updatedStock = { ...stock, quantity: enteredQuantity };
            setCartItems((prevCartItems) => {
                // Check if the item is already in the cart
                const existingCartItem = prevCartItems.find((item) => item.id === stock.id);

                if (existingCartItem) {
                    // Update the quantity of the existing cart item
                    existingCartItem.quantity += enteredQuantity;
                    return [...prevCartItems];
                } else {
                    // Add the item to the cart with the entered quantity
                    return [...prevCartItems, updatedStock];
                }
            });

            stock.quantity -= enteredQuantity; // Update the item quantity in the inventoryListings state
            setEnteredQuantities((prevQuantities) => ({
                ...prevQuantities,
                [stock.id]: 0, // Reset the entered quantity for the stock
            }));
        }
    };

    const handleRemoveFromCart = (stock) => {
        const cartItem = cartItems.find((item) => item.id === stock.id);

        if (!cartItem) {
            alert('Item not found in the cart.');
            return;
        }

        if (cartItem.quantity === 0) {
            alert('Item quantity in the cart is already zero.');
            return;
        }

        const enteredQuantity = enteredQuantities[stock.id] || 0;

        if (enteredQuantity > cartItem.quantity) {
            alert('Enter a quantity less than or equal to the cart quantity.');
            return;
        }

        setCartItems((prevCartItems) => {
            const updatedCartItems = prevCartItems.map((item) => {
                if (item.id === stock.id) {
                    return { ...item, quantity: item.quantity - enteredQuantity };
                }
                return item;
            });
            return updatedCartItems.filter((item) => item.quantity > 0);
        });

        stock.quantity += enteredQuantity; // Update the item quantity in the inventoryListings state
        setEnteredQuantities((prevQuantities) => ({
            ...prevQuantities,
            [stock.id]: 0, // Reset the entered quantity for the stock
        }));
    };

    const handleCartButtonClick = () => {
        setIsCartOpen((prevIsCartOpen) => !prevIsCartOpen);
    };

    const calculateCartQuantity = () => {
        let totalQuantity = 0;
        cartItems.forEach((item) => {
            totalQuantity += item.quantity;
        });
        return totalQuantity;
    };

    return (
        <main>
            <section className='allot-items-section'>
                <div className='container-allotment'>
                    <div className='left-section'>
                        <div className='left-section-content'>
                            {inventoryListings.map((listing) => (
                                <div key={listing.id} className='product-item'>
                                    <Card className='details-card'>
                                        <div className='product-details-div'>
                                            {listing.product_variant.images && listing.product_variant.images.length > 0 ? (
                                                <img
                                                    src={`https://media.grozep.com/images/products/${listing.product_variant.images[0]}`}
                                                    alt={listing.product_variant.product.name}
                                                    className='product-image'
                                                />
                                            ) : (
                                                <p>No Image</p>
                                            )}
                                            <div className='product-details-section'>
                                                <div>
                                                    <p>{listing.product_variant.product.name}</p>
                                                </div>
                                                <div>
                                                    <p>
                                                        Size: {listing.product_variant.product_size.value}
                                                        {listing.product_variant.product_size.unit}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='stock-table'>
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Quantity</th>
                                                        <th>Cost Price</th>
                                                        <th>Selling Price</th>
                                                        <th>Retail Price</th>
                                                        <th>Trade Price</th>
                                                        <th>Mfg Date</th>
                                                        <th>Exp Date</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {listing.inventory_stocks.map((stock) => (
                                                        <tr key={stock.id}>
                                                            <td>{stock.id}</td>
                                                            <td>{stock.quantity}</td>
                                                            <td>{stock.costPrice}</td>
                                                            <td>{stock.sellingPrice}</td>
                                                            <td>{stock.retailPrice}</td>
                                                            <td>{stock.tradePrice}</td>
                                                            <td>{stock.mfgDate}</td>
                                                            <td>{stock.expDate}</td>
                                                            <td>
                                                                <div>
                                                                    <div>
                                                                        <input
                                                                            type='number'
                                                                            onChange={(e) => handleQuantityChange(e, stock.id)}
                                                                            value={enteredQuantities[stock.id] || ''}
                                                                            className='input-qty'
                                                                        />
                                                                    </div>
                                                                    <div className='cart-btns'>
                                                                        <div className='Add-btn'>
                                                                            <button onClick={() => handleAddToCart(stock)}>Add</button>
                                                                        </div>
                                                                        <div className='Remove-btn'>
                                                                            <button onClick={() => handleRemoveFromCart(stock)}>Remove</button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className='right-section'>
                    <Card className='cart-portion'>
                        <div className='add-to-cart-btn'>
                            <button onClick={handleCartButtonClick} >Go To Cart <span>({calculateCartQuantity()})</span></button>
                        </div>
                        {isCartOpen && (
                            <div className="cart-table-container">
                                <h2>Cart Items</h2>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Cost Price</th>
                                            <th>Selling Price</th>
                                            <th>Retail Price</th>
                                            <th>Trade Price</th>
                                            <th>Mfg Date</th>
                                            <th>Exp Date</th>
                                            <th>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cartItems.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.id}</td>
                                                <td>{item.costPrice}</td>
                                                <td>{item.sellingPrice}</td>
                                                <td>{item.retailPrice}</td>
                                                <td>{item.tradePrice}</td>
                                                <td>{item.mfgDate}</td>
                                                <td>{item.expDate}</td>
                                                <td>{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>

            </section>
        </main>
    );
}

export default Allotment;
