"use client";

import { useId } from "react";
import { Card, CardContent, Label, Radio, RadioGroup } from "@heroui/react";
import { Icon } from "@/components/ui/icon";
import type { CreateRideDto } from "@/store/api/generated/api";
import { money } from "./booking-shared";

type PaymentOption = CreateRideDto["payment_option"];

export function paymentAmounts(
  option: PaymentOption,
  total: number,
  advancePercent: number,
) {
  const now =
    option === "OFFLINE"
      ? 0
      : option === "ONLINE"
        ? total
        : Math.round(total * advancePercent) / 100;
  return { now, later: Math.round((total - now) * 100) / 100 };
}

export const paymentNames: Record<PaymentOption, string> = {
  ONLINE: "Pay online",
  PARTIAL: "Pay an advance",
  OFFLINE: "Pay later",
};

export function PaymentOptions({
  value,
  onChange,
  total,
  advancePercent,
  onlineAvailable,
  disabled,
}: {
  value: PaymentOption;
  onChange: (value: PaymentOption) => void;
  total: number;
  advancePercent: number;
  onlineAvailable: boolean;
  disabled: boolean;
}) {
  const id = useId();
  const choices = [
    {
      value: "ONLINE",
      icon: "card",
      description: "Pay the full fare online through Razorpay.",
    },
    {
      value: "PARTIAL",
      icon: "split",
      description: `Pay ${advancePercent}% online. Settle the rest offline for your trip.`,
    },
    {
      value: "OFFLINE",
      icon: "wallet",
      description: "Book now and pay the full fare offline for your trip.",
    },
  ] as const;
  return (
    <Card className="booking-panel payment-panel">
      <CardContent>
        <p className="eyebrow">PAYMENT, YOUR WAY</p>
        <h2 id={`${id}-heading`}>How would you like to pay?</h2>
        <p id={`${id}-hint`} className="payment-hint">
          Select an option to see what’s due now and later.
        </p>
        <RadioGroup
          aria-labelledby={`${id}-heading`}
          aria-describedby={`${id}-hint`}
          value={value}
          onChange={(next) => {
            const choice = choices.find((item) => item.value === next);
            if (choice) onChange(choice.value);
          }}
          isDisabled={disabled}
          className="payment-options"
        >
          {choices.map((choice) => {
            const unavailable = choice.value !== "OFFLINE" && !onlineAvailable;
            const amounts = paymentAmounts(choice.value, total, advancePercent);
            return (
              <Radio
                key={choice.value}
                value={choice.value}
                isDisabled={unavailable}
                className="payment-option"
              >
                <Radio.Content
                  className="payment-option-card"
                  aria-describedby={`${id}-${choice.value}-description ${id}-${choice.value}-amounts`}
                >
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  <span className="payment-option-body">
                    <span className="payment-option-heading">
                      <Label>{paymentNames[choice.value]}</Label>
                      {unavailable && (
                        <span className="payment-unavailable">Unavailable</span>
                      )}
                    </span>
                    <span
                      id={`${id}-${choice.value}-description`}
                      className="payment-option-description"
                    >
                      {choice.description}
                    </span>
                    <span
                      id={`${id}-${choice.value}-amounts`}
                      className="payment-option-amounts"
                    >
                      <strong>{money(amounts.now)} now</strong>
                      <span aria-hidden="true">·</span>
                      <span>
                        {choice.value === "ONLINE"
                          ? "Nothing due later"
                          : `${money(amounts.later)} later`}
                      </span>
                    </span>
                  </span>
                  <span className="payment-option-icon" aria-hidden="true">
                    <Icon name={choice.icon} width={22} height={22} />
                  </span>
                </Radio.Content>
              </Radio>
            );
          })}
        </RadioGroup>
        {!onlineAvailable && (
          <p className="booking-note payment-availability" role="status">
            Online payments are currently unavailable. You can still choose Pay
            later.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
