const axios = require('axios');
const options = {
  method: 'POST',
  url: 'https://result.uniraj.ac.in/index.php',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  data: 'Studroll=100736&Studdob=2004-08-31&OKbtn=',
  timeout: 100000,
};

axios(options)
  .then(response => response.text())
  .then(body => {
    console.log(body); // prints the response body as a string
  })
  .catch(error => {
    console.error(error);
  });