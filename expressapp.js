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
const mustache = require('mustache');
const swal = require('sweetalert');


//
var app = express()

//

app.use(bodyParser.urlencoded({ extended: true }));
const port = process.env.PORT || 8080;


// sesssion

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000, // 30 minutes in milliseconds
  },
}));


// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
  const currentTime = new Date().getTime();
  
  if (req.session.user) {
    // User is logged in, update the last activity time
    req.session.lastActivity = currentTime;
    next();
  } else {
    if (req.url === '/table') {
      // User is not logged in, but trying to access the login page, so allow access
      res.redirect('/admin');
    } else {
      // User is not logged in and trying to access a different page
      // Check if the session has expired
      if (req.session.lastActivity && currentTime - req.session.lastActivity <= sessionTimeout) {
        // Session has not expired, redirect to the login page
        res.redirect('/admin');
      } else {
        // Session has expired, clear the session and redirect to the login page
        req.session.destroy();
        res.redirect('/admin');
      }
    }
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
const uploadsPathh = path.join(__dirname, 'json_files');
app.use(express.static(staticpath));
app.use('/uploads', express.static(uploadsPath));
app.use('/json_files', express.static(uploadsPathh));
// sendFile will go here
app.get("/admin", function(req, res) {
// res.sendFile(path.join(__dirname, '/first.html'));
 res.render("first");
});


// post for first
app.post("/admin", (req,res) => {
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
    req.session.loggedIn = true;

//  res.render("admin");
//  res.redirect('/editor');
res.redirect('/dashboard');
}
else{
   res.send("Email or Password Wrong Try agani");
}
});

// login part end


// get for admin 
app.post("/editor", function(req, res) {
  
 res.render("admin");
  
});



// // get for view practice
// app.get("/view",function(req, res) {
  


//   res.render("view");
   
//  });


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

app.post('/dashboard',uploadPDF.single('pdfFile'),requireLogin, (req, res) => {
  const originalTitle = req.body.title;
  const title = originalTitle.replace(/\s/g, '-');
  const editorContent = req.body.editor;
  const fileLink = `${title}.html`;
  const jsonFolderPath = './json_files';
  const htmlFolderPath = './html_files';
  const pdfFileName = req.file ? req.file.filename : '';
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/ejs/3.1.6/ejs.min.js"></script>
      <link rel="stylesheet" href="/mystylesheet.css">
      <title>${originalTitle}</title>
  </head>
  
  <body>
      <header class="navbar" id="header-placeholder">
                  <div class="logo">
                  <a href="/" id="home-link"><img src="./images/interviews-logo.png" alt=""></a>
                  </div>
                  <div class="main-navbar-links">
                      <ul>
                          <li><a class="active" href="/">Home</a></li>
                          <li><a href="https://www.c-sharpcorner.com/learn/" target="_blank">Learn</a></li>
                          <li><a href="https://www.c-sharpcorner.com/chapters/" target="_blank">Events</a></li>
                          <li><a href="https://www.c-sharpcorner.com/ebooks/" target="_blank">E-book</a></li>  
                      </ul>
                  </div>
      </header>
  
      <section class="wrapper">
      <nav class="left-navbar" id ="left-navbar-placeholder">
      <ul>
       
      </ul>
    </nav>
          <main class="main-content">
              <div class="listing-head">
              <ul class="breadcrumb">
                  <li><a href="index">Home</a></li>
                  <li>${originalTitle}</li>
              </ul>
              <button class="download-button"> <a href="../pdf_files/${pdfFileName}">Download</a></button>
          </div>
              <div class="listing-title" id ="main">
              <div id ="maincontent">
              ${editorContent}
              </div>
              </div>
          </main>
              <aside class="rightside">
                  <img src="/images/image_2023_05_19T10_14_50_816Z.png" alt="">
              </aside>
          
      </section>
  
  
   <footer>
                  <div class="footer-content">
                  <p>&copy;2023 interview.help All rights reserved</p>
              </div>
      </footer>
  
  </body>
  <script src="file.js" type="module"></script>
  </html>
    `;

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
            res.redirect('/dashboard');
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
        res.redirect('/dashboard');
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


//tables started pdf
app.get('/pdf_files/:pdf', (req, res) => {
  const pdf = req.params.pdf;
  const pdfFolderPath = path.join(__dirname, 'pdf_files');
  const pdfFilePath = path.join(pdfFolderPath, pdf);

  fs.readFile(pdfFilePath, (err, data) => {
    if (err) {
      console.error(err);
      //res.status(500).send('Error reading PDF file');
      res.send("no file is available");
      return;
    }

    res.contentType('application/pdf');
    res.send(data);
  });
});

app.get('/dashboard/:link', (req, res) => {
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

app.get('/dashboard', requireLogin, (req, res) => {
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
    const tableRows = Object.values(jsonData).map((data,index) => {
      const rowColor = index % 2 === 0 ? 'even' : 'odd';
      return `
      <tr class="${rowColor}"> <!-- Add the class to the table row -->
      <td >${data.title}</td>
      <td style="color:black; "><a href="/dashboard/${encodeURIComponent(data.link)}" style=" text-decoration: none; color:black;">${data.link}</a></td>
      <td>
        <form action="/edit" method="post">
          <input type="hidden" name="filename" value="${data.link}" >
          <button type="submit" style="background: none; border: none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
        </svg>
          </button>

        </form>
      </td>
      <td>
        <form action="/delete" method="post" onsubmit="return confirm('Are you sure you want to delete this file?');">
          <input type="hidden" name="filename" value="${data.link}">
          <button type="submit" style="background: none; border: none;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
  <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
</svg>
</button>
        </form>
      </td>
    </tr>
  `;
  });
   const tableHTML = `
    <style>
      body {
        background-color: white;
      } 
  
      table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid black;
             
      }
  
      th, td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
      }
  
      th {
        background-color: #333333;
        color:white;
      }
  
      table tr.even {
        background-color: 	#DCDCDC; / Alternate color for even rows /
      }
  
      table tr.odd {
        background-color: white;  / Alternate color for odd rows /
      }
  

      }



      tabel ,td {
        text-decoration: none;
      
   
      }
  
      form {
        display: inline-block;
      }
  
      button {
        padding: 5px 10px;
        background-color: #4CAF50;
        color: black;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
  
      .button-container {
        text-align: right;
        margin-top: 20px;
        margin-right: 20px;
      }
  
      .heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: black;
        font-size: 24px;
        margin-bottom: 20px;
        padding: 0 20px;
      }
  
      .plus-button {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
        border: none; / Remove the border /
        font-size: 30px; / Increase the font size to make the add sign bigger /
        line-height: 1;
        cursor: pointer;
        color: black;
        background-color: transparent; / Remove the background color /
      }
  
      .plus-button:hover {
        background-color: gray;
        color: white;
      }  
    </style>
    <div class="heading">
      <h1>Dashboard</h1>
      <div class="button-container">
        <form action="/editor" method="post">
          <button type="submit" class="plus-button">
            <span>Add Interview Questions</span> <!-- Modified to include the "+" button inside the text -->
          </button>
        </form>
      </div>
    </div>
    <table>
    <thead>
      <tr>
        <th>Title</th>
        <th>Filename</th>
       
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
        res.redirect('/dashboard');
      });
    });
  });
});

// !!!!!!!!!! start post edit update!!!!!!!!!!!!!
// !!!!!!!!!! start post edit update!!!!!!!!!!!!!
app.post('/edit', (req, res) => {
  const htmlFolderPath = path.join(__dirname, 'html_files');

  const { filename } = req.body;
  console.log(filename);
  const fileNameWithExtension = path.extname(filename) ? filename : `${filename}`;
 

// Use fileNameWithoutExtension in your code


  const replacedFilename = fileNameWithExtension.replace(/-/g, ' '); // Replace hyphens with spaces
  const fileNameWithoutExtension = path.basename(replacedFilename, path.extname(replacedFilename));

  const filePath = path.join(htmlFolderPath, fileNameWithExtension);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', fileNameWithExtension, err);
      return res.status(500).json({ error: 'Failed to read file' });
    }

    const $ = cheerio.load(data);
    const bodyContent = $('#maincontent').html(); // Get the HTML content inside the <div id="maincontent">

    const anchorTag = $('button.download-button > a'); // Select the anchor tag within the button using the '>'
    const href = anchorTag.attr('href'); // Get the href attribute of the anchor tag
    console.log(href);

    res.render('edit', { filename: fileNameWithoutExtension, bodyContent,pdf: href });

    console.log(replacedFilename);
  });
});


const update = multer({
  storage: multer.diskStorage({
    destination: './pdf_files',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
    }
  })
});

// Create a multer upload instance with the defined storage
//const update = multer({ storage: pdfStoragee });

app.post('/update',update.single('pdfFile'), (req, res) => {
  const htmlFolderPath = path.join(__dirname, 'html_files');

  const { title, editor, pdfFile } = req.body;
  const fileName = title.replace(/ /g, '-') + '.html';
  const filePath = path.join(htmlFolderPath, fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', fileName, err);
      return res.status(500).json({ error: 'Failed to read file' });
    }

    const $ = cheerio.load(data);
    $('#maincontent').html(editor); // Update the HTML content inside the <div id="maincontent">
    console.log(req.file);
    if (req.file) {

      const downloadLink = `<a href="../pdf_files/${req.file.filename}">Download</a>`;
      $('.download-button').html(downloadLink); // Update the content of the <button class="download-button">
    }

    const updatedData = $.html();

    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', fileName, err);
        return res.status(500).json({ error: 'Failed to update file' });
      }

      res.redirect('/dashboard'); // Redirect to the dashboard or any other page after successful update
    });
  });
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
app.get("/:title", (req, res) => {
  const title = req.params.title;
  const filePath = path.join(__dirname, 'html_files', title);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Error accessing HTML file:', err);
      //res.status(404).send('File not found');
      res.send('No PDF Available');
      return;
    }

    fs.readFile(filePath, 'utf8', (err, fileData) => {
      if (err) {
        console.error('Error reading HTML file:', err);
        res.status(500).send('Error reading HTML file');
        return;
      }

      const filePathh = path.join(__dirname, 'json_files', 'information.json');

      fs.readFile(filePathh, 'utf8', (err, jsonFileData) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          return res.status(500).send('Error reading JSON file');
        }

        try {
          const jsonData = JSON.parse(jsonFileData);
          const titles = Object.values(jsonData).map(item => item.title);

        
      const renderedHtml = mustache.render(fileData, { titles });

      res.send(renderedHtml);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          return res.status(500).send('Error parsing JSON');
        }
      });
    });
  });
});


//mustace front page index file is used

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, 'json_files', 'information.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading information.json:', err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      const titlesWithLinks = Object.values(jsonData).map(obj => {
        const title = obj.title;
        const link = obj.title.replace(/\s+/g, '-')+ '.html';
        return { title, link };
      });
      console.log(titlesWithLinks);
      res.render('index', { titlesWithLinks });
    } catch (parseError) {
      console.error('Error parsing information.json:', parseError);
    }
  });
});
// rendering port

app.listen(port);
console.log('Server started at http://localhost:' + port);