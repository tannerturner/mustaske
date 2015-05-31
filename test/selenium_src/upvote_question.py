# -*- coding: utf-8 -*-
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import NoAlertPresentException
import unittest, time, re

class AskQuestion(unittest.TestCase):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.implicitly_wait(30)
        self.base_url = "http://localhost:3000/"
        self.verificationErrors = []
        self.accept_next_alert = True
    
    def test_ask_question(self):
        driver = self.driver
        driver.get(self.base_url)
        driver.maximize_window()
        owner = driver.window_handles[0]
        driver.find_element_by_css_selector("input.form-control").clear()
        driver.find_element_by_css_selector("input.form-control").send_keys("Test_Room")
        driver.find_element_by_id("make-room").click()

        ownerRoomName = driver.find_element_by_css_selector("span.navbar-brand.room-name").text
        self.assertEqual("Test_Room",ownerRoomName)
        driver.find_element_by_css_selector("span.fa.fa-cogs").click()
        ownerRoomID = driver.find_element_by_class_name("drop-down-room-id").text
        
        driver.execute_script("$(window.open('"+self.base_url+"'))")
        user1 = driver.window_handles[-1]
        driver.switch_to_window(user1)
        driver.maximize_window()
        driver.find_element_by_css_selector("input.form-control").clear()
        driver.find_element_by_css_selector("input.form-control").send_keys(ownerRoomID)
        driver.find_element_by_id("join-room").click()

        q1 = "Test_Question1"
        q2 = "Test_Question2"
        q3 = "Test_Question3"
        driver.find_element_by_css_selector("input.form-control.add-question-text").clear()
        driver.find_element_by_css_selector("input.form-control.add-question-text").send_keys(q1)
        driver.find_element_by_css_selector("button.btn.btn-default.add-question-btn").click()
        driver.find_element_by_css_selector("input.form-control.add-question-text").clear()
        driver.find_element_by_css_selector("input.form-control.add-question-text").send_keys(q2)
        driver.find_element_by_css_selector("button.btn.btn-default.add-question-btn").click()
        driver.find_element_by_css_selector("input.form-control.add-question-text").clear()
        driver.find_element_by_css_selector("input.form-control.add-question-text").send_keys(q3)
        driver.find_element_by_css_selector("button.btn.btn-default.add-question-btn").click()

        driver.execute_script("$(window.open('"+self.base_url+"'))")
        user2 = driver.window_handles[-1]
        driver.switch_to_window(user2)
        driver.maximize_window()
        driver.find_element_by_css_selector("input.form-control").clear()
        driver.find_element_by_css_selector("input.form-control").send_keys(ownerRoomID)
        driver.find_element_by_id("join-room").click()

        driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[1]/div/div/div/div[2]/div/ul/li[1]/a/i").click()
        driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[3]/div/div/div/div[2]/div/ul/li[3]/a/i").click()
    
        driver.execute_script("$(window.open('"+self.base_url+"'))")
        user3 = driver.window_handles[-1]
        driver.switch_to_window(user3)
        driver.maximize_window()
        driver.find_element_by_css_selector("input.form-control").clear()
        driver.find_element_by_css_selector("input.form-control").send_keys(ownerRoomID)
        driver.find_element_by_id("join-room").click()

        driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[1]/div/div/div/div[2]/div/ul/li/a/i").click()
        driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[2]/div/div/div/div[2]/div/ul/li/a/i").click()
        driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[3]/div/div/div/div[2]/div/ul/li/a/i").click()
           
        xpath1 = "//div[@id='recent-questions-container']/div[1]/div/div/div/div[2]/div/ul/li/a/i"
        xpath2 = "//div[@id='recent-questions-container']/div[2]/div/div/div/div[2]/div/ul/li/a/i"
        xpath3 = "//div[@id='recent-questions-container']/div[3]/div/div/div/div[2]/div/ul/li/a/i"
        self.assertEqual("fa fa-2x fa-thumbs-up clicked", driver.find_element(By.XPATH, xpath1).get_attribute('class'))
        self.assertEqual("fa fa-2x fa-thumbs-up clicked", driver.find_element(By.XPATH, xpath2).get_attribute('class'))
        self.assertEqual("fa fa-2x fa-thumbs-up clicked", driver.find_element(By.XPATH, xpath3).get_attribute('class'))

        for i in range(3,1):
            driver.switch_to_window(driver.window_handles[i])
            self.assertEqual("2", driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[1]/div/div/div/div[2]/div/ul/li[2]/span").text)
            self.assertEqual("1", driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[2]/div/div/div/div[2]/div/ul/li[2]/span").text)
            self.assertEqual("0", driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[3]/div/div/div/div[2]/div/ul/li[2]/span").text) 
            self.assertEqual(q3, driver.find_element_by_xpath("//div[@id='top-questions-container']/div[1]/div/div/p").text)
            self.assertEqual(q2, driver.find_element_by_xpath("//div[@id='top-questions-container']/div[2]/div/div/p").text)

        driver.switch_to_window(owner)
        self.assertEqual("2", driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[1]/div/div/div/div/div/ul/li/span").text)
        self.assertEqual("1", driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[2]/div/div/div/div/div/ul/li/span").text)
        self.assertEqual("0", driver.find_element_by_xpath("//div[@id='recent-questions-container']/div[3]/div/div/div/div/div/ul/li/span").text)
        self.assertEqual(q3, driver.find_element_by_xpath("//div[@id='top-questions-container']/div[1]/div/div/p").text)
        self.assertEqual(q2, driver.find_element_by_xpath("//div[@id='top-questions-container']/div[2]/div/div/p").text)

    def is_element_present(self, how, what):
        try: self.driver.find_element(by=how, value=what)
        except NoSuchElementException as e: return False
        return True
    
    def is_alert_present(self):
        try: self.driver.switch_to_alert()
        except NoAlertPresentException as e: return False
        return True
    
    def close_alert_and_get_its_text(self):
        try:
            alert = self.driver.switch_to_alert()
            alert_text = alert.text
            if self.accept_next_alert:
                alert.accept()
            else:
                alert.dismiss()
            return alert_text
        finally: self.accept_next_alert = True
    
    def tearDown(self):
        self.driver.quit()
        self.assertEqual([], self.verificationErrors)

if __name__ == "__main__":
    unittest.main()
