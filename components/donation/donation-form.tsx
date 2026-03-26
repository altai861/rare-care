"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { Locale } from "@/lib/data/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import {
  donationSchema,
  type DonationFormValues
} from "@/lib/validation/forms";

const presetAmounts = [50, 100, 250, 500, 1000];

export function DonationForm({
  dictionary,
  locale
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [submitState, setSubmitState] = useState<{
    status: "idle" | "success" | "error";
        message?: string;
  }>({ status: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    setValue,
    watch
  } = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    mode: "onChange",
    defaultValues: {
      donationType: "one_time",
      amount: 500,
      dedicateTo: "",
      note: "",
      firstName: "",
      lastName: "",
      address: "",
      country: locale === "mn" ? "Mongolia" : "",
      stateProvince: "",
      city: "",
      postalCode: "",
      email: "",
      phone: "",
      paymentType: "credit_card",
      consentAccepted: false,
      captchaPassed: false
    }
  });

  const selectedDonationType = watch("donationType");
  const selectedPaymentType = watch("paymentType");

  async function onSubmit(values: DonationFormValues) {
    setSubmitState({ status: "idle" });
    const response = await fetch("/api/donations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setSubmitState({
        status: "error",
        message: payload.message || dictionary.common.submitError
      });
      return;
    }

    setSubmitState({
      status: "success",
      message: dictionary.donation.successBody
    });
  }

  return (
    <div className="form-shell">
      <form className="donation-form" onSubmit={handleSubmit(onSubmit)}>
        <section className="form-panel">
          <h2>{dictionary.donation.donationType}</h2>
          <div className="choice-row">
            {[
              { value: "one_time", label: dictionary.donation.oneTime },
              { value: "monthly", label: dictionary.donation.monthly }
            ].map((option) => (
              <label key={option.value} className="radio-card">
                <input
                  type="radio"
                  value={option.value}
                  {...register("donationType")}
                />
                <span
                  className={
                    selectedDonationType === option.value ? "is-selected" : undefined
                  }
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="form-panel">
          <h2>{dictionary.donation.amount}</h2>
          <div className="amount-grid">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                className={selectedAmount === amount && !customAmount ? "is-selected" : ""}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                  setValue("amount", amount, { shouldValidate: true });
                }}
                type="button"
              >
                ${amount}
              </button>
            ))}
            <label className="other-amount">
              <span>{dictionary.common.other}</span>
              <input
                inputMode="numeric"
                onChange={(event) => {
                  const value = event.target.value;
                  setCustomAmount(value);
                  const parsed = Number(value);
                  setValue("amount", Number.isFinite(parsed) ? parsed : 0, {
                    shouldValidate: true
                  });
                }}
                placeholder="0"
                type="number"
                value={customAmount}
              />
            </label>
          </div>
          {errors.amount ? <p className="field-error">{errors.amount.message}</p> : null}
          <div className="two-column-grid compact">
            <div className="field-group">
              <label htmlFor="dedicateTo">{dictionary.donation.dedicateTo}</label>
              <input id="dedicateTo" {...register("dedicateTo")} type="text" />
            </div>
            <div className="field-group">
              <label htmlFor="note">{dictionary.donation.note}</label>
              <input id="note" {...register("note")} type="text" />
            </div>
          </div>
        </section>

        <section className="form-panel">
          <h2>{dictionary.donation.yourInfo}</h2>
          <div className="two-column-grid">
            <div className="field-group">
              <label htmlFor="firstName">{dictionary.donation.firstName}</label>
              <input id="firstName" {...register("firstName")} type="text" />
              {errors.firstName ? (
                <p className="field-error">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div className="field-group">
              <label htmlFor="lastName">{dictionary.donation.lastName}</label>
              <input id="lastName" {...register("lastName")} type="text" />
              {errors.lastName ? (
                <p className="field-error">{errors.lastName.message}</p>
              ) : null}
            </div>
            <div className="field-group full-width">
              <label htmlFor="address">{dictionary.donation.address}</label>
              <input id="address" {...register("address")} type="text" />
              {errors.address ? (
                <p className="field-error">{errors.address.message}</p>
              ) : null}
            </div>
            <div className="field-group">
              <label htmlFor="country">{dictionary.donation.country}</label>
              <select id="country" {...register("country")}>
                <option value="">{locale === "mn" ? "Сонгоно уу" : "Please select"}</option>
                <option value="Mongolia">Mongolia</option>
                <option value="China">China</option>
                <option value="South Korea">South Korea</option>
                <option value="Japan">Japan</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="stateProvince">{dictionary.donation.stateProvince}</label>
              <input id="stateProvince" {...register("stateProvince")} type="text" />
            </div>
            <div className="field-group">
              <label htmlFor="city">{dictionary.donation.city}</label>
              <input id="city" {...register("city")} type="text" />
            </div>
            <div className="field-group">
              <label htmlFor="postalCode">{dictionary.donation.postalCode}</label>
              <input id="postalCode" {...register("postalCode")} type="text" />
            </div>
            <div className="field-group">
              <label htmlFor="email">{dictionary.donation.email}</label>
              <input id="email" {...register("email")} type="email" />
            </div>
            <div className="field-group">
              <label htmlFor="phone">{dictionary.donation.phone}</label>
              <input id="phone" {...register("phone")} type="tel" />
            </div>
          </div>
        </section>

        <section className="form-panel">
          <h2>{dictionary.donation.payment}</h2>
          <div className="payment-summary">
            <strong>{dictionary.donation.totalAmount}</strong>
            <span>${watch("amount") || 0}</span>
          </div>
          <div className="choice-row">
            {[
              { value: "credit_card", label: dictionary.donation.creditCard },
              { value: "qpay", label: dictionary.donation.qpay }
            ].map((option) => (
              <label key={option.value} className="radio-card">
                <input
                  type="radio"
                  value={option.value}
                  {...register("paymentType")}
                />
                <span
                  className={
                    selectedPaymentType === option.value ? "is-selected" : undefined
                  }
                >
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="form-panel">
          <label className="checkbox-row">
            <input type="checkbox" {...register("consentAccepted")} />
            <span>{dictionary.donation.consent}</span>
          </label>
          {errors.consentAccepted ? (
            <p className="field-error">{errors.consentAccepted.message}</p>
          ) : null}
          <label className="captcha-placeholder">
            <input type="checkbox" {...register("captchaPassed")} />
            <span>{dictionary.donation.captcha}</span>
          </label>
          {errors.captchaPassed ? (
            <p className="field-error">{errors.captchaPassed.message}</p>
          ) : null}
          <button
            className="primary-button submit-button"
            disabled={!isValid || isSubmitting}
            type="submit"
          >
            {isSubmitting ? dictionary.common.sending : dictionary.common.submit}
          </button>
        </section>
      </form>

      <aside className="form-sidebar">
        <div className="sidebar-illustration" aria-hidden="true">
          <div className="hero-person" />
        </div>
        <div className="sidebar-copy">
          <h2>{dictionary.donation.title}</h2>
          <p>{dictionary.donation.intro}</p>
        </div>
      </aside>

      {submitState.status !== "idle" ? (
        <div
          className={`form-feedback ${
            submitState.status === "success" ? "is-success" : "is-error"
          }`}
        >
          <h3>
            {submitState.status === "success"
              ? dictionary.donation.successTitle
              : locale === "mn"
                ? dictionary.common.generalError
                : dictionary.common.generalError}
          </h3>
          <p>{submitState.message}</p>
        </div>
      ) : null}
    </div>
  );
}
