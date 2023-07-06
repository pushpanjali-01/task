import React from 'react';
import './App.css';
import ProductList from '../src/modules/productlist/index';
import Employee from './modules/employee';
import OrderDetailsPage from './modules/orderdetails';
import Api from './modules/sample';
import MyComponent from './modules/sample';

function App() {
  return (
    <div className="App">
      {/* <ProductList /> */}
      {/* <Employee/> */}
      <OrderDetailsPage/>
      {/* <MyComponent/> */}
    </div>
  );
}

export default App;
