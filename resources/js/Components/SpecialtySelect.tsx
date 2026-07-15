import React from 'react';
import { FormSelect } from '@/Components/forms/FormSelect';

export const SPECIALTIES = [
  "Informática",
  "Gastronomía",
  "Administración",
  "Mercadotecnia",
  "General"
];

interface SpecialtySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function SpecialtySelect({ 
  showAllOption = false, 
  allOptionLabel = "Todas las especialidades", 
  ...props 
}: SpecialtySelectProps) {
  return (
    <FormSelect
      {...props}
    >
      {showAllOption ? (
        <option value="all">{allOptionLabel}</option>
      ) : (
        <option value="">Seleccionar área...</option>
      )}
      {SPECIALTIES.map((spec) => (
        <option key={spec} value={spec}>
          {spec}
        </option>
      ))}
    </FormSelect>
  );
}
