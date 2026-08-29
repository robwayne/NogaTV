import SwiftUI

struct EventsView: View {
    @Environment(AppStore.self) private var store
    @State private var isAdding = false
    @State private var editingEvent: Event?

    var body: some View {
        NavigationStack {
            Group {
                if store.events.isEmpty {
                    ScrollView {
                        EmptyStateView(
                            icon: "calendar.badge.plus",
                            title: "No events yet",
                            message: "Add a party, a dinner, or anything else you want to issue tickets for.",
                            actionTitle: "Add Event",
                            action: { isAdding = true }
                        )
                    }
                } else {
                    eventList
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Events")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        isAdding = true
                    } label: {
                        Label("Add Event", systemImage: "plus")
                    }
                }
            }
            .sheet(isPresented: $isAdding) {
                EventFormView(mode: .create)
            }
            .sheet(item: $editingEvent) { event in
                EventFormView(mode: .edit(event))
            }
        }
    }

    private var eventList: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                section(title: "Upcoming", events: store.upcomingEvents)
                section(title: "Past", events: store.pastEvents)
            }
            .padding(.horizontal, 16)
            .padding(.top, 4)
            .padding(.bottom, 28)
        }
    }

    @ViewBuilder
    private func section(title: String, events: [Event]) -> some View {
        if !events.isEmpty {
            HStack {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(.secondary)
                Spacer()
            }
            .padding(.top, 6)

            ForEach(events) { event in
                EventCardView(event: event, ticketCount: store.ticketsIssued(for: event.id).count)
                    .onTapGesture { editingEvent = event }
                    .contextMenu {
                        Button {
                            editingEvent = event
                        } label: {
                            Label("Edit Event", systemImage: "pencil")
                        }
                        Button(role: .destructive) {
                            store.deleteEvent(event)
                        } label: {
                            Label("Delete Event", systemImage: "trash")
                        }
                    }
            }
        }
    }
}

struct EventCardView: View {
    let event: Event
    let ticketCount: Int

    var body: some View {
        HStack(spacing: 14) {
            logo

            VStack(alignment: .leading, spacing: 4) {
                Text(event.name)
                    .font(.system(size: 17, weight: .semibold))
                    .lineLimit(2)

                Label("\(event.dayLabel) · \(event.timeLabel)", systemImage: "clock")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)

                Label(event.location, systemImage: "mappin.and.ellipse")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)

                Text(ticketCount == 1 ? "1 ticket issued" : "\(ticketCount) tickets issued")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.tint)
                    .padding(.top, 2)
            }

            Spacer(minLength: 0)
        }
        .padding(16)
        .background(Color(.secondarySystemGroupedBackground),
                    in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(alignment: .leading) {
            Capsule()
                .fill(event.theme.gradient)
                .frame(width: 5)
                .padding(.vertical, 16)
                .padding(.leading, 4)
        }
    }

    @ViewBuilder
    private var logo: some View {
        if let image = event.logoImage {
            image
                .resizable()
                .scaledToFill()
                .frame(width: 56, height: 56)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        } else {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(event.theme.gradient)
                .frame(width: 56, height: 56)
                .overlay {
                    Text(event.name.prefix(1).uppercased())
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)
                }
        }
    }
}
