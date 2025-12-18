window.outputTemplate = Handlebars.compile(
`TTE Findings: The report is compiled in accordance to a locally agreed combination of BSE Guidelines 2020 and EACVI guidelines 2016. Unless specified in the report conclusion, it is the sole responsibility of the referring physician to act upon the findings of this study. In specific cases where delay may result in patient harm, sonographers will refer for urgent clinical support.

Performed on: {{Machine}}
Operator: {{Operator}}
Technical Quality: {{TechnicalQualilty}}
ECG: {{Rhythm}}, {{HR}}
Height: {{Height}}, Weight: {{Weight}}, BSA: {{BSA}}
BP: {{BP}}

Left Ventricle:
{{#if RWMAs ~}}{{RWMAs}}
{{/if~}}
{{LVSF}}.
{{LVH}}.
{{LVD}}.
{{Diastology}}{{LAP}}

IVS = {{IVSd}}, PWd = {{LVPWd}}, LVIDd = {{LVIDd}}, LVIDs = {{LVIDs}}
E/A ratio = {{EARatio}}, E DecT = {{EDecT}}, Peak E velocity = {{EVel}}, Peak A velocity = {{AVel}}
Septal E prime = {{EPrimeSept}}, Lateral E prime = {{EPrimeLat}}, E/E prime (averaged) = {{EEPrimeAv}}
Septal S prime = {{SPrimeSept}}, Lateral S prime = {{SPrimeLat}}
Simpsons Biplane LVEF = {{EFBP}}, Auto EF = {{EFAuto}}
Global Averaged Longitudinal Strain = {{GLS}}
{{#if LVMeas ~}}{{LVMeas}}
{{/if}}

Mitral Valve:
{{MV}}
{{MS}}
{{MR}}
{{#if MVMeas ~}}{{MVMeas}}
{{/if}}

Left Atrium:
{{LA}}
LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}}
(Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)

Aortic Valve:
{{AV}}
{{AS}}
{{AR}}
AV Vmax = {{AVVmax}}
{{#if AVMeas ~}}{{AVMeas}}
{{/if}}

Aorta:
{{Aorta}}
(Measured leading edge to leading edge, at end diastole as per departmental protocol)
Sinus of Valsalva = {{SoV}}, Indexed to height = {{SoVI}} (Normal range, male: 14.8-23.2mm/m)
Sinotubular Junction = {{StJ}}, Indexed to height = {{StJI}} (Normal range, male: 12.6-19.8mm/m) 
Ascending aorta = {{Ao}}, Indexed to height = {{AoI}} (Normal range, male: 12.6-21.4mm/m) 
{{Coarc}}

Right Ventricle:
{{RVFl}} {{RVFr}}
{{RVD}}
{{RVH}}
TAPSE = {{TAPSE}}, S prime = {{RVS}}
RVD1 = {{RVD1}}
{{#if RVMeas ~}}{{RVMeas}}
{{/if}}

Right atrium:
{{RA}}
RA area = {{RAA}}, Indexed = {{RAAI}}

Tricuspid Valve:
{{TV}}
{{TS}}
{{TR}}
TR Vmax = {{TRVmax}}, TR MaxPG = {{TRMaxPG}}
{{#if TVMeas ~}}{{TVMeas}}
{{/if}}

Pulmonary Valve:
{{PV}}
{{PS}}
{{PR}} 
PV Vmax = {{PVVMax}}
PV AccT = {{PAT}}. {{PVN}}
{{#if PVMeas ~}}{{PVMeas}}
{{/if}}

Miscellaneous:
IVC is {{IVCD}} \({{IVC}}\) with {{IVCC}} collapse on inspiration estimating RA pressure at {{RAP}}mmHg. 
Pulmonary artery systolic pressure {{PASPe}}{{PASP}}.
{{PPHT}}
{{ASD}}
{{PEff}}
{{#if PlEff ~}}{{PlEff}}
{{/if}}

Summary:
{{Summary}}

`, {noEscape: true});