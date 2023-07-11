// actions.js
export const addToCart = (item, quantity) => {
    return {
      type: 'ADD_TO_CART',
      payload: { item, quantity },
    };
  };
  
  export const removeFromCart = (item) => {
    return {
      type: 'REMOVE_FROM_CART',
      payload: item,
    };
  };
  