import SwiftUI

/// The "new ticket" form. Everything typed here lands on the generated ticket,
/// and submitting posts the confirmation text into the Messages tab.
struct CreateTicketView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var onCreate: (TicketBatch) -> Void

    @State private var draft = TicketDraft()
    @State private var showValidation = false
    @FocusState private var focusedField: Field?

    private enum Field: Hashable { case name, phone, email, price }

    private var selectedEvent: Event? { store.event(id: draft.eventID) }

    var body: some View {
        NavigationStack {
            Form {
                eventSection
                attendeeSection
                pricingSection
                if showValidation && !draft.isValid { issuesSection }
                previewSection
            }
            .navigationTitle("New Ticket")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Create") { submit() }
                        .fontWeight(.semibold)
                }
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Done") { focusedField = nil }
                }
            }
            .onAppear {
                if draft.eventID == nil {
                    draft.eventID = store.upcomingEvents.first?.id ?? store.sortedEvents.first?.id
                }
            }
        }
    }

    // MARK: - Sections

    private var eventSection: some View {
        Section("Event") {
            Picker("Event", selection: $draft.eventID) {
                Text("Choose an event").tag(UUID?.none)
                ForEach(store.sortedEvents) { event in
                    Text(event.name).tag(UUID?.some(event.id))
                }
            }

            if let selectedEvent {
                LabeledContent("When", value: selectedEvent.fullDateLabel)
                LabeledContent("Where", value: selectedEvent.location)
            }
        }
    }

    private var attendeeSection: some View {
        Section("Ticket holder") {
            TextField("Full name", text: $draft.fullName)
                .textContentType(.name)
                .autocorrectionDisabled()
                .focused($focusedField, equals: .name)

            TextField("Phone number", text: $draft.phone)
                .textContentType(.telephoneNumber)
                .keyboardType(.phonePad)
                .focused($focusedField, equals: .phone)

            TextField("Email address", text: $draft.email)
                .textContentType(.emailAddress)
                .keyboardType(.emailAddress)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .focused($focusedField, equals: .email)
        }
    }

    private var pricingSection: some View {
        Section("Pricing") {
            HStack {
                Text("Price per ticket")
                Spacer()
                TextField("0.00", text: $draft.priceText)
                    .keyboardType(.decimalPad)
                    .multilineTextAlignment(.trailing)
                    .frame(maxWidth: 120)
                    .focused($focusedField, equals: .price)
            }

            Stepper(value: $draft.quantity, in: 1...20) {
                LabeledContent("Quantity", value: "\(draft.quantity)")
            }

            LabeledContent("Total") {
                Text(CurrencyFormat.string(from: draft.total))
                    .font(.body.weight(.semibold))
            }
        }
    }

    private var issuesSection: some View {
        Section {
            ForEach(draft.validationIssues, id: \.self) { issue in
                Label(issue, systemImage: "exclamationmark.circle.fill")
                    .font(.subheadline)
                    .foregroundStyle(.red)
            }
        }
    }

    private var previewSection: some View {
        Section("Preview") {
            if let event = selectedEvent {
                TicketCardView(
                    ticket: previewTicket(for: event),
                    event: event,
                    qrSize: 130,
                    notchColor: Color(.secondarySystemGroupedBackground)
                )
                .padding(.vertical, 8)
                .listRowBackground(Color.clear)
                .listRowInsets(EdgeInsets(top: 0, leading: 8, bottom: 0, trailing: 8))
            } else {
                Text("Choose an event to see the ticket preview.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }

    // MARK: - Actions

    /// A throwaway ticket used only to draw the live preview. The real ticket
    /// (with its real code) is minted on submit.
    private func previewTicket(for event: Event) -> Ticket {
        Ticket(
            id: event.id,
            eventID: event.id,
            batchID: event.id,
            fullName: draft.fullName.trimmed.isBlank ? "Guest name" : draft.fullName.trimmed,
            phone: draft.phone.trimmed.isBlank ? "5555550100" : draft.phone.trimmed,
            email: draft.email.trimmed.isBlank ? "guest@email.com" : draft.email.trimmed,
            price: draft.price,
            indexInBatch: 1,
            batchSize: max(1, draft.quantity),
            code: "ETM-PRE-VIEW"
        )
    }

    private func submit() {
        focusedField = nil
        guard draft.isValid else {
            withAnimation { showValidation = true }
            return
        }
        guard let batch = store.createTickets(from: draft) else { return }
        onCreate(batch)
        dismiss()
    }
}
