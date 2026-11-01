import "server-only";
import { prisma } from "../../db/prisma";
import { ApiError } from "../../http/api-error";
import { byLocale, toRows } from "../catalog/translations";
import type { AttributeInput, AttributeValueInput } from "./attribute.schema";
import { invalidate, TAGS } from "../../lib/cache";

const include = {
  translations: true,
  values: { include: { translations: true }, orderBy: { sortOrder: "asc" } },
} as const;

type Row = NonNullable<Awaited<ReturnType<typeof findRow>>>;

const findRow = (id: string) => prisma.attribute.findUnique({ where: { id }, include });

function toDto(row: Row) {
  const name = byLocale(row.translations);
  return {
    id: row.id,
    code: row.code,
    sortOrder: row.sortOrder,
    name: { bn: name.bn?.name ?? "", en: name.en?.name ?? "" },
    values: row.values.map((v) => {
      const label = byLocale(v.translations);
      return {
        id: v.id,
        code: v.code,
        sortOrder: v.sortOrder,
        colorHex: v.colorHex,
        label: { bn: label.bn?.label ?? "", en: label.en?.label ?? "" },
      };
    }),
  };
}

export type AdminAttribute = ReturnType<typeof toDto>;

export async function listAttributes() {
  const rows = await prisma.attribute.findMany({ include, orderBy: { sortOrder: "asc" } });
  return rows.map(toDto);
}

export async function createAttribute(input: AttributeInput) {
  const row = await prisma.attribute.create({
    data: {
      code: input.code,
      sortOrder: input.sortOrder,
      translations: {
        createMany: { data: toRows({ bn: { name: input.name.bn }, en: { name: input.name.en } }) },
      },
    },
    include,
  });
  invalidate(TAGS.catalog);
  return toDto(row);
}

export async function updateAttribute(id: string, input: AttributeInput) {
  await assertAttribute(id);
  const row = await prisma.$transaction(async (tx) => {
    await tx.attributeTranslation.deleteMany({ where: { attributeId: id } });
    return tx.attribute.update({
      where: { id },
      data: {
        code: input.code,
        sortOrder: input.sortOrder,
        translations: {
          createMany: {
            data: toRows({ bn: { name: input.name.bn }, en: { name: input.name.en } }),
          },
        },
      },
      include,
    });
  });
  invalidate(TAGS.catalog);
  return toDto(row);
}

export async function deleteAttribute(id: string) {
  await assertAttribute(id);
  await prisma.attribute.delete({ where: { id } });
  invalidate(TAGS.catalog);
}

export async function createAttributeValue(attributeId: string, input: AttributeValueInput) {
  await assertAttribute(attributeId);
  await prisma.attributeValue.create({
    data: {
      attributeId,
      code: input.code,
      sortOrder: input.sortOrder,
      colorHex: input.colorHex,
      translations: {
        createMany: {
          data: toRows({ bn: { label: input.label.bn }, en: { label: input.label.en } }),
        },
      },
    },
  });
  invalidate(TAGS.catalog);
  return toDto((await findRow(attributeId))!);
}

export async function updateAttributeValue(
  attributeId: string,
  valueId: string,
  input: AttributeValueInput,
) {
  await assertValue(attributeId, valueId);
  await prisma.$transaction(async (tx) => {
    await tx.attributeValueTranslation.deleteMany({ where: { valueId } });
    await tx.attributeValue.update({
      where: { id: valueId },
      data: {
        code: input.code,
        sortOrder: input.sortOrder,
        colorHex: input.colorHex,
        translations: {
          createMany: {
            data: toRows({ bn: { label: input.label.bn }, en: { label: input.label.en } }),
          },
        },
      },
    });
  });
  invalidate(TAGS.catalog);
  return toDto((await findRow(attributeId))!);
}

/** Refused while variants still use the value — deactivate those variants first. */
export async function deleteAttributeValue(attributeId: string, valueId: string) {
  await assertValue(attributeId, valueId);
  const used = await prisma.variantAttributeValue.count({ where: { attributeValueId: valueId } });
  if (used > 0) throw new ApiError(409, "attributeValueInUse", { count: used });
  await prisma.attributeValue.delete({ where: { id: valueId } });
  invalidate(TAGS.catalog);
  return toDto((await findRow(attributeId))!);
}

async function assertAttribute(id: string) {
  const found = await prisma.attribute.findUnique({ where: { id }, select: { id: true } });
  if (!found) throw new ApiError(404, "notFound");
}

async function assertValue(attributeId: string, valueId: string) {
  const found = await prisma.attributeValue.findFirst({
    where: { id: valueId, attributeId },
    select: { id: true },
  });
  if (!found) throw new ApiError(404, "notFound");
}
