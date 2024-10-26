import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Stack, Text, Button, Heading, Center } from "native-base";
import { urlServer } from "../constants/conn.js";

const LogoutScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);

  // Hàm lấy thông tin người dùng từ máy chủ
  const fetchUserData = async () => {
    try {
      // Gửi yêu cầu GET để lấy thông tin người dùng từ máy chủ
      const response = await axios.get(urlServer + "/get_user");

      // Kiểm tra nếu có dữ liệu người dùng, lưu vào state
      if (response.data.user && response.data.user !== null) {
        // Lưu thông tin người dùng vào state
        setUserData(response.data.user);
      } else {
        // Xử lý trường hợp không có dữ liệu người dùng
      }
    } catch (error) {
      // Xử lý lỗi khi gửi yêu cầu
    }
  };

  // Sử dụng useEffect để gọi hàm fetchUserData khi component được tạo
  useEffect(() => {
    fetchUserData();
  }, []);

  // Hàm đăng xuất và hủy token
  const logoutAndInvalidateToken = async () => {
    try {
      // Lấy token từ AsyncStorage
      const userToken = await AsyncStorage.getItem("userToken");

      // Lấy tất cả keys từ AsyncStorage và xóa chúng
      const allKeys = await AsyncStorage.getAllKeys();
      await Promise.all(allKeys.map((key) => AsyncStorage.removeItem(key)));

      // Gửi yêu cầu POST để hủy token trên máy chủ
      // Gửi thông tin username để hủy session tương ứng trên server
      const response = await axios.post(urlServer + "/invalidate-token", {
        token: userToken,
        username: userData.username,
      });

      // Xóa token từ AsyncStorage
      await AsyncStorage.removeItem("userToken");

      // Thực hiện các hành động khác sau khi đăng xuất
      navigation.navigate("Login");
    } catch (error) {
      // Xử lý lỗi khi đăng xuất
    }
  };

  // Trả về giao diện người dùng với thông tin người dùng và nút đăng xuất
  return (
    <Center flex={1} px="3">
      {/* Kiểm tra xem có thông tin người dùng hay không */}
      {userData ? (
        // Hiển thị thông tin người dùng nếu có
        <Stack alignItems="center" w="100%">
          <Heading my="5%" size="md" color="lightBlue.500">
            Xin chào! {userData.username}
          </Heading>
          <Text>Email: {userData.email}</Text>
        </Stack>
      ) : (
        // Hiển thị thông báo nếu không có thông tin người dùng
        <Text>Không có dữ liệu người dùng</Text>
      )}

      {/* Nút đăng xuất */}
      <Button my="5%" size="xs" onPress={logoutAndInvalidateToken}>
        ĐĂNG XUẤT
      </Button>
    </Center>
  );
};

export default LogoutScreen;
