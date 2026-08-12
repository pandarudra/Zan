import { api } from "@/lib/api";
import { useCallback, useState } from "react";

type UserRecord = {
  id: string | null;
  name: string | null;
  email: string | null;
  role: string | null;
  walletAddress: string | null;
};

export const useUser = () => {
  const [userLoading, setUserLoading] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(null);

  const loadUser = useCallback(async () => {
    setUserLoading(true);

    try {
      const data = await api.get("/api/auth/me");
      const nextUser = data?.user ?? null;
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      console.error("Failed to load user", error);
      setUser(null);
      return null;
    } finally {
      setUserLoading(false);
    }
  }, []);

  return {
    userloading: userLoading,
    userLoading,
    user,
    setUser,
    setUserLoading,
    loadUser,
  };
};
