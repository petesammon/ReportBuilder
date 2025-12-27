// Section templates - define the text structure for each section
window.sectionTemplates = {
    sectHeader:
`US Trans-Thoracic Echocardiogram:`,
    
    DetailsSection: 
`Performed on: {{Machine}}
Operator: {{Operator1}}
Technical Quality: {{TechnicalQualilty}}
ECG: {{Rhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}`,
    
    sectPeff:
`Focused study for pericardial effusion:

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

{{sectPeff}}

{{Summary}}`, {noEscape: true});