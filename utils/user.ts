import { isAuthenticated, getUserData, TRADER_STEAM_IDS } from "@/lib/auth"

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

/**
 * Verifica si el usuario actual está autenticado y tiene un ID de Steam
 * @returns {boolean} true si el usuario está autenticado y tiene un ID de Steam, false en caso contrario
 */
export function hasValidSteamId(): boolean {
  if (!isAuthenticated()) {
    return false
  }

  const userData = getUserData()
  return Boolean(userData && userData.steamid)
}
