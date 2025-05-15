import { createClient } from "@/lib/supabase/client"

// Types
export type Ticket = {
  id: number
  title: string
  created_at: string
  status: "pending" | "in-progress" | "completed"
  type: string
  message?: string
  skin?: string
  steam_id?: string
  steam_name?: string
}

export type Message = {
  id: number
  ticket_id: number
  sender: "user" | "trader"
  content: string
  created_at: string
}

// Ticket functions
export async function createTicket(ticket: Omit<Ticket, "id" | "created_at">) {
  const supabase = createClient()

  const { data, error } = await supabase.from("tickets").insert([ticket]).select()

  if (error) {
    console.error("Error creating ticket:", error)
    throw error
  }

  return data?.[0] as Ticket
}

export async function getTickets(steamId?: string, isTrader = false) {
  const supabase = createClient()

  let query = supabase.from("tickets").select("*").order("created_at", { ascending: false })

  // If user is not a trader, only show their tickets
  // If user is a trader, show all tickets
  if (steamId && !isTrader) {
    query = query.eq("steam_id", steamId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching tickets:", error)
    throw error
  }

  return data as Ticket[]
}

export async function getTicketById(id: number) {
  const supabase = createClient()

  const { data, error } = await supabase.from("tickets").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching ticket:", error)
    throw error
  }

  return data as Ticket
}

export async function updateTicketStatus(id: number, status: "pending" | "in-progress" | "completed") {
  const supabase = createClient()

  const { data, error } = await supabase.from("tickets").update({ status }).eq("id", id).select()

  if (error) {
    console.error("Error updating ticket status:", error)
    throw error
  }

  return data?.[0] as Ticket
}

// Message functions
export async function createMessage(message: Omit<Message, "id" | "created_at">) {
  const supabase = createClient()

  const { data, error } = await supabase.from("messages").insert([message]).select()

  if (error) {
    console.error("Error creating message:", error)
    throw error
  }

  return data?.[0] as Message
}

export async function getMessagesByTicketId(ticketId: number) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching messages:", error)
    throw error
  }

  return data as Message[]
}

// Function to subscribe to new messages in real-time
export function subscribeToMessages(ticketId: number, callback: (message: Message) => void) {
  const supabase = createClient()

  const subscription = supabase
    .channel(`messages:ticket_id=eq.${ticketId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `ticket_id=eq.${ticketId}`,
      },
      (payload) => {
        callback(payload.new as Message)
      },
    )
    .subscribe()

  // Return a function to unsubscribe
  return () => {
    supabase.removeChannel(subscription)
  }
}
