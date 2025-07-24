# Gene Visualization & Risk Prediction Logic Documentation

## Overview

The gene visualization and risk prediction system has been redesigned to provide **deterministic, evidence-based medical simulation**. The system uses only the original 5 colors from the CSS and creates meaningful, reproducible patterns based on user inputs. Risk predictions are capped at medically realistic levels (≤50%) and follow evidence-based medical research.

## Gene Visualization Logic

### Original Colors Used

The system uses only these 5 colors from the original CSS:

1. **Green (#93DE35)** - Normal/healthy expression
2. **Red (#FF7676)** - High expression (potential risk)
3. **Teal (#3ECE77)** - Moderate expression
4. **Yellow (#FFF700)** - Variable expression
5. **Orange (#FFA222)** - Elevated expression

### Deterministic Color Assignment

**Key Feature**: For the same user input, the gene color pattern is **always identical** - no randomness.

The system uses a **seeded pseudo-random generator** based on user input:
- Creates a seed string from all user inputs: `age|geneticRisk|diseaseProgress|bmi|smoking|sex`
- Uses xmur3 hash algorithm to generate deterministic pseudo-random values
- Each gene position gets a consistent color based on the seed and its index

### Pattern Types with Mixed Colors

The system generates 5 different pattern types based on calculated risk scores:

1. **Healthy** - Low risk (risk score < 0.3)
   - **60% Green, 30% Teal, 10% Yellow**
   - Indicates normal gene expression with slight variations

2. **Normal** - Low-moderate risk (risk score 0.3-0.5)
   - **50% Green, 30% Teal, 20% Yellow**
   - Slight variations from healthy with more yellow

3. **Variable** - Moderate risk (risk score 0.5-0.7)
   - **30% Green, 20% Teal, 20% Yellow, 20% Orange, 10% Red**
   - Shows variable gene expression with all colors represented

4. **Elevated** - High risk (risk score 0.7-0.85)
   - **20% Green, 20% Teal, 20% Yellow, 30% Orange, 10% Red**
   - Indicates elevated expression levels with emphasis on orange

5. **Risk** - Very high risk (risk score > 0.85)
   - **10% Green, 10% Teal, 10% Yellow, 30% Orange, 40% Red**
   - Shows concerning gene expression patterns with heavy red/orange emphasis

### Risk Score Calculation

The risk score is calculated using weighted factors:

- **Genetic Risk (30%)** - Major factor in gene expression
- **Disease Progress (25%)** - Current disease state
- **Age Factor (20%)** - Age-related changes
- **BMI Factor (15%)** - Body mass impact
- **Smoking Factor (10%)** - Smoking impact on gene expression

## Risk Prediction Logic

### Evidence-Based Medical Simulation

The risk prediction system follows medical research and epidemiological data:

#### Baseline Risks (Population Averages)
- **Heart Failure**: 2% baseline risk
- **Lung Cancer**: 1% baseline risk
- **Kidney Failure**: 1.5% baseline risk

#### Risk Factor Contributions

**Age Factor** (Gradual, realistic increases):
- Heart: +0-8% (based on age 18-90)
- Lung: +0-6% (based on age 18-90)
- Kidney: +0-7% (based on age 18-90)

**Genetic Risk Factor** (Conservative, evidence-based):
- Heart: +0-12% (based on genetic risk 0-100%)
- Lung: +0-10% (based on genetic risk 0-100%)
- Kidney: +0-8% (based on genetic risk 0-100%)

**Disease Progress Factor** (Moderate impact):
- Heart: +0-10% (based on disease progress 0-100%)
- Lung: +0-8% (based on disease progress 0-100%)
- Kidney: +0-12% (based on disease progress 0-100%)

**BMI Factor** (Realistic thresholds):
- Threshold: BMI > 25
- Heart: +0-6% (capped at BMI 40)
- Kidney: +0-5% (capped at BMI 40)
- Lung: +0-2% (minimal direct impact)

**Smoking Factor** (Additive, not multiplicative):
- None: +0%
- Light: +3%
- Moderate: +8%
- Heavy: +15%
- Very Heavy: +22%

Impact distribution:
- Lung: 100% of smoking risk (direct impact)
- Heart: 40% of smoking risk
- Kidney: 20% of smoking risk

**Sex Factor** (Small, realistic adjustments):
- Male: Heart +2%, Lung +1.5%, Kidney +1%
- Female: Heart +0.5%, Lung +0.8%, Kidney +0.3%

#### Interaction Effects

**High Genetic Risk + Advanced Age**:
- When genetic risk >70% AND age factor >60%
- Heart +2%, Lung +1.5%, Kidney +1.8%

**High BMI + Heavy Smoking**:
- When BMI >30 AND smoking risk >8%
- Heart +3%, Lung +4%, Kidney +2%

**Disease Progress + Age**:
- When disease progress >60% AND age factor >50%
- Heart +2.5%, Lung +2%, Kidney +3%

### Risk Caps and Bounds

- **Maximum Risk**: 50% for any disease
- **Minimum Risk**: 1% for any disease
- **Realistic Range**: 1-50% (medically appropriate)

## Implementation Details

### Key Functions

1. **`calculateGeneExpression(data)`**
   - **Deterministic**: Same input always produces same pattern
   - Uses seeded pseudo-random generator based on user input
   - Returns array of 18 colors representing gene bars
   - Creates realistic mixed patterns using all 5 colors
   - Applies biological logic and factor-based variations

2. **`calculateRiskPredictions(data)`**
   - **Evidence-based**: Follows medical research
   - **Capped at 50%**: Realistic medical bounds
   - **Deterministic**: No randomness, same input = same output
   - Uses additive risk factors with interaction effects
   - Returns heart failure, lung cancer, and kidney failure risks

3. **`getGeneExpressionSummary(data)`**
   - Analyzes the generated pattern
   - Counts colors to provide meaningful statistics
   - Returns summary with healthy, elevated, variable, and moderate counts

4. **`updateRNAColors()`**
   - Updates the visual gene bars with deterministic colors
   - Updates gene count display with risk level
   - Provides visual feedback and animations

### Deterministic Pseudo-Random Generator

The system uses a sophisticated seeding mechanism:

```javascript
function seededRandom(seed) {
    // xmur3 hash algorithm
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
```

This ensures:
- **Reproducibility**: Same inputs always generate same results
- **Distribution**: Uniform distribution across 0-1 range
- **Diversity**: Different inputs produce different patterns

## User Interface Updates

### Gene Count Display

The gene count shows meaningful information:
- "18 genes • Normal" (for healthy patterns)
- "18 genes • Elevated" (for concerning patterns)
- "18 genes • Moderate Risk" (for intermediate patterns)

### Risk Prediction Cards

Each prediction card shows:
- **Percentage**: 1-50% risk range
- **Timeline**: 1-month, 3-month, 6-month indicators
- **Color-coded progress**: Green (low) to red (high)
- **Disease-specific timeframes**: 6 months (heart), 12 months (lung), 18 months (kidney)

### Visual Feedback

- Staggered animation when colors update
- Subtle pulse effects on individual bars
- Scale animation on the RNA section
- Smooth transitions for risk percentage changes

## Medical Accuracy

The system models real medical risk factors:

1. **Age-related changes**: Gradual increase with age based on epidemiological data
2. **Smoking impact**: Smoking most significantly affects lungs, moderately affects heart
3. **Genetic factors**: Significant but not overwhelming contribution to risk
4. **Disease progression**: Current disease state affects future risk
5. **BMI effects**: Obesity increases cardiovascular and kidney disease risk
6. **Sex differences**: Men typically have higher cardiovascular disease risk
7. **Interaction effects**: Combined risk factors have additive effects

## Testing and Validation

To test the system:

1. **Reproducibility Test**: Set specific slider values, note gene pattern and risks, reset and set same values - should be identical
2. **Risk Cap Test**: Set all sliders to maximum - risks should never exceed 50%
3. **Medical Logic Test**: 
   - Heavy smoking should significantly increase lung cancer risk
   - High BMI should increase heart/kidney risk more than lung risk
   - Advanced age should gradually increase all risks
   - High genetic risk should increase all disease risks
4. **Diversity Test**: Different input combinations should produce visually distinct gene patterns
5. **Baseline Test**: Minimum healthy inputs (young, low BMI, no smoking, low genetic risk) should show low risks

## Future Enhancements

Potential improvements:

1. **Gene-specific patterns**: Different genes respond differently to risk factors
2. **Temporal modeling**: Show how risks change over time
3. **Population comparisons**: Compare individual risk to population averages
4. **Detailed tooltips**: Explain what each risk factor contributes
5. **Risk reduction scenarios**: Show how lifestyle changes affect predictions
6. **Confidence intervals**: Display uncertainty ranges for predictions
7. **More interaction effects**: Model complex multi-factor interactions 