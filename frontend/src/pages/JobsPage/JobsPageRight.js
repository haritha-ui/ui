import React, { useContext, useState } from "react";
import {
  Col,
  Row,
  Card,
  Placeholder,
  Dropdown,
  DropdownButton,
  Badge,
} from "react-bootstrap";

import styles from "../../UI/pages.module.css";
import MainContext from "../../store/main_context";
import { UserContext } from "../../hooks/UserContext";
import { StaticModal } from "../../components/elements/modal_components";
import { DismissibleAlert } from "../../components/elements/alert_component";

const jobStatus_variant = {
  RUNNING: "primary",
  PASS: "success",
  FAIL: "danger",
  TERMINAING: "secondary",
  TERMINATED: "warning",
};

const JobsPageRight = () => {
  const [jobLog, setJobLog] = useState("");
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showAlert, setShowAlert] = useState({
    show: false,
    variant: "success",
    message: "",
  });
  const context = useContext(MainContext);
  context.jobRight.jobLogRef = setJobLog;
  const userContext = useContext(UserContext);
  const jobStatus = context.jobRight.jobStatus;
  const aliveStatus = ["RUNNING", "TERMINATING"];
  const isTerminating = jobStatus === "TERMINATING";
  const isJobAlive = aliveStatus.includes(jobStatus) ? true : false;
  const canBeTerminated = isJobAlive && !isTerminating;

  // Terminate Modal hadlers
  const handleTerminateModalClose = () => setShowTerminateModal(false);
  const onTerminateHandler = (event) => {
    setShowTerminateModal((ps) => true);
  };
  
  // Alert handlers
  const closeAlert = () => {
    setShowAlert((ps) => {
      return { ...ps, show: false, variant: "success", message: "" };
    });
  };
  const openAlert = (variant, message, close = true) => {
    setShowAlert((ps) => {
      return { ...ps, show: true, variant: variant, message: message };
    });
    if (close === true) {
      setTimeout(closeAlert, 5000);
    }
  };
  context.jobRight.alertRef = openAlert;

  const dateOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    "hour": 'numeric',
    "minute":"numeric",
    "hour12": false,
    "timeZoneName": "short"
  }
  // Terminate Task related handler for logic on click of 'Terminate' button
  const onTerminateModalHandler = async (event) => {
    event.preventDefault();
    console.log("Terminating ", context.jobRight.jobid);
    openAlert("info", `Terminating task: ${context.jobRight.jobid}`, false);
    try {
      const url = `${context.MAIN_URI}/ui_server/tests/terminate/${context.jobRight.jobid}`;
      const requestOptions = {
        method: "POST",
        headers: {
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${userContext.user.tokenId}`,
          User: userContext.user.name,
          Mail: userContext.user.email,
          FirstName: userContext.user.firstName,
          LastName: userContext.user.lastName
        },
      };
      setShowTerminateModal((ps) => false);
      const response = await fetch(url, requestOptions);
      let ret = await response.text();
      if (!response.ok) {
        throw new Error(
          `Failed to terminate task ${context.jobRight.jobid}. ${ret}`
        );
      }
      console.log(ret);
      openAlert("success", ret);
    } catch (error) {
      console.log(error.message);
      openAlert("danger", error.message);
    }
  };

  // Handler call for logic when download button clicked from Task 
  // options button
  const onDownloadLogsHandler = async (event) => {
    event.preventDefault();
    console.log("Downloading logs for ", context.jobRight.jobid);
    try {
      const url = `${context.MAIN_URI}/ui_server/download_log/${context.jobRight.jobid}`;
      const requestOptions = {
        headers: {
          Authorization: `Bearer ${userContext.user.tokenId}`,
          User: userContext.user.name,
          Mail: userContext.user.email,
          FirstName: userContext.user.firstName,
          LastName: userContext.user.lastName
        },
        responseType: "blob",
      };
      const response = await fetch(url, requestOptions);
      if (!response.ok) {
        throw new Error(
          `Failed to download logs for ${context.jobRight.jobid}`
        );
      }
      const blob = await response.blob();
      console.log(response.headers);
      console.log(blob);
      const data = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = data;
      link.setAttribute("download", `${context.jobRight.jobid}_ct_log.tar`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.log(error.message);
    }
  };

  // Terminate Task related modal placeholder
  const TerminateModalPlaceHolder = (
    <StaticModal
      showModal={showTerminateModal}
      closeModal={handleTerminateModalClose}
      header={`Terminate task ${context.jobRight.jobid} ?`}
      body={
        <>
          Do you really want to terminate this running task. This might affect
          the state of underlying Hardware and may also corrupt it.
          <b> Proceed ?</b>
        </>
      }
      okHandler={onTerminateModalHandler}
      ok_button_value="Terminate"
    />
  );

  // Alert related placeholder
  const AlertPlaceHolder = (
    <DismissibleAlert
      show={showAlert.show}
      variant={showAlert.variant}
      onClose={closeAlert}
      message={showAlert.message}
    />
  );

  // Task related options button
  const OptionsButton = (
    <div style={{ float: "right" }}>
      <DropdownButton
        menuVariant="dark"
        variant="dark"
        size="sm"
        title="Test Options"
        id="joblog-options"
        align="start"
      >
        <Dropdown.Item
          size="sm"
          eventKey="1"
          disabled={!canBeTerminated}
          onClick={onTerminateHandler}
        >
          Terminate
        </Dropdown.Item>
        <Dropdown.Item
          size="sm"
          eventKey="2"
          disabled={isJobAlive}
          onClick={onDownloadLogsHandler}
        >
          Download logs
        </Dropdown.Item>
      </DropdownButton>
    </div>
  );

  // Task data related placeholder that holds elements needed for displaying
  // data on job right page when a particular task from left is clicked like
  // Job ID, status, start/end time, Task button etc.,
  const jobDataPlaceHolder = () => {
    const jobStatus = (
      <Badge
        bg={jobStatus_variant[`${context.jobRight.jobStatus}`]}
        text={
          `${context.jobRight.jobStatus}` === "TERMINATED" ? "dark" : "light"
        }
      >{`${context.jobRight.jobStatus}`}</Badge>
    );
    return (
      <>
        <Row>
          <Col><h6>TestRun ID:  <Badge bg="dark">{`${context.jobRight.jobid}`}</Badge></h6></Col>
          <Col>{OptionsButton}</Col>
        </Row><hr/>
        <Row>
          <Col md={3}>
            <h6>TestStatus:  {jobStatus}</h6>
          </Col>
          <Col md={3}>
            <h6>
              TC ID:       <Badge bg="dark">{`${context.jobRight.job_meta_data.test_function}`}</Badge>
            </h6>
          </Col>
          <Col md={3}>
            <h6>
              TCR:       <Badge bg="dark">{`${context.jobRight.job_meta_data.tcr_id}`}</Badge>
            </h6>
          </Col>
          <Col md={3}>
            <h6>
              TER:       <Badge bg="dark">{`${context.jobRight.job_meta_data.ter_id}`}</Badge>
            </h6>
          </Col>
        </Row><hr/>
        <Row>
          <Col md={6}>
            <h6>
              TC Category: <Badge bg="dark">{`${context.jobRight.job_meta_data.test_category}`}</Badge>
            </h6>
          </Col>
          <Col md={6}>
            <h6>
              SP System: <Badge bg="dark">{`${context.jobRight.job_meta_data.sp_name}`}</Badge>
            </h6>
          </Col>
        </Row><hr/>
        <Row>
          <Col md={6}>
            <h6>
              Start:      {" "}
              <Badge bg="dark">
                {new Date(context.jobRight.jobStartTime).toString()}
              </Badge>
            </h6>
          </Col>
          <Col md={6}>
            <h6>
              End:      {" "}
              <Badge bg="dark">
                {context.jobRight.jobEndTime === ""
                  ? ""
                  : new Date(context.jobRight.jobEndTime).toString()}
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
      {TerminateModalPlaceHolder}
      {jobDataPlaceHolder()}
      <hr />
      {jobLog}
    </Card>
  );

  return (
    <React.Fragment>
      <div
        className={styles.middlepane}
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          fontSize: "medium",
        }}
      >
        {AlertPlaceHolder}
        {jobLog === "loading" && placeHolder}
        {jobLog && jobLog !== "loading" && jobdata}
      </div>
    </React.Fragment>
  );
};

export default JobsPageRight;
