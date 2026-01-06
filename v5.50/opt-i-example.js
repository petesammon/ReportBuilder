window.parseExample = `
Still need to get:
- TR VTI
- TR ERO
- RV Strain
- LA Strain
- TR VC Width

// Demographics
    Height: 200.0 cm 
    Weight: 250.2 kg 
    BSA: 3.55 m² 
    DOB: 01/01/1900 
    Gender: Male 
    BP:  300/100mmHg
    
// Operators
    Operator1: Pete Sammon (Echocardiographer)
    Supervisor: Dr S Vahabi (Consultant)

// LV 2D
    IVSd 9.5 cm  
    LVIDd 9.6 cm  
    LVPWd 9.7 cm  
    LVIDs 9.8 cm  
    LVd Mass (ASE) 500 g  
    LVd Mass Ind (ASE) 250 g/m²  
    Relative Wall Thickness 1.10  
    LVIDs 9.9 cm  
    ESV(Teich) 100.00 ml  
    EF(Teich) 95.12 %  
    %FS 96.12 %  
    SV(Teich) 59.15 ml  
    SI(Teich) 28.17 ml/m²  
    
// LV Biplane
    LVLd A4C 10.1 cm  
    LVEDV MOD A4C 216.6 ml  
    LVLs A4C 9.56 cm  
    LVESV MOD A4C 163.43 ml  
    LVEF MOD A4C 24.55 %  
    SV MOD A4C 53.18 ml  
    LVLd A2C 10.03 cm  
    LVEDV MOD A2C 202.93 ml  
    LVLs A2C 9.70 cm  
    LVESV MOD A2C 140.54 ml  
    LVEF MOD A2C 30.74 %  
    SV MOD A2C 62.39 ml  
    EF Biplane 27.4 %  
    LVEDV MOD BP 210 ml  
    LVESV MOD BP 153 ml  
    LVEDVInd MOD BP 106 ml/m²  
    LVESVInd MOD BP 77 ml/m²  
    Biplane LVEDV (indexed to BSA) 106 ml/m²
    
// LV Auto
    HR 4Ch Q 103.2 BPM  
    LVVED 4Ch Q 171.1 ml  
    LVVES 4Ch Q 129.8 ml  
    LVEF 4Ch Q 24.1 %  
    LVSV 4Ch Q 41.3 ml  
    LVCO 4Ch Q 4.3 l/min  
    LVLs 4Ch Q 9.3 cm  
    LVLd 4Ch Q 9.8 cm  
    HR 2Ch Q 94.2 BPM  
    LVVED 2Ch Q 138.3 ml  
    LVVES 2Ch Q 102.9 ml  
    LVEF 2Ch Q 25.6 %  
    LVSV 2Ch Q 35.4 ml  
    LVCO 2Ch Q 3.3 l/min  
    LVLs 2Ch Q 9.6 cm  
    LVLd 2Ch Q 9.9 cm  
    LVVED BiP Q 153.9 ml  
    LVVES BiP Q 115.2 ml  
    LVEF BiP Q 25.1 %  
    LVSV BiP Q 38.7 ml  
    LVCO BiP Q 3.8 l/min  
    LVEDV (auto EF) indexed to BSA 77.317 ml/m²
    
// LV Strain
    AVC 291.4 ms
    Peak SL Dispersion Full 121.8 ms  
    G peak SL Full(APLAX) -4.3 %  
    G peak SL Full(A4C) -5.0 %  
    G peak SL Full(A2C) -3.5 %  
    G peak SL Full(Avg) -4.2 %  
    BA PSSL Full -7.9 %  
    BI PSSL Full -7.1 %  
    MA PSSL Full -2.0 %  
    MI PSSL Full -5.9 %  
    AA PSSL Full 2.8 %  
    AI PSSL Full 1.4 %  
    BAS PSSL Full -3.6 %  
    BP PSSL Full -7.1 %  
    MAS PSSL Full -7.6 %  
    MP PSSL Full -8.1 %  
    AAS PSSL Full -4.5 %  
    AP PSSL Full -4.2 %  
    BS PSSL Full -11.4 %  
    BL PSSL Full -8.7 %  
    MS PSSL Full -8.0 %  
    ML PSSL Full -3.1 %  
    AS PSSL Full -4.2 %  
    AL PSSL Full -4.3 % 
    
// LV 3D
    EDV 126.0 ml  
    EDVI 75 ml/m²  
    ESV 65.3 ml  
    ESVI 39 ml/m²  
    EF 48.2 %  
    HR 65.69 BPM  
    SV 60.7 ml  
    CO 4.0 l/min  
    SpI 0.34    
    
// Vessels
    MPA 3.5 cm  
    RPA 2.58 cm  
    LPA 2.08 cm  
    IVC Diam Exp 2.30 cm   
    IVC 22 mm  
    LVOT Diam 2.0 cm  
    Sinuses Of Valsalva 36.8 mm  
    SoV (indexed to height) 21.1 mm/m  
    Ao st junct 30.7 mm  
    STJ (indexed to height) 17.6 mm/m  
    Ao asc 35.0 mm  
    Asc Ao (indexed to height) 20.0 mm/m  
    
// Jet Quantification
    MR VCD 0.75 cm  
    MR Rad 0.8 cm  
    MR Als.Vel 42 cm/s  
    MR Flow 177.24 ml/s 
    TR Rad 0.7 cm  
    TR Als.Vel 30.03 cm/s  
    TR Flow 92.35 ml/s   
    
// RV
    RVD1 (base) 5.1 cm  
    RVD2 (mid) 3.9 cm  
    RVD3 (base->apex) 7.7 cm  
    RVA (d) 17.3 cm²  
    Indexed RVEDA 8.7 cm²/m²  
    RVA (s) 15.1 cm²  
    RV FAC 12.3 %    
    RVOT (proximal) 3.1 cm  
    RVOT (distal) 2.4 cm
    
// Atria
    RA Area 16 cm²  
    Indexed RA Area 8.3 cm²/m²  
    LALs A4C 6.16 cm  
    LAAs A4C 26.39 cm²  
    LAESV A-L A4C 95.95 ml  
    LAESV MOD A4C 88.07 ml  
    LALs A2C 6.17 cm  
    LAAs A2C 24.03 cm²  
    LAESV A-L A2C 79.42 ml  
    LAESV MOD A2C 71.81 ml  
    LAESV(MOD BP) 79.4 ml  
    LAESVInd MOD BP 39.9 ml/m² 
    LA Diam 3.7 cm  
 
// M-Mode  
    TAPSE 0.7 cm  

// MV Doppler 
    MV E Vel 100 cm/s  
    MV DecT 283 ms  
    MV A Vel 100 cm/s  
    MV E/A Ratio 1.0    
    MVA (VTI) 1.68 cm²  
    MV PHT 50.3 ms  
    MVA By PHT 4.38 cm²  
    MV Vmax 0.9 m/s  
    MV Vmean 0.65 m/s  
    MV maxPG 3.51 mmHg  
    MV meanPG 1.9 mmHg  
    MV VTI 15.0 cm
    
    MR Vmax 3.8 m/s  
    MR VTI 101 cm  
    MR ERO 0.5 cm²  
    MR ERO 0.5 cm²  
    MR RV 47.4 ml

// LV Doppler
    S' (septal) 7.3 cm/s  
    E/E' Sept 18.67   
    E' Sept 4.5 cm/s  
    S' (lateral) 5.2 cm/s  
    Mean Mitral Annular S' 6.3 cm/s  
    E/E' Lat 5.44   
    E' Avg 0.1 m/s  
    E/E' Avg 8.4   
    E' Lat 15.4 cm/s

// LVOT Doppler
    LVOT Vmax 0.5 m/s  
    LVOT maxPG 1.1 mmHg  
    LVOT meanPG 0.5 mmHg  
    LVOT VTI 7.8 cm  
    LVSV Dopp 25.27 ml  
    LVSI Dopp 12.70 ml/m²  
    LVCO Dopp 2.62 l/min  
    LVCI Dopp 1.32 l/minm²  
    
// AV Doppler
    AV Vmax 1.2 m/s  
    AV maxPG 5.5 mmHg  
    AV meanPG 3.2 mmHg  
    AV VTI 26.4 cm  
    AVA Vmax 2.71 cm²  
    AVAI Vmax 1.361 cm²/m² 
    DVI 0.87  
    AR PHT 403.4 ms  

// RVOT Doppler
    RVOT Vmax 0.7 m/s  
    RVOT Vmean 0.48 m/s  
    RVOT maxPG 1.89 mmHg  
    RVOT meanPG 1.04 mmHg  
    RVOT VTI 12.2 cm
    
// PV Doppler
    PV Vmax 0.8 m/s  
    PV maxPG 2.8 mmHg  
    PV AccT 137 ms  
    PV Acc Slope 0.10 m/s²  
    PV Vmax 0.8 m/s  
    PV Vmean 0.64 m/s  
    PV maxPG 2.8 mmHg  
    PV meanPG 1.8 mmHg  
    PV VTI 17.05 cm 
    
    PR Vmax 0.98 m/s  
    PR maxPG 3.83 mmHg  
    PRend Vmax 0.52 m/s  
    PRend PG 1.08 mmHg  
    PRearly Vmax 0.96 m/s  
    PRearly maxPG 3.67 mmHg 
    PR PHT 236.7 ms  
    PR DecT 816.06 ms  
    PR Dec Slope 1.76 m/s²
    
//TV Doppler
    TR Vmax 2.9 m/s  
    TR maxPG 34 mmHg  
    TV S' 4 cm/s 
    TV Vmax 1.43 m/s  
    TV Vmean 1.02 m/s  
    TV maxPG 8.22 mmHg  
    TV meanPG 4.53 mmHg  
    TV VTI 47.89 cm
`;