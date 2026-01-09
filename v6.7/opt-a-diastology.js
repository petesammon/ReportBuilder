/**
 * EchoTools Algorithm: Diastolic Function Assessment
 * opt-a-diastology.js
 * 
 * Implements BSE 2024 / ASE/EACVI guidelines for diastolic function grading
 * Three pathways based on:
 *   1. Normal systolic function (LVEF ≥50%, GLS ≤-16%, no RWMAs)
 *   2. Impaired systolic function (LVEF <50% OR GLS >-16% OR RWMAs present)
 *   3. Atrial fibrillation (any LVEF)
 * 
 * Output: Sets pDiastology parameter to appropriate label
 * 
 * Available measurements used:
 *   - EFBP, GLS (systolic function assessment)
 *   - pRWMA (known myocardial disease indicator)
 *   - EEPrimeAv, EEPrimeSept, EEPrimeLat (E/e' ratios)
 *   - LAESVInd (LA volume indexed)
 *   - TRVmax (TR velocity)
 *   - EVel, EDecT (E wave parameters)
 *   - EPrimeSept, EPrimeLat (tissue Doppler e')
 *   - Age, Gender (for age-specific thresholds)
 *   - BMI (calculated - for AF pathway)
 *   - HR (heart rate)
 *   - pRhythm (rhythm parameter)
 *   - LARs (LA reservoir strain) - for LA strain pathways
 *   - LAPs (LA pump strain) - for LA strain pathways
 *   - ArADur (Ar-A duration) - supplementary parameter
 *   - LWave (L-wave velocity) - supplementary parameter
 *   - PVSDR (PV S/D ratio) - supplementary parameter & AF STEP 2
 */

window.algorithms = window.algorithms || [];

window.algorithms.push({
    id: 'diastology',
    name: 'Diastolic Function Assessment (BSE 2024)',
    
    // Declare all inputs this algorithm reads
    inputs: [
        // Parameters
        'pRhythm',
        'pRWMA',
        // Measurements - Core
        'EFBP',
        'GLS',
        'EEPrimeAv',
        'EEPrimeSept',
        'EEPrimeLat',
        'LAESVInd',
        'TRVmax',
        'EVel',
        'EDecT',
        'EPrimeSept',
        'EPrimeLat',
        'Age',
        'Gender',
        'BMI',
        'HR',
        // Measurements - LA Strain
        'LARs',
        'LAPs',
        // Measurements - Supplementary
        'ArADur',
        'LWave',
        'PVSDR'
    ],
    
    // Declare outputs
    outputs: ['pDiastology'],
    
    /**
     * Main evaluation function
     */
    evaluate: function(context) {
        const UNABLE = '** unable to automatically determine diastolic function **';
        
        // =====================================================================
        // GATHER ALL MEASUREMENTS
        // =====================================================================
        
        const pRhythm = context.getParam('pRhythm');
        
        // Determine rhythm type
        const rhythmLower = (pRhythm || '').toLowerCase();
        const isAF = rhythmLower.includes('atrial fibrillation') || rhythmLower.includes('af');
        const isSinus = rhythmLower.includes('sinus');
        
        // Core measurements
        const efbp = context.getMeasurement('EFBP');
        const gls = context.getMeasurement('GLS');
        
        // E/e' values
        const eeAv = context.getMeasurement('EEPrimeAv');
        const eeSept = context.getMeasurement('EEPrimeSept');
        const eeLat = context.getMeasurement('EEPrimeLat');
        
        // Other criteria
        const laVolIndex = context.getMeasurement('LAESVInd');
        const trVmax = context.getMeasurement('TRVmax');
        const eVel = context.getMeasurement('EVel');
        const eDecT = context.getMeasurement('EDecT');
        
        // Tissue Doppler e'
        const ePrimeSept = context.getMeasurement('EPrimeSept');
        const ePrimeLat = context.getMeasurement('EPrimeLat');
        
        // Demographics
        const age = context.getMeasurement('Age');
        const gender = context.getMeasurementRaw('Gender');
        const hr = context.getMeasurement('HR');
        
        // LA Strain measurements
        const laRs = context.getMeasurement('LARs');  // LA reservoir strain
        const laPs = context.getMeasurement('LAPs');  // LA pump strain
        
        // Supplementary parameters
        const arADur = context.getMeasurement('ArADur');  // Ar-A duration (ms)
        const lWave = context.getMeasurement('LWave');    // L-wave velocity (cm/s)
        const pvSDR = context.getMeasurement('PVSDR');    // PV S/D ratio
        
        // BMI from registry (calculated by script-calcs.js)
        const bmi = context.getMeasurement('BMI');
        
        // =====================================================================
        // BRANCH 1: ATRIAL FIBRILLATION
        // For use in ALL AF patients, irrespective of LV systolic function
        // Ideally HR <100 bpm; use index beat method
        // =====================================================================
        
        if (isAF) {
            return this.evaluateAF(context, {
                eeSept, eVel, eDecT, trVmax, bmi, laRs, pvSDR, UNABLE
            });
        }
        
        // =====================================================================
        // REQUIRE SINUS RHYTHM FOR REMAINING PATHWAYS
        // =====================================================================
        
        if (!isSinus) {
            // Unknown rhythm - cannot determine
            return { pDiastology: UNABLE };
        }
        
        // =====================================================================
        // REQUIRE EFBP FOR BRANCH DETERMINATION
        // =====================================================================
        
        if (efbp === null) {
            return { pDiastology: UNABLE };
        }
        
        // =====================================================================
        // DETERMINE: NORMAL vs IMPAIRED SYSTOLIC FUNCTION
        // Impaired if: LVEF <50% OR GLS worse than -16% OR known myocardial disease (RWMAs)
        // =====================================================================
        
        const pRWMA = context.getParam('pRWMA');
        
        const hasImpairedEF = efbp < 50;
        // GLS is negative; worse = less negative (e.g., -14 is worse than -20)
        // GLS > -16 means impaired (e.g., -14, -10, -8)
        const hasImpairedGLS = gls !== null && gls > -16;
        // pRWMA is a customtext field - non-empty indicates known myocardial disease
        const hasRWMA = pRWMA && pRWMA.trim() !== '';
        const isImpairedSystolic = hasImpairedEF || hasImpairedGLS || hasRWMA;
        
        // =====================================================================
        // EVALUATE THE 3 MAIN CRITERIA (used in both Sinus branches)
        // Criterion 1: Avg E/e' >14
        // Criterion 2: LA volume >34 ml/m²
        // Criterion 3: TR velocity >2.8 m/s
        // =====================================================================
        
        const criteriaResults = this.evaluateMainCriteria(eeAv, laVolIndex, trVmax);
        
        // =====================================================================
        // BRANCH 2: IMPAIRED SYSTOLIC FUNCTION (LVEF <50% or GLS >-16% or RWMAs)
        // Diastolic function IS impaired; assess filling pressure only
        // =====================================================================
        
        if (isImpairedSystolic) {
            return this.evaluateImpairedSystolic(criteriaResults, {
                laRs, laPs, arADur, lWave, pvSDR, eDecT, UNABLE
            });
        }
        
        // =====================================================================
        // BRANCH 3: NORMAL SYSTOLIC FUNCTION (LVEF ≥50%)
        // Need to assess both relaxation AND filling pressure
        // =====================================================================
        
        return this.evaluateNormalSystolic(criteriaResults, {
            ePrimeSept, ePrimeLat, age, gender, laRs, laPs, arADur, lWave, UNABLE
        });
    },
    
    /**
     * Evaluate the 3 main criteria used in both Sinus rhythm branches
     * Returns object with counts and details
     */
    evaluateMainCriteria: function(eeAv, laVolIndex, trVmax) {
        let positive = 0;
        let negative = 0;
        let available = 0;
        const details = {};
        
        // Criterion 1: E/e' avg >14
        if (eeAv !== null) {
            available++;
            if (eeAv > 14) {
                positive++;
                details.eeAv = 'positive';
            } else {
                negative++;
                details.eeAv = 'negative';
            }
        } else {
            details.eeAv = 'unavailable';
        }
        
        // Criterion 2: LA volume indexed >34 ml/m²
        if (laVolIndex !== null) {
            available++;
            if (laVolIndex > 34) {
                positive++;
                details.laVol = 'positive';
            } else {
                negative++;
                details.laVol = 'negative';
            }
        } else {
            details.laVol = 'unavailable';
        }
        
        // Criterion 3: TR velocity >2.8 m/s
        if (trVmax !== null) {
            available++;
            if (trVmax > 2.8) {
                positive++;
                details.trVmax = 'positive';
            } else {
                negative++;
                details.trVmax = 'negative';
            }
        } else {
            details.trVmax = 'unavailable';
        }
        
        return { positive, negative, available, details };
    },
    
    /**
     * Evaluate supplementary parameters
     * Returns count of positive findings
     * Supplementary: Ar-A duration >30ms, L-wave >20 cm/s, PV S/D ratio <1, E DecT <150ms
     */
    evaluateSupplementaryParams: function(arADur, lWave, pvSDR, eDecT) {
        let positive = 0;
        let available = 0;
        
        // Ar-A duration >30 ms
        if (arADur !== null) {
            available++;
            if (arADur > 30) positive++;
        }
        
        // L-wave velocity >20 cm/s
        if (lWave !== null) {
            available++;
            if (lWave > 20) positive++;
        }
        
        // PV S/D ratio <1
        if (pvSDR !== null) {
            available++;
            if (pvSDR < 1) positive++;
        }
        
        // E DecT <150 ms (only for impaired systolic pathway)
        if (eDecT !== null) {
            available++;
            if (eDecT < 150) positive++;
        }
        
        return { positive, available };
    },
    
    /**
     * BRANCH: Atrial Fibrillation pathway
     * STEP 1: 4 criteria (Septal E/e' >11, E vel ≥100, E DecT ≤160, TR vel >2.8)
     * STEP 2: 3 criteria (LA reservoir strain <16%, BMI >30, PV S/D <1)
     */
    evaluateAF: function(context, params) {
        const { eeSept, eVel, eDecT, trVmax, bmi, laRs, pvSDR, UNABLE } = params;
        
        // STEP 1: Check 4 criteria
        let step1Positive = 0;
        let step1Negative = 0;
        let step1Available = 0;
        
        // Criterion 1: Septal E/e' >11
        if (eeSept !== null) {
            step1Available++;
            if (eeSept > 11) step1Positive++;
            else step1Negative++;
        }
        
        // Criterion 2: Mitral E velocity ≥100 cm/s
        if (eVel !== null) {
            step1Available++;
            if (eVel >= 100) step1Positive++;
            else step1Negative++;
        }
        
        // Criterion 3: E decel time ≤160 ms
        if (eDecT !== null) {
            step1Available++;
            if (eDecT <= 160) step1Positive++;
            else step1Negative++;
        }
        
        // Criterion 4: TR velocity >2.8 m/s
        if (trVmax !== null) {
            step1Available++;
            if (trVmax > 2.8) step1Positive++;
            else step1Negative++;
        }
        
        // Need at least 3 of 4 criteria available for assessment
        if (step1Available < 3) {
            return { pDiastology: UNABLE };
        }
        
        // ≥3 criteria NEGATIVE → Normal LV filling pressures
        if (step1Negative >= 3) {
            return { pDiastology: 'Normal diastolic function for age' };
        }
        
        // ≥3 criteria POSITIVE → Proceed to STEP 2
        // Insufficient STEP 1 criteria for decision → Also proceed to STEP 2
        
        // STEP 2: Check 3 criteria
        // - LA reservoir strain <16%
        // - BMI >30 kg/m²
        // - PV S/D ratio <1
        
        let step2Positive = 0;
        let step2Negative = 0;
        let step2Available = 0;
        
        // LA reservoir strain <16%
        if (laRs !== null) {
            step2Available++;
            if (laRs < 16) step2Positive++;
            else step2Negative++;
        }
        
        // BMI >30
        if (bmi !== null) {
            step2Available++;
            if (bmi > 30) step2Positive++;
            else step2Negative++;
        }
        
        // PV S/D ratio <1
        if (pvSDR !== null) {
            step2Available++;
            if (pvSDR < 1) step2Positive++;
            else step2Negative++;
        }
        
        // Evaluate STEP 2 results
        if (step2Available >= 2) {
            // ≥2 STEP 2 criteria NEGATIVE → Normal filling pressures
            if (step2Negative >= 2) {
                return { pDiastology: 'Normal diastolic function for age' };
            }
            
            // ≥2 STEP 2 criteria POSITIVE → Elevated filling pressures
            if (step2Positive >= 2) {
                return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
            }
        }
        
        // Insufficient STEP 2 criteria OR mixed results
        // If STEP 1 was strongly positive (≥3), lean toward elevated
        if (step1Positive >= 3) {
            return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
        }
        
        // Otherwise indeterminate
        return { pDiastology: 'Impaired diastolic function, indeterminate filling pressures.' };
    },
    
    /**
     * BRANCH: Impaired Systolic Function (LVEF <50% or GLS >-16% or RWMAs)
     * Diastolic function IS impaired; only assess filling pressure
     */
    evaluateImpairedSystolic: function(criteriaResults, params) {
        const { positive, negative, available } = criteriaResults;
        const { laRs, laPs, arADur, lWave, pvSDR, eDecT, UNABLE } = params;
        
        // Need at least 2 of 3 criteria available
        if (available < 2) {
            return { pDiastology: UNABLE };
        }
        
        // 2 or 3 criteria POSITIVE → Elevated filling pressures
        if (positive >= 2) {
            return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
        }
        
        // 2 or 3 criteria NEGATIVE → Normal filling pressures
        if (negative >= 2) {
            return { pDiastology: 'Impaired diastolic function, normal filling pressures.' };
        }
        
        // Only 2 available with 1 positive and 1 negative → LA Strain pathway
        // Assess LA strain: LARs <18% OR LAPs <8% → Normal
        //                   LARs ≥24% OR LAPs ≥14% → Elevated
        //                   Otherwise → Supplementary parameters
        
        if (laRs !== null || laPs !== null) {
            // Check for definitive LA strain results
            const laRsLow = laRs !== null && laRs < 18;
            const laPsLow = laPs !== null && laPs < 8;
            const laRsHigh = laRs !== null && laRs >= 24;
            const laPsHigh = laPs !== null && laPs >= 14;
            
            if (laRsLow || laPsLow) {
                return { pDiastology: 'Impaired diastolic function, normal filling pressures.' };
            }
            
            if (laRsHigh || laPsHigh) {
                return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
            }
            
            // LA strain in intermediate range → Check supplementary parameters
            const supplementary = this.evaluateSupplementaryParams(arADur, lWave, pvSDR, eDecT);
            
            if (supplementary.available > 0 && supplementary.positive >= 1) {
                return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
            }
            
            if (supplementary.available > 0 && supplementary.positive === 0) {
                return { pDiastology: 'Impaired diastolic function, normal filling pressures.' };
            }
        }
        
        // No LA strain available - try supplementary parameters directly
        const supplementary = this.evaluateSupplementaryParams(arADur, lWave, pvSDR, eDecT);
        
        if (supplementary.available >= 2) {
            if (supplementary.positive >= 1) {
                return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
            } else {
                return { pDiastology: 'Impaired diastolic function, normal filling pressures.' };
            }
        }
        
        return { pDiastology: UNABLE };
    },
    
    /**
     * BRANCH: Normal Systolic Function (LVEF ≥50%)
     * Need to assess both relaxation (e') AND filling pressure
     */
    evaluateNormalSystolic: function(criteriaResults, params) {
        const { positive, negative, available } = criteriaResults;
        const { ePrimeSept, ePrimeLat, age, gender, laRs, laPs, arADur, lWave, UNABLE } = params;
        
        // Need at least 2 of 3 criteria available
        if (available < 2) {
            return { pDiastology: UNABLE };
        }
        
        // 2 or 3 criteria POSITIVE → Impaired with elevated filling pressures
        if (positive >= 2) {
            return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
        }
        
        // 2 or 3 criteria NEGATIVE → Assess relaxation by age-specific e'
        if (negative >= 2) {
            return this.assessRelaxationWithLAStrain(
                ePrimeSept, ePrimeLat, age, gender, laRs, arADur, lWave, UNABLE
            );
        }
        
        // Only 2 available with 1 positive and 1 negative → LA Strain pathway
        // Flowchart: Assess LA Strain (pump strain ≥14% OR reservoir strain ≥30%)
        
        if (laRs !== null || laPs !== null) {
            const laStrainPositive = (laPs !== null && laPs >= 14) || (laRs !== null && laRs >= 30);
            
            if (laStrainPositive) {
                // LA strain suggests normal → Assess relaxation
                return this.assessRelaxationWithLAStrain(
                    ePrimeSept, ePrimeLat, age, gender, laRs, arADur, lWave, UNABLE
                );
            } else {
                // LA strain abnormal → Check supplementary parameters
                const supplementary = this.evaluateSupplementaryParamsNormalEF(arADur, lWave);
                
                if (supplementary.positive >= 1) {
                    return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
                }
                
                // Indeterminate - consider exercise echo
                return { pDiastology: 'Impaired diastolic function, indeterminate filling pressures.' };
            }
        }
        
        // No LA strain available - cannot complete this pathway
        return { pDiastology: UNABLE };
    },
    
    /**
     * Evaluate supplementary parameters for Normal EF pathway
     * Only Ar-A duration and L-wave (not PV S/D or DecT)
     */
    evaluateSupplementaryParamsNormalEF: function(arADur, lWave) {
        let positive = 0;
        let available = 0;
        
        // Ar-A duration >30 ms
        if (arADur !== null) {
            available++;
            if (arADur > 30) positive++;
        }
        
        // L-wave velocity >20 cm/s
        if (lWave !== null) {
            available++;
            if (lWave > 20) positive++;
        }
        
        return { positive, available };
    },
    
    /**
     * Assess relaxation by age-specific e' thresholds
     * With LA reservoir strain check for the LARs <18% pathway
     */
    assessRelaxationWithLAStrain: function(ePrimeSept, ePrimeLat, age, gender, laRs, arADur, lWave, UNABLE) {
        // Need e' values for assessment
        if (ePrimeSept === null && ePrimeLat === null) {
            return { pDiastology: UNABLE };
        }
        
        // Need age for age-specific thresholds
        if (age === null) {
            return { pDiastology: UNABLE };
        }
        
        // =====================================================================
        // Age-specific e' Lower Limit of Normal (LLN)
        // Based on ASE/EACVI 2016 and BSE 2024 guidelines
        // 
        // Simplified thresholds (approximate from published data):
        // 
        //              Septal e'    Lateral e'
        // Age 16-29:     ≥10          ≥13
        // Age 30-39:     ≥8           ≥11  
        // Age 40-49:     ≥7           ≥9
        // Age 50-59:     ≥6           ≥8
        // Age 60-69:     ≥5           ≥7
        // Age ≥70:       ≥5           ≥6
        //
        // Note: These are simplified; actual LLN varies by gender slightly
        // =====================================================================
        
        let septLLN, latLLN;
        
        if (age < 30) {
            septLLN = 10;
            latLLN = 13;
        } else if (age < 40) {
            septLLN = 8;
            latLLN = 11;
        } else if (age < 50) {
            septLLN = 7;
            latLLN = 9;
        } else if (age < 60) {
            septLLN = 6;
            latLLN = 8;
        } else if (age < 70) {
            septLLN = 5;
            latLLN = 7;
        } else {
            septLLN = 5;
            latLLN = 6;
        }
        
        // Gender adjustment (females have slightly higher LLN)
        const genderLower = (gender || '').toLowerCase();
        if (genderLower === 'female' || genderLower === 'f') {
            septLLN += 1;
            latLLN += 1;
        }
        
        // Check if e' values are normal (≥ LLN) or abnormal (< LLN)
        let septNormal = null;
        let latNormal = null;
        
        if (ePrimeSept !== null) {
            septNormal = ePrimeSept >= septLLN;
        }
        
        if (ePrimeLat !== null) {
            latNormal = ePrimeLat >= latLLN;
        }
        
        // Decision logic
        let ePrimeNormal;
        
        if (septNormal !== null && latNormal !== null) {
            if (septNormal && latNormal) {
                ePrimeNormal = true;
            } else if (!septNormal && !latNormal) {
                ePrimeNormal = false;
            } else {
                // Mixed result - consider abnormal if either is below LLN
                ePrimeNormal = false;
            }
        } else if (septNormal !== null) {
            ePrimeNormal = septNormal;
        } else if (latNormal !== null) {
            ePrimeNormal = latNormal;
        } else {
            return { pDiastology: UNABLE };
        }
        
        // =====================================================================
        // FINAL DECISION for Normal Systolic + Criteria Negative pathway
        // =====================================================================
        
        if (ePrimeNormal) {
            // e' is normal → Normal diastolic function for age
            return { pDiastology: 'Normal diastolic function for age' };
        }
        
        // e' is below LLN → Impaired relaxation
        // Check LA reservoir strain pathway: LARs <18% → supplementary parameters
        
        if (laRs !== null && laRs < 18) {
            // LARs <18% → Check supplementary parameters
            const supplementary = this.evaluateSupplementaryParamsNormalEF(arADur, lWave);
            
            if (supplementary.available > 0 && supplementary.positive >= 1) {
                return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
            }
            
            // No positive supplementary → Normal filling pressures (but impaired relaxation)
            return { pDiastology: 'Impaired diastolic function, normal filling pressures.' };
        }
        
        if (laRs !== null && laRs >= 18) {
            // LARs ≥18% with abnormal e' but negative main criteria
            // Per flowchart: assess supplementary parameters
            const supplementary = this.evaluateSupplementaryParamsNormalEF(arADur, lWave);
            
            if (supplementary.positive >= 1) {
                return { pDiastology: 'Impaired diastolic function, elevated filling pressures.' };
            }
            
            // Indeterminate - flowchart suggests exercise echo
            return { pDiastology: 'Impaired diastolic function, indeterminate filling pressures.' };
        }
        
        // No LA strain available - conservative path
        // e' abnormal + main criteria negative → Normal filling pressures
        return { pDiastology: 'Impaired diastolic function, normal filling pressures.' };
    }
});
