/* eslint-disable @typescript-eslint/no-explicit-any */
import localforage from "localforage";
import { useContext } from "react";
//import { useTranslation } from "react-i18next";

import { setToken } from "@/services/apolloClient";
import { Auth } from "@/types";
import { AuthContext } from "@/providers/AuthProvider";
import { useAuthStore } from "@/store/authStore";
import graphQLResult from "@/lib/graphQLResult";
import { useMutation } from "@apollo/client/react";
import { toast } from "react-hot-toast";
//import { Language } from "@/config/i18n";

function useAuth({ mutation, options = {}, stayConnected = true }: any): any {
  const { setUser } = useContext(AuthContext);
  //const { i18n } = useTranslation();

  function persistUser(data: Auth): void {
    const result = { ...data };
    if (!stayConnected) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete result.token.refreshToken;
    }
    localforage.setItem("auth", JSON.stringify(result));
  }
  const [call, state] = useMutation(mutation, {
    ...options,
    onCompleted: (data: Auth) => {
      toast.success("Connexion réussie !");
      const result = graphQLResult(
        data as unknown as Record<string, unknown>,
      ) as unknown as Auth;

      setToken(result.token);
      persistUser(result);
      setUser(result.user);
      // Update Zustand store so ProtectedRoute can check isAuthenticated()
      useAuthStore.setState({
        token: result.token.accessToken,
        user: result.user,
      });
      // i18n.changeLanguage(result.user.language as Language);
      if (options.onCompleted) {
        options.onCompleted(data);
      }
    },
    onError: (error: any) => {
      toast.error("Erreur de connexion : " + error.message);
    },
  });

  return [call, state];
}

export default useAuth;
