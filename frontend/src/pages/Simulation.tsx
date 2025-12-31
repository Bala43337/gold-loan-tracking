import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useForm } from "react-hook-form";
import { formatCurrency, cn } from "../utils";

type SimulationResult = {
  steps: {
    action: "REDEEM" | "RELOAN";
    loanId?: string;
    loanName?: string;
    description: string;
    amountUsed?: number;
    amountGenerated?: number;
    goldGrams?: number;
  }[];
  totalGoldRecovered: number;
  remainingLoans: number;
  suggestion: string;
};

export default function Simulation() {
  const { register, handleSubmit, setValue } = useForm<{
    availableCash: number;
    bankGoldRate: number;
    retentionPercent: number;
  }>();
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      setValue("bankGoldRate", s.bankGoldRate);
      setValue("retentionPercent", s.defaultRetentionPercent);
      setValue("availableCash", 50000); // Default cash
    });
  }, [setValue]);

  const onRun = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.simulate({
        availableCash: Number(data.availableCash),
        bankGoldRate: Number(data.bankGoldRate),
        retentionPercent: Number(data.retentionPercent),
      });
      setResult(res);
    } catch (e) {
      alert("Error running simulation");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-800">
          Loan Closure Simulator
        </h1>
        <p className="text-slate-500">
          Find the optimal path to close your loans by recycling gold.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-slate-800">
            Simulation Parameters
          </h2>
          <form onSubmit={handleSubmit(onRun)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Available Cash (INR)
              </label>
              <input
                {...register("availableCash")}
                type="number"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <p className="text-xs text-slate-500 font-semibold uppercase">
                Bank Assumptions
              </p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  New Loan Gold Rate / g
                </label>
                <input
                  {...register("bankGoldRate")}
                  type="number"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Retention (%)
                </label>
                <input
                  {...register("retentionPercent")}
                  type="number"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors"
            >
              {loading ? "Simulating..." : "Run Simulation"}
            </button>
          </form>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-primary">
                <h2 className="text-2xl font-bold mb-2">{result.suggestion}</h2>
                <div className="flex gap-8 text-sm text-slate-600">
                  <div>
                    <span className="block font-bold text-lg text-slate-900">
                      {result.totalGoldRecovered.toFixed(2)} g
                    </span>
                    <span>Gold Recovered</span>
                  </div>
                  <div>
                    <span className="block font-bold text-lg text-slate-900">
                      {result.remainingLoans}
                    </span>
                    <span>Loans Remaining</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                  Step-by-Step Plan
                </div>
                <div className="divide-y divide-slate-100">
                  {result.steps.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      No steps possible with current cash.
                    </div>
                  )}
                  {result.steps.map((step, idx) => (
                    <div key={idx} className="p-4 flex gap-4 items-start">
                      <div
                        className={cn(
                          "mt-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          step.action === "REDEEM"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        )}
                      >
                        {step.action[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          {step.description}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {step.action === "REDEEM" &&
                            `Paid ${formatCurrency(step.amountUsed || 0)}`}
                          {step.action === "RELOAN" &&
                            `Generated ${formatCurrency(
                              step.amountGenerated || 0
                            )}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12 border-2 border-dashed border-slate-200 rounded-xl">
              <span className="text-4xl mb-4">🔮</span>
              <p>
                Enter your available cash and click "Run Simulation" to see the
                magic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
