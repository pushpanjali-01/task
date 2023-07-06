import React from 'react';
import axios from 'axios';

const MyComponent = () => {
  const url = 'https://api.grozep.com/v1/in/scanners/tasks';
  const orderId = 297633;
  const status = 'packed';
  const employeeId = 13;

  const handleClick = () => {
    axios({
      method: 'put',
      url: url,
      params: {
        orderid: orderId,
        status: status,
        employeeld: employeeId
      }
    })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <div>
      <button onClick={handleClick}>Click Me</button>
    </div>
  );
};

export default MyComponent;
