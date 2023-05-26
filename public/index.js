console.log("harshit");
// document.addEventListener("DOMContentLoaded", function() {
//     const mainContent = document.querySelector(".main-content");
  
//     // Create a new XMLHttpRequest object
//     const xhr = new XMLHttpRequest();
  
//     // Set up the request
//     xhr.open("GET", "punar", true);
  
//     // Define the onload event handler
//     xhr.onload = function() {
//       if (xhr.status === 200) {
//         // Replace the content of the mainContent element with the fetched HTML
//         mainContent.innerHTML = xhr.responseText;
//       } else {
//         console.log("Error fetching content. Status:", xhr.status);
//       }
//     };
  
//     // Send the request
//     xhr.send();
//   });
            //  fetch('data.json')
            // .then(response => response.json())
            // .then(data => {
            //     var template = document.getElementById("title").innerHTML;
            //     var rendered = Mustache.render(template, { data: data });
            //     var d = document.getElementById("display").innerHTML;
            //     document.getElementById("display").innerHTML = rendered;
            //     document.getElementById("display").innerHTML += d;
            // })
            // .catch(err => {
            //     console.log(err);
            // });


            document.addEventListener('DOMContentLoaded', () => {
                fetch('Article.json')
                  .then(response => {
                    if (!response.ok) {
                      throw new Error('Failed to fetch JSON');
                    }
                    return response.json();
                  })
                  .then(data => {
                    var template = document.getElementById("title").innerHTML;
                    var rendered = Mustache.render(template, { data: data });
                    var d = document.getElementById("display").innerHTML;
                    document.getElementById("display").innerHTML = rendered;
                    document.getElementById("display").innerHTML += d;
                  })
                  .catch(err => {
                    console.error(err);
                  });
              });
              




