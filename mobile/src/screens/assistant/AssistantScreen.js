import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import apiClient from "../../services/apiClient";
import PostCard from "../../components/PostCard";
import { colors } from "../../theme/theme";

const SUGGESTIONS = [
  "Tìm kèo sân 7 ở Cầu Giấy tối mai",
  "Tìm đối thủ trình độ trung bình cuối tuần",
  "Có kèo nào dưới 100 nghìn không?",
  "Tìm lại từ đầu",
];

export default function AssistantScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Chào bạn! Tôi là Trợ lý tìm kèo. Bạn muốn tìm kèo bóng đá khu vực nào, mấy giờ?",
      posts: [],
      context: {},
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);

  const currentContext = messages[messages.length - 1]?.context || {};
  const hasUserMessage = messages.some((message) => message.role === "user");
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      });
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    setInputText("");
    const userMsgId = Date.now().toString();
    const newMessages = [
      ...messages,
      { id: userMsgId, role: "user", text, posts: [], context: currentContext },
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const endpoint = '/api/v1/assistant/search';
      
      console.log('ASSISTANT REQUEST:', {
        baseURL: apiClient.defaults.baseURL,
        endpoint,
        finalURL: `${apiClient.defaults.baseURL}${endpoint}`,
        payload: {
          message: text,
          conversation_context: currentContext,
          limit: 5,
        },
      });

      const response = await apiClient.post(endpoint, {
        message: text,
        conversation_context: currentContext,
        limit: 5,
      });

      const { reply, filters, posts, suggestions, context } = response.data;

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: reply,
          posts: posts || [],
          context: context || {},
          suggestions: suggestions || [],
        },
      ]);
    } catch (error) {
      let errorDetail = error.message;
      if (error.response) {
        errorDetail += ` (Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)})`;
      }
      
      console.log('ASSISTANT ERROR DETAIL:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        method: error.config?.method,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: `Xin lỗi, đã xảy ra lỗi: ${errorDetail}`,
          posts: [],
          context: currentContext,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveFilters = (context) => {
    if (!context || Object.keys(context).length === 0) return null;
    const parts = [];
    if (context.area) parts.push(context.area);
    if (context.field_type) parts.push(`Sân ${context.field_type}`);
    
    if (context.required_level) {
      const levels = { beginner: "Mới chơi", average: "Trung bình", good: "Khá", advanced: "Nâng cao" };
      parts.push(levels[context.required_level] || context.required_level);
    }
    
    if (context.post_type) {
      const types = { find_opponent: "Tìm đối thủ", find_player: "Tìm thành viên", pass_field: "Pass sân", find_field: "Tìm sân" };
      parts.push(types[context.post_type] || context.post_type);
    }
    
    if (context.match_from) parts.push("Có giới hạn thời gian");
    if (context.max_cost !== undefined) parts.push(`Dưới ${context.max_cost / 1000}k`);

    if (parts.length === 0) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <Text style={styles.activeFiltersText}>Đang tìm: {parts.join(" • ")}</Text>
      </View>
    );
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="football" size={20} color={colors.white} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={[styles.messageBubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
            <Text style={[styles.messageText, isUser ? styles.textUser : styles.textAssistant]}>
              {item.text}
            </Text>
          </View>
          
          {!isUser && item.posts && item.posts.length === 0 && item.text !== "Tôi đã xóa các điều kiện tìm kiếm trước đó. Bạn muốn tìm kèo như thế nào?" && renderActiveFilters(item.context)}

          {item.posts && item.posts.length > 0 && (
            <View style={styles.postsContainer}>
              {item.posts.map((post) => (
                <View key={post.id} style={styles.postCardWrapper}>
                  <PostCard
                    item={post}
                    onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
                  />
                </View>
              ))}
            </View>
          )}

          {item.suggestions && item.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {item.suggestions.map((sg, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionButton}
                  onPress={() => handleSend(sg)}
                >
                  <Text style={styles.suggestionText}>{sg}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          style={styles.messageList}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            !hasUserMessage ? (
              <View style={styles.initialSuggestions}>
                {SUGGESTIONS.map((sg, idx) => (
                  <TouchableOpacity key={idx} style={styles.suggestionButton} onPress={() => handleSend(sg)}>
                    <Text style={styles.suggestionText}>{sg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null
          }
        />

        <View 
          style={[
            styles.composerContainer,
            {
              paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 10)
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={() => handleSend("Tìm lại từ đầu")}
          >
            <Ionicons name="refresh" size={24} color={colors.textLight} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Nhập yêu cầu..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
            multiline={true}
          />

          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={20} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-end",
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowAssistant: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: "85%",
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
  },
  bubbleAssistant: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  textUser: {
    color: colors.white,
  },
  textAssistant: {
    color: colors.text,
  },
  postsContainer: {
    marginTop: 12,
    width: "100%",
  },
  postCardWrapper: {
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  initialSuggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 16,
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "500",
  },
  composerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resetButton: {
    padding: 8,
    marginRight: 4,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 110,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#F1F5F3",
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    marginBottom: 2,
  },
  activeFiltersContainer: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignSelf: "flex-start",
  },
  activeFiltersText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: "500",
  },
});
