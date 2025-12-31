import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import type { CreateLoanDto } from "../types";
import dayjs from "dayjs";

export default function LoanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue } = useForm<
    CreateLoanDto & { status?: string }
  >();
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadLoan(id);
    } else {
      // Set defaults from settings?
      api.getSettings().then((s) => {
        setValue("bankAcceptedRate", s.bankGoldRate);
        setValue("bankRetentionPercent", s.defaultRetentionPercent);
        setValue("annualInterestRate", 9); // Typical gold loan rate
      });
    }
  }, [id, setValue]);

  const loadLoan = async (loanId: string) => {
    try {
      const loan = await api.getLoan(loanId);
      // Format dates for input
      setValue("loanName", loan.loanName);
      setValue("startDate", dayjs(loan.startDate).format("YYYY-MM-DD"));
      setValue(
        "endDate",
        loan.endDate ? dayjs(loan.endDate).format("YYYY-MM-DD") : undefined
      );
      setValue("principalAmount", loan.principalAmount);
      setValue("annualInterestRate", loan.annualInterestRate);
      setValue("goldGrams", loan.goldGrams);
      setValue("bankAcceptedRate", loan.bankAcceptedRate);
      setValue("bankRetentionPercent", loan.bankRetentionPercent);
      setValue("status", loan.status);
      if (loan.billImageBase64) setPreview(loan.billImageBase64);
    } catch (e) {
      alert("Error loading loan");
      navigate("/loans");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        setValue("billImageBase64", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        principalAmount: Number(data.principalAmount),
        annualInterestRate: Number(data.annualInterestRate),
        goldGrams: Number(data.goldGrams),
        bankAcceptedRate: Number(data.bankAcceptedRate),
        bankRetentionPercent: Number(data.bankRetentionPercent),
        billImageBase64: preview,
      };

      if (id) {
        await api.updateLoan(id, payload);
      } else {
        await api.createLoan(payload);
      }
      navigate("/loans");
    } catch (e) {
      console.error(e);
      alert("Failed to save loan");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        {id ? "Edit Loan" : "Add New Loan"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Loan Name / Bank
            </label>
            <input
              {...register("loanName", { required: true })}
              type="text"
              className="w-full p-2 border rounded-lg"
              placeholder="e.g. SBI Gold Loan 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full p-2 border rounded-lg"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Start Date
            </label>
            <input
              {...register("startDate", { required: true })}
              type="date"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              End Date (Optional)
            </label>
            <input
              {...register("endDate")}
              type="date"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Principal (INR)
            </label>
            <input
              {...register("principalAmount", { required: true })}
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Interest Rate (% p.a.)
            </label>
            <input
              {...register("annualInterestRate", { required: true })}
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Gold Weight (g)
            </label>
            <input
              {...register("goldGrams", { required: true })}
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bank Valuation Rate
            </label>
            <input
              {...register("bankAcceptedRate", { required: true })}
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-lg"
            />
            <p className="text-xs text-slate-500 mt-1">
              Rate per gram bank recognized this loan at
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Retention (%)
            </label>
            <input
              {...register("bankRetentionPercent", { required: true })}
              type="number"
              step="0.01"
              className="w-full p-2 border rounded-lg"
            />
            <p className="text-xs text-slate-500 mt-1">
              Bank margin (usually 10-25%)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Bill Image / Document
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-lg"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 h-40 object-contain border rounded-lg bg-slate-50"
            />
          )}
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/loans")}
            className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-primary text-slate-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            {loading ? "Saving..." : "Save Loan"}
          </button>
        </div>
      </form>
    </div>
  );
}
