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

const ComposeRegistroVentas = React.createClass({
  getInitialState() {
    return {text: ''};
  },

  updateText(ev) {
    this.setState({text: ev.target.value});
  },

  sendRegistroVentas(ev) {
    app.service('servicioRegistroVentas').create(this.state).then(() => this.setState({text: ''}))
    ev.preventDefault();
  },

  render() {
    return <form className="flex flex-row flex-space-between" onSubmit={this.sendRegistroVentas}>
      {/*
        <input type="text" name="text" className="flex flex-1"
        value={this.state.text} onChange={this.updateText} />
      */}
      <button className="button-primary" type="submit">Send</button>
    </form>;
  }
});

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
      <header className="flex flex-row flex-center">
        <h4 className="font-300 text-center">
          <span className="font-600 online-count">{users.length}</span>
          users
        </h4>
      </header>

      <ul className="flex flex-column flex-1 list-unstyled user-list">
        {users.map(user => <li>
          <a className="block relative" href="#">
            <img src={user.avatar || PLACEHOLDER} className="avatar"/>
            <span className="absolute username noBreakClass">{user.numeroDeClics}
              - {user.email}</span>
          </a>
        </li>)}
      </ul>
      <footer className="flex flex-row flex-center">
        {/*<a href="#" className="logout button button-primary" onClick={this.logout}>Sign Out</a>*/}
        <form className="flex flex-row flex-space-between" onSubmit={this.registrarVenta}>
          <button className="button-primary" type="submit">Send</button>
        </form>
      </footer>
    </div>;
  }
});

const RegistroVentasList = React.createClass({
  renderRegistroVenta(registroVenta) {
    const sender = typeof registroVenta.sentBy === 'object'
      ? registroVenta.sentBy
      : dummyUser;

    return <div className="message flex flex-row">
      <img src={sender.avatar || PLACEHOLDER} alt={sender.email} className="avatar"/>
      <div className="message-wrapper">
        <p className="message-header">
          <span className="username font-600">{sender.email}</span>
          <span className="sent-date font-300">
            {moment(registroVenta.createdAt).format('MMM Do, hh:mm:ss')}
          </span>
        </p>
        <p className="message-content font-300">
          {registroVenta.text}
        </p>
      </div>
    </div>;
  },

  render() {
    return <main className="chat flex flex-column flex-1 clear">
      {this.props.registroVentas.map(this.renderRegistroVenta)}
    </main>;
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
    return <div id="userListDiv" className="flex flex-row flex-1 clear">
      <UserList users={this.state.users}/>
    </div>
  }
});

app.authenticate().then(() => {
  ReactDOM.render(
    <div id="app" className="flex flex-column">
    <header className="title-bar flex flex-row flex-center">
      <div className="title-wrapper block center-element">
        <img className="logo" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers Logo"/>
        <span className="title">Chat</span>
      </div>
    </header>

    <ChatApp/>
  </div>, document.body);
}).catch(error => {
  if (error.code === 401) {
    window.location.href = '/login.html'
  }

  console.error(error);
});
