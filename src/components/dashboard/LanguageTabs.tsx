"use client";

import type { ReactNode } from "react";
import { get, useFormState } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const LANGS = [
  { code: "bn", label: "বাংলা" },
  { code: "en", label: "English" },
] as const;

/**
 * bn / en tabs for bilingual content. `prefix` is the form path holding `{ bn, en }`;
 * a tab turns red when a field inside it has an error.
 */
export function LanguageTabs({
  prefix,
  children,
}: {
  prefix: string;
  children: (lang: "bn" | "en") => ReactNode;
}) {
  const { errors } = useFormState({ name: prefix });

  return (
    <Tabs defaultValue="bn">
      <TabsList>
        {LANGS.map(({ code, label }) => (
          <TabsTrigger
            key={code}
            value={code}
            lang={code}
            className={cn(get(errors, `${prefix}.${code}`) && "text-error")}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {LANGS.map(({ code }) => (
        <TabsContent key={code} value={code} className="space-y-space-md pt-space-sm" lang={code}>
          {children(code)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
