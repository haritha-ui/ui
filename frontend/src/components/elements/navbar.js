import { useContext } from "react";
import { NavLink, useHistory } from "react-router-dom";

import styles from "./navbar.module.css";
import ct_logo from "../../UI/images/CT.png";
import MainContext from "../../store/main_context";
import { UserContext } from "../../hooks/UserContext";

const Navbar = () => {
  let history = useHistory();
  const context = useContext(MainContext);
  const userContext = useContext(UserContext);

  const onLogoutHandler = (event) => {
    event.preventDefault();
    context.auth.logoutHandler();
    history.push("/");
  };

  return (
    <nav className={styles.navbar}>
      <ul>
        <li>
          <NavLink to="/homepage">
            <img src={ct_logo} alt="CT logo" className={styles.logo} />
          </NavLink>
        </li>

        <li>
          <NavLink activeClassName={styles.active} to="/homepage">
            Test Cases
          </NavLink>
        </li>

        <li>
          <NavLink activeClassName={styles.active} to="/jobspage">
            Test Runs
          </NavLink>
        </li>
        <li>
          <NavLink activeClassName={styles.active} to="/utilities">
            Utilities
          </NavLink>
        </li>
        <li>
          <NavLink to="#" className={styles.right}>
            {`User: ${userContext.user.name}`}
          </NavLink>
        </li>
      </ul>

      {/* <NavDropdown
        id="nav-dropdown-dark-example"
        title={`User: ${context.auth.user}`}
        menuVariant="dark"
        className={styles.right}
      >
        <NavDropdown.Divider />
        <NavDropdown.Item onClick={onLogoutHandler}>Logout</NavDropdown.Item>
      </NavDropdown> */}
    </nav>
  );
};

export default Navbar;
