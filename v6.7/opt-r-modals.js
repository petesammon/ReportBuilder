window.optionsFileMeta = {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M11 4 L4 4 C2.9 4 2 4.9 2 6 L2 20 C2 21.1 2.9 22 4 22 L18 22 C19.1 22 20 21.1 20 20 L20 13"></path>
        <path d="M18.5 2.5 C19.3 1.7 20.7 1.7 21.5 2.5 C22.3 3.3 22.3 4.7 21.5 5.5 L12 15 L8 16 L9 12 Z"></path>
    </svg>`,
    title: 'Open layer options'
};

window.options = [
    {
        modalKey: "mStudy",
        modalTitle: "Study Details (Text Flow)",
        variables: [
            "Operator1",
            "pMachine",
            "pQuality",
            "pDemo",
            "BP",
            "pRhythm",
            "HR",
        ],
    },
    {
        modalKey: "mLV",
        modalTitle: "Left Ventricle",
        variables: [
            "pRWMA",
            "pLVComments",
            "pLVSF",
            "pLVH",
            "pLVD",
            "pDiastology",
        ],
    },
    {
        modalKey: "mLVMeasurements",
        modalTitle: "LV Measurements",
        variables: [
            "pLVMeasurements",
            "pLVEF",
        ],
    },
    {
        modalKey: "mMV",
        modalTitle: "Mitral Valve",
        variables: [
            "pMV",
            "pMS",
            "pMR",
            "pMVMeasurements",
        ],
    },
    {
        modalKey: "mLA",
        modalTitle: "Left Atrium",
        variables: [
            "pLA",
        ],
    },
    {
        modalKey: "mAV",
        modalTitle: "Aortic Valve",
        variables: [
            "pAV",
            "pAS",
            "pAR",
            "pAVMeasurements",
        ],
    },
    {
        modalKey: "mAo",
        modalTitle: "Aorta",
        variables: [
            "pAorta",
            "pAoMeasurements",
            "pCoarc",
        ],
    },
    {
        modalKey: "mRV",
        modalTitle: "Right Ventricle",
        variables: [
            "pRVComments",
            "pRVF",
            "pRVD",
            "pRVH",
            "pRVMeasurements",
        ],
    },
    {
        modalKey: "mRA",
        modalTitle: "Right Atrium",
        variables: [
            "pRA",
        ],
    },
    {
        modalKey: "mTV",
        modalTitle: "Tricuspid Valve",
        variables: [
            "pTV",
            "pTS",
            "pTR",
            "pRVtoRA",
            "pTVMeasurements",
        ],
    },
    {
        modalKey: "mPV",
        modalTitle: "Pulmonary Valve",
        variables: [
            "pPV",
            "pPS",
            "pPR",
            "pPVN",
            "pPVMeasurements",
        ],
    },    
    {
        modalKey: "mMisc",
        modalTitle: "Miscellaneous",
        variables: [
            "pIVCD",
            "pPASP",
            "pPPHT",
            "pASD",
            "pPlEff",
            "pPEff",
        ],
    },
    {
        modalKey: "mPeffFull",
        modalTitle: "Pericardial Effusion",
        variables: [
            "pEffSize",
            "pEffOther",
            "pEffMeasures",
            "pEffCompromise",
            "pSeptMotion",
            "pRVCollapse",
            "pRACollapse",
            "pEffIVC",
            "pEffVariation",
            "pEffInflow",
        ],
    },
    {
        modalKey: "Summary",
        modalTitle: "Summary",
        variables: [
            "spLV",
        ],
    },
];