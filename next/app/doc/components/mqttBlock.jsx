import JsonBlock from "./jsonBlock";
import MqttBadge from "./mqttBadge";
import UrlBadge from "./urlBadge";

export default function MqttBlock({
    apiName,
    apiDescription,
    messageDescription,
    apiUrl,
    messageObj,
}) {
    const autoLink = (str, display) => {
        return str.replace(
            /(https:\/\/[^\s]+)/g,
            `<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #3b82f6;">${display}</a>`
        );
    };

    return (
        <div className="mb-20">
            <div className="text-2xl mb-4">{apiName}</div>
            {apiDescription && <div className="mb-4">{apiDescription}</div>}
            <MqttBadge />
            <span className="mr-1" />
            <UrlBadge text={apiUrl} />
            <div className="mb-4" />
            {messageObj && (
                <>
                    <div className="my-4">Message:</div>
                    <JsonBlock jsonObj={messageObj} />
                </>
            )}
            {messageDescription && (
                <div className="mb-4">備註：{messageDescription}</div>
            )}
        </div>
    );
}
