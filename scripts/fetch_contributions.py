#!/usr/bin/env python3
"""
GitHub Contribution Data Fetcher
Fetches contribution calendar data from GitHub API and saves to JSON
"""

import os
import json
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any

# Try to load .env file manually
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(project_root, '.env')

if os.path.exists(env_path):
    try:
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        os.environ[key.strip()] = value.strip()
        print(f"Loaded environment variables from: {env_path}")
    except Exception as e:
        print(f"Error reading .env file: {e}")
else:
    print(f".env file not found at: {env_path}")
    print("Using system environment variables")

# GitHub GraphQL API endpoint
GITHUB_API_URL = "https://api.github.com/graphql"

# GraphQL query for contribution data
CONTRIBUTION_QUERY = """
query($userName:String!, $from:DateTime!, $to:DateTime!) {
  user(login: $userName) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            contributionCount
            date
          }
        }
      }
    }
  }
}
"""

def get_contribution_data(username: str, year: int, token: str) -> List[int]:
    """
    Fetch contribution data for a specific year

    Args:
        username: GitHub username
        year: Year to fetch data for
        token: GitHub personal access token

    Returns:
        List of contribution counts for each day of the year
    """
    # Set date range for the year
    from_date = f"{year}-01-01T00:00:00Z"
    to_date = f"{year}-12-31T23:59:59Z"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

    variables = {
        "userName": username,
        "from": from_date,
        "to": to_date
    }

    response = requests.post(
        GITHUB_API_URL,
        json={"query": CONTRIBUTION_QUERY, "variables": variables},
        headers=headers
    )

    if response.status_code != 200:
        print(f"Error fetching data for {year}: HTTP {response.status_code}")
        print(f"Response: {response.text}")
        return []

    data = response.json()

    if "errors" in data:
        print(f"GraphQL errors for {year}: {data['errors']}")
        return []

    # Extract contribution days with dates
    weeks = data["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"]
    contributions = []

    for week in weeks:
        for day in week["contributionDays"]:
            contributions.append({
                'date': day['date'],
                'count': day['contributionCount']
            })

    # Create array for exactly the days in the year
    is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
    days_in_year = 366 if is_leap else 365

    # Initialize array with zeros
    year_contributions = [0] * days_in_year

    # Map contribution data to correct indices
    jan_1 = datetime(year, 1, 1)
    for contrib in contributions:
        contrib_date = datetime.fromisoformat(contrib['date'].replace('Z', '+00:00'))
        if contrib_date.year == year:
            day_of_year = (contrib_date - jan_1).days
            if 0 <= day_of_year < days_in_year:
                year_contributions[day_of_year] = contrib['count']

    return year_contributions

def main():
    # Get environment variables
    github_token = os.getenv("GITHUB_PAT")
    github_username = os.getenv("GITHUB_USERNAME")

    # Debug output
    print(f"GITHUB_PAT: {'***' if github_token else 'Not set'}")
    print(f"GITHUB_USERNAME: {github_username}")

    if not github_token:
        print("Error: GITHUB_PAT environment variable not set")
        print("Please set GITHUB_PAT in your .env file or environment variables")
        return 1

    if not github_username:
        print("Error: GITHUB_USERNAME environment variable not set")
        print("Please set GITHUB_USERNAME in your .env file or environment variables")
        return 1

    print(f"Fetching contribution data for user: {github_username}")

    # Years to fetch (same as in the JavaScript)
    years = [2026, 2025, 2024, 2023, 2022, 2021, 2020]
    contribution_data = {}

    for year in years:
        print(f"Fetching data for {year}...")
        contributions = get_contribution_data(github_username, year, github_token)
        if contributions:
            contribution_data[str(year)] = contributions
            print(f"  Found {len(contributions)} days of data")
        else:
            print(f"  No data found for {year}")

    # Save to JavaScript file
    output_path = "src/data/contributions.js"
    with open(output_path, 'w') as f:
        f.write("// GitHub Contribution Data\n")
        f.write("// Auto-generated by fetch_contributions.py\n")
        f.write("window.contributionData = ")
        json.dump(contribution_data, f, indent=2)
        f.write(";\n")

    print(f"Contribution data saved to {output_path}")
    return 0

if __name__ == "__main__":
    exit(main())