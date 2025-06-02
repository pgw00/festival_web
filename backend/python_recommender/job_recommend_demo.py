from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time

FESTIVAL_KEYWORDS = [
    "축제행사"
]

def crawl_albamon_festival_jobs(keywords, max_per_keyword=5):
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(options=options)
    results = []

    for keyword in keywords:
        print(f"🔍 '{keyword}' 관련 알바몬 공고 검색 중...")
        search_url = f"https://www.albamon.com/search/search.do?searchText={keyword}"
        driver.get(search_url)

        try:
            # 검색 결과 로딩 대기 + 추가 딜레이
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "ul.jobList > li"))
            )
            time.sleep(2)  # 동적 로딩 추가 대기

            soup = BeautifulSoup(driver.page_source, "html.parser")
            job_items = soup.select("ul.jobList > li")[:max_per_keyword]

            for item in job_items:
                title_tag = item.select_one("a.job_tit")
                if not title_tag:
                    continue
                title = title_tag.get_text(strip=True)
                href = title_tag.get("href")
                full_url = "https://www.albamon.com" + href if href else ""

                company = item.select_one(".company .company_name")
                company_name = company.get_text(strip=True) if company else ""

                results.append({
                    "festival": keyword,
                    "title": title,
                    "company": company_name,
                    "url": full_url
                })

        except Exception as e:
            print(f"[오류] '{keyword}' 알바몬 크롤링 실패: {e}")

    driver.quit()
    return results


if __name__ == "__main__":
    jobs = crawl_albamon_festival_jobs(FESTIVAL_KEYWORDS, max_per_keyword=5)
    print(f"\n총 {len(jobs)}건의 축제 관련 알바몬 공고 수집 완료.")
    for i, job in enumerate(jobs, 1):
        print(f"{i}. [{job['festival']}] {job['title']} - {job['company']}")
        print(f"   URL: {job['url']}\n")
