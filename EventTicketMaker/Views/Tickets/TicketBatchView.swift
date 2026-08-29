import SwiftUI

/// Full-size preview of every ticket in a batch, swipeable one at a time.
struct TicketBatchView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @Environment(\.displayScale) private var displayScale

    let batch: TicketBatch
    @State private var selectedIndex = 0
    /// Rasterizing a ticket is expensive, so it happens once per visible ticket
    /// rather than on every body pass.
    @State private var shareImage: Image?

    /// Read back from the store so check-ins and deletions stay in sync.
    private var tickets: [Ticket] {
        let live = store.tickets.filter { $0.batchID == batch.id }
        return live.isEmpty ? batch.tickets : live.sorted { $0.indexInBatch < $1.indexInBatch }
    }

    private var event: Event? { store.event(id: batch.eventID) }

    private var currentTicket: Ticket? {
        guard tickets.indices.contains(selectedIndex) else { return tickets.first }
        return tickets[selectedIndex]
    }

    var body: some View {
        ZStack {
            Color(.systemGroupedBackground).ignoresSafeArea()

            if let event {
                VStack(spacing: 16) {
                    TabView(selection: $selectedIndex) {
                        ForEach(Array(tickets.enumerated()), id: \.element.id) { index, ticket in
                            ScrollView {
                                TicketCardView(ticket: ticket, event: event)
                                    .padding(.horizontal, 20)
                                    .padding(.top, 8)
                                    .padding(.bottom, 20)
                            }
                            .tag(index)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: tickets.count > 1 ? .automatic : .never))

                    actions(event: event)
                }
            } else {
                EmptyStateView(
                    icon: "calendar.badge.exclamationmark",
                    title: "Event removed",
                    message: "The event these tickets belonged to no longer exists."
                )
            }
        }
        .task(id: currentTicket?.id) {
            guard let ticket = currentTicket, let event else { return }
            shareImage = renderedImage(ticket: ticket, event: event)
        }
        .navigationTitle(tickets.count == 1 ? "Ticket" : "\(selectedIndex + 1) of \(tickets.count)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    if let ticket = currentTicket {
                        Button {
                            store.toggleCheckIn(ticket)
                        } label: {
                            Label(
                                ticket.isCheckedIn ? "Undo Check-In" : "Mark Checked In",
                                systemImage: ticket.isCheckedIn ? "arrow.uturn.backward" : "checkmark.seal"
                            )
                        }
                    }
                    Button(role: .destructive) {
                        store.deleteTickets(tickets)
                        dismiss()
                    } label: {
                        Label("Delete Tickets", systemImage: "trash")
                    }
                } label: {
                    Label("More", systemImage: "ellipsis.circle")
                }
            }
        }
    }

    @ViewBuilder
    private func actions(event: Event) -> some View {
        if let ticket = currentTicket {
            GlassEffectContainer(spacing: 12) {
                HStack(spacing: 12) {
                    if let image = shareImage {
                        ShareLink(
                            item: image,
                            preview: SharePreview("\(event.name) — \(ticket.code)", image: image)
                        ) {
                            Label("Share Ticket", systemImage: "square.and.arrow.up")
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                        }
                        .buttonStyle(.glassProminent)
                    } else {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }

                    Button {
                        store.toggleCheckIn(ticket)
                    } label: {
                        Label(
                            ticket.isCheckedIn ? "Checked In" : "Check In",
                            systemImage: ticket.isCheckedIn ? "checkmark.seal.fill" : "checkmark.seal"
                        )
                        .padding(.vertical, 6)
                    }
                    .buttonStyle(.glass)
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 12)
        }
    }

    /// Rasterizes the ticket so it can be shared or saved as an image.
    @MainActor
    private func renderedImage(ticket: Ticket, event: Event) -> Image? {
        let card = TicketCardView(ticket: ticket, event: event, qrSize: 190, notchColor: .white)
            .frame(width: 380)
            .padding(20)
            .background(Color.white)

        let renderer = ImageRenderer(content: card)
        renderer.scale = max(displayScale, 3)
        guard let uiImage = renderer.uiImage else { return nil }
        return Image(uiImage: uiImage)
    }
}
