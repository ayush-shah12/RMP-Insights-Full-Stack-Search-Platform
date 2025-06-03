from backend.models import Comment, Tag

import pandas as pd
import requests
import json
from bs4 import BeautifulSoup
from typing import Union

HEADERS = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': 'Basic dGVzdDp0ZXN0',
        'Connection': 'keep-alive',
        'Content-Length': '1467',
        'Content-Type': 'application/json',
        'Host': 'www.ratemyprofessors.com',
        'Origin': 'https://www.ratemyprofessors.com',
    }

URL = "https://www.ratemyprofessors.com/graphql"


def get_school_id_by_code(school_code) -> str | None:
    data = pd.read_csv("schools.csv")
    
    school_id = data.loc[data['code'] == school_code, 'id']
    
    return school_id.iloc[0] if not school_id.empty else None
    

def get_prof(first: str | None = None, last: str | None = None, school_code: str | None = None) -> list[dict]:
    
    def _form_payload():
        return {
        "query": """query TeacherSearchResultsPageQuery(
          $query: TeacherSearchQuery!
          $schoolID: ID
          $includeSchoolFilter: Boolean!
        ) {
          search: newSearch {
            ...TeacherSearchPagination_search_1ZLmLD
          }
          school: node(id: $schoolID) @include(if: $includeSchoolFilter) {
            __typename
            ... on School {
              name
            }
            id
          }
        }

        fragment TeacherSearchPagination_search_1ZLmLD on newSearch {
          teachers(query: $query, first: 8, after: "") {
            didFallback
            edges {
              cursor
              node {
                ...TeacherCard_teacher
                id
                __typename
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            resultCount
            filters {
              field
              options {
                value
                id
              }
            }
          }
        }

        fragment TeacherCard_teacher on Teacher {
          id
          legacyId
          avgRating
          numRatings
          ...CardFeedback_teacher
          ...CardSchool_teacher
          ...CardName_teacher
          ...TeacherBookmark_teacher
        }

        fragment CardFeedback_teacher on Teacher {
          wouldTakeAgainPercent
          avgDifficulty
        }

        fragment CardSchool_teacher on Teacher {
          department
          school {
            name
            id
          }
        }

        fragment CardName_teacher on Teacher {
          firstName
          lastName
        }

        fragment TeacherBookmark_teacher on Teacher {
          id
          isSaved
        }""",
        "variables": {
            "query": {
                "text": f"{first if first else ''} {last if last else ''}",
                "schoolID": school_code,
                "fallback": True,
                "departmentID": None
            },
            "schoolID": school_code,
            "includeSchoolFilter": True
        }
    }
        
        
    response = requests.post(
        url=URL,
        headers=HEADERS,
        data=json.dumps(_form_payload())
    )
    
    response.raise_for_status()
    
    data: list = []
    
    for item in response.json()['data']['search']['teachers']['edges']:
        data.append(item['node'])
    return data


def get_tags_comments(code: str) -> Union[list[Tag], list[Comment]]:
  num_comments = 6  # MAX NUMBER OF COMMENTS ALLOWED

  url = f"https://www.ratemyprofessors.com/professor/{code}"
  page = requests.get(url)
  soup = BeautifulSoup(page.text, 'html.parser')

  tags_html = soup.find_all('div', {'class': 'TeacherTags__TagsContainer-sc-16vmh1y-0 dbxJaW'})
  tags: list[Tag] = []
  for tag_div in tags_html:
      spans = tag_div.find_all('span', class_='Tag-bs9vf4-0 hHOVKF')
      for span in spans:
          tag_name = span.get_text(strip=True)
          tags.append(Tag(name=tag_name))

  cards = soup.find_all(class_='Rating__RatingInfo-sc-1rhvpxz-3 kEVEoU')
  comments: list[Comment] = []
  
  for card in cards[:num_comments]:
      course_elem = card.find('div', class_='RatingHeader__StyledClass-sc-1dlkqw1-3 eXfReS')
      course = course_elem.get_text(strip=True) if course_elem else "N/A"

      date_elem = card.find('div', class_='TimeStamp__StyledTimeStamp-sc-9q2r30-0 bXQmMr RatingHeader__RatingTimeStamp-sc-1dlkqw1-4 iwwYJD')
      date = date_elem.get_text(strip=True) if date_elem else "N/A"

      comment_elem = card.find('div', class_='Comments__StyledComments-dzzyvm-0 gRjWel')
      comment = comment_elem.get_text(strip=True) if comment_elem else "N/A"

      wta = "N/A"
      wta_list = card.find_all('div', class_='MetaItem__StyledMetaItem-y0ixml-0 LXClX')
      for wta_elem in wta_list:
          span = wta_elem.find('span')
          if 'Would Take Again' in wta_elem.get_text() and span:
              wta = span.get_text(strip=True)
      
      comments.append(Comment(
          course=course,
          date=date,
          comment=comment,
          wta=wta
      ))
      
  return tags, comments
