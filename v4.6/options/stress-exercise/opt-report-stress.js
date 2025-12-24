window.sectionTemplates = {
    sectProtocol: 
`US Stress Echocardiogram (Dobut & Cont) :

Study Quality:
- {{paramsStudyQuality}}

Protocol:
- {{paramsProtocol}}

Contrast:
- {{paramsContrast}}

Heart Rate and Blood Pressure:
- Max HR: {{MaxHR}}
- % of Max Predicted HR: {{PercentMaxHR}}
- Rest HR: {{RestHR}}
- Rest BP: {{RestBP}}
- Max BP: {{MaxBP}}
- METS Achieved: {{METS}}

Patient symptoms:
- {{paramsSymptoms}}

Reason for stopping:
- {{paramsStopReason}} {{paramsTargetHRAchieved}}

Exercise Tolerance:
- {{paramsExerciseTolerance}}`,
    
    sectECG: 
`Electrocardiogram:
Resting ECG: 
- {{paramsRestingECG}}

Post-exercise ECG:
- {{paramsStressECG}}

Haemodynamic Response:
- {{paramsHaemoResponse}}`,  
    
    sectEcho: 
`Echocardiogram:
Resting Echo Findings:
- {{paramsRestingEcho}}

Peak Stress Echo Findings:
- {{paramsStressEcho}}`,
};

// Main output template - assembles all sections into the final report
window.outputTemplate = Handlebars.compile(
`{{sectProtocol}}

{{sectECG}}

{{sectEcho}}

{{Summary}}`, {noEscape: true});