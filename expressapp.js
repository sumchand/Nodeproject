const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var session = require('express-session')
var fs = require("fs");
const cheerio = require('cheerio');





//
var app = express()

//

app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 8080;



// sesssion




app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));



// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  if (req.session.user) {
    next(); // User is logged in, proceed to the next middleware/route handler
  } else {
    res.redirect('/'); // User is not logged in, redirect to the login page
  }
};

// session end

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// sendFile will go here
app.get("/", function(req, res) {
// res.sendFile(path.join(__dirname, '/first.html'));
 res.render("first");
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
    
    req.session.user = email; 

//  res.render("admin");
 res.redirect('/admin');
}
else{
   res.send("Email or Password Wrong Try agani");
}
});

// login part end









// get for admin 
app.get("/admin",requireLogin, function(req, res) {
  


 res.render("admin");
  
});


// end get admin






// !!!!!!!! Post call for table !!!!!!!!!!!



app.post("/table", (req, res) => {
  let originalTitle = req.body.title;
  const title = originalTitle.replace(/\s/g, '');
  const jj = req.body.editor1;
  const fileLink = `${title}.html`;
  const jsonFolderPath = './json_files'; // Specify the folder path where you want to create the JSON files
  const htmlFolderPath = './html_files'; // Specify the folder path where you want to create the HTML files

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
    </head>
    <body>
    ${jj}
    </body>
    </html>
  `;

  // Create the JSON folder if it doesn't exist
  if (!fs.existsSync(jsonFolderPath)) {
    fs.mkdirSync(jsonFolderPath);
  }

  // Create the HTML folder if it doesn't exist
  if (!fs.existsSync(htmlFolderPath)) {
    fs.mkdirSync(htmlFolderPath);
  }

  const htmlFilePath = path.join(htmlFolderPath, `${title}.html`);
  const jsonFilePath = path.join(jsonFolderPath, 'information.json');

  fs.writeFile(htmlFilePath, htmlContent, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error writing HTML file");
      return;
    }

    const jsonData = generateFileLink(title, `${title}.html`, fileLink);

    fs.readFile(jsonFilePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // File does not exist, create a new file with the initial data
          const initialData = {
            [title]: jsonData
          };
          fs.writeFile(jsonFilePath, JSON.stringify(initialData), (err) => {
            if (err) {
              console.error(err);
              res.status(500).send("Error writing JSON file");
              return;
            }
            console.log('HTML file has been created and data has been added to information.json.');
            res.redirect('/table');
          });
        } else {
          console.error(err);
          res.status(500).send("Error reading JSON file");
        }
        return;
      }

      let existingData = {};
      try {
        existingData = JSON.parse(data);
      } catch (parseError) {
        console.error(parseError);
        // Handle invalid JSON data
        existingData = {};
      }

      existingData[title] = jsonData;

      fs.writeFile(jsonFilePath, JSON.stringify(existingData), (err) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error writing JSON file");
          return;
        }

        console.log('HTML file has been created and data has been added to information.json.');
        res.redirect('/table');
      });
    });
  });
});

function generateFileLink(title, filename, fileLink) {
  const jsonData = { title: title, filename: filename, link: fileLink };
  return jsonData;
}
// !!!!!!! End Post CAll!!!!!!!!!!!!!!!




//!!!!!!!! get call for table !!!!!!!!!!!!!!!!
app.get('/table', (req, res) => {

  const jsonFolderPath = path.join(__dirname, 'json_files');
  const jsonFilePath = path.join(jsonFolderPath, 'information.json');

  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).send('Error reading JSON file');
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing JSON file:', parseError);
      return res.status(500).send('Error parsing JSON file');
    }

    const tableRows = Object.values(jsonData).map((data) => {
      return `
        <tr>
          <td>${data.title}</td>
          <td>${data.filename}</td>
          <td><a href="${data.link}">${data.link}</a></td>
          <td>
            <form action="/edit" method="post">
              <input type="hidden" name="filename" value="${data.title}">
              <button type="submit">Edit</button>
            </form>
          </td>
          <td>
            <form action="/delete" method="post">
              <input type="hidden" name="filename" value="${data.title}">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>
      `;
    });

    const tableHTML = `
      <style>
      body {
        background: rgb(195,195,95);
        background: linear-gradient(90deg, rgba(195,195,95,0.8085609243697479) 0%, rgba(0,212,255,1) 100%);
      } 
      
      table {
          width: 100%;
          border-collapse: collapse;
        }
        
        th, td {
          padding: 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #f2f2f2;
        }
        
  
        
        form {
          display: inline-block;
        }
        
        button {
          padding: 5px 10px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      </style>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Filename</th>
            <th>Link</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows.join('')}
        </tbody>
      </table>
    `;

    res.send(tableHTML);
  });
});





// !!!!!! Delete post !!!!!!!!!!


app.post('/delete', (req, res) => {
  const { filename } = req.body;

  const jsonFolderPath = path.join(__dirname, 'json_files');
  const htmlFolderPath = path.join(__dirname, 'html_files');
  const jsonFilePath = path.join(jsonFolderPath, 'information.json');

  // Read the JSON file
  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      res.status(500).send('Error reading JSON file');
      return;
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (parseError) {
      console.error('Error parsing JSON file:', parseError);
      res.status(500).send('Error parsing JSON file');
      return;
    }

    // Delete HTML file
    const htmlFilePath = path.join(htmlFolderPath, `${filename}.html`);
    fs.unlink(htmlFilePath, (err) => {
      if (err) {
        console.error('Error deleting HTML file:', err);
        res.status(500).send('Error deleting HTML file');
        return;
      }
      console.log('HTML file deleted:', htmlFilePath);

      // Delete corresponding entry from the JSON data
      delete jsonData[filename];

      // Update the JSON file with modified data
      fs.writeFile(jsonFilePath, JSON.stringify(jsonData), (err) => {
        if (err) {
          console.error('Error updating JSON file:', err);
          res.status(500).send('Error updating JSON file');
          return;
        }
        console.log('JSON file updated with deleted entry');

        // Redirect to the table page after deletion
        res.redirect('/table');
      });
    });
  });
});





// !!!!!!!!!! start post edit update!!!!!!!!!!!!!

app.post('/edit', (req, res) => {
 
  const htmlFolderPath = path.join(__dirname, 'html_files');
  const { filename } = req.body;

  let fileNameWithExtension = filename;
  if (!path.extname(filename)) {
    fileNameWithExtension = `${filename}.html`;
  }

  const filePath = path.join(htmlFolderPath, fileNameWithExtension);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', fileNameWithExtension, err);
      return res.status(500).json({ error: 'Failed to read file' });
    }

    const $ = cheerio.load(data);
    const bodyContent = $('body').text();

   // console.log(bodyContent);
    // res.status(200).send(bodyContent);
    res.render('edit', { filename, bodyContent });
    //console.log(bodyContent);
  });
});






//!!!!!!!!!! update post !!!!!!!!!!!!!!!!!
app.post("/update", (req, res) => {
  const title = req.body.title;
  const desp = req.body.editor1;

  // Set the path for HTML and JSON directories
const htmlDir = path.join(__dirname, 'html_files');
const jsonDir = path.join(__dirname, 'json_files');

const htmlFilePath = path.join(htmlDir, `${title}.html`);
const htmlContent = `
<html>
<head>
<title>${title}</title>
</head>
<body>
<h1>${title}</h1>
${desp}
</body>
</html>`;

console.log(desp);

fs.writeFile(htmlFilePath, htmlContent, (err) => {
  if (err) {
    console.error(err);
    res.status(500).send("Error writing HTML file");
    return;
  }


}
);

 res.redirect('/table');

});



// rendering port

app.listen(port);
console.log('Server started at http://localhost:' + port);