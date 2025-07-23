// DOM Elements
const sliders = {
    age: document.getElementById('age-slider'),
    geneticRisk: document.getElementById('genetic-risk-slider'),
    diseaseProgress: document.getElementById('disease-progress-slider'),
    bmi: document.getElementById('bmi-slider')
};

const smokingOptions = document.querySelectorAll('input[name="smoking"]');
const sexOptions = document.querySelectorAll('input[name="sex"]');
const randomizeBtn = document.querySelector('.randomize-btn');
const predictionCards = document.querySelectorAll('.prediction-card');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSliders();
    initializeControls();
    initializeProgressBars();
    updatePredictions();
    
    // Initialize with some medical info cards
    setTimeout(() => {
        // Create initial info cards matching the image
        const humanSilhouette = document.querySelector('.human-silhouette');
        const initialCards = [
            'Hypertension',
            'Ethnicity: Asian',
            'Family History: No',
            'Medication Use: Statins'
        ];
        
        initialCards.forEach((text, index) => {
            createAnimatedInfoCard(text, index, humanSilhouette);
        });
    }, 1000);
});

// Initialize slider functionality
function initializeSliders() {
    // Update slider values in real-time
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        const valueDisplay = slider.parentElement.nextElementSibling;
        
        slider.addEventListener('input', function() {
            let value = parseFloat(this.value);
            
            // Format value based on slider type
            if (key === 'bmi') {
                value = value.toFixed(1);
            } else {
                value = Math.round(value);
            }
            
            valueDisplay.textContent = value;
            updatePredictions();
            updateVisualizations();
            updateRNAColors();
        });
    });
}

// Initialize progress bars
function initializeProgressBars() {
    const RADIUS = 24; // Matches the radius in SVG
    const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
    
    // Initialize all progress circles
    document.querySelectorAll('.progress__value').forEach(progressValue => {
        progressValue.style.strokeDasharray = CIRCUMFERENCE;
        
        // Get initial percentage from data attribute
        const percentage = parseInt(progressValue.getAttribute('data-percentage')) || 0;
        updateProgressBar(progressValue, percentage, CIRCUMFERENCE);
    });
}

// Update individual progress bar
function updateProgressBar(progressValue, percentage, circumference) {
    const progress = Math.max(0, Math.min(100, percentage)) / 100;
    const dashoffset = circumference * (1 - progress);
    
    progressValue.style.strokeDashoffset = dashoffset;
    progressValue.style.transition = 'stroke-dashoffset 0.5s ease';
}

// Initialize control functionality
function initializeControls() {
    // Smoking options
    smokingOptions.forEach(option => {
        option.addEventListener('change', function() {
            updatePredictions();
            updateVisualizations();
            updateRNAColors();
        });
    });

    // Sex options
    sexOptions.forEach(option => {
        option.addEventListener('change', function() {
            updatePredictions();
            updateVisualizations();
            updateRNAColors();
        });
    });

    // Randomize button
    randomizeBtn.addEventListener('click', randomizeProfile);
}

// Update prediction percentages based on current inputs
function updatePredictions() {
    const currentData = getCurrentData();
    const predictions = calculateRiskPredictions(currentData);
    
    // Update each prediction card
    predictionCards.forEach((card, index) => {
        const percentage = card.querySelector('.risk-percentage');
        const timeline = card.querySelector('.timeline-indicator');
        const progressValue = card.querySelector('.progress__value');
        
        let riskValue;
        switch(index) {
            case 0: // Heart Failure
                riskValue = predictions.heartFailure;
                break;
            case 1: // Lung Cancer
                riskValue = predictions.lungCancer;
                break;
            case 2: // Kidney Failure
                riskValue = predictions.kidneyFailure;
                break;
        }
        
        // Animate percentage change
        animateValue(percentage, parseInt(percentage.textContent), riskValue, 500);
        
        // Update progress bar
        if (progressValue) {
            const RADIUS = 24;
            const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
            progressValue.setAttribute('data-percentage', riskValue);
            updateProgressBar(progressValue, riskValue, CIRCUMFERENCE);
        }
        
        // Update timeline position based on risk level
        updateTimelinePosition(timeline, riskValue);
    });
}

// Get current form data
function getCurrentData() {
    const selectedSmoking = document.querySelector('input[name="smoking"]:checked');
    const selectedSex = document.querySelector('input[name="sex"]:checked');
    
    return {
        age: parseInt(sliders.age.value),
        geneticRisk: parseInt(sliders.geneticRisk.value),
        diseaseProgress: parseInt(sliders.diseaseProgress.value),
        bmi: parseFloat(sliders.bmi.value),
        smoking: selectedSmoking ? selectedSmoking.value : 'none',
        sex: selectedSex ? selectedSex.value : 'male'
    };
}

// Calculate risk predictions based on inputs (simplified AI simulation)
function calculateRiskPredictions(data) {
    // Base risk factors
    let heartRisk = 15;
    let lungRisk = 8;
    let kidneyRisk = 5;
    
    // Age factor
    const ageFactor = (data.age - 18) / (90 - 18);
    heartRisk += ageFactor * 20;
    lungRisk += ageFactor * 15;
    kidneyRisk += ageFactor * 18;
    
    // Genetic risk factor
    const geneticFactor = data.geneticRisk / 100;
    heartRisk += geneticFactor * 25;
    lungRisk += geneticFactor * 20;
    kidneyRisk += geneticFactor * 15;
    
    // Disease progress factor
    const progressFactor = data.diseaseProgress / 100;
    heartRisk += progressFactor * 15;
    lungRisk += progressFactor * 12;
    kidneyRisk += progressFactor * 20;
    
    // BMI factor
    if (data.bmi > 25) {
        const bmiFactor = (data.bmi - 25) / 15;
        heartRisk += bmiFactor * 10;
        kidneyRisk += bmiFactor * 8;
    }
    
    // Smoking factor
    const smokingMultipliers = {
        'none': 1,
        'light': 1.2,
        'moderate': 1.5,
        'heavy': 1.8,
        'very-heavy': 2.2
    };
    lungRisk *= smokingMultipliers[data.smoking];
    heartRisk *= Math.min(smokingMultipliers[data.smoking], 1.3);
    
    // Sex factor (simplified)
    if (data.sex === 'male') {
        heartRisk *= 1.2;
        lungRisk *= 1.1;
    }
    
    // Ensure values are within reasonable bounds
    return {
        heartFailure: Math.min(Math.max(Math.round(heartRisk), 1), 99),
        lungCancer: Math.min(Math.max(Math.round(lungRisk), 1), 99),
        kidneyFailure: Math.min(Math.max(Math.round(kidneyRisk), 1), 99)
    };
}

// Animate value changes
function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easedProgress);
        
        element.textContent = current + '%';
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Update timeline indicator position
function updateTimelinePosition(timeline, riskValue) {
    // Get all time spans within this timeline
    const timeSpans = timeline.querySelectorAll('span');
    
    // Remove active class from all spans
    timeSpans.forEach(span => span.classList.remove('active'));
    
    // Determine which time marker should be active based on risk level
    let activeIndex;
    if (riskValue < 33) {
        // Low risk: Activate 1month marker (first span)
        activeIndex = 0;
    } else if (riskValue < 67) {
        // Medium risk: Activate 3month marker (second span)
        activeIndex = 1;
    } else {
        // High risk: Activate 6month marker (third span)
        activeIndex = 2;
    }
    
    // Add active class to the appropriate span
    if (timeSpans[activeIndex]) {
        timeSpans[activeIndex].classList.add('active');
    }
}

// Update visualizations (body silhouette, etc.)
function updateVisualizations() {
    const currentData = getCurrentData();
    updateInfoCards(currentData);
    updateBodyHighlights(currentData);
}

// Comprehensive medical data for randomization
const medicalDataSets = {
    physiological: [
        'Blood Pressure: 120/80 mmHg',
        'Blood Pressure: 140/90 mmHg',
        'Blood Pressure: 110/70 mmHg',
        'Cholesterol: LDL 100 mg/dL',
        'Cholesterol: HDL 60 mg/dL',
        'Cholesterol: Total 180 mg/dL',
        'Blood Glucose: 95 mg/dL',
        'HbA1c: 5.4%',
        'HbA1c: 6.2%',
        'eGFR: 90 mL/min',
        'Creatinine: 1.0 mg/dL',
        'Creatinine: 1.4 mg/dL'
    ],
    lifestyle: [
        'Alcohol: None',
        'Alcohol: Occasional',
        'Alcohol: Regular',
        'Activity: Sedentary',
        'Activity: Moderate',
        'Activity: Active',
        'Diet: Mediterranean',
        'Diet: Western',
        'Diet: Vegetarian',
        'Sleep: Poor Quality',
        'Sleep: Fair Quality',
        'Sleep: Good Quality'
    ],
    genetic: [
        'BRCA1: Negative',
        'BRCA2: Positive',
        'APOE: e3/e4',
        'APOE: e3/e3',
        'CRP: 2.1 mg/L',
        'IL-6: Elevated',
        'TNF-alpha: Normal',
        'Insulin: 8.5 μIU/mL',
        'Leptin: 12 ng/mL',
        'Adiponectin: Low',
        'Methylation: MGMT+',
        'Methylation: MLH1-'
    ],
    medical: [
        'Family History: Heart Disease',
        'Family History: Cancer',
        'Family History: Diabetes',
        'Family History: None',
        'Medication: Statins',
        'Medication: ACE Inhibitors',
        'Medication: Metformin',
        'Medication: None',
        'Diagnosis: Hypertension',
        'Diagnosis: Pre-diabetes',
        'Surgery: None',
        'Surgery: CABG 2019',
        'Vaccination: COVID-19 Complete',
        'Vaccination: HPV Complete'
    ]
};

// Original gene colors from CSS (matching the biological visualization)
const GENE_COLORS = {
    green: '#93DE35',    // Normal/healthy expression
    red: '#FF7676',      // High expression (potential risk)
    teal: '#3ECE77',     // Moderate expression
    yellow: '#FFF700',   // Variable expression
    orange: '#FFA222'    // Elevated expression
};



// Calculate gene expression pattern based on user inputs
function calculateGeneExpression(data) {
    const pattern = [];
    const colors = Object.values(GENE_COLORS);
    
    // Base pattern influenced by genetic risk
    const geneticFactor = data.geneticRisk / 100;
    const diseaseFactor = data.diseaseProgress / 100;
    const ageFactor = (data.age - 18) / (90 - 18);
    const bmiFactor = Math.max(0, (data.bmi - 18.5) / (40 - 18.5));
    
    // Smoking impact (major factor for gene expression)
    const smokingImpact = {
        'none': 0.1,
        'light': 0.3,
        'moderate': 0.6,
        'heavy': 0.8,
        'very-heavy': 1.0
    };
    
    const smokingFactor = smokingImpact[data.smoking] || 0.1;
    
    // Calculate overall risk score
    const riskScore = (geneticFactor * 0.3 + diseaseFactor * 0.25 + ageFactor * 0.2 + 
                      bmiFactor * 0.15 + smokingFactor * 0.1);
    
    // Determine pattern type based on risk
    let patternType;
    if (riskScore < 0.3) {
        patternType = 'healthy';
    } else if (riskScore < 0.5) {
        patternType = 'normal';
    } else if (riskScore < 0.7) {
        patternType = 'variable';
    } else if (riskScore < 0.85) {
        patternType = 'elevated';
    } else {
        patternType = 'risk';
    }
    
    // Log the pattern type for debugging
    console.log(`Gene Expression Pattern: ${patternType} (Risk Score: ${riskScore.toFixed(2)})`);
    console.log(`Factors - Genetic: ${geneticFactor.toFixed(2)}, Disease: ${diseaseFactor.toFixed(2)}, Age: ${ageFactor.toFixed(2)}, BMI: ${bmiFactor.toFixed(2)}, Smoking: ${smokingFactor.toFixed(2)}`);
    
    // Generate realistic mixed pattern with all 5 colors
    for (let i = 0; i < 18; i++) {
        let baseColor;
        
        // Create more varied patterns based on risk type
        if (patternType === 'healthy') {
            // Mostly green and teal with occasional yellow
            const rand = Math.random();
            if (rand < 0.6) baseColor = GENE_COLORS.green;
            else if (rand < 0.9) baseColor = GENE_COLORS.teal;
            else baseColor = GENE_COLORS.yellow;
        } else if (patternType === 'normal') {
            // Mix of green, teal, and yellow
            const rand = Math.random();
            if (rand < 0.5) baseColor = GENE_COLORS.green;
            else if (rand < 0.8) baseColor = GENE_COLORS.teal;
            else baseColor = GENE_COLORS.yellow;
        } else if (patternType === 'variable') {
            // Mix of all colors with emphasis on yellow and orange
            const rand = Math.random();
            if (rand < 0.3) baseColor = GENE_COLORS.green;
            else if (rand < 0.5) baseColor = GENE_COLORS.teal;
            else if (rand < 0.7) baseColor = GENE_COLORS.yellow;
            else if (rand < 0.9) baseColor = GENE_COLORS.orange;
            else baseColor = GENE_COLORS.red;
        } else if (patternType === 'elevated') {
            // Mix with emphasis on orange and red
            const rand = Math.random();
            if (rand < 0.2) baseColor = GENE_COLORS.green;
            else if (rand < 0.4) baseColor = GENE_COLORS.teal;
            else if (rand < 0.6) baseColor = GENE_COLORS.yellow;
            else if (rand < 0.8) baseColor = GENE_COLORS.orange;
            else baseColor = GENE_COLORS.red;
        } else { // risk
            // Heavy emphasis on red and orange
            const rand = Math.random();
            if (rand < 0.1) baseColor = GENE_COLORS.green;
            else if (rand < 0.2) baseColor = GENE_COLORS.teal;
            else if (rand < 0.3) baseColor = GENE_COLORS.yellow;
            else if (rand < 0.6) baseColor = GENE_COLORS.orange;
            else baseColor = GENE_COLORS.red;
        }
        
        // Apply factor-based variations
        let finalColor = baseColor;
        
        // Age-related changes (more red/orange with age)
        if (ageFactor > 0.6) {
            if (baseColor === GENE_COLORS.green && Math.random() > 0.7) {
                finalColor = GENE_COLORS.teal;
            } else if (baseColor === GENE_COLORS.teal && Math.random() > 0.6) {
                finalColor = GENE_COLORS.yellow;
            }
        }
        
        // Smoking-related changes (more red/orange with smoking)
        if (smokingFactor > 0.5) {
            if (baseColor === GENE_COLORS.teal && Math.random() > 0.6) {
                finalColor = GENE_COLORS.orange;
            } else if (baseColor === GENE_COLORS.yellow && Math.random() > 0.5) {
                finalColor = GENE_COLORS.orange;
            }
        }
        
        // Genetic risk variations
        if (geneticFactor > 0.7) {
            if (baseColor === GENE_COLORS.green && Math.random() > 0.8) {
                finalColor = GENE_COLORS.yellow;
            } else if (baseColor === GENE_COLORS.teal && Math.random() > 0.7) {
                finalColor = GENE_COLORS.yellow;
            }
        }
        
        // Disease progress variations
        if (diseaseFactor > 0.6) {
            if (baseColor === GENE_COLORS.yellow && Math.random() > 0.6) {
                finalColor = GENE_COLORS.orange;
            } else if (baseColor === GENE_COLORS.orange && Math.random() > 0.5) {
                finalColor = GENE_COLORS.red;
            }
        }
        
        // BMI-related changes
        if (bmiFactor > 0.5) {
            if (baseColor === GENE_COLORS.green && Math.random() > 0.7) {
                finalColor = GENE_COLORS.teal;
            } else if (baseColor === GENE_COLORS.teal && Math.random() > 0.6) {
                finalColor = GENE_COLORS.yellow;
            }
        }
        
        pattern.push(finalColor);
    }
    
    return pattern;
}

// Get gene expression summary for display
function getGeneExpressionSummary(data) {
    const pattern = calculateGeneExpression(data);
    const colorCounts = {
        green: 0,
        red: 0,
        teal: 0,
        yellow: 0,
        orange: 0
    };
    
    pattern.forEach(color => {
        if (color === GENE_COLORS.green) colorCounts.green++;
        else if (color === GENE_COLORS.red) colorCounts.red++;
        else if (color === GENE_COLORS.teal) colorCounts.teal++;
        else if (color === GENE_COLORS.yellow) colorCounts.yellow++;
        else if (color === GENE_COLORS.orange) colorCounts.orange++;
    });
    
    return {
        total: pattern.length,
        healthy: colorCounts.green,
        elevated: colorCounts.orange + colorCounts.red,
        variable: colorCounts.yellow,
        moderate: colorCounts.teal
    };
}

// Update RNA expression colors with biological logic
function updateRNAColors() {
    const currentData = getCurrentData();
    const genePattern = calculateGeneExpression(currentData);
    const summary = getGeneExpressionSummary(currentData);
    
    const geneBars = document.querySelectorAll('.gene-bar');
    geneBars.forEach((bar, index) => {
        if (!bar.classList.contains('gene-bar-dots')) {
            // Add slight delay for staggered animation
            setTimeout(() => {
                const newColor = genePattern[index] || GENE_COLORS.green;
                
                // Use solid color for now (gradient syntax was causing issues)
                bar.style.background = newColor;
                bar.style.transition = 'background 0.5s ease, transform 0.3s ease';
                
                // Add subtle pulse effect
                bar.style.transform = 'scaleY(1.1)';
                setTimeout(() => {
                    bar.style.transform = 'scaleY(1)';
                }, 150);
            }, index * 50);
        }
    });
    
    // Update gene count display with meaningful information
    const geneCountElement = document.querySelector('.gene-count');
    if (geneCountElement) {
        const riskLevel = summary.elevated > summary.healthy ? 'Elevated' : 
                         summary.elevated > 5 ? 'Moderate Risk' : 'Normal';
        geneCountElement.textContent = `${summary.total} genes • ${riskLevel}`;
    }
    
    // Add visual feedback to RNA section
    const rnaSection = document.querySelector('.rna-expression');
    if (rnaSection) {
        rnaSection.style.transform = 'scale(1.01)';
        rnaSection.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            rnaSection.style.transform = 'scale(1)';
        }, 300);
    }
}

// Update info cards around the body
function updateInfoCards(data) {
    const infoCards = document.querySelectorAll('.info-card');
    
    // Only update if not in randomization mode
    if (!window.isRandomizing) {
        // Simple updates based on current data
        const hasHypertension = data.age > 50 || data.bmi > 28;
        
        infoCards.forEach(card => {
            const span = card.querySelector('span');
            
            if (card.classList.contains('hypertension')) {
                span.textContent = hasHypertension ? 'Hypertension' : 'Normal Blood Pressure';
            } else if (card.classList.contains('medication')) {
                const medicationIndex = data.age > 60 ? 1 : 0;
                const medications = ['None', 'Statins'];
                span.textContent = `Medication Use: ${medications[medicationIndex]}`;
            }
        });
    }
}

// Update body highlights based on risk factors
function updateBodyHighlights(data) {
    // This could add visual highlights to different body parts
    // based on risk factors - for now, we'll just log the data
    console.log('Body visualization updated with data:', data);
}

// Randomize profile function
function randomizeProfile() {
    // Set randomizing flag
    window.isRandomizing = true;
    
    // Add loading animation to button
    randomizeBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        randomizeBtn.style.transform = '';
    }, 150);
    
    // Randomize slider values
    sliders.age.value = Math.floor(Math.random() * (90 - 18)) + 18;
    sliders.geneticRisk.value = Math.floor(Math.random() * 100);
    sliders.diseaseProgress.value = Math.floor(Math.random() * 100);
    sliders.bmi.value = (Math.random() * (40 - 15) + 15).toFixed(1);
    
    // Update displayed values
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        const valueDisplay = slider.parentElement.nextElementSibling;
        let value = parseFloat(slider.value);
        
        if (key === 'bmi') {
            value = value.toFixed(1);
        } else {
            value = Math.round(value);
        }
        
        valueDisplay.textContent = value;
    });
    
    // Randomize smoking
    const smokingValues = ['none', 'light', 'moderate', 'heavy', 'very-heavy'];
    const randomSmoking = smokingValues[Math.floor(Math.random() * smokingValues.length)];
    document.getElementById(randomSmoking).checked = true;
    
    // Randomize sex
    const sexValues = ['male', 'female'];
    const randomSex = sexValues[Math.floor(Math.random() * sexValues.length)];
    document.getElementById(randomSex).checked = true;
    
    // Update RNA colors
    updateRNAColors();
    
    // Randomize medical info cards with advanced system
    randomizeMedicalInfoCards();
    
    // Update predictions
    updatePredictions();
    
    // Add visual feedback
    addRandomizeEffect();
    
    // Reset randomizing flag
    setTimeout(() => {
        window.isRandomizing = false;
    }, 2000);
}

// Advanced medical info cards randomization
function randomizeMedicalInfoCards() {
    const humanSilhouette = document.querySelector('.human-silhouette');
    
    // Remove existing info cards
    const existingCards = humanSilhouette.querySelectorAll('.info-card');
    existingCards.forEach(card => {
        card.style.opacity = '0';
        setTimeout(() => card.remove(), 300);
    });
    
    // Combine all medical data
    const allMedicalData = [
        ...medicalDataSets.physiological,
        ...medicalDataSets.lifestyle,
        ...medicalDataSets.genetic,
        ...medicalDataSets.medical
    ];
    
    // Select 4-6 random items
    const numItems = Math.floor(Math.random() * 3) + 4; // 4-6 items
    const selectedData = [];
    const usedIndices = new Set();
    
    while (selectedData.length < numItems) {
        const randomIndex = Math.floor(Math.random() * allMedicalData.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            selectedData.push(allMedicalData[randomIndex]);
        }
    }
    
    // Create new info cards with random positions
    setTimeout(() => {
        selectedData.forEach((data, index) => {
            createAnimatedInfoCard(data, index, humanSilhouette);
        });
    }, 400);
}

// Create animated info card with random positioning
function createAnimatedInfoCard(text, index, container) {
    const card = document.createElement('div');
    card.className = 'info-card';
    card.innerHTML = `<span>${text}</span>`;
    
    // Fixed positions matching the image layout
    const positions = [
        { top: '120px', left: '20px' },    // Hypertension - left of chest
        { top: '80px', right: '20px' },    // Ethnicity - right of head
        { top: '350px', left: '30px' },    // Family History - left of hip
        { top: '280px', right: '30px' }    // Medication - right of leg
    ];
    
    const basePosition = positions[index % positions.length];
    
    // Add slight random variations for natural feel
    const topVariation = Math.floor(Math.random() * 15) - 7; // ±7px
    const sideVariation = Math.floor(Math.random() * 8) - 4; // ±4px
    
    if (basePosition.top) {
        card.style.top = `${parseInt(basePosition.top) + topVariation}px`;
    }
    if (basePosition.left) {
        card.style.left = `${parseInt(basePosition.left) + sideVariation}px`;
    }
    if (basePosition.right) {
        card.style.right = `${parseInt(basePosition.right) + sideVariation}px`;
    }
    
    // Start invisible
    card.style.opacity = '0';
    card.style.transform = 'translateY(10px) scale(0.9)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    
    // Add to container
    container.appendChild(card);
    
    // Animate in with staggered timing
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
    }, index * 150 + 100);
}

// Add visual effect when randomizing
function addRandomizeEffect() {
    // Add shimmer effect to prediction cards
    predictionCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.transform = 'scale(1.02)';
            card.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            
            setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
            }, 300);
        }, index * 100);
    });
    
    // Add glow effect to body visualization
    const bodyContainer = document.querySelector('.body-container');
    bodyContainer.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.5)';
    setTimeout(() => {
        bodyContainer.style.boxShadow = '';
    }, 1000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        this.classList.add('active');
    });
});

// Learn More button functionality
document.querySelector('.learn-more-btn').addEventListener('click', function() {
    // Smooth scroll to AI pipeline section
    document.querySelector('.ai-pipeline').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
});

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    if (hero) {
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animateElements = document.querySelectorAll('.prediction-card, .pipeline-stage, .control-group');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Add loading states for dynamic content
function showLoadingState(element) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
}

function hideLoadingState(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Space bar to randomize profile
    if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        randomizeProfile();
    }
    
    // Arrow keys for slider navigation
    if (e.target.classList.contains('slider')) {
        if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            setTimeout(updatePredictions, 50);
        }
    }
});

// Touch support for mobile devices
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartY - touchEndY;
    
    if (Math.abs(diff) > swipeThreshold) {
        // Add swipe animations or actions here if needed
        console.log('Swipe detected:', diff > 0 ? 'up' : 'down');
    }
}

// Error handling and fallbacks
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // Provide fallback functionality
    if (e.error.message.includes('slider')) {
        console.log('Slider functionality failed, using fallback');
        // Implement fallback slider functionality
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(function() {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
        }, 0);
    });
} 