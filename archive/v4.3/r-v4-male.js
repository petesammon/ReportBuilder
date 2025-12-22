// Section templates - define the text structure for each section
window.sectionTemplates = {
    DetailsSection: 
`Performed on: {{Machine}}
Operator: {{Operator}}
Technical Quality: {{TechnicalQualilty}}
ECG: {{Rhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}`,
    
    LVSection: 
`Left Ventricle:
{{#if RWMAs ~}}{{RWMAs}}
{{/if~}}
{{LVSF}}.
{{LVH}}.
{{LVD}}.
{{Diastology}}{{LAP}}

{{{processTemplate LVMeasurements}}}`,
    
    MVSection:
`Mitral Valve:
{{MV}} {{MS}} {{MR}}
{{{processTemplate MVMeasurements}}}`,
    
    LASection:
`Left Atrium:
{{LAtrium}} LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}} (Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)`,
    
    AVSection:
`Aortic Valve:
{{AV}} {{AS}} {{AR}}
{{{processTemplate AVMeasurements}}}`,
    
    AoSection:
`Aorta:
{{Aorta}}
(Measured leading edge to leading edge, at end diastole as per departmental protocol)
Sinus of Valsalva = {{SoV}}, Indexed to height = {{SoVI}} (Normal range, male: 14.8-23.2mm/m)
Sinotubular Junction = {{StJ}}, Indexed to height = {{StJI}} (Normal range, male: 12.6-19.8mm/m) 
Ascending aorta = {{Ao}}, Indexed to height = {{AoI}} (Normal range, male: 12.6-21.4mm/m) 
{{Coarc}}`,
    
    RVSection:
`Right Ventricle:
{{RVFl}} {{RVFr}}
{{RVD}} {{RVH}}
{{{processTemplate RVMeasurements}}}`,
    
    RASection:
`Right atrium:
{{RAtrium}} RA area = {{RAA}}, Indexed = {{RAAI}}`,
    
    TVSection:
`Tricuspid Valve:
{{TV}} {{TS}} {{TR}}
{{{processTemplate TVMeasurements}}}`,
   
    PVSection:
`Pulmonary Valve:
{{PV}} {{PS}} {{PR}}
{{{processTemplate PVMeasurements}}}`,
    
    MiscSection:
`Miscellaneous:
IVC is {{IVCD}} {{#if IVC ~}}\({{IVC}}\) {{/if~}} with {{IVCC}} collapse on inspiration estimating RA pressure at {{RAP}}mmHg. 
Pulmonary artery systolic pressure {{PASPe}}{{PASP}}.
{{PPHT}}
{{ASD}}
{{PEff}}`,    
};

// Main output template - assembles all sections into the final report
window.outputTemplate = Handlebars.compile(
`TTE Findings: The report is compiled in accordance to a locally agreed combination of BSE Guidelines 2020 and EACVI guidelines 2016. Unless specified in the report conclusion, it is the sole responsibility of the referring physician to act upon the findings of this study. In specific cases where delay may result in patient harm, sonographers will refer for urgent clinical support.break

{{DetailsSection}}

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