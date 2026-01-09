/**
 * EchoTools Algorithm: LV Geometry / LV Hypertrophy Assessment
 * opt-a-lvh.js
 * 
 * Implements LV geometry classification based on:
 *   1. Relative Wall Thickness (RWT) = (IVSd + LVPWd) / LVIDd
 *   2. LV Mass indexed to BSA (LVMASSInd)
 * 
 * Classification (2x2 matrix):
 *   - Normal LV geometry:      RWT ≤0.42 AND LVMi normal (♀≤99, ♂≤110 g/m²)
 *   - Concentric Remodelling:  RWT >0.42 AND LVMi normal
 *   - Eccentric Hypertrophy:   RWT ≤0.42 AND LVMi elevated (♀>99, ♂>110 g/m²)
 *   - Concentric Hypertrophy:  RWT >0.42 AND LVMi elevated
 * 
 * Output: Sets pLVG parameter to appropriate classification
 * 
 * Required measurements:
 *   - IVSd (Interventricular septum thickness, diastole) - cm
 *   - LVPWd (LV posterior wall thickness, diastole) - cm
 *   - LVIDd (LV internal diameter, diastole) - cm
 *   - LVMASSInd (LV mass indexed to BSA) - g/m²
 *   - Gender (for sex-specific LVMi thresholds)
 *   - RWT (calculated by script-calcs.js, fallback available)
 */

window.algorithms = window.algorithms || [];

window.algorithms.push({
    id: 'lvh',
    name: 'LV Geometry Assessment',
    
    // Declare all inputs this algorithm reads
    inputs: [
        // Measurements
        'IVSd',
        'LVPWd',
        'LVIDd',
        'LVMASSInd',
        'Gender',
        'RWT'  // Calculated by script-calcs.js
    ],
    
    // Declare outputs
    outputs: ['pLVG'],
    
    /**
     * Main evaluation function
     */
    evaluate: function(context) {
        const UNABLE = '** unable to automatically determine LV geometry **';
        
        // =====================================================================
        // GATHER ALL MEASUREMENTS
        // =====================================================================
        
        const ivsd = context.getMeasurement('IVSd');
        const lvpwd = context.getMeasurement('LVPWd');
        const lvidd = context.getMeasurement('LVIDd');
        const lvMassIndex = context.getMeasurement('LVMASSInd');
        const gender = context.getMeasurementRaw('Gender');
        
        // Try to get RWT from registry (calculated by script-calcs.js)
        let rwt = context.getMeasurement('RWT');
        
        // =====================================================================
        // CALCULATE RWT IF NOT AVAILABLE
        // RWT = (IVSd + LVPWd) / LVIDd
        // =====================================================================
        
        if (rwt === null) {
            // Fallback: calculate RWT if component measurements are available
            if (ivsd !== null && lvpwd !== null && lvidd !== null && lvidd > 0) {
                rwt = (ivsd + lvpwd) / lvidd;
                rwt = parseFloat(rwt.toFixed(2));
                console.log(`[LVH Algorithm] Calculated RWT: ${rwt} from IVSd=${ivsd}, LVPWd=${lvpwd}, LVIDd=${lvidd}`);
            }
        }
        
        // =====================================================================
        // VALIDATE REQUIRED MEASUREMENTS
        // =====================================================================
        
        if (rwt === null) {
            console.log('[LVH Algorithm] Unable to determine RWT - missing measurements');
            return { pLVG: UNABLE };
        }
        
        if (lvMassIndex === null) {
            console.log('[LVH Algorithm] Missing LV Mass Indexed measurement');
            return { pLVG: UNABLE };
        }
        
        // =====================================================================
        // DETERMINE SEX-SPECIFIC LVMi THRESHOLD
        // Female: LVMi >99 g/m² = hypertrophy
        // Male:   LVMi >110 g/m² = hypertrophy
        // =====================================================================
        
        const genderLower = (gender || '').toLowerCase().trim();
        let lvMiThreshold;
        
        if (genderLower === 'female' || genderLower === 'f') {
            lvMiThreshold = 99;
        } else if (genderLower === 'male' || genderLower === 'm') {
            lvMiThreshold = 110;
        } else {
            // Gender unknown - cannot determine threshold
            console.log('[LVH Algorithm] Gender not specified, cannot determine LVMi threshold');
            return { pLVG: UNABLE };
        }
        
        // =====================================================================
        // CLASSIFY LV GEOMETRY
        // Based on RWT (threshold 0.42) and LVMi (sex-specific threshold)
        // =====================================================================
        
        const rwtThreshold = 0.42;
        const isWallThick = rwt > rwtThreshold;  // >0.42 = thick wall
        const isMassElevated = lvMassIndex > lvMiThreshold;  // >99/110 = elevated
        
        console.log(`[LVH Algorithm] RWT=${rwt} (threshold ${rwtThreshold}), LVMi=${lvMassIndex} (threshold ${lvMiThreshold})`);
        console.log(`[LVH Algorithm] Wall thick: ${isWallThick}, Mass elevated: ${isMassElevated}`);
        
        let result;
        
        if (!isWallThick && !isMassElevated) {
            // RWT ≤0.42 AND LVMi normal
            result = 'Normal LV geometry';
        } else if (isWallThick && !isMassElevated) {
            // RWT >0.42 AND LVMi normal
            result = 'Concentric Remodelling';
        } else if (!isWallThick && isMassElevated) {
            // RWT ≤0.42 AND LVMi elevated
            result = 'Eccentric Hypertrophy';
        } else {
            // RWT >0.42 AND LVMi elevated
            result = 'Concentric Hypertrophy';
        }
        
        console.log(`[LVH Algorithm] Result: ${result}`);
        
        return { pLVG: result };
    }
});
