import React, { useState, useEffect } from "react";
import { Image } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import {
  AspectRatio,
  Spinner,
  Icon,
  HStack,
  Text,
  Pressable,
  Actionsheet,
  useDisclose,
  Center,
  Box,
  ScrollView,
} from "native-base";
import { urlServer } from "../constants/conn.js";

const HistoryScreen = ({ route }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const placeholderImage = require("../assets/splash.png");
  const { image, time } = route.params.data;

  useEffect(() => {
    // Kiểm tra trạng thái loading
    if (loading) {
      // 1.5 giây
      const delay = 1500;

      // Tạo một timer để tự động đặt lại trạng thái loading sau 1.5 giây
      const timer = setTimeout(() => {
        // Đặt lại trạng thái loading thành false
        setLoading(false);

        // Thực hiện các hàm sau khi loading đã tồn tại trong 1.5 giây
      }, delay);

      // Đảm bảo clear timer khi component unmount
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Khởi tạo state để lưu trữ chi tiết về loại côn trùng
  const [pestDetails, setPestDetails] = useState([]);

  useEffect(() => {
    // Hàm để fetch chi tiết về loại côn trùng dựa trên ảnh và thời gian
    const fetchPestDetails = async (image, time) => {
      try {
        const data = {
          image: image,
          time: time,
        };

        // Gửi yêu cầu POST để lấy chi tiết về loại côn trùng từ máy chủ
        const response = await axios.post(
          urlServer + "/get_pest_details",
          data
        );

        // Lưu chi tiết về loại côn trùng vào state
        setPestDetails(response.data.pest_details);
      } catch (error) {
        // Xử lý lỗi khi fetch chi tiết về loại côn trùng
      }
    };

    // Gọi hàm fetchPestDetails khi image hoặc time thay đổi
    fetchPestDetails(image, time);
  }, [image, time]);

  // Tạo đường dẫn URL đến ảnh trên máy chủ
  urlImage = urlServer + `/getimage/${image}`;

  // Hàm để tải ảnh về thiết bị
  const saveImage = async () => {
    const uri = urlImage;

    try {
      // Lấy phần mở rộng của tệp ảnh từ URL
      const imgExt = uri.split(".").pop();

      // Download ảnh từ URL và lưu vào thư mục document của thiết bị
      const downloadResult = await FileSystem.downloadAsync(
        uri,
        FileSystem.documentDirectory + "image." + imgExt
      );

      if (downloadResult && downloadResult.uri) {
        const localUri = downloadResult.uri;

        const asset = await MediaLibrary.createAssetAsync(localUri);

        // Tạo một album có tên "Pest" và lưu ảnh vào album đó
        await MediaLibrary.createAlbumAsync("Pest", asset, false);
      } else {
        // Xử lý khi download không thành công
      }
    } catch (error) {
      // Xử lý lỗi khi tải ảnh về thiết bị
    }
  };

  const [selected, setSelected] = React.useState(1);
  const { isOpen, onOpen, onClose } = useDisclose();

  return (
    <>
      {loading ? (
        <HStack flex={1} justifyContent="center">
          <Spinner size="lg" />
        </HStack>
      ) : (
        <Box mt="6%">
          {image !== null && image.length !== 0 ? (
            <AspectRatio
              ratio={{
                base: 3 / 4,
                md: 9 / 10,
              }}
            >
              <Image
                source={{ uri: urlServer + `/getimage/${image}` }}
                resizeMode="contain"
                alt="Ảnh tải lên"
              />
            </AspectRatio>
          ) : (
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
        </Box>
      )}

      <Box
        position="absolute"
        bottom="0"
        alignItems="stretch"
        width="100%"
        alignSelf="center"
      >
        <HStack bg="green.700" alignItems="center" safeAreaBottom shadow={6}>
          {/* Nút "Trở về" */}
          <Pressable
            cursor="pointer"
            opacity={selected === 1 ? 1 : 0.5}
            py="2"
            flex={1}
            onPress={() => {
              setSelected(1);
              navigation.navigate("Activity");
            }}
          >
            <Center>
              <Icon
                mb="1"
                as={<Ionicons name="refresh-circle" size={24} color="black" />}
                color="white"
                size="lg"
              />
              <Text color="white" fontSize="xs">
                Trở về
              </Text>
            </Center>
          </Pressable>

          {/* Nút "Tải về" */}
          <Pressable
            cursor="pointer"
            opacity={selected === 0 ? 1 : 0.5}
            py="3"
            flex={1}
            onPress={() => {
              setSelected(0);
              saveImage();
            }}
          >
            <Center>
              <Icon
                mb="1"
                as={<Ionicons name="cloud-download" size={24} color="black" />}
                color="white"
                size="lg"
              />
              <Text color="white" fontSize="xs">
                Tải về
              </Text>
            </Center>
          </Pressable>

          {/* Nút "Thông tin" */}
          <Pressable
            cursor="pointer"
            opacity={selected === 3 ? 1 : 0.5}
            py="2"
            flex={1}
            onPress={() => {
              setSelected(3);
              onOpen();
            }}
          >
            <Center>
              <Icon
                mb="1"
                as={<Ionicons name="alert-circle" size={24} color="black" />}
                color="white"
                size="lg"
              />
              <Text color="white" fontSize="xs">
                Thông tin
              </Text>
            </Center>
          </Pressable>

          {/* Nút "Tài khoản" */}
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

      {/* Hiển thị thông tin nhận dạng trong Actionsheet */}
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <Actionsheet.Content
          _dragIndicator={{
            bg: "blue.500",
          }}
        >
          <Text
            mb="3%"
            bold
            fontSize="16"
            color="cyan.700"
            _dark={{
              color: "gray.300",
            }}
          >
            Thông tin nhận dạng
          </Text>
          <ScrollView w="100%">
            {pestDetails.map((item, index) => (
              <Box
                key={index}
                margin="2%"
                borderBottomStyle="solid"
                borderBottomWidth="1"
                borderBottomColor="cyan.500"
              >
                <Box px={4} justifyContent="center">
                  <Text bold color="cyan.600">
                    Tên côn trùng gây hại
                  </Text>

                  <Text ml="1">{item.pest_name}</Text>
                </Box>
                <Box mt="2%" px={4} justifyContent="center">
                  <Text bold color="cyan.600">
                    Tên khoa học
                  </Text>

                  <Text ml="1">{item.science_name}</Text>
                </Box>
                <Box mt="2%" px={4} justifyContent="center">
                  <Text bold color="cyan.600">
                    Khả năng gây hại
                  </Text>

                  <Text ml="1">{item.harm}</Text>
                </Box>
                <Box mt="2%" px={4} justifyContent="center">
                  <Text bold color="cyan.600">
                    Biện pháp phòng trừ
                  </Text>
                  <Text ml="1">{item.handle}</Text>
                </Box>
                <Box mt="2%" mb="2%" px={4} justifyContent="center">
                  <Text bold color="cyan.600">
                    Thời gian nhận dạng
                  </Text>

                  <Text ml="1">{time}</Text>
                </Box>
              </Box>
            ))}
          </ScrollView>
        </Actionsheet.Content>
      </Actionsheet>
    </>
  );
};

export default HistoryScreen;
