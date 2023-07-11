// reducers.js
const initialState = {
    cartItems: [],
  };
  
  const cartReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'ADD_TO_CART':
        const updatedCartItems = [...state.cartItems];
        const existingCartItemIndex = updatedCartItems.findIndex(
          (cartItem) => cartItem.item.id === action.payload.item.id
        );
  
        if (existingCartItemIndex !== -1) {
          // Item already exists in the cart, update the quantity
          updatedCartItems[existingCartItemIndex].quantity += action.payload.quantity;
        } else {
          // Item does not exist in the cart, add it
          updatedCartItems.push({
            item: action.payload.item,
            quantity: action.payload.quantity,
          });
        }
  
        return {
          ...state,
          cartItems: updatedCartItems,
        };
  
      case 'REMOVE_FROM_CART':
        const filteredCartItems = state.cartItems.filter(
          (cartItem) => cartItem.item.id !== action.payload.id
        );
  
        return {
          ...state,
          cartItems: filteredCartItems,
        };
  
      default:
        return state;
    }
  };
  
  export default cartReducer;
  