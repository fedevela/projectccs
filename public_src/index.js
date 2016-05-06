'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import feathers from 'feathers/client';
import hooks from 'feathers-hooks';
import socketio from 'feathers-socketio/client';
import localstorage from 'feathers-localstorage';
import authentication from 'feathers-authentication/client';
import moment from 'moment';

import FlipMove from 'react-flip-move';

import PageHeader from 'react-bootstrap/lib/PageHeader';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from 'react-bootstrap/lib/Tabs';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import Button from 'react-bootstrap/lib/Button';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Grid from 'react-bootstrap/lib/Grid';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

const socket = io('http://localhost:3030/');

const app = feathers().configure(socketio(socket)).configure(hooks()).configure(authentication({storage: window.localStorage}));

// A placeholder image if the user does not have one
const PLACEHOLDER = 'https://placeimg.com/60/60/people';
// An anonymous user if the servicioRegistroVentas does not have that information
const dummyUser = {
  avatar: PLACEHOLDER,
  email: 'Anonymous'
};

const FormMessages = React.createClass({
  getInitialState() {
    return {value: ''};
  },

  //  getValidationState() {
  //    const length = this.state.value.length;
  //    if (length > 10)
  //      return 'success';
  //    else if (length > 5)
  //      return 'warning';
  //    else if (length > 0)
  //      return 'error';
  //    }
  //  ,

  handleChange(e) {
    this.setState({value: e.target.value});
  },

  sendMessage(ev) {
    // Get the messages service
    const messageService = app.service('messages');
    // Create a new message with the text from the input field
    messageService.create({text: this.state.value}).then(() => this.setState({value: ''}));

    ev.preventDefault();
  },

  render() {
    return (
      <form onSubmit={this.sendMessage}>
        {/*
        <FormGroup controlId="formMessages" validationState={this.getValidationState()}>
            */}
        <FormGroup controlId="formMessages">
          <ControlLabel>Mensaje</ControlLabel>

          <Grid>
            <Row>
              <Col xs={8} md={4}>
                <FormControl type="text" value={this.state.value} placeholder="Escribe tu mensaje..." onChange={this.handleChange}/>
              </Col>
              <Col xs={2} md={1}>
                <Button bsStyle="primary" type="submit">Enviar</Button>
              </Col>
            </Row>
          </Grid>
          {/*
          <HelpBlock>Validation is based on string length.</HelpBlock>
            */}
        </FormGroup>
      </form>
    );
  }
});

const MessageList = React.createClass({
  // Render a single message
  renderMessage(message) {
    const sender = message.sentBy || dummyUser;

    return <div key={message._id}>
      <img src={sender.avatar || PLACEHOLDER} alt={sender.email}/>
      <div>
        <p>
          <span>{sender.email}</span>
          <span>
            {moment(message.createdAt).format('MMM Do, hh:mm:ss')}
          </span>
        </p>
        <p>
          {message.text}
        </p>
      </div>
    </div>;
  },

  render() {
    return <div>
      {this.props.messages.map(this.renderMessage)}
    </div>;
  }
});

const ListaRankingUsuarios = React.createClass({
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
            {user.email}
            : {user.numeroDeClics}
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

  render() {
    return <Button onClick={this.logout} bsSize="small" bsStyle="warning">
      {/*
                  <Glyphicon glyph="close-circle" />
                  */}
      Cerrar
    </Button>
  }
});

const ChatApp = React.createClass({
  getInitialState() {
    return {users: [], registroVentas: [], messages: []};
  },

  componentDidUpdate: function() {
    //    const node = this.getDOMNode().querySelector('.chat');
    //    node.scrollTop = node.scrollHeight - node.clientHeight;
  },

  componentDidMount() {
    const userService = app.service('users');
    const messageService = app.service('messages');
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

    // Find the last 10 messages
    messageService.find({
      query: {
        $sort: {
          createdAt: -1
        },
        $limit: this.props.limit || 10
      }
    }).then(page => this.setState({messages: page.data.reverse()}));
    // Listen to newly created messages
    messageService.on('created', message => this.setState({messages: this.state.messages.concat(message)}));

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
        <ListaRankingUsuarios users={this.state.users}/>
      </Tab>
      <Tab eventKey={2} title="Mensajes">
        <MessageList messages={this.state.messages}/>
        <FormMessages/>
      </Tab>
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
  console.log(error.stack);
  console.error(error);
});
