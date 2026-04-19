from playwright.sync_api import sync_playwright

def test_knee():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("file:///app/index.html")

        # Wait for page to load
        page.wait_for_selector("text=Army Medicine")

        # Start Knee Protocol
        page.locator("button[onclick=\"startProtocol('knee')\"]").click()

        # Check that visit type page is loaded
        page.wait_for_selector("text=Patient Reports With Traumatic or Acute Knee Pain")

        # Verify the imaging option is not there
        visible_text = page.locator("#app-root").inner_text()
        assert "Follow-Up (Reviewing Pending Imaging)" not in visible_text, "Imaging option should be removed"
        assert "Initial Consult (New Injury / Acute)" in visible_text, "Initial Consult option should be present"

        # Test clicking Initial Consult
        page.locator("button:has-text('Initial Consult (New Injury / Acute)')").click()

        # Check red flags page
        page.wait_for_selector("text=Does the patient have any Red Flags?")

        # Click "No"
        page.locator("button:has-text('No')").click()

        # Verify we go directly to exam
        page.wait_for_selector("text=EXAM Findings:")
        visible_text = page.locator("#app-root").inner_text()
        assert "Review the Pending X-Rays or MRI" not in visible_text, "Should skip review results page"

        print("Knee protocol tests passed successfully!")

        browser.close()

if __name__ == "__main__":
    test_knee()
