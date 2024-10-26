import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  Input,
  Icon,
  Stack,
  Pressable,
  Link,
  Button,
  Image,
  Center,
} from "native-base";
import { urlServer } from "../constants/conn.js";
const LoginScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Hàm xử lý khi người dùng ấn nút đăng nhập
  const handleLogin = () => {
    // Kiểm tra xem username và password có được nhập hay không
    if (!username || !password) {
      // Hiển thị cảnh báo nếu thiếu thông tin đăng nhập
      Alert.alert("Thông báo", "Vui lòng nhập tên đăng nhập và mật khẩu!");
      return;
    }

    // Tạo một đối tượng chứa thông tin đăng nhập
    const loginData = {
      username: username,
      password: password,
    };

    // Gửi yêu cầu POST đến máy chủ để kiểm tra thông tin đăng nhập
    axios
      .post(urlServer + "/login", loginData)
      .then((response) => {
        const data = response.data;

        // Kiểm tra xem đăng nhập thành công hay không
        if (data.success) {
          // Kiểm tra xem token có tồn tại không trước khi lưu vào AsyncStorage
          if (data.token) {
            // Lưu token vào AsyncStorage
            AsyncStorage.setItem("userToken", data.token)
              .then(() => {
                // Token đã được lưu, chuyển hướng đến màn hình khác sau khi đăng nhập thành công
                navigation.reset({
                  index: 0,
                  routes: [{ name: "GetImage" }],
                });
                Alert.alert("Thông báo", "Đăng nhập thành công!");
              })
              .catch((error) => {
                // Xử lý lỗi khi lưu token
              });
          } else {
            // Token không tồn tại trong phản hồi, xử lý thông báo hoặc xử lý lỗi khác
          }
        } else {
          // Thông báo lỗi nếu đăng nhập không thành công
          Alert.alert(
            "Thông báo",
            "Tên đăng nhập hoặc mật khẩu không chính xác!"
          );
        }
      })
      .catch((error) => {
        // Xử lý lỗi khi gửi yêu cầu đăng nhập
      });
  };

  // Hàm lấy token từ AsyncStorage
  const getTokenFromAsyncStorage = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      return token;
    } catch (error) {
      // Xử lý lỗi khi lấy token từ AsyncStorage
      return null;
    }
  };

  // Hàm kiểm tra tính hợp lệ của token
  const checkToken = async () => {
    const userToken = await getTokenFromAsyncStorage();

    // Kiểm tra xem userToken có tồn tại không
    if (userToken) {
      try {
        // Gửi yêu cầu POST để kiểm tra tính hợp lệ của token trên máy chủ
        const response = await axios.post(urlServer + "/check-token-validity", {
          token: userToken,
        });

        if (response.data.valid) {
          // Token hợp lệ, tiếp tục ứng dụng hoặc thực hiện hành động mong muốn
          navigation.reset({
            index: 0,
            routes: [{ name: "GetImage" }],
          });
        } else {
          // Token không hợp lệ, chuyển hướng đến màn hình đăng nhập
          navigation.navigate("Login");
        }
      } catch (error) {
        // Xử lý lỗi khi gửi yêu cầu kiểm tra token
      }
    } else {
      // Nếu không có token, chuyển hướng đến màn hình đăng nhập
      navigation.navigate("Login");
    }
  };

  // Sử dụng useEffect để kiểm tra token khi component được tạo
  useEffect(() => {
    checkToken();
  }, []);

  const [show, setShow] = React.useState(false);

  return (
    <Center flex={1} px="3">
      <Stack space={4} w="100%" alignItems="center">
        {/* Logo hoặc hình ảnh đại diện của ứng dụng */}
        <Center>
          <Image
            size="50"
            source={require("../assets/favicon.png")}
            alt="Alternate Text"
          />
        </Center>

        {/* Ô nhập tài khoản */}
        <Input
          w={{
            base: "75%",
            md: "25%",
          }}
          InputLeftElement={
            <Icon
              as={<MaterialIcons name="person" />}
              size={5}
              ml="2"
              color="muted.400"
            />
          }
          placeholder="Tài khoản"
          onChangeText={(text) => setUsername(text)}
        />

        {/* Ô nhập mật khẩu */}
        <Input
          w={{
            base: "75%",
            md: "25%",
          }}
          type={show ? "text" : "password"}
          InputRightElement={
            <Pressable onPress={() => setShow(!show)}>
              <Icon
                as={
                  <MaterialIcons
                    name={show ? "visibility" : "visibility-off"}
                  />
                }
                size={5}
                mr="2"
                color="muted.400"
              />
            </Pressable>
          }
          placeholder="Mật khẩu"
          onChangeText={(text) => setPassword(text)}
        />

        {/* Nút đăng nhập */}
        <Button
          w={{
            base: "75%",
            md: "25%",
          }}
          size="xs"
          onPress={handleLogin}
        >
          ĐĂNG NHẬP
        </Button>

        {/* Đường dẫn đến màn hình đăng ký nếu người dùng chưa có tài khoản */}
        <Link
          _text={{
            fontSize: "xs",
            _light: {
              color: "cyan.500",
            },
            color: "cyan.300",
          }}
          isUnderlined
          _hover={{
            _text: {
              _light: {
                color: "cyan.600",
              },
              color: "cyan.400",
            },
          }}
          onPress={() => navigation.navigate("Signup")}
        >
          Bạn chưa có tài khoản?
        </Link>
      </Stack>
    </Center>
  );
};

export default LoginScreen;
