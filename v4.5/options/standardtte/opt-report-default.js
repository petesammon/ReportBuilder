// Section templates - define the text structure for each section
window.sectionTemplates = {
    DetailsSection: 
`US Trans-Thoracic Echocardiogram:

{{paramsHeader}}

Performed on: {{Machine}}
Operator: {{Operator}}
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
{{Diastology}}{{LAP}}

{{LVMeasurements}}`,
    
    MVSection:
`Mitral Valve:
{{MV}} {{MS}} {{MR}}
{{MVMeasurements}}`,
    
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
{{TVMeasurements}}`,
   
    PVSection:
`Pulmonary Valve:
{{PV}} {{PS}} {{PR}}
{{PVMeasurements}}`,
    
    MiscSection:
`Miscellaneous:
IVC is {{{IVCD}}}
Pulmonary artery systolic pressure {{{PASP}}}.
{{PPHT}}
{{ASD}}
{{#if PlEff ~}}{{PlEff}}
{{/if~}}
{{{PEff}}}`,
};

// Main output template - assembles all sections into the final report
window.outputTemplate = Handlebars.compile(
`{{DetailsSection}}

{{LVSection}}

{{MVSection}}
{{LASection}}

{{AVSection}}

{{AoSection}}

{{RVSection}}

{{RASection}}

{{TVSection}}

{{PVSection}}

{{MiscSection}}

{{Summary}}`, {noEscape: true});