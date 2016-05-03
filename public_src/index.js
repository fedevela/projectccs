import React from 'react';
import ReactDOM from 'react-dom';
import Component from './Component';
import io from 'socket.io-client';
// Establish a Socket.io connection
const socket = io();

window.onload = () => {
  ReactDOM.render(
    <Component />,
    document.querySelector('#container')
  );
};
