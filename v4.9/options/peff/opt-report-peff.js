// Section templates - define the text structure for each section
window.sectionTemplates = {
    sectHeader:
`US Trans-Thoracic Echocardiogram:`,
    
    sectStudy: 
`Performed on: {{paramsMachine}}
Operator: {{Operator1}}
Technical Quality: {{paramsQualilty}}
ECG: {{paramsRhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}`,
    
    sectPeffFull:
`Focused study for pericardial effusion:

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

{{sectPeffFull}}

{{Summary}}`, {noEscape: true});