"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";

type FormCheckboxProps = {
  form: any;
  id: string;
  name: string;
  labelBefore?: boolean;
  description?: string;
  isRequired?: boolean;
};

export default function FormCheckbox({ form, id, name, labelBefore, description, isRequired }: FormCheckboxProps) {
  const simpleLabel = () => {
    return (
      <FormLabel htmlFor={id} className={`font-normal ${labelBefore ? "" : "ml-3"}`}>
        {name}
      </FormLabel>
    );
  };

  const label = () => {
    if (description) return simpleLabel();
    else
      return (
        <Tooltip>
          <TooltipTrigger asChild>{simpleLabel()}</TooltipTrigger>
          <TooltipContent>{description}</TooltipContent>
        </Tooltip>
      );
  };

  return (
    <div className="flex w-full flex-col">
      <FormField
        control={form.control}
        name={id}
        render={({ field }) => (
          <FormItem className={`${name ? "mb-5" : "mb-1"}`}>
            <FormControl>
              <div className="flex gap-x-4">
                {labelBefore && label()}
                {labelBefore && isRequired && <span className="text-destructive ml-2 font-semibold">*</span>}
                <Checkbox id={id} defaultChecked={field.value} onCheckedChange={field.onChange} />
                {!labelBefore && label()}
                {!labelBefore && isRequired && <span className="text-destructive ml-2 font-semibold">*</span>}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
