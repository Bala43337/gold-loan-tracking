import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Loan, AppSettings } from "../types";
import { formatCurrency } from "../utils";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedLoans, fetchedSettings] = await Promise.all([
        api.getLoans(),
        api.getSettings(),
      ]);
      setLoans(fetchedLoans);
      setSettings(fetchedSettings);

      // Update gold rate on load
      api.fetchLiveRate().then(() => {
        // Refresh settings again to get updated lastUpdated time
        api.getSettings().then(setSettings);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const activeLoans = loans.filter((l) => l.status === "ACTIVE");
  const totalPrincipal = activeLoans.reduce(
    (sum, l) => sum + l.principalAmount,
    0
  );
  const totalInterest = activeLoans.reduce(
    (sum, l) => sum + (l.interestTillDate || 0),
    0
  );
  const totalGold = activeLoans.reduce((sum, l) => sum + l.goldGrams, 0);
  const totalDue = activeLoans.reduce(
    (sum, l) => sum + (l.currentTotalDue || 0),
    0
  );

  const currentAssetValue = totalGold * (settings?.marketGoldRate || 0);
  const netWorth = currentAssetValue - totalDue;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="Total Active Loans" value={activeLoans.length} />
        <Card label="Total Gold Pledged" value={totalGold.toFixed(2) + " g"} />
        <Card
          label="Market Gold Rate"
          value={formatCurrency(settings?.marketGoldRate || 0) + "/g"}
        />
        <Card
          label="Portfolio Net Worth"
          value={formatCurrency(netWorth)}
          highlight={netWorth >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-2">
          <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
          <div className="space-y-4">
            <Row
              label="Total Principal Debt"
              value={formatCurrency(totalPrincipal)}
            />
            <Row
              label="Accrued Interest"
              value={formatCurrency(totalInterest)}
              isRed
            />
            <div className="h-px bg-slate-200 my-2"></div>
            <Row
              label="Total Amount to Close"
              value={formatCurrency(totalDue)}
              isBold
            />
            <Row
              label="Current Asset Value"
              value={formatCurrency(currentAssetValue)}
              isGreen
            />
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2">Optimize Your Loans</h2>
            <p className="text-slate-300 text-sm mb-4">
              Simulate different scenarios to find the best way to close your
              loans and save interest.
            </p>
          </div>
          <Link
            to="/simulation"
            className="block w-full text-center bg-primary text-slate-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Run Simulation
          </Link>
        </div>
      </div>
    </div>
  );
}

function Card({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
      <p className="text-slate-500 text-sm mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight || "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

function Row({ label, value, isRed, isGreen, isBold }: any) {
  return (
    <div className="flex justify-between items-center">
      <span
        className={isBold ? "font-semibold text-slate-700" : "text-slate-500"}
      >
        {label}
      </span>
      <span
        className={`
        ${isBold ? "font-bold" : ""} 
        ${isRed ? "text-red-600" : ""} 
        ${isGreen ? "text-green-600" : ""}
      `}
      >
        {value}
      </span>
    </div>
  );
}
