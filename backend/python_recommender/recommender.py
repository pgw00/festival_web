# backend/python_recommender/recommender.py
# -*- coding: utf-8 -*-
import sys
import json
import traceback
import requests

CATEGORY_KEYWORDS = {
    '음식': ['먹거리', '음식', '푸드트럭', '맛', '요리', '식도락'],
    '공연예술': ['공연', '뮤지컬', '콘서트', '무대', '댄스', '예술', '연극'],
    '전통문화': ['전통', '민속', '문화재', '사물놀이', '국악', '한복'],
    '야시장': ['야시장', '야간', '밤', '야시장축제', '밤마실'],
}

SPARQL_ENDPOINT = "https://data.visitkorea.or.kr/sparql"
SPARQL_HEADERS = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/sparql-results+json'
}

SPARQL_QUERY = """
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dc: <http://purl.org/dc/elements/1.1/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX vi: <http://www.saltlux.com/transformer/views#>
PREFIX kto: <http://data.visitkorea.or.kr/ontology/>
PREFIX ktop: <http://data.visitkorea.or.kr/property/>
PREFIX ids: <http://data.visitkorea.or.kr/resource/>
PREFIX wgs: <http://www.w3.org/2003/01/geo/wgs84_pos#>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX geo: <http://www.saltlux.com/geo/property#>
PREFIX pf: <http://www.saltlux.com/DARQ/property#>
PREFIX schema: <http://schema.org/>

SELECT ?resource ?name ?description ?address 
WHERE {
  ?resource a ?type ;
            rdfs:label ?name .
  FILTER (?type IN (kto:SpecialFestival, kto:RegularFestival))

  OPTIONAL { ?resource dc:description ?description . }
  OPTIONAL { ?resource ktop:address ?address . }
  OPTIONAL { ?resource schema:image ?image . }

}
LIMIT 100
"""

def match_interest(text, interests):
    if not text:
        return False
    text_lower = text.lower()
    for interest in interests:
        interest_lower = interest.lower()
        matched_keywords = []
        for kw_list in CATEGORY_KEYWORDS.values():
            matched_keywords.extend([kw for kw in kw_list if interest_lower in kw.lower()])
        if matched_keywords:
            for kw in matched_keywords:
                if kw.lower() in text_lower:
                    return True
        else:
            if interest_lower in text_lower:
                return True
    return False

def fetch_festival_data_and_filter(interests):
    try:
        response = requests.post(
            SPARQL_ENDPOINT,
            data={'query': SPARQL_QUERY},
            headers=SPARQL_HEADERS,
            timeout=10
        )
        response.raise_for_status()
        results = response.json().get('results', {}).get('bindings', [])
    except Exception as e:
        print(f"오류: SPARQL 호출 실패 - {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        return []

    festivals = []
    seen_names = set()
    for item in results:
        name = item.get('name', {}).get('value', '')
        description = item.get('description', {}).get('value', '')
        address = item.get('address', {}).get('value', '')
        #image = item.get('image', {}).get('value', '')  # 추가된 이미지 필드

        if name and name not in seen_names:
            if match_interest(name, interests) or match_interest(description, interests):
                festivals.append({
                    '축제명': name,
                    '축제내용': description,
                    '개최장소': address,
                    #'이미지': image  # 응답에 이미지 포함
                })
                seen_names.add(name)

    return festivals

def main():
    try:
        input_str = sys.stdin.read()
        if not input_str.strip():
            print(json.dumps({"recommendations": [], "message": "입력 데이터가 없습니다."}, ensure_ascii=False))
            return

        data = json.loads(input_str)
        interests = data.get('interests', [])

        if not interests:
            print(json.dumps({"recommendations": [], "message": "관심사 목록이 비어있습니다."}, ensure_ascii=False))
            return

        recommendations = fetch_festival_data_and_filter(interests)
        print(json.dumps({"recommendations": recommendations}, ensure_ascii=False))

    except json.JSONDecodeError:
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
