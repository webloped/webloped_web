const headerHtml = document.getElementById('header-template').innerHTML;
const footerHtml = document.getElementById('footer-template').innerHTML;
const headHtml = document.getElementById('head-template').innerHTML;

document.body.innerHTML = '<header>' + headerHtml + '</header>' + document.body.innerHTML;
document.body.innerHTML = document.body.innerHTML + '<footer>' + footerHtml + '</footer>';
document.head.innerHTML = headHtml;

// // Function to load templates from an external file
// async function loadTemplates() {
//     try {
//       const response = await fetch('templet.html');
//       const text = await response.text();
//       const templateContainer = document.createElement('div');
//       templateContainer.innerHTML = text;
  
//       // Get the head, header, and footer templates
//       const headTemplate = templateContainer.querySelector('#head-template').innerHTML;
//       const headerTemplate = templateContainer.querySelector('#header-template').innerHTML;
//       const footerTemplate = templateContainer.querySelector('#footer-template').innerHTML;
  
//       // Insert the head template into the main document's head
//       document.head.innerHTML = headTemplate;
  
//       // Insert the header and footer into the main document
//       document.body.insertAdjacentHTML('afterbegin', headerTemplate);
//       document.body.insertAdjacentHTML('beforeend', footerTemplate);
//     } catch (error) {
//       console.error('Error loading templates:', error);
//     }
//   }
  
//   // Load the templates when the page loads
//   window.onload = loadTemplates;