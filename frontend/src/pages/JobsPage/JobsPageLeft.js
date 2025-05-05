import React, { useEffect, useState, useCallback, useContext } from "react";
import {
  Row,
  Col,
  ListGroup,
  Card,
  Placeholder,
  Offcanvas,
  Form,
  Button,
} from "react-bootstrap";
import Paginate from "react-paginate";
import { useHistory } from "react-router-dom";

import styles from "../../UI/pages.module.css";
import MainContext from "../../store/main_context";
import styles_page from "./JobsPageLeft.module.css";
import { UserContext } from "../../hooks/UserContext";
import DataItem from "../../components/elements/DataItem";

const header_style = {
  backgroundColor: "rgb(174 192 156)",
  padding: "1rem",
};

const JobsPageLeft = () => {
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobData, setJobData] = useState([]);
  const context = useContext(MainContext);
  const userContext = useContext(UserContext);
  const history = useHistory();
  const subClassPageCss = `${styles_page.jobsPagination} ${styles_page.pagination}`;
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    pageCount: 10,
    currentPage: 1,
  });
  const [showCanvas, setShowCanvas] = useState(false);
  const handleClose = () => setShowCanvas(() => false);
  const handleFilter = () => setShowCanvas(() => true);

  // Handler to fetch list of available jobs(ID, User, TestCase, Status)
  const fetchAvailableJobs = useCallback(
    async (signal, limit, offset, status = `${context.jobLeft.status}`, user=`${context.jobLeft.user}`) => {
      try {
        const url = `${context.MAIN_URI}/ui_server/tests/${context.jobRight.jobid}?limit=${limit}&offset=${offset}&status=${status}&user=${user}`;
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
        setJobsLoading((ps) => false);
        setJobData(result["job_data"]);
        const data = {
          limit: result.limit,
          offset: result.offset,
          pageCount: result.pageCount,
        };
        setPagination((prevstate) => ({ ...prevstate, ...data }));
        context.jobRight.jobLogRef((ps) => result["job_log"]["data"]);
        context.jobRight.jobStatus = result["job_log"]["status"];
        context.jobRight.jobStartTime = result["job_log"]["time_start"];
        context.jobRight.jobEndTime = result["job_log"]["time_end"];
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("successfully aborted REST request");
        } else {
          setJobsLoading((ps) => false);
          console.log(error.message);
          context.jobRight.jobLogRef((ps) => "");
          context.jobRight.jobStatus = "UNKNOWN";
        }
      }
    },
    []
  );

  // Fetch jobs first time and then keep fetching periodically(every 1min.)
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    setJobsLoading((prevState) => true);
    context.jobLeft.user = context.jobLeft.user || userContext.user.email.split('@')[0]
    // Fetch jobs for first time and then attach timer interval for continuous fetching
    fetchAvailableJobs(
      signal,
      pagination.limit,
      pagination.offset,
      context.jobLeft.status,
      context.jobLeft.user
    );
    var counter = 0;
    var timerJobFetch = setInterval(() => {
      fetchAvailableJobs(
        signal,
        pagination.limit,
        pagination.offset,
        context.jobLeft.status,
        context.jobLeft.user
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

  // Handler for filtering tests based on inputs from Filter Canvas page
  const testFilterHandler = (event) => {
    event.preventDefault();
    const controller = new AbortController();
    const signal = controller.signal;
    setJobsLoading((prevState) => true);
    const status = document.getElementById("status_selected").value;
    const user = document.getElementById("user_selected").value;

    // Fetch jobs for first time and then attach timer interval for continuous fetching
    context.jobLeft.status = status;
    context.jobLeft.user = user;
    fetchAvailableJobs(signal, pagination.limit, pagination.offset, status, user);
    setShowCanvas((prevState) => false);
  };

  // Fetch specific job related info based on the jobid (ID, status, start, end, log)
  const fetchJobData = async (signal, jobid) => {
    try {
      context.jobRight.jobLogRef((prev_state) => "loading");
      const url = `${context.MAIN_URI}/ui_server/tests/log/${jobid}`;
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
        throw new Error(`Failed to fetch job data for job:${jobid}!`);
      }
      const logData = await response.json();
      context.jobRight.jobid = jobid;
      context.jobRight.jobLogRef((prevData) => logData["data"]);
      context.jobRight.jobStatus = logData["status"];
      context.jobRight.jobStartTime = logData["time_start"];
      context.jobRight.jobEndTime = logData["time_end"];
      context.jobRight.job_meta_data = logData;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("successfully aborted REST request");
      } else {
        console.log(error.message);
        context.jobRight.jobLogRef((prev_state) => "");
        context.jobRight.jobStatus = "UNKNOWN";
        context.jobRight.alertRef("danger", error.message);
        context.jobRight.job_meta_data = {};
      }
    }
  };

  // Handler that is triggered when Task Item on left pane is clicked
  const onJobItemClickHandler = (event, jobid) => {
    event.preventDefault();
    if (jobid === "ID") {
      return null;
    }
    context.jobRight.jobid = jobid;
    const controller = new AbortController();
    const signal = controller.signal;
    fetchJobData(signal, jobid);
  };

  // Handler for logic related to click of paginated links in the bottom of
  // jobs left pane.
  const handlePageClick = (event) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const next_offset = (pagination.limit - pagination.offset) * event.selected;
    const next_limit =
      (pagination.limit - pagination.offset) * (event.selected + 1);
    // We reset to default jobid
    context.jobRight.jobid = 0;
    fetchAvailableJobs(signal, next_limit, next_offset);
  };

  // Placeholder for Task TaskHeader component of Left Pane.
  const TaskHeader = (
    <b>
      <h6 style={header_style}>
        <DataItem
          user="User"
          id={-1}
          key="main_head"
          description="TestID"
          value="ID"
          indx={-1}
          spinner={false}
          status=""
          handleFilter={handleFilter}
        />
      </h6>
    </b>
  );

  // Placeholder for filter logic that appears as a canvas page on clicking
  // filter button
  const canvasFilter = (
    <Offcanvas show={showCanvas} onHide={handleClose}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title size="sm">Filter Jobs</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Form onSubmit={testFilterHandler}>
          <Form.Group className="mb-1" size="sm">
            <Form.Label>Status:</Form.Label>
            <Form.Select id="status_selected" size="sm">
              <option value="ALL" selected>
                ALL
              </option>
              <option value="PASS">Pass</option>
              <option value="FAIL">Fail</option>
              <option value="RUNNING">Running</option>
              <option value="TERMINATED">Terminated</option>
              <option value="TERMINATING">Terminating</option>
            </Form.Select>
            <br />
            <Form.Label>User:</Form.Label>
            <Form.Select id="user_selected" size="sm">
              <option value={userContext.user.shortName} selected>
                {userContext.user.shortName}
              </option>
              <option value="ALL">ALL</option>
            </Form.Select>
            <br/>
            <Button type="submit" variant="success" size="sm">
              Filter
            </Button>
          </Form.Group>
        </Form>
      </Offcanvas.Body>
    </Offcanvas>
  );

  // List of all the tasks that are available in current page
  const jobDataList = jobData.map((item, indx) => {
    return (
      <ListGroup.Item
        action
        variant="light"
        key={item.id}
        onClick={(event) => onJobItemClickHandler(event, item.id)}
      >
        <DataItem
          user={item.user}
          id={item.id}
          key={item.id}
          description={item.tp_func}
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
      <div className={styles.leftpane}>
        {canvasFilter}
        <Row>
          <Col xxl={12}>
            <ListGroup>
              {TaskHeader}
              {jobsLoading && loadingPlaceHolder}
              {!jobsLoading && jobDataList}
            </ListGroup>
          </Col>
        </Row>
        <div className={subClassPageCss}>
          <Paginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={".."}
            pageCount={pagination.pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={1}
            onPageChange={handlePageClick}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default JobsPageLeft;
