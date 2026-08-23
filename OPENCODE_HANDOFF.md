# OpenCode Handoff — survey.zanzibaba.com

Last updated: 2026-08-23

## Project
- Live site: https://survey.zanzibaba.com/
- Repository: `emkuwa/zanzibaba-survey`
- Production branch: `main`
- Vercel project: `zanzibaba-survey`

## User instruction
Continue autonomously. Do not ask for confirmation at every step. Make safe changes through completion, verify them, and report a consolidated summary at the end. Interrupt only for a genuine business decision or fact that cannot safely be inferred.

## Objective
Increase qualified surveying enquiries from Google and improve credibility/conversion without inventing credentials, projects, reviews, regulatory claims, turnaround times, prices or guarantees.

## Search Console findings (2026-08-23)
- Property is connected: `https://survey.zanzibaba.com/`.
- Sitemap currently contains 24 URLs.
- GSC sitemap performance showed 10/24 URLs with search impressions in the recent reporting window.
- Early strong positions included homepage ~4, engineering survey ~3, cadastral survey ~4.3, building-permit survey article ~8.3, title-deeds guide ~9.7. `topographical survey cost` triggered the cost article at position 2 on one impression.
- Commercial pages such as topographical, boundary, plot subdivision, construction setting out and drone had little/no impressions at the time checked.
- Strategy: strengthen internal links from informational pages already receiving impressions into commercial service pages; do not mass-produce thin articles.

## Technical/indexing findings
- Live domain returns HTTP 200 and Vercel production deployment was READY when checked.
- robots/indexing are allowed and sitemap exists.
- Google has indexed some pages; indexing is still developing.
- IndexNow is not configured (API key missing).
- GA4 is not connected to this GSC property, so visitor-to-lead conversion measurement is currently weak.
- Bing Webmaster Tools was not configured when checked.

## Work completed
1. Audited homepage and key commercial pages. Current commercial pages generally use canonical `survey.zanzibaba.com`, index/follow, WhatsApp CTAs and cautious project-specific wording.
2. Confirmed no repo search matches at the time checked for obvious claims such as `years experience`, `projects completed`, `guaranteed`, `licensed`.
3. Cost article already links strongly to Topographical, Boundary, Plot Subdivision, Construction Setting Out and Engineering pages.
4. Title-deeds guide already links to Boundary, Cadastral, Topographical and Construction Setting Out pages and contains appropriate legal caution.
5. Found legacy `blog/construction-setting-out-explained.html` using `www.zanzibabasurvey.co.tz` in canonical, OpenGraph and structured data while the live authority is `survey.zanzibaba.com`. It also contained an unsupported generic TZS 200,000–800,000 price range and several broad compliance/accuracy claims.
6. Rebuilt that article on 2026-08-23 with:
   - canonical/OpenGraph/schema on `survey.zanzibaba.com`;
   - project-specific quote wording instead of generic price range;
   - direct commercial links to `construction-setting-out-zanzibar.html`, engineering and topographical services;
   - WhatsApp CTA requesting site pin, drawings, construction stage and required points/levels;
   - cautious wording that scope/checks/deliverables are agreed per assignment.
   - Commit: `1c63dd82d0c78eefe8622a4aa5efde3b8537758a`.

## Next work
1. Inspect all remaining sitemap HTML pages for legacy canonical/schema/OpenGraph references to `zanzibabasurvey.co.tz` or other old domains. GitHub code search may miss HTML content, so inspect likely legacy files directly if needed.
2. Remove unsupported generic price ranges, guaranteed accuracy/turnaround, licensing/regulatory assertions, fake testimonials, placeholder social links and invented business-scale claims if found.
3. Strengthen contextual internal links from educational/blog pages with impressions to the most relevant commercial service page; avoid spammy repeated exact-match anchors.
4. Check commercial service pages for consistent WhatsApp lead prompts: site pin/location + approximate area + project purpose + drawings/documents where relevant.
5. Verify canonical, robots, sitemap, schema and key pages on live Vercel deployment after commits.
6. Re-inspect priority URLs in GSC after deployment/indexing delay. Do not interpret sitemap indexed count alone as actual URL index status.
7. If tooling/credentials become available, configure GA4 conversion measurement and IndexNow/Bing; do not invent IDs/keys.

## Safety/content rules
- Do not state that Zanzibaba itself is licensed/registered as a surveyor unless documentary evidence is available. Safe wording: survey work is arranged with qualified surveying professionals according to assignment requirements.
- Do not invent legal requirements, setback distances, permit rules or government procedures; recommend confirming current requirements with relevant Zanzibar authorities/professionals.
- Do not publish fixed survey prices without a confirmed business price list. Prefer project-specific quotation based on location, area, scope, site conditions and deliverables.
- Do not fabricate reviews, client names, project counts, equipment ownership, years of experience, response times or guarantees.

## Continuation instruction
Read this file first, inspect latest commits/current live deployment, continue the checklist autonomously, and update this handoff after every meaningful change or verification result so work can resume without chat history.
