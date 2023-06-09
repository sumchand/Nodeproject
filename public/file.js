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


// new 
$(document).ready(function() {
  $('#download-button').click(function(e) {
    var href = $(this).find('a').attr('href'); // Get the href value of the anchor tag inside the button

    if (href && !href.endsWith('.pdf')) {
      e.preventDefault(); // Prevent the default behavior of the button click
      alert('No PDF available');
    }
  });
});



