class Metadata {
  constructor(coords, file_size, date = new Date()) {
    this.coords = coords; // GPS coordinates
    this.file_size = file_size; // File size in bytes
    this.date = date; // Current date/time
  }

  generateMetadata() {
    const { latitude, longitude } = this.coords;

    return {
      // File information
      FileSize: `${(this.file_size / 1024).toFixed(2)} kB`,
      FileModifyDate: this.date.toISOString(),
      FileAccessDate: this.date.toISOString(),
      FileInodeChangeDate: this.date.toISOString(),
      FilePermissions: "-rw-rw-r--",
      FileType: "JPEG",
      FileTypeExtension: "jpg",
      MIMEType: "image/jpeg",

      // Image information
      ExifByteOrder: "Big-endian (Motorola, MM)",
      ImageWidth: 4032,
      ImageHeight: 3024,
      EncodingProcess: "Baseline DCT, Huffman coding",
      BitsPerSample: 8,
      ColorComponents: 3,
      YCbCrSubSampling: "YCbCr4:2:0 (2 2)",
      JFIFVersion: "1.01",
      ResolutionUnit: "inches",
      XResolution: 72,
      YResolution: 72,

      // Camera information
      Make: "Apple",
      Model: "iPhone 16 Pro",
      Orientation: "Horizontal (normal)",
      Software: "18.2.1",
      HostComputer: "iPhone 16 Pro",

      // EXIF information
      ExposureTime: this.getRandomExposureTime(),
      FNumber: this.getRandomFNumber(),
      ExposureProgram: "Program AE", // Usually fixed for phones
      ISO: this.getRandomISO(),
      ExifVersion: "0232", // Typically static for iPhones
      DateTimeOriginal: this.date.toISOString(),
      CreateDate: this.date.toISOString(),
      OffsetTime: "Z",
      OffsetTimeOriginal: "Z",
      OffsetTimeDigitized: "Z",
      ComponentsConfiguration: "Y, Cb, Cr, -",
      ShutterSpeedValue: this.getRandomShutterSpeed(),
      ApertureValue: this.getRandomFNumber(),
      BrightnessValue: this.getRandomBrightness(),
      ExposureCompensation: 0, // Typically static for phones
      MeteringMode: "Multi-segment", // Usually fixed
      Flash: "Off, Did not fire", // Common default
      FocalLength: this.getRandomFocalLength(),
      SubjectArea: this.getRandomSubjectArea(),
      SubSecTimeOriginal: this.getRandomSubSecTime(),
      SubSecTimeDigitized: this.getRandomSubSecTime(),
      FlashpixVersion: "0100", // Fixed
      ColorSpace: "Uncalibrated", // Typical
      ExifImageWidth: 4032, // Fixed for iPhone resolution
      ExifImageHeight: 3024, // Fixed for iPhone resolution
      SensingMethod: "One-chip color area", // Static
      SceneType: "Directly photographed", // Static
      ExposureMode: "Auto", // Typical for phones
      WhiteBalance: "Auto", // Static
      FocalLengthIn35mmFormat: "24 mm", // Static for iPhones
      SceneCaptureType: "Standard", // Typical for standard photos
      LensInfo: "2.220000029-9mm f/1.779999971-2.8", // Fixed for iPhone cameras
      LensMake: "Apple",
      LensModel: "iPhone 16 Pro back triple camera 6.86mm f/1.78",

      // GPS information
      GPSLatitudeRef: latitude >= 0 ? "North" : "South",
      GPSLatitude: latitude,
      GPSLongitudeRef: longitude >= 0 ? "East" : "West",
      GPSLongitude: longitude,
      GPSAltitudeRef: "Above Sea Level",
      GPSAltitude: this.getRandomAltitude(), // Random altitude above sea level
      GPSTimeStamp: this.getRandomGPSTimeStamp(), // Randomised time component
      GPSImgDirectionRef: "True North",
      GPSImgDirection: this.getRandomDirection(), // Randomised image direction
      GPSDestBearingRef: "True North",
      GPSDestBearing: this.getRandomDirection(), // Randomised destination bearing
      GPSDateStamp: this.date.toISOString().split("T")[0], // Current date
      GPSHPositioningError: this.getRandomHPositioningError(), // Random positioning error

      // Thumbnail and compression
      Compression: "JPEG (old-style)",
      ThumbnailOffset: 2988,
      ThumbnailLength: 5446,

      // Apple-specific metadata
      ProfileDescription: "Display P3",
      ProfileCopyright: "Copyright Apple Inc., 2025",

      // Other fields (optional for completeness)
      RunTimeSincePowerUp: this.getRandomRunTime(),
      ImageSize: "4032x3024", // Fixed for iPhone photos
      Megapixels: this.getRandomMegapixels(),
      CircleOfConfusion: this.getRandomCircleOfConfusion(),
      FOV: this.getRandomFOV(),
      HyperfocalDistance: this.getRandomHyperfocalDistance(),
      LightValue: this.getRandomLightValue(),
      LensID: "iPhone 16 Pro back triple camera 6.86mm f/1.78", // Fixed for this device
    };
  }

  // Random runtime since power-up (e.g., "X days HH:MM:SS")
  getRandomRunTime() {
    const days = Math.floor(Math.random() * 30) + 1; // 1 to 30 days
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, "0"); // 0 to 23 hours
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, "0"); // 0 to 59 minutes
    const seconds = String(Math.floor(Math.random() * 60)).padStart(2, "0"); // 0 to 59 seconds
    return `${days} days ${hours}:${minutes}:${seconds}`;
  }

  // Random megapixels, realistic range for iPhone cameras
  getRandomMegapixels() {
    return parseFloat((Math.random() * (12.5 - 12.0) + 12.0).toFixed(1)); // 12.0 to 12.5 MP
  }

  // Random circle of confusion (realistic for iPhone lenses)
  getRandomCircleOfConfusion() {
    return `${(Math.random() * (0.01 - 0.007) + 0.007).toFixed(3)} mm`; // 0.007 to 0.010 mm
  }

  // Random field of view (FOV) for a typical iPhone lens
  getRandomFOV() {
    return `${(Math.random() * (74 - 72) + 72).toFixed(1)} deg`; // 72 to 74 degrees
  }

  // Random hyperfocal distance (realistic for small lenses)
  getRandomHyperfocalDistance() {
    return `${(Math.random() * (5.0 - 2.0) + 2.0).toFixed(2)} m`; // 2.0 to 5.0 meters
  }

  // Random light value (LV), typical for photography
  getRandomLightValue() {
    return parseFloat((Math.random() * (4.0 - 3.0) + 3.0).toFixed(1)); // 3.0 to 4.0
  }
  // Random altitude between 0m and 3000m above sea level
  getRandomAltitude() {
    return `${(Math.random() * 3000).toFixed(1)} m Above Sea Level`;
  }

  // Random time stamp for GPS in "HH:MM:SS" format
  getRandomGPSTimeStamp() {
    const hours = String(Math.floor(Math.random() * 24)).padStart(2, "0");
    const minutes = String(Math.floor(Math.random() * 60)).padStart(2, "0");
    const seconds = String(Math.floor(Math.random() * 60)).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  // Random direction in degrees (0 to 360)
  getRandomDirection() {
    return (Math.random() * 360).toFixed(6);
  }

  // Random horizontal positioning error (e.g., 0 to 50 meters)
  getRandomHPositioningError() {
    return `${(Math.random() * 50).toFixed(6)} m`;
  }

  // Helper to generate random exposure times
  getRandomExposureTime() {
    const options = ["1/15", "1/30", "1/35", "1/50", "1/60", "1/125"];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Helper to generate realistic F-numbers
  getRandomFNumber() {
    const options = [1.6, 1.8, 2.0, 2.2, 2.4];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Helper to generate realistic ISO values
  getRandomISO() {
    return Math.floor(Math.random() * (1600 - 50 + 1)) + 50; // Range: 50 to 1600
  }

  // Helper to generate realistic shutter speeds
  getRandomShutterSpeed() {
    const options = ["1/15", "1/30", "1/35", "1/50", "1/60", "1/125"];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Helper to generate brightness values
  getRandomBrightness() {
    return (Math.random() * 4 - 2).toFixed(6); // Range: -2 to 2
  }

  // Helper to generate realistic focal lengths
  getRandomFocalLength() {
    return `${(Math.random() * (7 - 2.2) + 2.2).toFixed(1)} mm`; // Range: 2.2 to 7 mm
  }

  // Helper to generate random subject area
  getRandomSubjectArea() {
    const x = Math.floor(Math.random() * 3000) + 1000; // Range: 1000 to 4000
    const y = Math.floor(Math.random() * 2000) + 1000; // Range: 1000 to 3000
    const width = Math.floor(Math.random() * 1000) + 1000; // Range: 1000 to 2000
    const height = Math.floor(Math.random() * 1000) + 1000; // Range: 1000 to 2000
    return `${x} ${y} ${width} ${height}`;
  }

  // Helper to generate sub-second times
  getRandomSubSecTime() {
    return `${Math.floor(Math.random() * 1000)}`; // Range: 0 to 999
  }
}

export { Metadata };
