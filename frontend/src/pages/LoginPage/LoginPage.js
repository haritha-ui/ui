import { Alert, Button } from "react-bootstrap";
import React, { useRef, useContext, useState } from "react";
import { useHistory } from "react-router-dom";

import classes from "./LoginPage.module.css";
import MainContext from "../../store/main_context";

const LoginPage = () => {
  /* const [isLogin, setIsLogin] = useState(true); */
  const userRef = useRef();
  const pwdRef = useRef();
  const history = useHistory();
  const context = useContext(MainContext);
  const [showAlert, setShowAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  }; */

  const submitHandler = async (event) => {
    event.preventDefault();
    const user = userRef.current.value;
    const pwd = pwdRef.current.value;

    setIsSubmitting((ps) => true);
    try {
      const resp = await fetch(`${context.MAIN_URI}/ui_server/api/token`, {
        method: "POST",
        body: JSON.stringify({
          username: user,
          password: pwd,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!resp.ok) {
        const data = await resp.json();
        console.log(data);
        throw new Error("Failed to login: " + data);
      }
      const data = await resp.json();
      context.auth.loginHandler(data.access, data.refresh);
      history.replace("/homepage");
    } catch (error) {
      console.log(error.message);
      setShowAlert((ps) => true);
      setIsSubmitting((ps) => false);
      setTimeout(() => setShowAlert(ps => false), 5000);
    }
  };

  return (
    <React.Fragment>
      {showAlert && (
        <Alert
          variant="danger"
          onClose={() => setShowAlert((ps) => false)}
          dismissible
        >
          <Alert.Heading>Login Error!</Alert.Heading>
          <p>Invalid credentials provided. Failed to login</p>
        </Alert>
      )}
      <section className={classes.auth}>
        {/* <h1>{isLogin ? "Login" : "Sign Up"}</h1> */}
        <h2>HST:CT Login</h2>
        <form onSubmit={submitHandler}>
          <div className={classes.control}>
            <label htmlFor="username">Your Username</label>
            <input type="text" id="username" ref={userRef} required />
          </div>
          <div className={classes.control}>
            <label htmlFor="password">Your Password</label>
            <input type="password" id="password" ref={pwdRef} required />
          </div>
          <div className={classes.actions}>
            {/* <button>Login</button> */}
            <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
              >
                {isSubmitting ? "Submitting.." : "Login"}
              </Button>
          </div>
          {/* <div className={classes.actions}>
          <button>{isLogin ? "Login" : "Create Account"}</button>
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div> */}
        </form>
      </section>
    </React.Fragment>
  );
};

export default LoginPage;
