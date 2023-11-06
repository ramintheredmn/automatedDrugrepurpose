from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import pandas as pd
import re


def webScrape(smiles):

    options = Options()
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--headless')
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)


    url = "http://www.swisssimilarity.ch/"
    wait = WebDriverWait(driver, 20)  # Increased wait time to 20 seconds
    driver.get(url)

    # Fill the SMILES box
    smiles_box = wait.until(EC.element_to_be_clickable((By.ID, "smilesBox")))
    smiles_box.send_keys(smiles)  

    # Select from the dropdown
    dropdown = Select(wait.until(EC.presence_of_element_located((By.ID, "compoundClasses"))))
    dropdown.select_by_visible_text("Drugs")

    radio_buttons = driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
    submitButton = driver.find_element(By.ID, "submitButton")
    data = []

    for i, radio in enumerate(radio_buttons[0:-1:10]):
        radio.click()
        submitButton.click()
        driver.implicitly_wait(30)
        
        if len(driver.window_handles) > 1:
            driver.switch_to.window(driver.window_handles[1])
            
            try:
                wait.until(EC.presence_of_element_located((By.CLASS_NAME, "tableResults")), message="No tableResults found!")
                
                tr_elements = driver.find_elements(By.CSS_SELECTOR, "tr[style='height:240px']")
                
                for tr in tr_elements:
                    script_text = tr.find_element(By.TAG_NAME, 'script').get_attribute('innerHTML')
                    smiles_match = re.search(r'SMILES\["(.*?)"\]="(.*?)"', script_text)

                    if smiles_match:
                        smiles_id = smiles_match.group(1)
                        smiles_data = smiles_match.group(2)
                        
                        td_elements = tr.find_elements(By.CSS_SELECTOR, "td[align='left'][valign='top']")
                        for td in td_elements:
                            molecule_id_element = td.find_element(By.TAG_NAME, 'a')
                            molecule_id = molecule_id_element.text
                            score_match = re.search(r'Score : (\d+\.\d+)', td.text)
                            score = score_match.group(1) if score_match else None

                            data.append({
                                "SMILES_ID": smiles_id,
                                "SMILES_data": smiles_data,
                                "Molecule_ID": molecule_id,
                                "Score": score
                            })          
                driver.close()
                driver.switch_to.window(driver.window_handles[0])

            except (TimeoutException, NoSuchElementException):
                print(f"No results for radio button index {i}. Moving on...")
                driver.close()
                driver.switch_to.window(driver.window_handles[0])
                continue

    driver.quit()
    return data