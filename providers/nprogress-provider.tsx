"use client";

import { AppProgressProvider as ProgressProvider } from '@bprogress/next';

const NProgressProvider = ({ children }: any) => {
  return (
    <>
      <ProgressProvider
        height="2px"
        color="#00bb79"
        options={{ showSpinner: false }}
        shallowRouting>
        {children}
      </ProgressProvider>
    </>
  );
};

export default NProgressProvider;
