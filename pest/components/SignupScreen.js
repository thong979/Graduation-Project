import React, { useState } from "react";
import { Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
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

const SignupScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    // Kiểm tra xem username, email và password có được nhập hay không
    if (!username || !email || !password) {
      // Nếu thiếu thông tin, hiển thị cảnh báo
      Alert.alert(
        "Thông báo",
        "Vui lòng điền đầy đủ thông tin cần thiết cho đăng ký!",
      );
      return;
    }

    // Kiểm tra xem mật khẩu xác nhận có khớp với mật khẩu hay không
    if (password !== confirmPassword) {
      Alert.alert("Thông báo", "Mật khẩu xác nhận không khớp với mật khẩu!");
      return;
    }

    // Tạo một đối tượng chứa thông tin đăng ký
    const signupData = {
      username: username,
      email: email,
      password: password,
    };

    // Gửi yêu cầu POST đến máy chủ Flask bằng Axios
    axios
      .post(urlServer + "/signup", signupData)
      .then((response) => {
        // Xử lý phản hồi từ máy chủ
        const data = response.data;

        if (data.success) {
          // Nếu đăng ký thành công, chuyển hướng đến màn hình đăng nhập
          navigation.navigate("Login");

          // Hiển thị cảnh báo thông báo thành công
          Alert.alert("Thông báo", "Đăng ký thành công!");
        } else {
          // Nếu đăng ký không thành công, hiển thị thông báo lỗi từ máy chủ
          Alert.alert("Thông báo", "Đăng ký không thành công: " + data.message);
        }
      })
      .catch((error) => {
        // Xử lý lỗi nếu có lỗi khi gửi yêu cầu đăng ký
      });
  };

  const [show, setShow] = React.useState(false);
  return (
    <Center flex={1} px="3">
      <Stack space={4} w="100%" alignItems="center">
        {/* Hiển thị hình ảnh */}
        <Center>
          <Image
            size="50"
            source={require("../assets/favicon.png")}
            alt="Alternate Text"
          />
        </Center>

        {/* Ô nhập thông tin tài khoản */}
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

        {/* Ô nhập thông tin email */}
        <Input
          w={{
            base: "75%",
            md: "25%",
          }}
          InputLeftElement={
            <Icon
              as={<MaterialIcons name="email" />}
              size={5}
              ml="2"
              color="muted.400"
            />
          }
          placeholder="Email"
          onChangeText={(text) => setEmail(text)}
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

        {/* Ô nhập để xác nhận lại mật khẩu */}
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
          placeholder="Nhập lại mật khẩu"
          onChangeText={(text) => setConfirmPassword(text)}
        />

        {/* Nút để kích hoạt hàm xử lý đăng ký */}
        <Button
          w={{
            base: "75%",
            md: "25%",
          }}
          size={"xs"}
          onPress={handleSignup}
        >
          ĐĂNG KÝ
        </Button>

        {/* Liên kết để chuyển đến màn hình đăng nhập */}
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
          onPress={() => navigation.navigate("Login")}
        >
          Bạn đã có tài khoản?
        </Link>
      </Stack>
    </Center>
  );
};

export default SignupScreen;
