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
        title: "Left Ventricle (text)",
        enableSectionPreview: true,
        sectionPreviewKey: "LVSection",
        params: {
            RWMAs: {
                title: "RWMAs",
                options: [
                    { label: "(none)", title: "", default: true },
                    { label: "RWMAs (free text)", title: "", summarytext: "Regional wall motion abnormalities described above."},
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                large: true,
                summaryOrder: 1,
            },
            LVSF: {
                title: "",
                options: [
                    { label: "Normal systolic function", title: "Normal left ventricular systolic function.", summarytext: "Normal left ventricular systolic function, ", default: true },
                    { label: "Borderline low systolic function", title: "Borderline low left ventricular systolic function.", summarytext: "Borderline low left ventricular systolic function, "},
                    { label: "Mildly impaired systolic function", title: "Mildly impaired left ventricular systolic function.", summarytext: "Mildly impaired left ventricular systolic function, "},
                    { label: "Moderately impaired systolic function", title: "Moderately impaired left ventricular systolic function.", summarytext: "Moderately impaired left ventricular systolic function, "},
                    { label: "Severely impaired systolic function", title: "Severely impaired left ventricular systolic function.", summarytext: "Severely impaired left ventricular systolic function, "},
                    { label: "Impaired systolic function", title: "Impaired left ventricular systolic function.", summarytext: "Impaired left ventricular systolic function, "},
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 2,
            },
            LVH: {
                title: "",
                options: [
                    { label: "No hypertrophy", title: "No left ventricular hypertrophy.", summarytext: "no hypertrophy, ", default: true },
                    { label: "Concentric hypertrophy", title: "Concentric left ventricular hypertrophy.", summarytext: "concentric hypertrophy, "},
                    { label: "Assymetric hypertrophy", title: "Assymetric left ventricular hypertrophy.", summarytext: "assymetric hypertrophy, "},
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 2,
            },
            LVD: {
                title: "",
                options: [
                    { label: "Not dilated", title: "No left ventricular dilatation", summarytext: "no dilatation. ", default: true },
                    { label: "Mild dilatation", title: "Mild left ventricular dilatation", summarytext: "mild dilatation. " },
                    { label: "Moderate dilatation", title: "Moderate left ventricular dilatation", summarytext: "moderate dilatation. " },
                    { label: "Severe dilatation", title: "Severe left ventricular dilatation", summarytext: "severe dilatation. " },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 2,
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
                summaryOnChange: true,
                summaryOrder: 3,
            },
            LAP: {
                title: "",
                options: [
                    { label: "(blank)", title: ".", default: true },
                    { label: "Normal filling pressures", title: ", normal filling pressures." },
                    { label: "Indeterminate filling pressures", title: ", indeterminate filling pressures." },
                    { label: "Elevated filling pressures", title: ", elevated filling pressures." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 3,
            },
        },
    },
    {
        title: "Left Ventricle (measurements)",
        enableSectionPreview: true,
        sectionPreviewKey: "sectLVMeasurements",
        params: {
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
                summaryOrder: 40,
                summaryExclude: ["SummaryValves"],
            },
            MVMeasurements: {
                title: "MV Measurements",
                options: [
                    { label: "Default (none)", title: "", default: true },
                    { label: "MV Inflow", title: `MV Inflow: Vmax = {{MVVmax}}, MeanPG = {{MVMeanPG}}, VTI = {{MVVTI}}
`},
                    { label: "MR Jet (Single)", title: `MR Jet: VC width = {{MRVCD}}, PISAr (Als Vel. of {{MRALSVEL}}) = {{MRPISA}}, VTI = {{MRVTI}}, RV = {{MRRV}}, ERO = {{MRERO}}
`},
                    { label: "Full", title: `MV Inflow: Vmax = {{MVVmax}}, MeanPG = {{MVMeanPG}}, VTI = {{MVVTI}}
MR Jet: VC width = {{MRVCD}}, PISAr (Als Vel. of {{MRALSVEL}}) = {{MRPISA}}, VTI = {{MRVTI}}, RV = {{MRRV}}, ERO = {{MRERO}}
`},
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
                    { label: "Borderline dilated", title: "Borderline dilated.", summarytext: "Borderline dilated left atrium."},
                    { label: "Dilated", title: "Dilated.", summarytext: "Dilated left atrium." },
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
                summaryOrder: 50,
                summaryExclude: ["SummaryValves"],
            },
            AVMeasurements: {
                title: "AV Measurements",
                options: [
                    { label: "Default", title: `AV Vmax = {{AVVmax}}`, default: true },
                    { label: "BSE set", title: `LVOT Vmax = {{LVOTVmax}}, LVOT MaxPG = {{LVOTMaxPG}}, LVOT MeanPG = {{LVOTMeanPG}}, LVOT VTI = {{LVOTVTI}}
AV Vmax = {{AVVmax}}, AV MaxPG = {{AVMaxPG}}, AV MeanPG = {{AVMeanPG}}, AV VTI = {{AVVTI}}`},
                    { label: "AS assessment", title: `LVOT Diameter = {{LVOTd}}, LVOT Vmax = {{LVOTVmax}}, LVOT MeanPG = {{LVOTMeanPG}}, LVOT VTI = {{LVOTVTI}}, LV SV = {{LVSV}} (Indexed = {{LVSVI}})
AV Vmax = {{AVVmax}}, AV MaxPG = {{AVMaxPG}}, AV MeanPG = {{AVMeanPG}}, AV VTI = {{AVVTI}}, DVI = {{DVI}}
AVA = {{AVA}} (AVA Indexed = {{AVAI}})`},
                    { label: "AVR assessment", title: `LVOT Vmax = {{LVOTVmax}}, LVOT MeanPG = {{LVOTMeanPG}}, LVOT VTI = {{LVOTVTI}}
AV Vmax = {{AVVmax}}, AV MaxPG = {{AVMaxPG}}, AV MeanPG = {{AVMeanPG}}, AV VTI = {{AVVTI}}
DVI = {{DVI}}
AccT = {{AVAccT}}, EjT = {{AVEjT}}, Acc/EjT = {{AVAccEjT}}`},
                ],
            },
        },
    },
    {
        title: "Aorta",
        enableSectionPreview: true,
        sectionPreviewKey: "AoSection",
        params: {
            AoMeasurements: {
                title: "Aorta Measurements",
                options: [
                    { label: "(not selected)", title: "*** (measurement template not selected) ***", default: true },
                    { label: "Male", title: `Sinus of Valsalva = {{SoV}}, Indexed to height = {{SoVI}} (Normal range, male: 14.8-23.2mm/m)
Sinotubular Junction = {{StJ}}, Indexed to height = {{StJI}} (Normal range, male: 12.6-19.8mm/m) 
Ascending aorta = {{Ao}}, Indexed to height = {{AoI}} (Normal range, male: 12.6-21.4mm/m)`},
                    { label: "Female", title: `Sinus of Valsalva = {{SoV}}, Indexed to height = {{SoVI}} (Normal range, female: 14.1-22.1mm/m)
Sinotubular Junction = {{StJ}}, Indexed to height = {{StJI}} (Normal range, female: 12.2-19.4mm/m) 
Ascending aorta = {{Ao}}, Indexed to height = {{AoI}} (Normal range, female: 12.3-21.1mm/m) `},
                ],
                enableSummary: false,
            },
            Aorta: {
                title: "",
                options: [
                    { label: "Not dilated", title: "Not dilated.", default: true },
                    { label: "Dilated root and ascending", title: "Dilated aortic root and proximal ascending aorta."},
                    { label: "Dilated root only", title: "Dilated aortic root.\nNon-dilated proximal ascending aorta.", summarytext: "Dilated aortic root." },
                    { label: "Dilated ascending aorta only", title: "Dilated proximal ascending aorta.\nNon-dilated root.", summarytext: "Dilated proximal ascending aorta." },
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
                    { label: "Unable to assess - poor views", title: "Unable to assess for coarctation due to poor arch views."},
                    { label: "Coarctation demonstrated", title: "Evidence of aortic coarctation.", summarytext: "Evidence of aortic coarctation (see notes above)."},
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["Coarctation demonstrated"],
                summaryOrder: 31,
            },
        },
    },
    {
        title: "Right Ventricle",
        enableSectionPreview: true,
        sectionPreviewKey: "RVSection",
        params: {
            RVF: {
                title: "",
                options: [
                    { label: "Normal function", title: "Normal radial and longitudinal function.", summarytext: "Normal right ventricular function, ", default: true },
                    { label: "Impaired radial function only", title: "Impaired radial function, normal longitudinal function.", summarytext: "Impaired right ventricular function, " },
                    { label: "Impaired longitudinal function only", title: "Impaired longitudinal function, normal radial function.", summarytext: "Impaired right ventricular function, " },
                    { label: "Impaired radial and longitudinal function", title: "Impaired radial and longitudinal function.", summarytext: "Impaired right ventricular function, " },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 10,
            },      
            RVD: {
                title: "",
                options: [
                    { label: "Not dilated", title: "No right ventricular dilatation.", summarytext: "normal size", default: true },
                    { label: "Dilated", title: "Dilated right ventricle.", summarytext: "dilated" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 10,
            },
            RVH: {
                title: "",
                options: [
                    { label: "No hypertrophy", title: "No right ventricular hypertrophy.", summarytext: ".", default: true },
                    { label: "Hypertrophied", title: "Hypertrophied right ventricle.", summarytext: ", hypertrophied." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 10,
            },
            RVMeasurements: {
                title: "RV Measurements",
                options: [
                    { label: "Default", title: `RVD1 = {{RVD1}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}`, default: true },
                    { label: "Default + FAC", title: `RVD1 = {{RVD1}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}, FAC = {{FAC}}`},
                    { label: "Full", title: `RVD1 = {{RVD1}}, RVD2 = {{RVD2}}, RVD3 = {{RVD3}}
RVEDA = {{RVEDA}} (Indexed = {{RVEDAI}}), RVESA = {{RVESA}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}, FAC = {{FAC}}`},
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
                    { label: "Dilated", title: "Dilated.", summarytext: "Dilated right atrium."  },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOrder: 20,
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
                summaryOrder: 60,
                summaryExclude: ["SummaryValves"],
            },
            TVMeasurements: {
                title: "TV Measurements",
                options: [
                    { label: "Default", title: `TR Vmax = {{TRVmax}}, TR MaxPG = {{TRMaxPG}}`, default: true },
                    { label: "TV Inflow", title: `TV Inflow: Vmax = {{TVVmax}}, MeanPG = {{TVMeanPG}}, VTI = {{TVVTI}}
TR Vmax = {{TRVmax}}, TR MaxPG = {{TRMaxPG}}`},
                    { label: "MR Jet (Single)", title: `TR Jet: VC width = {{TRVCD}}, PISAr (Als Vel. of {{TRALSVEL}}) = {{TRPISA}}, VTI = {{TRVTI}}, RV = {{TRRV}}, ERO = {{TRERO}}
TR Vmax = {{TRVmax}}, TR MaxPG = {{TRMaxPG}}`},
                    { label: "Full", title: `TV Inflow: Vmax = {{TVVmax}}, MeanPG = {{TVMeanPG}}, VTI = {{TVVTI}}
TR Jet: VC width = {{TRVCD}}, PISAr (Als Vel. of {{TRALSVEL}}) = {{TRPISA}}, VTI = {{TRVTI}}, RV = {{TRRV}}, ERO = {{TRERO}}
TR Vmax = {{TRVmax}}, TR MaxPG = {{TRMaxPG}}`},
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
                summaryOrder: 70,
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
                    { label: "Default", title: `PV Vmax = {{PVVmax}},
PV AccT = {{PAT}}. {{PVN}}`, default: true },
                    { label: "Full RVOT and PV assessment", title: `RVOT Vmax = {{RVOTVmax}}, RVOT MaxPG = {{RVOTMaxPG}}, RVOT MeanPG = {{RVOTMeanPG}}, RVOT VTI = {{RVOTVTI}}
PV Vmax = {{PVVmax}}, PV MaxPG = {{PVMaxPG}}, PV MeanPG = {{PVMeanPG}}, PV VTI = {{PVVTI}}
PV AccT = {{PAT}}. {{PVN}}`},
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
                    { label: "Not dilated, >50% collapse", title: "not dilated with >50% collapse, estimating RA pressure at 0-5mmHg", default: true },
                    { label: "Not dilated, <50% collapse", title: "not dilated with <50% collapse, estimating RA pressure at 5-15mmHg" },
                    { label: "Dilated, >50% collapse", title: "dilated with >50% collapse, estimating RA pressure at 5-15mmHg" },
                    { label: "Dilated, <50% collapse", title: "dilated with <50% collapse, estimating RA pressure at >15mmHg" },
                    { label: "Not seen", title: "not adequately visualised, unable to estimate RA pressure" },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
            },
            PASP: {
                title: "PASP =",
                options: [
                    { label: "not estimated in the absence of TR Vmax", title: "not estimated in the absence of TR Vmax", default: true },
                    { label: "(enter free text --&gt;)", title: "" },
                ]
            },
            PPHT: {
                title: "Probability of PHT",
                options: [
                    { label: "Low", title: "Low echocardiographic probability of pulmonary hypertension.", default: true },
                    { label: "Intermediate", title: "Intermediate echocardiographic probability of pulmonary hypertension." },
                    { label: "High", title: "High echocardiographic probability of pulmonary hypertension." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["High"],
                summaryOrder: 80,
            },
            ASD: {
                title: "Atrial Septal Defect",
                options: [
                    { label: "No obvious ASD", title: "No obvious atrial septal defect imaged on CFM.", default: true },
                    { label: "Thin and mobile but no ASD", title: "The atrial septum is thin and mobile, but with no obvious defect imaged on CFM."},
                    { label: "Unable to assess - poor subcostal views", title: "Unable to confidently assess atrial septal integrity due to poor subcostal views." },
                    { label: "Small ASD/PFO, left-to-right shunt", title: "Small ASD/PFO demonstrated with resting left-to-right shunt demonstrated on CFM." },
                    { label: "Medium ASD/PFO, left-to-right shunt", title: "Medium ASD/PFO demonstrated with resting left-to-right shunt demonstrated on CFM." },
                    { label: "Large ASD/PFO, left-to-right shunt", title: "Large ASD/PFO demonstrated with resting left-to-right shunt demonstrated on CFM." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["Small ASD/PFO, left-to-right shunt", "Medium ASD/PFO, left-to-right shunt", "Large ASD/PFO, left-to-right shunt"],
                summaryOrder: 81,
            },
            PlEff: {
                title: "Pleural Effusion",
                options: [
                    { label: "(none)", title: "", default: true },
                    { label: "Left pleural effusion", title: "Left pleural effusion noted.", summarytext: "Left pleural effusion." },
                    { label: "Right pleural effusion", title: "Right pleural effusion noted.", summarytext: "Right pleural effusion." },
                    { label: "Bilateral pleural effusions", title: "Bilateral pleural effusions noted.", summarytext: "Bilateral pleural effusions." },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryOnChange: true,
                summaryDefault: false,
                summaryOrder: 82,
            },
            PEff: {
                title: "Pericardial Effusion",
                options: [
                    { label: "No pericardial effusion", title: "No pericardial effusion.", default: true },
                    { label: "Trivial pericardial effusion", title: "Trivial pericardial effusion." },
                    { label: "Small pericardial effusion - no compromise", title: "Trivial pericardial effusion without signs of haemodynamic compromise." },
                    { label: "Full Effusion Template", title: `
Pericardial Effusion:            
    Small/Medium/Large global/localised pericardial effusion, mostly around the LV/RV/RA - with/without evidence of haemodynamic compromise.
    
    Measures maximally at end-diastole:
    - LV:   cm (PLAX), cm (PSAX), cm (A4C), cm (Subcostal)
    - RV:   cm (PLAX), cm (PSAX), cm (A4C), cm (Subcostal)

    And at end-systole:
    - RA:   cm (A4C), cm (Subcostal)

    Signs of haemodynamic compromise:
    - Normal septal motion.
    - No mid-diastolic RV collapse.
    - No mid-systolic RA collapse.
    - Normal IVC size, collapses.

    MV inflow: Vmax = cm/s, Vmin = cm/s; Variation = % (normal range less than 25%)
    TV inflow: Vmax = cm/s, Vmin = cm/s; Variation = % (normal range less than 40%)`, summarytext: "Small/Medium/Large global/localised pericardial effusion, mostly around the LV/RV/RA - with/without evidence of haemodynamic compromise.", },
                    { label: "(enter free text --&gt;)", title: "" },
                ],
                enableSummary: true,
                summaryOnChange: true,
                summaryDefault: false,
                summaryOrder: 83,
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
                summaryAlwaysInclude: true,
                summaryOrder: 0,
            },
            SummaryLV: {
                title: "Ejection Fraction",
                options: [
                    { label: "Biplane", title: "Estimated ejection fraction {{EFBP}}", default: true },
                    { label: "Biplane + GLS", title: "Estimated ejection fraction {{EFAuto}}, GLS {{GLS}}"},
                    { label: "Auto EF", title: "Estimated ejection fraction {{EFAuto}}"},
                    { label: "Auto EF + GLS", title: "Estimated ejection fraction {{EFAuto}}, GLS {{GLS}}"},
                    { label: "(none)", title: ""},
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 2,
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