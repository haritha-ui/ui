import { Route, Redirect } from 'react-router-dom';
import React from 'react';
import PropTypes from 'prop-types';
import AuthenticationService from './services/authenticationService';
import { UserContext } from '../hooks/UserContext';

// This component routes to another component when its path prop matches the current URL, but before routing, asks for authentication. It must be used to request authentication to the components that you want to protect.
class Authentication extends Route {
  //Service to validate, generate and manage the Authentication
  static authenticationService = new AuthenticationService();
  //Context to be used to storage the user information through all the app
  static contextType = UserContext;

  static propTypes = {
    //This prop is used to specify the component that will be in charge of handling the response from w3id. This component's path prop must match with the redirect URI registered previously in the w3id SSO provisioner tool.
    isCallBack: PropTypes.bool,
  };

  static defaultProps = {
    //Default value for isCallBack prop, only use it for the callback component (redirection route)
    isCallBack: false,
  };

  //State for this component
  constructor(props) {
    super(props);
    this.state = {
      hasFinishedAuthentication: false,
    };
  }

  //Runs when the component is Loaded
  async componentDidMount() {
    if (this.props.isCallBack) {
      try {
        //Finishes the authentication process
        console.log('Finishing authentication...');
        await Authentication.authenticationService.completeAuthentication();
        this.setState({ hasFinishedAuthentication: true });
        //Sends the credentials to the context
        const userLogged = Authentication.authenticationService.getUser();
        const { setUserCredentials } = this.context;
        setUserCredentials(
          userLogged.access_token,
          userLogged.id_token,
          userLogged.expires_at,
          userLogged.profile.emailAddress,
          userLogged.profile.name,
          userLogged.profile.firstName,
          userLogged.profile.lastName
        );
      } catch (err) {
        console.error(err);
      }
    }
  }

  //Render the component in props or redirect to authentication process
  render() {
    let componentContent;
    if (!this.props.isCallBack) {
      if (Authentication.authenticationService.isLoggedIn()) {
        componentContent = super.render();
      } else {
        Authentication.authenticationService.setOriginalUrl(
          window.location.pathname
        );
        Authentication.authenticationService.startAuthentication();
        componentContent = null;
      }
    } else {
      componentContent = this.state.hasFinishedAuthentication ? (
        <Redirect to={Authentication.authenticationService.getOriginalUrl()} />
      ) : (
        super.render()
      );
    }
    return componentContent;
  }
}

export default Authentication;
