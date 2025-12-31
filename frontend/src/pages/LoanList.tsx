import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Loan } from "../types";
import { Link } from "react-router-dom";
import { formatCurrency, cn } from "../utils";
import dayjs from "dayjs";
import { TableSkeleton } from "../components/ui/TableSkeleton";

export default function LoanList() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Loan | "endDate">("endDate");
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "CLOSED">(
    "ALL"
  );

  useEffect(() => {
    loadLoans();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const data = await api.getLoans();
      setLoans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLoans = loans
    .filter((l) => l.loanName.toLowerCase().includes(search.toLowerCase()))
    .filter((l) => filterStatus === "ALL" || l.status === filterStatus)
    .sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === undefined || valB === undefined) return 0;

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this loan?")) {
      await api.deleteLoan(id);
      loadLoans();
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-800">My Loans</h1>
          <div className="h-10 w-32 bg-slate-200 animate-pulse rounded-lg"></div>
        </div>
        <TableSkeleton rows={5} columns={9} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">My Loans</h1>
        <Link
          to="/loans/new"
          className="bg-primary text-slate-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-500 transition-colors"
        >
          + Add New Loan
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search loans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e: any) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active Only</option>
          <option value="CLOSED">Closed Only</option>
        </select>
        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200"
        >
          Sort {sortAsc ? "Asc" : "Desc"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold text-sm">
              <tr>
                <th
                  className="p-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => setSortField("loanName")}
                >
                  Loan Name
                </th>
                <th
                  className="p-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => setSortField("startDate")}
                >
                  Start Date
                </th>
                <th
                  className="p-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => setSortField("endDate")}
                >
                  End Date
                </th>
                <th className="p-4 text-right">Gold (g)</th>
                <th className="p-4 text-right">Principal</th>
                <th className="p-4 text-right">Interest</th>
                <th className="p-4 text-right">Total Due</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map((loan) => (
                <tr key={loan._id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">
                    {loan.loanName}
                  </td>
                  <td className="p-4 text-slate-500">
                    {dayjs(loan.startDate).format("DD MMM YYYY")}
                  </td>
                  <td className="p-4 text-slate-500">
                    {loan.endDate
                      ? dayjs(loan.endDate).format("DD MMM YYYY")
                      : "-"}
                  </td>
                  <td className="p-4 text-right font-medium">
                    {loan.goldGrams}g
                  </td>
                  <td className="p-4 text-right text-slate-600">
                    {formatCurrency(loan.principalAmount)}
                  </td>
                  <td className="p-4 text-right text-red-600">
                    {formatCurrency(loan.interestTillDate || 0)}
                  </td>
                  <td className="p-4 text-right font-bold text-slate-900">
                    {formatCurrency(loan.currentTotalDue || 0)}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold",
                        loan.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="p-4 text-center space-x-2">
                    <Link
                      to={`/loans/edit/${loan._id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(loan._id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No loans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
