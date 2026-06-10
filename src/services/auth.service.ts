import { TypedDocumentNode } from "@apollo/client";
import { gql } from "graphql-tag";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  startWork: string;
  endWork: string;
  slotDuration: string;
};

const signup = gql`
  mutation register(
    $email: String!
    $firstName: String!
    $lastName: String!
    $password: String!
    $taxRegistration: String!
  ) {
    register(
      email: $email
      lastName: $lastName
      firstName: $firstName
      password: $password
      taxRegistration: $taxRegistration
    ) {
      token {
        tokenType
        accessToken
        refreshToken
        expiresIn
      }
      user {
        id
        firstName
        lastName
        email
        language
        startWork
        endWork
        slotDuration
        taxRegistration
        country
        currency {
          name
          native
          symbol
        }
      }
    }
  }
`;
const signin = gql`
  mutation login(
    $email: String!
    $password: String!
    $withResources: Boolean!
  ) {
    login(email: $email, password: $password, withResources: $withResources) {
      token {
        tokenType
        accessToken
        refreshToken
        expiresIn
      }
      user {
        id
        firstName
        lastName
        email
        language
        startWork
        endWork
        slotDuration
        taxRegistration
        country
        currency {
          name
          native
          symbol
        }
      }
    }
  }
`;

const profile = gql`
  query user($token: String!) {
    user(token: $token) {
      id
      firstName
      lastName
      email
    }
  }
` as TypedDocumentNode<{ user: User }>;

const refreshToken = gql`
  mutation refresh($token: String!, $userId: String!) {
    refresh(token: $token, userId: $userId) {
      tokenType
      accessToken
      refreshToken
      expiresIn
    }
  }
`;

const forgotPassword = gql`
  mutation forgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;
const resetPassword = gql`
  mutation resetPassword(
    $password: String!
    $confirm: String!
    $token: String!
  ) {
    resetPassword(password: $password, confirm: $confirm, token: $token)
  }
`;

const logout = gql`
  mutation logout($token: String!) {
    logout(token: $token)
  }
`;
const validToken = gql`
  query validToken($tokenType: String!, $token: String!, $userId: String!) {
    validToken(tokenType: $tokenType, token: $token, userId: $userId) {
      user {
        id
      }
      token {
        accessToken
      }
    }
  }
`;
const updateLang = gql`
  mutation updateLanguages($lang: LANGUAGE_TYPE_INPUT!) {
    updateLanguages(lang: $lang)
  }
`;

const updateCountry = gql`
  mutation updateCountry($country: String!, $currency: CurrencyInput) {
    updateCountry(country: $country, currency: $currency) {
      country
      currency {
        name
        native
        symbol
      }
    }
  }
`;

const updateWork = gql`
  mutation updateWork(
    $startWork: String
    $endWork: String
    $slotDuration: String
  ) {
    updateWork(
      startWork: $startWork
      endWork: $endWork
      slotDuration: $slotDuration
    ) {
      startWork
      endWork
      slotDuration
    }
  }
`;

export {
  signin,
  signup,
  profile,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  validToken,
  updateLang,
  updateWork,
  updateCountry,
};
