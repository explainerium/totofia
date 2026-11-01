import { cn } from "@/lib/utils";

/**
 * Renders sanitized CMS / product HTML (sanitized by the services when saved) with readable
 * typography: headings, lists, links, quotes and tables (size guide).
 */
export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-space-md text-body-md text-on-surface-variant",
        "[&_h2]:pt-space-sm [&_h2]:font-heading [&_h2]:text-headline-sm [&_h2]:text-on-surface",
        "[&_h3]:pt-space-xs [&_h3]:font-heading [&_h3]:text-label-lg [&_h3]:text-on-surface",
        "[&_h4]:text-label-lg [&_h4]:text-on-surface",
        "[&_a]:text-primary [&_a]:underline [&_strong]:text-on-surface",
        "[&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6",
        "[&_blockquote]:border-l-4 [&_blockquote]:border-primary/40 [&_blockquote]:pl-space-md",
        "[&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-xl [&_table]:text-body-sm",
        "[&_th]:bg-surface-container [&_th]:px-space-sm [&_th]:py-2 [&_th]:text-left [&_th]:text-label-md [&_th]:text-on-surface",
        "[&_td]:border-t [&_td]:border-outline-variant/40 [&_td]:px-space-sm [&_td]:py-2",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
