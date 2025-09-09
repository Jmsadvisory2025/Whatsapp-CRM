import React from "react";
import AllIcons from "../assets/images/assets";

const { WhatsappIcon } = AllIcons;

const Whatsapp = () => {
  return (
    <>
      <div className="flex justify-center items-center h-screen text-4xl gap-5">
      <img src={WhatsappIcon} alt="" />
        Coming Soon
      </div>
    </>
  );
};

export default Whatsapp;
