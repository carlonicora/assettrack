import { Link as NextIntlLink } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import * as React from "react";

// Extract the proper types from the next-intl Link component
type NextIntlLinkProps = React.ComponentProps<typeof NextIntlLink>;

// Create our custom Link props interface that extends the next-intl Link
export interface LinkProps extends NextIntlLinkProps {
  className?: string;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(({ className, ...props }, ref) => {
  return <NextIntlLink ref={ref} className={cn(className, `font-medium`)} {...props} />;
});

Link.displayName = "Link";

export { Link };
