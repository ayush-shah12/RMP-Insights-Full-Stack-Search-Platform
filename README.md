# RMP Insights Full Stack Platform (Any University, Any Website) [![Run Playwright Tests](https://github.com/ayush-shah12/RMP-Insights-Full-Stack-Search-Platform/actions/workflows/playwright-tests.yml/badge.svg)](https://github.com/ayush-shah12/RMP-Insights-Full-Stack-Search-Platform/actions/workflows/playwright-tests.yml) [![Upload to Chrome Store](https://github.com/ayush-shah12/RMP-Insights-Full-Stack-Search-Platform/actions/workflows/publish-extension.yml/badge.svg)](https://github.com/ayush-shah12/RMP-Insights-Full-Stack-Search-Platform/actions/workflows/publish-extension.yml) [![Deployed on Heroku](https://img.shields.io/badge/deployed-Heroku-430098?logo=heroku&logoColor=white)](https://rmp-server-go-69d9e72e86ec.herokuapp.com/)


## Overview

This is a full-stack application packaged as a Chrome extension that provides seamless access to RateMyProfessors data (and other sources coming soon). Users can input a professor’s name or highlight text on any webpage and trigger a context menu search, which queries our API to fetch detailed, real-time professor ratings and reviews. extension then displays this information in a popup window, eliminating the need for manual navigation or multiple searches. 

We implement a two-layer caching strategy to optimize performance and responsiveness, with average response times under 175ms.
- Local caching: User query parameters (such as last searched professor and selected school) are stored in local storage to persist session state and improve UX by maintaining context even if the popup is closed, navigated away from, or opened in another tab.
- Redis caching: Query results are cached in Redis Cloud with a 14-day TTL. Users can choose to bypass and update cached data based on its age to ensure they receive the most current information without triggering unnecessary backend requests. This approach maintains system scalability and delivers an extremely fast user experience.


## Architecture & Tech Stack

- **Client:**  
  - React + TypeScript for UI components
  - Content scripts and background service workers for Chrome API interaction
  - Chrome Manifest v3 compliant architecture
- **Server:**  
  - Go server implementing REST endpoints  
  - Two-layer caching strategy: Redis & Local
  - Fuzzy (Approximate String Matching) algorithm for improved search accuracy
  - Integration with data sources via GraphQL queries  
- **Testing:**  
  - End-to-end tests using Playwright  
  - Unit and integration tests for Go server  
- **CI/CD:**  
  - Runs Playwright end-to-end tests with the extension loaded into a headless Chromium browser.  
  - Builds, zips, and uploads the extension to the Chrome Web Store.  
  - Auto deployment of the Go server.  

## Installation

- [Chrome Store](https://chromewebstore.google.com/detail/rate-my-professor-extensi/alhijcehgndilnnedijemckkcpnnjolb)

## Developers

- [@Ayush](https://www.github.com/ayush-shah12)
- [@Kamil](https://www.github.com/KamilWoskowiak)

## Images

<table>
  <tr>
    <td><img width="500" alt="Image 1" src="https://github.com/user-attachments/assets/47bce57e-5a2e-4bcd-9c37-a60ecd1b5b8c" /></td>
    <td><img width="500" alt="Image 2" src="https://github.com/user-attachments/assets/1d629831-ae02-4da5-b508-b95d6942fa0f" /></td>
  </tr>
  <tr>
    <td><img width="500" alt="Image 3" src="https://github.com/user-attachments/assets/4b1602bf-c5dc-4b01-a04c-c767e74c542b" /></td>
    <td><img width="500" alt="Image 4" src="https://github.com/user-attachments/assets/a0dc5b5f-9119-4c7f-a100-db908d168644" /></td>
  </tr>
</table>
