import React from "react";

import UtilitiesPageLeft from "./UtilitiesPageLeft";
import UtilitiesPageRight from "./UtilitiesPageRight";

const UtilitiesPage = () => {
  console.log('Hey it\'s utilities')
  return (
    <React.Fragment>
      <UtilitiesPageLeft />
      <UtilitiesPageRight />
    </React.Fragment>
  );
};
{/* <UtilitiesPagePageLeft />
      <UtilitiesPagePageRight />  */}
export default UtilitiesPage;