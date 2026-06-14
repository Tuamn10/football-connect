import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";

import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

import {
  colors,
  shadows,
} from "../theme/theme";

import AppLoadingScreen from "../screens/AppLoadingScreen";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

import FeedScreen from "../screens/main/FeedScreen";
import NotificationsScreen from "../screens/main/NotificationsScreen";

import MyPostsScreen from "../screens/posts/MyPostsScreen";
import CreatePostScreen from "../screens/posts/CreatePostScreen";

import ProfileScreen from "../screens/profile/ProfileScreen";

import FieldMapScreen from "../screens/FieldMapScreen";
import PostDetailScreen from "../screens/posts/PostDetailScreen";

const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />

      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          title: "Đăng ký",
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
        }}
      />
    </AuthStack.Navigator>
  );
}

function CenterTabButton({
  onPress,
  accessibilityState,
  style,
}) {
  const selected =
    accessibilityState?.selected;

  return (
    <Pressable
      onPress={onPress}
      style={[
        style,
        styles.centerButtonWrapper,
      ]}
    >
      <View
        style={[
          styles.centerButton,
          selected &&
            styles.centerButtonSelected,
        ]}
      >
        <Ionicons
          name="add"
          size={31}
          color={colors.white}
        />
      </View>

      <Text
        style={[
          styles.centerButtonLabel,
          selected &&
            styles.centerButtonLabelSelected,
        ]}
      >
        Đăng kèo
      </Text>
    </Pressable>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor:
          colors.primary,

        tabBarInactiveTintColor:
          colors.textLight,

        tabBarHideOnKeyboard: true,

        tabBarStyle: styles.tabBar,

        tabBarLabelStyle:
          styles.tabBarLabel,

        tabBarIcon: ({
          color,
          focused,
        }) => {
          const iconNames = {
            Home: focused
              ? "home"
              : "home-outline",

            MyPosts: focused
              ? "calendar"
              : "calendar-outline",

            Notifications: focused
              ? "notifications"
              : "notifications-outline",

            Profile: focused
              ? "person"
              : "person-outline",
          };

          return (
            <Ionicons
              name={
                iconNames[route.name] ||
                "ellipse-outline"
              }
              size={focused ? 24 : 22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={FeedScreen}
        options={{
          tabBarLabel: "Trang chủ",
        }}
      />

      <Tab.Screen
        name="MyPosts"
        component={MyPostsScreen}
        options={{
          tabBarLabel: "Kèo của tôi",
        }}
      />

      <Tab.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          tabBarLabel: "",
          tabBarIcon: () => null,

          tabBarButton: (props) => (
            <CenterTabButton {...props} />
          ),
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Thông báo",
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Cá nhân",
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{
          headerShown: false,
        }}
      />

      <RootStack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        options={{
          title: "Chi tiết bài đăng",
          headerShadowVisible: false,
          headerTintColor: colors.text,
        }}
      />

      <RootStack.Screen
        name="FieldMap"
        component={FieldMapScreen}
        options={{
          title: "Sân bóng quanh bạn",
          headerShadowVisible: false,
          headerTintColor: colors.text,
        }}
      />
    </RootStack.Navigator>
  );
}

export default function AppNavigator() {
  const {
    user,
    loadingAuth,
  } = useAuth();

  if (loadingAuth) {
    return <AppLoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user
        ? <MainNavigator />
        : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 7,
    paddingBottom: 9,
    borderTopWidth: 0,
    backgroundColor: colors.white,
    ...shadows.card,
  },

  tabBarLabel: {
    fontSize: 10,
    fontWeight: "700",
  },

  centerButtonWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: -18,
  },

  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: colors.white,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 8,
  },

  centerButtonSelected: {
    backgroundColor: colors.primaryDark,
  },

  centerButtonLabel: {
    marginTop: 1,
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: "700",
  },

  centerButtonLabelSelected: {
    color: colors.primary,
  },
});