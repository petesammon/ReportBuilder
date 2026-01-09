window.calculations = {
    Age: (metrics) => {
        if (!metrics.DOB) return "N/A";
        // Parse UK date format (DD/MM/YYYY)
        const [day, month, year] = metrics.DOB.split('/');
        const dob = new Date(year, month - 1, day);
        const ageMs = Date.now() - dob.getTime();
        return Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
    },
    BMI: (metrics) => {
        // Parse as floats to handle string values
        const height = parseFloat(metrics.Height);
        const weight = parseFloat(metrics.Weight);
        
        // Validate both values exist and are positive
        if (!height || !weight || isNaN(height) || isNaN(weight) || height <= 0) return "N/A";
        
        // BMI = weight(kg) / height(m)²
        // Height is in cm, so convert: (height/100)² = height²/10000
        const bmi = weight / ((height * height) / 10000);
        return parseFloat(bmi.toFixed(1));
    },
    RWT: (metrics) => {
        // Parse as floats to handle string values
        const ivsd = parseFloat(metrics.IVSd);
        const lvpwd = parseFloat(metrics.LVPWd);
        const lvidd = parseFloat(metrics.LVIDd);
        
        // Validate values exist and are positive
        if (!ivsd || !lvpwd || !lvidd) return "N/A";
        
        const RWT = (ivsd + lvpwd) / lvidd;
        return parseFloat(RWT.toFixed(1));
    },
    HeightRounded: (metrics) => {
        return metrics.Height ? Math.round(metrics.Height)/100 : "N/A";
    },
    WeightRounded: (metrics) => {
        return metrics.Weight ? Math.round(metrics.Weight) : "N/A";
    },
    EFBPRounded: (metrics) => {
        return metrics.EFBP ? Math.round(metrics.EFBP) : "N/A";
    },
    EffMVVar: (metrics) => {
        if (!metrics.EffMVVmax || !metrics.EffMVVmin) return "N/A";
        const variation = ((metrics.EffMVVmax - metrics.EffMVVmin) / metrics.EffMVVmax) * 100;
        return parseFloat(variation.toFixed(1));
    },
    EffTVVar: (metrics) => {
        if (!metrics.EffTVVmax || !metrics.EffTVVmin) return "N/A";
        const variation = ((metrics.EffTVVmax - metrics.EffTVVmin) / metrics.EffTVVmax) * 100;
        return parseFloat(variation.toFixed(1));
    },
    AVAccEjT: (metrics) => {
        if (!metrics.AVAccT || !metrics.AVEjT) return "N/A";
        const ratio = metrics.AVAccT / metrics.AVEjT;
        return parseFloat(ratio.toFixed(2));
    },
};
