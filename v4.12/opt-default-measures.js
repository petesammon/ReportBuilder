// Measurements configuration for display
// Defines which measurements to show and in what order
window.measurements = [
    {
        title: "Enter Manually",
        highlight: true,
        sectionPreviewKey: "sectStudy",
        items: [
            "Operator1",
            "HR",
        ]
    },    
    {
        title: "Demographics",
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
        title: "LV Dimensions",
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
        title: "LV Systolic Function",
        sectionPreviewKey: ["sectLV", "sectLVMeasurements"],
        items: [
            "EFBP", 
            "EFAuto", 
            "GLS"
        ]
    },
    {
        title: "LV Diastolic Function",
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
        title: "Mitral Valve",
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
        title: "Left Atrium",
        sectionPreviewKey: "sectLA",
        items: [
            "LAESV", 
            "LAESVInd"
        ]
    },
    {
        title: "LVOT",
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
        title: "Aortic Valve",
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
        title: "AV Manual",
        sectionPreviewKey: "sectAV",
        highlight: true,
        items: [
            "AVAccT",
            "AVEjT",
            "AVAccEjT",
        ]
    },
    {
        title: "Aorta Dimensions",
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
        title: "Ao Manual",
        sectionPreviewKey: "sectAo",
        highlight: true,
        items: [
            "DescAoVTI",
            "DescAoEndVmax",
        ]
    },
    {
        title: "RV Dimensions",
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
        title: "RV Function",
        sectionPreviewKey: "sectRV",
        items: [
            "TAPSE", 
            "RVS", 
            "FAC"
        ]
    },
    {
        title: "Right Atrium",
        sectionPreviewKey: "sectRA",
        items: [
            "RAA", 
            "RAAI"
        ]
    },
    {
        title: "Tricuspid Valve",
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
        title: "RVOT",
        sectionPreviewKey: "sectPV",
        items: [
            "RVOTVmax", 
            "RVOTMaxPG", 
            "RVOTMeanPG", 
            "RVOTVTI"
        ]
    },
    {
        title: "Pulmonary",
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
        title: "Pulmonary Regurgitation",
        sectionPreviewKey: "sectPV",
        items: [
            "PRVMax", 
            "PRMaxPG",
            "PREndVmax"
        ]
    },
    {
        title: "Miscellaneous",
        sectionPreviewKey: "sectMisc",
        items: [
            "IVC"
        ]
    },    
    {
        title: "Effusion Size",
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
        title: "Respiratory Variation",
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