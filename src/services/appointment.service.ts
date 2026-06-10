import { Appointment } from "@/types";
import { gql, TypedDocumentNode } from "@apollo/client";

export const FETCH_APPOINTMENTS: TypedDocumentNode<{
  appointments: Appointment[];
}> = gql`
  query appointments(
    $name: String
    $startTime: String
    $endTime: String
    $status: String
  ) {
    appointments(
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
      patient {
        id
        name
        phone
      }
      startTime
      endTime
      price
      note
      status
    }
  }
`;
export const FETCH_APPOINTMENT = gql`
  query getAppointment($id: ID!) {
    getAppointment(id: $id) {
      id
      user {
        id
        firstName
        lastName
      }
      patient {
        id
        name
        phone
      }
      startTime
      endTime
      price
      note
      status
    }
  }
`;

export const CREATE_APPOINTMENT = gql`
  mutation createAppointment($input: NewAppointmentInput!) {
    createAppointment(input: $input) {
      id
      user {
        firstName
        lastName
      }
      patient {
        name
        phone
      }
      startTime
      endTime
      note
      status
      price
    }
  }
`;

export const UPDATE_APPOINTMENT = gql`
  mutation updateAppointment($input: UpdateAppointmentInput!) {
    updateAppointment(input: $input) {
      id
      user {
        id
        firstName
        lastName
      }
      patient {
        id
        name
        phone
      }
      startTime
      endTime
      price
      note
      status
    }
  }
`;

export const DELETE_APPOINTMENT = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id)
  }
`;
export const CANCEL_APPOINTMENT = gql`
  mutation updateStatusAppointment($id: ID!) {
    updateStatusAppointment(id: $id)
  }
`;

export const CANCEL_APPOINTMENTS = gql`
  mutation cancelAll($date: String!) {
    cancelAll(date: $date)
  }
`;

export const FETCH_TOTAL = gql`
  query totalGain($date: String) {
    totalGain(date: $date)
  }
`;
export const FETCH_TOTAL_DETAILED = gql`
  query totalGainDetailed($startTime: String, $endTime: String) {
    totalGainDetailed(startTime: $startTime, endTime: $endTime) {
      appointments {
        price
        startTime
      }
      fees {
        amount
        note
        date
      }
    }
  }
`;
