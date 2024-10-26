from flask_socketio import SocketIO, emit
import os
import time
from flask import Flask, request, jsonify, session, send_file
from flask_session import Session
import _sha256
from flask_cors import CORS, cross_origin
import logging
from PIL import Image
from yolov8 import yolov8_predict
from conn import *
import secrets
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Kích hoạt CORS cho ứng dụng Flask
socketio = SocketIO(app)

# Thiết lập cấu hình cho Flask-Session
app.config["SESSION_TYPE"] = "filesystem"  # Lưu trữ phiên đăng nhập trong tệp
Session(app)


@app.route("/login", methods=["POST"])
@cross_origin()
def login():
    try:
        # Nhận dữ liệu đầu vào từ yêu cầu POST
        data = request.get_json()

        # Trích xuất thông tin từ dữ liệu
        username = data["username"]
        input_password = data["password"]
        password = _sha256.sha256(input_password.encode()).hexdigest()

        # Kết nối đến cơ sở dữ liệu SQLite
        conn = sqlite3.connect("pest.db")
        cursor = conn.cursor()

        # Thực hiện truy vấn để kiểm tra thông tin đăng nhập
        cursor.execute("SELECT * FROM User WHERE username = ?", (username, ))
        user = cursor.fetchone()

        # Đóng kết nối cơ sở dữ liệu
        conn.close()

        if user and user[2] == password:
            # Đăng nhập thành công

            # Lưu thông tin người dùng trong session
            session["username"] = username

            # Tạo token sử dụng thư viện secrets
            token = secrets.token_hex(16)  # Tạo một token ngẫu nhiên

            # Lưu token vào session hoặc database (ở đây lưu trong session)
            session["token"] = token

            # Trả về kết quả đăng nhập thành công với token
            return jsonify({
                "success": True,
                "message": "Đăng nhập thành công",
                "token": token
            })
        else:
            # Đăng nhập không thành công
            return jsonify({
                "success":
                False,
                "message":
                "Tên đăng nhập hoặc mật khẩu không chính xác",
            })
    except Exception as e:
        # Xử lý ngoại lệ và trả về thông báo lỗi
        return jsonify({"success": False, "message": "Lỗi: " + str(e)})


@app.route("/signup", methods=["POST"])
@cross_origin()
def signup():
    # Nhận dữ liệu đầu vào từ yêu cầu POST
    data = request.json
    username = data["username"]
    email = data["email"]
    input_password = data["password"]
    password = _sha256.sha256(input_password.encode()).hexdigest()

    try:
        # Kết nối đến cơ sở dữ liệu SQLite
        conn = sqlite3.connect("pest.db")
        cursor = conn.cursor()

        # Kiểm tra xem tên người dùng đã tồn tại hay chưa
        cursor.execute("SELECT * FROM User WHERE username = ?", (username, ))
        existing_user = cursor.fetchone()

        if existing_user:
            # Trả về thông báo lỗi nếu tên người dùng đã tồn tại
            return jsonify({
                "success": False,
                "message": "Tên người dùng đã tồn tại!"
            })

        # Kiểm tra xem email đã tồn tại hay chưa
        cursor.execute("SELECT * FROM User WHERE email = ?", (email, ))
        existing_email = cursor.fetchone()

        if existing_email:
            # Trả về thông báo lỗi nếu email đã tồn tại
            return jsonify({"success": False, "message": "Email đã tồn tại!"})

        # Thêm người dùng mới vào cơ sở dữ liệu
        cursor.execute(
            "INSERT INTO User (username, email, password) VALUES (?, ?, ?)",
            (username, email, password),
        )
        conn.commit()
        conn.close()

        # Trả về kết quả đăng ký thành công
        return jsonify({"success": True, "message": "Đăng ký thành công"})

    except Exception as e:
        # Trả về thông báo lỗi nếu có lỗi xảy ra trong quá trình đăng ký
        return jsonify({
            "success": False,
            "message": "Đăng ký không thành công: " + str(e)
        })


@app.route("/upload", methods=["POST"])
@cross_origin()
def upload_image():
    try:
        # Kiểm tra xem yêu cầu có chứa hình ảnh không
        if "image" not in request.files:
            return jsonify({"error": "No image part"})

        image = request.files["image"]

        # Kiểm tra xem tệp hình ảnh có tồn tại không
        if image.filename == "":
            return jsonify({"error": "No selected image"})

        # Xử lý và lưu trữ hình ảnh
        img = Image.open(image)

        # Gọi hàm dự đoán từ model
        model = yolov8_predict(img)

        if model != 0:
            # Lấy thời gian hiện tại
            current_time = datetime.now()

            # Chuyển đổi thời gian thành chuỗi với định dạng yyyy-mm-dd HH:MM:SS
            formatted_time = current_time.strftime("%Y-%m-%d %H:%M:%S")

            unique_object_types = []
            image_path = model["image_path"]

            # Lấy id người dùng từ tên người dùng đã đăng nhập
            id_user = get_user_id(session["username"])

            # Duyệt qua danh sách kết quả và kiểm tra "Object type"
            for result in model["results"]:
                object_type = result["Object type"]
                if object_type not in unique_object_types:
                    unique_object_types.append(object_type)

            response_datas = []

            for object_type in unique_object_types:
                # Thực hiện hành động cụ thể cho từng giá trị "Object type"
                for row in select_pest_by_science_name(object_type):
                    id = row[0]
                    pest_name = row[1]
                    science_name = row[2]
                    harm = row[3]
                    handle = row[4]

                    # Lưu thông tin vào bảng lịch sử
                    save_to_history(id_user, id, image_path, formatted_time)

                    response_data = {
                        "science_name": science_name,
                        "image_path":
                        image_path,  # Đường dẫn đến hình ảnh đã lưu
                        "time": formatted_time,  # Thời gian hiện tại
                        "pest_name": pest_name,
                        "harm": harm,
                        "handle": handle,
                    }
                    response_datas.append(response_data)

            # Trả về thông tin về những loại côn trùng được nhận dạng
            return jsonify(response_datas)

    except Exception as e:
        # Trả về thông báo lỗi nếu có lỗi xảy ra trong quá trình xử lý ảnh
        return jsonify({
            "error":
            "An error occurred while processing the image: " + str(e)
        })

    # Trả về phản hồi thành công nếu không có lỗi xảy ra
    return jsonify({"message": "Image uploaded successfully"})


image_dir = "upload"


@socketio.on("connect")
def handle_connect():
    print("Client connected")


@socketio.on("disconnect")
def handle_disconnect():
    print("Client disconnected")


def get_image_list():
    # Trả về danh sách tên các tệp hình ảnh trong thư mục
    return [
        f for f in os.listdir(image_dir)
        if os.path.isfile(os.path.join(image_dir, f))
    ]


@socketio.on("get_images")
def get_images():
    while True:
        time.sleep(1)
        current_image_list = get_image_list()
        emit("update_images", {"images": current_image_list})


@app.route("/getimage/<filename>")
@cross_origin()
def get_image(filename):
    # Trả về hình ảnh dựa trên tên tệp
    image_path = os.path.join(image_dir, filename)
    return send_file(image_path)


@app.route("/getAllImage", methods=["GET"])
@cross_origin()
def get_images_by_user():
    try:
        # Nhận offset từ request
        offset = request.args.get("offset")
        offset = int(
            offset) if offset else 0  # Nếu không có offset thì mặc định là 0

        conn = sqlite3.connect("pest.db")
        cursor = conn.cursor()

        # Truy vấn SQL để lấy 20 bản ghi mới nhất dựa trên user_id, sắp xếp theo thời gian từ mới nhất đến cũ nhất
        query = f"""
            SELECT DISTINCT image, MAX(time) AS newest_time
            FROM History
            WHERE user_id = ?
            GROUP BY image
            ORDER BY newest_time DESC
            LIMIT 20 OFFSET {offset}
        """
        user_id = get_user_id(session["username"])
        cursor.execute(query, (user_id, ))
        data = cursor.fetchall()

        conn.close()

        return jsonify(data)

    except Exception as e:
        return jsonify({"error": str(e)})


@app.route("/get_pest_details", methods=["POST"])
@cross_origin()
def get_pest_details():
    # Nhận dữ liệu JSON từ yêu cầu
    data = request.get_json()
    image = data["image"]
    time = data["time"]

    # Lấy user_id từ session
    user_id = get_user_id(session["username"])

    conn = sqlite3.connect("pest.db")
    cursor = conn.cursor()

    # Thực hiện truy vấn SQL để lấy pest_id từ bảng History dựa trên image, time và user_id
    query = "SELECT pest_id FROM History WHERE image = ? AND time = ? AND user_id = ?"
    cursor.execute(query, (image, time, user_id))
    pest_id = cursor.fetchall()  # Lấy tất cả pest_id

    pest_details = []
    if pest_id:
        for row in pest_id:
            pest_id = row[0]
            # Truy vấn thông tin chi tiết từ bảng Pest dựa trên pest_id
            pest_query = "SELECT * FROM Pest WHERE id = ?"
            cursor.execute(pest_query, (pest_id, ))
            pest_info = cursor.fetchone()
            if pest_info:
                pest_details.append({
                    "id": pest_info[0],
                    "pest_name": pest_info[1],
                    "science_name": pest_info[2],
                    "harm": pest_info[3],
                    "handle": pest_info[4],
                })

    conn.close()

    if pest_details:
        return jsonify({"pest_details": pest_details})
    else:
        return jsonify({"error": "No pest details found"})


@app.route("/get_user", methods=["GET"])
@cross_origin()
def get_user():
    try:
        # Lấy user_id từ session thông qua hàm get_user_id
        user_id = get_user_id(session["username"])

        # Kết nối đến cơ sở dữ liệu SQLite
        conn = sqlite3.connect("pest.db")
        cursor = conn.cursor()

        # Truy vấn thông tin người dùng từ bảng User dựa trên user_id
        cursor.execute("SELECT * FROM User WHERE id = ?", (user_id, ))
        user = cursor.fetchone()
        conn.close()

        if user:
            user_data = {
                "id": user[0],
                "username": user[1],
                "email": user[3],
                # Thêm các thông tin khác của người dùng nếu cần
            }
            return jsonify({"user": user_data})
        else:
            return jsonify({"message": "Không tìm thấy người dùng!"})

    except Exception as e:
        return jsonify(
            {"error": "Lỗi khi truy vấn thông tin người dùng: " + str(e)})


@app.route("/check-token-validity", methods=["POST"])
@cross_origin()
def check_token_validity():
    try:
        received_token = request.json.get("token")

        # Lấy token từ session hoặc cách lưu token trong Flask
        flask_session_token = session.get("token")

        if received_token == flask_session_token:
            return jsonify({"valid": True})
        else:
            return jsonify({"valid":
                            False}), 401  # Trả về mã 401 nếu token không khớp

    except Exception as e:
        return (
            jsonify(
                {"error":
                 "Lỗi khi kiểm tra tính hợp lệ của token: " + str(e)}),
            500,
        )


@app.route("/invalidate-token", methods=["POST"])
@cross_origin()
def invalidate_token():
    try:
        received_token = request.json.get("token")
        received_username = request.json.get("username")

        # Kiểm tra xem token và username nhận được từ client có khớp với session hiện tại không
        if received_username == session.get(
                "username") and received_token == session.get("token"):
            # Hủy session token và username chỉ khi chúng khớp với session hiện tại
            session.pop("token", None)
            session.pop("username", None)
            return jsonify({"success": True, "message": "Sessions đã bị hủy"})
        else:
            return jsonify({"error": "Không khớp với session hiện tại"})
    except Exception as e:
        return jsonify({"error": "Lỗi khi hủy session:" + str(e)}), 500


app.logger.setLevel(logging.INFO)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=81, debug=True)
