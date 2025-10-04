"use client";

import { MultiSelect } from "@/components/custom-ui/multi-select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { LoanService } from "@/features/features/loan/data/LoanService";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import useDebounce from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

type LoanMultiSelectType = {
  id: string;
  name: string;
};

type LoanMultiSelectProps = {
  id: string;
  form: any;
  currentLoan?: LoanInterface;
  label?: string;
  placeholder?: string;
  onChange?: (loans?: LoanInterface[]) => void;
  maxCount?: number;
  isRequired?: boolean;
};

export default function LoanMultiSelect({
  id,
  form,
  currentLoan,
  label,
  placeholder,
  onChange,
  maxCount = 3,
  isRequired = false,
}: LoanMultiSelectProps) {
  const t = useTranslations("features.loan");
  const [loanOptions, setLoanOptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const selectedLoans: LoanMultiSelectType[] = useWatch({ control: form.control, name: id }) || [];

  const data: DataListRetriever<LoanInterface> = useDataListRetriever({
    retriever: (params) => LoanService.findMany(params),
    retrieverParams: {},
    ready: true,
    module: Modules.Loan,
  });

  const updateSearch = useCallback(
    (searchedTerm: string) => {
      if (searchedTerm.trim()) {
        data.addAdditionalParameter("search", searchedTerm.trim());
      } else {
        data.removeAdditionalParameter("search");
      }
    },
    [data],
  );

  const debouncedUpdateSearch = useDebounce(updateSearch, 500);

  useEffect(() => {
    debouncedUpdateSearch(searchTerm);
  }, [debouncedUpdateSearch, searchTerm]);

  useEffect(() => {
    if (data.data && data.data.length > 0) {
      const loans = data.data as LoanInterface[];
      const filteredLoans = loans.filter((loan) => loan.id !== currentLoan?.id);

      const options = filteredLoans.map((loan) => ({
        label: loan.name,
        value: loan.id,
        loanData: loan,
      }));

      setLoanOptions(options);
    }
  }, [data.data, currentLoan]);

  // Add options for any already selected loans that aren't in search results
  useEffect(() => {
    if (selectedLoans.length > 0) {
      // Create a map of existing option IDs for quick lookup
      const existingOptionIds = new Set(loanOptions.map((option) => option.value));

      // Find selected loans that don't have an option yet
      const missingOptions = selectedLoans
        .filter((loan) => !existingOptionIds.has(loan.id))
        .map((loan) => ({
          label: loan.name,
          value: loan.id,
          loanData: loan,
        }));

      if (missingOptions.length > 0) {
        setLoanOptions((prev) => [...prev, ...missingOptions]);
      }
    }
  }, [selectedLoans, loanOptions]);

  const handleValueChange = (selectedIds: string[]) => {
    const updatedSelectedLoans = selectedIds.map((id) => {
      const existingLoan = selectedLoans.find((loan) => loan.id === id);
      if (existingLoan) {
        return existingLoan;
      }

      const option = loanOptions.find((option) => option.value === id);
      if (option?.loanData) {
        return {
          id: option.loanData.id,
          name: option.loanData.name,
        };
      }

      return { id, name: id };
    });

    form.setValue(id, updatedSelectedLoans);

    if (onChange) {
      const fullSelectedLoans = selectedIds
        .map((id) => loanOptions.find((option) => option.value === id)?.loanData)
        .filter(Boolean) as LoanInterface[];
      onChange(fullSelectedLoans);
    }
  };

  const selectedLoanIds = selectedLoans.map((loan: LoanMultiSelectType) => loan.id);

  return (
    <div className="flex w-full flex-col">
      <FormField
        control={form.control}
        name={id}
        render={({ field }) => (
          <FormItem className={`${label ? "mb-5" : "mb-1"}`}>
            {label && (
              <FormLabel className="flex items-center">
                {label}
                {isRequired && <span className="text-destructive ml-2 font-semibold">*</span>}
              </FormLabel>
            )}
            {!label && (
              <FormLabel className="flex items-center">
                {t("multiselect.label")}
                {isRequired && <span className="text-destructive ml-2 font-semibold">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <MultiSelect
                options={loanOptions}
                onValueChange={handleValueChange}
                defaultValue={selectedLoanIds}
                placeholder={placeholder || t("multiselect.placeholder")}
                maxCount={maxCount}
                animation={0}
                onSearchChange={setSearchTerm}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
