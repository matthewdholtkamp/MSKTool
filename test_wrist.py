from playwright.sync_api import sync_playwright

def test_wrist():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        # use offline to bypass fetching external resources like FontAwesome that cause timeouts locally
        context = browser.new_context(offline=True)
        page = context.new_page()
        page.goto("file:///app/index.html")

        # Wait for page to load
        page.wait_for_selector("text=Army Medicine")

        # Start Wrist Protocol
        page.locator("button[onclick=\"startProtocol('wrist')\"]").click()

        # Check that visit type page is loaded
        page.wait_for_selector("text=Select the reason for today's encounter")

        # Verify the imaging option is not there
        visible_text = page.locator("#app-root").inner_text()
        assert "Follow-Up (Reviewing Pending Imaging)" not in visible_text, "Imaging option should be absent"
        assert "Initial Consult" in visible_text, "Initial Consult option should be present"

        # Test clicking Follow-Up to verify it skips the old review page and goes to red flags
        page.get_by_role("button", name="Follow-Up (10-14 Day Re-evaluation)").click()

        # Check red flags page is now shown instead of the "Acknowledged and Reviewed" page
        page.wait_for_selector("text=Does the patient have any Red Flags?")
        visible_text = page.locator("#app-root").inner_text()
        assert "Acknowledged and Reviewed" not in visible_text, "Should not show 'Acknowledged and Reviewed' page"

        # Click "No"
        page.get_by_role("button", name="No", exact=True).click()

        # Verify we go directly to Special Tests page instead of arm/elbow exam
        page.wait_for_selector("text=HAND/WRIST SPECIAL TESTS:")
        visible_text = page.locator("#app-root").inner_text()
        assert "ARM/ELBOW EXAM:" not in visible_text, "Should skip ARM/ELBOW EXAM page"

        # Verify the merged content is in Special Tests
        assert "1) Observe:" in visible_text, "Observe section should be in Special Tests"
        assert "4) Bones and Joint Assessment" in visible_text, "Bones section should be in Special Tests"

        print("Wrist protocol tests passed successfully!")

        browser.close()

if __name__ == "__main__":
    test_wrist()
