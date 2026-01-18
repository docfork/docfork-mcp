interface DocforkOGProps {
  title: string;
  description?: string;
  logoUrl: string;
}

export default function DocforkOG({
  title,
  description,
  logoUrl,
}: DocforkOGProps) {
  // truncate title if too long (max 2 lines)
  const truncateTitle = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        flexDirection: "row",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Left Content Container */}
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px 80px 80px 80px",
          overflow: "hidden",
        }}
      >
        {/* Top Title Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h1
            style={{
              fontSize: "80px",
              margin: "0",
              lineHeight: "1",
              fontWeight: "600",
              color: "#000000",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.02em",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "normal",
            }}
          >
            {truncateTitle(title, 50)}
          </h1>
          {description && (
            <span
              style={{
                fontSize: "42px",
                display: "block",
                fontFamily: "Inter, sans-serif",
                fontWeight: "500",
                lineHeight: "1.2",
                wordBreak: "break-word",
                marginTop: "-40px",
              }}
            >
              {truncateDescription(description, 80)}
            </span>
          )}
        </div>

        {/* Bottom Logo Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            // marginRight: "320",
          }}
        >
          <div
            style={{
              aspectRatio: "1 / 1",
              display: "flex",
              alignItems: "center",
              width: 68,
            }}
          >
            <img
              src={logoUrl}
              alt="Docfork Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 65,
              fontFamily: "Inter, sans-serif",
              fontWeight: "550",
              color: "#000000",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            docfork.com/docs
          </span>
        </div>
      </div>

      {/* Right Red Gradient Sidebar */}
      <div
        style={{
          width: "20%",
          height: "100%",
          background:
            "linear-gradient(180deg, #ff8e8e 0%, #ff0000 40%, #b50000 100%)",
        }}
      />
    </div>
  );
}
