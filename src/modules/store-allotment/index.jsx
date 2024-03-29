import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from 'react-bootstrap';
import Pagination from '../../components/pagination';
import './style.css';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import del from '../../asserts/images/delete-icon.png'
function StoreAllotment() {
    const [storeCodes, setStoreCodes] = useState([]);
    const [selectedStoreCode, setSelectedStoreCode] = useState('');
    const [productData, setProductData] = useState([]);
    // const [cartItems, setCartItems] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    // const [searchCartItems, setSearchCartItems] = useState([])
    const [searchResults, setSearchResults] = useState([]);
    const [storeAllotmentResponse, setStoreAllotmentResponse] = useState([])
    const [isStoreAlloted, setIsStoreAlloted] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [placedItemsList, setPlacedItemsList] = useState([])
    // const [inputValue, setInputValue] = useState([])
    // const [inputValueSearch, setInputValueSearch] = useState([])
    const [totalAmount, setTotalAmount] = useState('')

    const [inputValueSearch, setInputValueSearch] = useState(JSON.parse(localStorage.getItem('setInputValueSearch')) || []);
    const [searchCartItems, setSearchCartItems] = useState(JSON.parse(localStorage.getItem('SearchcartItems')) || []);
    const [inputValue, setInputValue] = useState(JSON.parse(localStorage.getItem('setInputValue')) || []);
    const [cartItems, setCartItems] = useState(JSON.parse(localStorage.getItem('SetCartItems')) || []);
    console.log("cart", cartItems)
    useEffect(() => {
        fetchStoreCodes();
    }, []);

    useEffect(() => {
        if (selectedStoreCode) {
            fetchProductData();
        }
    }, [selectedStoreCode]);

    useEffect(() => {
        if (selectedStoreCode) {
            fetchProductData();
            setCartItems([]);
        }
    }, [selectedStoreCode]);

    const saveDataToLocalStorage = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
    };
    // localStorage.setItem('cartItems', JSON.stringify(cartItems));
    // localStorage.setItem('setInputValue', JSON.stringify(inputValue));

    useEffect(() => {
        try {
           
            localStorage.setItem('setInputValueSearch', JSON.stringify(inputValueSearch));
            localStorage.setItem('setInputValue', JSON.stringify(inputValue));
            localStorage.setItem('SearchcartItems', JSON.stringify(searchCartItems));
        } catch (error) {
            console.error('Error updating localStorage:', error);
        }
    }, [inputValueSearch, inputValue, searchCartItems]);

useEffect(()=>{
    localStorage.setItem('SetCartItems', JSON.stringify(cartItems));
},[cartItems])
    useEffect(() => {
        const loadDataFromLocalStorage = (key) => {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        };

        // const loadedCartItems = loadDataFromLocalStorage('cartItems') || [];
        const loadedSearchCartItems = loadDataFromLocalStorage('SearchcartItems') || [];
        const loadedProductData = loadDataFromLocalStorage('productData');
        const loadedStoreCode = loadDataFromLocalStorage('storecode');
        const loadedSearchResults = loadDataFromLocalStorage('searchresults');
        const loadedSelectAll = loadDataFromLocalStorage('selectAll');
        const loadedSearchQuery = loadDataFromLocalStorage('Searchquery');
        const loadedIsSeach = loadDataFromLocalStorage('Issearching')
        const loadedsetStoreCodes = loadDataFromLocalStorage('setStoreCodes')
        const loadedsetStoreAllotmentResponse = loadDataFromLocalStorage('setStoreAllotmentResponse')
        const loadedsetIsStoreAlloted = loadDataFromLocalStorage('setIsStoreAlloted')
        const loadedsetIsLoading = loadDataFromLocalStorage('setIsLoading')
        const loadedsetPlacedItemsList = loadDataFromLocalStorage('setPlacedItemsList')
        const loadedsetInputValue = loadDataFromLocalStorage('setInputValue')
        const loadedsetInputValueSearch = loadDataFromLocalStorage('setInputValueSearch')
        // setCartItems(loadedCartItems);
        setSearchCartItems(loadedSearchCartItems);
        setProductData(loadedProductData || []);
        setSelectedStoreCode(loadedStoreCode || []);
        setSearchResults(loadedSearchResults || []);
        setSelectAll(loadedSelectAll || false);
        setSearchQuery(loadedSearchQuery || '');
        setIsSearching(loadedIsSeach || false)
        setStoreCodes(loadedsetStoreCodes || [])
        setStoreAllotmentResponse(loadedsetStoreAllotmentResponse || [])
        setIsStoreAlloted(loadedsetIsStoreAlloted || false)
        setIsLoading(loadedsetIsLoading || false)
        setPlacedItemsList(loadedsetPlacedItemsList || [])
        setInputValue(loadedsetInputValue || [])
        setInputValueSearch(loadedsetInputValueSearch || [])
        // ... set other state variables as needed
    }, []);

    const fetchStoreCodes = async () => {
        try {
            setIsLoading(true);
            saveDataToLocalStorage('setIsLoading', true);
            const response = await axios.get('https://devapi.grozep.com/v1/in/stores');
            console.log(response)
            const storeData = response.data.data.map((store) => {
                return {
                    code: store.code,
                    locality: store.location.locality
                };
            });
            setStoreCodes(storeData);
            saveDataToLocalStorage('setStoreCodes', storeData);
            setIsLoading(false);
            saveDataToLocalStorage('setIsLoading', false);
        } catch (error) {
            console.log('Error fetching store codes:', error);
            setIsLoading(false);
            saveDataToLocalStorage('setIsLoading', false);
        }
    };

    const fetchProductData = async () => {
        try {
            setIsLoading(true);
            saveDataToLocalStorage('setIsLoading', false);
            const response = await axios.get(
                `https://devapi.grozep.com/v1/stores/allotments/generate?storecode=${selectedStoreCode}`
            );
            console.log(response)
            const dataWithOrderQuantity = response.data.data.map((product) => {
                const desiredCapacity = product.maxCapacity - product.minCapacity;
                const availableCapacity = product.product_variant.inventory_listings.reduce(
                    (sum, listing) => {
                        const inventoryStocksRemaining = listing.inventory_stocks.reduce(
                            (stockSum, stock) => stockSum + stock.remaining,
                            0
                        );
                        return sum + inventoryStocksRemaining;
                    },
                    0
                );
                let orderQuantity;

                if (desiredCapacity > availableCapacity) {
                    orderQuantity = availableCapacity;
                } else if (desiredCapacity < availableCapacity) {

                    orderQuantity = desiredCapacity;
                }
                const amount = product.product_variant.inventory_listings.reduce((acc, listing) => {
                    const remainingQuantity = listing.inventory_stocks.reduce((stockSum, stock) => stockSum + stock.remaining, 0);
                    const tradePrice = listing.inventory_stocks[0].trade_price; // Assuming trade_price is the same for all stocks
                    if (orderQuantity <= remainingQuantity) {
                        return acc + orderQuantity * tradePrice;
                    } else {
                        orderQuantity -= remainingQuantity;
                        return acc + remainingQuantity * tradePrice;
                    }
                }, 0);
                const stockItems = product.product_variant.inventory_listings[0].inventory_stocks.map((stock) => ({

                    mrp: Number(stock.retailPrice),// Define 'mrp'
                    rate: Number(stock.tradePrice),// Define 'rate'

                }));
                return {
                    ...product,
                    orderQuantity: orderQuantity,
                    cartQuantity: 0,
                    selected: false,
                    remainingQuantity: availableCapacity,
                    amount: amount,
                    stockItems: stockItems,
                };
            });

            setProductData(dataWithOrderQuantity);
            saveDataToLocalStorage('productData', dataWithOrderQuantity);
            console.log(dataWithOrderQuantity)
            setIsLoading(false);
            saveDataToLocalStorage('setIsLoading', false);
        } catch (error) {
            console.log('Error fetching product data:', error);
            setIsLoading(false);
            saveDataToLocalStorage('setIsLoading', false);
        }
    };

    const handleStoreCodeChange = (event) => {
        const newSelectedStoreCode = event.target.value;
        setSelectedStoreCode(newSelectedStoreCode);

        // Save the new selectedStoreCode to local storage
        saveDataToLocalStorage('storecode', newSelectedStoreCode);
        // const storedStoreCodes = JSON.parse(localStorage.getItem('storeCodes') || '[]');
        // setStoreCodes(storedStoreCodes);
        setIsStoreAlloted(false);
        saveDataToLocalStorage('setIsStoreAlloted', false);
        setCartItems([])
        saveDataToLocalStorage('cartItems', []);
        setSearchCartItems([])
        // localStorage.setItem('SearchcartItems', JSON.stringify([]));
        setInputValueSearch([])
        saveDataToLocalStorage('setInputValueSearch', []);
        setInputValue([])
        saveDataToLocalStorage('setInputValue', []);
        setSelectAll(false)
        saveDataToLocalStorage('selectAll', selectAll);

    };

    const handleSelectAllChange = (event) => {
        const checked = event.target.checked;
        setSelectAll(checked);
        saveDataToLocalStorage('selectAll', checked);
        const updatedProductData = productData.map((product) => {
            if (product.remainingQuantity > 0) {
                return {
                    ...product,
                    selected: checked,
                };
            } else {
                return product;
            }
        });

        setProductData(updatedProductData);
        saveDataToLocalStorage('productData', updatedProductData);
    };

    const handleAddAllClick = () => {
        setSelectAll(false);
        saveDataToLocalStorage('selectAll', false);
        const selectedItems = productData.filter((product) => product.selected);

        if (selectedItems.length === 0) {
            alert('No items selected.');
            return;
        }

        const updatedCartItems = [...cartItems];

        selectedItems.forEach((item) => {
            const existingItemIndex = updatedCartItems.findIndex((cartItem) => cartItem.id === item.id);

            if (existingItemIndex !== -1) {
                const existingCartItem = updatedCartItems[existingItemIndex];
                existingCartItem.cartQuantity += item.remainingQuantity;
                existingCartItem.remainingQuantity -= existingCartItem.cartQuantity; // Update remaining quantity
            } else {
                let amount = 0;
                let remainingCartQuantity = item.remainingQuantity;
                let stockItems = [];

                item.product_variant.inventory_listings.forEach((listing) => {
                    if (remainingCartQuantity <= 0) {
                        return;
                    }

                    const stocks = listing.inventory_stocks;
                    if (!stocks) return;

                    const sortedStocks = stocks;

                    for (const stock of sortedStocks) {
                        const remaining = Number(stock.remaining);
                        const tradePrice = Number(stock.tradePrice);
                        const mrp = Number(stock.retailPrice);
                        const rate = Number(stock.tradePrice);

                        const quantityToUse = Math.min(remainingCartQuantity, remaining);

                        if (quantityToUse > 0) {
                            const itemAmount = quantityToUse * tradePrice; // Calculate the item's amount
                            amount += itemAmount;

                            const stockItem = {
                                remaining: quantityToUse,
                                tradePrice,
                                mrp,
                                rate,
                                amount: itemAmount, // Include the amount in stockItem
                            };
                            stockItems.push(stockItem);

                            remainingCartQuantity -= quantityToUse;
                            if (remainingCartQuantity <= 0) {
                                break;
                            }
                        }
                    }
                });

                updatedCartItems.push({
                    id: item.id,
                    name: item.product_variant.product.name,
                    brand: item.product_variant.product.brand,
                    productVariant: item.product_variant,
                    productVariantId: item.product_variant.id,
                    cartQuantity: item.remainingQuantity,
                    remainingQuantity: item.remainingQuantity,
                    amount,
                    stockItems,
                });
            }
        });
        // localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        const updatedProductData = productData.map((product) => {
            if (product.selected) {
                return {
                    ...product,
                    selected: false,
                };
            }
            return product;
        });

        setCartItems(updatedCartItems);

        console.log("updated", updatedCartItems);
        setProductData(updatedProductData);
        saveDataToLocalStorage('productData', updatedProductData);
    };

    const searchProducts = async (query) => {
        try {
            setIsSearching(true);
            saveDataToLocalStorage('Issearching', true);
            const response = await axios.get(
                `https://api.grozep.com/v1/in/inventorysearch?q=${query}`
            );
            const searchResults = response.data.data;
            console.log(searchResults)
            const filteredResults = searchResults.filter((result) => {
                const { id, name, brand } = result.product;
                const barcode = result
                const lowerSearchValue = query.toLowerCase();
                return (
                    id.toString().includes(lowerSearchValue) ||
                    name.toLowerCase().includes(lowerSearchValue) ||
                    brand.toLowerCase().includes(lowerSearchValue) ||
                    barcode.toString().includes(lowerSearchValue)
                );
            });

            const searchResultsWithOrderQuantity = filteredResults.map((result) => {
                const inventoryListings = result.inventory_listings;
                const desiredCapacity =
                    inventoryListings[0].maxCapacity - inventoryListings[0].minCapacity;
                const availableCapacity = inventoryListings.reduce((sum, listing) => {
                    const remaining = listing.inventory_stocks.reduce(
                        (stockSum, stock) => stockSum + stock.remaining,
                        0
                    );
                    return sum + remaining;
                }, 0);

                let orderQuantity;
                if (desiredCapacity > availableCapacity) {
                    orderQuantity = availableCapacity;
                } else {
                    orderQuantity = desiredCapacity;
                }

                return {
                    ...result,
                    orderQuantity: orderQuantity,
                    cartQuantity: 0,
                    selected: false,
                    remainingQuantity: availableCapacity,
                };
            });

            setSearchResults(searchResultsWithOrderQuantity);
            saveDataToLocalStorage('searchresults', searchResultsWithOrderQuantity);

        } catch (error) {
            console.log('Error fetching search results:', error);
        } finally {
            // setIsSearching(false);
        }
    };

    const handleStoreInputChange = (product, event) => {
        const enteredQuantity = parseInt(event.target.value, 10);
        const remainingQuantity = product.remainingQuantity;

        // If entered quantity is greater than remaining quantity, set it to the remaining quantity
        const updatedQuantity = Math.max(0, Math.min(enteredQuantity, remainingQuantity));

        setInputValue((prevInputValue) => ({ ...prevInputValue, [product.id]: updatedQuantity }));
        // saveDataToLocalStorage('setInputValue',(prevInputValue) => ({ ...prevInputValue, [product.id]: updatedQuantity }));
        // localStorage.setItem('setInputValue', JSON.stringify({...inputValue,[product.id]: updatedQuantity}));
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
        const sortedStocks = product.product_variant.inventory_listings[0].inventory_stocks
        // Calculate the stock information for the selected quantity
        let stockItems = [];
        let remainingCartQuantity = updatedQuantity;
        let amount = 0; // Calculate the total amount

        for (const stock of sortedStocks) {
            const remaining = Number(stock.remaining);
            const tradePrice = Number(stock.tradePrice);
            const mrp = Number(stock.retailPrice);
            const rate = Number(stock.tradePrice);

            // If the entered quantity is greater than the remaining quantity for this stock,
            // use the remaining quantity of the stock to calculate the amount
            const quantityToUse = Math.min(remainingCartQuantity, remaining);

            if (quantityToUse > 0) {
                const itemAmount = quantityToUse * tradePrice;
                amount += itemAmount;
                stockItems.push({
                    remaining: quantityToUse,
                    tradePrice,
                    mrp,
                    rate,
                    amount: itemAmount,
                });
                productData.stockItems = stockItems;
                productData.mrp = mrp;
                productData.rate = rate;

                remainingCartQuantity -= quantityToUse;
                if (remainingCartQuantity <= 0) {
                    break;
                }
            }
        }

        if (existingItemIndex !== -1) {
            if (updatedQuantity > 0) {
                const updatedCartItems = [...cartItems];
                updatedCartItems[existingItemIndex].cartQuantity = updatedQuantity;
                updatedCartItems[existingItemIndex].remainingQuantity = product.remainingQuantity - updatedQuantity;
                updatedCartItems[existingItemIndex].stockItems = stockItems; // Update the stock information
                updatedCartItems[existingItemIndex].amount = amount; // Update the total amount
                setCartItems(updatedCartItems);
                // localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
            } else {
                // If the entered quantity is 0 or less, remove the item from the cart
                const updatedCartItems = [...cartItems];
                updatedCartItems.splice(existingItemIndex, 1);
                setCartItems(updatedCartItems);
                // localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
            }
        } else {
            if (updatedQuantity > 0) {
                setCartItems((prevCartItems) => [
                    ...prevCartItems,
                    {
                        id: product.id,
                        name: product.product_variant.product.name,
                        brand: product.product_variant.product.brand,
                        productVariantId: product.product_variant.id,
                        productVariant: product.product_variant,
                        cartQuantity: updatedQuantity,
                        remainingQuantity: product.remainingQuantity - updatedQuantity,
                        stockItems,
                        amount, // Add the total amount
                    },
                ]);
                // localStorage.setItem('cartItems', JSON.stringify(...cartItems, {
                //     id: product.id,
                //     name: product.product_variant.product.name,
                //     brand: product.product_variant.product.brand,
                //     productVariantId: product.product_variant.id,
                //     productVariant: product.product_variant,
                //     cartQuantity: updatedQuantity,
                //     remainingQuantity: product.remainingQuantity - updatedQuantity,
                //     stockItems,
                //     amount, // Add the total amount
                // },));

            }
        }


    };

    const handleSearchInputChange = (result, event) => {
        const enteredQuantity = parseInt(event.target.value, 10);
        const remainingQuantity = result.remainingQuantity;

        // If entered quantity is greater than remaining quantity, set it to the remaining quantity
        const updatedQuantity = Math.max(0, Math.min(enteredQuantity, remainingQuantity));

        setInputValueSearch((prevInputValue) => ({ ...prevInputValue, [result.id]: updatedQuantity }));
        // saveDataToLocalStorage('setInputValueSearch',(prevInputValue) => ({ ...prevInputValue, [result.id]: updatedQuantity }));
        // localStorage.setItem('setInputValueSearch', JSON.stringify({...inputValueSearch,[result.id]: updatedQuantity }));
        const existingItemIndex = searchCartItems.findIndex((item) => item.id === result.id);
        const sortedStocks = result.inventory_listings[0].inventory_stocks

        // Calculate the stock information for the selected quantity
        let stockItems = [];
        let remainingCartQuantity = updatedQuantity;
        let amount = 0; // Calculate the total amount

        for (const stock of sortedStocks) {
            const remaining = Number(stock.remaining);
            const tradePrice = Number(stock.tradePrice);
            const mrp = Number(stock.retailPrice);
            const rate = Number(stock.tradePrice);

            // If the entered quantity is greater than the remaining quantity for this stock,
            // use the remaining quantity of the stock to calculate the amount
            const quantityToUse = Math.min(remainingCartQuantity, remaining);

            if (quantityToUse > 0) {
                const itemAmount = quantityToUse * tradePrice;
                amount += itemAmount;
                stockItems.push({
                    remaining: quantityToUse,
                    tradePrice,
                    mrp,
                    rate,
                    amount: itemAmount,
                });

                remainingCartQuantity -= quantityToUse;
                if (remainingCartQuantity <= 0) {
                    break;
                }
            }
        }

        if (existingItemIndex !== -1) {
            if (updatedQuantity > 0) {
                const updatedSearchCartItems = [...searchCartItems];
                updatedSearchCartItems[existingItemIndex].cartQuantity = updatedQuantity;
                updatedSearchCartItems[existingItemIndex].remainingQuantity = result.remainingQuantity - updatedQuantity;
                updatedSearchCartItems[existingItemIndex].stockItems = stockItems; // Update the stock information
                updatedSearchCartItems[existingItemIndex].amount = amount; // Update the total amount
                setSearchCartItems(updatedSearchCartItems);
                // localStorage.setItem('SearchcartItems', JSON.stringify(updatedSearchCartItems));

            } else {
                // If the entered quantity is 0 or less, remove the item from the cart
                const updatedSearchCartItems = [...searchCartItems];
                updatedSearchCartItems.splice(existingItemIndex, 1);
                setSearchCartItems(updatedSearchCartItems);
                // localStorage.setItem('SearchcartItems', JSON.stringify(updatedSearchCartItems));

            }
        } else {
            if (updatedQuantity > 0) {
                setSearchCartItems((prevCartItems) => [
                    ...prevCartItems,
                    {
                        id: result.id,
                        name: result.product.name,
                        brand: result.product.brand,
                        productVariantId: result.inventory_listings[0].productVariantId,
                        barcode: result.barcode,
                        sizeValue: result.product_size.value,
                        sizeUnit: result.product_size.unit,
                        cartQuantity: updatedQuantity,
                        remainingQuantity: result.remainingQuantity - updatedQuantity,
                        amount,
                        stockItems, // Add the stock information
                    },
                ]);
                console.log("cccc", cartItems)
                // localStorage.setItem('SearchcartItems', JSON.stringify(...searchCartItems,{
                //     id: result.id,
                //     name: result.product.name,
                //     brand: result.product.brand,
                //     productVariantId: result.inventory_listings[0].productVariantId,
                //     barcode: result.barcode,
                //     sizeValue: result.product_size.value,
                //     sizeUnit: result.product_size.unit,
                //     cartQuantity: updatedQuantity,
                //     remainingQuantity: result.remainingQuantity - updatedQuantity,
                //     amount,
                //     stockItems, // Add the stock information
                // },));

            }
        }
    };

    const handleStoreRemoveItemClick = (product) => {
        setInputValue((prevInputValue) => ({ ...prevInputValue, [product.id]: null }));
        // saveDataToLocalStorage('setInputValue',(prevInputValue) => ({ ...prevInputValue, [product.id]: null }));
        // localStorage.setItem('setInputValue', JSON.stringify({...inputValue,[product.id]: null}));
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
        if (existingItemIndex !== -1) {
            const updatedCartItems = [...cartItems];
            updatedCartItems.splice(existingItemIndex, 1);
            setCartItems(updatedCartItems);
            // localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        }
    };

    const handleSearchRemoveItemClick = (result) => {
        setInputValueSearch((prevInputValue) => ({ ...prevInputValue, [result.id]: null }));
        // saveDataToLocalStorage('setInputValueSearch',(prevInputValue) => ({ ...prevInputValue, [result.id]: null }))
        // localStorage.setItem('setInputValueSearch', JSON.stringify({[result.id]: 0}));
        const existingItemIndex = searchCartItems.findIndex((item) => item.id === result.id);
        if (existingItemIndex !== -1) {
            const updatedSearchCartItems = [...searchCartItems];
            updatedSearchCartItems.splice(existingItemIndex, 1);
            setSearchCartItems(updatedSearchCartItems);
            // localStorage.setItem('SearchcartItems', JSON.stringify(updatedSearchCartItems));

        }
    };

    const handleStoreAddItemClick = (product) => {
        setInputValue((prevInputValue) => ({ ...prevInputValue, [product.id]: 1 }));
        // saveDataToLocalStorage('setInputValue',(prevInputValue) => ({ ...prevInputValue, [product.id]: 1 }))
        // localStorage.setItem('setInputValue', JSON.stringify({...inputValue,[product.id]: 1 }));
        const existingItemIndex = cartItems.findIndex((item) => item.id === product.id);
        if (existingItemIndex !== -1) {
            // Item already exists in cart, do nothing
            return;
        }

        // Calculate the sortedStocks variable
        const sortedStocks = product.product_variant.inventory_listings[0].inventory_stocks

        // Calculate the number of items to add to the cart
        const enteredQuantity = 1;
        const remainingQuantity = sortedStocks.reduce((total, stock) => total + stock.remaining, 0);
        const updatedQuantity = Math.min(enteredQuantity, remainingQuantity);

        // Add the items to the cart based on the available stock
        const newCartItems = [];
        let remainingCartQuantity = updatedQuantity;

        for (const stock of sortedStocks) {
            const availableQuantity = Math.min(stock.remaining, remainingCartQuantity);
            if (availableQuantity > 0) {
                // Calculate stockItems here
                const stockItems = [];

                const quantityToUse = Math.min(availableQuantity, stock.remaining);

                const amount = quantityToUse * Number(stock.tradePrice);

                const mrp = Number(stock.retailPrice); // Define 'mrp'
                const rate = Number(stock.tradePrice); // Define 'rate'

                stockItems.push({
                    remaining: quantityToUse,
                    tradePrice: Number(stock.tradePrice),
                    mrp,
                    rate,
                    amount,
                });

                newCartItems.push({
                    id: product.id,
                    name: product.product_variant.product.name,
                    brand: product.product_variant.product.brand,
                    productVariantId: product.product_variant.id,
                    productVariant: product.product_variant,
                    cartQuantity: availableQuantity,
                    remainingQuantity: stock.remaining - availableQuantity,
                    amount,
                    stockItems, // Add the stock information
                });



                remainingCartQuantity -= availableQuantity;
                if (remainingCartQuantity === 0) break;
                console.log(stockItems);
            }
        }

        // Add the new cart items
        setCartItems((prevCartItems) => [...prevCartItems, ...newCartItems]);
        // saveDataToLocalStorage('cartItems', (prevCartItems) => [...prevCartItems, ...newCartItems]);
        // localStorage.setItem('cartItems', JSON.stringify(...cartItems,...newCartItems));
    };

    const handleSearchAddItemClick = (result) => {
        setInputValueSearch((prevInputValue) => ({ ...prevInputValue, [result.id]: 1 }));
        // localStorage.setItem('setInputValueSearch', JSON.stringify({...inputValueSearch,[result.id]: 1 }));
        const existingItemIndex = searchCartItems.findIndex((item) => item.id === result.id);
        if (existingItemIndex !== -1) {
            // Item already exists in cart, do nothing
            return;
        }

        // Calculate the sortedStocks variable
        const sortedStocks = result.inventory_listings[0].inventory_stocks

        // Calculate the number of items to add to the cart
        const enteredQuantity = 1;
        const remainingQuantity = sortedStocks.reduce((total, stock) => total + stock.remaining, 0);
        const updatedQuantity = Math.min(enteredQuantity, remainingQuantity);

        // Add the items to the cart based on the available stock
        const newCartItems = [];
        let remainingCartQuantity = updatedQuantity;

        for (const stock of sortedStocks) {
            const availableQuantity = Math.min(stock.remaining, remainingCartQuantity);
            if (availableQuantity > 0) {
                // Calculate stockItems here
                const stockItems = [];

                const quantityToUse = Math.min(availableQuantity, stock.remaining);

                const amount = quantityToUse * Number(stock.tradePrice);

                stockItems.push({
                    remaining: quantityToUse,
                    tradePrice: Number(stock.tradePrice),
                    mrp: Number(stock.retailPrice),
                    rate: Number(stock.tradePrice),
                    amount,
                });

                newCartItems.push({
                    id: result.id,
                    name: result.product.name,
                    brand: result.product.brand,
                    productVariantId: result.inventory_listings[0].productVariantId,
                    barcode: result.barcode,
                    sizeValue: result.product_size.value,
                    sizeUnit: result.product_size.unit,
                    cartQuantity: availableQuantity,
                    remainingQuantity: stock.remaining - availableQuantity,
                    amount,
                    costPrice: stock.costPrice,
                    sellingPrice: stock.sellingPrice,
                    retailPrice: stock.retailPrice,
                    stockItems, // Add the stock information
                });
                console.log("stock", stockItems);
                remainingCartQuantity -= availableQuantity;
                if (remainingCartQuantity === 0) break;
            }
        }

        // Add the new cart items
        setSearchCartItems((prevCartItems) => [...prevCartItems, ...newCartItems]);
        // localStorage.setItem('SearchcartItems', JSON.stringify({...searchCartItems,...newCartItems}));

    };

    const handlePlaceOrder = async () => {
        const allCartItems = [...cartItems, ...searchCartItems];

        const orderItems = allCartItems.map((item) => ({
            quantity: item.cartQuantity,
            productVariantId: item.productVariantId,
        }));

        const requestData = {
            storecode: selectedStoreCode,
            employeeId: 11,
            items: orderItems,
        };
        console.log(requestData)
        try {
            const response = await axios.post('https://devapi.grozep.com/v1/in/allotments', requestData);
            console.log("place-order-response", response)
            if (response.data.status === true) {
                alert("Successfully placed order", response.data.status)
                setIsLoading(true)
                saveDataToLocalStorage('setIsLoading', false);
                localStorage.removeItem('cartItems');
                localStorage.removeItem('SearchcartItems');
                localStorage.removeItem('Searchquery');
                localStorage.removeItem('searchresults');
                localStorage.removeItem('setInputValue');
                localStorage.removeItem('setInputValueSearch');
                localStorage.removeItem('productData')
                localStorage.removeItem('storecode')
                localStorage.removeItem('selectAll')
                localStorage.removeItem('Issearching')
                localStorage.removeItem('setStoreCodes')
                localStorage.removeItem('setStoreAllotmentResponse')
                localStorage.removeItem('setIsStoreAlloted')
                localStorage.removeItem('setPlacedItemsList')

                const placedOrderItems = allCartItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    brand: item.brand,
                    barcode: item.barcode,
                    quantity: item.cartQuantity,
                    sizeValue: item.sizeValue,
                    sizeUnit: item.sizeUnit,
                    amount: item.amount,
                    totalAmount: item.totalAmount
                }));
                console.log("placeorder", placedOrderItems)
                console.log('Successfully placed order items:', placedOrderItems);
                setPlacedItemsList(placedOrderItems)
                saveDataToLocalStorage('setPlacedItemsList', placedOrderItems);
                setStoreAllotmentResponse(response.data.data);
                saveDataToLocalStorage('setIsStoreAllotedResponse', response.data.data);
                setIsStoreAlloted(true);
                saveDataToLocalStorage('setIsStoreAlloted', true);
                setCartItems([]);
                // localStorage.setItem('cartItems', JSON.stringify([]));
                setSearchCartItems([]);
                // localStorage.setItem('SearchcartItems', JSON.stringify([]));
                setSelectedStoreCode([]);
                setSearchQuery('')
                saveDataToLocalStorage('Searchquery', '');
                setSearchResults([])
                saveDataToLocalStorage('searchresults', []);
                setIsSearching(false)
                setInputValue([])
                saveDataToLocalStorage('setInputValue', [])
                setInputValueSearch([])
                saveDataToLocalStorage('setInputValueSearch', [])
            } else {
                console.log('Order placement failed:', response.data.message);
                alert(response.data.message)
            }
        } catch (error) {
            console.log('Error placing the order:', error);
        }
    };

    const exportAsPDF = () => {
        if (!storeAllotmentResponse || !storeAllotmentResponse.result || !storeAllotmentResponse.storeAllotmentItem) {
            console.log('No data available to generate PDF.');
            return;
        }

        const { id, storecode, employeeId, status, createdAt } = storeAllotmentResponse.result;
        const itemCount = storeAllotmentResponse.storeAllotmentItem.length;
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text(`Store Allotment Id: ${id}`, 10, 10);
        doc.text(`Store Code: ${storecode}`, 10, 20);
        doc.text(`Employee ID: ${employeeId}`, 10, 30);
        doc.text(`Status: ${status}`, 10, 40);
        doc.text(`Created At: ${createdAt}`, 10, 50);
        doc.text(`Item Count: ${itemCount}`, 10, 60);
        doc.text('Items:', 10, 70);
        const tableData = placedItemsList.map((item) => [
            item.id,
            item.name,
            item.brand,
            item.sizeValue + item.sizeUnit,
            item.quantity,
            item.amount,
        ]);

        // Calculate total amount
        const totalAmount = placedItemsList.reduce((total, item) => total + item.amount, 0);

        // Add the total row to tableData
        tableData.push(['Total Amount', '', '', '', '', totalAmount]);

        doc.autoTable({
            startY: 80,
            head: [['Item ID', 'Name', 'Brand', 'size value', 'Quantity', 'Amount']],
            body: tableData,
        });
        doc.save('store_allotment.pdf');
    };

    const exportAsExcel = () => {
        if (!storeAllotmentResponse || !storeAllotmentResponse.result || !storeAllotmentResponse.storeAllotmentItem) {
            console.log('No data available to export as Excel.');
            return;
        }

        const { id, storecode, employeeId, status, createdAt } = storeAllotmentResponse.result;
        const itemCount = storeAllotmentResponse.storeAllotmentItem.length;

        const workbook = XLSX.utils.book_new();
        const worksheetData = [
            {
                'ID': id,
                'Store Code': storecode,
                'Employee ID': employeeId,
                'Status': status,
                'Created At': createdAt,
                'Item Count': itemCount,
            },
        ];

        const itemsData = placedItemsList.map((item) => ({
            'Item ID': item.id,
            'Name': item.name,
            'Brand': item.brand,
            'Size': item.sizeValue + item.sizeUnit,
            'Quantity': item.quantity,
            'Total Amount': item.amount,
        }));

        // Calculate total amount
        const totalAmount = placedItemsList.reduce((total, item) => total + item.amount, 0);

        // Add the total row to itemsData
        itemsData.push({
            'Item ID': '',
            'Name': '',
            'Brand': '',
            'Size': '',
            'Quantity': 'Total Amount',
            'Total Amount': totalAmount,
        });

        const worksheet = XLSX.utils.json_to_sheet([...worksheetData, ...itemsData]);

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Store Allotment');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const excelData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(excelData, 'store_allotment.xlsx');
    };

    const getTotalAmount = () => {
        const allCartItems = [...cartItems, ...searchCartItems];
        const totalAmount = allCartItems.reduce((sum, item) => sum + item.amount, 0);
        return totalAmount;
    };

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    // Calculate the index of the first and last product on the current page
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = productData.slice(indexOfFirstProduct, indexOfLastProduct);
    const pageNumbers = Math.ceil(productData.length / productsPerPage);
    // Define functions to handle pagination button clicks
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const handlePreviousClick = () => setCurrentPage(currentPage - 1);
    const handleNextClick = () => setCurrentPage(currentPage + 1);
    const handleFirstClick = () => setCurrentPage(1);
    const handleLastClick = () => setCurrentPage(pageNumbers);

    const [currentPageSearch, setCurrentPageSearch] = useState(1);
    const productsPerPageSearch = 10;

    // Calculate the index of the first and last product on the current page
    const indexOfLastProductSearch = currentPageSearch * productsPerPageSearch;
    const indexOfFirstProductSerach = indexOfLastProductSearch - productsPerPageSearch;
    const currentProductsSearch = searchResults.slice(indexOfFirstProduct, indexOfLastProduct);
    const pageNumbersSearch = Math.ceil(searchResults.length / productsPerPageSearch);
    // Define functions to handle pagination button clicks
    const paginateSearch = (pageNumber) => setCurrentPageSearch(pageNumber);
    const handlePreviousClickSearch = () => setCurrentPageSearch(currentPageSearch - 1);
    const handleNextClickSearch = () => setCurrentPageSearch(currentPageSearch + 1);
    const handleFirstClickSearch = () => setCurrentPageSearch(1);
    const handleLastClickSearch = () => setCurrentPageSearch(pageNumbersSearch);

    return (
        <main>
            <section className="store-allotment-section">
                <div className="card-section">
                    <Card className="container-card">
                        <select value={selectedStoreCode} onChange={handleStoreCodeChange} className='store-select'>
                            <option value="" disabled>
                                Select Store
                            </option>
                            {storeCodes.map((store) => (
                                <option key={store.code} value={store.code}>
                                    {store.code} - {store.locality}
                                </option>
                            ))}
                        </select>
                        <div className="search-input-container">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => {
                                    const search = event.target.value
                                    setSearchQuery(search);
                                    saveDataToLocalStorage('Searchquery', search);
                                    setIsSearching(false);
                                    setIsStoreAlloted(false);
                                    saveDataToLocalStorage('setIsStoreAlloted', false);
                                    if (event.target.value.trim() !== '') {
                                        searchProducts(event.target.value.trim());
                                    } else {
                                        setProductData([]);
                                        saveDataToLocalStorage('productData', []);
                                        setIsSearching(false);
                                    }
                                }}
                                placeholder="Enter your search query..."
                            />
                        </div>
                        {isLoading ? (
                            <div className="loading-container">
                                <h1>Loading Data.....</h1>
                            </div>
                        ) : (
                            <div>
                                {!isSearching && selectedStoreCode && productData.length > 0 && (
                                    <div>
                                        <div className="action-container">
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAllChange}
                                                disabled={productData.length === 0}
                                            />
                                            <button onClick={handleAddAllClick} disabled={productData.length === 0}>
                                                Add All To Cart
                                            </button>
                                        </div>
                                        <table className="table-container">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectAll}
                                                            onChange={handleSelectAllChange}
                                                        />
                                                    </th>
                                                    <th>ID</th>
                                                    <th>Image</th>
                                                    <th>Brand & Name</th>
                                                    <th>Size</th>
                                                    <th>Mrp</th>
                                                    <th>rate</th>
                                                    <th>Stock</th>
                                                    <th>Required</th>
                                                    <th>Quantity</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productData.slice(
                                                    (currentPage - 1) * productsPerPage,
                                                    currentPage * productsPerPage
                                                ).map((product) => (
                                                    <tr key={product.id}>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={product.selected}
                                                                onChange={() => {
                                                                    if (product.remainingQuantity > 0) { // Check if product is in stock
                                                                        const updatedProductData = productData.map((prevProduct) => {
                                                                            if (prevProduct.id === product.id) {
                                                                                return {
                                                                                    ...prevProduct,
                                                                                    selected: !prevProduct.selected,
                                                                                };
                                                                            }
                                                                            return prevProduct;
                                                                        });
                                                                        setProductData(updatedProductData);
                                                                        saveDataToLocalStorage('productData', updatedProductData);

                                                                    }
                                                                }}
                                                                disabled={product.remainingQuantity === 0} // Disable checkbox if out of stock
                                                            />
                                                        </td>
                                                        <td>{product.id}</td>
                                                        <td>
                                                            <img
                                                                src={product.product_variant.images[0]}
                                                                alt="product-image"
                                                                className="image-item"
                                                            />
                                                        </td>
                                                        <td>{product.product_variant.product.name}  {product.product_variant.product.brand}</td>
                                                        <td>
                                                            {product.product_variant.product_size.value}{" "}
                                                            {product.product_variant.product_size.unit}
                                                        </td>
                                                        <td>
                                                            {product.inputValue > 0 && product.stockItems.length > 0 ? (
                                                                <div>
                                                                    {product.stockItems
                                                                        .filter((stockItem) => stockItem.remaining >= product.inputValue)
                                                                        .map((selectedStockItem, index) => (
                                                                            <span key={index}>
                                                                                MRP: {selectedStockItem.mrp}
                                                                            </span>
                                                                        ))}
                                                                </div>
                                                            ) : null}
                                                        </td>
                                                        <td>
                                                            {product.inputValue > 0 && product.stockItems.length > 0 ? (
                                                                <div>
                                                                    {product.stockItems
                                                                        .filter((stockItem) => stockItem.remaining >= product.inputValue)
                                                                        .map((selectedStockItem, index) => (
                                                                            <span key={index}>
                                                                                Rate: {selectedStockItem.rate}
                                                                            </span>
                                                                        ))}
                                                                </div>
                                                            ) : null}
                                                        </td>


                                                        <td>
                                                            {product.remainingQuantity === 0 ? (
                                                                <span className='out-of-stock'>Out of Stock</span>
                                                            ) : (
                                                                <span>{product.remainingQuantity}</span>
                                                            )}
                                                        </td>


                                                        <td>
                                                            {product.orderQuantity === 0 ? (
                                                                <span className="out-of-stock">Out of Stock</span>
                                                            ) : (
                                                                <span>{product.orderQuantity}</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {product.remainingQuantity > 0 ? (
                                                                <div>
                                                                    <div key={product.id} className='action-buttons'>
                                                                        <div>
                                                                            <input
                                                                                type="number"
                                                                                value={inputValue[product.id] || ''}
                                                                                onChange={(e) => handleStoreInputChange(product, e)}
                                                                            />
                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            ) : (
                                                                <span className='out-of-stock'>Out of Stock</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {product.remainingQuantity > 0 ? (
                                                                <div className='action-buttons'>
                                                                    {inputValue[product.id] ? (
                                                                        <button onClick={() => handleStoreRemoveItemClick(product)} className='remove-btn'>Remove</button>
                                                                    ) : (
                                                                        <button onClick={() => handleStoreAddItemClick(product)} className='add-btn'>Add</button>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className='out-of-stock'>Out of Stock</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div className='pagination-section'>
                                            <Pagination
                                                productsPerPage={productsPerPage}
                                                totalProducts={productData.length} // Use the appropriate total here
                                                currentPage={currentPage}
                                                paginate={paginate}
                                                handlePreviousClick={handlePreviousClick}
                                                handleNextClick={handleNextClick}
                                                handleFirstClick={handleFirstClick}
                                                handleLastClick={handleLastClick}
                                            />
                                        </div>

                                    </div>
                                )}
                            </div>
                        )}
                        {isSearching && (
                            <div>
                                <table className="table-container">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Image</th>
                                            <th>Brand & Name</th>
                                            <th>Size</th>
                                            <th>MRP</th>
                                            <th>Rate</th>
                                            <th>Stock</th>
                                            <th>Required</th>
                                            <th>Quantity</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.slice(
                                            (currentPageSearch - 1) * productsPerPageSearch,
                                            currentPageSearch * productsPerPageSearch
                                        ).map((result) => (
                                            <tr key={result.id}>
                                                <td>{result.id}</td>
                                                <td>
                                                    <img
                                                        src={result.images[0]}
                                                        alt='product-image'
                                                        className='image-item'
                                                    />
                                                </td>
                                                <td>{result.product.brand} {result.product.name} </td>
                                                <td>
                                                    {result.product_size.value} {result.product_size.unit}
                                                </td>
                                                <td>Mrp</td>
                                                <td>Rate</td>
                                                <td>
                                                    {result.remainingQuantity === 0 ? (
                                                        <span className='out-of-stock'>Out of Stock</span>
                                                    ) : (
                                                        <span>{result.remainingQuantity}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {result.orderQuantity === 0 ? (
                                                        <span className='out-of-stock'>Out of Stock</span>
                                                    ) : (
                                                        <span>{result.orderQuantity}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {result.remainingQuantity > 0 && (
                                                        <div>
                                                            <div key={result.id} className='action-buttons'>
                                                                <div>
                                                                    <input
                                                                        type="number"
                                                                        value={inputValueSearch[result.id] || ''}
                                                                        onChange={(e) => handleSearchInputChange(result, e)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    {result.remainingQuantity > 0 && (
                                                        <div className='action-buttons'>
                                                            {inputValueSearch[result.id] ? (
                                                                <button onClick={() => handleSearchRemoveItemClick(result)} className='remove-btn'>REMOVE</button>
                                                            ) : (
                                                                <button onClick={() => handleSearchAddItemClick(result)} className='add-btn'>ADD</button>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>

                                </table>
                                <div className='pagination-section'>
                                    <Pagination
                                        productsPerPage={productsPerPageSearch}
                                        totalProducts={searchResults.length} // Use the appropriate total here
                                        currentPage={currentPageSearch}
                                        paginate={paginateSearch}
                                        handlePreviousClick={handlePreviousClickSearch}
                                        handleNextClick={handleNextClickSearch}
                                        handleFirstClick={handleFirstClickSearch}
                                        handleLastClick={handleLastClickSearch}
                                    />
                                </div>
                            </div>
                        )}


                    </Card>
                    <Card className='cart-section'>
                        {!isStoreAlloted ? (
                            <div className='cart-header-section'>
                                <div className='cart-headings'>
                                    <p>Cart products</p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {isLoading ? ( // Render loading indicator while data is being fetched
                                    <div className="loading-container">
                                        <h1>Loading Data.....</h1>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="export-buttons">
                                            <button onClick={exportAsPDF} className="export-btn">Export as PDF</button>
                                            <button onClick={exportAsExcel} className="export-btn">Export as Excel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className='table-container'>
                            {cartItems.length > 0 || searchCartItems.length > 0 ? (
                                <>
                                    <div className='place-order'>
                                        <button onClick={handlePlaceOrder}>Place order</button>
                                    </div>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Brand & Name</th>
                                                <th>Size</th>
                                                <th>MRP</th>
                                                <th>Rate</th>
                                                <th>Quantity</th>
                                                <th>Amount</th>
                                                <th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cartItems.map((item) => (
                                                <React.Fragment key={item.id}>
                                                    {item.stockItems.map((stockItem, index) => (
                                                        <tr key={`${item.id}-${index}`}>
                                                            <td>{item.id}</td>
                                                            <td>{item.name} {item.brand}</td>
                                                            <td>{item.productVariant.product_size.value} {item.productVariant.product_size.unit}</td>
                                                            <td>{stockItem.mrp}</td>
                                                            <td>{stockItem.rate}</td>
                                                            <td>{stockItem.remaining}</td>
                                                            <td>{stockItem.amount}</td>
                                                            <td>
                                                                <button onClick={() => handleStoreRemoveItemClick(item)} className='cart-remove-btn'><img src={del} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                            {searchCartItems.map((item) => (
                                                <React.Fragment key={item.id}>
                                                    {item.stockItems.map((stockItem, index) => (
                                                        <tr key={`${item.id}-${index}`}>
                                                            <td>{item.id}</td>
                                                            <td>{item.name} {item.brand}</td>
                                                            <td>{item.sizeValue} {item.sizeUnit}</td>
                                                            <td>{stockItem.mrp}</td>
                                                            <td>{stockItem.rate}</td>
                                                            <td>{stockItem.remaining}</td>
                                                            <td>{stockItem.amount}</td>
                                                            <td>
                                                                <button onClick={() => handleSearchRemoveItemClick(item)} className='cart-remove-btn'><img src={del} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colSpan="6">Total Amount:</td>
                                                <td>{getTotalAmount()}</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                </>
                            ) : (
                                <div className='no-items'>
                                    <p>Add items to cart...</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    );
}
export default StoreAllotment;
