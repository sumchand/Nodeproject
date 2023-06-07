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
    // User is logged in, proceed to the next middleware/route handler
    next();
  } else {
    if (req.url === '/table') {
      // User is not logged in, but trying to access the login page, so allow access
       res.redirect('/admin')
     // res.redirect('/table');
    } else {
      // User is not logged in and trying to access a different page, redirect to the login page
      res.redirect('/admin');
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
res.redirect('/table');
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

app.post('/table',uploadPDF.single('pdfFile'), (req, res) => {
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
              <button class="download-button"> <a href="../pdf_files/${pdfFileName}">Download All QnA in PDF</a></button>
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


//tables started


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
app.get('/table', requireLogin, (req, res) => {
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
          <td style="color:white">${data.title}</td>
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
        background: rgb(89,89,92);
        background: linear-gradient(90deg, rgba(89,89,92,0.9836309523809523) 100%, rgba(168,168,173,0.9836309523809523) 100%, rgba(30,30,31,1) 100%);
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
  
      .button-container {
        text-align: right;
        margin-top: 20px;
        margin-right: 20px;
      }
  
      .heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
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
        color: white;
        background-color: transparent; / Remove the background color /
      }
  
      .plus-button:hover {
        background-color: white;
        color: #4CAF50;
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

//!!!!!!!!!! update post !!!!!!!!!!!!!!!!!
app.post("/update", (req, res) => {
  const originalTitle = req.body.title;
  const title = originalTitle.replace(/\s/g, '-');
  const desp = req.body.editor;
  const pdflink = req.body.href

  // Set the path for HTML and JSON directories
const htmlDir = path.join(__dirname, 'html_files');
const jsonDir = path.join(__dirname, 'json_files');

const htmlFilePath = path.join(htmlDir, `${title}.html`);
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
      <li class="active"><a href="question-listing.html"></a></li>
    </ul>
  </nav>
        <main class="main-content">
            <div class="listing-head">
            <ul class="breadcrumb">
                <li><a href="index">Home</a></li>
                <li>${originalTitle}</li>
            </ul>
            <button class="download-button"> <a href="../pdf_files/">Download All QnA in PDF</a></button>
        </div>
            <div class="listing-title" id ="main">
            <div id ="maincontent">
              
            ${desp}
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

console.log(desp);
console.log(title);

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
app.get("/:title", (req, res) => {
  const title = req.params.title;
  const filePath = path.join(__dirname, 'html_files', title);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Error accessing HTML file:', err);
      res.status(404).send('File not found');
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
// app.get("/:title", (req, res) => {
//   const title = req.params.title;
//   const formattedTitle = title.replace("-", " ").replace(".html", "");
//   const filePath = path.join(__dirname, 'html_files', title);

//   console.log("Formatted Title:", formattedTitle);
//   console.log("File Path:", filePath);

//   fs.access(filePath, fs.constants.F_OK, (err) => {
//     if (err) {
//       console.error('Error accessing HTML file:', err);
//       res.status(404).send('File not found');
//       return;
//     }

//     console.log("HTML File accessed successfully");

//     fs.readFile(filePath, 'utf8', (err, fileData) => {
//       if (err) {
//         console.error('Error reading HTML file:', err);
//         res.status(500).send('Error reading HTML file');
//         return;
//       }

//       console.log("HTML file data read successfully");

//       const filePathh = path.join(__dirname, 'json_files', 'information.json');

//       fs.readFile(filePathh, 'utf8', (err, jsonFileData) => {
//         if (err) {
//           console.error('Error reading JSON file:', err);
//           return res.status(500).send('Error reading JSON file');
//         }

//         console.log("JSON file data read successfully");

//         try {
//           const jsonData = JSON.parse(jsonFileData);
//           const titles = Object.values(jsonData).map(item => item.title);

//           // Filter out titles that match the formatted title
//           const filteredTitles = titles.filter(item => {
//             const formattedItem = item;
//             return formattedItem !== formattedTitle;
//           });

//           console.log("Filtered Titles:", filteredTitles);

//           const renderedHtml = mustache.render(fileData, { titles: filteredTitles });

//           console.log("HTML rendered successfully");

//           res.send(renderedHtml);
//         } catch (error) {
//           console.error('Error parsing JSON:', error);
//           return res.status(500).send('Error parsing JSON');
//         }
//       });
//     });
//   });
// });




// rendering port

app.listen(port);
console.log('Server started at http://localhost:' + port);