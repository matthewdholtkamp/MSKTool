from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # Use offline context to verify it works without network
    context = browser.new_context(offline=True)
    page = context.new_page()
    page.goto("file:///app/index.html")

    # Wait for the header and first button to prove it rendered
    page.wait_for_selector("text=Army Medicine")
    page.wait_for_selector("text=Select Protocol")

    # Click a button
    page.locator("button[onclick=\"startProtocol('neck')\"]").click()

    # Check if the next page rendered
    page.wait_for_selector("text=Traumatic or Acute Neck Pain")

    print("Offline verification successful!")
    browser.close()
