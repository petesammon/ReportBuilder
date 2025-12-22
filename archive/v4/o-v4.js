window.options = [
    {
        title: "Left Ventricle",
        enableSectionPreview: true,
        sectionPreviewKey: "LVSection",
        sectionTemplate: 
`Left Ventricle:
{{#if RWMAs ~}}{{RWMAs}}
{{/if~}}
{{LVSF}}.
{{LVH}}.
{{LVD}}.
{{Diastology}}{{LAP}}

IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
E/A ratio = {{EARatio}}, E DecT = {{EDecT}}, Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}
Simpsons Biplane LVEF = {{EFBP}}, Auto EF = {{EFAuto}}
Global Averaged Longitudinal Strain = {{GLS}}`,
        params: {
            RWMAs: {
                title: "RWMAs",
                custom: true,
                large: true,
                enableSummary: true,
                summaryDefault: true,
                summaryOnChange: true,
                summaryOrder: 0,
            },
            LVSF: {
                title: "",
                custom: true,
                conditionalText: true,
                options: [
                    { label: "Normal systolic function", title: "Normal left ventricular systolic function", default: true },
                    { label: "Borderline low systolic function", title: "Borderline low left ventricular systolic function" },
                    { label: "Mildly impaired systolic function", title: "Mildly impaired left ventricular systolic function" },
                    { label: "Moderately impaired systolic function", title: "Moderately impaired left ventricular systolic function" },
                    { label: "Severely impaired systolic function", title: "Severely impaired left ventricular systolic function" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 1,
            },
            LVH: {
                options: [
                    { label: "Normal wall thickness", title: "Normal wall thickness", default: true },
                    { label: "(blank)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 2,
            },
            LVD: {
                title: "",
                custom: true,
                conditionalText: true,
                options: [
                    { label: "Not dilated", title: "No left ventricular dilatation", default: true },
                    { label: "Mild dilatation", title: "Mild left ventricular dilatation" },
                    { label: "Moderate dilatation", title: "Moderate left ventricular dilatation" },
                    { label: "Severe dilatation", title: "Severe left ventricular dilatation" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 3,
            },
            Diastology: {
                title: "",
                custom: true,
                conditionalText: true,
                options: [
                    { label: "Normal diastolic function", title: "Normal diastolic function for age", default: true },
                    { label: "Impaired diastolic function", title: "Impaired diastolic function" },
                    { label: "Indeterminate diastolic function", title: "Indeterminate diastolic function" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 4,
            },
            LAP: {
                title: "",
                custom: true,
                conditionalText: true,
                options: [
                    { label: "(filling pressure)", title: ".", default: true },
                    { label: "Normal filling pressures", title: ", normal filling pressures." },
                    { label: "Indeterminate filling pressures", title: ", indeterminate filling pressures." },
                    { label: "Elevated filling pressures", title: ", elevated filling pressures." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 5,
            },
        },
    },
    {
        title: "Summary",
        params: {
            SummaryLV: {
                title: "",
                options: [
                    { label: "Normal LV", title: "Normal left ventricular systolic function with no hypertrophy or dilatation. Estimated ejection fraction {{EFBP}}", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 1,
            },
            Summary: {
                title: "",
                custom: true,
                large: true,
            },
        },
    },
];