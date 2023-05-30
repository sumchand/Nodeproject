const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
var session = require('express-session')
var fs = require("fs");
const cheerio = require('cheerio');
const { render } = require('ejs');
const mustacheExpress = require('mustache-express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const expressFileUpload = require('express-fileupload');








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
app.engine('ejs', mustacheExpress());
app.set('view engine', 'mustache');
//app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const staticpath=path.join(__dirname,"./public");
const uploadsPath = path.join(__dirname, 'uploads');
app.use(express.static(staticpath));
app.use('/uploads', express.static(uploadsPath));
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



// get for view practice
app.get("/view",function(req, res) {
  


  res.render("view");
   
 });


// end get view for practice






// !!!!!!!! Post call for table !!!!!!!!!!!



// ...


const uploadPDF = multer({
  storage: multer.diskStorage({
    destination: './pdf_files',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
  })
});

app.post('/table', uploadPDF.single('pdfFile'), (req, res) => {
  const originalTitle = req.body.title;
  const title = originalTitle.replace(/\s/g, '-');
  const editorContent = req.body.editor;
  const fileLink = `${title}.html`;
  const jsonFolderPath = './json_files';
  const htmlFolderPath = './html_files';
  const pdfFileName = req.file ? req.file.filename : '';
  const htmlContent = `
    <html>
    <head>
    <title>${title}</title>
    </head>
    <body>
    ${editorContent}
    </body>
    </html>`;

  if (!fs.existsSync(jsonFolderPath)) {
    fs.mkdirSync(jsonFolderPath);
  }

  if (!fs.existsSync(htmlFolderPath)) {
    fs.mkdirSync(htmlFolderPath);
  }

  const htmlFilePath = path.join(htmlFolderPath, `${title}.html`);
  const jsonFilePath = path.join(jsonFolderPath, 'information.json');

  fs.writeFile(htmlFilePath, htmlContent, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error writing HTML file');
      return;
    }

    const jsonData = generateFileLink(generateUniqueId(), originalTitle, fileLink, pdfFileName);

    fs.readFile(jsonFilePath, (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          const initialData = {};
          initialData[jsonData.id] = jsonData;
          fs.writeFile(jsonFilePath, JSON.stringify(initialData), (err) => {
            if (err) {
              console.error(err);
              res.status(500).send('Error writing JSON file');
              return;
            }
            console.log('HTML file has been created, and data has been added to information.json.');
            res.redirect('/table');
          });
        } else {
          console.error(err);
          res.status(500).send('Error reading JSON file');
        }
        return;
      }

      let existingData = {};
      try {
        existingData = JSON.parse(data);
      } catch (parseError) {
        console.error(parseError);
        existingData = {};
      }

      existingData[jsonData.id] = jsonData;

      fs.writeFile(jsonFilePath, JSON.stringify(existingData), (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error writing JSON file');
          return;
        }

        console.log('HTML file has been created, and data has been added to information.json.');
        res.redirect('/table');
        console.log(pdfFileName);
      });
    });
  });
});

function generateFileLink(id, title, fileLink, pdfFileName) {
  return { id, title, link: fileLink, pdf: pdfFileName };
}

function generateUniqueId() {
  return crypto.randomBytes(16).toString('hex');
}

// !!!!!!! End Post CAll!!!!!!!!!!!!!!!



app.get('/table/:link', (req, res) => {
  const link = req.params.link;
  const htmlFolderPath = path.join(__dirname, 'html_files');
  const htmlFilePath = path.join(htmlFolderPath, `${link}`);

  fs.readFile(htmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading HTML file');
      return;
    }

    res.send(data);
  });
});

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
          <td style="color:white">${data.id}</td>
          <td style="color:white">${data.title}</td>
          <td style="color: white; text-decoration: none;"><a href="/table/${encodeURIComponent(data.link)}" style="color: white;">${data.link}</a></td>
          <td>
            <form action="/edit" method="post">
              <input type="hidden" name="filename" value="${data.link}">
              <button type="submit">Edit</button>
            </form>
          </td>
          <td>
            <form action="/delete" method="post" onsubmit="return confirm('Are you sure you want to delete this file?');">
              <input type="hidden" name="filename" value="${data.link}">
              <button type="submit">Delete</button>
            </form>
          </td>
        </tr>
      `;
    });

    const tableHTML = `
      <style>
      body {
        background: hsla(213, 77%, 14%, 1);
        background: linear-gradient(90deg, hsla(213, 77%, 14%, 1) 0%, hsla(202, 27%, 45%, 1) 100%);
        background: -moz-linear-gradient(90deg, hsla(213, 77%, 14%, 1) 0%, hsla(202, 27%, 45%, 1) 100%);
        background: -webkit-linear-gradient(90deg, hsla(213, 77%, 14%, 1) 0%, hsla(202, 27%, 45%, 1) 100%);
        filter: progid: DXImageTransform.Microsoft.gradient( startColorstr="#08203E", endColorstr="#557C93", GradientType=1 );
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

        td {
          text-decoration: none;
          color: white;
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

    // Find the entry with the provided file link
    const entryToDelete = Object.values(jsonData).find(
      (entry) => entry.link === filename
    );

    if (!entryToDelete) {
      console.error('Entry not found in JSON file');
      res.status(404).send('Entry not found');
      return;
    }

    // Delete the HTML file
    const htmlFilePath = path.join(htmlFolderPath, filename);
    fs.unlink(htmlFilePath, (err) => {
      if (err) {
        console.error('Error deleting HTML file:', err);
        res.status(500).send('Error deleting HTML file');
        return;
      }
      console.log('HTML file deleted:', htmlFilePath);

      // Delete the entry from the JSON data
      delete jsonData[entryToDelete.id];

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
// !!!!!!!!!! start post edit update!!!!!!!!!!!!!
app.post('/edit', (req, res) => {
  const htmlFolderPath = path.join(__dirname, 'html_files');
  
  const { filename } = req.body;
  const fileNameWithExtension = path.extname(filename) ? filename : `${filename}.html`;
  
  const replacedFilename = fileNameWithExtension.replace(/-/g, ' '); // Replace hyphens with spaces
  
  const filePath = path.join(htmlFolderPath, fileNameWithExtension);
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', fileNameWithExtension, err);
      return res.status(500).json({ error: 'Failed to read file' });
    }
    
    const $ = cheerio.load(data);
    const bodyContent = $('body').html(); // Get the HTML content inside the <body> element, including the image
    
    res.render('edit', { filename: path.parse(replacedFilename).name, bodyContent });
    console.log(replacedFilename);
  });
});





//!!!!!!!!!! update post !!!!!!!!!!!!!!!!!
app.post("/update", (req, res) => {
  const title = req.body.title;
  const desp = req.body.editor;

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
//editor

// Set up storage for multer

// Set up storage for multer

const storage = multer.diskStorage({

  destination: 'uploads',

  filename: (req, file, cb) => {

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    const ext = path.extname(file.originalname);

    cb(null, uniqueSuffix + ext);

  }

});

// Set up multer upload

const upload = multer({ storage: storage });
// Serve static files from the "public" directory

app.use(express.static('public'));
// Handle image uploads

app.post('/upload', upload.single('upload'), (req, res) => {

  if (!req.file) {

    res.status(400).json({ error: 'No image file provided' });

    return;

  }
  // Access the uploaded image file using req.file

  // Perform any necessary operations with the file
  const imageUrl = `../uploads/${req.file.filename}`;
  res.json({ uploaded: true, url: imageUrl });

});
// image upload ends




//integrating frontend
// after click

app.get('/ques', (req, res) => {
  res.render('ques');
 
  const filePath = path.join(__dirname, 'json_files', 'information.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading information.json:', err);
      return;
    }
  
    try {
      const jsonData = JSON.parse(data);
      const titles = Object.values(jsonData).map(obj => obj.title);
      console.log(titles);
    } catch (parseError) {
      console.error('Error parsing information.json:', parseError);
    }
  });
});





// index render
app.get('/index', (req, res) => {

  res.render('index');

})


// replace
app.get('/replace-content', (req, res) => {
  const mainContentFilePath = path.join(__dirname, 'html_files', 'eshika-sharma.html');
  const currentHTMLFilePath = path.join(__dirname, 'views', 'ques.ejs');

  fs.readFile(mainContentFilePath, 'utf8', (err, mainContentData) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading main content file');
      return;
    }

    fs.readFile(currentHTMLFilePath, 'utf8', (err, currentHTMLData) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error reading current HTML file');
        return;
      }

      // Replace the entire <main> tag in the current HTML with the main content from eshika-sharma.html
      const updatedHTML = currentHTMLData.replace(/<main\b[^>]*>[\s\S]*<\/main>/, `<body>${mainContentData}</main>`);

      res.send(updatedHTML);
    });
  });
});







//mustace front page index file is used
app.get("/json", (req, res) => {
    
  const filePath = path.join(__dirname, 'json_files', 'information.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading information.json:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      const titles = Object.values(jsonData).map(obj => obj.title);
      res.render('index',{titles});
      //console.log(titles);
    } catch (parseError) {
      console.error('Error parsing information.json:', parseError);
    }
  });
});

app.get("/json/:title", (req, res) => {
  const title = req.params.title;
  const htmlFileName = title.replace(/\s+/g, '-') + '.html';
  const filePath = path.join(__dirname, 'html_files', htmlFileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Error reading HTML file');
      return;
    }

    const $ = cheerio.load(data);
    const mainContent = $('body').html();

    console.log(mainContent);
    res.render('ques', { title, mainContent });
  });
});

// rendering port

app.listen(port);
console.log('Server started at http://localhost:' + port);