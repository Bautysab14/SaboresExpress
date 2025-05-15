import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { isAuthenticated, getUserData, TRADER_STEAM_IDS } from "@/lib/auth"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Verifica si el usuario actual es un trader (administrador)
 * @returns {boolean} true si el usuario es un trader, false en caso contrario
 */
export function isTrader(): boolean {
  if (!isAuthenticated()) {
    return false
  }

  const userData = getUserData()
  if (!userData || !userData.steamid) {
    return false
  }

  return TRADER_STEAM_IDS.includes(userData.steamid)
}
