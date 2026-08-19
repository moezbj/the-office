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

function sanitizeEnvUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  let trimmed = value.trim();
  if (!trimmed) return undefined;

  const isWrappedInDoubleQuotes =
    trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2;
  const isWrappedInSingleQuotes =
    trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2;

  if (isWrappedInDoubleQuotes || isWrappedInSingleQuotes) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  if (!trimmed || trimmed === "undefined" || trimmed === "null") return undefined;

  const looksLikeHostWithoutProtocol =
    !trimmed.includes("://") && !trimmed.startsWith("/") && /^[\w.-]+:\d+/.test(trimmed);
  if (looksLikeHostWithoutProtocol) {
    trimmed = `http://${trimmed}`;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.hostname === "0.0.0.0") {
        parsed.hostname = "127.0.0.1";
        trimmed = parsed.toString().replace(/\/$/, "");
      }
    } catch {
      return undefined;
    }
  }

  return trimmed;
}

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
const defaultGraphQlUrl = (() => {
  if (typeof window !== "undefined") {
    const protocol = window.location?.protocol;
    const hostname = window.location?.hostname;
    if (
      (protocol === "http:" || protocol === "https:") &&
      typeof hostname === "string" &&
      hostname.length > 0
    ) {
      return `${protocol}//${hostname}:3000/graphql`;
    }
  }
  return "http://localhost:3000/graphql";
})();

const resolveGraphQlUrl = (): string => {
  const explicitGraphQl =
    sanitizeEnvUrl(import.meta.env?.VITE_GRAPHQL_URL) ||
    sanitizeEnvUrl(import.meta.env?.VITE_GRAPHQL_URI);

  if (explicitGraphQl) {
    return explicitGraphQl;
  }

  const envApiUrl =
    sanitizeEnvUrl(import.meta.env?.VITE_API_BASE_URL) ||
    sanitizeEnvUrl(import.meta.env?.VITE_API_URL);

  if (envApiUrl) {
    if (/\/graphql\/?$/i.test(envApiUrl)) {
      return envApiUrl;
    }
    return `${envApiUrl.replace(/\/+$/, "")}/graphql`;
  }

  return defaultGraphQlUrl;
};

const graphQlUrl = resolveGraphQlUrl();

const httpLink = new HttpLink({
  uri: graphQlUrl,
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
      `[Network Error] Cannot reach GraphQL endpoint: ${graphQlUrl}`,
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
            merge(_existing = [], incoming) {
              return incoming;
            },
          },

          appointments: {
            merge(_existing = [], incoming) {
              return incoming;
            },
          },

          bills: {
            merge(_existing = [], incoming) {
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
