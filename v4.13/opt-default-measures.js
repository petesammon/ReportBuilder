// Measurements configuration for display
// Defines which measurements to show and in what order
window.measurements = [
    {
        sectionTitle: "Enter Manually",
        highlight: true,
        sectionPreviewKey: "sectStudy",
        items: [
            "Operator1",
            "HR",
        ]
    },    
    {
        sectionTitle: "Demographics",
        sectionPreviewKey: "sectStudy",
        items: [
            "DOB",
            "Age",
            "Gender",
            "Height", 
            "Weight", 
            "BSA", 
            "BP",
        ]
    },
    {
        sectionTitle: "LV Dimensions",
        sectionPreviewKey: ["sectLV", "sectLVMeasurements"],
        items: [
            "IVSd", 
            "LVPWd", 
            "LVIDd", 
            "LVIDs", 
            "LVEDV", 
            "LVEDVInd", 
            "LVESV", 
            "LVESVInd",
        ]
    },
    {
        sectionTitle: "LV Systolic Function",
        sectionPreviewKey: ["sectLV", "sectLVMeasurements"],
        items: [
            "EFBP", 
            "EFAuto", 
            "GLS"
        ]
    },
    {
        sectionTitle: "LV Diastolic Function",
        sectionPreviewKey: ["sectLV", "sectLVMeasurements"],
        items: [
            "EVel", 
            "EDecT",
            "AVel", 
            "EARatio", 
            "SPrimeSept", 
            "SPrimeLat", 
            "SPrimeAv",
            "EPrimeSept", 
            "EPrimeLat", 
            "EEPrimeSept", 
            "EEPrimeLat", 
            "EEPrimeAv"
        ]
    },
    {
        sectionTitle: "Mitral Valve",
        sectionPreviewKey: "sectMV",
        items: [
            "MVVmax", 
            "MVMeanPG", 
            "MVVTI",
            "MRVCD", 
            "MRPISA", 
            "MRALSVEL", 
            "MRVTI", 
            "MRRV", 
            "MRERO"
        ]
    },
    {
        sectionTitle: "Left Atrium",
        sectionPreviewKey: "sectLA",
        items: [
            "LAESV", 
            "LAESVInd"
        ]
    },
    {
        sectionTitle: "LVOT",
        sectionPreviewKey: "sectAV",
        items: [
            "LVOTVmax", 
            "LVOTMeanPG", 
            "LVOTVTI", 
            "LVOTd", 
            "LVSV", 
            "LVSVI"
        ]
    },
    {
        sectionTitle: "Aortic Valve",
        sectionPreviewKey: "sectAV",
        items: [
            "AVVmax", 
            "AVMeanPG", 
            "AVVTI", 
            "DVI", 
            "AVA", 
            "AVAI",
            "ARPHT",
        ]
    },
    {
        sectionTitle: "AV Manual",
        sectionPreviewKey: "sectAV",
        highlight: true,
        items: [
            "AVAccT",
            "AVEjT",
            "AVAccEjT",
        ]
    },
    {
        sectionTitle: "Aorta Dimensions",
        sectionPreviewKey: "sectAo",
        items: [
            "SoV", 
            "SoVI", 
            "StJ", 
            "StJI", 
            "Ao", 
            "AoI"
        ]
    },
    {
        sectionTitle: "Ao Manual",
        sectionPreviewKey: "sectAo",
        highlight: true,
        items: [
            "DescAoVTI",
            "DescAoEndVmax",
        ]
    },
    {
        sectionTitle: "RV Dimensions",
        sectionPreviewKey: "sectRV",
        items: [
            "RVD1", 
            "RVD2", 
            "RVD3", 
            "RVEDA", 
            "RVEDAI", 
            "RVESA"
        ]
    },
    {
        sectionTitle: "RV Function",
        sectionPreviewKey: "sectRV",
        items: [
            "TAPSE", 
            "RVS", 
            "FAC"
        ]
    },
    {
        sectionTitle: "Right Atrium",
        sectionPreviewKey: "sectRA",
        items: [
            "RAA", 
            "RAAI"
        ]
    },
    {
        sectionTitle: "Tricuspid Valve",
        sectionPreviewKey: "sectTV",
        items: [
            "TRVmax", 
            "TRMaxPG",
            "TVVmax", 
            "TVMeanPG", 
            "TVVTI", 
            "TRPISA", 
            "TRALSVEL", 
            "TRVTI", 
            "TRERO"
        ]
    },
    {
        sectionTitle: "RVOT",
        sectionPreviewKey: "sectPV",
        items: [
            "RVOTVmax", 
            "RVOTMaxPG", 
            "RVOTMeanPG", 
            "RVOTVTI"
        ]
    },
    {
        sectionTitle: "Pulmonary",
        sectionPreviewKey: "sectPV",
        items: [
            "PVVmax",
            "PVMaxPG", 
            "PVMeanPG", 
            "PVVTI",
            "PAT", 
            "MPA", 
            "RPA", 
            "LPA"
        ]
    },
    {
        sectionTitle: "Pulmonary Regurgitation",
        sectionPreviewKey: "sectPV",
        items: [
            "PRVMax", 
            "PRMaxPG",
            "PREndVmax"
        ]
    },
    {
        sectionTitle: "Miscellaneous",
        sectionPreviewKey: "sectMisc",
        items: [
            "IVC"
        ]
    },    
    {
        sectionTitle: "Effusion Size",
        sectionPreviewKey: "sectPeffFull",
        highlight: true,
        items: [
            "LVPLAX",
            "LVPSAX",
            "LVA4C",
            "LVSC",
            "RVPLAX",
            "RVPSAX",
            "RVA4C",
            "RVSC",
            "RAA4C",
            "RASC",
        ]
    },
    {
        sectionTitle: "Respiratory Variation",
        sectionPreviewKey: "sectPeffFull",
        highlight: true,
        items: [
            "EffMVVmax",
            "EffMVVmin",
            "EffMVVar",
            "EffTVVmax",
            "EffTVVmin",
            "EffTVVar",
        ]
    },   
];