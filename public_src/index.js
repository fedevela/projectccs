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

import FlipMove from 'react-flip-move';

import PageHeader from 'react-bootstrap/lib/PageHeader';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

const socket = io('http://localhost:3030/');

const app = feathers().configure(socketio(socket)).configure(hooks()).configure(authentication({storage: window.localStorage}));

var UserList = React.createClass({
  getInitialState() {
    //    return {text: new Date()};
    return {};
  },

  registrarVenta(ev) {
    app.service('servicioRegistroVentas').create(this.state);
    ev.preventDefault();
  },

  render() {
    const users = this.props.users;
    return <div>
      <header>
        <Button bsStyle="primary" onClick={this.registrarVenta}>
          Registrar Venta
        </Button>
      </header>
      <ListGroup componentClass="ul">
        <FlipMove>
            {users.map(user => <ListGroupItem key={user._id}>
                {user.email} : {user.numeroDeClics}
              Ventas
            </ListGroupItem>)}
        </FlipMove>
      </ListGroup>
    </div>;
  }
});

const LogoutButton = React.createClass({
  logout() {
    app.logout().then(() => window.location.href = '/login.html');
  },
    
    render(){
        return <Button onClick={this.logout} bsSize="small" bsStyle="warning">
                <Glyphicon glyph="close-circle" />
          Cerrar
        </Button>
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
    return <Tabs defaultActiveKey={1} id='mainTabs'>
      <Tab eventKey={1} title="Ranking">
        <UserList users={this.state.users}/>
      </Tab>
      <Tab eventKey={2} title="Tab 2">Tab 2 content</Tab>
      <Tab eventKey={3} title="Tab 3" disabled>Tab 3 content</Tab>
    </Tabs>
  }
});

app.authenticate().then(() => {
  ReactDOM.render(
    <div id="app">
    <PageHeader>
        Cardif CIMA<br/>
        <LogoutButton/>
    </PageHeader>
    <ChatApp/>
  </div>, document.querySelector('#mainAppContainer'));
}).catch(error => {
  if (error.code === 401) {
    window.location.href = '/login.html'
  }
  console.error(error);
});
