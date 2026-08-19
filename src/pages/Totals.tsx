/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLazyQuery } from "@apollo/client/react";
import { format } from "date-fns";
import { Search } from "lucide-react";

import { FETCH_TOTAL_DETAILED } from "@/services/appointment.service";
import useUser from "@/hooks/useUser";
import TotalTable from "@/components/tables/TotalTable";
import FeesTable from "@/components/tables/FeesTable";

const formSchema = z.object({
    startTime: z.date(),
    endTime: z.date(),
});

const Bill = () => {
    const user = useUser();

    const [call, { data }] = useLazyQuery(FETCH_TOTAL_DETAILED, { fetchPolicy: "network-only" });

    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startTime: new Date(),
            endTime: new Date(),
        },
    });

    const onSubmit = (variables: z.infer<typeof formSchema>): void => {
        call({
            variables: {
                startTime: variables.startTime.toISOString(),
                endTime: variables.endTime.toISOString(),
            },
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <h1 className="text-3xl font-bold text-gray-900">
                Les Totaux du mois
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="my-6 flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full"
            >
                {/* Start Time Input */}
                <div className="w-full sm:w-auto flex flex-col gap-1.5">
                    <label htmlFor="startTime" className="text-sm font-medium text-gray-700">
                        Du
                    </label>
                    <Controller
                        name="startTime"
                        control={control}
                        render={({ field }) => (
                            <input
                                id="startTime"
                                type="date"
                                className="w-full sm:w-64 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
                                // Browsers require yyyy-MM-dd for type="date"
                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                        )}
                    />
                    {errors.startTime && (
                        <span className="text-xs text-red-500">{errors.startTime.message}</span>
                    )}
                </div>

                {/* End Time Input */}
                <div className="w-full sm:w-auto flex flex-col gap-1.5">
                    <label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                        Au
                    </label>
                    <Controller
                        name="endTime"
                        control={control}
                        render={({ field }) => (
                            <input
                                id="endTime"
                                type="date"
                                className="w-full sm:w-64 px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-gray-900"
                                value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                        )}
                    />
                    {errors.endTime && (
                        <span className="text-xs text-red-500">{errors.endTime.message}</span>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors h-[46px] w-full sm:w-[55px] sm:h-[46px]"
                    title="Rechercher"
                >
                    <Search className="w-5 h-5" />
                    <span className="sm:hidden">Rechercher</span>
                </button>
            </form>

            {/* Results Section */}
            {data && user && (
                <div className="mt-8 space-y-10">
                    {/* Total Table */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Total
                        </h2>
                        <TotalTable
                            user={user}
                            data={
                                data.totalGainDetailed.appointments?.map((el) => ({
                                    date: Number(el.startTime),
                                    prix: el.price,
                                })) || []
                            }
                            fees={data.totalGainDetailed.fees || []}
                        />
                    </div>

                    {/* Fees Table */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Frais détaillé
                        </h2>
                        <FeesTable
                            user={user}
                            data={
                                data.totalGainDetailed.fees?.map((el) => ({
                                    date: Number(el.date),
                                    prix: el.amount,
                                    note: el.note || "",
                                })) || []
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bill;