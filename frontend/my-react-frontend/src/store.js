// src/store.js
import { createStore, combineReducers } from 'redux';
import userReducer from './userReducer';
// import other reducers

const rootReducer = combineReducers({
  user: userReducer,
  // other reducers
});

const store = createStore(rootReducer);

export default store;
