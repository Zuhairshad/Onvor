"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { sendContactMessage, type FormResult } from "@/app/actions/contact";
import { CONTACT } from "@/lib/content/onvor";

const FIELDS = [
  { id: "contact-name", name: "name", label: "Name", type: "text", autoComplete: "name" },
  { id: "contact-email", name: "email", label: "Email", type: "email", autoComplete: "email" },
  { id: "contact-phone", name: "phone", label: "Phone number", type: "tel", autoComplete: "tel" },
] as const;

const FIELD_CLASS =
  "border-hairline focus:border-ink mt-2 w-full min-w-0 rounded-none border-0 border-b-2 bg-transparent py-2 text-[16px] transition-colors outline-none";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn disabled:opacity-60">
      {pending ? "Sending…" : "Send"}
    </button>
  );
}

/**
 * Contact form.
 *
 * Posts through a server action to the store's own contact endpoint, so the
 * message lands where Onvor already reads them. The previous version posted
 * straight to `/contact`, which only resolves on the Shopify domain - pressing
 * Send on the headless site did nothing at all.
 */
export function ContactForm() {
  const [state, action] = useActionState<FormResult | null, FormData>(sendContactMessage, null);

  return (
    <form action={action} className="mt-4 space-y-4">
      {FIELDS.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id} className="tracking-caps block text-[13px] uppercase">
            {field.label}
          </label>
          <input
            id={field.id}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            required={field.type === "email"}
            className={FIELD_CLASS}
          />
        </div>
      ))}

      <div>
        <label htmlFor="contact-body" className="tracking-caps block text-[13px] uppercase">
          Comment
        </label>
        <textarea id="contact-body" name="message" rows={5} required className={FIELD_CLASS} />
      </div>

      <Submit />

      {state ? (
        <p className="m-0 text-[14px]" role="status">
          {state.message}
          {!state.ok ? (
            <>
              {" "}
              <a href={`mailto:${CONTACT.email}`} className="underline">
                {CONTACT.email}
              </a>{" "}
              or WhatsApp {CONTACT.whatsapp}.
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
