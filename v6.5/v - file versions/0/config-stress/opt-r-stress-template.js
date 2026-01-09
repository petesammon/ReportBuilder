// MARKERS:
// - <!--button:mX-->  : Button placement only (no end marker needed)
// - <!--@VarName-->...<!--/@VarName--> : Field markers link fixed text to variable
//
// EXCLUSION RULES:
// - Variables from excluded modals are cleared (looked up from config)
// - Modal key itself is in excluded set, so <!--@mLV-->Heading<!--/@mLV--> hides heading
// - Field markers hide entire field when their variable is excluded
// - Whitespace from removed content is automatically collapsed
//
// USAGE TIPS:
// - Wrap modal headings: <!--@mLV-->Left Ventricle:<!--/@mLV-->
// - Wrap fixed text with variable: <!--@Operator1-->Operator: {{Operator1}}<!--/@Operator1-->
// - Variables without fixed text don't need markers - they'll be cleared and whitespace collapsed

window.outputTemplateString = `<!--button:mProtocol-->US Stress Echocardiogram (Dobut & Cont):

Study Quality:
{{pQuality}}

Protocol:
{{pProtocol}}

Contrast:
{{pContrast}}

<!--button:mOutcomes-->Heart Rate and Blood Pressure:
<!--@MaxHR-->Max HR: {{MaxHR}}<!--/@MaxHR-->
<!--@PercentMaxHR-->% of Max Predicted HR: {{PercentMaxHR}}<!--/@PercentMaxHR-->
<!--@RestHR-->Rest HR: {{RestHR}}<!--/@RestHR-->
<!--@RestBP-->Rest BP: {{RestBP}}<!--/@RestBP-->
<!--@MaxBP-->Max BP: {{MaxBP}}<!--/@MaxBP-->
<!--@MaxBP-->METS Achieved: {{METS}}<!--/@MaxBP-->

Patient symptoms:
{{pSymptoms}}

Reason for stopping:
{{pTargetHRAchieved}}
<!--if:pStopReason-->{{pStopReason}}<!--/if-->

Exercise Tolerance:
{{pExerciseTolerance}}

<!--button:mECG-->ELECTROCARDIOGRAM:
Resting ECG: 
{{pRestingECG}}

Post-exercise ECG:
{{pStressECG}}

Haemodynamic Response:
{{pHaemoResponse}}

<!--button:mEcho-->ECHOCARDIOGRAM:
Resting Echo Findings:
{{pRestingEcho}}

Peak Stress Echo Findings:
{{pStressEcho}}

{{Summary}}`;

window.outputTemplate = Handlebars.compile(window.outputTemplateString, {noEscape: true});