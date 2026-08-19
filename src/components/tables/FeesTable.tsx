/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { useRef, useState } from "react";
import { User } from "@/types";

interface TableProps {
    data: { date: number; prix: number; note: string }[];
    user: User;
}

const TAX_RATE = 0.0;

function ccyFormat(num: number) {
    return `${num.toFixed(2)}`;
}

function priceRow(qty: number, unit: number) {
    return qty * unit;
}

function createRow(desc: string, note: string, qty: number, unit: number) {
    const price = priceRow(qty, unit);
    return { desc, note, qty, unit, price };
}

interface Row {
    desc: string;
    note: string;
    qty: number;
    unit: number;
    price: number;
}

function subtotal(items: readonly Row[]) {
    return items.length > 0
        ? items.map(({ price }) => price).reduce((sum, i) => sum + i, 0)
        : 0;
}

// Lightweight SVG Spinner
const Spinner = () => (
    <svg
        className="animate-spin h-5 w-5 text-white"
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

export default function FeesTable({ data, user }: TableProps) {
    const rows = data?.map((e) =>
        createRow(format(e.date, "dd-MM-yyyy"), e.note, 1, e.prix)
    ) || [];

    const [loading, setLoading] = useState(false);
    const componentRef = useRef<HTMLDivElement | null>(null);

    const invoiceSubtotal = subtotal(rows);
    const invoiceTaxes = TAX_RATE * invoiceSubtotal;
    const invoiceTotal = invoiceTaxes + invoiceSubtotal;

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Print This Document",
        onBeforePrint: async () => {
            setLoading(true);
        },
        onAfterPrint: async () => {
            setLoading(false);
        },
    });

    return (
        <div className="flex flex-col w-full" dir={document.documentElement.dir}>
            {/* Print Button */}
            <button
                onClick={() => {
                    handlePrint();
                }}
                disabled={loading}
                className="self-end flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-all mb-4 print:hidden"
            >
                {loading ? <Spinner /> : null}
                Imprimer
            </button>

            {/* Printable Area */}
            <div
                ref={componentRef}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-10 print:shadow-none print:border-0 print:p-0"
            >
                {/* Header Info */}
                <div className="mb-8 space-y-1 text-gray-900">
                    <p className="text-base">
                        <span className="font-semibold">Cabinet:</span> {user.firstName} {user.lastName}
                    </p>
                    <p className="text-base">
                        <span className="font-semibold">tax:</span> {user.taxRegistration}
                    </p>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-900">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-700">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Note</th>
                                <th className="px-4 py-3 text-right">Nbr</th>
                                {/* <th className="px-4 py-3 text-right">{t("unit")}</th> */}
                                <th className="px-4 py-3 text-right">Sum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {rows.map((row, i) => (
                                <tr key={`${row.desc}-${i}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">{row.desc}</td>
                                    <td className="px-4 py-3">{row.note}</td>
                                    <td className="px-4 py-3 text-right">{row.qty}</td>
                                    {/* <td className="px-4 py-3 text-right">{row.unit}</td> */}
                                    <td className="px-4 py-3 text-right font-medium">{ccyFormat(row.price)}</td>
                                </tr>
                            ))}

                            {/* Commented out subtotal/tax rows preserved from original */}
                            {/* 
              <tr>
                <td className="px-4 py-3" rowSpan={4}></td>
                <td className="px-4 py-3" colSpan={3}>{t("subTotal")}</td>
                <td className="px-4 py-3 text-right font-medium">{ccyFormat(invoiceSubtotal)}</td>
              </tr>
              <tr>
                <td className="px-4 py-3" colSpan={2}>{t("tax")}</td>
                <td className="px-4 py-3 text-right">{`${(TAX_RATE * 100).toFixed(0)} %`}</td>
                <td className="px-4 py-3 text-right font-medium">{ccyFormat(invoiceTaxes)}</td>
              </tr> 
              */}

                            {/* Total Row */}
                            <tr className="bg-gray-50 font-bold text-base">
                                <td className="px-4 py-4" rowSpan={2}></td>
                                <td className="px-4 py-4" rowSpan={2}></td>
                                <td className="px-4 py-4 text-right">Total</td>
                                <td className="px-4 py-4 text-right">{ccyFormat(invoiceTotal)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Footer / Cachet */}
                <div className="flex justify-end mt-12 pt-8 border-t border-gray-100 print:mt-16 print:pt-12">
                    <p className="text-gray-900 font-medium">Cachet</p>
                </div>
            </div>
        </div>
    );
}