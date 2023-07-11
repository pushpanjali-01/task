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
                    const existingCartItem = prevCartItems.find((cartItem) => cartItem.item.id === item.id);

                    if (existingCartItem) {
                        existingCartItem.quantity += quantity;
                        return [...prevCartItems];
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

            if (itemStock > 0 && itemStock >= quantity) {
                return {
                    ...prevStock,
                    [item.id]: itemStock - quantity
                };
            }

            return prevStock;
        });

        setRemoveButtonDisabled(false);
    };
    const removeFromCart = (item) => {
        const itemInCart = cartItems.find((cartItem) => cartItem.item.id === item.id);

        if (itemInCart) {
            if (item.quantity > itemInCart.quantity) {
                alert(`Cannot remove more items than available in the cart.`);
                return; // Return early if quantity is greater than available in the cart
            }

            setCartItems((prevCartItems) =>
                prevCartItems.map((cartItem) =>
                    cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity - item.quantity } : cartItem
                )
            );

            setStock((prevStock) => {
                const newStock = prevStock[item.id] + item.quantity;
                return { ...prevStock, [item.id]: newStock };
            });
        } else {
            alert(`Item is not in the cart.`);
        }
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
                        <div className='search-div'>

                            <div className='product-search-input'>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder='Search product by name/category/subcategory/variantId/brand...'
                                />

                            </div>

                            <div className='search-submit-btn'>
                                <button onClick={handleSearch}>Search Product</button>
                            </div>
                            <div className='cart-btn'>
                                <button onClick={navigateToCartItems}>Go to Cart<span>({calculateCartValue()})</span></button>
                            </div>
                        </div>
                    </Card>
                </div>
                <section className='search-data-section'>
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
                                                    <div className='add-to-cart-btn'>
                                                        {inStock && (
                                                            <button onClick={() => addToCart(item, item.quantity)} className='add-btn'>Add</button>
                                                        )}
                                                        {itemInCart && (
                                                            <button onClick={() => removeFromCart(item)} disabled={removeButtonDisabled} className='remove-btn'>
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>
            </section>
        </main>
    );
}

export default ProductSearch;

