const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var session = require('express-session')
var fs = require("fs");




//
var app = express()
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))
//

app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 8080;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// sendFile will go here
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/first.html'));
});







// post for first
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
    //
    req.session.user = email;

    //
  res.sendFile(path.join(__dirname, '/admin.html'));
}
else{
   res.send("Email or Password Wrong Try agani");
}


});

// login part end










// creating file  starts

app.post("/table", (req, res) => {
  let originalTitle = req.body.title;
  const title = originalTitle.replace(/\s/g, '');
  const jj = req.body.editor1;
  const fileLink = `./${title}.html`;
  const folderPath = './files'; // Specify the folder path where you want to create the files

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
    </head>
    <body>
      <h1>${title}</h1>
      ${jj}
    </body>
    </html>
  `;

  // Create the folder if it doesn't exist
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }

  const htmlFilePath = path.join(folderPath, `${title}.html`);
  const jsonFilePath = path.join(folderPath, `${title}.json`);

  fs.writeFile(htmlFilePath, htmlContent, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error writing HTML file");
      return;
    }

    const jsonData = generateFileLink(title, `${title}.html`, fileLink);

    fs.writeFile(jsonFilePath, JSON.stringify(jsonData), (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error writing JSON file");
        return;
      }

      console.log('HTML and JSON files have been created.');
     // res.sendFile(path.join(__dirname, '/views/table.ejs'));
     res.render('table'); 
    });
  });
});

function generateFileLink(title, filename, fileLink) {
  const jsonData = { title: title, filename: filename, link: fileLink };
  return jsonData;
}


// creating files exit










// get for admin 
app.get('/admin', function(req, res) {
  // if (!req.session.user) {
  //   res.status(401).send("Unauthorized");
  //   return;
  // }
 
  res.sendFile(path.join(__dirname, '/admin.html'));
  
});

// end get admin













app.get('/table', (req, res) => {
  // if (!req.session.user) {
  //   res.status(401).sendFile(path.join(__dirname, '/FIRST.html'));
  //   return;
  // }
  const folderPath = path.join(__dirname, 'files');

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return res.status(500).send('Error reading folder');
    }

    const jsonData = [];

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(fileData);
        jsonData.push(parsedData);
      } catch (error) {
        console.error(`Error parsing JSON in file ${file}:`, error);
      }
    });

    //res.render('table', { jsonData });
    res.send(jsonData);
    console.log(jsonData);
  });
});


app.post("/final", (req, res) => {

});














app.listen(port);
console.log('Server started at http://localhost:' + port);