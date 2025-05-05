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
import { Dropdown, ButtonGroup } from "react-bootstrap";
import MainContext from "../../store/main_context";
import { useHistory } from "react-router-dom";
import DataItem from "../../components/elements/DataItem";

import gear_logo from "../../UI/images/gear.png";

import styles from "../../UI/pages.module.css";
import { UserContext } from "../../hooks/UserContext";

const UtilitiesPageLeft = () => {
  const context = useContext(MainContext);
  const userContext = useContext(UserContext);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobData, setJobData] = useState([]);
  const history = useHistory();
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 15,
    pageCount: 10,
    currentPage: 1,
  });

  // Handler to fetch list of available jobs(ID, User, TestCase, Status)
  const fetchAvailableJobs = useCallback(
    //async (signal, limit, offset, status = `${context.jobLeft.status}`, user=`${context.jobLeft.user}`) => {
    async (
      signal,
      limit = 15,
      offset = 0,
      user = `${context.utilitiesLeft.user}`
    ) => {
      try {
        const url = `${context.MAIN_URI}/ui_server/utilities/${context.utilitiesRight.jobid}?limit=${limit}&offset=${offset}&user=${user}`;
        const requestOptions = {
          headers: {
            Authorization: `Bearer ${userContext.user.tokenId}`,
            User: userContext.user.name,
            Mail: userContext.user.email,
            FirstName: userContext.user.firstName,
            LastName: userContext.user.lastName,
          },
          signal: signal,
        };
        const response = await fetch(url, requestOptions);

        if (!response.ok) {
          throw new Error("Failed to fetch available jobs!");
        }
        const result = await response.json();
        console.log(result);
        setJobsLoading((ps) => false);
        setJobData(result["job_data"]);
        const data = {
          limit: result.limit,
          offset: result.offset,
          pageCount: result.pageCount,
        };
        setPagination((prevstate) => ({ ...prevstate, ...data }));
        context.utilitiesRight.jobLogRef((ps) => result["job_log"]["data"]);
        context.utilitiesRight.jobStatus = result["job_log"]["status"];
        context.utilitiesRight.jobStartTime = result["job_log"]["time_start"];
        context.utilitiesRight.jobEndTime = result["job_log"]["time_end"];
        console.log("fetchjobs triggered");
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("successfully aborted REST request");
        } else {
          setJobsLoading((ps) => false);
          console.log(error.message);
          context.utilitiesRight.jobLogRef((ps) => "");
          context.utilitiesRight.jobStatus = "UNKNOWN";
        }
      }
    },
    []
  );
  context.utilitiesRight.utilitiesJobDataTrigger = fetchAvailableJobs;
  // Fetch jobs first time and then keep fetching periodically(every 1min.)
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    setJobsLoading((prevState) => true);
    context.utilitiesLeft.user =
      context.utilitiesLeft.user || userContext.user.email.split("@")[0];
    // Fetch jobs for first time and then attach timer interval for continuous fetching
    fetchAvailableJobs(
      signal,
      pagination.limit,
      pagination.offset,
      context.utilitiesLeft.user
    );
    var counter = 0;
    var timerJobFetch = setInterval(() => {
      fetchAvailableJobs(
        signal,
        pagination.limit,
        pagination.offset,
        context.utilitiesLeft.user
      );
      counter += 60;
      if (counter === 900) {
        console.log("Redirecting to home page after 15mins");
        history.push("/");
      }
    }, 60000);

    // Delete timer if page is reloaded/unmounted
    return () => {
      clearInterval(timerJobFetch);
      controller.abort();
    };
  }, [fetchAvailableJobs, pagination.limit, pagination.offset]);

  const fetchJobData = async (signal, jobid) => {
    try {
      context.utilitiesRight.jobLogRef((prev_state) => "loading");
      const url = `${context.MAIN_URI}/ui_server/utilities/log/${jobid}`;
      const requestOptions = {
        headers: {
          Authorization: `Bearer ${userContext.user.tokenId}`,
          User: userContext.user.name,
          Mail: userContext.user.email,
          FirstName: userContext.user.firstName,
          LastName: userContext.user.lastName,
        },
        signal: signal,
      };
      const response = await fetch(url, requestOptions);
      console.log("responed");
      if (!response.ok) {
        throw new Error(`Failed to fetch job data for job:${jobid}!`);
      }
      const logData = await response.json();
      console.log(logData);
      //setJobLog(logData);
      const parsedData = JSON.parse(JSON.stringify(logData.data));
      //console.log(context.utilitiesRight);
      context.utilitiesRight.jobid = jobid;
      context.utilitiesRight.jobLogRef((prevData) => logData["data"]);
      context.utilitiesRight.jobStatus = logData["status"];
      context.utilitiesRight.jobStartTime = logData["time_start"];
      context.utilitiesRight.jobEndTime = logData["time_end"];
      context.utilitiesRight.utilityCategory = logData["utility_category"];
      context.utilitiesRight.job_meta_data = logData;
      console.log("after updating context:");
      console.log(context.utilitiesRight);
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("successfully aborted REST request");
      } else {
        console.log(error);
        console.log(error.message);
        context.utilitiesRight.jobLogRef((prev_state) => "");
        context.utilitiesRight.jobStatus = "UNKNOWN";
        context.utilitiesRight.alertRef("danger", error.message);
        context.utilitiesRight.job_meta_data = {};
      }
    }
  };

  const UpdateFirmClickHandlerCon = (event) => {
    event.preventDefault();
    // Update the variable in the context to true
    context.utilitiesRight.updateFirmRefCon((prevData) => true);
    context.utilitiesRight.updateFirmRefDis((prevData) => false);
    context.utilitiesRight.utilitiesJobDataRef((prevData) => false);
    context.utilitiesRight.runPhypRef((prevData) => false);
    context.utilitiesRight.systemInfoRef((prevData) => false);
    context.utilitiesRight.updateSystemRef((prevData) => false);
    context.utilitiesRight.servicepackFirmRef((prevData) => false);
  };
  const UpdateFirmClickHandlerDis = (event) => {
    event.preventDefault();
    // Update the variable in the context to true
    context.utilitiesRight.updateFirmRefCon((prevData) => false);
    context.utilitiesRight.updateFirmRefDis((prevData) => true);
    context.utilitiesRight.utilitiesJobDataRef((prevData) => false);
    context.utilitiesRight.runPhypRef((prevData) => false);
    context.utilitiesRight.systemInfoRef((prevData) => false);
    context.utilitiesRight.updateSystemRef((prevData) => false);
    context.utilitiesRight.servicepackFirmRef((prevData) => false);
  };
  const RunPhypClickHandler = (event) => {
    event.preventDefault();
    context.utilitiesRight.updateFirmRefCon((prevData) => false);
    context.utilitiesRight.updateFirmRefDis((prevData) => false);
    context.utilitiesRight.utilitiesJobDataRef((prevData) => false);
    context.utilitiesRight.runPhypRef((prevData) => true);
    context.utilitiesRight.systemInfoRef((prevData) => false);
    context.utilitiesRight.updateSystemRef((prevData) => false);
    context.utilitiesRight.servicepackFirmRef((prevData) => false);
  };
  const GetSystemInfoClickHandler = (event) => {
    event.preventDefault();
    context.utilitiesRight.updateFirmRefCon((prevData) => false);
    context.utilitiesRight.updateFirmRefDis((prevData) => false);
    context.utilitiesRight.utilitiesJobDataRef((prevData) => false);
    context.utilitiesRight.runPhypRef((prevData) => false);
    context.utilitiesRight.systemInfoRef((prevData) => true);
    context.utilitiesRight.updateSystemRef((prevData) => false);
    context.utilitiesRight.servicepackFirmRef((prevData) => false);
  };
  const UpdateSystemClickHandler = (event) => {
    event.preventDefault();
    context.utilitiesRight.updateFirmRefCon((prevData) => false);
    context.utilitiesRight.updateFirmRefDis((prevData) => false);
    context.utilitiesRight.utilitiesJobDataRef((prevData) => false);
    context.utilitiesRight.runPhypRef((prevData) => false);
    context.utilitiesRight.systemInfoRef((prevData) => false);
    context.utilitiesRight.updateSystemRef((prevData) => true);
    context.utilitiesRight.servicepackFirmRef((prevData) => false);
  };
  const ServicepackFWClickHandler = (event) => {
    event.preventDefault();
    context.utilitiesRight.updateFirmRefCon((prevData) => false);
    context.utilitiesRight.updateFirmRefDis((prevData) => false);
    context.utilitiesRight.utilitiesJobDataRef((prevData) => false);
    context.utilitiesRight.runPhypRef((prevData) => false);
    context.utilitiesRight.systemInfoRef((prevData) => false);
    context.utilitiesRight.updateSystemRef((prevData) => false);
    context.utilitiesRight.servicepackFirmRef((prevData) => true);
  };

  const onUtilityItemClickHandler = (event, jobid) => {
    event.preventDefault();
    if (jobid === "ID") {
      return null;
    }
    context.utilitiesRight.updateFirmRefCon((prevData) => false);
    context.utilitiesRight.updateFirmRefDis((prevData) => false);
    context.utilitiesRight.utilitiesJobDataRef((prevData) => true);
    context.utilitiesRight.jobid = jobid;
    const controller = new AbortController();
    const signal = controller.signal;
    fetchJobData(signal, jobid);
  };

  const jobDataList = jobData.map((item, indx) => {
    return (
      <ListGroup.Item
        action
        variant="light"
        key={item.id}
        onClick={(event) => onUtilityItemClickHandler(event, item.id)}
      >
        <DataItem
          user={item.user}
          id={item.id}
          key={item.id}
          description={item.utility_category}
          value={item.id}
          indx={indx}
          spinner={true}
          status={item.status}
        />
      </ListGroup.Item>
    );
  });
  // Placeholder for when jobs are loading
  const loadingPlaceHolder = (
    <Card style={{ width: "100%", height: "100%" }}>
      <Card.Body>
        <Placeholder as={Card.Text} animation="glow">
          <Placeholder md={12} />
          <Placeholder xs={12} />
          <Placeholder xs={12} />
          <br />
          <Placeholder xs={12} />
          <Placeholder xs={12} />
          <br />
          <Placeholder md={12} />
          <Placeholder xs={12} />
          <Placeholder xs={12} />
          <br />
          <Placeholder xs={12} />
          <Placeholder xs={12} />
          <Placeholder md={12} />
          <br />
          <Placeholder xs={12} />
          <Placeholder xs={12} />
          <Placeholder xs={12} />
          <br />
          <Placeholder xs={12} />
        </Placeholder>
      </Card.Body>
    </Card>
  );

  return (
    <React.Fragment>
      <div
        className={styles.leftpane}
        style={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <div style={{ flex: "1 1 auto" }}>
          <Row>
            <Col xxl={12}>
              <div className={styles["div-header"]}>
                <strong>UTILITIES</strong>
              </div>
              <div style={{ margin: "10px" }}>
                <br />
                <Dropdown as={ButtonGroup}>
                  <Dropdown.Toggle
                    variant="outline-secondary"
                    size="lg"
                    style={{ width: "90%" }}
                  >
                    Utilities
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item onClick={UpdateFirmClickHandlerCon}>
                      Update firmware - Concurrent
                    </Dropdown.Item>
                    <Dropdown.Item onClick={UpdateFirmClickHandlerDis}>
                      Update firmware - Disruptive
                    </Dropdown.Item>
                    {/* <Dropdown.Item onClick={RunPhypClickHandler}>
                      Run phyp mem mover
                    </Dropdown.Item>
                    <Dropdown.Item onClick={GetSystemInfoClickHandler}>
                      Get System Info
                    </Dropdown.Item>
                    <Dropdown.Item onClick={UpdateSystemClickHandler}>
                      Update System
                    </Dropdown.Item>
                    <Dropdown.Item onClick={ServicepackFWClickHandler}>
                      Service Pack FW Update
                    </Dropdown.Item> */}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Col>
          </Row>
          {"   "}

          <Row>
            <Col xxl={12}>
              <ListGroup>
                {/* {TaskHeader} */}
                {jobsLoading && loadingPlaceHolder}
                {/* {!jobsLoading && jobDataList} */}
              </ListGroup>
            </Col>
          </Row>

          <div style={{ marginTop: "auto" }}>
            <Row>
              <Col xxl={12}>{!jobsLoading && jobDataList}</Col>
            </Row>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
export default UtilitiesPageLeft;
