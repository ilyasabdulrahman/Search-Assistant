import React, { useState, useEffect } from 'react';
import './App.css';
import { Table } from "./components/Table";
import Popup from "./components/popup";

function App() { 
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputItem, setInputItem] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [buttonPopup, setButtonPopup] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [serverErrorPopup, setServerErrorPopup] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('https://suggestme-app.onrender.com/items', {
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
      if (items.includes(inputItem)) {
        setShowDuplicatePopup(true);
        return;
      }

      const response = await fetch('https://suggestme-app.onrender.com/insert', {
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

      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateSuggestion = async () => {
    try {
      const response = await fetch('https://suggestme-app.onrender.com/suggestions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestion(data.suggestion);
        setButtonPopup(true);
      } else {
        setButtonPopup(false);
        setShowDuplicatePopup(false);
        setServerErrorPopup(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateItem = async (item) => {
    try {
      const response = await fetch('https://suggestme-app.onrender.com/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ item }),
        mode: 'cors'
      });
      const data = await response.json();
      console.log(data);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const closeDuplicatePopup = () => {
    setShowDuplicatePopup(false);
  };

  const closeServerErrorPopup = () => {
    setServerErrorPopup(false);
  };

  return (
    <div className="App">
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div>
          <h1 className='header'>SuggestMe</h1>
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
      {serverErrorPopup && (
        <div className='server-error-popup'>
          <Popup trigger={serverErrorPopup} closePopup={closeServerErrorPopup}>
            <h2>Server Error</h2>
            <p>An error occurred on the server. Please try again.</p>
          </Popup>
        </div>
      )}
    </div>
  );
}

export default App;
