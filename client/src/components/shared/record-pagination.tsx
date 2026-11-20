"use client";
import { Button } from "@heroui/react";
export function RecordPagination({
  total,
  offset,
  limit = 20,
  onChange,
  busy,
}: {
  total: number;
  offset: number;
  limit?: number;
  onChange: (offset: number) => void;
  busy?: boolean;
}) {
  return (
    <div className="ui-pagination">
      <span>
        {total === 0
          ? "0"
          : `${Math.min(offset + 1, total)}–${Math.min(offset + limit, total)}`}{" "}
        of {total}
      </span>
      <Button
        isDisabled={busy || offset === 0}
        onPress={() => onChange(Math.max(0, offset - limit))}
      >
        Previous
      </Button>
      <Button
        isDisabled={busy || offset + limit >= total}
        onPress={() => onChange(offset + limit)}
      >
        Next
      </Button>
    </div>
  );
}
