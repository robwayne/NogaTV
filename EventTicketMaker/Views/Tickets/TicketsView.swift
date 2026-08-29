import SwiftUI

struct TicketsView: View {
    @Environment(AppStore.self) private var store
    @State private var searchText = ""
    @State private var isCreating = false
    @State private var lastCreatedBatch: TicketBatch?

    private var batches: [TicketBatch] {
        store.ticketBatches(matching: searchText)
    }

    var body: some View {
        NavigationStack {
            Group {
                if store.tickets.isEmpty {
                    ScrollView {
                        if store.events.isEmpty {
                            EmptyStateView(
                                icon: "ticket",
                                title: "No tickets yet",
                                message: "Add an event first, then create tickets for your guests."
                            )
                        } else {
                            EmptyStateView(
                                icon: "ticket",
                                title: "No tickets yet",
                                message: "Create your first ticket and its QR code is generated automatically.",
                                actionTitle: "Create Ticket",
                                action: { isCreating = true }
                            )
                        }
                    }
                } else if batches.isEmpty {
                    ContentUnavailableView.search(text: searchText)
                } else {
                    ticketList
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Tickets")
            .searchable(text: $searchText, prompt: "Name, email, or ticket code")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isCreating = true
                    } label: {
                        Label("New Ticket", systemImage: "plus")
                    }
                    .disabled(store.events.isEmpty)
                }
            }
            .sheet(isPresented: $isCreating) {
                CreateTicketView { batch in
                    // Wait for the sheet to finish dismissing before pushing the
                    // freshly created tickets, otherwise the push is swallowed.
                    Task {
                        try? await Task.sleep(for: .milliseconds(350))
                        lastCreatedBatch = batch
                    }
                }
            }
            .navigationDestination(item: $lastCreatedBatch) { batch in
                TicketBatchView(batch: batch)
            }
        }
    }

    private var ticketList: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                summary

                ForEach(batches) { batch in
                    if let event = store.event(id: batch.eventID) {
                        NavigationLink {
                            TicketBatchView(batch: batch)
                        } label: {
                            BatchCardView(batch: batch, event: event)
                        }
                        .buttonStyle(.plain)
                        .contextMenu {
                            Button(role: .destructive) {
                                store.deleteTickets(batch.tickets)
                            } label: {
                                Label("Delete Tickets", systemImage: "trash")
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.bottom, 28)
        }
    }

    private var summary: some View {
        HStack(spacing: 12) {
            SummaryTile(
                value: "\(store.tickets.count)",
                label: store.tickets.count == 1 ? "Ticket" : "Tickets",
                icon: "ticket.fill"
            )
            SummaryTile(
                value: CurrencyFormat.string(from: store.revenue),
                label: "Total value",
                icon: "creditcard.fill"
            )
        }
        .padding(.top, 4)
    }
}

private struct SummaryTile: View {
    let value: String
    let label: String
    let icon: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(.tint)
            Text(value)
                .font(.system(size: 20, weight: .bold, design: .rounded))
                .lineLimit(1)
                .minimumScaleFactor(0.6)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
    }
}

/// One row per "create tickets" session.
struct BatchCardView: View {
    let batch: TicketBatch
    let event: Event

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(event.theme.gradient)
                    .frame(width: 42, height: 42)
                    .overlay {
                        Image(systemName: "ticket.fill")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(.white)
                    }

                VStack(alignment: .leading, spacing: 2) {
                    Text(batch.fullName)
                        .font(.system(size: 16, weight: .semibold))
                    Text(event.name)
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }

                Spacer(minLength: 0)

                VStack(alignment: .trailing, spacing: 2) {
                    Text(batch.totalLabel)
                        .font(.system(size: 15, weight: .semibold))
                    Text(batch.createdAt.formatted(date: .abbreviated, time: .shortened))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            HStack(spacing: 8) {
                ForEach(batch.tickets.prefix(4)) { ticket in
                    QRCodeView(payload: ticket.qrPayload, size: 38)
                        .padding(4)
                        .background(.white, in: RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                if batch.count > 4 {
                    Text("+\(batch.count - 4)")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 0)
                Text(batch.count == 1 ? "1 ticket" : "\(batch.count) tickets")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.secondary)
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(16)
        .background(Color(.secondarySystemGroupedBackground),
                    in: RoundedRectangle(cornerRadius: 22, style: .continuous))
    }
}
