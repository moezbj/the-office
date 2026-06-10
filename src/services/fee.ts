import { gql } from "@apollo/client";

export const FETCH_FEES = gql`
  query fees($name: String, $startTime: String, $endTime: String) {
    fees(
      name: $name
      startTime: $startTime
      endTime: $endTime
      status: $status
    ) {
      id
      user {
        id
        firstName
        lastName
      }
      date
      amount
      note
    }
  }
`;
export const FETCH_FEE = gql`
  query fee($id: ID!) {
    fee(id: $id) {
      id
      user {
        id
        firstName
        lastName
      }
      date
      amount
      note
    }
  }
`;

export const CREATE_FEE = gql`
  mutation createFee($input: NewFeeInput!) {
    createFee(input: $input) {
      id
      user {
        firstName
        lastName
      }
      date
      note
      amount
    }
  }
`;

export const UPDATE_FEE = gql`
  mutation updateFee($input: UpdateFeeInput!) {
    updateFee(input: $input) {
      id
      user {
        firstName
        lastName
      }
      date
      amount
      note
    }
  }
`;

export const DELETE_FEE = gql`
  mutation DeleteFee($id: ID!) {
    DeleteFee(id: $id)
  }
`;
