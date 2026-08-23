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
- Sitemap contains 24 URLs.
- GSC sitemap performance showed 10/24 URLs with search impressions in the recent reporting window.
- Early strong positions included homepage ~4, engineering survey ~3, cadastral survey ~4.3, building-permit survey article ~8.3, title-deeds guide ~9.7. `topographical survey cost` triggered the cost article at position 2 on one impression.
- Strategy remains: strengthen relevant internal links into commercial service pages; do not mass-produce thin articles.

## Technical/indexing findings
- Live domain returns HTTP 200 and Vercel production is READY.
- robots/indexing are allowed and sitemap exists.
- Fresh GSC inspection on 2026-08-23 confirmed PASS / Submitted and indexed for: plot subdivision, engineering survey, drone survey, cadastral survey, GIS services, boundary survey, construction setting out, cost article, and the rebuilt construction-setting-out article.
- Topographical survey remains not indexed (`URL is unknown to Google` / previously `Discovered - currently not indexed`) and has not yet been crawled.
- Hydrographic survey is `Discovered - currently not indexed` and has not yet been crawled.
- These two are discovery/indexing issues, not robots blocks according to current evidence. Keep them in sitemap and strengthen natural internal discovery; do not create duplicate doorway pages.
- IndexNow is not configured (API key missing).
- GA4 is not connected to this GSC property, so visitor-to-lead conversion measurement is currently weak.
- Bing Webmaster Tools was not configured when checked.

## Work completed
1. Audited homepage and key commercial pages. Current commercial pages generally use canonical `survey.zanzibaba.com`, index/follow, WhatsApp CTAs and cautious project-specific wording.
2. Confirmed no current repo search matches for old domain `zanzibabasurvey.co.tz`, `280+`, `98%`, `24 hours`, or fixed `TZS` pricing strings after cleanup.
3. Cost article links to Topographical, Boundary, Plot Subdivision, Construction Setting Out and Engineering pages.
4. Title-deeds guide links to Boundary, Cadastral, Topographical and Construction Setting Out pages and contains appropriate legal caution.
5. Rebuilt legacy `blog/construction-setting-out-explained.html` with canonical/OpenGraph/schema on `survey.zanzibaba.com`, project-specific quote wording, commercial internal links and a qualified WhatsApp prompt. Commit `1c63dd82d0c78eefe8622a4aa5efde3b8537758a`.
6. Verified the rebuilt setting-out article live: HTTP 200; canonical is `https://survey.zanzibaba.com/blog/construction-setting-out-explained.html`; Article schema uses the current survey domain; CTA requests site/project information. GSC currently reports this URL PASS / Submitted and indexed (Google's last crawl predates the latest rebuild, so recrawl still needs time).
7. Latest Vercel production deployment checked after the fixes: READY. Latest production commits include `Fix setting out article canonical and commercial links` followed by this handoff update.

## Remaining work / monitoring
1. Allow Google time to recrawl the changed pages. Re-inspect topographical and hydrographic later; they are the main commercial indexing gaps found in the latest inspection.
2. Continue strengthening contextual links to Topographical from cost/land/design-related pages and to Hydrographic only from genuinely relevant coastal/marine content; avoid sitewide spam anchors.
3. Monitor Search Console impressions/clicks. Do not rewrite pages merely because early data volume is tiny.
4. Configure GA4 conversion measurement when a valid GA4 property/measurement ID is available. Track WhatsApp clicks and enquiry/form submissions as conversions.
5. Configure IndexNow/Bing only when valid credentials/keys are available.

## Safety/content rules
- Do not state that Zanzibaba itself is licensed/registered as a surveyor unless documentary evidence is available. Safe wording: survey work is arranged with qualified surveying professionals according to assignment requirements.
- Do not invent legal requirements, setback distances, permit rules or government procedures; recommend confirming current requirements with relevant Zanzibar authorities/professionals.
- Do not publish fixed survey prices without a confirmed business price list. Prefer project-specific quotation based on location, area, scope, site conditions and deliverables.
- Do not fabricate reviews, client names, project counts, equipment ownership, years of experience, response times or guarantees.

## Continuation instruction
Read this file first, inspect latest commits/current live deployment, continue the remaining monitoring/fixes autonomously, and update this handoff after every meaningful change or verification result so work can resume without chat history.
