"use client";

import { SharedProvider } from "@/features/common/contexts/SharedContext";
import { BreadcrumbItemData } from "@/features/common/interfaces/breadcrumb.item.data.interface";
import LoanDeleter from "@/features/features/loan/components/forms/LoanDeleter";
import LoanEditor from "@/features/features/loan/components/forms/LoanEditor";
import { LoanInterface } from "@/features/features/loan/data/LoanInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";

import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";
import { useTranslations } from "next-intl";
import { createContext, ReactNode, useContext, useState } from "react";

interface LoanContextType {
  loan: LoanInterface | undefined;
  setLoan: (value: LoanInterface | undefined) => void;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

type LoanProviderProps = {
  children: ReactNode;
  dehydratedLoan?: JsonApiHydratedDataInterface;
};

export const LoanProvider = ({ children, dehydratedLoan }: LoanProviderProps) => {
  const generateUrl = usePageUrlGenerator();
  const t = useTranslations();

  const [loan, setLoan] = useState<LoanInterface | undefined>(
    dehydratedLoan ? rehydrate<LoanInterface>(Modules.Loan, dehydratedLoan) : undefined,
  );

  const breadcrumb = () => {
    const response: BreadcrumbItemData[] = [];

    response.push({
      name: t(`types.loans`, { count: 2 }),
      href: generateUrl({ page: Modules.Loan }),
    });

    if (loan)
      response.push({
        name: `${t(`types.loans`, { count: 1 })} - ${loan.employee.name} - ${loan.equipment.name}`,
        href: generateUrl({ page: Modules.Loan, id: loan.id }),
      });

    return response;
  };

  const title = () => {
    const response: any = {
      type: t(`types.loans`, { count: loan ? 1 : 2 }),
    };

    const functions: ReactNode[] = [];

    if (loan) {
      response.element = `${t(`types.loans`, { count: 1 })} - ${loan.employee.name} - ${loan.equipment.name}`;

      functions.push(<LoanDeleter key={`LoanDeleter`} loan={loan} />);

      functions.push(<LoanEditor key={`LoanEditor`} loan={loan} propagateChanges={setLoan} />);
    } else {
      functions.push(<LoanEditor key={`LoanEditor`} />);
    }

    if (functions.length > 0) response.functions = functions;

    return response;
  };

  return (
    <SharedProvider value={{ breadcrumbs: breadcrumb(), title: title() }}>
      <LoanContext.Provider
        value={{
          loan: loan,
          setLoan: setLoan,
        }}
      >
        {children}
      </LoanContext.Provider>
    </SharedProvider>
  );
};

export const useLoanContext = (): LoanContextType => {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error("useLoanContext must be used within a LoanProvider");
  }
  return context;
};
