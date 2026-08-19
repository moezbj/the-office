/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { isAfter, isSameDay } from "date-fns";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { CANCEL_APPOINTMENTS, FETCH_TOTAL } from "@/services/appointment.service";
import { CREATE_FEE } from "@/services/fee";

interface DialogDelete {
    open: boolean;
    title: string;
    description: string;
    buttonTitle: string;
    buttonCancel: string;
    date: Date;
    refetch: () => void;
    handleClose: () => void;
}

// Simple SVG Spinner to replace MUI CircularProgress
const Spinner = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg
        className={`animate-spin text-white ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        ></circle>
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
    </svg>
);

export default function FeeModal({
    title,
    description,
    open,
    buttonTitle,
    refetch,
    date,
    handleClose,
}: DialogDelete) {
    const [text, setInput] = React.useState("");
    const [note, setNote] = React.useState("");

    const [callData, { data }] = useLazyQuery(FETCH_TOTAL, {
        fetchPolicy: "network-only",
    });

    const [CallAddFee, { loading }] = useMutation(CREATE_FEE, {
        onCompleted: () => {
            setInput("");
            setNote("");
            handleClose();
        },
    });

    const [CallCancelAll, { loading: loadingCancel }] = useMutation(
        CANCEL_APPOINTMENTS,
        {
            onCompleted: () => {
                refetch();
                handleClose();
            },
        }
    );

    const create = () => {
        if (date) {
            CallAddFee({
                variables: {
                    input: {
                        amount: Number(text),
                        date: date.toISOString(),
                        note: note,
                    },
                },
            });
        }
    };

    const cancel = () => {
        if (date && isAfter(date, new Date())) {
            CallCancelAll({
                variables: {
                    date: date.toISOString(),
                },
            });
        }
    };

    React.useEffect(() => {
        if (date) {
            callData({
                variables: {
                    date: date.toISOString(),
                },
            });
        }
    }, [date, callData]);

    // Extracted disabled logic for cleaner JSX
    const isDateDisabled = date
        ? !isSameDay(date, new Date()) && !isAfter(date, new Date())
        : false;

    return (
        // Modal Backdrop (using 'hidden'/'flex' to mimic MUI's keepMounted behavior)
        <div
            className={`fixed inset-0 z-[1700] flex items-center justify-center p-4 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            onClick={handleClose}
        >
            {/* Modal Container */}
            <div
                className={`bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out ${open ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">
                        {description}: <span className="font-medium">{(data?.totalGain) as any}dt</span>
                    </p>
                </div>

                {/* Content */}
                <div className="p-4 space-y-5">
                    {/* Add Fee Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Ajouter une
                        </label>
                        <textarea
                            className="w-full p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            disabled={isDateDisabled}
                            autoFocus
                        />
                    </div>

                    {/* Price & Create Button */}
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            className="flex-1 p-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                            value={text}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isDateDisabled}
                            autoFocus
                        />
                        <button
                            className="px-4 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[42px] min-w-[100px] transition-colors"
                            onClick={create}
                            disabled={loading || isDateDisabled}
                        >
                            {loading ? <Spinner /> : buttonTitle}
                        </button>
                    </div>

                    {/* Cancel All Section */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                            Annuler tout
                        </label>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Annuler tout</span>
                            <button
                                className="px-4 py-2.5 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 h-[42px] min-w-[100px] transition-colors"
                                onClick={cancel}
                                disabled={loadingCancel || isDateDisabled}
                            >
                                {loadingCancel ? <Spinner /> : "Annuler"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button
                        className="px-4 py-2 text-gray-700 font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 transition-colors"
                        onClick={handleClose}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}