// Register a helper to round to 2dp with trailing 0s
// i.e 1.7 -> 1.70
Handlebars.registerHelper('2dp', function (num) {
    return num && typeof num === 'number' ? num.toFixed(2) : "N/A";
});

// The template for the output
const outputTemplate = Handlebars.compile(
`Performed on: {{Machine}}
Performed by: {{Operator}}
Technical Quality: {{TechnicalQualilty}}
ECG: {{Rhythm}}, {{Rate}}
BP: {{BP}}

Left Ventricle:
{{#if RWMAs ~}}- {{RWMAs}}
{{/if~}}
- {{LVSF}}.
- {{LVH}}. {{LVD}}.
- {{Diastology}}{{LAP}}

Mitral Valve:
- {{MV}} {{MS}} {{MR}}

Aortic Valve:
- {{AV}} {{AS}} {{AR}}

Right Ventricle:
- {{RVFl}} {{RVFr}}
- {{RVD}} {{RVH}}

Tricuspid Valve:
- {{TV}} {{TS}} {{TR}}

Pulmonary Valve:
- {{PV}} {{PS}} {{PR}}

Atria:
- {{Atria}}

Aorta:
- {{Aorta}} {{DescAo}}

Miscellaneous:
- IVC is {{IVCD}} with {{IVCC}} collapse on inspiration estimating RA pressure at {{RAP}}mmHg. 
- {{PPHT}}. ePASP = {{PASP}}
- {{ASD}}
- {{PEff}}

Summary:
{{Summary}}

`, {noEscape: true});