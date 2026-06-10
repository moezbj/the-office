import { isAfter } from "date-fns";
import localforage from "localforage";
import { useEffect, useRef, useState } from "react";

import { setToken } from "@/services/apolloClient";
import { Auth, User } from "@/types";
import { refreshToken } from "@/services/auth.service";
import { useMutation } from "@apollo/client/react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useStartup(onDone: (user: User) => void): boolean {
  const [done, setDone] = useState(false);
  const [refresh] = useMutation(refreshToken, {
    onError: () => {
      localforage.removeItem("auth");
      setDone(true);
    },
    onCompleted: (data: any) => {
      localforage.setItem("auth", JSON.stringify(data.refresh));
      onDone(data.refresh.user);
      setToken(data.refresh.token);
      setDone(true);
    },
  });

  const called = useRef(false);

  useEffect(() => {
    if (!called.current) {
      called.current = true;
      localforage
        .getItem<string | null>("auth")
        .then((authString) => {
          if (authString) {
            const auth: Auth = JSON.parse(authString);
            if (!auth.token.refreshToken) {
              if (isAfter(new Date(auth.token.expiresIn), new Date())) {
                setToken(auth.token);
              }
              setDone(true);
            } else {
              refresh({
                variables: {
                  refreshToken: auth.token.refreshToken,
                  user: auth.user.id,
                },
              });
            }
          } else {
            setDone(true);
          }
        })
        .catch(() => setDone(true));
    }
  }, []);

  return done;
}
