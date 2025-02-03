import React, { useState } from "react";
import OrderModal from "./OrderModal";

function Test() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (isModalOpen === true){
      setIsModalOpen(false)
    } else {
      setIsModalOpen(true);
    }
    
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex justify-center w-screen">
      <div className="flex justify-center">
        Order Management Systemkhsdklfsklfsjkhfsdfksdjhfdkjh
        <button className="p-2 bg-red-500 m-2" onClick={handleOpenModal}>
          Buy or Sell
        </button>
        {isModalOpen && <OrderModal onClose={handleCloseModal} />}
      </div>
    </div>
  );
}

export default Test;