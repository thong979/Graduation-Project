import sqlite3


def get_user_id(username):
    try:
        # Kết nối đến cơ sở dữ liệu SQLite
        conn = sqlite3.connect(
            'pest.db')  # Thay 'mydatabase.db' bằng tên cơ sở dữ liệu của bạn

        # Tạo một đối tượng Cursor để thực hiện truy vấn
        cursor = conn.cursor()

        # Thực hiện truy vấn SQL để lấy ID của người dùng dựa trên username
        query = "SELECT id FROM User WHERE username = ?"
        cursor.execute(query, (username, ))

        # Lấy kết quả từ truy vấn
        user_id = cursor.fetchone()

        if user_id:
            user_id = user_id[0]
            return user_id
        else:
            return None  # Trả về None nếu không tìm thấy người dùng

    except sqlite3.Error as e:
        print("Lỗi SQLite:", e)
        return None

    finally:
        # Đóng kết nối đến cơ sở dữ liệu
        conn.close()


def capitalize_first_char(input_str):
    if len(input_str) > 0:
        return input_str[0].upper() + input_str[1:]
    else:
        return input_str


# Hàm để lấy ID của bản ghi trong bảng "Pest" dựa trên danh sách các "science_name"
def select_pest_by_science_name(science_name):
    # Kết nối đến cơ sở dữ liệu SQLite
    # Viết hoa ký tự đầu tiên của tên pest
    cap_science_name = capitalize_first_char(science_name)
    conn = sqlite3.connect('pest.db')
    cursor = conn.cursor()
    # Thực hiện truy vấn SQL để lấy các bản ghi dựa vào trường "science_name"
    cursor.execute("SELECT * FROM Pest WHERE science_name = ?",
                   (cap_science_name, ))
    results = cursor.fetchall()  # Lấy tất cả các kết quả

    # Trả về danh sách các bản ghi
    return results


# Hàm để lưu dữ liệu vào bảng "History"
def save_to_history(user_id, pest_id, image_path, current_time):
    try:
        # Kết nối đến cơ sở dữ liệu SQLite
        conn = sqlite3.connect(
            'pest.db')  # Thay 'pest.db' bằng tên cơ sở dữ liệu của bạn

        # Tạo một con trỏ (cursor) để thực hiện truy vấn
        cursor = conn.cursor()

        # Thực hiện truy vấn SQL để chèn dữ liệu vào bảng "History"
        query = "INSERT INTO History (user_id, pest_id, image, time) VALUES (?, ?, ?, ?)"
        cursor.execute(query, (user_id, pest_id, image_path, current_time))

        # Lưu các thay đổi và xác nhận ghi vào cơ sở dữ liệu
        conn.commit()

    except sqlite3.Error as e:
        print("Lỗi SQLite:", e)

    finally:
        # Đóng kết nối đến cơ sở dữ liệu
        conn.close()
