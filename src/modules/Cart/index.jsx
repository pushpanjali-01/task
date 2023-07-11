import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import "./style.css"

function ProductSearch() {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [cartItems, setCartItems] = useState([]);
    const [removeButtonDisabled, setRemoveButtonDisabled] = useState(true);
    const [stock, setStock] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const navigate = useNavigate();

    const navigateToCartItems = () => {
        navigate('/cartitems', {
            state: { cartItems: cartItems, updatedStock: stock }
        });
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(
                'https://devapi.grozep.com/v1/in/listings-search?storeCode=JHGRH001&q=ata&page=1'
            );
            const suggestions = response.data.data.suggestions;

            setData(suggestions);

            // Initialize stock state with the initial stock values
            const stockData = {};
            suggestions.forEach(item => {
                stockData[item.id] = item.variant.supplies[0].quantity;
            });
            setStock(stockData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSearch = () => {
        const filteredResults = data.filter((item) => {
            const { id, name, brand, variant, subcategory, category } = item;
            const searchQueryLower = searchQuery.toLowerCase();

            return (
                id.toString().includes(searchQueryLower) ||
                name.toLowerCase().includes(searchQueryLower) ||
                brand.toLowerCase().includes(searchQueryLower) ||
                variant.id.toString().includes(searchQueryLower) ||
                subcategory.toLowerCase().includes(searchQueryLower) ||
                category.toLowerCase().includes(searchQueryLower)
            );
        });

        setFilteredData(filteredResults);
        setSearchQuery('');
    };

    const handleQuantityChange = (e, itemId) => {
        const quantity = parseInt(e.target.value);

        setCartItems((prevCartItems) => {
            return prevCartItems.map((cartItem) => {
                if (cartItem.item.id === itemId) {
                    return {
                        ...cartItem,
                        quantity: quantity
                    };
                }
                return cartItem;
            });
        });
    };


    const addToCart = (item, quantity) => {
        setCartItems((prevCartItems) => {
            const itemStock = stock[item.id];

            if (itemStock > 0) {
                if (itemStock >= quantity) {
                    const existingItemIndex = prevCartItems.findIndex((cartItem) => cartItem.item.id === item.id);

                    if (existingItemIndex !== -1) {
                        const updatedCartItems = [...prevCartItems];
                        updatedCartItems[existingItemIndex].quantity += quantity;
                        return updatedCartItems;
                    }

                    return [...prevCartItems, { item, quantity }];
                } else {
                    alert(`There is only ${itemStock} stock available.`);
                }
            }

            return prevCartItems;
        });

        setStock((prevStock) => {
            const itemStock = prevStock[item.id];
            console.log(prevStock[item.id])
            if (itemStock > 0 && itemStock >= quantity) {
                return {
                    ...prevStock,
                    [item.id]: itemStock - quantity
                };

            }
            return prevStock[item.id];

        });


        setRemoveButtonDisabled(false); 
    };


    const removeFromCart = (item) => {
        setCartItems((prevCartItems) => {
            const updatedCartItems = prevCartItems.map((cartItem) => {
                if (cartItem.item.id === item.id) {
                    const newQuantity = cartItem.quantity - item.quantity;

                    if (newQuantity <= 0) {
                        return null; // Mark the item for removal
                    }

                    return {
                        ...cartItem,
                        quantity: newQuantity,
                    };
                }

                return cartItem;
            });

            const filteredCartItems = updatedCartItems.filter(Boolean);

            if (filteredCartItems.length === 0) {
                setRemoveButtonDisabled(true); 
            }

            setStock((prevStock) => {
                return {
                    ...prevStock,
                    [item.id]: prevStock[item.id] - 1 + item.quantity
                };

            });

            return filteredCartItems;
        });
    };




    const calculateCartValue = () => {
        let totalQuantity = 0;
        cartItems.forEach((cartItem) => {
            totalQuantity += cartItem.quantity;
        });
        return totalQuantity;
    };

    return (
        <main>
            <section className='search-section'>
                <div>
                    <Card>
                        <div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button onClick={handleSearch}>Search</button>
                        </div>
                        <div>
                            <button onClick={navigateToCartItems}>Go to Cart<span>({calculateCartValue()})</span></button>
                        </div>
                    </Card>
                </div>
                <div className='search-data'>
                    {filteredData.length > 0 && (
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
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => {
                                    const itemStock = stock[item.id];
                                    const inStock = itemStock > 0;

                                    const handleQuantityChange = (e) => {
                                        const quantity = parseInt(e.target.value);
                                        item.quantity = quantity;
                                    };

                                    const itemInCart = cartItems.find((cartItem) => cartItem.item.id === item.id);
                                    const removeButtonDisabled = !itemInCart; // Disable the Remove button if item is not in the cart

                                    return (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>
                                                <img src={item.variant.imageURL[0]} alt={item.name} />
                                            </td>
                                            <td>{item.name}</td>
                                            <td>{item.variant.size}</td>
                                            <td>{item.variant.supplies[0].mrp}</td>
                                            <td>{item.variant.supplies[0].off}</td>
                                            <td>{item.variant.supplies[0].off}</td>
                                            <td>{inStock ? itemStock : 'Out of Stock'}</td>
                                            <td>
                                                {inStock && (
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={itemStock}
                                                        onChange={handleQuantityChange}
                                                    />
                                                )}
                                            </td>
                                            <td>
                                                {inStock && (
                                                    <button onClick={() => addToCart(item, item.quantity)}>Add</button>
                                                )}
                                                {itemInCart && (
                                                    <button onClick={() => removeFromCart(item)} disabled={removeButtonDisabled}>
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </main>
    );
}

export default ProductSearch;


