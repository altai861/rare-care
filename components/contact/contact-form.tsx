"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { Dictionary } from "@/lib/i18n/dictionaries";
import { contactSchema, type ContactFormValues } from "@/lib/validation/forms";

export function ContactForm({ dictionary }: { dictionary: Dictionary }) {
  const [successMessage, setSuccessMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  async function onSubmit(values: ContactFormValues) {
    setSuccessMessage("");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      setSuccessMessage(dictionary.common.submitError);
      return;
    }

    reset();
    setSuccessMessage(dictionary.contact.success);
  }

  return (
    <form className="contact-form form-panel" onSubmit={handleSubmit(onSubmit)}>
      <div className="two-column-grid">
        <div className="field-group">
          <label htmlFor="contact-name">{dictionary.contact.name}</label>
          <input id="contact-name" {...register("name")} type="text" />
          {errors.name ? <p className="field-error">{errors.name.message}</p> : null}
        </div>
        <div className="field-group">
          <label htmlFor="contact-email">{dictionary.contact.email}</label>
          <input id="contact-email" {...register("email")} type="email" />
          {errors.email ? <p className="field-error">{errors.email.message}</p> : null}
        </div>
        <div className="field-group full-width">
          <label htmlFor="contact-subject">{dictionary.contact.subject}</label>
          <input id="contact-subject" {...register("subject")} type="text" />
          {errors.subject ? (
            <p className="field-error">{errors.subject.message}</p>
          ) : null}
        </div>
        <div className="field-group full-width">
          <label htmlFor="contact-message">{dictionary.contact.message}</label>
          <textarea id="contact-message" {...register("message")} rows={6} />
          {errors.message ? (
            <p className="field-error">{errors.message.message}</p>
          ) : null}
        </div>
      </div>
      <button
        className="primary-button submit-button"
        disabled={!isValid || isSubmitting}
        type="submit"
      >
        {isSubmitting ? dictionary.common.sending : dictionary.common.submit}
      </button>
      {successMessage ? (
        <div className="form-feedback is-success">
          <p>{successMessage}</p>
        </div>
      ) : null}
    </form>
  );
}
