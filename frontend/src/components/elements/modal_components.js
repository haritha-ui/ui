import React from "react";
import { Button, Modal } from "react-bootstrap";

export const StaticModal = (props) => {
  return (
    <Modal show={props.showModal} onHide={props.closeModal} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{props.header}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.body}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={props.closeModal}>
          Close
        </Button>
        <Button variant="primary" onClick={props.okHandler}>{props.ok_button_value}</Button>
      </Modal.Footer>
    </Modal>
  );
};
