// src/reducers/userReducer.js

import { SET_USER_INFO } from './userActions';

const initialState = {
  userInfo: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return {
        ...state,
        userInfo: action.payload,
      };
    default:
      return state;
  }
};

export default userReducer;
