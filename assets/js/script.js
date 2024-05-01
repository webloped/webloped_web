const headerHtml = document.getElementById('header-template').innerHTML;
const footerHtml = document.getElementById('footer-template').innerHTML;
const headHtml = document.getElementById('head-template').innerHTML;

document.body.innerHTML = '<header>' + headerHtml + '</header>' + document.body.innerHTML;
document.body.innerHTML = document.body.innerHTML + '<footer>' + footerHtml + '</footer>';
document.head.innerHTML = headHtml;