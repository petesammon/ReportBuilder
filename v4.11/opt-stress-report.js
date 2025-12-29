window.sectionTemplates = {
    sectProtocol: 
`US Stress Echocardiogram (Dobut & Cont) :

Study Quality:
{{paramsStudyQuality}}

Protocol:
{{paramsProtocol}}

Contrast:
{{paramsContrast}}`,
    
    sectOutcomes:
`Heart Rate and Blood Pressure:
Max HR: {{MaxHR}}
% of Max Predicted HR: {{PercentMaxHR}}
Rest HR: {{RestHR}}
Rest BP: {{RestBP}}
Max BP: {{MaxBP}}
METS Achieved: {{METS}}

Patient symptoms:
{{paramsSymptoms}}

Reason for stopping:
{{paramsTargetHRAchieved}}
{{paramsStopReason}}

Exercise Tolerance:
{{paramsExerciseTolerance}}`,
    
    sectECG: 
`ELECTROCARDIOGRAM:
Resting ECG: 
{{paramsRestingECG}}

Post-exercise ECG:
{{paramsStressECG}}

Haemodynamic Response:
{{paramsHaemoResponse}}`,  
    
    sectEcho: 
`ECHOCARDIOGRAM:
Resting Echo Findings:
{{{paramsRestingEcho}}}

Peak Stress Echo Findings:
{{paramsStressEcho}}`,
};

// Main output template - assembles all sections into the final report
window.outputTemplate = Handlebars.compile(
`{{sectProtocol}}

{{sectOutcomes}}

{{sectECG}}

{{sectEcho}}

{{Summary}}`, {noEscape: true});