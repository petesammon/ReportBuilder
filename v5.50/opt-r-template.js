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
window.outputTemplateString = `<!--button:mHeader--><!--@mHeader-->US Trans-Thoracic Echocardiogram:
{{pHeader}}<!--/@mHeader-->

<!--button:mStudy--><!--@pMachine-->Performed on: {{pMachine}}<!--/@pMachine-->
<!--@Operator1-->Operator: {{Operator1}}<!--/@Operator1-->
<!--@pQuality-->Technical Quality: {{pQuality}}<!--/@pQuality-->
<!--@pRhythm-->ECG: {{pRhythm}}, {{HR}}<!--/@pRhythm-->
<!--@pDemo-->{{pDemo}}<!--/@pDemo-->

<!--button:mLV--><!--@mLV-->Left Ventricle:<!--/@mLV-->
<!--if:pRWMA-->{{pRWMA}}<!--/if-->
<!--if:pLVComments-->{{pLVComments}}<!--/if-->
{{pLVSF}}
{{pLVH}}
{{pLVD}}
{{pDiastology}}{{pLAP}}

<!--button:mLVMeasurements-->{{pLVMeasurements}}
{{pLVEF}}

<!--button:mMV--><!--@mMV-->Mitral Valve:<!--/@mMV-->
{{pMV}} {{pMS}} {{pMR}}
<!--if:pMVMeasurements-->{{pMVMeasurements}}<!--/if-->

<!--button:mLA--><!--@mLA-->Left Atrium:<!--/@mLA-->
{{pLA}} <!--@LAESV-->LA volume (Biplane) = {{LAESV}}, Indexed = {{LAESVInd}} (Normal = <34ml/m2, Borderline dilated = 34-38ml/m2, Dilated = >38ml/m2)<!--/@LAESV-->

<!--button:mAV--><!--@mAV-->Aortic Valve:<!--/@mAV-->
{{pAV}} {{pAS}} {{pAR}}
{{pAVMeasurements}}

<!--button:mAo--><!--@mAo-->Aorta:<!--/@mAo-->
{{pAorta}}
<!--@pAoMeasurements-->(Measured leading edge to leading edge, at end diastole as per departmental protocol)
{{pAoMeasurements}}<!--/@pAoMeasurements-->
{{pCoarc}}

<!--button:mRV--><!--@mRV-->Right Ventricle:<!--/@mRV-->
{{pRVF}}
{{pRVD}} {{pRVH}}
{{pRVMeasurements}}

<!--button:mRA--><!--@mRA-->Right atrium:<!--/@mRA-->
{{pRA}} <!--@RAA-->RA area = {{RAA}}, Indexed = {{RAAI}}<!--/@RAA-->

<!--button:mTV--><!--@mTV-->Tricuspid Valve:<!--/@mTV-->
{{pTV}} {{pTS}} {{pTR}}
<!--if:pTVMeasurements-->{{pTVMeasurements}}<!--/if-->
{{pRVtoRA}}

<!--button:mPV--><!--@mPV-->Pulmonary Valve:<!--/@mPV-->
{{pPV}} {{pPS}} {{pPR}}
{{pPVMeasurements}}
<!--@PAT-->PV AccT = {{PAT}}. {{PVN}}<!--/@PAT-->

<!--button:mMisc--><!--@mMisc-->Miscellaneous:<!--/@mMisc-->
<!--@pIVCD-->IVC is {{pIVCD}}<!--/@pIVCD-->
<!--@pPASP-->Pulmonary artery systolic pressure {{pPASP}}.<!--/@pPASP-->
{{pPPHT}}
{{pASD}}
<!--if:pPlEff-->{{pPlEff}}<!--/if-->
{{pPEff}}

<!--button:mPeffFull--><!--@mPeffFull-->Pericardial Effusion:<!--/@mPeffFull-->
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

<!--button:Summary-->{{Summary}}`;

window.outputTemplate = Handlebars.compile(window.outputTemplateString, {noEscape: true});