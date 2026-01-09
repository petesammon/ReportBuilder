window.outputTemplateString = `<!--button:mDiastology-->US Trans-Thoracic Echocardiogram:
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
{{pLVH}} {{pLVG}}
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
{{pSeptMotion}}
{{pRVCollapse}}
{{pRACollapse}}
{{pEffIVC}}

{{pEffVariaton}}
{{pEffInflow}}

<!--button:Summary-->Summary:
{{Summary}}`;

window.outputTemplate = Handlebars.compile(window.outputTemplateString, {noEscape: true});