import React, { useState } from "react";
import "./Table.css";
import { BsFillTrashFill, BsFillPencilFill, BsFillXCircleFill, BsFillCheckCircleFill } from "react-icons/bs";
import Popup from "./Popup";

export const Table = ({ items, onUpdateItem }) => {
  const [editItem, setEditItem] = useState(null);
  const [updatedText, setUpdatedText] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  const handleUpdateClick = (item) => {
    setEditItem(item);
    setUpdatedText(item);
  };

  const handleDeleteClick = async (item) => {
    try {
      const response = await fetch("https://fetch-data-domain.onrender.com/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item }),
      });
      const data = await response.json();
      console.log(data); // Log the response data
      onUpdateItem(item); // Remove the item from the UI
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmUpdate = async (item) => {
    // Check if the updated text is a duplicate
    if (items.includes(updatedText)) {
      setShowDuplicatePopup(true);
      handleDisregardUpdate(item);
      return;
    }

    try {
      const response = await fetch("https://fetch-data-domain.onrender.com/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ item, updatedText }),
      });
      const data = await response.json();
      console.log(data); // Log the response data
      setEditItem(null);
      setUpdatedText("");
      onUpdateItem(item); // Update the item in the UI
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisregardUpdate = (item) => {
    setEditItem(null);
    setUpdatedText("");
  };

  const handleInputChange = (event) => {
    setUpdatedText(event.target.value);
  };

  const closeDuplicatePopup = () => {
    setShowDuplicatePopup(false);
  };

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th className="expand">Item</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={index}
              className={index === hoveredRow ? "highlighted-row" : ""}
              onMouseEnter={() => setHoveredRow(index)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <td>{index + 1}</td>
              <td>
                {editItem === item ? (
                  <input
                    type="text"
                    value={updatedText}
                    onChange={handleInputChange}
                  />
                ) : (
                  item
                )}
              </td>
              <td>
                <span className="actions">
                  <BsFillTrashFill
                    className="delete-btn"
                    onClick={() => handleDeleteClick(item)}
                  />
                  {editItem === item ? (
                    <>
                      <BsFillCheckCircleFill
                        className="confirm-btn"
                        onClick={() => handleConfirmUpdate(item)}
                      />
                      <BsFillXCircleFill
                        className="disregard-btn"
                        onClick={() => handleDisregardUpdate(item)}
                      />
                    </>
                  ) : (
                    <BsFillPencilFill
                      className="update-btn"
                      onClick={() => handleUpdateClick(item)}
                    />
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showDuplicatePopup && (
        <Popup trigger={showDuplicatePopup} closePopup={closeDuplicatePopup}>
          <h2>Duplicate Item</h2>
          <p>The item already exists in the table.</p>
        </Popup>
      )}
    </div>
  );
};
