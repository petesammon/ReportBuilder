window.optionsFileMeta = {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3 L4 19"></path>
        <path d="M12 3 L20 19"></path>
        <path d="M4 19 Q12 23 20 19"></path>
        <path d="M12 3 L12 17" opacity="0.5"></path>
        <path d="M12 3 L8 18" opacity="0.5"></path>
        <path d="M12 3 L16 18" opacity="0.5"></path>
    </svg>`,
    title: 'Open layer options'
};

window.options = [
    {
        modalKey: "mStudyDetails",
        modalTitle: "Study Details (Image Flow)",
        variables: [
            "Operator1",
            "pMachine",
            "pQuality",
            "pRhythm",
            "HR",
        ],
    },
    {
        modalKey: "mPLAX1",
        modalTitle: "Parasternal Long Axis - 1",
        variables: [
            "pLVH",
            "pLVG",
            "pLVD",
            "pMV",
            "pMS",
            "pMR",
            "pAV",
            "pAS",
            "pAR",
        ],
    },
    {
        modalKey: "mAorta",
        modalTitle: "Parasternal Long Axis - Aorta Focus",
        variables: [
            "pAorta",
            "pAoMeasurements",
        ],
    },
    {
        modalKey: "mPLAX2",
        modalTitle: "Parasternal Long Axis - 2",
        variables: [
            "pTV",
            "pTS",
            "pTR",
            "pPV",
            "pPS",
            "pPR",
            "pPVN"
        ],
    },
    {
        modalKey: "mPSAX1",
        modalTitle: "Parasternal Short Axis - 1",
        variables: [
            "pAV",
            "pAS",
            "pAR",
            "pTV",
            "pTS",
            "pTR",
            "pPV",
            "pPS",
            "pPR",
            "pPVN",
        ],
    },
    {
        modalKey: "mPSAX2",
        modalTitle: "Parasternal Short Axis - 2",
        variables: [
            "pMV",
            "pMS",
            "pMR",
            "pLVH",
            "pLVG",
            "pLVD",
            "pRWMAS",
            "pLVComments",
        ],
    },
    {
        modalKey: "mA4C1",
        modalTitle: "Apical 4 Chamber - LV",
        variables: [
            "pMV",
            "pMS",
            "pMR",
            "pMVMeasurements",
            "pLA",
            "pDiastology"
        ],
    },
    {
        modalKey: "mA4C2",
        modalTitle: "Apical 4 Chamber - RV",
        variables: [
            "pTV",
            "pTS",
            "pTR",
            "pRVComments",
            "pRVF",
            "pRVD",
            "pRVH",
            "pRA",
            "pRVtoRA",
            "pPSAP",
        ],
    },
    {
        modalKey: "mA5C",
        modalTitle: "Apical 5 Chamber",
        variables: [
            "pAV",
            "pAS",
            "pAR",
            "pAVMeasurements",
        ],
    },
    {
        modalKey: "mA2C",
        modalTitle: "Apical 2 Chamber",
        variables: [
            "pLA",
            "pDiastology",
        ],
    },
    {
        modalKey: "mLVFocus",
        modalTitle: "LV Focus",
        variables: [
            "pRWMA",
            "pLVComments",
            "pLVF",
            "pLVH",
            "pLVG",
            "pLVD",
            "pDiastology",
            "pLVMeasurements",
            "pLVEF",
            "spLV",
        ],
    },
    {
        modalKey: "mSubcostal",
        modalTitle: "Subcostal",
        variables: [
            "pIVC",
            "pPASP",
            "pASD",
            "pPEff",
            "pPLEff",            
        ],
    },
    {
        modalKey: "mSuprasternal",
        modalTitle: "Suprasternal",
        variables: [
            "pCoarc",
            "pAR",          
        ],
    },
];