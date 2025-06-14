export default function JsonBlock({ jsonObj }) {
    const formatJsonToLines = (jsonObj) => {
        const isObjectLike = typeof jsonObj === "object" && jsonObj !== null;

        if (!isObjectLike) return null;

        const prettyJson = JSON.stringify(jsonObj, null, 4);
        const lines = prettyJson.split("\n");

        return lines;
    };
    return (
        <div className="flex">
            <div
                className="p-4 pe-60 rounded-md"
                style={{ background: "#e0e0e0" }}
            >
                {formatJsonToLines(jsonObj).map((line, idx) => {
                    let spaceCount = 0;
                    for (let ele of line) {
                        if (ele === " ") {
                            ++spaceCount;
                        } else {
                            break;
                        }
                    }
                    const preSpaces = "&nbsp;".repeat(spaceCount);
                    const formatted = preSpaces + line + "<br/>";
                    return (
                        <code
                            style={{ background: "e0e0e0" }}
                            key={idx}
                            dangerouslySetInnerHTML={{ __html: formatted }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
