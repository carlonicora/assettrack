"use client";

import { MultiSelect } from "@/components/custom-ui/multi-select";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { EquipmentInterface } from "@/features/features/equipment/data/EquipmentInterface";
import { EquipmentService } from "@/features/features/equipment/data/EquipmentService";
import { DataListRetriever, useDataListRetriever } from "@/hooks/useDataListRetriever";
import { Modules } from "@/modules/modules";
import useDebounce from "@/hooks/useDebounce";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

type EquipmentMultiSelectType = {
  id: string;
  name: string;
};

type EquipmentMultiSelectProps = {
  id: string;
  form: any;
  currentEquipment?: EquipmentInterface;
  label?: string;
  placeholder?: string;
  onChange?: (equipments?: EquipmentInterface[]) => void;
  maxCount?: number;
  isRequired?: boolean;
};

export default function EquipmentMultiSelect({
  id,
  form,
  currentEquipment,
  label,
  placeholder,
  onChange,
  maxCount = 3,
  isRequired = false,
}: EquipmentMultiSelectProps) {
  const t = useTranslations("features.equipment");
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const selectedEquipments: EquipmentMultiSelectType[] = useWatch({ control: form.control, name: id }) || [];

  const data: DataListRetriever<EquipmentInterface> = useDataListRetriever({
    retriever: (params) => EquipmentService.findMany(params),
    retrieverParams: {},
    ready: true,
    module: Modules.Equipment,
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
      const equipments = data.data as EquipmentInterface[];
      const filteredEquipments = equipments.filter((equipment) => equipment.id !== currentEquipment?.id);

      const options = filteredEquipments.map((equipment) => ({
        label: equipment.name,
        value: equipment.id,
        equipmentData: equipment,
      }));

      setEquipmentOptions(options);
    }
  }, [data.data, currentEquipment]);

  // Add options for any already selected equipments that aren't in search results
  useEffect(() => {
    if (selectedEquipments.length > 0) {
      // Create a map of existing option IDs for quick lookup
      const existingOptionIds = new Set(equipmentOptions.map((option) => option.value));

      // Find selected equipments that don't have an option yet
      const missingOptions = selectedEquipments
        .filter((equipment) => !existingOptionIds.has(equipment.id))
        .map((equipment) => ({
          label: equipment.name,
          value: equipment.id,
          equipmentData: equipment,
        }));

      if (missingOptions.length > 0) {
        setEquipmentOptions((prev) => [...prev, ...missingOptions]);
      }
    }
  }, [selectedEquipments, equipmentOptions]);

  const handleValueChange = (selectedIds: string[]) => {
    const updatedSelectedEquipments = selectedIds.map((id) => {
      const existingEquipment = selectedEquipments.find((equipment) => equipment.id === id);
      if (existingEquipment) {
        return existingEquipment;
      }

      const option = equipmentOptions.find((option) => option.value === id);
      if (option?.equipmentData) {
        return {
          id: option.equipmentData.id,
          name: option.equipmentData.name,
        };
      }

      return { id, name: id };
    });

    form.setValue(id, updatedSelectedEquipments);

    if (onChange) {
      const fullSelectedEquipments = selectedIds
        .map((id) => equipmentOptions.find((option) => option.value === id)?.equipmentData)
        .filter(Boolean) as EquipmentInterface[];
      onChange(fullSelectedEquipments);
    }
  };

  const selectedEquipmentIds = selectedEquipments.map((equipment: EquipmentMultiSelectType) => equipment.id);

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
                options={equipmentOptions}
                onValueChange={handleValueChange}
                defaultValue={selectedEquipmentIds}
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
