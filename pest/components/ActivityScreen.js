import React, { useState, useEffect } from "react";
import { Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import {
  AspectRatio,
  Spinner,
  Heading,
  VStack,
  Stack,
  HStack,
  Text,
  Button,
  ScrollView,
  Center,
} from "native-base";
import { urlServer } from "../constants/conn.js";

const ActivityScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [offset, setOffset] = useState(0);

  const fetchData = async () => {
    try {
      // Bắt đầu thực hiện yêu cầu, đặt trạng thái loading là true
      setLoading(true);

      // Gửi yêu cầu GET đến server để lấy dữ liệu ảnh
      const response = await axios.get(
        urlServer + `/getAllImage?offset=${offset}`
      );

      // Kiểm tra xem có dữ liệu trả về không và có ít nhất một mục hay không
      if (response.data && response.data.length > 0) {
        // Cập nhật state "data" bằng cách thêm dữ liệu mới vào cuối mảng đã có
        setData((prevData) => [...prevData, ...response.data]);

        // Tăng giá trị offset lên 20 để lấy các mục tiếp theo trong lần lấy dữ liệu sau
        setOffset((prevOffset) => prevOffset + 20);
      }
    } catch (error) {
      // Xử lý lỗi nếu có
    } finally {
      // Kết thúc việc thực hiện yêu cầu, đặt trạng thái loading là false dù có thành công hay thất bại
      setLoading(false);
    }
  };

  useEffect(() => {
    // Gọi hàm fetchData khi component được mount lần đầu tiên
    fetchData();
  }, []);

  // Hàm xử lý sự kiện Scroll để xác định điều kiện thực hiện hàm fetchData
  const handleScroll = ({ nativeEvent }) => {
    // Lấy thông tin chiều cao và vị trí của layout
    const layoutHeight = nativeEvent.layoutMeasurement.height;
    const contentHeight = nativeEvent.contentSize.height;
    const offset = nativeEvent.contentOffset.y;

    // Tính toán khoảng cách đến vị trí cuối cùng của nội dung
    const distanceToBottom = contentHeight - layoutHeight - offset;

    // Nếu khoảng cách ít hơn 20% của chiều cao layout, thì thực hiện fetchData
    if (distanceToBottom < layoutHeight * 0.2) {
      // Gọi hàm setLoading để hiển thị trạng thái loading
      setLoading(true);
      // Gọi hàm fetchData để lấy thêm dữ liệu
      fetchData();
    }
  };

  return (
    <Center>
      {/* Tiêu đề của màn hình hoạt động nhận dạng */}
      <Stack mt="6%" w="100%" alignItems="center">
        <Heading pb="2.5" color="cyan.600" alignItems="center" size="sm">
          Hoạt động nhận dạng
        </Heading>
      </Stack>

      {/* ScrollView chứa danh sách các mục hoạt động nhận dạng */}
      <ScrollView mb={2.5} onScroll={handleScroll}>
        <VStack space="2.5" mt="4" px="2">
          {/* Lặp qua dữ liệu để hiển thị các mục hoạt động nhận dạng */}
          {data.map((item, index) => (
            <HStack
              borderRadius="md"
              bgColor="warmGray.200"
              key={index}
              space={2}
              flexShrink={1}
              alignItems="center"
            >
              {/* Hiển thị ảnh được tải lên */}
              <AspectRatio
                mx={2.5}
                my={2.5}
                alignItems="start"
                ratio={{
                  base: 3 / 4,
                  md: 9 / 10,
                }}
                height={{
                  base: 65,
                  md: 65,
                }}
              >
                <Image
                  source={{ uri: urlServer + `/getimage/${item[0]}` }}
                  resizeMode="cover"
                  alt="Ảnh tải lên"
                />
              </AspectRatio>

              {/* Hiển thị thông tin chi tiết và nút Chi tiết */}
              <Stack w="75%" space={2} alignItems="flex-end">
                <Text>{item[1]}</Text>
                <Button
                  size="xs"
                  onPress={() =>
                    navigation.navigate("History", {
                      data: { image: item[0], time: item[1] },
                    })
                  }
                >
                  Chi tiết
                </Button>
              </Stack>
            </HStack>
          ))}
        </VStack>

        {/* Hiển thị trạng thái loading nếu đang tải dữ liệu */}
        {loading ? (
          <HStack space={2} my="2.5%" justifyContent="center">
            <Spinner accessibilityLabel="Loading posts" />
          </HStack>
        ) : (
          <HStack space={2} my="2.5%" justifyContent="center"></HStack>
        )}
      </ScrollView>
    </Center>
  );
};

export default ActivityScreen;
