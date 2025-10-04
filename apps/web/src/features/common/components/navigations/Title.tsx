"use client";

import { Fragment, ReactNode } from "react";

type TitleProps = {
  type: string | string[];
  element?: string;
  functions?: ReactNode;
};

export default function Title({ type, element, functions }: TitleProps) {
  return (
    <>
      <div className="flex flex-row items-center justify-start gap-x-4 text-3xl">
        {element !== undefined ? (
          <>
            {type instanceof Array ? (
              <>
                {type.map((el, index) => (
                  <Fragment key={index}>
                    <div data-testid="a360ai-title" className={`text-muted-foreground font-light`}>
                      {el}
                    </div>
                    <div className={`text-muted-foreground font-light`}>|</div>
                  </Fragment>
                ))}
              </>
            ) : element === "" ? (
              <Fragment>
                <div data-testid="a360ai-title" className={`text-muted-foreground font-light`}>
                  {type ?? ""}
                </div>
              </Fragment>
            ) : (
              <>
                <div data-testid="a360ai-title" className={`text-muted-foreground font-light`}>
                  {type}
                </div>
                <div className={`text-muted-foreground font-light`}>|</div>
                <div className={`text-primary font-semibold`}>{element}</div>
              </>
            )}
          </>
        ) : (
          <>
            {type instanceof Array ? (
              <>
                {type.map((el, index) => (
                  <Fragment key={index}>
                    <div
                      className={`${index === type.length - 1 ? `text-primary font-semibold` : `text-muted-foreground font-light`}`}
                      data-testid="a360ai-title"
                    >
                      {el}
                    </div>
                    {index !== type.length - 1 && (
                      <div
                        className={`${index === type.length - 1 ? `text-primary font-semibold` : `text-muted-foreground font-light`}`}
                      >
                        |
                      </div>
                    )}
                  </Fragment>
                ))}
              </>
            ) : (
              <div className={`text-primary font-semibold`}>{type}</div>
            )}
          </>
        )}
      </div>
      {functions && <div className="flex flex-row items-center justify-start">{functions}</div>}
    </>
  );
}
