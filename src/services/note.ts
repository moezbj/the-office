import { NoteType } from "@/types";
import { gql, TypedDocumentNode } from "@apollo/client";

export const FETCH_NOTES: TypedDocumentNode<{ notes: NoteType[] }> = gql`
  query notes {
    notes {
      id
      user {
        id
        firstName
        lastName
      }
      note
      title
    }
  }
`;
export const FETCH_NOTE = gql`
  query note($id: ID!) {
    note(id: $id) {
      id
      user {
        id
        firstName
        lastName
      }
      note
      title
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation createNote($input: NewNoteInput!) {
    createNote(input: $input) {
      id
      user {
        firstName
        lastName
      }
      note
      title
    }
  }
`;

export const UPDATE_NOTE = gql`
  mutation updateNote($input: UpdateNoteInput!) {
    updateNote(input: $input) {
      id
      user {
        firstName
        lastName
      }
      note
      title
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: ID!) {
    DeleteNote(id: $id)
  }
`;
