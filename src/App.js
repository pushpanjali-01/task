import React from 'react';
import './App.css';
import ProductList from '../src/modules/productlist/index';
import Employee from './modules/employee';
import OrderDetailsPage from './modules/orderdetails';
import Api from './modules/sample';
import MyComponent from './modules/sample';
import ProductSearch from './modules/Cart';
import { BrowserRouter, Route, Router, Routes,Switch } from 'react-router-dom';
import CartItems from './modules/cartitems';
import Allotment from './modules/allotment';
import VerifiedProducts from './modules/verified-products';
import DealerAllotmentStock from './modules/dealerallotmentstock';
import VerifiedProductsList from './modules/verified-product-list';
import StoreAllotment from './modules/store-allotment';

const App = () => {
  return (
    <div className="App">
      {/* <ProductList /> */}
      {/* <Employee/> */}
      {/* <OrderDetailsPage/> */}
      {/* <MyComponent/> */}
      {/* <ProductSearch /> */}
      {/* <Routes>
        <Route path='/' element={<ProductSearch/>}/>
        <Route path="/cartitems" element={<CartItems />} />
      </Routes> */}
      {/* <Allotment/> */}
      {/* <VerifiedProducts/> */}
      {/* <VerifiedProductsList/> */}
      {/* <DealerAllotmentStock/> */}
      <StoreAllotment/>
    
    </div>
  );
}
export default App;


