import { CREATE_NOTE, FETCH_NOTES, UPDATE_NOTE } from "@/services/note";
import { NoteType } from "@/types";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import JoditEditor from "jodit-react";
import parse from "html-react-parser";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  FileText,
  Loader2,
  Search,
  Eye,
  Save,
  AlertCircle,
} from "lucide-react";

export default function NotesPage() {
  const [callNote, { data, loading: loadingNote, error }] = useLazyQuery(
    FETCH_NOTES,
    {
      fetchPolicy: "cache-and-network",
    },
  );
  const [callAdd, { loading: loadingCreate }] = useMutation(CREATE_NOTE, {
    onCompleted: () => {
      handleClose();
      callNote();
    },
  });
  const [callUpdate, { loading: loadingUpdate }] = useMutation(UPDATE_NOTE, {
    onCompleted: () => {
      handleClose();
      callNote();
    },
  });

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const editor = useRef<any>(null);
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [id, setId] = useState("");
  const [isEdit, setEdit] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const notes = useMemo(() => {
    if (!data?.notes) return [];
    if (!searchTerm) return data.notes;

    const term = searchTerm.toLowerCase();
    return data.notes.filter(
      (note: NoteType) =>
        note.title.toLowerCase().includes(term) ||
        note.note.toLowerCase().includes(term),
    );
  }, [data, searchTerm]);

  const onSubmit = () => {
    if (value.trim() && title.trim()) {
      if (isEdit) {
        callUpdate({
          variables: {
            input: {
              id: id,
              title: title.trim(),
              note: value,
            },
          },
        });
      } else {
        callAdd({
          variables: {
            input: {
              title: title.trim(),
              note: value,
            },
          },
        });
      }
    }
  };

  const handleDelete = (noteId: string) => {
    // You would add a DELETE_NOTE mutation here
    // For now, we'll just show the confirmation UI
    setDeleteConfirm(noteId);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      // Call delete mutation here
      setDeleteConfirm(null);
      callNote(); // Refresh list
    }
  };

  const handleClose = () => {
    setOpen(false);
    setValue("");
    setTitle("");
    setId("");
    setEdit(false);
    setPreviewMode(false);
  };

  const handleOpenEdit = (note: NoteType) => {
    setTitle(note.title);
    setValue(note.note);
    setId(note.id);
    setEdit(true);
    setPreviewMode(false);
    setOpen(true);
  };

  useEffect(() => {
    callNote();
  }, []);

  const isLoading = loadingNote || loadingCreate || loadingUpdate;
  const isSubmitting = loadingCreate || loadingUpdate;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-8 h-8 text-indigo-600" />
              {"Notes"}
            </h1>
            <p className="text-slate-500 mt-1">
              {"Gérez vos notes et documents importants"}
            </p>
          </div>
          <button
            onClick={() => {
              setEdit(false);
              setPreviewMode(false);
              setTitle("");
              setValue("");
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            {"Ajouter"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={"Rechercher une note..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>
              {"Une erreur est survenue lors du chargement des notes"}
            </span>
          </div>
        )}

        {/* Notes Grid */}
        {isLoading ? (
          // Loading Skeleton
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                  <div className="h-4 bg-slate-200 rounded w-4/6" />
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-8 bg-slate-200 rounded w-20" />
                  <div className="h-8 bg-slate-200 rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          // Empty State
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {searchTerm ? "Pas de resultat" : "Pas de notes"}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm ? "Rechercher " : "Premiere note"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                {"Créer une note"}
              </button>
            )}
          </div>
        ) : (
          // Notes List
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note: NoteType) => (
              <div
                key={note.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 line-clamp-1">
                    {note.title}
                  </h3>
                  <div className="prose prose-slate prose-sm max-w-none text-slate-600 line-clamp-4 mb-4">
                    {parse(note.note)}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 pb-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={"Modifier"}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setPreviewMode(true);
                        handleOpenEdit(note);
                      }}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title={"Voir"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Delete with confirmation */}
                  {deleteConfirm === note.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={confirmDelete}
                        className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        {"Confirmer"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        {"Annuler"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title={"Supprimer"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {open && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
              onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative min-h-screen flex items-center justify-center p-4">
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {isEdit ? "Modifier la note" : "Nouvelle note"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {isEdit ? "Modifier la desc." : "Ajouterune desc."}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Preview Toggle */}
                {isEdit && (
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <button
                      onClick={() => setPreviewMode(false)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        !previewMode
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {"Modifier"}
                    </button>
                    <button
                      onClick={() => setPreviewMode(true)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        previewMode
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {"Aperçu"}
                    </button>
                  </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Title Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {"Titre"}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={"Entrez un titre..."}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Editor or Preview */}
                  {previewMode ? (
                    <div className="prose prose-slate max-w-none">
                      <h3 className="text-xl font-bold text-slate-800 mb-4">
                        {title}
                      </h3>
                      <div className="text-slate-700 leading-relaxed">
                        {parse(
                          value ||
                            "<p><em className='text-slate-400'>Aucun contenu</em></p>",
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-slate-300 rounded-xl overflow-hidden">
                      <JoditEditor
                        ref={editor}
                        value={value}
                        onBlur={(newContent) => setValue(newContent)}
                        onChange={() => {}}
                      />
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    {"Annuler"}
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={isSubmitting || !title.trim() || !value.trim()}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {"Enregistrement..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {isEdit ? "Modifier" : "Enregistrer"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
