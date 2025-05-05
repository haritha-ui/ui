import { UserManager } from 'oidc-client';
// Import the authentication method from oidcAuthenticationConfigurations
import { authenticationTokenConfiguration } from '../configurations/oidcAuthenticationConfigurations';

function getOidcSettings() {
  //return authenticationIdTokenConfiguration; //Uncomment this line if you want to use id_token response type.
  return authenticationTokenConfiguration; //Uncomment this line if you want to use token response type.
}

class AuthenticationService {
  userManager = null;
  user = null;
  ORIGINAL_URL_COOKIE = 'originalUrl';

  constructor() {
    this.userManager = new UserManager(getOidcSettings());
    this.initializeUser();
  }

  async initializeUser() {
    this.user = await this.userManager.getUser();
  }

  /**
   * Get the previously authenticated user's info.
   * @returns {Object} An object object with user's info.
   */
  getUser() {
    return this.user;
  }

  /**
   * Validates if the user has been previously authenticated successfully.
   *
   * @returns {boolean} true, if the user has been authenticated successfully  and if the user's session hasn't expired yet,
   * otherwise false.
   */
  isLoggedIn() {
    return this.user != null && !this.user.expired;
  }

  /**
   * Returns the user's information.
   *
   * @returns {(Object | null)} An object with user's information only when it's being used id_token as response type, otherwise null
   * will be returned.
   */
  getClaims() {
    return this.user.profile;
  }

  /**
   * Returns authorization header value.
   *
   * @returns {(string | null)} A string representation of authorization header value only when it's being used token as response type, otherwise null
   * will be returned.
   */
  getAuthorizationHeaderValue() {
    return `${this.user.token_type} ${this.user.access_token}`;
  }

  /**
   * Begins the authentication process, this method redirects to w3id login page.
   */
  startAuthentication() {
    return this.userManager.signinRedirect();
  }

  /**
   * Finishes the authentication process, this method must be called once w3id redirects to the registered callback url, in order to save the user data.
   */
  async completeAuthentication() {
    this.user = await this.userManager.signinRedirectCallback();
  }

  /**
   * This method is used to store the original url that the user requested before being redirected to w3id login page, and
   * navigate to it once authentication finishes.
   *
   * @param originalUrl The original endpoint that the user requested before being redirected to w3id login page.
   */
  setOriginalUrl(originalUrl) {
    localStorage.setItem(this.ORIGINAL_URL_COOKIE, originalUrl);
  }

  /**
   * This method is useful after {@link this.completeAuthentication} method is called, in order to get the
   * url that the user requested before being redirected to w3id login page, and then, get the user redirected to
   * it.
   */
  getOriginalUrl() {
    return localStorage.getItem(this.ORIGINAL_URL_COOKIE);
  }
}

export default AuthenticationService;
