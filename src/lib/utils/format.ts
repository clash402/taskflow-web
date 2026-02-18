import { RunStatus, StepStatus } from "@/lib/api/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatUsd = (amount?: number) => {
  if (typeof amount !== "number") {
    return "$0.00";
  }

  return currencyFormatter.format(amount);
};

export const formatTokens = (count?: number) => {
  if (typeof count !== "number") {
    return "0";
  }

  return compactNumberFormatter.format(count);
};

export const statusLabel = (status: RunStatus | StepStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const statusTone = (status: RunStatus | StepStatus) => {
  switch (status) {
    case "completed":
      return "success" as const;
    case "running":
    case "planning":
    case "reflecting":
      return "info" as const;
    case "failed":
      return "danger" as const;
    case "canceled":
      return "muted" as const;
    default:
      return "default" as const;
  }
};
