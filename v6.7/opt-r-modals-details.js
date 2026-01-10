window.optionsFileMeta = {
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="10" cy="10" r="7"></circle>
        <path d="M22 22 L15 15"></path>
    </svg>`,
    title: 'Open layer options'
};

window.options = [
    {
        modalKey: "mFull",
        modalTitle: "Full Normal Study",
        variables: [
            "Operator1",
            "pMachine",
            "pQuality",
            "pRhythm",
            "HR",
            "pLVMeasurements",
            "EFVisual",
            "pLVEF",
            "spLV",
            "pAoMeasurements",
            "pRVtoRA",
            "pPASP",
        ],
    },
    {
        modalKey: "mDiastology",
        modalTitle: "Full Diastology Assessment",
        variables: [
            "pRhythm",
            "pRWMA",
            "EFBP",
            "GLS",
            "EEPrimeAv",
            "LAESVInd",
            "TRVmax",
            "EPrimeSept",
            "EPrimeLat",
            "EVel",
            "EDecT",
            "EEPrimeSept",
            "LARs",
            "LAPs",
            "ArADur",
            "LWave",
            "PVSDR",
            "Age",
            "Gender",
            "Height",
            "Weight",
            "BMI",
        ],
    },
];