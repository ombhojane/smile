import requests
from bs4 import BeautifulSoup
import pandas as pd

# Function to scrape content from a Wikipedia page
def scrape_wikipedia(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Extract title
    title = soup.find(id="firstHeading").text
    
    # Extract main content
    content = ""
    for paragraph in soup.find(id="mw-content-text").find_all("p"):
        content += paragraph.text + "\n"
    
    return {"title": title, "content": content, "url": url}

# List of Wikipedia URLs to scrape
wikipedia_urls = [
    "https://en.wikipedia.org/wiki/Culture_of_India",
    "https://en.wikipedia.org/wiki/Ministry_of_Culture_(India)",
    "https://en.wikipedia.org/wiki/Uttarakhand",
    "https://en.wikipedia.org/wiki/Kerala",
    "https://en.wikipedia.org/wiki/Tamil_Nadu",
    "https://en.wikipedia.org/wiki/Tourism_in_India_by_state",
    "https://en.wikipedia.org/wiki/Outline_of_ancient_India",
    "https://en.wikipedia.org/wiki/Punjab,_India",
    "https://en.wikipedia.org/wiki/Haryana",
    "https://en.wikipedia.org/wiki/Nagaland",
    "https://en.wikipedia.org/wiki/Hyderabad",
    "https://en.wikipedia.org/wiki/Bihar",
    "https://en.wikipedia.org/wiki/India",
    "https://en.wikipedia.org/wiki/Telangana",
    "https://en.wikipedia.org/wiki/North_India",
    "https://en.wikipedia.org/wiki/Arunachal_Pradesh",
    "https://en.wikipedia.org/wiki/Goa",
    "https://en.wikipedia.org/wiki/Rajasthan",
    "https://en.wikipedia.org/wiki/Jammu_and_Kashmir",
    "https://en.wikipedia.org/wiki/Andaman_and_Nicobar_Islands",
    "https://en.wikipedia.org/wiki/Mizoram",
    "https://en.wikipedia.org/wiki/Meghalaya",
    "https://en.wikipedia.org/wiki/Manipur",
    "https://en.wikipedia.org/wiki/Chandigarh",
    "https://en.wikipedia.org/wiki/Puducherry",
    "https://en.wikipedia.org/wiki/Tripura",
    "https://en.wikipedia.org/wiki/Assam",
    "https://en.wikipedia.org/wiki/West_Bengal",
    "https://en.wikipedia.org/wiki/Odisha",
    "https://en.wikipedia.org/wiki/Jharkhand",
    "https://en.wikipedia.org/wiki/Bihar",
    "https://en.wikipedia.org/wiki/Chhattisgarh",
    "https://en.wikipedia.org/wiki/Madhya_Pradesh",
    "https://en.wikipedia.org/wiki/Uttar_Pradesh",
]

# Scrape content from all URLs
scraped_data = []
for url in wikipedia_urls:
    scraped_data.append(scrape_wikipedia(url))

# Create a DataFrame from the scraped data
df = pd.DataFrame(scraped_data)

# Display the first few rows of the DataFrame
print(df.head())

# Save the DataFrame to a CSV file
df.to_csv('wikipedia_content.csv', index=False)
print("Data saved to 'wikipedia_content.csv'")