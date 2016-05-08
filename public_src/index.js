'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var io = require('socket.io-client');
var feathers = require('feathers/client');
var hooks = require('feathers-hooks');
var socketio = require('feathers-socketio/client');
var localstorage = require('feathers-localstorage');
var authentication = require('feathers-authentication/client');
var moment = require('moment');

var FlipMove = require('react-flip-move');

var PageHeader = require('react-bootstrap/lib/PageHeader');
var Tab = require('react-bootstrap/lib/Tab');
var Tabs = require('react-bootstrap/lib/Tabs');
var ListGroup = require('react-bootstrap/lib/ListGroup');
var FormGroup = require('react-bootstrap/lib/FormGroup');
var FormControl = require('react-bootstrap/lib/FormControl');
var ListGroupItem = require('react-bootstrap/lib/ListGroupItem');
var Button = require('react-bootstrap/lib/Button');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var BarCharts = require('BarChart');

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
      <Tab eventKey={1} title="Registro">
        <BarCharts/>
      </Tab>
      <Tab eventKey={2} title="Ranking">
        <ListaRankingUsuarios users={this.state.users}/>
      </Tab>
      <Tab eventKey={2} title="Chat">
        <MessageList messages={this.state.messages}/>
        <FormMessages/>
      </Tab>
      <Tab eventKey={3} title="Contenidos">
        Contenidos
      </Tab>
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
//}).catch(error => {
//  if (error.code === 401) {
//    window.location.href = '/login.html'
//  }
//  console.log(error.stack);
//  console.error(error);
});
