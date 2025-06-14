export default function UrlBadge({ text }) {
    return (
        <code
            className="rounded-sm"
            style={{
                backgroundColor: "#e0e0e0",
                padding: "0.2rem 0.4rem 0.2rem 0.4rem",
            }}
        >
            {text}
        </code>
    );
}
