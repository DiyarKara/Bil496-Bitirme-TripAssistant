// src/actions/userActions.js

// Action Type
export const SET_USER_INFO = 'SET_USER_INFO';

// Action Creator
export const setUserInfo = (userInfo) => ({
  type: SET_USER_INFO,
  payload: userInfo,
});
