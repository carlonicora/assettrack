"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, CircleXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function FormDateTime({
  form,
  id,
  name,
  minDate,
  onChange,
  allowEmpty,
}: {
  form: any;
  id: string;
  name?: string;
  placeholder?: string;
  minDate?: Date;
  onChange?: (date?: Date) => Promise<void>;
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const t = useTranslations();

  const [selectedHours, setSelectedHours] = useState<number>(new Date().getHours());
  const [selectedMinutes, setSelectedMinutes] = useState<number>(roundToNearestFiveMinutes(new Date().getMinutes()));

  const hoursOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    return {
      value: hour,
      label: hour.toString().padStart(2, "0"),
    };
  });

  const minutesOptions = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5;
    return {
      value: minute,
      label: minute.toString().padStart(2, "0"),
    };
  });

  function roundToNearestFiveMinutes(minutes: number): number {
    return (Math.round(minutes / 5) * 5) % 60;
  }

  const handleTimeChange = (hours: number, minutes: number) => {
    const currentDate = form.getValues(id);
    if (currentDate) {
      const updatedDate = new Date(currentDate);
      updatedDate.setHours(hours);
      updatedDate.setMinutes(minutes);
      form.setValue(id, updatedDate);
      if (onChange) onChange(updatedDate);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <FormField
        control={form.control}
        name={id}
        render={({ field }) => (
          <FormItem className={`${name ? "mb-5" : "mb-1"} w-full`}>
            {name && <FormLabel>{name}</FormLabel>}
            <FormControl>
              <div className="relative flex flex-row">
                <Popover open={open} onOpenChange={setOpen} modal={true}>
                  <div className="flex w-full flex-row items-center justify-between">
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP HH:mm") : <span>{t(`generic.pick_date_time`)}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    {field.value && allowEmpty !== false && (
                      <CircleXIcon
                        className="text-muted hover:text-destructive ml-2 h-6 w-6 cursor-pointer"
                        onClick={() => {
                          if (onChange) onChange(undefined);
                          form.setValue(id, "");
                        }}
                      />
                    )}
                  </div>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="flex flex-col space-y-4">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // Preserve the current time when selecting a new date
                            const newDate = new Date(date);
                            if (field.value) {
                              const currentDate = new Date(field.value);
                              newDate.setHours(currentDate.getHours(), currentDate.getMinutes());
                            } else {
                              newDate.setHours(selectedHours, selectedMinutes);
                            }
                            form.setValue(id, newDate);
                            if (onChange) onChange(newDate);

                            // Update time state values
                            setSelectedHours(newDate.getHours());
                            setSelectedMinutes(roundToNearestFiveMinutes(newDate.getMinutes()));
                          }
                        }}
                        disabled={(date) => (minDate && date < minDate ? true : false)}
                      />
                      <div className="flex flex-row items-end justify-center space-x-4">
                        <div className="flex flex-col space-y-2">
                          <Label htmlFor="hours-select">Hours</Label>
                          <Select
                            value={String(field.value ? new Date(field.value).getHours() : selectedHours)}
                            onValueChange={(value) => {
                              const hours = parseInt(value);
                              setSelectedHours(hours);
                              handleTimeChange(
                                hours,
                                field.value
                                  ? roundToNearestFiveMinutes(new Date(field.value).getMinutes())
                                  : selectedMinutes,
                              );
                            }}
                          >
                            <SelectTrigger id="hours-select" className="w-[70px]">
                              <SelectValue placeholder="Hour" />
                            </SelectTrigger>
                            <SelectContent>
                              {hoursOptions.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="mb-[9px] text-xl">:</div>
                        <div className="flex flex-col space-y-2">
                          <Label htmlFor="minutes-select">Minutes</Label>
                          <Select
                            value={String(
                              field.value
                                ? roundToNearestFiveMinutes(new Date(field.value).getMinutes())
                                : selectedMinutes,
                            )}
                            onValueChange={(value) => {
                              const minutes = parseInt(value);
                              setSelectedMinutes(minutes);
                              handleTimeChange(field.value ? new Date(field.value).getHours() : selectedHours, minutes);
                            }}
                          >
                            <SelectTrigger id="minutes-select" className="w-[70px]">
                              <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                              {minutesOptions.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        className="mt-2"
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        {t(`generic.buttons.select_date`)}
                      </Button>
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
