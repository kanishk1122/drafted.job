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
        "search_url": lambda q, loc: (
            f"https://www.linkedin.com/jobs/search/"
            f"?keywords={urllib.parse.quote_plus(q)}"
            f"&location={urllib.parse.quote_plus(loc)}"
            f"&f_TPR=r86400"
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
        "search_url": lambda q, loc: (
            f"https://in.indeed.com/jobs"
            f"?q={urllib.parse.quote_plus(q)}"
            f"&l={urllib.parse.quote_plus(loc)}"
            f"&fromage=1"
        ),
        "job_card_selectors": ["div.cardOutline", "div.job_seen_beacon", "td.resultContent"],
        "wait_selector": "div.cardOutline, div.job_seen_beacon, td.resultContent",
        "title_selector": "h2.jobTitle span[title], a.jcs-JobTitle",
        "company_selector": "[data-testid='company-name'], .companyName, .css-1h4s93d",
        "location_selector": "[data-testid='text-location'], .companyLocation",
    },
    "foundit": {
        "search_url": lambda q, loc: (
            f"https://www.foundit.in/srp/results"
            f"?query={urllib.parse.quote_plus(q)}"
            f"&locations={urllib.parse.quote_plus(loc)}"
        ),
        "job_card_selectors": ["div.srpCard", "div.job-apply-card"],
        "wait_selector": "div.srpCard",
        "title_selector": ".jobTitle, .title",
        "company_selector": ".companyName, .company",
        "location_selector": ".location, .loc",
    },
    "naukri": {
        "search_url": lambda q, loc: (
            f"https://www.naukri.com/"
            f"{urllib.parse.quote_plus(q).replace(' ','-')}"
            f"-jobs-in-{urllib.parse.quote_plus(loc).replace(' ','-')}"
        ),
        "job_card_selectors": ["article.jobTuple", ".srp-jobtuple-wrapper"],
        "wait_selector": "article.jobTuple, .srp-jobtuple-wrapper",
        "title_selector": "a.title, .job-title",
        "company_selector": "a.subTitle, .comp-name",
        "location_selector": ".locWdth, .loc-wrap",
    },
    "glassdoor": {
        "search_url": lambda q, loc: (
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
        "search_url": lambda q, loc: (
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
}


async def _extract_card_data_linkedin(card) -> dict:
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
                '.job-search-card__location, ' +
                '.artdeco-entity-lockup__metadata'
            );
            const location = locationEl ? locationEl.innerText.trim() : '';

            const jobId = el.getAttribute('data-occludable-job-id') || el.getAttribute('data-job-id') || '';

            return { title, href, company, location, jobId };
        }""")
        return data
    except Exception:
        return {"title": "", "href": "", "company": "", "location": "", "jobId": ""}


async def _extract_card_data_generic(card, config, location_default: str) -> dict:
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

        return {"title": title, "company": company, "location": loc, "href": link}
    except Exception:
        return {"title": "", "company": "", "location": "", "href": ""}


async def _get_job_detail_via_panel(page, card, job_id: str, timeout: int = 8000) -> str:
    try:
        await card.click()
        await page.wait_for_selector(".jobs-description__content, .jobs-box__html-content, .job-view-layout", timeout=timeout)
        await asyncio.sleep(0.8)
        desc = await page.evaluate("""() => {
            const panel = document.querySelector('.jobs-description__content, .jobs-box__html-content, .job-view-layout');
            return panel ? panel.innerText.trim() : '';
        }""")
        return desc[:2000] if desc else ""
    except Exception:
        return ""


class JobScoutService:
    def __init__(self):
        self.nim_client = AsyncOpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=settings.NVIDIA_API_KEY
        ) if settings.NVIDIA_API_KEY else None

    async def _score_job_with_ai(self, job_title: str, job_description: str, user_skills: str, target_role: str) -> dict:
        # Preparation for fallback
        def _get_keyword_score():
            skills_list = [s.strip().lower() for s in user_skills.split(",")]
            desc_lower = (job_title + " " + job_description).lower()
            matches = sum(1 for s in skills_list if s in desc_lower)
            score = min(100, int((matches / max(len(skills_list), 1)) * 100))
            return {"score": score, "reason": f"Heuristic: {matches} skills matched.", "skip": score < 40}

        if not self.nim_client:
            return _get_keyword_score()

        prompt = f"""Match Job for Role: {target_role}
Candidate Skills: {user_skills}
Job Title: {job_title}
Role Description: {job_description[:1500]}
Scoring Rule: Respond ONLY with valid JSON.
Format: {{"score": 0-100, "reason": "reasoning", "skip": boolean}}
"""
        try:
            # 30s timeout + Fallback logic
            completion = await self.nim_client.chat.completions.create(
                model=settings.MODEL_NAME,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
                max_tokens=256,
                timeout=30.0
            )
            text = re.sub(r"```json|```", "", completion.choices[0].message.content).strip()
            return json.loads(text)
        except Exception as e:
            msg = str(e)
            print(f"⚠️ AI Scoring fail (Falling back to Keyword Match): {msg}")
            fallback = _get_keyword_score()
            fallback["reason"] = f"AI Timeout ({msg}). Fallback: {fallback['reason']}"
            return fallback

    async def run_search(self, user_id: int, user_email: str, platform: str, target_role: str, location: str, skills: str, db) -> AsyncGenerator[str, None]:
        from app.modules.job.model import JobRepository, JobStatus
        from app.modules.browser.session_model import ScoutSession

        scout_session = ScoutSession(user_id=user_id, name=f"{target_role} · {platform}", target_role=target_role, location=location, platform=platform, status="running", total_jobs=0, breakdown=[])
        db.add(scout_session); db.commit(); db.refresh(scout_session)
        session_id = scout_session.id

        yield json.dumps({"type": "thinking", "message": f"🚀 Session #{session_id} started..."})
        
        # Diagnostic Log: Model Awareness
        model_name = settings.MODEL_NAME
        key_valid = "PRESENT" if settings.NVIDIA_API_KEY else "MISSING"
        yield json.dumps({"type": "thinking", "message": f"🤖 AI Engine Ready (Model: {model_name}, Key: {key_valid})"})

        config = PLATFORM_SEARCH_CONFIG.get(platform.lower())
        if not config:
            yield json.dumps({"type": "error", "message": f"Unsupported: {platform}"}); return

        context = pw = browser = None
        try:
            yield json.dumps({"type": "thinking", "message": "🔗 Connecting to local Chrome..."})
            context, pw, browser = await browser_service.connect_to_local_chrome()
            page = await context.new_page()

            search_url = config["search_url"](target_role, location)
            yield json.dumps({"type": "thinking", "message": f"🌐 Navigating to {platform.upper()}..."})
            try:
                # 'domcontentloaded' is enough to start analyzing; 'load' takes too long on LinkedIn
                await page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
            except Exception as e:
                print(f"⚠️ Navigation warning (proceeding anyway): {e}")

            yield json.dumps({"type": "thinking", "message": "🧠 Analyzing page content..."})
            wait_sel = config.get("wait_selector", "")
            if wait_sel:
                try: await page.wait_for_selector(wait_sel, timeout=15000)
                except: pass

            yield json.dumps({"type": "thinking", "message": "📜 Scrolling..."})
            # On LinkedIn, we must scroll the internal list container, not the window
            if platform.lower() == "linkedin":
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
                # Robust harvester: Look for LinkedIn ID, Generic ID, or Indeed Direct Key (JK)
                harvest_script = """(sel) => {
                    return Array.from(document.querySelectorAll(sel)).map(el => {
                        // Direct ID matches
                        const direct = el.getAttribute('data-occludable-job-id') || 
                                     el.getAttribute('data-job-id') || 
                                     el.getAttribute('data-jk');
                        if (direct) return direct;
                        
                        // Indeed specific: search for jcs-JobTitle link inside
                        const link = el.querySelector('a.jcs-JobTitle, a[data-jk]');
                        if (link) return link.getAttribute('data-jk');
                        
                        return null;
                    }).filter(id => !!id);
                }"""
                ids = await page.evaluate(harvest_script, sel)
                if ids: job_ids = ids; break
            
            if not job_ids:
                yield json.dumps({"type": "thinking", "message": "⚠️ 0 jobs found."})
                db.query(ScoutSession).filter(ScoutSession.id == session_id).update({"status": "failed", "error_msg": "No jobs found"}); db.commit()
                return

            yield json.dumps({"type": "thinking", "message": f"✅ Found {len(job_ids)} jobs. Analyzing top matches..."})
            saved_count = 0
            is_linkedin = (platform.lower() == "linkedin")
            current_page = 1
            MAX_PAGES = 5 # Default fallback

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

            while current_page <= MAX_PAGES:
                if current_page > 1:
                    yield json.dumps({"type": "thinking", "message": f"⏭️ Page {current_page-1} of {MAX_PAGES} complete. Navigating..."})
                    
                    # Target the next button from user's HTML
                    next_btn = await page.query_selector(".jobs-search-pagination__button--next")
                    if not next_btn: 
                        yield json.dumps({"type": "thinking", "message": "📍 No more pages found."})
                        break
                    
                    await next_btn.click()
                    await asyncio.sleep(6.0) # Wait for page load and hydration
                    
                    # Re-harvest fresh IDs for the new page
                    for sel in config.get("job_card_selectors", []):
                        ids = await page.evaluate(f"(sel) => Array.from(document.querySelectorAll(sel)).map(el => el.getAttribute('data-occludable-job-id') || el.getAttribute('data-job-id')).filter(id => !!id)", sel)
                        if ids: job_ids = ids; break
                    
                    if not job_ids: break
                    yield json.dumps({"type": "thinking", "message": f"✅ Found {len(job_ids)} new jobs on Page {current_page}."})

                for i, job_id in enumerate(job_ids[:25]):
                    try:
                        # 2. Re-find card by ID inside the loop (Resilience)
                        id_selector = f"[data-occludable-job-id='{job_id}'], [data-job-id='{job_id}'], [data-jk='{job_id}'], .job_{job_id}"
                        card = await page.query_selector(id_selector)
                        if not card: continue

                        if is_linkedin:
                            # 3. Forced Hydration
                            await card.scroll_into_view_if_needed(timeout=3000)
                            # Wait for either the title link OR a small timeout
                            try: await card.wait_for_selector("a.job-card-list__title--link", timeout=2000)
                            except: pass
                            
                            data = await _extract_card_data_linkedin(card)
                        else:
                            data = await _extract_card_data_generic(card, config, location)

                        title, company, loc, link, extracted_id = data.get("title"), data.get("company"), data.get("location"), data.get("href"), data.get("jobId")
                        
                        if not title or not link:
                            yield json.dumps({"type": "thinking", "message": f"⏭️ Skipping card {i+1}: Extraction incomplete (Hydration timeout)"})
                            continue

                        # Final URL formatting
                        if is_linkedin:
                            if job_id and (not link or link.startswith("/")): link = f"https://www.linkedin.com/jobs/view/{job_id}/"
                            elif link.startswith("/"): link = "https://www.linkedin.com" + link
                        
                        yield json.dumps({"type": "thinking", "message": f"👆 [P{current_page}-{i+1}] Processing '{title}' @ {company}..."})
                        job_desc = await _get_job_detail_via_panel(page, card, job_id) if is_linkedin else f"{title} at {company} in {loc}"
                        
                        if not job_desc: job_desc = f"{title} at {company} in {loc}"
                        yield json.dumps({"type": "thinking", "message": "🤖 AI is evaluating alignment with your profile..."})
                        
                        res = await self._score_job_with_ai(title, job_desc, skills, target_role)
                        reason, score = res.get("reason", "Analysis complete."), res.get("score", 0)

                        yield json.dumps({"type": "thinking", "message": f"📊 AI Insight: {reason} (Match: {score}%)"})

                        
                        if score <= 70:
                            yield json.dumps({"type": "thinking", "message": f"⏭️  Decision: Skipping ({score}% match too low - 70% required)"})
                            yield json.dumps({"type": "job_skipped", "data": {"title": title, "company": company, "location": loc, "url": link, "score": score, "reason": reason, "platform": platform}})
                            continue

                        if db.query(JobRepository).filter(JobRepository.url == link).first():
                            yield json.dumps({"type": "thinking", "message": "🗄️  Already in vault. Skipping."}); continue

                        job = JobRepository(user_id=user_id, title=title, company=company, location=loc, url=link, platform=platform, heuristic_score=score, match_reason=reason, status=JobStatus.NEW)
                        db.add(job); db.commit(); db.refresh(job); saved_count += 1
                        yield json.dumps({"type": "job_found", "data": {"id": job.id, "title": title, "company": company, "location": loc, "url": link, "score": score, "reason": reason, "platform": platform}})

                    except Exception as e:
                        yield json.dumps({"type": "thinking", "message": f"⚠️ Card error: {e}"}); continue
                
                current_page += 1

            yield json.dumps({"type": "done", "count": saved_count, "session_id": session_id})

        except Exception as e:
            err = str(e)
            db.query(ScoutSession).filter(ScoutSession.id == session_id).update({"status": "failed", "error_msg": err})
            db.commit()
            yield json.dumps({"type": "chrome_offline" if "port 9223" in err or "ConnectError" in err else "error", "message": err})
        finally:
            # Secure final mission report even if session was aborted early
            try:
                session = db.query(ScoutSession).filter(ScoutSession.id == session_id).first()
                if session and session.status == "running":
                    platform_name = "Linkedin" if platform.lower() == "linkedin" else platform.capitalize()
                    final_breakdown = [{"platform": platform_name, "logo": f"https://www.google.com/s2/favicons?domain={platform.lower()}.com&sz=128", "count": saved_count}]
                    session.status = "completed"
                    session.total_jobs = saved_count
                    session.breakdown = final_breakdown
                    db.commit()
            except Exception as commit_err:
                print(f"Failed to commit final session stats: {commit_err}")

            if browser: await browser.close()
            if pw: await pw.stop()

job_scout_service = JobScoutService()
