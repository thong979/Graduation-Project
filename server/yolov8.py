from ultralytics import YOLO
from PIL import Image
import time
import os
import random
import string


def generate_random_string(length):
    characters = string.ascii_letters + string.digits  # Chữ cái và số
    return ''.join(random.choice(characters) for _ in range(length))


# Đường dẫn đến thư mục "upload"
UPLOAD_DIR = 'upload'  # Thay đổi thành đường dẫn của thư mục upload của bạn

# Tạo thư mục "upload" nếu nó chưa tồn tại
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Load a model
model = YOLO('best.pt')  # Thay đổi thành mô hình của bạn


def yolov8_predict(image_path):
    try:
        results = model.predict(image_path, save=False, imgsz=640, conf=0.5)
        result = results[0]

        predictions = []
        for box in result.boxes:
            class_id = result.names[box.cls[0].item()]
            confidence = box.conf[0].item()

            cords = [round(x) for x in box.xyxy[0].tolist()]
            conf = round(confidence, 2)
            prediction = {
                "Object type": class_id,
                "Coordinates": cords,
                "Probability": conf
            }
            predictions.append(prediction)

        if predictions:
            current_time = int(time.time())
            random_string = generate_random_string(10)
            image_name = f'{random_string}{current_time}.jpg'
            im = Image.fromarray(result.plot()[:, :, ::-1])
            im.save(os.path.join(UPLOAD_DIR, image_name))
        else:
            image_name = None

        result = {"results": predictions, "image_path": image_name}
        return result
    except Exception as e:
        return 'Error processing prediction: ' + str(e)
