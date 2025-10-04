"use client";

import { MultiSelect } from "@/components/custom-ui/multi-select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SupplierInterface } from "@/features/features/supplier/data/SupplierInterface";
import { SupplierService } from "@/features/features/supplier/data/SupplierService";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import useDebounce from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

type SupplierMultiSelectType = {
  id: string;
  name: string;
};

type SupplierMultiSelectProps = {
  id: string;
  form: any;
  currentSupplier?: SupplierInterface;
  label?: string;
  placeholder?: string;
  onChange?: (suppliers?: SupplierInterface[]) => void;
  maxCount?: number;
  isRequired?: boolean;
};

export default function SupplierMultiSelect({
  id,
  form,
  currentSupplier,
  label,
  placeholder,
  onChange,
  maxCount = 3,
  isRequired = false,
}: SupplierMultiSelectProps) {
  const t = useTranslations("features.supplier");
  const [supplierOptions, setSupplierOptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const selectedSuppliers: SupplierMultiSelectType[] = useWatch({ control: form.control, name: id }) || [];

  const data: DataListRetriever<SupplierInterface> = useDataListRetriever({
    retriever: (params) => SupplierService.findMany(params),
    retrieverParams: {},
    ready: true,
    module: Modules.Supplier,
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
      const suppliers = data.data as SupplierInterface[];
      const filteredSuppliers = suppliers.filter((supplier) => supplier.id !== currentSupplier?.id);

      const options = filteredSuppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
        supplierData: supplier,
      }));

      setSupplierOptions(options);
    }
  }, [data.data, currentSupplier]);

  // Add options for any already selected suppliers that aren't in search results
  useEffect(() => {
    if (selectedSuppliers.length > 0) {
      // Create a map of existing option IDs for quick lookup
      const existingOptionIds = new Set(supplierOptions.map((option) => option.value));

      // Find selected suppliers that don't have an option yet
      const missingOptions = selectedSuppliers
        .filter((supplier) => !existingOptionIds.has(supplier.id))
        .map((supplier) => ({
          label: supplier.name,
          value: supplier.id,
          supplierData: supplier,
        }));

      if (missingOptions.length > 0) {
        setSupplierOptions((prev) => [...prev, ...missingOptions]);
      }
    }
  }, [selectedSuppliers, supplierOptions]);

  const handleValueChange = (selectedIds: string[]) => {
    const updatedSelectedSuppliers = selectedIds.map((id) => {
      const existingSupplier = selectedSuppliers.find((supplier) => supplier.id === id);
      if (existingSupplier) {
        return existingSupplier;
      }

      const option = supplierOptions.find((option) => option.value === id);
      if (option?.supplierData) {
        return {
          id: option.supplierData.id,
          name: option.supplierData.name,
        };
      }

      return { id, name: id };
    });

    form.setValue(id, updatedSelectedSuppliers);

    if (onChange) {
      const fullSelectedSuppliers = selectedIds
        .map((id) => supplierOptions.find((option) => option.value === id)?.supplierData)
        .filter(Boolean) as SupplierInterface[];
      onChange(fullSelectedSuppliers);
    }
  };

  const selectedSupplierIds = selectedSuppliers.map((supplier: SupplierMultiSelectType) => supplier.id);

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
                options={supplierOptions}
                onValueChange={handleValueChange}
                defaultValue={selectedSupplierIds}
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
