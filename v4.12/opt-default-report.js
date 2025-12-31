// Section templates - define the text structure for each section
window.sectionTemplates = {
    sectHeader:
`US Trans-Thoracic Echocardiogram:
{{paramsHeader}}`,
    
    sectStudy: 
`Performed on: {{Machine}}
Operator: {{Operator1}}
Technical Quality: {{TechnicalQualilty}}
ECG: {{Rhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}`,
    
    sectLV: 
`Left Ventricle:
{{#if RWMAs ~}}{{RWMAs}}
{{/if~}}
{{#if LVComments ~}}{{LVComments}}
{{/if~}}
{{LVSF}}
{{LVH}}
{{LVD}}
{{Diastology}}{{LAP}}`,
    
    sectLVMeasurements:
`{{LVMeasurements}}`,
    
    sectMV:
`Mitral Valve:
{{MV}} {{MS}} {{MR}}{{#if MVMeasurements ~}}{{MVMeasurements}}{{/if~}}`,
    
    sectLA:
`Left Atrium:
{{LAtrium}} LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}} (Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)`,
    
    sectAV:
`Aortic Valve:
{{AV}} {{AS}} {{AR}}
{{AVMeasurements}}`,
    
    sectAo:
`Aorta:
{{Aorta}}
(Measured leading edge to leading edge, at end diastole as per departmental protocol)
{{AoMeasurements}}
{{Coarc}}`,
    
    sectRV:
`Right Ventricle:
{{RVF}}
{{RVD}} {{RVH}}
{{RVMeasurements}}`,
    
    sectRA:
`Right atrium:
{{RAtrium}} RA area = {{RAA}}, Indexed = {{RAAI}}`,
    
    sectTV:
`Tricuspid Valve:
{{TV}} {{TS}} {{TR}}
{{#if TVMeasurements ~}}{{TVMeasurements}}
{{/if~}}
{{{RVtoRA}}}`,
   
    sectPV:
`Pulmonary Valve:
{{PV}} {{PS}} {{PR}}
{{PVMeasurements}}
PV AccT = {{PAT}}. {{PVN}}`,
    
    sectMisc:
`Miscellaneous:
IVC is {{{IVCD}}}
Pulmonary artery systolic pressure {{{PASP}}}.
{{PPHT}}
{{ASD}}
{{#if PlEff ~}}{{PlEff}}
{{/if~}}
{{{PEff}}}`,
    
    sectPeffFull:
`Pericardial Effusion:  
    {{paramsEffSize}}
    {{#if paramsEffOther}}{{paramsEffOther}}
    {{/if}}
    
    Measures maximally at end-diastole:
    - LV:   {{#if LVPLAX}}{{LVPLAX}} (PLAX), {{/if}}{{#if LVPSAX}}{{LVPSAX}} (PSAX), {{/if}}{{#if LVA4C}}{{LVA4C}} (A4C), {{/if}}{{#if LVSC}}{{LVSC}} (Subcostal){{/if}}
    - RV:   {{#if RVPLAX}}{{RVPLAX}} (PLAX), {{/if}}{{#if RVPSAX}}{{RVPSAX}} (PSAX), {{/if}}{{#if RVA4C}}{{RVA4C}} (A4C), {{/if}}{{#if RVSC}}{{RVSC}} (Subcostal){{/if}}

    And at end-systole:
    - RA:   {{#if RAA4C}}{{RAA4C}} (A4C), {{/if}}{{#if RASC}}{{RASC}} (Subcostal){{/if}}

    {{paramsEffCompromise}}
    - {{paramsSeptMotion}}
    - {{paramsRVCollapse}}
    - {{paramsRACollapse}}
    - {{{paramsIVC}}}
    
    {{paramsEffVariation}}
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