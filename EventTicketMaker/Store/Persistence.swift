import Foundation

/// Everything the app owns, in one Codable envelope written to disk as JSON.
struct AppData: Codable {
    var events: [Event] = []
    var tickets: [Ticket] = []
    var conversations: [Conversation] = []
}

/// Reads and writes `AppData` to Application Support. Small enough that a
/// single JSON file beats bringing in a database.
struct PersistenceController {
    private let fileURL: URL
    private let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }()
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()

    init(filename: String = "eventticketmaker.json") {
        let directory = (try? FileManager.default.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )) ?? URL.documentsDirectory
        self.fileURL = directory.appendingPathComponent(filename)
    }

    func load() -> AppData? {
        guard let data = try? Data(contentsOf: fileURL) else { return nil }
        return try? decoder.decode(AppData.self, from: data)
    }

    func save(_ data: AppData) {
        do {
            let encoded = try encoder.encode(data)
            try encoded.write(to: fileURL, options: .atomic)
        } catch {
            // Losing a save is not worth crashing over; the in-memory state is
            // still correct and the next mutation will try again.
            print("EventTicketMaker: failed to save — \(error.localizedDescription)")
        }
    }
}
