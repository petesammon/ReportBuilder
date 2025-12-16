
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
            HR: {
                match: "HR: (.*)",
                label: "HR",
                unit: "bpm",
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
            LVPWd: {
                match: "LVPWd (.*) cm",
                label: "LVPWd",
                unit: "cm",
            },
            LVEDVInd: {
                match: "LVEDVInd MOD BP (.*) ml/m²",
                label: "LVEDV Indexed",
                unit: "ml/m2",
            },
            LVESVInd: {
                match: "LVESVInd MOD BP (.*) ml/m²",
                label: "LVESV Indexed",
                unit: "ml/m2",
            },
            EFBP: {
                match: "EF Biplane (.*) %",
                label: "Simpson's Biplane EF",
                unit: "%",
            },
            GLS: {
                match: "G peak SL Full\\(Avg\\) (.*) %",
                label: "GLS",
                unit: "%",
            },
            MAPSE: {
                match: "",
                label: "MAPSE",
                unit: "mm",
            },
	   },
    },
    {
        title: "LV Diastolic Function",
        params: {
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
            EDecT: {
                match: "MV DecT (.*) ms",
                label: "E DecT",
                unit: "ms",
            },
            EARatio: {
                match: "MV E/A Ratio (.*)",
                label: "E/A Ratio",
                unit: "",
            },
            SPrimeSept: {
                match: "S' \\(septal\\) (.*) cm/s",
                label: "S' Septal",
                unit: "cm/s",
            },
            EPrimeSept: {
                match: "E' Sept (.*) cm/s",
                label: "E' Septal",
                unit: "cm/s",
            },
            EEPrimeSept: {
                match: "E/E' Sept (.*)",
                label: "E/E' Septal",
                unit: "",
            },
            SPrimeLat: {
                match: "S' \\(lateral\\) (.*) cm/s",
                label: "S' Lateral",
                unit: "cm/s",
            },
            EPrimeLat: {
                match: "E' Lat (.*) cm/s",
                label: "E' Lateral",
                unit: "cm/s",
            },
            EEPrimeLat: {
                match: "E/E' Lat (.*)",
                label: "E/E' Lateral",
                unit: "",
            },
            SPrimeAv: {
                match: "Mean Mitral Annular S' (.*) cm/s",
                label: "S' Mean",
                unit: "cm/s",
            },
            EEPrimeAv: {
                match: "E/E' Avg (.*)",
                label: "E/E' Average",
                unit: "",
            },
            // EF3D, 
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
            RVOTPLAX: {
                match: "",
                label: "RVOT PLAX",
                unit: "cm",
            },
            RVOT1: {
                match: "",
                label: "RVOT Proximal",
                unit: "cm",
            },
            RVOT2: {
                match: "",
                label: "RVOT Distal",
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
        title: "Additional",
        params: {
            LVEDV: {
                match: "LVEDV MOD BP (.*) ml",
                label: "LVEDV",
                unit: "ml",
            },
            LVESV: {
                match: "LVESV MOD BP (.*) ml",
                label: "LVESV",
                unit: "ml",
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
            EFAuto: {
                match: "LVEF BiP Q (.*) %",
                label: "Auto EF",
                unit: "%",
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
            DOB: {
                match: "DOB: (.*)",
                label: "Date of Birth",
            },
            Gender2: {
                match: "Gender: (.*)",
                label: "Gender",
                unit: "",
            },
        },
    },
];

