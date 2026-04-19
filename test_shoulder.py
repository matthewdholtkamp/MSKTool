from playwright.sync_api import sync_playwright
import os

def test_shoulder():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        file_url = f"file://{os.path.abspath('index.html')}"
        page.goto(file_url)

        # Click shoulder button
        page.wait_for_selector("text=Army Medicine")
        page.locator("button[onclick=\"startProtocol('shoulder')\"]").click()

        # Verify we are on shoulder page
        page.wait_for_selector("text=Traumatic or Acute Shoulder Pain")

        # Click Initial Consult to get to Red Flags
        page.locator("text=Initial Consult (New Injury / Acute)").click()

        # Check for new red flags content
        content = page.locator('#app-root').inner_text()

        assert "Fracture/Dislocation or Major Soft Tissue Injury" in content
        assert "Neurovascular Injury" in content
        assert "Infection or Septic Joint" in content
        assert "Uncertain Exam" in content
        assert "Cervical Spine Pain" in content
        assert "Work up per Neck pain protocol" in content
        assert "Imaging" in content
        assert "If you have a high index of suspicion for fracture" in content

        # Ensure removed items are gone
        assert "Acute Massive Rotator Cuff Tear" not in content
        assert "Tumor / Malignancy" not in content

        # Check references blocks are there
        assert "Signs of Vascular Injury" in content
        assert "Septic Arthritis & Crystal-Induced Arthropathies" in content

        browser.close()
        print("Shoulder protocol tests passed successfully!")

if __name__ == "__main__":
    test_shoulder()
