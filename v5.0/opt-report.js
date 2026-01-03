// Main output template - assembles parameters into final report
// Uses {{p 'paramName'}} helper to wrap parameters in spans with data attributes

window.outputTemplate = Handlebars.compile(
`Technical Quality: {{p 'pQuality'}}

Left Ventricle:
{{#if (hasParam 'pRWMA')}}{{p 'pRWMA' conditional=true}}
{{/if}}{{p 'pLVSF'}}

{{p 'pLVMeasurements'}}

Mitral Valve:
{{p 'pMV'}}
{{p 'pMS'}}

{{summary}}`, {noEscape: true});