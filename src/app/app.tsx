"use client";

import dynamic from "next/dynamic";
import { APP_NAME } from "@/lib/constants";
import { ComponentType } from "react";

interface AppProps {
  title?: string;
  children?: React.ReactNode;
}

// note: dynamic import is required for components that use the Frame SDK
const AppComponent = dynamic(() => import("@/components/App"), {
  ssr: false,
}) as ComponentType<AppProps>;

export default function App({ title, children }: AppProps = { title: APP_NAME }) {
  return <AppComponent title={title}>{children}</AppComponent>;
}
