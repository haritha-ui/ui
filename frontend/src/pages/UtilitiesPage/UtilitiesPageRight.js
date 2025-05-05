import {
  Col,
  Row,
  Card,
  Placeholder,
  Button,
  Table,
  // Breadcrumb,
  // Card,
  // Placeholder,
  OverlayTrigger,
  Popover,
  Form,
  Badge,
} from "react-bootstrap";
import React, {
  useCallback,
  useContext,
  useRef,
  useState,
  // useEffect,
} from "react";
import styles from "../HomePage/HomePageRight.module.css";
import MainContext from "../../store/main_context";
import styles_pages from "../../UI/pages.module.css";
import { UserContext } from "../../hooks/UserContext";
import EventNotifications from "../../components/elements/notifications";
const jobStatus_variant = {
  RUNNING: "primary",
  PASS: "success",
  FAIL: "danger",
  TERMINAING: "secondary",
  TERMINATED: "warning",
};

const UtilitiesPageRight = () => {
  const divRef = useRef();
  const context = useContext(MainContext);
  const userContext = useContext(UserContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUpdateFirmCon, setShowUpdateFirmCon] = useState(false); // State to control the visibility of UpdateFirm component
  const [showUpdateFirmDis, setShowUpdateFirmDis] = useState(false);
  const [form_data, setFormData] = useState({});
  const [jobLog, setJobLog] = useState("");
  const [jobId, setJobId] = useState(null);
  const [updateFirmCon, setupdateFirmCon] = useState(false);
  const [updateFirmDis, setupdateFirmDis] = useState(false);
  const [errorCon, setErrorCon] = React.useState(null); // For concurrent updates
  const [errorDis, setErrorDis] = React.useState(null); // For disruptive updates
  const [showUtilitiesLog, setshowUtilitiesLog] = useState(false);
  const [showRunPhyp, setshowRunPhyp] = useState(false);
  const [showSystemInfo, setsshowSystemInfo] = useState(false);
  const [showUpdateSystem, setsshowUpdateSystem] = useState(false);
  const [showServicepackFirm, setshowServicepackFirm] = useState(false);
  const jobStatus = context.utilitiesRight.jobStatus;
  const aliveStatus = ["RUNNING", "TERMINATING"];
  const isTerminating = jobStatus === "TERMINATING";
  const isJobAlive = aliveStatus.includes(jobStatus) ? true : false;
  const canBeTerminated = isJobAlive && !isTerminating;
  // const [jobLog, setJobLog] = useState(null);
  const options = ["HMC one", "HMC two", "HMC three"];
  const [releases, setReleases] = useState([]);
  context.utilitiesRight.jobLogRef = setJobLog;
  context.utilitiesRight.updateFirmRefCon = setupdateFirmCon;
  context.utilitiesRight.updateFirmRefDis = setupdateFirmDis;
  context.utilitiesRight.utilitiesJobDataRef = setshowUtilitiesLog;
  context.utilitiesRight.runPhypRef = setshowRunPhyp;
  context.utilitiesRight.systemInfoRef = setsshowSystemInfo;
  context.utilitiesRight.updateSystemRef = setsshowUpdateSystem;
  context.utilitiesRight.servicepackFirmRef = setshowServicepackFirm;
  const utilitiesJobDataTriggerFunc =
    context.utilitiesRight.utilitiesJobDataTrigger;
  const submitForTest = useCallback(
    async (yaml_inputs) => {
      try {
        const url = `${context.MAIN_URI}/ui_server/utilities/submit`;
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
        setJobId(result.jobid);
        let body_notify = `Job id: ${result.jobid}\u00A0\u00A0\u00A0\u00A0Process ID: ${result.pid}`;
        const newState = {
          // Define your new notification state here
          show: true,
          header: "Job submission successful!!",
          body: body_notify,
          variant: "dark",
        };
        context.notify.setShowNotify(newState);
        const controller = new AbortController();
        const signal = controller.signal;
        utilitiesJobDataTriggerFunc(
          signal
          // pagination.limit,
          // pagination.offset,
          // context.utilitiesLeft.user
        );
        //console.log("after fetchjobs call");
        // setTimeout(async () => {
        //   try {
        //     const url = `${context.MAIN_URI}/utilities/log/${result.jobid}`;
        //     const requestOptions = {
        //       headers: {
        //         Authorization: `Bearer ${userContext.user.tokenId}`,
        //         User: userContext.user.name,
        //         Mail: userContext.user.email,
        //         FirstName: userContext.user.firstName,
        //         LastName: userContext.user.lastName,
        //       },
        //       signal: signal,
        //     };
        //     const response = await fetch(url, requestOptions);
        //     if (!response.ok) {
        //       console.log(response);
        //       throw new Error("Failed to fetch job log!");
        //     }
        //     const logData = await response.json();
        //     // Update job log state with the log data received
        //     setJobLog(logData);
        //   } catch (error) {
        //     console.error("Error fetching job log:", error);
        //   }
        // }, 130000); // 2 minutes in milliseconds
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

  const handleFinalSubmit = (event, utility) => {
    event.preventDefault();
    let test_data = {};
    //console.log("Final submit");
    // Add any additional logic needed to handle the final submit action
    //console.log(event.target[0].value);
    // Get the selected key from the form
    for (let indx = 0; indx < event.target.length - 1; indx++) {
      form_data[event.target[indx].name] = event.target[indx].value;
      event.target[indx].value = "";
    }
    form_data["TC_ID"] = 0;
    setShowUpdateFirmCon((prev) => false);
    setShowUpdateFirmDis((prev) => false);
    test_data["yaml_inputs"] = form_data;
    //console.log(form_data);
    //put this into the context
    test_data["utility_category"] = utility;
    console.log(test_data);
    submitForTest(test_data);
    for (let indx = 0; indx < event.target.length - 1; indx++) {
      event.target[indx].value = "";
    }
    setFormData({});
  };

  const onYAMLSubmitHandler = async (event) => {
    event.preventDefault();
    //console.log(form_data);
    for (let indx = 0; indx < event.target.length - 1; indx++) {
      form_data[event.target[indx].name] = event.target[indx].value;
      event.target[indx].value = "";
    }
    setFormData(form_data);
    console.log(form_data);
    try {
      const url = `${
        context.MAIN_URI
      }/ui_server/utilities/listbuilds?firm_type=${encodeURIComponent(
        form_data["firm_type"]
      )}&HMC_NAME=${encodeURIComponent(
        form_data["HMC_NAME"]
      )}&FULL_FSP_HOSTNAME=${encodeURIComponent(
        form_data["FULL_FSP_HOSTNAME"]
      )}`;
      const requestOptions = {
        headers: {
          Authorization: `Bearer ${userContext.user.tokenId}`,
          User: userContext.user.name,
          Mail: userContext.user.email,
          FirstName: userContext.user.firstName,
          LastName: userContext.user.lastName,
        },
        //signal: signal,
      };
      //console.log("Context:", context);
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        console.log(response);
        throw new Error(
          `Failed to fetch P9/P10 releases for job:${form_data["HMC_NAME"]} and ${form_data["FULL_FSP_HOSTNAME"]}!`
        );
      }
      const releaseData = await response.json();
      console.log(releaseData);
      if (Array.isArray(releaseData)) {
        // Success response with a list
        setReleases(releaseData);
        if (updateFirmCon) setErrorCon(null); // Clear previous error
        else if (updateFirmDis) setErrorDis(null); // Clear previous error
      } else if (releaseData.error) {
        // Error response with a dictionary
        if (updateFirmCon) {
          setErrorCon(releaseData.error); // Set concurrent update error
          setReleases([]); // Clear previous release data
        } else if (updateFirmDis) {
          setErrorDis(releaseData.error); // Set disruptive update error
          setReleases([]); // Clear previous release data
        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("successfully aborted REST request");
      } else {
        console.log(error);
      }
    }
    if (updateFirmCon) setShowUpdateFirmCon(true);
    // Set showUpdateFirm to true when the form is submitted
    else if (updateFirmDis) setShowUpdateFirmDis(true);
  };

  const HelpElement = (props) => (
    <OverlayTrigger
      placement="auto"
      overlay={
        <Popover id="popover-positioned-right">
          <Popover.Body>{props.text}</Popover.Body>
        </Popover>
      }
    >
      <span>&#128712;</span>
    </OverlayTrigger>
  );

  const jobDataPlaceHolder = () => {
    const jobStatus = (
      <Badge
        bg={jobStatus_variant[`${context.utilitiesRight.jobStatus}`]}
        text={
          `${context.utilitiesRight.jobStatus}` === "TERMINATED"
            ? "dark"
            : "light"
        }
      >{`${context.utilitiesRight.jobStatus}`}</Badge>
    );
    return (
      <>
        <Row>
          <Col>
            <h6>
              TestRun ID:{" "}
              <Badge bg="dark">{`${context.utilitiesRight.jobid}`}</Badge>
            </h6>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={3}>
            <h6>TestStatus: {jobStatus}</h6>
          </Col>
          <Col md={6}>
            <h6>
              Category:{" "}
              <Badge bg="dark">{`${context.utilitiesRight.utilityCategory}`}</Badge>
            </h6>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={6}>
            <h6>
              SP name:{" "}
              <Badge bg="dark">{`${context.utilitiesRight.job_meta_data.sp_name}`}</Badge>
            </h6>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col md={6}>
            <h6>
              Start:{" "}
              <Badge bg="dark">
                {new Date(context.utilitiesRight.jobStartTime).toString()}
              </Badge>
            </h6>
          </Col>
          <Col md={6}>
            <h6>
              End:{" "}
              <Badge bg="dark">
                {context.utilitiesRight.jobEndTime === ""
                  ? ""
                  : new Date(context.utilitiesRight.jobEndTime).toString()}
              </Badge>
            </h6>
          </Col>
        </Row>
      </>
    );
  };

  // Placeholder for when a loading alternative is displayed
  const placeHolder = (
    <Card style={{ width: "100%", height: "100%" }}>
      {/* <Card.Header>Loading...</Card.Header> */}
      <Card.Body>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={6} />
        </Placeholder>
        <Placeholder as={Card.Text} animation="glow">
          <Placeholder md={7} />
          <Placeholder xs={4} />
          <Placeholder xs={4} />
          <br />
          <Placeholder xs={6} />
          <Placeholder xs={8} />
          <br />
          <Placeholder md={8} />
          <Placeholder xs={4} />
          <Placeholder xs={4} />
          <br />
          <Placeholder xs={6} />
          <Placeholder xs={8} />
          <Placeholder md={8} />
          <br />
          <Placeholder xs={4} />
          <Placeholder xs={4} />
          <Placeholder xs={6} /> <br />
          <Placeholder xs={8} />
          <Placeholder md={8} />
          <Placeholder xs={4} />
          <br />
          <Placeholder xs={4} />
          <Placeholder xs={6} />
          <Placeholder xs={8} />
          <br />
          <Placeholder md={8} />
          <Placeholder xs={4} />
          <Placeholder xs={4} />
          <br />
          <Placeholder xs={6} />
          <Placeholder xs={8} />
          <br />
        </Placeholder>
      </Card.Body>
    </Card>
  );

  // Actual placeholder for Top elements in the job right page along with
  // job data log placeholder
  const jobdata = (
    <Card style={{ height: "100%" }} body>
      {/* {TerminateModalPlaceHolder} */}
      {jobDataPlaceHolder()}
      <hr />
      {jobLog}
    </Card>
  );
  const ErrorMessage = ({ message }) => (
    <div style={{ color: "red", margin: "20px 0", textAlign: "center" }}>
      <strong>Error:</strong> {message}
    </div>
  );

  const updateFirmwareFormCon = (
    <form onSubmit={onYAMLSubmitHandler}>
      <div
        className={styles["div-header"]}
        style={{ textAlign: "center", fontSize: "24px" }}
      >
        <strong>Firmware Update-Concurrent</strong>
      </div>
      <Table striped hover size="md" responsive="md" variant="light">
        <thead>
          <tr>
            <th width="30%">Fields</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label>HMC name</label>
            </td>
            <td>
              <input type="text" name="HMC_NAME" placeholder="name of HMC" />
              <HelpElement text="HMC to be updated" />
            </td>
          </tr>
          <tr>
            <td>
              <label> System name </label>
            </td>
            <td>
              <input
                type="text"
                name="FULL_FSP_HOSTNAME"
                placeholder="name of CEC"
              />
              <HelpElement text="CEC name" />
            </td>
          </tr>
        </tbody>
      </Table>
      <input type="hidden" name="firm_type" value="con" />
      <br />
      <Button
        type="submit"
        variant="primary"
        style={{
          float: "right",
          marginRight: "30px",
          position: "relative",
          marginBottom: "20px",
        }}
        disabled={isSubmitting}
      >
        Fetch update details
      </Button>
    </form>
  );
  const showUpdateFirmFormCon = (
    <Card style={{ borderWidth: 0 }}>
      {errorCon ? (
        <ErrorMessage message={errorCon} />
      ) : (
        <form
          onSubmit={(event) => handleFinalSubmit(event, "CCI_Firmware_Update")}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <label
              style={{ marginRight: "10px", marginLeft: "20px" }}
              name="FW_LEVEL"
            >
              Select version
            </label>
            <Form.Select
              aria-label="Default select example"
              name="FW_LEVEL"
              style={{ width: "200px", marginRight: "10px" }}
            >
              {Array.isArray(releases)
                ? releases.map((value, index) => (
                    <option key={index} value={value}>
                      {value}
                    </option>
                  ))
                : Object.entries(releases).map(([key, value], index) => (
                    <option key={index} value={value}>
                      {key} -- {value}
                    </option>
                  ))}
            </Form.Select>
          </div>

          <Button
            type="submit"
            variant="success"
            style={{
              marginTop: "10px",
              float: "right",
              marginRight: "30px",
              position: "relative",
            }}
            disabled={isSubmitting}
          >
            Update Firmware
          </Button>
        </form>
      )}
    </Card>
  );
  const updateFirmwareFormDis = (
    <form onSubmit={onYAMLSubmitHandler}>
      <div
        className={styles["div-header"]}
        style={{ textAlign: "center", fontSize: "24px" }}
      >
        <strong>Firmware Update-Disruptive</strong>
      </div>
      <Table striped hover size="md" responsive="md" variant="light">
        <thead>
          <tr>
            <th width="30%">Fields</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label>HMC name</label>
            </td>
            <td>
              <input type="text" name="HMC_NAME" placeholder="name of HMC" />
              <HelpElement text="HMC to be updated" />
            </td>
          </tr>
          <tr>
            <td>
              <label> System name </label>
            </td>
            <td>
              <input
                type="text"
                name="FULL_FSP_HOSTNAME"
                placeholder="name of CEC"
              />
              <HelpElement text="CEC name" />
            </td>
          </tr>
        </tbody>
      </Table>
      <input type="hidden" name="firm_type" value="dis" />
      <br />
      <Button
        type="submit"
        variant="primary"
        style={{
          float: "right",
          marginRight: "30px",
          position: "relative",
          marginBottom: "20px",
        }}
        disabled={isSubmitting}
      >
        Fetch update details
      </Button>
    </form>
  );
  const showUpdateFirmFormDis = (
    <Card style={{ borderWidth: 0 }}>
      {/* <form onSubmit={handleFinalSubmit}> */}
      {errorDis ? (
        <ErrorMessage message={errorDis} />
      ) : (
        <form
          onSubmit={(event) =>
            handleFinalSubmit(event, "Disruptive_Firmware_Update")
          }
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <label
              style={{ marginRight: "10px", marginLeft: "20px" }}
              name="FW_LEVEL"
            >
              Select version
            </label>
            {/* <Form.Select
            aria-label="Default select example"
            name="HMC name"
            style={{ width: "200px", marginRight: "10px" }}
          >
            {releases.map((op, index) => (
              <option key={index} value={op}>
                {op}
              </option>
            ))}
          </Form.Select> */}
            <Form.Select
              aria-label="Default select example"
              name="FW_LEVEL"
              style={{ width: "200px", marginRight: "10px" }}
            >
              {Object.entries(releases).map(([key, value], index) => (
                <option key={index} value={value}>
                  {key} -- {value}
                </option>
              ))}
            </Form.Select>
          </div>

          <Button
            type="submit"
            variant="success"
            style={{
              marginTop: "10px",
              float: "right",
              marginRight: "30px",
              position: "relative",
            }}
            disabled={isSubmitting}
          >
            Update Firmware
          </Button>
        </form>
      )}
    </Card>
  );
  const runPhypMemMoverForm = (
    // <form
    //   onSubmit={() => {
    //     console.log("runphyp");
    //   }}
    // >
    <form onSubmit={(event) => handleFinalSubmit(event, "runPhyp_MemMover")}>
      <div
        className={styles["div-header"]}
        style={{ textAlign: "center", fontSize: "24px" }}
      >
        <strong>Run PHYP Mem Mover</strong>
      </div>
      <Table striped hover size="md" responsive="md" variant="light">
        <thead>
          <tr>
            <th width="30%">Fields</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label> SP hostname </label>
            </td>
            <td>
              <input
                type="text"
                name="SP hostname"
                placeholder="name of SP host"
              />
              <HelpElement text="Service Processor name" />
            </td>
          </tr>
          <tr>
            <td>
              <label> Type of operation </label>
            </td>
            <td>
              <Form.Select
                aria-label="Default select example"
                name="operation type"
                style={{ width: "200px", marginRight: "10px" }}
              >
                <option value="1">Start</option>
                <option value="0">Stop</option>
              </Form.Select>
            </td>
          </tr>
        </tbody>
      </Table>
      <br />
      <Button
        type="submit"
        variant="success"
        style={{
          marginTop: "10px",
          float: "right",
          marginRight: "30px",
          position: "relative",
        }}
        //disabled={isSubmitting}
      >
        Submit
      </Button>
    </form>
  );
  const getSystemInfoForm = (
    <form
      onSubmit={() => {
        console.log("runphyp");
      }}
    >
      <div
        className={styles["div-header"]}
        style={{ textAlign: "center", fontSize: "24px" }}
      >
        <strong>Get Sysytem Info</strong>
      </div>
      <Table striped hover size="md" responsive="md" variant="light">
        <thead>
          <tr>
            <th width="30%">Fields</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label> SP hostname </label>
            </td>
            <td>
              <input
                type="text"
                name="SP hostname"
                placeholder="name of SP host"
              />
              <HelpElement text="Service Processor name" />
            </td>
          </tr>
        </tbody>
      </Table>
      <br />
      <Button
        type="submit"
        variant="success"
        style={{
          marginTop: "10px",
          float: "right",
          marginRight: "30px",
          position: "relative",
        }}
        //disabled={isSubmitting}
      >
        Submit
      </Button>
    </form>
  );
  const updateSystemForm = (
    <form
      onSubmit={() => {
        console.log("runphyp");
      }}
    >
      <div
        className={styles["div-header"]}
        style={{ textAlign: "center", fontSize: "24px" }}
      >
        <strong>Update System</strong>
      </div>
      <Table striped hover size="md" responsive="md" variant="light">
        <thead>
          <tr>
            <th width="30%">Fields</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label> HMC name </label>
            </td>
            <td>
              <input type="text" name="HMC name" placeholder="name of HMC" />
            </td>
          </tr>
          <tr>
            <td>
              <label> SP hostname </label>
            </td>
            <td>
              <input
                type="text"
                name="SP hostname"
                placeholder="name of SP host"
              />
              <HelpElement text="Service Processor name" />
            </td>
          </tr>
          <tr>
            <td>
              <label> System name </label>
            </td>
            <td>
              <input type="text" name="System name" placeholder="System name" />
            </td>
          </tr>
          <tr>
            <td>
              <label> List of LPAR hostnames </label>
            </td>
            <td>
              <input
                type="text"
                name="LPAR hostnames"
                placeholder="LPAR hostnames"
              />
              <HelpElement text="LPAR hostnames separated by commas" />
            </td>
          </tr>
          <tr>
            <td>
              <label> Select element to be updated </label>
            </td>
            <td>
              <Form.Select
                aria-label="Default select example"
                name="update element"
                style={{ width: "200px", marginRight: "10px" }}
              >
                <option value="1">System FW</option>
                <option value="2">OS</option>
                <option value="3">HTX</option>
                <option value="4">HMC</option>
              </Form.Select>
            </td>
          </tr>
        </tbody>
      </Table>
      <br />
      <Button
        type="submit"
        variant="success"
        style={{
          marginTop: "10px",
          float: "right",
          marginRight: "30px",
          position: "relative",
        }}
        //disabled={isSubmitting}
      >
        Submit
      </Button>
    </form>
  );
  const servicepackFirmUpdateForm = (
    <form
      onSubmit={() => {
        console.log("runphyp");
      }}
    >
      <div
        className={styles["div-header"]}
        style={{ textAlign: "center", fontSize: "24px" }}
      >
        <strong>Servicepack Firmware Update</strong>
      </div>
      <Table striped hover size="md" responsive="md" variant="light">
        <thead>
          <tr>
            <th width="30%">Fields</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <label> HMC name </label>
            </td>
            <td>
              <input type="text" name="HMC name" placeholder="name of HMC" />
            </td>
          </tr>
          <tr>
            <td>
              <label> SP hostname </label>
            </td>
            <td>
              <input
                type="text"
                name="SP hostname"
                placeholder="name of SP host"
              />
              <HelpElement text="Service Processor name" />
            </td>
          </tr>
        </tbody>
      </Table>
      <br />
      <Button
        type="submit"
        variant="success"
        style={{
          marginTop: "10px",
          float: "right",
          marginRight: "30px",
          position: "relative",
        }}
        // disabled={isSubmitting}
      >
        Submit
      </Button>
    </form>
  );

  return (
    <React.Fragment>
      <div className={styles_pages.middlepane}>
        <React.Fragment>
          {updateFirmCon && (
            <>
              {updateFirmwareFormCon}
              <br />
              <br />
              {/* Render UpdateFirm component only when showUpdateFirm is true */}
              {showUpdateFirmCon && showUpdateFirmFormCon}
              {jobId && <p>Submitted Job ID: {jobId}</p>}
            </>
          )}
          {updateFirmDis && (
            <>
              {updateFirmwareFormDis}
              <br />
              <br />
              {/* Render UpdateFirm component only when showUpdateFirm is true */}
              {showUpdateFirmDis && showUpdateFirmFormDis}
            </>
          )}
          {showRunPhyp && runPhypMemMoverForm}
          {showSystemInfo && getSystemInfoForm}
          {showUpdateSystem && updateSystemForm}
          {showServicepackFirm && servicepackFirmUpdateForm}
          <div
            className={styles.middlepane}
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              fontSize: "medium",
            }}
          >
            {/* {AlertPlaceHolder} */}
            {showUtilitiesLog && (
              <>
                {jobLog === "loading" && placeHolder}
                {jobLog && jobLog !== "loading" && jobdata}
              </>
            )}
          </div>
        </React.Fragment>
      </div>
    </React.Fragment>
  );
};

export default UtilitiesPageRight;
