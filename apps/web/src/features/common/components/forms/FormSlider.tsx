"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { useWatch } from "react-hook-form";

export default function FormSlider({
  form,
  id,
  name,
  disabled,
  showPercentage,
}: {
  form: any;
  id: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  showPercentage?: boolean;
}) {
  const value = useWatch({ control: form.control, name: id });

  return (
    <div className="flex w-full flex-col">
      <FormField
        control={form.control}
        name={id}
        render={({ field }) => (
          <FormItem className={`${name ? "mb-5" : "mb-1"}`}>
            {name && <FormLabel>{name}</FormLabel>}
            <FormControl>
              <div>
                {showPercentage && (
                  <div className="text-muted-foreground mb-2 flex w-full justify-center text-xs">{`${value}%`}</div>
                )}
                <Slider
                  onValueChange={(value: number[]) => form.setValue(id, value[0])}
                  value={[value]}
                  max={100}
                  step={5}
                  disabled={disabled === true || form.formState.isSubmitting}
                />
                {/* </div> */}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
