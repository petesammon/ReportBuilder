/**
 * EchoTools Algorithm: Diastology Assessment
 * opt-a-diastology.js
 * 
 * This algorithm evaluates diastolic function based on:
 * - pRhythm, EFBP, pRWMA (primary qualifiers)
 * - EEPrimeAv, LAESVInd, TRVmax (secondary qualifiers)
 * - Gender, Age, EPrimeSept, EPrimeLat (detailed assessment)
 * 
 * Output: Sets pDiastology parameter to appropriate label
 */

window.algorithms = window.algorithms || [];

window.algorithms.push({
    id: 'diastology',
    name: 'Diastolic Function Assessment',
    
    // Declare all inputs this algorithm reads (for documentation/future reactive triggering)
    inputs: [
        'pRhythm',      // Parameter: Rhythm (must be Sinus rhythm)
        'EFBP',         // Measurement: Biplane EF
        'pRWMA',        // Parameter: Regional wall motion abnormalities (must be empty/false)
        'EEPrimeAv',    // Measurement: E/E' averaged
        'LAESVInd',     // Measurement: LA ESV indexed
        'TRVmax',       // Measurement: TR Vmax
        'Gender',       // Measurement: Gender from import
        'Age',          // Calculated measurement: Age
        'EPrimeSept',   // Measurement: E' septal
        'EPrimeLat'     // Measurement: E' lateral
    ],
    
    // Declare outputs this algorithm may set
    outputs: ['pDiastology'],
    
    /**
     * Evaluate function receives context with getter methods
     * Returns object with { parameterHandle: labelToSet } or null if no change
     * 
     * @param {object} context - Object with getter methods:
     *   - context.getMeasurement(handle) returns numeric value or null
     *   - context.getParam(handle) returns string value
     *   - context.getParamLabel(handle) returns current label for dropdown params
     *   - context.isEmpty(handle) returns true if value is empty/null/undefined
     * 
     * @returns {object|null} - { handle: label } pairs to set, or null for no action
     */
    evaluate: function(context) {
        // ===========================================================================
        // STEP 1: Primary Qualifiers
        // Must be: Sinus rhythm, EFBP > 50%, no RWMAs
        // ===========================================================================
        
        const pRhythm = context.getParam('pRhythm');
        const efbp = context.getMeasurement('EFBP');
        const pRWMA = context.getParam('pRWMA');
        
        // Check rhythm = Sinus rhythm (title from parameter)
        // pRhythm stores the title, so check for "Sinus rhythm"
        if (!pRhythm || pRhythm.toLowerCase() !== 'sinus rhythm') {
            return { pDiastology: '** unable to automatically determine diastolic function **' };
        }
        
        // Check EFBP > 50%
        if (efbp === null || efbp <= 50) {
            return { pDiastology: '** unable to automatically determine diastolic function **' };
        }
        
        // Check pRWMA is empty/false (customtext field, empty = no RWMAs)
        if (pRWMA && pRWMA.trim() !== '') {
            return { pDiastology: '** unable to automatically determine diastolic function **' };
        }
        
        // ===========================================================================
        // STEP 2: Secondary Qualifiers
        // Must be: EEPrimeAv < 14, LAESVInd < 34, TRVmax <= 2.79
        // ===========================================================================
        
        const eeAv = context.getMeasurement('EEPrimeAv');
        const laIndex = context.getMeasurement('LAESVInd');
        const trVmax = context.getMeasurement('TRVmax');
        
        // All three secondary qualifiers must be met
        const secondaryQualifiersMet = (
            eeAv !== null && eeAv < 14 &&
            laIndex !== null && laIndex < 34 &&
            (trVmax === null || trVmax <= 2.79)  // TRVmax not greater than 2.79 (null/absent is acceptable)
        );
        
        if (!secondaryQualifiersMet) {
            return { pDiastology: '** unable to automatically determine diastolic function **' };
        }
        
        // ===========================================================================
        // STEP 3: Detailed Assessment
        // Based on Gender, Age, EPrimeSept, EPrimeLat
        // ===========================================================================
        
        const gender = context.getParam('Gender') || context.getMeasurementRaw('Gender');
        const age = context.getMeasurement('Age');
        const ePrimeSept = context.getMeasurement('EPrimeSept');
        const ePrimeLat = context.getMeasurement('EPrimeLat');
        
        // Check: Gender = Male AND Age < 40
        const isMaleUnder40 = (
            gender && gender.toLowerCase() === 'male' &&
            age !== null && age < 40
        );
        
        if (isMaleUnder40) {
            // Check E' values
            const septOK = ePrimeSept !== null && ePrimeSept > 7;
            const latOK = ePrimeLat !== null && ePrimeLat > 9;
            
            if (septOK && latOK) {
                // All criteria met - Normal diastolic function
                return { pDiastology: 'Normal diastolic function for age' };
            } else {
                // E' values not meeting normal thresholds
                return { pDiastology: 'Impaired diastolic function, normal filling pressures.' };
            }
        }
        
        // ===========================================================================
        // FALLBACK: Unable to determine
        // (e.g., female, age >= 40, missing data)
        // ===========================================================================
        
        return { pDiastology: '** unable to automatically determine diastolic function **' };
    }
});
