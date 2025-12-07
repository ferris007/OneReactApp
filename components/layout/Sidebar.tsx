import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
  Animated,
  Pressable,
} from "react-native";
import { Button } from "../ui/Button";
import { useRouter, usePathname } from "expo-router";
import {
  FontAwesome,
  Feather,
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useAuth } from "../../app/context/useAuth";
import { useUserStore } from "../../src/utils/zustandStore";

type NavLink = {
  href: string;
  label: string;
  IconComponent?: any;
  iconName?: string;
  imageSource?: any;
};

export function Sidebar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { reset } = useUserStore()

  const drawerWidth = Math.round(Dimensions.get("window").width * 0.8);

  // Keep modal mounted only while animating or open
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Animated values persist across opens
  const slideX = useRef(new Animated.Value(-drawerWidth)).current;

  const openMenu = () => {
    setIsModalVisible(true);
    // reset position before each open (important for subsequent opens)
    slideX.setValue(-drawerWidth);
    requestAnimationFrame(() => {
      Animated.timing(slideX, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    });
  };

  const closeMenu = (cb?: () => void) => {
    Animated.timing(slideX, {
      toValue: -drawerWidth,
      duration: 240,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      cb?.();
    });
  };

  const clientLinks: NavLink[] = [
    { href: "/ai-coach", label: "ONE", imageSource: require("../../assets/TrasnparentLogo.png") },
    { href: "/profile", label: "Profile", IconComponent: Feather, iconName: "user" },
    { href: "/dashboard", label: "Chatroom", IconComponent: Feather, iconName: "message-square" },
    { href: "/measurements", label: "Measurements", IconComponent: FontAwesome5, iconName: "weight" },
    { href: "/rewards", label: "VII Rewards", IconComponent: MaterialCommunityIcons, iconName: "trophy" },
    // { href: "/attendance", label: "Attendance", IconComponent: FontAwesome5, iconName: "calendar" },
    { href: "/activities", label: "Activities", IconComponent: Ionicons, iconName: "bicycle" },
    { href: "/notification-settings", label: "Notifications & Settings", IconComponent: Feather, iconName: "bell" },
  ];

  const adminLinks: NavLink[] = [
    { href: "/admin", label: "Admin Dashboard", IconComponent: Feather, iconName: "bar-chart-2" },
    { href: "/admin/clients", label: "Manage Clients", IconComponent: Feather, iconName: "users" },
    { href: "/admin/analytics", label: "Analytics", IconComponent: Feather, iconName: "line-chart" },
    { href: "/admin/blog", label: "Manage Blog", IconComponent: Feather, iconName: "book-open" },
  ];

  const NavigationContent = () => (
    <View style={styles.navigationContent}>
      <View style={styles.section}>
        {user ? (
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarFallback}>
                {user?.name?.charAt(0) || user?.username?.charAt(0) || "U"}
              </Text>
            </View>
            <View>
              <Text style={styles.username}>{user?.username}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.logoTitle}>ONE- AI Fitness Trainer - Agent</Text>
        )}

        <View style={styles.linkList}>
          {clientLinks.map(({ href, label, IconComponent, iconName, imageSource }, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                closeMenu(() => router.push(href));
              }}
              style={pathname === href ? styles.activeLink : styles.link}
            >
              {iconName ? (
                <IconComponent
                  name={iconName}
                  size={16}
                  color={pathname === href ? "white" : "black"}
                />
              ) : imageSource ? (
                <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    resizeMode="contain"
                    style={{ width: 18, height: 18 }} source={imageSource} />
                </View>
              ) : (
                <View style={{ width: 15, height: 15 }} />
              )}
              <Text
                style={[
                  pathname === href ? styles.activeLinkText : styles.linkText,
                  { left: label === "ONE" ? -4 : 0 },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {user?.role === "admin" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin</Text>
          <View style={styles.linkList}>
            {adminLinks.map(({ href, label, IconComponent, iconName }) => (
              <Button
                key={href}
                onPress={() => closeMenu(() => router.push(href))}
                style={pathname === href ? styles.activeLink : styles.link}
              >
                <IconComponent
                  name={iconName}
                  size={16}
                  color={pathname === href ? "white" : "black"}
                />
                <Text style={pathname === href ? styles.activeLinkText : styles.linkText}>
                  {label}
                </Text>
              </Button>
            ))}
          </View>
        </View>
      )}

      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            reset()
            closeMenu(() => setTimeout(logout, 150))
          }}
          style={styles.logoutButton}
        >
          <Feather name="log-out" size={16} color="black" />
          <Text style={[styles.linkText, {
            marginLeft: 10,
            fontWeight: '600'
          }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View>
      <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
        <Feather name="menu" size={24} color="black" />
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        onRequestClose={() => closeMenu()}
        animationType="none"
        transparent
      >
        <View style={styles.modalRoot}>
          {/* Overlay sits behind the drawer; press to close */}
          <Pressable style={styles.overlay} onPress={() => closeMenu()} />

          {/* Drawer */}
          <Animated.View
            style={[
              styles.drawer,
              { width: drawerWidth, transform: [{ translateX: slideX }] },
            ]}
          >
            <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 80 }}>
              <NavigationContent />
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },

  // Modal layout
  modalRoot: {
    flex: 1,
    justifyContent: "flex-start",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawer: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },

  scrollView: { flex: 1 },

  navigationContent: {
    flex: 1,
    minHeight: Dimensions.get("window").height - 50,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  section: {
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarFallback: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  linkList: {
    marginTop: 5,
  },
  link: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  activeLink: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007BFF",
  },
  linkText: {
    marginLeft: 20,
    fontSize: 16,
    color: "black",
  },
  activeLinkText: {
    marginLeft: 20,
    fontSize: 16,
    color: "white",
  },
  logoutButtonContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    width: '100%'
  },
});
