const HTML = { parse_mode: "HTML" };

const createMetadataMessage = (metadata) => {
  const metadataString = Object.entries(metadata)
    .map(([key, value]) => `<b>${key}</b>: ${value}`)
    .join("\n");
  const caption = `<b>✅ Metadata Added:</b><blockquote expandable>${metadataString}</blockquote>`;
  return caption;
};

export { createMetadataMessage, HTML };
