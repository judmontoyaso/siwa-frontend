import { PacmanLoader } from "react-spinners";
import React from "react";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen">
      <PacmanLoader color="#0A283D"  />
    </div>
  );
};

export default Spinner;
