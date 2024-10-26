import React from "react";
import { Image } from "react-native";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import { Ionicons } from "@expo/vector-icons";
import {
  AspectRatio,
  Alert,
  Icon,
  Link,
  VStack,
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

const ResultScreen = ({ navigation, route }) => {
  const placeholderImage = require("../assets/splash.png");

  // Kiểm tra nếu không có dữ liệu nhận dạng được truyền qua tham số route
  if (route.params.data.length === 0) {
    // Trả về một màn hình thông báo nếu không có dữ liệu nhận dạng
    return (
      <Center flex="3">
        {/* Thông báo lỗi */}
        <Alert mt="6%" ml="2%" mr="2%" mb="2%" w="96%" status="error">
          <VStack space={2} flexShrink={1} w="100%">
            <HStack
              flexShrink={1}
              space={1}
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack space={2} flexShrink={1} alignItems="center">
                <Alert.Icon />
                <Text
                  fontSize="md"
                  fontWeight="medium"
                  _dark={{
                    color: "coolGray.800",
                  }}
                >
                  Nhận dạng thất bại!
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Alert>

        {/* Thông báo lưu ý */}
        <Alert margin="2%" w="96%" status="info" colorScheme="info">
          <VStack space={2} flexShrink={1} w="100%">
            <HStack
              flexShrink={1}
              space={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <HStack flexShrink={1} space={2} alignItems="center">
                <Alert.Icon />
                <Text fontSize="md" fontWeight="medium" color="coolGray.800">
                  Lưu ý!
                </Text>
              </HStack>
            </HStack>
            <Box
              pl="6"
              _text={{
                color: "coolGray.600",
              }}
            >
              <Text>
                Vui lòng đảm bảo kết nối internet, ảnh chụp chính xác đối tượng
                cần nhận dạng để đạt được kết quả nhận dạng tốt nhất.
              </Text>
              <Text>
                Hãy thử lại để có thể nhận dạng được loại côn trùng gây hại...
              </Text>
            </Box>
          </VStack>
        </Alert>

        {/* Liên kết để chuyển đến màn hình chụp ảnh lại */}
        <Center marginTop="2%" marginBottom="5%">
          <Link
            _text={{
              fontSize: "md",
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
            onPress={() => navigation.navigate("GetImage")}
          >
            Thử lại?
          </Link>
        </Center>
      </Center>
    );
  } else {
    // Lấy đường dẫn của ảnh từ tham số được truyền vào từ màn hình trước
    const imagePath = route.params.data[0].image_path;
    urlImage = urlServer + `/getimage/${imagePath}`;

    // Hàm để lưu ảnh xuống thiết bị
    const saveImage = async () => {
      const uri = urlImage;

      try {
        // Lấy phần mở rộng của tệp ảnh từ URL
        const imgExt = uri.split(".").pop();

        // Tải ảnh từ URL và lưu xuống thư mục tài liệu của thiết bị
        const downloadResult = await FileSystem.downloadAsync(
          uri,
          FileSystem.documentDirectory + "image." + imgExt
        );

        // Kiểm tra xem quá trình tải và lưu ảnh có thành công hay không
        if (downloadResult && downloadResult.uri) {
          // Lấy đường dẫn cục bộ của ảnh đã lưu
          const localUri = downloadResult.uri;

          const asset = await MediaLibrary.createAssetAsync(localUri);

          // Tạo một album có tên "Pest" và lưu ảnh vào album đó
          await MediaLibrary.createAlbumAsync("Pest", asset, false);
        } else {
          // Xử lý trường hợp nếu quá trình tải và lưu ảnh không thành công
          // Có thể thêm xử lý lỗi hoặc hiển thị thông báo lỗi ở đây
        }
      } catch (error) {
        // Xử lý lỗi nếu có bất kỳ lỗi nào xảy ra trong quá trình thực hiện
      }
    };

    const [selected, setSelected] = React.useState(1);
    const { isOpen, onOpen, onClose } = useDisclose();

    return (
      <>
        {/* Box chứa hình ảnh */}
        <Box mt="6%">
          {/* Kiểm tra nếu urlImage không null thì hiển thị ảnh, ngược lại hiển thị ảnh mặc định */}
          {urlImage !== null ? (
            <AspectRatio
              ratio={{
                base: 3 / 4,
                md: 9 / 10,
              }}
            >
              <Image
                source={{ uri: urlImage }}
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

        {/* Box chứa thanh điều hướng */}
        <Box
          position="absolute"
          bottom="0"
          alignItems="stretch"
          width="100%"
          alignSelf="center"
        >
          <HStack bg="green.700" alignItems="center" safeAreaBottom shadow={6}>
            {/* Nút để quay lại màn hình chụp ảnh */}
            <Pressable
              cursor="pointer"
              opacity={selected === 1 ? 1 : 0.5}
              py="2"
              flex={1}
              onPress={() => {
                setSelected(1);
                navigation.navigate("GetImage");
              }}
            >
              <Center>
                <Icon
                  mb="1"
                  as={
                    <Ionicons name="refresh-circle" size={24} color="black" />
                  }
                  color="white"
                  size="lg"
                />
                <Text color="white" fontSize="xs">
                  Trở về
                </Text>
              </Center>
            </Pressable>

            {/* Nút để tải về ảnh */}
            <Pressable
              cursor="pointer"
              opacity={selected === 0 ? 1 : 0.5}
              py="3"
              flex={1}
              onPress={() => {
                setSelected(0);
                saveImage(urlImage);
              }}
            >
              <Center>
                <Icon
                  mb="1"
                  as={
                    <Ionicons name="cloud-download" size={24} color="black" />
                  }
                  color="white"
                  size="lg"
                />
                <Text color="white" fontSize="xs">
                  Tải về
                </Text>
              </Center>
            </Pressable>

            {/* Nút để xem thông tin nhận dạng */}
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

            {/* Nút để chuyển đến màn hình tài khoản */}
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

        {/* Actionsheet chứa thông tin nhận dạng */}
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

            {/* Scrollview chứa thông tin chi tiết của nhận dạng */}
            <ScrollView w="100%">
              {route.params.data.map((item, index) => (
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
                    <Text ml="1">{item.time}</Text>
                  </Box>
                </Box>
              ))}
            </ScrollView>
          </Actionsheet.Content>
        </Actionsheet>
      </>
    );
  }
};

export default ResultScreen;
