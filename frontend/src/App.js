import { Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Switch } from "react-router-dom";
import React, { Suspense, useContext } from "react";

import MainContext from "./store/main_context";
import Navbar from "./components/elements/navbar";
import Authentication from "./authentication/Authentication";

// Lazy loading pages
const HomePage = React.lazy(() => import("./pages/HomePage/HomePage"));
const JobsPage = React.lazy(() => import("./pages/JobsPage/JobsPage"));
const LoginPage = React.lazy(() => import("./pages/LoginPage/LoginPage"));
const UtilitiesPage = React.lazy(() =>
  import("./pages/UtilitiesPage/UtilitiesPage")
);
function App() {
  const context = useContext(MainContext);

  return (
    <React.Fragment>
      <Navbar />
      <Suspense fallback={<div>Loading page...</div>}>
        <Switch>
          <Authentication
            path="/"
            exact
            isCallBack={false}
            component={HomePage}
          />
          <Authentication
            path="/homepage"
            isCallBack={false}
            component={HomePage}
          />
          <Authentication
            path="/jobspage"
            isCallBack={false}
            component={JobsPage}
          />
          <Authentication
            path="/loginpage"
            isCallBack={true}
            component={LoginPage}
          />
          <Authentication
            path="/utilities"
            isCallBack={false}
            component={UtilitiesPage}
          />
          {/* <Route path="/utilities">
            <UtilitiesPage />
          </Route> */}
          <Route path="*">
            <Alert variant="danger">
              <Alert.Heading as="h1">404: Page not found</Alert.Heading>
              <p>
                This is not the page you are looking for.{" "}
                <Alert.Link href="/">Click</Alert.Link> for home page
              </p>
            </Alert>
          </Route>
        </Switch>
      </Suspense>
    </React.Fragment>
  );
}

export default App;
