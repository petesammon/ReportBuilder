window.options = [
    {
        title: "Report Header",
        enableSectionPreview: true,
        sectionPreviewKey: "sectHeader",
        params: {
            paramsHeader: {
                title: "Header",
                options: [
                    { label: "Default", title: "The report is compiled in accordance to a locally agreed combination of BSE Guidelines 2024 and ASE/EACVI guidelines 2016/2025. Unless specified in the report conclusion, it is the sole responsibility of the referring physician to act upon the findings of this study. In specific cases where delay may result in patient harm, sonographers will refer for urgent clinical support.", default: true, },    
                ],
                customText: false,
            },
        },
    },
    {
        title: "Study details",
        enableSectionPreview: true,
        sectionPreviewKey: "sectStudy",
        params: {
            TechnicalQualilty: {
                title: "Technical quality:",
                options: [
                    { label: "Good", title: "Good" },
                    { label: "Fair", title: "Fair", default: true },
                    { label: "Poor", title: "Poor" },
                    { label: "Very poor", title: "Very poor" },
                ],
            },
            Machine: {
                title: "Machine",
                options: [
                    { label: "GE Pioneer", title: "GE Pioneer" },
                    { label: "GE 95", title: "GE E95", default: true },
                    { label: "GE S70", title: "GE S70" },
                    { label: "GE iQ", title: "GE iQ" },
                ],
            },
            Rhythm: {
                title: "Rhythm",
                options: [
                    { label: "Sinus rhythm", title: "Sinus rhythm", default: true },
                    { label: "AF", title: "Atrial fibrillation" },
                ],
            },
        },
    },
    {
        title: "Left Ventricle",
        enableSectionPreview: true,
        sectionPreviewKey: "sectLV",
        params: {
            RWMAs: {
                title: "RWMAs",
                options: [
                    { label: "(none)", title: "", default: true },
                    { label: "", title: "", summarytext: "Regional wall motion abnormalities described above."},
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                textareaSize: 5,
                summaryOrder: 1,
            },
            LVComments: {
                title: "Other comments",
                options: [
                    { label: "(none)", title: "", default: true },
                ],
                enableSummary: true,
                summaryDefault: false,
                textareaSize: 3,
                summaryOrder: 2,
            },
            LVSF: {
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
            LVH: {
                title: "Hypertrophy",
                options: [
                    { label: "No hypertrophy", title: "No left ventricular hypertrophy.", summarytext: "no hypertrophy,", default: true },
                    { label: "Concentric hypertrophy", title: "Concentric left ventricular hypertrophy.", summarytext: "concentric hypertrophy,"},
                    { label: "Assymetric hypertrophy", title: "Assymetric left ventricular hypertrophy.", summarytext: "assymetric hypertrophy,"},
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 3,
            },
            LVD: {
                title: "Dilatation",
                options: [
                    { label: "Not dilated", title: "No left ventricular dilatation", summarytext: "no dilatation.", default: true },
                    { label: "Mild dilatation", title: "Mild left ventricular dilatation", summarytext: "mild dilatation." },
                    { label: "Moderate dilatation", title: "Moderate left ventricular dilatation", summarytext: "moderate dilatation." },
                    { label: "Severe dilatation", title: "Severe left ventricular dilatation", summarytext: "severe dilatation." },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 3,
            },
            Diastology: {
                title: "Diastolic function",
                options: [
                    { label: "Normal diastolic function", title: "Normal diastolic function for age", default: true },
                    { label: "Impaired diastolic function", title: "Impaired diastolic function" },
                    { label: "Indeterminate diastolic function", title: "Indeterminate diastolic function" },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 4,
            },
            LAP: {
                title: "Filling pressure",
                options: [
                    { label: "(no stated)", title: ".", default: true },
                    { label: "Normal filling pressures", title: ", normal filling pressures.", summarytext: "^, normal filling pressures.",},
                    { label: "Indeterminate filling pressures", title: ", indeterminate filling pressures.", summarytext: "^, indeterminate filling pressures.", },
                    { label: "Elevated filling pressures", title: ", elevated filling pressures.", summarytext: "^, elevated filling pressures.", },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 4,
            },
        },
    },
    {
        title: "LV Measurements",
        enableSectionPreview: true,
        sectionPreviewKey: "sectLVMeasurements",
        params: {
            LVMeasurements: {
                title: "Measurement Template",
                options: [
                    { label: "Default", title: `IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
E/A ratio = {{EARatio}}, E DecT = {{EDecT}}, Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}
Simpsons Biplane LVEF = {{EFBP}}, Auto EF = {{EFAuto}}
Global Averaged Longitudinal Strain = {{GLS}}`, default: true },
                    { label: "Default + Volumes", title: `IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
LVEDV = {{LVEDV}} (Indexed = {{LVEDVInd}}), LVESV = {{LVESV}} (Indexed = {{LVESVInd}})
E/A ratio = {{EARatio}}, E DecT = {{EDecT}}, Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}
Simpsons Biplane LVEF = {{EFBP}}, Auto EF = {{EFAuto}}
Global Averaged Longitudinal Strain = {{GLS}}`},
                    { label: "Oncology", title: `IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
E/A ratio = {{EARatio}}, E DecT = {{EDecT}}, Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}

LVEDV = {{LVEDV}} (Indexed = {{LVEDVInd}}), LVESV = {{LVESV}} (Indexed = {{LVESVInd}})
Simpsons Biplane LVEF = {{EFBP}}
Auto EF = {{EFAuto}}
3D EF = %
Global Averaged Longitudinal Strain = {{GLS}}`},
                    { label: "HCM", title: `IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
PSAX Basal: Septal = cm, Anterior = cm, Lateral = cm, Inferior = cm
PSAX Mid: Septal = cm, Anterior = cm, Lateral = cm, Inferior = cm
PSAX Apex: Septal = cm, Anterior = cm, Lateral = cm, Inferior = cm

E/A ratio = {{EARatio}}, E DecT = {{EDecT}}, Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}
Simpsons Biplane LVEF = {{EFBP}}, Auto EF = {{EFAuto}}
Global Averaged Longitudinal Strain = {{GLS}}`},
                ],
                customText: false,
            },
        },
    },
    {
        title: "Mitral Valve",
        enableSectionPreview: true,
        sectionPreviewKey: "sectMV",
        params: {
            MV: {
                title: "Leaflets",
                options: [
                    { label: "Normal leaflets", title: "Thin and mobile leaflets, opens well.", default: true },
                    { label: "Annular thickening, thin and mobile leaflets", title: "Mitral annular thickening, leaflets remain thin and mobile, opens well." },
                    { label: "Annular thickening, thick and restricted leaflets", title: "Mitral annular thickening extending into leaflets, restricted opening." },
                    { label: "BioMVR, stable", title: "BioMVR in situ, stable." },
                    { label: "Mechanical MVR, stable", title: "Mechanical MVR in situ, stable." },
                    { label: "Mitral TEER, stable", title: "Mitral TEER device(s) in situ, stable." },
                ],
            },
            MS: {
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
                summaryExclude: ["SummaryValves"],
            },
            MR: {
                title: "Regurgitation",
                options: [
                    { label: "Trivial regurgitation", title: "Trivial mitral regurgitation.", default: true },
                    { label: "Mild regurgitation", title: "Mild mitral regurgitation." },
                    { label: "Moderate regurgitation", title: "Moderate mitral regurgitation." },
                    { label: "Severe regurgitation", title: "Severe mitral regurgitation." },
                    { label: "Mild transvalvular regurgitation", title: "Mild transvalvular mitral regurgitation." },
                    { label: "Moderate transvalvular regurgitation", title: "Moderate transvalvular mitral regurgitation." },
                    { label: "Severe transvalvular regurgitation", title: "Severe transvalvular mitral regurgitation." },
                    { label: "Mild paravalvular regurgitation", title: "Mild paravalvular mitral regurgitation." },
                    { label: "Moderate paravalvular regurgitation", title: "Moderate paravalvular mitral regurgitation." },
                    { label: "Severe paravalvular regurgitation", title: "Severe paravalvular mitral regurgitation." },
                    { label: "Mild residual regurgitation", title: "Mild residual mitral regurgitation." },
                    { label: "Moderate residual regurgitation", title: "Moderate residual mitral regurgitation." },
                    { label: "Severe residual regurgitation", title: "Severe residual mitral regurgitation." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryNotThreshold: ["Trivial regurgitation", "Mild regurgitation"],
                summaryOrder: 40,
                summaryExclude: ["SummaryValves"],
            },
            MVMeasurements: {
                title: "Measurement Template",
                options: [
                    { label: "Default (none)", title: "", default: true },
                    { label: "MV Inflow", title: `
MV Inflow: Vmax = {{MVVmax}}, MeanPG = {{MVMeanPG}}, VTI = {{MVVTI}}`},
                    { label: "MR Jet (Single)", title: `
MR Jet: VC width = {{MRVCD}}, PISAr (Als Vel. of {{MRALSVEL}}) = {{MRPISA}}, VTI = {{MRVTI}}, RV = {{MRRV}}, ERO = {{MRERO}}`},
                    { label: "Full", title: `
MV Inflow: Vmax = {{MVVmax}}, MeanPG = {{MVMeanPG}}, VTI = {{MVVTI}}
MR Jet: VC width = {{MRVCD}}, PISAr (Als Vel. of {{MRALSVEL}}) = {{MRPISA}}, VTI = {{MRVTI}}, RV = {{MRRV}}, ERO = {{MRERO}}`},
                ],
                customText: false,
            },
        },
    },
    {
        title: "Left Atrium",
        enableSectionPreview: true,
        sectionPreviewKey: "sectLA",
        params: {
            LAtrium: {
                title: "Size",
                options: [
                    { label: "Not dilated", title: "Not dilated.", default: true },
                    { label: "Borderline dilated", title: "Borderline dilated.", summarytext: "Borderline dilated left atrium."},
                    { label: "Dilated", title: "Dilated.", summarytext: "Dilated left atrium." },
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
        sectionPreviewKey: "sectAV",
        params: {
            AV: {
                title: "Leaflets",
                options: [
                    { label: "Trileaflet, normal", title: "Trileaflet, thin and mobile cusps, opens well.", default: true },
                    { label: "Trileaflet, thickened and restricted", title: "Trileaflet, thickened cusps with restricted opening."},
                    { label: "BAV", title: "Bicuspid aortic valve.", summarytext: "Bicuspid aortic valve."},
                    { label: "BioAVR", title: "BioAVR in situ, stable.", summarytext: "BioAVR stable."},
                    { label: "Mechanical AVR", title: "Mechanical AVR in situ, stable.", summarytext: "Mechanical AVR stable." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["BAV", "BioAVR", "Mechanical AVR"],
                summaryOrder: 50,
                summaryExclude: ["SummaryValves"],
            },
            AS: {
                title: "Stenosis",
                options: [
                    { label: "No stenosis", title: "No aortic stenosis.", default: true },
                    { label: "Mild stenosis", title: "Mild aortic stenosis. " },
                    { label: "Moderate stenosis", title: "Moderate aortic stenosis. " },
                    { label: "Severe stenosis", title: "Severe aortic stenosis. " },
                    { label: "Very severe stenosis", title: "very severe aortic stenosis. " },
                    { label: "No obstruction", title: "No obstruction. " },
                    { label: "Possible obstruction", title: "Possible obstruction. " },
                    { label: "Probable obstruction", title: "Probable obstruction. " },
                    { label: "Evidence of obstruction", title: "Evidence of obstruction. " },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 50,
                summaryExclude: ["SummaryValves"],
            },
            AR: {
                title: "Regurgitation",
                options: [
                    { label: "No regurgitation", title: "No aortic regurgitation. ", default: true },
                    { label: "Trivial regurgitation", title: "Trivial aortic regurgitation. " },
                    { label: "Mild regurgitation", title: "Mild aortic regurgitation. " },
                    { label: "Moderate regurgitation", title: "Moderate aortic regurgitation. " },
                    { label: "Severe regurgitation", title: "Severe aortic regurgitation. " },
                    { label: "Mild transvalvular regurgitation", title: "Mild transvalvular aortic regurgitation. " },
                    { label: "Moderate transvalvular regurgitation", title: "Moderate transvalvular aortic regurgitation. " },
                    { label: "Severe transvalvular regurgitation", title: "Severe transvalvular aortic regurgitation. " },
                    { label: "Mild paravalvular regurgitation", title: "Mild paravalvular aortic regurgitation. " },
                    { label: "Moderate paravalvular regurgitation", title: "Moderate paravalvular aortic regurgitation." },
                    { label: "Severe paravalvular regurgitation", title: "Severe paravalvular aortic regurgitation." },
                    { label: "Mild residual regurgitation", title: "Mild residual aortic regurgitation." },
                    { label: "Moderate residual regurgitation", title: "Moderate residual aortic regurgitation." },
                    { label: "Severe residual regurgitation", title: "Severe residual aortic regurgitation." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryNotThreshold: ["No regurgitation", "Trivial regurgitation"],
                summaryOrder: 50,
                summaryExclude: ["SummaryValves"],
            },
            AVMeasurements: {
                title: "Measurement Template",
                options: [
                    { label: "Default", title: `AV Vmax = {{AVVmax}}`, default: true },
                    { label: "BSE set", title: `LVOT Vmax = {{LVOTVmax}}, LVOT MaxPG = {{LVOTMaxPG}}, LVOT MeanPG = {{LVOTMeanPG}}, LVOT VTI = {{LVOTVTI}}
AV Vmax = {{AVVmax}}, AV MaxPG = {{AVMaxPG}}, AV MeanPG = {{AVMeanPG}}, AV VTI = {{AVVTI}}`},
                    { label: "AS assessment", title: `LVOT Diameter = {{LVOTd}}, LV SV = {{LVSV}} (Indexed = {{LVSVI}})
LVOT Vmax = {{LVOTVmax}}, LVOT MeanPG = {{LVOTMeanPG}}, LVOT VTI = {{LVOTVTI}}
AV Vmax = {{AVVmax}}, AV MaxPG = {{AVMaxPG}}, AV MeanPG = {{AVMeanPG}}, AV VTI = {{AVVTI}}, DVI = {{DVI}}
AVA = {{AVA}} (Indexed = {{AVAI}})`},
                    { label: "AVR assessment", title: `LVOT Vmax = {{LVOTVmax}}, LVOT MeanPG = {{LVOTMeanPG}}, LVOT VTI = {{LVOTVTI}}
AV Vmax = {{AVVmax}}, AV MaxPG = {{AVMaxPG}}, AV MeanPG = {{AVMeanPG}}, AV VTI = {{AVVTI}}
DVI = {{DVI}}
AccT = {{AVAccT}}, EjT = {{AVEjT}}, Acc/EjT = {{AVAccEjT}}`},
                ],
                customText: false,
            },
        },
    },
    {
        title: "Aorta",
        enableSectionPreview: true,
        sectionPreviewKey: "sectAo",
        params: {
            Aorta: {
                title: "Dilataion",
                options: [
                    { label: "Not dilated", title: "Not dilated.", default: true },
                    { label: "Dilated root and ascending", title: "Dilated aortic root and proximal ascending aorta."},
                    { label: "Dilated root only", title: "Dilated aortic root.\nNon-dilated proximal ascending aorta.", summarytext: "Dilated aortic root." },
                    { label: "Dilated ascending aorta only", title: "Dilated proximal ascending aorta.\nNon-dilated root.", summarytext: "Dilated proximal ascending aorta." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 30,
            },
            AoMeasurements: {
                title: "Gender",
                options: [
                    { label: "(both)", title: `Sinus of Valsalva = {{SoV}}, Indexed to height = {{SoVI}} (Normal range, male: 14.8-23.2mm/m) (Normal range, female: 14.1-22.1mm/m)
Sinotubular Junction = {{StJ}}, Indexed to height = {{StJI}} (Normal range, male: 12.6-19.8mm/m) (Normal range, female: 12.2-19.4mm/m)
Ascending aorta = {{Ao}}, Indexed to height = {{AoI}} (Normal range, male: 12.6-21.4mm/m) (Normal range, female: 12.3-21.1mm/m)`, default: true },
                    { label: "Male", title: `Sinus of Valsalva = {{SoV}}, Indexed to height = {{SoVI}} (Normal range, male: 14.8-23.2mm/m)
Sinotubular Junction = {{StJ}}, Indexed to height = {{StJI}} (Normal range, male: 12.6-19.8mm/m)
Ascending aorta = {{Ao}}, Indexed to height = {{AoI}} (Normal range, male: 12.6-21.4mm/m)`},
                    { label: "Female", title: `Sinus of Valsalva = {{SoV}}, Indexed to height = {{SoVI}} (Normal range, female: 14.1-22.1mm/m)
Sinotubular Junction = {{StJ}}, Indexed to height = {{StJI}} (Normal range, female: 12.2-19.4mm/m)
Ascending aorta = {{Ao}}, Indexed to height = {{AoI}} (Normal range, female: 12.3-21.1mm/m)`},
                ],
                customText: false,
            },
            Coarc: {
                title: "Coarctation",
                options: [
                    { label: "No coarctation", title: "No coarctation.", default: true },
                    { label: "Unable to assess - poor views", title: "Unable to assess for coarctation due to poor arch views."},
                    { label: "Coarctation demonstrated", title: "Evidence of aortic coarctation.", summarytext: "Evidence of aortic coarctation (see notes above)."},
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
        sectionPreviewKey: "sectRV",
        params: {
            RVF: {
                title: "Function",
                options: [
                    { label: "Normal function", title: "Normal radial and longitudinal function.", summarytext: "Normal right ventricular function,", default: true },
                    { label: "Impaired radial function only", title: "Impaired radial function, normal longitudinal function.", summarytext: "Impaired right ventricular function," },
                    { label: "Impaired longitudinal function only", title: "Impaired longitudinal function, normal radial function.", summarytext: "Impaired right ventricular function," },
                    { label: "Impaired radial and longitudinal function", title: "Impaired radial and longitudinal function.", summarytext: "Impaired right ventricular function," },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 10,
            },      
            RVD: {
                title: "Dilatation",
                options: [
                    { label: "Not dilated", title: "No right ventricular dilatation.", summarytext: "normal size", default: true },
                    { label: "Dilated", title: "Dilated right ventricle.", summarytext: "dilated" },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 10,
            },
            RVH: {
                title: "Hypertrophy",
                options: [
                    { label: "No hypertrophy", title: "No right ventricular hypertrophy.", summarytext: "^.", default: true },
                    { label: "Hypertrophied", title: "Hypertrophied right ventricle.", summarytext: ", hypertrophied." },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 10,
            },
            RVMeasurements: {
                title: "Measurement Template",
                options: [
                    { label: "Default", title: `RVD1 = {{RVD1}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}`, default: true },
                    { label: "Default + FAC", title: `RVD1 = {{RVD1}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}, FAC = {{FAC}}`},
                    { label: "Full", title: `RVD1 = {{RVD1}}, RVD2 = {{RVD2}}, RVD3 = {{RVD3}}
RVEDA = {{RVEDA}} (Indexed = {{RVEDAI}}), RVESA = {{RVESA}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}, FAC = {{FAC}}`},
                ],
                customText: false,
            },
        },
    },
    {
        title: "Right Atrium",
        enableSectionPreview: true,
        sectionPreviewKey: "sectRA",
        params: {
            RAtrium: {
                title: "Size",
                options: [
                    { label: "Not dilated", title: "Not dilated.", default: true },
                    { label: "Dilated", title: "Dilated.", summarytext: "Dilated right atrium."  },
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
        sectionPreviewKey: "sectTV",
        params: {
            TV: {
                title: "Leaflets",
                options: [
                    { label: "Normal leaflets", title: "Thin and mobile leaflets, opens well.", default: true },
                ],
            },
            TS: {
                title: "Stenosis",
                options: [
                    { label: "No stenosis", title: "No tricuspid stenosis.", default: true },
                    { label: "Mild stenosis", title: "Mild tricuspid stenosis." },
                    { label: "Moderate stenosis", title: "Moderate tricuspid stenosis." },
                    { label: "Severe stenosis", title: "Severe tricuspid stenosis." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 60,
                summaryExclude: ["SummaryValves"],
            },
            TR: {
                title: "Regurgitation",
                options: [
                    { label: "Trivial regurgitation", title: "Trivial tricuspid regurgitation.", default: true },
                    { label: "Mild regurgitation", title: "Mild tricuspid regurgitation." },
                    { label: "Moderate regurgitation", title: "Moderate tricuspid regurgitation." },
                    { label: "Severe regurgitation", title: "Severe tricuspid regurgitation." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["Moderate regurgitation", "Severe regurgitation"],
                summaryOrder: 60,
                summaryExclude: ["SummaryValves"],
            },
            TVMeasurements: {
                title: "Additional Measurements",
                options: [
                    { label: "(none)", title: "", default: true },
                    { label: "TV Inflow", title: `TV Inflow: Vmax = {{TVVmax}}, MeanPG = {{TVMeanPG}}, VTI = {{TVVTI}}`},
                    { label: "TR Jet (Single)", title: `TR Jet: VC width = {{TRVCD}}, PISAr (Als Vel. of {{TRALSVEL}}) = {{TRPISA}}, VTI = {{TRVTI}}, RV = {{TRRV}}, ERO = {{TRERO}}`},
                    { label: "Full", title: `TV Inflow: Vmax = {{TVVmax}}, MeanPG = {{TVMeanPG}}, VTI = {{TVVTI}}
TR Jet: VC width = {{TRVCD}}, PISAr (Als Vel. of {{TRALSVEL}}) = {{TRPISA}}, VTI = {{TRVTI}}, RV = {{TRRV}}, ERO = {{TRERO}}`},
                ],
                customText: false,
            },
            RVtoRA: {
                title: "TR Vmax",
                options: [
                    { label: "Default", title: `TR Vmax = {{TRVmax}}, TR MaxPG = {{TRMaxPG}}`, default: true },
                    { label: "Insufficient", title: "TR Vmax = insufficient for measurement"},
                ],
            },
        },
    },
    {
        title: "Pulmonary Valve",
        enableSectionPreview: true,
        sectionPreviewKey: "sectPV",
        params: {
            PV: {
                title: "Leaflets",
                options: [
                    { label: "Normal leaflets", title: "Thin and mobile cusps where seen.", default: true },
                ],
            },
            PS: {
                title: "Stenosis",
                options: [
                    { label: "No stenosis", title: "No pulmonary stenosis.", default: true },
                    { label: "Mild stenosis", title: "Mild pulmonary stenosis." },
                    { label: "Moderate stenosis", title: "Moderate pulmonary stenosis." },
                    { label: "Severe stenosis", title: "Severe pulmonary stenosis." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryOrder: 70,
                summaryExclude: ["SummaryValves"],
            },
            PR: {
                title: "Regurgitation",
                options: [
                    { label: "Trivial regurgitation", title: "Trivial pulmonary regurgitation.", default: true },
                    { label: "Mild regurgitation", title: "Mild pulmonary regurgitation." },
                    { label: "Moderate regurgitation", title: "Moderate pulmonary regurgitation." },
                    { label: "Severe regurgitation", title: "Severe pulmonary regurgitation." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["Moderate regurgitation", "Severe regurgitation"],
                summaryOrder: 70,
                summaryExclude: ["SummaryValves"],
            },
            PVN: {
                title: "Systolic Notch",
                options: [
                    { label: "No systolic notch", title: "No mid-systolic notch.", default: true },
                    { label: "Systolic notch demonstrated", title: "Systolic notch demonstrated." },
                ],
            },
            PVMeasurements: {
                title: "Measurement Template",
                options: [
                    { label: "Default", title: `PV Vmax = {{PVVmax}}`, default: true },
                    { label: "Full RVOT and PV assessment", title: `RVOT Vmax = {{RVOTVmax}}, RVOT MaxPG = {{RVOTMaxPG}}, RVOT MeanPG = {{RVOTMeanPG}}, RVOT VTI = {{RVOTVTI}}
PV Vmax = {{PVVmax}}, PV MaxPG = {{PVMaxPG}}, PV MeanPG = {{PVMeanPG}}, PV VTI = {{PVVTI}}`},
                ],
                customText: false,
            },
        },
    },
        
    {
        title: "Miscellaneous",
        enableSectionPreview: true,
        sectionPreviewKey: "sectMisc",
        params: {
            IVCD: {
                title: "IVC Size",
                options: [
                    { label: "Not dilated, >50% collapse", title: "not dilated with >50% collapse, estimating RA pressure at 0-5mmHg", default: true },
                    { label: "Not dilated, <50% collapse", title: "not dilated with <50% collapse, estimating RA pressure at 5-15mmHg" },
                    { label: "Dilated, >50% collapse", title: "dilated with >50% collapse, estimating RA pressure at 5-15mmHg" },
                    { label: "Dilated, <50% collapse", title: "dilated with <50% collapse, estimating RA pressure at >15mmHg" },
                    { label: "(Not adequately visualised)", title: "not adequately visualised, unable to estimate RA pressure" },
                ],
            },
            PASP: {
                title: "ePASP",
                options: [
                    { label: "not estimated in the absence of TR Vmax", title: "not estimated in the absence of TR Vmax", default: true },
                ]
            },
            PPHT: {
                title: "Probability of PHT",
                options: [
                    { label: "Low", title: "Low echocardiographic probability of pulmonary hypertension.", default: true },
                    { label: "Intermediate", title: "Intermediate echocardiographic probability of pulmonary hypertension." },
                    { label: "High", title: "High echocardiographic probability of pulmonary hypertension." },
                    { label: "(Unable to assess)", title: "Unable to reliably assess probability of pulmonary hypertension." },
                ],
                enableSummary: true,
                summaryDefault: false,
                summaryOnChange: true,
                summaryThreshold: ["High"],
                summaryOrder: 80,
            },
            ASD: {
                title: "ASD/PFO",
                options: [
                    { label: "No obvious ASD", title: "No obvious atrial septal defect imaged on CFM.", default: true },
                    { label: "Thin and mobile but no ASD", title: "The atrial septum is thin and mobile, but with no obvious defect imaged on CFM."},
                    { label: "Unable to assess - poor subcostal views", title: "Unable to confidently assess atrial septal integrity due to poor subcostal views." },
                    { label: "Small ASD/PFO, left-to-right shunt", title: "Small ASD/PFO demonstrated with resting left-to-right shunt demonstrated on CFM." },
                    { label: "Medium ASD/PFO, left-to-right shunt", title: "Medium ASD/PFO demonstrated with resting left-to-right shunt demonstrated on CFM." },
                    { label: "Large ASD/PFO, left-to-right shunt", title: "Large ASD/PFO demonstrated with resting left-to-right shunt demonstrated on CFM." },
                ],
                textareaSize: 2,
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
                    { label: "Trivial global effusion, no haemodynamic compromise", title: "Trivial global pericardial effusion - no evidence of haemodynamic compromise."},
                    { label: "Small global effusion, no haemodynamic compromise", title: "Small global pericardial effusion - no evidence of haemodynamic compromise."},
                    { label: "Full Assessment (enable new section)", title: "", triggerSection: "sectPeffFull" },
                ],
                textareaSize: 15,
                enableSummary: true,
                summaryOnChange: true,
                summaryNotThreshold: ["Trivial global effusion, no haemodynamic compromise", "Full Assessment (enable new section)"],
                summaryDefault: false,
                summaryOrder: 83,
            },
        },
    },
    {
        title: "Pericardial Effusion",
        enableSectionPreview: true,
        defaultHidden: true,
        sectionPreviewKey: "sectPeffFull",
        params: {
            paramsEffSize: {
                title: "Size",
                options: [
                    { label: "Trivial global", title: "Trivial global pericardial effusion.", summarytext: "Trivial global pericardial effusion"},
                    { label: "Small global", title: "Small global pericardial effusion.", summarytext: "Small global pericardial effusion", default: true,},
                    { label: "Moderate global", title: "Moderate global pericardial effusion.", summarytext: "Moderate global pericardial effusion"},
                    { label: "Large global", title: "Large global pericardial effusion.", summarytext: "Large global pericardial effusion"},
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 90,
            },
            paramsEffOther: {
                title: "Other Comments",
                options: [
                    { label: "(none)", title: "", default: true },
                ],
            },
            paramsEffCompromise: {
                title: "Haemodynamic Compromise",
                options: [
                    { label: "No haemodynamic compromise", title: "No haemodynamic compromise.", summarytext: "without haemodynamic compromise.", default: true,},
                    { label: "Mixed parameters", title: "Mixed parameters for haemodynamic compromise.", summarytext: "with mixed parameters for haemodynamic compromise."},
                    { label: "Evidence of haemodynamic compromise", title: "Evidence of haemodynamic compromise.", summarytext: "with evidence of haemodynamic compromise."},
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 90,
            },
            paramsSeptMotion: {
                title: "Septal Motion",
                options: [
                    { label: "Normal", title: "Normal septal motion.", default: true },
                    { label: "Septal bounce", title: "Septal bounce."},
                ],
            },
            paramsRVCollapse: {
                title: "RV Collapse",
                options: [
                    { label: "No RV collapse", title: "No mid-diastolic RV collapse.", default: true },
                    { label: "RV collapse", title: "Mid-diastolic RV collapse demonstrated."},
                ],
            },
            paramsRACollapse: {
                title: "RA Collapse",
                options: [
                    { label: "No RA collapse", title: "No mid-systolic RA collapse.", default: true },
                    { label: "RA collapse", title: "Mid-systolic RA collapse demonstrated."},
                    { label: "Not seen", title: "RA was not adequately seen for assessment."},
                ],
            },
            paramsIVC: {
                title: "IVC",
                options: [
                    { label: "Normal size, collapse >50%", title: "Normal IVC size, collapses >50%.", default: true },
                    { label: "Normal size, collapse <50%", title: "Normal size IVC, collapses <50%"},
                    { label: "Dilated, collapse >50%", title: "Dilated IVC, collapses <50%"},
                    { label: "Dilated, collapse <50%", title: "Dilated IVC, collapses <50%"},
                    { label: "Not seen", title: "IVC was not adequately seen for assessment."},
                    { label: "Ventilated", title: "Ventilated patient, unable to assess RA pressures from IVC appearance."},
                ],
            },
            paramsEffVariation: {
                title: "Respiratory Variation",
                options: [
                    { label: "No significant respiratory variation.", title: "No significant respiratory variation.", default: true },
                    { label: "Significant respiratory variation.", title: "Significant respiratory variation."},
                    { label: "AF, unable to assess.", title: "Unable to assess respiratory variation due to atrial fibrillation with significant beat-to-beat variability."},
                ],
            },
        },
    },
    {
        title: "Summary",
        params: {
            SummaryTitle: {
                title: "",
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
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 3,
                customText: false,
            },
            SummaryValves: {
                title: "Valves",
                options: [
                    { label: "Normal valves", title: "No significant valvular abnormalities.", default: true },
                ],
                enableSummary: true,
                summaryDefault: true,
                summaryOrder: 29,
                customText: false,
            },
        },
    },
];