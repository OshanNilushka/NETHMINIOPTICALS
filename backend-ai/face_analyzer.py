import cv2
import mediapipe as mp
import numpy as np

mp_face_mesh = mp.solutions.face_mesh

def detect_face_shape(image_bytes: bytes):
    # Decode image bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        return {"error": "Invalid image file."}
        
    h, w, _ = image.shape
    
    with mp_face_mesh.FaceMesh(
        static_image_mode=True,
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5
    ) as face_mesh:
        # Convert BGR (OpenCV format) to RGB
        results = face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        
        if not results.multi_face_landmarks:
            return {"error": "No face detected in the image."}
            
        landmarks = results.multi_face_landmarks[0].landmark
        
        # Helper to get 2D pixel coordinate of a landmark
        def get_pt(idx):
            pt = landmarks[idx]
            return np.array([pt.x * w, pt.y * h])
            
        # Extract key points for classification:
        # 152: Chin bottom
        # 10: Forehead top center
        # 234, 454: Left/Right cheeks sides
        # 103, 332: Left/Right forehead temples (Frontotemporale)
        # 58, 288: Left/Right jaw angles
        chin = get_pt(152)
        forehead_top = get_pt(10)
        cheek_left = get_pt(234)
        cheek_right = get_pt(454)
        forehead_left = get_pt(103)
        forehead_right = get_pt(332)
        jaw_left = get_pt(58)
        jaw_right = get_pt(288)
        
        # Compute face proportions (Euclidean distances)
        face_length = np.linalg.norm(forehead_top - chin)
        cheekbone_width = np.linalg.norm(cheek_left - cheek_right)
        forehead_width = np.linalg.norm(forehead_left - forehead_right)
        jaw_width = np.linalg.norm(jaw_left - jaw_right)
        
        if cheekbone_width == 0:
            return {"error": "Landmark detection resulted in width of zero."}
            
        # Calculate shape ratio metrics
        length_to_width = face_length / cheekbone_width
        jaw_to_cheek = jaw_width / cheekbone_width
        forehead_to_cheek = forehead_width / cheekbone_width
        
        metrics = {
            "length_to_width": float(length_to_width),
            "jaw_to_cheek": float(jaw_to_cheek),
            "forehead_to_cheek": float(forehead_to_cheek)
        }
        
        # Shape decision rules using range boundary distance + centroid tie-breaker
        def get_range_dist(val, min_val, max_val):
            if val < min_val:
                return min_val - val
            if val > max_val:
                return val - max_val
            return 0.0

        shapes = [
            {
                "name": "Round",
                "aspect": {"min": 1.00, "max": 1.25, "center": 1.125},
                "jaw": {"min": 0.85, "max": 0.95, "center": 0.90},
                "forehead": {"min": 0.80, "max": 0.90, "center": 0.85}
            },
            {
                "name": "Square",
                "aspect": {"min": 1.00, "max": 1.25, "center": 1.125},
                "jaw": {"min": 0.95, "max": 1.05, "center": 1.00},
                "forehead": {"min": 0.90, "max": 1.02, "center": 0.96}
            },
            {
                "name": "Oval",
                "aspect": {"min": 1.35, "max": 1.55, "center": 1.45},
                "jaw": {"min": 0.75, "max": 0.88, "center": 0.815},
                "forehead": {"min": 0.80, "max": 0.90, "center": 0.85}
            },
            {
                "name": "Oblong",
                "aspect": {"min": 1.56, "max": float("inf"), "center": 1.68},
                "jaw": {"min": 0.86, "max": 1.00, "center": 0.93},
                "forehead": {"min": 0.84, "max": 1.00, "center": 0.92}
            },
            {
                "name": "Heart",
                "aspect": {"min": 1.25, "max": 1.50, "center": 1.375},
                "jaw": {"min": 0.65, "max": 0.78, "center": 0.715},
                "forehead": {"min": 0.92, "max": float("inf"), "center": 0.98}
            },
            {
                "name": "Diamond",
                "aspect": {"min": 1.25, "max": 1.62, "center": 1.43},
                "jaw": {"min": 0.70, "max": 0.92, "center": 0.81},
                "forehead": {"min": 0.0, "max": 0.78, "center": 0.72}
            }
        ]

        shape = "Oval"
        min_score = float('inf')

        for s in shapes:
            b_aspect = get_range_dist(length_to_width, s["aspect"]["min"], s["aspect"]["max"]) * 1.0
            b_jaw = get_range_dist(jaw_to_cheek, s["jaw"]["min"], s["jaw"]["max"]) * 1.5
            b_forehead = get_range_dist(forehead_to_cheek, s["forehead"]["min"], s["forehead"]["max"]) * 2.0
            boundary_distance = np.sqrt(b_aspect**2 + b_jaw**2 + b_forehead**2)

            c_aspect = (length_to_width - s["aspect"]["center"]) * 1.0
            c_jaw = (jaw_to_cheek - s["jaw"]["center"]) * 1.5
            c_forehead = (forehead_to_cheek - s["forehead"]["center"]) * 2.0
            centroid_distance = np.sqrt(c_aspect**2 + c_jaw**2 + c_forehead**2)

            # Heavily penalize measurements falling outside the ranges, using centroid distance as tie-breaker
            total_score = boundary_distance * 100.0 + centroid_distance * 1.0
            if total_score < min_score:
                min_score = total_score
                shape = s["name"]

        # Post-processing structural override for extreme cross-over variations
        if shape == "Oblong" and forehead_to_cheek <= 0.78:
            shape = "Long Diamond"

        return {
            "face_shape": shape,
            "metrics": metrics
        }
