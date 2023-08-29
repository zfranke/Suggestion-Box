import React, { useState } from 'react';
import { Container, TextField, Button, Alert } from '@mui/material';
import Navigation from './Navigation';

function FormView() {
  const [suggestion, setSuggestion] = useState('');
  const [success, setSuccess] = useState(false); // Add this line

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/submit-suggestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ suggestion }),
      });

      if (response.ok) {
        // Suggestion submitted successfully
        setSuggestion('');
        setSuccess(true);
      } else {
        // Handle error
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <>
      <Navigation />
      <Container>
      <h2>Suggestion Box</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Suggestion"
          fullWidth
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
        />
        <Button type="submit">Submit</Button>
      </form>

      {success &&
      <Alert severity="success">Suggestion submitted successfully</Alert>
      }

    </Container>
    </>
    
  );
}

export default FormView;
