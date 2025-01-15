// Get the modal
var modal = document.getElementById("appointmentModal");

// Get the button that opens the modal
var btn = document.querySelector(".btn-primary");

// Get the <button> element that closes the modal
var closeButton = document.querySelector(".close-button");

// When the user clicks the button, open the modal 
btn.onclick = function(event) {
  event.preventDefault(); // Prevent default action
  modal.style.display = "block";
}

// When the user clicks on the close button, close the modal
closeButton.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
