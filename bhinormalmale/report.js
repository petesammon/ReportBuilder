
// Contains the config for parsing the report into variables
const parseConfig = [
    {
        title: "Demographics",
        params: {
            Height: {
                match: "Height: (.*) cm",
                label: "Height",
                unit: "cm",
            },
            Weight: {
                match: "Weight: (.*) kg",
                label: "Weight",
                unit: "kg",
            },
            BSA: {
                match: "BSA: (.*) m²",
                label: "BSA",
                unit: "m2",
            },
            BP: {
                match: "BP: (.*)",
                label: "BP",
                unit: "mmHg",
            },
        },
    },
    {
        title: "LV Dimensions",
        params: {
            IVSd: {
                match: "IVSd (.*) cm",
                label: "IVSd",
                unit: "cm",
            },
            LVPWd: {
                match: "LVPWd (.*) cm",
                label: "LVPWd",
                unit: "cm",
            },
            LVIDd: {
                match: "LVIDd (.*) cm",
                label: "LVIDd",
                unit: "cm",
            },
            LVIDs: {
                match: "LVIDs (.*) cm",
                label: "LVIDs",
                unit: "cm",
            },
            LVEDV: {
                match: "LVEDV MOD BP (.*) ml",
                label: "LVEDV",
                unit: "ml",
            },
            LVEDVInd: {
                match: "LVEDVInd MOD BP (.*) ml/m²",
                label: "LVEDV Indexed",
                unit: "ml/m2",
            },
	   },
    },
    {
        title: "LV Diastolic Function",
        params: {
            EARatio: {
                match: "MV E/A Ratio (.*)",
                label: "E/A Ratio",
                unit: "",
            },
            EDecT: {
                match: "MV DecT (.*) ms",
                label: "E DecT",
                unit: "ms",
            },
            EVel: {
                match: "MV E Vel (.*) cm/s",
                label: "E Velocity",
                unit: "cm/s",
            },
            AVel: {
                match: "MV A Vel (.*) cm/s",
                label: "A Velocity",
                unit: "cm/s",
            },
            EPrimeSept: {
                match: "E' Sept (.*) cm/s",
                label: "E' Septal",
                unit: "cm/s",
            },
            EPrimeLat: {
                match: "E' Lat (.*) cm/s",
                label: "E' Lateral",
                unit: "cm/s",
            },
            EEPrimeSept: {
                match: "E/E' Sept (.*)",
                label: "E/E' Septal",
                unit: "",
            },
            EEPrimeLat: {
                match: "E/E' Lat (.*)",
                label: "E/E' Lateral",
                unit: "",
            },
            EEPrimeAv: {
                match: "E/E' Avg (.*)",
                label: "E/E' Average",
                unit: "",
            },
	   },
    },
    {
        title: "LV Systolic Function",
        params: {
            SPrimeSept: {
                match: "S' \\(septal\\) (.*) cm/s",
                label: "S' Septal",
                unit: "cm/s",
            },
            SPrimeLat: {
                match: "S' \\(lateral\\) (.*) cm/s",
                label: "S' Lateral",
                unit: "cm/s",
            },
            SPrimeAv: {
                match: "Mean Mitral Annular S' (.*) cm/s",
                label: "S' Mean",
                unit: "cm/s",
            },
            EFBP: {
                match: "EF Biplane (.*) %",
                label: "Simpson's Biplane EF",
                unit: "%",
            },
            EFAuto: {
                match: "LVEF BiP Q (.*) %",
                label: "Auto EF",
                unit: "%",
            },
            GLS: {
                match: "G peak SL Full\\(Avg\\) (.*) %",
                label: "GLS",
                unit: "%",
            },
            // EF3D, 
        },
    },
    {
        title: "Mitral Valve",
        params: {
            MVVmax: {
                match: "MV Vmax (.*) m/s",
                label: "MV Vmax",
                unit: "m/s",
            },
//           MVMaxPG: {
//                match: "MV maxPG (.*) mmHg",
//                label: "MV Max PG",
//                unit: "mmHg",
//            },
            MVMeanPG: {
                match: "MV meanPG (.*) mmHg",
                label: "MV Mean PG",
                unit: "mmHg",
            },
            MVVTI: {
                match: "MV VTI (.*)",
                label: "MV VTI",
                unit: "",
            },
        },
    },
    {
        title: "Mitral Regurgitation",
        params: {
            MRVCD: {
                match: "MR VCD (.*) cm",
                label: "MR VC Width",
                unit: "cm",
            },
            MRPISA: {
                match: "MR Rad (.*) cm",
                label: "MR PISAr",
                unit: "cm",
            },
            MRALSVEL: {
                match: "MR Als.Vel (.*) cm/s",
                label: "MR Als.Vel.",
                unit: "cm/s",
            },
            MRVTI: {
                match: "MR VTI (.*) cm",
                label: "MR VTI",
                unit: "cm",
            },
            MRRV: {
                match: "MR RV (.*) Ml",
                label: "MR RV",
                unit: "ml",
            },
            MRERO: {
                match: "MR ERO (.*) cm²",
                label: "MR ERO",
                unit: "cm2",
            },
        },
    },
    {
        title: "Left Atrium",
        params: {
            LAESV: {
                match: "LAESV\\(MOD BP\\) (.*) ml",
                label: "LA Volume",
                unit: "ml",
            },
            LAESVInd: {
                match: "LAESVInd MOD BP (.*) ml/m²",
                label: "LA Volume Indexed",
                unit: "ml/m2",
            },
        },
    },
    {
        title: "LVOT",
        params: {
            LVOTVmax: {
                match: "LVOT Vmax (.*) m/s",
                label: "LVOT Vmax",
                unit: "m/s",
            },
            LVOTMaxPG: {
                match: "LVOT maxPG (.*) mmHg",
                label: "LVOT Max PG",
                unit: "mmHg",
            },
            LVOTMeanPG: {
                match: "LVOT meanPG (.*) mmHg",
                label: "LVOT Mean PG",
                unit: "mmHg",
            },
            LVOTVTI: {
                match: "LVOT VTI (.*)",
                label: "LVOT VTI",
                unit: "",
            },
            LVOTd: {
                match: "LVOT Diam (.*) cm",
                label: "LVOT Diameter",
                unit: "cm",
            },
            LVSV: {
                match: "LVSV Dopp (.*) ml",
                label: "LV SV",
                unit: "ml",
            },
            LVSVI: {
                match: "LVSI Dopp (.*) ml/m²",
                label: "LV SV Indexed",
                unit: "ml/m2",
            },
        },
    },
    {
        title: "Aortic Valve",
        params: {
            AVVmax: {
                match: "AV Vmax (.*) m/s",
                label: "AV Vmax",
                unit: "m/s",
            },
            AVMaxPG: {
                match: "AV maxPG (.*) mmHg",
                label: "AV Max PG",
                unit: "mmHg",
            },
            AVMeanPG: {
                match: "AV meanPG (.*) mmHg",
                label: "AV Mean PG",
                unit: "mmHg",
            },
            AVVTI: {
                match: "AV VTI (.*)",
                label: "AV VTI",
                unit: "",
            },
            DVI: {
                match: "DVI (.*)",
                label: "DVI",
                unit: "",
            },
            AVA: {
                match: "AVA \\(VTI\\) (.*) cm²",
                label: "AVA by VTI",
                unit: "cm2",
            },
            AVAI: {
                match: "AVAI \\(VTI\\) (.*) cm²/m²",
                label: "AVAI by VTI",
                unit: "cm2/m2",
            },
        },
    },
    {
        title: "Aortic Regurgitation",
        params: {
            ARPHT: {
                match: "AR PHT (.*) ms",
                label: "AR PHT",
                unit: "ms",
            },
//ARLVOT
//DescAoRevVTI
//DesAoRevEndVmax
        },
    },
    {
        title: "Aorta Dimensions",
        params: {
            SoV: {
                match: "Sinuses Of Valsalva (.*) mm",
                label: "SoV",
                unit: "mm",
            },
            SoVI: {
                match: "SoV \\(indexed to height\\) (.*) mm/m",
                label: "SoV Indexed",
                unit: "mm/m",
            },
            StJ: {
                match: "Ao st junct (.*) mm",
                label: "StJ",
                unit: "mm",
            },
            StJI: {
                match: "STJ \\(indexed to height\\) (.*) mm/m",
                label: "StJ Indexed",
                unit: "mm/m",
            },
            Ao: {
                match: "Ao asc (.*) mm",
                label: "Ao",
                unit: "mm",
            },
            AoI: {
                match: "Asc Ao \\(indexed to height\\) (.*) mm/m",
                label: "Ao Indexed",
                unit: "mm/m",
            },
        },
    },
    {
        title: "RV Dimensions",
        params: {
            RVD1: {
                match: "RVD1 \\(base\\) (.*) cm",
                label: "RVD1",
                unit: "cm",
            },
            RVD2: {
                match: "RVD2 \\(mid\\) (.*) cm",
                label: "RVD2",
                unit: "cm",
            },
            RVD3: {
                match: "RVD3 \\(base-->apex\\) (.*) cm",
                label: "RVD3",
                unit: "cm",
            },
            RVEDA: {
                match: "RVA \\(d\\) (.*) cm²",
                label: "RVEDA",
                unit: "cm2",
            },
            RVEDAI: {
                match: "Indexed RVEDA (.*) cm²/m²",
                label: "RVEDA Indexed",
                unit: "cm2/m2",
            },
            RVESA: {
                match: "RVA \\(s\\) (.*) cm²",
                label: "RVESA",
                unit: "cm2",
            },
        },
    },
    {
        title: "RV Function",
        params: {
            TAPSE: {
                match: "TAPSE (.*) cm",
                label: "TAPSE",
                unit: "cm",
            },
            RVS: {
                match: "TV S' (.*) cm/s",
                label: "RV S prime",
                unit: "cm/s",
            },
            FAC: {
                match: "RV FAC (.*) %",
                label: "FAC",
                unit: "%",
            },
        },
    },
    {
        title: "Right Atrium",
        params: {
            RAA: {
                match: "RA Area (.*) cm²",
                label: "RA Area",
                unit: "cm2",
            },
            RAAI: {
                match: "Indexed RA Area (.*) cm²/m²",
                label: "RA Area Indexed",
                unit: "cm2/m2",
            },
        },
    },
    {
        title: "Tricuspid Valve",
        params: {
            TVVmax: {
                match: "TV Vmax (.*) m/s",
                label: "TV Vmax",
                unit: "m/s",
            },
            TVMeanPG: {
                match: "TV meanPG (.*) mmHg",
                label: "TR MeanPG",
                unit: "mmHg",
            },
            TVVTI: {
                match: "TV VTI (.*) cm",
                label: "TR VTI",
                unit: "cm",
            },
//TVPHT, TVAbyPHT
        },
    },
    {
        title: "Tricuspid Regurgitation",
        params: {
            TRVmax: {
                match: "TR Vmax (.*) m/s",
                label: "TR VMax",
                unit: "m/2",
            },
            TRMaxPG: {
                match: "TR maxPG (.*) mmHg",
                label: "TR MaxPG",
                unit: "mmHg",
            },
//TRVCD
            TRPISA: {
                match: "TR Rad (.*) cm",
                label: "TR PISAr",
                unit: "cm",
            },
            TRALSVEL: {
                match: "TR Als.Vel (.*) cm/s",
                label: "TR Als.Vel",
                unit: "cm/s",
            },
            TRVTI: {
                match: "TR VTI (.*) cm",
                label: "TR VTI",
                unit: "cm",
            },
//TRRV
            TRERO: {
                match: "TR ERO (.*) cm²",
                label: "TR ERO",
                unit: "cm2",
            },
        },
    },
    {
        title: "RVOT",
        params: {
//RVOTVmax, RVOTMeanPG, RVOTVTI
        },
    },
    {
        title: "Pulmonary",
        params: {
            PVVMax: {
                match: "PV Vmax (.*) m/s",
                label: "PV Vmax",
                unit: "m2",
            },
//PVMeanPG
//PVVTI
            PAT: {
                match: "PV AccT (.*) ms",
                label: "PV AccT",
                unit: "ms",
            },
            MPA: {
                match: "MPA (.*) cm",
                label: "MPA Diameter",
                unit: "cm",
            },
            RPA: {
                match: "RPA (.*) cm",
                label: "RPA Diameter",
                unit: "cm",
            },
            LPA: {
                match: "LPA (.*) cm",
                label: "LPA Diameter",
                unit: "cm",
            },
        },
    },
    {
        title: "Pulmonary Regurgitation",
        params: {
            PRVMax: {
                match: "PR Vmax (.*) m/s",
                label: "PR Vmax",
                unit: "m2",
            },
            PRMaxPG: {
                match: "PR maxPG (.*) mmHg",
                label: "PR MaxPG",
                unit: "mmHg",
            },
        },
    },
    {
        title: "Miscellaneous",
        params: {
            IVC: {
                match: "IVC (.*) mm",
                label: "IVC Diameter",
                unit: "mm",
            },
        },
    },
    {
        title: "Additional",
        params: {
            LVESV: {
                match: "LVESV MOD BP (.*) ml",
                label: "LVESV",
                unit: "ml",
            },
            LVESVInd: {
                match: "LVESVInd MOD BP (.*) ml/m²",
                label: "LVESV Indexed",
                unit: "ml/m2",
            },
            LVMASS: {
                match: "LVd Mass \\(ASE\\) (.*) g",
                label: "LV Mass",
                unit: "g",
            },
            LVMASSInd: {
                match: "LVd Mass Ind \\(ASE\\) (.*) g/m²",
                label: "LV Mass Indexed",
                unit: "g/m2",
            },
            MVPHT: {
                match: "MV PHT (.*) ms",
                label: "MV PHT",
                unit: "ms",
            },
            MVAbyPHT: {
                match: "MVA By PHT (.*) cm²",
                label: "MVA by PHT",
                unit: "cm2",
            },
            MVAbyVTI: {
                match: "MVA \\(VTI\\) (.*) cm²",
                label: "MVA by VTI",
                unit: "cm2",
            },
            LVCO: {
                match: "LVCO Dopp (.*) l/min",
                label: "LV Cardiac Output",
                unit: "l/min",
            },
            LVCI: {
                match: "LVCI Dopp (.*) l/minm²",
                label: "LV Cardiac Index",
                unit: "l/min/m2",
            },
            DOB: {
                match: "DOB: (.*)",
                label: "Date of Birth",
            },
            Gender: {
                match: "Gender: (.*)",
                label: "Gender",
                unit: "",
            },
        },
    },
]

const parseUKDate = (dateString) => {
    const splitDate = dateString.split('/');
    return new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
}

const calculations = {
    Age: (metrics) => {
        if (!metrics.DOB) return "N/A";

        const ageDifMs = Date.now() - parseUKDate(metrics.DOB).getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    },
    HeightRounded: (metrics) => {
        return metrics.Height ? Math.round(metrics.Height)/100 : "N/A";
    },
    WeightRounded: (metrics) => {
        return metrics.Weight ? Math.round(metrics.Weight) : "N/A";
    }
}

// Contains the options for the dropdowns
const options = [
    {
        title: "Study details",
        params: {
            Machine: {
                title: "Performed on:",
                options: [
                    {
                        label: "GE 95",
                        title: "GE E95",
                        default: true,
                    },
                    {
                        label: "GE E9",
                        title: "GE E9",
                    },
                    {
                        label: "GE S70",
                        title: "GE S70"
                    },
                    {
                        label: "GE Vivid IQ",
                        title: "GE Vivid IQ"
                    }
                ],
            },
            Operator: {
                title: "Operator:",
		custom: true, 
            },
            TechnicalQualilty: {
                title: "Technical quality:",
                custom: true,
                options: [
                    {
                        label: "Good",
                        title: "Good",
                    },
                    {
                        label: "Fair",
                        title: "Fair",
                        default: true,
                    },
                    {
                        label: "Poor",
                        title: "Poor -"
                    },
                    {
                        label: "Very poor",
                        title: "Very poor -"
                    },
                ],
            },
            ECG: {
                title: "Rhythm & Rate",
                custom: true, 
                options: [
                    {
                        label: "Sinus rhythm",
                        title: "Sinus rhythm",
                        default: true,
                    },
                    {
                        label: "AF",
                        title: "Atrial fibrillation"
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
        },
    },
    {
        title: "Left Ventricle",
        params: {
            RWMAs: {
                title: "RWMAs / Comments",
                custom: true, 
            },
            LVSF: {
                title: "",
		custom: true,
                options: [
                    {
                        "label": "Normal systolic function",
                        "title": "Normal left ventricular systolic function",
                        default: true,
                    },
                    {
                        "label": "Borderline low",
                        "title": "Borderline low left ventricular systolic function"
                    },
                    {
                        "label": "Mildly impaired",
                        "title": "Mildly impaired left ventricular systolic function"
                    },
                    {
                        "label": "Moderately impaired",
                        "title": "Moderately impaired left ventricular systolic function"
                    },
                    {
                        "label": "Severely impaired",
                        "title": "Severely impaired left ventricular systolic function"
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            LVH: {
                title: "",
                custom: true,
                options: [
                    {
                        "label": "No hypertrophy",
                        "title": "No left ventricular hypertrophy",
                        default: true,
                    },
                    {
                        "label": "Mild concentric hypertrophy",
                        "title": "Mild concentric left ventricular hypertrophy",
                    },
                    {
                        "label": "Moderate concentric hypertrophy",
                        "title": "Moderate concentric left ventricular hypertrophy",
                    },
                    {
                        "label": "Severe concentric hypertrophy",
                        "title": "Severe concentric left ventricular hypertrophy",
                    },
                    {
                        "label": "(free text)",
                        "title": "",
                    },
                ],
            },
            LVD: {
                title: "",
		custom: true,
                options: [
                    {
                        "label": "No dilatation",
                        "title": "No left ventricular dilatation",
                        default: true,
                    },
                    {
                        "label": "Mild dilatation",
                        "title": "Mild left ventricular dilatation",
                    },
                    {
                        "label": "Moderate dilatation",
                        "title": "Moderate left ventricular dilatation",
                    },
                    {
                        "label": "Severe dilatation",
                        "title": "Severe left ventricular dilatation",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            Diastology: {
                title: "",
                custom: true,
                options: [
                    {
                        "label": "Normal diastolic function",
                        "title": "Normal diastolic function",
                        default: true,
                    },
                    {
                        "label": "Indeterminate diastolic function",
                        "title": "Indeterminate diastolic function"
                    },
                    {
                        "label": "Signs of diastolic dysfunction",
                        "title": "Signs of diastolic dysfunction"
                    },
                    {
                        "label": "Evidence of diastolic dysfunction",
                        "title": "Evidence of diastolic dysfunction"
                    },
                    {
                        "label": "Grade I diastolic dysfunction",
                        "title": "Grade I diastolic dysfunction"
                    },
                    {
                        "label": "Grade II diastolic dysfunction",
                        "title": "Grade II diastolic dysfunction"
                    },
                    {
                        "label": "Grade III diastolic dysfunction",
                        "title": "Grade III diastolic dysfunction"
                    },
                    {
                        "label": "Unable to grade or comment on LAP in the context of...",
                        "title": "Unable to grade or comment on filling pressures in the context of"
                    },
                    {
                        "label": "(free text)",
                        "title": ""
                    },
                ],
            },
            LAP: {
                title: "",
		custom: true,
                options: [
                    {
                        "label": "(filling pressure)",
                        "title": ".",
                        default: true,
                    },
                    {
                        "label": "Normal filling pressure",
                        "title": ", normal filling pressure.",
                    },
                    {
                        "label": "Equivocal filling pressure",
                        "title": ", equivocal filling pressure.",
                    },
                    {
                        "label": "Elevated filling pressure",
                        "title": ", elevated filling pressure.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            LVMeas: {
                title: "Additional Measurements",
                custom: true,
            },
        },
    },
    {
        title: "Mitral Valve",
        params: {
            MV: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal leaflets",
                        title: "Thin and mobile leaflets, opens well.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            MS: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No stenosis",
                        title: "No mitral stenosis.",
                        default: true,
                    },
                    {
                        label: "Mild stenosis",
                        title: "Mild mitral stenosis."
                    },
                    {
                        label: "Moderate stenosis",
                        title: "Moderate mitral stenosis."
                    },
                    {
                        label: "Severe stenosis",
                        title: "Severe mitral stenosis."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            MR: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Trivial regurgitation",
                        title: "Trivial mitral regurgitation.",
                        default: true,
                    },
                    {
                        label: "Mild regurgitation",
                        title: "Mild mitral regurgitation."
                    },
                    {
                        label: "Moderate regurgitation",
                        title: "Moderate mitral regurgitation."
                    },
                    {
                        label: "Severe regurgitation",
                        title: "Severe mitral regurgitation."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            MVMeas: {
                title: "Additional Measurements",
                custom: true,
            },
        },
    },
    {
        title: "Left Atrium",
        params: {
            LA: {
                title: "",
                custom: true, 
                options: [
                    {
                        label: "Not dilated",
                        title: "Not dilated.",
                        default: true,
                    },
                    {
                        label: "Borderline dilated",
                        title: "Borderline dilated."
                    },
                    {
                        label: "Dilated",
                        title: "Dilated."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
        },
    },
    {
        title: "Aortic Valve",
        params: {
            AV: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Trileaflet, normal",
                        title: "Trileaflet, thin and mobile cusps, opens well.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            AS: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No stenosis",
                        title: "No aortic stenosis.",
                        default: true,
                    },
                    {
                        label: "Mild stenosis",
                        title: "Mild aortic stenosis."
                    },
                    {
                        label: "Moderate stenosis",
                        title: "Moderate aortic stenosis."
                    },
                    {
                        label: "Severe stenosis",
                        title: "Severe aortic stenosis."
                    },
                    {
                        label: "Very severe stenosis",
                        title: "very severe aortic stenosis."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            AR: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No regurgitation",
                        title: "No aortic regurgitation.",
                        default: true,
                    },
                    {
                        label: "Trivial regurgitation",
                        title: "Trivial aortic regurgitation.",
                    },
                    {
                        label: "Mild regurgitation",
                        title: "Mild aortic regurgitation."
                    },
                    {
                        label: "Moderate regurgitation",
                        title: "Moderate aortic regurgitation."
                    },
                    {
                        label: "Severe regurgitation",
                        title: "Severe aortic regurgitation."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            AVMeas: {
                title: "Additional Measurements",
                custom: true,
            },
        },
    },
    {
        title: "Aorta",
        params: {
            Aorta: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal dimensions",
                        title: "The aortic root, proximal ascending aorta and aortic arch are not dilated.",
                        default: true,
                    },
                    {
                        label: "Dilated aorta, root and arch",
                        title: "Dilated aortic root, proximal ascending aorta and aortic arch.",
                    },
                    {
                        label: "Dilated root only",
                        title: "Dilated aortic root.\nThe proximal ascending aorta and aortic arch are not dilated.",
                    },
                    {
                        label: "Dilated ascending aorta only",
                        title: "Dilated proximal ascending aorta.\nThe aortic root and aortic arch are not dilated.",
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
            DescAo: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal flow, no coarctation",
                        title: "Normal flow within the descending aorta - no coarctation demonstrated.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: "",
                    },
                ],
            },
        },
    },
    {
        title: "Right Ventricle",
        params: {
            RVFl: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal longitudinal function",
                        title: "Normal longitudinal function.",
                        default: true,
                    },
                    {
                        label: "Impaired longitudinal function",
                        title: "Impaired longitudinal function.",
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ]
            },
            RVFr: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal radial function",
                        title: "Normal radial function.",
                        default: true,
                    },
                    {
                        label: "Impaired radial function",
                        title: "Impaired radial function.",
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ]
            },
            RVH: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No hypertrophy",
                        title: "No right ventricular hypertrophy.",
                        default: true,
                    },
                    {
                        label: "Hypertrophied",
                        title: "Right ventricular hypertrophy.",
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ]
            },
            RVD: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No dilatation",
                        title: "No right ventricular dilatation.",
                        default: true,
                    },
                    {
                        label: "Dilated",
                        title: "Dilated right ventricle.",
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ]
            },
            RVMeas: {
                title: "Additional Measurements",
                custom: true,
            },
        },
    },
    {
        title: "Right Atrium",
        params: {
            RA: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Not dilated",
                        title: "Not dilated.",
                        default: true,
                    },
                    {
                        label: "Dilated",
                        title: "Dilated."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
        },
    },
    {
        title: "Tricuspid Valve",
        params: {
            TV: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal leaflets",
                        title: "Thin and mobile leaflets, opens well.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            TS: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No stenosis",
                        title: "No tricuspid stenosis.",
                        default: true,
                    },
                    {
                        label: "Mild stenosis",
                        title: "Mild tricuspid stenosis."
                    },
                    {
                        label: "Moderate stenosis",
                        title: "Moderate tricuspid stenosis."
                    },
                    {
                        label: "Severe stenosis",
                        title: "Severe tricuspid stenosis."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            TR: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Trivial regurgitation",
                        title: "Trivial tricuspid regurgitation.",
                        default: true,
                    },
                    {
                        label: "Mild regurgitation",
                        title: "Mild tricuspid regurgitation."
                    },
                    {
                        label: "Moderate regurgitation",
                        title: "Moderate tricuspid regurgitation."
                    },
                    {
                        label: "Severe regurgitation",
                        title: "Severe tricuspid regurgitation."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            TVMeas: {
                title: "Additional Measurements",
                custom: true,
            },
        },
    },
    {
        title: "Pulmonary Valve",
        params: {
            PV: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Normal leaflets",
                        title: "Thin and mobile cusps where seen.",
                        default: true,
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            PS: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "No stenosis",
                        title: "No pulmonary stenosis.",
                        default: true,
                    },
                    {
                        label: "Mild stenosis",
                        title: "Mild pulmonary stenosis."
                    },
                    {
                        label: "Moderate stenosis",
                        title: "Moderate pulmonary stenosis."
                    },
                    {
                        label: "Severe stenosis",
                        title: "Severe pulmonary stenosis."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            PR: {
                title: "",
                custom: true,
                options: [
                    {
                        label: "Trivial regurgitation",
                        title: "Trivial pulmonary regurgitation.",
                        default: true,
                    },
                    {
                        label: "Mild regurgitation",
                        title: "Mild pulmonary regurgitation."
                    },
                    {
                        label: "Moderate regurgitation",
                        title: "Moderate pulmonary regurgitation."
                    },
                    {
                        label: "Severe regurgitation",
                        title: "Severe pulmonary regurgitation."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            PVN: {
                title: "",
                options: [
                    {
                        label: "No systolic notch",
                        title: "No systolic notch.",
                        default: true,
                    },
                    {
                        label: "Systolic notch demonstrated",
                        title: "Systolic notch demonstrated."
                    },
                ],
            },
            PVMeas: {
                title: "Additional Measurements",
                custom: true,
            },
        },
    },
    {
        title: "Miscellaneous",
        params: {
            IVCD: {
                title: "IVC Size",
                custom: true,
                options: [
                    {
                        label: "Not dilated",
                        title: "not dilated",
                        default: true,                        
                    },
                    {
                        label: "Dilated",
                        title: "dilated"
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            IVCC: {
                title: "IVC Collapse",
                options: [
                    {
                        label: "Normal",
                        title: "> 50%",
                        default: true,
                    },
                    {
                        label: "No collapse",
                        title: "< 50%"
                    },
                ],
            },
            RAP: {
                title: "RA Pressure",
                options: [
                    {
                        label: "0-5mmHg",
                        title: "0-5",
                        default: true,
                    },
                    {
                        label: "5-15mmHg",
                        title: "5-15"
                    },
                    {
                        label: ">15mmHg",
                        title: ">15"
                    },
                ],
            },
            PASPe: {
                title: "Pulmonary artery systolic pressure...",
                options: [
                    {
                        label: "estimated as ",
                        title: "estimated as ",
                        default: true,
                    },
                    {
                        label: "not estimated in the absence of TR Vmax.",
                        title: "not estimated in the absence of TR Vmax.",
                    },
                ],
            },
            PASP: {
                title: "PASP =",
                custom: true,
            },
            PPHT: {
                title: "Probability of PHT",
                custom: true,
                options: [
                    {
                        label: "Low",
                        title: "Low",
                        default: true,
                    },
                    {
                        label: "Intermediate",
                        title: "Intermediate"
                    },
                    {
                        label: "High",
                        title: "High"
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            ASD: {
                title: "Atrial Septal Defect",
                options: [
                    {
                        label: "No ASD",
                        title: "No obvious atrial septal defect imaged on CFM.",
			default: true,
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            PEff: {
                title: "Pericardial Effusion",
                custom: true,
                options: [
                    {
                        label: "No pericardial effusion",
                        title: "No pericardial effusion.",
                        default: true,
                    },
                    {
                        label: "Trivial pericardial effusion",
                        title: "Trivial pericardial effusion.",
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
            PlEff: {
                title: "Pleural Effusion",
                custom: true,
                options: [
                    {
                        label: "n/a",
                        title: "",
                        default: true,
                    },
                    {
                        label: "Left pleural effusion",
                        title: "Left pleural effusion seen."
                    },
                    {
                        label: "Bilateral pleural effusions",
                        title: "Bilateral pleural effusions seen."
                    },
                    {
                        label: "(free text)",
                        title: ""
                    },
                ],
            },
        },
    },
]

// Register a helper to round to 2dp with trailing 0s
// i.e 1.7 -> 1.70
Handlebars.registerHelper('2dp', function (num) {
    return num && typeof num === 'number' ? num.toFixed(2) : "N/A";
})

// The template for the output
const outputTemplate = Handlebars.compile(
`TTE Findings: The report is compiled in accordance to a locally agreed combination of BSE Guidelines 2020 and EACVI guidelines 2016. Unless specified in the report conclusion, it is the sole responsibility of the referring physician to act upon the findings of this study. In specific cases where delay may result in patient harm, sonographers will refer for urgent clinical support.

Performed on: {{Machine}}
Operator: {{Operator}}
Technical Quality: {{TechnicalQualilty}}
ECG: {{ECG}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}
Sex: {{Gender}}
Age: {{Age}} years

Left Ventricle:
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
Global Averaged Longitudinal Strain = {{GLS}}
{{#if LVMeas ~}}{{LVMeas}}
{{/if}}

Mitral Valve:
{{MV}}
{{MS}}
{{MR}}
{{#if MVMeas ~}}{{MVMeas}}
{{/if}}

Left Atrium:
{{LA}}
LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}}
(Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)

Aortic Valve:
{{AV}}
{{AS}}
{{AR}}
LVOT Vmax = {{LVOTVmax}}, LVOT VTI = {{LVOTVTI}}
AV Vmax = {{AVVmax}}
{{#if AVMeas ~}}{{AVMeas}}
{{/if}}

Aorta:
{{Aorta}}
(Measured leading edge to leading edge, at end diastole as per departmental protocol)
Sinus of Valsalva = {{SoV}}, Indexed to height = {{SoVI}} (Normal range, male: 14.8-23.2mm/m)
Sinotubular Junction = {{StJ}}, Indexed to height = {{StJI}} (Normal range, male: 12.6-19.8mm/m) 
Ascending aorta = {{Ao}}, Indexed to height = {{AoI}} (Normal range, male: 12.6-21.4mm/m) 
{{DescAo}}

Right Ventricle:
{{RVFl}} {{RVFr}}
{{RVD}}
{{RVH}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}
RVD1 = {{RVD1}}
{{#if RVMeas ~}}{{RVMeas}}
{{/if}}

Right atrium:
{{RA}}
RA area = {{RAA}}, Indexed = {{RAAI}}

Tricuspid Valve:
{{TV}}
{{TS}}
{{TR}}
TR Vmax = {{TRVmax}}, TR MaxPG = {{TRMaxPG}}
{{#if TVMeas ~}}{{TVMeas}}
{{/if}}

Pulmonary Valve:
Thin and mobile cusps where seen.
No pulmonary stenosis.
Trivial pulmonary regurgitation. 
PV Vmax = {{PVVMax}}
PV AccT = {{PAT}}. {{PVN}}
{{#if PVMeas ~}}{{PVMeas}}
{{/if}}

Miscellaneous:
IVC is {{IVCD}} \({{IVC}}\) with {{IVCC}} collapse on inspiration estimating RA pressure at {{RAP}}mmHg. 
Pulmonary artery systolic pressure {{PASPe}}{{PASP}}.
{{PPHT}} echocardiographic probability for pulmonary hypertension.
{{ASD}}
{{PEff}}
{{#if PlEff ~}}{{PlEff}}
{{/if}}

Summary:
{{LVSF}} with no hypertrophy and no dilatation. 
Estimated ejection fraction {{EFBP}}, GLS {{GLS}}
Normal right ventricular function and size.
No significant valvular abnormalities.
`, {noEscape: true})

const example = 
`Height: 175.0 cm 
Weight: 83.0 kg 
BSA: 1.99 m² 
DOB: 31/08/1939 
Gender: Male 
BP: 132/88

2D  
IVSd 1.1 cm  
LVIDd 5.2 cm  
LVIDs 4.4 cm
LVPWd 1.0 cm  
LVd Mass (ASE) 211 g  
LVd Mass Ind (ASE) 106 g/m²  
Relative Wall Thickness 0.40   
LVOT Diam 2.0 cm  
IVC 22 mm  
MR VCD 0.75 cm  
Sinuses Of Valsalva 36.8 mm  
SoV (indexed to height) 21.1 mm/m  
Ao st junct 30.7 mm  
STJ (indexed to height) 17.6 mm/m  
Ao asc 35.0 mm  
Asc Ao (indexed to height) 20.0 mm/m  
RVD1 (base) 4.0 cm  
RA Area 16 cm²  
Indexed RA Area 8.3 cm²/m²  
RVA (d) 17.3 cm²  
Indexed RVEDA 8.7 cm²/m²  
RVA (s) 15.1 cm²  
RV FAC 12.3 %  
LVLd A4C 10.1 cm  
LVEDV MOD A4C 216.6 ml  
LVLs A4C 9.56 cm  
LVESV MOD A4C 163.43 ml  
LVEF MOD A4C 24.55 %  
SV MOD A4C 53.18 ml  
LVLd A2C 10.03 cm  
LVEDV MOD A2C 202.93 ml  
LVLs A2C 9.70 cm  
LVESV MOD A2C 140.54 ml  
LVEF MOD A2C 30.74 %  
SV MOD A2C 62.39 ml  
EF Biplane 27.4 %  
LVEDV MOD BP 210 ml  
LVESV MOD BP 153 ml  
LVEDVInd MOD BP 106 ml/m²  
LVESVInd MOD BP 77 ml/m²  
Biplane LVEDV (indexed to BSA) 106 ml/m²  
LALs A4C 6.16 cm  
LAAs A4C 26.39 cm²  
LAESV A-L A4C 95.95 ml  
LAESV MOD A4C 88.07 ml  
LALs A2C 6.17 cm  
LAAs A2C 24.03 cm²  
LAESV A-L A2C 79.42 ml  
LAESV MOD A2C 71.81 ml  
LAESV(MOD BP) 79.4 ml  
LAESVInd MOD BP 39.9 ml/m²  
MR Rad 0.8 cm  
MR Als.Vel 42 cm/s  
MR Flow 177.24 ml/s  
AVC 291.4 ms  
Peak SL Dispersion Full 121.8 ms  
G peak SL Full(APLAX) -4.3 %  
G peak SL Full(A4C) -5.0 %  
G peak SL Full(A2C) -3.5 %  
G peak SL Full(Avg) -4.2 %  
BA PSSL Full -7.9 %  
BI PSSL Full -7.1 %  
MA PSSL Full -2.0 %  
MI PSSL Full -5.9 %  
AA PSSL Full 2.8 %  
AI PSSL Full 1.4 %  
BAS PSSL Full -3.6 %  
BP PSSL Full -7.1 %  
MAS PSSL Full -7.6 %  
MP PSSL Full -8.1 %  
AAS PSSL Full -4.5 %  
AP PSSL Full -4.2 %  
BS PSSL Full -11.4 %  
BL PSSL Full -8.7 %  
MS PSSL Full -8.0 %  
ML PSSL Full -3.1 %  
AS PSSL Full -4.2 %  
AL PSSL Full -4.3 %  
HR 4Ch Q 103.2 BPM  
LVVED 4Ch Q 171.1 ml  
LVVES 4Ch Q 129.8 ml  
LVEF 4Ch Q 24.1 %  
LVSV 4Ch Q 41.3 ml  
LVCO 4Ch Q 4.3 l/min  
LVLs 4Ch Q 9.3 cm  
LVLd 4Ch Q 9.8 cm  
HR 2Ch Q 94.2 BPM  
LVVED 2Ch Q 138.3 ml  
LVVES 2Ch Q 102.9 ml  
LVEF 2Ch Q 25.6 %  
LVSV 2Ch Q 35.4 ml  
LVCO 2Ch Q 3.3 l/min  
LVLs 2Ch Q 9.6 cm  
LVLd 2Ch Q 9.9 cm  
LVVED BiP Q 153.9 ml  
LVVES BiP Q 115.2 ml  
LVEF BiP Q 25.1 %  
LVSV BiP Q 38.7 ml  
LVCO BiP Q 3.8 l/min  
LVEDV (auto EF) indexed to BSA 77.317 ml/m²  

M-Mode  
TAPSE 0.7 cm  

Doppler  
MV E Vel 84 cm/s  
MV A Vel 49 cm/s
MV E/A Ratio 1.7 
MV DecT 124 ms  
S' (septal) 7.3 cm/s  
E/E' Sept 18.67   
E' Sept 4.5 cm/s  
S' (lateral) 5.2 cm/s  
Mean Mitral Annular S' 6.3 cm/s  
E/E' Lat 5.44   
E' Avg 0.1 m/s  
E/E' Avg 8.4   
E' Lat 15.4 cm/s  
MVA (VTI) 1.68 cm²  
MV PHT 50.3 ms  
MVA By PHT 4.38 cm²  
MV Vmax 0.9 m/s  
MV Vmean 0.65 m/s  
MV maxPG 3.51 mmHg  
MV meanPG 1.9 mmHg  
MV VTI 15.0 cm  
HR 102.11 BPM  
LVOT Vmax 0.5 m/s  
LVOT maxPG 1.1 mmHg  
LVOT meanPG 0.5 mmHg  
LVOT VTI 7.8 cm  
LVSV Dopp 25.27 ml  
LVSI Dopp 12.70 ml/m²  
LVCO Dopp 2.62 l/min  
LVCI Dopp 1.32 l/minm²  
AV Vmax 0.6 m/s  
AV maxPG 1.6 mmHg  
AVA Vmax 2.71 cm²  
AVAI Vmax 1.361 cm²/m²  
AR PHT 403.4 ms  
PV Vmax 0.6 m/s  
PV maxPG 1.5 mmHg  
PV AccT 57 ms  
PV Acc Slope 0.09 m/s²  
TR Vmax 2.9 m/s  
TR maxPG 34 mmHg  
TV S' 4 cm/s  
MR Vmax 3.8 m/s  
MR VTI 101 cm  
MR ERO 0.5 cm²  
MR ERO 0.5 cm²  
MR RV 47.4 ml `

// --

jQuery(document).ready(function () {
    $("section").hide();
    $("#import").show();
    $("#results").show();

    $("#help").on("click", function () {
        $("dialog").attr("open", true);
    })

    $("#example code").html(example).on("click", function () {
        navigator.clipboard.writeText(example);
    });

    $("#example button").on("click", function () {
        $("dialog").attr("open", false);
    });

    const metrics = {}

    for (const k in options) {
        $("#options > div").append(`<h3>${options[k].title}</h3>`)

        for (const key in options[k].params) {
            const option = options[k].params[key]
            const $option = $(`<div id="${key}">
                    <label for="${key}">${option.title ?? key}</label>
                    <div class="grid">
                        ` + (option.options ? `
                        <div>
                            <select disabled>
                                <option selected disabled value="" >Select...</option>
                                ` + option.options.map(option => `<option ${option.default ? 'selected="selected"' : ''} title="${option.title}" value="${key}-${option.label.toLowerCase().replace(" ", "-")}">${option.label}</option>`).join("") + `
                            </select>
                        </div>
                        ` : '') + `
                        ${option.custom ? '<textarea disabled></textarea>' : ''}
                    </div>
                </div>`)

            $("#options > div").append($option)

            $("textarea", $option).on("paste", (e) => {
                let paste = (e.originalEvent.clipboardData || window.clipboardData).getData('text');
                paste = paste.replace(/\n/g, ", ").trim();

                // Insert the modified text into the textarea
                let textarea = e.target;
                let currentText = textarea.value;
                let selectionStart = textarea.selectionStart;
                let selectionEnd = textarea.selectionEnd;

                const newText = currentText.slice(0, selectionStart) + paste + currentText.slice(selectionEnd);

                $(e.currentTarget).val(newText)
                $(e.currentTarget).trigger("change")
                return false
            })

            const df = option.options ? option.options.find(option => option.default) : ''
            if (df) {
                metrics[key] = df.title
                $(".output", $option).html(df.title)
            }

            $("select, textarea", $option).on("change", function () {
                const vals = []

                const selected = $("select", $option).find(":selected").attr("title")
                if (selected) {
                    vals.push(selected)
                    $(".output", $option).html(selected)
                }

                if (option.custom) {
                    const ta = $("textarea", $option).val()
                    if (ta) {
                        vals.push(ta)
                    }
                }

                metrics[key] = vals.join(" ")
            })
        }

        $("#options > div").append(`<hr />`)
    }

    $("#submit").on("click", function () {
        $("select, textarea").prop("disabled", false)
        $("#results").show();

        $("#results #next").on("click", function () {
            $("#import").hide();
            $("#options").show();
            $(this).hide()
        })

        const report = $("#report").val();

        const results = {}

        let rows = ``


        for (const val in parseConfig) {
            rows += `<tr><th>${parseConfig[val]["title"]}</th></tr>`

            for (const [key, value] of Object.entries(parseConfig[val]["params"])) {
                let match = new RegExp(value.match, 'g').exec(report);

                if (match) {
                    results[key] = match[1];
                }

                for (const [key, value] of Object.entries(calculations)) {
                    results[key] = value(results);
                }

                if (value.unit && results[key]) {
                    results[key] = results[key] + value.unit;
                }

                rows += `<tr>
                    <td class="label">${value.label} = ${(results[key] ? results[key] : "N/A")}</td>
                </tr>`
            }
        }

        const dataTemplate = Handlebars.compile(`
                <table>
                    <tbody>${rows}</tbody>
                </table>
            `);

        $("#results div").html(dataTemplate());

        $("#generate").prop("disabled", false).on("click", function () {
            $("#options").hide();
            $("#output").show();

            $("#back").prop("disabled", false).on("click", function () {
                $("#output").hide();
                $("#options").show();
            });
            
            $("#copy").prop("disabled", false).on("click", function () {
                const text = $("#output textarea").val();
                navigator.clipboard.writeText(text);

                $("#copy").html("Copied!")
                setTimeout(() => {
                    $("#copy").html("Copy to clipboard")
                }, 1000);
            });

            const output = {
                ...results,
                ...metrics,
            };

            $("#output textarea").val(outputTemplate(output));
        });

        $("#output textarea").on("click", function () {
            $("#generate").prop("disabled", true)
        });
    });
});
