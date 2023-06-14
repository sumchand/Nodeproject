document.addEventListener('DOMContentLoaded', function() {
  fetch('/json_files/information.json')
    .then(response => response.json())
    .then(data => {
      var titles = Object.values(data).map(obj => obj.title);

      // Loop through the titles and create list items
      titles.forEach(title => {
        var fileName = title.replace(/ /g, '-') + '.html';
        console.log(fileName);

        if (title.trim() !== '') { // Check if the title is not empty
          var listItem = document.createElement('li');
          var link = document.createElement('a');
          link.href = fileName;
          link.textContent = title;

          // Check if the title matches the file name
          if (getCurrentFileName() === fileName) {
            listItem.classList.add('active');
          }

          listItem.appendChild(link);
          
          // Check if the link has a valid href and text content
          if (link.href.trim() !== '' && link.textContent.trim() !== '') {
            document.querySelector('#left-navbar-placeholder ul').appendChild(listItem);
          }
        }
      });
    });
});

function getCurrentFileName() {
  var path = window.location.pathname;
  var fileNameIndex = path.lastIndexOf('/') + 1;
  return path.substr(fileNameIndex);
}



function toggleUpload() {
  var uploadButton = document.getElementById("uploadButton");
  if (uploadButton.checked) {
    // Unchecked state
    uploadButton.removeAttribute("checked");
    uploadButton.classList.remove("checked");
  } else {
    // Checked state
    uploadButton.setAttribute("checked", "checked");
    uploadButton.classList.add("checked");
  }
}

// for navbar values
document.addEventListener("DOMContentLoaded", function() {
  // Select the navbar's ul element
  var navbarUl = document.querySelector(".main-navbar-links ul");

  // Create new list items
  var listItem1 = document.createElement("li");
  var listItem2 = document.createElement("li");
  var listItem3 = document.createElement("li");
  var listItem4 = document.createElement("li");

  // Create anchor tags
  var anchor1 = document.createElement("a");
  var anchor2 = document.createElement("a");
  var anchor3 = document.createElement("a");
  var anchor4 = document.createElement("a");

  // Set attributes for anchor tags
  anchor1.setAttribute("href", "/");
  anchor2.setAttribute("href", "https://www.c-sharpcorner.com/learn/");
  anchor2.setAttribute("target", "_blank");
  anchor3.setAttribute("href", "https://www.c-sharpcorner.com/chapters/");
  anchor3.setAttribute("target", "_blank");
  anchor4.setAttribute("href", "https://www.c-sharpcorner.com/ebooks/");
  anchor4.setAttribute("target", "_blank");

  // Set text content for anchor tags
  anchor1.textContent = "Home";
  anchor2.textContent = "Learn";
  anchor3.textContent = "Events";
  anchor4.textContent = "E-book";
  

  // Add the "active" class to the first list item
  listItem1.classList.add("active");

  // Append the anchor tags to the list items
  listItem1.appendChild(anchor1);
  listItem2.appendChild(anchor2);
  listItem3.appendChild(anchor3);
  listItem4.appendChild(anchor4);

  // Append the list items to the navbar's ul element
  navbarUl.appendChild(listItem1);
  navbarUl.appendChild(listItem2);
  navbarUl.appendChild(listItem3);
  navbarUl.appendChild(listItem4);
});

//stricky

// Get the toggle button element
const toggleButton = document.getElementById('toggle-button');

// Get the left navbar element
const leftNavbar = document.getElementById('left-navbar-placeholder');

// Function to handle the toggle button click
function toggleNavbar() {
  // Toggle the display property of the left navbar
  leftNavbar.style.display = leftNavbar.style.display === 'none' ? 'block' : 'none';
}

// Add an event listener to the toggle button
toggleButton.addEventListener('click', () => {
  toggleNavbar();
});

// Add a resize event listener to toggle the navbar based on window width
window.addEventListener('resize', () => {
  const windowWidth = window.innerWidth;
  if (windowWidth <= 800) {
    toggleNavbar();
  } else {
    // Show the navbar if the window width is greater than 600 pixels
    leftNavbar.style.display = 'block';
  }
});






