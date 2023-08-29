import React, { useEffect, useState } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import axios from 'axios';
import Navigation from './Navigation';

const AdminView = () => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Fetch suggestions from the backend
    const token = localStorage.getItem('token'); // Get the authentication token from local storage
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/get-suggestions`, {
      headers: { Authorization: `Bearer ${token}` }, // Attach the token in the request header
    })
      .then(response => {
        setSuggestions(response.data);
      })
      .catch(error => {
        console.error('Error fetching suggestions:', error);
      });
  }, []);

  const handleDeleteClick = (suggestionId) => {
    // Delete suggestion from the backend
    const token = localStorage.getItem('token'); // Get the authentication token from local storage
    axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/delete-suggestion/${suggestionId}`, {
      headers: { Authorization: `Bearer ${token}` }, // Attach the token in the request header
    })
      .then(response => {
        console.log('Suggestion deleted:', response.data);
        // Update the list of suggestions by removing the deleted suggestion
        setSuggestions(prevSuggestions => prevSuggestions.filter(suggestion => suggestion.id !== suggestionId));
      })
      .catch(error => {
        console.error('Error deleting suggestion:', error);
      });
  };

  return (
    <>
      <Navigation />
      <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Admin View - Manage Suggestions
      </Typography>
      <List>
        {suggestions.map(suggestion => (
          <ListItem key={suggestion.id}>
            <ListItemText primary={suggestion.suggestion_text} secondary={suggestion.response} />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleDeleteClick(suggestion.id)}
            >
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
    </Container>
    </>
    
  );
};

export default AdminView;
