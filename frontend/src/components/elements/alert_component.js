
import { Alert } from "react-bootstrap";

export const DismissibleAlert = (props) => {
  return (
    <Alert
      show={props.show}
      variant={props.variant}
      onClose={props.onClose}
      dismissible
    >
      <p>{props.message}</p>
    </Alert>
  );
};
