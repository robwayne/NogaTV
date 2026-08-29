import PhotosUI
import SwiftUI
import UIKit

/// Add or edit an event: name, time, location, optional logo, and accent color.
struct EventFormView: View {
    enum Mode {
        case create
        case edit(Event)
    }

    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    let mode: Mode

    @State private var name = ""
    @State private var date = Date()
    @State private var location = ""
    @State private var logoData: Data?
    @State private var themeIndex = 0
    @State private var photoItem: PhotosPickerItem?
    @State private var isLoadingPhoto = false
    @State private var showDeleteConfirmation = false

    private var isEditing: Bool {
        if case .edit = mode { return true }
        return false
    }

    private var canSave: Bool { !name.trimmed.isBlank && !location.trimmed.isBlank }

    var body: some View {
        NavigationStack {
            Form {
                Section("Details") {
                    TextField("Event name", text: $name)
                    DatePicker("Date & time", selection: $date)
                    TextField("Location", text: $location, axis: .vertical)
                        .lineLimit(1...3)
                }

                Section("Logo") {
                    logoRow
                }

                Section("Accent color") {
                    themePicker
                }

                if isEditing {
                    Section {
                        Button("Delete Event", role: .destructive) {
                            showDeleteConfirmation = true
                        }
                    } footer: {
                        Text("Deleting an event also deletes the tickets issued for it. Confirmation messages are kept.")
                    }
                }
            }
            .navigationTitle(isEditing ? "Edit Event" : "New Event")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .fontWeight(.semibold)
                        .disabled(!canSave)
                }
            }
            .onAppear(perform: loadExisting)
            .onChange(of: photoItem) { _, newValue in
                guard let newValue else { return }
                isLoadingPhoto = true
                Task {
                    let data = try? await newValue.loadTransferable(type: Data.self)
                    await MainActor.run {
                        // Photos come straight off the camera roll, so downscale
                        // before storing them alongside the event.
                        logoData = data.flatMap { ImageDownscaler.downscaledPNG(from: $0, maxDimension: 512) }
                        isLoadingPhoto = false
                    }
                }
            }
            .confirmationDialog(
                "Delete this event?",
                isPresented: $showDeleteConfirmation,
                titleVisibility: .visible
            ) {
                Button("Delete Event", role: .destructive) {
                    if case .edit(let event) = mode {
                        store.deleteEvent(event)
                    }
                    dismiss()
                }
            }
        }
    }

    // MARK: - Pieces

    private var logoRow: some View {
        HStack(spacing: 14) {
            Group {
                if let logoData, let uiImage = UIImage(data: logoData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFill()
                } else {
                    EventTheme.palette[themeIndex].gradient
                        .overlay {
                            Image(systemName: "photo")
                                .font(.system(size: 22))
                                .foregroundStyle(.white.opacity(0.9))
                        }
                }
            }
            .frame(width: 64, height: 64)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay {
                if isLoadingPhoto {
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .fill(.black.opacity(0.3))
                        .overlay { ProgressView().tint(.white) }
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                PhotosPicker(selection: $photoItem, matching: .images) {
                    Text(logoData == nil ? "Choose Logo" : "Replace Logo")
                        .font(.subheadline.weight(.semibold))
                }

                if logoData != nil {
                    Button("Remove Logo", role: .destructive) {
                        logoData = nil
                        photoItem = nil
                    }
                    .font(.subheadline)
                }
            }

            Spacer(minLength: 0)
        }
        .padding(.vertical, 4)
    }

    private var themePicker: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(Array(EventTheme.palette.enumerated()), id: \.offset) { index, theme in
                    Button {
                        themeIndex = index
                    } label: {
                        Circle()
                            .fill(theme.gradient)
                            .frame(width: 36, height: 36)
                            .overlay {
                                if themeIndex == index {
                                    Circle().strokeBorder(.primary, lineWidth: 2.5)
                                }
                            }
                            .accessibilityLabel(theme.name)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.vertical, 6)
        }
    }

    // MARK: - Actions

    private func loadExisting() {
        guard case .edit(let event) = mode, name.isEmpty else { return }
        name = event.name
        date = event.date
        location = event.location
        logoData = event.logoData
        themeIndex = event.themeIndex
    }

    private func save() {
        guard canSave else { return }
        switch mode {
        case .create:
            store.addEvent(
                Event(
                    name: name.trimmed,
                    date: date,
                    location: location.trimmed,
                    logoData: logoData,
                    themeIndex: themeIndex
                )
            )
        case .edit(let existing):
            var updated = existing
            updated.name = name.trimmed
            updated.date = date
            updated.location = location.trimmed
            updated.logoData = logoData
            updated.themeIndex = themeIndex
            store.updateEvent(updated)
        }
        dismiss()
    }
}

enum ImageDownscaler {
    /// Keeps stored logos small — full-resolution photos would bloat the JSON store.
    static func downscaledPNG(from data: Data, maxDimension: CGFloat) -> Data? {
        guard let image = UIImage(data: data) else { return nil }
        let longest = max(image.size.width, image.size.height)
        guard longest > maxDimension else { return image.pngData() }

        let scale = maxDimension / longest
        let newSize = CGSize(width: image.size.width * scale, height: image.size.height * scale)
        let format = UIGraphicsImageRendererFormat.default()
        format.scale = 1
        let renderer = UIGraphicsImageRenderer(size: newSize, format: format)
        let resized = renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: newSize))
        }
        return resized.pngData()
    }
}
