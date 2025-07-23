# Gene Visualization Logic Documentation

## Overview

The gene visualization system has been completely redesigned to use only the original 5 colors from the CSS and create meaningful **mixed patterns** based on user inputs or randomization. The system now follows biological logic and creates realistic gene expression patterns with a mix of all 5 colors throughout the visualization.

## Original Colors Used

The system uses only these 5 colors from the original CSS:

1. **Green (#93DE35)** - Normal/healthy expression
2. **Red (#FF7676)** - High expression (potential risk)
3. **Teal (#3ECE77)** - Moderate expression
4. **Yellow (#FFF700)** - Variable expression
5. **Orange (#FFA222)** - Elevated expression

## Biological Logic

### Pattern Types with Mixed Colors

The system generates 5 different pattern types based on calculated risk scores, each using a **mix of all 5 colors**:

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

### Smoking Impact

Smoking has a significant impact on gene expression patterns:

- **None**: 0.1 (minimal impact)
- **Light**: 0.3 (slight impact)
- **Moderate**: 0.6 (moderate impact)
- **Heavy**: 0.8 (significant impact)
- **Very Heavy**: 1.0 (maximum impact)

## Implementation Details

### Key Functions

1. **`calculateGeneExpression(data)`**
   - Calculates gene expression pattern based on user inputs
   - Returns array of 18 colors representing gene bars
   - Creates realistic mixed patterns using all 5 colors
   - Applies biological logic and factor-based variations

2. **`getGeneExpressionSummary(data)`**
   - Analyzes the generated pattern
   - Counts colors to provide meaningful statistics
   - Returns summary with healthy, elevated, variable, and moderate counts

3. **`updateRNAColors()`**
   - Updates the visual gene bars
   - Updates gene count display with risk level
   - Provides visual feedback

### Color Variations and Factor-Based Changes

The system applies specific variations based on multiple factors:

- **Age-related**: Older individuals show more yellow/orange patterns
- **Smoking-related**: Smokers show elevated expression (more orange/red)
- **Genetic risk**: High genetic risk shows more variable patterns (yellow)
- **Disease progress**: Advanced disease shows more red/orange patterns
- **BMI effects**: Higher BMI shows more yellow/teal variations

### Mixed Color Distribution

Each pattern type uses a different distribution of all 5 colors:

- **Healthy**: Mostly green/teal with occasional yellow
- **Normal**: Mix of green/teal/yellow
- **Variable**: All colors with emphasis on yellow/orange
- **Elevated**: All colors with emphasis on orange/red
- **Risk**: Heavy emphasis on red/orange with some other colors

## User Interface Updates

### Gene Count Display

The gene count now shows meaningful information:
- "18 genes • Normal" (for healthy patterns)
- "18 genes • Elevated" (for concerning patterns)
- "18 genes • Moderate Risk" (for intermediate patterns)

### Visual Feedback

- Staggered animation when colors update
- Subtle pulse effects on individual bars
- Scale animation on the RNA section
- Console logging for debugging

## Biological Accuracy

The system models real gene expression patterns:

1. **Age-related changes**: Older individuals typically show different gene expression patterns
2. **Smoking impact**: Smoking significantly affects gene expression
3. **Genetic factors**: Genetic risk influences baseline expression
4. **Disease progression**: Current disease state affects expression levels
5. **BMI effects**: Body mass can influence metabolic gene expression
6. **Mixed expression**: Real genes show varied expression levels, not just 2-color patterns

## Testing

To test the system:

1. Move the sliders to see how different inputs affect gene expression
2. Change smoking status to see dramatic effects
3. Use the randomize button to see various combinations
4. Check the console for detailed logging of pattern generation
5. Observe the mixed color distribution throughout the gene bars

## Future Enhancements

Potential improvements:

1. Add more sophisticated gradient effects
2. Include gene-specific patterns (different genes respond differently)
3. Add time-based animations showing expression changes
4. Include more detailed biological markers
5. Add tooltips explaining what each color represents
6. Implement gene clustering patterns (groups of genes with similar expression) 