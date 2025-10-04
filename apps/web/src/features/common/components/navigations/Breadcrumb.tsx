"use client";

import { Link } from "@/components/custom-ui/link";
import {
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  Breadcrumb as UIBreadcrumb,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { BreadcrumbItemData } from "@/features/common/interfaces/breadcrumb.item.data.interface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { useTranslations } from "next-intl";
import { Fragment, useState } from "react";

type BreadcrumbProps = { items: BreadcrumbItemData[] };

const ITEMS_TO_DISPLAY = 3;

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();

  const [open, setOpen] = useState<boolean>(false);

  return (
    <UIBreadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {/* <BreadcrumbLink href={generateUrl({ page: `/` })}>{t(`generic.home`)}</BreadcrumbLink> */}
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link href={generateUrl({ page: `/` })}>{t(`generic.home`)}</Link>
        </BreadcrumbItem>
        {items.length > 0 && <BreadcrumbSeparator />}

        {items.length > ITEMS_TO_DISPLAY ? (
          <>
            <BreadcrumbItem>
              {items[0].href ? (
                <Link href={items[0].href}>{items[0].name}</Link>
              ) : (
                // <BreadcrumbLink href={items[0].href}>{items[0].name}</BreadcrumbLink>
                <>{items[0].name}</>
                // <BreadcrumbLink>{items[0].name}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger className="flex items-center gap-1" aria-label="Toggle menu">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {items.slice(1, -ITEMS_TO_DISPLAY + 1).map((item, index) => (
                    <DropdownMenuItem key={index}>
                      <Link href={item.href ? item.href : "#"}>{item.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {items.slice(-ITEMS_TO_DISPLAY + 1).map((item, index) => (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <Link href={item.href}>{item.name}</Link>
                  ) : (
                    // <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                    <>{item.name}</>
                    // <BreadcrumbLink>{item.name}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < items.slice(-ITEMS_TO_DISPLAY + 1).length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </>
        ) : (
          <>
            {items.map((item, index) => (
              <Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <Link href={item.href}>{item.name}</Link>
                  ) : (
                    // <BreadcrumbLink href={item.href}>{item.name}</BreadcrumbLink>
                    <>{item.name}</>
                    // <BreadcrumbLink>{item.name}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < items.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            ))}
          </>
        )}
      </BreadcrumbList>
    </UIBreadcrumb>
  );
}
