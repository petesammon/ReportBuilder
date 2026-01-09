// Main output template - EchoTools v5.1 format
// 
// MARKERS:
// - <!--button:mX-->  : Button placement only (no end marker needed)
// - <!--@VarName-->...<!--/@VarName--> : Field markers link fixed text to variable
//
// EXCLUSION RULES:
// - Variables from excluded modals are cleared (looked up from config)
// - Modal key itself is in excluded set, so <!--@mLV-->Heading<!--/@mLV--> hides heading
// - Field markers hide entire field when their variable is excluded
// - Whitespace from removed content is automatically collapsed
//
// USAGE TIPS:
// - Wrap modal headings: <!--@mLV-->Left Ventricle:<!--/@mLV-->
// - Wrap fixed text with variable: <!--@Operator1-->Operator: {{Operator1}}<!--/@Operator1-->
// - Variables without fixed text don't need markers - they'll be cleared and whitespace collapsed
// 
// <!--button:mLV-->
// <!--button:mLVMeasurements-->
// <!--button:mMV-->
// <!--button:mLA-->
// <!--button:mAV-->
// <!--button:mAo-->
// <!--button:mRV-->
// <!--button:mRA-->
// <!--button:mTV-->
// <!--button:mPV-->
// <!--button:mMisc-->
// 
// 
//
window.outputTemplateString = `US Trans-Thoracic Echocardiogram:
{{pHeader}}

<!--button:mStudy-->Performed on: {{pMachine}}
Operator: {{Operator1}}
Technical Quality: {{pQuality}}
ECG: {{pRhythm}}, {{HR}}
{{pDemo}}

<!--button:mLV-->Left Ventricle:
<!--if:pRWMA-->{{pRWMA}}<!--/if-->
<!--if:pLVComments-->{{pLVComments}}<!--/if-->
{{pLVSF}}
{{pLVH}}
{{pLVD}}
{{pDiastology}}

<!--button:mLVMeasurements-->{{pLVMeasurements}}
{{pLVEF}}

<!--button:mMV-->Mitral Valve:
{{pMV}} {{pMS}} {{pMR}}
<!--if:pMVMeasurements-->{{pMVMeasurements}}<!--/if-->

<!--button:mLA-->Left Atrium:
{{pLA}} LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}} (Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)

<!--button:mAV-->Aortic Valve:
{{pAV}} {{pAS}} {{pAR}}
{{pAVMeasurements}}

<!--button:mAo-->Aorta:
{{pAorta}}
(Measured leading edge to leading edge, at end diastole as per departmental protocol)
{{pAoMeasurements}}
{{pCoarc}}

<!--button:mRV-->Right Ventricle:
{{pRVF}}
{{pRVD}} {{pRVH}}
{{pRVMeasurements}}

<!--button:mRA-->Right atrium:
{{pRA}} RA area = {{RAA}}, Indexed = {{RAAI}}

<!--button:mTV-->Tricuspid Valve:
{{pTV}} {{pTS}} {{pTR}}
<!--if:pTVMeasurements-->{{pTVMeasurements}}<!--/if-->
{{pRVtoRA}}

<!--button:mPV-->Pulmonary Valve:
{{pPV}} {{pPS}} {{pPR}}
{{pPVMeasurements}}
PV AccT = {{PAT}}. {{pPVN}}

<!--button:mMisc-->Miscellaneous:
IVC is {{pIVCD}}
Pulmonary artery systolic pressure {{pPASP}}.
{{pPPHT}}
{{pASD}}
<!--if:pPlEff-->{{pPlEff}}<!--/if-->
{{pPEff}}

<!--button:mPeffFull-->Pericardial Effusion:
{{pEffSize}}
{{pEffOther}}

{{pEffMeasures}}

{{pEffCompromise}}
{{pEffSeptMotion}}
{{pEffRVCollapse}}
{{pEffRACollapse}}
{{pEffIVC}}

{{pEffVariaton}}
{{pEffInflow}}

<!--button:Summary-->Summary:
{{Summary}}`;

window.outputTemplate = Handlebars.compile(window.outputTemplateString, {noEscape: true});