
import React, { useContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

import MainContext from "../../store/main_context";

const EventNotifications = () => {
  const [showNotify, setShowNotify] = useState({
    show: false,
    header: "TestHeader",
    body: "TestBody",
    variant: "dark",
  });
  // Assign references that can be used and updated
  const context = useContext(MainContext);
  context.notify.setShowNotify = setShowNotify;

  return (
    <ToastContainer className="p-3" position="top-end">
      <Toast
        onClose={() => {
          const newState = { show: false, variant: 'dark' , header: '', body: ''};
          setShowNotify((prevState) => ({ ...prevState, ...newState }));
        }}
        delay={8000}
        autohide
        show={showNotify.show}
        className="d-inline-block m-1"
        bg={showNotify.variant}
      >
        <Toast.Header closeButton={true}>
          <strong className="me-auto">{showNotify.header}</strong>
        </Toast.Header>
        <Toast.Body className={showNotify.variant === "dark" && "text-white"}>
          {showNotify.body}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default EventNotifications;
