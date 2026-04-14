import asyncio
import urllib.parse
from typing import AsyncGenerator

from openai import AsyncOpenAI
from app.core.config import settings
from app.modules.browser.service import browser_service
import json
import re

PLATFORM_SEARCH_CONFIG = {
    "linkedin": {
        "search_url": lambda q, loc, page=1: (
            f"https://www.linkedin.com/jobs/search/"
            f"?keywords={urllib.parse.quote_plus(q)}"
            f"&location={urllib.parse.quote_plus(loc)}"
            f"&f_TPR=r86400"
            f"&start={25 * (page - 1)}"
        ),
        "job_card_selectors": [
            "li[data-occludable-job-id]",
            "li.jobs-search-results__list-item",
            "div.job-search-card",
            "div[data-job-id]",
            ".scaffold-layout__list-item",
        ],
        "wait_selector": "li[data-occludable-job-id], li.jobs-search-results__list-item, div.job-search-card",
        "title_selector": "a.job-card-list__title--link, a.job-card-list__title, h3.base-search-card__title a",
        "company_selector": ".job-card-container__primary-description, .base-search-card__subtitle, .job-card-container__company-name",
        "location_selector": ".job-card-container__metadata-item, .job-search-card__location, .base-search-card__metadata",
    },
    "indeed": {
        "search_url": lambda q, loc, page=1: (
            f"https://in.indeed.com/jobs"
            f"?q={urllib.parse.quote_plus(q)}"
            f"&l={urllib.parse.quote_plus(loc)}"
            f"&fromage=1"
            f"&start={10 * (page - 1)}"
        ),
        "job_card_selectors": ["div.cardOutline", "div.job_seen_beacon", "td.resultContent"],
        "wait_selector": "div.cardOutline, div.job_seen_beacon, td.resultContent",
        "title_selector": "h2.jobTitle a, a.jcs-JobTitle",
        "company_selector": "[data-testid='company-name'], .companyName, .css-1h4s93d",
        "location_selector": "[data-testid='text-location'], .companyLocation, .css-1p99vba",
    },
    "foundit": {
        "search_url": lambda q, loc, yox=1, page=1: (
            f"https://www.foundit.in/srp/results"
            f"?query={urllib.parse.quote_plus(q)}"
            f"&locations={urllib.parse.quote_plus(loc)}"
            f"&experienceRanges={yox}%7E{yox}"
            f"&experience={yox}"
            f"&jobFreshness=3"
            f"&sort=1"
            f"&start={15 * (page - 1)}"
        ),
        "job_card_selectors": ["div.cardContainer", "div.srpCard", "div.job-apply-card"],
        "wait_selector": "div.cardContainer, div.srpCard",
        "title_selector": ".jobTitle, #jobCardTitle, .title",
        "company_selector": ".companyName, .companyName p, .company",
        "location_selector": ".location, .details.location",
        "posted_selector": ".timeText"
    },
    "naukri": {
        "search_url": lambda q, loc, yox=0, page=1: (
            f"https://www.naukri.com/"
            f"{q.lower().replace(' ', '-').replace('.', '-dot-')}"
            f"-jobs-in-{loc.lower().replace(' ', '-')}-{page}"
            f"?k={urllib.parse.quote(q)}"
            f"&l={urllib.parse.quote(loc)}"
            f"&experience={yox}"
            f"&qproductJobSource=2"
            f"&naukriCampus=true"
        ),
        "job_card_selectors": [".srp-jobtuple-wrapper", "article.jobTuple"],
        "wait_selector": ".srp-jobtuple-wrapper, article.jobTuple",
        "title_selector": "a.title",
        "company_selector": "a.comp-name",
        "location_selector": ".locWdth",
        "description_selector": ".job-desc",
        "tags_selector": ".tag-li",
        "posted_selector": "[class*='job-post-day']"
    },
    "glassdoor": {
        "search_url": lambda q, loc, page=1: (
            f"https://www.glassdoor.co.in/Job/jobs.htm"
            f"?sc.keyword={urllib.parse.quote_plus(q)}"
            f"&locT=C&locId={urllib.parse.quote_plus(loc)}"
        ),
        "job_card_selectors": ["li[data-test='jobListing']", ".JobCard_jobCardWrapper__"],
        "wait_selector": "li[data-test='jobListing']",
        "title_selector": "[data-test='job-title'], .job-title",
        "company_selector": "[data-test='employer-short-name'], .employer-name",
        "location_selector": "[data-test='location'], .location",
    },
    "ambitionbox": {
        "search_url": lambda q, loc, page=1: (
            f"https://www.ambitionbox.com/jobs/search"
            f"?tag={urllib.parse.quote_plus(q)}"
            f"&location={urllib.parse.quote_plus(loc)}"
        ),
        "job_card_selectors": ["div.job-card"],
        "wait_selector": "div.job-card",
        "title_selector": "a.title",
        "company_selector": "p.companyLogo",
        "location_selector": ".job-info-list",
    },
    "google": {
        "search_url": lambda q, loc, page=1: (
            f"https://www.google.com/search?q={urllib.parse.quote_plus(q)}+jobs+in+{urllib.parse.quote_plus(loc)}"
            f"&ibp=htl;jobs"
        ),
        "job_card_selectors": ["li.gdEP7b", "div.iS779e", "div[role='treeitem']"],
        "wait_selector": "li.gdEP7b, div.iS779e, div[role='treeitem']",
        "title_selector": "div.BjS79b, div.vNEEBe, .vNEEBe",
        "company_selector": "div.vNHEBe, div.vNHEBe",
        "location_selector": "div.QY9Zdb, .QY9Zdb",
    },
}


class JobScoutService:
    def __init__(self):
        self.nim_client = AsyncOpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NVIDIA_API_KEY
        ) if settings.NVIDIA_API_KEY else None

    async def _extract_card_data_linkedin(self, card) -> dict:
        try:
            data = await card.evaluate("""(el) => {
                // Multiple title selectors to handle different LinkedIn experiments
                const titleEl = el.querySelector(
                    'a.job-card-list__title--link > span[aria-hidden="true"], ' +
                    'a.job-card-list__title > span[aria-hidden="true"], ' +
                    'h3.base-search-card__title, ' +
                    '.full-width.artdeco-entity-lockup__title, ' +
                    'a.job-card-list__title--link'
                );
                
                let title = titleEl ? titleEl.innerText.trim() : '';
                if (title) {
                    // Deduplicate repetitive titles like "Software Engineer Software Engineer"
                    const words = title.split(/\\s+/);
                    if (words.length >= 2 && words.length % 2 === 0) {
                        const half = words.length / 2;
                        if (words.slice(0, half).join(' ') === words.slice(half).join(' ')) {
                            title = words.slice(0, half).join(' ');
                        }
                    }
                }

                const linkEl = el.querySelector('a.job-card-list__title--link, a.job-card-list__title, h3.base-search-card__title a, .base-card__full-link');
                const href = linkEl ? linkEl.getAttribute('href') : '';

                const companyEl = el.querySelector(
                    '.job-card-container__primary-description, ' +
                    '.job-card-container__company-name, ' +
                    '.base-search-card__subtitle, ' +
                    '.artdeco-entity-lockup__subtitle'
                );
                const company = companyEl ? companyEl.innerText.replace(/\\n/g, '').trim() : '';

                const locationEl = el.querySelector(
                    '.job-card-container__metadata-item, ' +
                    '.job-card-container__metadata-wrapper, ' +
                    '.job-search-card__location, ' +
                    '.artdeco-entity-lockup__metadata, ' +
                    '.job-card-container__company-name + span'
                );
                let location = locationEl ? locationEl.innerText.trim() : '';
                
                // TACTICAL: Clean up "Location (Remote)" or "Location (On-site)"
                if (location.includes('\\n')) location = location.split('\\n')[0].trim();

                const jobId = el.getAttribute('data-occludable-job-id') || el.getAttribute('data-job-id') || '';

                return { title, href, company, location, jobId };
            }""")
            return data
        except Exception:
            return {"title": "", "href": "", "company": "", "location": "", "jobId": ""}

    async def _extract_card_data_generic(self, card, config, location_default: str) -> dict:
        try:
            title_el = None
            for tsel in (config.get("title_selector") or "").split(", "):
                title_el = await card.query_selector(tsel.strip())
                if title_el: break
            
            company_el = None
            for csel in (config.get("company_selector") or "").split(", "):
                company_el = await card.query_selector(csel.strip())
                if company_el: break

            location_el = None
            for lsel in (config.get("location_selector") or "").split(", "):
                location_el = await card.query_selector(lsel.strip())
                if location_el: break

            title = (await title_el.inner_text() if title_el else "").strip()
            company = (await company_el.inner_text() if company_el else "").strip()
            loc = (await location_el.inner_text() if location_el else location_default).strip()
            link = await title_el.get_attribute("href") if title_el else ""

            # TACTICAL: Extract secondary skills/tags for better AI matching
            tags = []
            if config.get("tags_selector"):
                tag_elements = await card.query_selector_all(config["tags_selector"])
                for t_el in tag_elements:
                    tags.append((await t_el.inner_text()).strip())
            
            # EXTRACT: Job snippet/description from card if available
            desc_snippet = ""
            if config.get("description_selector"):
                desc_el = await card.query_selector(config["description_selector"])
                if desc_el:
                    desc_snippet = (await desc_el.inner_text()).strip()

            # EXTRACT: Freshness Signal (Temporal context)
            posted_at = ""
            if config.get("posted_selector"):
                posted_el = await card.query_selector(config["posted_selector"])
                if posted_el:
                    posted_at = (await posted_el.inner_text()).strip()

            return {
                "title": title, 
                "company": company, 
                "location": loc, 
                "href": link,
                "tags": ", ".join(tags) if tags else "",
                "description": desc_snippet,
                "posted_at": posted_at
            }
        except Exception:
            return {"title": "", "company": "", "location": "", "href": "", "posted_at": ""}

    async def _get_job_detail_via_panel(self, page, card, job_id: str, timeout: int = 8000) -> dict:
        try:
            # TACTICAL: Clear the panel content pool to prevent "Intelligence Ghosting" (stale data)
            await page.evaluate("""() => {
                const hubs = [
                    '#job-details', '.jobs-description-content__text', '.jobs-description__content', 
                    '.jobs-box__html-content', '.jobDescriptionNew', '#jdSection', 
                    '.job-view-layout', '#jobDescriptionText'
                ];
                hubs.forEach(s => {
                    const el = document.querySelector(s);
                    if (el) el.innerHTML = '<div id="d-loading-blueprint">NEURAL_HYDRATION_ACTIVE</div>';
                });
            }""")

            await self._visual_pulse_on_element(card, "click")
            await card.click(force=True)
            
            # LinkedIn and Foundit JD side-panels
            panel_selectors = ".jobs-description__content, .jobs-box__html-content, #jdSection, .jobDescriptionNew, .job-view-layout, .job-details-jobs-unified-top-card__primary-description-container, #jobDescriptionText"
            await page.wait_for_selector(panel_selectors, timeout=timeout)
            
            # HYDRATION PULSE: Wait until the loading placeholder is replaced by actual career data
            await page.wait_for_function(f"""(sel) => {{
                const el = document.querySelector(sel);
                return el && el.innerText.length > 50 && !el.innerText.includes('NEURAL_HYDRATION_ACTIVE');
            }}""", panel_selectors, timeout=timeout)
            
            await asyncio.sleep(0.5) # Final stability grace period
            
            intel = await page.evaluate("""() => {
                // 1. Description Drill (Multi-Platform Signature Ingest)
                const panel = document.querySelector('#jobDescriptionText') || 
                              document.querySelector('#job-details') || 
                              document.querySelector('.jobs-description-content__text') ||
                              document.querySelector('.jobs-description__content') || 
                              document.querySelector('.jobs-box__html-content') || 
                              document.querySelector('.jobDescriptionNew') || 
                              document.querySelector('#jdSection') || 
                              document.querySelector('.yS4Xce') || // Google Side Panel
                              document.querySelector('.vL0S7c') || // Google Secondary Side Panel
                              document.querySelector('.job-view-layout');
                const description = panel ? panel.innerText.trim() : '';

                // 2. Mission-Critical Meta Ingest (LinkedIn Specific)
                const metaContainer = document.querySelector('.job-details-jobs-unified-top-card__tertiary-description-container') ||
                                     document.querySelector('.job-details-jobs-unified-top-card__primary-description-container');
                
                let enrichedLocation = '';
                if (metaContainer) {
                    const textNodes = Array.from(metaContainer.querySelectorAll('span')).map(s => s.innerText.trim());
                    // Find first non-empty, non-relative-time node
                    enrichedLocation = textNodes.find(t => t.length > 2 && !t.includes('ago') && !t.includes('apply')) || '';
                }

                // 3. Work Mode Identification (Remote/On-site/Hybrid)
                const preferences = document.querySelectorAll('.job-details-fit-level-preferences button, .job-details-jobs-unified-top-card__job-insight');
                let workType = '';
                preferences.forEach(p => {
                    const t = p.innerText.toUpperCase();
                    if (t.includes('REMOTE') || t.includes('ON-SITE') || t.includes('HYBRID')) {
                        workType = t;
                    }
                });

                return { description, location: enrichedLocation, workType };
            }""")
            
            return intel
        except Exception as e:
            print(f"⚠️ Detail panel ingest failed: {e}")
            return {"description": "", "location": "", "workType": ""}

    async def _close_common_popups(self, page):
        """Tactical suppression of overlays that block mission-critical clicks."""
        try:
            await page.evaluate("""() => {
                const selectors = [
                    'button[aria-label="close"]',
                    'button.icl-CloseButton',
                    '.icl-Modal-close',
                    '#mosaic-provider-jobcards-pwa-close',
                    '.jobsearch-HiringInsights-close',
                    '#popover-close-trigger'
                ];
                selectors.forEach(s => {
                    const el = document.querySelector(s);
                    if (el && typeof el.click === 'function') el.click();
                });
            }""")
        except: pass

    async def _inject_control_overlay(self, page):
        """Injected neural lockout layer: prevents user interference during mission."""
        try:
            await page.evaluate("""() => {
                if (document.getElementById('drafted-lockout')) return;
                
                const lockout = document.createElement('div');
                lockout.id = 'drafted-lockout';
                Object.assign(lockout.style, {
                    position: 'fixed', inset: '0', zIndex: '2147483640',
                    cursor: 'wait', background: 'rgba(0,0,0,0.01)', pointerEvents: 'auto'
                });
                
                const banner = document.createElement('div');
                banner.id = 'drafted-control-banner';
                banner.innerHTML = `
                    <div style="display:flex;align-items:center;gap:15px;padding:0 25px;">
                        <div style="width:10px;height:10px;background:#10b981;border-radius:50%;box-shadow:0 0 15px #10b981;animation:d-pulse 2s infinite;"></div>
                        <span style="font-weight:900;letter-spacing:3px;font-size:10px;text-transform:uppercase;color:#10b981;font-family:monospace;">Neural Mission Active : Interaction Locked</span>
                    </div>
                    <style>
                        @keyframes d-pulse { 0%,100% { opacity:0.3; transform: scale(1); } 50% { opacity:1; transform: scale(1.2); } }
                        @keyframes d-ripple { 
                            0% { transform: scale(0); opacity: 1; }
                            100% { transform: scale(3); opacity: 0; }
                        }
                        .d-scanned { 
                            outline: 3px solid #10b981 !important; 
                            outline-offset: -3px !important; 
                            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4) !important;
                            transition: all 0.5s ease-on !important;
                            position: relative !important;
                        }
                        .d-scanned::after {
                            content: 'NEURAL SCAN ACTIVE';
                            position: absolute; top: 0; right: 0; background: #10b981;
                            color: black; font-size: 8px; font-weight: 900; padding: 2px 6px;
                            z-index: 100; font-family: monospace;
                        }
                        .d-click-pulse {
                            position: absolute; border-radius: 50%;
                            background: rgba(16, 185, 129, 0.6);
                            border: 2px solid #10b981;
                            pointer-events: none; z-index: 1000000;
                            width: 50px; height: 50px; margin-left: -25px; margin-top: -25px;
                            animation: d-ripple 0.6s ease-out forwards;
                        }
                    </style>
                `;
                Object.assign(banner.style, {
                    position: 'fixed', top: '0', left: '0', right: '0', height: '32px',
                    background: 'rgba(0,0,0,0.95)', zIndex: '2147483647', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(15px)',
                    borderBottom: '2px solid #10b981', userSelect: 'none'
                });
                
                document.documentElement.appendChild(lockout);
                document.documentElement.appendChild(banner);
            }""")
        except: pass

    async def _visual_pulse_on_element(self, element, action_type="scan"):
        """Highlight an element on the screen to show AI focus."""
        try:
            if action_type == "scan":
                await element.evaluate("el => { el.classList.add('d-scanned'); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }")
            elif action_type == "click":
                # Get coordinates for the pulse
                box = await element.bounding_box()
                if box:
                    x, y = box['x'] + box['width']/2, box['y'] + box['height']/2
                    await element.evaluate(f"""el => {{
                        const pulse = document.createElement('div');
                        pulse.className = 'd-click-pulse';
                        pulse.style.left = '{x}px';
                        pulse.style.top = '{y}px';
                        document.body.appendChild(pulse);
                        setTimeout(() => pulse.remove(), 700);
                    }}""")
        except: pass

    async def _clear_visual_pulse(self, element):
        """Clean up the neural scan highlights."""
        try:
            await element.evaluate("el => el.classList.remove('d-scanned')")
        except: pass

    async def _get_job_detail_via_popup(self, context, page, card, platform: str) -> str:
        # TACTICAL: Finalize any ghost tabs before mission start
        for p in context.pages:
            if p != page:
                try: await p.close(run_before_unload=False)
                except: pass
            
        new_page = None
        try:
            # TACTICAL: Force click via JS evaluation to bypass Naukri's UI overlays
            # We use a non-blocking waiter to capture the new tab
            page_promise = context.wait_for_event("page", timeout=15000)
            
            await self._visual_pulse_on_element(card, "click")
            await card.evaluate('''(el) => {
                const link = el.querySelector('a.title, .job-title, h2 a');
                if (link) { link.scrollIntoView(); link.click(); }
                else { el.click(); }
            }''')
            
            new_page = await page_promise
            
            # RESOURCE SHIELD: Use internal try/finally for the page scope
            try:
                # SATURATION: Wait for full window load and technical hydration
                await new_page.wait_for_load_state("load", timeout=15000)
                await self._inject_control_overlay(new_page)
                await asyncio.sleep(2.0) # Industrial saturation grace period

                # TACTICAL DRILL: Handle Naukri's "Something went wrong" hydration failure
                error_check = await new_page.evaluate('() => document.body.innerText.includes("Something went wrong")')
                if error_check:
                    print(f"🔄 Platform instability detected (Oops!). Triggering tactical reload...")
                    await new_page.reload(wait_until="load")
                    await asyncio.sleep(3.0) 
                
                # Mission-Critical: Extract the full career blueprint
                desc = await new_page.evaluate("""() => {
                    const selectors = [
                        "[class*='job-desc-container']", 
                        "[class*='JDC__dang-inner-html']",
                        "[class*='key-skill']",
                        "section.styles_job-desc-container__txpYf"
                    ];
                    
                    let fullText = "";
                    const sections = document.querySelectorAll(selectors.join(","));
                    sections.forEach(s => { fullText += s.innerText + "\\n"; });
                    
                    if (fullText.trim().length > 100) return fullText.trim();
                    return document.body.innerText.trim().substring(0, 5000);
                }""")
                
                return desc[:15000] if desc else ""
            finally:
                if new_page:
                    await new_page.close(run_before_unload=False)
                    
        except Exception as e:
            print(f"⚠️ Popup mission failed for {platform}: {e}")
            return ""

    async def _score_job_with_ai(self, job_title: str, job_description: str, user_skills: str, target_role: str, summary: str = "", experience: str = "", years_of_exp: int = 0) -> dict:
        # Preparation for fallback
        def _get_keyword_score():
            skills_list = [s.strip().lower() for s in user_skills.split(",")]
            desc_lower = (job_title + " " + job_description).lower()
            matches = sum(1 for s in skills_list if s in desc_lower)
            score = min(100, int((matches / max(len(skills_list), 1)) * 100))
            
            return {"score": score, "reason": f"Heuristic: {matches} skills matched.", "skip": score < 40}

        if not self.nim_client:
            return _get_keyword_score()

        prompt = f"""
        [STRICT RECRUITMENT ANALYSIS - OUTPUT ONLY RAW JSON - NO MARKDOWN - NO CODE]
        
        Analyze the match between this Candidate and Job Lead.
        
        CANDIDATE PROFILE:
        - Target Role: {target_role}
        - Experience: {experience[:1000]}
        - Skills: {user_skills}
        - Total Experience: {years_of_exp} years.
        
        MISSION SPECIFICATIONS:
        - Job Title: {job_title}
        - Job Description: {job_description[:15000]}

        MISSION GUIDELINES:
        - BE SKEPTICAL: High scores (70%+) are reserved ONLY for surgical matches where both stack and seniority align.
        - PENALIZE GAPS: If a job mentions specific technologies (Angular, Vue, iOS, Android, Flutter) that are MISSING from the profile, the score MUST drop by at least 30 points.
        
        MATCH INVARIANTS:
        1. SENIORITY: If job requires > {years_of_exp} years of experience, score MUST be capped at 30%.
        2. UNSUPPORTED STACK: If the job requires highly specific frameworks NOT in the candidate's stack (e.g. Angular when candidate is React-only, or Mobile when candidate is Web-only), score MUST be capped at 50%.
        3. CORE ALIGNMENT: Required stack must match React or Node for scores > 70%.
        
        OUTPUT PROTOCOL:
        - Return ONLY a raw JSON object string.
        - DO NOT wrap in backticks (```json).
        - DO NOT return a javascript function or any code.
        - DO NOT include conversation or notes.
        
        {{
          "score": 0-100, 
          "reason": "Clear explanation", 
          "skip": true/false,
          "salary": "Range",
          "currency": "INR/USD",
          "tech_stack": ["tech found"]
        }}
        """
        try:
            # 12s timeout: Fast-fail if NVIDIA/AI signal is sluggish
            completion = await self.nim_client.chat.completions.create(
                model=settings.MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=1024,
                timeout=12.0
            )
            
            response_text = completion.choices[0].message.content
            if not response_text:
                raise ValueError("Payload missing from binary stream.")

            # TACTICAL: Surgical Isolation Hub
            # We locate the FIRST '{' and the LAST '}' to isolate the candidate object
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}')
            
            if start_idx == -1 or end_idx == -1:
                raise ValueError("No JSON object signature detected in stream.")
                
            clean_intel = response_text[start_idx:end_idx+1].strip()
            
            # STAGE 2: Protocol Alignment (Ultra-Resilient Multi-Pass Normalization)
            try:
                # Effort 1: Standard compliant JSON
                return json.loads(clean_intel)
            except json.JSONDecodeError:
                # Effort 2: Tactical Python Literal Evaluation (handles True, False, None)
                try:
                    import ast
                    # Map common JSON literals to Python for AST parsing
                    p_clean = clean_intel.replace('true', 'True').replace('false', 'False').replace('null', 'None')
                    # Strip any non-dict leading/trailing noise
                    t_match = re.search(r'(\{.*\})', p_clean, re.DOTALL)
                    t_str = t_match.group(1) if t_match else p_clean
                    return ast.literal_eval(t_str)
                except:
                    # Effort 3: Aggressive Regex-Based Reconstruction
                    repaired = clean_intel
                    # A: Quote unquoted keys (e.g., score: 85 -> "score": 85)
                    repaired = re.sub(r'([{,]\s*)([a-zA-Z0-9_\-]+)\s*:', r'\1"\2":', repaired)
                    # B: Standardize all quotes to double (safely handle escaped internal quotes)
                    repaired = re.sub(r"'([^']*)'", r'"\1"', repaired)
                    # C: Remove illegal trailing commas: { "key": "val", } -> { "key": "val" }
                    repaired = re.sub(r',\s*\}', '}', repaired)
                    # D: Strip invisible control characters
                    repaired = re.sub(r'[\x00-\x1F\x7F]', '', repaired)
                    
                    try:
                        return json.loads(repaired)
                    except:
                        # STAGE 3: Surgical Property Scan (Absolute Fail-Safe)
                        # If the JSON is structurally broken, we pull metrics via regex
                        metrics = {"score": 0, "reason": "Surgical fallback (Syntax error).", "skip": True, "tech_stack": []}
                        
                        # Extract Score (Handles both unquoted and quoted variations)
                        sc_match = re.search(r'score":?\s*(\d+)', repaired) or re.search(r'score:\s*(\d+)', repaired)
                        if sc_match: 
                            metrics["score"] = int(sc_match.group(1))
                            metrics["skip"] = metrics["score"] < 40
                            
                        # Extract Reason (Basic attempt)
                        re_match = re.search(r'reason":?\s*"([^"]+)"', repaired)
                        if re_match: metrics["reason"] = re_match.group(1)
                        
                        return metrics

        except Exception as e:
            msg = str(e)
            print(f"⚠️ Intelligence Logic Breach: {msg}")
            fallback = _get_keyword_score()
            fallback["reason"] = f"Cyber-Resilience Fallback ({msg})."
            return fallback

    async def _refine_search_directive(self, target_role: str, skills: str) -> str:
        """Use AI to distill a high-impact search query from the user's role and skills."""
        if not self.nim_client:
            # Fallback: Merge role and primary skills
            combined = f"{target_role} {skills}"
            clean = re.sub(r'[^\w\s]', '', combined)
            return " ".join(clean.split()[:8])

        prompt = f"""
        [JOB SEARCH QUERY OPTIMIZATION]
        Create a surgical job search query (keywords) for this candidate.
        
        ROLE: {target_role}
        SKILLS: {skills}

        GUIDELINES:
        - Combine the ROLE with ALL highly relevant technical skills from the provided list.
        - The goal is to create a comprehensive and surgical search query that covers the candidate's core stack.
        - DO NOT include location, experience years, or generic terms like "jobs".
        - Example Output: "Full Stack Web Developer NodeJS React Typescript MongoDB Expert".
        - Return ONLY the string. NO quotes. NO explanation.
        - Maximum length: 12 words.
        """
        try:
            completion = await self.nim_client.chat.completions.create(
                model=settings.MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=64,
                timeout=8.0
            )
            distilled = completion.choices[0].message.content.strip().strip('"').strip("'")
            # If AI returns empty or nonsense, fallback to truncation
            if len(distilled) < 3: raise ValueError("AI output too short.")
            return distilled
        except Exception as e:
            print(f"⚠️ Intent extraction failed: {e}")
            return " ".join(f"{target_role} {skills}".split()[:7])

    async def _ai_scan_for_career_links(self, page) -> list:
        """Use AI to identify high-value career portal links from the search result matrix."""
        try:
            # 1. Harvest candidates from the blue link matrix
            links_data = await page.evaluate("""() => {
                const results = [];
                // Target generic Google search result blocks
                const blocks = document.querySelectorAll('div.g, div.tF2Cxc, div.v7W49e');
                blocks.forEach(b => {
                    const title = b.querySelector('h3')?.innerText || '';
                    const link = b.querySelector('a')?.href || '';
                    const snippet = b.innerText.substring(0, 200);
                    if (link && !link.includes('google.com')) {
                        results.push({ title, link, snippet });
                    }
                });
                return results;
            }""")
            
            if not links_data: return []

            # 2. Use AI to prune noise (aggregators) and prioritize company portals
            if not self.nim_client: return [l["link"] for l in links_data[:5]]

            prompt = f"""
            [TACTICAL LINK ANALYSIS]
            Identify which of these Google search results are likely DIRECT COMPANY CAREER PAGES or SPECIFIC JOB POSTINGS.
            Prune generic job aggregators (LinkedIn, Indeed, Naukri, Monster, etc.) unless they are the direct source.
            
            RESULTS:
            {json.dumps(links_data[:15])}

            GUIDELINES:
            - Return ONLY a JSON array of the most promising URLs.
            - Cap results at top 6.
            """
            completion = await self.nim_client.chat.completions.create(
                model=settings.MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=512,
                timeout=10.0
            )
            raw = completion.choices[0].message.content.strip()
            # Surgical isolation of JSON array
            start, end = raw.find('['), raw.rfind(']')
            if start != -1 and end != -1:
                return json.loads(raw[start:end+1])
            return [l["link"] for l in links_data[:3]]
        except Exception as e:
            print(f"⚠️ Link matrix scan failed: {e}")
            return []

    async def run_search(self, user_id: int, user_email: str, platform: str, target_role: str, location: str, skills: str, db, summary: str = "", experience: str = "", years_of_exp: int = 0) -> AsyncGenerator[str, None]:
        from app.modules.job.model import JobRepository, JobStatus
        from app.modules.job.service import job_service
        from app.modules.browser.session_model import ScoutSession

        scout_session = None
        import uuid
        task_nonce = str(uuid.uuid4())

        # Industrial Persistence Pulse: Enforce strictly ONE active mission by hijacking the current running session
        scout_session = db.query(ScoutSession).filter(
            ScoutSession.user_id == user_id, 
            ScoutSession.status == "running"
        ).first()

        if scout_session:
            # Tactical Intent Preservation: Don't overwrite with empty mission directives
            target_role = target_role or scout_session.target_role
            location = location or scout_session.location or "India"
            
            yield json.dumps({"type": "thinking", "message": f"🔄 Hijacking Active Mission Context #{scout_session.id} for resumed tactical vector..."})
            scout_session.name = f"{target_role} · {platform}"
            scout_session.target_role = target_role
            scout_session.location = location
            scout_session.platform = platform
            scout_session.current_task_id = task_nonce
            
            # Mission Continuity Protocol: Identify starting point
            resumed_platform = scout_session.current_platform
            resumed_page = scout_session.current_page or 1
            db.commit()
        else:
            # ... (creating new session as before)
            scout_session = ScoutSession(
                user_id=user_id, 
                name=f"{target_role} · {platform}", 
                target_role=target_role, 
                location=location or "India", 
                platform=platform, 
                status="running", 
                current_task_id=task_nonce,
                total_jobs=0, 
                breakdown=[]
            )
            db.add(scout_session); db.commit(); db.refresh(scout_session)
            yield json.dumps({"type": "thinking", "message": f"🚀 Tactical Mission #{scout_session.id} initiated."})
            resumed_platform = None
            resumed_page = 1

        # PLATFORM AGGREGATION: Split multiple mission objectives
        platforms = [p.strip().lower() for p in platform.split(",")]
        
        session_id = scout_session.id
        
        # Diagnostic Log: Model Awareness
        model_name = settings.MODEL_NAME
        key_valid = "PRESENT" if settings.NVIDIA_API_KEY else "MISSING"
        yield json.dumps({"type": "thinking", "message": f"🤖 AI Engine Ready (Model: {model_name})"})
        
        # TACTICAL: Distill the search intent from role and skill cluster
        yield json.dumps({"type": "thinking", "message": "🧠 AI is distilling surgical search directive from profile and skills..."})
        refined_query = await self._refine_search_directive(target_role, skills)
        yield json.dumps({"type": "thinking", "message": f"🎯 Search Directive Refined: '{refined_query}'"})
        
        # BROADCAST: Signal drafting hub that a new session has initialized
        yield json.dumps({
            "type": "session_created", 
            "data": {
                "id": scout_session.id,
                "platform": platform,
                "name": scout_session.name,
                "target_role": target_role,
                "date": scout_session.created_at.isoformat() if scout_session.created_at else ""
            }
        })

        context = pw = browser = None
        try:
            yield json.dumps({"type": "thinking", "message": "🔗 Connecting to local Chrome..."})
            context, pw, browser = await browser_service.connect_to_local_chrome()
            page = await context.new_page()

            # Industrial Pulse: Load existing telemetry for resumed missions
            total_saved_count = scout_session.total_jobs or 0
            mission_breakdown = list(scout_session.breakdown or [])
            
            # Map existing breakdown for easier in-loop updating
            platform_map = { b["platform"].lower(): i for i, b in enumerate(mission_breakdown) }

            for target_platform in platforms:
                # Mission Continuity: Skip platforms already conquered in this session context
                if resumed_platform and target_platform != resumed_platform:
                    # Check if the resumed platform appears later in the list (so we skip early ones)
                    if resumed_platform in platforms[platforms.index(target_platform)+1:]:
                        yield json.dumps({"type": "thinking", "message": f"⏩ Skipping {target_platform.upper()} (Already processed in original run)"})
                        continue

                stop_platform = False
                yield json.dumps({"type": "thinking", "message": f"🚀 TARGET ACQUIRED: Initiating mission on {target_platform.upper()}..."})
                
                # RECOVERY: Ensure current platform exists in breakdown
                p_key = target_platform.lower()
                if p_key not in platform_map:
                    mission_breakdown.append({
                        "platform": target_platform.capitalize(),
                        "logo": f"https://www.google.com/s2/favicons?domain={target_platform.lower()}.com&sz=128",
                        "count": 0
                    })
                    platform_map[p_key] = len(mission_breakdown) - 1
                
                p_idx = platform_map[p_key]
                platform_saved = 0 # Local count for this turn
                
                # Intelligence Integrity tracking for this platform node
                ai_failure_streak = 0
                use_heuristic_only = False
                
                # Persistence Checkpoint: Sync platform to vault
                scout_session.current_platform = target_platform
                db.commit()
                
                config = PLATFORM_SEARCH_CONFIG.get(target_platform)
                if not config:
                    yield json.dumps({"type": "thinking", "message": f"⚠️ Unsupported platform: {target_platform}. Skipping node."})
                    continue

                # 1. Determine starting page for this platform in this mission turn
                start_page = resumed_page if target_platform == resumed_platform else 1
                
                if target_platform in ["naukri", "foundit"]:
                    search_url = config["search_url"](refined_query, location, years_of_exp, page=start_page)
                else:
                    search_url = config["search_url"](refined_query, location, page=start_page)

                yield json.dumps({"type": "thinking", "message": f"🌐 Navigating to {target_platform.upper()}..."})
                try:
                    # 'domcontentloaded' is enough to start analyzing; 'load' takes too long on LinkedIn
                    await page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
                    
                    # TACTICAL: Freshness Calibration (Sort by Date)
                    if target_platform == "naukri":
                        yield json.dumps({"type": "thinking", "message": "🕒 Calibrating freshness (Sorting by Date)..."})
                        try:
                            await page.wait_for_selector("#filter-sort", timeout=10000)
                            await page.evaluate('''(selector) => {
                                const sortBtn = document.querySelector("#filter-sort");
                                if (sortBtn && !sortBtn.innerText.includes("Date")) {
                                    sortBtn.click();
                                    setTimeout(() => {
                                        const dateOption = document.querySelector('a[data-id="filter-sort-f"]');
                                        if (dateOption) dateOption.click();
                                    }, 500);
                                }
                            }''')
                            await asyncio.sleep(4.0) # Grace period for sort re-hydration
                        except: pass
                    
                    # SYSTEM OVERLAY: Stabilize Neural Link
                    await self._inject_control_overlay(page)
                except Exception as e:
                    print(f"⚠️ Navigation warning (proceeding anyway): {e}")

                yield json.dumps({"type": "thinking", "message": f"🧠 Analyzing {target_platform.upper()} content..."})
                wait_sel = config.get("wait_selector", "")
                if wait_sel:
                    try: await page.wait_for_selector(wait_sel, timeout=15000)
                    except: pass

                yield json.dumps({"type": "thinking", "message": f"📜 Scrolling {target_platform.upper()} matrix..."})
                # On LinkedIn, we must scroll the internal list container, not the window
                if target_platform == "linkedin":
                    await page.evaluate("""() => {
                        const list = document.querySelector('.jobs-search-results-list, .scaffold-layout__list, ul.CERBSFoMEkNxNKfBpiWHVfzfLOkzUc');
                        if (list) {
                            for (let i=0; i<5; i++) {
                                setTimeout(() => {
                                    list.scrollBy({ top: 1200, behavior: 'smooth' });
                                }, i * 1500);
                            }
                        }
                    }""")
                    await asyncio.sleep(8.0) # More time for full hydration
                else:
                    for i in range(4):
                        await page.evaluate(f"window.scrollBy({{ top: {800 + i*100}, behavior: 'smooth' }})")
                        await asyncio.sleep(1.0)
                
                await page.evaluate("window.scrollTo(0, 0)")

                # 1. Harvest Job IDs first (handles go stale in virtual lists)
                job_ids = []
                for sel in config.get("job_card_selectors", []):
                    # Robust harvester: Look for LinkedIn ID, Generic ID, Indeed JK, or Foundit ID
                    harvest_script = """(sel) => {
                        return Array.from(document.querySelectorAll(sel)).map(el => {
                            // Direct ID matches
                            const direct = el.getAttribute('data-occludable-job-id') || 
                                         el.getAttribute('data-job-id') || 
                                         el.getAttribute('data-jk') ||
                                         (el.id && el.id.length > 5 ? el.id : null);
                            if (direct) return String(direct);
                            
                            // Indeed specific: search for jcs-JobTitle link inside
                            const link = el.querySelector('a.jcs-JobTitle, a[data-jk], a.title');
                            if (link) {
                                return link.getAttribute('data-jk') || 
                                       link.getAttribute('data-job-id') || 
                                       link.innerText.trim(); // Fallback to title-based ID if needed
                            }
                            
                            return null;
                        }).filter(id => !!id);
                    }"""
                    ids = await page.evaluate(harvest_script, sel)
                    if ids: job_ids = [str(i) for i in ids]; break
                
                if not job_ids:
                    yield json.dumps({"type": "thinking", "message": f"⚠️ {target_platform.upper()}: 0 jobs found."})
                    continue

                yield json.dumps({"type": "thinking", "message": f"✅ {target_platform.upper()}: Found {len(job_ids)} jobs. Analyzing top matches..."})
                platform_saved = 0
                is_linkedin = (target_platform == "linkedin")
                
                # Mission Continuity: Align starting page from hibernation data
                current_page = start_page
                MAX_PAGES = min(15, current_page + 4) # Maintain a sliding window of 5 pages from start_page
                consecutive_skips = 0

                # 1. Dynamically extract total pages from LinkedIn UI if available
                if is_linkedin:
                    try:
                        page_state_text = await page.inner_text(".jobs-search-pagination__page-state")
                        import re
                        match = re.search(r"Page \d+ of (\d+)", page_state_text)
                        if match:
                            MAX_PAGES = min(15, int(match.group(1))) # Cap at 15 for safety
                            yield json.dumps({"type": "thinking", "message": f"📊 Mission Scope: {MAX_PAGES} pages found. Scanning entire pipeline..."})
                    except: pass

                async def _check_mission_integrity():
                    """High-fidelity status pulse to ensure current mission hasn't been hijacked or stopped."""
                    db.expire_all() # Ensure we get fresh tactical data from the vault
                    fresh_session = db.query(ScoutSession).filter(ScoutSession.id == session_id).first()
                    if not fresh_session or fresh_session.status != "running":
                        print(f"🛑 Mission #{session_id} not active. Aborting task.")
                        return False
                    if fresh_session.current_task_id != task_nonce:
                        print(f"🛑 Mission #{session_id} hijacking detected! New task started. Terminating ghost mission.")
                        return False
                    return True

                while current_page <= MAX_PAGES:
                    if not await _check_mission_integrity() or stop_platform: break

                    if current_page > 1:
                        yield json.dumps({"type": "thinking", "message": f"⏭️ {target_platform.upper()}: Page {current_page-1} complete. Navigating..."})
                        
                        # PLATFORM-SPECIFIC NAVIGATION MATRIX
                        next_btn = None
                        if target_platform == "linkedin":
                            next_btn = await page.query_selector(".jobs-search-pagination__button--next")
                        elif target_platform == "naukri":
                            # Target the styled 'Next' button from user's provided HTML
                            next_btn = await page.query_selector("a.styles_btn-secondary__2AsIP:has-text('Next')")
                            if not next_btn:
                                # Fallback: Search for any link containing the 'Next' span text
                                next_btn = await page.query_selector("a:has(span:text('Next'))")
                        elif target_platform == "foundit":
                            next_btn = await page.query_selector(".pagination .arrow-right") or await page.query_selector(".mqfisrp-right-arrow")
                        if target_platform == "indeed":
                            await self._close_common_popups(page)
                            next_btn = await page.query_selector("a[data-testid='pagination-page-next'], a[aria-label='Next Page'], .pagination-next, [aria-label='Next'], nav a:has-text('Next')")
                        
                        if not next_btn: 
                            # INDUSTRIAL FALLBACK: Try scrolling to bottom to trigger lazy-pagination or reveals
                            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                            await asyncio.sleep(2.0)
                            if target_platform == "indeed":
                                next_btn = await page.query_selector("a[aria-label='Next Page'], [data-testid='pagination-page-next']")

                        if not next_btn: 
                            yield json.dumps({"type": "thinking", "message": f"📍 {target_platform.upper()}: No more pages found."})
                            break
                        
                        await next_btn.scroll_into_view_if_needed()
                        await next_btn.click(force=True)
                        # EXTENDED HYDRATION: Allow full page transition and data-saturation
                        await asyncio.sleep(8.0) 
                        
                        # TACTICAL: Re-calibrate freshness on the new page if needed
                        if target_platform == "naukri":
                             await page.evaluate('''(selector) => {
                                const sortBtn = document.querySelector("#filter-sort");
                                if (sortBtn && !sortBtn.innerText.includes("Date")) {
                                    sortBtn.click();
                                    setTimeout(() => {
                                        const dateOption = document.querySelector('a[data-id="filter-sort-f"]');
                                        if (dateOption) dateOption.click();
                                    }, 500);
                                }
                            }''')
                             await asyncio.sleep(2.0)
                        
                        # Re-harvest fresh IDs for the new page
                        for sel in config.get("job_card_selectors", []):
                            harvest_script = """(sel) => {
                                return Array.from(document.querySelectorAll(sel)).map(el => {
                                    const direct = el.getAttribute('data-occludable-job-id') || 
                                                 el.getAttribute('data-job-id') || 
                                                 el.getAttribute('data-jk') ||
                                                 (el.classList.contains('cardContainer') || el.id.length > 5 ? el.id : null);
                                    if (direct) return direct;
                                    const link = el.querySelector('a.jcs-JobTitle, a[data-jk]');
                                    if (link) return link.getAttribute('data-jk');
                                    return null;
                                }).filter(id => !!id);
                            }"""
                            ids = await page.evaluate(harvest_script, sel)
                            if ids: job_ids = ids; break
                        
                        if not job_ids: break
                        yield json.dumps({"type": "thinking", "message": f"✅ {target_platform.upper()}: Found {len(job_ids)} new jobs on Page {current_page}."})

                    # Persistence Checkpoint: Register current navigation state
                    scout_session.current_page = current_page
                    db.commit()

                    # TACTICAL: Process more jobs per page for Indeed as requested
                    job_limit = 25 if target_platform == "indeed" else 15
                    for i, job_id in enumerate(job_ids[:job_limit]):
                        if not await _check_mission_integrity() or stop_platform: break
                        
                        try:
                            # 2. Re-find card by ID inside the loop (Resilience)
                            id_selector = f"[data-occludable-job-id='{job_id}'], [data-job-id='{job_id}'], [data-jk='{job_id}'], .job_{job_id}"
                            card = await page.query_selector(id_selector)
                            
                            if not card:
                                # INDUSTRIAL FALLBACK: If exact ID selector fails, try partial match
                                partial_selector = f"[data-occludable-job-id*='{job_id}'], [data-job-id*='{job_id}'], [data-jk*='{job_id}'], [id*='{job_id}'], [href*='{job_id}']"
                                card = await page.query_selector(partial_selector)
                            
                            if not card:
                                # INDUSTRIAL FALLBACK: If ID selector fails, try finding by text or index
                                card_selectors = config.get("job_card_selectors", [])
                                for cs in card_selectors:
                                    cards = await page.query_selector_all(cs)
                                    if i < len(cards): 
                                        card = cards[i]
                                        break

                            if not card: continue

                            # HYDRATION PULSE: Ensure card is scrolled and technically visible
                            await card.scroll_into_view_if_needed()
                            await self._visual_pulse_on_element(card, "scan")
                            await asyncio.sleep(1.0) # Tactical grace period for lazy-load

                            if is_linkedin:
                                # 3. Forced Hydration
                                await card.scroll_into_view_if_needed(timeout=3000)
                                # Wait for either the title link OR a small timeout
                                try: await card.wait_for_selector("a.job-card-list__title--link", timeout=2000)
                                except: pass
                                
                                data = await self._extract_card_data_linkedin(card)
                            else:
                                # 3. Hybrid Hydration Grace Period (Indeed)
                                await asyncio.sleep(0.5) 
                                data = await self._extract_card_data_generic(card, config, location)

                            title, company, loc, link, extracted_id = data.get("title"), data.get("company"), data.get("location"), data.get("href"), data.get("jobId")
                            
                            # TACTICAL: Allow missing links for SPA platforms (Foundit)
                            if not title or (not link and target_platform != "foundit"):
                                yield json.dumps({"type": "thinking", "message": f"⏭️ Skipping card {i+1}: Extraction incomplete (Hydration timeout)"})
                                continue

                            # Final URL formatting
                            if is_linkedin:
                                if job_id and (not link or link.startswith("/")): link = f"https://www.linkedin.com/jobs/view/{job_id}/"
                                elif link.startswith("/"): link = "https://www.linkedin.com" + link
                            elif target_platform == "indeed":
                                if job_id and (not link or link.startswith("/")): link = f"https://in.indeed.com/viewjob?jk={job_id}"
                                elif link.startswith("/"): link = "https://in.indeed.com" + link
                            elif target_platform == "foundit":
                                if job_id and (not link or link.startswith("/")): link = f"https://www.foundit.in/job-details/{job_id}"
                                elif link.startswith("/"): link = "https://www.foundit.in" + link
                            
                            yield json.dumps({"type": "thinking", "message": f"👆 [P{current_page}-{i+1}] Processing '{title}' @ {company}..."})
                            
                            # ARCHIVE CHECK: Avoid processing known leads to save neural resources
                            from app.modules.job.model import JobRepository
                            if db.query(JobRepository).filter(JobRepository.url == link).first():
                                yield json.dumps({"type": "thinking", "message": "🗄️  Already in vault. Skipping mission node."}); continue

                            raw_job_desc = ""
                            enriched_meta = {}
                            
                            # Defend against blocking overlays
                            await self._close_common_popups(page)

                            if is_linkedin or target_platform == "foundit" or target_platform == "google" or target_platform == "indeed":
                                intel = await self._get_job_detail_via_panel(page, card, job_id)
                                raw_job_desc = intel.get("description", "")
                                if intel.get("location"): 
                                    loc = intel["location"]
                                    if intel.get("workType"):
                                        loc = f"{loc} ({intel['workType']})"
                            elif target_platform == "naukri":
                                yield json.dumps({"type": "thinking", "message": f"🔍 Accessing full JD on {target_platform.upper()}..."})
                                raw_job_desc = await self._get_job_detail_via_popup(context, page, card, target_platform)
                            
                            # Fallback for empty/failed panel or popup
                            if not raw_job_desc:
                                raw_job_desc = data.get("description") or f"{title} at {company} in {loc}"
                            
                            # Enrich with extracted tags if available
                            tags = data.get("tags")
                            job_desc = f"{raw_job_desc} \n\n TECHNICAL TAGS: {tags}" if tags else raw_job_desc
                            
                            print(f"DEBUG: Extracted JD for AI Analysis (Len: {len(job_desc)}): |{job_desc[:150]}...|")
                            
                            if not job_desc: job_desc = f"{title} at {company} in {loc}"
                            
                            # 1. AI vs Heuristic Core Decision
                            if not use_heuristic_only:
                                res = await self._score_job_with_ai(title, job_desc, skills, target_role, summary, experience, years_of_exp)
                                if "Cyber-Resilience Fallback" in (res.get("reason") or ""):
                                    ai_failure_streak += 1
                                    if ai_failure_streak >= 3:
                                        yield json.dumps({"type": "thinking", "message": "⚠️ Neural signal degraded. Engaging heuristic logic to maintain mission velocity..."})
                                        use_heuristic_only = True
                                else:
                                    ai_failure_streak = 0
                            else:
                                skills_list = [s.strip().lower() for s in skills.split(",")]
                                desc_lower = (title + " " + job_desc + " " + target_role).lower()
                                matches = sum(1 for s in skills_list if s in desc_lower)
                                score = min(100, int((matches / max(len(skills_list), 1)) * 100))
                                res = {"score": score, "reason": f"Heuristic Analysis (Signal Offline): Found {matches} match vectors.", "skip": score < 40}

                            reason, score = res.get("reason", "Analysis complete."), res.get("score", 0)
                            
                            posted_at = data.get("posted_at", "").lower()
                            stale_markers = ["3 day", "4 day", "5 day", "6 day", "7 day", "10 day", "15 day", "20 day", "25 day", "30+ day", "month ago"]
                            if any(x in posted_at for x in stale_markers):
                                yield json.dumps({"type": "thinking", "message": f"🛡️ Freshness Cut-off Protocol engaged. Found lead from '{posted_at}'. Concluding platform search..."})
                                stop_platform = True
                                break # Move to next platform node
                            
                            extracted_salary = res.get("salary", "Not specified")
                            extracted_currency = res.get("currency", "N/A")
                            extracted_tech = json.dumps(res.get("tech_stack", []))

                            yield json.dumps({"type": "thinking", "message": f"📊 AI Insight: {reason} (Match: {score}%)"})

                            
                            if score <= 70:
                                consecutive_skips += 1
                                yield json.dumps({"type": "thinking", "message": f"⏭️  Decision: Skipping ({score}% match too low - 70% required)"})
                                yield json.dumps({"type": "job_skipped", "data": {"title": title, "company": company, "location": loc, "url": link, "score": score, "reason": reason, "platform": target_platform}})
                                
                                if consecutive_skips >= 20:
                                    yield json.dumps({"type": "thinking", "message": f"📉 Quality Breach: 20 consecutive low-match leads detected (Threshold: 20). Switching platform vector..."})
                                    stop_platform = True
                                    break
                                continue

                            # Reset quality streak on clinical match
                            consecutive_skips = 0


                            job = job_service.save_scouted_job(db, user_id, {
                                "title": title, 
                                "company": company, 
                                "location": loc, 
                                "url": link, 
                                "platform": target_platform, 
                                "description": job_desc,
                                "salary": extracted_salary, 
                                "currency": extracted_currency,
                                "tech_stack": extracted_tech, 
                                "heuristic_score": score, 
                                "match_reason": reason
                            })
                            
                            await self._clear_visual_pulse(card)
                            # LIVE TELEMETRY: Sync mission breakdown and total count to vault
                            platform_saved += 1
                            total_saved_count += 1
                            mission_breakdown[p_idx]["count"] += 1
                            
                            scout_session.total_jobs = total_saved_count
                            scout_session.breakdown = mission_breakdown
                            db.commit()

                            yield json.dumps({"type": "job_found", "data": {"id": job.id, "title": title, "company": company, "location": loc, "url": link, "score": score, "reason": reason, "platform": target_platform}})

                        except Exception as e:
                            yield json.dumps({"type": "thinking", "message": f"⚠️ Card error: {e}"}); continue
                    
                    # TACTICAL DRILL: Google "Web Matrix" Expansion (Search for companies only listed on their pages)
                    if target_platform == "google" and current_page == 1:
                        yield json.dumps({"type": "thinking", "message": "🔍 AI Scanning Web Matrix for Hidden Career Portals..."})
                        # TACTICAL: Switch to internal general search for this pass
                        web_search_url = f"https://www.google.com/search?q={urllib.parse.quote_plus(refined_query)}+career+jobs+in+{urllib.parse.quote_plus(location)}"
                        try:
                            await page.goto(web_search_url, wait_until="domcontentloaded", timeout=30000)
                            career_links = await self._ai_scan_for_career_links(page)
                            
                            for link in career_links:
                                if not await _check_mission_integrity(): break
                                if db.query(JobRepository).filter(JobRepository.url == link).first(): continue
                                
                                yield json.dumps({"type": "thinking", "message": f"🌐 Excavating Career Portal: {link[:40]}..."})
                                try:
                                    # Navigate to Company career page
                                    await page.goto(link, wait_until="domcontentloaded", timeout=25000)
                                    await asyncio.sleep(2.0)
                                    await self._inject_control_overlay(page)
                                    
                                    # AI extraction from the raw HTML blueprint
                                    page_text = await page.evaluate("() => document.body.innerText.substring(0, 6000)")
                                    extract_prompt = f"Extract job title, company name, location, and full description from this page: {page_text[:5000]}"
                                    # ... (scoring and saving as before)
                                    ai_intel = await self._score_job_with_ai("Unknown", page_text, skills, target_role, summary, experience, years_of_exp)
                                    
                                    if ai_intel.get("score", 0) > 70:
                                        # Use AI to find title/company if not obvious
                                        job = job_service.save_scouted_job(db, user_id, {
                                            "title": target_role, "company": "Direct Recruit", "location": location, 
                                            "url": link, "platform": "google_web", "description": page_text[:12000], 
                                            "heuristic_score": ai_intel["score"], "match_reason": ai_intel.get("reason", "")
                                        })
                                        total_saved_count += 1
                                        yield json.dumps({"type": "job_found", "data": {"id": job.id, "title": target_role, "company": "Direct Recruit", "location": location, "url": link, "score": ai_intel["score"], "reason": ai_intel.get("reason", ""), "platform": "google_web"}})
                                except: pass
                            
                            # Resume structured widget mission
                            await page.goto(search_url, wait_until="domcontentloaded")
                        except: pass

                    current_page += 1

            yield json.dumps({"type": "done", "count": total_saved_count, "session_id": session_id})

        except Exception as e:
            err = str(e)
            db.query(ScoutSession).filter(ScoutSession.id == session_id).update({"status": "failed", "error_msg": err})
            db.commit()
            yield json.dumps({"type": "chrome_offline" if "port 9223" in err or "ConnectError" in err else "error", "message": err})
        finally:
            # Secure final mission report even if session was aborted early
            try:
                session = db.query(ScoutSession).filter(ScoutSession.id == session_id).first()
                if session:
                    # Update metrics regardless of status
                    session.total_jobs = total_saved_count
                    session.breakdown = mission_breakdown
                    
                    # Only complete normally if not already failed
                    if session.status == "running":
                        session.status = "completed"
                    
                    db.commit()
                print(f"✅ Mission resource recovery pulse: Session #{session_id} secured.")
            except Exception as commit_err:
                print(f"Failed to commit final session stats: {commit_err}")

            if browser: await browser.close()
            if pw: await pw.stop()

job_scout_service = JobScoutService()
