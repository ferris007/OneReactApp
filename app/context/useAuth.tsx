// src/context/AuthContext.tsx

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

type User = {
    id: string;
    name: string;
    email: string;
    token: string;
};

type AuthContextType = {
    user: Partial<User> | null;
    loading: boolean;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (newData: Partial<User>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Error loading user:", error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (userData: User | null) => {
        try {
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem("user");
            await AsyncStorage.removeItem("token");
            await setUser(null);

            // Reset stack
            router.replace({ pathname: "/auth" });
        } catch (error) {
            console.error("Error removing user:", error);
        }
    };

    const updateUser = async (newData: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...newData };
        try {
            await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
