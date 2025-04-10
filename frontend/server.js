const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

express.static.mime.define({'application/javascript': ['js']});
express.static.mime.define({'text/css': ['css']});

// CORS
app.use(cors());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
