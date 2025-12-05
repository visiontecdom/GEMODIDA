import requests
from bs4 import BeautifulSoup

def scrape_website(url, keywords):
    """
    Scrapes the given URL for the specified keywords.

    Args:
        url (str): The website URL to scrape.
        keywords (list): A list of keywords to search for.

    Returns:
        list: A list of matching content snippets.
    """
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        content = soup.get_text()
        matches = [line for line in content.splitlines() if any(keyword in line for keyword in keywords)]
        return matches
    else:
        print(f"Failed to fetch {url}: {response.status_code}")
        return []

if __name__ == "__main__":
    test_url = "https://example.com"
    test_keywords = ["example", "test"]
    results = scrape_website(test_url, test_keywords)
    print("Matches:", results)