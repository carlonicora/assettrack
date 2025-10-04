"use client";

import { MultiSelect } from "@/components/custom-ui/multi-select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EmployeeInterface } from "@/features/features/employee/data/EmployeeInterface";
import { EmployeeService } from "@/features/features/employee/data/EmployeeService";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import useDebounce from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

type EmployeeMultiSelectType = {
  id: string;
  name: string;
};

type EmployeeMultiSelectProps = {
  id: string;
  form: any;
  currentEmployee?: EmployeeInterface;
  label?: string;
  placeholder?: string;
  onChange?: (employees?: EmployeeInterface[]) => void;
  maxCount?: number;
  isRequired?: boolean;
};

export default function EmployeeMultiSelect({
  id,
  form,
  currentEmployee,
  label,
  placeholder,
  onChange,
  maxCount = 3,
  isRequired = false,
}: EmployeeMultiSelectProps) {
  const t = useTranslations("features.employee");
  const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const selectedEmployees: EmployeeMultiSelectType[] = useWatch({ control: form.control, name: id }) || [];

  const data: DataListRetriever<EmployeeInterface> = useDataListRetriever({
    retriever: (params) => EmployeeService.findMany(params),
    retrieverParams: {},
    ready: true,
    module: Modules.Employee,
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
      const employees = data.data as EmployeeInterface[];
      const filteredEmployees = employees.filter((employee) => employee.id !== currentEmployee?.id);

      const options = filteredEmployees.map((employee) => ({
        label: employee.name,
        value: employee.id,
        employeeData: employee,
      }));

      setEmployeeOptions(options);
    }
  }, [data.data, currentEmployee]);

  // Add options for any already selected employees that aren't in search results
  useEffect(() => {
    if (selectedEmployees.length > 0) {
      // Create a map of existing option IDs for quick lookup
      const existingOptionIds = new Set(employeeOptions.map((option) => option.value));

      // Find selected employees that don't have an option yet
      const missingOptions = selectedEmployees
        .filter((employee) => !existingOptionIds.has(employee.id))
        .map((employee) => ({
          label: employee.name,
          value: employee.id,
          employeeData: employee,
        }));

      if (missingOptions.length > 0) {
        setEmployeeOptions((prev) => [...prev, ...missingOptions]);
      }
    }
  }, [selectedEmployees, employeeOptions]);

  const handleValueChange = (selectedIds: string[]) => {
    const updatedSelectedEmployees = selectedIds.map((id) => {
      const existingEmployee = selectedEmployees.find((employee) => employee.id === id);
      if (existingEmployee) {
        return existingEmployee;
      }

      const option = employeeOptions.find((option) => option.value === id);
      if (option?.employeeData) {
        return {
          id: option.employeeData.id,
          name: option.employeeData.name,
        };
      }

      return { id, name: id };
    });

    form.setValue(id, updatedSelectedEmployees);

    if (onChange) {
      const fullSelectedEmployees = selectedIds
        .map((id) => employeeOptions.find((option) => option.value === id)?.employeeData)
        .filter(Boolean) as EmployeeInterface[];
      onChange(fullSelectedEmployees);
    }
  };

  const selectedEmployeeIds = selectedEmployees.map((employee: EmployeeMultiSelectType) => employee.id);

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
                options={employeeOptions}
                onValueChange={handleValueChange}
                defaultValue={selectedEmployeeIds}
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
