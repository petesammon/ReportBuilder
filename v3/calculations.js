const parseUKDate = (dateString) => {
    const splitDate = dateString.split('/');
    return new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
};

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
};