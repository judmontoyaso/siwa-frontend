import { PacmanLoader } from "react-spinners";
import React from "react";

const Spinner = () => {
  return (
    <div className="flex pacman-loader justify-center items-center w-full h-screen">
      <PacmanLoader className="pacman-loader" color="#0A283D"  />
    </div>
  );
};

export default Spinner;
