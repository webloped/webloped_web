const services = [
    { name: "Immigration Services", url: "immigration-services.html" },
    { name: "Business Consulting", url: "business-consulting.html" },
    { name: "Tax Services", url: "tax-services.html" },
    { name: "Digital Marketing", url: "digital-marketing.html" },
    { name: "Event Planning", url: "event-planning.html" },
    { name: "Credit Card", url: "credit-card.html" },
    { name: "Graphic Design", url: "graphic-design.html" },
    { name: "Loan", url: "loan.html" },
    { name: "Legal Services", url: "legal-services.html" },
    { name: "Marketing", url: "marketing.html" },
    { name: "Project Management", url: "project-management.html" },
    { name: "Software Development", url: "software-development.html" },
    { name: "Car Dealership", url: "car-dealership.html" },
    { name: "Real Estate", url: "real-estate.html" },
    { name: "Travel Agency", url: "travel-agency.html" },
    { name: "Insurance", url: "insurance.html" },
    { name: "Web Development", url: "https://webloped.ca" }
];

function showSuggestions(value) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    
    if (value.length === 0) {
        return;
    }

    const filteredServices = services.filter(service => 
        service.name.toLowerCase().includes(value.toLowerCase())
    );

    // Sort the filtered services to prioritize those starting with the input value
    filteredServices.sort((a, b) => {
        const aStartsWith = a.name.toLowerCase().startsWith(value.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(value.toLowerCase());
        if (aStartsWith && !bStartsWith) {
            return -1;
        }
        if (!aStartsWith && bStartsWith) {
            return 1;
        }
        return a.name.localeCompare(b.name);
    });

    filteredServices.forEach(service => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = service.name;
        suggestionItem.onclick = () => {
            window.location.href = service.url;
        };
        suggestionsContainer.appendChild(suggestionItem);
    });

    // Store filtered services in a global variable for access in the keydown event
    window.filteredServices = filteredServices;
}

// Add event listener for Tab key to auto-complete with top result
document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('service-input');
    const suggestionsContainer = document.getElementById('suggestions');

    inputField.onkeydown = (event) => {
        if (event.key === 'Tab' && window.filteredServices && window.filteredServices.length > 0) {
            event.preventDefault();
            inputField.value = window.filteredServices[0].name;
            showSuggestions(window.filteredServices[0].name); // Update suggestions based on new input
        }
    };

    // Show suggestions when clicking on the search bar
    inputField.onclick = (event) => {
        if (inputField.value.length > 0) {
            showSuggestions(inputField.value);
        }
        suggestionsContainer.style.display = 'block';
        event.stopPropagation(); // Prevent the click event from propagating to the document
    };

    // Hide suggestions when clicking anywhere else on the screen
    document.onclick = () => {
        suggestionsContainer.style.display = 'none';
    };
});