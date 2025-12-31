import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { AppSettings } from "../types";
import { useForm } from "react-hook-form";

export default function Settings() {
  const { register, handleSubmit, reset } = useForm<AppSettings>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSettings().then((res) => {
      reset(res);
    });
  }, [reset]);

  const onSubmit = async (data: AppSettings) => {
    setLoading(true);
    try {
      await api.updateSettings({
        marketGoldRate: Number(data.marketGoldRate),
        bankGoldRate: Number(data.bankGoldRate),
        defaultRetentionPercent: Number(data.defaultRetentionPercent),
      });
      alert("Settings saved!");
    } catch (e) {
      alert("Error saving settings");
    }
    setLoading(false);
  };

  const fetchLive = async () => {
    const res = await api.fetchLiveRate();
    reset((prev) => ({ ...prev, marketGoldRate: res.marketGoldRate }));
    alert(`Fetched live rate: ${res.marketGoldRate}`);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Settings</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Market Gold Rate (per gram)
            </label>
            <div className="flex gap-2">
              <input
                {...register("marketGoldRate")}
                type="number"
                step="0.01"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
              <button
                type="button"
                onClick={fetchLive}
                className="px-4 py-2 bg-slate-200 rounded-lg font-medium text-sm hover:bg-slate-300"
              >
                Fetch
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bank Gold Rate (per gram)
            </label>
            <input
              {...register("bankGoldRate")}
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Typical rate offered by banks for new loans (usually lower than
              market)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Default Retention (%)
            </label>
            <input
              {...register("defaultRetentionPercent")}
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
