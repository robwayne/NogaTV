import CoreImage
import CoreImage.CIFilterBuiltins
import SwiftUI
import UIKit

/// Renders QR codes for ticket payloads. Results are cached because ticket
/// lists re-render often and CoreImage rendering is not free.
enum QRCodeGenerator {
    private static let context = CIContext()
    private static let cache = NSCache<NSString, UIImage>()

    /// - Parameters:
    ///   - string: payload to encode.
    ///   - size: side length, in points, of the returned square image.
    static func image(for string: String, size: CGFloat = 240) -> UIImage? {
        let key = "\(string)#\(Int(size))" as NSString
        if let cached = cache.object(forKey: key) { return cached }

        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        // High correction level keeps the code scannable even if the ticket is
        // creased, screenshotted, or printed small.
        filter.correctionLevel = "H"

        guard let output = filter.outputImage else { return nil }

        let scale = size / output.extent.width
        let scaled = output.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
        guard let cgImage = context.createCGImage(scaled, from: scaled.extent) else { return nil }

        let image = UIImage(cgImage: cgImage)
        cache.setObject(image, forKey: key)
        return image
    }

    static func swiftUIImage(for string: String, size: CGFloat = 240) -> Image? {
        image(for: string, size: size).map { Image(uiImage: $0) }
    }
}

/// Drop-in view that renders the QR code for a payload, with a fallback so the
/// layout never collapses if encoding fails.
struct QRCodeView: View {
    let payload: String
    var size: CGFloat = 160

    var body: some View {
        Group {
            if let image = QRCodeGenerator.swiftUIImage(for: payload, size: size * 3) {
                image
                    .interpolation(.none)
                    .resizable()
                    .scaledToFit()
            } else {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .strokeBorder(.quaternary, style: StrokeStyle(lineWidth: 2, dash: [6, 4]))
                    .overlay {
                        Image(systemName: "qrcode")
                            .font(.system(size: size * 0.35))
                            .foregroundStyle(.tertiary)
                    }
            }
        }
        .frame(width: size, height: size)
        .accessibilityLabel("QR code for this ticket")
    }
}
