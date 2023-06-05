import React, { useState, useEffect } from 'react';
import './App.css';
import { Table } from "./components/Table";
import Popup from "./components/Popup";

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputItem, setInputItem] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [buttonPopup, setButtonPopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://fetch-data-domain.onrender.com/items', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      const data = await response.json();
      setItems(data.items);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    setInputItem(event.target.value);
  };

  const handleInsertItem = async () => {
    try {
      // Check if the item already exists in the table
      console.log(items)
      if (items.includes(inputItem)) {
        setShowDuplicatePopup(true);
        return;
      }

      const response = await fetch('https://fetch-data-domain.onrender.com/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item: inputItem }),
        mode: 'cors'
      });
      const data = await response.json();
      console.log(data);
      setInputItem('');

      // Fetch updated data after insertion
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };
// http://locals
  const handleGenerateSuggestion = async () => {
    try {
      const response = await fetch('https://fetch-data-domain.onrender.com/suggestions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      const data = await response.json();
      setSuggestion(data.suggestion);

      // Set buttonPopup state to true to show the popup
      setButtonPopup(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateItem = async (item) => {
    try {
      const response = await fetch('https://fetch-data-domain.onrender.com/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item }),
        mode: 'cors'
      });
      const data = await response.json();
      console.log(data); // Log the response data
      fetchData(); // Fetch updated data after deletion
    } catch (error) {
      console.error(error);
    }
  };
  
  

  const closeDuplicatePopup = () => {
    setShowDuplicatePopup(false);
  };

  return (
    <div className="App">
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div>
          <h1 className='header'>Recent Search History</h1>
          <div className="suggestion">
            <input className="input-field" type="text" value={inputItem} onChange={handleInputChange} />
            <button className="insert-button" onClick={handleInsertItem}>Insert</button>
            <button className="generate-button" onClick={handleGenerateSuggestion}>Generate Suggestion</button>
          </div>
          <Table items={items} onUpdateItem={handleUpdateItem} />
        </div>
      )}
      {suggestion && (
        <div className='suggested'>
          <Popup trigger={buttonPopup} closePopup={() => setButtonPopup(false)}>
            <h2>Suggested Item:</h2>
            <p>{suggestion}</p>
          </Popup>
        </div>
      )}
      {showDuplicatePopup && (
        <div className='duplicate-popup'>
          <Popup trigger={showDuplicatePopup} closePopup={closeDuplicatePopup}>
            <h2>Duplicate Item</h2>
            <p>The item already exists in the table.</p>
          </Popup>
        </div>
      )}
    </div>
  );
}

export default App;
