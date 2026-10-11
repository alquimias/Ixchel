'use client';

import { createContext, useContext } from 'react';

/**
 * DOM node que un popover flotante (Select, Combobox, …) debe usar como
 * contenedor de su portal en vez de `document.body`, cuando ese popover
 * vive dentro de un `Dialog` de Radix.
 *
 * Radix atrapa el foco de un diálogo modal comparando `container.contains(target)`
 * (`@radix-ui/react-focus-scope`). Un popover portado directo a `document.body`
 * queda fuera de ese `container`, así que cualquier foco real que Base UI mueva
 * dentro de él -- por ejemplo al seleccionar una opción con click -- se revierte
 * de inmediato al disparador del diálogo, y el click nunca llega a registrarse
 * como selección. Montar el popover como descendiente real del contenedor del
 * diálogo resuelve el conflicto en la raíz, sin tocar el internals de ninguna
 * de las dos librerías.
 *
 * `undefined` (el valor por defecto, fuera de cualquier `Dialog`) dice
 * "usa el comportamiento por defecto del popover" -- nunca pasar `null`
 * explícito a un contenedor de portal de Base UI: ahí significa "espera a
 * que el contenedor se resuelva" y deja el popover sin montar para siempre.
 */
const PortalContainerContext = createContext<HTMLElement | undefined>(undefined);

export const PortalContainerProvider = PortalContainerContext.Provider;

export function usePortalContainer(): HTMLElement | undefined {
  return useContext(PortalContainerContext);
}
