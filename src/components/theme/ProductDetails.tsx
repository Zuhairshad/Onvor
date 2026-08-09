import type { ReactNode } from "react";

import {
  IconCotton,
  IconDoNotBleach,
  IconDoNotDryClean,
  IconDoNotIron,
  IconLikeColors,
  IconTumbleDry,
  IconWash,
} from "@/components/theme/icons";

/**
 * PDP accordion group. Description is server-rendered `open` so the copy is
 * visible on first paint; the other panels stay closed until the shopper opens
 * one, exactly like the reference theme's product-info accordion.
 */
type Row = {
  key: string;
  title: string;
  open?: boolean;
  body: ReactNode;
};

const CARE_ITEMS: readonly { icon: (p: { className?: string }) => ReactNode; label: string }[] = [
  { icon: IconWash, label: "Machine Wash Cold" },
  { icon: IconDoNotBleach, label: "Do Not Bleach" },
  { icon: IconTumbleDry, label: "Tumble Dry Low" },
  { icon: IconDoNotIron, label: "Do Not Iron" },
  { icon: IconDoNotDryClean, label: "Do Not Dry Clean" },
  { icon: IconLikeColors, label: "Wash With Like Colors" },
];

function CarePanel() {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-y-3 gap-x-6 p-0 pb-5 imp:grid-cols-2">
      {CARE_ITEMS.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-3 text-[14px]">
          <Icon className="h-5 w-5 shrink-0 opacity-70" />
          <span>{label}</span>
        </li>
      ))}
    </ul>
  );
}

function FabricPanel() {
  return (
    <ul className="m-0 list-none space-y-2 p-0 pb-5 text-[14px]">
      <li className="flex items-start gap-3">
        <IconCotton className="mt-[2px] h-5 w-5 shrink-0 opacity-70" />
        <span>100% combed cotton - mid-weight and prewashed to hold its shape.</span>
      </li>
      <li className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-[8px] inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-current opacity-40"
        />
        <span>Soft, dense hand with a matte, uncoated surface.</span>
      </li>
      <li className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-[8px] inline-block h-[6px] w-[6px] shrink-0 rounded-full bg-current opacity-40"
        />
        <span>Loose unisex cut with a slight drop shoulder - sits away from the body.</span>
      </li>
    </ul>
  );
}

export function ProductDetails({
  description,
  fallbackTitle,
  exchanges,
  contact,
}: {
  description: string;
  fallbackTitle: string;
  exchanges: string;
  contact: string;
}) {
  const rows: Row[] = [
    {
      key: "description",
      title: "Description",
      open: true,
      body: (
        <p className="m-0 pb-5 text-[15px] whitespace-pre-line">
          {description || `${fallbackTitle} in 100% cotton, cut for a loose unisex fit.`}
        </p>
      ),
    },
    {
      key: "fabric",
      title: "Fabric and Feel",
      body: <FabricPanel />,
    },
    {
      key: "care",
      title: "Care and Instruction",
      body: <CarePanel />,
    },
    {
      key: "exchanges",
      title: "Exchanges",
      body: <p className="m-0 pb-5 text-[15px]">{exchanges}</p>,
    },
    {
      key: "questions",
      title: "Questions",
      body: <p className="m-0 pb-5 text-[15px]">{contact}</p>,
    },
  ];

  return (
    <div className="mt-10">
      {rows.map((row) => (
        <details
          key={row.key}
          open={row.open}
          className="group border-hairline border-t"
        >
          <summary className="tracking-caps flex cursor-pointer list-none items-center justify-between py-4 text-[13px] uppercase">
            {row.title}
            <span
              aria-hidden
              className="text-[18px] leading-none transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          {row.body}
        </details>
      ))}
      <div className="border-hairline border-t" />
    </div>
  );
}
