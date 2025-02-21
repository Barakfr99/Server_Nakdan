import time
import re
import sys
from playwright.sync_api import sync_playwright

def check_web_scraping_method(word):
    """
    שולף אפשרויות ניקוד מלאות, מסיר מספרי שורות, מוחק את כל האפשרות שבה מופיע "[מקור]".
    """
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)  # מצב "רקע" (headless) כדי שהתוסף לא יפריע
            page = browser.new_page()
            page.goto("https://nakdan.dicta.org.il/")

            # הכנסת המילה לתיבת הטקסט
            page.fill("textarea", word)

            # לחיצה על "החל ניקוד"
            page.click("button:has-text('החל ניקוד')")

            # המתנה לטעינת המילה המנוקדת
            time.sleep(3)

            # חיפוש כל חלקי המילה המנוקדת
            span_elements = page.query_selector_all("span[data-v-2b92a5ec]")
            reconstructed_word = "".join([el.inner_text().strip() for el in span_elements])

            # הסרת כפילות אם המילה מופיעה פעמיים ברצף
            if len(reconstructed_word) == len(word) * 2:
                reconstructed_word = reconstructed_word[:len(word)]
            
            if reconstructed_word:
                span_elements[0].click()  # לוחץ על החלק הראשון כדי לפתוח את האפשרויות
            else:
                browser.close()
                return []

            # המתנה לטעינת תפריט האפשרויות
            time.sleep(2)

            # חיפוש כל האפשרויות בתוך "option-row"
            option_rows = page.query_selector_all("div.option-row.clickable-option-row")

            nikud_options = []
            for row in option_rows:
                spans = row.query_selector_all("span[data-v-136ad3c8]")  # שליפת כל חלקי המילה
                full_word = "".join([el.inner_text().strip() for el in spans if el.inner_text().strip()])
                if full_word:
                    nikud_options.append(full_word)

            # הסרת מספרי שורות מההתחלה
            nikud_options = [re.sub(r"^\d+", "", opt).strip() for opt in nikud_options]

            # מחיקת כל אפשרות שמכילה "[מקור]"
            nikud_options = [opt for opt in nikud_options if "[מקור]" not in opt]

            # הסרת כפילויות
            nikud_options = list(set(nikud_options))

            browser.close()

            return nikud_options

    except Exception as e:
        print(f"Error: {e}")
        return []

if __name__ == "__main__":
    if len(sys.argv) > 1:
        word = sys.argv[1]
        results = check_web_scraping_method(word)
        print(results)
    else:
        print("❌ לא הוזנה מילה לבדיקה.")
