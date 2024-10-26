# -*- coding: utf-8 -*-
import sqlite3
# Kết nối hoặc tạo một file cơ sở dữ liệu SQLite
conn = sqlite3.connect('pest.db')

# Tạo một con trỏ (cursor) để thực hiện các truy vấn SQL
cursor = conn.cursor()

# Tạo bảng User
cursor.execute('''
    CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
    )
''')

# Tạo bảng Pest
cursor.execute('''
    CREATE TABLE IF NOT EXISTS Pest (
        id INTEGER PRIMARY KEY,
        pest_name TEXT NOT NULL,
        science_name TEXT NOT NULL,
        harm TEXT NOT NULL,
        handle TEXT NOT NULL
    )
''')

# Tạo bảng History
cursor.execute('''
    CREATE TABLE IF NOT EXISTS History (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        pest_id INTEGER NOT NULL,
        image TEXT NOT NULL,
        time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES User (id),
        FOREIGN KEY (pest_id) REFERENCES Pest (id)
    )
''')

pest_data = [
    ("Rệp sáp giả", "Planococcus citri",
     "Rệp gây hại bằng cách chích hút phần non của cây. Phân của rệp thu hút nấm đen tơi bám quanh nơi rệp định cư làm ảnh hưởng đến quang hợp của cây.",
     "Sử dụng các loại thuốc nhũ dầu làm tan lớp sáp để diệt chúng.\nCó thể phun dầu khoáng để làm ngạt thở, giảm khả năng sinh sản của con cái.\nSử dụng các loài thiên địch như Bọ Rùa, Ong ký sinh."
     ),
    ("Bọ xít xanh", "Rhynchocoris humeralis",
     "Thành trùng và ấu trùng chích hút trái làm cho trái chai, sượng, vàng rồi thối rụng cả trái non lẫn trái già, gây thiệt hại lớn ở các loại cây ăn trái.",
     "Dùng vợt để bắt bọ xít.\nCó thể dùng Kiến Vàng để diệt trứng và con non.\nNếu mật độ cao từ 3 – 5 con trên 100 trái có thể dùng các loại thuốc để diệt trừ, sau 7 – 10 ngày nếu không giảm thì tiếp tục sử dụng thuốc để phun và diệt trừ."
     ),
    ("Ngài chích trái", "Othreis fullonia",
     "Các loài Ngài chích trái thường gây hại nhiều trên trái của các loài cam quýt.\nKhi đậu trên trái chúng dùng vòi chích vào trái để hút nhựa. Trái khi mới bị chích rất khó phát hiện.\nTrái bị chích sẽ thối và rụng sau khoảng 1 tuần. Nơi bị chích sẽ thu hút rất nhiều nấm và vi khuẩn gây hại, cũng như các loài bướm sâu hại khác.",
     "Làm sạch các loại dây leo trong vườn và xung quanh để tránh nơi ẩn náu của bướm.\nĐốt cỏ khô để tạo ra khói xua đuổi các loại bướm.\nLàm bẫy bằng bã chứa nước của trái hoặc dấm trong các bình miệng rộng có thêm thuốc trừ sâu để diệt trừ chúng.\nĐặt bẫy vào ban đêm bằng các loại trái chín như chuối, khóm, … có tẩm thuốc trừ sâu để diệt trừ chúng."
     ),
    ("Rầy chổng cánh", "Diaphorina citri",
     "Ở tuổi nhỏ, ấu trùng sống tập trung và tiết ra các sợi sáp trắng quanh nơi sinh sống.\nRầy tạo mật độ cao vào đầu mùa mưa, khi cây ra lá non và trổ hoa. Cả ấu trùng và thành trùng tập trung chích hút nhựa của trái, lá, chồi non làm khô héo lá, chồi.\nNgoài ra rầy còn truyền vi khuẩn Liberobacter asiaticum gây bệnh Vàng lá gân xanh trên nhóm cây cam quýt.",
     "Sử dụng các loại thiên địch như Ong ký sinh, Bọ Rùa, Kiến Vàng để diệt rầy.\nSử dụng các loại thuốc trừ rầy để phun khi cây ra lá, trái, chồi non.\nKiểm soát mật độ rầy để tránh bệnh vàng lá gân xanh."
     ),
    ("Bướm phượng vàng", "Papilio demoleus",
     "Lúc nhỏ, sâu chỉ ăn lá non và gặm khuyết bì lá, khi lớn sâu có thể ăn cả chồi non, thân non.\nSâu hoạt động chậm chạp và có đặc tính nhả tơ trên bề mặt lá. Khi lớn đủ sức sâu nhả tơ treo mình thành nhộng trên cành cây.",
     "Thường xuyên diệt trứng, sâu và nhộng trên cành cây ăn quả vì chúng rất dễ phát hiện.\nSử dụng thiên địch là Kiến Vàng để diệt chúng, vì nhiều nghiên cứu cho thấy Kiến Vàng hạn chế rất nhiều về mật độ của loài sâu này."
     ),
    ("Câu cấu", "Hypomeces squamosus",
     "Ấu trùng sinh sống dưới đất gây hại bằng cách đục phá rễ cây.\nThành trùng cắn gặm lá, đôi khi ăn trụi cả lá nếu lá non và mật số cao.",
     "Đối với ấu trùng: Áp dụng thuốc trừ sâu ngay gốc cây để diệt trừ.\nĐối với thành trùng: Có thể rung cây để chúng rớt xuống và diệt trừ, hoặc phun các loại thuốc trừ sâu thông dụng ở lá khi có sự xuất hiện của chúng."
     ),
    ("Ruồi đục trái", "Bactrocera dorsalis",
     "Ruồi đục trái đục thủng vỏ trái và đẻ trứng vào nơi tiếp giáp giữa vỏ và thịt trái. Dòi non nở ra và ăn phần thịt trái, càng lớn dòi càng đục sâu vào bên trong trái làm thối và rụng trái.",
     "Nhặt và tiêu hủy tất cả các trái bị hư và rụng xuống đất vì đây là nơi cư trú của con non.\nSử dụng các chất dẫn dụ thuộc loại sex pheromone để quấy rối sự bắt cặp hay chất protein thủy phân để thu hút con cái."
     ),
    ("Bọ xít dài", "Mictis longicornis",
     "Cả ấu trùng và thành trùng đều chích hút lá non, đọt non hoặc trái từ giai đoạn còn non để sắp chín, làm trái sượng và thối rụng. Bọ xít trưởng thành có khả năng di chuyển xa gây thiệt hại nhiều.",
     "Bọ xít trưởng thành có thể dùng vợt để bắt hoặc dùng các loại thuốc trừ sâu đặc trị ít độc. Phải dừng thuốc ít nhất 2 tuần trước khi thu hoạch."
     ),
    ("Sâu ăn bông", "Comibaena",
     "Chúng thường tấn công vào các nụ hoa khi chưa nở nhụy và kết dính các bông khô che kín mình nên rất khó phát hiện.",
     "Sử dụng các loại thuốc phòng trừ khi cây vừa vào giai đoạn ra hoa để phòng chống."
     ),
    ("Sâu đục trái", "Conogethes punctiferalis",
     "Thành trùng hoạt động chủ yếu vào ban đêm và đẻ trứng nơi giữa trái và cuốn hoặc lá.\nSâu tấn công khi trái còn non, nở ra và trú ở phần cuối của trái. Sâu có thể đục trái từ lúc non đến khi thu hoạch làm trái sượng, khô, hư thối và rụng.",
     "Sử dụng các loại bao trái.\nBóc bỏ lá đài của trái để sâu không đẻ trứng được.\nSử dụng thuốc trừ sâu đặc trị để phun khi trái vào giai đoạn bị ảnh hưởng bởi sâu."
     )
]

for data in pest_data:
    pest_name, science_name, harm, handle = data
    cursor.execute(
        "INSERT INTO Pest (pest_name, science_name, harm, handle) VALUES (?, ?, ?, ?)",
        (pest_name, science_name, harm, handle))
# Lưu các thay đổi và đóng kết nối cơ sở dữ liệu
conn.commit()
conn.close()
