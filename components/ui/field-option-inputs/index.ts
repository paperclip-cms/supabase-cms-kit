import * as React from "react";
import { OptionValueType, type OptionUIConfig } from "@/lib/field-options";
import { StringOptionInput } from "./string-option-input";
import { NumberOptionInput } from "./number-option-input";
import { StringArrayOptionInput } from "./string-array-option-input";
import { ChoiceArrayOptionInput } from "./choice-array-option-input";
import { SelectOptionInput } from "./select-option-input";

/**
 * Shared interface for all option input components
 */
export interface OptionInputProps {
  value: unknown;
  onChange: (value: unknown) => void;
  config: OptionUIConfig;
}

/**
 * Component registry mapping OptionValueType to its corresponding input component
 *
 * This replaces the ternary hell in field-editor-dialog.tsx with a clean lookup.
 * Adding a new option type only requires:
 * 1. Add the value type to OptionValueType enum
 * 2. Create a component implementing OptionInputProps
 * 3. Register it here
 */
export const OPTION_INPUT_COMPONENTS: Record<
  OptionValueType,
  React.ComponentType<OptionInputProps>
> = {
  [OptionValueType.String]: StringOptionInput,
  [OptionValueType.Number]: NumberOptionInput,
  [OptionValueType.StringArray]: StringArrayOptionInput,
  [OptionValueType.ChoiceArray]: ChoiceArrayOptionInput,
  [OptionValueType.Select]: SelectOptionInput,
};

// Re-export components
export { StringOptionInput } from "./string-option-input";
export { NumberOptionInput } from "./number-option-input";
export { StringArrayOptionInput } from "./string-array-option-input";
export { ChoiceArrayOptionInput } from "./choice-array-option-input";
export { SelectOptionInput } from "./select-option-input";
