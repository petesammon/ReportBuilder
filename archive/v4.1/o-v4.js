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
{{Diastology}}.

IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
E/A ratio = {{EARatio}}, E DecT = {{EDecT}}, Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}
Simpsons Biplane LVEF = {{EFBP}}, Auto EF = {{EFAuto}}
Global Averaged Longitudinal Strain = {{GLS}}`,
        params: {
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
                    { label: "No hypertrophy", title: "No left ventricular hypertrophy", default: true },
                    { label: "Mild concentric hypertrophy", title: "Mild concentric left ventricular hypertrophy"},
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
                    { label: "Impaired diastolic function, normal filling pressures", title: "Impaired diastolic function, normal filling pressures at rest" },
                    { label: "Impaired diastolic function, indeterminate filling pressures", title: "Impaired diastolic function, indeterminate filling pressures at rest" },
                    { label: "Impaired diastolic function, elevated filling pressures", title: "Impaired diastolic function, elevated filling pressures at rest" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 4,
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