// DOM Elements
const sliders = {
    age: document.getElementById('age-slider'),
    geneticRisk: document.getElementById('genetic-risk-slider'),
    diseaseProgress: document.getElementById('disease-progress-slider'),
    bmi: document.getElementById('bmi-slider')
};

// Smoking discrete slider elements
const smokingDots = document.querySelectorAll('.slider-dot');
const smokingLabels = document.querySelectorAll('.smoking-labels span');
const sliderFill = document.querySelector('.slider-fill');

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
        // Prevent conflicts with randomization
        if (window.isRandomizingCards) return;
        
        // Reset position tracking for initial cards
        existingCardPositions = [];
        
        // Create initial info cards matching the image
        const humanSilhouette = document.querySelector('.human-silhouette');
        const initialCards = [
            'Hypertension',
            'Ethnicity: Asian',
            'Family History: No',
            'Medication Use: Statins'
        ];
        
        // Ensure exactly 4 initial cards
        if (initialCards.length > 6) {
            initialCards.splice(6); // Trim to max 6 if somehow there are more
        }
        
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
        const valueDisplay = slider.parentElement.parentElement.querySelector('.slider-value');

        // Function to update slider value and position
        function updateSliderValue() {
            let value = parseFloat(slider.value);

            // Format value based on slider type
            if (key === 'bmi') {
                value = value.toFixed(1);
            } else {
                value = Math.round(value);
            }

            valueDisplay.textContent = value;

            // Calculate thumb position for tooltip
            const min = parseFloat(slider.min) || 0;
            const max = parseFloat(slider.max) || 100;
            const percent = (parseFloat(slider.value) - min) / (max - min);
            const sliderWidth = slider.offsetWidth;
            const thumbWidth = 24; // match your CSS thumb size
            const pos = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;
            const sliderOffset = slider.offsetLeft;
            valueDisplay.style.left = `${sliderOffset + pos}px`;
            valueDisplay.style.transform = 'translateX(-50%)';

            updatePredictions();
            updateVisualizations();
            updateRNAColors();
        }

        // Initial positioning
        updateSliderValue();

        slider.addEventListener('input', updateSliderValue);
        window.addEventListener('resize', updateSliderValue); // Recalculate on resize
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
    // Smoking discrete slider
    smokingDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            const value = parseInt(this.getAttribute('data-value'));
            updateSmokingSelection(value);
        });
    });

    // Allow clicking the smoking label text to select intensity
    smokingLabels.forEach((label, index) => {
        label.addEventListener('click', function() {
            updateSmokingSelection(index);
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

// Update smoking selection
function updateSmokingSelection(value) {
    // Remove all classes
    smokingDots.forEach(dot => {
        dot.classList.remove('active', 'progress');
    });
    smokingLabels.forEach(label => label.classList.remove('active'));

    // Add active/progress classes
    smokingDots.forEach((dot, idx) => {
        if (idx < value) {
            dot.classList.add('progress'); // solid purple, small
        } else if (idx === value) {
            dot.classList.add('active'); // large, main
        }
        // else: remain grey
    });
    smokingLabels[value].classList.add('active');

    // Update fill width: percent to center of selected dot
    const fillWidth = value === 0 ? 0 : (value / 4) * 100;
    sliderFill.style.width = `${fillWidth}%`;

    // Update predictions and visualizations
    updatePredictions();
    updateVisualizations();
    updateRNAColors();
}

// Update prediction percentages based on current inputs
function updatePredictions() {
    const currentData = getCurrentData();
    const predictions = calculateRiskPredictions(currentData);
    
            // Update each prediction card
        predictionCards.forEach((card, index) => {
            const percentage = card.querySelector('.risk-percentage');
            const timeline = card.querySelector('.risk-timeline');
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
    const selectedSmoking = document.querySelector('.slider-dot.active');
    const selectedSex = document.querySelector('input[name="sex"]:checked');
    
    const smokingLevels = ['none', 'light', 'moderate', 'heavy', 'very-heavy'];
    const smokingValue = selectedSmoking ? parseInt(selectedSmoking.getAttribute('data-value')) : 0;
    
    return {
        age: parseInt(sliders.age.value),
        geneticRisk: parseInt(sliders.geneticRisk.value),
        diseaseProgress: parseInt(sliders.diseaseProgress.value),
        bmi: parseFloat(sliders.bmi.value),
        smoking: smokingLevels[smokingValue],
        sex: selectedSex ? selectedSex.value : 'male'
    };
}

// Calculate risk predictions based on inputs (evidence-based medical simulation)
function calculateRiskPredictions(data) {
    // More realistic base risks (population baseline)
    let heartRisk = 2;    // 2% baseline heart failure risk
    let lungRisk = 1;     // 1% baseline lung cancer risk  
    let kidneyRisk = 1.5; // 1.5% baseline kidney failure risk
    
    // Age factor (more gradual and realistic)
    const ageFactor = (data.age - 18) / (90 - 18);
    // Age contributes more gradually and realistically
    heartRisk += ageFactor * 8;     // Max 8% from age
    lungRisk += ageFactor * 6;      // Max 6% from age
    kidneyRisk += ageFactor * 7;    // Max 7% from age
    
    // Genetic risk factor (more conservative)
    const geneticFactor = data.geneticRisk / 100;
    // Genetic factors are significant but not overwhelming
    heartRisk += geneticFactor * 12;   // Max 12% from genetics
    lungRisk += geneticFactor * 10;    // Max 10% from genetics
    kidneyRisk += geneticFactor * 8;   // Max 8% from genetics
    
    // Disease progress factor (conservative)
    const progressFactor = data.diseaseProgress / 100;
    // Existing disease progression has moderate impact
    heartRisk += progressFactor * 10;  // Max 10% from progression
    lungRisk += progressFactor * 8;    // Max 8% from progression
    kidneyRisk += progressFactor * 12; // Max 12% from progression
    
    // BMI factor (realistic threshold and impact)
    if (data.bmi > 25) {
        // BMI impact is significant but capped
        const bmiFactor = Math.min((data.bmi - 25) / 15, 1); // Cap at BMI 40
        heartRisk += bmiFactor * 6;    // Max 6% from BMI
        kidneyRisk += bmiFactor * 5;   // Max 5% from BMI
        // Lung cancer less affected by BMI directly
        lungRisk += bmiFactor * 2;     // Max 2% from BMI
    }
    
    // Smoking factor (additive, not multiplicative for better control)
    const smokingImpact = {
        'none': 0,
        'light': 3,      // 3% additional risk
        'moderate': 8,   // 8% additional risk
        'heavy': 15,     // 15% additional risk
        'very-heavy': 22 // 22% additional risk
    };
    
    const smokingRisk = smokingImpact[data.smoking] || 0;
    // Smoking primarily affects lung and heart
    lungRisk += smokingRisk;           // Direct impact on lungs
    heartRisk += smokingRisk * 0.4;    // 40% of smoking impact on heart
    kidneyRisk += smokingRisk * 0.2;   // 20% of smoking impact on kidneys
    
    // Sex factor (small additive adjustments)
    if (data.sex === 'male') {
        heartRisk += 2;   // Men have slightly higher heart risk
        lungRisk += 1.5;  // Men have slightly higher lung cancer risk
        kidneyRisk += 1;  // Men have slightly higher kidney risk
    } else {
        // Women have different risk patterns
        heartRisk += 0.5; // Lower heart risk generally
        lungRisk += 0.8;  // Lower lung cancer risk
        kidneyRisk += 0.3; // Lower kidney risk
    }
    
    // Apply interaction effects (small adjustments for combined factors)
    // High genetic risk + high age interaction
    if (geneticFactor > 0.7 && ageFactor > 0.6) {
        heartRisk += 2;
        lungRisk += 1.5;
        kidneyRisk += 1.8;
    }
    
    // High BMI + smoking interaction
    if (data.bmi > 30 && smokingRisk > 8) {
        heartRisk += 3;
        lungRisk += 4;
        kidneyRisk += 2;
    }
    
    // Disease progress + age interaction
    if (progressFactor > 0.6 && ageFactor > 0.5) {
        heartRisk += 2.5;
        lungRisk += 2;
        kidneyRisk += 3;
    }
    
    // Ensure values are within realistic medical bounds (1% to 50% max)
    return {
        heartFailure: Math.min(Math.max(Math.round(heartRisk), 1), 50),
        lungCancer: Math.min(Math.max(Math.round(lungRisk), 1), 50),
        kidneyFailure: Math.min(Math.max(Math.round(kidneyRisk), 1), 50)
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
    if (!timeline) return;
    
    // Get all time spans within this timeline
    const timeSpans = timeline.querySelectorAll('span');
    
    // Remove active class from all spans
    timeSpans.forEach(span => {
        span.classList.remove('active');
        span.style.transition = 'all 0.3s ease';
    });
    
    // Determine which time marker should be active based on risk level
    let activeIndex;
    if (riskValue <= 25) {
        // Very low risk: Activate 1month marker (first span)
        activeIndex = 0;
    } else if (riskValue <= 50) {
        // Low to medium risk: Activate 3month marker (second span)
        activeIndex = 1;
    } else {
        // High risk: Activate 6month marker (third span)
        activeIndex = 2;
    }
    
    // Add active class to the appropriate span with animation
    if (timeSpans[activeIndex]) {
        setTimeout(() => {
            timeSpans[activeIndex].classList.add('active');
            
            // Add subtle pulse animation for better visual feedback
            timeSpans[activeIndex].style.transform = 'scale(1.05)';
            setTimeout(() => {
                timeSpans[activeIndex].style.transform = '';
            }, 200);
        }, 100);
    }
    
    // Add visual feedback to the timeline container
    timeline.style.transition = 'transform 0.2s ease';
    timeline.style.transform = 'scale(1.01)';
    setTimeout(() => {
        timeline.style.transform = '';
    }, 200);
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
    
    // Deterministic pseudo-random generator based on user input and gene index
    function seededRandom(seed) {
        // xmur3 hash
        let h = 1779033703 ^ seed.length;
        for (let i = 0; i < seed.length; i++) {
            h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
            h = (h << 13) | (h >>> 19);
        }
        return function(idx) {
            let x = h ^ idx;
            x = Math.imul(x ^ (x >>> 16), 2246822507);
            x = Math.imul(x ^ (x >>> 13), 3266489909);
            x ^= x >>> 16;
            return (x >>> 0) / 4294967295;
        };
    }

    // Create a seed string from all user input
    const seedString = `${data.age}|${data.geneticRisk}|${data.diseaseProgress}|${data.bmi}|${data.smoking}|${data.sex}`;
    const randFunc = seededRandom(seedString);

    // Generate realistic mixed pattern with all 5 colors
    for (let i = 0; i < 18; i++) {
        let baseColor;
        const rand = randFunc(i);
        // Create more varied patterns based on risk type
        if (patternType === 'healthy') {
            // Mostly green and teal with occasional yellow
            if (rand < 0.6) baseColor = GENE_COLORS.green;
            else if (rand < 0.9) baseColor = GENE_COLORS.teal;
            else baseColor = GENE_COLORS.yellow;
        } else if (patternType === 'normal') {
            // Mix of green, teal, and yellow
            if (rand < 0.5) baseColor = GENE_COLORS.green;
            else if (rand < 0.8) baseColor = GENE_COLORS.teal;
            else baseColor = GENE_COLORS.yellow;
        } else if (patternType === 'variable') {
            // Mix of all colors with emphasis on yellow and orange
            if (rand < 0.3) baseColor = GENE_COLORS.green;
            else if (rand < 0.5) baseColor = GENE_COLORS.teal;
            else if (rand < 0.7) baseColor = GENE_COLORS.yellow;
            else if (rand < 0.9) baseColor = GENE_COLORS.orange;
            else baseColor = GENE_COLORS.red;
        } else if (patternType === 'elevated') {
            // Mix with emphasis on orange and red
            if (rand < 0.2) baseColor = GENE_COLORS.green;
            else if (rand < 0.4) baseColor = GENE_COLORS.teal;
            else if (rand < 0.6) baseColor = GENE_COLORS.yellow;
            else if (rand < 0.8) baseColor = GENE_COLORS.orange;
            else baseColor = GENE_COLORS.red;
        } else { // risk
            // Heavy emphasis on red and orange
            if (rand < 0.1) baseColor = GENE_COLORS.green;
            else if (rand < 0.2) baseColor = GENE_COLORS.teal;
            else if (rand < 0.3) baseColor = GENE_COLORS.yellow;
            else if (rand < 0.6) baseColor = GENE_COLORS.orange;
            else baseColor = GENE_COLORS.red;
        }
        
        // Apply factor-based variations (also deterministic)
        let finalColor = baseColor;
        // Use additional seeded randomness for variations
        const rand2 = randFunc(i + 100);
        
        // Age-related changes (more red/orange with age)
        if (ageFactor > 0.6) {
            if (baseColor === GENE_COLORS.green && rand2 > 0.7) {
                finalColor = GENE_COLORS.teal;
            } else if (baseColor === GENE_COLORS.teal && rand2 > 0.6) {
                finalColor = GENE_COLORS.yellow;
            }
        }
        
        // Smoking-related changes (more red/orange with smoking)
        if (smokingFactor > 0.5) {
            if (baseColor === GENE_COLORS.teal && rand2 > 0.6) {
                finalColor = GENE_COLORS.orange;
            } else if (baseColor === GENE_COLORS.yellow && rand2 > 0.5) {
                finalColor = GENE_COLORS.orange;
            }
        }
        
        // Genetic risk variations
        if (geneticFactor > 0.7) {
            if (baseColor === GENE_COLORS.green && rand2 > 0.8) {
                finalColor = GENE_COLORS.yellow;
            } else if (baseColor === GENE_COLORS.teal && rand2 > 0.7) {
                finalColor = GENE_COLORS.yellow;
            }
        }
        
        // Disease progress variations
        if (diseaseFactor > 0.6) {
            if (baseColor === GENE_COLORS.yellow && rand2 > 0.6) {
                finalColor = GENE_COLORS.orange;
            } else if (baseColor === GENE_COLORS.orange && rand2 > 0.5) {
                finalColor = GENE_COLORS.red;
            }
        }
        
        // BMI-related changes
        if (bmiFactor > 0.5) {
            if (baseColor === GENE_COLORS.green && rand2 > 0.7) {
                finalColor = GENE_COLORS.teal;
            } else if (baseColor === GENE_COLORS.teal && rand2 > 0.6) {
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
    
    // Update displayed values and positions
    Object.keys(sliders).forEach(key => {
        const slider = sliders[key];
        const valueDisplay = slider.parentElement.parentElement.querySelector('.slider-value');
        let value = parseFloat(slider.value);
        
        if (key === 'bmi') {
            value = value.toFixed(1);
        } else {
            value = Math.round(value);
        }
        
        valueDisplay.textContent = value;
        
        // Calculate thumb position for tooltip
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const percent = (parseFloat(slider.value) - min) / (max - min);
        const sliderWidth = slider.offsetWidth;
        const thumbWidth = 24;
        const pos = percent * (sliderWidth - thumbWidth) + thumbWidth / 2;
        const sliderOffset = slider.offsetLeft;
        valueDisplay.style.left = `${sliderOffset + pos}px`;
        valueDisplay.style.transform = 'translateX(-50%)';
    });
    
    // Randomize smoking
    const randomSmokingValue = Math.floor(Math.random() * 5);
    updateSmokingSelection(randomSmokingValue);
    
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
    
    // Prevent multiple simultaneous randomizations
    if (window.isRandomizingCards) return;
    window.isRandomizingCards = true;
    
    // Reset position tracking for new randomization
    existingCardPositions = [];
    
    // Remove existing info cards immediately and completely
    const existingCards = humanSilhouette.querySelectorAll('.info-card');
    existingCards.forEach(card => {
        card.remove(); // Immediate removal instead of delayed
    });
    
    // Combine all medical data
    const allMedicalData = [
        ...medicalDataSets.physiological,
        ...medicalDataSets.lifestyle,
        ...medicalDataSets.genetic,
        ...medicalDataSets.medical
    ];
    
    // Select exactly 4-6 random items (limit to max 6)
    const numItems = Math.min(Math.floor(Math.random() * 3) + 4, 6); // 4-6 items, max 6
    const selectedData = [];
    const usedIndices = new Set();
    
    while (selectedData.length < numItems && selectedData.length < 6) { // Additional safety check
        const randomIndex = Math.floor(Math.random() * allMedicalData.length);
        if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            selectedData.push(allMedicalData[randomIndex]);
        }
    }
    
    // Create new info cards with strict overlap prevention
    setTimeout(() => {
        let successfulCards = 0;
        for (let i = 0; i < selectedData.length && successfulCards < 6; i++) {
            const cardCreated = createAnimatedInfoCard(selectedData[i], successfulCards, humanSilhouette);
            if (cardCreated) {
                successfulCards++;
            }
            // If card couldn't be placed safely, skip it entirely
        }
        
        console.log(`Successfully placed ${successfulCards} cards without overlaps`);
        
        // Reset randomization lock after cards are created
        setTimeout(() => {
            window.isRandomizingCards = false;
        }, 1000);
    }, 200); // Reduced delay since we're removing cards immediately
}

// Track existing card positions to avoid overlaps
let existingCardPositions = [];

// Generate safe position avoiding overlaps and middle zone
function generateSafePosition(index, safeZones, horizontalPositions) {
    const isLeftSide = index % 2 === 0;
    const side = isLeftSide ? 'left' : 'right';
    const maxAttempts = 20;
    
    // Special handling for first two cards to ensure they don't overlap
    if (index === 0) {
        // First card: place in upper zone
        const randomTop = Math.floor(Math.random() * (safeZones.upper.max - safeZones.upper.min)) + safeZones.upper.min;
        const fixedHorizontal = horizontalPositions[side];
        
        existingCardPositions.push({
            topNum: randomTop,
            side: side,
            horizontal: fixedHorizontal
        });
        
        return {
            top: randomTop + 'px',
            [side]: fixedHorizontal
        };
    }
    
    if (index === 1) {
        // Second card: ensure it's on opposite side or far from first card
        const firstCard = existingCardPositions[0];
        const isFirstCardLeft = firstCard.side === 'left';
        
        if (isFirstCardLeft) {
            // First card is left, place second on right with proper separation
            const firstCardTop = firstCard.topNum;
            let randomTop;
            
            // Ensure at least 120px separation from first card
            const minSeparation = 120;
            const attempts = 10;
            
            for (let i = 0; i < attempts; i++) {
                randomTop = Math.floor(Math.random() * (safeZones.upper.max - safeZones.upper.min)) + safeZones.upper.min;
                if (Math.abs(randomTop - firstCardTop) >= minSeparation) {
                    break;
                }
            }
            
            // If still overlapping after attempts, place in lower zone
            if (Math.abs(randomTop - firstCardTop) < minSeparation) {
                // Try lower zone with separation check
                for (let i = 0; i < attempts; i++) {
                    randomTop = Math.floor(Math.random() * (safeZones.lower.max - safeZones.lower.min)) + safeZones.lower.min;
                    if (Math.abs(randomTop - firstCardTop) >= minSeparation) {
                        break;
                    }
                }
                // Final fallback - check if forced separation would work
                if (Math.abs(randomTop - firstCardTop) < minSeparation) {
                    const forcedTop = firstCardTop >= 150 ? safeZones.upper.min + 40 : safeZones.lower.min + 20;
                    if (Math.abs(forcedTop - firstCardTop) >= minSeparation) {
                        randomTop = forcedTop;
                    } else {
                        // Even forced separation fails, return null
                        console.log(`Cannot place second card without overlap on right side`);
                        return null;
                    }
                }
            }
            
            const fixedHorizontal = horizontalPositions.right;
            
            existingCardPositions.push({
                topNum: randomTop,
                side: 'right',
                horizontal: fixedHorizontal
            });
            
            return {
                top: randomTop + 'px',
                right: fixedHorizontal
            };
        } else {
            // First card is right, place second on left with proper separation
            const firstCardTop = firstCard.topNum;
            let randomTop;
            
            // Ensure at least 120px separation from first card (consistent with other case)
            const minSeparation = 120;
            const attempts = 10;
            
            // Try to place in upper zone first with proper separation
            for (let i = 0; i < attempts; i++) {
                randomTop = Math.floor(Math.random() * (safeZones.upper.max - safeZones.upper.min)) + safeZones.upper.min;
                if (Math.abs(randomTop - firstCardTop) >= minSeparation) {
                    break;
                }
            }
            
            // If still overlapping after attempts, place in lower zone
            if (Math.abs(randomTop - firstCardTop) < minSeparation) {
                // Try lower zone with separation check
                for (let i = 0; i < attempts; i++) {
                    randomTop = Math.floor(Math.random() * (safeZones.lower.max - safeZones.lower.min)) + safeZones.lower.min;
                    if (Math.abs(randomTop - firstCardTop) >= minSeparation) {
                        break;
                    }
                }
                // Final fallback - check if forced separation would work
                if (Math.abs(randomTop - firstCardTop) < minSeparation) {
                    const forcedTop = firstCardTop >= 150 ? safeZones.upper.min + 40 : safeZones.lower.min + 20;
                    if (Math.abs(forcedTop - firstCardTop) >= minSeparation) {
                        randomTop = forcedTop;
                    } else {
                        // Even forced separation fails, return null
                        console.log(`Cannot place second card without overlap on left side`);
                        return null;
                    }
                }
            }
            
            const fixedHorizontal = horizontalPositions.left;
            
            existingCardPositions.push({
                topNum: randomTop,
                side: 'left',
                horizontal: fixedHorizontal
            });
            
            return {
                top: randomTop + 'px',
                left: fixedHorizontal
            };
        }
    }
    
    // Regular positioning for cards 3 and beyond
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Choose random zone (upper or lower)
        const zone = Math.random() < 0.6 ? 'upper' : 'lower'; // Slight preference for upper
        const zoneData = safeZones[zone];
        
        // Generate random vertical position within safe zone
        const randomTop = Math.floor(Math.random() * (zoneData.max - zoneData.min)) + zoneData.min;
        
        // Use fixed horizontal position for the side
        const fixedHorizontal = horizontalPositions[side];
        
        const newPosition = {
            top: randomTop + 'px',
            [side]: fixedHorizontal
        };
        
        // Check for overlaps with existing positions
        const hasOverlap = existingCardPositions.some(existing => {
            const verticalDistance = Math.abs(existing.topNum - randomTop);
            const sameHorizontalSide = (existing.side === side);
            
            // Cards need at least 120px vertical separation if on same side
            // This accounts for card height (~80px) + margin (40px)
            return sameHorizontalSide && verticalDistance < 120;
        });
        
        // Additional check: ensure we don't place too many cards in the same zone
        const cardsInZone = existingCardPositions.filter(existing => {
            const inUpperZone = existing.topNum >= safeZones.upper.min && existing.topNum <= safeZones.upper.max;
            const inLowerZone = existing.topNum >= safeZones.lower.min && existing.topNum <= safeZones.lower.max;
            return (zone === 'upper' && inUpperZone) || (zone === 'lower' && inLowerZone);
        }).length;
        
        // Limit to 2 cards per zone to prevent overcrowding
        if (cardsInZone >= 2) {
            continue; // Try again with different zone
        }
        
        if (!hasOverlap) {
            // Store this position for future overlap checks
            existingCardPositions.push({
                topNum: randomTop,
                side: side,
                horizontal: fixedHorizontal
            });
            
            return newPosition;
        }
    }
    
    // Try fallback positions, but still check for overlaps
    const fallbackPositions = {
        left: [
            { top: '60px', left: '-80px', topNum: 60 },     // Upper zone
            { top: '180px', left: '-80px', topNum: 180 },   // Upper zone  
            { top: '320px', left: '-80px', topNum: 320 }    // Lower zone (avoiding lower 30%)
        ],
        right: [
            { top: '80px', right: '-85px', topNum: 80 },    // Upper zone
            { top: '190px', right: '-85px', topNum: 190 },  // Upper zone
            { top: '330px', right: '-85px', topNum: 330 }   // Lower zone (avoiding lower 30%)
        ]
    };
    
    const fallbacks = fallbackPositions[side];
    
    // Try each fallback position and check for overlaps
    for (const fallback of fallbacks) {
        const hasOverlap = existingCardPositions.some(existing => {
            const verticalDistance = Math.abs(existing.topNum - fallback.topNum);
            const sameHorizontalSide = (existing.side === side);
            return sameHorizontalSide && verticalDistance < 120;
        });
        
        if (!hasOverlap) {
            // Store this position for future overlap checks
            existingCardPositions.push({
                topNum: fallback.topNum,
                side: side,
                horizontal: fallback[side]
            });
            return fallback;
        }
    }
    
    // No safe position found, even with fallbacks
    console.log(`No safe position found for card ${index} on ${side} side`);
    return null;
}

// Create animated info card with random positioning
function createAnimatedInfoCard(text, index, container) {
    const card = document.createElement('div');
    card.className = 'info-card';
    
    // Create inner wrapper for the content
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    cardInner.innerHTML = `<span>${text}</span>`;
    card.appendChild(cardInner);
    
    // Dynamic positioning system avoiding middle 20% and lower 30% areas
    // Section height is ~500px, so 20% middle (200px-300px) restricted, lower 30% (350px-500px) also restricted
    const safeZones = {
        upper: { min: 40, max: 200 },   // Upper safe zone (top 40% available)
        lower: { min: 300, max: 350 }   // Lower safe zone (only 10% between middle and bottom restrictions)
    };
    
    const horizontalPositions = {
        left: '-80px',   // Fixed position for left side cards (moved closer to middle)
        right: '-85px'   // Fixed position for right side cards (moved closer to middle)
    };
    
    // Generate random position avoiding overlaps
    const basePosition = generateSafePosition(index, safeZones, horizontalPositions);
    
    // If no safe position found, don't create the card
    if (!basePosition) {
        console.log(`Skipping card ${index} - no safe position available`);
        return false; // Card creation failed
    }
    
    // Apply positions without random variations for consistent placement
    if (basePosition.top) {
        card.style.top = basePosition.top;
    }
    if (basePosition.left) {
        card.style.left = basePosition.left;
    }
    if (basePosition.right) {
        card.style.right = basePosition.right;
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
    
    return true; // Card creation successful
}

// Add visual effect when randomizing
function addRandomizeEffect() {
    // Add shimmer effect to prediction cards using CSS classes instead of inline styles
    predictionCards.forEach((card, index) => {
        setTimeout(() => {
            // Add a temporary class for the effect
            card.classList.add('randomize-shimmer');
            
            setTimeout(() => {
                // Remove the effect class
                card.classList.remove('randomize-shimmer');
            }, 300);
        }, index * 100);
    });
    
    // Add shimmer effect to info cards as well
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('randomize-shimmer');
            
            setTimeout(() => {
                card.classList.remove('randomize-shimmer');
            }, 600);
        }, index * 150 + 200);
    });
    
    // Add glow effect to body visualization
    const bodyContainer = document.querySelector('.body-container');
    if (bodyContainer) {
        bodyContainer.style.boxShadow = '0 0 30px rgba(102, 126, 234, 0.5)';
        setTimeout(() => {
            bodyContainer.style.boxShadow = '';
        }, 1000);
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Only prevent default for internal links (href="#")
        if (href === '#') {
            e.preventDefault();
            
            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
        }
        // For external links, allow normal navigation but still update active state
        else {
            // Remove active class from all links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Allow the link to navigate normally (no preventDefault)
        }
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