import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        await page.goto("file:///app/index.html")
        await page.wait_for_selector("text=Select Protocol")

        # Click Ankle Pain
        await page.click("text=Ankle Pain")
        await page.wait_for_selector("text=Visit Type")

        # Click Initial Consult
        await page.click("text=Initial Consult")
        await page.wait_for_selector("text=Red Flags")

        # Click No Red Flags
        await page.click("text=No, NO Red Flags present")
        await page.wait_for_selector("text=Ottawa Ankle Rules")

        # Click No Ottawa Rules
        await page.click("text=No, criteria NOT met for X-Ray")
        await page.wait_for_selector("text=Thompson Test")

        # Click Negative Thompson Test
        await page.click("text=NEGATIVE: Normal plantar flexion present")
        await page.wait_for_selector("text=Is there an antalgic gait")

        # Click Yes (Severe Profile)
        await page.click("text=Yes")
        await page.wait_for_selector("text=Severe Profile")

        await page.screenshot(path="Screenshot 2026-04-11 at 8.00.00 AM.png")
        print("Success")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
