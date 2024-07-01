const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import CORS

const app = express();
const PORT = 3001; // You can use any available port

app.use(bodyParser.json());
app.use(cors()); // Use CORS

app.post('/api/jsonModel', (req, res) => {
  const jsonModel = req.body;
  const filePath = path.join(__dirname, './jsonModelForTesting.json');

  fs.writeFile(filePath, JSON.stringify(jsonModel, null, 2), (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send('Internal Server Error');
    }

    res.status(200).send('File updated successfully');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
