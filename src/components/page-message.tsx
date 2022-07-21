import type { PropsWithChildren } from "react";

function PageMessage(props: PropsWithChildren<unknown>) {
  return (
    <div className="flex flex-col justify-center py-20 text-2xl">
      <h1 className="text-2xl">{props.children}</h1>
    </div>
  );
}

export default PageMessage;
