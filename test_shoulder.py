from playwright.sync_api import sync_playwright

def test_shoulder_profiles():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('file:///app/index.html')

        # Click on Shoulder Pain
        page.locator('button[onclick="startProtocol(\'shoulder\')"]').click()

        # We need to get to a screen that displays the profiles, let's say Initial Consult, No Red flags, No Special tests
        page.locator('text=Initial Consult').click()
        page.get_by_role("button", name="No", exact=True).click()
        page.locator('text=No (Negative/Mild special tests, intact strength, full ROM)').click()

        # Expand "Reference: Shoulder Profiles (eProfile)"
        page.locator('summary:has-text("Shoulder Profiles (eProfile)")').click()

        # Check text
        assert "Severe shoulder injury examples:" in page.content()
        assert "Dislocation or instability" in page.content()
        assert "Moderate shoulder injury examples:" in page.content()
        assert "Mild shoulder injury example:" in page.content()
        assert "*If sling is prescribed, direct patient to remove hourly for gentle motion/ no sleeping with sling" in page.content()
        print("Playwright test passed!")
        browser.close()

test_shoulder_profiles()
