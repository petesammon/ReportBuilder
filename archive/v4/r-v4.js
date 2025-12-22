window.outputTemplate = Handlebars.compile(
`TTE Findings: The report is compiled in accordance to a locally agreed combination of BSE Guidelines 2020 and EACVI guidelines 2016. Unless specified in the report conclusion, it is the sole responsibility of the referring physician to act upon the findings of this study. In specific cases where delay may result in patient harm, sonographers will refer for urgent clinical support.

{{LVSection}}

Summary:
{{Summary}}

`, {noEscape: true});