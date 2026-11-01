"use client";

import { TableKit } from "@tiptap/extension-table";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BetweenHorizontalEnd,
  BetweenVerticalEnd,
  Bold,
  Grid2x2X,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Table,
  TableColumnsSplit,
  TableRowsSplit,
  Unlink,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FieldShell } from "./FieldShell";

type ProRichTextProps = { name: string; label?: ReactNode; description?: ReactNode };

/** HTML rich text (bold, italic, headings, lists, links, tables). The server sanitizes on save. */
export function ProRichText({ name, label, description }: ProRichTextProps) {
  const { control } = useFormContext();

  return (
    <FieldShell name={name} label={label} description={description}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RichTextEditor value={(field.value as string) ?? ""} onChange={field.onChange} />
        )}
      />
    </FieldShell>
  );
}

function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      // Size charts etc. Without it, saving content that has a table (the size guide) drops it.
      TableKit.configure({ table: { resizable: false } }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-40 px-3 py-2 text-body-md outline-none [&_h2]:text-headline-sm [&_h3]:text-label-lg [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-primary [&_a]:underline",
          "[&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-outline-variant [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-outline-variant [&_th]:bg-surface-container [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_.selectedCell]:bg-primary/10",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Keep the editor in sync when the form resets (e.g. after loading a product).
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className="rounded-lg border border-input bg-surface-container-lowest focus-within:ring-2 focus-within:ring-primary">
      {editor ? <Toolbar editor={editor} /> : null}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  // Re-render when the cursor enters or leaves a table (selection changes alone don't).
  const inTable = useEditorState({ editor, selector: ({ editor: e }) => e.isActive("table") });
  const chain = () => editor.chain().focus();
  const tableButtons = inTable
    ? [
        { icon: BetweenHorizontalEnd, label: "Add row", run: () => chain().addRowAfter().run() },
        {
          icon: BetweenVerticalEnd,
          label: "Add column",
          run: () => chain().addColumnAfter().run(),
        },
        { icon: TableRowsSplit, label: "Delete row", run: () => chain().deleteRow().run() },
        {
          icon: TableColumnsSplit,
          label: "Delete column",
          run: () => chain().deleteColumn().run(),
        },
        { icon: Grid2x2X, label: "Delete table", run: () => chain().deleteTable().run() },
      ]
    : [
        {
          icon: Table,
          label: "Insert table",
          run: () => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        },
      ];

  const buttons: { icon: LucideIcon; label: string; active: boolean; run: () => void }[] = [
    {
      icon: Bold,
      label: "Bold",
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      icon: Italic,
      label: "Italic",
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      icon: Heading2,
      label: "Heading",
      active: editor.isActive("heading", { level: 2 }),
      run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Heading3,
      label: "Subheading",
      active: editor.isActive("heading", { level: 3 }),
      run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: List,
      label: "Bullet list",
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrdered,
      label: "Numbered list",
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    ...tableButtons.map((b) => ({ ...b, active: false })),
  ];

  return (
    <div className="flex flex-wrap gap-0.5 border-b border-input p-1">
      {buttons.map(({ icon: Icon, label, active, run }) => (
        <Button
          key={label}
          type="button"
          size="icon-sm"
          variant="ghost"
          aria-label={label}
          aria-pressed={active}
          className={cn(active && "bg-surface-container text-primary")}
          onClick={run}
        >
          <Icon />
        </Button>
      ))}
      <LinkButton editor={editor} />
    </div>
  );
}

function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");
  const active = editor.isActive("link");

  if (active) {
    return (
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        aria-label="Remove link"
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <Unlink />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" size="icon-sm" variant="ghost" aria-label="Add link">
          <Link2 />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-72 gap-space-sm">
        <Input
          value={href}
          placeholder="https://"
          onChange={(e) => setHref(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
        />
        <Button
          type="button"
          size="sm"
          onClick={() => {
            if (href) editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
            setHref("");
            setOpen(false);
          }}
        >
          Add
        </Button>
      </PopoverContent>
    </Popover>
  );
}
