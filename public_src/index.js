'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import Component from './Component';

import io from 'socket.io-client';
import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import socketio from 'feathers-socketio/client';
import localstorage from 'feathers-localstorage';
import authentication from 'feathers-authentication/client';
import PageHeader from 'react-bootstrap/lib/PageHeader';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';

const socket = io('http://localhost:3030/');



const app = feathers()
        .configure(socketio(socket))
        .configure(hooks())
        .configure(authentication({storage: window.localStorage}));

var UserList = React.createClass({
  getInitialState() {
//    return {text: new Date()};
    return {};
  },
  logout() {
    app.logout().then(() => window.location.href = '/login.html');
  },

  registrarVenta(ev) {
    //  	  console.log("registrando venta 1");
    app.service('servicioRegistroVentas').create(this.state);
    //    	  console.log("registrando venta 2");

//    this.setState({text: new Date()});
    //    	  console.log("registrando venta 3");
    ev.preventDefault();
    //    renderComponent();
    //this.forceUpdate();
    //  console.log("vamos");
  },

  render() {
    const users = this.props.users;
    return <div>
      <header>
            <h4>
          <span>{users.length}</span>
          users
        </h4>
      </header>
      <ListGroup componentClass="ul">
        {users.map(user =>
          <ListGroupItem key={user._id}>
          <img src={user.avatar || PLACEHOLDER} className="avatar"/> {user.email} : {user.numeroDeClics} Ventas
          </ListGroupItem>
        )}
      </ListGroup>
      <footer>
          <Button
              bsStyle="primary"
              onClick={this.registrarVenta}>
              Registrar Venta
            </Button>
      </footer>
    </div>;
  }
});


const ChatApp = React.createClass({
  getInitialState() {
    return {users: [], registroVentas: []};
  },

  componentDidUpdate: function() {
    //    const node = this.getDOMNode().querySelector('.chat');
    //    node.scrollTop = node.scrollHeight - node.clientHeight;
  },

  componentDidMount() {
    const userService = app.service('users');
    const servicioRegistroVentas = app.service('servicioRegistroVentas');

    // Find all users initially
    userService.find({
      query: {
        $sort: {
          numeroDeClics: -1
        }
      }
    }).then(page => this.setState({users: page.data}));
    // Listen to new users so we can show them in real-time
    userService.on('created', user => this.setState({users: this.state.users.concat(user)}));

    // Find the last 10 servicioRegistroVentas
    servicioRegistroVentas.find({
      query: {
        $sort: {
          createdAt: -1
        },
        $limit: this.props.limit || 10
      }
    }).then(page => this.setState({registroVentas: page.data.reverse()}));


    // Listen to newly created registroVentas
    servicioRegistroVentas.on('created', () => userService.find({
      query: {
        $sort: {
          numeroDeClics: -1
        }
      }
    }).then(page => this.setState({users: page.data})));
  },
  
  render() {
    return <div id="userlist">
    <UserList users={this.state.users}/>
    <Tabs defaultActiveKey={1} id="uncontrolled-tab-example"></Tabs>
  </div>
  
    {/*
    <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
    <ReactBootstrap.Tab eventKey={1} title="Tablero de Posiciones">
    </ReactBootstrap.Tab>
    <ReactBootstrap.Tab eventKey={2} title="Tab 2">Tab 2 content</ReactBootstrap.Tab>
    <ReactBootstrap.Tab eventKey={3} title="Tab 3" disabled>Tab 3 content</ReactBootstrap.Tab>
  </Tabs>
  */}
  }
});

app.authenticate().then(() => {
  ReactDOM.render(
    <div id="app">
        <PageHeader>Cardif CIMA<br/><small>Eslogan</small></PageHeader>
        <ChatApp/>
  </div>
  , document.querySelector('#mainAppContainer'));
}).catch(error => {
  if (error.code === 401) {
    window.location.href = '/login.html'
  }
  console.error(error);
});
//window.onload = () => {
//  ReactDOM.render(
//    <Component />,
//    document.querySelector('#container')
//  );
//};
