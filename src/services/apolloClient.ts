// src/lib/apollo.ts

import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Token } from "@/types";

let token: Token = {
  accessToken: "",
  expiresIn: "",
  refreshToken: "",
  tokenType: "",
};

export function setToken(nextToken: Token): void {
  token = nextToken;
}

export function getToken(): Token {
  return token;
}

const handleUnauthorized = () => {
  console.warn("Session expired. Logging out...");

  useAuthStore.getState().logout();

  toast.error("Session expired. Please log in again.");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// HTTP Link
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || "http://localhost:3000/graphql",
});

// Auth Link
const authLink = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().token;
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return forward(operation);
});

// Error Link
const errorLink = new ErrorLink(({ error, operation }) => {
  if (!error) return;

  console.error("[Apollo Error]", error, "Operation:", operation.operationName);

  const message = error.message ?? "";

  // Detect network errors
  if (message.includes("Failed to fetch") || message.includes("Network")) {
    console.error(
      `[Network Error] Cannot reach GraphQL endpoint: ${import.meta.env.VITE_GRAPHQL_URL || "http://localhost:3000/graphql"}`,
    );
  }

  if (
    message.includes("Unauthorized") ||
    message.includes("Invalid token") ||
    message.includes("JWT") ||
    message.includes("401")
  ) {
    handleUnauthorized();
  }
});

// Link chain
const link = ApolloLink.from([errorLink, authLink, httpLink]);

export const apolloClient = new ApolloClient({
  link,

  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          patients: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },

          appointments: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },

          bills: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },

    query: {
      fetchPolicy: "cache-first",
    },

    mutate: {},
  },
});
