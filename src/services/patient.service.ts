import { Patient } from "@/types";
import { gql, TypedDocumentNode } from "@apollo/client";

export const FETCH_PATIENTS: TypedDocumentNode<{ patients: Patient[] }> = gql`
  query patients {
    patients {
      id
      name
      note
      birthDate
      email
      phone
      insurance
      addressedBy
      startDate
      endDate
    }
  }
`;
export const FETCH_PATIENT = gql`
  query getPatient($id: ID!) {
    getPatient(id: $id) {
      id
      name
      note
      birthDate
      email
      phone
      insurance
      addressedBy
      startDate
      endDate
    }
  }
`;

export const CREATE_PATIENT = gql`
  mutation createPatient($input: NewPatientInput!) {
    createPatient(input: $input) {
      name
      note
      birthDate
      email
      phone
      insurance
      addressedBy
      startDate
      endDate
    }
  }
`;

export const UPDATE_PATIENT = gql`
  mutation updatePatient($input: UpdatePatientInput!) {
    updatePatient(input: $input) {
      id
      name
      note
      birthDate
      email
      phone
      insurance
      addressedBy
      startDate
      endDate
    }
  }
`;

export const DELETE_PATIENT = gql`
  mutation DeletePatient($deletePatientId: ID!) {
    deletePatient(id: $deletePatientId)
  }
`;
