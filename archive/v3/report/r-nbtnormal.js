window.outputTemplate = Handlebars.compile(
`The following report is compiled in accordance to BSE guidelines 2020 (https://doi.org/10.1530/ERP-19-0050) with the adoption of new guidelines on Diastolic Dysfunction/Amyloid published 2024
This is a technical report only and requires clinical interpretation by the referring/receiving clinician

Operated and Reported by: {{Operator}}
Technical Quality: {{TechnicalQualilty}}
Machine: {{Machine}}
ECG: {{Rhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}
Gender: {{Gender}}

Left Ventricle:
{{#if RWMAs ~}}{{RWMAs}}
{{/if~}}
{{LVSF}}.
{{LVH}}. {{LVD}}.
(Linear 2D measurements) IVS = {{IVSd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}, PWd = {{LVPWd}}
LVEDV/BSA = {{LVEDVInd}}, LVEDV/BSA = {{LVESVInd}}
Biplane Simpson's EF = {{EFBP}}
GLS = {{GLS}}
MAPSE = {{MAPSE}}

Diastolic Function:
{{Diastology}}{{LAP}}
Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}, E DecT = {{EDecT}}, E/A ratio = {{EARatio}}
Septal S' = {{SPrimeSept}}, Septal E' = {{EPrimeSept}}, Septal E/E' = {{EEPrimeSept}}
Lateral S' = {{SPrimeLat}}, Lateral E' = {{EPrimeLat}}, Lateral E/E' = {{EEPrimeLat}}
Average S' = {{SprimeAv}}
Average E/E' = {{EEPrimeAv}}

Mitral Valve:
{{MV}} {{MS}} {{MR}}

Left Atrium:
{{LAtrium}}
Biplane Simpson's Volume = {{LAESV}} (Indexed = {{LAESVInd}})

Aortic Valve:
{{AV}} {{AS}} {{AR}}
AV Vmax = {{AVVmax}}, PPd = {{AVMaxPG}}, Mean PG = {{AVMeanPG}}, VTI = {{AVVTI}}
{{AVGradient}}
LVOT Vmax = {{LVOTVmax}}, PPd = {{LVOTMaxPG}}, Mean PG = {{LVOTMeanPG}}, VTI = {{LVOTVTI}}
{{LVOTGradient}}

Aorta:
{{Aorta}}
Absolute: Sinus of Valsalva = {{SoV}}, Sinotubular Junction = {{StJ}}, Ascending aorta = {{Ao}}
Indexed to Height: Sinus of Valsalva = {{SoVI}}, Sinotubular Junction = {{StJI}}, Ascending aorta = {{AoI}}
{{Arch}} {{AoReversal}} {{Coarc}}

Right Ventricle:
{{RVD}} {{RVH}}
RVD1 = {{RVD1}}
RVOT (PLAX) = {{RVOTPLAX}}
RVOT Diameter (Proximal) = {{RVOT1}}
RVOT Diameter (Distal) = {{RVOT2}}
{{RVFl}} {{RVFr}}
TAPSE = {{TAPSE}}, RV S' = {{RVS}}
Fractional Area Change = {{FAC}}

Right Atrium:
{{RAtrium}}
Area = {{RAA}} (Indexed area/BSA = {{RAAI}})

Tricuspid Valve:
{{TV}} {{TS}} {{TR}}
Peak regurgitant jet velocity = {{TRVmax}}, PPD = {{TRMaxPG}}
IVC is {{IVCD}} with {{IVCC}} collapse on inspiration.
{{PPHT}}
PASP = {{PASP}}

Pulmonary Valve:
{{PV}} {{PS}} {{PR}}
PV Vmax = {{PVVMax}}
PV AccT = {{PAT}}. {{PVN}}


Miscellaneous:
{{ASD}}
{{PEff}}

Summary:
{{Summary}}

`, {noEscape: true});