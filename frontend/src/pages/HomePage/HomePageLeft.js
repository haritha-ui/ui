import React, { useContext, useCallback, useState, useEffect } from "react";
import {
  Accordion,
  ListGroup,
  Row,
  Col,
  Card,
  Placeholder,
  Button,
  Offcanvas,
  Form,
} from "react-bootstrap";
import MainContext from "../../store/main_context";

import styles from "../../UI/pages.module.css";
import styles_bs from "./HomePageLeft.module.css";
import { UserContext } from "../../hooks/UserContext";
import filter_logo from "../../UI/images/filter_3.png";

/* const h6_style = {
  textAlign: "center",
  backgroundColor: "rgb(174 192 156)",
  padding: "1rem",
};
 */

const HomePageLeft = () => {
  const context = useContext(MainContext);
  const userContext = useContext(UserContext);
  const [testData, setTestData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);

  //Store selected test directory
  let testDirVal = "";
  const onTestDirClickHandler = (event) => {
    event.preventDefault();
    testDirVal = event.target.innerHTML;
  };

  // Fetch YAML data to display on selection of particular YAML entry
  const onYAMLClickHandler = (event) => {
    event.preventDefault();
    context.homeRight.setIsLoading(() => true);
    context.homeRight.selectedLink = [testDirVal, event.target.innerHTML];
    fetchYAMLData(testDirVal, event.target.innerHTML);
  };

  // Create list of YAML test cases as a group for each directory
  const TestCaseList = (files, main_indx, parent_val) =>
    files.map((file_name, indx) => (
      <ListGroup.Item
        action
        variant="light"
        key={indx}
        parent={parent_val}
        main_key={main_indx}
        onClick={onYAMLClickHandler}
      >
        {file_name}
      </ListGroup.Item>
    ));

  // Fetch all available Robot test directories and their internal YAML input files
  const fetchTestDirData = useCallback(
    async (typeTest = null, typeTestVal = null) => {
      setIsLoading(() => true);
      setError(null);
      let url = `${context.MAIN_URI}/ui_server/list_test_dir`;
      if (typeTest !== null && typeTestVal !== null) {
        url += `?type=${typeTest}&value=${typeTestVal}`;
      }

      const fetchObject = {
        headers: {
          Authorization: `Bearer ${userContext.user.tokenId}`,
          User: userContext.user.name,
          Mail: userContext.user.email,
          FirstName: userContext.user.firstName,
          LastName: userContext.user.lastName
        },
      };
      try {
        const response = await fetch(url, fetchObject);
        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to fetch test dir data!");
        }
        const result = await response.json();
        setTestData((prevState) => result);
      } catch (error) {
        setError(error.message + "No results found");
      }
      setIsLoading(() => false);
    },
    [context.MAIN_URI]
  );

  // Fetch YAML data info from backend
  const fetchYAMLData = useCallback(
    async (testDir, yamlFile) => {
      try {
        var data_type_needed = Object.keys(context.homeRight.inputData).length === 0 ? true:false;
        const url = `${context.MAIN_URI}/ui_server/fetch_yaml_data/${testDir}/${yamlFile}?get_input_type=${data_type_needed}`;
        const fetchObject = {
          headers: {
            Authorization: `Bearer ${userContext.user.tokenId}`,
            User: userContext.user.name,
            Mail: userContext.user.email,
            FirstName: userContext.user.firstName,
            LastName: userContext.user.lastName
          },
        };
        const response = await fetch(url, fetchObject);

        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to fetch yaml data!");
        }
        const result = await response.json();
        context.homeRight.yaml_data = result['yaml_data'];
        if(data_type_needed){
          context.homeRight.inputData = result['type_data'];
        }
        context.homeRight.setYAMLChanged((ps) => {return result['yaml_data']});
        context.homeRight.setCustYAMLChanged((ps) => {return []});
      } catch (error) {
        setError(error.message);
      }
      context.homeRight.setIsLoading(() => false);
    },
    [context.MAIN_URI, context.homeRight]
  );

  // Load Test directory information on left pane on page load
  useEffect(() => {
    context.homeRight.yaml_data = [];
    context.homeRight.setYAMLChanged((prevState) => []);
    fetchTestDirData();
  }, [fetchTestDirData]);

  // Create JSX elements for YAML data
  const tc_items = testData.map((item, indx) => {
    if (item.files.length > 0) {
      return (
        <Accordion.Item eventKey={item.dir} key={indx}>
          <Accordion.Header onClick={onTestDirClickHandler}>
            {item.dir}
          </Accordion.Header>
          <Accordion.Body bsPrefix={styles_bs["accordion-body-custom"]}>
            <ListGroup key={indx}>
              {TestCaseList(item.files, indx, item.dir)}
            </ListGroup>
          </Accordion.Body>
        </Accordion.Item>
      );
    } else {
      return null;
    }
  });

  const testFilterHandler = (event) => {
    console.log("In filter canvas");
    event.preventDefault();
    const type = document.getElementById("typeTest").value;
    const val = document.getElementById("typeTestVal").value;
    setShowCanvas(() => false);
    fetchTestDirData(type, val);
    console.log(type, val);
  };

  let content = null;
  if (tc_items.length > 0) {
    content = (
      <Accordion bsPrefix={styles_bs["accordion-custom"]}>{tc_items}</Accordion>
    );
  }

  if (error) {
    content = <p>{error}</p>;
  }

  if (isLoading) {
    content = (
      <Card style={{ width: "100%", height: "100%" }}>
        <Card.Body>
          {/* <Placeholder as={Card.Title} animation="glow">
            <Placeholder xs={12} /> 
          </Placeholder> */}
          <Placeholder as={Card.Text} animation="glow">
            <Placeholder md={12} />
            <Placeholder xs={8} />
            <Placeholder xs={8} />
            <br />
            <Placeholder xs={8} />
            <Placeholder xs={8} />
            <br />
            <Placeholder md={12} />
            <Placeholder xs={8} />
            <Placeholder xs={8} />
            <br />
            <Placeholder xs={8} />
            <Placeholder xs={8} />
            <Placeholder md={12} />
            <br />
            <Placeholder xs={8} />
            <Placeholder xs={8} />
            <Placeholder xs={8} /> <br />
            <Placeholder xs={8} />
            <Placeholder md={12} />
            <Placeholder xs={8} />
            <br />
            <Placeholder xs={8} />
          </Placeholder>
        </Card.Body>
      </Card>
    );
  }

  const handleClose = () => setShowCanvas(() => false);
  const handleFilter = () => setShowCanvas(() => true);
  const canvasFilter = (
    <Offcanvas show={showCanvas} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title size="small">TestCase Filter</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form onSubmit={testFilterHandler}>
          <Form.Group className="mb-1">
            <Form.Label>Filter By:</Form.Label>
            <Form.Select id="typeTest" size="sm">
              <option value="tcid">TC ID</option>
              <option value="terid">TER ID</option>
            </Form.Select>
            <Form.Label htmlFor="typeTestVal">Value</Form.Label>
            <Form.Control
              type="text"
              id="typeTestVal"
              placeholder="Enter search value"
              size="sm"
            />
            <br />
            <Button type="submit" variant="success" size="sm">
              Search
            </Button>
          </Form.Group>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );

  return (
    <React.Fragment>
      {canvasFilter}
      <div className={styles.leftpane}>
        <Row>
          <Col xxl={12}>
            <div className={styles["div-header"]}>
              <strong>TEST CASES</strong>
              <Button
                variant="success"
                size="sm"
                onClick={handleFilter}
                style={{ float: "right" }}
              >
                <img
                  src={filter_logo}
                  alt="Filter"
                  className={styles.filter_logo}
                />
              </Button>
            </div>
          </Col>
          <Col xxl={12}>{content}</Col>
        </Row>
      </div>
    </React.Fragment>
  );
};

export default HomePageLeft;
