import Foundation

/// First-launch content so the three tabs have something to show before you
/// create your own event. Everything here is editable and deletable in-app.
enum SampleData {
    static func make() -> AppData {
        let calendar = Calendar.current
        let now = Date()

        let rooftop = Event(
            name: "Rooftop Summer Party",
            date: calendar.date(byAdding: .day, value: 9, to: now) ?? now,
            location: "The Nines Rooftop, 240 Bedford Ave",
            themeIndex: 0
        )

        let dinner = Event(
            name: "Supper Club: Chapter Four",
            date: calendar.date(byAdding: .day, value: 23, to: now) ?? now,
            location: "Loft 12, 88 Wythe Ave",
            themeIndex: 4
        )

        let batchID = UUID()
        let name = "Maya Osei"
        let phone = "5551234567"
        let email = "maya.osei@example.com"
        let price = Decimal(string: "45")!
        let created = calendar.date(byAdding: .hour, value: -20, to: now) ?? now

        let tickets = (1...2).map { index in
            Ticket(
                eventID: rooftop.id,
                batchID: batchID,
                fullName: name,
                phone: phone,
                email: email,
                price: price,
                indexInBatch: index,
                batchSize: 2,
                code: Ticket.makeCode(),
                createdAt: created
            )
        }

        let message = ChatMessage(
            text: ConfirmationMessageBuilder.text(for: tickets, event: rooftop),
            date: created,
            isFromMe: true,
            ticketIDs: tickets.map(\.id),
            eventID: rooftop.id,
            deliveryNote: ConfirmationMessageBuilder.deliveryNote(ticketCount: tickets.count)
        )

        let conversation = Conversation(
            contactName: name,
            phone: phone,
            email: email,
            messages: [message]
        )

        return AppData(
            events: [rooftop, dinner],
            tickets: tickets,
            conversations: [conversation]
        )
    }
}
