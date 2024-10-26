import React, { useState } from "react";
import { Image, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, CameraType } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import {
  AspectRatio,
  Spinner,
  HStack,
  Icon,
  Text,
  View,
  Pressable,
  Actionsheet,
  useDisclose,
  Center,
  Box,
} from "native-base";
import { urlServer } from "../constants/conn.js";

const GetImageScreen = () => {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const placeholderImage = require("../assets/splash.png");
  const navigation = useNavigation();
  const { isOpen, onOpen, onClose } = useDisclose();

  const setEmptyImage = () => {
    // Hàm này được sử dụng để đặt giá trị của state "image" thành null, làm rỗng ảnh
    setImage(null);
  };

  useFocusEffect(
    React.useCallback(() => {
      // Khi component được focus, đặt giá trị ảnh về null và setLoading về false
      setEmptyImage();
      setLoading(false);
    }, [])
  );

  const pickImage = async () => {
    // Hàm chọn ảnh từ thư viện ảnh
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      // aspect: [4,3],
      quality: 1,
    });

    if (!result.canceled) {
      // Nếu người dùng không hủy bỏ việc chọn ảnh, set giá trị của state "image" thành ảnh đã chọn
      setImage(result.assets[0]);
    }
  };

  const takeImage = async () => {
    // Hàm chụp ảnh từ camera
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // Nếu người dùng không hủy bỏ việc chụp ảnh, set giá trị của state "image" thành ảnh đã chụp
      setImage(result.assets[0]);
    }
  };

  const uploadImage = async () => {
    if (image !== null && image.uri !== null) {
      // Kiểm tra xem có ảnh được chọn để upload không
      setLoading(true); // Đặt trạng thái loading thành true
      const formData = new FormData();
      formData.append("image", {
        uri: image.uri,
        type: "image/*", // Loại ảnh
        name: "image.jpg", // Tên tệp
      });

      try {
        const response = await axios.post(urlServer + "/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Xử lý data từ server

        // Điều hướng đến ResultScreen và truyền dữ liệu
        navigation.navigate("Result", { data: response.data });
      } catch (error) {
        // Xử lý lỗi nếu có
      }
    } else {
      // Thông báo nếu không có ảnh được chọn để upload
      Alert.alert("Thông báo", "Vui lòng chọn ảnh cần nhận dạng!");
    }
  };

  const [selected, setSelected] = React.useState(1);
  return (
    <>
      {loading ? (
        // Hiển thị spinner khi đang loading
        <HStack flex={1} justifyContent="center">
          <Spinner size="lg" />
        </HStack>
      ) : (
        // Hiển thị ảnh được chọn hoặc ảnh mặc định nếu không có ảnh
        <View mt="6%">
          {image !== null && image.uri !== null ? (
            // Hiển thị ảnh từ thư viện nếu tồn tại
            <AspectRatio
              ratio={{
                base: 3 / 4,
                md: 9 / 10,
              }}
            >
              <Image
                source={{ uri: image.uri }}
                resizeMode="contain"
                alt="Ảnh tải lên"
              />
            </AspectRatio>
          ) : (
            // Hiển thị ảnh mặc định nếu không có ảnh được chọn
            <AspectRatio
              ratio={{
                base: 3 / 4,
                md: 9 / 10,
              }}
            >
              <Image
                source={placeholderImage}
                resizeMode="contain"
                alt="Ảnh mặc định"
              />
            </AspectRatio>
          )}
        </View>
      )}

      {/* Actionsheet cho việc chọn ảnh từ thư viện hoặc máy ảnh */}
      <Actionsheet isOpen={isOpen} onClose={onClose} size="full">
        <Actionsheet.Item onPress={pickImage} color="muted.500">
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons
              name="ios-phone-portrait-outline"
              size={24}
              color="black"
            />
            <Text style={{ marginLeft: 10 }}>Mở từ thiết bị</Text>
          </View>
        </Actionsheet.Item>
        <Actionsheet.Item
          onPress={() => {
            requestPermission();
            takeImage();
          }}
          color="muted.500"
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="camera-outline" size={24} color="black" />
            <Text style={{ marginLeft: 10 }}>Máy ảnh</Text>
          </View>
        </Actionsheet.Item>
      </Actionsheet>

      <Box
        position="absolute"
        bottom="0"
        alignItems="stretch"
        width="100%"
        alignSelf="center"
      >
        <HStack bg="green.700" alignItems="center" safeAreaBottom shadow={6}>
          {/* Nút Hoạt động */}
          <Pressable
            cursor="pointer"
            opacity={selected === 0 ? 1 : 0.5}
            py="3"
            flex={1}
            onPress={() => {
              setSelected(0);
              navigation.navigate("Activity");
            }}
          >
            <Center>
              <Icon
                mb="1"
                as={<Ionicons name="notifications" size={24} color="black" />}
                color="white"
                size="lg"
              />
              <Text color="white" fontSize="xs">
                Hoạt động
              </Text>
            </Center>
          </Pressable>

          {/* Nút Mở ảnh */}
          <Pressable
            cursor="pointer"
            opacity={selected === 1 ? 1 : 0.5}
            py="2"
            flex={1}
            onPress={() => {
              setSelected(1);
              onOpen();
            }}
          >
            <Center>
              <Icon
                mb="1"
                as={<Ionicons name="camera" size={24} color="black" />}
                color="white"
                size="lg"
              />
              <Text color="white" fontSize="xs">
                Mở ảnh
              </Text>
            </Center>
          </Pressable>

          {/* Nút Nhận dạng */}
          <Pressable
            cursor="pointer"
            opacity={selected === 3 ? 1 : 0.5}
            py="2"
            flex={1}
            onPress={() => {
              setSelected(3);
              uploadImage();
            }}
          >
            <Center>
              <Icon
                mb="1"
                as={<Ionicons name="navigate" size={24} color="black" />}
                color="white"
                size="lg"
              />
              <Text color="white" fontSize="xs">
                Nhận dạng
              </Text>
            </Center>
          </Pressable>

          {/* Nút Tài khoản */}
          <Pressable
            cursor="pointer"
            opacity={selected === 2 ? 1 : 0.5}
            py="2"
            flex={1}
            onPress={() => {
              setSelected(2);
              navigation.navigate("Logout");
            }}
          >
            <Center>
              <Icon
                mb="1"
                as={<Ionicons name="person" size={24} color="black" />}
                color="white"
                size="lg"
              />
              <Text color="white" fontSize="xs">
                Tài khoản
              </Text>
            </Center>
          </Pressable>
        </HStack>
      </Box>
    </>
  );
};

export default GetImageScreen;
