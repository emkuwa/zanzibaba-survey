# LARIS Career Assistant — release checklist

This standalone page is available at `/careers/laris/` after deployment of this branch. It does not replace the existing survey homepage.

## Implemented
- Free Swahili introduction and five job categories.
- Beginner lessons, short quiz and interview guidance.
- Client-side CV/application-letter draft and browser print-to-PDF.
- Optional profile download/import as a local JSON file.
- Email compose link (does not submit an application).
- No mandatory login, email, experience or education for learning.

## Before public release
1. Test in Chrome, Safari, Android Chrome and iOS Safari: quiz, CV generation, print/PDF, JSON export/import and email link.
2. Confirm vacancy details, deadline and destination email with IGN FI.
3. Confirm Zanzibaba is permitted to publish this assistance and use the opportunity details.
4. Obtain written approval from IGN FI before implementing any assisted application email submissions.
5. Review accessible Swahili language, keyboard navigation and mobile responsiveness.
6. Do not claim a server-side applicant profile or email submission is working; neither is implemented.

## Privacy
The page currently makes no backend calls to store applicant data. The browser print and JSON export are local. Downloaded JSON files contain personal information and must be kept private. Never commit applicant files to the repository.

## Future optional accounts
Implement separate applicant authentication and row-level protected storage, consent, deletion/export and secure file upload only after choosing a dedicated backend and testing it. Do not reuse unrelated production databases without scoping and authorization.
