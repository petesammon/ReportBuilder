// Measurements configuration for display
// Defines which measurements to show and in what order
window.measurements = [
    {
        modalTitle: "Enter Manually",
        highlight: true,
        modalKey: "mStudy",
        items: [
            "Operator1",
            "HR",
        ]
    },    
    {
        modalTitle: "Demographics",
        modalKey: "mStudy",
        items: [
            "DOB",
            "Age",
            "Gender",
            "Height", 
            "Weight", 
            "BSA", 
            "BMI",
            "BP",
        ]
    },
    {
        modalTitle: "LV Dimensions",
        modalKey: ["mLV", "mLVMeasurements"],
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
        modalTitle: "LV Systolic Function",
        modalKey: ["mLV", "mLVMeasurements"],
        items: [
            "EFVisual",
            "EFBP", 
            "EFAuto", 
            "EF3D",
            "GLS"
        ]
    },
    {
        modalTitle: "LV Diastolic Function",
        modalKey: ["mLV", "mLVMeasurements"],
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
        modalTitle: "Mitral Valve",
        modalKey: "mMV",
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
        modalTitle: "Left Atrium",
        modalKey: "mLA",
        items: [
            "LAESV", 
            "LAESVInd"
        ]
    },
    {
        modalTitle: "LVOT",
        modalKey: "mAV",
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
        modalTitle: "Aortic Valve",
        modalKey: "mAV",
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
        modalTitle: "AV Manual",
        modalKey: "mAV",
        highlight: true,
        items: [
            "AVAccT",
            "AVEjT",
            "AVAccEjT",
        ]
    },
    {
        modalTitle: "Aorta Dimensions",
        modalKey: "mAo",
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
        modalTitle: "Ao Manual",
        modalKey: "mAo",
        highlight: true,
        items: [
            "DescAoVTI",
            "DescAoEndVmax",
        ]
    },
    {
        modalTitle: "RV Dimensions",
        modalKey: "mRV",
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
        modalTitle: "RV Function",
        modalKey: "mRV",
        items: [
            "TAPSE", 
            "RVS", 
            "FAC"
        ]
    },
    {
        modalTitle: "Right Atrium",
        modalKey: "mRA",
        items: [
            "RAA", 
            "RAAI"
        ]
    },
    {
        modalTitle: "Tricuspid Valve",
        modalKey: "mTV",
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
        modalTitle: "RVOT",
        modalKey: "mPV",
        items: [
            "RVOTVmax", 
            "RVOTMaxPG", 
            "RVOTMeanPG", 
            "RVOTVTI"
        ]
    },
    {
        modalTitle: "Pulmonary",
        modalKey: "mPV",
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
        modalTitle: "Pulmonary Regurgitation",
        modalKey: "mPV",
        items: [
            "PRVMax", 
            "PRMaxPG",
            "PREndVMax"
        ]
    },
    {
        modalTitle: "Miscellaneous",
        modalKey: "mMisc",
        items: [
            "IVC"
        ]
    },    
    {
        modalTitle: "Effusion Size",
        modalKey: "mPeffFull",
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
        modalTitle: "Respiratory Variation",
        modalKey: "mPeffFull",
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