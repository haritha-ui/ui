import { Spinner, Badge, Button, Row, Col } from "react-bootstrap";

import global_styles from "../../UI/pages.module.css";
import filter_logo from "../../UI/images/filter_3.png";

//let timerJobLog = null;
const h6_size = { fontSize: "small" };

const DataItem = (props) => {
  // Set the status indicator based on the data received
  let status = null;
  if (props.status === "PASS") {
    status = <Badge bg="success">Pass</Badge>;
  } else if (props.status === "FAIL") {
    status = <Badge bg="danger">Fail</Badge>;
  } else if (props.status === "RUNNING") {
    status = (
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
        variant="success"
      />
    );
  } else if (props.status === "TERMINATING") {
    status = (
      <Spinner
        as="span"
        animation="border"
        size="sm"
        role="status"
        aria-hidden="true"
        variant="warning"
      />
    );
  } else {
    status = <Badge bg="warning">Kill</Badge>;
  }

  // Filter button placeholder
  const filterPlaceHolder = (
    <Button
      variant="success"
      size="sm"
      onClick={props.handleFilter}
      style={{ float: "left", fontSize: "small" }}
    >
      <img
        src={filter_logo}
        alt="Filter"
        className={global_styles.filter_logo}
      />
    </Button>
  );

  // Placeholder structure for a single Row of Job data
  const DataItem_Structure = (
    <Row style={{ fontSize: "small" }} className={"justify-content-md-center"}>
      <Col md={2}>
        <h6 style={{ fontSize: "small" }}>{props.value}</h6>
      </Col>
      <Col md={4}>
        {props.user.length <= 10 ? props.user : props.user.slice(0, 10) + ".."}
      </Col>
      <Col md={4}>
        {props.description.length <= 10
          ? props.description
          : props.description.slice(0, 10) + ".."}
      </Col>
      {!props.spinner && <Col md={2}>{filterPlaceHolder}</Col>}
      {props.spinner && <Col md={2}>{status}</Col>}
    </Row>
  );

  return DataItem_Structure;
};

export default DataItem;
