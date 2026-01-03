window.options = [
{
    parameter: "pQuality",
    title: "Technical quality:",
    options: [
        { label: "Good", title: "Good" },
        { label: "Fair", title: "Fair", default: true },
        { label: "Poor", title: "Poor" },
        { label: "Very poor", title: "Very poor" },
    ],
},
{
    parameter: "pRWMA",
    title: "RWMAs",
    options: "customtext", 
    summarytext: "Regional wall motion abnormalites described above.",
    enableSummary: true,
    summaryDefault: false,
    summaryOnChange: true,
    summaryOrder: 1,
},
{
    parameter: "pLVSF",
    title: "Systolic Function",
    options: [
        { label: "Normal systolic function", title: "Normal left ventricular systolic function.", summarytext: "Normal left ventricular systolic function,", default: true },
        { label: "Borderline low systolic function", title: "Borderline low left ventricular systolic function.", summarytext: "Borderline low left ventricular systolic function,"},
        { label: "Mildly impaired systolic function", title: "Mildly impaired left ventricular systolic function.", summarytext: "Mildly impaired left ventricular systolic function,"},
        { label: "Moderately impaired systolic function", title: "Moderately impaired left ventricular systolic function.", summarytext: "Moderately impaired left ventricular systolic function,"},
        { label: "Severely impaired systolic function", title: "Severely impaired left ventricular systolic function.", summarytext: "Severely impaired left ventricular systolic function,"},
        { label: "Impaired systolic function", title: "Impaired left ventricular systolic function.", summarytext: "Impaired left ventricular systolic function,"},
    ],
    enableSummary: true,
    summaryDefault: true,
    summaryOrder: 3,
},
{
    parameter: "pLVMeasurements",
    title: "Measurement Template",
    options: [
        { label: "Default", title: `IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
Peak E velocity = {{EVel}}, E DecT = {{EDecT}}, Peak A velocity = {{AVel}}, E/A ratio = {{EARatio}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}
Simpsons Biplane LVEF = {{EFBP}}, Auto EF = {{EFAuto}}
Global Averaged Longitudinal Strain = {{GLS}}`, default: true },
    ],
},
{
    parameter: "pMV",
    title: "Leaflets",
    options: [
        { label: "Normal leaflets", title: "Thin and mobile leaflets, opens well.", default: true },
        { label: "Annular thickening, thin and mobile leaflets", title: "Mitral annular thickening, leaflets remain thin and mobile, opens well." },
        { label: "Annular thickening, thick and restricted leaflets", title: "Mitral annular thickening extending into leaflets, restricted opening." },
        { label: "BioMVR", title: "BioMVR in situ, stable.", summarytext: "BioMVR stable."},
        { label: "Mechanical MVR", title: "Mechanical MVR in situ, stable.", summarytext: "Mechanical MVR stable." },
        { label: "Mitral TEER", title: "Mitral TEER device(s) in situ, stable.", summarytext: "Mitral TEER stable." },
    ],
    enableSummary: true,
    summaryDefault: false,
    summaryOnChange: true,
    summaryThreshold: ["BioMVR", "Mechanical MVR", "Mitral TEER"],
    summaryOrder: 40,
    summaryExclude: ["spValves"],
},
{
    parameter: "pMS",
    title: "Stenosis",
    options: [
        { label: "No stenosis", title: "No mitral stenosis.", default: true },
        { label: "Mild stenosis", title: "Mild mitral stenosis." },
        { label: "Moderate stenosis", title: "Moderate mitral stenosis." },
        { label: "Severe stenosis", title: "Severe mitral stenosis." },
        { label: "No obstruction", title: "No obstruction." },
        { label: "Possible obstruction", title: "Possible obstruction to forwards flow." },
        { label: "Probable obstruction", title: "Probable obstruction to forwards flow." },
        { label: "Obstructed", title: "Obstructed forwards flow." },
    ],
    enableSummary: true,
    summaryDefault: false,
    summaryOnChange: true,
    summaryOrder: 40,
    summaryExclude: ["spValves"],
},
{
    parameter: "spHeader",
    title: "Summary Header",
    summary: true,
    options: [
        { label: "Summary Header", title: "Summary:", default: true },
    ],
    enableSummary: true,
    summaryAlwaysInclude: true,
    summaryOrder: 0,
},
{
    parameter: "spValves",
    title: "Valve Summary",
    options: [
        { label: "Normal valves", title: "No significant valvular abnormalities.", default: true },
    ],
    enableSummary: true,
    summaryDefault: true,
    summaryOrder: 39,
},
{
    parameter: "spLV",
    title: "Ejection Fraction",
    summary: true,
    options: [
        { label: "Biplane", title: "Estimated ejection fraction {{EFBP}}", default: true },
        { label: "Biplane + GLS", title: "Estimated ejection fraction {{EFBP}}, GLS {{GLS}}"},
        { label: "Auto EF", title: "Estimated ejection fraction {{EFAuto}}"},
        { label: "Auto EF + GLS", title: "Estimated ejection fraction {{EFAuto}}, GLS {{GLS}}"},
    ],
    enableSummary: true,
    summaryDefault: true,
    summaryOrder: 3,
},
];