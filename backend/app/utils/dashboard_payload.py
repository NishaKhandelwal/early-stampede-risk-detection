def create_dashboard_payload(result, history=None):
    payload = {
        "camera_id": result["camera_id"],
        "people_count": result["people_count"],
        "density_score": result["density_score"],
        "density_level": result["density_level"],
        "motion_score": result["motion_score"],
        "motion_level": result["motion_level"],
        "risk_level": result["risk_level"],
        "risk_message": result["risk_message"],
        "inference_time": result["inference_time"],
    }

    if history:
        payload["history"] = history

    return payload