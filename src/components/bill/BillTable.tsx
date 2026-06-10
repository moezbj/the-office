import { format, differenceInYears } from "date-fns";
import { useReactToPrint } from "react-to-print";
import { useRef, useState } from "react";
// @ts-ignore
import writtenNumber from "written-number";
import { Printer, Building2, User } from "lucide-react";

import { Patient } from "@/types";
import { useAuthStore } from "@/store/authStore";

interface TableProps {
  data: { date: number; prix: number }[];
  patient: Patient;
}

function ccyFormat(num: number) {
  return `${num.toFixed(3)}`;
}

function priceRow(qty: number, unit: number) {
  return qty * unit;
}

function createRow(desc: string, qty: number, unit: number) {
  const price = priceRow(1, unit);
  return { desc, qty, unit, price };
}

interface Row {
  desc: string;
  qty: number;
  unit: number;
  price: number;
}

function subtotal(items: readonly Row[]) {
  return items.length > 0
    ? items.map(({ price }) => price).reduce((sum, i) => sum + i, 0)
    : 0;
}

const convertToAge = (value: Date | number) => {
  return differenceInYears(new Date(), new Date(value));
};

export default function BillTable({ data, patient }: TableProps) {
  const groupedData = new Map<string, { count: number; total: number }>();
  data?.forEach((e) => {
    const formattedDate = format(e.date, "dd-MM-yyyy");
    if (groupedData.has(formattedDate)) {
      const current = groupedData.get(formattedDate)!;
      groupedData.set(formattedDate, {
        count: current.count + 1,
        total: current.total + e.prix,
      });
    } else {
      groupedData.set(formattedDate, { count: 1, total: e.prix });
    }
  });

  const rows = Array.from(groupedData.entries()).map(
    ([date, { count, total }]) => createRow(date, count, total),
  );

  const [checked, setChecked] = useState(false);
  const [TAX_RATE, setTax] = useState(0);

  const handleChange = () => {
    setChecked(!checked);
  };

  const userd = useAuthStore((state) => state.user);

  const [loading, setLoading] = useState(false);
  const componentRef = useRef<HTMLDivElement | null>(null);
  const invoiceSubtotal = subtotal(rows);
  const invoiceTaxes = checked ? (TAX_RATE / 100) * invoiceSubtotal : 0;
  const invoiceTotal = invoiceTaxes + invoiceSubtotal;

  const handlePrint = useReactToPrint({
    documentTitle: patient.name,
    onBeforePrint: async () => {
      setLoading(true);
    },
    onAfterPrint: async () => {
      setLoading(false);
    },
  });

  const renderQuality = () => {
    const age = convertToAge(new Date(Number(patient.birthDate)));
    return age >= 18 ? "Adulte" : "Enfant";
  };

  function numberToWordsWithDecimal(number: string): string {
    const [integerPart, decimalPart] = number.split(".");

    // @ts-ignore
    writtenNumber.defaults.lang = "fr";

    const integerWords = writtenNumber(Number(integerPart), {
      lang: "fr",
    });

    let decimalWords = "";
    if (decimalPart) {
      const decimalNumber = Number(decimalPart);
      if (Number(decimalPart) > 0) {
        decimalWords =
          " et " +
          writtenNumber(decimalNumber, {
            lang: "fr",
          }).replace("zero", "");
      }
    }

    return (
      integerWords +
      "  " +
      (userd?.currency?.name?.split(" ")[1] || "") +
      decimalWords
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Controls outside the print area */}
      <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 mb-8 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">Taxe</span>
              <button
                type="button"
                onClick={handleChange}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                  checked ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                    checked ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <input
              type="number"
              value={TAX_RATE}
              onChange={(ev) => setTax(Number(ev.target.value))}
              disabled={!checked}
              className="w-24 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed outline-none"
              placeholder="0%"
            />
          </div>

          <button
            onClick={() => handlePrint(() => componentRef.current)}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/40 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-5 h-5" />
            {loading ? "Impression..." : "Imprimer"}
          </button>
        </div>
      </div>

      {/* Printable Invoice */}
      <div
        ref={componentRef}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
      >
        {/* Invoice Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">FACTURE</h2>
              <p className="text-blue-100">
                N° {Date.now().toString().slice(-6)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 mb-2 justify-end">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">
                  Cabinet: {userd?.firstName} {userd?.lastName}
                </span>
              </div>
              <p className="text-blue-100 text-sm">
                Registre Fiscal: {userd?.taxRegistration}
              </p>
              <p className="text-blue-100 text-sm">
                Date: {format(new Date(), "dd-MM-yyyy")}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Info */}
        <div className="p-8 bg-slate-50 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Patient
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">
                    {patient?.name}
                  </p>
                  {patient?.birthDate && (
                    <p className="text-slate-600">
                      Catégorie:{" "}
                      <span className="font-semibold text-blue-600">
                        {renderQuality()}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="p-8">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-700 uppercase tracking-wider">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {rows.map((row) => (
                  <tr
                    key={row.desc}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {row.desc}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {row.qty}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-800 font-semibold">
                      {ccyFormat(row.price)} TND
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between py-3 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Sous-total</span>
                <span className="text-slate-800 font-bold">
                  {ccyFormat(invoiceSubtotal)} TND
                </span>
              </div>
              {checked && (
                <div className="flex justify-between py-3 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">
                    Taxe ({TAX_RATE.toFixed(0)}%)
                  </span>
                  <span className="text-slate-800 font-bold">
                    {ccyFormat(invoiceTaxes)} TND
                  </span>
                </div>
              )}
              <div className="flex justify-between py-4 bg-gradient-to-r from-blue-50 to-blue-100 px-4 rounded-lg">
                <span className="text-slate-800 font-bold text-lg">Total</span>
                <span className="text-blue-700 font-bold text-2xl">
                  {ccyFormat(invoiceTotal)} TND
                </span>
              </div>
            </div>
          </div>

          {/* Amount in Words */}
          <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-slate-700 leading-relaxed">
              <span className="font-semibold">Arrêté à la somme de : </span>
              {numberToWordsWithDecimal(ccyFormat(invoiceTotal))}
              <span className="text-slate-500 ml-2">
                ({format(new Date(), "dd-MM-yyyy")})
              </span>
            </p>
          </div>

          {/* Stamp Section */}
          <div className="mt-12 flex justify-end">
            <div className="text-center">
              <div className="w-48 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-2">
                <span className="text-slate-400 text-sm font-medium">
                  Cachet et Signature
                </span>
              </div>
              <p className="text-slate-600 font-medium">Timbre</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-8 py-4 border-t border-slate-200">
          <p className="text-center text-sm text-slate-500">
            Merci pour votre confiance • Cabinet {userd?.firstName}{" "}
            {userd?.lastName}
          </p>
        </div>
      </div>
    </div>
  );
}
