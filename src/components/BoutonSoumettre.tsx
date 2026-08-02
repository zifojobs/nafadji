"use client";
import { useFormStatus } from "react-dom";

// Bouton de soumission pour les formulaires reliés directement à une server action.
// useFormStatus lit l'état du <form> parent : le bouton se désactive et se renomme
// pendant l'envoi, sans avoir à passer la page entière côté client.
export function BoutonSoumettre({
  children, enCours, className,
}: {
  children: React.ReactNode;
  enCours: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? enCours : children}
    </button>
  );
}
