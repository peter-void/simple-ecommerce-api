export const allowedStatusTransaction: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: [],
  CANCELLED: [],
};

export const canTransition = (from: string, to: string): boolean => {
  return allowedStatusTransaction[from]?.includes(to) as boolean;
};
