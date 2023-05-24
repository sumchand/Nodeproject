const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var session = require('express-session')
var fs = require("fs");
const cheerio = require('cheerio');





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
    //
    req.session.user = email;

    //
 // res.sendFile(path.join(__dirname, '/admin.html'));
//  res.render("admin");
 res.redirect('/admin');
}
else{
   res.send("Email or Password Wrong Try agani");
}


});

// login part end









// get for admin 
app.get("/admin", function(req, res) {
  // if (!req.session.user) {
  //   res.status(401).send("Unauthorized");
  //   return;
  // }
 
  //res.sendFile(path.join(__dirname, '/admin.html'));
 // res.send("post hit");
 res.render("admin");
  
});

// end get admin






























// creating file  starts

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
  const jsonFilePath = path.join(jsonFolderPath, `${title}.json`);

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
     // res.render('table');
     res.redirect('/table');
    });
  });
});

function generateFileLink(title, filename, fileLink) {
  const jsonData = { title: title, filename: filename, link: fileLink};
  return jsonData;
}


// creating files exit







// app.get("/table", (req, res) => {

//   res.send("table");
// });














// app.get('/table', (req, res) => {
//   // if (!req.session.user) {
//   //   res.status(401).sendFile(path.join(__dirname, '/FIRST.html'));
//   //   return;
//   // }
//   const folderPath = path.join(__dirname, 'files');

//   fs.readdir(folderPath, (err, files) => {
//     if (err) {
//       console.error('Error reading folder:', err);
//       return res.status(500).send('Error reading folder');
//     }

//     const jsonData = [];

//     files.forEach((file) => {
//       const filePath = path.join(folderPath, file);

//       try {
//         const fileData = fs.readFileSync(filePath, 'utf8');
//         const parsedData = JSON.parse(fileData);
//         jsonData.push(parsedData);
//       } catch (error) {
//         console.error(`Error parsing JSON in file ${file}:`, error);
//       }
//     });

//     //res.render('table', { jsonData });
//     res.send(jsonData);
//     console.log(jsonData);
//   });
// });








app.get('/table', (req, res) => {
  const folderPath = path.join(__dirname, 'json_files');

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

    const tableRows = jsonData.map((data) => {
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







app.post('/delete', (req, res) => {
  const { filename } = req.body;
  

  const jsonFolderPath = path.join(__dirname, 'json_files');
  const htmlFolderPath = path.join(__dirname, 'html_files');

  // Delete JSON file
  const jsonFilePath = path.join(jsonFolderPath, `${filename}.json`);
  fs.unlink(jsonFilePath, (err) => {
    if (err) {
      console.error('Error deleting JSON file:', err);
      res.status(500).send('Error deleting JSON file');
      return;
    }
    console.log('JSON file deleted:', jsonFilePath);
  });

  // Delete HTML file
  const htmlFilePath = path.join(htmlFolderPath, `${filename}.html`);
  fs.unlink(htmlFilePath, (err) => {
    if (err) {
      console.error('Error deleting HTML file:', err);
      res.status(500).send('Error deleting HTML file');
      return;
    }
    console.log('HTML file deleted:', htmlFilePath);
  });

  // Redirect to the table page after deletion
  res.redirect('/table');
});













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

    console.log(bodyContent);
    // res.status(200).send(bodyContent);
    res.render('edit', { filename, bodyContent });
    console.log(bodyContent);
  });
});


















app.listen(port);
console.log('Server started at http://localhost:' + port);