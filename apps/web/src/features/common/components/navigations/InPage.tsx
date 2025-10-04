"use client";

import { Link } from "@/components/custom-ui/link";
import { PageContentSectionTitle } from "@/features/common/components/containers/PageContentContainer";
import { useTranslations } from "next-intl";

type InPageProps = {
  links: (string | PageContentSectionTitle)[];
};

export default function InPage({ links }: InPageProps) {
  const t = useTranslations();
  if (links.length === 0) return null;

  return (
    <div className="my-2 ml-4 flex w-52 min-w-52 flex-col gap-y-4 border-l pl-4 text-sm">
      <h3 className="font-semibold">{t(`generic.in_page_links.in_this_page`)}</h3>
      <div className="flex w-full flex-col">
        {links.map((link: string | PageContentSectionTitle) => {
          const title = typeof link === "string" ? link : link.title;

          return (
            <Link
              key={title}
              href={`#${title.toLocaleLowerCase().replaceAll(" ", "")}`}
              className={`text-primary hover:text-primary`}
            >
              {title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
