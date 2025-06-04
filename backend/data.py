from fastapi import APIRouter, HTTPException, Request
from rapidfuzz import fuzz

from backend.utils import get_school_id_by_code, get_prof, get_tags_comments
from backend.models import ProfessorInfo, Comment, Tag

import json

router = APIRouter()


@router.get("/get_professor_info" , response_model=ProfessorInfo)
async def get_professor_info(request: Request, prof_first_name: str | None = None, prof_last_name: str | None = None, school_code: str | None = None):
    
    if not school_code:
        raise HTTPException(status_code=400, detail="School code is required")

    school_id = get_school_id_by_code(school_code)
    
    if not school_id:
        raise HTTPException(status_code=404, detail="School not found")
    
    redis = None
    if request.app.state.redis_instance:
        redis = request.app.state.redis_instance
        
        # attempt to retrieve from cache based on search params
        search_cache_key = f"professor_info:search:{school_id}:{prof_first_name.lower() if prof_first_name else ''}:{prof_last_name.lower() if prof_last_name else ''}"
        cached = await redis.get(search_cache_key)
        if cached:
            return ProfessorInfo(**json.loads(cached))
        
    # if control is here, cache miss
    try:
        professors = get_prof(prof_first_name, prof_last_name, school_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professors: {str(e)}")
     
    if not professors:
        raise HTTPException(status_code=404, detail="No professors found")
    
    professors = [ProfessorInfo(**prof) for prof in professors]
    
    # get best match
    best_match: ProfessorInfo | None = None
    highest_match_score: int = 0
    
    for prof in professors:
        match_score: int = 0
        
        if prof.firstName.lower() == prof_first_name and prof.lastName.lower() == prof_last_name:
            return prof
            
        if prof.firstName.lower() == prof_first_name and fuzz.ratio(prof.lastName.lower(), prof_last_name) > 70:
            match_score = 95
            
        elif fuzz.ratio(prof.firstName.lower(), prof_first_name) > 70 and prof.lastName.lower() == prof_last_name:
            match_score = 90
            
        elif fuzz.ratio(prof.firstName.lower(), prof_first_name) > 70 and fuzz.ratio(prof.lastName.lower(), prof_last_name) > 70:
            match_score = 85
            
        elif (prof_first_name and prof.firstName.lower() == prof_first_name) or (prof_last_name and prof.lastName.lower() == prof_last_name):
            match_score = 80
            
        elif fuzz.ratio(prof.firstName.lower(), prof_last_name) > 70 or fuzz.ratio(prof.lastName.lower(), prof_first_name) > 70:
            match_score = 70
            
        elif len(prof_first_name) == 1 and prof.firstName.lower().startswith(prof_first_name) and prof.lastName.lower() == prof_last_name:
            match_score = 85
        
        if match_score > highest_match_score:
            highest_match_score = match_score
            best_match = prof
    
    if highest_match_score < 60:
        raise HTTPException(status_code=404, detail="No matching professor found")
    
    # check other caches to avoid querying for tags and comments
    if redis:
        # check ID-based cache
        id_cache_key = f"professor_info:id:{best_match.legacyId}"
        cached = await redis.get(id_cache_key)
        if cached:
            return ProfessorInfo(**json.loads(cached))
        
        # check name-based cache
        name_cache_key = f"professor_info:name:{best_match.firstName.lower()}:{best_match.lastName.lower()}"
        cached = await redis.get(name_cache_key)
        if cached:
            return ProfessorInfo(**json.loads(cached))
    
    # cache miss for the 2 remaining caches, get tags and comments
    best_match.tags, best_match.userCards = get_tags_comments(best_match.legacyId)
    
    # cache everything as if we're here, the cache completely missed
    if redis:
        # cache the professor by id
        id_cache_key = f"professor_info:id:{best_match.legacyId}"
        await redis.set(id_cache_key, json.dumps(best_match.model_dump()), ex=432000)
        
        # cache by search params used
        search_cache_key = f"professor_info:search:{school_id}:{prof_first_name.lower() if prof_first_name else ''}:{prof_last_name.lower() if prof_last_name else ''}"
        await redis.set(search_cache_key, json.dumps(best_match.model_dump()), ex=432000)
        
        # cache by professor name
        name_cache_key = f"professor_info:name:{best_match.firstName.lower()}:{best_match.lastName.lower()}"
        await redis.set(name_cache_key, json.dumps(best_match.model_dump()), ex=432000)
        
    return best_match