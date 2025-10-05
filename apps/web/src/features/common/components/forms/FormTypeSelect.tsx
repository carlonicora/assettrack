"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

export default function FormTypeSelect({
  form,
  id,
  name,
  placeholder,
  disabled,
  type,
  translationKey,
  onChange,
  useRows,
  isRequired,
  testId,
}: {
  form: any;
  id: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  type: any;
  translationKey: string;
  isRequired?: boolean;
  onChange?: (value: string) => void;
  useRows?: boolean;
  testId?: string;
}) {
  const t = useTranslations();

  const values = Object.keys(type).map((key) => ({
    id: type[key],
    text: t(`${translationKey}`, { type: type[key] }),
  }));

  return (
    <div className={`flex w-full flex-col`}>
      <FormField
        control={form.control}
        name={id}
        render={({ field }) => (
          <FormItem className={`flex w-full ${useRows ? `flex-row items-center justify-between gap-x-4` : `flex-col`}`}>
            {name && (
              <FormLabel className={`${useRows ? `min-w-28` : ``}`}>
                {name}
                {isRequired && <span className="text-destructive ml-2 font-semibold">*</span>}
              </FormLabel>
            )}
            <Select
              onValueChange={(e) => {
                field.onChange(e);
                if (onChange) onChange(e);
              }}
              defaultValue={field.value}
              data-testid={testId}
            >
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {values.map((type: { id: string; text: string }) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.text}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
