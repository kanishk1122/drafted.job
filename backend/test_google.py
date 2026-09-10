import asyncio
from playwright.async_api import async_playwright
import urllib.parse

async def test_google_jobs():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=False, channel="chrome")
        context = await browser.new_context()
        page = await context.new_page()
        
        q = "Backend Developer"
        loc = "India"
        url = f"https://www.google.com/search?q={urllib.parse.quote_plus(q)}+jobs+in+{urllib.parse.quote_plus(loc)}&ibp=htl;jobs"
        print(f"Navigating to: {url}")
        
        await page.goto(url)
        await asyncio.sleep(5) # wait for load
        
        with open("google_jobs_page.html", "w", encoding="utf-8") as f:
            f.write(await page.content())
        
        selectors = [
            "div[role='treeitem']", "li.gdEP7b", "div.iS779e", "li.P4g25e", "div.zxw6eb", "div.v7W49e", "div.J1W9bd", "div.BLeRjf", "div.vNEEBe"
        ]
        
        harvest_script = """(sel) => {
            return Array.from(document.querySelectorAll(sel)).map((el, idx) => {
                const direct = el.getAttribute('data-occludable-job-id') || 
                             el.getAttribute('data-job-id') || 
                             el.getAttribute('data-jk') ||
                             el.getAttribute('data-docid') ||
                             el.getAttribute('data-encoded-doc-id') ||
                             (el.id && el.id.length > 3 ? el.id : null);
                if (direct) return String(direct);
                
                const link = el.querySelector('a.jcs-JobTitle, a[data-jk], a.title, a[href*="jobs"]');
                if (link) {
                    const linkId = link.getAttribute('data-jk') || link.getAttribute('data-job-id') || link.getAttribute('data-docid');
                    if (linkId) return String(linkId);
                }

                let scoutId = el.getAttribute('data-scout-id');
                if (!scoutId) {
                    const titleEl = el.querySelector('div.BjS79b, div.vNEEBe, .vNEEBe, h3, a.title, a');
                    const textKey = titleEl ? titleEl.innerText.trim().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 25) : ('card_' + idx);
                    scoutId = 'scout_id_' + idx + '_' + textKey;
                    el.setAttribute('data-scout-id', scoutId);
                }
                return scoutId;
            }).filter(id => !!id);
        }"""
        
        found_ids = []
        found_sel = None
        for sel in selectors:
            ids = await page.evaluate(harvest_script, sel)
            if ids:
                found_ids = ids
                found_sel = sel
                break
                
        print(f"Selector used: {found_sel}")
        print(f"Found IDs: {len(found_ids)}")
        for id in found_ids[:5]:
            print(f" - {id}")
            
            card = await page.query_selector(f"[data-scout-id='{id}'], [data-docid='{id}'], [data-encoded-doc-id='{id}']")
            if card:
                print(f"   -> Card found in DOM")
                title_el = await card.query_selector("div.BjS79b, div.vNEEBe, .vNEEBe, h3, div.heading")
                title = await title_el.inner_text() if title_el else "NO TITLE"
                print(f"   -> Title: {title}")
            else:
                print(f"   -> Card NOT found in DOM")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_google_jobs())
