const services = [
    "Accounting",
    "Business Consulting",
    "Customer Support",
    "Digital Marketing",
    "Event Planning",
    "Financial Services",
    "Graphic Design",
    "Human Resources",
    "IT Support",
    "Legal Services",
    "Marketing",
    "Project Management",
    "Sales",
    "Software Development",
    "Training and Development",
    "Web Development"
];

function showSuggestions(value) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    
    if (value.length === 0) {
        return;
    }

    const filteredServices = services.filter(service => 
        service.toLowerCase().includes(value.toLowerCase())
    );

    filteredServices.forEach(service => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.textContent = service;
        suggestionItem.onclick = () => {
            document.querySelector('.search-bar').value = service;
            suggestionsContainer.innerHTML = '';
        };
        suggestionsContainer.appendChild(suggestionItem);
    });
}