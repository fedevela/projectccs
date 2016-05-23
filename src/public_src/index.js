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
//var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var ControlLabel = require('react-bootstrap/lib/ControlLabel');
var Grid = require('react-bootstrap/lib/Grid');
var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
//var BarCharts = require('BarChart');
var Chart = require('react-google-charts').Chart;

const socket = io('https://cardif-workspace-fedevela.c9users.io/');

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
    </Button>;
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
          legend: {
            position: 'none'
          },
          hAxis: {
            viewWindow: {
              min: 0
            },
            format: '0'
          }
        }
      },
      GaugeChartData: {
        chartType: 'Gauge',
        div_id: 'GaugeChart'
      }
    }
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
        },
        $limit: -1
      }
    }).then(page => {
//      debugger;
      this.setState({users: page.data});
    });

    // Listen to new users so we can show them in real-time    
    userService.on('created', () => userService.find({
      query: {
        $sort: {
          numVentasRegistradas: -1
        },
        $limit: -1
      }
    }).then(page => {
      this.setState({users: page.data});
      for (var aUser of page.data) {
        if (aUser._id === this.state.usuario._id) {
          this.setState({usuario: aUser});
          //                debugger;
          break;
        }
      }
    }));

    // Find the last 10 messages
    messageService.find({
      query: {
        $sort: {
          createdAt: -1
        },
        $limit: this.props.limit || 25
      }
    }).then(page => this.setState({messages: page.data.reverse()}));
    // Listen to newly created messages
    //    messageService.on('created', message => this.setState({messages: this.state.messages.concat(message)}));
    messageService.on('created', () => messageService.find({
      query: {
        $sort: {
          createdAt: -1
        },
        $limit: this.props.limit || 25
      }
    }).then(page => this.setState({messages: page.data.reverse()})));

    // Listen to newly created registroVentas
    servicioRegistroVentas.on('created', () => userService.find({
      query: {
        $sort: {
          numVentasRegistradas: -1
        },
        $limit: -1
      }
    }).then(page => {
//              debugger;
      this.setState({users: page.data});
      for (var aUser of page.data) {
        if (aUser._id === this.state.usuario._id) {
          this.setState({usuario: aUser});
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
      <Tabs defaultActiveKey={2} id='mainTabs'>
        <Tab eventKey={1} title="Registro">
          <div>
            <header>
              <ButtonGroup>
                <Button bsStyle="danger" onClick={this.cancelarVenta}>
                  - (Cancelar Venta)
                </Button>
                <Button bsStyle="success" onClick={this.registrarVenta}>
                  + (Registrar Venta)
                </Button>
              </ButtonGroup>
            </header>
            <img src="img/gauge.png"/>
            <Chart chartType={this.state.GaugeChartData.chartType} data={[
              [
                'Label', 'Value'
              ],
              [
                'Memory', 80
              ],
              [
                'CPU', 55
              ],
              ['Network', 68]
            ]} options={this.state.GaugeChartData.options} graph_id={this.state.GaugeChartData.div_id}/>

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
              <ButtonGroup>
                <Button bsStyle="danger" onClick={this.cancelarVenta}>
                  - (Cancelar Venta)
                </Button>
                <Button bsStyle="success" onClick={this.registrarVenta}>
                  + (Registrar Venta)
                </Button>
              </ButtonGroup>
            </header>
            <ListGroup componentClass="ul">
              <FlipMove
                duration={1000}>
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
          <ButtonGroup>
            <Button>
              General
            </Button>
            <Button>
              Tips de Ventas
            </Button>
            <Button>
              Campañas
            </Button>
            <Button>
              Sucursal
            </Button>
          </ButtonGroup>
          
          
          
      <main className="chat flex flex-column flex-1 clear">
              <FlipMove>
        {this.state.messages.map(message =>
          <div className="message flex flex-row" key={message._id}>
      <img src={message.sentBy.profileImg} alt={message.sentBy.email} className="avatar" />
      <div className="message-wrapper">
        <p className="message-header">
          <span className="username font-600">{message.sentBy.email}</span>
          <span className="sent-date font-300">
            {moment(message.createdAt).format('MMM Do, hh:mm:ss')}
          </span>
        </p>
        <p className="message-content font-300">
          {message.text}
        </p>
      </div>
    </div>
        )}
    </FlipMove>
    </main>

      
    

          
  
          <footer>
            <FormMessages/>
          </footer>
        </Tab>
        <Tab eventKey={4} title="Contenidos">
          Contenidos:
          <ListGroup componentClass="ul">
            <ListGroupItem>
              <a href="https://www.bnpparibascardif.com/documents/583427/809429/Pr%C3%A9sentation+investisseurs/7aacd782-5876-48c6-96c3-8ea95f2cd27c">
                <img src="img/Mimetypes-application-pdf-icon.png"/>
                Documento PDF AAA
              </a>
            </ListGroupItem>
            <ListGroupItem>
              <a href="https://www.youtube.com/watch?v=Egj6hvtU_VE">
                <img src="img/Web-Youtube-alt-2-Metro-icon.png"/>
                Video YouTube AAA
              </a>
            </ListGroupItem>
            <ListGroupItem>
              <a href="https://www.bnpparibascardif.com/documents/583427/809429/Pr%C3%A9sentation+investisseurs/7aacd782-5876-48c6-96c3-8ea95f2cd27c">
                <img src="img/Mimetypes-application-pdf-icon.png"/>
                Documento PDF BBB
              </a>
            </ListGroupItem>
            <ListGroupItem>
              <a href="https://www.bnpparibascardif.com/documents/583427/809429/Pr%C3%A9sentation+investisseurs/7aacd782-5876-48c6-96c3-8ea95f2cd27c">
                <img src="img/Mimetypes-application-pdf-icon.png"/>
                Documento PDF CCC
              </a>
            </ListGroupItem>
            <ListGroupItem>
              <a href="https://www.youtube.com/watch?v=Egj6hvtU_VE">
                <img src="img/Web-Youtube-alt-2-Metro-icon.png"/>
                Video YouTube BBB
              </a>
            </ListGroupItem>
          </ListGroup>
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
