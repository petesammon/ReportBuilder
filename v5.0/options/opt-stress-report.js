window.sectionTemplates = {
    sectProtocol: 
`US Stress Echocardiogram (Dobut & Cont) :

Study Quality:
{{pQuality}}

Protocol:
{{pProtocol}}

Contrast:
{{pContrast}}`,
    
    sectOutcomes:
`Heart Rate and Blood Pressure:
Max HR: {{MaxHR}}
% of Max Predicted HR: {{PercentMaxHR}}
Rest HR: {{RestHR}}
Rest BP: {{RestBP}}
Max BP: {{MaxBP}}
METS Achieved: {{METS}}

Patient symptoms:
{{pSymptoms}}

Reason for stopping:
{{pTargetHRAchieved}}
{{#if pStopReason}}{{pStopReason}}
{{/if}}

Exercise Tolerance:
{{pExerciseTolerance}}`,
    
    sectECG: 
`ELECTROCARDIOGRAM:
Resting ECG: 
{{pRestingECG}}

Post-exercise ECG:
{{pStressECG}}

Haemodynamic Response:
{{pHaemoResponse}}`,  
    
    sectEcho: 
`ECHOCARDIOGRAM:
Resting Echo Findings:
{{{pRestingEcho}}}

Peak Stress Echo Findings:
{{pStressEcho}}`,
};

// Main output template - assembles all sections into the final report
window.outputTemplate = Handlebars.compile(
`{{sectProtocol}}

{{sectOutcomes}}

{{sectECG}}

{{sectEcho}}

{{Summary}}`, {noEscape: true});