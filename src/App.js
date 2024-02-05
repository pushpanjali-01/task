import React from 'react';
import './App.css';
import ProductList from '../src/modules/productlist/index';
import Employee from './modules/employee';
import OrderDetailsPage from './modules/orderdetails';
import Api from './modules/sample';
import MyComponent from './modules/sample';
import MakeOrder from './modules/make-order';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CartItems from './modules/cartitems';
import Allotment from './modules/allotment';
import VerifiedProducts from './modules/verified-products';
import DealerAllotmentStock from './modules/dealerallotmentstock';
import VerifiedProductsList from './modules/verified-product-list';
import StoreAllotment from './modules/store-allotment';
import BannerManagement from './modules/banner-create';
import Frame from './modules/frame';
import BannerList from './modules/banner-list';
import BannerCreate from './modules/banner-create';
import BannerUpdate from './modules/banner-update';
import StockData from './modules/stockData';
import PaginationExample from './modules/stockData';

const App = () => {
  return (
    <div className="App">
      {/* <ProductList /> */}
      {/* <Employee/> */}
      {/* <OrderDetailsPage/> */}
      {/* <MyComponent/> */}
      {/* <ProductSearch /> */}      
      {/* <Routes>
        <Route path='/' element={<MakeOrder/>}/>
        <Route path='/make-order' element={<MakeOrder/>}/>
        <Route path="/cartitems" element={<CartItems />} />
      </Routes> */}
      {/* <Allotment/> */}
      {/* <VerifiedProducts/> */}
      {/* <VerifiedProductsList/> */}
      {/* <DealerAllotmentStock/> */}
      {/* <StoreAllotment/> */}
      {/* <Routes>
        <Route path='/' element={<BannerManagement/>}/>
        <Route path="/updatebanner" element={<UpdateBanner />} />
      </Routes> */}
      {/* <Frame/> */}
       {/* <BannerCreate/>    */}
      {/* <BannerList/> */}
      {/* <BannerUpdate/> */}
      {/* <Routes>
        <Route path='/' element={<BannerList/>}/>
        <Route path='/banner-create' element={<BannerCreate/>}/>
        <Route path='/banner-update' element={<BannerUpdate />} />
      </Routes> */}
      <PaginationExample/>
    </div>
  );
}
export default App;


