// A placeholder image if the user does not have one
const PLACEHOLDER = 'https://placeimg.com/60/60/people';
// An anonymous user if the servicioRegistroVentas does not have that information
const dummyUser = {
  avatar: PLACEHOLDER,
  email: 'Anonymous'
};

// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const app = feathers().configure(feathers.socketio(socket)).configure(feathers.hooks())
// Use localStorage to store our login token
  .configure(feathers.authentication({storage: window.localStorage}));

const UserList = React.createClass({
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
      <ReactBootstrap.ListGroup componentClass="ul">
        {users.map(user =>
          <ReactBootstrap.ListGroupItem>
          <img src={user.avatar || PLACEHOLDER} className="avatar"/> {user.email}:{user.numeroDeClics}
          </ReactBootstrap.ListGroupItem>
        )}
      </ReactBootstrap.ListGroup>
      <footer>
          <ReactBootstrap.Button
              bsStyle="primary"
              onClick={this.registrarVenta}>
              Registrar Venta
            </ReactBootstrap.Button>
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
    return  <ReactBootstrap.Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
    <ReactBootstrap.Tab eventKey={1} title="Tablero de Posiciones">
      <UserList users={this.state.users}/>
    </ReactBootstrap.Tab>
    <ReactBootstrap.Tab eventKey={2} title="Tab 2">Tab 2 content</ReactBootstrap.Tab>
    <ReactBootstrap.Tab eventKey={3} title="Tab 3" disabled>Tab 3 content</ReactBootstrap.Tab>
  </ReactBootstrap.Tabs>
  }
});

app.authenticate().then(() => {
  ReactDOM.render(
    <div id="app">
    <ReactBootstrap.PageHeader>Cardif CIMA<br/><small>Eslogan</small></ReactBootstrap.PageHeader>
    <ChatApp/>
  </div>
  , document.body);
}).catch(error => {
  if (error.code === 401) {
    window.location.href = '/login.html'
  }

  console.error(error);
});
