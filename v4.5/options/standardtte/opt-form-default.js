window.options = [
    {
        title: "Study details",
        enableSectionPreview: true,
        sectionPreviewKey: "DetailsSection",
        params: {
            paramsHeader: {
                title: "Header",
                options: [
                    { label: "Default", title: "The report is compiled in accordance to a locally agreed combination of BSE Guidelines 2020 and EACVI guidelines 2016. Unless specified in the report conclusion, it is the sole responsibility of the referring physician to act upon the findings of this study. In specific cases where delay may result in patient harm, sonographers will refer for urgent clinical support.", default: true, },    
                ],
            },
            TechnicalQualilty: {
                title: "Technical quality:",
                options: [
                    { label: "Good", title: "Good" },
                    { label: "Fair", title: "Fair", default: true },
                    { label: "Poor", title: "Poor -" },
                    { label: "Very poor", title: "Very poor -" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
            Machine: {
                title: "Machine:",
                options: [
                    { label: "GE Pioneer", title: "GE Pioneer" },
                    { label: "GE 95", title: "GE E95", default: true },
                    { label: "GE S70", title: "GE S70" },
                    { label: "GE iQ", title: "GE iQ" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
            Rhythm: {
                title: "Rhythm",
                options: [
                    { label: "Sinus rhythm", title: "Sinus rhythm", default: true },
                    { label: "AF", title: "Atrial fibrillation" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
        },
    },
    {
        title: "Left Ventricle",
        enableSectionPreview: true,
        sectionPreviewKey: "LVSection",
        params: {
            RWMAs: {
                title: "RWMAs",
                custom: true,
                large: true,
                summaryOrder: 1,
            },
            LVSF: {
                title: "",
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
                title: "",
                options: [
                    { label: "Normal wall thickness", title: "Normal wall thickness", default: true },
                    { label: "Concentric hypertrophy", title: "Concentric hypertrophy" },
                    { label: "Concentric remodelling", title: "Concentric remodelling" },
                    { label: "Eccentric hypertrophy", title: "Eccentric hypertrophy" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 2,
            },
            LVD: {
                title: "",
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
            LVMeasurements: {
                title: "LV Measurements",
                options: [
                    { label: "Default", title: `IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
E/A ratio = {{EARatio}}, E DecT = {{EDecT}}, Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}
Simpsons Biplane LVEF = {{EFBP}}, Auto EF = {{EFAuto}}
Global Averaged Longitudinal Strain = {{GLS}}`, default: true },
                    { label: "None", title: ""},
                ],
            },
        },
    },
    {
        title: "Mitral Valve",
        enableSectionPreview: true,
        sectionPreviewKey: "MVSection",
        params: {
            MV: {
                title: "",
                options: [
                    { label: "Normal leaflets", title: "Thin and mobile leaflets, opens well.", default: true },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
            MS: {
                title: "",
                options: [
                    { label: "No stenosis", title: "No mitral stenosis.", default: true },
                    { label: "Mild stenosis", title: "Mild mitral stenosis." },
                    { label: "Moderate stenosis", title: "Moderate mitral stenosis." },
                    { label: "Severe stenosis", title: "Severe mitral stenosis." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 40,
                summaryExclude: ["SummaryValves"],
            },
            MR: {
                title: "",
                options: [
                    { label: "Trivial regurgitation", title: "Trivial mitral regurgitation.", default: true },
                    { label: "Mild regurgitation", title: "Mild mitral regurgitation." },
                    { label: "Moderate regurgitation", title: "Moderate mitral regurgitation." },
                    { label: "Severe regurgitation", title: "Severe mitral regurgitation." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["Moderate regurgitation", "Severe regurgitation"],
                summaryOrder: 41,
                summaryExclude: ["SummaryValves"],
            },
            MVMeasurements: {
                title: "MV Measurements",
                options: [
                    { label: "Default (none)", title: "", default: true },
                    { label: "MV Inflow", title: `MV Vmax = {{MVVmax}}, MV MeanPG = {{MVMeanPG}}, MV VTI = {{MVVTI}}
                    `},
                    { label: "MR", title: ""},
                    { label: "(blank)", title: ""},          
                ],
            },
        },
    },
    {
        title: "Left Atrium",
        enableSectionPreview: true,
        sectionPreviewKey: "LASection",
        params: {
            LAtrium: {
                title: "",
                options: [
                    { label: "Not dilated", title: "Not dilated.", default: true },
                    { label: "Borderline dilated", title: "Borderline dilated." },
                    { label: "Dilated", title: "Dilated." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 20,
            },
        },
    },
    {
        title: "Aortic Valve",
        enableSectionPreview: true,
        sectionPreviewKey: "AVSection",
        params: {
            AV: {
                title: "",
                options: [
                    { label: "Trileaflet, normal", title: "Trileaflet, thin and mobile cusps, opens well.", default: true },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
            AS: {
                title: "",
                options: [
                    { label: "No stenosis", title: "No aortic stenosis.", default: true },
                    { label: "Mild stenosis", title: "Mild aortic stenosis." },
                    { label: "Moderate stenosis", title: "Moderate aortic stenosis." },
                    { label: "Severe stenosis", title: "Severe aortic stenosis." },
                    { label: "Very severe stenosis", title: "very severe aortic stenosis." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 50,
                summaryExclude: ["SummaryValves"],
            },
            AR: {
                title: "",
                options: [
                    { label: "No regurgitation", title: "No aortic regurgitation.", default: true },
                    { label: "Trivial regurgitation", title: "Trivial aortic regurgitation." },
                    { label: "Mild regurgitation", title: "Mild aortic regurgitation." },
                    { label: "Moderate regurgitation", title: "Moderate aortic regurgitation." },
                    { label: "Severe regurgitation", title: "Severe aortic regurgitation." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["Mild regurgitation", "Moderate regurgitation", "Severe regurgitation"],
                summaryOrder: 51,
                summaryExclude: ["SummaryValves"],
            },
            AVMeasurements: {
                title: "AV Measurements",
                options: [
                    { label: "Default", title: `AV Vmax = {{AVVmax}}`, default: true },
                    { label: "LVOT and AV measures", title: `LVOT Vmax = {{LVOTVmax}}, LVOT MeanPG = {{LVOTMeanPG}}, LVOT VTI = {{LVOTVTI}}
AV Vmax = {{AVVmax}}, AV MaxPG = {{AVMaxPG}}, AV MeanPG = {{AVMeanPG}}, AV VTI = {{AVVTI}}`},
                    { label: "Full", title: `LVOT Vmax = {{LVOTVmax}}, LVOT MeanPG = {{LVOTMeanPG}}, LVOT VTI = {{LVOTVTI}}
LVOT Diameter = {{LVOTd}}, LV SV = {{LVSV}} (Indexed = {{LVSVI}})
AV Vmax = {{AVVmax}}, AV MaxPG = {{AVMaxPG}}, AV MeanPG = {{AVMeanPG}}, AV VTI = {{AVVTI}}
DVI = {{DVI}}, AVA = {{AVA}} (Indexed = {{AVAI}})`},
                ],
            },
        },
    },
    {
        title: "Aorta",
        enableSectionPreview: true,
        sectionPreviewKey: "AoSection",
        params: {
            Aorta: {
                title: "",
                options: [
                    { label: "Not dilated", title: "Not dilated.", default: true },
                    { label: "Dilated root and ascending", title: "Dilated aortic root and proximal ascending aorta." },
                    { label: "Dilated root only", title: "Dilated aortic root.\nThe proximal ascending aorta is not dilated." },
                    { label: "Dilated ascending aorta only", title: "Dilated proximal ascending aorta.\nThe aortic root is not dilated." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 30,
            },
            Coarc: {
                title: "",
                options: [
                    { label: "No coarctation", title: "No coarctation.", default: true },
                    { label: "Unable to assess - poor views", title: "Unable to assess for coarctation due to poor arch views." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 31,
            },
        },
    },
    {
        title: "Right Ventricle",
        enableSectionPreview: true,
        sectionPreviewKey: "RVSection",
        params: {
            RVFr: {
                title: "",
                options: [
                    { label: "Normal radial function", title: "Normal radial function.", default: true },
                    { label: "Impaired radial function", title: "Impaired radial function." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 10,
            },    
            RVFl: {
                title: "",
                options: [
                    { label: "Normal longitudinal function", title: "Normal longitudinal function.", default: true },
                    { label: "Impaired longitudinal function", title: "Impaired longitudinal function." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 11,
            },     
            RVD: {
                title: "",
                options: [
                    { label: "Not dilated", title: "No right ventricular dilatation.", default: true },
                    { label: "Dilated", title: "Dilated right ventricle." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 12,
            },
            RVH: {
                title: "",
                options: [
                    { label: "No hypertrophy", title: "No right ventricular hypertrophy.", default: true },
                    { label: "Hypertrophied", title: "Hypertrophied right ventricle." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 13,
            },
            RVMeasurements: {
                title: "RV Measurements",
                options: [
                    { label: "Default", title: `RVD1 = {{RVD1}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}`, default: true },
                    { label: "None", title: ""},
                ],
            },
        },
    },
    {
        title: "Right Atrium",
        enableSectionPreview: true,
        sectionPreviewKey: "RASection",
        params: {
            RAtrium: {
                title: "",
                options: [
                    { label: "Not dilated", title: "Not dilated.", default: true },
                    { label: "Dilated", title: "Dilated." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 21,
            },
        },
    },
    {
        title: "Tricuspid Valve",
        enableSectionPreview: true,
        sectionPreviewKey: "TVSection",
        params: {
            TV: {
                title: "",
                options: [
                    { label: "Normal leaflets", title: "Thin and mobile leaflets, opens well.", default: true },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
            TS: {
                title: "",
                options: [
                    { label: "No stenosis", title: "No tricuspid stenosis.", default: true },
                    { label: "Mild stenosis", title: "Mild tricuspid stenosis." },
                    { label: "Moderate stenosis", title: "Moderate tricuspid stenosis." },
                    { label: "Severe stenosis", title: "Severe tricuspid stenosis." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 60,
                summaryExclude: ["SummaryValves"],
            },
            TR: {
                title: "",
                options: [
                    { label: "Trivial regurgitation", title: "Trivial tricuspid regurgitation.", default: true },
                    { label: "Mild regurgitation", title: "Mild tricuspid regurgitation." },
                    { label: "Moderate regurgitation", title: "Moderate tricuspid regurgitation." },
                    { label: "Severe regurgitation", title: "Severe tricuspid regurgitation." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["Moderate regurgitation", "Severe regurgitation"],
                summaryOrder: 61,
                summaryExclude: ["SummaryValves"],
            },
            TVMeasurements: {
                title: "TV Measurements",
                options: [
                    { label: "Default", title: `TR Vmax = {{TRVmax}}, TR MaxPG = {{TRMaxPG}}`, default: true },
                    { label: "None", title: ""},
                ],
            },
        },
    },
    {
        title: "Pulmonary Valve",
        enableSectionPreview: true,
        sectionPreviewKey: "PVSection",
        params: {
            PV: {
                title: "",
                options: [
                    { label: "Normal leaflets", title: "Thin and mobile cusps where seen.", default: true },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
            PS: {
                title: "",
                options: [
                    { label: "No stenosis", title: "No pulmonary stenosis.", default: true },
                    { label: "Mild stenosis", title: "Mild pulmonary stenosis." },
                    { label: "Moderate stenosis", title: "Moderate pulmonary stenosis." },
                    { label: "Severe stenosis", title: "Severe pulmonary stenosis." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 70,
                summaryExclude: ["SummaryValves"],
            },
            PR: {
                title: "",
                options: [
                    { label: "Trivial regurgitation", title: "Trivial pulmonary regurgitation.", default: true },
                    { label: "Mild regurgitation", title: "Mild pulmonary regurgitation." },
                    { label: "Moderate regurgitation", title: "Moderate pulmonary regurgitation." },
                    { label: "Severe regurgitation", title: "Severe pulmonary regurgitation." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["Moderate regurgitation", "Severe regurgitation"],
                summaryOrder: 71,
                summaryExclude: ["SummaryValves"],
            },
            PVN: {
                title: "",
                options: [
                    { label: "No systolic notch", title: "No mid-systolic notch.", default: true },
                    { label: "Systolic notch demonstrated", title: "Systolic notch demonstrated." },
                ],
            },
            PVMeasurements: {
                title: "PV Measurements",
                options: [
                    { label: "Default", title: `PV Vmax = {{PVVMax}}
PV AccT = {{PAT}}. {{PVN}}`, default: true },
                    { label: "None", title: ""},
                ],
            },
        },
    },
        
    {
        title: "Miscellaneous",
        enableSectionPreview: true,
        sectionPreviewKey: "MiscSection",
        params: {
            IVCD: {
                title: "IVC Size",
                options: [
                    { label: "Not dilated", title: "not dilated", default: true },
                    { label: "Dilated", title: "dilated" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
            IVCC: {
                title: "IVC Collapse",
                options: [
                    { label: "Normal", title: "more than 50%", default: true },
                    { label: "No collapse", title: "less than 50%" },
                ],
            },
            RAP: {
                title: "RA Pressure",
                options: [
                    { label: "0-5mmHg", title: "0-5", default: true },
                    { label: "5-15mmHg", title: "5-15" },
                    { label: ">15mmHg", title: ">15" },
                ],
            },
            PPHT: {
                title: "Probability of PHT",
                options: [
                    { label: "Low", title: "Low echocardiographic probability of pulmonary hypertension", default: true },
                    { label: "Intermediate", title: "Intermediate echocardiographic probability of pulmonary hypertension" },
                    { label: "High", title: "High echocardiographic probability of pulmonary hypertension" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["High"],
            },
            PASP: {
                title: "PASP =",
                options: [
                    { label: "not estimated in the absence of TR Vmax", title: "not estimated in the absence of TR Vmax", default: true },
                    { label: "(enter free text --&gt;)", title: "" },
                ]
            },
            ASD: {
                title: "Atrial Septal Defect",
                options: [
                    { label: "No obvious ASD", title: "No obvious atrial septal defect imaged on CFM.", default: true },
                    { label: "Unable to assess - poor subcostal views", title: "Unable to confidently assess atrial setal integrity due to poor subcostal views." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
            PEff: {
                title: "Pericardial Effusion",
                options: [
                    { label: "No pericardial effusion", title: "No pericardial effusion.", default: true },
                    { label: "Trivial pericardial effusion", title: "Trivial pericardial effusion." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
            },
        },
    },
    {
        title: "Summary",
        sectionPreviewKey: "SummarySection",
        params: {
            SummaryTitle: {
                title: "Header",
                options: [
                    { label: "Summary", title: "Summary:", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 0,
            },
            SummaryRWMA: {
                title: "RWMAs",
                options: [
                    { label: "Regional wall motion abnormalities described above", title: "Regional wall motion abnormalities described above.", default: true},
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 1,
            },
            SummaryLV: {
                title: "Left Ventricle",
                options: [
                    { label: "Normal LV", title: "Normal left ventricular systolic function with no hypertrophy or dilatation. Estimated ejection fraction {{EFBP}}", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 1,
            },
            SummaryRV: {
                title: "Right Ventricle",
                options: [
                    { label: "Normal RV", title: "Normal right ventricular size and function.", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 10,
            },
            SummaryValves: {
                title: "Valves",
                options: [
                    { label: "Normal valves", title: "No significant valvular abnormalities.", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 29,
            },
            Summary: {
                title: "",
                custom: true,
                large: true,
            },
        },
    },
];