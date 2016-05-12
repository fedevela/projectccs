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
var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
//var BarCharts = require('BarChart');
var Chart = require('react-google-charts').Chart;

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

    return <ListGroupItem key={message._id}>
        <div className="messageMetadata">{sender.email} :
            {moment(message.createdAt).format('MMM Do, hh:mm:ss')}
        </div>
        <div>
          {message.text}
        </div>
    </ListGroupItem>;
  },

  render() {
    return <ListGroup componentClass="ul">
              <FlipMove>
                {this.props.messages.map(message => this.renderMessage)}
              </FlipMove>
            </ListGroup>;
  }
});

const LogoutButton = React.createClass({
  logout() {
    app.logout().then(() => window.location.href = '/login.html');
  },

  render() {
    return <Button onClick={this.logout} bsSize="small" bsStyle="danger" id="LogoutButtonID">
      {/* @TODO hacer funcionar los Glyphicon
                  <Glyphicon glyph="close-circle" />
                  */}
      Cerrar
    </Button>
  }
});

const ChatApp = React.createClass({
  getInitialState() {
    return {
      users: [],
      messages: [],
      usuario: this.props.usuario,
      BarChartData: {
        chartType: 'BarChart',
        div_id: 'BarChart',
        options: {
          title: 'Registro de ventas',
          bar: {
            groupWidth: '100%'
          },
          legend: {position: 'none'},
          hAxis: {
            viewWindow: {
                min: 0
            },
            format: '0'
          }
        }
      }
    }
  },

  findMessagesTail: function() {
    const messageService = app.service('messages');
    messageService.find({
      query: {
        $sort: {
          createdAt: -1
        },
        $limit: this.props.limit || 10
      }
    }).then(page => this.setState({messages: page.data}));
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
          numVentasRegistradas: -1
        }
      }
    }).then(page => this.setState({users: page.data}));
    // Listen to new users so we can show them in real-time
    userService.on('created', user => this.setState({users: this.state.users.concat(user)}));

    // Find the last 10 messages
    this.findMessagesTail();
    // Listen to newly created messages
//    messageService.on('created', message => this.setState({messages: this.state.messages.concat(message)}));
    messageService.on('created', () => this.findMessagesTail());

    //    // Find the last 10 servicioRegistroVentas
    //    servicioRegistroVentas.find({
    //      query: {
    //        $sort: {
    //          createdAt: -1
    //        },
    //        $limit: this.props.limit || 10
    //      }
    //    }).then(page => this.setState({registroVentas: page.data.reverse()}));

    // Listen to newly created registroVentas
    servicioRegistroVentas.on('created', () => userService.find({
      query: {
        $sort: {
          numVentasRegistradas: -1
        }
      }
    }).then(page => {
      //        debugger;
      this.setState({users: page.data});
      for (var aUser of page.data) {
        if (aUser._id === this.state.usuario._id) {
          this.setState({usuario: aUser});
          //                debugger;
          break;
        }
      }
    }));
  },

  registrarVenta(ev) {
    app.service('servicioRegistroVentas').create({registroVentaTipo: "crear"});
    ev.preventDefault();
  },

  cancelarVenta(ev) {
    app.service('servicioRegistroVentas').create({registroVentaTipo: "cancelar"});
    ev.preventDefault();
  },

  render() {
    //      debugger;
    return <div id="app">
      <LogoutButton/>
      <PageHeader>
        Cardif CIMA
      </PageHeader>
      {this.state.usuario.email}
      : {this.state.usuario.numVentasRegistradas}
      ({this.state.usuario.numVentasCanceladas})
      <Tabs defaultActiveKey={1} id='mainTabs'>
        <Tab eventKey={1} title="Registro">
          <div>
            <header>
              <ButtonGroup vertical>
                <Button bsStyle="success" onClick={this.registrarVenta}>
                  + (Registrar Venta)
                </Button>
                <Button bsStyle="danger" onClick={this.cancelarVenta}>
                  - (Cancelar Venta)
                </Button>
              </ButtonGroup>
            </header>
            <Chart chartType={this.state.BarChartData.chartType} data={[
              [
                'Ventas',
                'Cantidad', {
                  role: 'style'
                }
              ],
              [
                'Registradas', this.state.usuario.numVentasRegistradas, 'green'
              ],
              ['Canceladas', this.state.usuario.numVentasCanceladas, '#ff1f00']
            ]} options={this.state.BarChartData.options} graph_id={this.state.BarChartData.div_id}/>
          </div>
        </Tab>
        <Tab eventKey={2} title="Ranking">
          <div>
            <header>
              <ButtonGroup vertical>
                <Button bsStyle="success" onClick={this.registrarVenta}>
                  + (Registrar Venta)
                </Button>
                <Button bsStyle="danger" onClick={this.cancelarVenta}>
                  - (Cancelar Venta)
                </Button>
              </ButtonGroup>
            </header>
            <ListGroup componentClass="ul">
              <FlipMove>
                {this.state.users.map(user => <ListGroupItem key={user._id}>
                  {user.email}
                  : {user.numVentasRegistradas}
                  ({user.numVentasCanceladas}) Ventas
                </ListGroupItem>)}
              </FlipMove>
            </ListGroup>
          </div>
        </Tab>
        <Tab eventKey={3} title="Chat">
          <FormMessages/>
          <MessageList messages={this.state.messages}/>
        </Tab>
        <Tab eventKey={4} title="Contenidos">
          Contenidos
        </Tab>
      </Tabs>
    </div>;
  }
});

app.authenticate().then((authResponse) => {
  //    debugger;
  ReactDOM.render(
    <ChatApp usuario={authResponse.data}/>, document.querySelector('#mainAppContainer'));
  //}).catch(error => {
  //  if (error.code === 401) {
  //    window.location.href = '/login.html'
  //  }
  //  console.log(error.stack);
  //  console.error(error);
});
