import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import './style.css';

function MakeOrder() {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [removeButtonDisabled, setRemoveButtonDisabled] = useState(true);
    const [stock, setStock] = useState({});
    const [duplicatedStock, setDuplicatedStock] = useState({});
    const [searchValue, setSearchValue] = useState('')
    const navigate = useNavigate();
    const location = useLocation();
    const [searchData, setSearchData] = useState([])
    console.log(searchValue);
    const navigateToCartItems = () => {
        // storeStateInLocalStorage();
        if (cartItems.length === 0) {
            alert('No items added to the cart.');
        } else {
            navigate('/cartitems', {
                state: {
                    cartItems: cartItems,
                },
            });
        }
    };

    const getTotalUniqueItemsInCart = () => {
        return cartItems.reduce((total, cartItem) => {
            if (!total.includes(cartItem.item.id)) {
                total.push(cartItem.item.id);
            }
            return total;
        }, []).length;
    };

    console.log("cartitems", cartItems)
    console.log("stock", stock)
    const fetchData = async () => {
        try {
            const response = await axios.get(
                `https://devapi.grozep.com/v1/in/search-listings?storeCode=JHGRH001&q=${searchQuery}&page=1`
            );

            const suggestions = response.data.data;
            console.log("suggestion", response.data);
            setData(suggestions);

            // Initialize stock state with the initial stock values
            const stockData = {};
            suggestions.forEach((item) => {
                stockData[item.id] = item.supplies.reduce((total, supply) => total + supply.remaining, 0);
            });
            setStock(stockData);
            setFilteredData(suggestions);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSearch = () => {     
        if (searchQuery.trim() === '') {
            alert('Please enter a search value to search.');
            return;
        }
        fetchData();
    };

    const handleAddToCart = (item, quantity) => {
        const itemStock = stock[item.id];
        const itemInCart = cartItems.find((cartItem) => cartItem.item.id === item.id);
        if (itemInCart) {
            const newQuantity = itemInCart.quantity + quantity;
            if (newQuantity <= itemStock) {
                itemInCart.quantity = newQuantity;
                const { stockItems, totalAmount } = calculateStockItems(item, newQuantity); // Calculate stock items and total amount
                itemInCart.stockItems = stockItems;
                itemInCart.totalAmount = totalAmount;
                setCartItems([...cartItems]);
            } else {
                itemInCart.quantity = itemStock;
                const { stockItems, totalAmount } = calculateStockItems(item, itemStock); // Calculate stock items and total amount
                itemInCart.stockItems = stockItems;
                itemInCart.totalAmount = totalAmount;
                setCartItems([...cartItems]);
            }
        } else {
            const { stockItems, totalAmount } = calculateStockItems(item, quantity); // Calculate stock items and total amount
            setCartItems([...cartItems, { item, quantity: quantity > itemStock ? itemStock : quantity, stockItems, totalAmount }]);
        }

        // Clear the input value after adding the item to cart
        setDuplicatedStock((prevDuplicatedStock) => ({
            ...prevDuplicatedStock,
            [item.id]: itemStock - (itemInCart?.quantity || 0),
        }));
        setRemoveButtonDisabled(false);
    };

    const calculateTotalAmount = () => {
        let totalAmount = 0;
        for (const cartItem of cartItems) {
            for (const stockItem of cartItem.stockItems) {
                totalAmount += stockItem.amount;
            }
        }
        return totalAmount;
    };

    const handleQuantityChange = (e, itemId) => {
        const enteredQuantityValue = e.target.value;
        const itemStock = stock[itemId];

        // If the entered quantity is empty or less than or equal to 0, set it to 0
        const newQuantity = enteredQuantityValue.trim() === '' || enteredQuantityValue <= 0 ? 0 : Math.min(enteredQuantityValue, itemStock);

        // Handle the case when the entered quantity is 0
        if (newQuantity === 0) {
            const itemInCart = cartItems.find((cartItem) => cartItem.item.id === itemId);

            if (itemInCart) {
                // If the item is in the cart and the quantity becomes 0, remove it from the cart
                setCartItems((prevCartItems) => prevCartItems.filter((cartItem) => cartItem.item.id !== itemId));
                setRemoveButtonDisabled(true);
            }
        } else {
            // If the entered quantity is greater than 0, update the cart items
            const itemInCart = cartItems.find((cartItem) => cartItem.item.id === itemId);

            if (itemInCart) {
                // If the item is already in the cart, update the quantity and stock items
                setCartItems((prevCartItems) =>
                    prevCartItems.map((cartItem) =>
                        cartItem.item.id === itemId
                            ? {
                                ...cartItem,
                                quantity: newQuantity,
                                ...calculateStockItems(cartItem.item, newQuantity), // Merge stock items and total amount
                            }
                            : cartItem
                    )
                );
            } else {
                // If the item is not in the cart, add it with the entered quantity and stock items
                setCartItems((prevCartItems) => [
                    ...prevCartItems,
                    {
                        item: data.find((item) => item.id === itemId),
                        quantity: newQuantity,
                        ...calculateStockItems(data.find((item) => item.id === itemId), newQuantity), // Merge stock items and total amount
                    },
                ]);
                setRemoveButtonDisabled(false);
            }
        }

        // Update the duplicated stock value based on the new quantity
        setDuplicatedStock((prevDuplicatedStock) => ({
            ...prevDuplicatedStock,
            [itemId]: itemStock - newQuantity,
        }));
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
            const quantityToUse = Math.min(remainingCartQuantity, remaining);
            if (quantityToUse > 0) {
                const itemAmount = quantityToUse * sellingPrice;
                totalAmount += itemAmount;
                const stockItemId = supply.id;
                stockItems.push({
                    remaining: quantityToUse,
                    retailPrice,
                    sellingPrice,
                    amount: itemAmount,
                    supplyRemaining: remaining,
                    id: stockItemId,
                });

                remainingCartQuantity -= quantityToUse;
                if (remainingCartQuantity <= 0) {
                    break;
                }
            }
        }

        return { stockItems, totalAmount }; // Return stockItems and totalAmount as an object
    };

    const handleRemoveFromCart = (item) => {
        const itemInCart = cartItems.find((cartItem) => cartItem.item.id === item.id);

        if (itemInCart) {
            // If the item is in the cart, remove it and update the stock value
            setCartItems((prevCartItems) => prevCartItems.filter((cartItem) => cartItem.item.id !== item.id));

            setDuplicatedStock((prevDuplicatedStock) => ({
                ...prevDuplicatedStock,
                [item.id]: prevDuplicatedStock[item.id] + itemInCart.quantity,
            }));
        }

        if (cartItems.length === 1) {
            // If the cart becomes empty, disable the "Remove" button
            setRemoveButtonDisabled(true);
        }
    };

    // Function to remove data from local storage
    const removeStateFromLocalStorage = () => {
        localStorage.removeItem('makeOrderState');
    };

    const handleInputChange = (e) => {
        const searchValue = e.target.value.toLowerCase(); // Convert the search value to lowercase
        setSearchValue(searchValue);


        // Filter the data based on the searchValue
        const filteredResults = data.filter((item) => {
            const productName = (item.product_variant.product.name || "").toString().toLowerCase();
            const productId = (item.id || "").toString().toLowerCase();
            const brand = (item.product_variant.product.brand || "").toString().toLowerCase();
            return (
                productName.includes(searchValue) ||
                productId.includes(searchValue) ||
                brand.includes(searchValue)
                // Add more conditions for other fields if needed
            );
        });
        setFilteredData(filteredResults);

        // If the search query is not empty, remove data from local storage
        removeStateFromLocalStorage()

    };
    return (
        <main>
            <section className="search-section">
                <div>
                    <Card>
                        <div className="search-div">
                            <div className="product-search-input">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search product by name/category/subcategory/variantId/brand..."
                                />
                            </div>
                            <div className="search-submit-btn">
                                <button onClick={handleSearch}>Search Product</button>
                            </div>
                            <div className="cart-btn">
                                <button onClick={navigateToCartItems}>
                                    Go to Cart<span>({getTotalUniqueItemsInCart()})</span>
                                </button>
                            </div>
                            <div className='amt'>
                                <button>
                                    <span> ₹({cartItems.length > 0 ? calculateTotalAmount() : 0})</span>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
                <section className="search-data-section">
                    <div className="search-data">
                        {filteredData.length > 0 && (
                            <div>
                                <div>
                                    <input
                                        type="text"
                                        value={searchValue}
                                        placeholder="Search product by name/category/subcategory/variantId/brand..."
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <table className="search-table">
                                    <thead className="search-head">
                                        <tr>
                                            <th>ID</th>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Size</th>
                                            <th>MRP</th>
                                            <th>Discount</th>
                                            <th>Rate</th>
                                            <th>Stock</th>
                                            <th>Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item) => {
                                            const itemStock = stock[item.id];
                                            const inStock = itemStock > 0;

                                            const itemInCart = cartItems.find((cartItem) => cartItem.item.id === item.id);

                                            const supplies = item.supplies;
                                            const maxRetailPrice = Math.max(...supplies.map((supply) => parseFloat(supply.pricings[0].retailPrice)));
                                            const minSellingPrice = Math.min(...supplies.map((supply) => parseFloat(supply.pricings[0].sellingPrice)));
                                            const discount = maxRetailPrice - minSellingPrice;

                                            return (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>
                                                        <img src={item.product_variant.images[0]} alt={item.name} />
                                                    </td>
                                                    <td>{item.product_variant.product.name}</td>
                                                    <td>{item.product_variant.product_size.value}</td>
                                                    <td>{maxRetailPrice}</td>
                                                    <td>{discount}</td>
                                                    <td>{minSellingPrice}</td>
                                                    <td>{inStock ? itemStock : "Out of stock"}</td>
                                                    <td>
                                                        {inStock ? (
                                                            <input
                                                                type="number"
                                                                max={itemStock}
                                                                value={itemInCart ? itemInCart.quantity : " "}

                                                                onChange={(e) => handleQuantityChange(e, item.id)}
                                                            />
                                                        ) : (
                                                            <div><p>Out of stock</p></div>

                                                        )}
                                                    </td>
                                                    <td>
                                                        <div>
                                                            {inStock ? (
                                                                <>
                                                                    {!itemInCart ? (
                                                                        <button onClick={() => handleAddToCart(item, 1)} className="add-btn-make-order">
                                                                            Add
                                                                        </button>
                                                                    ) : (
                                                                        <>
                                                                            <button onClick={() => handleRemoveFromCart(item)} className="remove-btn-make-order">
                                                                                Remove
                                                                            </button>
                                                                            {/* <span>({itemInCart.quantity})</span> */}
                                                                        </>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <div><p>Out of stock</p></div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </section>
        </main>
    );
}
export default MakeOrder;