// Main output template - assembles all sections into the final report
// Store original template string for section marker searching
window.outputTemplateString = `<!--start:sectHeader-->US Trans-Thoracic Echocardiogram:
{{pHeader}}
<!--end:sectHeader-->

<!--start:sectStudy-->Performed on: {{pMachine}}
Operator: {{Operator1}}
Technical Quality: {{pQuality}}
ECG: {{pRhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}
<!--end:sectStudy-->

<!--start:sectLV-->Left Ventricle:
{{#if pRWMA ~}}{{pRWMA}}
{{/if~}}
{{#if pLVComments ~}}{{pLVComments}}
{{/if~}}
{{pLVSF}}
{{pLVH}}
{{pLVD}}
{{pDiastology}}{{pLAP}}
<!--end:sectLV-->

<!--start:sectLVMeasurements-->{{pLVMeasurements}}
<!--end:sectLVMeasurements-->

<!--start:sectMV-->Mitral Valve:
{{pMV}} {{pMS}} {{pMR}}{{#if pMVMeasurements}}
{{pMVMeasurements}}{{/if}}
<!--end:sectMV-->

<!--start:sectLA-->Left Atrium:
{{pLA}} LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}} (Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)
<!--end:sectLA-->

<!--start:sectAV-->Aortic Valve:
{{pAV}} {{pAS}} {{pAR}}
{{pAVMeasurements}}
<!--end:sectAV-->

<!--start:sectAo-->Aorta:
{{pAorta}}
(Measured leading edge to leading edge, at end diastole as per departmental protocol)
{{pAoMeasurements}}
{{pCoarc}}
<!--end:sectAo-->

<!--start:sectRV-->Right Ventricle:
{{pRVF}}
{{pRVD}} {{pRVH}}
{{pRVMeasurements}}
<!--end:sectRV-->

<!--start:sectRA-->Right atrium:
{{pRA}} RA area = {{RAA}}, Indexed = {{RAAI}}
<!--end:sectRA-->

<!--start:sectTV-->Tricuspid Valve:
{{pTV}} {{pTS}} {{pTR}}
{{#if pTVMeasurements ~}}{{pTVMeasurements}}
{{/if~}}
{{{pRVtoRA}}}
<!--end:sectTV-->

<!--start:sectPV-->Pulmonary Valve:
{{pPV}} {{pPS}} {{pPR}}
{{pPVMeasurements}}
PV AccT = {{PAT}}. {{PVN}}
<!--end:sectPV-->

<!--start:sectMisc-->Miscellaneous:
IVC is {{{pIVCD}}}
Pulmonary artery systolic pressure {{{pPASP}}}.
{{pPPHT}}
{{pASD}}
{{#if pPlEff ~}}{{pPlEff}}
{{/if~}}
{{{pPEff}}}
<!--end:sectMisc-->

<!--start:sectSummary-->{{Summary}}<!--end:sectSummary-->`;

window.outputTemplate = Handlebars.compile(window.outputTemplateString, {noEscape: true});