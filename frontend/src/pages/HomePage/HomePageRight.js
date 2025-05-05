/* import { Prompt } from "react-router-dom"; */
import {
  Button,
  Table,
  Breadcrumb,
  Card,
  Placeholder,
  OverlayTrigger,
  Popover,
} from "react-bootstrap";
import React, {
  useCallback,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

import styles from "./HomePageRight.module.css";
import MainContext from "../../store/main_context";
import styles_pages from "../../UI/pages.module.css";
import { UserContext } from "../../hooks/UserContext";
import EventNotifications from "../../components/elements/notifications";

const HomePageRight = () => {
  const divRef = useRef();
  const context = useContext(MainContext);
  const userContext = useContext(UserContext);
  // To avoid not using some values while array destructuring we can
  // set them as empty without assignining to any variables as below
  const [yaml_data, setYamlData] = useState(context.homeRight.yaml_data);
  const [isLoading, setIsLoading] = useState(false);
  const [customYamlData, setCustYamlData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  context.homeRight.setYAMLChanged = setYamlData;
  context.homeRight.setIsLoading = setIsLoading;
  context.homeRight.setCustYAMLChanged = setCustYamlData;

  let selectedLink = "";
  let display_form = [];
  let yaml_form_data = [];
  const custKey = "custKey";
  const custVal = "custVal";
  let initial_yaml_default_inputs = yaml_data;

  // On this component unmount, set all values to empty
  useEffect(() => {
    // Clean up action
    return () => {
      setYamlData((ps) => []);
      setCustYamlData((ps) => []);
    };
  }, []);

  if (context.homeRight.selectedLink) {
    selectedLink = context.homeRight.selectedLink.map((item, index) => {
      return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>;
    });
  }

  // Create table row elements from fetched yaml template data
  Object.keys(yaml_data).map((key, index) => {
    if (context.homeRight.inputData.hasOwnProperty(key) &&  context.homeRight.inputData[key].help !== "")
    {
      var help_element = <OverlayTrigger
        placement="auto"
        overlay={
          <Popover id="popover-positioned-right">
            <Popover.Body>
              {context.homeRight.inputData[key].help}
            </Popover.Body>
          </Popover>
        }
      >
        <span>&#128712;</span>
      </OverlayTrigger>
    }
    else{
      var help_element = <span></span>
    }
    return yaml_form_data.push([
      index,
      <tr key={index}>
        <td>
          <label
            key={index + "label"}
            htmlFor={key + "" + index}
            id={index + "label"}
            name={index + "label"}
          >
            {key}:
          </label>
        </td>
        <td>
          <input
            key={index + "input"}
            name={index + "input"}
            id={key}
            type="text"
            placeholder={
              context.homeRight.yaml_data[key]
                ? context.homeRight.yaml_data[key].toString()
                : ""
            }
          />
          {help_element}
        </td>
      </tr>,
    ]);
  });

  Object.keys(customYamlData).map((key, indx) => {
    const index_2 = yaml_form_data.length;
    return yaml_form_data.push([
      index_2,
      <tr key={index_2}>
        <td width={"30%"}>
          <input
            key={index_2 + "label"}
            htmlFor={`${custKey}${key}`}
            type="text"
            id={custKey + index_2 + "label"}
            name={`${custVal}${key}`}
          />
        </td>
        <td>
          <input
            key={index_2 + "input"}
            id={`${custKey}${key}`}
            type="text"
            name={`${custVal}${key}`}
            placeholder={
              context.homeRight.yaml_data[key]
                ? context.homeRight.yaml_data[key].toString()
                : ""
            }
          />
        </td>
      </tr>,
    ]);
  });

  // if (yaml_form_data.length > 0) {
  //   yaml_form_data.push([
  //     yaml_form_data.length,
  //     <tr key={yaml_form_data.length}>
  //       <td>
  //         <label htmlFor="prod_run" name="prod_run_label">
  //           PRODUCTION_RUN
  //         </label>
  //       </td>
  //       <td>
  //         <input type="checkbox" id="prod_run" name="prod_run_value" />
  //       </td>
  //     </tr>,
  //   ]);
  // }

  display_form = yaml_form_data.map((item, indx) => {
    return item[1];
  });

  const addMoreInputsHandler = () => {
    const index = display_form.length;
    //const key = `newCustKey${index}`;
    let new_data = {};
    new_data[`newCustKey${index}`] = "";
    setCustYamlData((prevData) => [...prevData, new_data]);
  };

  // Start submitting YAML data for test run
  const submitForTest = useCallback(
    async (yaml_inputs) => {
      try {
        const url = `${context.MAIN_URI}/ui_server/tests/submit`;
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userContext.user.tokenId}`,
            User: userContext.user.name,
            Mail: userContext.user.email,
            FirstName: userContext.user.firstName,
            LastName: userContext.user.lastName,
          },
          body: JSON.stringify(yaml_inputs),
        };

        setIsSubmitting(true);
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          console.log(response);
          throw new Error("Failed to submit test!");
        }
        const result = await response.json();
        let body_notify = `Job id: ${result.jobid}\u00A0\u00A0\u00A0\u00A0Process ID: ${result.pid}`;
        const newState = {
          show: true,
          header: "Job submission successful!!",
          body: body_notify,
          variant: "dark",
        };
        context.notify.setShowNotify((prevState) => ({
          ...prevState,
          ...newState,
        }));
      } catch (error) {
        console.log(error.message);
        const newState = {
          show: true,
          header: "Job submission failed!!",
          body: `${error.message}`,
          variant: "warning",
        };
        context.notify.setShowNotify((prevState) => ({
          ...prevState,
          ...newState,
        }));
      }
      setIsSubmitting(false);
      divRef.current.scrollIntoView();
    },
    [context.MAIN_URI, context.notify]
  );

  // Handler for START button click
  const onYAMLSubmitHandler = (event) => {
    event.preventDefault();
    let test_data = {};
    let yaml_inputs = {};
    let cust_inputs = {};

    for (let indx = 0; indx < event.target.length - 1; indx++) {
      if (
        event.target[indx].id.startsWith(custKey) &&
        event.target[indx].id.endsWith("label")
      ) {
        // Capture cutom yaml 'key' and map to respective 'value'
        // if any
        if (event.target[indx].name in cust_inputs) {
          cust_inputs[event.target[indx].value] =
            cust_inputs[event.target[indx].name];
          delete cust_inputs[event.target[indx].name];
        } else {
          cust_inputs[event.target[indx].name] = event.target[indx].value;
        }
        continue;
      } else if (event.target[indx].id.startsWith(custKey)) {
        // Capture custom yaml 'value' and map to respective 'key'
        // if any
        const k = cust_inputs[event.target[indx].id];
        if (event.target[indx].name in cust_inputs) {
          cust_inputs[cust_inputs[event.target[indx].name]] =
            event.target[indx].value;
          delete cust_inputs[event.target[indx].name];
        } else {
          cust_inputs[event.target[indx].name] = event.target[indx].value;
        }
        continue;
      }

      // If we reach here then we are parsing YAML input feilds
      // that we fetched from YAML template
      if (event.target[indx].value) {
        console.log(event.target[indx].id, event.target[indx].value);
        yaml_inputs[event.target[indx].id] = event.target[indx].value;
      } else {
        yaml_inputs[event.target[indx].id] =
          initial_yaml_default_inputs[event.target[indx].id];
      }
    }
    test_data["yaml_inputs"] = yaml_inputs;
    test_data["cust_yaml_inputs"] = cust_inputs;
    test_data["yaml_file"] = context.homeRight.selectedLink[1];
    test_data["yaml_category"] = context.homeRight.selectedLink[0];

    submitForTest(test_data);
    // reset all input values empty ''
    for (let indx = 0; indx < event.target.length - 1; indx++) {
      event.target[indx].value = "";
    }
    console.log(test_data);
  };

  const placeHolder = (
    <Card style={{ width: "100%", height: "100%" }}>
      <Card.Body>
        <Placeholder as={Card.Text} animation="glow">
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <br />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <br />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <br />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <br />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <br />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <br />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <br />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <Placeholder xs={5} /> <Placeholder xs={5} />
          <br />
        </Placeholder>
      </Card.Body>
    </Card>
  );

  return (
    <React.Fragment>
      {/* <Prompt
        when={isFormFocused}
        message={(location) =>
          "Are you sure you want to leave. All your details will be lost"
        }
      /> */}
      <div className={styles_pages.middlepane}>
        {!isLoading && display_form.length > 0 && (
          <React.Fragment>
            <EventNotifications></EventNotifications>
            <div className={styles["div-header"]} ref={divRef}>
              <Breadcrumb>{selectedLink}</Breadcrumb>
            </div>
            <form onSubmit={onYAMLSubmitHandler}>
              <Table striped hover size="md" responsive="md" variant="light">
                <thead>
                  <tr>
                    <th width="30%">Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>{display_form}</tbody>
              </Table>
              <button type="button" onClick={addMoreInputsHandler}>
                Add inputs
              </button>
              <br />
              <Button
                type="submit"
                style={{
                  float: "right",
                  marginRight: "30px",
                  position: "relative",
                  marginBottom: "20px",
                }}
                disabled={isSubmitting}
                variant="primary"
              >
                {isSubmitting ? "Submitting.." : "Start Test"}
              </Button>
            </form>
          </React.Fragment>
        )}
        {!isLoading && !display_form.length > 0 && (
          <Card className="text-center">
            <Card body style={{ height: "100%", width: "100%" }}>
              {/* <Card.Title>Special title treatment</Card.Title> */}
              <Card.Text>Select any test YAML</Card.Text>
            </Card>
          </Card>
        )}
        {isLoading && placeHolder}
      </div>
    </React.Fragment>
  );
};

export default HomePageRight;
