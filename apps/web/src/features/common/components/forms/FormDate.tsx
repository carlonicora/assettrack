"use client";

import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isValid, parse } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon, CircleXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function FormDate({
  form,
  id,
  name,
  minDate,
  onChange,
  isRequired,
}: {
  form: any;
  id: string;
  name?: string;
  placeholder?: string;
  minDate?: Date;
  onChange?: (date?: Date) => Promise<void>;
  isRequired?: boolean;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(() => {
    const currentValue = form.getValues(id);
    return currentValue || new Date();
  });
  const [inputValue, setInputValue] = useState<string>(() => {
    const currentValue = form.getValues(id);
    return currentValue ? format(currentValue, "dd/MM/yyyy") : "";
  });
  const t = useTranslations();

  // Generate year options (1900 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i);

  // Month names in Italian
  const monthNames = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  // Handle text input change
  const handleInputChange = (value: string, field: any) => {
    setInputValue(value);

    // Try to parse the date in Italian format (dd/MM/yyyy)
    const parsedDate = parse(value, "dd/MM/yyyy", new Date());

    if (isValid(parsedDate)) {
      field.onChange(parsedDate);
      setDisplayMonth(parsedDate);
      if (onChange) onChange(parsedDate);
    } else if (value === "") {
      field.onChange(undefined);
      if (onChange) onChange(undefined);
    }
  };

  // Handle calendar selection
  const handleCalendarSelect = (selectedDate: Date | undefined, field: any) => {
    field.onChange(selectedDate);
    if (selectedDate) {
      setInputValue(format(selectedDate, "dd/MM/yyyy"));
      setDisplayMonth(selectedDate);
    } else {
      setInputValue("");
    }
    if (onChange) onChange(selectedDate);
  };

  return (
    <div className="flex w-full flex-col">
      <FormField
        control={form.control}
        name={id}
        render={({ field }) => (
          <FormItem className={`${name ? "mb-5" : "mb-1"} w-full`}>
            {name && (
              <FormLabel>
                {name}
                {isRequired && <span className="text-destructive ml-2 font-semibold">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className="relative">
                <Popover open={open} onOpenChange={setOpen} modal={true}>
                  <div className="relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value, field)}
                      placeholder="gg/mm/aaaa"
                      className="pr-16"
                    />
                    <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center space-x-1">
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md"
                        >
                          <CalendarIcon className="h-4 w-4 opacity-50" />
                        </button>
                      </PopoverTrigger>
                      {field.value && (
                        <button
                          type="button"
                          className="hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md"
                          onClick={() => {
                            field.onChange(undefined);
                            setInputValue("");
                            if (onChange) onChange(undefined);
                          }}
                        >
                          <CircleXIcon className="h-4 w-4 opacity-50 hover:opacity-100" />
                        </button>
                      )}
                    </div>
                  </div>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                      {/* Year and Month Selectors */}
                      <div className="mb-3 flex gap-2">
                        <Select
                          value={displayMonth.getMonth().toString()}
                          onValueChange={(value) => {
                            const newMonth = parseInt(value);
                            const newDate = new Date(displayMonth.getFullYear(), newMonth, 1);
                            setDisplayMonth(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {monthNames.map((month, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={displayMonth.getFullYear().toString()}
                          onValueChange={(value) => {
                            const newYear = parseInt(value);
                            const newDate = new Date(newYear, displayMonth.getMonth(), 1);
                            setDisplayMonth(newDate);
                          }}
                        >
                          <SelectTrigger className="w-[80px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {yearOptions.reverse().map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Calendar */}
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(e) => {
                          handleCalendarSelect(e, field);
                          setOpen(false);
                        }}
                        disabled={(date) => (minDate && date < minDate ? true : false)}
                        locale={it}
                        weekStartsOn={1}
                        month={displayMonth}
                        onMonthChange={setDisplayMonth}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
