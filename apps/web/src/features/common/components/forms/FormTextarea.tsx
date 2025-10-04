"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function FormTextarea({
  form,
  id,
  name,
  className,
  placeholder,
  testId,
}: {
  form: any;
  id: string;
  name: string;
  placeholder?: string;
  className?: string;
  testId?: string;
}) {
  return (
    <div className="flex w-full flex-col">
      <FormField
        control={form.control}
        name={id}
        render={({ field }) => (
          <FormItem className="mb-5">
            <FormLabel>{name}</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                className={cn("min-h-96 w-full", className)}
                disabled={form.formState.isSubmitting}
                placeholder={placeholder}
                data-testid={testId}
              />
            </FormControl>
            <FormMessage data-testid={testId ? `${testId}-error` : undefined} />
          </FormItem>
        )}
      />
    </div>
  );
}
