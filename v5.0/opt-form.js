// Form sections define which parameters appear in each modal
// The modals are triggered by Edit buttons placed alongside the report output

window.formSections = [
    {
        sectionPreviewKey: "sectStudy",
        sectionTitle: "Study Details",
        parameters: [
            "pQuality",
        ]
    },  
    {
        sectionPreviewKey: "sectLV",
        sectionTitle: "Left Ventricle",
        parameters: [
            "pRWMA",
            "pLVSF",
            "pLVMeasurements",
        ]
    },
    {
        sectionPreviewKey: "sectMV",
        sectionTitle: "Mitral Valve",
        parameters: [
            "pMV",
            "pMS",
        ]
    },
    {
        sectionPreviewKey: "sectSummary",
        sectionTitle: "Summary",
        parameters: [
            "spHeader",
            "spLV",
        ]
    },
];
