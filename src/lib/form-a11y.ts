function getFieldLabelText(
  form: HTMLFormElement,
  field: Element,
): string | null {
  const htmlField = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  const id = htmlField.id;

  if (id) {
    const label = form.querySelector(`label[for="${CSS.escape(id)}"]`);
    if (label) {
      return label.textContent?.replace(/\s*\*\s*$/, "").trim() ?? null;
    }
  }

  const container = field.closest(".flex.flex-col");
  const label = container?.querySelector("label");
  return label?.textContent?.replace(/\s*\*\s*$/, "").trim() ?? null;
}

export function getFirstInvalidFieldMessage(
  form: HTMLFormElement,
): string | null {
  const invalid = form.querySelector(":invalid");
  if (!invalid) return null;

  const field = invalid as HTMLInputElement;
  const label = getFieldLabelText(form, invalid);

  if (field.validity.valueMissing && label) {
    return `Completa el campo obligatorio: ${label}.`;
  }

  if (label) {
    return `El campo ${label} es inválido.`;
  }

  return field.validationMessage || "Hay campos con valores inválidos.";
}
