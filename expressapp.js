const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var fs = require("fs");



const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 8080;

// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/first.html'));
});

app.post("/first", (req,res) => {
  const email = req.body.email;
  const pwd = req.body.password;

  const user = "harshitpandey78i@gmail.com";
  const pass = "123";

  console.log(req.body);

  console.log(email);
  console.log(pwd);
   if(email === user && pwd === pass )
   {
  res.sendFile(path.join(__dirname, '/admin.html'));
}
else{
   res.send("post hit");
}
});

app.post("/jk", (req,res) => {
const tt = req.body.title;
const jj = req.body.gb;
var writeStream = fs.createWriteStream("tt.txt");
writeStream.write(jj);
writeStream.write("Thank You.");
writeStream.end();

});

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, '/admin.html'));
});


app.listen(port);
console.log('Server started at http://localhost:' + port);