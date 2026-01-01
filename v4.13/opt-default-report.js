// Section templates - define the text structure for each section
window.sectionTemplates = {
    sectHeader:
`US Trans-Thoracic Echocardiogram:
{{pHeader}}`,
    
    sectStudy: 
`Performed on: {{pMachine}}
Operator: {{Operator1}}
Technical Quality: {{pQualilty}}
ECG: {{pRhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}`,
    
    sectLV: 
`Left Ventricle:
{{#if pRWMA ~}}{{pRWMA}}
{{/if~}}
{{#if pLVComments ~}}{{pLVComments}}
{{/if~}}
{{pLVSF}}
{{pLVH}}
{{pLVD}}
{{pDiastology}}{{pLAP}}`,
    
    sectLVMeasurements:
`{{pLVMeasurements}}`,
    
    sectMV:
`Mitral Valve:
{{pMV}} {{pMS}} {{pMR}}{{#if pMVMeasurements ~}}{{pMVMeasurements}}{{/if~}}`,
    
    sectLA:
`Left Atrium:
{{pLA}} LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}} (Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)`,
    
    sectAV:
`Aortic Valve:
{{pAV}} {{pAS}} {{pAR}}
{{pAVMeasurements}}`,
    
    sectAo:
`Aorta:
{{pAorta}}
(Measured leading edge to leading edge, at end diastole as per departmental protocol)
{{pAoMeasurements}}
{{pCoarc}}`,
    
    sectRV:
`Right Ventricle:
{{pRVF}}
{{pRVD}} {{pRVH}}
{{pRVMeasurements}}`,
    
    sectRA:
`Right atrium:
{{pRA}} RA area = {{RAA}}, Indexed = {{RAAI}}`,
    
    sectTV:
`Tricuspid Valve:
{{pTV}} {{pTS}} {{pTR}}
{{#if pTVMeasurements ~}}{{pTVMeasurements}}
{{/if~}}
{{{pRVtoRA}}}`,
   
    sectPV:
`Pulmonary Valve:
{{pPV}} {{pPS}} {{pPR}}
{{pPVMeasurements}}
PV AccT = {{PAT}}. {{PVN}}`,
    
    sectMisc:
`Miscellaneous:
IVC is {{{pIVCD}}}
Pulmonary artery systolic pressure {{{pPASP}}}.
{{pPPHT}}
{{pASD}}
{{#if pPlEff ~}}{{pPlEff}}
{{/if~}}
{{{pPEff}}}`,
    
    sectPeffFull:
`Pericardial Effusion:  
    {{pEffSize}}
    {{#if pEffOther}}{{pEffOther}}
    {{/if}}
    
    Measures maximally at end-diastole:
    - LV:   {{#if LVPLAX}}{{LVPLAX}} (PLAX), {{/if}}{{#if LVPSAX}}{{LVPSAX}} (PSAX), {{/if}}{{#if LVA4C}}{{LVA4C}} (A4C), {{/if}}{{#if LVSC}}{{LVSC}} (Subcostal){{/if}}
    - RV:   {{#if RVPLAX}}{{RVPLAX}} (PLAX), {{/if}}{{#if RVPSAX}}{{RVPSAX}} (PSAX), {{/if}}{{#if RVA4C}}{{RVA4C}} (A4C), {{/if}}{{#if RVSC}}{{RVSC}} (Subcostal){{/if}}

    And at end-systole:
    - RA:   {{#if RAA4C}}{{RAA4C}} (A4C), {{/if}}{{#if RASC}}{{RASC}} (Subcostal){{/if}}

    {{pEffCompromise}}
    - {{pSeptMotion}}
    - {{pRVCollapse}}
    - {{pRACollapse}}
    - {{{pIVC}}}
    
    {{pEffVariation}}
    MV inflow: Vmax = {{EffMVVmax}}, Vmin = {{EffMVVmin}}; Variation = {{EffMVVar}} (normal range <25%)
    TV inflow: Vmax = {{EffTVVmax}}, Vmin = {{EffTVVmin}}; Variation = {{EffTVVar}} (normal range <40%)`,
};

// Main output template - assembles all sections into the final report
window.outputTemplate = Handlebars.compile(
`{{sectHeader}}

{{sectStudy}}

{{sectLV}}

{{sectLVMeasurements}}

{{sectMV}}
{{sectLA}}

{{sectAV}}

{{sectAo}}

{{sectRV}}

{{sectRA}}

{{sectTV}}

{{sectPV}}

{{sectMisc}}

{{#if sectPeffFull ~}}{{sectPeffFull}}
{{/if}}

{{Summary}}`, {noEscape: true});