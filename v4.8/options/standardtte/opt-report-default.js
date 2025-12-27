// Section templates - define the text structure for each section
window.sectionTemplates = {
    sectHeader:
`US Trans-Thoracic Echocardiogram:
{{paramsHeader}}`,
    
    DetailsSection: 
`Performed on: {{Machine}}
Operator: {{Operator1}}
Technical Quality: {{TechnicalQualilty}}
ECG: {{Rhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}`,
    
    LVSection: 
`Left Ventricle:
{{#if RWMAs ~}}{{RWMAs}}
{{/if~}}
{{LVSF}}
{{LVH}}
{{LVD}}
{{Diastology}}{{LAP}}`,
    
    sectLVMeasurements:
`{{LVMeasurements}}`,
    
    MVSection:
`Mitral Valve:
{{MV}} {{MS}} {{MR}}{{#if MVMeasurements ~}}{{MVMeasurements}}{{/if~}}`,
    
    LASection:
`Left Atrium:
{{LAtrium}} LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}} (Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)`,
    
    AVSection:
`Aortic Valve:
{{AV}} {{AS}} {{AR}}
{{AVMeasurements}}`,
    
    AoSection:
`Aorta:
{{Aorta}}
(Measured leading edge to leading edge, at end diastole as per departmental protocol)
{{AoMeasurements}}
{{Coarc}}`,
    
    RVSection:
`Right Ventricle:
{{RVF}}
{{RVD}} {{RVH}}
{{RVMeasurements}}`,
    
    RASection:
`Right atrium:
{{RAtrium}} RA area = {{RAA}}, Indexed = {{RAAI}}`,
    
    TVSection:
`Tricuspid Valve:
{{TV}} {{TS}} {{TR}}
{{#if TVMeasurements ~}}{{TVMeasurements}}
{{/if~}}
{{{RVtoRA}}}`,
   
    PVSection:
`Pulmonary Valve:
{{PV}} {{PS}} {{PR}}
{{PVMeasurements}}
PV AccT = {{PAT}}. {{PVN}}`,
    
    MiscSection:
`Miscellaneous:
IVC is {{{IVCD}}}
Pulmonary artery systolic pressure {{{PASP}}}.
{{PPHT}}
{{ASD}}
{{#if PlEff ~}}{{PlEff}}
{{/if~}}
{{{PEff}}}`,
    
    sectPeff:
`Pericardial Effusion:  
    {{paramsEffSize}} {{paramsEffCompromise}}
    {{#if paramsEffOther}}{{paramsEffOther}}
    {{/if}}
    
    Measures maximally at end-diastole:
    - LV:   {{LVPLAX}} (PLAX), {{LVPSAX}} (PSAX), {{LVA4C}} (A4C), {{LVSC}} (Subcostal)
    - RV:   {{RVPLAX}} (PLAX), {{RVPSAX}} (PSAX), {{RVA4C}} (A4C), {{RVSC}} (Subcostal)

    And at end-systole:
    - RA:   {{RAA4C}} (A4C), {{RASC}} (Subcostal)

    Signs of haemodynamic compromise:
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

{{DetailsSection}}

{{LVSection}}

{{sectLVMeasurements}}

{{MVSection}}
{{LASection}}

{{AVSection}}

{{AoSection}}

{{RVSection}}

{{RASection}}

{{TVSection}}

{{PVSection}}

{{MiscSection}}

{{#if sectPeff ~}}{{sectPeff}}
{{/if}}

{{Summary}}`, {noEscape: true});